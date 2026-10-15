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
- Loop 3 · `playerMoveHeight` 0 → 110 (new: free movement in the bottom strip, like original Centipede; keyboard only, mouse movement removed) · locked to one row I had no way to dodge hunters · **result: moving helped me aim, not survive.** At 110: bitten at 35.6 s, but only 2 of 14 kills were docile (14%). At 17 (nearly locked): bitten at 38.2 s, with 5 of 11 kills docile (45%). Still bitten in Season 1 either way. Side test (dart cooldown 0.22 → 0.05, machine-gun mode): I wiped out all 30 bugs in 24 s, 16 of them docile → **WIPED OUT** loss. So spamming fails, which is the design working. Kept 110 / 0.22. · telemetry: `telemetry/loop3.json`
- Loop 4 (not run, deadline) · planned: `segmentSpacing` 20 → 28 to make single bugs easier to target (Loops 1–2: 28 of 82 kills, 34%, were docile).

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

**Status at submission (Oct 14, 11:59 pm): outside playtests were not completed.** The only data so far is my own play (3 telemetry files; loop1 is part of the loop2 session; 8 completed runs). The rows below are empty rather than invented. Running these 6 tests is the first job before Lab C.

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

_Draft, written from my own play data. No outside testers yet, so the Keep/Pivot/Kill thresholds (counted out of 6 testers) can't be scored formally._

**Call: Pivot (provisional).**

**The numbers behind it**, from all my completed runs (`telemetry/loop1–3.json`):
- **8 of 8 completed runs ended in Season 1.** 7 were BITTEN at 35–41 s; 1 was WIPED OUT at 24 s (machine-gun dart test). **No run ever reached a breeding pass**, so the player never saw how their kills shaped the next wave.
- **Hostile bugs escaped: 0 in every run.** The cull-the-hostiles / spare-the-docile goal was clear enough for me to execute it perfectly.
- **Docile kills: 37% overall (34% in Loops 1–2; the machine-gun run alone was 16 of 30).** Precise targeting is hard, but moving freely (Loop 3) dropped it to 14% in that run.
- **Cannon share stayed low (0–22% per run).** I leaned on the dart, the opposite of my hypothesis ("players will lean on the cannon until they learn the colors"). With the shoot/spare key visible, the colors were learned instantly.
- **Restarts were fast:** most retries came within 1–3 s of a run ending, so the loop does pull me back.

**Why pivot, not keep or kill:** the culling half of the loop works and pulls me back, so it's not a kill. But the half my question is about, *seeing your kills shape the next wave*, never happens, because the bottom zone kills the player before a season can end. The loop blocks its own payoff, which needs a change of direction, not just tuning: three tuning loops (seasons, speed, movement) didn't move the bite time out of the 35–41 s band.

**First thing Lab C should change:** **docile bugs should not bite.** The briefing already promises they're "harmless", yet every chain, docile segments included, has to sweep through the player's strip to escape. That makes surviving a season nearly impossible, and it contradicts the game's own rule. With only hostile/hunter bugs dangerous, players should reach Season 2 and finally see the breeding loop. Then run the 6 outside playtests (V1 vs. V2) against the original thresholds.
