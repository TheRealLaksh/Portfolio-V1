import React from 'react';

// Laksh, drawn by hand in SVG. Reference: public/me.webp (dark swept-up hair with a loose fringe, warm wheatish skin,
// strong brows, a big easy smile, black kurta with a short placket and tiny blue-white sequins; he is 18).
//
// Local space: origin at the ground between the feet, +y down, figure about 296 units tall.
// Three looks share one body:
//   a  "paint": soft shading, rim light, waving
//   b  "bold":  thick ink outline and flat colour, to match the flat valley art, waving
//   c  "calm":  painterly, hand on hip, relaxed closed smile, head tilted

const INK = '#1B1F3B';

// A fixed scatter of sequins on the kurta (deterministic, so the art never changes between renders).
const SEQ = (() => {
  let a = 29;
  const r = () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
  const cols = ['#9DBDFF', '#FFFFFF', '#B9A8FF', '#7FD3FF'];
  return Array.from({ length: 46 }, (_, i) => {
    const y = -216 + r() * 112;
    const half = 33 + (y + 216) * 0.1;
    return { x: (r() * 2 - 1) * half * 0.92, y, r: 0.7 + r() * 1.1, c: cols[i % 4], d: r() * 3 };
  });
})();

function Defs({ u }) {
  return (
    <defs>
      <linearGradient id={`${u}skin`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#E7B88F" />
        <stop offset="0.6" stopColor="#D9A276" />
        <stop offset="1" stopColor="#C58A62" />
      </linearGradient>
      <linearGradient id={`${u}kurta`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#0E0F20" />
        <stop offset="0.55" stopColor="#1B1C36" />
        <stop offset="1" stopColor="#2B2D52" />
      </linearGradient>
      <linearGradient id={`${u}jeans`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#35507F" />
        <stop offset="0.6" stopColor="#4A6BA3" />
        <stop offset="1" stopColor="#5E80B8" />
      </linearGradient>
      <linearGradient id={`${u}hair`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#4A3532" />
        <stop offset="0.5" stopColor="#2A1D1E" />
        <stop offset="1" stopColor="#171011" />
      </linearGradient>
      <radialGradient id={`${u}cheek`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#E8505B" stopOpacity=".42" />
        <stop offset="1" stopColor="#E8505B" stopOpacity="0" />
      </radialGradient>
      <filter id={`${u}blur`} x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="4" /></filter>
    </defs>
  );
}

function Legs({ u, bold }) {
  const o = bold ? { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' } : {};
  const jeans = bold ? '#4A6BA3' : `url(#${u}jeans)`;
  return (
    <g>
      <path d="M-31 -132 C-30 -100 -28 -80 -26 -64 C-25 -44 -23 -28 -22 -14 L-7 -14 C-8 -30 -8 -50 -8 -66 C-7 -86 -4 -110 -1 -130Z" fill={jeans} {...o} />
      <path d="M1 -130 C4 -110 8 -86 9 -66 C10 -48 9 -30 9 -14 L25 -14 C25 -28 27 -46 28 -64 C30 -82 32 -104 33 -132Z" fill={jeans} {...o} />
      {!bold && (
        <>
          <path d="M-26 -120 C-24 -96 -21 -70 -19 -40" stroke="#2A4170" strokeWidth="1.2" fill="none" opacity=".55" />
          <path d="M24 -120 C24 -96 22 -70 21 -40" stroke="#2A4170" strokeWidth="1.2" fill="none" opacity=".55" />
          <path d="M-14 -90 C-12 -70 -13 -50 -14 -30" stroke="#7FA0D6" strokeWidth="2.2" fill="none" opacity=".35" strokeLinecap="round" />
          <path d="M18 -90 C20 -70 20 -50 20 -30" stroke="#8FB0E4" strokeWidth="2.2" fill="none" opacity=".4" strokeLinecap="round" />
          <path d="M-24 -46 q9 5 17 0 M10 -46 q9 5 17 0" stroke="#2A4170" strokeWidth="1.1" fill="none" opacity=".4" />
        </>
      )}
      {/* sneakers */}
      <path d="M-24 -16 H-7 L-6 -8 C-6 -3 2 -3 5 3 L5 7 H-28 L-29 -4 C-29 -10 -26 -14 -24 -16Z" fill="#F6F2E8" {...o} />
      <path d="M-29 3 H6 V9 Q-12 11 -29 9Z" fill="#DAD3C2" {...o} />
      <path d="M-22 -8 H-8" stroke="#E8505B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M9 -16 H26 L28 -4 C28 0 31 4 37 6 L37 9 H6 L6 4 C8 2 8 -6 9 -16Z" fill="#F6F2E8" {...o} />
      <path d="M6 5 H38 V11 Q20 13 6 11Z" fill="#DAD3C2" {...o} />
      <path d="M12 -8 H26" stroke="#E8505B" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function Torso({ u, bold }) {
  const o = bold ? { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' } : {};
  const body = 'M-34 -222 C-24 -229 -10 -231 0 -231 C10 -231 24 -229 34 -222 C38 -200 38 -170 40 -140 C42 -125 44 -112 47 -98 C20 -91 -20 -91 -47 -98 C-44 -112 -42 -125 -40 -140 C-38 -170 -38 -200 -34 -222Z';
  return (
    <g>
      <path d={body} fill={bold ? '#1F2142' : `url(#${u}kurta)`} {...o} />
      {!bold && (
        <>
          {/* folds */}
          <path d="M-30 -150 C-26 -130 -25 -114 -29 -98" stroke="#07070F" strokeWidth="3" fill="none" opacity=".45" strokeLinecap="round" />
          <path d="M-14 -176 C-10 -150 -12 -122 -15 -96" stroke="#07070F" strokeWidth="2.4" fill="none" opacity=".32" strokeLinecap="round" />
          <path d="M18 -170 C22 -146 22 -120 25 -96" stroke="#07070F" strokeWidth="2.6" fill="none" opacity=".3" strokeLinecap="round" />
          <path d="M-6 -112 C-2 -104 4 -102 9 -96" stroke="#07070F" strokeWidth="2" fill="none" opacity=".3" strokeLinecap="round" />
          {/* sheen on the sun side */}
          <path d="M28 -216 C33 -192 34 -168 37 -142 C39 -126 41 -112 44 -100" stroke="#6C70BC" strokeWidth="4" fill="none" opacity=".5" strokeLinecap="round" />
          <path d="M-24 -214 C-30 -190 -31 -166 -34 -142" stroke="#3B3E78" strokeWidth="3" fill="none" opacity=".5" strokeLinecap="round" />
          {/* hem */}
          <path d="M-47 -98 C-20 -91 20 -91 47 -98" stroke="#3A3C6E" strokeWidth="2.2" fill="none" opacity=".7" />
          {/* sequins */}
          {SEQ.map((s, i) => <circle key={i} className="sq" cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill={s.c} style={{ animationDelay: `${s.d.toFixed(2)}s` }} />)}
        </>
      )}
      {bold && SEQ.slice(0, 16).map((s, i) => <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={(s.r * 1.1).toFixed(2)} fill={s.c} opacity=".9" />)}
      {/* neck opening and collar */}
      <path d="M-10 -230 Q0 -223 10 -230 L0 -202Z" fill={bold ? '#D9A276' : `url(#${u}skin)`} />
      <path d="M-10 -230 Q0 -223 10 -230 L0 -202Z" fill="#7A4630" opacity=".25" />
      <path d="M-11 -231 L0 -200 M11 -231 L0 -200" stroke={bold ? '#8E92D6' : '#3D4079'} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M0 -200 V-176" stroke={bold ? '#8E92D6' : '#3D4079'} strokeWidth="1.8" strokeLinecap="round" />
      {[-194, -184, -175].map((y) => <circle key={y} cx="0" cy={y} r="1.7" fill="#8E7CFF" />)}
    </g>
  );
}

// Neck and head. `tilt` rotates the head about the base of the neck.
function Head({ u, bold, calm, tilt = 0 }) {
  const o = bold ? { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' } : {};
  const skin = bold ? '#DDA67B' : `url(#${u}skin)`;
  const hair = bold ? '#2A1D1E' : `url(#${u}hair)`;
  const scale = bold ? 1.2 : 1.1;
  return (
    <g transform={`translate(0 -232) rotate(${tilt}) scale(${scale}) translate(0 232)`}>
      {/* neck */}
      <path d="M-8 -246 L8 -246 L9.5 -228 Q0 -222 -9.5 -228Z" fill={skin} {...o} />
      {!bold && <path d="M-8 -240 Q0 -232 8 -240 L9 -230 Q0 -224 -9 -230Z" fill="#7A4630" opacity=".28" />}
      {/* ears */}
      <ellipse cx="-18.4" cy="-259" rx="3.6" ry="6.2" fill={skin} {...o} />
      <ellipse cx="18.4" cy="-259" rx="3.6" ry="6.2" fill={skin} {...o} />
      {!bold && <path d="M-19 -262 Q-17 -259 -19 -255 M19 -262 Q17 -259 19 -255" stroke="#A9694A" strokeWidth="1" fill="none" opacity=".6" />}
      {/* face */}
      <path d="M-17.5 -262 C-18.5 -250 -15.5 -241.5 -7 -238.4 C-3 -237 3 -237 7 -238.4 C15.5 -241.5 18.5 -250 17.5 -262 C16.5 -277 8 -284 0 -284 C-8 -284 -16.5 -277 -17.5 -262Z" fill={skin} {...o} />
      {!bold && (
        <>
          {/* soft shading: sun from the upper right */}
          <path d="M-17.5 -262 C-18.5 -250 -15.5 -241.5 -7 -238.4 C-9 -246 -12 -254 -11 -262 C-11 -272 -7 -279 0 -283 C-8 -284 -16.5 -277 -17.5 -262Z" fill="#9C5E3E" opacity=".14" />
          <path d="M-12 -243 C-8 -238.6 -2 -237.4 3 -238 C-1 -235.6 -9 -236 -12 -243Z" fill="#7A4630" opacity=".18" />
          <path d="M16 -264 C17.5 -252 15 -243 7 -239" stroke="#FFE3B6" strokeWidth="1.2" fill="none" opacity=".4" strokeLinecap="round" />
          {/* faint stubble shadow along the jaw */}
          <path d="M-14 -249 C-12 -242 -6 -239.4 0 -239.2 C6 -239.4 12 -242 14 -249 C10 -243 4 -241.4 0 -241.4 C-4 -241.4 -10 -243 -14 -249Z" fill="#4A2B22" opacity=".12" />
          <ellipse cx="-11.4" cy="-250.6" rx="5" ry="3.2" fill={`url(#${u}cheek)`} />
          <ellipse cx="11.4" cy="-250.6" rx="5" ry="3.2" fill={`url(#${u}cheek)`} />
        </>
      )}
      {bold && (
        <>
          <ellipse cx="-11" cy="-250" rx="3.6" ry="2.3" fill="#E8505B" opacity=".4" />
          <ellipse cx="11" cy="-250" rx="3.6" ry="2.3" fill="#E8505B" opacity=".4" />
        </>
      )}
      {/* brows */}
      <path d={calm ? 'M-12.4 -268.6 C-9.6 -271.2 -4.8 -271 -2.4 -268.8' : 'M-12.4 -269.6 C-9.6 -272.4 -4.6 -272 -2.2 -269'} stroke="#1C1416" strokeWidth={bold ? 3 : 2.2} strokeLinecap="round" fill="none" />
      <path d={calm ? 'M2.4 -268.8 C4.8 -271 9.6 -271.2 12.4 -268.6' : 'M2.2 -269 C4.6 -272 9.6 -272.4 12.4 -269.6'} stroke="#1C1416" strokeWidth={bold ? 3 : 2.2} strokeLinecap="round" fill="none" />
      {/* eyes */}
      {[-1, 1].map((sx) => (
        <g key={sx} transform={`translate(${sx * 7.6} -261.4)`}>
          {bold ? (
            <>
              <ellipse cx="0" cy="0" rx="3.3" ry="3.7" fill={INK} />
              <circle cx={sx * -0.2 + 0.9} cy="-1.2" r="1.15" fill="#fff" />
              <circle cx={sx * -0.2 - 1} cy="1.2" r=".55" fill="#fff" opacity=".8" />
            </>
          ) : (
            <>
              <path d="M-5.4 0 C-3.6 -4.2 3.6 -4.2 5.4 0 C3.6 3 -3.6 3 -5.4 0Z" fill="#FBF7F0" />
              <circle cx={sx * 0.2} cy="-.2" r="2.9" fill="#4A2D1E" />
              <circle cx={sx * 0.2} cy="-.2" r="1.35" fill="#140B08" />
              <circle cx={sx * 0.2 + 1} cy="-1.2" r=".95" fill="#fff" />
              <path d="M-5.4 0.2 C-3.6 -4.4 3.6 -4.4 5.4 0.2" stroke="#150D0C" strokeWidth="1.7" fill="none" strokeLinecap="round" />
              <path d="M-4.2 2.2 C-2 3.4 2 3.4 4.2 2.2" stroke="#A9694A" strokeWidth=".9" fill="none" opacity=".55" strokeLinecap="round" />
            </>
          )}
        </g>
      ))}
      {/* nose */}
      <path d="M0.4 -262 C-0.6 -255 -2.6 -251.6 -3.2 -249.4 C-1.4 -247.6 1.6 -247.6 3.2 -249.4" stroke={bold ? INK : '#A9694A'} strokeWidth={bold ? 1.8 : 1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={bold ? 0.85 : 0.75} />
      {!bold && <path d="M-2.6 -249 q.6 .8 1.4 .6 M2.6 -249 q-.6 .8 -1.4 .6" stroke="#7A4630" strokeWidth=".9" fill="none" opacity=".6" strokeLinecap="round" />}
      {/* mouth */}
      {calm ? (
        <>
          <path d="M-7 -245.6 C-3.6 -242.4 3.6 -242.4 7 -245.6" stroke="#7A3B2E" strokeWidth={bold ? 2 : 1.8} fill="none" strokeLinecap="round" />
          <path d="M-7 -245.6 q-1.6 -.4 -2 -1.8 M7 -245.6 q1.6 -.4 2 -1.8" stroke="#A9694A" strokeWidth="1" fill="none" opacity=".6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M-8.2 -246.8 C-4.4 -243.2 4.4 -243.2 8.2 -246.8 C6.2 -240.8 -6.2 -240.8 -8.2 -246.8Z" fill="#7F2A35" stroke={bold ? INK : 'none'} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M-6.6 -246.2 C-3 -244.8 3 -244.8 6.6 -246.2 C4.2 -243.7 -4.2 -243.7 -6.6 -246.2Z" fill="#fff" />
          <path d="M-8.4 -247 q-1.6 -.2 -2.2 -1.8 M8.4 -247 q1.6 -.2 2.2 -1.8" stroke={bold ? INK : '#A9694A'} strokeWidth="1.1" fill="none" opacity=".7" strokeLinecap="round" />
        </>
      )}
      {/* hair: tall swept-up volume, loose locks on top, a textured fringe across the forehead */}
      <path d="M-18.6 -254 C-24.4 -268 -24 -288 -14 -298 C-6 -304 8 -305 18 -300 C27 -294 26 -276 20.4 -256 C19.8 -262 18.4 -268 16.4 -271 C10 -266.4 0 -268.6 -8 -271.6 C-13 -270 -16 -262 -17.2 -255Z" fill={hair} {...o} />
      <path d="M-9 -300 C-2 -310 12 -310 22 -299 C14 -302 4 -301 -9 -300Z M-17 -292 C-18 -300 -12 -304 -6 -302Z" fill={hair} {...o} />
      <path d="M16 -271 C12 -262 8 -262 5 -267 C1 -262 -4 -263 -7 -269Z" fill={hair} {...o} />
      {!bold && (
        <>
          <path d="M-13 -293 C-7 -302 7 -304 15 -296" stroke="#8C6A60" strokeWidth="2.2" fill="none" opacity=".6" strokeLinecap="round" />
          <path d="M-4 -297 C2 -302 10 -301 14 -294" stroke="#A5827A" strokeWidth="1.3" fill="none" opacity=".5" strokeLinecap="round" />
          <path d="M-18 -276 C-20 -285 -17 -293 -12 -298" stroke="#0E0809" strokeWidth="2" fill="none" opacity=".45" strokeLinecap="round" />
          <path d="M10 -268 C4 -265 -2 -267 -6 -270" stroke="#8C6A60" strokeWidth="1.2" fill="none" opacity=".5" strokeLinecap="round" />
          <path d="M23 -290 C25 -282 24 -270 21.6 -260" stroke="#FFD9A0" strokeWidth="1.1" fill="none" opacity=".4" strokeLinecap="round" />
        </>
      )}
      {bold && (
        <path d="M-12 -292 C-6 -299 6 -300 13 -293 M-3 -268 C1 -270 5 -269 8 -268" stroke="#6A4C47" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".9" />
      )}
    </g>
  );
}

function ArmWave({ u, bold }) {
  const sleeve = bold ? '#1F2142' : '#17182B';
  const rim = bold ? '#8E92D6' : '#4B4E8A';
  const skin = bold ? '#DDA67B' : `url(#${u}skin)`;
  const o = bold ? { stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round', strokeLinecap: 'round' } : {};
  return (
    <g>
      <ellipse cx="33" cy="-213" rx="8.5" ry="9" fill={sleeve} {...o} />
      {/* upper arm */}
      {bold && <path d="M32 -212 Q58 -212 64 -186" stroke={INK} strokeWidth="19" fill="none" strokeLinecap="round" />}
      <path d="M32 -212 Q58 -212 64 -186" stroke={sleeve} strokeWidth="15" fill="none" strokeLinecap="round" />
      {!bold && <path d="M34 -218 Q58 -218 69 -190" stroke={rim} strokeWidth="2.2" fill="none" opacity=".55" strokeLinecap="round" />}
      {/* forearm and hand wave around the elbow */}
      <g className="wave" style={{ transformOrigin: '64px -186px' }}>
        {bold && <path d="M64 -186 Q73 -212 70 -236" stroke={INK} strokeWidth="17" fill="none" strokeLinecap="round" />}
        <path d="M64 -186 Q73 -212 70 -236" stroke={sleeve} strokeWidth="13" fill="none" strokeLinecap="round" />
        {!bold && <path d="M69 -190 Q77 -212 74 -234" stroke={rim} strokeWidth="2" fill="none" opacity=".5" strokeLinecap="round" />}
        <path d="M63 -240 L77 -240 L76 -233 L64 -233Z" fill={bold ? '#8E92D6' : '#3D4079'} opacity=".8" />
        {/* open hand */}
        <path d="M62.4 -243 C60 -250 62 -258 70 -258 C78 -258 80.4 -250 78 -243 C76 -238 64.4 -238 62.4 -243Z" fill={skin} {...o} />
        <path d="M63.4 -253 L60.4 -265 M67.4 -257 L66 -270 M71.4 -258 L72 -271 M75.4 -255 L79 -266" stroke={bold ? INK : '#D9A276'} strokeWidth={bold ? 6.6 : 3.8} fill="none" strokeLinecap="round" />
        {bold && <path d="M63.4 -253 L60.4 -265 M67.4 -257 L66 -270 M71.4 -258 L72 -271 M75.4 -255 L79 -266" stroke="#DDA67B" strokeWidth="3" fill="none" strokeLinecap="round" />}
        <path d="M63 -246 L56 -249" stroke={bold ? INK : '#D9A276'} strokeWidth={bold ? 6.2 : 4} fill="none" strokeLinecap="round" />
        {bold && <path d="M63 -246 L56 -249" stroke="#DDA67B" strokeWidth="2.6" fill="none" strokeLinecap="round" />}
      </g>
    </g>
  );
}

function ArmDown({ u, bold, hip = false, side = 1 }) {
  const sleeve = bold ? '#1F2142' : '#17182B';
  const rim = bold ? '#8E92D6' : '#4B4E8A';
  const skin = bold ? '#DDA67B' : `url(#${u}skin)`;
  const o = bold ? { stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round' } : {};
  const x = side;
  // hanging arm, or bent with the hand resting on the hip
  const d = hip ? `M${x * 33} -212 Q${x * 58} -190 ${x * 46} -156 Q${x * 40} -142 ${x * 30} -136` : `M${x * 33} -212 Q${x * 48} -198 ${x * 45} -164 Q${x * 44} -140 ${x * 42} -120`;
  const hand = hip ? [x * 29, -134] : [x * 41, -108];
  return (
    <g>
      {bold && <path d={d} stroke={INK} strokeWidth="19" fill="none" strokeLinecap="round" />}
      <path d={d} stroke={sleeve} strokeWidth="14.5" fill="none" strokeLinecap="round" />
      {!bold && <path d={d} stroke={rim} strokeWidth="2" fill="none" opacity={x > 0 ? 0.5 : 0.28} strokeLinecap="round" transform={`translate(${x * 5.2} -1.4)`} />}
      <ellipse cx={hand[0]} cy={hand[1]} rx="6.8" ry="9.4" fill={skin} {...o} transform={`rotate(${hip ? 60 * x : 0} ${hand[0]} ${hand[1]})`} />
      {!bold && !hip && <path d={`M${hand[0] - 2} -112 v8 M${hand[0] + 2} -112 v8`} stroke="#A9694A" strokeWidth=".9" opacity=".6" />}
    </g>
  );
}

// look: 'a' paint + wave | 'b' bold + wave | 'c' calm: hand on hip, closed smile, head tilted
export function MeFigure({ look = 'a', id = 'me' }) {
  const bold = look === 'b';
  const calm = look === 'c';
  const u = `${id}-${look}-`;
  return (
    <g>
      <Defs u={u} />
      <ellipse cx="2" cy="9" rx="44" ry="7" fill={INK} opacity=".28" filter={`url(#${u}blur)`} />
      <Legs u={u} bold={bold} />
      {/* the arm on the left sits behind the kurta, the other in front of it */}
      <ArmDown u={u} bold={bold} side={-1} hip={calm} />
      <Torso u={u} bold={bold} />
      {calm ? <ArmDown u={u} bold={bold} side={1} /> : <ArmWave u={u} bold={bold} />}
      <Head u={u} bold={bold} calm={calm} tilt={calm ? -4 : 0} />
    </g>
  );
}

export default MeFigure;
