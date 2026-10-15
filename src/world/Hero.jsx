import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PLACES, ME } from './data';
import { clamp, ss, range, useTrack, useScrub } from './hooks';
import { attachGaze, reactAvatar, idleGestures } from './avatarLife';
import { PaintedSky, PaintedClouds, PaintedFar, PaintedValley, PaintedPlace, PaintedFg, PaintedLife } from './Painted';
import {
  VB, pct, SkyLayer, CloudLayer, KitesLayer, FarLayer, HillLeftLayer, HillRightLayer, GhatLayer, RiverLayer,
  MUArt, ShiftsDealArt, InternsArt, BestowArt, RangeArt, LaptopArt, AppPhoneArt, MeArt, ForegroundLeft, ForegroundRight, ForegroundBottom, Birds,
} from './Scene';

const FOCAL = { x: 0.62, y: 0.58 }; // the point the scene flies into

// Pins sit above their place. x, y are in the 1600 x 900 scene space.
// The valley is painted (set PAINTED to false for the old hand-drawn SVG valley).
const PAINTED = true;
const PINS = PAINTED ? [
  { id: 'mu', x: 228, y: 322, tag: '2026', mark: 'MU' },
  { id: 'shiftsdeal', x: 470, y: 252, tag: 'Now', mark: 'SD' },
  { id: 'interns', x: 1120, y: 120, tag: '2025–26', mark: '25' },
  { id: 'bestow', x: 1442, y: 138, tag: 'Now', mark: 'B' },
  { id: 'range', x: 330, y: 742, tag: 'Past', mark: 'R' },
  { id: 'me', x: 1260, y: 212, tag: null, mark: 'L', face: true },
] : [
  { id: 'mu', x: 150, y: 506, tag: '2026', mark: 'MU' },
  { id: 'shiftsdeal', x: 850, y: 426, tag: 'Now', mark: 'SD' },
  { id: 'interns', x: 1124, y: 92, tag: '2025', mark: '25' },
  { id: 'bestow', x: 1379, y: 130, tag: '2026', mark: 'B' },
  { id: 'range', x: 1205, y: 466, tag: 'AIR 54', mark: 'R' },
  { id: 'me', x: 1396, y: 326, tag: null, mark: 'L', face: true },
];
const APP_AT = [748, 540]; // the phone beside the ShiftsDeal building (painted valley only)
const LAPTOP_AT =PAINTED ? [610, 800] : [1030, 640];
const LAPTOP_PIN = PAINTED ? [610, 746] : [1030, 586];

// Clickable area per place (scene space): x, y, w, h.
const HOT = PAINTED ? {
  mu: [103, 325, 250, 238],
  shiftsdeal: [305, 258, 330, 282],
  interns: [1079, 125, 82, 361],
  bestow: [1342, 141, 200, 175],
  range: [230, 746, 200, 116],
  me: [1217, 220, 84, 250],
} : {
  mu: [96, 374, 380, 296],
  shiftsdeal: [500, 330, 470, 400],
  interns: [1086, 100, 76, 372],
  bestow: [1272, 150, 214, 170],
  range: [1000, 480, 310, 160],
  me: [1374, 340, 134, 310],
};

const hotStyle = ([x, y, w, h]) => ({ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%`, width: `${(w / VB.w) * 100}%`, height: `${(h / VB.h) * 100}%` });

const LAYERS_PAINTED = [
  { id: 'sky', d: 0.02, keep: true, art: <PaintedSky /> },
  { id: 'clouds', d: 0.08, keep: true, art: <PaintedClouds /> },
  { id: 'far', d: 0.12, art: <PaintedFar /> },
  { id: 'valley', d: 0.22, art: <PaintedValley /> },
  { id: 'life', d: 0.23, art: <PaintedLife /> },
  { id: 'interns', d: 0.24, art: <PaintedPlace id="interns" />, place: 'interns' },
  { id: 'bestow', d: 0.25, art: <PaintedPlace id="bestow" />, place: 'bestow' },
  { id: 'mu', d: 0.26, art: <PaintedPlace id="mu" />, place: 'mu' },
  { id: 'shiftsdeal', d: 0.28, art: <PaintedPlace id="shiftsdeal" />, place: 'shiftsdeal' },
  { id: 'range', d: 0.3, art: <PaintedPlace id="range" />, place: 'range' },
  { id: 'me', d: 0.3, art: <MeArt />, place: 'me' },
  { id: 'fgL', d: 0.85, fg: true, art: <PaintedFg side="l" /> },
  { id: 'fgR', d: 0.9, fg: true, art: <PaintedFg side="r" /> },
];

const LAYERS_SVG = [
  { id: 'sky', d: 0.02, keep: true, art: <SkyLayer /> },
  { id: 'kites', d: 0.05, keep: true, art: <KitesLayer /> },
  { id: 'clouds', d: 0.08, keep: true, art: <CloudLayer /> },
  { id: 'far', d: 0.12, art: <FarLayer /> },
  { id: 'hillL', d: 0.16, art: <HillLeftLayer /> },
  { id: 'hillR', d: 0.2, art: <HillRightLayer /> },
  { id: 'ghat', d: 0.24, art: <GhatLayer /> },
  { id: 'interns', d: 0.22, art: <InternsArt />, place: 'interns' },
  { id: 'bestow', d: 0.26, art: <BestowArt />, place: 'bestow' },
  { id: 'mu', d: 0.3, art: <MUArt />, place: 'mu' },
  { id: 'range', d: 0.32, art: <RangeArt />, place: 'range' },
  { id: 'river', d: 0.34, art: <RiverLayer /> },
  { id: 'shiftsdeal', d: 0.4, art: <ShiftsDealArt />, place: 'shiftsdeal' },
  { id: 'fgL', d: 0.85, fg: true, art: <ForegroundLeft /> },
  { id: 'fgR', d: 0.9, fg: true, art: <ForegroundRight /> },
  { id: 'me', d: 0.95, art: <MeArt />, place: 'me' },
  { id: 'fgB', d: 1, fg: true, art: <ForegroundBottom /> },
];
const LAYERS = PAINTED ? LAYERS_PAINTED : LAYERS_SVG;

// A bank of overlapping puffs (circles), so the paper rises behind real-looking clouds. Original shapes.
function CloudBank({ seed, front = false }) {
  const puffs = useMemo(() => {
    let a = seed;
    const r = () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
    return Array.from({ length: 22 }, (_, i) => ({ x: -40 + i * 78 + r() * 40, y: 150 - r() * (front ? 70 : 100), r: 70 + r() * (front ? 70 : 90) }));
  }, [seed, front]);
  return (
    <svg viewBox="0 0 1600 520" preserveAspectRatio="none" focusable="false">
      <g className={front ? 'cb-f' : 'cb-b'}>
        {puffs.map((c, i) => <circle key={i} cx={c.x} cy={c.y + 120} r={c.r} />)}
        <rect x="-60" y="260" width="1720" height="300" />
      </g>
    </svg>
  );
}

function Pin({ p, focusId, onPick, hint }) {
  const pl = PLACES[p.id];
  return (
    <button
      type="button"
      className={`pin ${focusId === p.id ? 'on' : ''}`}
      data-id={p.id}
      style={{ ...pct(p.x, p.y), ['--c']: pl.c }}
      onClick={(e) => { e.stopPropagation(); onPick(p.id); }}
      aria-label={`${pl.t}: ${pl.r}`}
    >
      {hint && <span className="hint" aria-hidden="true">click a place</span>}
      <b>
        <span className={`pmark ${p.face ? 'face' : ''}`}>{p.face ? <img src="/me.webp" alt="" /> : p.mark}</span>
        {p.id === 'me' ? 'That’s me' : pl.t}
        {p.tag && <small className="pyr">{p.tag}</small>}
      </b>
      <i className="pd" aria-hidden="true" />
    </button>
  );
}

function Sheet({ id, onClose }) {
  const pl = id ? PLACES[id] : null;
  const [tab, setTab] = useState(0);
  useEffect(() => setTab(0), [id]);
  return (
    <aside className={`sheet ${pl ? 'open' : ''} ${pl ? `side-${pl.side}` : ''}`} aria-live="polite" data-lenis-prevent style={pl ? { ['--c']: pl.c } : undefined}>
      {pl && (
        <>
          <div className="sh-top">
            <span className="tag">{pl.tag}</span>
            <button type="button" className="x" onClick={onClose} aria-label="Close">&times;</button>
          </div>
          <h2>{pl.t}</h2>
          <p className="role">{pl.r}</p>
          <p className="lead">{pl.h}</p>
          <div className="did">{pl.story.map((s, i) => <p key={i} dangerouslySetInnerHTML={{ __html: s }} />)}</div>
          {pl.fun && (
            <div className="s-fun">
              <div className="fun-tabs" role="tablist">
                {pl.fun.map(([name, c], i) => (
                  <button key={name} type="button" role="tab" aria-selected={tab === i} className={tab === i ? 'on' : ''} style={{ ['--tc']: c }} onClick={() => setTab(i)}>{name}</button>
                ))}
              </div>
              <ul className="fun-list" style={{ ['--tc']: pl.fun[tab][1] }}>
                {pl.fun[tab][2].map(([a, b]) => <li key={a}><b>{a}</b><span>{b}</span></li>)}
              </ul>
            </div>
          )}
          <ul className="nums">
            {pl.nums.map(([n, l]) => <li key={l}><b>{n}</b><span>{l}</span></li>)}
          </ul>
          {pl.links.length > 0 && (
            <div className="row">
              {pl.links.map(([label, href]) => (
                <a key={label} className="s-link" href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{label}</a>
              ))}
            </div>
          )}
        </>
      )}
    </aside>
  );
}

export default function Hero({ music, onMusic, goJourney }) {
  const valley = useRef(null);
  const stage = useRef(null);
  const cam = useRef(null);
  const scene = useRef(null);
  const copy = useRef(null);
  const cue = useRef(null);
  const cloudA = useRef(null);
  const cloudB = useRef(null);
  const haze = useRef(null);
  const scrub = useScrub();
  const layers = useRef({});
  const geo = useRef({ SW: 0, SH: 0, ox: 0, oy: 0, vw: 0, vh: 0 });
  const [focusId, setFocus] = useState(null);
  const [ready, setReady] = useState(false);
  const pan = useRef({ ax: typeof window !== 'undefined' && window.innerWidth < 720 ? 0.74 : 0.52, drag: null });
  const reduced = useRef(!scrub);

  const layout = useCallback(() => {
    const st = stage.current;
    if (!st) return;
    const vw = st.clientWidth;
    const vh = st.clientHeight;
    const k = Math.max(vw / VB.w, vh / VB.h);
    const SW = VB.w * k;
    const SH = VB.h * k;
    const ox = (vw - SW) * (SW > vw + 2 ? pan.current.ax : 0.5);
    const oy = (vh - SH) * 0.5;
    geo.current = { SW, SH, ox, oy, vw, vh };
    const sc = scene.current;
    sc.style.width = `${SW}px`;
    sc.style.height = `${SH}px`;
    sc.style.left = `${ox}px`;
    sc.style.top = `${oy}px`;
  }, []);

  const applyFocus = useCallback((id) => {
    const c = cam.current;
    const { SW, SH, ox, oy, vw, vh } = geo.current;
    if (!id) {
      c.style.transform = 'translate3d(0,0,0) scale(1)';
      return;
    }
    const pl = PLACES[id];
    const hot = HOT[id];
    const cx = ((hot[0] + hot[2] / 2) / VB.w) * SW;
    const cy = ((hot[1] + hot[3] / 2) / VB.h) * SH;
    const narrow = vw < 860;
    const s = narrow ? 1.5 : id === 'me' ? 2.1 : id === 'interns' ? 1.7 : 1.85;
    const tx = vw * (narrow ? 0.5 : pl.side === 'left' ? 0.7 : 0.3);
    const ty = vh * (narrow ? 0.36 : 0.52);
    let X = tx - s * (ox + cx);
    let Y = ty - s * (oy + cy);
    X = clamp(X, vw - s * (ox + SW), -s * ox);
    Y = clamp(Y, vh - s * (oy + SH), -s * oy);
    c.style.transform = `translate3d(${X}px,${Y}px,0) scale(${s})`;
  }, []);

  const pick = useCallback((id) => {
    // he reacts when you open him: a nod, a hop, a curious tilt, a look up, in turn
    if (id === 'me' && focusRef.current !== 'me') reactAvatar(layers.current.me?.querySelector('.a3'));
    setFocus((cur) => (cur === id ? null : id));
  }, []);

  // his head follows the pointer
  useEffect(() => {
    const a = layers.current.me?.querySelector('.a3');
    const offs = [attachGaze(a), idleGestures(a)];
    return () => offs.forEach((f) => f());
  }, []);

  useEffect(() => { applyFocus(focusId); }, [focusId, applyFocus]);

  // Scroll: fly into the valley. `p` is eased, so the camera glides. Every layer grows around the focal point
  // by depth (far hills barely move, near art rushes at you), the foreground flies past and fades, the pins
  // let go, and cloud banks rise ahead of the paper that slides up over the valley.
  const frame = useCallback((p, dt, vh) => {
    const v = valley.current;
    if (!v) return;
    const e = ss(range(p, 0, 0.92));
    Object.entries(layers.current).forEach(([, el]) => {
      if (!el) return;
      const d = +el.dataset.d;
      const fg = el.dataset.fg === '1';
      const s = 1 + e * (0.08 + Math.pow(d, 1.15) * 1.9);
      const ty = e * d * d * vh * 0.1;
      el.style.transform = `translate3d(0,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
      if (fg) el.style.opacity = String(1 - range(p, 0.16, 0.46));
    });
    const c = range(p, 0.02, 0.3);
    if (copy.current) {
      copy.current.style.transform = `translate3d(0,${(-c * vh * 0.34).toFixed(1)}px,0)`;
      copy.current.style.opacity = String(1 - c * 1.15);
    }
    if (cue.current) cue.current.style.opacity = String(1 - range(p, 0, 0.05));
    if (haze.current) haze.current.style.opacity = String(range(p, 0.25, 0.75));
    const story = document.getElementById('story');
    if (story && cloudA.current && cloudB.current) {
      const top = story.getBoundingClientRect().top;
      const on = top < vh * 1.05 && top > -vh * 0.4;
      cloudA.current.style.opacity = on ? '1' : '0';
      cloudB.current.style.opacity = on ? '1' : '0';
      if (on) {
        const q = 1 - clamp(top / vh);
        cloudA.current.style.transform = `translate3d(${(-q * 90).toFixed(1)}px,${(top - vh * 0.3).toFixed(1)}px,0) scale(${(1 + q * 0.12).toFixed(3)})`;
        cloudB.current.style.transform = `translate3d(${(q * 120).toFixed(1)}px,${(top - vh * 0.1).toFixed(1)}px,0) scale(${(1.06 + q * 0.16).toFixed(3)})`;
      }
    }
    const st = stage.current;
    if (st) st.classList.toggle('flying', p > 0.02);
    if (p > 0.02 && focusRef.current) setFocus(null);
  }, []);

  const focusRef = useRef(null);
  focusRef.current = focusId;

  useTrack(valley, frame, { damp: 6, enabled: scrub });

  useEffect(() => {
    layout();
    applyFocus(null);
    const onResize = () => { layout(); applyFocus(focusRef.current); };
    window.addEventListener('resize', onResize);
    const t = setTimeout(() => setReady(true), 60);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
  }, [layout, applyFocus]);

  // Escape closes the sheet.
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') setFocus(null); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  // Touch: drag the valley sideways when it is wider than the screen.
  const onDown = (e) => {
    if (e.pointerType === 'mouse' || focusRef.current) return;
    const { SW, vw } = geo.current;
    if (SW <= vw + 2) return;
    pan.current.drag = { x: e.clientX, ax: pan.current.ax };
  };
  const onMove = (e) => {
    const dr = pan.current.drag;
    if (!dr) return;
    const { SW, vw } = geo.current;
    pan.current.ax = clamp(dr.ax - (e.clientX - dr.x) / Math.max(1, SW - vw));
    layout();
  };
  const onUp = () => { pan.current.drag = null; };

  // Mouse parallax: a gentle drift of the whole scene with the pointer.
  const onPointer = (e) => {
    if (e.pointerType !== 'mouse' || reduced.current || focusRef.current) return;
    const { vw, vh } = geo.current;
    const nx = e.clientX / vw - 0.5;
    const ny = e.clientY / vh - 0.5;
    stage.current.style.setProperty('--mx', `${(nx * -46).toFixed(1)}px`);
    stage.current.style.setProperty('--my', `${(ny * -26).toFixed(1)}px`);
  };

  return (
    <section className="valley" id="top" ref={valley} aria-label="The valley">
      <div className={`stage ${PAINTED ? 'painted' : ''} ${ready ? 'ready' : ''} ${focusId ? 'focused' : ''}`} ref={stage}
        onPointerDown={onDown} onPointerMove={(e) => { onMove(e); onPointer(e); }} onPointerUp={onUp} onPointerCancel={onUp}
        onClick={(e) => { if (focusId && !e.target.closest('.hot, .pin, .sheet')) setFocus(null); }}>
        <div className="cam" ref={cam}>
          <div className="scene" ref={scene}>
            {LAYERS.map((L) => (
              <div
                key={L.id}
                className={`ly ${L.keep ? 'keep' : ''}`}
                data-d={L.d}
                data-fg={L.fg ? '1' : '0'}
                ref={(el) => { layers.current[L.id] = el; }}
                style={{ transformOrigin: `${FOCAL.x * 100}% ${FOCAL.y * 100}%`, ['--i']: LAYERS.indexOf(L), ['--dk']: L.d }}
              >
                {L.art}
                {L.id === 'range' && null}
                {L.place && (
                  <button type="button" className="hot" aria-label={`${PLACES[L.place].t}, ${PLACES[L.place].r}`} style={hotStyle(HOT[L.place])} onClick={(e) => { e.stopPropagation(); pick(L.place); }} />
                )}
                {PINS.filter((p) => p.id === L.place).map((p) => (
                  <Pin key={p.id} p={p} focusId={focusId} onPick={pick} hint={p.id === 'shiftsdeal' && !focusId} />
                ))}
              </div>
            ))}
            {PAINTED && <div className="ly app-ly"data-d="0.29" data-fg="0" ref={(el) => { layers.current.app = el; }} style={{ transformOrigin: `${FOCAL.x * 100}% ${FOCAL.y * 100}%`, ['--dk']: 0.29 }}>
              <AppPhoneArt at={APP_AT} />
              <button type="button" className="pin" style={{ ...pct(APP_AT[0], APP_AT[1] - 86), ['--c']: '#E8505B' }} onClick={(e) => { e.stopPropagation(); pick('shiftsdeal'); }} aria-label="ShiftsDeal app, in progress">
                <b>
                  <span className="pmark ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>
                  </span>
                  Building the app
                  <small className="pyr">Now</small>
                </b>
                <i className="pd" aria-hidden="true" />
              </button>
            </div>}
            <div className="ly laptop-ly" data-d="0.34" data-fg="0" ref={(el) => { layers.current.laptop = el; }} style={{ transformOrigin: `${FOCAL.x * 100}% ${FOCAL.y * 100}%`, ['--dk']: 0.34 }}>
              <LaptopArt playing={music} at={LAPTOP_AT} />
              <button type="button" className={`pin rpin ${music ? 'playing' : ''}`} style={{ ...pct(LAPTOP_PIN[0], LAPTOP_PIN[1]), ['--c']: '#8E7CFF' }} aria-pressed={music} onClick={(e) => { e.stopPropagation(); onMusic(); }}>
                <b>
                  <span className="pmark ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.6" /><circle cx="16.5" cy="16" r="2.6" /></svg>
                  </span>
                  {music ? 'Pause the music' : 'Play some music'}
                  <span className="eq" aria-hidden="true"><i /><i /><i /></span>
                </b>
                <i className="pd" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <Birds />
        <Birds cls="b2" />
        <div className="sky-plane" aria-hidden="true">
          <div className="sp-in">
            <div className="sp-ban">
              <svg viewBox="0 0 60 40" width="46" height="30"><path d="M2 20 L58 4 L58 36Z" fill="var(--sun-c)" opacity=".9" /></svg>
              <div className="sp-flag"><span>Welcome to my world</span></div>
            </div>
            <svg viewBox="0 0 90 44" width="86" height="42" className="sp-body">
              <path d="M6 24 L66 18 Q82 18 86 24 Q82 30 66 30 L6 28Z" fill="#fff" stroke="var(--ink)" strokeWidth="2" />
              <path d="M34 20 L52 4 L58 6 L48 20Z" fill="var(--rose-c)" stroke="var(--ink)" strokeWidth="2" />
              <path d="M10 24 L2 10 L10 12Z" fill="var(--rose-c)" stroke="var(--ink)" strokeWidth="2" />
              <circle cx="66" cy="23" r="3" fill="var(--ink)" />
            </svg>
          </div>
        </div>

        <div className="hero-copy" ref={copy}>
          <p className="hey">hey, {ME.first} here</p>
          <h1>
            <span className="ln"><span>Building things so</span></span>
            <span className="ln" style={{ ['--dl']: '1.9s' }}><span>ideas actually <span className="rq">ship.</span></span></span>
          </h1>
          <p className="sub">Full-stack developer, 18. Tech Head at ShiftsDeal, <span className="br">studying Data Science &amp; AI at Masters&rsquo; Union.</span></p>
        </div>

        <div className="scroll-cue" ref={cue}><i />scroll to fly in</div>

        <Sheet id={focusId} onClose={() => setFocus(null)} />

        <div className="night" aria-hidden="true"><i /></div>
        <div className="shade" aria-hidden="true" />
        <div className="rays" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <div className="haze" ref={haze} aria-hidden="true" />
        <div className="cloudbank cb-a" ref={cloudA} aria-hidden="true"><CloudBank seed={3} /></div>
        <div className="cloudbank cb-b" ref={cloudB} aria-hidden="true"><CloudBank seed={11} front /></div>
      </div>
    </section>
  );
}
