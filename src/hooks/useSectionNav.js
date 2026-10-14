import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLenis } from '@studio-freight/react-lenis';

const easeOutExpo = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

// Returns goToSection(id): scroll to a home-page section from anywhere.
// On the home page it scrolls in place; on any other page it navigates to /#id and
// <ScrollManager /> does the scrolling once the home page has mounted.
export const useSectionNav = () => {
  const lenis = useLenis();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return useCallback(
    (id, { native = false, offset = -50 } = {}) => {
      if (pathname !== '/') {
        navigate(`/#${id}`);
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis && !native) {
        lenis.scrollTo(el, { offset, duration: 1.5, easing: easeOutExpo });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [lenis, pathname, navigate],
  );
};

export default useSectionNav;
