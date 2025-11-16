import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from './context/AuthContext';
import config from './config';
import { formatMarkdown } from './utils/formatMarkdown';

const ChatBotPage = () => {
  const { user, access_token, loading } = useAuth();

  // Messages for the current session
  const [messages, setMessages] = useState([]);

  // Multiple chat sessions
  const [sessions, setSessions] = useState([]);
  const [sessionID, setSessionID] = useState('');

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Start a new chat session
  const startNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: `Chat ${sessions.length + 1}`,
    };

    setSessions(prev => [...prev, newSession]);
    setSessionID(newSession.id);

    // Default greeting message for new chat
    setMessages([
      {
        sender: "bot",
        text: `👋 Hello! I’m Foodie Safety AI. 

Let’s get started on finding the perfect recipe for you. 🍽️

To help me tailor the best suggestions, could you please share a few details?

• Meal type you’re in the mood for (e.g., breakfast, Mexican, spicy)  
• Ingredients to avoid (any allergies or dietary preferences)  
• Time you have available to cook  
• Cooking tools you have on hand (e.g., oven, air fryer, blender)`
      }
    ]);
  };

  // Switch chat sessions
  const switchSession = (id) => {
    setSessionID(id);
    setMessages([
      {
        sender: "bot",
        text: `Welcome back to ${id}!`
      }
    ]);
  };

  // Send chat message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionID) return;

    const newMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // FormData required by backend
      const formData = new FormData();
      formData.append("session_id", sessionID || "");
      formData.append("message", input);

      const response = await fetch(`${config.API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to get AI response.");

      const data = await response.json();

      // Update sessionID if backend created a new one
      if (data.session_id && data.session_id !== sessionID) {
        setSessionID(data.session_id);
      }

      // Extract bot messages (by=0)
      const botMessages = data.msgs?.filter(msg => msg.by === 0) || [];
      const botText = botMessages.map(msg => msg.content).join("\n") ||
        "Sorry, I could not process that.";

      setMessages(prev => [...prev, { sender: "bot", text: botText }]);

    } catch (err) {
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
                placeholder={sessionID ? "Type a response to generate an AI recipe..." : "Start a new chat first"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!sessionID}
              />
              <button type="submit" className="btn btn-secondary" disabled={!sessionID}>
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