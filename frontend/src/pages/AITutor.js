import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import './pages.css';

const INITIAL_MESSAGES = [
  {
    id: 1,
    text: "Hi! I'm your AI Tutor. Ask me anything about your study materials — I can explain concepts, quiz you, and help you understand difficult topics.",
    sender: 'ai'
  }
];

const DEMO_RESPONSES = [
  "Great question! Let me explain this concept clearly. In computer science, this relates to how we analyze algorithm efficiency using Big-O notation — which describes the worst-case growth rate of a function.",
  "Absolutely! Think of it this way: a stack is like a stack of plates. You can only take from the top (LIFO — Last In, First Out). A queue, on the other hand, works like a line at a shop (FIFO — First In, First Out).",
  "That's a key topic! Binary search trees maintain a sorted order — all left subtree values are smaller than the root, and all right subtree values are larger. This makes search O(log n) on average.",
  "I'm currently running in demo mode. Once the backend is connected, I'll provide detailed, context-aware answers drawn directly from your uploaded study materials.",
];

let demoIndex = 0;

const AITutor = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8000/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: [] })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'ai' }]);
      } else throw new Error();
    } catch {
      const delay = 700 + Math.random() * 600;
      setTimeout(() => {
        const demo = DEMO_RESPONSES[demoIndex % DEMO_RESPONSES.length];
        demoIndex++;
        setMessages(prev => [...prev, { id: Date.now() + 1, text: demo, sender: 'ai' }]);
        setIsTyping(false);
      }, delay);
      return;
    }
    setIsTyping(false);
  };

  return (
    <div className="ai-tutor-container">
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'ai' ? <Bot size={15} /> : <User size={15} />}
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}

          {isTyping && (
            <div className="message-bubble ai">
              <div className="message-avatar"><Bot size={15} /></div>
              <div className="message-text" style={{ color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Ask about any topic from your materials…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            autoComplete="off"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutor;
