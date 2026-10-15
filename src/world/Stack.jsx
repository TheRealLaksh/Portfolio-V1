import React, { useState } from 'react';
import { STACK } from './data';
import Icon from './Icon';

const mark = (n) => n.replace(/[^A-Za-z+]/g, '').slice(0, 2);

export default function Stack() {
  const [sel, setSel] = useState(null);
  const t = sel != null ? STACK[sel] : null;
  return (
    <section className="stack torn" id="stack" aria-label="My stack">
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="gear" size={16} />My stack</p>
          <h2>Everything I know, <span className="hl b-sun">unwrapped.</span></h2>
          <p>{STACK.length} tools I use. Hover or tap one to see what I do with it.</p>
        </div>

        <div className="toolbox" data-rv onMouseLeave={() => setSel(null)}>
          <ul className="tools" role="list">
            {STACK.map((s, i) => (
              <li key={s.n}>
                <button
                  type="button"
                  className={`tool ${sel === i ? 'on' : ''}`}
                  style={{ ['--tc']: s.c, ['--i']: i }}
                  onMouseEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  onClick={() => setSel(sel === i ? null : i)}
                  aria-pressed={sel === i}
                >
                  <span className="tool-i">{mark(s.n)}</span>
                  <span className="tool-n">{s.n}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="tool-tip" role="status" style={t ? { ['--tc']: t.c } : undefined}>
            {t ? (
              <>
                <div className="tt-h"><span className="tt-i">{mark(t.n)}</span><div><b>{t.n}</b><span>{t.cat}</span></div></div>
                <p>{t.p}</p>
              </>
            ) : (
              <p className="tt-idle">My toolkit. <span>Hover</span> a tool to see what I do with it.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
