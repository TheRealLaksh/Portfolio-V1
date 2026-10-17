import React, { useEffect, useRef, useState } from 'react';
import { ME, waLink } from './data';
import { range, ss, backOut, useTrack, useScrub } from './hooks';
import Icon from './Icon';
import Floaters from './Floaters';

const mailto = `mailto:${ME.email}?subject=${encodeURIComponent('Project enquiry')}`;
const bookHref = ME.book || waLink("Hi Laksh, I'd like to book a quick call.");

const KEYS = [
  { k: 'm', ic: 'mail', c: '#EA4335', d: '#A92A20', href: mailto, label: 'Email me', note: 'Roles, projects, or just hi.', dn: true, mail: true },
  { k: 'i', ic: 'insta', c: '#DD2A7B', d: '#8A1E57', href: ME.instagram, label: 'Instagram', note: 'Say hi, my DMs are open.', dn: false, bg: 'linear-gradient(40deg,#F9A13A,#EE2A7B 45%,#8134AF 80%,#515BD4)' },
  { k: 'l', ic: 'linkedin', c: '#0A66C2', d: '#063F7A', href: ME.linkedin, label: 'LinkedIn', note: 'The work, and what I learned doing it.', dn: true },
  { k: 't', ic: 'call', c: '#25A55F', d: '#177A43', href: bookHref, label: ME.book ? 'Book a call' : 'Message on WhatsApp', note: ME.book ? 'Book a 30-minute call.' : 'Fastest way to reach me.', dn: false },
  { k: 'r', ic: 'file', c: '#FFC93C', d: '#C99A0E', fg: '#1B1F3B', href: ME.resume, label: 'Resume', note: 'My resume, one click away.', dn: true },
];

export default function Hello() {
  const [pressed, setPressed] = useState(null);
  const [copied, setCopied] = useState(false);
  const scrub = useScrub();
  const sec = useRef(null);
  const h2 = useRef(null);
  const sub = useRef(null);
  const mat = useRef(null);
  const clouds = useRef(null);

  // The headline zooms in out of the sky, the keys drop onto the mat one by one, and the cloud bank rises behind.
  useTrack(sec, (p0, dt, vh) => {
    // this is the last section, so its progress tops out below 1: stretch it to the reachable range
    const h = sec.current.offsetHeight;
    const p = Math.min(1, p0 / (h / (h + vh)));
    const a = ss(range(p, 0.1, 0.34));
    h2.current.style.transform = `translate3d(0,${((1 - a) * 50).toFixed(1)}px,0) scale(${(0.88 + 0.12 * a).toFixed(4)})`;
    h2.current.style.opacity = String(a);
    sub.current.style.opacity = String(ss(range(p, 0.22, 0.4)));
    mat.current.style.opacity = String(ss(range(p, 0.28, 0.42)));
    mat.current.style.transform = `translate3d(0,${((1 - ss(range(p, 0.28, 0.46))) * 40).toFixed(1)}px,0)`;
    mat.current.querySelectorAll('.kw').forEach((kw, i) => {
      const t = range(p, 0.36 + i * 0.07, 0.5 + i * 0.07);
      const e = t < 1 ? backOut(t) : 1;
      kw.style.transform = `translate3d(0,${((1 - e) * -90).toFixed(1)}px,0) scale(${(0.6 + 0.4 * e).toFixed(3)})`;
      kw.style.opacity = String(Math.min(1, t * 3));
    });
    const c = clouds.current;
    if (c) {
      const q = ss(range(p, 0.1, 0.7));
      c.querySelectorAll('i').forEach((el, i) => {
        el.style.translate = `${((i === 0 ? -1 : i === 1 ? 1 : 0) * (1 - q) * 120).toFixed(0)}px ${((1 - q) * (90 + i * 40)).toFixed(0)}px`;
      });
    }
  }, { mode: 'pass', enabled: scrub, damp: 8 });

  const copy = async () => {
    try { await navigator.clipboard.writeText(ME.email); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const key = KEYS.find((x) => x.k === e.key.toLowerCase());
      if (!key) return;
      setPressed(key.k);
      setTimeout(() => setPressed(null), 220);
      if (key.mail) { window.location.href = key.href; return; }
      window.open(key.href, '_blank', 'noopener');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className="hello" id="hello" aria-label="Contact" ref={sec}>
      <div className="hello-sky" aria-hidden="true" />
      <Floaters set="hello" />
      <div className="wrap inner">
        <h2 ref={h2} {...(scrub ? {} : { 'data-rv': '' })}>Let&rsquo;s build something <span className="rq">people use.</span></h2>
        <p ref={sub} {...(scrub ? {} : { 'data-rv': '' })}>Open to projects with founders, startups and local businesses. I reply fast.</p>
        <div className="keys-mat" ref={mat} {...(scrub ? {} : { 'data-rv': '' })}>
          <p className="keys-hint">psst, these work on your keyboard too: {KEYS.map((x) => <kbd key={x.k}>{x.k.toUpperCase()}</kbd>)}</p>
          <div className="keys">
            {KEYS.map((x) => (
              <div className={`kw ${x.dn ? 'dn' : 'up'}`} key={x.k}>
                {!x.dn && <p className="knote up">{x.note}</p>}
                <a
                  className={`key ${pressed === x.k ? 'press' : ''}`}
                  data-k={x.k}
                  href={x.href}
                  {...(x.mail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  style={{ ['--kc']: x.c, ['--kd']: x.d, ...(x.bg ? { ['--kbg']: x.bg } : {}), ...(x.fg ? { ['--kfg']: x.fg } : {}) }}
                  aria-label={x.label}
                >
                  <span className="cap"><i>{x.k.toUpperCase()}</i><Icon n={x.ic} size={22} /></span>
                </a>
                {x.dn && (
                  <p className="knote dn">
                    {x.note}
                    {x.mail && (
                      <span className="mailrow"><span>{ME.email}</span>
                        <button type="button" onClick={copy} aria-label={copied ? 'Copied' : 'Copy email'}><Icon n={copied ? 'check' : 'copy'} size={14} /></button>
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="foot-note"><p>&copy; {new Date().getFullYear()} Laksh Pradhwani. Hand-built in React, with a little help from Claude Code.</p></div>
      <div className="clouds-foot" aria-hidden="true" ref={clouds}><i /><i /><i className="front" /></div>
    </section>
  );
}
