// Minimal Upstash / Vercel KV REST client. No dependency: one fetch per command.
// Configure with UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or Vercel's KV_REST_API_URL + KV_REST_API_TOKEN).
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const configured = Boolean(URL_ && TOKEN);

export async function cmd(...args) {
  if (!configured) throw new Error('store not configured');
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(args),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || `store error ${r.status}`);
  return j.result;
}
