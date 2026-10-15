import React, { useRef, useState } from 'react';
import { STACK } from './data';
import { clamp, range, ss, backOut, useTrack, useScrub } from './hooks';
import Icon from './Icon';

const mark = (n) => n.replace(/[^A-Za-z+]/g, '').slice(0, 2);

// Wide screens: a gift box that shakes, throws its lid and bursts the tools out into a grid as you scroll.
// Under 900px wide, or with reduced motion: the tools are simply laid out in a grid.

function Gift({ lidRef, glowRef }) {
  return (
    <svg className="gs-svg" viewBox="0 0 300 270" width="300" height="270" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="gsGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFF6C2" stopOpacity="1" />
          <stop offset="1" stopColor="#FFC93C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gsBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--gift-hi)" />
          <stop offset="1" stopColor="var(--gift)" />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="258" rx="128" ry="11" fill="var(--ink)" opacity=".16" />
      {/* inside of the box, behind the front wall */}
      <ellipse cx="150" cy="104" rx="116" ry="14" fill="var(--gift-in)" />
      <ellipse ref={glowRef} className="gs-glow" cx="150" cy="100" rx="120" ry="62" fill="url(#gsGlow)" />
      {/* body */}
      <path d="M34 104 H266 L258 252 H42Z" fill="url(#gsBody)" />
      <path d="M34 104 H266 L264 128 Q150 142 36 128Z" fill="#000" opacity=".1" />
      <path d="M126 104 H174 V252 H126Z" fill="var(--ribbon)" />
      <path d="M126 104 H138 V252 H126Z" fill="#fff" opacity=".28" />
      {/* lid, with its bow */}
      <g ref={lidRef} className="gs-lid">
        <rect x="16" y="62" width="268" height="46" rx="10" fill="var(--gift-lid)" />
        <rect x="16" y="62" width="268" height="12" rx="6" fill="#fff" opacity=".22" />
        <rect x="124" y="62" width="52" height="46" fill="var(--ribbon)" />
        <path d="M150 62 C 100 20 70 30 84 56 C 96 70 134 66 150 62Z" fill="var(--ribbon)" />
        <path d="M150 62 C 200 20 230 30 216 56 C 204 70 166 66 150 62Z" fill="var(--ribbon)" />
        <path d="M150 62 C 120 38 98 40 100 54 C 108 62 134 62 150 62Z" fill="#000" opacity=".12" />
        <circle cx="150" cy="62" r="13" fill="var(--ribbon)" stroke="var(--gift-lid)" strokeWidth="3" />
      </g>
    </svg>
  );
}

function Burst() {
  const ref = useRef(null);
  const track = useRef(null);
  const [sel, setSel] = useState(null);
  const gs = useRef(null);
  const lid = useRef(null);
  const gift = useRef(null);
  const glow = useRef(null);
  const beam = useRef(null);
  const head = useRef(null);
  const cap = useRef(null);
  const tools = useRef([]);
  const geo = useRef(null);
  const tip = useRef(null);

  const layout = (vw, vh) => {
    const hb = head.current ? head.current.offsetTop + head.current.offsetHeight : 200;
    const mouthY = vh - 252;
    const COLS = vw < 1100 ? 6 : 9;
    const rows = Math.ceil(STACK.length / COLS);
    const gridTop = hb + 26;
    const room = mouthY - 70 - gridTop;
    const PY = Math.max(66, Math.min(112, room / rows));
    const PX = Math.min(112, (vw - 80) / COLS);
    const TS = Math.min(1, PY / 104);
    geo.current = { mouthY, COLS, rows, gridTop, PX, PY, TS, vw };
    return geo.current;
  };
  const pos = (g, i) => {
    const n = STACK.length;
    const r = Math.floor(i / g.COLS);
    const inRow = r < g.rows - 1 ? g.COLS : n - g.COLS * (g.rows - 1);
    const c = i % g.COLS;
    return [(c - (inRow - 1) / 2) * g.PX, g.gridTop + r * g.PY + g.PY / 2 - g.mouthY];
  };

  useTrack(track, (p, dt, vh) => {
    const vw = window.innerWidth;
    const g = layout(vw, vh);
    gs.current.style.top = `${g.mouthY}px`;
    const rise = ss(range(p, 0, 0.07));
    const shake = range(p, 0.05, 0.2);
    const open = ss(range(p, 0.19, 0.29));
    const amp = shake * (1 - open) * 3.4;
    gift.current.style.transform = `translate3d(0,${((1 - rise) * vh * 0.1 - Math.abs(Math.sin(p * 150)) * amp * 1.4).toFixed(1)}px,0) rotate(${(Math.sin(p * 210) * amp).toFixed(2)}deg) scale(${(0.88 + 0.12 * rise).toFixed(3)})`;
    const fall = ss(range(p, 0.29, 0.42));
    lid.current.style.transform = `translate(${(open * 120).toFixed(1)}px,${(-open * 150 + Math.sin(open * Math.PI) * -36 + fall * 330).toFixed(1)}px) rotate(${(open * 26 + fall * 18).toFixed(1)}deg)`;
    lid.current.style.opacity = String(1 - ss(range(p, 0.36, 0.44)));
    glow.current.style.opacity = String(open * (1 - 0.5 * ss(range(p, 0.6, 0.9))));
    beam.current.style.opacity = String(open * 0.7 * (1 - ss(range(p, 0.55, 0.85))));
    cap.current.style.opacity = String(1 - ss(range(p, 0.2, 0.3)));
    STACK.forEach((_, i) => {
      const el = tools.current[i];
      if (!el) return;
      const s0 = 0.3 + i * 0.03;
      const f = ss(range(p, s0, s0 + 0.12));
      const [tx, ty] = pos(g, i);
      const u = 1 - f;
      const cx = tx * 0.2;
      const cy = ty - 90;
      const x = 2 * u * f * cx + f * f * tx;
      const y = u * u * -20 + 2 * u * f * cy + f * f * ty;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${((0.2 + 0.8 * backOut(f > 1 ? 1 : f)) * g.TS).toFixed(3)}) rotate(${(u * (tx < 0 ? -40 : 40)).toFixed(1)}deg)`;
      el.style.opacity = f > 0 ? String(Math.min(1, f * 5)) : '0';
      el.style.pointerEvents = f > 0.98 ? 'auto' : 'none';
    });
    const out = ss(range(p, 0.94, 1));
    head.current.style.opacity = String(1 - out * 0.4);
  }, { damp: 7 });

  const onSel = (i) => {
    setSel(i);
  };
  const t = sel != null ? STACK[sel] : null;
  let tipStyle = null;
  if (t && geo.current) {
    const g = geo.current;
    const [px, py] = pos(g, sel);
    const w = 290;
    const out = px >= 0 ? 1 : -1;
    let tx = px + out * (g.PX * 0.5 * g.TS + 20 + w / 2);
    if (Math.abs(tx) + w / 2 > g.vw / 2 - 12) tx = px - out * (g.PX * 0.5 * g.TS + 20 + w / 2);
    if (Math.abs(tx) + w / 2 > g.vw / 2 - 12) tx = clamp(tx, -g.vw / 2 + w / 2 + 12, g.vw / 2 - w / 2 - 12);
    tipStyle = { left: `${tx.toFixed(0)}px`, top: `${py.toFixed(0)}px`, ['--tc']: t.c };
  }

  return (
    <div className="stack-track" ref={track} onMouseLeave={() => setSel(null)}>
      <div className="stack-pin" ref={ref}>
        <div className="wrap stack-head" ref={head}>
          <div className="sec-head" data-rv>
            <p className="kicker"><Icon n="gear" size={16} />My stack</p>
            <h2>Everything I know, <span className="hl b-sun">unwrapped.</span></h2>
            <p>{STACK.length} tools I use. Hover or tap one to see what I do with it.</p>
          </div>
        </div>
        <div className="gift-stage" ref={gs}>
          <div className="gs-beam" ref={beam} aria-hidden="true" />
          <div className="gs-gift" ref={gift}><Gift lidRef={lid} glowRef={glow} /></div>
          <p className="gs-cap" ref={cap}>scroll to unwrap</p>
          <ul className="gs-ring" role="list">
            {STACK.map((s, i) => (
              <li key={s.n}>
                <button
                  type="button"
                  className={`gt ${sel === i ? 'on' : ''}`}
                  ref={(el) => { tools.current[i] = el; }}
                  style={{ ['--tc']: s.c, opacity: 0 }}
                  onMouseEnter={() => onSel(i)}
                  onFocus={() => onSel(i)}
                  onBlur={() => setSel(null)}
                  onClick={() => onSel(sel === i ? null : i)}
                  aria-pressed={sel === i}
                  aria-label={`${s.n}: ${s.p}`}
                >
                  <span className="gt-i">{mark(s.n)}</span>
                  <span className="gt-n">{s.n}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className={`gs-tip ${t ? 'in' : ''}`} role="status" style={tipStyle || undefined}>
            {t && (
              <>
                <div className="tt-h"><span className="tt-i">{mark(t.n)}</span><div><b>{t.n}</b><span>{t.cat}</span></div></div>
                <p>{t.p}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toolbox() {
  const [sel, setSel] = useState(null);
  const t = sel != null ? STACK[sel] : null;
  return (
    <div className="wrap">
      <div className="sec-head" data-rv>
        <p className="kicker"><Icon n="gear" size={16} />My stack</p>
        <h2>Everything I know, <span className="hl b-sun">unwrapped.</span></h2>
        <p>{STACK.length} tools I use. Hover or tap one to see what I do with it.</p>
      </div>

      <div className="toolbox" data-rv onMouseLeave={() => setSel(null)}>
        <ul className="tools" role="list">
          {STACK.map((s, i) => (
            <li key={s.n}>
              <button
                type="button"
                className={`tool ${sel === i ? 'on' : ''}`}
                style={{ ['--tc']: s.c, ['--i']: i }}
                onMouseEnter={() => setSel(i)}
                onFocus={() => setSel(i)}
                onClick={() => setSel(sel === i ? null : i)}
                aria-pressed={sel === i}
              >
                <span className="tool-i">{mark(s.n)}</span>
                <span className="tool-n">{s.n}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="tool-tip" role="status" style={t ? { ['--tc']: t.c } : undefined}>
          {t ? (
            <>
              <div className="tt-h"><span className="tt-i">{mark(t.n)}</span><div><b>{t.n}</b><span>{t.cat}</span></div></div>
              <p>{t.p}</p>
            </>
          ) : (
            <p className="tt-idle">My toolkit. <span>Hover</span> a tool to see what I do with it.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Stack() {
  const scrub = useScrub();
  return (
    <section className="stack torn" id="stack" aria-label="My stack">
      {scrub ? <Burst /> : <Toolbox />}
    </section>
  );
}
