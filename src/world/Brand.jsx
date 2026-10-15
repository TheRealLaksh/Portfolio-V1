import React, { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SITES, ME, waLink } from './data';
import { packages } from '../data/packages';
import { clamp, range, ss, useTrack, useScrub } from './hooks';
import Icon from './Icon';

const PK_TONES = ['var(--teal-c)', 'var(--lilac-c)', 'var(--saffron)'];
const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^github\.com\/TheRealLaksh\//, 'github.com/');

// A browser-window card for a site. The page area is an abstract placeholder in the site's colour:
// no real screenshots exist yet, so nothing here pretends to be one.
function SiteCard({ s, i }) {
  return (
    <a className="bc site" href={s.link} target="_blank" rel="noopener noreferrer" style={{ ['--sc']: s.c, ['--tilt']: `${[-1.4, 1.2, -1, 1.5][i % 4]}deg`, ['--dy']: `${[10, -14, 18, -6][i % 4]}px` }}>
      <span className="win">
        <span className="chrome"><i /><i /><i /><em>{host(s.link)}</em></span>
        <span className="page"><b>{s.n}</b><span /><span /><span className="s" /></span>
      </span>
      <span className="cap"><b>{s.n}</b><span>{s.k} · visit</span></span>
    </a>
  );
}

export default function Brand() {
  const scrub = useScrub();
  const cta = ME.book || waLink("Hi Laksh, I'd like to talk about a website for my business.");
  const track = useRef(null);
  const row = useRef(null);
  const bar = useRef(null);
  const head = useRef(null);
  const shift = useRef(0);

  // The track is as tall as the sideways distance it has to cover, so scrolling down slides the row left.
  const measure = useCallback(() => {
    const t = track.current;
    const r = row.current;
    if (!t || !r) return;
    const vw = window.innerWidth;
    shift.current = Math.max(0, r.scrollWidth - vw + 40);
    t.style.height = `${window.innerHeight + shift.current * 1.05}px`;
  }, []);

  useEffect(() => {
    if (!scrub) return undefined;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row.current);
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [scrub, measure]);

  useTrack(track, (p) => {
    const r = row.current;
    if (!r) return;
    const q = ss(range(p, 0.04, 0.96));
    r.style.transform = `translate3d(${(-q * shift.current).toFixed(1)}px,0,0)`;
    if (bar.current) bar.current.style.setProperty('--p', `${(q * 100).toFixed(1)}%`);
    if (head.current) head.current.style.transform = `translate3d(0,${(-ss(range(p, 0.85, 1)) * 24).toFixed(1)}px,0)`;
    // cards lean in as they pass the middle of the screen
    const vw = window.innerWidth;
    r.querySelectorAll('.bc').forEach((c) => {
      const b = c.getBoundingClientRect();
      const mid = (b.left + b.width / 2) / vw;
      const near = 1 - clamp(Math.abs(mid - 0.5) * 2);
      c.style.setProperty('--near', near.toFixed(3));
    });
  }, { enabled: scrub, damp: 8 });

  // Tabbing to an off-screen card scrolls the page so the row slides it into view.
  const onFocus = (e) => {
    const c = e.target.closest('.bc');
    const t = track.current;
    if (!c || !t || !scrub || !shift.current) return;
    const want = clamp((c.offsetLeft - 80) / shift.current);
    const top = t.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + want * (t.offsetHeight - window.innerHeight), behavior: 'auto' });
  };

  const headBlock = (
    <div className="brand-head">
      <div className="sec-head" data-rv>
        <p className="kicker"><Icon n="pen" size={16} />Websites for people</p>
        <h2>Websites that <span className="hl b-coral">work for your business.</span></h2>
        <p>From a first sketch to launch day, with an admin panel your own team can run.</p>
        <a className="btn-main" href={cta} target="_blank" rel="noopener noreferrer">Start a project <Icon n="ext" size={16} /></a>
      </div>
    </div>
  );

  if (scrub) {
    return (
      <section className="brand-sec torn" id="brand" aria-label="Websites and services">
        <div className="brand-track" ref={track} onFocus={onFocus}>
          <div className="brand-pin">
            <div className="wrap brand-top" ref={head}>
              {headBlock}
              <p className="pk-more"><Link to="/hire">See every package and what is included <Icon n="arrow" size={16} /></Link> <span className="pk-or">or</span> <Link to="/book">book a call <Icon n="arrow" size={16} /></Link></p>
            </div>
            <div className="brand-car">
              <div className="brand-row" ref={row}>
                {packages.map((p, i) => (
                  <article key={p.id} className="bc pk" style={{ ['--pc']: PK_TONES[i % 3], ['--tilt']: `${[-1, 1.2, -.8][i % 3]}deg` }} tabIndex={0}>
                    <b className="pk-p">from {p.price}</b>
                    <h3>{p.name}</h3>
                    <p>{p.bestFor}.</p>
                    <ul>{p.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}</ul>
                  </article>
                ))}
                <p className="bc-k hand" aria-hidden="true">sites I have built</p>
                {SITES.map((s, i) => <SiteCard key={s.n} s={s} i={i} />)}
              </div>
            </div>
            <div className="brand-prog" aria-hidden="true"><i ref={bar} /></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="brand-sec torn" id="brand" aria-label="Websites and services">
      <div className="wrap">
        {headBlock}

        <ul className="pk-grid">
          {packages.map((p, i) => (
            <li key={p.id} className="pk" data-rv style={{ transitionDelay: `${i * 0.09}s` }}>
              <b className="pk-p">from {p.price}</b>
              <h3>{p.name}</h3>
              <p>{p.bestFor}.</p>
              <ul>{p.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}</ul>
            </li>
          ))}
        </ul>
        <p className="pk-more" data-rv><Link to="/hire">See every package and what is included <Icon n="arrow" size={16} /></Link> <span className="pk-or">or</span> <Link to="/book">book a call <Icon n="arrow" size={16} /></Link></p>

        <p className="sites-k" data-rv>Sites I have built</p>
        <ul className="sites">
          {SITES.map((s, i) => (
            <li key={s.n} data-rv style={{ transitionDelay: `${i * 0.07}s` }}>
              <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ ['--sc']: s.c }}>
                <span className="st-dot" aria-hidden="true" />
                <b>{s.n}</b>
                <span>{s.k}</span>
                <Icon n="ext" size={15} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
