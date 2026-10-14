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

---

## Oct 14 — Session 2: core loop, then rework after my first playthrough

**Tool:** Claude Code (desktop app, Claude Opus 5.5)

**Prompt that mattered:** "Enemies do not move in chains like centipede, there is no explanation on goals, functions, or how it works... what is the win condition?" Claude didn't just add a popup. It pointed out that a full color legend would answer my own prototype question for the player, and suggested making the legend the 1/2 variant instead.

**What happened:**
- First build: swarm, dart/cannon, breeding between seasons, a 24-parameter tuning panel, telemetry with T export. I played it at localhost:5173.
- My notes: no chains, no explanation, behaviors look the same, goal unclear.
- Decisions I made: the win is **Domestication**, where only non-hostile bugs survive (my choice, not Claude's suggested "breeding floor"). The variant is **legend hidden (V1) vs. shown (V2)**.
- Rework: real Centipede chains (followers trace the head's path, and a mid-chain kill splits the chain), per-trait behaviors (hostile bugs chew nodes, hunters break off and chase), the briefing popup, a live "escaped this season" tracker, +/- score popups for hostile/docile kills, and the dart now kills any bug.

**What broke:**
- Tweakpane 4 failed type-checking (`addFolder` / `on` missing). Its types live in a separate `@tweakpane/core` package that had to be installed and pinned.
- Claude's built-in browser pane was hidden, so the game barely got any frames and the swarm looked frozen. Claude couldn't verify motion by watching. It added a dev-only `window.__game` handle and stepped the simulation from the console to test chains, splits, hunters, season end, and all three endings.
- The briefing card was taller than a small window and the Start button fell below the fold. The spacing was tightened, and Space also starts the game.
- Claude's first win condition, "kill every bug", made sterile bugs pointless to fight, which I flagged as an unclear goal.

**Time:** _fill in_
