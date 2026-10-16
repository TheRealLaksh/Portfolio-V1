import { useEffect, useState } from 'react';

// Which of the given section ids is crossing the middle of the screen (null when none, e.g. in the hero).
export function useSection(ids) {
  const [cur, setCur] = useState(null);
  useEffect(() => {
    let raf = 0;
    const pick = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let found = null;
      ids.forEach((id) => {
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
  }, [ids]);
  return cur;
}
