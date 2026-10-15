import { useEffect } from 'react';
import { prefersReducedMotion } from './hooks';

// Pointer-driven polish for the whole page, all outside React (no state, no re-renders):
//   - cards lean towards the pointer (springy, with a soft shine)
//   - buttons are slightly magnetic
//   - clicking a button or link pops a few paper confetti bits
//   - [data-par] elements drift at their own speed as the page scrolls
// Everything is skipped for touch screens (where it makes no sense) and for reduced motion.

const TILT = '.bc, .nw-card, .wcard, .jcard';
const MAG = '.btn-main, .btn-ghost, .nw-cta, .s-link, .nav .cta, .theme-btn, .pk-go, .mapctl button, .deck-nav button';
const CONFETTI = ['#E8505B', '#FFC93C', '#1FA6A0', '#8E7CFF', '#FF8A1F', '#3E8EDB'];

export function useMotionKit(rootRef, remountKey) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };

    // ---- springs: one rAF loop that only runs while something is still moving ----
    const springs = new Map(); // el -> { kind, x, y, tx, ty }
    let raf = 0;
    const apply = (el, s) => {
      if (s.kind === 'tilt') {
        el.style.setProperty('--rx', `${s.y.toFixed(2)}deg`);
        el.style.setProperty('--ry', `${s.x.toFixed(2)}deg`);
      } else {
        el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      }
    };
    const step = () => {
      raf = 0;
      springs.forEach((s, el) => {
        s.x += (s.tx - s.x) * 0.16;
        s.y += (s.ty - s.y) * 0.16;
        if (Math.abs(s.tx - s.x) < 0.01 && Math.abs(s.ty - s.y) < 0.01) {
          s.x = s.tx; s.y = s.ty;
          apply(el, s);
          if (!s.tx && !s.ty) {
            springs.delete(el);
            if (s.kind === 'tilt') { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); } else el.style.translate = '';
            return;
          }
        }
        apply(el, s);
      });
      if (springs.size) raf = requestAnimationFrame(step);
    };
    const aim = (el, kind, tx, ty) => {
      const s = springs.get(el) || { kind, x: 0, y: 0, tx: 0, ty: 0 };
      s.tx = tx; s.ty = ty;
      springs.set(el, s);
      if (!raf) raf = requestAnimationFrame(step);
    };

    if (fine) {
      let tiltEl = null;
      let magEl = null;
      on(root, 'pointermove', (e) => {
        const t = e.target.closest?.(TILT) || null;
        if (t !== tiltEl) { if (tiltEl) aim(tiltEl, 'tilt', 0, 0); tiltEl = t; }
        if (t) {
          const r = t.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          aim(t, 'tilt', nx * 9, -ny * 7);
        }
        const m = e.target.closest?.(MAG) || null;
        if (m !== magEl) { if (magEl) aim(magEl, 'mag', 0, 0); magEl = m; }
        if (m) {
          const r = m.getBoundingClientRect();
          aim(m, 'mag', (e.clientX - (r.left + r.width / 2)) * 0.22, (e.clientY - (r.top + r.height / 2)) * 0.3);
        }
      }, { passive: true });
      on(root, 'pointerleave', () => {
        if (tiltEl) aim(tiltEl, 'tilt', 0, 0);
        if (magEl) aim(magEl, 'mag', 0, 0);
        tiltEl = null; magEl = null;
      });
    }

    // ---- confetti on click ----
    on(root, 'click', (e) => {
      const hit = e.target.closest?.('a, button');
      if (!hit || hit.closest('.nw-modal, .keys, .stage, .sk')) return;
      const n = 8;
      for (let i = 0; i < n; i++) {
        const b = document.createElement('i');
        b.className = 'm-bit';
        b.style.background = CONFETTI[i % CONFETTI.length];
        b.style.left = `${e.clientX}px`;
        b.style.top = `${e.clientY}px`;
        root.appendChild(b);
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
        const d = 26 + Math.random() * 34;
        const anim = b.animate(
          [
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${(Math.cos(a) * d).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * d - 10).toFixed(1)}px)) scale(.2) rotate(${(Math.random() * 360).toFixed(0)}deg)`, opacity: 0 },
          ],
          { duration: 560 + Math.random() * 220, easing: 'cubic-bezier(.2,.7,.3,1)' },
        );
        anim.onfinish = () => b.remove();
      }
    });

    // ---- scroll drift for [data-par] ----
    let pars = [...root.querySelectorAll('[data-par]')];
    let queued = false;
    const drift = () => {
      queued = false;
      const vh = window.innerHeight;
      pars.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const mid = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.translate = `0 ${(mid * parseFloat(el.dataset.par) * -120).toFixed(1)}px`;
      });
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(drift); } };
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', onScroll);
    // sections mount a little after the root does (scroll scenes measure first), so look again once
    const again = setTimeout(() => { pars = [...root.querySelectorAll('[data-par]')]; drift(); }, 600);
    offs.push(() => clearTimeout(again));
    drift();

    return () => {
      offs.forEach((f) => f());
      if (raf) cancelAnimationFrame(raf);
      springs.forEach((s, el) => { if (s.kind === 'tilt') { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); } else el.style.translate = ''; });
    };
  }, [rootRef, remountKey]);
}
