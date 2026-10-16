import { clamp } from './hooks';
import { MOVES, SECTION_MOVE, SURPRISE } from './avatarMoves';
import { pick, lineFor, greeting, IDLE_QUIPS, WAKE_LINES, FIVE_LINES, NIGHT_LINE, DAY_LINE } from './avatarLines';

// What the 3D sidekick does, kept apart from three.js (avatarStage.js) and from React (Sidekick3D.jsx).
//
// He holds one spot and does not wander. He pops up from below the screen edge when you leave the hero, then acts:
// each section has its own move when you settle in it (a wave, a point, a flex, a clap...), a click waves, a double
// click flips, a triple click spins, and the menu can ask for tricks. Between moves he breathes and glances about;
// after a while with nobody about he yawns and falls asleep. The moves themselves live in avatarMoves.js; stunts
// (the jump, the flip, the spin) are the body's job and are done here with a little physics.

const G = 1500; // px/s squared
const SLEEP_MS = 20000;
const SETTLE_MS = 700; // how long a section must hold the screen before its move plays

export function createBrain({ stage, els, size, say, onZzz }) {
  let shown = false;
  let state = 'idle'; // idle | sleep
  let sectionId = null;
  let settleId = null;
  let settleAt = 0;
  let lastActive = performance.now();
  let lastSay = 0;
  let lastQuip = performance.now();
  let lastFive = 0;
  let lastLine = '';
  let lastMove = 0;
  let menu = false;
  let night = false;
  let curAnim = null;
  let mx = -1;
  let my = -1;
  let lastPtr = 0;
  let wanderLook = 0;
  let wx = 0;
  let wy = 0;
  let offTimer = 0;
  let riseT = 1; // pop-up from below the edge: 0 -> 1
  let afterRise = null;
  // stunt body: vertical position (px), velocity, and the phase of the current jump
  let y = 0;
  let vy = 0;
  let stunt = null; // { def, phase: 'crouch' | 'air' | 'land', t, air, airT }
  let squash = 1;
  let flip = 0;
  let spin = 0;

  const now = () => performance.now();
  const speak = (t) => { lastSay = now(); lastLine = t; say(t); };
  const touch = () => { lastActive = now(); };

  function spot() { return size().mini ? 52 : 120; }

  function setAnim(name, speed = 1) {
    if (name !== curAnim) { curAnim = name; stage.play(name, { speed }); }
  }

  // ---- moves ----
  function perform(name, then) {
    const def = MOVES[name];
    if (!def) return;
    if (state === 'sleep') wake();
    lastMove = now();
    touch();
    stage.perform(def, then);
    if (def.stunt) stunt = { def: def.stunt, phase: 'crouch', t: 0, air: 0, airT: 0 };
  }
  const busy = () => stage.busy() || !!stunt;

  function stuntFrame(dt) {
    if (!stunt) return;
    const s = stunt;
    s.t += dt;
    if (s.phase === 'crouch') {
      squash = 1 - 0.16 * Math.min(1, s.t / s.def.at);
      if (s.t >= s.def.at) { s.phase = 'air'; s.air = 0; s.airT = (2 * s.def.vy) / G; vy = s.def.vy; squash = 1.08; }
    } else if (s.phase === 'air') {
      s.air += dt;
      const u = clamp(s.air / s.airT);
      const e = u * u * (3 - 2 * u);
      if (s.def.flip) flip = s.def.flip * Math.PI * 2 * e;
      if (s.def.spin) spin = s.def.spin * Math.PI * 2 * e;
      squash += (1.0 - squash) * Math.min(1, dt * 8);
      if (y <= 0 && vy <= 0 && s.air > 0.1) { s.phase = 'land'; s.t = 0; flip = 0; spin = 0; y = 0; vy = 0; }
    } else {
      squash = 0.86 + 0.14 * clamp(s.t / 0.28);
      if (s.t >= 0.28) { stunt = null; squash = 1; }
    }
    stage.setFlip(flip);
    stage.setSpin(spin);
    stage.setSquash(squash);
  }

  function hop() { vy = Math.max(300, size().charH * 2.1); }

  // ---- showing, hiding, sections ----
  function show(on) {
    if (on === shown) return;
    shown = on;
    clearTimeout(offTimer);
    if (on) {
      stage.setActive(true);
      els.root.classList.add('on');
    } else {
      els.root.classList.remove('on');
      offTimer = setTimeout(() => { if (!shown) stage.setActive(false); }, 800);
    }
  }

  function goTo(id) {
    if (!id) { show(false); return; }
    if (!shown) {
      show(true);
      state = 'idle';
      curAnim = null;
      sectionId = id;
      settleId = null;
      riseT = 0; // pop up from below the edge, then say hello with a wave
      afterRise = () => { speak(greeting()); perform('wave'); };
      return;
    }
    if (state === 'sleep') wake();
    if (id !== sectionId) { sectionId = id; settleId = id; settleAt = now() + SETTLE_MS; }
  }

  function sleep() {
    state = 'sleep';
    curAnim = null;
    setAnim('sad_pose');
    onZzz(true);
  }

  function wake() {
    state = 'idle';
    curAnim = null;
    onZzz(false);
    hop();
    speak(pick(WAKE_LINES, lastLine));
  }

  function setMenu(on) {
    menu = on;
    touch();
    if (on && state === 'sleep') wake();
  }

  function setTone(isNight) {
    if (isNight === night) return;
    night = isNight;
    stage.setTone(night);
    if (!shown) return;
    if (night) { perform('yawn'); speak(NIGHT_LINE); } else { perform('stretch'); speak(DAY_LINE); }
  }

  function onPointer(e) {
    touch();
    mx = e.clientX;
    my = e.clientY;
    lastPtr = now();
    const { H, charH, bottom } = size();
    if (!menu && shown && state === 'idle' && !busy() && now() - lastFive > 20000
      && Math.abs(mx - spot()) < 80 && my > H - bottom - charH - 20) {
      lastFive = now();
      perform('wave');
      speak(pick(FIVE_LINES, lastLine));
    }
  }
  const onKey = () => touch();
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', touch, { passive: true });

  function frame(dt) {
    const t = now();
    const { W, H, charH, bottom } = size();

    // pop up from below the edge (an ease-out with a little overshoot)
    let rise = 0;
    if (riseT < 1) {
      riseT = Math.min(1, riseT + dt / 0.85);
      const c = 1.4;
      const k = riseT - 1;
      const e = 1 + (c + 1) * k * k * k + c * k * k;
      rise = -charH * 1.2 * (1 - e);
      if (riseT >= 1 && afterRise) { const f = afterRise; afterRise = null; f(); }
    }

    // hop physics
    if (vy !== 0 || y > 0) {
      vy -= G * dt;
      y = Math.max(0, y + vy * dt);
      if (y === 0) vy = 0;
    }
    stuntFrame(dt);
    stage.setY(y + rise);

    if (shown) {
      // sleep / wake, with a yawn on the way down
      if (state === 'sleep') {
        if (t - lastActive < 400) wake();
      } else if (state === 'idle' && !menu && !busy() && riseT >= 1 && t - lastActive > SLEEP_MS) {
        lastActive = t - SLEEP_MS + 2600; // the yawn takes about that long; then he nods off
        perform('yawn', () => { if (state === 'idle' && t - lastActive > 0) sleep(); });
      }

      // a section has held the screen long enough: its move
      if (settleId && t >= settleAt && riseT >= 1 && !busy() && state === 'idle' && !menu && t - lastMove > 1500) {
        const id = settleId;
        settleId = null;
        const m = SECTION_MOVE[id];
        if (m) perform(m);
        if (t - lastSay > 4000) speak(lineFor(id, lastLine));
      }

      if (state === 'idle') setAnim('idle');

      // a quip now and then when nothing is going on
      if (state === 'idle' && !busy() && !menu && t - lastSay > 26000 && t - lastQuip > 26000
        && t - lastActive > 9000 && t - lastActive < SLEEP_MS - 3000) {
        lastQuip = t;
        speak(pick(IDLE_QUIPS, lastLine));
      }
    }

    // head follows the pointer; when nobody moves it he glances about by himself
    let lx = 0;
    let ly = 0;
    if (state === 'idle') {
      const x = spot();
      if (t - lastPtr < 3500 && mx >= 0) {
        const headY = H - bottom - charH * 0.88;
        lx = clamp((mx - x) / (W * 0.35));
        ly = clamp((my - headY) / (H * 0.5));
      } else {
        if (t > wanderLook) { wanderLook = t + 1500 + Math.random() * 2500; wx = (Math.random() * 2 - 1) * 0.6; wy = (Math.random() * 2 - 1) * 0.25; }
        lx = wx; ly = wy;
      }
    }
    stage.setLook(lx, ly);

    const x = spot();
    stage.setX(x);
    els.follow.style.transform = `translate3d(${x}px,0,0)`;
    els.follow.dataset.side = 'r';
  }

  function dispose() {
    clearTimeout(offTimer);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pointerdown', onPointer);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', touch);
  }

  const surprise = () => perform(pick(SURPRISE));

  return { frame, goTo, setMenu, setTone, speak, perform, surprise, hop, dispose };
}
