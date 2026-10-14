import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from '@studio-freight/react-lenis';
import AOS from 'aos';

const TARGET_OFFSET = 30;

// One place that decides where the page scrolls after every navigation:
//  - no #hash: back to the top;
//  - #hash: wait for that element to exist (on a direct visit the page only mounts after the
//    preloader), scroll to it, and correct once more if late-loading content moved it.
// Must render inside <ReactLenis>.
const ScrollManager = () => {
  const { pathname, hash, key } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    const refreshAos = setTimeout(() => AOS.refresh(), 100);
    let cancelled = false;
    let poll;
    let recheck;

    const jump = (el) => {
      if (lenis) lenis.scrollTo(el, { offset: -TARGET_OFFSET, immediate: true });
      else el.scrollIntoView({ behavior: 'auto' });
    };

    if (!hash) {
      window.scrollTo(0, 0);
      if (lenis) lenis.scrollTo(0, { immediate: true });
    } else {
      const id = decodeURIComponent(hash.slice(1));
      const startedAt = Date.now();
      const tryScroll = () => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (el) {
          jump(el);
          recheck = setTimeout(() => {
            if (!cancelled && Math.abs(el.getBoundingClientRect().top - TARGET_OFFSET) > 40) jump(el);
          }, 700);
        } else if (Date.now() - startedAt < 15000) {
          poll = setTimeout(tryScroll, 100);
        }
      };
      tryScroll();
    }

    return () => {
      cancelled = true;
      clearTimeout(poll);
      clearTimeout(recheck);
      clearTimeout(refreshAos);
    };
    // `key` changes on every navigation, so clicking the same #link twice scrolls twice.
  }, [pathname, hash, key, lenis]);

  return null;
};

export default ScrollManager;
