// Every tunable gameplay number lives here and is exposed on the tuning panel.
// Values marked "next run" are read when a run starts; everything else is read live.

export const CONFIG = {
  // Player
  playerSpeed: 420, // px/s, keyboard strafe

  // Precision dart: fast, single target, only downs visibly fertile bugs
  dartCooldown: 0.16, // s
  dartSpeed: 900, // px/s
  dartMinFertility: 2, // fertility (0-2) needed for the dart to kill

  // Blunt cannon: slow, area kill, genetically blind, splits bugs at the blast edge
  cannonCooldown: 1.1, // s
  cannonSpeed: 520, // px/s
  cannonRadius: 46, // px, everything inside dies
  cannonSplitChance: 0.5, // chance a bug in the outer ring splits into a clone

  // Swarm movement
  bugSpeed: 150, // px/s horizontal
  descentSpeed: 17, // px/s vertical
  aggressionSpeedBonus: 0.35, // +35% speed per aggression level
  chaseRange: 130, // px, aggressive bugs in the bottom zone steer toward the player

  // Population & genetics
  startPopulation: 30, // next run
  chainLength: 6, // next run
  startFertileAlleleChance: 0.5, // next run
  startAggressiveAlleleChance: 0.3, // next run
  litterSize: 3, // offspring per pair of two fully fertile parents
  mutationRate: 0.05, // per-allele flip chance when breeding (GDD: 5% drift)
  overrunCap: 70, // swarm size at which the field is overrun (lose)

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
