import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import { JOURNEY } from './data';
import { clamp, range, ss, trackProgress, useScrollFrame, SCRUB_QUERY } from './hooks';
import { STEP, LOCAL0, stX, FarLayer, MidLayer, NearLayer, ForeLayer, Train, SkyArt } from './trainArt';
import Icon from './Icon';
import './train.css';

// The journey is a train line: one station per stop. Scrolling drives the train; the camera follows it.
// Layers slide at different speeds (parallax), the sky runs from dawn to night, each station builds
// itself as the train arrives, and a passport stamp lands for every stop.

const N = JOURNEY.length;
const YEARS = JOURNEY.map((s) => s.y.replace(' – ', '-'));
const PAR = { far: 0.15, mid: 0.5, near: 1, fore: 1.35 };

// Where the train is on the line for stop coordinate f (0..N-1). It dwells at each station, then glides.
const trainX = (f) => {
  if (f >= N - 1) return stX(N - 1);
  const n = Math.floor(f);
  return stX(n) + STEP * ss(range(f - n, 0.14, 0.86));
};

// Sky and light for a time of day t (0 = dawn, 1 = night): [t, top, bottom, tint rgba]
const hex = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
const KEYS = [
  [0, '#9CC9EE', '#FFD9A8', [255, 170, 110, 0.1]],
  [0.14, '#6FBDF0', '#CDEBF8', [255, 255, 255, 0]],
  [0.42, '#3E8EDB', '#A9DCE6', [255, 255, 255, 0]],
  [0.66, '#5E98D8', '#FFD58F', [255, 160, 70, 0.12]],
  [0.84, '#4A4E9C', '#F6A07C', [90, 50, 130, 0.3]],
  [1, '#0A0E2E', '#2B2260', [10, 14, 60, 0.5]],
].map(([t, a, b, o]) => ({ t, a: hex(a), b: hex(b), o }));
const NIGHT = [
  { t: 0, a: hex('#141A4A'), b: hex('#4B3A7A'), o: [10, 14, 60, 0.46] },
  { t: 1, a: hex('#0A0E2E'), b: hex('#2B2260'), o: [10, 14, 60, 0.5] },
];
const lerp = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);
const css = (c) => `rgb(${c.slice(0, 3).map(Math.round).join(',')})`;
function sky(t, night) {
  const keys = night ? NIGHT : KEYS;
  let k = 0;
  while (k < keys.length - 2 && t > keys[k + 1].t) k++;
  const A = keys[k];
  const B = keys[k + 1];
  const u = clamp((t - A.t) / (B.t - A.t));
  return { top: lerp(A.a, B.a, u), bot: lerp(A.b, B.b, u), o: lerp(A.o, B.o, u) };
}

// Frame geometry. Wide screens show the full 720-unit scene; the stacked layout crops it a little.
function geom(w, h, scrub) {
  const Hv = scrub ? 720 : 600;
  const y0 = scrub ? 0 : 130;
  // wide screens: fit the scene, but keep the rail above the stamp strip on short screens
  const s = scrub ? Math.min(h / 720, (h - 118) / 600) : h / Hv;
  const avail = !scrub ? w : w > 1000 ? w - 380 : w - 300;
  return { Hv, y0, s, ax: (avail / s) * (scrub ? 0.48 : 0.5), ay: 560 };
}

// Scroll mode: the track is TRACK_VH viewport heights tall with the stage pinned inside it. Scroll
// position y (in viewport heights) maps to a stop coordinate f in 0..N-1: LEAD of lead-in, then one
// viewport per stop (stop n sits at y = LEAD + n), the rest is lead-out.
const TRACK_VH = N + 1;
const LEAD = 0.5;
const INTRO_END = 0.3; // before this the card shows the intro, after it stop 1

// Phones and visitors who ask for less motion get the stacked layout with buttons instead.
const canScrub = () => typeof window !== 'undefined' && window.matchMedia(SCRUB_QUERY).matches;

const STAMP = ['#E8505B', '#1FA6A0', '#F2A93B', '#8E7CFF', '#7FB866', '#E8505B', '#1FA6A0', '#F2A93B', '#8E7CFF'];

export default function Journey() {
  const [i, setI] = useState(-1); // -1 = intro, before the first stop
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [scrub, setScrub] = useState(canScrub);

  const track = useRef(null);
  const pin = useRef(null);
  const frame = useRef(null);
  const skyEl = useRef(null);
  const camA = useRef(null);
  const camB = useRef(null);
  const dark = useRef(null);
  const lay = useRef({});
  const trail = useRef(null);
  const trainBox = useRef(null);
  const live = useRef({ f: 0, size, scrub, i: -1, night: false }); // read by the scroll loop, never rendered
  const lenis = useLenis();
  live.current.size = size;
  live.current.scrub = scrub;

  useEffect(() => {
    const mq = window.matchMedia(SCRUB_QUERY);
    const on = () => setScrub(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
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

  // follow the site's day/night switch
  useEffect(() => {
    const root = frame.current?.closest('.w-root');
    if (!root) return undefined;
    const read = () => { live.current.night = root.dataset.theme === 'night'; draw(); };
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Paint the scene for the current stop coordinate. Direct DOM writes: React state only changes
  // when the current stop does.
  const draw = () => {
    const { f, size: sz, scrub: sc, night } = live.current;
    if (!sz.w || !camA.current) return;
    const g = geom(sz.w, sz.h, sc);
    const x = trainX(f);

    // camera: scale to fit, ease in a little while the train is stopped at a station
    const nd = Math.abs(f - Math.round(f));
    const z = 1 + 0.06 * (1 - ss(range(nd, 0.04, 0.32)));
    const cam = `scale(${g.s}) translate(0px, ${-g.y0}px) translate(${g.ax}px, ${g.ay}px) scale(${z.toFixed(4)}) translate(${-g.ax}px, ${-g.ay}px)`;
    camA.current.style.transform = cam;
    camB.current.style.transform = cam;
    const L = lay.current;
    Object.entries(PAR).forEach(([k, p]) => { if (L[k]) L[k].style.transform = `translate(${(g.ax - x * p + LOCAL0).toFixed(1)}px, 0px)`; });
    if (trail.current) trail.current.style.transform = `scaleX(${Math.max(0, x - stX(0)).toFixed(1)})`;
    if (trainBox.current) trainBox.current.style.left = `${(g.ax - 460).toFixed(1)}px`;

    // the train rolls while it moves and rests at a station
    const was = live.current.lastX;
    live.current.lastX = x;
    if (was != null && Math.abs(x - was) > 0.4 && trainBox.current) {
      trainBox.current.dataset.walk = '1';
      clearTimeout(live.current.stopT);
      live.current.stopT = setTimeout(() => { if (trainBox.current) trainBox.current.dataset.walk = '0'; }, sc ? 200 : 1300);
    }

    // time of day
    const t = f / (N - 1);
    const c = sky(t, night);
    const el = skyEl.current;
    if (el) {
      const bg = `linear-gradient(${css(c.top)}, ${css(c.bot)})`;
      if (bg !== live.current.bg) { live.current.bg = bg; el.style.background = bg; }
      const sun = el.querySelector('[data-ref="sun"]');
      const moon = el.querySelector('[data-ref="moon"]');
      const stars = el.querySelector('[data-ref="stars"]');
      const u = clamp(t / 0.9);
      sun.style.transform = `translate(${(sz.w * (0.1 + 0.8 * u) - 60).toFixed(0)}px, ${(sz.h * 0.74 - Math.sin(u * Math.PI) * sz.h * 0.6 - 60).toFixed(0)}px)`;
      sun.style.opacity = night ? 0 : (1 - range(t, 0.86, 0.93)).toFixed(2);
      const mu = night ? 1 : range(t, 0.78, 1);
      moon.style.transform = `translate(${(sz.w * 0.68).toFixed(0)}px, ${(sz.h * (night ? 0.16 : 0.5 - 0.36 * ss(mu)) - 42).toFixed(0)}px)`;
      moon.style.opacity = night ? 1 : range(t, 0.8, 0.93).toFixed(2);
      stars.style.opacity = night ? 1 : range(t, 0.84, 1).toFixed(2);
    }
    const ov = `rgba(${c.o.slice(0, 3).map(Math.round).join(',')}, ${c.o[3].toFixed(2)})`;
    if (dark.current && ov !== live.current.ov) { live.current.ov = ov; dark.current.style.background = ov; }
    frame.current?.style.setProperty('--dark', c.o[3].toFixed(2));
  };

  useScrollFrame(() => {
    if (!live.current.scrub || !track.current) return;
    const y = trackProgress(track.current) * (TRACK_VH - 1);
    const f = clamp(y - LEAD, 0, N - 1);
    live.current.f = f;
    draw();
    pin.current?.style.setProperty('--intro', (1 - range(y, 0.12, INTRO_END + 0.1)).toFixed(3));
    const idx = y < INTRO_END ? -1 : Math.round(f);
    if (idx !== live.current.i) { live.current.i = idx; setI(idx); }
  });

  // Stacked layout (phones, reduced motion): the stop buttons move the camera.
  useEffect(() => {
    if (!scrub) live.current.f = Math.max(0, i);
    draw();
  }, [scrub, size, i]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = i >= 0 ? JOURNEY[i] : null;
  const g = size.w ? geom(size.w, size.h, scrub) : null;

  const go = (n) => {
    const to = Math.max(-1, Math.min(N - 1, n));
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

  const setLay = (k) => (el) => { lay.current[k] = el; };
  const years = useMemo(() => YEARS, []);

  return (
    <section className={`journey tn torn ${scrub ? 'scrub' : 'torn-bot'}`} id="journey" ref={track} aria-label="The journey">
      <div className="j-pin" ref={pin}>
        <div className="j-head">
          <div className="wrap">
            <div className="sec-head" data-rv>
              <p className="kicker"><Icon n="map" size={16} />The journey</p>
              <h2>School to startup, <span className="hl b-sky">one stop at a time.</span></h2>
              <p>Nine stops between 2019 and now. {scrub ? 'Scroll to ride the line.' : 'Use the buttons or the stamps to ride the line.'}</p>
            </div>
          </div>
        </div>

        <div className="j-stage" tabIndex={0} onKeyDown={onKey} aria-label="Journey train line. Use the arrow keys to move between stops.">
          <div className="j-frame" ref={frame}>
            <div className="j-sky" ref={skyEl}><SkyArt /></div>
            <div className="j-cam" ref={camA} style={{ width: g ? size.w / g.s : 0, height: g ? size.h / g.s + g.y0 : 0 }}>
              <div className="lay" ref={setLay('far')}><FarLayer p={PAR.far} /></div>
              <div className="lay" ref={setLay('mid')}><MidLayer p={PAR.mid} /></div>
              <div className="lay" ref={setLay('near')}>
                <NearLayer i={i} years={years} />
                <div className="j-trail" ref={trail} style={{ left: stX(0) - LOCAL0 }} />
              </div>
            </div>
            <div className="j-dark" ref={dark} />
            <div className="j-cam" ref={camB} style={{ width: g ? size.w / g.s : 0, height: g ? size.h / g.s + g.y0 : 0 }}>
              <div className="j-train" ref={trainBox} data-walk="0" style={{ left: g ? g.ax - 460 : 0 }}><Train /></div>
              <div className="lay" ref={setLay('fore')}><ForeLayer p={PAR.fore} /></div>
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
                <h3>All aboard.</h3>
                <p>Nine stations: from a residential school in Coimbatore, through Varanasi, a hotel network and four internships, to a Delhi startup.</p>
              </div>
            )}
          </article>

          {/* Previous/next buttons only exist where the page is not scroll-driven (phones, reduced motion). */}
          {!scrub && (
            <div className="jcar">
              <button type="button" onClick={() => go(i - 1)} disabled={i < 0} aria-label="Previous stop"><Icon n="arrow" size={18} className="flip" /></button>
              <span>{i < 0 ? `${N} stops` : `${i + 1} / ${N}`}</span>
              <button type="button" className="nx" onClick={() => go(i + 1)} disabled={i >= N - 1}>
                {i < 0 ? 'Start the journey' : i >= N - 1 ? 'End of the line' : 'Next stop'} <Icon n="arrow" size={18} />
              </button>
            </div>
          )}

          <nav className="jtl" aria-label="Stops, passport stamps">
            <ol>
              {JOURNEY.map((s, n) => (
                <li key={s.t}>
                  <button type="button" className={n === i ? 'on' : n < i ? 'done' : ''} onClick={() => go(n)} aria-label={`${s.y}: ${s.t}`} aria-current={n === i ? 'step' : undefined}>
                    <span className="stp" style={{ '--c': STAMP[n], '--r': `${((n * 37) % 23) - 11}deg` }}><Icon n={s.icon} size={14} /></span>
                  </button>
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

