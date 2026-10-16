import { clamp } from './hooks';
import { pick, lineFor, greeting, IDLE_QUIPS, WAKE_LINES, FIVE_LINES, NIGHT_LINE, DAY_LINE } from './avatarLines';

// What the 3D sidekick does, kept apart from three.js (avatarStage.js) and from React (Sidekick3D.jsx).
//
// Movement is physical, not scripted: he has a position and a velocity, and a target he is heading for. Scrolling
// moves the target back and forth across the whole screen (one sweep per ~1.5 screens of scrolling), so he walks
// the way the page goes, runs if you fly down it, and trails behind if you outrun him. He speeds up and slows down,
// turns through facing the camera, leans into a run, and his feet are locked to the ground (the clip speed is set
// from the measured stride, so they never skate). Idle: he breathes, glances about, sometimes strolls a little, and
// falls asleep after a while. The phone version stays put.

const ACC = 1000; // px/s per second
const TURN = 8.5; // rad/s
const SLEEP_MS = 20000;
const MARGIN_L = 90;
const MARGIN_R = 110;

const tri = (u) => { const f = u - Math.floor(u / 2) * 2; return f < 1 ? f : 2 - f; };
const smooth = (t) => t * t * (3 - 2 * t);

export function createBrain({ stage, els, size, say, onZzz }) {
  const cal = { walk: 150, run: 420 }; // px/s one clip cycle covers at timeScale 1 (measured in calibrate())
  let shown = false;
  let x = -160;
  let vx = 0;
  let target = x;
  let state = 'idle'; // idle | react | sleep
  let mode = 'idle'; // idle | walk | run
  let faceCur = 0;
  let faceWant = 0;
  let still = 0;
  let leanCur = 0;
  let sv = 0;
  let lastY = window.scrollY;
  let lastActive = performance.now();
  let lastSay = 0;
  let lastQuip = performance.now();
  let lastFive = 0;
  let lastPhew = 0;
  let lastLine = '';
  let sectionId = null;
  let vy = 0;
  let y = 0;
  let menu = false;
  let night = false;
  let curAnim = null;
  let mx = -1;
  let my = -1;
  let lastPtr = 0;
  let wanderLook = 0;
  let wx = 0;
  let wy = 0;
  let wanderAt = performance.now() + 9000;
  let offTimer = 0;

  const now = () => performance.now();
  const speak = (t) => { lastSay = now(); lastLine = t; say(t); };
  const touch = () => { lastActive = now(); };

  function calibrate() {
    const k = stage.pxPerUnit();
    const w = stage.strideSpeed('walk');
    const r = stage.strideSpeed('run');
    if (w) cal.walk = w * k;
    if (r) cal.run = r * k; else if (w) cal.run = cal.walk * 2.6;
    return { ...cal };
  }

  // where the scroll position says he should be: a smooth sweep from the left margin to the right and back
  function pathGoal() {
    const { W, H } = size();
    const period = Math.max(900, H * 1.5);
    const u = smooth(tri(window.scrollY / period));
    return MARGIN_L + u * (W - MARGIN_L - MARGIN_R);
  }

  function setAnim(name, speed = 1, fade = 0.3) {
    if (name !== curAnim) { curAnim = name; stage.play(name, { speed, fade }); } else stage.setSpeed(speed);
  }

  function react(name, { hold = 300, then } = {}) {
    state = 'react';
    curAnim = null;
    stage.play(name, {
      once: true,
      fade: 0.2,
      onDone: () => setTimeout(() => { if (state === 'react') { state = 'idle'; curAnim = null; if (then) then(); } }, hold),
    });
  }

  function hop() { vy = Math.max(300, size().charH * 2.1); }

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
      const { mini } = size();
      x = mini ? 52 : -160; // walks in from off screen on the wide layout
      vx = 0;
      target = mini ? 52 : pathGoal();
      state = 'idle';
      curAnim = null;
      sectionId = id;
      speak(greeting());
      return;
    }
    if (state === 'sleep') wake();
    if (id !== sectionId) {
      sectionId = id;
      if (now() - lastSay > 4000) speak(lineFor(id, lastLine));
    }
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
    if (night) { react('sad_pose', { hold: 1200 }); speak(NIGHT_LINE); } else { react('agree', { hold: 200 }); speak(DAY_LINE); }
  }

  function onPointer(e) {
    touch();
    mx = e.clientX;
    my = e.clientY;
    lastPtr = now();
    const { H, charH, mini, bottom } = size();
    if (!mini && !menu && state === 'idle' && mode === 'idle' && shown && now() - lastFive > 8000
      && Math.abs(mx - x) < 70 && my > H - bottom - charH - 20) {
      lastFive = now();
      react('agree', { hold: 400 });
      hop();
      speak(pick(FIVE_LINES, lastLine));
    }
  }
  const onKey = () => touch();
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  window.addEventListener('keydown', onKey);

  function frame(dt) {
    const t = now();
    const { W, H, charH, bottom, mini } = size();

    // ---- scroll: it moves the target, and wakes him ----
    const sy = window.scrollY;
    const dy = sy - lastY;
    lastY = sy;
    sv += (Math.abs(dy) / Math.max(dt, 0.001) - sv) * Math.min(1, dt * 8);
    if (Math.abs(dy) > 0.5) {
      touch();
      if (!mini && shown) target = pathGoal();
    }

    // ---- hop physics ----
    if (vy !== 0 || y > 0) {
      vy -= 1500 * dt;
      y = Math.max(0, y + vy * dt);
      if (y === 0) vy = 0;
      stage.setY(y);
    }

    // ---- sleep / wake ----
    if (shown) {
      if (state === 'sleep') {
        if (t - lastActive < 400) wake();
      } else if (state === 'idle' && !menu && t - lastActive > SLEEP_MS) {
        sleep();
      }
    }

    // ---- occasional stroll when nobody is doing anything ----
    if (shown && state === 'idle' && !menu && !mini && Math.abs(target - x) < 6 && Math.abs(vx) < 10 && t > wanderAt && t - lastActive > 3000) {
      wanderAt = t + 8000 + Math.random() * 6000;
      const d = (Math.random() < 0.5 ? -1 : 1) * (140 + Math.random() * 200);
      target = clamp(x + d, MARGIN_L, W - MARGIN_R);
    }

    // ---- velocity: head for the target, easing in and out ----
    const canMove = shown && state === 'idle' && !menu && !mini;
    let want = 0;
    if (canMove) {
      const d = target - x;
      const vmax = cal.run * 1.9; // a sprint, still with the feet on the ground
      want = Math.abs(d) < 3 ? 0 : clamp(d * 3.2, -vmax, vmax);
    }
    vx += clamp(want - vx, -ACC * dt, ACC * dt);
    if (mini) { vx = 0; x = 52; } else x += vx * dt;
    if (Math.abs(target - x) < 3 && Math.abs(vx) < 4) vx = 0;
    const s = Math.abs(vx);

    // ---- which clip, at what speed (feet locked to the ground) ----
    if (shown && state === 'idle') {
      const prev = mode;
      if (s < 10) mode = 'idle';
      else if (mode === 'idle' && s >= 18) mode = 'walk';
      if (mode === 'walk' && s > cal.walk * 1.7) mode = 'run';
      else if (mode === 'run' && s < cal.walk * 1.35) mode = 'walk';
      if (mode === 'idle') setAnim('idle');
      else if (mode === 'walk') setAnim('walk', clamp(s / cal.walk, 0.45, 1.8));
      else setAnim('run', clamp(s / cal.run, 0.6, 1.9));
      if (prev === 'run' && mode === 'idle' && t - lastPhew > 15000) {
        lastPhew = t;
        react('sad_pose', { hold: 650 });
        speak('Phew.');
      }
    } else if (state !== 'idle') {
      mode = 'idle';
    }

    // ---- facing: turn through the camera, never snap ----
    if (s > 14) { faceWant = Math.sign(vx) * (Math.PI / 2); still = 0; } else if (s < 8) { still += dt; if (still > 0.25) faceWant = 0; }
    const step = TURN * dt;
    faceCur += clamp(faceWant - faceCur, -step, step);

    // ---- lean into a run ----
    const leanWant = mode === 'run' ? clamp((s - cal.walk) / cal.run, 0, 0.4) * 0.45 : 0;
    leanCur += (leanWant - leanCur) * Math.min(1, dt * 6);

    // ---- quips ----
    if (shown && state === 'idle' && mode === 'idle' && !menu
      && t - lastSay > 26000 && t - lastQuip > 26000 && t - lastActive > 9000 && t - lastActive < SLEEP_MS - 3000) {
      lastQuip = t;
      speak(pick(IDLE_QUIPS, lastLine));
    }

    // ---- head: follows the pointer; when nobody moves it he glances about by himself ----
    const facingCam = 1 - clamp(Math.abs(faceCur) / 0.6);
    let lx = 0;
    let ly = 0;
    if (state === 'idle' || state === 'react') {
      if (t - lastPtr < 3500 && mx >= 0) {
        const headY = H - bottom - charH * 0.88;
        lx = clamp((mx - x) / (W * 0.35));
        ly = clamp((my - headY) / (H * 0.5));
      } else {
        if (t > wanderLook) { wanderLook = t + 1500 + Math.random() * 2500; wx = (Math.random() * 2 - 1) * 0.6; wy = (Math.random() * 2 - 1) * 0.25; }
        lx = wx; ly = wy;
      }
    }
    stage.setLook(lx * facingCam, ly * facingCam);

    stage.setFacing(faceCur);
    stage.setLean(leanCur);
    stage.setX(x);
    els.follow.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    els.follow.dataset.side = x > Math.max(W / 2, W - 340) ? 'l' : 'r';
  }

  function dispose() {
    clearTimeout(offTimer);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pointerdown', onPointer);
    window.removeEventListener('keydown', onKey);
  }

  return { frame, goTo, setMenu, setTone, speak, react, hop, calibrate, dispose };
}
