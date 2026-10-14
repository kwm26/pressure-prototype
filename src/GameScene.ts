import Phaser from 'phaser';
import {
  CONFIG as C, W, H, HUD_H, PLAYER_Y, ZONE_TOP, BUG_R, PLAYER_R, NODE_SIZE, MARGIN,
} from './config';
import {
  Genome, fertility, aggression, randomGenome, cloneGenome, breedingPass, averages,
} from './genetics';
import { Variant, showBriefing, closeBriefing, isBriefingOpen } from './briefing';
import * as telemetry from './telemetry';

type Tool = 'dart' | 'cannon';
type Phase = 'playing' | 'recap' | 'over' | 'briefing';
type Cause = 'domesticated' | 'overrun' | 'bitten' | 'wiped' | 'quit';

interface Pt { x: number; y: number }
interface Bug {
  id: number; x: number; y: number; dir: number; g: Genome;
  leader: Bug | null; // null = chain head (or a lone bug)
  path: Pt[]; // recent positions, oldest first; followers trace their leader's path
  hunting: boolean; // hunters break off the chain in the bottom zone and chase the player
}
interface Shot { x: number; y: number; tool: Tool }
interface GrowthNode { x: number; y: number; hp: number }
interface Fx { x: number; y: number; vx: number; vy: number; r: number; maxR: number; t: number; life: number; color: number; kind: 'ring' | 'dot' }
interface Spawn { g: Genome; side: number; delay: number; chain: number }

const FERT_COLORS = [0x4a6b5a, 0x3fd1c0, 0xff4fd8];
const AGGR_COLORS = [0, 0xffb347, 0xff3b3b];
const SPAWN_Y = HUD_H + 14;
const isHostile = (g: Genome) => aggression(g) > 0;

export class GameScene extends Phaser.Scene {
  private gfx!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private goal!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
  private stats!: Phaser.GameObjects.Text;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  private variant: Variant = new URLSearchParams(location.search).get('v') === '2' ? 2 : 1;

  // Run state
  private phase: Phase = 'playing';
  private phaseBeforeBriefing: Phase = 'playing';
  private briefingOpenedAt = 0;
  private run = 0;
  private runTime = 0;
  private season = 1;
  private score = 0;
  private cleanStreak = 0;
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
  private lastInChain = new Map<number, Bug>();
  private escapees: Genome[] = [];
  private nextPopulation: Genome[] = [];

  // Per-season and per-run counters
  private seasonStats = { dartKills: 0, cannonKills: 0, docileKills: 0, hostileKills: 0, splits: 0 };
  private runStats = {
    dartShots: 0, cannonShots: 0, kills: 0, hostileKills: 0, docileKills: 0,
    hostileEscaped: 0, docileEscaped: 0, splits: 0, toolSwitches: 0,
  };

  constructor() { super('game'); }

  create() {
    this.gfx = this.add.graphics();
    const mono = { fontFamily: 'monospace', fontSize: '14px', color: '#cfeee4' };
    this.hud = this.add.text(10, 4, '', mono);
    this.goal = this.add.text(10, 23, '', { ...mono, fontSize: '11px', color: '#7fa89a' });
    this.banner = this.add.text(W / 2, H / 2 - 40, '', {
      ...mono, fontSize: '17px', color: '#ffffff', align: 'center', backgroundColor: '#0b1110cc', padding: { x: 14, y: 10 },
    }).setOrigin(0.5).setDepth(10);
    this.stats = this.add.text(W - 6, ZONE_TOP + 4, '', { ...mono, fontSize: '10px', color: '#56786c' }).setOrigin(1, 0);

    const kb = this.input.keyboard!;
    this.keys = kb.addKeys('LEFT,RIGHT,A,D,SPACE') as Record<string, Phaser.Input.Keyboard.Key>;
    kb.on('keydown-SPACE', () => { if (isBriefingOpen()) closeBriefing(); });
    kb.on('keydown-ENTER', () => { if (isBriefingOpen()) closeBriefing(); });
    kb.on('keydown-Q', () => this.switchTool());
    kb.on('keydown-E', () => this.switchTool());
    kb.on('keydown-R', () => this.restart());
    kb.on('keydown-T', () => telemetry.download());
    kb.on('keydown-H', () => this.openBriefing());
    kb.on('keydown-ONE', () => this.setVariant(1));
    kb.on('keydown-TWO', () => this.setVariant(2));

    this.input.mouse?.disableContextMenu();
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { this.playerX = Phaser.Math.Clamp(p.x, MARGIN, W - MARGIN); });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (p.rightButtonDown()) this.switchTool(); });

    telemetry.log('session_start', { variant: this.variant, userAgent: navigator.userAgent });
    this.startRun();
    this.openBriefing();
  }

  // ---------- Briefing & variants ----------

  private openBriefing() {
    if (isBriefingOpen()) return;
    this.phaseBeforeBriefing = this.phase;
    this.phase = 'briefing';
    this.briefingOpenedAt = performance.now();
    telemetry.log('briefing_open', { run: this.run, variant: this.variant });
    showBriefing(this.variant, () => {
      this.phase = this.phaseBeforeBriefing;
      this.cooldown = 0.3; // the key that closed the briefing shouldn't fire a shot
      telemetry.log('briefing_close', { run: this.run, variant: this.variant, secondsOpen: +((performance.now() - this.briefingOpenedAt) / 1000).toFixed(1) });
    });
  }

  private setVariant(v: Variant) {
    if (isBriefingOpen()) closeBriefing();
    telemetry.log('variant_switch', { from: this.variant, to: v, run: this.run });
    this.variant = v;
    if (this.phase !== 'over') this.endRun('quit');
    this.startRun();
    this.openBriefing();
  }

  // ---------- Run / season lifecycle ----------

  private startRun() {
    this.run++;
    this.phase = 'playing';
    this.runTime = 0;
    this.season = 1;
    this.score = 0;
    this.cleanStreak = 0;
    this.tool = 'dart';
    this.cooldown = 0;
    this.bugs = []; this.shots = []; this.fx = [];
    this.runStats = {
      dartShots: 0, cannonShots: 0, kills: 0, hostileKills: 0, docileKills: 0,
      hostileEscaped: 0, docileEscaped: 0, splits: 0, toolSwitches: 0,
    };
    this.banner.setVisible(false);
    this.placeNodes();

    const pop: Genome[] = [];
    for (let i = 0; i < C.startPopulation; i++) pop.push(randomGenome(C.startFertileAlleleChance, C.startAggressiveAlleleChance));
    telemetry.log('run_start', { run: this.run, variant: this.variant, config: { ...C } });
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
    this.seasonStats = { dartKills: 0, cannonKills: 0, docileKills: 0, hostileKills: 0, splits: 0 };
    // Queue the population as chains entering from alternating top corners.
    this.spawnQueue = [];
    this.lastInChain.clear();
    const len = Math.max(1, C.chainLength);
    const gap = C.segmentSpacing / C.bugSpeed;
    pop.forEach((g, i) => {
      const chain = Math.floor(i / len);
      const first = i % len === 0;
      this.spawnQueue.push({ g, chain, side: chain % 2 === 0 ? 1 : -1, delay: first && i > 0 ? 0.8 : gap });
    });
    this.spawnTimer = 0;
    telemetry.log('season_start', {
      run: this.run, season: this.season, population: pop.length,
      hostile: pop.filter(isHostile).length, ...averages(pop),
    });
  }

  private endSeason() {
    const result = breedingPass(this.escapees, C.litterSize, C.mutationRate);
    this.nextPopulation = result.nextPopulation;
    const hostileEscaped = this.escapees.filter(isHostile).length;
    const docileEscaped = this.escapees.length - hostileEscaped;
    const clean = hostileEscaped === 0 && docileEscaped >= C.domesticMinSurvivors;
    this.cleanStreak = clean ? this.cleanStreak + 1 : 0;

    telemetry.log('season_end', {
      run: this.run, season: this.season,
      escaped: this.escapees.length, hostileEscaped, docileEscaped, clean, cleanStreak: this.cleanStreak,
      breeders: result.breeders, offspring: result.offspring,
      nextPopulation: this.nextPopulation.length, nextHostile: this.nextPopulation.filter(isHostile).length,
      ...averages(this.nextPopulation), ...this.seasonStats,
    });

    if (this.escapees.length === 0) return this.endRun('wiped');
    if (this.cleanStreak >= C.domesticSeasons) { this.score += 500; return this.endRun('domesticated'); }
    if (this.nextPopulation.length >= C.overrunCap) return this.endRun('overrun');

    if (clean) this.score += 100;
    const verdict = hostileEscaped > 0
      ? `${hostileEscaped} hostile escaped. They'll breed more hostiles.`
      : docileEscaped < C.domesticMinSurvivors
        ? `No hostiles escaped, but only ${docileEscaped} docile survived (need ${C.domesticMinSurvivors}).`
        : `Clean season! ${C.domesticSeasons - this.cleanStreak} more to go.`;
    this.phase = 'recap';
    this.recapTimer = C.recapSeconds;
    this.banner.setText(
      `SEASON ${this.season} OVER\n${verdict}\n\n` +
      `escaped: ${docileEscaped} docile · ${hostileEscaped} hostile\n` +
      `${result.breeders} could breed → +${result.offspring} offspring\n` +
      `next swarm: ${this.nextPopulation.length} (${this.nextPopulation.filter(isHostile).length} hostile)`,
    ).setVisible(true);
  }

  private endRun(cause: Cause, at?: Pt) {
    const total = this.runStats.dartShots + this.runStats.cannonShots;
    const swarm = this.bugs.length + this.spawnQueue.length;
    telemetry.log('run_end', {
      run: this.run,
      variant: this.variant,
      duration: +this.runTime.toFixed(2),
      score: this.score,
      seasons: this.season,
      cause,
      x: Math.round(at?.x ?? this.playerX),
      y: Math.round(at?.y ?? PLAYER_Y),
      swarm: cause === 'overrun' || cause === 'domesticated' ? this.nextPopulation.length : swarm,
      ...this.runStats,
      cannonShare: total ? +(this.runStats.cannonShots / total).toFixed(2) : 0,
    });
    this.phase = 'over';
    this.endedAt = performance.now();
    if (cause === 'quit') return;
    const headline = {
      domesticated: `DOMESTICATED: the swarm is harmless.\nYOU WIN in ${this.season} season${this.season > 1 ? 's' : ''}`,
      overrun: `OVERRUN: the swarm grew to ${this.nextPopulation.length}`,
      bitten: 'BITTEN: a bug reached you',
      wiped: 'WIPED OUT: you killed every bug.\nNothing left to tame.',
    }[cause];
    this.banner.setText(`${headline}\nscore ${this.score}\n\npress R to go again`).setVisible(true);
    if (C.screenShake && cause === 'bitten') this.cameras.main.shake(250, 0.012);
  }

  private restart() {
    if (this.phase === 'briefing') return;
    if (this.phase === 'over') {
      telemetry.log('retry', { afterRun: this.run, secondsSinceEnd: +((performance.now() - this.endedAt) / 1000).toFixed(2) });
    } else {
      this.endRun('quit');
      telemetry.log('retry', { afterRun: this.run, secondsSinceEnd: 0, midRun: true });
    }
    this.startRun();
  }

  private switchTool() {
    if (this.phase === 'over' || this.phase === 'briefing') return;
    this.tool = this.tool === 'dart' ? 'cannon' : 'dart';
    this.cooldown = Math.min(this.cooldown, 0.15);
    this.runStats.toolSwitches++;
    telemetry.log('tool_switch', { run: this.run, season: this.season, tool: this.tool });
  }

  // ---------- Update ----------

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    if (this.phase === 'playing' || this.phase === 'recap') {
      this.runTime += dt;
      this.updatePlayer(dt);
      if (this.phase === 'playing') {
        this.updateSpawns(dt);
        this.updateBugs(dt);
        if (this.phase === 'playing') this.updateShots(dt);
        if (this.phase === 'playing' && this.spawnQueue.length === 0 && this.bugs.length === 0 && this.shots.length === 0) this.endSeason();
      } else {
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
      const prev = this.lastInChain.get(s.chain);
      const leader = prev && this.bugs.includes(prev) && !prev.hunting ? prev : null;
      const bug: Bug = {
        id: this.nextBugId++, x: s.side > 0 ? MARGIN : W - MARGIN, y: SPAWN_Y, dir: s.side, g: s.g,
        leader, path: [], hunting: false,
      };
      this.bugs.push(bug);
      this.lastInChain.set(s.chain, bug);
      this.spawnTimer += this.spawnQueue[0]?.delay ?? 0;
    }
  }

  private updateBugs(dt: number) {
    // Array order keeps every leader ahead of its followers, so followers read a fresh path.
    for (const b of this.bugs) {
      const aggr = aggression(b.g);
      if (aggr === 2 && !b.hunting && b.y > ZONE_TOP) this.startHunting(b);

      if (b.hunting) {
        const dx = this.playerX - b.x;
        if (Math.abs(dx) < C.chaseRange && Math.abs(dx) > 3) b.dir = Math.sign(dx);
        b.x += b.dir * C.bugSpeed * (1 + C.hunterSpeedBonus) * dt;
        b.y += C.descentSpeed * (1 + C.hunterSpeedBonus) * dt;
        this.bounceWalls(b);
      } else if (!b.leader) {
        b.x += b.dir * C.bugSpeed * dt;
        b.y += C.descentSpeed * dt;
        this.bounceWalls(b);
      } else {
        this.followLeader(b);
      }
      this.collideNodes(b);

      const last = b.path[b.path.length - 1];
      if (!last || Math.abs(last.x - b.x) + Math.abs(last.y - b.y) > 2) {
        b.path.push({ x: b.x, y: b.y });
        if (b.path.length > 60) b.path.shift();
      }

      if (Phaser.Math.Distance.Between(b.x, b.y, this.playerX, PLAYER_Y) < BUG_R + PLAYER_R) {
        this.endRun('bitten', { x: b.x, y: b.y });
        return;
      }
    }
    this.nodes = this.nodes.filter((n) => n.hp > 0);

    // Bugs that pass the bottom escape and will breed next season.
    for (const b of this.bugs.filter((o) => o.y > H + BUG_R)) {
      const hostile = isHostile(b.g);
      this.escapees.push(b.g);
      if (hostile) this.runStats.hostileEscaped++; else this.runStats.docileEscaped++;
      this.addRing(b.x, H - 4, hostile ? 0xff3b3b : 0x6fe39a, 28, 0.5);
      telemetry.log('escape', { run: this.run, season: this.season, x: Math.round(b.x), hostile, fert: fertility(b.g), aggr: aggression(b.g) });
      this.removeBug(b);
    }
  }

  private bounceWalls(b: Bug) {
    if (b.x < MARGIN) { b.x = MARGIN; b.dir = 1; }
    if (b.x > W - MARGIN) { b.x = W - MARGIN; b.dir = -1; }
  }

  // Place a follower on its leader's trail, segmentSpacing behind the leader.
  private followLeader(b: Bug) {
    const L = b.leader!;
    let prev: Pt = { x: L.x, y: L.y };
    let acc = 0;
    for (let i = L.path.length - 1; i >= 0; i--) {
      const p = L.path[i];
      const seg = Math.hypot(prev.x - p.x, prev.y - p.y);
      if (acc + seg >= C.segmentSpacing) {
        const t = (C.segmentSpacing - acc) / seg;
        b.dir = Math.sign(prev.x - p.x) || b.dir;
        b.x = prev.x + (p.x - prev.x) * t;
        b.y = prev.y + (p.y - prev.y) * t;
        return;
      }
      acc += seg;
      prev = p;
    }
    // Leader hasn't laid enough trail yet: wait at the start of it.
    if (L.path.length) { b.x = L.path[0].x; b.y = L.path[0].y; }
  }

  private collideNodes(b: Bug) {
    const hostile = isHostile(b.g);
    for (const n of this.nodes) {
      if (n.hp <= 0) continue;
      if (Math.abs(b.x - n.x) < NODE_SIZE / 2 + BUG_R && Math.abs(b.y - n.y) < NODE_SIZE / 2 + BUG_R) {
        if (hostile) { n.hp = 0; this.addRing(n.x, n.y, 0xffb347, 12, 0.25); continue; } // hostile bugs chew through nodes
        if (!b.leader && !b.hunting) { // docile heads steer around nodes; their followers trace the detour
          b.x = n.x - b.dir * (NODE_SIZE / 2 + BUG_R + 0.5);
          b.dir = -b.dir;
        }
      }
    }
  }

  private startHunting(b: Bug) {
    b.hunting = true;
    // Break out of the chain: whoever followed the hunter now follows the hunter's leader.
    for (const o of this.bugs) if (o.leader === b) { o.leader = b.leader; if (!o.leader) o.dir = b.dir; }
    b.leader = null;
    this.addRing(b.x, b.y, 0xff3b3b, 20, 0.35);
    telemetry.log('hunter_breakoff', { run: this.run, season: this.season, x: Math.round(b.x) });
  }

  // Remove a bug; anything following it becomes the head of a new chain (Centipede split).
  private removeBug(b: Bug) {
    this.bugs = this.bugs.filter((o) => o !== b);
    for (const o of this.bugs) if (o.leader === b) { o.leader = null; o.dir = b.dir; }
  }

  private updateShots(dt: number) {
    const remaining: Shot[] = [];
    for (const s of this.shots) {
      s.y -= (s.tool === 'dart' ? C.dartSpeed : C.cannonSpeed) * dt;
      let hit = s.y < HUD_H;

      const node = this.nodes.find((n) => Math.abs(s.x - n.x) < NODE_SIZE / 2 + 2 && Math.abs(s.y - n.y) < NODE_SIZE / 2 + 2);
      const bug = this.bugs.find((b) => Phaser.Math.Distance.Between(s.x, s.y, b.x, b.y) < BUG_R + (s.tool === 'dart' ? 3 : 5));

      if (s.tool === 'dart') {
        if (bug) { hit = true; this.killBug(bug, 'dart'); }
        else if (node) { hit = true; node.hp--; }
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
        // A blunt hit on the edge splits the bug: a clone, no crossover (GDD trait inheritance).
        clones.push({ id: this.nextBugId++, x: b.x, y: b.y - 2 * BUG_R, dir: -b.dir, g: cloneGenome(b.g), leader: null, path: [], hunting: false });
        this.seasonStats.splits++; this.runStats.splits++;
        this.addRing(b.x, b.y, 0xffffff, 16, 0.3);
      }
    }
    this.bugs.push(...clones);
    for (const n of this.nodes) if (Phaser.Math.Distance.Between(x, y, n.x, n.y) < C.cannonRadius) n.hp -= 2;
  }

  private killBug(b: Bug, tool: Tool) {
    this.removeBug(b);
    const hostile = isHostile(b.g);
    const fert = fertility(b.g);
    this.runStats.kills++;
    if (hostile) { this.runStats.hostileKills++; this.seasonStats.hostileKills++; this.score += C.hostileKillScore; }
    else { this.runStats.docileKills++; this.seasonStats.docileKills++; this.score -= C.docileKillPenalty; }
    if (tool === 'dart') this.seasonStats.dartKills++; else this.seasonStats.cannonKills++;
    this.floatText(b.x, b.y, hostile ? `+${C.hostileKillScore}` : `-${C.docileKillPenalty} docile`, hostile ? '#ffb347' : '#9aa8a2');
    telemetry.log('kill', { run: this.run, season: this.season, tool, hostile, fert, aggr: aggression(b.g), x: Math.round(b.x), y: Math.round(b.y) });
    if (C.killParticles) {
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
        this.fx.push({ x: b.x, y: b.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, r: 2, maxR: 2, t: 0, life: 0.35, color: FERT_COLORS[fert], kind: 'dot' });
      }
    }
  }

  private floatText(x: number, y: number, text: string, color: string) {
    const t = this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: '12px', color }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets: t, y: y - 26, alpha: 0, duration: 700, onComplete: () => t.destroy() });
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
      const a = 0.35 + 0.65 * Math.min(1, n.hp / C.nodeHp);
      g.fillStyle(0x2f5a3a, a).fillRect(n.x - NODE_SIZE / 2 + 1, n.y - NODE_SIZE / 2 + 1, NODE_SIZE - 2, NODE_SIZE - 2);
    }

    const pulse = Math.sin(this.time.now / 110) * 1.6;
    for (const b of this.bugs) {
      const fert = fertility(b.g);
      const aggr = aggression(b.g);
      const r = fert === 2 ? BUG_R + pulse : BUG_R;
      if (b.leader) g.lineStyle(3, 0x1f332c).lineBetween(b.x, b.y, b.leader.x, b.leader.y); // chain link
      g.fillStyle(FERT_COLORS[fert]).fillCircle(b.x, b.y, r);
      if (aggr > 0) {
        g.lineStyle(aggr === 2 ? 3 : 2, AGGR_COLORS[aggr]).strokeCircle(b.x, b.y, BUG_R + 1);
        if (aggr === 2) {
          for (let i = 0; i < 4; i++) {
            const a = (Math.PI / 2) * i + Math.PI / 4;
            g.lineBetween(b.x + Math.cos(a) * (BUG_R + 1), b.y + Math.sin(a) * (BUG_R + 1), b.x + Math.cos(a) * (BUG_R + 6), b.y + Math.sin(a) * (BUG_R + 6));
          }
        }
      }
      if (!b.leader) g.fillStyle(0x0b1110).fillCircle(b.x + b.dir * 4, b.y - 2, 2); // head: eye shows direction
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
    const hostile = this.bugs.filter((b) => isHostile(b.g)).length + this.spawnQueue.filter((s) => isHostile(s.g)).length;
    const hostileOut = this.escapees.filter(isHostile).length;
    const docileOut = this.escapees.length - hostileOut;
    const ready = this.cooldown <= 0 ? '' : '…';
    this.hud.setText(`SEASON ${this.season}  SWARM ${swarm}/${C.overrunCap}  HOSTILE ${hostile}  SCORE ${this.score}  ${this.tool.toUpperCase()}${ready} [Q]`);
    this.goal.setText(`ESCAPED this season: docile ${docileOut}/${C.domesticMinSurvivors} · hostile ${hostileOut} (must be 0)    [H] help  V${this.variant}`);
    this.stats.setText(telemetry.summaryLine());
  }
}
