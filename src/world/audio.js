// "Music on the hill": a small generative piece made live with the Web Audio API.
// The page's music. The main track is Bruno Mars - That's What I Like (see "The song" at the bottom).
// Fallback: a tanpura-style drone and sparse pentatonic plucks (Bhoopali: C D E G A), no percussion
// (the tabla beats were removed on 16 Oct 2026), made live with Web Audio from nothing sampled.

let ctx = null;
let master = null;
let timers = [];
let running = false;

const SCALE = [0, 2, 4, 7, 9]; // semitones above the tonic
const TONIC = 130.81; // C3

const hz = (semi) => TONIC * Math.pow(2, semi / 12);

function makeReverb(c) {
  const len = c.sampleRate * 2.6;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  const conv = c.createConvolver();
  conv.buffer = buf;
  return conv;
}

function drone(c, out) {
  [[0, 0.07], [7, 0.05], [12, 0.035], [-12, 0.05]].forEach(([semi, g], i) => {
    [-3, 3].forEach((detune) => {
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = hz(semi);
      o.detune.value = detune;
      const gn = c.createGain();
      gn.gain.value = 0;
      gn.gain.linearRampToValueAtTime(g, c.currentTime + 3 + i);
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.03;
      const lg = c.createGain();
      lg.gain.value = g * 0.4;
      lfo.connect(lg).connect(gn.gain);
      o.connect(gn).connect(out);
      o.start();
      lfo.start();
    });
  });
}

function pluck(c, out, semi, when, vel = 0.12) {
  const o = c.createOscillator();
  o.type = 'triangle';
  o.frequency.value = hz(semi + 12);
  const o2 = c.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = hz(semi + 24);
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(3200, when);
  f.frequency.exponentialRampToValueAtTime(500, when + 1.3);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(vel, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 1.6);
  o.connect(f);
  o2.connect(f);
  f.connect(g).connect(out);
  o.start(when);
  o2.start(when);
  o.stop(when + 1.7);
  o2.stop(when + 1.7);
}

function startAmbient() {
  if (running) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = ctx || new AC();
  if (ctx.state === 'suspended') ctx.resume();
  master = ctx.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.5);
  const verb = makeReverb(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  const comp = ctx.createDynamicsCompressor();
  verb.connect(wet).connect(master);
  master.connect(comp).connect(ctx.destination);
  const dry = ctx.createGain();
  dry.gain.value = 1;
  dry.connect(master);
  dry.connect(verb);
  drone(ctx, dry);
  running = true;

  // Slow pulse at ~64 bpm; the melody picks a note on every fourth half-beat and on some others.
  const beat = 60 / 64;
  let n = 0;
  let next = ctx.currentTime + 0.4;
  let last = 4;
  const schedule = () => {
    if (!running) return;
    while (next < ctx.currentTime + 0.6) {
      if (n % 4 === 0 || Math.random() < 0.38) {
        const step = Math.round((Math.random() - 0.5) * 3);
        last = Math.max(0, Math.min(9, last + step));
        const oct = last >= 5 ? 12 : 0;
        pluck(ctx, dry, SCALE[last % 5] + oct, next + (Math.random() < 0.3 ? beat / 2 : 0), 0.08 + Math.random() * 0.06);
      }
      n += 1;
      next += beat / 2;
    }
  };
  timers.push(setInterval(schedule, 120));
  return true;
}

function stopAmbient() {
  if (!running) return;
  running = false;
  timers.forEach(clearInterval);
  timers = [];
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    const old = master;
    setTimeout(() => { try { old.disconnect(); } catch { /* already gone */ } }, 800);
  }
  // The drone oscillators are connected to nodes that now lead nowhere; closing the context frees them.
  const c = ctx;
  setTimeout(() => { try { c.close(); } catch { /* ignore */ } }, 900);
  ctx = null;
}

// ---- The song ----------------------------------------------------------------------------------
// "Play some music" plays Bruno Mars - That's What I Like through Spotify's official embedded player
// (nothing is copied or hosted here). Visitors signed in to Spotify in their browser hear the whole
// track; everyone else hears Spotify's 30-second preview. Afterwards, or if Spotify cannot load,
// the generative piece above keeps playing so the button always does something.
// Tried first: YouTube embeds. The official video and every re-upload tested on 16 Oct 2026 return
// error 150 (embedding disabled by the owner), so that route is closed.
export const SONG = { uri: 'spotify:track:0KKkJNfGyhkQ5aFogxQAPU', title: 'That’s What I Like', artist: 'Bruno Mars' };

let ctrl = null;
let apiPromise = null;
let wantSong = false;
let songOn = false;

function loadSpotifyApi() {
  if (window.__spotifyIFrameAPI) return Promise.resolve(window.__spotifyIFrameAPI);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = (api) => { window.__spotifyIFrameAPI = api; resolve(api); };
    const s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    s.onerror = () => { apiPromise = null; reject(new Error('spotify api')); };
    document.head.appendChild(s);
    setTimeout(() => { if (!window.__spotifyIFrameAPI) { apiPromise = null; reject(new Error('spotify timeout')); } }, 8000);
  });
  return apiPromise;
}

function songEnded() {
  songOn = false;
  if (wantSong) startAmbient();
}

function playSong() {
  loadSpotifyApi().then((api) => {
    if (!wantSong) return;
    if (ctrl) { ctrl.resume(); return; }
    let host = document.getElementById('w-sp-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'w-sp-host';
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = 'position:fixed;left:0;bottom:0;width:300px;height:80px;opacity:.01;pointer-events:none;z-index:-1;overflow:hidden';
      host.appendChild(document.createElement('div'));
      document.body.appendChild(host);
    }
    api.createController(host.firstChild, { uri: SONG.uri, width: 300, height: 80 }, (c) => {
      ctrl = c;
      c.addListener('ready', () => { if (wantSong) c.play(); });
      c.addListener('playback_update', (e) => {
        const d = e.data || {};
        host.dataset.state = d.isPaused ? 'paused' : (d.isBuffering ? 'buffering' : 'playing');
        host.dataset.pos = String(d.position || 0);
        host.dataset.dur = String(d.duration || 0);
        // The track (or its 30 s preview) reached the end.
        if (d.isPaused && d.duration && d.position >= d.duration - 400 && wantSong && songOn) songEnded();
      });
    });
  }).catch((err) => {
    console.warn('[music] could not start the song, using the fallback', err);
    songOn = false;
    if (wantSong) startAmbient();
  });
}

export function startMusic() {
  if (wantSong) return true;
  wantSong = true;
  songOn = true;
  playSong();
  return true;
}

export function stopMusic() {
  wantSong = false;
  songOn = false;
  try { ctrl && ctrl.pause(); } catch { /* ignore */ }
  stopAmbient();
}

export const isPlaying = () => songOn || running;
