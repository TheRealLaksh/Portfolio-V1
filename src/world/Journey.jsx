import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JOURNEY } from './data';
import Icon from './Icon';

// Stop positions on a 1200 x 720 map. The path is a smooth curve through them (Catmull-Rom).
const PTS = [[110, 575], [250, 405], [400, 560], [535, 330], [690, 500], [800, 270], [925, 470], [1040, 300], [1110, 545]];

function curve(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function MapArt() {
  const trees = useMemo(() => {
    let s = 9;
    const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: 46 }, () => ({ x: 40 + r() * 1120, y: 40 + r() * 640, k: 0.6 + r() * 0.7 }));
  }, []);
  return (
    <g className="mapart">
      <rect className="m-sea" width="1200" height="720" />
      <path className="m-land" d="M-20 140 C 120 80 260 120 340 80 C 470 30 560 90 700 70 C 840 50 940 90 1060 60 C 1140 40 1200 60 1230 80 L1230 700 C 1100 730 1000 690 880 710 C 740 730 640 690 520 712 C 380 736 260 690 130 716 C 60 728 0 716 -20 700Z" />
      <path className="m-land2" d="M60 470 C 160 430 230 470 330 450 C 420 432 470 470 560 456 C 660 440 720 380 800 392 C 900 408 940 470 1040 450 C 1110 436 1160 470 1200 490 L1200 700 L60 700Z" />
      <path className="m-river" d="M-10 330 C 140 300 220 360 360 330 C 500 300 560 220 690 238 C 800 252 900 340 1010 330 C 1100 322 1160 290 1210 300" />
      {trees.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.k})`} className="m-tree">
          <circle cx="0" cy="-8" r="9" /><rect x="-1.4" y="0" width="2.8" height="8" />
        </g>
      ))}
      <g className="m-mount" transform="translate(240 250)"><path d="M0 40 L40 -20 L80 40Z" /><path d="M50 40 L90 -4 L130 40Z" /></g>
      <g className="m-mount" transform="translate(800 120)"><path d="M0 40 L36 -16 L72 40Z" /></g>
      <g className="m-wave" transform="translate(70 640)"><path d="M0 0 q10 -10 20 0 t20 0 t20 0" /></g>
      <g className="m-wave" transform="translate(980 650)"><path d="M0 0 q10 -10 20 0 t20 0 t20 0" /></g>
    </g>
  );
}

export default function Journey() {
  const [i, setI] = useState(-1); // -1 = intro, before the first stop
  const [k, setK] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pathRef = useRef(null);
  const frame = useRef(null);
  const [len, setLen] = useState(0);
  const d = useMemo(() => curve(PTS), []);

  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, []);

  // Centre the map on the current stop when zoomed in.
  useEffect(() => {
    const fr = frame.current;
    if (!fr) return;
    const w = fr.clientWidth;
    const h = fr.clientHeight;
    // On wide screens the card sits on the right, so the map is fitted to the space left of it.
    const wide = w > 900;
    const avail = wide ? w - 380 : w;
    const base = Math.min(avail / 1200, h / 720);
    const s = base * k;
    const mw = 1200 * s;
    const mh = 720 * s;
    let X;
    let Y;
    if (k <= 1) {
      X = (avail - mw) / 2;
      Y = (h - mh) / 2;
    } else {
      const target = i < 0 ? [600, 360] : PTS[i];
      X = Math.min(0, Math.max(avail - mw, avail / 2 - target[0] * s));
      Y = Math.min(0, Math.max(h - mh, h / 2 - target[1] * s));
    }
    setPan({ x: X, y: Y, s });
  }, [i, k]);

  useEffect(() => {
    const fr = frame.current;
    if (!fr || !('ResizeObserver' in window)) return undefined;
    const ro = new ResizeObserver(() => setK((v) => v + 0.0000001));
    ro.observe(fr);
    return () => ro.disconnect();
  }, []);

  const total = JOURNEY.length;
  const stop = i >= 0 ? JOURNEY[i] : null;
  const progress = i < 0 ? 0 : i / (total - 1);
  const go = (n) => setI(Math.max(-1, Math.min(total - 1, n)));
  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(i + 1);
    if (e.key === 'ArrowLeft') go(i - 1);
  };

  return (
    <section className="journey torn torn-bot" id="journey" aria-label="The journey">
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="map" size={16} />The journey</p>
          <h2>School to startup, <span className="hl b-sky">one step at a time.</span></h2>
          <p>Nine stops between 2019 and now. <span className="j-how">Press next, or tap a dot, to walk the path.</span></p>
        </div>
      </div>

      <div className="j-stage" tabIndex={0} onKeyDown={onKey} aria-label="Journey map. Use the arrow keys to move between stops.">
        <div className="j-frame" ref={frame}>
          <div className="j-world" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${pan.s || 1})` }}>
            <svg viewBox="0 0 1200 720" width="1200" height="720" aria-hidden="true" focusable="false">
              <MapArt />
              <path d={d} className="route-base" />
              <path ref={pathRef} d={d} className="route" style={{ strokeDasharray: len || 1, strokeDashoffset: len ? len * (1 - progress) : 1 }} />
              {PTS.map(([x, y], n) => (
                <g key={n} className={`stop ${n === i ? 'on' : ''} ${n < i ? 'done' : ''}`} transform={`translate(${x} ${y})`} onClick={() => go(n)}>
                  <circle className="stop-halo" r="30" />
                  <circle className="stop-dot" r="19" />
                  <text className="stop-n" y="5" textAnchor="middle">{n + 1}</text>
                </g>
              ))}
              {/* the traveller */}
              <g className="trav" style={{ transform: `translate(${(i < 0 ? PTS[0] : PTS[i])[0]}px, ${(i < 0 ? PTS[0] : PTS[i])[1] - 44}px)` }}>
                <ellipse cx="0" cy="44" rx="12" ry="4" className="trav-sh" />
                <path className="trav-pin" d="M0 38 C -16 20 -22 8 -22 -4 a22 22 0 0 1 44 0 C 22 8 16 20 0 38Z" />
                <clipPath id="travClip"><circle cx="0" cy="-4" r="15" /></clipPath>
                <image href="/me.webp" x="-22" y="-26" width="44" height="44" clipPath="url(#travClip)" preserveAspectRatio="xMidYMid slice" />
              </g>
            </svg>
          </div>
        </div>

        <article className="jcard" aria-live="polite">
          {stop ? (
            <div className="jc-in" key={i}>
              <div className="jc-top"><span className="jc-yr">{stop.y}</span><span className="jc-ic"><Icon n={stop.icon} size={20} /></span></div>
              <h3>{stop.t}</h3>
              <p className="jc-role">{stop.r}</p>
              <p>{stop.p}</p>
            </div>
          ) : (
            <div className="jc-in" key="intro">
              <div className="jc-top"><span className="jc-yr">2019 &rarr; now</span><span className="jc-ic"><Icon n="map" size={20} /></span></div>
              <h3>Ready when you are.</h3>
              <p>Nine stops: from a residential school in Coimbatore, through the shooting range, a hotel network and four internships, to a Delhi startup.</p>
            </div>
          )}
        </article>

        <div className="mapctl" aria-label="Map controls">
          <button className="solo" type="button" aria-label="Recentre map" onClick={() => setK(1)}><Icon n="locate" size={18} /></button>
          <div className="grp">
            <button type="button" aria-label="Zoom in" onClick={() => setK((v) => Math.min(1.8, Math.round((Math.max(1, v) + 0.4) * 10) / 10))}><Icon n="plus" size={18} /></button>
            <button type="button" aria-label="Zoom out" onClick={() => setK((v) => Math.max(1, Math.round((v - 0.4) * 10) / 10))}><Icon n="minus" size={18} /></button>
          </div>
        </div>

        <div className="jcar">
          <button type="button" onClick={() => go(i - 1)} disabled={i < 0} aria-label="Previous stop"><Icon n="arrow" size={18} className="flip" /></button>
          <span>{i < 0 ? `${total} stops` : `${i + 1} / ${total}`}</span>
          <button type="button" className="nx" onClick={() => go(i + 1)} disabled={i >= total - 1}>
            {i < 0 ? 'Start the journey' : i >= total - 1 ? 'You are here' : 'Next stop'} <Icon n="arrow" size={18} />
          </button>
        </div>

        <nav className="jtl" aria-label="Stops">
          <ol>
            {JOURNEY.map((s, n) => (
              <li key={s.t}>
                <button type="button" className={n === i ? 'on' : n < i ? 'done' : ''} onClick={() => go(n)} aria-label={`${s.y}: ${s.t}`} aria-current={n === i ? 'step' : undefined}><i /></button>
              </li>
            ))}
          </ol>
          <span className="yr">{stop ? stop.y : '2019 → now'}</span>
        </nav>
      </div>
    </section>
  );
}
