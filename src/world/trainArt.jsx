import React, { memo, useMemo } from 'react';

// Art for the train journey, in a 720-unit-tall SVG scene. The buildings, hills and train are painted (Figma image
// models, see scripts/art/journey.py and public/art/journey); the roundels, rails and a few details are still vector.
// Rail top is y = 578, the platform surface y = 538, a station is centred on x = stX(n).
export const STEP = 1300; // distance between stations
export const X0 = 700; // where station 0 sits
export const stX = (n) => X0 + n * STEP;
export const LOCAL0 = -1200; // layers start this far left of their own origin
export const RAIL_Y = 578;

const INK = '#1B1F3B';
const C = {
  cream: '#FFF4DC', stone: '#E9DFC8', brick: '#D98B6A', brick2: '#B9694A', saffron: '#F2A93B', sun: '#FFC93C',
  teal: '#1FA6A0', rose: '#E8505B', lilac: '#8E7CFF', green: '#7FB866', green2: '#4F9E4A', wood: '#7C5233',
  glass: '#FFE08A', blue: '#3E8EDB',
};

function rng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}


// Platform, roundel with the station number and year, drawn for every station.
function Platform({ n, year }) {
  return (
    <g>
      <defs>
        <linearGradient id={`pf${n}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#EADBC0" /><stop offset=".25" stopColor="#D9A98A" /><stop offset="1" stopColor="#B9694A" /></linearGradient>
      </defs>
      <rect x="-250" y="532" width="500" height="46" rx="3" fill={`url(#pf${n})`} stroke="#7A4A33" strokeOpacity=".55" strokeWidth="1.5" />
      <path d="M-244 534 H244" stroke="#FFF4DC" strokeWidth="3" opacity=".7" />
      <path d="M-210 552 H210 M-210 564 H210" stroke="#8A4F36" strokeWidth="1.5" opacity=".35" />
      <rect x="-297" y="404" width="6" height="128" rx="2" fill={INK} />
      <g className="roundel">
        <circle cx="-294" cy="396" r="26" fill="#fff" stroke={INK} strokeWidth="3.5" />
        <circle cx="-294" cy="396" r="18" fill={C.sun} stroke={INK} strokeWidth="2" />
        <text x="-294" y="403" textAnchor="middle" className="tn-num">{n + 1}</text>
        <rect x="-330" y="428" width="72" height="22" rx="11" fill={INK} />
        <text x="-294" y="443" textAnchor="middle" className="tn-yr">{year}</text>
      </g>
    </g>
  );
}

const ART = '/art/journey/';

// Painted stations. Each is one or more pictures standing on the platform (bottom at y = 538), centred on the
// station with a little room left for the roundel pole. They fade from grey to colour as the train arrives.
const PAINT = [
  [{ src: `${ART}school.webp`, w: 720, h: 338 }], // Coimbatore
  [{ src: `${ART}varanasi.webp`, w: 640, h: 381 }], // Varanasi
  [{ src: '/art/range.webp', w: 640, h: 370 }], // the range
  [{ src: `${ART}hotel.webp`, w: 490, h: 422 }], // Hotel Kavana
  [{ src: `${ART}campus.webp`, w: 620, h: 410 }], // internship season
  [{ src: `${ART}build.webp`, w: 320, h: 441 }], // building in public
  [{ src: '/art/mu.webp', w: 444, h: 420 }], // Masters' Union
  [{ src: '/art/shifts.webp', w: 470, h: 400, x: -110 }, { src: '/art/bestow.webp', w: 300, h: 262, x: 240 }], // ShiftsDeal and Bestow
];
const SHIFT = 50; // nudge right, away from the roundel pole

const Station = memo(function Station({ n, year, built }) {
  return (
    <g className={`st${built ? ' built' : ''}`} transform={`translate(${stX(n)} 0)`}>
      <g className="stbuild">
        {PAINT[n].map((p) => (
          <image key={p.src} href={p.src} x={SHIFT + (p.x || 0) - p.w / 2} y={538 - p.h} width={p.w} height={p.h} preserveAspectRatio="xMidYMax meet" />
        ))}
      </g>
      <Platform n={n} year={year} />
    </g>
  );
});

const STATIONS = PAINT;
/* ---------- layers ---------- */

const LAYER_W = stX(STATIONS.length - 1) + 1500 - LOCAL0;

// A painted strip repeated along the layer. The picture is mirrored end to end, so it tiles without a seam.
const strip = (src, W, top, h) => (
  <div aria-hidden="true" style={{ width: W, height: 720, backgroundImage: `url(${src})`, backgroundRepeat: 'repeat-x', backgroundSize: `auto ${h}px`, backgroundPosition: `0 ${top}px` }} />
);

export const FarLayer = memo(function FarLayer({ p }) {
  const W = (stX(STATIONS.length - 1) * p) + 3600 - LOCAL0;
  return strip(`${ART}far.webp`, W, 150, 420);
});

export const MidLayer = memo(function MidLayer({ p }) {
  const W = (stX(STATIONS.length - 1) * p) + 3600 - LOCAL0;
  return strip(`${ART}mid.webp`, W, 300, 300);
});

// The stations, the ground and the rails. `i` is the current stop: stations up to it are built.
export const NearLayer = memo(function NearLayer({ i, years }) {
  const sleepers = useMemo(() => {
    let d = '';
    for (let x = LOCAL0; x < LOCAL0 + LAYER_W; x += 30) d += `M${x} 590 h16 v7 h-16Z`;
    return d;
  }, []);
  const endX = stX(STATIONS.length - 1) + 440;
  return (
    <svg width={LAYER_W} height="1100" viewBox={`${LOCAL0} 0 ${LAYER_W} 1100`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gr-top" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9DC77C" /><stop offset="1" stopColor="#B6D68A" /></linearGradient>
        <linearGradient id="gr-low" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#A5CD7E" /><stop offset=".35" stopColor="#8DBB68" /><stop offset="1" stopColor="#6E9F52" /></linearGradient>
      </defs>
      <rect x={LOCAL0} y="520" width={LAYER_W} height="70" fill="url(#gr-top)" />
      <rect x={LOCAL0} y="594" width={LAYER_W} height="520" fill="url(#gr-low)" />
      {STATIONS.map((_, n) => <Station key={n} n={n} year={years[n]} built={n <= i} />)}
      <rect x={LOCAL0} y="583" width={LAYER_W} height="14" fill="#B8A58A" />
      <path d={sleepers} fill="#8A6A4C" />
      <path d={`M${LOCAL0} 580 H${endX}`} stroke="#5B5F7A" strokeWidth="5" />
      <path d={`M${LOCAL0} 575 H${endX}`} stroke="#C9CCE0" strokeWidth="2" opacity=".7" />
      <path d={`M${endX} 580 V552 M${endX - 10} 552 H${endX + 10}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
});

export const ForeLayer = memo(function ForeLayer({ p }) {
  const W = (stX(STATIONS.length - 1) * p) + 3600 - LOCAL0;
  const d = useMemo(() => {
    const r = rng(77);
    let s = '';
    for (let x = LOCAL0; x < LOCAL0 + W; x += 22 + r() * 40) {
      const h = 18 + r() * 26;
      s += `M${x.toFixed(0)} 724 q${(2 + r() * 3).toFixed(1)} ${(-h * 0.6).toFixed(0)} ${(r() * 8 - 4).toFixed(0)} ${-h.toFixed(0)} q${(3 + r() * 3).toFixed(1)} ${(h * 0.6).toFixed(0)} 9 ${h.toFixed(0)}Z `;
    }
    return s;
  }, [W]);
  const posts = useMemo(() => {
    const r = rng(33);
    const out = [];
    for (let x = LOCAL0 + 600; x < LOCAL0 + W - 400; x += 900 + r() * 700) out.push(x);
    return out;
  }, [W]);
  return (
    <svg width={W} height="720" viewBox={`${LOCAL0} 0 ${W} 720`} aria-hidden="true" focusable="false">
      <path d={d} fill="#3F8C45" />
      {posts.map((x) => <g key={x}><rect x={x} y="640" width="9" height="90" rx="3" fill="#5B3E27" /><rect x={x - 16} y="646" width="41" height="6" rx="3" fill="#5B3E27" /></g>)}
    </svg>
  );
});

/* ---------- the train ---------- */

// The painted train (public/art/journey/train.webp, 1843 x 328 px). TK turns its pixels into scene units; TX and TY
// place a pixel of the picture in the scene. The origin is the middle of the picture window; the rail top is y = 578.
const TK = 660 / 1843;
const TX = (px) => (px - 925) * TK - 3;
const TY = (py) => 570 - (328 - py) * TK;
export const WIN_Y = TY(163); // the middle of the window, where Laksh sits and throws his tickets
const WIN = { x: TX(794), y: TY(112), w: 263 * TK, h: 103 * TK };

function Wheel({ px, r }) {
  const cx = TX(px);
  const cy = 578 - r;
  return (
    <g className="wheel">
      <image href={`${ART}wheel.webp`} x={cx - r} y={cy - r} width={r * 2} height={r * 2} />
    </g>
  );
}

export const Train = memo(function Train() {
  const lamp = TX(1787);
  return (
    <svg className="train" width="1200" height="720" viewBox="-460 0 1200 720" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="tn-win"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx="7" /></clipPath>
        <radialGradient id="tn-beam"><stop offset="0" stopColor="#FFF3B0" stopOpacity=".9" /><stop offset=".6" stopColor="#FFF3B0" stopOpacity=".35" /><stop offset="1" stopColor="#FFF3B0" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="0" cy="581" rx="290" ry="6" fill="rgba(0,0,0,.18)" />
      <ellipse className="beam" cx={lamp + 120} cy={TY(95)} rx="140" ry="46" fill="url(#tn-beam)" />
      {/* wheels sit behind the body, so its skirt hides their tops */}
      {[130, 470, 830, 1150].map((px) => <Wheel key={px} px={px} r={15} />)}
      {[1380, 1525, 1675].map((px) => <Wheel key={px} px={px} r={19} />)}
      <g className="tr-body">
        <image href={`${ART}train.webp`} x={TX(0)} y={TY(0)} width={1843 * TK} height={328 * TK} />
        {/* the middle carriage's window: sky behind Laksh, and a pane that slides down to let a ticket out */}
        <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx="7" fill="#BEE3F2" />
        <g clipPath="url(#tn-win)">
          <image className="tr-me" href="/me-avatar.webp" x={WIN.x + WIN.w / 2 - 25} y={WIN.y + 3} width="50" height="148" preserveAspectRatio="xMidYMin slice" />
          <g className="tr-pane">
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#BEE3F2" opacity=".2" />
            <path d={`M${WIN.x + 10} ${WIN.y} L${WIN.x + 26} ${WIN.y} L${WIN.x + 6} ${WIN.y + WIN.h} L${WIN.x} ${WIN.y + WIN.h} L${WIN.x} ${WIN.y + 14}Z`} fill="#fff" opacity=".35" />
          </g>
        </g>
        <g className="smoke">
          <circle className="pf p1" cx={TX(1658)} cy={TY(8)} r="9" fill="#fff" />
          <circle className="pf p2" cx={TX(1658)} cy={TY(8)} r="9" fill="#fff" />
          <circle className="pf p3" cx={TX(1658)} cy={TY(8)} r="9" fill="#fff" />
        </g>
      </g>
    </svg>
  );
});

/* ---------- sky ---------- */

export function SkyArt() {
  const stars = useMemo(() => {
    const r = rng(14);
    return Array.from({ length: 56 }, () => ({ x: r() * 100, y: r() * 62, s: 1 + r() * 1.8, w: r() * 3 }));
  }, []);
  return (
    <>
      <div className="sk-stars" data-ref="stars">
        {stars.map((s, k) => <i key={k} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.w}s` }} />)}
      </div>
      <div className="sk-sun" data-ref="sun"><i /></div>
      <div className="sk-moon" data-ref="moon"><i /></div>
      {[[6, 14, 1, 1], [32, 8, 0.7, 3], [58, 18, 0.9, 2], [82, 10, 1.1, 4]].map(([l, t, k, c], n) => (
        <img key={n} className="sk-cloud" src={`/art/cloud-${c}.webp`} alt="" draggable="false" style={{ left: `${l}%`, top: `${t}%`, width: 190 * k, animationDelay: `${-n * 19}s`, animationDuration: `${120 + n * 14}s` }} />
      ))}
    </>
  );
}
