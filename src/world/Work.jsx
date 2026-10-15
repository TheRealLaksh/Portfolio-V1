import React, { useEffect, useRef, useState } from 'react';
import { WORK } from './data';
import Icon from './Icon';

function Mock({ c, name }) {
  // Placeholder artwork until a real screenshot is added to /public/work/<id>.webp.
  return (
    <div className="mock" style={{ ['--mc']: c }} aria-hidden="true">
      <div className="mk-bar"><i /><i /><i /></div>
      <div className="mk-body"><b>{name}</b><span /><span /><span className="s" /></div>
    </div>
  );
}

function Shot({ w }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <Mock c={w.c} name={w.n} />;
  return <img className="shot" src={`/work/${w.id}.webp`} alt="" loading="lazy" onError={() => setOk(false)} />;
}

function Case({ w, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="cs open" role="dialog" aria-modal="true" aria-label={`${w.n}, case summary`} data-lenis-prevent onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cs-sheet" ref={ref} tabIndex={-1} style={{ ['--cc']: w.c }}>
        <button type="button" className="cs-x" onClick={onClose} aria-label="Close">&times;</button>
        <div className="cs-art"><Shot w={w} /></div>
        <div className="cs-body">
          <p className="cs-k">{w.k}</p>
          <h3>{w.n}</h3>
          <p className="cs-d">{w.d}</p>
          <ul className="cs-tags">{w.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="cs-note"><Icon n="star" size={14} />{w.note}</p>
          <a className="btn-main" href={w.link} target="_blank" rel="noopener noreferrer">{w.link.includes('github.com') ? 'View the code' : 'Open the live site'} <Icon n="ext" size={16} /></a>
        </div>
      </div>
    </div>
  );
}

export default function Work() {
  const [open, setOpen] = useState(null);
  const row = useRef(null);
  const scrollBy = (dir) => { const r = row.current; if (r) r.scrollBy({ left: dir * Math.min(r.clientWidth * 0.8, 360), behavior: 'smooth' }); };
  return (
    <section className="work" id="work" aria-label="Selected work">
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="layers" size={16} />Selected work</p>
          <h2>Things I built, <span className="hl b-sun">live and linkable.</span></h2>
          <p>Real products you can open right now. Pick a card.</p>
        </div>
      </div>
      <div className="deck">
        <div className="deck-row" ref={row}>
          {WORK.map((w, i) => (
            <button key={w.id} type="button" className="wcard" data-rv style={{ ['--cc']: w.c, ['--r']: `${[-2.2, 1.4, -1, 2, -1.6, 1][i % 6]}deg`, transitionDelay: `${i * 0.07}s` }} onClick={() => setOpen(w)} aria-haspopup="dialog">
              <div className="wc-art"><Shot w={w} /></div>
              <div className="wc-body">
                <span className="wc-k">{w.k}</span>
                <b>{w.n}</b>
                <span className="wc-tags">{w.tags.join(' · ')}</span>
              </div>
              <span className="wc-go" aria-hidden="true"><Icon n="arrow" size={16} /></span>
            </button>
          ))}
        </div>
        <div className="deck-nav">
          <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous cards"><Icon n="arrow" size={18} className="flip" /></button>
          <span className="hint2">pick a card</span>
          <button type="button" onClick={() => scrollBy(1)} aria-label="Next cards"><Icon n="arrow" size={18} /></button>
        </div>
      </div>
      {open && <Case w={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
