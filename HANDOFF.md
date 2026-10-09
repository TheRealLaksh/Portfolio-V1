# Portfolio V1: handoff

## Project in one paragraph

Laksh Pradhwani's first personal portfolio (Jul 2025, built Nov-Dec 2024 per LinkedIn): a single-page, dark, starfield-background site (Tailwind CSS, vanilla JS, HTML5 canvas constellation, a Netlify Function that proxies the Google Gemini API for a chatbot). Now a retired "v1"; the current portfolio is Portfolio V2. Owner and only contributor: Laksh.

## Links

- Live: https://v1-laksh.netlify.app (the old `v1.lakshp.live` is gone with the lakshp.live domain)
- Repo: https://github.com/TheRealLaksh/Portfolio-V1
- Local: `C:\Users\laksh\OneDrive\Documents\Personal Projects\Portfolio-V1`
- LinkedIn project entry: Profile > Projects > "Portfolio (v1)"
- Vault note: `Obsidian Vault\02 Projects\Past Projects (2025).md`

## Stack, run, deploy

- Static HTML/CSS/JS, Tailwind (`assets/css/output.css`), Netlify Functions in `netlify/functions/` (`ai.js`, `laksh.json`).
- Run: open `index.html` or any static server. No build step needed for the page itself.
- Deploy: push to `main`; Netlify project `v1-laksh` auto-deploys. **Netlify builds are paused until credits reset on 26 Oct 2026**, so pushes may not go live until then.

## Code map

- `index.html`: the whole page, including SEO/preview meta tags in `<head>`.
- `404.html`, `sitemap.xml`, `robots.txt`: still reference `www.lakshp.live`.
- `assets/images/og-image.png`: link-preview image (1200x627 hero screenshot). `meta-image.webp` is the old one (a photo), now unused.
- `scripts/handoff.mjs`, `.githooks/pre-commit`, `.claude/settings.json`: HANDOFF.md automation.

## Status

- Link-preview fix done in code and pushed: `og:url`, `canonical`, `twitter:url` now `https://v1-laksh.netlify.app/`; `og:image` and `twitter:image` now `.../assets/images/og-image.png`.
- Not live yet until Netlify can build (credits). Verify with `curl -s https://v1-laksh.netlify.app/ | grep og:image` after a deploy.
- LinkedIn "Portfolio (v1)" project currently has the hero screenshot as its uploaded image and **no link item** (the old link item was deleted because its thumbnail was Laksh's photo).

## Next steps

1. When a deploy goes live (credits reset 26 Oct, or a manual deploy), confirm the new `og:image` is served.
2. Refresh LinkedIn's cache (Post Inspector: https://www.linkedin.com/post-inspector/ for `https://v1-laksh.netlify.app/`).
3. Re-add the link to LinkedIn: Projects > Portfolio (v1) > Add media > Add a link > `https://v1-laksh.netlify.app/`. Keep the uploaded image as the first media item.
4. Optionally replace remaining `lakshp.live` references in `404.html`, `sitemap.xml`, `robots.txt`, `netlify/functions/laksh.json`.

## Open questions

- Should the leftover `lakshp.live` references (404, sitemap, robots, laksh.json) be moved to the Netlify URL too?

## Decisions not to undo

- Preview image is a clean hero screenshot, not a photo of Laksh (he asked for the photo to be removed from the LinkedIn v1 entry).
- Canonical and og:url point at the Netlify URL because the lakshp.live domain no longer resolves; LinkedIn follows `og:url`.

## Session log (newest first)

- 2026-10-09: Cloned the repo; added `assets/images/og-image.png`; switched og/twitter/canonical tags from dead lakshp.live to v1-laksh.netlify.app; set up HANDOFF.md, Stop hook, pre-commit hook and CLAUDE.md; LinkedIn project thumbnail replaced.

<!-- handoff:auto:start -->
## Auto: repo state

_Refreshed 9 Oct 2026, 7:46 pm IST by `scripts/handoff.mjs` (runs on every commit). Don't edit inside this block._

Branch: `main` · remote: https://github.com/TheRealLaksh/Portfolio-V1.git

### Last 15 commits

- `e40a824` 2026-10-09 19:46 Point link-preview tags at live Netlify URL and new og-image
- `e2944d6` 2026-10-09 19:45 Add og-image.png: hero screenshot for link previews
- `5009317` 2025-12-14 16:46 Update script.js
- `face3fe` 2025-12-03 14:16 ai bot
- `8c66af0` 2025-11-29 15:55 repo update
- `bd279bf` 2025-11-29 15:37 repo update
- `2218efa` 2025-11-29 02:23 Update script.js
- `cb2539f` 2025-11-20 17:23 Fix Netlify path issue
- `aa7aeba` 2025-11-20 17:16 Fix Netlify path issue
- `eb67ec8` 2025-11-20 17:10 Fix Netlify path issue
- `2ff115f` 2025-11-20 17:07 Fix Netlify path issue
- `3f9f3de` 2025-11-20 17:01 Fix Netlify path issue
- `5c7d9ad` 2025-11-20 16:59 Fix Netlify path issue
- `f50252e` 2025-11-20 16:56 Fix Netlify path issue
- `84ad03a` 2025-11-20 16:54 Fix Netlify path issue

### Uncommitted changes at refresh time

```
A  .claude/settings.json
A  .githooks/pre-commit
A  CLAUDE.md
A  scripts/handoff.mjs
```
<!-- handoff:auto:end -->
