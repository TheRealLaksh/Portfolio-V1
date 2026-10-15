// Real visitor counter: one POST per browser per day increments it, GET only reads it.
import { cmd, configured } from './_redis.js';

const KEY = 'visits:total';

export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  if (!configured) return res.status(503).json({ error: 'not configured' });
  try {
    if (req.method === 'POST') {
      const count = await cmd('INCR', KEY);
      return res.status(200).json({ count });
    }
    const v = await cmd('GET', KEY);
    return res.status(200).json({ count: Number(v) || 0 });
  } catch {
    return res.status(500).json({ error: 'unavailable' });
  }
}
