import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { SITE, HIRE_META, hireNoscript, hireJsonLd } from './src/data/routeMeta.js'

const escapeAttr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

// Writes dist/hire/index.html: the built index.html with /hire's own title, description,
// canonical, social tags, structured data and no-JS text. Without it the server answers /hire
// with the home page's head, so Google sees /hire as a copy of the home page (its canonical
// pointed there) and link previews on LinkedIn or WhatsApp show the home page. The page body
// is still rendered by React, so the same script and style tags work unchanged.
const hireStaticHtml = () => ({
  name: 'hire-static-html',
  apply: 'build',
  closeBundle() {
    const outDir = path.resolve('dist');
    const source = path.join(outDir, 'index.html');
    if (!fs.existsSync(source)) return;

    const url = `${SITE}${HIRE_META.path}`;
    const meta = HIRE_META;
    const swap = (html, pattern, replacement) => {
      if (!pattern.test(html)) throw new Error(`hire-static-html: tag not found in index.html: ${pattern}`);
      return html.replace(pattern, () => replacement);
    };

    let html = fs.readFileSync(source, 'utf8');
    html = swap(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(meta.title)}</title>`);
    html = swap(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeAttr(meta.description)}" />`);
    html = swap(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
    html = swap(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
    html = swap(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeAttr(meta.title)}" />`);
    html = swap(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeAttr(meta.ogDescription)}" />`);
    html = swap(html, /<meta property="og:image:alt" content="[^"]*"\s*\/?>/, `<meta property="og:image:alt" content="${escapeAttr(meta.imageAlt)}" />`);
    html = swap(html, /<meta name="twitter:url" content="[^"]*"\s*\/?>/, `<meta name="twitter:url" content="${url}" />`);
    html = swap(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`);
    html = swap(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeAttr(meta.ogDescription)}" />`);
    html = swap(html, /<meta name="twitter:image:alt" content="[^"]*"\s*\/?>/, `<meta name="twitter:image:alt" content="${escapeAttr(meta.imageAlt)}" />`);
    // The home page's Person / WebSite markup stays on the home page; /hire gets its own WebPage markup.
    html = swap(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(hireJsonLd)}</script>`);
    html = swap(html, /<noscript>[\s\S]*?<\/noscript>/, `<noscript>\n    ${hireNoscript}\n  </noscript>`);

    const targetDir = path.join(outDir, 'hire');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), html);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), hireStaticHtml()],
  server: {
    // FIX: Removed unused 'proxy' config since hooks now use absolute URLs/Env Vars.
    // Added 'host: true' to expose the server to your local network for mobile testing.
    host: true,
    port: 5173,
  }
})
