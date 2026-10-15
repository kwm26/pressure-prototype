# PROTOTYPE.md — Pressure

Lab notebook for the Lab B prototype. The Prototype Card is written and committed **before the first outside playtest**.

---

## Prototype Card

_Written by Kyle before any playtests (Oct 14). The assistant helped with formatting; the question, hypothesis and thresholds are mine._

**Question:** Can players figure out how their kills shape the next wave, while the goal of the game stays clear?

**Hypothesis:** Players will notice the colors changing, but will have to figure out what each color and status means. Until they do, they'll lean on the cannon.

**Watch:**
- **Cannon share**: % of shots fired with the cannon, first run vs. last run, per tester (telemetry `run_end.cannonShare`). A drop means they're learning to cull selectively.
- **"What were you trying to do?"**: after 3 minutes, can the tester explain what a color means, or that their kills changed the next wave? (yes / no per tester)
- **Seasons survived**: per run (telemetry `run_end.seasons`). Shows whether understanding the system helps them play.

**Keep:** 5 of 6 testers can explain what a color means, or that their kills changed the next wave.

**Pivot:** Testers understand the colors but still can't say what they're trying to win.

**Kill:** 2 or fewer of 6 testers can explain it.

_Middle zone (3–4 of 6):_ promising but not proven. The Verdict will explain which way it leaned and why.

**Variant under test (keys 1 / 2):** both briefings show the goal, a SHOOT / SPARE bug key (outline = hostility) and controls. V1 stops there. V2 also explains **fill color = fertility** and that offspring inherit traits, i.e. *how kills shape the next wave*.

_Card change, Oct 14, before any playtest:_ the variant was originally "dart vs. cannon". After my own first playthrough I made both tools available in every run (so cannon share stays measurable) and moved the A/B to the legend, which tests the question directly. I also set the win condition to Domestication (only docile bugs escape).

_Second card change, Oct 14, before any playtest:_ on my own second playthrough I still couldn't tell which bugs to shoot. Since an unclear goal is my Pivot condition, I made the shoot/spare key visible in both variants (popup + always-on corner key). The A/B now isolates the deeper half of my question: does explaining fertility and inheritance help players see how their kills shape the next wave?

---

## Loop Log

One line per change + replay. Change one thing per loop. Name the number that moved.

Format: `Loop N · what changed (old → new) · why · what happened (number that moved)`

- Loop 1 · `domesticSeasons` 1 → 2 · a good player can win in Season 1 before any breeding happens, so they never see how their kills shape the next wave · **result: the number never got a chance to matter.** All 3 runs (1 at the old value, 2 at the new one) ended **BITTEN in Season 1 at ~38 s** (37.8 / 37.5 / 38.6 s), before any breeding pass. Hostiles escaped: 0, so I was culling well, but the bites ended every run. 14 of 43 kills (33%) were docile bugs I meant to spare. Takeaway: surviving at the bottom is the real blocker → Loop 2; hitting the right bug is the next one → Loop 3. Kept `domesticSeasons` = 2. · telemetry: `telemetry/loop1.json`
- Loop 2 · `playerSpeed` 420 → 100, then → 570 · after Loop 1 every run ended bitten, so I tested whether moving slower (more control) or faster (more escape) helps · **result: speed made no difference.** 100: bitten at 40.7 s (4 of 18 kills docile). 570: bitten at 40.2 s (10 of 21 kills docile, and I leaned on the cannon more, 22%). Both still died in Season 1. Takeaway: the problem isn't speed but **having no room to dodge** in a one-row lane → Loop 3. Reset to 420. · telemetry: `telemetry/loop2.json` (same session as loop1, runs 4–7)
- Loop 3 · `playerMoveHeight` 0 → 110 (new: free movement in the bottom strip, like original Centipede; keyboard only, mouse movement removed) · locked to one row I had no way to dodge hunters · _result: fill in (runs ending `bitten` before vs. after; seasons reached; did dodging feel fair?)_ · telemetry: `telemetry/loop3.json`
- Loop 4 (extra) · `segmentSpacing` 20 → 28 · hard to hit the right bug, because chain segments nearly touch and the dart hits whichever is in front (Loops 1–2: 28 of 82 kills, 34%, were docile) · _result: fill in (docile kills per run before vs. after)_ · telemetry: `telemetry/loop4.json`

---

## Variant Comparison

**Mechanic:** start-of-run briefing — **Variant 1:** goal + shoot/spare key + controls · **Variant 2:** + fertility & inheritance explanation

Each tester plays both; odd testers start on V1, even testers on V2. "Explains?" = after that variant, could they say what a color/outline means or that their kills changed the next wave (Y/N).

| Tester | Order | V1 explains? | V2 explains? | V1 cannon % | V2 cannon % | Notes |
|---|---|---|---|---|---|---|
| T1 | V1→V2 | | | | | |
| T2 | V2→V1 | | | | | |
| T3 | V1→V2 | | | | | |
| T4 | V2→V1 | | | | | |
| T5 | V1→V2 | | | | | |
| T6 | V2→V1 | | | | | |

**Winner and margin:** _

---

## Playtest Log

Protocol: one sentence of context → watch silently for 3 min → ask "What were you trying to do?" → download telemetry (T) before the next tester.

| # | Tester (initials) | In class? | Date | Telemetry file | Restarted? | Where they got stuck | What they said |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |
| 6 | | | | | | | |

---

## Verdict

_Keep / Pivot / Kill — the numbers behind it — the first thing Lab C should change. About one page. Written last._
