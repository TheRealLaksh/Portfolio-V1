import { createContext, useContext, useEffect, useRef, useState } from 'react';

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ss = (t) => t * t * (3 - 2 * t);
export const range = (v, a, b) => clamp((v - a) / (b - a));

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Storage can throw (private windows, blocked site data), so every access is wrapped.
export const store = {
  get(k, d = null) {
    try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem(k, v); } catch { /* ignore */ }
  },
};

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = store.get('world-theme');
    if (saved === 'night' || saved === 'day') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'night';
    return 'day';
  });
  const toggle = () =>
    setTheme((t) => {
      const n = t === 'day' ? 'night' : 'day';
      store.set('world-theme', n);
      return n;
    });
  return [theme, toggle];
}

// Runs `fn(scrollY)` once per animation frame while scrolling or resizing. No React state, so no re-renders.
export function useScrollFrame(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    let raf = 0;
    let queued = false;
    const run = () => {
      queued = false;
      ref.current(window.scrollY, window.innerHeight);
    };
    const on = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);
}

// Adds .in to elements as they enter the viewport (one-time fade/slide reveals only).
export function useReveal(rootRef, remountKey) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = [...root.querySelectorAll('[data-rv]')];
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (list) => list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }),
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [rootRef, remountKey]);
}

// Position of an element within a tall "track" section: 0 when its top reaches the viewport top,
// 1 when its bottom reaches the viewport bottom. Used by sticky, scroll-driven sections.
export function trackProgress(el) {
  const r = el.getBoundingClientRect();
  const total = Math.max(1, r.height - window.innerHeight);
  return clamp(-r.top / total);
}

// ---------- scroll-driven scenes (the storytelling layer) ----------

// Pinned, scrubbed scenes run on landscape screens that are big enough and when the visitor has not asked
// for less motion. A 1280 px laptop at 150% display scaling is only about 853 CSS px wide, so the bar is
// 720 px, not the old 900 px. Everywhere else the same markup is a normal stacked page (CSS defaults show
// the finished state).
export const SCRUB_QUERY = '(min-width: 720px) and (min-height: 420px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)';
export const scrubMode = () =>
  typeof window !== 'undefined' && window.matchMedia(SCRUB_QUERY).matches;

export function useScrubMode() {
  const [on, setOn] = useState(scrubMode);
  useEffect(() => {
    const mq = window.matchMedia(SCRUB_QUERY);
    const upd = () => setOn(mq.matches);
    mq.addEventListener?.('change', upd);
    return () => mq.removeEventListener?.('change', upd);
  }, []);
  return on;
}

// Progress of an element passing through the viewport (not pinned): 0 as its top enters the bottom
// edge, 1 as its bottom leaves the top edge.
export function passProgress(el) {
  const r = el.getBoundingClientRect();
  return clamp((window.innerHeight - r.top) / (r.height + window.innerHeight));
}

// Drives `fn(p, dt, vh)` from the scroll position of `ref`. `p` is eased toward the target, so the camera
// glides instead of snapping. Runs outside React (no state), only while the target is moving or in view.
//   mode 'track': ref is a tall section with a sticky stage (see trackProgress)
//   mode 'pass':  ref just scrolls through (see passProgress)
export function useTrack(ref, fn, { mode = 'track', damp = 9, enabled = true } = {}) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;
    const get = mode === 'pass' ? passProgress : trackProgress;
    let target = get(el);
    let cur = target;
    let raf = 0;
    let last = 0;
    let lastP = -1;
    let first = true;
    const tick = (t) => {
      raf = 0;
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      const k = 1 - Math.exp(-dt * damp);
      cur += (target - cur) * k;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      if (cur !== lastP || first) { cb.current(cur, dt, window.innerHeight); lastP = cur; first = false; }
      if (cur !== target) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onScroll = () => { target = get(el); wake(); };
    const onResize = () => { first = true; onScroll(); };
    cb.current(cur, 0.016, window.innerHeight);
    lastP = cur;
    first = false;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [ref, mode, damp, enabled]);
}

export const lerp = (a, b, t) => a + (b - a) * t;
// Spring-ish overshoot for pop-ins.
export const backOut = (t) => { const c = 1.70158; const x = t - 1; return 1 + (c + 1) * x * x * x + c * x * x; };

export const ScrubCtx = createContext(false);
export const useScrub = () => useContext(ScrubCtx);
