import React from 'react';
import { NOTE_STICKIES } from './data';
import Icon from './Icon';

// "How I got here": one paragraph with marker highlights that draw once as it enters view,
// plus sticky notes you can drag. No pinned scene and no word-by-word fill.
export default function Story() {
  return (
    <section className="story" id="story" aria-label="How I got here">
      <div className="wrap">
        <p className="kicker" data-rv><Icon n="star" size={16} />How I got here</p>
        <div className="tell-box">
          <p className="tell" data-rv>
            I started out as a <span className="hl b-sky">national-level shooter</span>, learning to stay calm and repeat one small motion perfectly.
            Then I got hooked on <span className="hl b-sun">how things get built.</span> So I taught myself to code, and
            I&rsquo;ve been <span className="hl b-coral">shipping real products</span> ever since, from hotel networks to <span className="hl b-lilac">a startup&rsquo;s whole platform.</span>
          </p>
          {NOTE_STICKIES.map((s, i) => (
            <div key={i} className="sticky" data-rv data-drag style={{ ['--sc']: s.sc, ['--r']: `${s.r}deg`, transitionDelay: `${0.15 + i * 0.18}s`, ...s.pos }}>
              {s.text}<small>{s.small}</small>
            </div>
          ))}
          <p className="move-hint" data-rv>these notes move ;)</p>
        </div>
      </div>
    </section>
  );
}
