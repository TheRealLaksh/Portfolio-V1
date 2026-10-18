import { useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/triggerHaptic';

// ✅ Drop your live backend URL here if you don't want to use environment dashboard inputs
const DEFAULT_BACKEND = 'https://portfolio-chat-bot-kohl.vercel.app/api/chat'; 
// Collapse doubled slashes: the VITE_CHAT_API_URL env var on Vercel has one, and a double slash gets a 308 redirect that the browser blocks on a cross-origin POST.
const API_URL = (import.meta.env.VITE_CHAT_API_URL || DEFAULT_BACKEND).replace(/([^:])\/{2,}/g, '$1/');

// ChatBubble reads { sender: 'You' | 'AI Laksh', content, type }. Older saved chats used
// { sender: 'user' | 'bot', text }, which rendered as empty bubbles, so convert them on load.
const normalise = (m) => {
  if (!m || typeof m !== 'object') return null;
  if (m.type && m.type !== 'text' && m.type !== 'mdx') return m;
  const content = m.content ?? m.text;
  if (typeof content !== 'string' || !content.trim()) return null;
  const isUser = m.sender === 'You' || m.sender === 'user';
  return isUser
    ? { sender: 'You', content, type: 'text' }
    : { sender: 'AI Laksh', content, type: 'mdx' };
};

export const useChat = () => {
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('AI-LakshChatMessages') || '[]');
      return Array.isArray(stored) ? stored.map(normalise).filter(Boolean) : [];
    } catch { return []; }
  });

  const [userId, setUserId] = useState(() => {
    try { return localStorage.getItem('AI-LakshUserId') || ''; } catch { return ''; }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      const newId = 'user-' + Date.now();
      setUserId(newId);
      try { localStorage.setItem('AI-LakshUserId', newId); } catch { /* storage blocked */ }
    }
  }, [userId]);

  useEffect(() => {
    try { localStorage.setItem('AI-LakshChatMessages', JSON.stringify(chatMessages)); } catch { /* storage blocked */ }
  }, [chatMessages]);

  const addMessage = (msg) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const clearChat = () => {
    setChatMessages([]);
    try { localStorage.removeItem('AI-LakshChatMessages'); } catch { /* storage blocked */ }
    triggerHaptic();
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    triggerHaptic();
    addMessage({ sender: 'You', content: text, type: 'text' });
    setIsLoading(true);

    try {
      // ✅ Handshake matches our updated clean backend perfectly
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Empty reply');
      addMessage({ sender: 'AI Laksh', content: data.reply, type: 'mdx' });
      triggerHaptic();
    } catch (error) {
      console.error("Chat Error:", error);
      addMessage({
        sender: 'AI Laksh',
        content: "I'm running into connectivity issues right now. Let's try again in a bit!",
        type: 'text',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    chatMessages,
    isLoading,
    sendMessage,
    clearChat,
    addMessage
  };
};