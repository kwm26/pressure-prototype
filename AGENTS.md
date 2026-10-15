# AGENTS.md — Pressure (Lab B prototype)

Instructions for any coding assistant working in this folder. Read this, `GDD.md` and `PROTOTYPE.md` before writing code.

## What this is

A browser-playable prototype of **Pressure**, a Centipede reinvention where shots are selection pressure on a breeding swarm. It exists to answer the single question in `PROTOTYPE.md`. It is an experiment, not an early version of the game.

## Stack (pinned — do not change versions without asking)

| Package | Version | Notes |
|---|---|---|
| Node.js | 22.19.0 | npm 10.9.3 |
| Phaser | **3.90.0** | **Phaser 3 API only.** Do not use Phaser 4 APIs or examples. |
| Tweakpane | 4.0.5 | Tuning panel. v4 API (`new Pane()`, `addBinding`), not v3 (`addInput`). |
| @tweakpane/core | 2.0.5 | Dev-only: Tweakpane 4's TypeScript types (`addFolder`, `on`) live here. |
| Vite | 8.3.4 | Dev server + bundler |
| TypeScript | 5.9.3 | `strict` on |

## Commands

```bash
npm install        # first time only
npm run dev        # dev server at http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally
npm run telemetry  # summarize telemetry/*.json for PROTOTYPE.md
```

Deploy: pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages.

## File layout

```
AGENTS.md          this file
GDD.md             design (Lab A GDD + Lab B scope)
PROTOTYPE.md       prototype card, loop log, variant comparison, playtest log, verdict
BUILD_LOG.md       one entry per work session
telemetry/         JSON files downloaded after each playtest (never edited by hand)
scripts/           summarize-telemetry.mjs (Node, no deps)
src/
  main.ts          Phaser game config + boot (+ dev-only window.__game debug handle)
  config.ts        ALL tunable gameplay numbers (single source of truth)
  GameScene.ts     the whole loop: chains, tools, seasons, win/lose, HUD
  genetics.ts      genomes, inheritance, breeding pass
  briefing.ts      start-of-run popup; both = goal + shoot/spare key, V2 = + fertility/inheritance
  telemetry.ts     in-memory event log, T = download JSON, corner summary
  tuning.ts        Tweakpane panel bound to CONFIG
index.html
```

## Controls (keep these stable; playtests depend on them)

Move: mouse or A/D · Shoot: click or Space · Swap tool: Q / right-click · Restart: R · Telemetry: T · Briefing: H · Variant: 1 / 2 (or `?v=2` in the URL)

## Testing tip

The dev build exposes `window.__game`. To fast-forward without watching:
`const s = __game.scene.getScene('game'); for (let i = 0; i < 600; i++) s.update(0, 16.7);`

## Working rules

1. **Every gameplay number lives in `src/config.ts`** and is exposed on the tuning panel. No magic numbers in game logic.
2. **One verb.** Shooting is the focus. Don't add systems that don't help answer the prototype question (see Lab B scope in `GDD.md`).
3. **Change one thing per loop.** When asked for a tuning or mechanic change, change only that, and list every file you touched.
4. **Restart must stay under 2 seconds** with a single key press (R).
5. **Telemetry is sacred.** Don't rename or remove telemetry event fields; new fields may be added. No network calls — export is a local JSON download (T).
6. **Variants stay switchable at runtime** with keys 1 and 2, and every switch is logged to telemetry.
7. **Juice effects** (max two) must have an on/off toggle on the tuning panel.
8. **No live AI calls, API keys, or external network requests** in game code.
9. **Greybox only:** simple shapes; no purchased or non-CC0 assets.
10. **Don't choose the prototype question, hypothesis, or thresholds** — those belong to the human. Ask.
11. Small commits with clear messages; run `npm run build` before committing.
12. After a change, offer a Loop Log line in `PROTOTYPE.md` with the result left blank for the human to fill in.
