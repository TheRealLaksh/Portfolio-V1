import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// The three.js half of the 3D sidekick: one transparent, pixel-sized strip along the bottom of the screen with an
// orthographic camera (1 unit = 1 CSS pixel, y up from the bottom edge), one skinned character, and an animation
// mixer. It knows nothing about the page: avatarBrain.js decides what he does and calls these methods.
// Loaded with a dynamic import so three never weighs on the first paint.
//
// Look: toon shading (three flat tones) plus an inked outline, so he matches the hand-drawn, ink-outlined site
// instead of looking like a plastic render. Any rigged model can be dropped in; materials named like "joint" get the
// joint colour, the rest the body colour.

const OUTLINE_PX = 2.4;
const PALETTE = { body: 0xf5b13d, joint: 0x2a2f57, ink: 0x1b1f3b };

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

  let head = null;
  model.traverse((o) => { if (o.isBone && /head$/i.test(o.name) && !head) head = o; });

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
  model.position.set(-centre.x, -box.min.y, -centre.z); // feet on y = 0, centred on x = z = 0
  const holder = new THREE.Group();
  holder.rotation.order = 'YXZ'; // y = which way he faces, x = leaning forward in that direction
  holder.add(model);
  scene.add(holder);
  const unit = size.y || 1;

  let current = null;
  let doneCb = null;
  mixer.addEventListener('finished', (e) => {
    if (e.action === current && doneCb) { const f = doneCb; doneCb = null; f(); }
  });

  function play(name, { once = false, fade = 0.3, speed = 1, onDone } = {}) {
    const a = actions[name] || actions.idle || actions[names[0]];
    if (!a) return;
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
  const setSpeed = (s) => { if (current) current.timeScale = s; };

  // How fast the body must travel for the feet not to slide: sample a clip, find when each foot is planted (low) and
  // how fast it moves backwards then. Returns model units per second at timeScale 1; times pxPerUnit() for pixels.
  function strideSpeed(name) {
    const a = actions[name];
    const feet = [];
    model.traverse((o) => { if (o.isBone && /(left|right)foot$/i.test(o.name)) feet.push(o); });
    if (!a || !feet.length) return null;
    const dur = a.getClip().duration;
    const N = 60;
    const v = new THREE.Vector3();
    a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.setEffectiveTimeScale(1); a.play();
    const rows = feet.map(() => []);
    for (let i = 0; i <= N; i++) {
      a.time = (dur * i) / N;
      mixer.update(0);
      model.updateMatrixWorld(true);
      feet.forEach((f, k) => { f.getWorldPosition(v); model.worldToLocal(v); rows[k].push({ y: v.y, z: v.z }); });
    }
    a.stop();
    const speeds = [];
    rows.forEach((r) => {
      const ys = r.map((p) => p.y);
      const lo = Math.min(...ys);
      const hi = Math.max(...ys);
      for (let i = 0; i < N; i++) {
        if (r[i].y < lo + 0.3 * (hi - lo) && r[i + 1].y < lo + 0.3 * (hi - lo)) {
          const s = -(r[i + 1].z - r[i].z) / (dur / N);
          if (s > 0) speeds.push(s);
        }
      }
    });
    if (!speeds.length) return null;
    speeds.sort((p, q) => p - q);
    return speeds[Math.floor(speeds.length * 0.8)]; // the flat-foot plateau; heel and toe phases are slower
  }

  // ---- placement, in CSS pixels ----
  let heightPx = 160;
  const setX = (x) => { holder.position.x = x; };
  const setY = (y) => { holder.position.y = y; };
  const setFacing = (rad) => { holder.rotation.y = rad; };
  const setLean = (rad) => { holder.rotation.x = rad; };
  const pxPerUnit = () => heightPx / unit;
  function setHeight(px) {
    heightPx = px;
    holder.scale.setScalar(px / unit);
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
  const tmpE = new THREE.Euler();
  const tmpQ = new THREE.Quaternion();
  const setLook = (x, y) => { look.x = x; look.y = y; };
  function applyLook(dt) {
    if (!head) return;
    const k = 1 - Math.exp(-dt * 9);
    look.cx += (look.x - look.cx) * k;
    look.cy += (look.y - look.cy) * k;
    tmpE.set(look.cy * 0.3, look.cx * 0.55, 0);
    tmpQ.setFromEuler(tmpE);
    head.quaternion.multiply(tmpQ);
  }

  // ---- loop ----
  let raf = 0;
  let last = 0;
  let want = false;
  const tick = (t) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
    last = t;
    if (onFrame) onFrame(dt);
    mixer.update(dt);
    applyLook(dt);
    renderer.render(scene, cam);
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
    play, setSpeed, strideSpeed, pxPerUnit, setX, setY, setFacing, setLean, setHeight, resize, setTone, setLook, setActive, dispose, names, hasHead: !!head,
  };
}
