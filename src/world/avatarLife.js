import { prefersReducedMotion } from './hooks';

// Behaviour for the animated 3D avatar (.a3, see Avatar3D.jsx), kept outside React:
//   - gaze: his head turns towards the pointer; when nobody moves the pointer (touch screens, idle) he glances
//     around on his own
//   - reactions: a nod, a hop, a curious tilt and a look up, one after another each time he is clicked

const clamp = (v, a = -1, b = 1) => Math.min(b, Math.max(a, v));

export function attachGaze(el) {
  if (!el || prefersReducedMotion()) return () => {};
  const cur = { x: 0, y: 0 };
  const aim = { x: 0, y: 0 };
  let lastMove = 0;
  let raf = 0;
  let wander = 0;
  const tick = (t) => {
    if (t - lastMove > 3500 && t > wander) {
      wander = t + 1200 + Math.random() * 2400;
      aim.x = (Math.random() * 2 - 1) * 0.7;
      aim.y = (Math.random() * 2 - 1) * 0.3;
    }
    cur.x += (aim.x - cur.x) * 0.12;
    cur.y += (aim.y - cur.y) * 0.12;
    el.style.setProperty('--lx', cur.x.toFixed(3));
    el.style.setProperty('--ly', cur.y.toFixed(3));
    raf = requestAnimationFrame(tick);
  };
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const hx = r.left + r.width * 0.48;
    const hy = r.top + r.height * 0.09;
    aim.x = clamp((e.clientX - hx) / (window.innerWidth * 0.42));
    aim.y = clamp((e.clientY - hy) / (window.innerHeight * 0.5));
    lastMove = performance.now();
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  raf = requestAnimationFrame(tick);
  return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
}

const DURS = { nod: 1500, hop: 900, tilt: 2200, lookup: 2000 };
const REACTIONS = ['nod', 'hop', 'tilt', 'lookup', 'hop'];
let turn = 0;
const timers = new WeakMap();

export function reactAvatar(el, only) {
  if (!el || prefersReducedMotion()) return;
  const act = only || REACTIONS[turn++ % REACTIONS.length];
  const ms = DURS[act] || 1500;
  clearTimeout(timers.get(el));
  el.removeAttribute('data-act');
  void el.getBoundingClientRect(); // restart the animation if the same act comes round again
  el.dataset.act = act;
  timers.set(el, setTimeout(() => el.removeAttribute('data-act'), ms));
}

// Walk (a waddle) for a while, or until told to stop.
export function setWalking(el, on) {
  if (el) el.dataset.walk = on ? '1' : '0';
}

// Now and then, with nobody touching him, he tilts his head, nods or glances up.
export function idleGestures(el) {
  if (!el || prefersReducedMotion()) return () => {};
  let t = 0;
  const loop = () => {
    t = setTimeout(() => {
      if (document.visibilityState === 'visible' && !el.dataset.act && el.dataset.walk !== '1') reactAvatar(el, ['tilt', 'nod', 'lookup'][Math.floor(Math.random() * 3)]);
      loop();
    }, 5500 + Math.random() * 6500);
  };
  loop();
  return () => clearTimeout(t);
}
