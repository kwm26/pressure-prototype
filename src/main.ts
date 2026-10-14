import Phaser from 'phaser';
import { W, H } from './config';
import { GameScene } from './GameScene';
import { createTuningPanel } from './tuning';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#0b1110',
  scene: [GameScene],
});

createTuningPanel();
