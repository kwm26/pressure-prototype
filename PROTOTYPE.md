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

- Loop 1 · _ · _ · _
- Loop 2 · _ · _ · _
- Loop 3 · _ · _ · _

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
