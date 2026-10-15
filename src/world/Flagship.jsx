import React from 'react';
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

export default function Flagship() {
  return (
    <section className="ll torn" id="profiley" aria-label="Profiley, my own product">
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="file" size={16} />My own product</p>
          <h2>I built my own <span className="hl b-coral">resume builder.</span></h2>
        </div>
        <p className="tell ll-tell" data-rv>
          <span className="hl b-sun">Profiley</span> is a resume builder with a <span className="hl b-mint">live preview,</span> ten-plus themes and
          <span className="hl b-peach"> one-click PDF export.</span> The resume link on this site is rendered by it.
        </p>

        <div className="ll-end">
          <div className="ll-roles">
            <p className="ll-roles-k" data-rv>Every hat I wore to ship it</p>
            <ol>
              {HATS.map(([c, ic, t, d], i) => (
                <li key={t} data-rv style={{ ['--c']: c, transitionDelay: `${i * 0.08}s` }}>
                  <i className="hat"><Icon n={ic} size={20} /></i><b>{t}</b><span>{d}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="ll-cta" data-rv>
            <a className="btn-main" href="https://profiley.lakshpradhwani.com" target="_blank" rel="noopener noreferrer">Open Profiley <Icon n="ext" size={16} /></a>
            <a className="btn-ghost" href="https://github.com/TheRealLaksh/Profiley-Resume-Builder" target="_blank" rel="noopener noreferrer">Read the code on GitHub</a>
          </div>
        </div>
      </div>
    </section>
  );
}
