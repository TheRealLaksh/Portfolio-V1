// Guestbook wall. GET lists notes (never the email), POST adds one, DELETE (admin token) removes one.
import { cmd, configured } from './_redis.js';

const KEY = 'wall:notes';
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const pub = ({ id, name, company, role, note, at }) => ({ id, name, company, role, note, at });
const LINKY = /(https?:\/\/|www\.|\.(com|in|io|ru|xyz|top)\b\/?)/i;

export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  if (!configured) return res.status(503).json({ error: 'The wall is not set up yet.' });
  try {
    if (req.method === 'GET') {
      const rows = await cmd('LRANGE', KEY, 0, 59);
      const notes = rows.map((r) => { try { return pub(JSON.parse(r)); } catch { return null; } }).filter(Boolean);
      return res.status(200).json({ notes });
    }

    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      if (b.website) return res.status(200).json({ note: { id: 'x', name: 'Guest', note: '...' } }); // honeypot: pretend success
      const name = clean(b.name, 40);
      const note = clean(b.note, 200);
      const email = clean(b.email, 120);
      if (!name || !note || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please add your name, a valid email and a note.' });
      if (LINKY.test(note) || LINKY.test(name)) return res.status(400).json({ error: 'Links are not allowed on the wall. Email me instead.' });

      const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
      const rk = `wall:rl:${ip}`;
      const n = await cmd('INCR', rk);
      if (n === 1) await cmd('EXPIRE', rk, 3600);
      if (n > 3) return res.status(429).json({ error: 'That is a lot of notes. Try again in an hour.' });

      const entry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, company: clean(b.company, 40), role: clean(b.role, 40), note, email, at: new Date().toISOString() };
      await cmd('LPUSH', KEY, JSON.stringify(entry));
      await cmd('LTRIM', KEY, 0, 199);
      return res.status(201).json({ note: pub(entry) });
    }

    if (req.method === 'DELETE') {
      if (!process.env.WALL_ADMIN_TOKEN || req.headers['x-admin-token'] !== process.env.WALL_ADMIN_TOKEN) return res.status(401).json({ error: 'Not allowed.' });
      const id = clean(req.query?.id, 40);
      const rows = await cmd('LRANGE', KEY, 0, 199);
      const hit = rows.find((r) => { try { return JSON.parse(r).id === id; } catch { return false; } });
      if (!hit) return res.status(404).json({ error: 'No such note.' });
      await cmd('LREM', KEY, 1, hit);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
