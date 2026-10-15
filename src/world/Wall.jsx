import React, { useEffect, useRef, useState } from 'react';
import { range, ss, useTrack, useScrub } from './hooks';
import Icon from './Icon';
import { fetchNotes, postNote } from './api';

const TINTS = ['#FFE98A', '#FFD1C4', '#CFE7FF', '#D9CCFF', '#C9F0E4', '#FFD9A8'];
const initials = (n) => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
const tint = (s) => TINTS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];

function NoteCard({ n }) {
  return (
    <article className="nw-card" style={{ ['--sc']: tint(n.name) }}>
      <header>
        <span className="nw-ava">{initials(n.name)}</span>
        <div><b>{n.name}</b>{(n.role || n.company) && <small>{[n.role, n.company].filter(Boolean).join(' · ')}</small>}</div>
      </header>
      <p>{n.note}</p>
    </article>
  );
}

export default function Wall() {
  const [notes, setNotes] = useState(null); // null = loading, [] = empty or offline
  const [online, setOnline] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const form = useRef(null);
  const sec = useRef(null);
  const rowsEl = useRef(null);
  const scrub = useScrub();

  // The two rows of notes slide against each other as you scroll past, and the wall zooms up to full size.
  useTrack(sec, (p) => {
    const r = rowsEl.current;
    if (!r) return;
    const e = ss(range(p, 0.28, 0.58));
    r.style.transform = `scale(${(0.9 + 0.1 * e).toFixed(4)})`;
    r.style.opacity = String(0.15 + 0.85 * e);
    r.querySelectorAll('.nw-row').forEach((row, i) => {
      row.style.translate = `${((i ? 1 : -1) * (p - 0.5) * 360).toFixed(1)}px 0`;
    });
  }, { mode: 'pass', enabled: scrub, damp: 9 });

  useEffect(() => {
    let alive = true;
    fetchNotes().then((r) => { if (alive) { setNotes(r.notes); setOnline(r.ok); } });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const fd = new FormData(form.current);
    const body = Object.fromEntries(fd.entries());
    if (!body.name?.trim() || !body.note?.trim() || !/^\S+@\S+\.\S+$/.test(body.email || '')) {
      setErr('Please add your name, a valid email and a note.');
      return;
    }
    setBusy(true);
    const r = await postNote(body);
    setBusy(false);
    if (!r.ok) { setErr(r.error || 'Could not post right now. Try again, or email me instead.'); return; }
    setNotes((cur) => [r.note, ...(cur || [])]);
    setDone(true);
    form.current.reset();
    setCount(0);
    setTimeout(() => { setOpen(false); setDone(false); }, 1600);
  };

  const list = notes || [];
  const half = Math.ceil(list.length / 2);
  const rows = [list.slice(0, half), list.slice(half)];

  return (
    <section className="notes torn torn-bot" id="notes" aria-label="Notes wall" ref={sec}>
      <div className="wrap nw-head">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="chat" size={16} />The wall</p>
          <h2>Before you leave, <span className="hl b-sun">leave a note.</span></h2>
          <p>Say hi, share feedback, or tell me what you are building. It goes up on the wall.</p>
        </div>
        <button className="nw-cta" type="button" onClick={() => setOpen(true)}><span className="nw-pen" aria-hidden="true"><Icon n="pen" size={18} /></span>Write a note</button>
      </div>

      <div className="nw-rows" aria-live="polite" ref={rowsEl}>
        {list.length === 0 ? (
          <p className="nw-empty">{notes === null ? 'Loading the wall…' : online ? 'The wall is empty. Be the first to pin a note.' : 'The wall is warming up. Email me in the meantime.'}</p>
        ) : (
          rows.map((r, i) => (
            <div key={i} className={`nw-row ${i ? 'rev' : ''}`}>
              <div className={`nw-track ${r.length > 3 ? 'scroll' : ''}`}>
                {(r.length > 3 ? [...r, ...r] : r).map((n, j) => <NoteCard key={`${n.id}-${j}`} n={n} />)}
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="nw-modal open" role="dialog" aria-modal="true" aria-labelledby="nwTitle" data-lenis-prevent onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <form className="nw-sheet" ref={form} onSubmit={submit} noValidate>
            <button className="nw-x" type="button" onClick={() => setOpen(false)} aria-label="Close">&times;</button>
            <p className="nw-k">Pin a note</p>
            <h3 id="nwTitle">Leave your mark.</h3>
            <label className="nw-f"><span>Your name</span><input name="name" maxLength={40} autoComplete="name" required /></label>
            <div className="nw-two">
              <label className="nw-f"><span>Company <em>optional</em></span><input name="company" maxLength={40} autoComplete="organization" /></label>
              <label className="nw-f"><span>Your role <em>optional</em></span><input name="role" maxLength={40} autoComplete="organization-title" /></label>
            </div>
            <label className="nw-f"><span>Email <em>only I will see this</em></span><input name="email" type="email" maxLength={120} autoComplete="email" required /></label>
            <label className="nw-f"><span>Your note <em>{count} / 200</em></span><textarea name="note" maxLength={200} rows={3} required onChange={(e) => setCount(e.target.value.length)} /></label>
            {/* honeypot: real people never see or fill this */}
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <p className="nw-err" role="alert">{err}</p>
            <button className="nw-go" type="submit" disabled={busy || done}>{done ? 'Pinned!' : busy ? 'Pinning…' : 'Pin it to the wall'}</button>
            <p className="nw-fine">Your email is never shown. Notes are checked for spam before they appear.</p>
          </form>
        </div>
      )}
    </section>
  );
}
