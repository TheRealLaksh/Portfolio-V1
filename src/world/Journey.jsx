import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import { JOURNEY } from './data';
import { clamp, range, ss, trackProgress, useScrollFrame, SCRUB_QUERY } from './hooks';
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
      <path className="m-flow" d="M-10 330 C 140 300 220 360 360 330 C 500 300 560 220 690 238 C 800 252 900 340 1010 330 C 1100 322 1160 290 1210 300" />
      {trees.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.k})`} className="m-tree">
          <circle cx="0" cy="-8" r="9" /><rect x="-1.4" y="0" width="2.8" height="8" />
        </g>
      ))}
      <g className="m-mount" transform="translate(240 250)"><path d="M0 40 L40 -20 L80 40Z" /><path d="M50 40 L90 -4 L130 40Z" /></g>
      <g className="m-mount" transform="translate(800 120)"><path d="M0 40 L36 -16 L72 40Z" /></g>
      <g className="m-wave" transform="translate(70 640)"><path d="M0 0 q10 -10 20 0 t20 0 t20 0" /></g>
      <g className="m-wave" transform="translate(980 650)"><path d="M0 0 q10 -10 20 0 t20 0 t20 0" /></g>
      {[[60, 44], [300, 22], [610, 16], [900, 30], [1100, 16], [200, 708], [520, 714], [800, 706], [1050, 710], [1150, 698]].map(([x, y], i) => (
        <g key={i} className="m-wave" transform={`translate(${x} ${y})`}><path className="m-wv" style={{ animationDelay: `${-i * 0.55}s` }} d="M0 0 q10 -10 20 0 t20 0 t20 0" /></g>
      ))}
      {[[0, 26, 70], [0, 704, 90]].map(([x, y, dur], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="m-sail" style={{ animationDuration: `${dur}s`, animationDelay: `${-i * 31}s` }}>
            <g className="m-boat" style={{ animationDelay: `${-i * 1.3}s` }}>
              <path d="M-22 0 L22 0 L15 10 L-15 10Z" fill="#8A5A3B" />
              <rect x="-1.2" y="-32" width="2.4" height="32" fill="#7C5233" />
              <path d="M2 -30 L20 -4 L2 -4Z" fill="#FFF4DC" stroke="#C9B49A" strokeWidth="1" />
              <path d="M-2 -26 L-14 -4 L-2 -4Z" fill="#fff" stroke="#C9B49A" strokeWidth="1" />
            </g>
          </g>
        </g>
      ))}
      {[[0, 150, 38], [0, 560, 52]].map(([x, y, dur], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="m-flock" style={{ animationDuration: `${dur}s`, animationDelay: `${-i * 17}s` }}>
            {[[0, 0], [22, -10], [24, 12], [48, 0]].map(([bx, by], k) => <path key={k} className="m-bird" style={{ animationDelay: `${k * 0.18}s` }} d={`M${bx - 9} ${by} q4.5 -7 9 0 q4.5 -7 9 0`} />)}
          </g>
        </g>
      ))}
      {[[-300, 140, 1], [-300, 420, 1.2], [-300, 600, .9]].map(([x, y, k], i) => (
        <ellipse key={i} className="m-shade" cx={x} cy={y} rx={150 * k} ry={46 * k} style={{ animationDelay: `${-i * 19}s`, animationDuration: `${62 + i * 9}s` }} />
      ))}
    </g>
  );
}

// The map is 1200 x 720 and is fitted to the frame; on wide screens the card takes the right 380 px.
// Returns the transform that shows `target` (map coordinates) at zoom `k`.
function place(w, h, k, target) {
  const avail = w > 1000 ? w - 380 : w >= 720 ? w - 300 : w;
  const s = Math.min(avail / 1200, h / 720) * k;
  const mw = 1200 * s;
  const mh = 720 * s;
  if (k <= 1) return { x: (avail - mw) / 2, y: (h - mh) / 2, s };
  return {
    x: Math.min(0, Math.max(avail - mw, avail / 2 - target[0] * s)),
    y: Math.min(0, Math.max(h - mh, h / 2 - target[1] * s)),
    s,
  };
}

// Scroll mode: the track is TRACK_VH viewport heights tall with the stage pinned inside it. Scroll
// position y (in viewport heights) maps to a stop coordinate f in 0..8: LEAD of lead-in, then one
// viewport per stop (stop n sits at y = LEAD + n), the rest is lead-out.
const TRACK_VH = JOURNEY.length + 1;
const LEAD = 0.5;
const INTRO_END = 0.3; // before this the card shows the intro, after it stop 1

// Phones and visitors who ask for less motion get the stacked layout with buttons instead.
const canScrub = () => typeof window !== 'undefined' && window.matchMedia(SCRUB_QUERY).matches;

export default function Journey() {
  const [i, setI] = useState(-1); // -1 = intro, before the first stop
  const [k, setK] = useState(1);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [len, setLen] = useState(0);
  const [scrub, setScrub] = useState(canScrub);

  const track = useRef(null);
  const pin = useRef(null);
  const frame = useRef(null);
  const world = useRef(null);
  const pathRef = useRef(null);
  const trav = useRef(null);
  const geo = useRef(null); // { L, SL }: route length, and the length at which each stop sits
  const live = useRef({ f: 0, k: 1, size, scrub, i: -1 }); // read by the scroll loop, never rendered
  const lenis = useLenis();
  const d = useMemo(() => curve(PTS), []);
  live.current.k = k;
  live.current.size = size;
  live.current.scrub = scrub;

  useEffect(() => {
    const mq = window.matchMedia(SCRUB_QUERY);
    const on = () => setScrub(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Measure the route once: how far along the path each stop is (the curve passes through every stop).
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    const N = 1500;
    const samples = Array.from({ length: N + 1 }, (_, n) => p.getPointAtLength((L * n) / N));
    let from = 0;
    const SL = PTS.map(([x, y]) => {
      let best = from;
      let bd = Infinity;
      for (let n = from; n <= N; n++) {
        const dd = (samples[n].x - x) ** 2 + (samples[n].y - y) ** 2;
        if (dd < bd) { bd = dd; best = n; }
      }
      from = best;
      return (L * best) / N;
    });
    SL[0] = 0;
    SL[SL.length - 1] = L;
    geo.current = { L, SL };
    setLen(L);
  }, []);

  useEffect(() => {
    const fr = frame.current;
    if (!fr || !('ResizeObserver' in window)) return undefined;
    const ro = new ResizeObserver(() => {
      const w = fr.clientWidth;
      const h = fr.clientHeight;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    ro.observe(fr);
    return () => ro.disconnect();
  }, []);

  // Paint the route, the traveller and the map pan for the current stop coordinate (scroll mode).
  // Direct DOM writes: React state only changes when the current stop does.
  const draw = () => {
    const g = geo.current;
    const { f, k: kk, size: sz } = live.current;
    const path = pathRef.current;
    if (!g || !path || !world.current || !trav.current || !sz.w) return;
    const n = Math.min(Math.floor(f), PTS.length - 2);
    const cur = f >= PTS.length - 1 ? g.L : g.SL[n] + (g.SL[n + 1] - g.SL[n]) * ss(f - n);
    const pt = path.getPointAtLength(cur);
    trav.current.style.transform = `translate(${pt.x}px, ${pt.y - 44}px)`;
    path.style.strokeDasharray = g.L;
    path.style.strokeDashoffset = g.L - cur;
    const pan = place(sz.w, sz.h, kk, [pt.x, pt.y]);
    world.current.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${pan.s})`;
  };

  useScrollFrame(() => {
    if (!live.current.scrub || !track.current) return;
    const y = trackProgress(track.current) * (TRACK_VH - 1);
    const f = clamp(y - LEAD, 0, JOURNEY.length - 1);
    live.current.f = f;
    draw();
    pin.current?.style.setProperty('--intro', (1 - range(y, 0.12, INTRO_END + 0.1)).toFixed(3));
    const idx = y < INTRO_END ? -1 : Math.round(f);
    if (idx !== live.current.i) { live.current.i = idx; setI(idx); }
  });

  // Redraw when something other than scrolling changes the picture (zoom, resize, mode, route measured).
  useEffect(() => {
    if (scrub) draw();
    return () => {
      // leaving scroll mode: hand the styles back to React
      [world.current, trav.current].forEach((el) => { if (el) el.style.transform = ''; });
      if (pathRef.current) { pathRef.current.style.strokeDasharray = ''; pathRef.current.style.strokeDashoffset = ''; }
    };
  }, [scrub, k, size, len]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = JOURNEY.length;
  const stop = i >= 0 ? JOURNEY[i] : null;
  const progress = i < 0 ? 0 : i / (total - 1);
  const pan = place(size.w, size.h, k, i < 0 ? [600, 360] : PTS[i]);
  const here = i < 0 ? PTS[0] : PTS[i];

  const go = (n) => {
    const to = Math.max(-1, Math.min(total - 1, n));
    if (!scrub) { setI(to); return; }
    const tr = track.current;
    if (!tr) return;
    const y = window.scrollY + tr.getBoundingClientRect().top + (to < 0 ? 0 : (LEAD + to) * window.innerHeight);
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };
  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(i + 1);
    if (e.key === 'ArrowLeft') go(i - 1);
  };
  const zoom = (next) => {
    const w = world.current;
    if (w) { w.classList.add('zoomin'); setTimeout(() => w.classList.remove('zoomin'), 500); }
    setK(next);
  };

  return (
    <section className={`journey torn ${scrub ? 'scrub' : 'torn-bot'}`} id="journey" ref={track} aria-label="The journey">
      <div className="j-pin" ref={pin}>
        <div className="j-head">
          <div className="wrap">
            <div className="sec-head" data-rv>
              <p className="kicker"><Icon n="map" size={16} />The journey</p>
              <h2>School to startup, <span className="hl b-sky">one step at a time.</span></h2>
              <p>Nine stops between 2019 and now. {scrub ? 'Scroll to walk the path.' : 'Use the buttons or the dots to walk the path.'}</p>
            </div>
          </div>
        </div>

        <div className="j-stage" tabIndex={0} onKeyDown={onKey} aria-label="Journey map. Use the arrow keys to move between stops.">
          <div className="j-frame" ref={frame}>
            <div className="j-world" ref={world} style={scrub ? undefined : { transform: `translate(${pan.x}px, ${pan.y}px) scale(${pan.s || 1})` }}>
              <svg viewBox="0 0 1200 720" width="1200" height="720" aria-hidden="true" focusable="false">
                <MapArt />
                <path d={d} className="route-base" />
                <path ref={pathRef} d={d} className="route" style={scrub ? undefined : { strokeDasharray: len || 1, strokeDashoffset: len ? len * (1 - progress) : 1 }} />
                {PTS.map(([x, y], n) => (
                  <g key={n} className={`stop ${n === i ? 'on' : ''} ${n < i ? 'done' : ''}`} transform={`translate(${x} ${y})`} onClick={() => go(n)}>
                    <circle className="stop-halo" r="30" />
                    <circle className="stop-dot" r="19" />
                    <text className="stop-n" y="5" textAnchor="middle">{n + 1}</text>
                  </g>
                ))}
                {/* the traveller */}
                <g className="trav" ref={trav} style={scrub ? undefined : { transform: `translate(${here[0]}px, ${here[1] - 44}px)` }}>
                  <ellipse cx="0" cy="44" rx="12" ry="4" className="trav-sh" />
                  <g className="trav-bob">
                    <path className="trav-pin" d="M0 38 C -16 20 -22 8 -22 -4 a22 22 0 0 1 44 0 C 22 8 16 20 0 38Z" />
                    <clipPath id="travClip"><circle cx="0" cy="-4" r="15" /></clipPath>
                    <image href="/me.webp" x="-22" y="-26" width="44" height="44" clipPath="url(#travClip)" preserveAspectRatio="xMidYMid slice" />
                  </g>
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
            <button className="solo" type="button" aria-label="Recentre map" onClick={() => zoom(1)}><Icon n="locate" size={18} /></button>
            <div className="grp">
              <button type="button" aria-label="Zoom in" onClick={() => zoom(Math.min(1.8, Math.round((Math.max(1, k) + 0.4) * 10) / 10))}><Icon n="plus" size={18} /></button>
              <button type="button" aria-label="Zoom out" onClick={() => zoom(Math.max(1, Math.round((k - 0.4) * 10) / 10))}><Icon n="minus" size={18} /></button>
            </div>
          </div>

          {/* Previous/next buttons only exist where the page is not scroll-driven (phones, reduced motion). */}
          {!scrub && (
            <div className="jcar">
              <button type="button" onClick={() => go(i - 1)} disabled={i < 0} aria-label="Previous stop"><Icon n="arrow" size={18} className="flip" /></button>
              <span>{i < 0 ? `${total} stops` : `${i + 1} / ${total}`}</span>
              <button type="button" className="nx" onClick={() => go(i + 1)} disabled={i >= total - 1}>
                {i < 0 ? 'Start the journey' : i >= total - 1 ? 'You are here' : 'Next stop'} <Icon n="arrow" size={18} />
              </button>
            </div>
          )}

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
      </div>
    </section>
  );
}
