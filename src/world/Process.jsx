import React from 'react';
import { PROCESS } from './data';
import Icon from './Icon';

export default function Process() {
  return (
    <section className="process torn" id="process" aria-label="How I work">
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="bulb" size={16} />How I work</p>
          <h2>I ship the <span className="hl b-mint">smallest useful thing,</span> then keep going.</h2>
          <p>{PROCESS.title}, step by step. It is how I approach most projects.</p>
        </div>
        <ol className="proc">
          {PROCESS.steps.map((s, i) => (
            <li key={s.t} data-rv style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className="pn">{i + 1}</span>
              <div><h3>{s.t}</h3><p>{s.p}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
