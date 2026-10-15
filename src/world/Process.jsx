import React, { useCallback, useEffect, useRef } from 'react';
import { PROCESS } from './data';
import { range, ss, useTrack, useScrub } from './hooks';
import Icon from './Icon';

const TONES = ['var(--sun-c)', '#FFB7A5', '#B8E3DE', '#D9CCFF', '#FFD9A8'];

export default function Process() {
  const scrub = useScrub();
  const sec = useRef(null);
  const line = useRef(null);
  const svg = useRef(null);
  const fg = useRef(null);
  const bg = useRef(null);
  const pen = useRef(null);
  const nodes = useRef([]);
  const len = useRef(0);

  // Lay a wavy line across the section, with one stop per step, alternately above and below it.
  const layout = useCallback(() => {
    const L = line.current;
    if (!L || !scrub) return;
    const w = L.clientWidth;
    const h = L.clientHeight;
    const mid = h * 0.5;
    const amp = h * 0.17;
    const n = PROCESS.steps.length;
    const pts = PROCESS.steps.map((_, i) => [w * (0.115 + 0.77 * (i / (n - 1))), mid + (i % 2 ? -amp : amp)]);
    let d = `M0 ${mid}`;
    let prev = [0, mid];
    pts.forEach((q) => {
      const mx = (prev[0] + q[0]) / 2;
      d += ` C ${mx} ${prev[1]}, ${mx} ${q[1]}, ${q[0]} ${q[1]}`;
      prev = q;
    });
    d += ` C ${w} ${prev[1]}, ${w} ${mid}, ${w + 20} ${mid}`;
    svg.current.setAttribute('viewBox', `0 0 ${w} ${h}`);
    bg.current.setAttribute('d', d);
    fg.current.setAttribute('d', d);
    len.current = fg.current.getTotalLength();
    fg.current.style.strokeDasharray = len.current;
    nodes.current.forEach((nd, i) => {
      if (!nd) return;
      nd.style.left = `${pts[i][0]}px`;
      nd.style.top = `${pts[i][1]}px`;
    });
  }, [scrub]);

  useEffect(() => {
    layout();
    const ro = new ResizeObserver(layout);
    if (line.current) ro.observe(line.current);
    document.fonts?.ready?.then(layout);
    return () => ro.disconnect();
  }, [layout]);

  useTrack(sec, (p) => {
    const q = ss(range(p, 0.34, 0.66));
    const L = len.current;
    if (!L || !fg.current) return;
    fg.current.style.strokeDashoffset = (L * (1 - q)).toFixed(1);
    const pt = fg.current.getPointAtLength(L * q);
    pen.current.setAttribute('cx', pt.x.toFixed(1));
    pen.current.setAttribute('cy', pt.y.toFixed(1));
    pen.current.style.opacity = q > 0.002 && q < 0.998 ? '1' : '0';
    const n = PROCESS.steps.length;
    nodes.current.forEach((nd, i) => { if (nd) nd.classList.toggle('in', q > (i + 0.15) / n); });
    // the whole drawing leans in as it crosses the screen
    line.current.style.transform = `scale(${(0.95 + 0.05 * ss(range(p, 0.25, 0.5))).toFixed(4)})`;
  }, { mode: 'pass', enabled: scrub, damp: 10 });

  return (
    <section className="process torn" id="process" aria-label="How I work" ref={sec}>
      <div className="wrap">
        <div className="sec-head" data-rv>
          <p className="kicker"><Icon n="bulb" size={16} />How I work</p>
          <h2>I ship the <span className="hl b-mint">smallest useful thing,</span> then keep going.</h2>
          <p>{PROCESS.title}, step by step. It is how I approach most projects.</p>
        </div>

        {scrub ? (
          <div className="proc-line" ref={line}>
            <svg ref={svg} aria-hidden="true" focusable="false">
              <path ref={bg} className="pl-bg" />
              <path ref={fg} className="pl-fg" />
              <circle ref={pen} className="pl-pen" r="9" />
            </svg>
            <ol>
              {PROCESS.steps.map((s, i) => (
                <li key={s.t} className={`pnode ${i % 2 ? 'up' : 'dn'}`} ref={(el) => { nodes.current[i] = el; }} style={{ ['--c']: TONES[i % TONES.length] }}>
                  <span className="pn">{i + 1}</span>
                  <div className="pc"><h3>{s.t}</h3><p>{s.p}</p></div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <ol className="proc">
            {PROCESS.steps.map((s, i) => (
              <li key={s.t} data-rv style={{ transitionDelay: `${i * 0.1}s` }}>
                <span className="pn">{i + 1}</span>
                <div><h3>{s.t}</h3><p>{s.p}</p></div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
