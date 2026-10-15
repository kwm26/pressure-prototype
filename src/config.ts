// Every tunable gameplay number lives here and is exposed on the tuning panel.
// Values marked "next run" are read when a run starts; everything else is read live.

export const CONFIG = {
  // Player
  playerSpeed: 420, // px/s, keyboard movement
  playerMoveHeight: 110, // px the player can move up inside the bottom zone (0 = locked to the floor)

  // Precision dart: fast, one bug per shot, lets you spare docile bugs
  dartCooldown: 0.22, // s
  dartSpeed: 900, // px/s

  // Blunt cannon: slow, area kill, genetically blind (kills docile bugs too), splits bugs at the blast edge
  cannonCooldown: 1.1, // s
  cannonSpeed: 520, // px/s
  cannonRadius: 46, // px, everything inside dies
  cannonSplitChance: 0.5, // chance a bug in the outer ring splits into a clone

  // Swarm movement
  bugSpeed: 150, // px/s, chain head horizontal speed
  descentSpeed: 17, // px/s, chain head vertical speed
  segmentSpacing: 20, // px between segments in a chain
  hunterSpeedBonus: 0.6, // hunters (aggression 2) move this much faster once they break off
  chaseRange: 160, // px, hunters in the bottom zone steer toward the player within this range

  // Population & genetics
  startPopulation: 30, // next run
  chainLength: 6, // next run
  startFertileAlleleChance: 0.5, // next run
  startAggressiveAlleleChance: 0.3, // next run
  litterSize: 3, // offspring per pair of two fully fertile parents
  mutationRate: 0.05, // per-allele flip chance when breeding (GDD: 5% drift)
  overrunCap: 70, // swarm size at which the field is overrun (lose)

  // Win: Domestication (GDD) - a season where only docile bugs escape
  domesticMinSurvivors: 8, // docile escapees needed for a clean season
  domesticSeasons: 1, // clean seasons in a row needed to win
  hostileKillScore: 10,
  docileKillPenalty: 15,

  // Field
  nodeCount: 28, // next run
  nodeHp: 3,

  // Season pacing
  recapSeconds: 2.2,

  // Juice (max two, both switchable)
  screenShake: true,
  killParticles: true,
};

export type Config = typeof CONFIG;

// Fixed layout constants (not gameplay tuning)
export const W = 640;
export const H = 720;
export const HUD_H = 40;
export const PLAYER_Y = 688;
export const ZONE_TOP = 560;
export const BUG_R = 9;
export const PLAYER_R = 10;
export const NODE_SIZE = 18;
export const MARGIN = 12;
