import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// The three.js half of the 3D sidekick: one transparent, pixel-sized strip along the bottom of the screen with an
// orthographic camera (1 unit = 1 CSS pixel, y up from the bottom edge), one skinned character, and an animation
// mixer. It knows nothing about the page: avatarBrain.js decides what he does and calls these methods.
// Loaded with a dynamic import so three never weighs on the first paint.
//
// Look: toon shading (three flat tones) plus an inked outline, so he matches the hand-drawn, ink-outlined site.
// Moves: avatarMoves.js poses named body parts over the idle clip (see applyMove). Any rigged model with Mixamo-style
// bone names can be dropped in; materials named like "joint" get the joint colour, the rest the body colour.

const OUTLINE_PX = 2.4;
const PALETTE = { body: 0xf5b13d, joint: 0x2a2f57, ink: 0x1b1f3b };

// move role -> bone name (lower case, without the "mixamorig" prefix)
const ROLES = {
  hips: 'hips', spine: 'spine', spine1: 'spine1', spine2: 'spine2', neck: 'neck', head: 'head',
  lSh: 'leftshoulder', rSh: 'rightshoulder', lArm: 'leftarm', rArm: 'rightarm',
  lFore: 'leftforearm', rFore: 'rightforearm', lHand: 'lefthand', rHand: 'righthand',
  lUp: 'leftupleg', rUp: 'rightupleg', lLeg: 'leftleg', rLeg: 'rightleg',
};

export async function createStage(canvas, { url = '/avatar/Xbot.glb', onFrame, palette = {} } = {}) {
  const pal = { ...PALETTE, ...palette };
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight(0xffffff, 0xb9a98f, 1.7);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.0);
  sun.position.set(-300, 500, 700);
  scene.add(hemi, sun);
  const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -2000, 2000);

  const gltf = await new GLTFLoader().loadAsync(url);
  const model = gltf.scene;

  // ---- toon look: flat colour in three steps, plus an inverted-hull ink outline ----
  const steps = new THREE.DataTexture(new Uint8Array([95, 175, 255]), 3, 1, THREE.RedFormat);
  steps.minFilter = THREE.NearestFilter;
  steps.magFilter = THREE.NearestFilter;
  steps.needsUpdate = true;
  const thick = { value: 0.5 };
  const outlineMat = new THREE.MeshBasicMaterial({ color: pal.ink, side: THREE.BackSide });
  outlineMat.onBeforeCompile = (shader) => {
    shader.uniforms.uThick = thick;
    shader.vertexShader = 'uniform float uThick;\n' + shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\n transformed += normalize(objectNormal) * uThick;',
    );
  };
  const toon = {};
  let bindHeight = 0;
  const skinned = [];
  model.traverse((o) => {
    if (!(o.isMesh || o.isSkinnedMesh)) return;
    o.frustumCulled = false;
    const mats = [].concat(o.material).map((m) => {
      const key = /joint/i.test(m.name) ? 'joint' : 'body';
      if (!toon[key]) toon[key] = new THREE.MeshToonMaterial({ color: pal[key], gradientMap: steps });
      return toon[key];
    });
    o.material = mats.length === 1 ? mats[0] : mats;
    if (o.isSkinnedMesh) {
      skinned.push(o);
      o.geometry.computeBoundingBox();
      bindHeight = Math.max(bindHeight, o.geometry.boundingBox.max.y - o.geometry.boundingBox.min.y);
    }
  });
  skinned.forEach((m) => {
    const out = new THREE.SkinnedMesh(m.geometry, outlineMat);
    out.bind(m.skeleton, m.bindMatrix);
    out.frustumCulled = false;
    m.add(out);
  });

  // ---- bones by role ----
  const bones = {};
  const byName = {};
  model.traverse((o) => { if (o.isBone) byName[o.name.toLowerCase().replace(/^mixamorig:?/, '')] = o; });
  Object.entries(ROLES).forEach(([role, n]) => { if (byName[n]) bones[role] = byName[n]; });
  const depth = (b) => { let d = 0; for (let p = b.parent; p; p = p.parent) d++; return d; };
  const order = Object.keys(bones).sort((a, b) => depth(bones[a]) - depth(bones[b])); // parents before children
  const head = bones.head || null;

  // ---- animation ----
  const mixer = new THREE.AnimationMixer(model);
  const actions = {};
  gltf.animations.forEach((c) => { actions[c.name.toLowerCase()] = mixer.clipAction(c); });
  const names = Object.keys(actions);

  // Measure him in his idle pose, from the skinned vertices: the bind-pose box of a rigged model can be a different
  // size from what is drawn (this one is authored in centimetres under a scaled armature).
  const idleA = actions.idle || actions[names[0]];
  if (idleA) { idleA.play(); mixer.update(0); }
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model, true);
  if (idleA) idleA.stop();
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const unit = size.y || 1;

  // holder: where he stands and which way he faces; flipper: pivots about his middle for flips and spins
  const holder = new THREE.Group();
  holder.rotation.order = 'YXZ';
  const flipper = new THREE.Group();
  flipper.rotation.order = 'YXZ';
  flipper.position.y = unit / 2;
  model.position.set(-centre.x, -box.min.y - unit / 2, -centre.z); // feet at the holder's y = 0
  flipper.add(model);
  holder.add(flipper);
  scene.add(holder);

  let current = null;
  let doneCb = null;
  mixer.addEventListener('finished', (e) => {
    if (e.action === current && doneCb) { const f = doneCb; doneCb = null; f(); }
  });

  function play(name, { once = false, fade = 0.3, speed = 1, onDone } = {}) {
    const a = actions[name] || actions.idle || actions[names[0]];
    if (!a) return;
    if (a === current && !once && a.isRunning()) { a.setEffectiveTimeScale(speed); return; } // already playing: keep going
    a.enabled = true;
    a.reset();
    a.setEffectiveTimeScale(speed);
    a.setEffectiveWeight(1);
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
    a.clampWhenFinished = once;
    if (current && current !== a) a.crossFadeFrom(current, fade, false); else a.fadeIn(fade);
    a.play();
    current = a;
    doneCb = once ? onDone || null : null;
  }

  // ---- moves: pose named body parts over the idle clip ----
  let mv = null; // { def, t, dur, hold, done }
  const qm = new THREE.Quaternion();
  const qmInv = new THREE.Quaternion();
  const qp = new THREE.Quaternion();
  const qpInv = new THREE.Quaternion();
  const qr = new THREE.Quaternion();
  const eul = new THREE.Euler();
  const D = Math.PI / 180;

  function perform(def, onDone) {
    if (mv && mv.done) mv.done = null;
    mv = { def, t: 0, dur: def.dur, hold: false, done: onDone || null };
  }
  const hold = (def, t) => { mv = { def, t, dur: def.dur, hold: true, done: null }; };
  const release = () => { mv = null; };
  const busy = () => !!mv;

  function applyMove(dt) {
    if (!mv) return;
    if (!mv.hold) mv.t += dt;
    const u = Math.min(1, mv.t / mv.dur);
    model.updateMatrixWorld(true);
    model.getWorldQuaternion(qm);
    qmInv.copy(qm).invert();
    for (let i = 0; i < order.length; i++) {
      const role = order[i];
      const f = mv.def.bones[role];
      if (!f) continue;
      const bone = bones[role];
      const e = f(mv.t, u);
      eul.set(e[0] * D, e[1] * D, e[2] * D, 'XYZ');
      qr.setFromEuler(eul);
      // the same turn, as a world rotation about his body axes, then expressed in the parent's frame
      qr.premultiply(qm).multiply(qmInv);
      bone.parent.updateWorldMatrix(true, false);
      bone.parent.getWorldQuaternion(qp);
      qpInv.copy(qp).invert();
      bone.quaternion.premultiply(qr.premultiply(qpInv).multiply(qp));
      bone.updateMatrix();
    }
    if (!mv.hold && u >= 1) { const cb = mv.done; mv = null; if (cb) cb(); }
  }

  // ---- placement, in CSS pixels ----
  let heightPx = 160;
  let squash = 1;
  const applyScale = () => {
    const k = heightPx / unit;
    const w = 1 / Math.sqrt(squash);
    holder.scale.set(k * w, k * squash, k * w);
  };
  const setX = (x) => { holder.position.x = x; };
  const setY = (y) => { holder.position.y = y; };
  const setFacing = (rad) => { holder.rotation.y = rad; };
  const setLean = (rad) => { holder.rotation.x = rad; };
  const setFlip = (rad) => { flipper.rotation.x = rad; };
  const setSpin = (rad) => { flipper.rotation.y = rad; };
  const setSquash = (s) => { squash = s; applyScale(); };
  function setHeight(px) {
    heightPx = px;
    applyScale();
    thick.value = bindHeight ? (OUTLINE_PX * bindHeight) / px : 0.5;
  }
  function resize(w, h) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    cam.left = 0; cam.right = w; cam.top = h; cam.bottom = 0;
    cam.updateProjectionMatrix();
  }
  function setTone(night) {
    hemi.intensity = night ? 1.0 : 1.7;
    sun.intensity = night ? 1.2 : 2.0;
  }

  // head follows a look target (-1..1 each way); smoothed here
  const look = { x: 0, y: 0, cx: 0, cy: 0 };
  const tmpQ = new THREE.Quaternion();
  const setLook = (x, y) => { look.x = x; look.y = y; };
  function applyLook(dt) {
    if (!head) return;
    const k = 1 - Math.exp(-dt * 9);
    look.cx += (look.x - look.cx) * k;
    look.cy += (look.y - look.cy) * k;
    eul.set(look.cy * 0.3, look.cx * 0.55, 0, 'XYZ');
    tmpQ.setFromEuler(eul);
    head.quaternion.multiply(tmpQ);
  }

  // ---- loop ----
  let raf = 0;
  let last = 0;
  let want = false;
  // one frame of the world; step() lets a test drive it at a fixed rate while the loop is stopped
  const step = (dt) => {
    if (onFrame) onFrame(dt);
    mixer.update(dt);
    applyMove(dt);
    applyLook(dt);
    renderer.render(scene, cam);
  };
  const tick = (t) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
    last = t;
    step(dt);
  };
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const onVis = () => { if (document.visibilityState === 'hidden') stop(); else if (want) start(); };
  document.addEventListener('visibilitychange', onVis);
  const setActive = (on) => { want = on; if (on) start(); else stop(); };

  function dispose() {
    stop();
    document.removeEventListener('visibilitychange', onVis);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => m.dispose());
    });
    steps.dispose();
    renderer.dispose();
  }

  return {
    play, perform, hold, release, busy, step, setX, setY, setFacing, setLean, setFlip, setSpin, setSquash, setHeight, resize, setTone, setLook, setActive, dispose,
    names, roles: Object.keys(bones), hasHead: !!head,
  };
}
