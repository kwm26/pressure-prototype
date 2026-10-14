import { Pane } from 'tweakpane';
import { CONFIG } from './config';
import { log } from './telemetry';

// On-screen tuning panel. Every change is logged so Loop Log entries can be traced in telemetry.
export function createTuningPanel() {
  const pane = new Pane({ title: 'Tuning (next run = applies on R)', expanded: false });

  const f = (title: string) => pane.addFolder({ title, expanded: false });
  const player = f('Player');
  player.addBinding(CONFIG, 'playerSpeed', { min: 100, max: 900, step: 10 });

  const dart = f('Precision dart');
  dart.addBinding(CONFIG, 'dartCooldown', { min: 0.05, max: 1, step: 0.01 });
  dart.addBinding(CONFIG, 'dartSpeed', { min: 300, max: 1500, step: 10 });
  dart.addBinding(CONFIG, 'dartMinFertility', { min: 0, max: 2, step: 1 });

  const cannon = f('Blunt cannon');
  cannon.addBinding(CONFIG, 'cannonCooldown', { min: 0.2, max: 4, step: 0.05 });
  cannon.addBinding(CONFIG, 'cannonSpeed', { min: 200, max: 1200, step: 10 });
  cannon.addBinding(CONFIG, 'cannonRadius', { min: 10, max: 120, step: 1 });
  cannon.addBinding(CONFIG, 'cannonSplitChance', { min: 0, max: 1, step: 0.05 });

  const swarm = f('Swarm movement');
  swarm.addBinding(CONFIG, 'bugSpeed', { min: 40, max: 400, step: 5 });
  swarm.addBinding(CONFIG, 'descentSpeed', { min: 4, max: 60, step: 1 });
  swarm.addBinding(CONFIG, 'aggressionSpeedBonus', { min: 0, max: 1, step: 0.05 });
  swarm.addBinding(CONFIG, 'chaseRange', { min: 0, max: 400, step: 5 });

  const gen = f('Population & genetics');
  gen.addBinding(CONFIG, 'startPopulation', { min: 4, max: 80, step: 1, label: 'startPop (next run)' });
  gen.addBinding(CONFIG, 'chainLength', { min: 1, max: 15, step: 1, label: 'chainLen (next run)' });
  gen.addBinding(CONFIG, 'startFertileAlleleChance', { min: 0, max: 1, step: 0.05, label: 'fertAllele% (next run)' });
  gen.addBinding(CONFIG, 'startAggressiveAlleleChance', { min: 0, max: 1, step: 0.05, label: 'aggrAllele% (next run)' });
  gen.addBinding(CONFIG, 'litterSize', { min: 0, max: 8, step: 1 });
  gen.addBinding(CONFIG, 'mutationRate', { min: 0, max: 0.5, step: 0.01 });
  gen.addBinding(CONFIG, 'overrunCap', { min: 10, max: 200, step: 1 });

  const field = f('Field & pacing');
  field.addBinding(CONFIG, 'nodeCount', { min: 0, max: 80, step: 1, label: 'nodes (next run)' });
  field.addBinding(CONFIG, 'nodeHp', { min: 1, max: 10, step: 1 });
  field.addBinding(CONFIG, 'recapSeconds', { min: 0.5, max: 5, step: 0.1 });

  const juice = f('Juice');
  juice.addBinding(CONFIG, 'screenShake');
  juice.addBinding(CONFIG, 'killParticles');

  pane.on('change', (ev) => {
    if (ev.last === false) return; // only log the final value of a drag
    const key = (ev.target as unknown as { key: string }).key;
    log('tune', { key, value: ev.value });
  });

  return pane;
}
