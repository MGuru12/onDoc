import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const AI_API_URL = import.meta.env.VITE_AI_URL || (import.meta.env.PROD ? '/ai' : 'http://localhost:3000');

const Chatbot = ({ orgId, projId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // backend handles this
  const [inputValue, setInputValue] = useState('');
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const question = inputValue;
    setInputValue('');

    try {
      const response = await axios.post(`${AI_API_URL}/user/test-agent`, {
        orgId,
        projId,
        question,
        msgs: messages,
      });

      if (response.data?.messages) {
        setMessages(response.data.messages);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
      setMessages([
        { role: 'assistant', content: "Oops! I couldn’t reach the server 😞" },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
          boxShadow: '8px 8px 16px #e0e7ff, -8px -8px 16px #ffffff',
          color: '#7c3aed',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        💬
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div
          ref={chatRef}
          style={{
            position: 'fixed',
            bottom: '85px',
            right: '20px',
            width: '340px',
            maxHeight: '70vh',
            borderRadius: '20px',
            overflow: 'hidden',
            zIndex: 999,
            background: 'linear-gradient(135deg, #f5f3ff, #faf5ff)',
            boxShadow: '12px 12px 24px #e0e7ff, -12px -12px 24px #ffffff',
            fontFamily: '"Kaushan Script", cursive, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderBottom: '1px solid #ede9fe',
              color: '#5b21b6',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow:
                  'inset 2px 2px 4px #f9f7ff, inset -2px -2px 4px #ffffff',
                color: '#7c3aed',
              }}
            >
              💬
            </div>
            Genie
            <button
              onClick={() => setIsOpen(false)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#7c3aed',
                fontWeight: 'bold',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '300px',
            }}
          >
            {messages
              .filter((msg) => msg.role !== 'system')
              .map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf:
                      msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '18px',
                    fontSize: '14px',
                    wordBreak: 'break-word',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #ede9fe, #f3e8ff)'
                        : '#f0f9ff',
                    color: msg.role === 'user' ? '#5b21b6' : '#6b21a8',
                    border:
                      msg.role === 'user'
                        ? '1px solid #e0e7ff'
                        : '1px solid #dbeafe',
                    boxShadow: '4px 4px 8px #f0f4ff, -4px -4px 8px #ffffff',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '14px',
                fontFamily: 'system-ui, sans-serif',
                background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
                boxShadow: '4px 4px 8px #f0f4ff, -4px -4px 8px #ffffff',
                color: '#5b21b6',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: inputValue.trim() ? '#7c3aed' : '#e9d5ff',
                color: 'white',
                fontSize: '14px',
                cursor: inputValue.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
