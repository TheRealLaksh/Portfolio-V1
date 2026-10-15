import React, { useEffect, useRef } from 'react';
import { NOTE_STICKIES } from './data';
import Icon from './Icon';

// "How I got here": one paragraph with marker highlights that draw once as it enters view,
// plus sticky notes you can drag. No pinned scene and no word-by-word fill.
export default function Story() {
  const box = useRef(null);

  // The sticky notes can be dragged around (desktop only; on phones they sit in the flow).
  useEffect(() => {
    const root = box.current;
    if (!root) return undefined;
    let cur = null;
    let z = 5;
    const down = (e) => {
      const el = e.target.closest('.sticky');
      if (!el || window.innerWidth < 900) return;
      cur = { el, x: e.clientX, y: e.clientY, tx: parseFloat(el.dataset.tx || 0), ty: parseFloat(el.dataset.ty || 0) };
      el.style.zIndex = String(++z);
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    const move = (e) => {
      if (!cur) return;
      const tx = cur.tx + e.clientX - cur.x;
      const ty = cur.ty + e.clientY - cur.y;
      cur.el.dataset.tx = tx;
      cur.el.dataset.ty = ty;
      cur.el.style.translate = `${tx}px ${ty}px`;
    };
    const up = () => { cur = null; };
    root.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      root.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <section className="story" id="story" aria-label="How I got here">
      <div className="wrap">
        <p className="kicker" data-rv><Icon n="star" size={16} />How I got here</p>
        <div className="tell-box" ref={box}>
          <p className="tell" data-rv>
            I started out as a <span className="hl b-sky">national-level shooter</span>, learning to stay calm and repeat one small motion perfectly.
            Then I got hooked on <span className="hl b-sun">how things get built.</span> So I taught myself to code, and
            I&rsquo;ve been <span className="hl b-coral">shipping real products</span> ever since, from hotel networks to <span className="hl b-lilac">a startup&rsquo;s whole platform.</span>
          </p>
          {NOTE_STICKIES.map((s, i) => (
            <div key={i} className="sticky" data-rv data-drag style={{ ['--sc']: s.sc, ['--r']: `${s.r}deg`, transitionDelay: `${0.15 + i * 0.18}s`, ...s.pos }}>
              {s.text}<small>{s.small}</small>
            </div>
          ))}
          <p className="move-hint" data-rv>these notes move ;)</p>
        </div>
      </div>
    </section>
  );
}
