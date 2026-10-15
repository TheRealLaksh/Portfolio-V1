import React, { useCallback, useEffect, useRef } from 'react';
import { NOTE_STICKIES } from './data';
import { clamp, range, ss, useTrack, useScrub } from './hooks';
import Icon from './Icon';
import Floaters from './Floaters';

// "How I got here". On wide screens the paragraph is pinned while scroll draws each marker highlight and a
// hand-drawn doodle beside it, then pops the sticky notes in. No word-by-word fading: the text is always legible.
// Under 900px wide, or with reduced motion, it is a normal stacked block with the highlights painted on entry.

const MARKS = [
  { dd: 'target', a: 0.1, b: 0.27 },
  { dd: 'loop', a: 0.26, b: 0.43 },
  { dd: 'wave', a: 0.42, b: 0.6 },
  { dd: 'stars', a: 0.58, b: 0.76 },
];

// Deterministic wobble so the doodles look hand-drawn but never change between renders.
const rnd = ((a) => () => (a = (a * 16807) % 2147483647) / 2147483647)(11);

function roughEllipse(cx, cy, rx, ry) {
  let d = '';
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = -0.5 + (i / n) * Math.PI * 2 * 1.1;
    const j = 1 + (rnd() - 0.5) * 0.05 + (i / n) * 0.05;
    d += `${i ? ' L' : 'M'}${(cx + Math.cos(t) * rx * j).toFixed(1)} ${(cy + Math.sin(t) * ry * j).toFixed(1)}`;
  }
  return d;
}

const spark = (x, y, s) =>
  `M${x} ${y - s}L${x} ${y + s}M${x - s} ${y}L${x + s} ${y}M${x - s * 0.6} ${y - s * 0.6}L${x + s * 0.6} ${y + s * 0.6}M${x + s * 0.6} ${y - s * 0.6}L${x - s * 0.6} ${y + s * 0.6}`;

export default function Story() {
  const track = useRef(null);
  const box = useRef(null);
  const tell = useRef(null);
  const svg = useRef(null);
  const marks = useRef([]);
  const stickies = useRef([]);
  const scrub = useScrub();

  // Measure the highlighted phrases and build one doodle per phrase (scrub mode only).
  const build = useCallback(() => {
    const B = box.current;
    const S = svg.current;
    if (!B || !S || !scrub) return;
    const bb = B.getBoundingClientRect();
    S.innerHTML = '';
    S.setAttribute('viewBox', `0 0 ${bb.width} ${bb.height}`);
    marks.current = [...tell.current.querySelectorAll('.hl')].map((el, i) => {
      const rs = [...el.getClientRects()];
      const last = rs[rs.length - 1];
      const x0 = Math.min(...rs.map((q) => q.left)) - bb.left;
      const x1 = Math.max(...rs.map((q) => q.right)) - bb.left;
      const y0 = Math.min(...rs.map((q) => q.top)) - bb.top;
      const y1 = Math.max(...rs.map((q) => q.bottom)) - bb.top;
      const lr = { x: last.left - bb.left, y: last.top - bb.top, w: last.width, h: last.height };
      const paths = [];
      const add = (d, color, w) => {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', d);
        p.setAttribute('stroke', color);
        p.setAttribute('stroke-width', w);
        S.appendChild(p);
        const L = p.getTotalLength();
        p.style.strokeDasharray = L;
        p.style.strokeDashoffset = L;
        paths.push({ p, L });
      };
      const dd = MARKS[i].dd;
      if (dd === 'target') {
        const cx = lr.x + lr.w + 26;
        const cy = lr.y + lr.h * 0.05;
        add(roughEllipse(cx, cy, 20, 20), '#13233A', 3);
        add(roughEllipse(cx, cy, 9, 9), '#E8505B', 3);
        add(`M${cx - 30} ${cy}L${cx - 12} ${cy}M${cx + 12} ${cy}L${cx + 30} ${cy}M${cx} ${cy - 30}L${cx} ${cy - 12}M${cx} ${cy + 12}L${cx} ${cy + 30}`, '#13233A', 2.6);
      } else if (dd === 'loop') {
        add(roughEllipse((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2 + 16, (y1 - y0) / 2 + 12), '#E8505B', 4);
      } else if (dd === 'wave') {
        const y = lr.y + lr.h - 3;
        let d = `M${lr.x} ${y}`;
        for (let x = lr.x; x < lr.x + lr.w; x += 24) d += ` q 12 ${(x / 24) % 2 ? 9 : -9} 24 0`;
        add(d, '#13233A', 3.4);
      } else if (dd === 'stars') {
        const sx = lr.x + lr.w + 12;
        const sy = lr.y + 6;
        add(spark(sx + 10, sy + 6, 13), '#E8505B', 3.4);
        add(spark(sx + 36, sy - 16, 8), '#2F7FD8', 3);
        add(spark(sx + 4, sy - 24, 6), '#13233A', 2.4);
      }
      return { el, paths };
    });
  }, [scrub]);

  useEffect(() => {
    build();
    const re = () => { build(); };
    window.addEventListener('resize', re);
    document.fonts?.ready?.then(re);
    return () => window.removeEventListener('resize', re);
  }, [build]);

  useTrack(track, (p) => {
    const B = box.current;
    if (!B) return;
    // zoom in on arrival, ease back a touch as the next section takes over
    const into = ss(range(p, 0, 0.1));
    const out = ss(range(p, 0.9, 1));
    B.style.transform = `translate3d(0,${((1 - into) * 40 + out * -40).toFixed(1)}px,0) scale(${(0.93 + 0.07 * into - 0.05 * out).toFixed(4)})`;
    B.style.opacity = String(0.2 + 0.8 * into - 0.25 * out);
    marks.current.forEach((m, i) => {
      const { a, b } = MARKS[i];
      m.el.style.setProperty('--hp', ss(range(p, a, b)).toFixed(3));
      const t = ss(range(p, b - 0.04, b + 0.1));
      const n = m.paths.length;
      m.paths.forEach((q, k) => { q.p.style.strokeDashoffset = (q.L * (1 - clamp(t * n - k))).toFixed(1); });
    });
    stickies.current.forEach((s, i) => {
      if (s) s.classList.toggle('in', p >= NOTE_STICKIES[i].at);
    });
  }, { enabled: scrub, damp: 8 });

  // The sticky notes can be dragged around (desktop only; on phones they sit in the flow).
  useEffect(() => {
    const root = box.current;
    if (!root) return undefined;
    let cur = null;
    let z = 5;
    const down = (e) => {
      const el = e.target.closest('.sticky');
      if (!el || window.innerWidth < 720) return;
      cur = { el, x: e.clientX, y: e.clientY, tx: parseFloat(el.dataset.tx || 0), ty: parseFloat(el.dataset.ty || 0) };
      el.style.zIndex = String(++z);
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    const move = (e) => {
      if (!cur) return;
      const tx = cur.tx + e.clientX - cur.x;
      const ty = cur.ty + e.clientY - cur.y;
      cur.el.dataset.tx = tx;
      cur.el.dataset.ty = ty;
      cur.el.style.translate = `${tx}px ${ty}px`;
    };
    const up = () => { cur = null; };
    root.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      root.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <section className="story" id="story" aria-label="How I got here" ref={track}>
      <div className="story-pin">
        <Floaters set="story" />
        <div className="wrap">
          <p className="kicker" data-rv><Icon n="star" size={16} />How I got here</p>
          <div className="tell-box" ref={box}>
            <p className="tell" ref={tell} data-rv>
              I started out as a <span className="hl b-sky">national-level shooter</span>, learning to stay calm and repeat one small motion perfectly.
              Then I got hooked on <span className="hl b-sun">how things get built.</span> So I taught myself to code, and
              I&rsquo;ve been <span className="hl b-coral">shipping real products</span> ever since, from hotel networks to <span className="hl b-lilac">a startup&rsquo;s whole platform.</span>
            </p>
            <svg className="doodles" ref={svg} aria-hidden="true" focusable="false" />
            {NOTE_STICKIES.map((s, i) => (
              <div
                key={i}
                className="sticky"
                ref={(el) => { stickies.current[i] = el; }}
                {...(scrub ? {} : { 'data-rv': '' })}
                style={{ ['--sc']: s.sc, ['--r']: `${s.r}deg`, transitionDelay: scrub ? '0s' : `${0.15 + i * 0.18}s`, ...s.pos }}
              >
                {s.text}<small>{s.small}</small>
              </div>
            ))}
            <p className="move-hint" data-rv>these notes move ;)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
