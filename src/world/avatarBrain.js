import { clamp } from './hooks';
import { pick, lineFor, greeting, IDLE_QUIPS, WAKE_LINES, FIVE_LINES, NIGHT_LINE, DAY_LINE } from './avatarLines';

// What the 3D sidekick does, kept apart from three.js (avatarStage.js) and from React (Sidekick3D.jsx).
// States: idle (breathes, glances, quips), walk (heading to a spot beside the section), react (a one-off clip),
// sleep (after a while with nobody about). While the page is scrolling he walks or jogs on the spot, facing the way
// the page is going, and trots over to the new spot once it stops. Wide screens roam; the phone version stays put.

const SPEED = 190; // px per second when crossing the screen
const WALK_BASE = 170; // px per second one walk-clip cycle covers at his size
const SLEEP_MS = 20000;
const SIDE = { story: 'l', work: 'crate', brand: 'r', profiley: 'l', stack: 'r', process: 'l', life: 'r', notes: 'l', hello: 'r' };

export function createBrain({ stage, els, size, say, onZzz }) {
  let shown = false;
  let x = -160;
  let tx = x;
  let state = 'idle';
  let faceCur = 0;
  let faceWant = 0;
  let pending = null;
  let pendingAt = 0;
  let sv = 0;
  let lastY = window.scrollY;
  let dir = 1;
  let wasScrolling = false;
  let wasRunning = false;
  let lastActive = performance.now();
  let lastSay = 0;
  let lastQuip = performance.now();
  let lastFive = 0;
  let lastLine = '';
  let vy = 0;
  let y = 0;
  let menu = false;
  let night = false;
  let curAnim = null;
  let arriveId = null;
  let mx = -1;
  let my = -1;
  let lastPtr = 0;
  let wander = 0;
  let wx = 0;
  let wy = 0;
  let offTimer = 0;

  const now = () => performance.now();
  const speak = (t) => { lastSay = now(); lastLine = t; say(t); };
  const touch = () => { lastActive = now(); };

  function setAnim(name, speed = 1) {
    const key = name;
    if (key !== curAnim) { curAnim = key; stage.play(name, { speed }); } else stage.setSpeed(speed);
  }

  function react(name, { hold = 300, then } = {}) {
    state = 'react';
    curAnim = null;
    faceWant = 0;
    stage.play(name, {
      once: true,
      fade: 0.2,
      onDone: () => setTimeout(() => { if (state === 'react') { state = 'idle'; curAnim = null; if (then) then(); } }, hold),
    });
  }

  function hop() { vy = Math.max(300, size().charH * 2.1); }

  function stand(id) {
    const { W, mini } = size();
    if (mini) return 52;
    const side = SIDE[id] || 'l';
    if (side === 'r') return W - 110;
    if (side === 'crate') {
      const r = document.querySelector('.box-fit')?.getBoundingClientRect();
      if (r && r.width > 40) return clamp(r.left - 70, 90, W - 200);
      return clamp(W * 0.2, 90, W - 200);
    }
    return 90;
  }

  function arrive() {
    x = tx;
    faceWant = 0;
    const id = arriveId;
    arriveId = null;
    react('agree', { hold: 200 });
    hop();
    if (id) speak(lineFor(id, lastLine));
  }

  function startWalk(id) {
    pending = null;
    arriveId = id;
    tx = stand(id);
    if (size().mini || Math.abs(tx - x) < 8) { arrive(); return; }
    state = 'walk';
    curAnim = null;
  }

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
      x = size().mini ? 52 : -160;
      state = 'idle';
      curAnim = null;
      speak(greeting());
      if (!size().mini) { arriveId = null; tx = stand(id); state = 'walk'; }
      return;
    }
    if (state === 'sleep') wake();
    if (sv > 140 && !size().mini) { pending = id; pendingAt = now(); return; }
    startWalk(id);
  }

  function sleep() {
    state = 'sleep';
    faceWant = 0;
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
    if (!mini && !menu && state === 'idle' && shown && now() - lastFive > 8000
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

    const sy = window.scrollY;
    const dy = sy - lastY;
    lastY = sy;
    sv += (Math.abs(dy) / Math.max(dt, 0.001) - sv) * Math.min(1, dt * 8);
    if (Math.abs(dy) > 0.5) { dir = dy > 0 ? 1 : -1; touch(); }
    const scrolling = sv > 140 && !mini;

    if (vy !== 0 || y > 0) {
      vy -= 1500 * dt;
      y = Math.max(0, y + vy * dt);
      if (y === 0) vy = 0;
      stage.setY(y);
    }

    if (shown) {
      if (state === 'sleep') {
        if (t - lastActive < 400) wake();
      } else if (state === 'idle' && !menu && t - lastActive > SLEEP_MS) {
        sleep();
      }

      if (state === 'walk') {
        const d = tx - x;
        const step = SPEED * dt;
        if (Math.abs(d) <= step) { arrive(); } else {
          x += Math.sign(d) * step;
          faceWant = Math.sign(d) * (Math.PI / 2);
          setAnim('walk', SPEED / WALK_BASE);
        }
      } else if (state === 'idle') {
        if (pending && !scrolling && t - pendingAt > 350) {
          startWalk(pending);
        } else if (menu) {
          faceWant = 0;
          setAnim('idle');
        } else if (scrolling) {
          wasScrolling = true;
          const fast = sv > 1400;
          if (fast) wasRunning = true;
          faceWant = dir * (Math.PI / 2);
          setAnim(fast ? 'run' : 'walk', fast ? clamp(sv / 2200, 0.9, 1.5) : clamp(sv / 420, 0.7, 1.5));
        } else if (wasScrolling) {
          wasScrolling = false;
          faceWant = 0;
          if (wasRunning) { wasRunning = false; react('sad_pose', { hold: 700 }); } else { curAnim = null; setAnim('idle'); }
        } else {
          faceWant = 0;
          setAnim('idle');
          if (t - lastSay > 26000 && t - lastQuip > 26000 && t - lastActive > 9000 && t - lastActive < SLEEP_MS - 3000) {
            lastQuip = t;
            speak(pick(IDLE_QUIPS, lastLine));
          }
        }
      }
    }

    // head: follows the pointer; when nobody moves it he glances about by himself
    const facingCam = 1 - clamp(Math.abs(faceCur) / 0.6);
    let lx = 0;
    let ly = 0;
    if (state === 'idle' || state === 'react') {
      if (t - lastPtr < 3500 && mx >= 0) {
        const headY = H - bottom - charH * 0.88;
        lx = clamp((mx - x) / (W * 0.35));
        ly = clamp((my - headY) / (H * 0.5));
      } else {
        if (t > wander) { wander = t + 1500 + Math.random() * 2500; wx = (Math.random() * 2 - 1) * 0.6; wy = (Math.random() * 2 - 1) * 0.25; }
        lx = wx; ly = wy;
      }
    }
    stage.setLook(lx * facingCam, ly * facingCam);

    faceCur += (faceWant - faceCur) * Math.min(1, dt * 8);
    stage.setFacing(faceCur);
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

  return { frame, goTo, setMenu, setTone, speak, react, hop, dispose };
}
