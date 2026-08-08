'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const socketRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    let id = localStorage.getItem('gb_chat_room');
    if (!id) {
      id = 'support-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('gb_chat_room', id);
    }
    setRoomId(id);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const socket = io('/chat', { path: '/socket.io' });
    socketRef.current = socket;
    socket.emit('join', { roomId });
    socket.on('history', (hist) => setMessages(hist));
    socket.on('message', (m) => {
      setMessages((prev) => [...prev, m]);
      if (m.sender === 'agent') setAgentTyping(false);
    });
    socket.on('typing', () => {
      setAgentTyping(true);
      setTimeout(() => setAgentTyping(false), 2500);
    });
    return () => socket.disconnect();
  }, [roomId]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  function send() {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('message', { roomId, sender: 'customer', message: text });
    setText('');
    // Lightweight simulated agent auto-reply so the demo feels alive out of the box.
    // In production, remove this block — real support agents reply from /admin/chat.
    setTimeout(() => {
      socketRef.current.emit('message', {
        roomId,
        sender: 'agent',
        message: "Thanks for reaching out! Our support team will get back to you shortly. Typical response time is under 10 minutes.",
      });
    }, 1200);
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>💬 GadgetBD Support</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'inherit', fontSize: 18 }}>✕</button>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                👋 Hi! Ask us anything about products, delivery, or your order.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.sender}`}>{m.message}</div>
            ))}
            {agentTyping && <div className="chat-msg agent">Agent is typing…</div>}
          </div>
          <div className="chat-input-row">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message..."
            />
            <button onClick={send}>Send</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((v) => !v)}>💬</button>
    </>
  );
}
