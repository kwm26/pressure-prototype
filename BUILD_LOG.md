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

---

## Oct 14 — Session 3: making "what to shoot" obvious

**Tool:** Claude Code (desktop app, Claude Opus 5.5)

**Prompt that mattered:** "I'm still confused on what bugs to kill and not kill, add a popup that makes it clear to the player on bug type."

**What happened:** Claude flagged that this collided with my V1/V2 variant (V1 hid the legend on purpose). I agreed the shoot/spare rule has to be clear in both, because an unclear goal is my Pivot condition. Changes: a 3-card bug key in the briefing (DOCILE = SPARE, HOSTILE = SHOOT, HUNTER = SHOOT FIRST) drawn with the same icons as the game, plus an always-on mini key in the bottom-left. V2 now only adds the fertility + inheritance explanation. The game also scales to fit the window.

**What broke:**
- The game is 720 px tall, so it overflowed shorter laptop screens and needed scrolling. Switched Phaser to `Scale.FIT`.
- A zoomed screenshot in Claude's browser pane left the view mis-scaled for a moment, so it had to reset the viewport and reload to check the corner key.
- Observation, not a fix: hostile bugs chew through most of the green growth nodes within about 25 s. Possible Loop Log candidate.

**Time:** _fill in_

---

## Oct 14 — Session 4: deploy + Loop Log

**Tool:** Claude Code (desktop app, Claude Opus 5.5) + GitHub Desktop

**Prompt that mattered:** "Its too hard to avoid at bottom, I think should be able to move around in the very bottom area, and its too hard to properly hit the right ones." Claude split this into two separate loops (one change each) instead of fixing both at once.

**What happened:**
- Created the repo in GitHub Desktop. Claude moved the game and its history into `pressure-prototype/`, then I pushed. Made the repo public, set Pages to GitHub Actions. Live: https://kwm26.github.io/pressure-prototype/
- Loop 1: `domesticSeasons` 1 → 2.
- Loop 2: added free movement in the bottom strip as a tunable number (`playerMoveHeight`, 0 = old behavior).
- Loop 2 became an unplanned but useful test: I changed `playerSpeed` (420 → 100 → 570) and still got bitten at ~40 s every time. That pointed at space, not speed, so bottom-strip movement became Loop 3, and `segmentSpacing` 20 → 28 is Loop 4.
- I removed mouse movement (keyboard only); the mouse moving the ship felt wrong. Clicking still shoots.

**What broke:**
- GitHub Desktop published its own "Initial commit" while Claude was moving the history in, so the two histories diverged and Desktop said "Unable to merge unrelated histories". Claude merged instead of force-pushing (keeping our `.gitattributes`), and then Desktop could push.
- Claude's command-line git couldn't see the repo ("Repository not found") because it was private and only GitHub Desktop was signed in. Pushes go through Desktop.
- The first Pages deploy failed because it ran before Pages was enabled. A re-run fixed it. My browser cached the 404, so the link looked broken until I refreshed.
- My first "Loop 2" playthrough happened on the old live site, because I hadn't pushed the movement commits yet. Claude caught it from the telemetry: the run config had no `playerMoveHeight`.
- My first telemetry files didn't exist: I hadn't understood that pressing T is the save. Claude found only a 40-second file and explained the steps again.
- Claude's preview server kept serving the old parent folder instead of `pressure-prototype/`, so its first test hit stale code. It added a launch config that points at the new folder.

**Time:** _fill in_
