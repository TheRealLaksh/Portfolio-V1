import React, { memo, useMemo } from 'react';

// Art for the train journey. Everything is hand-built SVG in a 720-unit-tall scene.
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

// A smooth closed hill silhouette from x0 to x1, resting on `base`.
function hillPath(x0, x1, base, amp, seed, step = 120) {
  const r = rng(seed);
  const pts = [];
  for (let x = x0; x <= x1 + step; x += step) pts.push([x, base - amp * (0.35 + 0.65 * r())]);
  let d = `M${x0} ${base + 400} L${pts[0][0]} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [xa, ya] = pts[i];
    const [xb, yb] = pts[i + 1];
    const mx = (xa + xb) / 2;
    d += ` C${mx.toFixed(1)} ${ya.toFixed(1)} ${mx.toFixed(1)} ${yb.toFixed(1)} ${xb.toFixed(1)} ${yb.toFixed(1)}`;
  }
  return `${d} L${pts[pts.length - 1][0]} ${base + 400}Z`;
}

function gearPath(r, teeth, depth) {
  const step = (Math.PI * 2) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts = [[a, r - depth], [a + step * 0.18, r], [a + step * 0.42, r], [a + step * 0.6, r - depth]];
    pts.forEach(([ang, rad], k) => { d += `${i + k === 0 ? 'M' : 'L'}${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)} `; });
  }
  return `${d}Z`;
}

const P = ({ d = 0, x = false, children, className = '' }) => (
  <g className={`prop${x ? ' prop-x' : ''} ${className}`} style={{ '--d': `${d}s` }}>{children}</g>
);

function Palm({ x, y, k = 1, lean = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k * lean} ${k})`}>
      <path d="M0 0 C 4 -40 2 -80 -6 -118" fill="none" stroke={C.wood} strokeWidth="7" strokeLinecap="round" />
      <g fill={C.green2} stroke="#2F6F36" strokeWidth="1.5">
        <path d="M-6 -118 C -30 -134 -56 -128 -70 -108 C -48 -118 -26 -118 -6 -118Z" />
        <path d="M-6 -118 C 18 -140 48 -136 66 -114 C 42 -124 18 -122 -6 -118Z" />
        <path d="M-6 -118 C -20 -146 -2 -166 22 -168 C 4 -156 -2 -138 -6 -118Z" />
        <path d="M-6 -118 C -40 -112 -62 -90 -62 -70 C -48 -92 -28 -108 -6 -118Z" />
        <path d="M-6 -118 C 24 -108 50 -86 52 -64 C 36 -88 14 -106 -6 -118Z" />
      </g>
      <circle cx="-8" cy="-114" r="5" fill="#8A5A3B" />
    </g>
  );
}

function Tree({ x, y, k = 1, col = C.green, col2 = C.green2 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x="-5" y="-70" width="10" height="72" rx="3" fill={C.wood} />
      <circle cx="0" cy="-92" r="44" fill={col2} />
      <circle cx="-26" cy="-70" r="30" fill={col} />
      <circle cx="28" cy="-72" r="32" fill={col} />
      <circle cx="4" cy="-108" r="28" fill={col} opacity=".85" />
    </g>
  );
}

function Windows({ x, y, cols, rows, w = 24, h = 28, gx = 12, gy = 14, fill = C.glass, lit = true }) {
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(<rect key={`${r}-${c}`} className={lit ? 'win-lit' : ''} x={x + c * (w + gx)} y={y + r * (h + gy)} width={w} height={h} rx="3" fill={fill} stroke={INK} strokeWidth="2" style={{ '--w': `${((r * 5 + c * 3) % 7) * 0.4}s` }} />);
    }
  }
  return <g>{out}</g>;
}

// Platform, roundel with the station number and year, drawn for every station.
function Platform({ n, year }) {
  return (
    <g>
      <rect x="-250" y="536" width="500" height="42" fill="#D9A98A" stroke={INK} strokeWidth="2.5" />
      <rect x="-250" y="530" width="500" height="10" rx="3" fill={C.stone} stroke={INK} strokeWidth="2.5" />
      <path d="M-210 548 H210 M-210 560 H210" stroke="#B9694A" strokeWidth="2" opacity=".6" />
      <rect x="-250" y="536" width="12" height="42" fill="#B9694A" opacity=".5" />
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

/* ---------- the nine stations ---------- */

function School() {
  return (
    <g>
      <rect x="-300" y="404" width="600" height="136" fill="#F3D9A4" stroke={INK} strokeWidth="3" />
      <rect x="-306" y="394" width="612" height="14" rx="4" fill={C.rose} stroke={INK} strokeWidth="3" />
      <Windows x={-282} y={426} cols={9} rows={1} w={30} h={34} gx={36} />
      <P d={0.1}>
        <rect x="-42" y="236" width="84" height="166" fill="#F7E3B6" stroke={INK} strokeWidth="3" />
        <path d="M-56 238 L0 180 L56 238Z" fill={C.rose} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="0" cy="284" r="24" fill="#fff" stroke={INK} strokeWidth="3" />
        <g className="hand" style={{ animationDuration: '9s' }}><path d="M0 284 V268" stroke={INK} strokeWidth="3" strokeLinecap="round" /><path d="M0 284 V300" stroke="transparent" strokeWidth="3" /></g>
        <g className="hand" style={{ animationDuration: '90s' }}><path d="M0 284 L10 288" stroke={INK} strokeWidth="3" strokeLinecap="round" /><path d="M0 284 L-10 280" stroke="transparent" strokeWidth="3" /></g>
        <rect x="-14" y="336" width="28" height="30" rx="14" fill="#6E3F2B" />
      </P>
      <P d={0.28}>
        <path d="M0 180 V138" stroke={INK} strokeWidth="3" />
        <path className="flag" d="M2 140 H46 L36 154 L46 168 H2Z" fill={C.sun} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </P>
      <P d={0.4}><Tree x={330} y={540} k={1.1} /></P>
      <P d={0.5}><Palm x={-440} y={540} k={1.1} /></P>
      <P d={0.6}><Palm x={-402} y={540} k={0.8} lean={-1} /></P>
      <P d={0.7}>
        <g transform="translate(120 160)">
          <path d="M0 14 L34 0 L68 14 L34 28Z" fill={INK} /><path d="M12 20 V38 C 22 46 46 46 56 38 V20" fill="#3A3E66" stroke={INK} strokeWidth="2" /><path d="M68 14 V40" stroke={C.sun} strokeWidth="3" strokeLinecap="round" /><circle cx="68" cy="42" r="4" fill={C.sun} />
        </g>
      </P>
    </g>
  );
}

function Varanasi() {
  return (
    <g>
      <P d={0}>
        <rect x="-430" y="506" width="860" height="36" rx="18" fill="#8FCBD6" />
        <g className="riv" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".8"><path d="M-100 520 q8 -7 16 0 t16 0" /><path d="M120 530 q8 -7 16 0 t16 0" /><path d="M290 518 q8 -7 16 0 t16 0" /></g>
      </P>
      <P d={0.1}>
        <path d="M-430 540 H-398 V522 H-366 V504 H-334 V486 H-302 V468 H-270 V450 H-246 V540Z" fill="#EBD5AA" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M-398 526 H-370 M-366 508 H-338 M-334 490 H-306 M-302 472 H-274" stroke="#C79A5E" strokeWidth="2.5" opacity=".7" />
      </P>
      <P d={0.22}>
        <g transform="translate(-62 0)">
        <rect x="-352" y="396" width="64" height="56" fill="#FFC27A" stroke={INK} strokeWidth="3" />
        <path d="M-362 398 C-362 340 -344 304 -320 262 C-296 304 -278 340 -278 398Z" fill="#F2A93B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M-320 262 V238" stroke={INK} strokeWidth="3" /><circle cx="-320" cy="234" r="6" fill={C.sun} stroke={INK} strokeWidth="2" />
        <path className="flag" d="M-318 222 H-286 L-294 232 L-286 242 H-318Z" fill={C.rose} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-336 452 V420 C-336 408 -304 408 -304 420 V452Z" fill="#6E3F2B" />
        </g>
      </P>
      <P d={0.34}>
        <rect x="296" y="446" width="44" height="44" fill="#FFC27A" stroke={INK} strokeWidth="3" />
        <path d="M290 448 C290 410 304 388 318 366 C332 388 346 410 346 448Z" fill="#F2A93B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="318" cy="362" r="5" fill={C.sun} stroke={INK} strokeWidth="2" />
        <rect x="294" y="490" width="48" height="48" fill="#EBD5AA" stroke={INK} strokeWidth="3" />
      </P>
      <P d={0.46}>
        <g className="boat"><path d="M338 528 L402 528 L390 546 L350 546Z" fill="#8A5A3B" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M370 528 V486" stroke={INK} strokeWidth="3" /><path d="M372 488 L396 524 H372Z" fill={C.cream} stroke={INK} strokeWidth="2" strokeLinejoin="round" /></g>
      </P>
      <P d={0.56}>
        {[-420, -396, -372, -348, -324, -300].map((x, k) => <circle key={x} className="diya" cx={x + 20} cy={534 - k * 17} r="4.5" fill={C.sun} stroke={INK} strokeWidth="1.5" style={{ '--w': `${k * 0.3}s` }} />)}
      </P>
      <P d={0.66}>
        <text x="-70" y="330" className="tn-code" fill={C.lilac}>{'</>'}</text>
        <text x="40" y="288" className="tn-code sm" fill={C.teal}>{'{ }'}</text>
      </P>
    </g>
  );
}

function Range() {
  const ring = (cx, cy, r) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r * 0.74} fill={C.rose} stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r * 0.5} fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r * 0.28} fill={C.rose} stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r * 0.09} fill={INK} />
    </g>
  );
  return (
    <g>
      <path d="M-420 540 H430" stroke="#9BC174" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" opacity=".8" />
      <P d={0.1}>
        <rect x="-436" y="456" width="112" height="84" fill="#C99468" stroke={INK} strokeWidth="3" />
        <path d="M-448 458 L-380 410 L-312 458Z" fill="#8A5A3B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <rect x="-398" y="486" width="34" height="54" rx="4" fill="#6E3F2B" stroke={INK} strokeWidth="2.5" />
        <rect x="-354" y="474" width="26" height="22" rx="3" fill="#BEE3F2" stroke={INK} strokeWidth="2.5" />
        <path d="M-380 410 V380" stroke={INK} strokeWidth="3" /><path className="flag" d="M-378 382 H-346 L-354 392 L-346 402 H-378Z" fill="#4F9E4A" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </P>
      <P d={0.24}>
        <path d="M-52 400 V440 M52 400 V440 M-62 440 H62" stroke={C.wood} strokeWidth="6" strokeLinecap="round" fill="none" />
        <rect x="-70" y="262" width="140" height="140" rx="12" fill="#F5DDB0" stroke={INK} strokeWidth="3" />
        {ring(0, 332, 56)}
        <g className="arrow"><path d="M0 332 L52 286" stroke={INK} strokeWidth="4" strokeLinecap="round" /><path d="M52 286 L40 288 M52 286 L50 298" stroke={C.rose} strokeWidth="4" strokeLinecap="round" /></g>
      </P>
      <P d={0.4}>
        <path d="M296 470 V540 M366 470 V540" stroke={C.wood} strokeWidth="6" strokeLinecap="round" />
        {ring(296, 450, 30)}
        {ring(366, 450, 30)}
      </P>
      <P d={0.54}>
        <path d="M330 540 V372" stroke={INK} strokeWidth="4" />
        <rect x="292" y="346" width="78" height="36" rx="8" fill={INK} />
        <text x="331" y="371" textAnchor="middle" className="tn-yr lg">10 m</text>
      </P>
      <P d={0.66}>
        <path d="M-210 300 q16 -26 32 0 t32 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity=".5" />
      </P>
    </g>
  );
}

function Hotel() {
  return (
    <g>
      <P d={0.05} className="stay">
        <rect x="-128" y="188" width="256" height="352" fill="#F4D6B0" stroke={INK} strokeWidth="3" />
        <rect x="-140" y="180" width="280" height="16" rx="4" fill={C.brick2} stroke={INK} strokeWidth="3" />
      </P>
      <P d={0.2}>
        <Windows x={-104} y={214} cols={5} rows={5} w={26} h={30} gx={22} gy={14} />
      </P>
      <P d={0.34}>
        <rect x="-110" y="124" width="220" height="48" rx="10" fill={INK} />
        <text x="0" y="158" textAnchor="middle" className="tn-sign">HOTEL KAVANA</text>
        <path d="M-60 172 V180 M60 172 V180" stroke={INK} strokeWidth="4" />
      </P>
      <P d={0.46}>
        <g className="wifi" fill="none" stroke={C.teal} strokeWidth="5" strokeLinecap="round">
          <path className="w3" d="M-26 94 q26 -22 52 0" /><path className="w2" d="M-16 106 q16 -14 32 0" /><circle className="w1" cx="0" cy="116" r="3" fill={C.teal} />
        </g>
      </P>
      <P d={0.58}>
        <ellipse cx="318" cy="534" rx="30" ry="6" fill="#B9694A" stroke={INK} strokeWidth="2.5" />
        <path className="bell" d="M292 534 C292 504 344 504 344 534Z" fill={C.sun} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="318" cy="504" r="5" fill={INK} />
      </P>
      <P d={0.68}>
        <rect x="-380" y="494" width="64" height="44" rx="4" fill="#3A3E66" stroke={INK} strokeWidth="3" />
        <rect x="-370" y="502" width="44" height="20" rx="2" fill="#BEE3F2" /><circle cx="-358" cy="530" r="3" fill={C.green} /><circle cx="-346" cy="530" r="3" fill={C.sun} />
        <path d="M-370 494 L-382 468 M-326 494 L-314 468" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="-382" cy="466" r="4" fill={C.rose} /><circle cx="-314" cy="466" r="4" fill={C.rose} />
      </P>
      <P d={0.78}>
        <rect x="372" y="496" width="38" height="42" rx="4" fill={C.lilac} stroke={INK} strokeWidth="3" />
        <rect x="380" y="486" width="22" height="10" rx="3" fill="none" stroke={INK} strokeWidth="3" />
      </P>
    </g>
  );
}

function FirstPortfolio() {
  const lines = [[24, 66, C.lilac], [24, 96, C.teal], [24, 120, C.rose], [24, 52, C.saffron], [24, 84, C.green2], [24, 108, C.blue]];
  return (
    <g>
      <P d={0.08}>
        <path d="M-120 380 V540 M120 380 V540" stroke={C.wood} strokeWidth="8" strokeLinecap="round" />
        <rect x="-170" y="206" width="340" height="180" rx="12" fill="#fff" stroke={INK} strokeWidth="3.5" />
        <path d="M-170 218 a12 12 0 0 1 12 -12 H158 a12 12 0 0 1 12 12 V232 H-170Z" fill="#EFE3CC" stroke={INK} strokeWidth="3.5" />
        <circle cx="-152" cy="219" r="4.5" fill={C.rose} /><circle cx="-137" cy="219" r="4.5" fill={C.sun} /><circle cx="-122" cy="219" r="4.5" fill={C.green} />
        <text x="0" y="224" textAnchor="middle" className="tn-bar">portfolio v1</text>
      </P>
      <P d={0.28} x>
        {lines.map(([x, w, col], k) => <rect key={k} className="typed" x={-150} y={252 + k * 17} width={w + 10} height="9" rx="4.5" fill={col} style={{ '--w': `${k * 0.12}s` }} />)}
        <rect className="cursor" x="-70" y="352" width="8" height="12" fill={INK} />
      </P>
      <P d={0.4}>
        <rect x="14" y="250" width="138" height="86" rx="8" fill="#FFF2D6" stroke={INK} strokeWidth="2.5" />
        <circle cx="48" cy="284" r="16" fill={C.saffron} stroke={INK} strokeWidth="2.5" />
        <rect x="74" y="272" width="62" height="8" rx="4" fill={INK} /><rect x="74" y="288" width="44" height="8" rx="4" fill="#9A9DB8" />
        <rect x="28" y="310" width="58" height="16" rx="8" fill={C.rose} stroke={INK} strokeWidth="2" />
      </P>
      <P d={0.5}>
        <path d="M330 300 V520" stroke={INK} strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
        <path d="M330 380 C 366 380 366 330 366 330" fill="none" stroke={C.teal} strokeWidth="4" />
        {[[330, 520], [330, 450], [330, 380], [330, 310], [366, 330]].map(([x, y], k) => <circle key={k} className="commit" cx={x} cy={y} r="9" fill={k === 4 ? C.teal : C.sun} stroke={INK} strokeWidth="3" style={{ '--w': `${k * 0.25}s` }} />)}
      </P>
      <P d={0.62}>
        <g transform="translate(-24 0)"><path d="M-396 538 H-318 L-326 526 H-388Z" fill="#9A9DB8" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="-384" y="474" width="58" height="52" rx="5" fill="#3A3E66" stroke={INK} strokeWidth="3" />
        <text x="-355" y="508" textAnchor="middle" className="tn-code xs" fill={C.sun}>{'</>'}</text></g>
      </P>
    </g>
  );
}

function Internships() {
  const tiles = [[-188, C.rose], [-96, C.teal], [-4, C.lilac], [88, C.saffron]];
  return (
    <g>
      <P d={0.08}>
        <rect x="-474" y="404" width="132" height="136" fill="#F6EBD2" stroke={INK} strokeWidth="3" />
        <path d="M-486 406 L-408 356 L-330 406Z" fill="#E9D3A2" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        {[-454, -424, -394, -364].map((x) => <rect key={x} x={x - 7} y="416" width="14" height="124" fill="#fff" stroke={INK} strokeWidth="2.5" />)}
      </P>
      <P d={0.2}>
        <g transform="translate(-408 462)"><g className="gear" style={{ animationDuration: '12s' }}><path d={gearPath(34, 10, 9)} fill={C.saffron} stroke={INK} strokeWidth="3" strokeLinejoin="round" /><circle r="11" fill="#FFF4DC" stroke={INK} strokeWidth="3" /></g></g>
      </P>
      {tiles.map(([x, col], k) => (
        <P key={x} d={0.3 + k * 0.12}>
          <g className="floaty" style={{ '--w': `${k * 0.5}s` }}>
            <rect x={x} y="318" width="76" height="62" rx="9" fill="#fff" stroke={INK} strokeWidth="3" />
            <path d={`M${x} 328 a9 9 0 0 1 9 -10 H${x + 67} a9 9 0 0 1 9 10 V338 H${x}Z`} fill={col} stroke={INK} strokeWidth="3" />
            <rect x={x + 10} y="348" width="38" height="7" rx="3.5" fill={INK} opacity=".75" /><rect x={x + 10} y="361" width="54" height="7" rx="3.5" fill="#B7B3D0" />
          </g>
        </P>
      ))}
      <P d={0.84}>
        <g transform="translate(-10 252)"><g className="gear" style={{ animationDuration: '14s' }}><path d={gearPath(30, 9, 8)} fill={C.teal} stroke={INK} strokeWidth="3" strokeLinejoin="round" /><circle r="9" fill="#FFF4DC" stroke={INK} strokeWidth="3" /></g></g>
        <g transform="translate(46 276)"><g className="gear rev" style={{ animationDuration: '10s' }}><path d={gearPath(20, 7, 6)} fill={C.rose} stroke={INK} strokeWidth="3" strokeLinejoin="round" /><circle r="6" fill="#FFF4DC" stroke={INK} strokeWidth="3" /></g></g>
      </P>
      <P d={0.96}>
        <rect x="300" y="428" width="82" height="112" rx="8" fill="#3A3E66" stroke={INK} strokeWidth="3" />
        {[444, 468, 492].map((y, k) => <g key={y}><rect x="312" y={y} width="58" height="16" rx="4" fill="#2A2D52" stroke="#6C70A0" strokeWidth="2" /><circle className="led" cx="360" cy={y + 8} r="3" fill={C.green} style={{ '--w': `${k * 0.4}s` }} /></g>)}
      </P>
    </g>
  );
}

function BuildingInPublic() {
  const bulbs = Array.from({ length: 11 }, (_, k) => {
    const t = k / 10;
    return [-330 + t * 660, 250 + Math.sin(t * Math.PI) * 54, [C.rose, C.sun, C.teal, C.lilac][k % 4]];
  });
  const days = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) days.push([c, r]);
  return (
    <g>
      <P d={0.08}>
        <g transform="rotate(-4 -190 310)">
          <rect x="-262" y="214" width="150" height="190" rx="8" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle cx="-222" cy="254" r="19" fill={C.saffron} stroke={INK} strokeWidth="3" />
          <rect x="-190" y="242" width="62" height="9" rx="4.5" fill={INK} /><rect x="-190" y="259" width="44" height="8" rx="4" fill="#9A9DB8" />
          {[292, 312, 332, 352, 372].map((y, k) => <rect key={y} x="-244" y={y} width={k % 2 ? 100 : 118} height="8" rx="4" fill={k === 0 ? C.teal : '#D5D0E8'} />)}
        </g>
      </P>
      <P d={0.22}>
        <g transform="rotate(3 180 310)">
          <rect x="108" y="222" width="152" height="172" rx="8" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <path d="M108 232 a8 8 0 0 1 8 -10 H252 a8 8 0 0 1 8 10 V256 H108Z" fill={C.rose} stroke={INK} strokeWidth="3.5" />
          <rect x="140" y="212" width="8" height="20" rx="4" fill={INK} /><rect x="220" y="212" width="8" height="20" rx="4" fill={INK} />
          {days.map(([c, r]) => <rect key={`${c}${r}`} x={122 + c * 18} y={270 + r * 26} width="12" height="14" rx="3" fill={c === 3 && r === 1 ? C.saffron : '#E6E1F2'} stroke={c === 3 && r === 1 ? INK : 'none'} strokeWidth="2" />)}
          <path d="M214 372 a14 14 0 1 1 -4 -10" fill="none" stroke={C.teal} strokeWidth="4" strokeLinecap="round" /><path d="M214 362 l-8 0 l4 -8" fill="none" stroke={C.teal} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </P>
      <P d={0.38}>
        <path d="M0 160 V232" stroke={INK} strokeWidth="3" />
        <circle className="glow" cx="0" cy="268" r="46" fill={C.sun} opacity=".28" />
        <path d="M-18 292 C -42 270 -34 240 0 236 C 34 240 42 270 18 292 V306 H-18Z" fill="#FFE17A" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M-10 306 H10 M-8 316 H8" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M-8 290 L-8 270 L0 262 L8 270 L8 290" fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </P>
      <P d={0.54}>
        <path d="M-330 250 Q0 354 330 250" fill="none" stroke={INK} strokeWidth="2.5" />
        {bulbs.map(([x, y, col], k) => <g key={k}><path d={`M${x} ${y} v10`} stroke={INK} strokeWidth="2" /><circle className="twinkle" cx={x} cy={y + 17} r="7" fill={col} stroke={INK} strokeWidth="2" style={{ '--w': `${(k % 5) * 0.35}s` }} /></g>)}
      </P>
    </g>
  );
}

function MastersUnion() {
  return (
    <g>
      <rect x="-170" y="296" width="340" height="244" fill="#F6EBD2" stroke={INK} strokeWidth="3" />
      <P d={0.08}>
        <path d="M-196 300 L0 214 L196 300Z" fill="#EBD9AE" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="-186" y="300" width="372" height="40" rx="3" fill="#E9D3A2" stroke={INK} strokeWidth="3" />
        <text x="0" y="327" textAnchor="middle" className="tn-frieze">MASTERS&apos; UNION</text>
        <circle cx="0" cy="268" r="12" fill={C.sun} stroke={INK} strokeWidth="3" />
      </P>
      <P d={0.2}>
        {[-150, -100, -50, 0, 50, 100].map((x) => <rect key={x} x={x + 6} y="342" width="30" height="198" fill="#fff" stroke={INK} strokeWidth="3" />)}
        <rect x="-190" y="530" width="380" height="12" fill={C.stone} stroke={INK} strokeWidth="3" />
      </P>
      <P d={0.34}>
        <path d="M0 214 V160" stroke={INK} strokeWidth="3" /><path className="flag" d="M2 162 H50 L40 177 L50 192 H2Z" fill={C.saffron} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </P>
      {[[-90, 118, 0], [30, 90, 0.6], [150, 130, 1.1]].map(([x, y, w], k) => (
        <P key={x} d={0.44 + k * 0.1}>
          <g className="toss" style={{ '--w': `${w}s` }}>
            <g transform={`translate(${x} ${y}) rotate(${k * 14 - 12})`}>
              <path d="M-26 0 L0 -12 L26 0 L0 12Z" fill={INK} /><path d="M-14 6 V20 C -6 26 6 26 14 20 V6" fill="#3A3E66" stroke={INK} strokeWidth="2" /><path d="M26 0 V22" stroke={C.sun} strokeWidth="3" strokeLinecap="round" /><circle cx="26" cy="24" r="3.5" fill={C.sun} />
            </g>
          </g>
        </P>
      ))}
      <P d={0.78}>
        <path d="M300 540 V360 M392 540 V360" stroke={INK} strokeWidth="4" />
        <path d="M294 358 H398 V470 L346 450 L294 470Z" fill={C.teal} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <text x="346" y="392" textAnchor="middle" className="tn-yr sm">CLASS OF</text>
        <text x="346" y="428" textAnchor="middle" className="tn-sign">2030</text>
      </P>
      <P d={0.9}><Tree x={470} y={540} k={1.05} col="#9BCB74" /></P>
    </g>
  );
}

function Delhi() {
  const towers = [[-420, 110, 300], [-390, 80, 340], [-262, 70, 280], [262, 90, 320], [336, 70, 360], [378, 70, 300]];
  return (
    <g>
      <g className="sky-line">
        {towers.map(([x, w, top], k) => (
          <g key={k}>
            <rect x={x} y={top} width={w} height={540 - top} fill="#4A4F86" stroke={INK} strokeWidth="3" />
            <Windows x={x + 10} y={top + 14} cols={Math.max(1, Math.floor((w - 10) / 22))} rows={Math.floor((540 - top - 20) / 42)} w={12} h={18} gx={10} gy={24} />
          </g>
        ))}
      </g>
      <P d={0.12}>
        <path d="M-230 300 H230" stroke={INK} strokeWidth="5" />
        <path d="M-210 300 V540 M210 300 V540" stroke={INK} strokeWidth="5" />
        <rect x="-214" y="318" width="190" height="46" rx="10" fill={C.teal} stroke={INK} strokeWidth="3.5" />
        <text x="-119" y="349" textAnchor="middle" className="tn-sign sm">ShiftsDeal</text>
        <rect x="24" y="318" width="190" height="46" rx="10" fill={C.rose} stroke={INK} strokeWidth="3.5" />
        <text x="119" y="349" textAnchor="middle" className="tn-sign sm">Bestow</text>
      </P>
      <P d={0.3}>
        <g transform="translate(-410 540)">
          <path d="M-34 0 V-190 M34 0 V-190 M-34 -40 H34 M-34 -90 H34 M-34 -140 H34 M-34 -40 L34 -90 M34 -40 L-34 -90 M-34 -90 L34 -140 M34 -90 L-34 -140" stroke="#6C70A0" strokeWidth="3.5" fill="none" />
          <g className="rocket">
            <path d="M0 -230 C 22 -210 26 -160 20 -112 H-20 C-26 -160 -22 -210 0 -230Z" fill="#fff" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M0 -230 C 10 -222 16 -210 18 -196 H-18 C-16 -210 -10 -222 0 -230Z" fill={C.rose} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <circle cx="0" cy="-168" r="11" fill="#BEE3F2" stroke={INK} strokeWidth="3" />
            <path d="M-20 -128 L-40 -100 L-20 -108Z M20 -128 L40 -100 L20 -108Z" fill={C.rose} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path className="flame" d="M-10 -112 C -12 -90 0 -70 0 -70 C 0 -70 12 -90 10 -112Z" fill={C.sun} stroke={C.saffron} strokeWidth="3" />
          </g>
        </g>
      </P>
      <P d={0.5}>
        <g className="floaty">
          <g transform="translate(262 200)">
            <rect width="62" height="112" rx="12" fill={INK} /><rect x="5" y="8" width="52" height="96" rx="8" fill="#fff" />
            <rect x="9" y="12" width="44" height="22" rx="5" fill={C.teal} /><rect x="9" y="40" width="44" height="14" rx="4" fill="#D5D0E8" /><rect x="9" y="60" width="44" height="14" rx="4" fill="#D5D0E8" /><rect x="9" y="82" width="44" height="16" rx="8" fill={C.rose} />
          </g>
        </g>
      </P>
      <P d={0.7}>
        <g className="floaty" transform="translate(0 286)">
          <path d="M0 0 C-22 -26 -22 -44 0 -52 C22 -44 22 -26 0 0Z" fill={C.rose} stroke={INK} strokeWidth="3" strokeLinejoin="round" /><circle cx="0" cy="-30" r="6" fill="#fff" />
        </g>
        <text x="0" y="214" textAnchor="middle" className="tn-hand">You are here</text>
      </P>
      <g>
        <path d="M398 578 V540" stroke={INK} strokeWidth="4" />
        <rect x="388" y="538" width="30" height="14" rx="3" fill={C.rose} stroke={INK} strokeWidth="3" />
      </g>
    </g>
  );
}

const STATIONS = [School, Varanasi, Range, Hotel, FirstPortfolio, Internships, BuildingInPublic, MastersUnion, Delhi];

const Station = memo(function Station({ n, year, built }) {
  const Scene = STATIONS[n];
  return (
    <g className={`st${built ? ' built' : ''}`} transform={`translate(${stX(n)} 0)`}>
      <Scene />
      <Platform n={n} year={year} />
    </g>
  );
});

/* ---------- layers ---------- */

const LAYER_W = stX(STATIONS.length - 1) + 1500 - LOCAL0;

export const FarLayer = memo(function FarLayer({ p }) {
  const W = (stX(STATIONS.length - 1) * p) + 3600 - LOCAL0;
  const d1 = useMemo(() => hillPath(LOCAL0, LOCAL0 + W, 470, 250, 3, 170), [W]);
  const d2 = useMemo(() => hillPath(LOCAL0, LOCAL0 + W, 520, 160, 11, 130), [W]);
  return (
    <svg width={W} height="720" viewBox={`${LOCAL0} 0 ${W} 720`} aria-hidden="true" focusable="false">
      <path d={d1} fill="#CFC3EA" /><path d={d2} fill="#B3D6C8" />
    </svg>
  );
});

export const MidLayer = memo(function MidLayer({ p }) {
  const W = (stX(STATIONS.length - 1) * p) + 3600 - LOCAL0;
  const d = useMemo(() => hillPath(LOCAL0, LOCAL0 + W, 520, 70, 21, 150), [W]);
  const trees = useMemo(() => {
    const r = rng(5);
    const out = [];
    for (let x = LOCAL0; x < LOCAL0 + W; x += 46 + r() * 70) out.push({ x, k: 0.5 + r() * 0.5, tone: r() > 0.5 });
    return out;
  }, [W]);
  return (
    <svg width={W} height="720" viewBox={`${LOCAL0} 0 ${W} 720`} aria-hidden="true" focusable="false">
      <path d={d} fill="#9CCB82" />
      {trees.map((t, k) => (
        <g key={k} transform={`translate(${t.x.toFixed(0)} ${(512 - t.k * 6).toFixed(0)}) scale(${t.k.toFixed(2)})`}>
          <rect x="-3" y="-40" width="6" height="42" fill="#7C5233" /><circle cy="-58" r="28" fill={t.tone ? '#6FB05C' : '#88C46E'} />
        </g>
      ))}
    </svg>
  );
});

// Nine stations, the ground and the rails. `i` is the current stop: stations up to it are built.
export const NearLayer = memo(function NearLayer({ i, years }) {
  const sleepers = useMemo(() => {
    let d = '';
    for (let x = LOCAL0; x < LOCAL0 + LAYER_W; x += 30) d += `M${x} 590 h16 v7 h-16Z`;
    return d;
  }, []);
  const endX = stX(STATIONS.length - 1) + 440;
  return (
    <svg width={LAYER_W} height="1100" viewBox={`${LOCAL0} 0 ${LAYER_W} 1100`} aria-hidden="true" focusable="false">
      <rect x={LOCAL0} y="520" width={LAYER_W} height="70" fill="#BFDC91" />
      <rect x={LOCAL0} y="594" width={LAYER_W} height="520" fill="#A8D27F" />
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

function Wheel({ cx, cy, r }) {
  return (
    <g className="wheel">
      <circle cx={cx} cy={cy} r={r} fill="#3A3E66" stroke={INK} strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r * 0.4} fill="#C9CCE0" stroke={INK} strokeWidth="2" />
      <path d={`M${cx - r * 0.85} ${cy} H${cx + r * 0.85} M${cx} ${cy - r * 0.85} V${cy + r * 0.85}`} stroke="#C9CCE0" strokeWidth="3" />
    </g>
  );
}

// Origin of the train svg is the middle of the middle carriage, with the rail top at y = 578.
export const Train = memo(function Train() {
  return (
    <svg className="train" width="1200" height="720" viewBox="-460 0 1200 720" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="tn-win"><rect x="-34" y="462" width="62" height="40" rx="6" /></clipPath>
        <radialGradient id="tn-beam"><stop offset="0" stopColor="#FFF3B0" stopOpacity=".9" /><stop offset=".6" stopColor="#FFF3B0" stopOpacity=".35" /><stop offset="1" stopColor="#FFF3B0" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="0" cy="581" rx="250" ry="6" fill="rgba(0,0,0,.18)" />
      <ellipse className="beam" cx="350" cy="528" rx="140" ry="46" fill="url(#tn-beam)" />
      <g className="tr-body">
        {/* rear carriage */}
        <rect x="-200" y="450" width="124" height="108" rx="12" fill={C.teal} stroke={INK} strokeWidth="3.5" />
        <rect x="-200" y="500" width="124" height="9" fill={C.cream} />
        <rect x="-204" y="442" width="132" height="12" rx="6" fill="#16807B" stroke={INK} strokeWidth="3" />
        {[-188, -154, -120, -92].map((x) => <rect key={x} x={x} y="464" width="22" height="30" rx="4" fill={C.glass} stroke={INK} strokeWidth="2.5" />)}
        <rect x="-200" y="552" width="124" height="10" fill="#2A2D52" stroke={INK} strokeWidth="2.5" />
        {/* middle carriage with the traveller */}
        <rect x="-66" y="450" width="140" height="108" rx="12" fill={C.saffron} stroke={INK} strokeWidth="3.5" />
        <rect x="-66" y="500" width="140" height="9" fill={C.cream} />
        <rect x="-70" y="442" width="148" height="12" rx="6" fill="#C98714" stroke={INK} strokeWidth="3" />
        <rect x="-34" y="462" width="62" height="40" rx="6" fill="#BEE3F2" />
        <g clipPath="url(#tn-win)">
          <image className="tr-me" href="/me-avatar.webp" x="-34" y="466" width="62" height="184" preserveAspectRatio="xMidYMin slice" />
          <g className="tr-pane">
            <rect x="-34" y="462" width="62" height="40" fill="#BEE3F2" opacity=".22" />
            <path d="M-24 464 L-8 464 L-24 496 L-34 496 L-34 480Z M2 464 L10 464 L-6 496 L-14 496Z" fill="#fff" opacity=".4" />
            <rect x="-34" y="497" width="62" height="5" fill="#8FB9CC" /><rect x="-34" y="497" width="62" height="1.5" fill="#fff" opacity=".6" />
          </g>
        </g>
        <rect x="-34" y="462" width="62" height="40" rx="6" fill="none" stroke={INK} strokeWidth="3" />
        <rect x="40" y="464" width="22" height="30" rx="4" fill={C.glass} stroke={INK} strokeWidth="2.5" />
        <rect x="-60" y="464" width="20" height="30" rx="4" fill={C.glass} stroke={INK} strokeWidth="2.5" />
        <rect x="-66" y="552" width="140" height="10" fill="#2A2D52" stroke={INK} strokeWidth="2.5" />
        {/* locomotive */}
        <path d="M84 448 H138 V556 H84Z" fill={C.rose} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M78 438 H146 V452 H78Z" fill="#B53A44" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <rect x="96" y="460" width="30" height="30" rx="5" fill={C.glass} stroke={INK} strokeWidth="2.5" />
        <path d="M138 480 H196 C 206 480 210 490 210 500 V556 H138Z" fill="#C93E4A" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="170" y="436" width="18" height="46" rx="3" fill="#2A2D52" stroke={INK} strokeWidth="3" />
        <rect x="164" y="428" width="30" height="12" rx="5" fill="#2A2D52" stroke={INK} strokeWidth="3" />
        <circle cx="152" cy="480" r="9" fill={C.sun} stroke={INK} strokeWidth="2.5" />
        <circle cx="206" cy="510" r="8" fill={C.glass} stroke={INK} strokeWidth="2.5" />
        <path d="M210 556 L232 570 H210Z" fill="#2A2D52" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <rect x="140" y="540" width="62" height="6" rx="3" fill={C.cream} />
        {/* couplers */}
        <rect x="-76" y="538" width="12" height="8" fill={INK} /><rect x="74" y="538" width="12" height="8" fill={INK} />
        <g className="smoke">
          <circle className="pf p1" cx="179" cy="420" r="9" fill="#fff" />
          <circle className="pf p2" cx="179" cy="420" r="9" fill="#fff" />
          <circle className="pf p3" cx="179" cy="420" r="9" fill="#fff" />
        </g>
      </g>
      <Wheel cx={-170} cy={568} r={11} /><Wheel cx={-106} cy={568} r={11} />
      <Wheel cx={-30} cy={568} r={11} /><Wheel cx={40} cy={568} r={11} />
      <Wheel cx={108} cy={562} r={16} /><Wheel cx={150} cy={562} r={16} /><Wheel cx={188} cy={562} r={16} />
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
      {[[6, 14, 1], [32, 8, 0.7], [58, 18, 0.9], [82, 10, 1.1]].map(([l, t, k], n) => (
        <svg key={n} className="sk-cloud" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${-n * 19}s`, animationDuration: `${120 + n * 14}s` }} width={150 * k} height={56 * k} viewBox="0 0 150 56" aria-hidden="true" focusable="false">
          <path d="M18 50 C2 50 0 30 18 28 C18 8 46 6 54 22 C62 4 96 6 98 26 C118 22 136 34 126 50Z" fill="#fff" />
        </svg>
      ))}
    </>
  );
}
