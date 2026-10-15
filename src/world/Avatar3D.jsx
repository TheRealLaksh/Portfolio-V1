import React from 'react';
import './avatar3d.css';

// Laksh's 3D avatar (public/me-avatar.webp, 302 x 898, transparent) as a little puppet. The one picture is cut
// into three pieces with clip-path, each a copy of the same image, so they line up pixel for pixel:
//   legs   (below the waist, stays put)
//   torso  (neck to waist, breathes)
//   head   (hair to the base of the neck, turns towards the pointer, nods, tilts, blinks)
// The pieces overlap by a few pixels at the seams, so nothing opens up while they move. CSS does the idling;
// avatarLife.js sets --lx / --ly (where he is looking) and plays the click reactions.

export const AV = { w: 302, h: 898, headBottom: 158, torsoTop: 142, waist: 522, legsTop: 518 };
const pc = (v, d) => `${((v / d) * 100).toFixed(3)}%`;

export default function Avatar3D({ className = '' }) {
  const img = (clip) => <img className="a3-img" src="/me-avatar.webp" alt="" draggable="false" style={{ clipPath: clip }} />;
  return (
    <div className={`a3 ${className}`} aria-hidden="true">
      <div className="a3-shadow" />
      <div className="a3-sway">
        <div className="a3-walk">
          <div className="a3-hop">
            <div className="a3-part">{img(`inset(${pc(AV.legsTop, AV.h)} 0 0 0)`)}</div>
            <div className="a3-up">
              <div className="a3-part">{img(`inset(${pc(AV.torsoTop, AV.h)} 0 ${pc(AV.h - AV.waist, AV.h)} 0)`)}</div>
              <div className="a3-head-follow">
                <div className="a3-nod">
                  <div className="a3-head-idle">
                    <div className="a3-part">
                      {img(`inset(0 0 ${pc(AV.h - AV.headBottom, AV.h)} 0)`)}
                      <i className="a3-lid l" />
                      <i className="a3-lid r" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
