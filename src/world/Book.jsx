import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ME, waLink } from './data';
import { packages, featuredWork } from '../data/packages';
import { useReveal, useTheme } from './hooks';
import usePageMeta from '../hooks/usePageMeta';
import { BOOK_META } from '../data/routeMeta';
import Icon from './Icon';
import './world.css';
import './world2.css';
import './book.css';

// The single place to drop the booking link: set `ME.book` in src/world/data.js to the Google
// Calendar appointment schedule URL. Until then every booking button opens WhatsApp with a
// message that names the service, so nothing on this page is a dead end.
const hrefFor = (message) => ME.book || waLink(message);
const ctaLabel = ME.book ? 'Book a call' : 'Message on WhatsApp';

const ICONS = { website: 'layers', ai: 'chat', app: 'pay' };
const TINTS = { website: 'var(--teal-c)', ai: 'var(--lilac-c)', app: 'var(--saffron)' };

const STEPS = [
  ['Send a short brief', 'What you need, who it is for and roughly when you want it. A few lines is enough.'],
  ['Get a scope and quote', 'I reply with what I would build, what it includes and what it costs.'],
  ['Agree and start', 'Once the scope and price are agreed, I get started.'],
];

const SOCIAL = [
  ['linkedin', 'LinkedIn', ME.linkedin],
  ['code', 'GitHub', ME.github],
  ['insta', 'Instagram', ME.instagram],
  ['mail', 'Email', `mailto:${ME.email}`],
];

function Service({ p, i }) {
  const [open, setOpen] = useState(false);
  const msg = `Hi Laksh, I'd like to book a call about ${p.name}.`;
  return (
    <li className="svc" data-rv style={{ ['--pc']: TINTS[p.id], transitionDelay: `${i * 0.08}s` }}>
      <div className="svc-top">
        <span className="svc-ic" aria-hidden="true"><Icon n={ICONS[p.id]} size={22} /></span>
        <div className="svc-title">
          <h3>{p.name}</h3>
          <p className="svc-meta">Fixed-scope project &middot; quote after a short brief</p>
        </div>
        <b className="svc-price"><small>from</small>{p.price}</b>
      </div>
      <p className="svc-desc">{p.description}</p>
      <p className="svc-for"><b>Best for:</b> {p.bestFor}.</p>

      <button
        type="button"
        className="svc-more"
        aria-expanded={open}
        aria-controls={`inc-${p.id}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon n={open ? 'minus' : 'plus'} size={16} />
        {open ? 'Hide what is included' : 'What is included'}
      </button>
      <ul className="svc-inc" id={`inc-${p.id}`} hidden={!open}>
        {p.features.map((f) => <li key={f}><Icon n="check" size={16} sw={2.6} />{f}</li>)}
      </ul>

      <a className="svc-book" href={hrefFor(msg)} target="_blank" rel="noopener noreferrer">
        {ctaLabel}<span className="sr"> about {p.name}</span> <Icon n="arrow" size={16} />
      </a>
    </li>
  );
}

export default function Book() {
  const root = useRef(null);
  const [theme, toggleTheme] = useTheme();
  usePageMeta(BOOK_META);
  useReveal(root);

  useEffect(() => {
    // Same reason as World.jsx: keep html from becoming a scroll container.
    document.documentElement.classList.add('world-on');
    return () => document.documentElement.classList.remove('world-on');
  }, []);

  const general = hrefFor("Hi Laksh, I found your booking page and I'd like to talk about a project.");

  return (
    <div className="w-root bk" data-theme={theme} ref={root}>
      <a className="skip" href="#services">Skip to services</a>

      <header className="bk-bar">
        <Link className="bk-back" to="/" aria-label="Back to the valley">
          <Icon n="arrow" size={16} className="flip" />
          <span>The valley</span>
        </Link>
        <button className="theme-btn" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}>
          <span className="ti" aria-hidden="true">
            <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></svg>
            <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          </span>
          <span className="tl"><b className="tl-n">Night</b><b className="tl-d">Day</b></span>
        </button>
      </header>

      <main className="bk-main">
        <section className="bk-hero" aria-label="Profile">
          <div className="bk-avatar" aria-hidden="true"><img src="/me.webp" alt="" /></div>
          <h1>{ME.name}</h1>
          <p className="bk-tag">I build websites your team can edit, apps that run on your process, and <span className="hl b-sun in">AI features</span> that save time.</p>
          <ul className="bk-social" aria-label="Find me elsewhere">
            {SOCIAL.map(([ic, label, href]) => (
              <li key={label}>
                <a href={href} aria-label={label} {...(href.startsWith('mailto') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
                  <Icon n={ic} size={20} />
                </a>
              </li>
            ))}
          </ul>
          <a className="btn-main bk-cta" href={general} target="_blank" rel="noopener noreferrer">
            {ctaLabel} <Icon n={ME.book ? 'call' : 'ext'} size={16} />
          </a>
          {!ME.book && <p className="bk-note">Calendar booking is coming. For now the button opens WhatsApp.</p>}
        </section>

        <section id="services" className="bk-sec" aria-labelledby="bk-svc-h">
          <h2 id="bk-svc-h" data-rv>Services</h2>
          <ul className="svc-list">
            {packages.map((p, i) => <Service key={p.id} p={p} i={i} />)}
          </ul>
          <p className="bk-fine" data-rv>Prices are starting prices in rupees. The final quote comes after a short brief. <Link to="/hire">Full details on the hire page</Link>.</p>
        </section>

        <section className="bk-sec" aria-labelledby="bk-how-h">
          <h2 id="bk-how-h" data-rv>How it starts</h2>
          <ol className="bk-steps">
            {STEPS.map(([t, d], i) => (
              <li key={t} data-rv style={{ transitionDelay: `${i * 0.08}s` }}>
                <b className="bk-n">{i + 1}</b>
                <div><h3>{t}</h3><p>{d}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bk-sec" aria-labelledby="bk-about-h">
          <h2 id="bk-about-h" data-rv>About</h2>
          <div className="bk-about" data-rv>
            <p>I&rsquo;m a freelance full-stack developer. I&rsquo;m the Tech Head at ShiftsDeal, where I took over the platform and built it out into the live product, and I build client sites with admin panels through the agency Bestow.</p>
            <p>I&rsquo;m also in the first year of the UG programme in Data Science &amp; AI at Masters&rsquo; Union.</p>
            <p className="bk-links">
              <a href={ME.resume} target="_blank" rel="noopener noreferrer">Resume <Icon n="ext" size={14} /></a>
              <Link to="/">The full story <Icon n="arrow" size={14} /></Link>
            </p>
          </div>
        </section>

        <section className="bk-sec" aria-labelledby="bk-work-h">
          <h2 id="bk-work-h" data-rv>Things I have built</h2>
          <ul className="bk-work">
            {featuredWork.map((w, i) => (
              <li key={w.name} data-rv style={{ transitionDelay: `${i * 0.07}s` }}>
                <a href={w.url} target="_blank" rel="noopener noreferrer">
                  <span className="bk-w-h"><b>{w.name}</b><em>{w.kind}</em><Icon n="ext" size={15} /></span>
                  <span className="bk-w-p">{w.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Testimonials: none yet, so there is no section. When a client agrees to be quoted,
            add a "Kind words" section here with their real words and name. */}
      </main>

      <footer className="bk-foot">
        <p>&copy; {new Date().getFullYear()} {ME.name}</p>
        <p><Link to="/hire">Hire page</Link> &middot; <Link to="/">Portfolio</Link> &middot; <a href={`mailto:${ME.email}`}>{ME.email}</a></p>
      </footer>
    </div>
  );
}
