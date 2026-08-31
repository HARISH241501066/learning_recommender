import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

const ChatInterface = ({ token }) => {
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your LearnAI assistant. What are your career or learning goals?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      
      setTimeout(() => {
        setMessages(prev => [...prev, { text: data.reply, sender: 'ai' }]);
        setIsLoading(false);
      }, 500); // Artificial delay for better UX
      
    } catch (error) {
      console.error("Chat error", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '24px' }} className="gradient-text">AI Learning Assistant</h2>
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              {msg.sender === 'ai' && (
                <div style={{ background: 'var(--accent-secondary)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                  <Bot size={20} color="white" />
                </div>
              )}
              <div style={{
                background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                padding: '12px 16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                color: 'white',
                lineHeight: '1.5'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ background: 'var(--accent-secondary)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <Bot size={20} color="white" />
              </div>
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, background: 'rgba(0,0,0,0.2)' }}
          />
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ padding: '12px' }}>
            <Send size={20} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatInterface;
