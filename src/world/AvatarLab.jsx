import React, { useEffect, useRef, useState } from 'react';
import { MeFigure } from './Avatar';
import Avatar3D from './Avatar3D';
import { attachGaze, reactAvatar } from './avatarLife';
import './world.css';
import './world2.css';
import './world3.css';

// Unlinked lab page (/lab/avatar): the animated 3D avatar big, with a button per reaction, plus the old
// hand-drawn looks for comparison.
const LOOKS = [
  ['a', 'A  Painted: soft shading, rim light, waving'],
  ['b', 'B  Bold: ink outline, flat colour, waving'],
  ['c', 'C  Calm: hand on hip, closed smile, head tilted'],
];
const ACTS = ['nod', 'hop', 'tilt', 'lookup'];

export default function AvatarLab() {
  const [theme, setTheme] = useState('day');
  const big = useRef(null);
  useEffect(() => attachGaze(big.current?.querySelector('.a3')), []);
  return (
    <div className="w-root w-flat lab-av" data-theme={theme} style={{ minHeight: '100vh', padding: '24px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1300, margin: '0 auto 18px' }}>
        <h1 style={{ fontSize: 28 }}>Avatar</h1>
        <button className="btn-ghost" style={{ margin: 0 }} onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}>Switch to {theme === 'day' ? 'night' : 'day'}</button>
      </div>
      <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div ref={big} style={{ position: 'relative', width: 340, height: 1010, background: 'var(--sky2)', borderRadius: 24, border: '2px solid var(--ink)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '15%', top: '3%', width: '70%', height: '94%' }}><Avatar3D /></div>
        </div>
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <p style={{ font: '700 18px var(--sans)' }}>Move the mouse: his head follows. Click a reaction:</p>
          {ACTS.map((a) => <button key={a} className="btn-ghost" style={{ margin: 0 }} onClick={() => reactAvatar(big.current.querySelector('.a3'), a)}>{a}</button>)}
          <button className="btn-ghost" style={{ margin: 0 }} onClick={() => { const e = big.current.querySelector('.a3'); e.dataset.walk = e.dataset.walk === '1' ? '0' : '1'; }}>toggle walking</button>
        </div>
      </div>
      <h2 style={{ maxWidth: 1300, margin: '34px auto 12px', fontSize: 22 }}>Old hand-drawn looks</h2>
      <div className="lab-row">
        {LOOKS.map(([k, label]) => (
          <figure key={k} className="lab-card">
            <svg viewBox="-110 -340 230 358" role="img" aria-label={label}>
              <rect x="-110" y="-340" width="230" height="358" fill="var(--sky2)" />
              <ellipse cx="0" cy="40" rx="190" ry="70" fill="var(--hill1)" />
              <MeFigure look={k} id="lab" />
            </svg>
            <figcaption>{label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
