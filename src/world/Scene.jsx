import React from 'react';
import Avatar3D from './Avatar3D';

// The valley: hand-drawn SVG layers in a 1600 x 900 space. Colours come from CSS variables
// (see world.css), so day and night are one set of shapes with two palettes.
// Each layer is its own <svg> so the hero can move layers by depth (parallax and fly-in).

export const VB = { w: 1600, h: 900 };
export const pct = (x, y) => ({ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` });

// Deterministic pseudo-random so the art is identical on every render and every device.
const rng = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const S = ({ children, className = '' }) => (
  <svg className={`art ${className}`} viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

/* ---------- reusable bits ---------- */

const Win = ({ x, y, w = 14, h = 22, r = 6, lit = true }) => (
  <rect className={lit ? 'win' : 'win-dark'} x={x} y={y} width={w} height={h} rx={r} />
);

const Tree = ({ x, y, s = 1, tone = 'leaf' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect className="wood" x="-4" y="-14" width="8" height="26" rx="3" />
    <circle className={tone} cx="0" cy="-34" r="26" />
    <circle className={`${tone}-hi`} cx="-9" cy="-42" r="13" />
    <circle className={tone} cx="17" cy="-24" r="17" />
  </g>
);

const Cloud = ({ x, y, s = 1, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} className="cloud">
    <path d="M0 40c-24 0-34-24-14-36 4-22 36-26 50-8 14-16 46-8 50 14 22-2 34 24 12 30z" />
  </g>
);

function Kite({ x, y, c, r = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M0 -26 L16 0 L0 30 L-16 0Z" fill={c} />
      <path d="M0 -26 L0 30 M-16 0 L16 0" stroke="rgba(255,255,255,.55)" strokeWidth="2" />
      <path d="M0 30 q-10 24 4 46 q10 18 -2 36" stroke="var(--ink)" strokeWidth="1.6" fill="none" opacity=".55" />
    </g>
  );
}

/* ---------- layers ---------- */

export function SkyLayer() {
  const stars = React.useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 70 }, () => ({ x: r() * VB.w, y: r() * 420, s: 0.8 + r() * 1.8, d: r() * 4 }));
  }, []);
  return (
    <S>
      <defs>
        <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--sky1)' }} />
          <stop offset="0.62" style={{ stopColor: 'var(--sky2)' }} />
          <stop offset="1" style={{ stopColor: 'var(--sky3)' }} />
        </linearGradient>
        <radialGradient id="gSun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF3B0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFD23F" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gMoon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#DCE6FF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#DCE6FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={VB.w} height={VB.h} fill="url(#gSky)" />
      <g className="sun">
        <circle cx="1210" cy="205" r="210" fill="url(#gSun)" />
        <circle cx="1210" cy="205" r="62" fill="#FFE27A" />
        <circle cx="1210" cy="205" r="62" fill="#FFF6C7" opacity=".5" transform="translate(-8 -8) scale(.7)" style={{ transformOrigin: '1210px 205px' }} />
      </g>
      <g className="moon">
        <circle cx="1210" cy="190" r="190" fill="url(#gMoon)" />
        <circle cx="1210" cy="190" r="50" fill="#F4F1DE" />
        <circle cx="1196" cy="178" r="9" fill="#DAD5BE" />
        <circle cx="1226" cy="204" r="6" fill="#DAD5BE" />
        <circle cx="1214" cy="166" r="4" fill="#DAD5BE" />
      </g>
      <g className="shoots">
        <path className="shoot" d="M0 0 L-130 -26" stroke="#FFF8E1" strokeWidth="3" strokeLinecap="round" transform="translate(560 120)" />
        <path className="shoot s2" d="M0 0 L-110 -20" stroke="#FFF8E1" strokeWidth="2.6" strokeLinecap="round" transform="translate(1240 60)" />
      </g>
      <g className="stars">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#FFF8E1" style={{ animationDelay: `${s.d}s` }} />
        ))}
      </g>
    </S>
  );
}

export function CloudLayer() {
  return (
    <S className="drift">
      <g style={{ ['--d']: '150s' }} className="drifter"><Cloud x={180} y={120} s={1.3} /><Cloud x={760} y={70} s={0.9} flip /></g>
      <g style={{ ['--d']: '110s' }} className="drifter"><Cloud x={980} y={300} s={1.1} /><Cloud x={420} y={290} s={0.7} flip /></g>
      <g style={{ ['--d']: '190s' }} className="drifter"><Cloud x={1380} y={110} s={0.85} /></g>
    </S>
  );
}

export function KitesLayer() {
  return (
    <S>
      <g className="kite k1"><Kite x={420} y={150} c="#E8505B" r={-16} /></g>
      <g className="kite k2"><Kite x={640} y={96} c="#FFC93C" r={12} /></g>
      <g className="kite k3"><Kite x={330} y={250} c="#1FA6A0" r={-6} /></g>
      <g transform="translate(900 300)">
        <g className="balloon">
          <g className="balloon-sway">
            <path d="M0 -70 C 46 -70 62 -32 50 0 C 42 22 20 40 12 54 L-12 54 C -20 40 -42 22 -50 0 C -62 -32 -46 -70 0 -70Z" fill="var(--rose-c)" />
            <path d="M0 -70 C 18 -70 28 -32 22 0 C 18 24 8 42 5 54 L-5 54 C -8 42 -18 24 -22 0 C -28 -32 -18 -70 0 -70Z" fill="var(--sun-c)" />
            <path d="M0 -70 C 6 -70 8 -32 6 0 C 5 24 2 42 1 54 L-1 54 C -2 42 -5 24 -6 0 C -8 -32 -6 -70 0 -70Z" fill="var(--teal-c)" />
            <path d="M-12 54 L-9 78 M12 54 L9 78 M-4 54 L-3 78 M4 54 L3 78" stroke="var(--ink)" strokeWidth="1.6" opacity=".6" />
            <rect x="-13" y="78" width="26" height="17" rx="3" fill="var(--wood)" />
            <path d="M-13 83 h26" stroke="var(--trim)" strokeWidth="2" opacity=".6" />
            <path className="burner" d="M0 66 q4 6 0 12 q-4 -6 0 -12Z" fill="#FFB02E" />
          </g>
        </g>
      </g>
    </S>
  );
}

// Distant ghat skyline: shikhara spires and domes along the horizon.
export function FarLayer() {
  const spires = React.useMemo(() => {
    const r = rng(21);
    const out = [];
    for (let x = 80; x < 1560; x += 40 + r() * 70) {
      const h = 40 + r() * 100;
      const w = 18 + r() * 26;
      const kind = r() > 0.5 ? 'spire' : 'dome';
      out.push({ x, h, w, kind });
    }
    return out;
  }, []);
  return (
    <S>
      <path className="far" d="M0 470 C 160 430 300 460 470 440 C 640 420 760 450 940 430 C 1120 412 1300 450 1600 424 L1600 520 L0 520Z" />
      <g className="far">
        {spires.map((s, i) =>
          s.kind === 'spire' ? (
            <g key={i} transform={`translate(${s.x} 458)`}>
              <path d={`M${-s.w / 2} 0 L${-s.w / 2 + 2} ${-s.h * 0.55} C ${-s.w / 4} ${-s.h * 0.8} ${-s.w / 8} ${-s.h * 0.92} 0 ${-s.h} C ${s.w / 8} ${-s.h * 0.92} ${s.w / 4} ${-s.h * 0.8} ${s.w / 2 - 2} ${-s.h * 0.55} L${s.w / 2} 0Z`} />
              <rect x="-1.5" y={-s.h - 12} width="3" height="14" />
            </g>
          ) : (
            <g key={i} transform={`translate(${s.x} 458)`}>
              <rect x={-s.w / 2} y={-s.h * 0.45} width={s.w} height={s.h * 0.45} />
              <path d={`M${-s.w / 2 - 3} ${-s.h * 0.45} a ${s.w / 2 + 3} ${s.w / 2 + 3} 0 0 1 ${s.w + 6} 0Z`} />
              <rect x="-1.5" y={-s.h * 0.45 - s.w / 2 - 14} width="3" height="14" />
            </g>
          ),
        )}
      </g>
      <rect className="far" x="0" y="456" width="1600" height="80" />
    </S>
  );
}

function GrassTexture({ seed, x0, x1, y0, y1, n = 90 }) {
  const items = React.useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: n }, () => ({ x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0), h: 6 + r() * 12, k: r() }));
  }, [seed, x0, x1, y0, y1, n]);
  return (
    <g className="blades">
      {items.map((b, i) => (
        <path key={i} d={`M${b.x} ${b.y} q ${b.k > 0.5 ? 3 : -3} ${-b.h / 2} ${b.k > 0.5 ? 1 : -1} ${-b.h}`} />
      ))}
    </g>
  );
}

export function HillLeftLayer() {
  return (
    <S>
      <path className="hill1" d="M-60 560 C 40 470 120 380 260 372 C 420 364 520 470 700 540 C 800 580 860 640 900 700 L900 900 L-60 900Z" />
      <path className="hill1-hi" d="M-60 560 C 40 470 120 380 260 372 C 340 368 400 392 450 420 C 330 410 220 440 120 520 C 60 566 0 600 -60 620Z" />
      <GrassTexture seed={3} x0={0} x1={760} y0={420} y1={700} />
      <Tree x={90} y={560} s={0.9} tone="leaf" />
      <Tree x={540} y={560} s={0.7} tone="leaf2" />
      <Tree x={610} y={590} s={0.55} tone="leaf" />
      <Tree x={440} y={470} s={0.45} tone="leaf2" />
    </S>
  );
}

export function HillRightLayer() {
  return (
    <S>
      <path className="hill2" d="M860 740 C 920 600 960 480 1040 420 C 1140 340 1230 250 1380 230 C 1500 214 1560 180 1660 170 L1660 900 L860 900Z" />
      <path className="hill2-hi" d="M1040 420 C 1140 340 1230 250 1380 230 C 1500 214 1560 180 1660 170 L1660 230 C 1560 250 1480 290 1380 300 C 1260 312 1160 380 1080 450Z" />
      <GrassTexture seed={11} x0={900} x1={1600} y0={260} y1={760} n={110} />
      <Tree x={1000} y={560} s={0.8} tone="leaf2" />
      <Tree x={1500} y={330} s={0.6} tone="leaf" />
      <Tree x={1240} y={640} s={0.7} tone="leaf" />
    </S>
  );
}

// Terraced ghat steps between the right hill and the river.
export function GhatLayer() {
  return (
    <S>
      <g className="steps">
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <path className={i % 2 ? 'step-a' : 'step-b'} d={`M${1190 + i * 18} ${560 + i * 26} L1640 ${540 + i * 26} L1640 ${580 + i * 26} L${1180 + i * 18} ${586 + i * 26}Z`} />
            <path className="step-edge" d={`M${1190 + i * 18} ${560 + i * 26} L1640 ${540 + i * 26}`} />
          </g>
        ))}
      </g>
      <Walker x={1270} y={632} dx={250} dy={-14} c="#FF8A1F" dur={26} delay={0} />
      <Walker x={1360} y={684} dx={210} dy={-12} c="#1FA6A0" dur={31} delay={-12} s={1.1} />
      <Walker x={1330} y={738} dx={270} dy={-14} c="#8E7CFF" dur={36} delay={-20} s={1.15} />
    </S>
  );
}

// A little person who walks along a step, turns round at the end and comes back.
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

export function RiverLayer() {
  return (
    <S>
      <path className="river" d="M-40 650 C 200 620 380 690 640 676 C 900 662 1060 626 1260 650 C 1420 668 1520 690 1660 676 L1660 790 C 1440 780 1260 800 1020 790 C 760 780 560 820 320 800 C 160 788 60 800 -40 806Z" />
      <g className="ripple">
        <path d="M120 700 q40 -8 80 0 M320 724 q50 -10 100 0 M560 706 q40 -8 80 0 M760 736 q60 -10 120 0 M1010 700 q40 -8 80 0 M1180 730 q50 -10 100 0 M1400 706 q40 -8 80 0 M60 760 q50 -8 100 0 M470 770 q60 -10 120 0 M900 772 q50 -8 100 0" />
      </g>
      {/* glints on the water */}
      {[[170, 716], [430, 744], [610, 700], [820, 752], [1050, 716], [1230, 746], [1460, 700], [90, 772], [700, 780], [980, 770], [1330, 780]].map(([x, y], i) => (
        <path key={i} className="glint" d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2Z" transform={`translate(${x} ${y})`} style={{ animationDelay: `${(i * 0.73) % 3.4}s` }} />
      ))}
      {[[300, 740, 0], [1180, 760, 3.2]].map(([x, y, dl], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="fish" style={{ animationDelay: `${dl}s` }}>
            <path d="M-12 0 Q0 -9 12 0 Q0 7 -12 0Z M12 0 L20 -6 L20 6Z" fill="var(--teal-c)" />
            <circle cx="-6" cy="-1.5" r="1.4" fill="#fff" />
          </g>
          <ellipse className="splash" cx="12" cy="4" rx="14" ry="4" style={{ animationDelay: `${dl}s` }} />
        </g>
      ))}
      {/* boat */}
      {/* the outer <g> positions the boat (SVG attribute); the inner one bobs (CSS animation) */}
      <g transform="translate(380 700)">
        <g className="sailing"><g className="boat">
          <path className="wood" d="M-52 0 L52 0 L38 18 L-38 18Z" />
          <path className="hull-hi" d="M-52 0 L52 0 L48 5 L-48 5Z" />
          <rect className="wood" x="-2" y="-58" width="4" height="58" />
          <path className="sail" d="M2 -54 L36 -8 L2 -8Z" />
          <circle className="lamp" cx="-34" cy="-8" r="5" />
        </g></g>
      </g>
      <g transform="translate(1090 740) scale(.75)">
        <g className="sailing s2"><g className="boat b2">
          <path className="wood" d="M-52 0 L52 0 L38 18 L-38 18Z" />
          <path className="hull-hi" d="M-52 0 L52 0 L48 5 L-48 5Z" />
          <rect className="wood" x="-2" y="-58" width="4" height="58" />
          <path className="sail" d="M2 -54 L-30 -8 L2 -8Z" />
          <circle className="lamp" cx="30" cy="-8" r="5" />
        </g></g>
      </g>
      {/* diyas floating on the water */}
      {[[640, 760], [760, 748], [1260, 770], [200, 776], [880, 780]].map(([x, y], i) => (
        <g key={i} className="diya" transform={`translate(${x} ${y})`}>
          <ellipse cx="0" cy="3" rx="11" ry="5" fill="#E88A1F" />
          <path d="M0 -10 q5 6 0 12 q-5 -6 0 -12Z" fill="#FFC93C" className="flame" />
        </g>
      ))}
    </S>
  );
}

/* ---------- places ---------- */

export function MUArt() {
  return (
    <S>
      <g transform="translate(14 52)">
        {/* main block */}
        <rect className="brick" x="130" y="470" width="300" height="130" />
        <rect className="brick2" x="130" y="470" width="300" height="14" />
        {/* wings */}
        <rect className="brick" x="96" y="520" width="42" height="80" />
        <rect className="brick" x="422" y="520" width="42" height="80" />
        {/* tower */}
        <rect className="brick" x="238" y="390" width="84" height="100" />
        <rect className="brick2" x="228" y="384" width="104" height="10" />
        <path className="roof" d="M228 384 L280 330 L332 384Z" />
        <rect className="wood" x="278" y="296" width="4" height="36" />
        <path className="flag" d="M282 298 L316 308 L282 318Z" />
        {/* clock */}
        <circle className="trim" cx="280" cy="432" r="22" />
        <circle fill="none" stroke="var(--ink)" strokeWidth="3" cx="280" cy="432" r="22" />
        <path className="clk-m" d="M280 432 L280 414" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        <path className="clk-h" d="M280 432 L291 438" stroke="var(--ink)" strokeWidth="3.6" strokeLinecap="round" />
        {/* arched windows */}
        {[154, 190, 226, 330, 366, 400].map((x, i) => (
          <g key={i}>
            <path className="win" d={`M${x} 520 v-30 a8 8 0 0 1 16 0 v30Z`} />
            <path className="win" d={`M${x} 580 v-30 a8 8 0 0 1 16 0 v30Z`} />
          </g>
        ))}
        {/* entrance */}
        <path className="door" d="M258 600 v-50 a22 22 0 0 1 44 0 v50Z" />
        <rect className="trim" x="244" y="598" width="72" height="8" />
        {[246, 314].map((x) => <rect key={x} className="trim" x={x} y="540" width="6" height="60" />)}
        {/* chhatri domes on the wings */}
        {[117, 443].map((x) => (
          <g key={x}>
            <rect className="trim" x={x - 14} y="500" width="28" height="22" />
            <path className="roof" d={`M${x - 20} 500 a20 20 0 0 1 40 0Z`} />
            <rect className="wood" x={x - 1.5} y="470" width="3" height="14" />
          </g>
        ))}
        {/* steps */}
        <rect className="step-a" x="226" y="606" width="108" height="8" />
        <rect className="step-b" x="212" y="614" width="136" height="8" />
      </g>
    </S>
  );
}

export function ShiftsDealArt() {
  return (
    <S>
      <g>
        {/* base building */}
        <rect className="wall" x="520" y="520" width="420" height="190" />
        <rect className="wall2" x="520" y="520" width="420" height="14" />
        <rect className="wall" x="560" y="440" width="340" height="86" />
        <rect className="wall2" x="546" y="434" width="368" height="12" />
        {/* rooftop pavilion */}
        <rect className="trim" x="660" y="396" width="140" height="42" />
        <path className="roof" d="M648 398 L730 354 L812 398Z" />
        <rect className="wood" x="728" y="330" width="4" height="26" />
        <path className="flag f2" d="M732 332 L764 342 L732 352Z" />
        {[676, 706, 736, 766].map((x) => <Win key={x} x={x} y={406} w={12} h={26} />)}
        {/* upper windows + balcony */}
        {[590, 640, 690, 740, 790, 840].map((x) => <Win key={x} x={x} y={456} w={26} h={44} r={13} />)}
        <rect className="trim" x="570" y="504" width="320" height="8" />
        {Array.from({ length: 22 }, (_, i) => <rect key={i} className="trim" x={574 + i * 15} y="488" width="3" height="16" />)}
        {/* awning stripes */}
        <g>
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} className={i % 2 ? 'awn-a' : 'awn-b'} d={`M${530 + i * 29.3} 544 h29.3 l-6 40 h-17.3Z`} />
          ))}
          <path className="awn-edge" d="M530 544 h410 v6 h-410Z" />
        </g>
        {/* doors */}
        {[600, 700, 800].map((x) => (
          <g key={x}>
            <path className="door" d={`M${x} 710 v-70 a24 24 0 0 1 48 0 v70Z`} />
            <path className="win" d={`M${x + 8} 700 v-52 a16 16 0 0 1 32 0 v52Z`} opacity=".55" />
          </g>
        ))}
        {/* sign */}
        <rect className="sign" x="640" y="594" width="170" height="26" rx="6" />
        <text x="725" y="613" textAnchor="middle" className="sign-t">VENUES · BOOKED</text>
        {/* string lights */}
        <path d="M520 540 q105 46 210 0 q105 46 210 0" fill="none" stroke="var(--ink)" strokeWidth="1.5" opacity=".5" />
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const seg = t < 0.5 ? t * 2 : (t - 0.5) * 2;
          const x = 520 + t * 420;
          const y = 540 + Math.sin(seg * Math.PI) * 23;
          return <circle key={i} className="bulb" cx={x} cy={y + 2} r="5" style={{ animationDelay: `${i * 0.18}s` }} />;
        })}
        {/* planters */}
        {[560, 940].map((x) => (
          <g key={x}>
            <rect className="wood" x={x - 12} y="690" width="24" height="20" rx="3" />
            <circle className="leaf" cx={x} cy="682" r="16" />
            <circle fill="#FF8A1F" cx={x - 6} cy="676" r="4" /><circle fill="#FFC93C" cx={x + 7} cy="684" r="4" />
          </g>
        ))}
        {/* ground */}
        <rect className="plaza" x="500" y="710" width="460" height="22" rx="8" />
      </g>
    </S>
  );
}

export function InternsArt() {
  return (
    <S>
      <g>
        <path className="tower" d="M1088 470 L1100 168 L1148 168 L1160 470Z" />
        <path className="tower-hi" d="M1088 470 L1100 168 L1114 168 L1112 470Z" />
        {[230, 300, 370, 430].map((y, i) => (
          <g key={y}>
            <rect className="trim" x={1094 - i * -0.6} y={y} width={60 + i * 1.6} height="9" rx="3" />
            <path className="win" d={`M1114 ${y + 22} v-18 a10 10 0 0 1 20 0 v18Z`} />
          </g>
        ))}
        <rect className="trim" x="1090" y="160" width="68" height="10" rx="3" />
        <path className="roof" d="M1094 160 a30 30 0 0 1 60 0Z" />
        <g className="beam-wrap"><path className="beam" d="M1124 112 L1700 62 L1700 150Z" /><path className="beam beam-b" d="M1124 112 L560 52 L560 172Z" /></g>
        <rect className="wood" x="1122" y="106" width="4" height="40" />
        {/* four flags: one per team */}
        {[['#E8505B', 1126, 110], ['#FFC93C', 1126, 124], ['#1FA6A0', 1126, 138], ['#8E7CFF', 1126, 152]].map(([c, x, y], i) => (
          <path key={i} className={`flag f${(i % 3) + 1}`} d={`M${x + 2} ${y - 8} L${x + 34} ${y} L${x + 2} ${y + 8}Z`} fill={c} />
        ))}
      </g>
    </S>
  );
}

export function BestowArt() {
  return (
    <S>
      <g>
        <rect className="wood-wall" x="1290" y="210" width="178" height="106" />
        <path className="roof" d="M1274 214 L1379 156 L1484 214Z" />
        <rect className="chim" x="1430" y="150" width="20" height="46" />
        {[0, 1, 2, 3].map((i) => <circle key={i} className="smoke" cx="1440" cy="146" r="7" style={{ animationDelay: `${i * 1.5}s` }} />)}
        <rect className="win-big" x="1310" y="236" width="76" height="52" rx="6" />
        <path d="M1348 236 v52 M1310 262 h76" stroke="var(--wood)" strokeWidth="3" />
        <path className="door" d="M1410 316 v-62 a16 16 0 0 1 32 0 v62Z" />
        <circle fill="var(--trim)" cx="1436" cy="288" r="2.5" />
        {/* laptop sign */}
        <g transform="translate(1379 188)">
          <rect className="sign" x="-24" y="-14" width="48" height="30" rx="5" />
          <text x="0" y="7" textAnchor="middle" className="sign-t" fontSize="17">&lt;/&gt;</text>
        </g>
        {/* bunting */}
        <path d="M1276 222 q50 30 100 0 q50 30 106 -6" fill="none" stroke="var(--ink)" strokeWidth="1.4" opacity=".5" />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} className={`flag f${(i % 3) + 1}`} fill={['#E8505B', '#FFC93C', '#1FA6A0', '#8E7CFF'][i % 4]} d={`M${1292 + i * 24} ${232 + Math.sin(i * 0.8) * 6} l10 0 l-5 14Z`} />
        ))}
        {/* path + plants */}
        <path className="plaza" d="M1410 316 q-30 40 -90 74" stroke="none" />
        <circle className="leaf" cx="1286" cy="318" r="14" /><circle className="leaf2" cx="1470" cy="322" r="16" />
      </g>
    </S>
  );
}

export function RangeArt() {
  return (
    <S>
      <g>
        <rect className="wood-wall" x="1120" y="520" width="170" height="70" />
        <path className="roof" d="M1106 522 L1205 484 L1304 522Z" />
        <rect className="win-big" x="1140" y="540" width="48" height="30" rx="4" />
        <rect className="win-big" x="1226" y="540" width="48" height="30" rx="4" />
        <path className="door" d="M1195 590 v-34 a8 8 0 0 1 16 0 v34Z" />
        {/* target boards */}
        {[1090, 1130].map((x, i) => (
          <g key={x} transform={`translate(${x - 170} ${i ? 560 : 540})`}>
            <rect className="wood" x="-2" y="20" width="4" height="40" />
            <circle fill="#FFF8E7" cx="0" cy="0" r="24" stroke="var(--ink)" strokeWidth="2" />
            <circle fill="#E8505B" cx="0" cy="0" r="16" />
            <circle fill="#FFF8E7" cx="0" cy="0" r="10" />
            <circle fill="#E8505B" cx="0" cy="0" r="5" />
          </g>
        ))}
        <path className="lane" d="M1010 616 L1300 616 M980 636 L1310 636" />
      </g>
    </S>
  );
}

export function TablaArt({ playing }) {
  return (
    <S>
      <g transform="translate(1030 640)">
        <ellipse className="rug" cx="0" cy="38" rx="86" ry="14" />
        <ellipse cx="0" cy="40" rx="68" ry="9" fill="none" stroke="var(--trim)" strokeWidth="2" opacity=".6" />
        {/* dayan */}
        <g transform="translate(-28 0)">
          <path className="tabla-body" d="M-18 8 L-14 -22 L14 -22 L18 8 Z" />
          <ellipse className="tabla-head" cx="0" cy="-23" rx="16" ry="6" />
          <ellipse fill="var(--ink)" cx="0" cy="-23" rx="7" ry="2.6" opacity=".7" />
          <path d="M-14 -20 L-10 6 M-5 -18 L-4 7 M5 -18 L4 7 M14 -20 L10 6" stroke="var(--trim)" strokeWidth="1.5" opacity=".8" />
        </g>
        {/* bayan */}
        <g transform="translate(26 6)">
          <path className="tabla-metal" d="M-22 12 C -26 -10 -18 -22 0 -24 C 18 -22 26 -10 22 12 Z" />
          <ellipse className="tabla-head" cx="0" cy="-24" rx="15" ry="5.5" />
          <ellipse fill="var(--ink)" cx="3" cy="-24" rx="6" ry="2.2" opacity=".7" />
        </g>
        <g className={`tnotes ${playing ? 'on' : ''}`} fill="var(--wood)">
          <text x="-30" y="-48" fontSize="22">♪</text>
          <text x="10" y="-62" fontSize="26">♫</text>
          <text x="44" y="-44" fontSize="20">♪</text>
        </g>
      </g>
    </S>
  );
}

// Laksh: the 3D avatar Laksh supplied (public/me-avatar.webp, background cut out, 302x898 px, feet at the bottom edge).
// Local space matches the old drawing: origin on the ground between the feet, +y down, about 296 units tall.
// His 3D avatar is an HTML puppet (see Avatar3D.jsx) placed on the same ground spot and height the old SVG
// figure had: about 296 units tall, feet at (1432, 734) in the 1600 x 900 scene.
export function MeArt() {
  return (
    <div className="me3d">
      <Avatar3D />
    </div>
  );
}

/* ---------- foreground ---------- */

export function ForegroundLeft() {
  const r = rng(5);
  const flowers = Array.from({ length: 22 }, () => ({ x: 20 + r() * 400, y: 760 + r() * 120, c: ['#FF8A1F', '#FFC93C', '#E8505B'][Math.floor(r() * 3)] }));
  return (
    <S>
      <path className="fg" d="M-40 900 L-40 640 C 30 600 110 640 150 700 C 210 690 280 730 320 790 C 400 800 470 850 520 900Z" />
      <path className="fg-hi" d="M-40 700 C 30 650 110 690 150 740 C 120 730 40 720 -40 760Z" />
      {Array.from({ length: 11 }, (_, i) => (
        <path key={i} className="fg-leaf" d={`M${30 + i * 40} ${900 - (i % 3) * 20} q-26 -70 ${(i % 2 ? 1 : -1) * 30} -130 q38 52 -4 130Z`} />
      ))}
      {flowers.map((f, i) => <circle key={i} cx={f.x} cy={f.y} r="6" fill={f.c} />)}
      {/* lamp post */}
      <rect className="wood" x="268" y="560" width="8" height="260" rx="3" />
      <path className="wood" d="M272 564 q-34 -12 -34 -48" fill="none" stroke="var(--wood)" strokeWidth="6" strokeLinecap="round" />
      <g transform="translate(238 504)">
        <rect className="lamp-glass" x="-12" y="-4" width="24" height="34" rx="6" />
        <circle className="lamp-glow" cx="0" cy="13" r="46" />
      </g>
    </S>
  );
}

export function ForegroundRight() {
  return (
    <S>
      <path className="fg" d="M1640 900 L1640 700 C 1560 690 1480 740 1420 790 C 1360 800 1290 840 1240 900Z" />
      <path className="fg-hi" d="M1640 720 C 1560 700 1490 750 1440 790 C 1500 770 1570 760 1640 780Z" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} className="fg-leaf" d={`M${1250 + i * 46} ${900 - (i % 3) * 18} q-26 -76 ${(i % 2 ? -1 : 1) * 32} -140 q40 56 -6 140Z`} />
      ))}
    </S>
  );
}

export function ForegroundBottom() {
  const flies = React.useMemo(() => {
    const r = rng(31);
    return Array.from({ length: 26 }, () => ({ x: 80 + r() * 1440, y: 480 + r() * 380, d: r() * 6, t: 5 + r() * 6, k: r() }));
  }, []);
  return (
    <S>
      <g className="flies">
        {flies.map((f, i) => (
          <circle key={i} className="fly" cx={f.x} cy={f.y} r={2.4 + f.k * 2} style={{ animationDelay: `${-f.d}s`, animationDuration: `${f.t}s`, ['--fx']: `${(f.k - 0.5) * 120}px`, ['--fy']: `${-30 - f.k * 60}px` }} />
        ))}
      </g>
      <path className="fg2" d="M380 900 C 480 850 640 830 760 860 C 860 880 960 850 1060 880 L1060 900Z" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} className="fg-leaf" d={`M${420 + i * 78} 900 q-20 -50 ${(i % 2 ? -1 : 1) * 24} -92 q34 38 -2 92Z`} />
      ))}
    </S>
  );
}

export function Birds({ cls = '' }) {
  return (
    <svg className={`birds ${cls}`} viewBox="0 0 400 120" aria-hidden="true" focusable="false">
      {[[40, 60, 1], [96, 34, 0.8], [150, 72, 0.9], [210, 40, 0.7], [262, 66, 1]].map(([x, y, s], i) => (
        <path key={i} className="bird" style={{ animationDelay: `${i * 0.35}s` }} d={`M${x - 14 * s} ${y} q${7 * s} ${-12 * s} ${14 * s} 0 q${7 * s} ${-12 * s} ${14 * s} 0`} />
      ))}
    </svg>
  );
}
