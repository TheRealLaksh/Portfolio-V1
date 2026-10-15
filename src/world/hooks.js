import { useEffect, useRef, useState } from 'react';

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
export function useReveal(rootRef) {
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
  }, [rootRef]);
}

// Position of an element within a tall "track" section: 0 when its top reaches the viewport top,
// 1 when its bottom reaches the viewport bottom. Used by sticky, scroll-driven sections.
export function trackProgress(el) {
  const r = el.getBoundingClientRect();
  const total = Math.max(1, r.height - window.innerHeight);
  return clamp(-r.top / total);
}
