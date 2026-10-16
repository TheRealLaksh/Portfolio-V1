import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import { ME } from './data';
import { useSection } from './useSection';
import { JOKES, pick } from './avatarLines';
import './sidekick3d.css';

// The 3D sidekick (see avatarStage.js for the picture, avatarBrain.js for the behaviour). This is the DOM around
// him: the canvas strip, a button that sits over him (so keyboard and screen-reader users can open his menu), the
// speech bubble, the "Zzz" and the guide menu. three.js loads lazily after the page has settled; if anything fails
// the parent falls back to the flat 2D sidekick.
const IDS = ['story', 'work', 'brand', 'profiley', 'stack', 'process', 'life', 'notes', 'hello'];

const metrics = (mini) => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const charH = mini ? 118 : Math.min(270, Math.max(170, H * 0.27));
  return { W, H, mini, charH, bottom: mini ? 78 : 0, strip: Math.round(charH + 190) }; // room for a flip
};

export default function Sidekick3D({ mini, onFail }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const followRef = useRef(null);
  const brainRef = useRef(null);
  const stageRef = useRef(null);
  const miniRef = useRef(mini);
  miniRef.current = mini;
  const bubbleTimer = useRef(0);
  const lenis = useLenis();
  const [bubble, setBubble] = useState(null);
  const [zzz, setZzz] = useState(false);
  const [menu, setMenu] = useState(false);
  const cur = useSection(IDS);
  const curRef = useRef(cur);
  curRef.current = cur;

  const say = useCallback((text) => {
    clearTimeout(bubbleTimer.current);
    setBubble({ text, id: performance.now() });
    bubbleTimer.current = setTimeout(() => setBubble(null), 6600);
  }, []);

  // boot three after the page has settled
  useEffect(() => {
    let dead = false;
    let stage = null;
    let brain = null;
    let off = null;
    const fit = () => {
      const m = metrics(miniRef.current);
      const root = rootRef.current;
      if (!root || !stage) return;
      root.style.setProperty('--sk-ch', `${m.charH}px`);
      root.style.setProperty('--sk-strip', `${m.strip}px`);
      root.style.setProperty('--sk-bottom', `${m.bottom}px`);
      root.style.setProperty('--sk-w', `${Math.round(m.charH * 0.5)}px`);
      stage.resize(m.W, m.strip);
      stage.setHeight(m.charH);
    };
    const boot = async () => {
      try {
        const [{ createStage }, { createBrain }] = await Promise.all([import('./avatarStage'), import('./avatarBrain')]);
        if (dead) return;
        stage = await createStage(canvasRef.current, {
          onFrame: (dt) => brain && brain.frame(dt),
        });
        if (dead) { stage.dispose(); return; }
        stageRef.current = stage;
        brain = createBrain({
          stage,
          els: { root: rootRef.current, follow: followRef.current },
          size: () => metrics(miniRef.current),
          say,
          onZzz: setZzz,
        });
        brainRef.current = brain;
        fit();
        stage.play('idle', { fade: 0 }); // full weight from the start, so he never shows the bind pose
        if (import.meta.env.DEV) window.__sk = { brain, stage };
        const onResize = () => { fit(); };
        window.addEventListener('resize', onResize);
        // follow the light/night switch
        const w = document.querySelector('.w-root');
        const read = () => brain.setTone(w?.dataset.theme === 'night');
        read();
        if (w) {
          const mo = new MutationObserver(read);
          mo.observe(w, { attributes: true, attributeFilter: ['data-theme'] });
          off = () => { mo.disconnect(); window.removeEventListener('resize', onResize); };
        } else off = () => window.removeEventListener('resize', onResize);
        brain.goTo(curRef.current);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('3D sidekick unavailable, using the flat one', err);
        if (!dead && onFail) onFail();
      }
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => boot(), { timeout: 2500 })
      : window.setTimeout(boot, 1200);
    return () => {
      dead = true;
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(idle); else clearTimeout(idle);
      clearTimeout(bubbleTimer.current);
      if (off) off();
      if (brain) brain.dispose();
      if (stage) stage.dispose();
      brainRef.current = null;
      stageRef.current = null;
    };
  }, [say, onFail]);

  useEffect(() => { if (brainRef.current) brainRef.current.goTo(cur); }, [cur]);
  useEffect(() => { if (brainRef.current) brainRef.current.setMenu(menu); }, [menu]);

  // close the menu on Escape or a press outside it
  useEffect(() => {
    if (!menu) return undefined;
    const k = (e) => { if (e.key === 'Escape') setMenu(false); };
    const p = (e) => { if (!e.target.closest?.('.sk3-follow')) setMenu(false); };
    window.addEventListener('keydown', k);
    window.addEventListener('pointerdown', p);
    return () => { window.removeEventListener('keydown', k); window.removeEventListener('pointerdown', p); };
  }, [menu]);

  const go = (id) => {
    setMenu(false);
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -8, duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' });
  };
  // click = wave (and the menu), double click = a flip, triple click = a spin
  const clicks = useRef({ n: 0, t: 0 });
  const onHit = () => {
    const c = clicks.current;
    clearTimeout(c.t);
    c.n += 1;
    const b = brainRef.current;
    if (c.n === 1) { setMenu((m) => !m); if (b) b.perform('wave'); } else if (c.n === 2) { setMenu(false); if (b) b.perform('flip'); } else if (b) { setMenu(false); b.perform('spin'); }
    c.t = setTimeout(() => { c.n = 0; }, 450);
  };
  const trick = (name) => { setMenu(false); if (brainRef.current) brainRef.current[name === 'surprise' ? 'surprise' : 'perform'](name); };
  const joke = () => {
    setMenu(false);
    if (brainRef.current) brainRef.current.speak(pick(JOKES, bubble && bubble.text));
  };

  return (
    <div className={`sk3 ${mini ? 'mini' : ''}`} ref={rootRef}>
      <canvas className="sk3-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="sk3-follow" ref={followRef} data-side="r">
        <div className="sk3-shadow" aria-hidden="true" />
        <button
          type="button"
          className="sk3-hit"
          aria-label="Laksh's sidekick. Open the guide menu"
          aria-haspopup="menu"
          aria-expanded={menu}
          onClick={onHit}
        />
        {zzz && <span className="sk3-zzz" aria-hidden="true"><i>Z</i><i>z</i><i>z</i></span>}
        {bubble && !menu && <p className="sk3-say" key={bubble.id} aria-hidden="true">{bubble.text}</p>}
        {menu && (
          <div className="sk3-menu" role="menu" aria-label="Where to?">
            <button type="button" role="menuitem" onClick={() => go('work')}>Show me the work</button>
            <button type="button" role="menuitem" onClick={() => go('hello')}>Contact</button>
            <a role="menuitem" href={ME.resume} target="_blank" rel="noopener noreferrer" onClick={() => setMenu(false)}>Resume</a>
            <a role="menuitem" href="/hire" onClick={() => setMenu(false)}>Hire me</a>
            <button type="button" role="menuitem" onClick={() => trick('flip')}>Do a flip</button>
            <button type="button" role="menuitem" onClick={() => trick('surprise')}>Surprise me</button>
            <button type="button" role="menuitem" onClick={joke}>Tell me a joke</button>
          </div>
        )}
      </div>
    </div>
  );
}
