// Talks to the chat backend (separate repo: Portfolio-Chat_Bot, its own Vercel project).
// VITE_CHAT_API_URL may be the bare address or the full .../api/chat address, with stray slashes:
// the base is rebuilt from either, because a doubled slash gets a redirect the browser blocks.

const DEFAULT_BASE = 'https://portfolio-chat-bot-kohl.vercel.app';

export const API_BASE = String(import.meta.env.VITE_CHAT_API_URL || DEFAULT_BASE)
  .replace(/\/+$/, '')
  .replace(/\/api\/chat$/, '')
  .replace(/([^:])\/{2,}/g, '$1/')
  .replace(/\/+$/, '');

export const MAX_CHARS = 300;
const TIMEOUT_MS = 25000;

/** kind: 'network' | 'timeout' | 'rate' | 'server' */
export class ChatError extends Error {
  constructor(kind) {
    super(kind);
    this.kind = kind;
  }
}

async function post(path, body, signal) {
  const timer = new AbortController();
  const stop = () => timer.abort();
  const t = setTimeout(stop, TIMEOUT_MS);
  signal?.addEventListener('abort', stop);
  try {
    return await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: timer.signal,
    });
  } catch (e) {
    if (signal?.aborted) throw e; // the caller cancelled: not an error to show
    throw new ChatError(timer.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(t);
    signal?.removeEventListener('abort', stop);
  }
}

/** Resolves { id, reply, cards, followups }. Throws ChatError. */
export async function askBot({ userId, message, history, signal }) {
  const res = await post('/api/chat', { userId, message, history }, signal);
  if (res.status === 429) throw new ChatError('rate');
  if (!res.ok) throw new ChatError('server');
  let data;
  try { data = await res.json(); } catch { throw new ChatError('server'); }
  if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw new ChatError('server');
  return {
    id: typeof data.id === 'string' ? data.id : null,
    reply: data.reply,
    cards: Array.isArray(data.cards) ? data.cards : [],
    followups: Array.isArray(data.followups) ? data.followups.filter((c) => typeof c === 'string') : [],
  };
}

/** Thumbs up/down. Best effort: never throws. */
export async function sendFeedback({ id, rating, question, reply }) {
  try {
    await post('/api/feedback', { id, rating, question, reply });
  } catch { /* feedback is optional */ }
}
