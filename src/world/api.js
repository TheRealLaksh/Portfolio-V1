// Thin client for the two serverless endpoints in /api (wall notes and the visitor counter).
// Both degrade quietly: if the backend is not configured, the page just hides the feature.

const json = async (res) => { try { return await res.json(); } catch { return null; } };

export async function fetchNotes() {
  try {
    const r = await fetch('/api/wall', { headers: { accept: 'application/json' } });
    const j = await json(r);
    if (!r.ok || !j || !Array.isArray(j.notes)) return { ok: false, notes: [] };
    return { ok: true, notes: j.notes };
  } catch {
    return { ok: false, notes: [] };
  }
}

export async function postNote(body) {
  try {
    const r = await fetch('/api/wall', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await json(r);
    if (r.ok && j?.note) return { ok: true, note: j.note };
    return { ok: false, error: j?.error };
  } catch {
    return { ok: false };
  }
}

// Counts this browser once per day. Returns the total, or null when the counter is not available.
export async function countVisit() {
  try {
    let seen = false;
    try { seen = localStorage.getItem('world-visit') === new Date().toISOString().slice(0, 10); } catch { /* ignore */ }
    const r = await fetch(`/api/visit${seen ? '' : '?hit=1'}`, { method: seen ? 'GET' : 'POST' });
    const j = await json(r);
    if (!r.ok || typeof j?.count !== 'number') return null;
    try { localStorage.setItem('world-visit', new Date().toISOString().slice(0, 10)); } catch { /* ignore */ }
    return j.count;
  } catch {
    return null;
  }
}
