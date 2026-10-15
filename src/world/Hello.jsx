import React, { useEffect, useState } from 'react';
import { ME, waLink } from './data';
import Icon from './Icon';

const mailto = `mailto:${ME.email}?subject=${encodeURIComponent('Project enquiry')}`;
const bookHref = ME.book || waLink("Hi Laksh, I'd like to book a quick call.");

const KEYS = [
  { k: 'm', ic: 'mail', c: '#EA4335', d: '#A92A20', href: mailto, label: 'Email me', note: 'Roles, projects, or just hi.', dn: true, mail: true },
  { k: 'i', ic: 'insta', c: '#DD2A7B', d: '#8A1E57', href: ME.instagram, label: 'Instagram', note: 'Where I share the build.', dn: false, bg: 'linear-gradient(40deg,#F9A13A,#EE2A7B 45%,#8134AF 80%,#515BD4)' },
  { k: 'l', ic: 'linkedin', c: '#0A66C2', d: '#063F7A', href: ME.linkedin, label: 'LinkedIn', note: 'The work, and what I learned doing it.', dn: true },
  { k: 't', ic: 'call', c: '#25A55F', d: '#177A43', href: bookHref, label: ME.book ? 'Book a call' : 'Message on WhatsApp', note: ME.book ? 'Book a 30-minute call.' : 'Fastest way to reach me.', dn: false },
  { k: 'r', ic: 'file', c: '#FFC93C', d: '#C99A0E', fg: '#1B1F3B', href: ME.resume, label: 'Resume', note: 'My resume, one click away.', dn: true },
];

export default function Hello() {
  const [pressed, setPressed] = useState(null);
  const [copied, setCopied] = useState(false);

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
    <section className="hello" id="hello" aria-label="Contact">
      <div className="hello-sky" aria-hidden="true" />
      <div className="wrap inner">
        <h2 data-rv>Let&rsquo;s build something <span className="rq">people use.</span></h2>
        <p data-rv>Open to projects with founders, startups and local businesses. I reply fast.</p>
        <div className="keys-mat" data-rv>
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
      <div className="clouds-foot" aria-hidden="true"><i /><i /><i className="front" /></div>
    </section>
  );
}
