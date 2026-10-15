import React, { useEffect, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import { ME } from './data';
import { SONG } from './audio';

const NAV = [
  ['top', 'Home', <path key="a" d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />],
  ['journey', 'Journey', <path key="a" d="M4 19c0-6 8-4 8-9S6 7 8 3M17 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM17 11v2" />],
  ['work', 'Work', <path key="a" d="M4 7h16v12H4zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 13h16" />],
  ['life', 'About', <path key="a" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />],
  ['hello', 'Contact', <path key="a" d="M3 6h18v12H3zM3 7l9 7 9-7" />],
];

export default function Bar({ theme, onTheme, visitors, music, onMusic }) {
  const lenis = useLenis();
  const navRef = useRef(null);
  const [active, setActive] = useState('top');
  const [ind, setInd] = useState({ x: 0, w: 0 });

  const go = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : -8, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll spy: the section crossing the middle of the viewport is active.
  useEffect(() => {
    const ids = NAV.map((n) => n[0]);
    const onScroll = () => {
      const mid = window.innerHeight * 0.45;
      let cur = 'top';
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) cur = id;
      });
      // sections without their own nav entry belong to the previous one
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const place = () => {
      const a = navRef.current?.querySelector(`a[data-go="${active}"]`);
      if (a) setInd({ x: a.offsetLeft, w: a.offsetWidth });
    };
    place();
    window.addEventListener('resize', place);
    const f = document.fonts?.ready?.then(place);
    return () => { window.removeEventListener('resize', place); void f; };
  }, [active]);

  return (
    <header className="bar">
      {music && (
        <button type="button" className="np" onClick={onMusic} aria-label="Pause music">
          <span className="np-d" aria-hidden="true" />
          <span className="np-t">{SONG.title} · {SONG.artist}</span>
          <span className="np-b" aria-hidden="true"><i /><i /></span>
        </button>
      )}
      {visitors != null && (
        <div className="vc" aria-live="polite"><i aria-hidden="true" /><span><b>{visitors.toLocaleString('en-IN')}</b><span className="vc-w"> visitors</span></span></div>
      )}
      <button className="theme-btn" type="button" onClick={onTheme} aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}>
        <span className="ti" aria-hidden="true">
          <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></svg>
          <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        </span>
        <span className="tl"><b className="tl-n">Night</b><b className="tl-d">Day</b></span>
      </button>
      <a className="logo" href="#top" onClick={go('top')} aria-label={`${ME.name}, back to top`}>
        <i><img src="/me.webp" alt="" /></i>
        <span className="lt">{ME.name}</span>
      </a>
      <nav className="nav" ref={navRef} aria-label="Sections">
        <span className="ind" aria-hidden="true" style={{ transform: `translateX(${ind.x}px)`, width: ind.w }} />
        {NAV.map(([id, label, icon]) => (
          <a key={id} href={`#${id}`} data-go={id} className={active === id ? 'on' : ''} onClick={go(id)} aria-current={active === id ? 'true' : undefined}>
            <i className="ni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg></i>
            {label}
          </a>
        ))}
        <span className="sep" aria-hidden="true" />
        <a className="cta" href={ME.resume} target="_blank" rel="noopener noreferrer">Resume &#8599;</a>
      </nav>
    </header>
  );
}
