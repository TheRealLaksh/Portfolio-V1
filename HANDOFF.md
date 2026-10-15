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
`npm run dev` / `npm run build` / `npm run lint`. Deploy = push to `main`. Short links (`/resume`, `/cv`, `/github`, `/linkedin`, `/instagram`) live in `vercel.json`. `netlify.toml` is a leftover (only holds the old `/resume` redirect); `autocommit.sh` is an old helper loop, not used by the hooks.

## Code map
- `index.html`: meta, og/twitter tags
- `src/components/sections/`: numbered page sections (`01-Hero.jsx`, `06-Resume.jsx`, `08-Contact.jsx` ...)
- `src/components/layout/`: `Footer.jsx`, `SocialSidebar.jsx`
- `src/components/chat/`: chat UI (`ChatCards.jsx`)
- `public/`: icons, manifest, `sw.js`, `me.webp`
- `public/signature/`: images used in Laksh's Gmail signatures, hosted at https://lakshpradhwani.com/signature/<file>. `icon-linkedin.png`, `icon-github.png`, `icon-instagram.png` (36x36, white Simple Icons glyph on black circle) are the live signature icons. `lp-logo.png` is no longer in the signature but is kept because older sent emails reference it. Do not move or delete these or the signature images break.

## Status
**Valley redesign in progress on branch `feat/world-portfolio` (cut from `main` on 15 Oct 2026, worktree `..\Portfolio-V2-world`, previews on branch pushes; `main` and the live site are untouched).** Laksh's reference is https://www.jameschugh.com/ (an illustrated "valley" you fly into, journey map, work cards, tool box, desk of movable things, guestbook wall, hotkey contact). Decision (15 Oct 2026): recreate its structure and interaction patterns, but every illustration, word and logo is original: hand-built SVG art, Laksh's own copy and facts, no AI images, no invented numbers. The new site lives in `src/world/` and is mounted at `/` in `src/App.jsx` (outside the classic `Layout`); the previous home page is kept at `/classic`, `/hire` is unchanged. Not yet verified: real devices, Safari, and performance on low-end phones. Needs Laksh: Vercel storage for the wall/counter (see Next steps), real work screenshots, a booking link.

**Hire page is LIVE at https://lakshpradhwani.com/hire (merged to `main` and deployed 13 Oct 2026, commit `b03f2c5`).** The redesign branch `feat/skyline-world` is still separate and unmerged. `/hire` is a client-facing page: intro with WhatsApp and email actions, the three packages, recent work (Profiley, Helios, Calibridge), a three-step "how it starts", the stack, and a closing call to action. The packages live in one file, `src/data/packages.js` (also holds `CONTACT`, `whatsappLink`, `mailLink`, `featuredWork`, `stack`), and are shown by the shared `src/components/ui/PackageCard.jsx` on both `/hire` and the homepage Services section. Prices are starting prices in rupees: Business Website + CMS 30,000, AI Features + Automation 55,000, Custom Web App 75,000, matching LinkedIn's Services page and the Google Business Profile (starter 15,000, multi-page 30,000, custom 75,000). Keep all four in step. The old `/booking` page was a demo (made-up slots, fake "Booking Confirmed!", dollar prices); it is gone and `/booking` and `/bookings` redirect to `/hire`.

**14 Oct 2026 bug-fix pass on /hire (nine fixes, all live and re-tested on production with Playwright + axe-core):** own head/canonical/link-preview tags, section links from /hire, direct `/#hash` links, mobile Hire me icon, chat teaser, sidebar overlap, preloader skipped off-home, reduced motion, contrast and keyboard/landmark fixes. Details in the session log.

Migrating off the expired lakshp.live. URLs (meta tags, `/resume` redirect, resume link) now use lakshpradhwani.com. The contact address is now `work@lakshpradhwani.com` (Cloudflare Email Routing forwards it to Laksh's Gmail). Remaining: the resume PDF. `npm run build` was not run: `node_modules` is not installed in this folder (run `npm ci` first).

## Next steps
A. Valley redesign (branch `feat/world-portfolio`): (1) give the wall and visitor counter a store: add an Upstash Redis integration to the `portfolio-v2-llp` Vercel project (env `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, or `KV_REST_API_URL` + `KV_REST_API_TOKEN`) and a `WALL_ADMIN_TOKEN` to delete notes; until then `/api/wall` and `/api/visit` return 503 and the page hides the counter and shows "the wall is warming up". (2) Capture real screenshots of the live work sites into `public/work/<id>.webp` (cards fall back to a placeholder if missing). (3) Confirm the items marked "(confirm)" in `src/world/data.js` (nationals year, tool list, boarding-pass route, which sites to show). (4) Real booking link in `ME.book`. (5) Test on a real phone and Safari; run axe. (6) Merge to `main` only on Laksh's say-so; then update sitemap/meta for `/` and decide Varanasi vs Delhi NCR wording. (7) Later: a Topmate-style booking page (Laksh's request, modelled on topmate.io/jameschughh).
00. After the 14 Oct fixes: in Search Console use URL Inspection on `https://lakshpradhwani.com/hire` and Request indexing (it was canonicalised to the home page until today); re-run the Rich Results Test on it; refresh the LinkedIn preview with the Post Inspector (https://www.linkedin.com/post-inspector/) and re-share the link in WhatsApp to see the new card. Optionally give `/hire` its own 1200x630 OG image (`og-image.jpg` is the home hero crop).
0. Hire page: add a real booking link once Laksh creates a Google Calendar appointment schedule (put it in `CONTACT` and add a "Book a call" button on `/hire`); add two case studies. When `feat/skyline-world` is merged later, expect conflicts in `src/App.jsx` (routes), `src/components/sections/07-Services.jsx`, `Navbar.jsx`, `MobileNavbar.jsx`, `index.html` and `vercel.json`: keep the Hire page, the `/hire` route and the shared `packages.js` data.
1. Regenerate `src/assets/resume/laksh.pradhwani.resume.pdf`: it contains the link `https://www.lakshp.live/` (export again from Profiley once its default portfolio link is updated).
2. Optionally replace `public/og-image.jpg` with a designed 1200x630 image (the current one is a cropped screenshot of the hero).

## Open questions / waiting on
- Location: the footer (every page, including /hire), `index.html`, the hero and the JSON-LD still say Varanasi while /hire says Delhi NCR: a visible mismatch on the page itself. LinkedIn, Google Business Profile and `/hire` now say Delhi NCR, but `index.html` (title, descriptions, JSON-LD address, noscript), the hero and the footer still say Varanasi. Needs Laksh's decision before changing the site-wide text.
- Mail forwarding is verified: test mails to work@ and me@ showed "Forwarded" in Cloudflare's activity log on 9 Oct 2026.

## Decisions not to undo
- Valley site (`src/world/`): scene art is hand-built SVG with CSS-variable palettes (day/night); never replace it with AI-generated images. Hero fly-in uses `position: sticky` and needs `html.world-on` (set in `World.jsx`) to clip instead of hide horizontal overflow. No word-by-word scroll-fill text; reveals are one-time. The generative music in `src/world/audio.js` is original (Web Audio), no samples. The wall stores the poster's email but never returns it from the API.
- Domain is lakshpradhwani.com (Hostinger, bought 8 Oct 2026). Do not reintroduce lakshp.live.
- Public contact address is `work@lakshpradhwani.com`; `me@` is for personal use.
- Laksh chose small commits, pushed after each (every push to `main` goes live on Vercel). Session of 8 Oct 2026.

## Session log (newest first)
- 2026-10-15: started the valley redesign on `feat/world-portfolio`: added `src/world/` (data, hooks, Web Audio music, hand-drawn SVG scene, hero with scroll fly-in and clickable places, nav bar with day/night and music, story, journey map, work cards, websites + packages, Profiley section, tool box, process, desk of movable things, guestbook wall, hotkey contact), `api/wall.js` + `api/visit.js` (Upstash REST), web fonts in `index.html`, and routes in `App.jsx` (`/` is the valley, `/classic` the old home). Checked with headless Chromium at 1280x720 and 390x844: sections render, no sideways scroll on mobile, place sheets and the journey/work dialogs open.
- 2026-10-14: About section terminal card now says Freelance Full-Stack Developer and adds the Masters' Union line; the location radar says Delhi NCR (Delhi coordinates). Footer, Contact, hero, `index.html`, `routeMeta.js` and JSON-LD still say Varanasi: site-wide change still waiting on Laksh.
- 2026-10-14: About section bio (`02-About.jsx`) rewritten with current facts: freelance full-stack developer in Delhi NCR, B.Tech Data Science & AI at Masters' Union, four production apps at Unified Mentor (Helios, Calibridge), link to `/hire`; 'high school student' and 'seeking' wording removed. ShiftsDeal left out of the text on purpose (same call as the LinkedIn About). Plaksha/Outskill kept from the original text (not in the vault, confirm).
- 2026-10-14: Production check after the nine fixes: `curl` shows /hire with its own title and canonical and the home page unchanged; Playwright on the live site (nav, footer, direct hash, chat chip, mobile nav at 390/360/320 px, teaser gone after 12 s, sidebar clear at 1024/1280, no preloader on /hire, home still has it) all pass; axe-core 0 violations on desktop. Still open: Varanasi vs Delhi NCR wording, a real booking link, case studies.
- 2026-10-14: Fix 9 (structure for keyboard and screen readers). Chat teaser was a role=button wrapping a second button (nested interactive); it is now a text button plus a separate dismiss button. Added a 'Skip to content' link (first Tab stop, jumps to `main#main-content`), the social sidebar is an `aside` with a label, the 3D background is aria-hidden, and nav links use real `/#section` hrefs.
- 2026-10-14: Fix 8 (contrast, axe-core). White text on the sky-600 WhatsApp buttons was 4.09:1 (needs 4.5): buttons on /hire are now sky-700 (hover sky-600). Small grey labels (the 'from' price label, project kinds, LinkedIn/GitHub links, 'Built with') moved from slate-500/600 to slate-400. axe-core on the local build now reports 0 violations on desktop; at 390 px it only lists a moderate 'skip-link' heuristic about the mobile nav anchors.
- 2026-10-14: Fix 7 (reduced motion). Nothing respected `prefers-reduced-motion`: the three package buttons spin a huge gradient layer forever, dots ping, Reveal slides in. Added a global reduced-motion block in `src/index.css`, `<MotionConfig reducedMotion="user">` in `main.jsx`, and Lenis `smoothWheel` off in `App.jsx` when the device asks for it. Checked: animation 0.01 ms with it on, still 2 s infinite with it off; content still appears.
- 2026-10-14: Fix 6 (preloader). A visitor landing on /hire first sat through the home page's 'INITIALIZING SYSTEM' preloader (about 4 s of black screen). `Layout.jsx` now only starts the preloader on `/` and not when the device asks for reduced motion; /hire shows its content in about 0.3 s. Decision: the preloader stays as the home page's intro.
- 2026-10-14: Fix 5 (sidebar overlap). The fixed social sidebar (x 32 to 72) sat on top of the WhatsApp button and body text on /hire below about 1250 px wide (iPad, small laptops). It now shows from the xl breakpoint (1280 px) up, where it clears the content column; below that the footer and the closing call to action already carry the same links. Same change applies to the home page.
- 2026-10-14: Fix 4 (chat teaser). On phones the 'Ask AI Laksh!' bubble is fixed at the top right and never left, so it covered the location chip, package buttons and the closing call to action. It now shows after 3 s, disappears after 12 s, and appears once per browser session (sessionStorage, wrapped in try/catch). Chat controls (open/close, expand, send, dismiss, input) got aria-labels.
- 2026-10-14: Fix 3 (mobile nav). The Hire me icon sat past the right edge of the bottom pill on a 390 px phone (clipped) and off-screen on 320 px. Icons are tighter (px-2.5, gap-0.5) so all nine fit from 360 px up; on narrower phones the pill scrolls and now brings the current page's icon into view. Every icon link has an aria-label and the current section/page gets aria-current; footer social icons have names too (LinkedIn link now uses www).
- 2026-10-14: Fix 2 (section navigation). Footer Quick Links did nothing on /hire (plain #anchors), a direct visit to /#services stayed at the top, and the chat's Services and Projects chips did nothing on /hire. Now one hook `src/hooks/useSectionNav.js` (go to a home section from anywhere) is used by Navbar, MobileNavbar, Footer and ChatWidget, and `src/components/layout/ScrollManager.jsx` (inside ReactLenis) owns scroll-after-navigation: top when there is no hash, otherwise waits for the element, scrolls, and corrects once. Home.jsx and App.jsx no longer scroll on their own. /hire sections have ids (`packages`, `work`, `how-it-starts`, `contact`) so /hire#packages works; on /hire the chat's Services chip scrolls to the packages. Footer has a Hire me link. Verified on a local build with Playwright.
- 2026-10-14: /hire bug-fix pass (live site tested with Playwright at 1440/1024/800/768/390/360/320 px). Fix 1: `/hire` was served with the HOME page's head (canonical pointed at `/`, og/twitter tags said Varanasi), so Google could treat it as a duplicate and link previews were wrong. Now `vite.config.js` has a `hire-static-html` plugin that writes `dist/hire/index.html` (own title, description, canonical, og/twitter, WebPage + BreadcrumbList JSON-LD, no-JS text) from `src/data/routeMeta.js`; `vercel.json` rewrites `/hire` to it; `src/hooks/usePageMeta.js` applies the same values at runtime and restores the HOME values on exit. After deploy: re-check with `curl https://lakshpradhwani.com/hire`, then re-run the Rich Results Test and ask Search Console to re-index `/hire`.
- 2026-10-13: merged `feat/hire-page` into `main` (fast-forward, `68cb93d` to `b03f2c5`) at Laksh's request and pushed; Vercel production deployment `dpl_7XLB3b1kuUwhHttt1oZQGLRHZ5YF`. Checked live with Playwright: `/hire` returns 200 with title "Hire Laksh Pradhwani | Websites, admin panels and AI features", the new prices show on `/hire` and on the homepage Services section (old prices gone), `/booking` redirects to `/hire`, and the sitemap lists `/hire`. Still to do after this: re-run the Schema Markup Validator and Rich Results Test on the live page, and ask Google Search Console to index `/hire`.
- 2026-10-13: added a "Hire me" link (handshake icon, sky accent, after a divider) to `Navbar.jsx` and `MobileNavbar.jsx`; it highlights on `/hire`. Checked in a browser: tapping it works on desktop and on a 390 px phone, `/booking` redirects to `/hire`, and the nav's Home link from `/hire` returns to the home page.
- 2026-10-13: `PackageCard` inner wrapper is now a flex column so the action buttons sit at the same height in all three columns (they did not on the old Services section either, because the wrapper was a plain block). Verified: button tops equal at 1440 px.
- 2026-10-13: `index.html` JSON-LD `makesOffer` now names the same three services as the page (Business Website + CMS, AI Features + Automation, Custom Web App) instead of Digital Identity / Business Growth / Custom System; no prices in the markup. JSON parses; `dateModified` set to 2026-10-13. Re-run the Schema Markup Validator and Rich Results Test after this reaches `main`.
- 2026-10-13: built `/hire` (`src/pages/Hire.jsx`) on branch `feat/hire-page`: sets its own tab title and description, `usePageMeta`; WhatsApp link prefilled per package (`wa.me/918433364186`); added `/hire` to `public/sitemap.xml`; deleted `src/components/sections/Booking.jsx` (demo) and redirected `/booking`, `/bookings` to `/hire`. Moved the packages into `src/data/packages.js` with the new prices and a reusable `PackageCard`; the homepage Services section now uses them (the old Rs 3,499 / 8,999 / 17,999 packages, the MOST POPULAR badge and the free-maintenance promises are gone) and links to `/hire`. Checked with Playwright at 1440 and 390 px: no sideways scroll; the only failed request is Vercel's analytics script, which exists only on Vercel. `npm install --no-package-lock` in the worktree `..\Portfolio-V2-hire`.
- 2026-10-11: validated the live markup: Schema Markup Validator 0 errors / 0 warnings; Google Rich Results Test "Profile page: 1 valid item detected" (item "Laksh Pradhwani", crawled 11 Oct 22:27 IST); Search Console URL Inspection says the home page is indexed, and "Request indexing" was submitted so Google re-crawls the new markup. The sitemap still said "Couldn't fetch" (files return 200 to a Googlebot user agent; normal for a new sitemap, recheck). Google decides what to show: structured data does not guarantee a knowledge panel or any rich result.
- 2026-10-11: added a `<noscript>` block to `index.html` with a plain-HTML summary (name, one-line description, GitHub, LinkedIn, Instagram, work@ email) for crawlers and browsers without JavaScript. It sits beside `#root`, not inside it, so React is unaffected. Keep it in step with the hero text.
- 2026-10-11: added schema.org JSON-LD to the `<head>` of `index.html` (one `@graph`: `WebSite`, `ProfilePage`, `ImageObject`, `Person`). Person has name, jobTitle "Full-Stack Web Developer", description, public email `work@lakshpradhwani.com`, city-level address (Varanasi, Uttar Pradesh, IN), `sameAs` (LinkedIn, GitHub, Instagram laksh.pradhwani), `knowsAbout` and `makesOffer` for the three services shown in the Services section. The image is `public/me.webp`, byte-identical to the About photo (`src/assets/images/laksh.pradhwani.webp`). Deliberately left out: date of birth, family, school names, phone, street address, and the employers/education that are only on LinkedIn (ShiftsDeal, Masters' Union): add them only once the page itself shows them, because Google ignores markup that doesn't match visible content. Keep `dateModified` current when the content changes. Validate with https://validator.schema.org/ and https://search.google.com/test/rich-results.
- 2026-10-11: `index.html` head cleaned up for search: title "Laksh Pradhwani | Full-Stack Web Developer in Varanasi" (54 chars), meta description (149 chars), canonical to the home page, robots with `max-image-preview:large`, `og:site_name`/`og:locale`/image size and alt, Twitter tags switched from `property` to `name`, og/twitter titles now match the page title (they said "Software Engineer"), and the favicon links fixed (the icon was declared as SVG but is a PNG; added the 192px icon, since Google wants favicon sizes in multiples of 48). The canonical is static, so every route (for example `/booking`) names the home page as canonical.
- 2026-10-11: Instagram links in `01-Hero.jsx`, `SocialSidebar.jsx` and `ChatCards.jsx` now point to the current handle `laksh.pradhwani` (they still used the old `_.lakshp`), matching the `/instagram` short link.
- 2026-10-11: Vercel Web Analytics enabled for `portfolio-v2-llp` (Hobby: 50,000 events/month, 30 days of history, no cookies) and its script added to `index.html` (no npm package, so `package-lock.json` is untouched). View it at Vercel → portfolio-v2-llp → Analytics. The service worker ignores the POSTs it sends. Not enabled on the other Vercel projects (profiley, music, calibridge).
- 2026-10-11: Google Search Console domain property `lakshpradhwani.com` verified with a TXT record in Cloudflare (`google-site-verification=...` on the root; never delete it or verification is lost) and `https://lakshpradhwani.com/sitemap.xml` submitted. Search Console showed "Couldn't fetch" right after submission (common for new properties, the file returns 200); recheck in a day. Bing Webmaster not done (needs a Microsoft sign-in).
- 2026-10-11: added `public/robots.txt` (allow all, points at the sitemap) and `public/sitemap.xml` (home page only; add routes here if more public pages appear) ahead of Google Search Console and Bing Webmaster verification.
- 2026-10-11: short links in `vercel.json` (temporary 302 redirects so targets can change): `/resume` and `/cv` to https://profiley.lakshpradhwani.com/laksh, `/github`, `/linkedin`, `/instagram` (laksh.pradhwani). This also settles the open question about `/resume` on Vercel. `/book` is not added yet (no booking page exists).
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

_Refreshed 15 Oct 2026, 2:51 pm IST by `scripts/handoff.mjs` (runs on every commit). Don't edit inside this block._

Branch: `feat/world-portfolio` · remote: https://github.com/TheRealLaksh/Portfolio-V2.git

### Last 15 commits

- `2a7b35a` 2026-10-15 14:51 Add the valley sections: story, journey map, work, tools, desk, wall, contact
- `c88d590` 2026-10-15 14:51 Add the valley hero: SVG scene, scroll fly-in, places and nav bar
- `d471855` 2026-10-15 14:51 Add valley portfolio data, hooks, generative music and icons
- `09358a8` 2026-10-14 12:14 Show current role, study and Delhi NCR in the About cards
- `8d1b7b9` 2026-10-14 12:13 Update the About bio with current role, study and freelance work
- `7400fc0` 2026-10-14 10:15 Record the Hire page bug-fix pass in HANDOFF
- `5582902` 2026-10-14 10:09 Add a skip link and fix nested controls and landmarks
- `00b0a9b` 2026-10-14 10:09 Raise text contrast on the Hire page to WCAG AA
- `be7cceb` 2026-10-14 10:07 Respect the reduced-motion setting
- `0a0d812` 2026-10-14 10:06 Skip the preloader on /hire and for reduced-motion visitors
- `4d038d4` 2026-10-14 10:05 Hide the social sidebar where it overlaps the page content
- `7ac7e03` 2026-10-14 10:04 Stop the chat teaser from covering the page on phones
- `f4e9e1e` 2026-10-14 10:04 Keep the Hire me icon visible in the mobile nav and name the icon links
- `a46055f` 2026-10-14 10:02 Make section links work from /hire and on direct #links
- `ac238ef` 2026-10-14 09:56 Give /hire its own title, canonical and link-preview tags

### Uncommitted changes at refresh time

```
A  api/_redis.js
A  api/visit.js
A  api/wall.js
 M index.html
 M src/App.jsx
```
<!-- handoff:auto:end -->
