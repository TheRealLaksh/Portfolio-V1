import React from 'react';
import { VB } from './Scene';
import './painted.css';

// The painted valley: hand-painted illustrations (generated with Figma's image models, then cut out and cleaned
// up) laid out in the same 1600 x 900 scene space as the old SVG art, so the fly-in, pins and hot zones all keep
// working. Painted layers are plain images; the little living things (boats, glints, fish, walkers) stay SVG.
// Night is the same pictures run through a CSS filter plus a painted night sky, so one set of art does both.

const A = '/art';
const u = (x, y) => ({ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` });

// A sprite stands on `base` (scene y) with its centre at `cx`; w is its width in scene units, ratio = natural w / h.
function Sprite({ src, cx, base, w, ratio, className = '', glows }) {
  const h = w / ratio;
  return (
    <div className={`pt-sprite ${className}`} style={{ left: `${((cx - w / 2) / VB.w) * 100}%`, top: `${((base - h) / VB.h) * 100}%`, width: `${(w / VB.w) * 100}%`, height: `${(h / VB.h) * 100}%` }}>
      <img className="pt-img" src={`${A}/${src}.webp`} alt="" draggable="false" />
      {glows && glows.map(([gx, gy, gr], i) => <i key={i} className="pt-glow" style={{ left: `${gx}%`, top: `${gy}%`, width: `${gr}%`, paddingBottom: `${gr * ratio}%` }} />)}
    </div>
  );
}

export function PaintedSky() {
  return (
    <div className="art pt-full">
      <img className="pt-img pt-sky-day" src={`${A}/sky-day.webp`} alt="" draggable="false" />
      <img className="pt-sky-night" src={`${A}/sky-night.webp`} alt="" draggable="false" />
      <svg className="art" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <g className="shoots">
          <path className="shoot" d="M0 0 L-130 -26" stroke="#FFF8E1" strokeWidth="3" strokeLinecap="round" transform="translate(560 120)" />
          <path className="shoot s2" d="M0 0 L-110 -20" stroke="#FFF8E1" strokeWidth="2.6" strokeLinecap="round" transform="translate(1240 60)" />
        </g>
      </svg>
    </div>
  );
}

// Five painted clouds that drift slowly across the sky.
const CLOUDS = [
  ['cloud-1', 60, 70, 360, 478 / 259, 150], ['cloud-3', 880, 40, 300, 523 / 283, 190], ['cloud-4', 1260, 150, 330, 522 / 199, 120], ['cloud-2', 520, 250, 230, 334 / 154, 170], ['cloud-5', 1000, 280, 220, 366 / 182, 210],
];
export function PaintedClouds() {
  return (
    <div className="art pt-full">
      {CLOUDS.map(([src, x, y, w, ratio, dur], i) => (
        <div key={src} className="pt-cloud" style={{ ...u(x, y), width: `${(w / VB.w) * 100}%`, animationDuration: `${dur}s`, animationDelay: `${-i * 31}s` }}>
          <img className="pt-img" src={`${A}/${src}.webp`} alt="" draggable="false" style={{ aspectRatio: String(ratio) }} />
        </div>
      ))}
    </div>
  );
}

export function PaintedFar() {
  // the skyline strip is squashed a little so it reads as far away, and fades out at the bottom
  return (
    <div className="art pt-full">
      <img className="pt-img pt-far" src={`${A}/far.webp`} alt="" draggable="false" style={{ left: 0, top: `${(262 / VB.h) * 100}%`, width: '100%', height: `${(120 / VB.h) * 100}%` }} />
    </div>
  );
}

export function PaintedValley() {
  return (
    <div className="art pt-full">
      <img className="pt-img pt-valley" src={`${A}/valley.webp`} alt="" draggable="false" />
    </div>
  );
}

// Places. Each stands at (cx, base) at width w.
export const SPOTS = {
  mu: { src: 'mu', cx: 228, base: 562, w: 250, ratio: 802 / 759, glows: [[50, 52, 30], [24, 70, 14], [78, 70, 14]] },
  shiftsdeal: { src: 'shifts', cx: 485, base: 540, w: 330, ratio: 819 / 698, glows: [[50, 55, 40], [20, 78, 14], [80, 78, 14]] },
  interns: { src: 'tower', cx: 1120, base: 486, w: 82, ratio: 239 / 1056, glows: [[50, 38, 70]] },
  bestow: { src: 'bestow', cx: 1442, base: 316, w: 200, ratio: 707 / 617, glows: [[38, 62, 34]] },
  range: { src: 'range', cx: 330, base: 862, w: 200, ratio: 900 / 521, glows: [[33, 55, 22], [76, 55, 22]] },
};

export function PaintedPlace({ id }) {
  const s = SPOTS[id];
  return (
    <div className="art pt-full">
      {id === 'shiftsdeal' && <Sprite src="quay" cx={s.cx} base={s.base + 22} w={s.w * 1.32} ratio={900 / 130} className="pt-quay" />}
      <Sprite {...s} className={`pt-${id}`} />
    </div>
  );
}

export function PaintedFg({ side }) {
  return (
    <div className="art pt-full">
      {side === 'l'
        ? <Sprite src="fg-left" cx={150} base={906} w={300} ratio={591 / 587} className="pt-fg" />
        : <Sprite src="fg-right" cx={1440} base={906} w={330} ratio={572 / 517} className="pt-fg" />}
    </div>
  );
}

// Things that live on the painted water and steps: boats, glints, a jumping fish, diyas at night, and people on the ghat.
function Boat({ x, y, s = 1, flip = false, cls = '' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className={`sailing ${cls}`}>
        <g className="boat">
          <path className="wood" d="M-52 0 L52 0 L38 18 L-38 18Z" />
          <path className="hull-hi" d="M-52 0 L52 0 L48 5 L-48 5Z" />
          <rect className="wood" x="-2" y="-58" width="4" height="58" />
          <path className="sail" d="M2 -54 L36 -8 L2 -8Z" />
          <circle className="lamp" cx="-34" cy="-8" r="5" />
        </g>
      </g>
    </g>
  );
}

function Walker({ x, y, dx, dy, c, dur, delay, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="walker" style={{ ['--dx']: `${dx / s}px`, ['--dy']: `${dy / s}px`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <ellipse cx="0" cy="1" rx="9" ry="2.6" fill="rgba(0,0,0,.18)" />
        <path className="leg lg1" d="M-2 -16 L-2 0" stroke="#3a2a2a" strokeWidth="3.4" strokeLinecap="round" />
        <path className="leg lg2" d="M2 -16 L2 0" stroke="#3a2a2a" strokeWidth="3.4" strokeLinecap="round" />
        <rect x="-6" y="-36" width="12" height="22" rx="5" fill={c} />
        <circle cx="0" cy="-43" r="6" fill="#E3A87A" />
        <path d="M-6 -45 a6 6 0 0 1 12 0 q-6 -4 -12 0Z" fill="#2B2230" />
      </g>
    </g>
  );
}

const GLINTS = [[330, 640], [470, 600], [640, 590], [800, 640], [980, 720], [1130, 700], [1250, 760], [1400, 740], [700, 700], [560, 690], [900, 800], [1180, 830], [760, 520], [840, 560]];
const FISH = [[620, 640, 0], [1280, 790, 3.2]];
const DIYAS = [[500, 690], [760, 720], [1010, 780], [1320, 770], [880, 840]];

export function PaintedLife() {
  return (
    <svg className="art" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {GLINTS.map(([x, y], i) => (
        <path key={i} className="glint" d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2Z" transform={`translate(${x} ${y})`} style={{ animationDelay: `${(i * 0.73) % 3.4}s` }} />
      ))}
      {FISH.map(([x, y, dl], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="fish" style={{ animationDelay: `${dl}s` }}>
            <path d="M-12 0 Q0 -9 12 0 Q0 7 -12 0Z M12 0 L20 -6 L20 6Z" fill="var(--teal-c)" />
            <circle cx="-6" cy="-1.5" r="1.4" fill="#fff" />
          </g>
          <ellipse className="splash" cx="12" cy="4" rx="14" ry="4" style={{ animationDelay: `${dl}s` }} />
        </g>
      ))}
      <Boat x={560} y={650} s={0.85} />
      <Boat x={1130} y={770} s={0.7} flip cls="s2" />
      {DIYAS.map(([x, y], i) => (
        <g key={i} className="diya" transform={`translate(${x} ${y})`}>
          <ellipse cx="0" cy="3" rx="11" ry="5" fill="#E88A1F" />
          <path d="M0 -10 q5 6 0 12 q-5 -6 0 -12Z" fill="#FFC93C" className="flame" />
        </g>
      ))}
      {/* people on the ghat steps */}
      <Walker x={930} y={622} dx={90} dy={-40} c="#FF8A1F" dur={26} delay={0} s={0.75} />
      <Walker x={1100} y={540} dx={80} dy={-34} c="#1FA6A0" dur={31} delay={-12} s={0.7} />
    </svg>
  );
}
