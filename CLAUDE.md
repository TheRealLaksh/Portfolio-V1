@HANDOFF.md

# Working on Portfolio V1

- `HANDOFF.md` (imported above) is the project's memory across sessions. Start from it.
- **After every change, update `HANDOFF.md` before replying**: Status, Next steps, Open questions, Decisions, and a dated
  line in the Session log. Never edit inside the `handoff:auto` block; `scripts/handoff.mjs` rewrites it on each commit.
- A Stop hook (`.claude/settings.json`) blocks finishing a turn if project files are newer than `HANDOFF.md`.
- Git hooks live in `.githooks/` (`git config core.hooksPath .githooks`; re-run after a fresh clone).
- Static site (no build step). Deploy = push to `main`; Netlify (`v1-laksh`) auto-deploys, but Netlify builds are paused until the credits reset on 26 Oct 2026.
- Laksh's vault note: `C:\Users\laksh\OneDrive\Documents\Obsidian Vault\02 Projects\Past Projects (2025).md`.
