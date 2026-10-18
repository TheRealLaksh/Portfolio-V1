// Generates the animated SVGs used by the two portfolio READMEs.
// Usage: node build.mjs <outRoot>   (writes <outRoot>/v1/*.svg and <outRoot>/v2/*.svg)
// Everything is self-contained (no fonts, no scripts, no external requests): GitHub shows SVGs through <img>,
// where CSS and SMIL animation run but scripts and webfonts do not. Text widths are pinned with textLength so
// the typing effect lines up whatever font the viewer's system picks.
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
const ART = fs.readFileSync(process.argv[3], 'utf8');

const SANS = "'Segoe UI','Helvetica Neue',Arial,sans-serif";
const MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',monospace";

const T = {
  v1: { bg: '#05070c', card: '#0b111b', line: '#1f2a3a', text: '#e8eef7', dim: '#8d9db3', a: '#38bdf8', b: '#a855f7', c: '#34d399', d: '#facc15', font: MONO, display: MONO },
  v2: { bg: '#FFF6E5', card: '#FFFCF3', line: '#E9D9B8', text: '#1B1F3B', dim: '#565A7A', a: '#FF8A1F', b: '#8E7CFF', c: '#1FA6A0', d: '#FFC93C', e: '#E8505B', font: SANS, display: SANS },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function rng(seed) { let s = seed; return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296); }
const wrap = (w, h, css, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">\n<defs>${defs}</defs>\n<style>${css}\n@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>\n${body}\n</svg>\n`;
const write = (dir, name, svg) => { fs.mkdirSync(path.join(OUT, dir), { recursive: true }); fs.writeFileSync(path.join(OUT, dir, name), svg); };

/* ---------- typing effect: phrases typed, held and erased in turn ---------- */
function typer({ id, phrases, x, y, size, font, fill, charW, caret, cycle = 4.6 }) {
  const total = cycle * phrases.length;
  let css = '';
  let body = '';
  phrases.forEach((txt, i) => {
    const n = txt.length;
    const W = Math.round(n * charW);
    const s = (i * cycle) / total * 100;
    const a = s + (cycle * 0.36) / total * 100; // typed
    const b = s + (cycle * 0.8) / total * 100; // held
    const c = s + (cycle * 0.92) / total * 100; // erased
    const k = (v) => v.toFixed(3);
    css += `@keyframes ${id}w${i}{0%{width:0}${k(s)}%{width:0;animation-timing-function:steps(${n},end)}${k(a)}%{width:${W}px}${k(b)}%{width:${W}px;animation-timing-function:steps(${n},end)}${k(c)}%{width:0}100%{width:0}}`;
    css += `@keyframes ${id}x${i}{0%{transform:translateX(0)}${k(s)}%{transform:translateX(0);animation-timing-function:steps(${n},end)}${k(a)}%{transform:translateX(${W}px)}${k(b)}%{transform:translateX(${W}px);animation-timing-function:steps(${n},end)}${k(c)}%{transform:translateX(0)}100%{transform:translateX(0)}}`;
    css += `.${id}c${i}{animation:${id}w${i} ${total}s linear infinite}.${id}k${i}{animation:${id}x${i} ${total}s linear infinite}`;
    body += `<clipPath id="${id}cp${i}"><rect class="${id}c${i}" x="${x}" y="${y - size}" width="0" height="${size * 1.5}"/></clipPath>`;
    body += `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" fill="${fill}" textLength="${W}" lengthAdjust="spacingAndGlyphs" clip-path="url(#${id}cp${i})">${esc(txt)}</text>`;
    body += `<rect class="${id}k${i}" x="${x + 2}" y="${y - size * 0.86}" width="${Math.max(3, size / 9)}" height="${size * 1.05}" rx="1.5" fill="${caret}"><animate attributeName="opacity" values="1;1;0;0" dur="1s" repeatCount="indefinite" calcMode="discrete"/></rect>`;
  });
  return { css, body };
}

/* ---------- small shapes ---------- */
const star4 = (cx, cy, r, fill, cls = '') => `<path class="${cls}" d="M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r}Z" fill="${fill}"/>`;
const plus = (cx, cy, r, stroke, cls = '') => `<path class="${cls}" d="M${cx - r} ${cy}H${cx + r}M${cx} ${cy - r}V${cy + r}" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`;
const ring = (cx, cy, r, stroke, cls = '') => `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}" stroke="${stroke}" stroke-width="3.2" fill="none"/>`;
const tri = (cx, cy, r, stroke, cls = '') => `<path class="${cls}" d="M${cx} ${cy - r}L${cx + r} ${cy + r * 0.8}H${cx - r}Z" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" fill="none"/>`;

/* =========================================================================================
   V1 (classic, dark cinematic)
   ========================================================================================= */
function banner1() {
  const t = T.v1;
  const W = 1280, H = 380;
  const r = rng(7);
  let stars = '';
  for (let i = 0; i < 110; i++) {
    const x = Math.round(r() * W), y = Math.round(r() * H), s = r() < 0.12 ? 1.8 : r() < 0.4 ? 1.2 : 0.8;
    const col = r() < 0.12 ? t.a : r() < 0.2 ? t.b : '#cfd8e6';
    const dur = (2 + r() * 4).toFixed(1), del = (r() * 5).toFixed(1);
    stars += `<circle cx="${x}" cy="${y}" r="${s}" fill="${col}" style="animation:tw ${dur}s ease-in-out ${del}s infinite"/>`;
  }
  const ty = typer({ id: 'p', phrases: ['a Web Developer', 'an Aspiring AI/ML Engineer', 'a Passionate Learner'], x: 100, y: 262, size: 30, font: MONO, fill: '#cbd5e1', charW: 17.4, caret: t.a, cycle: 4.8 });
  // centre each phrase: typed text starts at x, so compute per-phrase offset is simpler with left alignment; keep left-aligned block
  const css = `
@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
@keyframes glow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes scan{from{transform:translateX(-340px)}to{transform:translateX(1280px)}}
.glow{transform-origin:640px 190px;animation:glow 6s ease-in-out infinite}
.r1{animation:rise 1s ease-out .15s both}.r2{animation:rise 1s ease-out .45s both}.r3{animation:rise 1s ease-out .75s both}
.scan{animation:scan 7s linear infinite}
${ty.css}`;
  const body = `
<rect width="${W}" height="${H}" rx="22" fill="${t.bg}"/>
<g clip-path="url(#round)">
<ellipse class="glow" cx="640" cy="190" rx="520" ry="170" fill="url(#halo)"/>
${stars}
<rect class="scan" x="0" y="0" width="340" height="${H}" fill="url(#sweep)" opacity=".5"/>
</g>
<text class="r1" x="64" y="64" font-family="${MONO}" font-size="15" letter-spacing="4" fill="${t.a}">PORTFOLIO V1  /  CLASSIC EDITION</text>
<text class="r2" x="64" y="168" font-family="${MONO}" font-size="76" font-weight="700" fill="#ffffff" textLength="1010" lengthAdjust="spacingAndGlyphs">Laksh Pradhwani</text>
<g class="r3"><text x="64" y="262" font-family="${MONO}" font-size="30" fill="${t.dim}">&gt;</text></g>
<g>${ty.body}</g>
<text class="r3" x="64" y="336" font-family="${MONO}" font-size="15" fill="${t.dim}">React  /  Vite  /  Tailwind  /  Three.js  /  Framer Motion</text>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${t.line}"/>`;
  const defs = `<clipPath id="round"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<radialGradient id="halo"><stop offset="0" stop-color="${t.a}" stop-opacity=".22"/><stop offset=".55" stop-color="${t.b}" stop-opacity=".09"/><stop offset="1" stop-color="${t.bg}" stop-opacity="0"/></radialGradient>
<linearGradient id="sweep" x1="0" x2="1"><stop offset="0" stop-color="${t.a}" stop-opacity="0"/><stop offset=".5" stop-color="${t.a}" stop-opacity=".12"/><stop offset="1" stop-color="${t.a}" stop-opacity="0"/></linearGradient>`;
  return wrap(W, H, css, body, defs);
}

/* =========================================================================================
   V2 (valley, warm paper)
   ========================================================================================= */
function banner2() {
  const t = T.v2;
  const W = 1280, H = 400;
  const ty = typer({ id: 'q', phrases: ['Building things so ideas actually ship.', 'Full-stack developer, 18.', "Studying Data Science & AI."], x: 64, y: 290, size: 28, font: SANS, fill: t.text, charW: 15.6, caret: t.a, cycle: 5.2 });
  const css = `
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes drift{from{transform:translateX(-220px)}to{transform:translateX(1500px)}}
@keyframes bob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-10px) rotate(8deg)}}
@keyframes twinkle{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
@keyframes bar{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.r1{animation:rise .9s ease-out .1s both}.r2{animation:rise .9s ease-out .3s both}.r3{animation:rise .9s ease-out .6s both}
.cl1{animation:drift 60s linear infinite}.cl2{animation:drift 85s linear -30s infinite}
.f{transform-box:fill-box;transform-origin:center}
.f1{animation:bob 5s ease-in-out infinite}.f2{animation:bob 6.5s ease-in-out -2s infinite}.f3{animation:twinkle 3.5s ease-in-out infinite}.f4{animation:twinkle 4.2s ease-in-out -1.4s infinite}
.bar{animation:bar 4.5s ease-in-out infinite}
${ty.css}`;
  const body = `
<g clip-path="url(#round)">
<rect width="${W}" height="${H}" fill="${t.bg}"/>
<image href="data:image/jpeg;base64,${ART}" x="0" y="-150" width="${W}" height="720" preserveAspectRatio="xMidYMid slice"/>
<rect width="${W}" height="${H}" fill="url(#fade)"/>
<g class="cl1" opacity=".9"><ellipse cx="0" cy="54" rx="60" ry="16" fill="#fff"/><ellipse cx="-30" cy="62" rx="40" ry="13" fill="#fff"/><ellipse cx="34" cy="64" rx="44" ry="12" fill="#fff"/></g>
<g class="cl2" opacity=".75"><ellipse cx="0" cy="112" rx="50" ry="13" fill="#fff"/><ellipse cx="-26" cy="119" rx="34" ry="11" fill="#fff"/><ellipse cx="30" cy="121" rx="38" ry="10" fill="#fff"/></g>
${star4(1010, 70, 15, t.b, 'f f3')}${plus(1180, 120, 11, t.c, 'f f1')}${ring(930, 330, 11, t.e, 'f f2')}${tri(1215, 300, 12, t.a, 'f f4')}${star4(760, 360, 11, t.d, 'f f3')}
<g transform="translate(0 ${H - 6})" clip-path="url(#barclip)"><rect class="bar" width="${W}" height="6" fill="url(#bargrad)"/></g>
</g>
<text class="r1" x="64" y="72" font-family="${SANS}" font-size="15" font-weight="700" letter-spacing="4" fill="${t.a}">PORTFOLIO V2  /  THE VALLEY EDITION</text>
<text class="r2" x="64" y="176" font-family="${SANS}" font-size="78" font-weight="800" letter-spacing="-2" fill="${t.text}" textLength="248" lengthAdjust="spacingAndGlyphs">Laksh</text>
<text class="r2" x="64" y="250" font-family="${SANS}" font-size="62" font-weight="800" letter-spacing="-1.5" fill="${t.text}" textLength="318" lengthAdjust="spacingAndGlyphs">Pradhwani</text>
<rect class="r3" x="64" y="262" width="520" height="0" fill="none"/>
<g>${ty.body}</g>
<text class="r3" x="64" y="352" font-family="${SANS}" font-size="15" font-weight="600" fill="${t.dim}">React  /  Vite  /  Lenis  /  Three.js  /  AI Laksh chat</text>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${t.line}" stroke-width="1.5"/>`;
  const defs = `<clipPath id="round"><rect width="${W}" height="${H}" rx="22"/></clipPath><clipPath id="barclip"><rect width="${W}" height="6"/></clipPath>
<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${t.bg}" stop-opacity=".97"/><stop offset=".42" stop-color="${t.bg}" stop-opacity=".88"/><stop offset=".66" stop-color="${t.bg}" stop-opacity=".1"/><stop offset="1" stop-color="${t.bg}" stop-opacity="0"/></linearGradient>
<linearGradient id="bargrad"><stop offset="0" stop-color="${t.a}" stop-opacity="0"/><stop offset=".4" stop-color="${t.a}"/><stop offset=".6" stop-color="${t.d}"/><stop offset="1" stop-color="${t.c}" stop-opacity="0"/></linearGradient>`;
  return wrap(W, H, css, body, defs);
}

/* ---------- divider: a line that draws itself, with a dot travelling along it ---------- */
function divider(theme) {
  const t = T[theme];
  const W = 1280, H = 36;
  const path = 'M20 18 C 180 2, 300 34, 460 18 S 760 2, 900 18 S 1130 34, 1260 18';
  const css = `@keyframes draw{from{stroke-dashoffset:1500}to{stroke-dashoffset:0}}@keyframes flow{to{stroke-dashoffset:-48}}
.d1{stroke-dasharray:1500;animation:draw 2.6s ease-out both}.d2{stroke-dasharray:6 10;animation:flow 2.2s linear infinite}`;
  const body = `<path class="d1" d="${path}" stroke="url(#g)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path class="d2" d="${path}" stroke="${t.a}" stroke-opacity=".55" stroke-width="1.2" fill="none"/>
<circle r="5.5" fill="${theme === 'v1' ? t.a : t.d}"><animateMotion dur="7s" repeatCount="indefinite" path="${path}"/></circle>
<circle r="11" fill="${theme === 'v1' ? t.a : t.d}" opacity=".25"><animateMotion dur="7s" repeatCount="indefinite" path="${path}"/></circle>`;
  const defs = `<linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${t.a}" stop-opacity="0"/><stop offset=".25" stop-color="${t.a}"/><stop offset=".75" stop-color="${t.b}"/><stop offset="1" stop-color="${t.b}" stop-opacity="0"/></linearGradient>`;
  return wrap(W, H, css, body, defs);
}

/* ---------- facts row ---------- */
function facts(theme, items) {
  const t = T[theme];
  const W = 1280, H = 168, gap = 20, n = items.length;
  const cw = (W - gap * (n - 1)) / n;
  const cols = theme === 'v1' ? [t.a, t.b, t.c, t.d] : [t.a, t.c, t.b, t.e];
  let css = `@keyframes pop{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}@keyframes under{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`;
  let body = '';
  items.forEach(([big, label, sub], i) => {
    const x = i * (cw + gap);
    const col = cols[i % cols.length];
    css += `.c${i}{animation:pop .7s cubic-bezier(.22,1,.36,1) ${0.15 + i * 0.14}s both}.u${i}{transform-box:fill-box;transform-origin:left;animation:under .8s ease-out ${0.5 + i * 0.14}s both}`;
    body += `<g transform="translate(${x} 0)"><g class="c${i}">
<rect width="${cw}" height="${H}" rx="20" fill="${t.card}" stroke="${t.line}" stroke-width="1.5"/>
<circle cx="${cw - 34}" cy="34" r="6" fill="${col}" style="animation:pulse 2.6s ease-in-out ${i * 0.4}s infinite"/>
<text x="28" y="86" font-family="${t.display}" font-size="56" font-weight="800" fill="${t.text}" letter-spacing="-1.5">${esc(big)}</text>
<rect class="u${i}" x="28" y="100" width="46" height="5" rx="2.5" fill="${col}"/>
<text x="28" y="130" font-family="${t.font}" font-size="16" font-weight="700" fill="${t.text}">${esc(label)}</text>
<text x="28" y="152" font-family="${t.font}" font-size="13" fill="${t.dim}">${esc(sub)}</text></g></g>`;
  });
  return wrap(W, H, css, body);
}

/* ---------- stack pills ---------- */
function stack(theme, groups) {
  const t = T[theme];
  const W = 1280;
  let y = 8, body = '', css = `@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.pill{animation:up .6s cubic-bezier(.22,1,.36,1) both}.bob{animation:bob 4s ease-in-out infinite}`;
  let idx = 0;
  groups.forEach(([label, items, col]) => {
    body += `<text x="4" y="${y + 18}" font-family="${t.font}" font-size="13" font-weight="700" letter-spacing="3" fill="${t.dim}">${esc(label.toUpperCase())}</text>`;
    y += 30;
    let x = 4;
    items.forEach((name) => {
      const w = Math.round(name.length * 8.6 + 44);
      if (x + w > W - 4) { x = 4; y += 50; }
      const del = (idx * 0.045).toFixed(2);
      body += `<g transform="translate(${x} ${y})"><g class="pill" style="animation-delay:${del}s"><g class="bob" style="animation-delay:-${(idx % 7) * 0.6}s">
<rect width="${w}" height="40" rx="20" fill="${t.card}" stroke="${t.line}" stroke-width="1.5"/>
<circle cx="22" cy="20" r="5" fill="${col}"/>
<text x="36" y="25.5" font-family="${t.font}" font-size="14.5" font-weight="650" fill="${t.text}" textLength="${Math.round(name.length * 8.6)}" lengthAdjust="spacingAndGlyphs">${esc(name)}</text></g></g></g>`;
      x += w + 12; idx++;
    });
    y += 64;
  });
  return wrap(W, y, css, body);
}

/* ---------- architecture diagrams ---------- */
const node = (x, y, w, h, title, lines, col, t, cls = '') => `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${t.card}" stroke="${col}" stroke-width="2"/>
<rect x="${x}" y="${y}" width="${w}" height="8" rx="4" fill="${col}" opacity=".9"/>
<text x="${x + 18}" y="${y + 34}" font-family="${t.font}" font-size="16" font-weight="800" fill="${t.text}">${esc(title)}</text>
${lines.map((l, i) => `<text x="${x + 18}" y="${y + 58 + i * 20}" font-family="${t.font}" font-size="13" fill="${t.dim}">${esc(l)}</text>`).join('')}</g>`;
const edge = (id, d, col, dur, label, lx, ly, t, dashed = false) => `<path id="${id}" d="${d}" fill="none" stroke="${col}" stroke-opacity=".5" stroke-width="2" stroke-dasharray="${dashed ? '4 8' : '8 8'}" style="animation:flow 1.6s linear infinite"/>
<circle r="5" fill="${col}"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${d}"/></circle>
<text x="${lx}" y="${ly}" font-family="${t.font}" font-size="12" font-weight="700" fill="${t.dim}" text-anchor="middle">${esc(label)}</text>`;

function arch1() {
  const t = T.v1, W = 1280, H = 440;
  const css = `@keyframes flow{to{stroke-dashoffset:-32}}@keyframes pop{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.n1{animation:pop .7s ease-out .1s both}.n2{animation:pop .7s ease-out .3s both}.n3{animation:pop .7s ease-out .5s both}.n4{animation:pop .7s ease-out .7s both}.n5{animation:pop .7s ease-out .9s both}`;
  const body = `<rect width="${W}" height="${H}" rx="22" fill="${t.bg}" stroke="${t.line}"/>
${node(40, 130, 310, 130, 'Visitor browser', ['React 18 + Vite single-page app', 'Three.js star field, Framer Motion', 'Lenis smooth scroll, service worker'], t.a, t, 'n1')}
${node(500, 26, 290, 118, 'Vercel (static)', ['dist/ from vite build', 'own head for /hire (prerendered)', 'short links in vercel.json'], t.c, t, 'n2')}
${node(500, 156, 290, 92, 'GitHub REST API', ['repo cards on the Projects section', 'cached in the browser for 1 hour'], t.b, t, 'n3')}
${node(500, 260, 290, 86, 'Last.fm API', ['recently played track (footer chip)'], t.d, t, 'n4')}
${node(930, 130, 310, 130, 'AI Laksh chat backend', ['Express on its own Vercel project', 'Gemini, with a guard in front', 'answers only about Laksh'], t.a, t, 'n5')}
${edge('e1', 'M350 175 C 420 175, 430 88, 500 88', t.c, 3.2, 'pages and assets', 425, 112, t)}
${edge('e2', 'M350 195 C 420 195, 430 202, 500 202', t.b, 3.6, 'repos', 425, 192, t)}
${edge('e3', 'M350 215 C 420 215, 430 303, 500 303', t.d, 4, 'now playing', 425, 296, t)}
${edge('e4', 'M200 260 C 200 430, 1085 430, 1085 262', t.a, 5, 'POST /api/chat', 640, 420, t)}`;
  return wrap(W, H, css, body);
}

function arch2() {
  const t = T.v2, W = 1280, H = 470;
  const css = `@keyframes flow{to{stroke-dashoffset:-32}}@keyframes pop{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.n1{animation:pop .7s ease-out .1s both}.n2{animation:pop .7s ease-out .3s both}.n3{animation:pop .7s ease-out .5s both}.n4{animation:pop .7s ease-out .7s both}.n5{animation:pop .7s ease-out .9s both}.n6{animation:pop .7s ease-out 1.1s both}`;
  const body = `<rect width="${W}" height="${H}" rx="22" fill="${t.bg}" stroke="${t.line}" stroke-width="1.5"/>
${node(36, 168, 300, 140, 'Visitor browser', ['React 18 + Vite single-page app', 'Lenis scroll, scroll-scrubbed scenes', 'Web Audio, day and night themes', 'AI Laksh chat (keeps its own history)'], t.a, t, 'n1')}
${node(480, 30, 300, 100, 'Vercel static site', ['dist/ from vite build', 'painted art as .webp in /art'], t.c, t, 'n2')}
${node(480, 160, 300, 120, 'Vercel serverless /api', ['wall.js: guestbook notes', 'visit.js: daily visitor counter', 'rate limited, no links allowed'], t.b, t, 'n3')}
${node(900, 160, 340, 120, 'Upstash Redis', ['wall notes, visit count', 'optional: without it the wall', 'shows a placeholder'], t.e, t, 'n4')}
${node(480, 330, 300, 112, 'AI Laksh backend', ['Express on its own Vercel project', 'guard, Gemini, cards, chips', 'thumbs and owner log'], t.a, t, 'n5')}
${node(900, 330, 340, 112, 'Google Gemini', ['flash-lite first, then 2.5 and 3.5', 'JSON reply: text, cards, follow-ups', 'optional Groq fallback'], t.d, t, 'n6')}
${edge('e1', 'M336 205 C 410 205, 420 80, 480 80', t.c, 3.4, 'assets', 408, 128, t)}
${edge('e2', 'M336 238 C 410 238, 420 220, 480 220', t.b, 3.2, 'wall + visits', 410, 214, t)}
${edge('e3', 'M780 220 L900 220', t.e, 2.2, 'REST', 840, 208, t)}
${edge('e4', 'M336 270 C 410 270, 420 386, 480 386', t.a, 3.8, 'POST /api/chat', 392, 354, t)}
${edge('e5', 'M780 386 L900 386', t.d, 2.4, 'prompt', 840, 374, t)}
${edge('e6', 'M630 330 C 700 300, 960 300, 1060 280', t.e, 5, 'owner log (optional)', 850, 296, t, true)}`;
  return wrap(W, H, css, body);
}

/* ---------- chat pipeline (v2) ---------- */
function flow2() {
  const t = T.v2, W = 1280, H = 250;
  const steps = [
    ['1', 'Question', ['300 characters max', 'last turns sent along'], t.a],
    ['2', 'Input guard', ['no prompt tricks', 'no homework or code'], t.e],
    ['3', 'Gemini', ['facts block only', 'answers as JSON'], t.b],
    ['4', 'Output check', ['no code, no leaks', 'cards from a fixed list'], t.c],
    ['5', 'Reply', ['text, cards, chips', 'thumbs up or down'], t.d],
  ];
  const bw = 196, gap = 52, x0 = 46;
  let css = `@keyframes hl{0%,16%,100%{opacity:.35;transform:translateY(0)}6%,12%{opacity:1;transform:translateY(-5px)}}@keyframes flow{to{stroke-dashoffset:-32}}`;
  let body = `<rect width="${W}" height="${H}" rx="22" fill="${t.bg}" stroke="${t.line}" stroke-width="1.5"/>`;
  steps.forEach(([n, title, lines, col], i) => {
    const x = x0 + i * (bw + gap);
    css += `.s${i}{animation:hl 10s ease-in-out ${i * 1.6}s infinite;transform-box:fill-box}`;
    body += `<g class="s${i}"><rect x="${x}" y="52" width="${bw}" height="150" rx="18" fill="${t.card}" stroke="${col}" stroke-width="2.4"/>
<circle cx="${x + 34}" cy="88" r="17" fill="${col}"/><text x="${x + 34}" y="94.5" font-family="${t.font}" font-size="17" font-weight="800" fill="${t.text}" text-anchor="middle">${n}</text>
<text x="${x + 62}" y="94" font-family="${t.font}" font-size="18" font-weight="800" fill="${t.text}">${esc(title)}</text>
${lines.map((l, k) => `<text x="${x + 20}" y="${132 + k * 24}" font-family="${t.font}" font-size="14" fill="${t.dim}">${esc(l)}</text>`).join('')}</g>`;
    if (i < steps.length - 1) {
      const ax = x + bw + 6, bx = x + bw + gap - 6;
      body += `<path d="M${ax} 127 H${bx}" stroke="${t.dim}" stroke-opacity=".6" stroke-width="2.4" stroke-dasharray="6 6" style="animation:flow 1.4s linear infinite"/><path d="M${bx - 8} 119 L${bx} 127 L${bx - 8} 135" stroke="${t.dim}" stroke-opacity=".7" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });
  const track = `M${x0 + 20} 30 H${W - 40}`;
  body += `<path d="${track}" stroke="${t.line}" stroke-width="3" stroke-linecap="round"/><circle r="7" fill="${t.a}"><animateMotion dur="8s" repeatCount="indefinite" path="${track}"/></circle>
<text x="${x0 + 20}" y="24" font-family="${t.font}" font-size="12" font-weight="800" letter-spacing="3" fill="${t.dim}" transform="translate(0 -2)">A QUESTION'S JOURNEY, TYPICALLY 2 TO 5 SECONDS</text>`;
  return wrap(W, H, css, body);
}

/* ---------- footer ---------- */
function footer(theme, line) {
  const t = T[theme];
  const W = 1280, H = 150;
  const css = `@keyframes wave{from{transform:translateX(0)}to{transform:translateX(-640px)}}@keyframes tw{0%,100%{opacity:.3}50%{opacity:1}}.w1{animation:wave 14s linear infinite}.w2{animation:wave 22s linear infinite reverse}`;
  const wavePath = (amp, y) => { let d = `M0 ${y}`; for (let i = 0; i < 6; i++) d += ` q160 ${-amp} 320 0 t320 0`; return d; };
  const body = `<rect width="${W}" height="${H}" rx="22" fill="${theme === 'v1' ? t.bg : t.card}" stroke="${t.line}" stroke-width="1.5"/>
<g clip-path="url(#fc)"><g class="w2" opacity=".5"><path d="${wavePath(26, 112)}" stroke="${t.b}" stroke-width="2.4" fill="none"/></g><g class="w1"><path d="${wavePath(20, 122)}" stroke="${t.a}" stroke-width="2.4" fill="none"/></g></g>
<text x="${W / 2}" y="62" font-family="${t.display}" font-size="30" font-weight="800" fill="${t.text}" text-anchor="middle" letter-spacing="-.5">${esc(line)}</text>
<text x="${W / 2}" y="90" font-family="${t.font}" font-size="15" fill="${t.dim}" text-anchor="middle">work@lakshpradhwani.com  /  lakshpradhwani.com</text>
${theme === 'v1' ? [...Array(14)].map((_, i) => `<circle cx="${60 + i * 90}" cy="${20 + (i * 37) % 30}" r="1.4" fill="${t.a}" style="animation:tw ${2 + (i % 4)}s ease-in-out ${i * 0.3}s infinite"/>`).join('') : ''}`;
  return wrap(W, H, css, body, `<clipPath id="fc"><rect width="${W}" height="${H}" rx="22"/></clipPath>`);
}

/* ---------- status row ---------- */
function status(theme, items) {
  const t = T[theme];
  const W = 1280, H = 54;
  let x = 0, body = '', css = `@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes ping{0%{r:4;opacity:.9}100%{r:13;opacity:0}}@keyframes shine{from{transform:translateX(-120px)}to{transform:translateX(400px)}}`;
  const pad = 22, gap = 12;
  const widths = items.map(([label]) => Math.round(label.length * 8.4 + pad * 2 + 18));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  x = (W - total) / 2;
  items.forEach(([label, col, live], i) => {
    const w = widths[i];
    css += `.b${i}{animation:up .6s ease-out ${i * 0.1}s both}`;
    body += `<g transform="translate(${x} 7)"><g class="b${i}"><rect width="${w}" height="40" rx="20" fill="${t.card}" stroke="${col}" stroke-width="1.8"/>
<circle cx="24" cy="20" r="4.5" fill="${col}"/>${live ? `<circle cx="24" cy="20" r="4" fill="none" stroke="${col}" stroke-width="2" style="animation:ping 1.8s ease-out infinite"/>` : ''}
<text x="40" y="25.5" font-family="${t.font}" font-size="14" font-weight="700" fill="${t.text}" textLength="${w - 62}" lengthAdjust="spacingAndGlyphs">${esc(label)}</text></g></g>`;
    x += w + gap;
  });
  return wrap(W, H, css, body);
}

/* ---------- build ---------- */
write('v1', 'banner.svg', banner1());
write('v1', 'divider.svg', divider('v1'));
write('v1', 'facts.svg', facts('v1', [['8', 'Sections', 'Home to Contact'], ['3', 'Service packages', 'on the /hire page'], ['PWA', 'Installable', 'manifest and service worker'], ['AI', 'Built-in chat', 'answers from real facts']]));
write('v1', 'stack.svg', stack('v1', [
  ['Front end', ['React 18', 'Vite 5', 'Tailwind CSS 3', 'Framer Motion', 'React Router 6', 'Lenis', 'AOS', 'Typed.js'], T.v1.a],
  ['3D and motion', ['Three.js', 'React Three Fiber', 'drei', 'React Parallax Tilt'], T.v1.b],
  ['Data and content', ['Axios', 'GitHub REST API', 'Last.fm API', 'React Markdown'], T.v1.c],
  ['Ship', ['Vercel', 'GitHub', 'Playwright checks', 'axe-core audits'], T.v1.d],
]));
write('v1', 'architecture.svg', arch1());
write('v1', 'status.svg', status('v1', [['Live at lakshpradhwani.com', T.v1.c, true], ['React 18', T.v1.a], ['Vite 5', T.v1.b], ['Tailwind 3', T.v1.a], ['Three.js', T.v1.d]]));
write('v1', 'footer.svg', footer('v1', 'Thanks for stopping by.'));

write('v2', 'banner.svg', banner2());
write('v2', 'divider.svg', divider('v2'));
write('v2', 'facts.svg', facts('v2', [['6', 'Projects in the work crate', 'live sites and open source'], ['8', 'Stops on the journey train', 'scroll-scrubbed'], ['17', 'Tools in the stack gift', 'unwrapped on scroll'], ['2', 'Themes, day and night', 'one switch, whole valley']]));
write('v2', 'stack.svg', stack('v2', [
  ['Front end', ['React 18', 'Vite 5', 'Tailwind CSS 3', 'Framer Motion', 'React Router 6', 'Lenis', 'React Markdown'], T.v2.a],
  ['Scenes and sound', ['Three.js avatar', 'painted .webp scenes', 'CSS scroll scrubbing', 'Web Audio fallback'], T.v2.b],
  ['Serverless', ['Vercel Functions', 'Upstash Redis', 'Express chat backend', 'Google Gemini'], T.v2.c],
  ['Quality', ['Playwright', 'axe-core', 'reduced-motion support', 'keyboard and screen reader paths'], T.v2.e],
]));
write('v2', 'architecture.svg', arch2());
write('v2', 'chat-flow.svg', flow2());
write('v2', 'status.svg', status('v2', [['Private repo, preview only', T.v2.a, true], ['React 18', T.v2.c], ['Vite 5', T.v2.b], ['Day and night', T.v2.d], ['AI Laksh chat', T.v2.e]]));
write('v2', 'footer.svg', footer('v2', "Let's build something people use."));
console.log('svgs written');
