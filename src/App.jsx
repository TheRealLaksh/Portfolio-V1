import React, { useEffect } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollManager from './components/layout/ScrollManager';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Home from './pages/Home';
import Hire from './pages/Hire';

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

  const lenisOptions = {
    lerp: 0.07,
    duration: 1.2,
    smoothTouch: false,
    touchMultiplier: 2,
  };

  return (
    <ReactLenis root options={lenisOptions}>
      {/* Scrolls to the top or to a #section after every navigation */}
      <ScrollManager />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hire" element={<Hire />} />
          {/* The old /booking page was a demo with made-up slots; send visitors to the real page. */}
          <Route path="/booking" element={<Navigate to="/hire" replace />} />
          <Route path="/bookings" element={<Navigate to="/hire" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </Layout>
    </ReactLenis>
  );
}

export default App;