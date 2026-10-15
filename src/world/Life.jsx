import React, { useEffect, useRef } from 'react';
import { OFF_CLOCK } from './data';
import Icon from './Icon';

// Everything on the desk can be dragged (pointer events, so touch works too).
function useDrag(deskRef) {
  useEffect(() => {
    const desk = deskRef.current;
    if (!desk) return undefined;
    let cur = null;
    let z = 20;
    const down = (e) => {
      const it = e.target.closest('.item');
      if (!it || e.target.closest('a, button')) return;
      if (window.innerWidth < 900) return;
      const r = it.getBoundingClientRect();
      cur = { it, dx: e.clientX - r.left, dy: e.clientY - r.top, base: desk.getBoundingClientRect() };
      it.classList.add('drag');
      it.style.zIndex = String(++z);
      it.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    const move = (e) => {
      if (!cur) return;
      const { it, dx, dy, base } = cur;
      const x = e.clientX - base.left - dx;
      const y = e.clientY - base.top - dy;
      it.style.left = `${Math.max(-10, Math.min(base.width - 60, x))}px`;
      it.style.top = `${Math.max(-10, Math.min(base.height - 40, y))}px`;
    };
    const up = () => { if (cur) { cur.it.classList.remove('drag'); cur = null; } };
    desk.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      desk.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [deskRef]);
}

const Polaroid = ({ children, cap, style, cls = '' }) => (
  <figure className={`item polaroid pinned ${cls}`} style={style}>
    <div className="pol-art">{children}</div>
    <figcaption>{cap}</figcaption>
  </figure>
);

export default function Life({ music, onMusic }) {
  const desk = useRef(null);
  useDrag(desk);
  return (
    <section className="life torn" id="life" aria-label="Off the clock">
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="user" size={16} />Off the clock</p>
          <h2>Calm hands, <span className="hl b-coral">busy head.</span></h2>
          <p>18. Based between Varanasi and Delhi NCR. When I am not coding, I am usually learning tabla or reading about business.</p>
        </div>

        <div className="desk" ref={desk} data-rv>
          <Polaroid cls="p1" cap="me, mid-smile" style={{ ['--r']: '-5deg', ['--pc']: '#E8505B' }}>
            <img src="/me.webp" alt="Laksh smiling in a black kurta, under a leafy tree" loading="lazy" />
          </Polaroid>

          <div className="item about pinned p2" style={{ ['--r']: '1.5deg', ['--pc']: '#1FA6A0' }}>
            <p className="ab-k">Off the clock</p>
            <h4>Hi, I&rsquo;m Laksh. Not the work version.</h4>
            <b>Things I keep coming back to</b>
            <ul>{OFF_CLOCK.list1.map((t) => <li key={t}>{t}</li>)}</ul>
            <b>When I am not shipping</b>
            <ul>{OFF_CLOCK.list2.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>

          <Polaroid cls="pol-sm pc1" cap="10 m air pistol" style={{ ['--r']: '4deg', ['--pc']: '#E8505B' }}>
            <svg viewBox="0 0 120 90" aria-hidden="true"><rect width="120" height="90" fill="var(--paper2)" /><circle cx="60" cy="45" r="34" fill="#FFF8E7" stroke="var(--ink)" strokeWidth="2" /><circle cx="60" cy="45" r="25" fill="#E8505B" /><circle cx="60" cy="45" r="16" fill="#FFF8E7" /><circle cx="60" cy="45" r="8" fill="#E8505B" /><circle cx="68" cy="40" r="2.4" fill="var(--ink)" /><circle cx="55" cy="49" r="2.4" fill="var(--ink)" /></svg>
          </Polaroid>

          <Polaroid cls="pol-sm pc2" cap="Model UN" style={{ ['--r']: '-3deg', ['--pc']: '#8E7CFF' }}>
            <svg viewBox="0 0 120 90" aria-hidden="true"><rect width="120" height="90" fill="#E9E4FF" /><circle cx="60" cy="46" r="28" fill="none" stroke="var(--ink)" strokeWidth="2" /><path d="M32 46h56M60 18c-14 14-14 42 0 56M60 18c14 14 14 42 0 56M38 32h44M38 60h44" stroke="var(--ink)" strokeWidth="2" fill="none" /></svg>
          </Polaroid>

          <Polaroid cls="pol-sm pc3" cap="badminton" style={{ ['--r']: '5deg', ['--pc']: '#1FA6A0' }}>
            <svg viewBox="0 0 120 90" aria-hidden="true"><rect width="120" height="90" fill="#DDF3F0" /><ellipse cx="46" cy="40" rx="20" ry="26" fill="none" stroke="var(--ink)" strokeWidth="3" transform="rotate(-30 46 40)" /><path d="M58 62l22 24" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" /><path d="M86 20l14 10-6 10zM92 28l-12 26" fill="#fff" stroke="var(--ink)" strokeWidth="2" /></svg>
          </Polaroid>

          <button type="button" className={`item vinyl p5 ${music ? 'on' : ''}`} onClick={onMusic} aria-pressed={music} aria-label={music ? 'Pause the music' : 'Play some music'} style={{ ['--r']: '-3deg' }}>
            <span className="vn-sleeve"><b>On repeat</b><small>{music ? 'playing now' : 'tabla + drone'}</small></span>
            <span className="vn-disc"><i /></span>
            <span className="vn-cap">music is life</span>
          </button>

          <Polaroid cls="pol-sm pc4" cap="coffee, then code" style={{ ['--r']: '3deg', ['--pc']: '#F2A93B' }}>
            <svg viewBox="0 0 120 90" aria-hidden="true"><rect width="120" height="90" fill="#FFF0D0" /><path d="M34 34h44v24a18 18 0 0 1-18 18h-8a18 18 0 0 1-18-18z" fill="#fff" stroke="var(--ink)" strokeWidth="3" /><path d="M78 40h8a8 8 0 0 1 0 16h-8" fill="none" stroke="var(--ink)" strokeWidth="3" /><path d="M46 26c-4-6 4-8 0-14M58 26c-4-6 4-8 0-14M70 26c-4-6 4-8 0-14" stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".6" /></svg>
          </Polaroid>

          <div className="item note taped p17" style={{ ['--sc']: '#D9CCFF', ['--r']: '-4deg' }}>
            Hindi and English.<small>I switch to Hindi when I am relaxed.</small>
          </div>

          <div className="item ticket pinned p7" style={{ ['--r']: '3deg', ['--pc']: '#E8505B' }}>
            <div className="tk-main">
              <div className="tk-top"><span className="tk-air">Home to campus</span><small>Boarding pass</small></div>
              <div className="tk-route">
                <div><b>VNS</b><span>Varanasi</span></div>
                <i><Icon n="plane" size={22} /></i>
                <div><b>DEL</b><span>New Delhi</span></div>
              </div>
              <div className="tk-meta"><span><small>Passenger</small>Laksh Pradhwani</span><span><small>Class</small>Student</span><span><small>Home</small>Both</span></div>
            </div>
            <div className="tk-stub"><small>VNS &#8644; DEL</small><i className="tk-bar" /></div>
          </div>

          <p className="desk-hint">it&rsquo;s my board, but go ahead, move things around ;)</p>
        </div>
      </div>
    </section>
  );
}
