import React, { useEffect, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import { WORK, WORK_FILTERS } from './data';
import { clamp, lerp, range, ss, backOut, useTrack, useScrub } from './hooks';
import Icon from './Icon';
import Floaters from './Floaters';

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
          <div className="cs-links">
            {w.live && <a className="btn-main" href={w.live} target="_blank" rel="noopener noreferrer">Open the live site <Icon n="ext" size={16} /></a>}
            {w.code && <a className={w.live ? 'btn-ghost' : 'btn-main'} href={w.code} target="_blank" rel="noopener noreferrer">View the code <Icon n="ext" size={16} /></a>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Filter({ value, onChange }) {
  return (
    <div className="wk-filter" role="group" aria-label="Filter projects">
      {WORK_FILTERS.map((f) => (
        <button key={f.id} type="button" aria-pressed={value === f.id} className={value === f.id ? 'on' : ''} onClick={() => onChange(f.id)}>{f.label}</button>
      ))}
    </div>
  );
}

// ---- the card box (wide screens): a 3D crate that spins in, opens its lid and stands the cards up ----
const BW = 700; // box width (x)
const BD = 250; // box depth (y)
const BH = 96; // wall height (z)
const CW = 206; // card width
const CH = 280; // card height
const SUNK = -(CH - BH + 26); // card base when hidden: top just under the rim

function CardBox({ onOpen, filter, setFilter, keep }) {
  const track = useRef(null);
  const fit = useRef(null);
  const box = useRef(null);
  const lid = useRef(null);
  const cards = useRef([]);
  const info = useRef(null);
  const hint = useRef(null);
  const tilt = useRef(null);
  const lenis = useLenis();

  useTrack(track, (p, dt, vh) => {
    const spin = ss(range(p, 0, 0.32));
    const open = ss(range(p, 0.26, 0.4));
    const f = fit.current;
    if (!f || !box.current) return;
    const vw = window.innerWidth;
    const room = Math.min((vw - 120) / 790, (vh - Math.max(250, 410 - Math.max(0, 720 - vh) * 0.75)) / 500, 1.05);
    f.style.transform = `translate3d(-50%,-50%,0) scale(${(room * (0.5 + 0.5 * spin)).toFixed(4)})`;
    f.style.opacity = String(clamp(spin * 2.2));
    box.current.style.transform = `rotateX(${lerp(78, 56, spin).toFixed(2)}deg) rotateZ(${lerp(-78, 26, spin).toFixed(2)}deg)`;
    lid.current.style.transform = `translate3d(0,0,${BH}px) rotateX(${(open * 128).toFixed(2)}deg)`;
    lid.current.style.setProperty('--open', open.toFixed(3));
    cards.current.forEach((el, i) => {
      if (!el) return;
      const s = 0.38 + i * 0.07;
      const t = range(p, s, s + 0.17);
      const rise = t < 1 ? backOut(t) : 1;
      const base = lerp(SUNK, 0, Math.min(1.08, rise));
      el.style.setProperty('--zt', `${(base + CH).toFixed(1)}px`);
      // the part of a card that is still below the box floor is clipped, so nothing pokes out underneath
      el.style.clipPath = base < 0 ? `inset(0 -40px ${(-base).toFixed(1)}px -40px)` : 'none';
      el.style.opacity = t > 0 || open > 0.9 ? '1' : '0';
    });
    if (info.current) info.current.style.opacity = String(ss(range(p, 0.55, 0.75)));
    if (hint.current) hint.current.style.opacity = String(ss(range(p, 0.7, 0.85)));
    track.current.classList.toggle('ready', p > 0.82);
  }, { damp: 7 });

  // Follow the pointer a little (kept apart from the scroll transform).
  const onMove = (e) => {
    const t = tilt.current;
    if (!t || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    t.style.transform = `rotateX(${(-ny * 4).toFixed(2)}deg) rotateZ(${(nx * 8).toFixed(2)}deg)`;
  };
  const onLeave = () => { if (tilt.current) tilt.current.style.transform = ''; };

  const lift = (i, on) => cards.current[i]?.classList.toggle('hover', on);

  // The pill list is invisible until the lid is open. A keyboard user can Tab to it before that, so the first
  // focus fast-forwards the scroll to the open box instead of leaving them on a control they cannot see.
  const reveal = () => {
    const t = track.current;
    if (!t || t.classList.contains('ready')) return;
    const y = t.getBoundingClientRect().top + window.scrollY + (t.offsetHeight - window.innerHeight) * 0.9;
    if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
  };

  return (
    <div className="box-track" ref={track}>
      <div className="box-stage" onPointerMove={onMove} onPointerLeave={onLeave}>
        <Floaters set="work" />
        <div className="box-head sec-head" data-rv>
          <p className="kicker"><Icon n="layers" size={16} />Selected work</p>
          <h2>Things I built, <span className="hl b-sun">live and linkable.</span></h2>
          <p>Real products you can open right now. Pick a card from the box.</p>
        </div>

        <div className="box-zone">
          <div className="box-fit" ref={fit}>
            <div className="box-tilt" ref={tilt}>
              <div className="box3" ref={box} style={{ width: BW, height: BD, ['--cw']: `${CW}px`, ['--ch']: `${CH}px`, ['--bw']: `${BW}px`, ['--bd']: `${BD}px`, ['--bh']: `${BH}px` }}>
                <div className="bx-floor" />
                <div className="bx-back" />
                <div className="bx-left" />
                <div className="bx-right" />
                {WORK.map((w, i) => (
                  <button
                    key={w.id}
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    className={`wk ${keep(w) ? '' : 'off'}`}
                    ref={(el) => { cards.current[i] = el; }}
                    style={{ ['--x']: `${110 + i * ((BW - 220) / (WORK.length - 1)) - CW / 2}px`, ['--y']: `${BD / 2 + i * 1.5}px`, ['--cc']: w.c, ['--zt']: `${SUNK + CH}px`, opacity: 0 }}
                    onClick={() => onOpen(w)}
                    onPointerEnter={(e) => { if (e.pointerType === 'mouse') lift(i, true); }}
                    onPointerLeave={() => lift(i, false)}
                  >
                    <span className="wk-in">
                      <span className="wk-top"><b>{String(i + 1).padStart(2, '0')}</b><i className="st">{w.status}</i></span>
                      <span className="wk-art"><Shot w={w} /></span>
                      <span className="wk-name">{w.n}</span>
                      <span className="wk-kind">{w.k}</span>
                    </span>
                  </button>
                ))}
                <div className="bx-front"><span><Icon n="arrow" size={22} sw={2.6} className="bx-up" />This side up</span></div>
                <div className="bx-lid" ref={lid}>
                  <i className="bx-tape" />
                  <span className="bx-label"><b>{WORK.length} projects</b>packed inside</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="box-info" ref={info}>
          <ol className="bi-list">
            {WORK.map((w, i) => (
              <li key={w.id} className={keep(w) ? '' : 'off'}>
                <button
                  type="button"
                  style={{ ['--c']: w.c }}
                  onClick={() => onOpen(w)}
                  onPointerEnter={(e) => { if (e.pointerType === 'mouse') lift(i, true); }}
                  onPointerLeave={() => lift(i, false)}
                  onFocus={() => { reveal(); lift(i, true); }}
                  onBlur={() => lift(i, false)}
                  aria-haspopup="dialog"
                >
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <em>{w.n}</em>
                </button>
              </li>
            ))}
          </ol>
          <Filter value={filter} onChange={setFilter} />
          <p className="box-hint" ref={hint}>pick a card</p>
        </div>
      </div>
    </div>
  );
}

// ---- stacked fallback (phones, reduced motion): a row of cards you swipe ----
function Deck({ onOpen, filter, setFilter, keep }) {
  const row = useRef(null);
  const scrollBy = (dir) => { const r = row.current; if (r) r.scrollBy({ left: dir * Math.min(r.clientWidth * 0.8, 360), behavior: 'smooth' }); };
  return (
    <>
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="layers" size={16} />Selected work</p>
          <h2>Things I built, <span className="hl b-sun">live and linkable.</span></h2>
          <p>Real products you can open right now. Pick a card.</p>
        </div>
      </div>
      <div className="deck">
        <Filter value={filter} onChange={setFilter} />
        <div className="deck-row" ref={row}>
          {WORK.map((w, i) => (
            <button key={w.id} type="button" className={`wcard ${keep(w) ? '' : 'off'}`} data-rv style={{ ['--cc']: w.c, ['--r']: `${[-2.2, 1.4, -1, 2, -1.6, 1][i % 6]}deg`, transitionDelay: `${i * 0.07}s` }} onClick={() => onOpen(w)} aria-haspopup="dialog">
              <div className="wc-art"><Shot w={w} /></div>
              <div className="wc-body">
                <span className="wc-k">{w.k}<i className="st">{w.status}</i></span>
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
    </>
  );
}

export default function Work() {
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState('all');
  const scrub = useScrub();
  const keep = WORK_FILTERS.find((f) => f.id === filter).test;
  return (
    <section className="work" id="work" aria-label="Selected work">
      {!scrub && <Floaters set="work" />}
      {scrub ? <CardBox onOpen={setOpen} filter={filter} setFilter={setFilter} keep={keep} /> : <Deck onOpen={setOpen} filter={filter} setFilter={setFilter} keep={keep} />}
      {open && <Case w={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
