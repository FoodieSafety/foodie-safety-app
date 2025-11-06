import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from './context/AuthContext';
import config from './config';
import { formatMarkdown } from './utils/formatMarkdown';

const ChatBotPage = () => {
  const { user, access_token, loading } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `👋 Hello! I’m Foodie Safety AI. 

Let’s get started on finding the perfect recipe for you. 🍽️

To help me tailor the best suggestions, could you please share a few details?

• Meal type you’re in the mood for (e.g., breakfast, Mexican, spicy)
• Ingredients to avoid (any allergies or dietary preferences)
• Time you have available to cook
• Cooking tools you have on hand (e.g., oven, air fryer, blender)`
    },
    { sender: 'user', text: '👉 Thank you, I want to cook something quick and easy.' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionID, setSessionID] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Request body according to backend spec (Form data)
      const formData = new FormData();
      formData.append('session_id', sessionID || '');
      formData.append('message', input);

      const response = await fetch(`${config.API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to get AI response.');

      const data = await response.json();

      // Saving session ID from response (if new)
      if (data.session_id && data.session_id !== sessionID) {
        setSessionID(data.session_id);
      }

      // Adding bot reply - backend returns msgs array with ChatMsg objects
      // Get the latest message from the LLM (by=0)
      const botMessages = data.msgs?.filter(msg => msg.by === 0) || [];
      const botText = botMessages.map(msg => msg.content).join('\n') || 'Sorry, I could not process that.';

      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: botText },
      ]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
        <h1>Foodie Safety AI ChatBot</h1>
        <p>Smart. Safe. Sustainable.</p>
      </div>

      {/* Chat Container */}
      <div className="container my-4">
        <div
          className="border rounded p-3 mb-3 bg-light"
          style={{ height: '60vh', overflowY: 'auto' }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'
                } align-items-end`}
            >
              {msg.sender === 'bot' && (
                <div
                  className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle me-2"
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className="bi bi-robot fs-5"></i>
                </div>
              )}

              <div
                className={`p-3 rounded shadow-sm ${msg.sender === 'user' ? 'alert alert-info mb-3' : 'bg-white text-dark'
                  }`}
                style={{ maxWidth: '70%', whiteSpace: 'pre-line' }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
                ></div>
              </div>

              {msg.sender === 'user' && (
                <div
                  className="d-flex align-items-center justify-content-center bg-warning text-white rounded-circle ms-2"
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className="bi bi-person fs-5"></i>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="text-muted fst-italic small">Foodie Safety AI is typing...</div>
          )}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input Box */}
        <form onSubmit={handleSend} className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Type a response to generate an AI recipe..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBotPage;