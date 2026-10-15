import React from 'react';

// Quiet decoration for the margins of a section: sparkles, rings, squiggles and a paper plane that bob, turn
// and drift at their own speed as you scroll. Original shapes, no images. They sit behind the content.

const SHAPES = {
  star: <path d="M12 1 L14.4 9.6 L23 12 L14.4 14.4 L12 23 L9.6 14.4 L1 12 L9.6 9.6Z" fill="currentColor" />,
  plus: <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" fill="none" />,
  ring: <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="3" fill="none" />,
  dot: <circle cx="12" cy="12" r="6" fill="currentColor" />,
  squig: <path d="M2 14 q4 -9 8 0 t8 0 t6 -2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />,
  tri: <path d="M12 3 L22 20 L2 20Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none" />,
  plane: <path d="M2 11 L22 2 L15 22 L11 14Z M11 14 L22 2" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" fill="none" />,
  burst: <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none" />,
};

const COL = { r: 'var(--rose-c)', t: 'var(--teal-c)', l: 'var(--lilac-c)', s: 'var(--saffron)', y: 'var(--sun-c)', k: 'var(--sky-c)' };

// [shape, left %, top %, size px, colour, parallax speed, motion (bob | spin), seconds]
const SETS = {
  story: [['star', 4, 14, 30, 'y', 0.5, 'spin', 14], ['plus', 94, 30, 24, 't', -0.4, 'bob', 7], ['squig', 8, 78, 52, 'r', 0.3, 'bob', 8], ['ring', 90, 80, 30, 'l', -0.6, 'bob', 9]],
  work: [['star', 5, 22, 26, 'l', 0.4, 'spin', 16], ['squig', 92, 18, 54, 's', -0.3, 'bob', 8], ['plus', 7, 82, 24, 'r', 0.5, 'bob', 7], ['burst', 93, 72, 30, 't', -0.5, 'spin', 18]],
  brand: [['plane', 90, 12, 40, 'k', -0.5, 'bob', 8], ['star', 4, 30, 24, 'y', 0.4, 'spin', 15], ['ring', 6, 84, 28, 'r', 0.3, 'bob', 9], ['dot', 95, 62, 20, 'l', -0.3, 'bob', 6]],
  flag: [['burst', 46, 8, 32, 's', 0.4, 'spin', 20], ['star', 95, 16, 28, 'l', -0.4, 'spin', 14], ['squig', 4, 86, 52, 't', 0.3, 'bob', 8]],
  stack: [['star', 7, 20, 28, 'y', 0.5, 'spin', 13], ['tri', 93, 28, 28, 'r', -0.4, 'bob', 8], ['plus', 5, 76, 26, 't', 0.4, 'bob', 7], ['ring', 94, 78, 30, 'l', -0.5, 'bob', 9]],
  process: [['squig', 6, 14, 56, 'l', 0.4, 'bob', 8], ['star', 93, 20, 30, 'y', -0.5, 'spin', 15], ['burst', 7, 86, 30, 'r', 0.3, 'spin', 19], ['plus', 94, 80, 24, 't', -0.4, 'bob', 7]],
  life: [['star', 3, 18, 30, 'r', 0.5, 'spin', 14], ['plane', 94, 24, 40, 't', -0.4, 'bob', 9], ['ring', 4, 88, 28, 'y', 0.3, 'bob', 8], ['squig', 90, 88, 54, 'l', -0.3, 'bob', 7]],
  wall: [['plus', 5, 20, 26, 's', 0.4, 'bob', 7], ['star', 94, 26, 30, 'k', -0.5, 'spin', 15], ['dot', 6, 80, 22, 'r', 0.3, 'bob', 6], ['burst', 93, 84, 28, 'y', -0.4, 'spin', 18]],
  hello: [['star', 8, 18, 30, 'r', 0.4, 'spin', 14], ['plane', 90, 16, 42, 'l', -0.5, 'bob', 8], ['ring', 6, 70, 30, 'y', 0.3, 'bob', 9], ['squig', 88, 74, 56, 't', -0.3, 'bob', 8]],
};

export default function Floaters({ set }) {
  const items = SETS[set] || [];
  return (
    <div className="fls" aria-hidden="true">
      {items.map(([k, x, y, s, c, par, mo, dur], i) => (
        <span key={i} className="fl" data-par={par} style={{ left: `${x}%`, top: `${y}%`, ['--s']: `${s}px`, ['--c']: COL[c] }}>
          <svg className={`fl-i ${mo}`} viewBox="0 0 24 24" style={{ animationDuration: `${dur}s`, animationDelay: `${-i * 1.7}s` }} focusable="false">{SHAPES[k]}</svg>
        </span>
      ))}
    </div>
  );
}
