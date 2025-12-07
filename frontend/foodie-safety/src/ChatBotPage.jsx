import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from './context/AuthContext';
import config from './config';
import { formatMarkdown } from './utils/formatMarkdown';

// ============ localStorage Cache Utilities ============
const PREVIEW_CACHE_PREFIX = 'chat_previews_';
const PREVIEW_MAX_LENGTH = 25;

// Get cache key for current user (using email as identifier)
const getCacheKey = (email) => `${PREVIEW_CACHE_PREFIX}${email}`;

// Read preview cache from localStorage
const getPreviewCache = (email) => {
  if (!email) return {};
  try {
    const cached = localStorage.getItem(getCacheKey(email));
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

// Save entire cache to localStorage
const savePreviewCache = (email, cache) => {
  if (!email) return;
  try {
    localStorage.setItem(getCacheKey(email), JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save preview cache:', e);
  }
};

// Update a single session's preview in cache
const updatePreviewCache = (email, sessionId, preview) => {
  const cache = getPreviewCache(email);
  cache[sessionId] = preview;
  savePreviewCache(email, cache);
};

// Truncate text to generate preview
const truncateText = (text, maxLength = PREVIEW_MAX_LENGTH) => {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxLength
    ? cleaned.slice(0, maxLength) + '...'
    : cleaned;
};

// Generate welcome message for chat session
const getWelcomeMessage = () => ({
  sender: "bot",
  text: `👋 Hello! I'm Foodie Safety AI.
Let's get started on finding the perfect recipe for you. 🍽️

To help me tailor the best suggestions, could you please share a few details?

• Meal type you're in the mood for (e.g., breakfast, Mexican, spicy)  
• Ingredients to avoid (any allergies or dietary preferences)  
• Time you have available to cook  
• Cooking tools you have on hand (e.g., oven, air fryer, blender)`
});

// ============ Component ============
const ChatBotPage = () => {
  const { access_token, loading, authenticatedFetch, user } = useAuth();

  // Messages for the current session
  const [messages, setMessages] = useState([]);

  // Multiple chat sessions
  const [sessions, setSessions] = useState([]);
  const [sessionID, setSessionID] = useState('');

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);

  // Load missing previews in parallel for sessions not in cache
  const loadMissingPreviews = useCallback(async (sessionsToLoad) => {
    if (!user?.email || sessionsToLoad.length === 0) return;

    const promises = sessionsToLoad.map(async (session) => {
      try {
        const response = await authenticatedFetch(
          `${config.API_BASE_URL}/chat/message?session_id=${session.id}`,
          { method: "GET" }
        );

        if (response.ok) {
          const data = await response.json();
          // Find the first user message (by=1)
          const firstUserMsg = data.msgs?.find(m => m.by === 1);
          if (firstUserMsg) {
            const preview = truncateText(firstUserMsg.content);
            return { sessionId: session.id, preview };
          }
        }
      } catch (e) {
        console.error(`Failed to load preview for session ${session.id}:`, e);
      }
      return null;
    });

    const results = await Promise.all(promises);

    // Batch update cache and state
    const newPreviews = {};
    results.forEach(r => {
      if (r) newPreviews[r.sessionId] = r.preview;
    });

    if (Object.keys(newPreviews).length === 0) return;

    // Update localStorage cache
    const cache = getPreviewCache(user.email);
    Object.assign(cache, newPreviews);
    savePreviewCache(user.email, cache);

    // Update state
    setSessions(prev => prev.map(s =>
      newPreviews[s.id] ? { ...s, title: newPreviews[s.id], needsPreview: false } : s
    ));
  }, [authenticatedFetch, user?.email]);

  // Load user's chat session list
  useEffect(() => {
    const loadChatSessions = async () => {
      if (!access_token || loading || !user?.email) return;

      try {
        const apiUrl = `${config.API_BASE_URL}/chat/sessions`;

        const response = await authenticatedFetch(apiUrl, {
          method: "GET",
        });

        if (response.ok) {
          const sessionIds = await response.json();

          // Read preview cache from localStorage
          const previewCache = getPreviewCache(user.email);

          // Convert session IDs to session objects, use cached preview if available
          // Reverse the order so newest sessions appear at the top
          const loadedSessions = sessionIds.map((id, index) => ({
            id: id,
            title: previewCache[id] || `Chat ${sessionIds.length - index}`,
            needsPreview: !previewCache[id],
          })).reverse();

          setSessions(loadedSessions);

          // If no sessions exist, auto-start a new session
          if (loadedSessions.length === 0) {
            startNewSession();
          } else {
            // Load missing previews in parallel
            const sessionsNeedingPreview = loadedSessions.filter(s => s.needsPreview);
            if (sessionsNeedingPreview.length > 0) {
              loadMissingPreviews(sessionsNeedingPreview);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load chat sessions:', err);
        // Start new session even if loading fails
        startNewSession();
      }
    };

    loadChatSessions();
  }, [access_token, loading, authenticatedFetch, user?.email, loadMissingPreviews]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Start a new chat session
  const startNewSession = () => {
    // Don't pre-generate session_id, let backend create and return new UUID
    setSessionID('');  // Empty string means new session

    // Set welcome message
    setMessages([getWelcomeMessage()]);
  };

  // Switch chat sessions
  const switchSession = async (id) => {
    setSessionID(id);
    setMessages([]);
    setIsTyping(true);

    try {
      const apiUrl = `${config.API_BASE_URL}/chat/message?session_id=${id}`;

      const response = await authenticatedFetch(apiUrl, {
        method: "GET",
      });

      if (response.ok) {
        const chatSession = await response.json();

        // Convert message format: by=0 is bot, by=1 is user
        const loadedMessages = chatSession.msgs?.map(msg => ({
          sender: msg.by === 0 ? "bot" : "user",
          text: msg.content
        })) || [];

        // Prepend welcome message to loaded messages
        setMessages([getWelcomeMessage(), ...loadedMessages]);
      } else {
        // If loading fails, show welcome message only
        setMessages([getWelcomeMessage()]);
      }
    } catch (err) {
      console.error('Failed to load session messages:', err);
      setMessages([
        getWelcomeMessage(),
        {
          sender: "bot",
          text: `⚠️ Unable to load session history: ${err.message}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Send chat message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;  // Only check if input is empty, sessionID can be empty (new session)

    const newMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // FormData required by backend
      const formData = new FormData();
      formData.append("session_id", sessionID || '');
      formData.append("message", newMessage.text);

      const apiUrl = `${config.API_BASE_URL}/chat/message`;

      const response = await authenticatedFetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', response.status, errorText);
        throw new Error(`API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      // Update sessionID if backend created a new one (new session)
      if (data.session_id && data.session_id !== sessionID) {
        const newSessionId = data.session_id;
        const preview = truncateText(newMessage.text);

        // Cache the preview for the new session
        if (user?.email) {
          updatePreviewCache(user.email, newSessionId, preview);
        }

        setSessionID(newSessionId);

        // Add new session to the top of list with preview as title
        setSessions(prev => [
          { id: newSessionId, title: preview, needsPreview: false },
          ...prev
        ]);
      } else if (sessionID) {
        // Existing session: move it to the top of the list
        setSessions(prev => {
          const currentSession = prev.find(s => s.id === sessionID);
          if (!currentSession) return prev;
          const otherSessions = prev.filter(s => s.id !== sessionID);
          return [currentSession, ...otherSessions];
        });
      }

      // Extract bot messages (by=0)
      const botMessages = data.msgs?.filter(msg => msg.by === 0) || [];
      const botText = botMessages.map(msg => msg.content).join("\n") ||
        "Sorry, I could not process that.";

      setMessages(prev => [...prev, { sender: "bot", text: botText }]);

    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: `⚠️ Error: ${err.message}` }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <div className="hero-section text-center py-4" style={{ backgroundColor: '#FFD700' }}>
        <h1>Foodie Safety AI ChatBot</h1>
        <p>Smart. Safe. Sustainable.</p>
      </div>

      <div className="container-fluid mt-3">
        <div className="row">

          {/* SIDEBAR */}
          <div className="col-3 border-end" style={{ height: '75vh', overflowY: 'auto' }}>
            <button
              className="btn w-100 mb-3"
              onClick={startNewSession}
              style={{
                "--bs-btn-bg": "var(--bs-info-bg-subtle)",
                "--bs-btn-border-color": "var(--bs-info-border-subtle)",
                "--bs-btn-color": "var(--bs-info-text)",
                "--bs-btn-hover-bg": "var(--bs-info-bg-subtle)",
                "--bs-btn-hover-border-color": "var(--bs-info-border-subtle)",
                "--bs-btn-hover-color": "var(--bs-info-text)",
                "--bs-btn-active-bg": "#b9e6f0",
                "--bs-btn-active-border-color": "#b9e6f0",
                "--bs-btn-active-color": "var(--bs-info-text)",
              }}
            >
              + New Chat
            </button>

            <div className="list-group">
              {sessions.map(s => (
                <a
                  key={s.id}
                  className={`list-group-item list-group-item-action ${sessionID === s.id ? 'active' : ''}`}
                  onClick={() => switchSession(s.id)}
                  style={{
                    "--bs-list-group-hover-bg": "var(--bs-secondary-bg-subtle)",
                    "--bs-list-group-active-bg": "var(--bs-secondary)",
                    "--bs-list-group-active-border-color": "var(--bs-secondary)",
                    "--bs-list-group-active-color": "var(--bs-white)",
                  }}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* MAIN CHAT */}
          <div className="col-9">
            <div className="border rounded p-3 bg-light" style={{ height: '60vh', overflowY: 'auto' }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex mb-3 ${msg.sender === "user" ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  {msg.sender === "bot" && (
                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ width: "40px", height: "40px" }}>
                      <i className="bi bi-robot"></i>
                    </div>
                  )}

                  <div
                    className={`p-3 rounded shadow-sm ${msg.sender === "user" ? "alert alert-info" : "bg-white"}`}
                    style={{ maxWidth: "70%" }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                  </div>

                  {msg.sender === "user" && (
                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center ms-2"
                      style={{ width: "40px", height: "40px" }}>
                      <i className="bi bi-person"></i>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="text-muted fst-italic small">Foodie Safety AI is typing...</div>
              )}

              <div ref={chatEndRef}></div>
            </div>

            <form onSubmit={handleSend} className="d-flex mt-5">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type your message to get AI recipe suggestions..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">
                Send
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;