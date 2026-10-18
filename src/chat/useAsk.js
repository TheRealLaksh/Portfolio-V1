import { useCallback, useEffect, useRef, useState } from 'react';
import { askBot, sendFeedback, ChatError, MAX_CHARS } from './api';

const KEY = 'ask-laksh-v2';
const KEEP = 40; // messages kept in the browser
const SEND = 12; // messages sent to the bot as context
const TTL_MS = 24 * 60 * 60 * 1000;

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

export const ERROR_TEXT = {
  network: "I couldn't reach the server. Check your connection and try again.",
  timeout: 'That took too long. Please try again.',
  rate: "That's a lot of messages in a short time. Give it a few minutes, or reach Laksh directly.",
  server: "Something broke on my side. Try again, or reach Laksh directly.",
};

// Safe to show even when the server is down: the same card the bot would send.
export const FALLBACK_CONTACT = {
  id: 'contact',
  type: 'contact',
  title: 'Get in touch',
  note: 'Laksh replies fastest on WhatsApp.',
  actions: [
    { label: 'WhatsApp', url: 'https://wa.me/918433364186', kind: 'whatsapp' },
    { label: 'Email', url: 'mailto:work@lakshpradhwani.com', kind: 'mail', copy: 'work@lakshpradhwani.com' },
    { label: 'Hire page', url: 'https://lakshpradhwani.com/hire', kind: 'page' },
  ],
};

function load() {
  try {
    // The previous chat stored a different shape under other keys; drop it.
    localStorage.removeItem('AI-LakshChatMessages');
    localStorage.removeItem('AI-LakshUserId');
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s || Date.now() - s.at > TTL_MS || !Array.isArray(s.messages)) return { userId: s?.userId || uid(), messages: [] };
    const messages = s.messages.filter((m) => m && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string');
    return { userId: s.userId || uid(), messages };
  } catch {
    return { userId: uid(), messages: [] };
  }
}

export function useAsk() {
  const [boot] = useState(load);
  const [messages, setMessages] = useState(boot.messages);
  const [busy, setBusy] = useState(false);
  const userId = useRef(boot.userId);
  const abort = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    try {
      const keep = messages.filter((m) => !m.error).slice(-KEEP);
      localStorage.setItem(KEY, JSON.stringify({ userId: userId.current, at: Date.now(), messages: keep }));
    } catch { /* storage blocked */ }
  }, [messages]);

  useEffect(() => () => abort.current?.abort(), []);

  const send = useCallback(async (raw, { retry = false } = {}) => {
    const text = String(raw || '').replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS);
    if (!text || abort.current) return false;

    // Context is everything said so far that was a real exchange (errors are not). A retry drops the
    // question that failed, so it is not shown twice.
    let base = messagesRef.current.filter((m) => !m.error);
    if (retry && base.length && base[base.length - 1].role === 'user' && base[base.length - 1].text === text) base = base.slice(0, -1);
    const history = base.slice(-SEND).map((m) => ({ role: m.role, text: m.text }));

    const ctl = new AbortController();
    abort.current = ctl;
    setBusy(true);
    setMessages([...base, { id: uid(), role: 'user', text }]);

    try {
      const data = await askBot({ userId: userId.current, message: text, history, signal: ctl.signal });
      setMessages((prev) => [...prev, { id: data.id || uid(), role: 'bot', text: data.reply, cards: data.cards, chips: data.followups }]);
    } catch (e) {
      if (ctl.signal.aborted) return false;
      const kind = e instanceof ChatError ? e.kind : 'network';
      setMessages((prev) => [...prev, {
        id: uid(), role: 'bot', error: kind, text: ERROR_TEXT[kind] || ERROR_TEXT.server, retry: text,
        cards: kind === 'rate' || kind === 'server' ? [FALLBACK_CONTACT] : [],
      }]);
    } finally {
      abort.current = null;
      setBusy(false);
    }
    return true;
  }, []);

  const reset = useCallback(() => {
    abort.current?.abort();
    abort.current = null;
    setBusy(false);
    setMessages([]);
  }, []);

  const rate = useCallback((id, rating) => {
    const list = messagesRef.current;
    const i = list.findIndex((m) => m.id === id);
    if (i < 0 || list[i].rating) return;
    const question = [...list.slice(0, i)].reverse().find((m) => m.role === 'user')?.text || '';
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, rating } : m)));
    sendFeedback({ id, rating, question, reply: list[i].text });
  }, []);

  return { messages, busy, send, reset, rate };
}
