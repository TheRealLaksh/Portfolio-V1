import React, { useState } from 'react';
import { MeFigure } from './Avatar';
import './world.css';
import './world2.css';
import './world3.css';

// Unlinked lab page (/lab/avatar): the avatar looks side by side, day and night, big and at hero size.
const LOOKS = [
  ['a', 'A  Painted: soft shading, rim light, waving'],
  ['b', 'B  Bold: ink outline, flat colour, waving'],
  ['c', 'C  Calm: hand on hip, closed smile, head tilted'],
];

export default function AvatarLab() {
  const [theme, setTheme] = useState('day');
  return (
    <div className="w-root w-flat lab-av" data-theme={theme} style={{ minHeight: '100vh', padding: '24px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1300, margin: '0 auto 18px' }}>
        <h1 style={{ fontSize: 28 }}>Avatar looks</h1>
        <button className="btn-ghost" style={{ margin: 0 }} onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}>Switch to {theme === 'day' ? 'night' : 'day'}</button>
      </div>
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
      <div className="lab-row small">
        {LOOKS.map(([k]) => (
          <svg key={k} viewBox="-110 -340 230 358" width="150" role="img" aria-label={`Look ${k.toUpperCase()} at hero size`}>
            <rect x="-110" y="-340" width="230" height="358" fill="var(--sky2)" />
            <ellipse cx="0" cy="40" rx="190" ry="70" fill="var(--hill1)" />
            <MeFigure look={k} id="lab-s" />
          </svg>
        ))}
      </div>
    </div>
  );
}
