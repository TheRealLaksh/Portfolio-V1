import React, { useRef } from 'react';
import { range, ss, backOut, useTrack, useScrub } from './hooks';
import Icon from './Icon';

// "My own product": Profiley, the resume builder. Only facts that are true today.
const HATS = [
  ['#E8505B', 'target', 'Founder', 'Picked a problem I know: resumes.'],
  ['#F2A93B', 'pen', 'Product designer', 'Live preview, themes and a calm editor.'],
  ['#8E7CFF', 'layers', 'UI designer', 'Ten-plus resume themes you can switch in one click.'],
  ['#1FA6A0', 'code', 'Frontend developer', 'React 19, Vite and Tailwind CSS.'],
  ['#3395FF', 'gear', 'Backend developer', 'Firebase for accounts and saved resumes.'],
  ['#13233A', 'rocket', 'Launch', 'Live on its own subdomain, free to use.'],
];

const THEMES = ['#E8505B', '#1FA6A0', '#8E7CFF', '#F2A93B'];

function Hats({ rv = true }) {
  return (
    <ol>
      {HATS.map(([c, ic, t, d], i) => (
        <li key={t} {...(rv ? { 'data-rv': '' } : {})} style={{ ['--c']: c, transitionDelay: rv ? `${i * 0.08}s` : undefined }}>
          <i className="hat"><Icon n={ic} size={20} /></i><b>{t}</b><span>{d}</span>
        </li>
      ))}
    </ol>
  );
}

const Links = () => (
  <>
    <a className="btn-main" href="https://profiley.lakshpradhwani.com" target="_blank" rel="noopener noreferrer">Open Profiley <Icon n="ext" size={16} /></a>
    <a className="btn-ghost" href="https://github.com/TheRealLaksh/Profiley-Resume-Builder" target="_blank" rel="noopener noreferrer">Read the code on GitHub</a>
  </>
);

// A tiny resume that fills itself in as you scroll: the "live preview", drawn in plain shapes.
function ResumeMock() {
  return (
    <div className="rs-mock" aria-hidden="true">
      <div className="rs-top">
        <span className="rs-dots"><i /><i /><i /></span>
        <span className="rs-themes">{THEMES.map((c) => <i key={c} style={{ background: c }} />)}</span>
      </div>
      <div className="rs-doc">
        <div className="rs-head"><b>Laksh Pradhwani</b><span>Full-stack developer</span></div>
        {[0, 1, 2].map((s) => (
          <div className="rs-sec" key={s} data-s={s}>
            <em />
            <span style={{ ['--w']: '92%' }} /><span style={{ ['--w']: '78%' }} /><span style={{ ['--w']: '64%' }} />
          </div>
        ))}
      </div>
      <div className="rs-pdf"><Icon n="file" size={14} />Export PDF</div>
    </div>
  );
}

export default function Flagship() {
  const scrub = useScrub();
  const track = useRef(null);
  const stage = useRef(null);
  const tell = useRef(null);
  const mock = useRef(null);
  const hats = useRef(null);
  const cta = useRef(null);

  useTrack(track, (p) => {
    // text first: highlights paint, the resume fills in beside it
    tell.current.querySelectorAll('.hl').forEach((el, i) => {
      el.style.setProperty('--hp', ss(range(p, 0.1 + i * 0.11, 0.24 + i * 0.11)).toFixed(3));
    });
    const m = mock.current;
    if (m) {
      const into = ss(range(p, 0, 0.14));
      const gone = ss(range(p, 0.5, 0.62));
      m.style.transform = `translate3d(0,${((1 - into) * 60 - gone * 40).toFixed(1)}px,0) rotate(${(-3 + into * 3 + gone * 4).toFixed(2)}deg) scale(${(0.82 + 0.18 * into - 0.1 * gone).toFixed(3)})`;
      m.style.opacity = String(into * (1 - gone));
      m.querySelectorAll('.rs-sec').forEach((sec, i) => {
        sec.style.setProperty('--f', ss(range(p, 0.12 + i * 0.1, 0.26 + i * 0.1)).toFixed(3));
      });
      m.style.setProperty('--acc', THEMES[Math.min(THEMES.length - 1, Math.floor(range(p, 0.2, 0.5) * THEMES.length))]);
    }
    // then every hat arrives, one by one, and the call to action
    const h = hats.current;
    if (h) {
      h.style.opacity = String(ss(range(p, 0.5, 0.58)));
      h.querySelectorAll('li').forEach((li, i) => {
        const t = range(p, 0.52 + i * 0.065, 0.62 + i * 0.065);
        const e = t < 1 ? backOut(t) : 1;
        li.style.opacity = String(Math.min(1, t * 2));
        li.style.transform = `translate3d(${((1 - e) * 70).toFixed(1)}px,0,0) scale(${(0.9 + 0.1 * e).toFixed(3)})`;
      });
    }
    if (cta.current) cta.current.style.opacity = String(ss(range(p, 0.88, 0.97)));
    if (stage.current) {
      const out = ss(range(p, 0.94, 1));
      stage.current.style.transform = `scale(${(1 - 0.04 * out).toFixed(4)})`;
    }
  }, { enabled: scrub, damp: 8 });

  const tellEl = (
    <p className="tell ll-tell" ref={tell} {...(scrub ? {} : { 'data-rv': '' })}>
      <span className="hl b-sun">Profiley</span> is a resume builder with a <span className="hl b-mint">live preview,</span> ten-plus themes and
      <span className="hl b-peach"> one-click PDF export.</span> The resume link on this site is rendered by it.
    </p>
  );

  if (scrub) {
    return (
      <section className="ll torn" id="profiley" aria-label="Profiley, my own product" ref={track}>
        <div className="ll-pin" ref={stage}>
          <div className="wrap ll-grid">
            <div className="ll-left">
              <div className="sec-head" data-rv>
                <p className="kicker"><Icon n="file" size={16} />My own product</p>
                <h2>I built my own <span className="hl b-coral">resume builder.</span></h2>
              </div>
              {tellEl}
              <div className="ll-cta ll-cta-s" ref={cta}><Links /></div>
            </div>
            <div className="ll-right">
              <div className="ll-mock" ref={mock}><ResumeMock /></div>
              <div className="ll-roles ll-roles-s" ref={hats}>
                <p className="ll-roles-k">Every hat I wore to ship it</p>
                <Hats rv={false} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="ll torn" id="profiley" aria-label="Profiley, my own product">
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="file" size={16} />My own product</p>
          <h2>I built my own <span className="hl b-coral">resume builder.</span></h2>
        </div>
        {tellEl}

        <div className="ll-end">
          <div className="ll-roles">
            <p className="ll-roles-k" data-rv>Every hat I wore to ship it</p>
            <Hats />
          </div>
          <div className="ll-cta" data-rv><Links /></div>
        </div>
      </div>
    </section>
  );
}
