import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  create() {
    this.add.text(20, 20, 'Pressure — scaffold OK', { color: '#9fe' });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 640,
  height: 720,
  backgroundColor: '#0b1110',
  scene: [BootScene],
});
