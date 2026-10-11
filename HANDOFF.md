# Portfolio-V2 handoff

## Project
Laksh Pradhwani's personal developer portfolio (v2): React + Vite single-page app with scroll-driven motion, Three.js visuals and an AI chat assistant. Owner and only developer: Laksh. Public audience: recruiters, clients, college.

## Links
- Live: https://lakshpradhwani.com (www redirects here). Old domain lakshp.live is expired and dead.
- Repo: https://github.com/TheRealLaksh/Portfolio-V2 (push to `main` auto-deploys on Vercel, project `portfolio-v2-llp`)
- Local: `C:\Users\laksh\OneDrive\Documents\Personal Projects\Portfolio-V2`
- Chatbot backend: `..\Portfolio-Chat_Bot` (separate repo and Vercel project)
- Obsidian: `02 Projects\Personal\Portfolio V2.md`, domain audit `05 Resources\lakshp.live Usage Audit.md`, domains `05 Resources\Domains.md`

## Stack, run, deploy
React, Vite, Tailwind, Framer Motion, React Three Fiber, Lenis, AOS, react-router.
`npm run dev` / `npm run build` / `npm run lint`. Deploy = push to `main`. `netlify.toml` is a leftover (only holds the `/resume` redirect); `autocommit.sh` is an old helper loop, not used by the hooks.

## Code map
- `index.html`: meta, og/twitter tags
- `src/components/sections/`: numbered page sections (`01-Hero.jsx`, `06-Resume.jsx`, `08-Contact.jsx` ...)
- `src/components/layout/`: `Footer.jsx`, `SocialSidebar.jsx`
- `src/components/chat/`: chat UI (`ChatCards.jsx`)
- `public/`: icons, manifest, `sw.js`, `me.webp`
- `public/signature/`: images used in Laksh's Gmail signatures, hosted at https://lakshpradhwani.com/signature/<file>. `icon-linkedin.png`, `icon-github.png`, `icon-instagram.png` (36x36, white Simple Icons glyph on black circle) are the live signature icons. `lp-logo.png` is no longer in the signature but is kept because older sent emails reference it. Do not move or delete these or the signature images break.

## Status
Migrating off the expired lakshp.live. URLs (meta tags, `/resume` redirect, resume link) now use lakshpradhwani.com. The contact address is now `work@lakshpradhwani.com` (Cloudflare Email Routing forwards it to Laksh's Gmail). Remaining: the resume PDF. `npm run build` was not run: `node_modules` is not installed in this folder (run `npm ci` first).

## Next steps
1. Regenerate `src/assets/resume/laksh.pradhwani.resume.pdf`: it contains the link `https://www.lakshp.live/` (export again from Profiley once its default portfolio link is updated).
2. Optionally replace `public/og-image.jpg` with a designed 1200x630 image (the current one is a cropped screenshot of the hero).

## Open questions / waiting on
- Mail forwarding is verified: test mails to work@ and me@ showed "Forwarded" in Cloudflare's activity log on 9 Oct 2026.

## Decisions not to undo
- Domain is lakshpradhwani.com (Hostinger, bought 8 Oct 2026). Do not reintroduce lakshp.live.
- Public contact address is `work@lakshpradhwani.com`; `me@` is for personal use.
- Laksh chose small commits, pushed after each (every push to `main` goes live on Vercel). Session of 8 Oct 2026.

## Session log (newest first)
- 2026-10-11: added `vercel.json` with an SPA rewrite on `main` (same file as on `feat/skyline-world`) so deep links like `/booking` stop returning 404 on Vercel. When merging the redesign branch expect an add/add conflict on `vercel.json`; keep `main`'s version (it gains the short-link redirects).
- 2026-10-09: removed `Shopping-demo` from `REPO_NAMES` in `src/hooks/useGitHub.js` (the repo is now private, so the GitHub API would 404 for it).
- 2026-10-09: replaced `public/og-image.jpg` with a hero crop captured while the headline reads "a Web Developer" (the first version showed "a Passionate Learner").
- 2026-10-09: added `public/signature/icon-{linkedin,github,instagram}.png` for the new Gmail signature (logo removed from the signature at Laksh's request).
- 2026-10-09: added `public/og-image.jpg` (1200x630 crop of the live hero); `index.html` already pointed at it, so link previews (LinkedIn, WhatsApp, X) now have an image instead of a 404.
- 2026-10-09: added `public/signature/lp-logo.png` (opaque version of `icon-192.png`) to host the logo for the Gmail signature on the new domain.
- 2026-10-09: replaced `contact@lakshp.live` with `work@lakshpradhwani.com` in `08-Contact.jsx`, `01-Hero.jsx`, `Footer.jsx`, `SocialSidebar.jsx`, `ChatCards.jsx`. Domain DNS moved to Cloudflare (nameservers george/ruth.ns.cloudflare.com); MX + SPF live; work@ and me@ forward to Gmail.
- 2026-10-08: replaced lakshp.live with lakshpradhwani.com in `index.html` (og/twitter), `netlify.toml` and `06-Resume.jsx`; emails and resume PDF still pending.
- 2026-10-08: added HANDOFF.md and the handoff hooks (Stop hook, pre-commit, `scripts/handoff.mjs`).

<!-- handoff:auto:start -->
## Auto: repo state

_Refreshed 11 Oct 2026, 9:58 pm IST by `scripts/handoff.mjs` (runs on every commit). Don't edit inside this block._

Branch: `main` · remote: https://github.com/TheRealLaksh/Portfolio-V2.git

### Last 15 commits

- `5b18fc7` 2026-10-09 13:40 Drop the private Shopping-demo repo from the GitHub project list
- `afa14ab` 2026-10-09 13:15 Use the Web Developer hero frame for og-image
- `21ba901` 2026-10-09 13:04 Add social icons for the email signature
- `8966bdf` 2026-10-09 01:07 Add the missing og-image for link previews
- `4c1deb1` 2026-10-09 00:59 Host the LP logo for the email signature
- `2d7b824` 2026-10-09 00:32 Use work@lakshpradhwani.com as the contact address
- `f536175` 2026-10-08 23:58 Point site URLs at lakshpradhwani.com
- `b2507a1` 2026-10-08 23:57 Add HANDOFF.md and handoff hooks
- `8355d36` 2026-05-19 12:59 Update chatbot hook endpoint linkage
- `76936c9` 2026-02-01 17:41 update
- `45e3901` 2026-01-25 07:46 fixes
- `080e1b9` 2026-01-25 07:38 fix
- `2b018d6` 2026-01-25 07:25 fixes
- `32713d4` 2026-01-25 07:21 mobile layout fix
- `463e602` 2026-01-21 09:00 Update 08-Contact.jsx

### Uncommitted changes at refresh time

```
M  HANDOFF.md
A  vercel.json
```
<!-- handoff:auto:end -->
