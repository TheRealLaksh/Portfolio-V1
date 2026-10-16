import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// The three.js half of the 3D sidekick: one transparent, pixel-sized strip along the bottom of the screen with an
// orthographic camera (1 unit = 1 CSS pixel, y up from the bottom edge), one skinned character, and an animation
// mixer. It knows nothing about the page: avatarBrain.js decides what he does and calls these methods.
// Loaded with a dynamic import so three never weighs on the first paint.

export async function createStage(canvas, { url = '/avatar/Xbot.glb', onFrame } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9a8a78, 1.5);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);
  sun.position.set(-300, 500, 700);
  scene.add(hemi, sun);
  const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -2000, 2000);

  const gltf = await new GLTFLoader().loadAsync(url);
  const model = gltf.scene;
  model.traverse((o) => { if (o.isMesh || o.isSkinnedMesh) o.frustumCulled = false; });
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

  // ---- placement, in CSS pixels ----
  const setX = (x) => { holder.position.x = x; };
  const setY = (y) => { holder.position.y = y; };
  const setFacing = (rad) => { holder.rotation.y = rad; };
  const setHeight = (px) => { holder.scale.setScalar(px / unit); };
  function resize(w, h) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    cam.left = 0; cam.right = w; cam.top = h; cam.bottom = 0;
    cam.updateProjectionMatrix();
  }
  function setTone(night) {
    hemi.intensity = night ? 0.85 : 1.5;
    sun.intensity = night ? 1.2 : 2.4;
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
    renderer.dispose();
  }

  return { play, setSpeed, setX, setY, setFacing, setHeight, resize, setTone, setLook, setActive, dispose, names, hasHead: !!head };
}
