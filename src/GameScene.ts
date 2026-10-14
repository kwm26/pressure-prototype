import Phaser from 'phaser';
import {
  CONFIG as C, W, H, HUD_H, PLAYER_Y, ZONE_TOP, BUG_R, PLAYER_R, NODE_SIZE, MARGIN,
} from './config';
import {
  Genome, fertility, aggression, randomGenome, cloneGenome, breedingPass, averages,
} from './genetics';
import * as telemetry from './telemetry';

type Tool = 'dart' | 'cannon';
type Phase = 'playing' | 'recap' | 'over';

interface Bug { id: number; x: number; y: number; dir: number; g: Genome }
interface Shot { x: number; y: number; tool: Tool }
interface GrowthNode { x: number; y: number; hp: number }
interface Fx { x: number; y: number; vx: number; vy: number; r: number; maxR: number; t: number; life: number; color: number; kind: 'ring' | 'dot' }
interface Spawn { g: Genome; side: number; delay: number }

const FERT_COLORS = [0x4a6b5a, 0x3fd1c0, 0xff4fd8];
const AGGR_COLORS = [0, 0xffb347, 0xff3b3b];
const SPAWN_Y = HUD_H + 14;

export class GameScene extends Phaser.Scene {
  private gfx!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private goal!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
  private stats!: Phaser.GameObjects.Text;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  // Run state
  private phase: Phase = 'playing';
  private run = 0;
  private runTime = 0;
  private season = 1;
  private score = 0;
  private tool: Tool = 'dart';
  private playerX = W / 2;
  private cooldown = 0;
  private recapTimer = 0;
  private endedAt = 0; // ms timestamp of last run end, for retry timing
  private nextBugId = 0;

  private bugs: Bug[] = [];
  private shots: Shot[] = [];
  private nodes: GrowthNode[] = [];
  private fx: Fx[] = [];
  private spawnQueue: Spawn[] = [];
  private spawnTimer = 0;
  private escapees: Genome[] = [];
  private nextPopulation: Genome[] = [];

  // Per-season and per-run counters
  private seasonStats = { dartKills: 0, cannonKills: 0, splits: 0, deflects: 0 };
  private runStats = { dartShots: 0, cannonShots: 0, kills: 0, fertileKills: 0, splits: 0, toolSwitches: 0 };

  constructor() { super('game'); }

  create() {
    this.gfx = this.add.graphics();
    const mono = { fontFamily: 'monospace', fontSize: '14px', color: '#cfeee4' };
    this.hud = this.add.text(10, 4, '', mono);
    this.goal = this.add.text(10, 23, '', { ...mono, fontSize: '11px', color: '#7fa89a' });
    this.banner = this.add.text(W / 2, H / 2 - 40, '', {
      ...mono, fontSize: '18px', color: '#ffffff', align: 'center', backgroundColor: '#0b1110cc', padding: { x: 14, y: 10 },
    }).setOrigin(0.5).setDepth(10);
    this.stats = this.add.text(W - 6, ZONE_TOP + 4, '', { ...mono, fontSize: '10px', color: '#56786c' }).setOrigin(1, 0);

    const kb = this.input.keyboard!;
    this.keys = kb.addKeys('LEFT,RIGHT,A,D,SPACE,Q,E,R,T') as Record<string, Phaser.Input.Keyboard.Key>;
    kb.on('keydown-Q', () => this.switchTool());
    kb.on('keydown-E', () => this.switchTool());
    kb.on('keydown-R', () => this.restart());
    kb.on('keydown-T', () => telemetry.download());

    this.input.mouse?.disableContextMenu();
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { this.playerX = Phaser.Math.Clamp(p.x, MARGIN, W - MARGIN); });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (p.rightButtonDown()) this.switchTool(); });

    telemetry.log('session_start', { userAgent: navigator.userAgent });
    this.startRun();
  }

  // ---------- Run / season lifecycle ----------

  private startRun() {
    this.run++;
    this.phase = 'playing';
    this.runTime = 0;
    this.season = 1;
    this.score = 0;
    this.tool = 'dart';
    this.cooldown = 0;
    this.bugs = []; this.shots = []; this.fx = [];
    this.runStats = { dartShots: 0, cannonShots: 0, kills: 0, fertileKills: 0, splits: 0, toolSwitches: 0 };
    this.banner.setVisible(false);
    this.placeNodes();

    const pop: Genome[] = [];
    for (let i = 0; i < C.startPopulation; i++) pop.push(randomGenome(C.startFertileAlleleChance, C.startAggressiveAlleleChance));
    telemetry.log('run_start', { run: this.run, config: { ...C } });
    this.startSeason(pop);
  }

  private placeNodes() {
    this.nodes = [];
    const cols = Math.floor((W - 2 * MARGIN) / NODE_SIZE);
    const rows = Math.floor((ZONE_TOP - 40 - (HUD_H + 50)) / NODE_SIZE);
    const used = new Set<number>();
    for (let i = 0; i < C.nodeCount && used.size < cols * rows; i++) {
      let cell: number;
      do { cell = Math.floor(Math.random() * cols * rows); } while (used.has(cell));
      used.add(cell);
      this.nodes.push({
        x: MARGIN + (cell % cols) * NODE_SIZE + NODE_SIZE / 2,
        y: HUD_H + 50 + Math.floor(cell / cols) * NODE_SIZE + NODE_SIZE / 2,
        hp: C.nodeHp,
      });
    }
  }

  private startSeason(pop: Genome[]) {
    this.phase = 'playing';
    this.banner.setVisible(false);
    this.escapees = [];
    this.seasonStats = { dartKills: 0, cannonKills: 0, splits: 0, deflects: 0 };
    // Queue the population as chains entering from alternating top corners.
    this.spawnQueue = [];
    const gap = 26 / C.bugSpeed;
    pop.forEach((g, i) => {
      const chain = Math.floor(i / Math.max(1, C.chainLength));
      const first = i % Math.max(1, C.chainLength) === 0;
      this.spawnQueue.push({ g, side: chain % 2 === 0 ? 1 : -1, delay: first && i > 0 ? 0.7 : gap });
    });
    this.spawnTimer = 0;
    telemetry.log('season_start', { run: this.run, season: this.season, population: pop.length, ...averages(pop) });
  }

  private endSeason() {
    const result = breedingPass(this.escapees, C.litterSize, C.mutationRate);
    this.nextPopulation = result.nextPopulation;
    const fertileEscaped = this.escapees.filter((g) => fertility(g) > 0).length;
    telemetry.log('season_end', {
      run: this.run, season: this.season,
      escaped: this.escapees.length, fertileEscaped,
      breeders: result.breeders, offspring: result.offspring,
      nextPopulation: this.nextPopulation.length, ...averages(this.nextPopulation),
      ...this.seasonStats,
    });

    if (this.nextPopulation.length === 0) {
      this.score += 500;
      this.endRun('extinct');
      return;
    }
    if (this.nextPopulation.length >= C.overrunCap) {
      this.endRun('overrun');
      return;
    }
    this.score += 100;
    this.phase = 'recap';
    this.recapTimer = C.recapSeconds;
    this.banner.setText(
      `SEASON ${this.season} OVER\n` +
      `${this.escapees.length} escaped · ${result.breeders} could breed · +${result.offspring} offspring\n` +
      `next swarm: ${this.nextPopulation.length}`,
    ).setVisible(true);
  }

  private endRun(cause: 'extinct' | 'overrun' | 'bitten' | 'quit', at?: { x: number; y: number }) {
    const total = this.runStats.dartShots + this.runStats.cannonShots;
    telemetry.log('run_end', {
      run: this.run,
      duration: +this.runTime.toFixed(2),
      score: this.score,
      seasons: this.season,
      cause,
      x: Math.round(at?.x ?? this.playerX),
      y: Math.round(at?.y ?? PLAYER_Y),
      swarm: cause === 'extinct' || cause === 'overrun' ? this.nextPopulation.length : this.bugs.length + this.spawnQueue.length,
      ...this.runStats,
      cannonShare: total ? +(this.runStats.cannonShots / total).toFixed(2) : 0,
    });
    this.phase = 'over';
    this.endedAt = performance.now();
    const headline = {
      extinct: `EXTINCT — you bred the swarm out in ${this.season} season${this.season > 1 ? 's' : ''}`,
      overrun: `OVERRUN — the swarm grew to ${this.nextPopulation.length}`,
      bitten: 'BITTEN — the swarm reached you',
      quit: '',
    }[cause];
    if (cause !== 'quit') this.banner.setText(`${headline}\nscore ${this.score}\n\npress R to go again`).setVisible(true);
    if (C.screenShake && cause !== 'extinct' && cause !== 'quit') this.cameras.main.shake(250, 0.012);
  }

  private restart() {
    if (this.phase === 'over') {
      telemetry.log('retry', { afterRun: this.run, secondsSinceEnd: +((performance.now() - this.endedAt) / 1000).toFixed(2) });
    } else {
      this.endRun('quit');
      telemetry.log('retry', { afterRun: this.run, secondsSinceEnd: 0, midRun: true });
    }
    this.startRun();
  }

  private switchTool() {
    if (this.phase === 'over') return;
    this.tool = this.tool === 'dart' ? 'cannon' : 'dart';
    this.cooldown = Math.min(this.cooldown, 0.15);
    this.runStats.toolSwitches++;
    telemetry.log('tool_switch', { run: this.run, season: this.season, tool: this.tool });
  }

  // ---------- Update ----------

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    if (this.phase !== 'over') {
      this.runTime += dt;
      this.updatePlayer(dt);
      if (this.phase === 'playing') {
        this.updateSpawns(dt);
        this.updateBugs(dt);
        if (this.phase === 'playing') this.updateShots(dt);
        if (this.phase === 'playing' && this.spawnQueue.length === 0 && this.bugs.length === 0 && this.shots.length === 0) this.endSeason();
      } else if (this.phase === 'recap') {
        this.recapTimer -= dt;
        if (this.recapTimer <= 0) { this.season++; this.startSeason(this.nextPopulation); }
      }
    }
    this.updateFx(dt);
    this.draw();
  }

  private updatePlayer(dt: number) {
    const k = this.keys;
    const dir = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    this.playerX = Phaser.Math.Clamp(this.playerX + dir * C.playerSpeed * dt, MARGIN, W - MARGIN);

    this.cooldown -= dt;
    const firing = k.SPACE.isDown || this.input.activePointer.leftButtonDown();
    if (firing && this.cooldown <= 0 && this.phase === 'playing') {
      this.shots.push({ x: this.playerX, y: PLAYER_Y - 14, tool: this.tool });
      if (this.tool === 'dart') { this.runStats.dartShots++; this.cooldown = C.dartCooldown; }
      else { this.runStats.cannonShots++; this.cooldown = C.cannonCooldown; }
    }
  }

  private updateSpawns(dt: number) {
    this.spawnTimer -= dt;
    while (this.spawnQueue.length > 0 && this.spawnTimer <= 0) {
      const s = this.spawnQueue.shift()!;
      this.bugs.push({ id: this.nextBugId++, x: s.side > 0 ? MARGIN : W - MARGIN, y: SPAWN_Y, dir: s.side, g: s.g });
      this.spawnTimer += this.spawnQueue[0]?.delay ?? 0;
    }
  }

  private updateBugs(dt: number) {
    for (const b of this.bugs) {
      const aggr = aggression(b.g);
      const speed = C.bugSpeed * (1 + C.aggressionSpeedBonus * aggr);
      if (b.y > ZONE_TOP && aggr > 0 && Math.abs(this.playerX - b.x) < C.chaseRange && Math.abs(this.playerX - b.x) > 4) {
        b.dir = Math.sign(this.playerX - b.x);
      }
      b.x += b.dir * speed * dt;
      b.y += C.descentSpeed * (1 + 0.5 * C.aggressionSpeedBonus * aggr) * dt;
      if (b.x < MARGIN) { b.x = MARGIN; b.dir = 1; }
      if (b.x > W - MARGIN) { b.x = W - MARGIN; b.dir = -1; }

      for (const n of this.nodes) {
        if (n.hp <= 0) continue;
        if (Math.abs(b.x - n.x) < NODE_SIZE / 2 + BUG_R && Math.abs(b.y - n.y) < NODE_SIZE / 2 + BUG_R) {
          if (aggr === 2) { n.hp = 0; continue; } // aggressive bugs chew through growth nodes
          b.x = n.x - b.dir * (NODE_SIZE / 2 + BUG_R + 0.5);
          b.dir = -b.dir;
        }
      }

      if (Phaser.Math.Distance.Between(b.x, b.y, this.playerX, PLAYER_Y) < BUG_R + PLAYER_R) {
        this.endRun('bitten', { x: b.x, y: b.y });
        return;
      }
    }
    this.nodes = this.nodes.filter((n) => n.hp > 0);

    // Bugs that pass the bottom escape and will breed.
    const escaped = this.bugs.filter((b) => b.y > H + BUG_R);
    for (const b of escaped) {
      this.escapees.push(b.g);
      telemetry.log('escape', { run: this.run, season: this.season, x: Math.round(b.x), fert: fertility(b.g), aggr: aggression(b.g) });
    }
    if (escaped.length) this.bugs = this.bugs.filter((b) => b.y <= H + BUG_R);
  }

  private updateShots(dt: number) {
    const remaining: Shot[] = [];
    for (const s of this.shots) {
      s.y -= (s.tool === 'dart' ? C.dartSpeed : C.cannonSpeed) * dt;
      let hit = s.y < HUD_H;

      const node = this.nodes.find((n) => Math.abs(s.x - n.x) < NODE_SIZE / 2 + 2 && Math.abs(s.y - n.y) < NODE_SIZE / 2 + 2);
      const bug = this.bugs.find((b) => Phaser.Math.Distance.Between(s.x, s.y, b.x, b.y) < BUG_R + (s.tool === 'dart' ? 3 : 5));

      if (s.tool === 'dart') {
        if (bug) {
          hit = true;
          if (fertility(bug.g) >= C.dartMinFertility) this.killBug(bug, 'dart');
          else { this.seasonStats.deflects++; this.addRing(bug.x, bug.y, 0x9aa8a2, 14, 0.25); }
        } else if (node) { hit = true; node.hp--; }
      } else if (bug || node || hit) {
        hit = true;
        this.explode(s.x, Math.max(s.y, HUD_H));
      }
      if (!hit) remaining.push(s);
    }
    this.shots = remaining;
    this.nodes = this.nodes.filter((n) => n.hp > 0);
  }

  private explode(x: number, y: number) {
    this.addRing(x, y, 0xffa040, C.cannonRadius, 0.35);
    if (C.screenShake) this.cameras.main.shake(90, 0.006);
    const outer = C.cannonRadius * 1.6;
    const clones: Bug[] = [];
    for (const b of [...this.bugs]) {
      const d = Phaser.Math.Distance.Between(x, y, b.x, b.y);
      if (d < C.cannonRadius) this.killBug(b, 'cannon');
      else if (d < outer && Math.random() < C.cannonSplitChance) {
        // Blunt hit on the edge splits the bug: a clone, no crossover (GDD trait inheritance).
        clones.push({ id: this.nextBugId++, x: b.x, y: b.y - 2 * BUG_R, dir: -b.dir, g: cloneGenome(b.g) });
        this.seasonStats.splits++; this.runStats.splits++;
        this.addRing(b.x, b.y, 0xffffff, 16, 0.3);
      }
    }
    this.bugs.push(...clones);
    for (const n of this.nodes) if (Phaser.Math.Distance.Between(x, y, n.x, n.y) < C.cannonRadius) n.hp -= 2;
  }

  private killBug(b: Bug, tool: Tool) {
    this.bugs = this.bugs.filter((o) => o !== b);
    const fert = fertility(b.g);
    this.runStats.kills++;
    if (fert > 0) this.runStats.fertileKills++;
    if (tool === 'dart') this.seasonStats.dartKills++; else this.seasonStats.cannonKills++;
    this.score += 10;
    telemetry.log('kill', { run: this.run, season: this.season, tool, fert, aggr: aggression(b.g), x: Math.round(b.x), y: Math.round(b.y) });
    if (C.killParticles) {
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
        this.fx.push({ x: b.x, y: b.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, r: 2, maxR: 2, t: 0, life: 0.35, color: FERT_COLORS[fert], kind: 'dot' });
      }
    }
  }

  private addRing(x: number, y: number, color: number, maxR: number, life: number) {
    this.fx.push({ x, y, vx: 0, vy: 0, r: 2, maxR, t: 0, life, color, kind: 'ring' });
  }

  private updateFx(dt: number) {
    for (const f of this.fx) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; }
    this.fx = this.fx.filter((f) => f.t < f.life);
  }

  // ---------- Draw ----------

  private draw() {
    const g = this.gfx;
    g.clear();

    // HUD bar and bottom zone
    g.fillStyle(0x111b18).fillRect(0, 0, W, HUD_H);
    g.fillStyle(0x0f1a17).fillRect(0, ZONE_TOP, W, H - ZONE_TOP);
    g.lineStyle(1, 0x1f332c).lineBetween(0, ZONE_TOP, W, ZONE_TOP);

    for (const n of this.nodes) {
      const a = 0.35 + 0.65 * (n.hp / C.nodeHp);
      g.fillStyle(0x2f5a3a, a).fillRect(n.x - NODE_SIZE / 2 + 1, n.y - NODE_SIZE / 2 + 1, NODE_SIZE - 2, NODE_SIZE - 2);
    }

    for (const b of this.bugs) {
      const fert = fertility(b.g);
      const aggr = aggression(b.g);
      g.fillStyle(FERT_COLORS[fert]).fillCircle(b.x, b.y, BUG_R);
      if (aggr > 0) {
        g.lineStyle(aggr === 2 ? 3 : 2, AGGR_COLORS[aggr]).strokeCircle(b.x, b.y, BUG_R + 1);
        if (aggr === 2) {
          for (let i = 0; i < 4; i++) {
            const a = (Math.PI / 2) * i + Math.PI / 4;
            g.lineBetween(b.x + Math.cos(a) * (BUG_R + 1), b.y + Math.sin(a) * (BUG_R + 1), b.x + Math.cos(a) * (BUG_R + 6), b.y + Math.sin(a) * (BUG_R + 6));
          }
        }
      }
    }

    for (const s of this.shots) {
      if (s.tool === 'dart') g.fillStyle(0xe6fffa).fillRect(s.x - 1, s.y - 6, 2, 12);
      else g.fillStyle(0xffa040).fillCircle(s.x, s.y, 5);
    }

    for (const f of this.fx) {
      const p = f.t / f.life;
      if (f.kind === 'ring') g.lineStyle(2, f.color, 1 - p).strokeCircle(f.x, f.y, f.r + (f.maxR - f.r) * p);
      else g.fillStyle(f.color, 1 - p).fillCircle(f.x, f.y, f.r);
    }

    // Player: color shows the active tool
    if (this.phase !== 'over') {
      const col = this.tool === 'dart' ? 0xe6fffa : 0xffa040;
      g.fillStyle(col).fillTriangle(this.playerX, PLAYER_Y - 12, this.playerX - 11, PLAYER_Y + 9, this.playerX + 11, PLAYER_Y + 9);
    }

    const swarm = this.bugs.length + this.spawnQueue.length;
    const ready = this.cooldown <= 0 ? '' : ' (reloading)';
    this.hud.setText(`SEASON ${this.season}  SWARM ${swarm}/${C.overrunCap}  SCORE ${this.score}  ${this.tool.toUpperCase()}${ready} [Q]`);
    this.goal.setText('GOAL: breed the swarm out. Bugs that escape the bottom breed next season.');
    this.stats.setText(telemetry.summaryLine());
  }
}
