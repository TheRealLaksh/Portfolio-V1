import React, { useEffect } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollManager from './components/layout/ScrollManager';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Home from './pages/Home';
import Hire from './pages/Hire';
import World from './world/World';
import Book from './world/Book';

function App() {
  useEffect(() => {
    // FIX: PREVENT BROWSER FROM RESTORING SCROLL POSITION
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Force immediate scroll to top
    window.scrollTo(0, 0);

    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 30,
    });
  }, []);

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lenisOptions = {
    // Inertia scrolling is motion too: switch it off for visitors who asked for less of it.
    smoothWheel: !prefersReducedMotion,
    lerp: 0.07,
    duration: 1.2,
    smoothTouch: false,
    touchMultiplier: 2,
  };

  return (
    <ReactLenis root options={lenisOptions}>
      {/* Scrolls to the top or to a #section after every navigation */}
      <ScrollManager />
      <Routes>
        {/* The valley portfolio has its own chrome (bar, nav), so it sits outside the classic Layout. */}
        <Route path="/" element={<World />} />
        <Route path="/book" element={<Book />} />
        <Route path="/classic" element={<Layout><Home /></Layout>} />
        <Route path="/hire" element={<Layout><Hire /></Layout>} />
        {/* The old /booking page was a demo with made-up slots; send visitors to the real page. */}
        <Route path="/booking" element={<Navigate to="/hire" replace />} />
        <Route path="/bookings" element={<Navigate to="/hire" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ReactLenis>
  );
}

export default App;