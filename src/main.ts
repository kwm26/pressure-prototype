import Phaser from 'phaser';
import { W, H } from './config';
import { GameScene } from './GameScene';
import { createTuningPanel } from './tuning';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#0b1110',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, // fit any laptop screen without scrolling
  scene: [GameScene],
});

createTuningPanel();

// Dev-only debug handle for stepping the simulation from the console.
if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;
