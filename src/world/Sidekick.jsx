import React, { useEffect, useRef, useState } from 'react';
import { useScrub } from './hooks';
import Avatar3D from './Avatar3D';
import { attachGaze, reactAvatar, setWalking, idleGestures } from './avatarLife';

// A small Laksh who keeps you company down the page: he walks in from the left once you leave the hero, says one
// line about the section you are in, hops when you move on, and nods or tilts when you click him. In the journey
// section he is the traveller on the map, so he steps out of the corner there. Wide screens only.
const SAYS = {
  story: 'That is the short version.',
  work: 'Pick a card, any card.',
  brand: 'Need a site? Ask me.',
  profiley: 'Yes, I built this one too.',
  stack: 'Go on, unwrap it.',
  process: 'Small steps, then ship.',
  life: 'Go on, move things around.',
  notes: 'Leave a note before you go.',
  hello: 'Say hi, I reply fast.',
};
const IDS = ['story', 'journey', 'work', 'brand', 'profiley', 'stack', 'process', 'life', 'notes', 'hello'];

export default function Sidekick() {
  const scrub = useScrub();
  const root = useRef(null);
  const [cur, setCur] = useState(null);
  const say = cur ? SAYS[cur] : null;
  const shown = !!say;

  // which section is crossing the middle of the screen
  useEffect(() => {
    if (!scrub) return undefined;
    let raf = 0;
    const pick = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let found = null;
      IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) found = id;
      });
      setCur((c) => (c === found ? c : found));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [scrub]);

  useEffect(() => {
    const a = root.current?.querySelector('.a3');
    const offs = [attachGaze(a), idleGestures(a)];
    return () => offs.forEach((f) => f());
  }, [scrub]);

  // walk in when he appears or the section changes, then hop on arrival
  useEffect(() => {
    const a3 = root.current?.querySelector('.a3');
    if (!a3 || !shown) return undefined;
    setWalking(a3, true);
    const t1 = setTimeout(() => { setWalking(a3, false); reactAvatar(a3, 'hop'); }, 1100);
    return () => clearTimeout(t1);
  }, [cur, shown]);

  if (!scrub) return null;
  return (
    <div className={`sk ${shown ? 'on' : ''}`} ref={root} aria-hidden="true">
      {say && <p className="sk-say" key={cur}>{say}</p>}
      <div className="sk-fig" onClick={() => reactAvatar(root.current?.querySelector('.a3'))}><Avatar3D /></div>
    </div>
  );
}
