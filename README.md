# Pressure — Lab B Playable Prototype

A Centipede (1981) reinvention where every shot is selection pressure on a breeding swarm. You aren't exterminating the swarm. You're breeding it into something harmless.

**Play:** https://kwm26.github.io/pressure-prototype/ (V2 briefing: [`?v=2`](https://kwm26.github.io/pressure-prototype/?v=2)) · GAMEDSGN 59003, Gen AI for Games, Duke, Fall 2026

## How to play

- **Goal:** finish a season where only **docile** bugs (no outline) escape, at least 8 of them.
- **Shoot** hostile bugs (orange ring) and hunters (red spikes). **Spare** docile bugs.
- Bugs that escape the bottom breed into next season's swarm, and offspring inherit their parents' traits.
- **Lose** if a bug touches you, the swarm reaches 70, or you kill every bug.

| Action | Keys |
|---|---|
| Move | mouse, WASD or arrows (anywhere in the bottom strip) |
| Shoot | click or Space |
| Swap dart / cannon | Q or right-click |
| Restart | R |
| Briefing | H |
| Briefing variant | 1 / 2 (or `?v=2` in the URL) |
| Download telemetry | T |

The tuning panel (top-right) has 28 live parameters.

## Run locally

```bash
npm install
npm run dev
```

Stack and versions are pinned in [AGENTS.md](AGENTS.md).

## Documents

- [GDD.md](GDD.md): design (Lab A GDD + Lab B scope)
- [PROTOTYPE.md](PROTOTYPE.md): Prototype Card, Loop Log, Variant Comparison, Playtest Log, Verdict
- [BUILD_LOG.md](BUILD_LOG.md): one entry per AI-assisted work session
- [telemetry/](telemetry/): JSON exports from playtests
