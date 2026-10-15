import React from 'react';
import { Link } from 'react-router-dom';
import { SITES, ME, waLink } from './data';
import { packages } from '../data/packages';
import Icon from './Icon';

export default function Brand() {
  const cta = ME.book || waLink("Hi Laksh, I'd like to talk about a website for my business.");
  return (
    <section className="brand-sec torn" id="brand" aria-label="Websites and services">
      <div className="wrap">
        <div className="brand-head">
          <div className="sec-head" data-rv>
            <p className="kicker"><Icon n="pen" size={16} />Websites for people</p>
            <h2>Websites that <span className="hl b-coral">work for your business.</span></h2>
            <p>From a first sketch to launch day, with an admin panel your own team can run.</p>
            <a className="btn-main" href={cta} target="_blank" rel="noopener noreferrer">Start a project <Icon n="ext" size={16} /></a>
          </div>
        </div>

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
        <p className="pk-more" data-rv><Link to="/hire">See every package and what is included <Icon n="arrow" size={16} /></Link></p>

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
