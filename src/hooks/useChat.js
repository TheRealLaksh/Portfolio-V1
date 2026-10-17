import { useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/triggerHaptic';

// ✅ Drop your live backend URL here if you don't want to use environment dashboard inputs
const DEFAULT_BACKEND = 'https://portfolio-chat-bot-kohl.vercel.app/api/chat'; 
const API_URL = import.meta.env.VITE_CHAT_API_URL || DEFAULT_BACKEND;

export const useChat = () => {
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('AI-LakshChatMessages');
      return stored ? JSON.parse(stored) : [];
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
      localStorage.setItem('AI-LakshUserId', newId);
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('AI-LakshChatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const addMessage = (msg) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const clearChat = () => {
    setChatMessages([]);
    localStorage.removeItem('AI-LakshChatMessages');
    triggerHaptic();
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    triggerHaptic();
    addMessage({ text, sender: 'user' });
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
      
      addMessage({ text: data.reply, sender: 'bot' });
      triggerHaptic();
    } catch (error) {
      console.error("Chat Error:", error);
      addMessage({ 
        text: "I'm running into connectivity issues right now. Let's try again in a bit!", 
        sender: 'bot' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    chatMessages,
    isLoading,
    sendMessage,
    clearChat
  };
};