# BUILD_LOG.md — Pressure (Lab B)

One entry per work session: date, tool, the prompt that mattered, what broke, time spent.

---

## Oct 14 — Session 1: setup

**Tool:** Claude Code (desktop app, Claude Opus 5.5)

**Prompt that mattered:** "Use my assignments from Lab A to now do Lab B, let's work through each step together, building out the repo."

**What happened:** Claude read the Lab A PDFs (GDD, concept log, evaluation, debt journal) and the Lab B brief, then asked me four decisions: the prototype slice (I chose precision dart vs. blunt cannon), the stack (Phaser 3 + Vite + TS), hosting (GitHub Pages) and the GDD source (Lab A, since I have no Rep 3). It scaffolded the repo, pinned versions, and wrote GDD.md, AGENTS.md, this log and a PROTOTYPE.md template.

**What broke:**
- Claude's built-in PDF reader returned no text for the five PDFs, so it extracted them with `pdftotext` instead. The GDD's two-column layout came out scrambled and had to be re-read in non-layout mode.
- The `npm` "latest" TypeScript is 7.x (the new native compiler), so we pinned 5.9.3 to avoid tooling surprises.
- The first build warned that the bundle was over 500 kB (that's just Phaser). We raised the warning limit instead of code-splitting.

**Time:** _fill in_
