import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReveal, useTheme, useScrubMode, ScrubCtx } from './hooks';
import { useMotionKit } from './motion';
import { startMusic, stopMusic } from './audio';
import { countVisit } from './api';
import Bar from './Bar';
import Hero from './Hero';
import Story from './Story';
import Journey from './Journey';
import Work from './Work';
import Brand from './Brand';
import Flagship from './Flagship';
import Stack from './Stack';
import Process from './Process';
import Life from './Life';
import Wall from './Wall';
import Hello from './Hello';
import './world.css';
import './world2.css';
import './world3.css';
import './motion.css';

export default function World() {
  const root = useRef(null);
  const [theme, toggleTheme] = useTheme();
  const [music, setMusic] = useState(false);
  const [visitors, setVisitors] = useState(null);
  const scrub = useScrubMode();
  useReveal(root, scrub);
  useMotionKit(root, scrub);


  useEffect(() => {
    document.title = 'Laksh Pradhwani | Full-Stack Developer';
    // The classic site hides horizontal overflow on html/body, which turns them into scroll
    // containers and breaks position: sticky. This page clips instead.
    document.documentElement.classList.add('world-on');
    countVisit().then(setVisitors);
    return () => { stopMusic(); document.documentElement.classList.remove('world-on'); };
  }, []);

  const toggleMusic = useCallback(() => {
    setMusic((on) => {
      if (on) { stopMusic(); return false; }
      return startMusic();
    });
  }, []);

  return (
    <div className={`w-root ${scrub ? 'w-scrub' : 'w-flat'}`} data-theme={theme} ref={root}>
      <a className="skip" href="#story">Skip to content</a>
      <Bar theme={theme} onTheme={toggleTheme} visitors={visitors} music={music} onMusic={toggleMusic} />
      <ScrubCtx.Provider value={scrub}>
      <main key={scrub ? 's' : 'f'}>
        <Hero music={music} onMusic={toggleMusic} />
        <Story />
        <Journey />
        <Work />
        <Brand />
        <Flagship />
        <Stack />
        <Process />
        <Life music={music} onMusic={toggleMusic} />
        <Wall />
        <Hello />
      </main>
      </ScrubCtx.Provider>
    </div>
  );
}
