import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import { JOURNEY } from './data';
import { clamp, range, ss, trackProgress, useScrollFrame, SCRUB_QUERY } from './hooks';
import { STEP, LOCAL0, stX, WIN_Y, FarLayer, MidLayer, NearLayer, ForeLayer, Train, SkyArt } from './trainArt';
import Icon from './Icon';
import './train.css';

// The journey is a train line: one station per stop. Scrolling drives the train; the camera follows it.
// Layers slide at different speeds (parallax), the sky runs from dawn to night, each station builds
// itself as the train arrives, and at every station Laksh opens his window and throws a ticket: it spins
// through the air to the right-hand side, unfolds into the stop card, gets stamped, and the stamp flies
// down into the passport strip. All of it is scrubbed by scroll, so it plays backwards too.

const N = JOURNEY.length;
const YEARS = JOURNEY.map((s) => s.y.replace(' – ', '-'));
const PAR = { far: 0.15, mid: 0.5, near: 1, fore: 1.35 };

// Scroll mode, measured in viewport heights of scrolling: PER per stop, of which the train glides for
// GLIDE and rests at the station for the rest. While it rests the ticket is thrown, unfolds, is read and
// is stamped; the card then stays up for a good while (HOLD) before the train pulls out.
const PER = 2.8;
const GLIDE = 0.8;
const LEAD = 1.3;
const TAIL = 1.4;
const TRACK_VH = LEAD + (N - 1) * PER + TAIL + 1;
const HW = (PER - GLIDE) / 2 / PER; // the train rests while |f - n| < HW
const v = (vh) => vh / PER; // viewport heights to stop units
const SETTLED = 0.08; // f offset past a station where the ticket has landed and been stamped

// Where the train is on the line for stop coordinate f (0..N-1). It rests at each station, then glides.
const trainX = (f) => {
  if (f >= N - 1) return stX(N - 1);
  const n = Math.floor(f);
  return stX(n) + STEP * ss(range(f - n, HW, 1 - HW));
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

// f = (y - LEAD) / PER is the stop coordinate: station n is at f = n.

// Phones and visitors who ask for less motion get the stacked layout with buttons instead.
const canScrub = () => typeof window !== 'undefined' && window.matchMedia(SCRUB_QUERY).matches;

const STAMP = ['#E8505B', '#1FA6A0', '#F2A93B', '#8E7CFF', '#E8505B', '#1FA6A0', '#F2A93B', '#8E7CFF'];
const rotOf = (n) => ((n * 37) % 23) - 11;
const STAMP_PX = 54;
const SLOT_PX = 26;

const bez = (a, c, e, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * e;
const outBack = (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
const outFast = (t) => 1 - (1 - t) ** 2.4;
const inOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export default function Journey() {
  const [i, setI] = useState(-1); // the stop shown on the ticket, -1 = none yet
  const [bi, setBi] = useState(-1); // stations built so far
  const [stamped, setStamped] = useState(0); // passport stamps collected
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
  const card = useRef(null);
  const stampEl = useRef(null);
  const slots = useRef([]);
  const live = useRef({ f: 0, fr: -1, size, scrub, i: -1, bi: -1, st: 0, night: false }); // read by the scroll loop, never rendered
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

  // Where the card rests and where each passport slot is, in frame coordinates. The ticket's path
  // starts at the window, ends at the card, and the stamp ends in a slot.
  const measure = () => {
    const fr = frame.current;
    const c = card.current;
    if (!fr || !c) return;
    const f0 = fr.getBoundingClientRect();
    live.current.rest = { cx: c.offsetLeft + c.offsetWidth / 2, cy: c.offsetTop, w: c.offsetWidth, h: c.offsetHeight };
    live.current.slots = slots.current.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return { x: r.left - f0.left + r.width / 2, y: r.top - f0.top + r.height / 2 };
    });
  };

  // The ticket, scrubbed. d is how far the scroll is from station k (in stop units); A = -HW is when the
  // train has stopped. Times below are viewport heights of scrolling after A:
  //   0..0.1    window opens             0.7..1.0    text lines appear
  //   0.12..0.55 ticket flies in an arc  0.85..0.93  stamp slams on the ticket
  //   0.5..0.76  unfolds into the card   0.95..1.15  stamp flies to the strip
  //   1.15..2.0  the card stays up, readable   then it is blown away as the train leaves (not at the last stop)
  const ticket = (fr) => {
    const c = card.current;
    const R = live.current.rest;
    const win = live.current.win;
    const sz = live.current.size;
    if (!c || !R || !win) return;
    const k = clamp(Math.round(fr), 0, N - 1);
    const d = fr - k;
    const a = d + HW; // stop units since the train stopped
    const pw = range(a, 0, v(0.1));
    const pt = range(a, v(0.1), v(0.18));
    const pf = range(a, v(0.12), v(0.55));
    const pu = range(a, v(0.5), v(0.76));
    const px = range(a, v(0.7), v(1.0));
    const ps = range(a, v(0.85), v(0.93));
    const pg = range(a, v(0.95), v(1.15));
    const pb = k < N - 1 ? range(d, HW, HW + v(0.4)) : 0;

    // the throw
    const S = { x: win.x - R.cx, y: win.y - R.cy };
    const Cp = { x: S.x * 0.4, y: Math.min(S.y, 0) - 240 };
    const t = outFast(pf);
    let tx = bez(S.x, Cp.x, 0, t);
    let ty = bez(S.y, Cp.y, 0, t);
    let rot = -(1 - t) * 640;
    let fl = Math.sin(t * Math.PI * 3) * 38 * (1 - t);
    let sc = (0.16 + 0.34 * t) * outBack(pt);
    let op = range(pt, 0, 0.35);
    if (pu > 0) sc = 0.5 + 0.5 * outBack(pu);
    if (pu > 0 && pu < 1) rot += Math.sin(pu * Math.PI * 2) * 3 * (1 - pu);
    let face = 1 - range(pu, 0.05, 0.55);
    let lines = px;
    // the stamp lands with a thud
    if (ps > 0 && ps < 1) { ty += Math.sin(ps * Math.PI) * 5; sc *= 1 - 0.012 * Math.sin(ps * Math.PI); }
    // the wind takes it when the train leaves
    if (pb > 0) {
      const e = pb ** 1.7;
      tx = -sz.w * 0.62 * e + Math.sin(pb * Math.PI * 3) * 30 * e;
      ty = -(R.cy + 40) * e + Math.sin(pb * Math.PI * 5) * 28 * e;
      rot = -pb * 520;
      fl = Math.sin(pb * Math.PI * 4) * 55 * pb;
      sc = 1 - 0.78 * e;
      op = 1 - range(pb, 0.62, 1);
      face = range(pb, 0, 0.3);
      lines = px * (1 - range(pb, 0, 0.25));
    }
    if (pw < 1) op = 0;

    c.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) translateY(-50%) perspective(900px) rotateX(var(--rx, 0deg)) rotateY(calc(${fl.toFixed(1)}deg + var(--ry, 0deg))) rotate(${rot.toFixed(1)}deg) scale(${Math.max(0.001, sc).toFixed(3)})`;
    c.style.opacity = op.toFixed(3);
    c.style.visibility = op < 0.01 ? 'hidden' : 'visible';
    c.style.setProperty('--x', lines.toFixed(3));
    c.style.setProperty('--fo', face.toFixed(3));
    c.style.setProperty('--cr', (1 - pu).toFixed(3));

    // the stamp: slams on the ticket's corner, then flies into the passport strip
    const st = stampEl.current;
    const slot = live.current.slots?.[k];
    if (st && slot) {
      const P = { x: R.cx + R.w * 0.5 - 58, y: R.cy - R.h * 0.5 + 58 };
      let x = P.x;
      let y = P.y;
      let s2 = 1;
      let r2 = -12;
      let o2 = 0;
      if (pg > 0) {
        const u = inOut(pg);
        x = bez(P.x, (P.x + slot.x) / 2 + 90, slot.x, u);
        y = bez(P.y, (P.y + slot.y) / 2 - 120, slot.y, u);
        s2 = 1 + (SLOT_PX / STAMP_PX - 1) * u;
        r2 = -12 + (rotOf(k) + 12) * u;
        o2 = pg > 0.985 ? 0 : 1;
      } else if (ps > 0) {
        s2 = 1 + 1.6 * (1 - ps) ** 2;
        o2 = range(ps, 0, 0.3);
      }
      if (pb > 0) o2 = 0;
      st.style.transform = `translate(${(x - STAMP_PX / 2).toFixed(1)}px, ${(y - STAMP_PX / 2).toFixed(1)}px) rotate(${r2.toFixed(1)}deg) scale(${s2.toFixed(3)})`;
      st.style.opacity = o2.toFixed(2);
      st.style.boxShadow = ps > 0 && pg <= 0 ? `0 0 0 ${(ps * 26).toFixed(0)}px rgba(27,31,59,${((1 - ps) * 0.18).toFixed(2)})` : 'none';
      if (live.current.stampK !== k) { live.current.stampK = k; st.style.setProperty('--c', STAMP[k]); }
    }

    // window and Laksh: the pane slides down to let the ticket out
    const tb = trainBox.current;
    if (tb) {
      const open = clamp(pw - range(a, v(0.5), v(0.62)));
      const pane = tb.querySelector('.tr-pane');
      const me = tb.querySelector('.tr-me');
      if (pane) pane.style.transform = `translateY(${(open * 31).toFixed(1)}px)`;
      if (me) me.style.transform = `translate(${(open * 3).toFixed(1)}px, ${(-open * 6).toFixed(1)}px)`;
    }
  };

  // Paint the scene for the current stop coordinate. Direct DOM writes: React state only changes
  // when a stop, a built station or a stamp changes.
  const draw = () => {
    const { f, size: sz, scrub: sc, night } = live.current;
    if (!sz.w || !camA.current) return;
    const g = geom(sz.w, sz.h, sc);
    const x = trainX(f);

    // camera: scale to fit, ease in a little while the train is stopped at a station
    const nd = Math.abs(f - Math.round(f));
    const z = 1 + 0.06 * (1 - ss(range(nd, HW - 0.08, HW + 0.04)));
    const cam = `scale(${g.s}) translate(0px, ${-g.y0}px) translate(${g.ax}px, ${g.ay}px) scale(${z.toFixed(4)}) translate(${-g.ax}px, ${-g.ay}px)`;
    camA.current.style.transform = cam;
    camB.current.style.transform = cam;
    const L = lay.current;
    Object.entries(PAR).forEach(([k, p]) => { if (L[k]) L[k].style.transform = `translate(${(g.ax - x * p + LOCAL0).toFixed(1)}px, 0px)`; });
    if (trail.current) trail.current.style.transform = `scaleX(${Math.max(0, x - stX(0)).toFixed(1)})`;
    if (trainBox.current) trainBox.current.style.left = `${(g.ax - 460).toFixed(1)}px`;
    // Laksh's window, in frame pixels (scene x = ax - 3, y = WIN_Y)
    live.current.win = {
      x: g.s * (g.ax + (g.ax - 3 - g.ax) * z),
      y: g.s * (g.ay + (WIN_Y - g.ay) * z - g.y0),
    };

    // the train rolls while it moves and rests at a station
    const was = live.current.lastX;
    live.current.lastX = x;
    if (was != null && Math.abs(x - was) > 0.4 && trainBox.current) {
      trainBox.current.dataset.walk = '1';
      clearTimeout(live.current.stopT);
      live.current.stopT = setTimeout(() => { if (trainBox.current) trainBox.current.dataset.walk = '0'; }, sc ? 260 : 1300);
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

    if (sc) ticket(live.current.fr);
  };

  useScrollFrame(() => {
    if (!live.current.scrub || !track.current) return;
    const y = trackProgress(track.current) * (TRACK_VH - 1);
    const fr = (y - LEAD) / PER; // can be negative before the first station
    live.current.fr = fr;
    live.current.f = clamp(fr, 0, N - 1);
    draw();
    pin.current?.style.setProperty('--intro', (1 - range(y, 0.05, 0.3)).toFixed(3));
    const k = clamp(Math.round(fr), 0, N - 1);
    const idx = fr < -HW ? -1 : k;
    const built = clamp(Math.floor(fr + 0.45), -1, N - 1);
    const st = clamp(Math.floor(fr - v(1.15) + HW) + 1, 0, N);
    if (idx !== live.current.i) { live.current.i = idx; setI(idx); }
    if (built !== live.current.bi) { live.current.bi = built; setBi(built); }
    if (st !== live.current.st) { live.current.st = st; setStamped(st); }
  });

  // Stacked layout (phones, reduced motion): the stop buttons move the camera and the card is plain.
  useEffect(() => {
    if (!scrub) {
      live.current.f = Math.max(0, i);
      live.current.fr = i;
      const c = card.current;
      if (c) { c.style.transform = ''; c.style.opacity = ''; c.style.visibility = ''; c.style.setProperty('--x', '1'); c.style.setProperty('--fo', '0'); c.style.setProperty('--cr', '0'); }
      const tb = trainBox.current;
      tb?.querySelector('.tr-pane')?.style.removeProperty('transform');
      tb?.querySelector('.tr-me')?.style.removeProperty('transform');
      if (stampEl.current) stampEl.current.style.opacity = '0';
    }
    draw();
  }, [scrub, size, i]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    measure();
    draw();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
  }, [i, size, scrub]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = i >= 0 ? JOURNEY[i] : null;
  const g = size.w ? geom(size.w, size.h, scrub) : null;
  const built = scrub ? bi : i;
  const done = scrub ? stamped : i + 1;

  const go = (n) => {
    const to = Math.max(-1, Math.min(N - 1, n));
    if (!scrub) { setI(to); return; }
    const tr = track.current;
    if (!tr) return;
    const y = window.scrollY + tr.getBoundingClientRect().top + (to < 0 ? 0 : (LEAD + (to + SETTLED) * PER) * window.innerHeight);
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };
  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(i + 1);
    if (e.key === 'ArrowLeft') go(i - 1);
  };

  const setLay = (k) => (el) => { lay.current[k] = el; };
  const years = useMemo(() => YEARS, []);
  const ln = (k) => ({ '--k': k });

  return (
    <section className={`journey tn torn ${scrub ? 'scrub' : 'torn-bot'}`} id="journey" ref={track} aria-label="The journey" style={scrub ? { '--tv': TRACK_VH } : undefined}>
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
                <NearLayer i={built} years={years} />
                <div className="j-trail" ref={trail} style={{ left: stX(0) - LOCAL0 }} />
              </div>
            </div>
            <div className="j-dark" ref={dark} />
            <div className="j-cam" ref={camB} style={{ width: g ? size.w / g.s : 0, height: g ? size.h / g.s + g.y0 : 0 }}>
              <div className="j-train" ref={trainBox} data-walk="0" style={{ left: g ? g.ax - 460 : 0 }}><Train /></div>
              <div className="lay" ref={setLay('fore')}><ForeLayer p={PAR.fore} /></div>
            </div>
          </div>

          <article className="jcard" aria-live="polite" ref={card}>
            <div className="jc-face" aria-hidden="true"><span>STOP</span><b>{i >= 0 ? i + 1 : 1}</b></div>
            <div className="jc-crease" aria-hidden="true" />
            {stop ? (
              <div className="jc-in" key={i}>
                <div className="jc-top ln" style={ln(0)}><span className="jc-yr">{stop.y}</span><span className="jc-n">Stop {i + 1} of {N}</span><span className="jc-ic"><Icon n={stop.icon} size={20} /></span></div>
                <h3 className="ln" style={ln(1)}>{stop.t}</h3>
                <p className="jc-role ln" style={ln(2)}>{stop.r}</p>
                <p className="ln" style={ln(3)}>{stop.p}</p>
                <p className="jc-from ln" style={ln(4)}>{i > 0 ? `From ${JOURNEY[i - 1].t}` : 'Start of the line'} <Icon n="arrow" size={13} /> {stop.t}</p>
              </div>
            ) : (
              <div className="jc-in" key="intro">
                <div className="jc-top"><span className="jc-yr">2019 &rarr; now</span><span className="jc-n">{N} stops</span><span className="jc-ic"><Icon n="map" size={20} /></span></div>
                <h3>All aboard.</h3>
                <p>Eight stations: from a residential school in Coimbatore, through Varanasi, a hotel network and four internships, to a Delhi startup.</p>
              </div>
            )}
          </article>

          {scrub && <div className="fx-stamp" ref={stampEl} style={{ '--c': STAMP[0] }} aria-hidden="true"><Icon n={JOURNEY[Math.max(0, i)].icon} size={22} /></div>}

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
                  <button type="button" className={`${n === i ? 'on' : ''} ${n < done ? 'done' : ''}`} onClick={() => go(n)} aria-label={`${s.y}: ${s.t}`} aria-current={n === i ? 'step' : undefined}>
                    <span className="stp" ref={(el) => { slots.current[n] = el; }} style={{ '--c': STAMP[n], '--r': `${rotOf(n)}deg` }}><Icon n={s.icon} size={14} /></span>
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
