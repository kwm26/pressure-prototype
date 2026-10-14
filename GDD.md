# GDD — Pressure (Reinvents: Centipede, 1981)

> "You are not exterminating a swarm — you are breeding it into submission, one selective kill at a time."

Working title: **Pressure** · Kyle — GAMEDSGN 59003, Gen AI for Games
Source: Lab A one-page GDD v0.1 (September 23, 2026). Converted to Markdown for Lab B; no Rep 3 revision exists, so this is the Lab A design plus a Lab B scope note at the end.

---

## Pitch

Centipede assumes every shot is pure progress — kill more, clear the field faster. Pressure breaks that rule: a kill is a genetic edit, not a subtraction, and an indiscriminate kill randomizes what survives to breed, making next season harder, not easier. The arcade tension survives untouched — the player still aims and swaps tools in real time against a descending field — the target of that precision has simply moved from "clear the screen" to "shape the gene pool."

## Core Loop — One Season

1. **Generation spawns** — traits visible on sight.
2. **Player culls** — aims and picks a tool.
   - **Aim & switch tool:** 4 tools, instant swap, no pause menu.
   - **Strafe:** free lateral move, confined to the bottom lane.
3. **Survivors escape** — each segment ends the season bred, sterile, or dead.
4. **Breeding pass** — genes combine + drift.
5. **Target check** — population vs. goal.
6. **Pressure source** — your culling choices set next season's gene pool → back to step 1.

## Trait Inheritance — Detail

- A segment **shot mid-body** splits; the pieces are clones (no crossover).
- **Two escapees breed** → offspring get 1 allele per gene from each parent, plus **5% drift**.
- Traits (from the Lab A concept log): **speed**, **aggression** (attacks growth nodes), **fragmentation resistance** (hits to split), **fertility** (can breed on escape). Shown through color/pattern, readable at a glance.

## Tools (from the Lab A concept log)

| Tool | Effect | Genetic cost |
|---|---|---|
| Stun net | Incapacitates only high-aggression individuals | Selective |
| Precision dart | Can only down visibly high-fertility individuals | Selective |
| Sterilize beam | Doesn't kill; flags a segment as reproductively dead | Selective, slow |
| Blunt area cannon | Kills fast and indiscriminately | Genetically blind — survivors breed at random |

## Growth Nodes (obstacle field)

Terrain that interacts with traits: aggressive individuals destroy nodes as they pass (removing cover, opening sightlines); fast individuals move erratically around them. Cover degrading is a readable consequence of what you failed to cull.

## Win / Lose

- **WIN — Extinction:** population falls below its breeding floor.
- **WIN — Domestication:** a docile, low-fertility population holds stable for N straight seasons.
- **LOSE:** aggression + speed alleles compound faster than you can cull — growth nodes collapse, the field is overrun, the breeding floor is never reached.

## Target Player

- Arcade-shooter players craving a strategic twist.
- Fans of "manage, don't just kill" tension (Plague Inc., Spore).

## Platform & Session

- PC / Steam first — mouse + twin-stick or gamepad.
- 5–12 min per season; a sitting = a few seasons.
- Simple bitwise genetics model ports to mobile later.

## MVP Scope (small team)

- 4–6 person team, one prototype biome.
- All 4 tools; one target-type per season (fertility OR aggression).
- No cross-sitting career persistence yet.

## Art & Audio Direction

- Dry, clinical pest-control field report, not sci-fi lore.
- Dark terrarium palette + bio-luminescent trait color coding.
- Hushed ambience; clear stingers on mutation/breeding events.
- Mood: terrarium ink + trait accents.

---

## Lab B Scope (prototype slice)

Lab B tests one slice of the loop, not the MVP above.

- **Verb:** shoot (fire straight up), with strafing in the bottom lane.
- **Win (Kyle's decision, Oct 14):** **Domestication.** Finish a season where *only* docile (non-hostile) bugs escape, at least 8 of them (`domesticMinSurvivors`, for `domesticSeasons` seasons in a row). Extinction is not the goal for Lab B.
- **Lose:** a bug touches you · the swarm reaches the overrun cap (70) · you kill every bug (nothing left to tame).
- **Two tools, swapped with Q / right-click** (the GDD's selective vs. genetically blind tension):
  - *Precision dart*: fast, kills exactly the bug it hits, so you can spare docile bugs.
  - *Blunt cannon*: slow area blast that kills everything in range, docile bugs included, and splits bugs at the blast edge into clones (GDD: "shot mid-body → clone, no crossover").
- **Traits (2 genes, 2 alleles each):**
  - Fertility = fill color (grey sterile / teal fertile / pulsing pink very fertile) → litter size when escapees breed.
  - Aggression = outline: none = docile, goes around growth nodes · orange ring = hostile, chews through nodes · red spikes = hunter, breaks off its chain in the bottom zone and chases the player.
- **Swarm moves in Centipede chains;** killing a middle segment splits the chain, and the rear piece gets a new head.
- **Variant switch (keys 1 / 2, or `?v=2`):** the start-of-run briefing. **V1** explains goal, win/lose, tools and controls only. **V2** adds the trait legend. This tests the prototype question directly: can players figure out what the colors mean on their own?
- **Cut for Lab B:** stun net, sterilize beam, extinction win, art beyond greybox shapes, audio.
- The prototype question, hypothesis and thresholds live in `PROTOTYPE.md`.
