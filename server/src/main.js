// Base game size (virtual resolution). Change to make it “bigger” logically.
const GAME_W = 1280;
const GAME_H = 720;

var config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1220',
  scale: {
    mode: Phaser.Scale.FIT,          // keep aspect, fit inside browser
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_W,
    height: GAME_H
  },
  scene: { preload, create, update }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('sky', 'assets/sky.png');
}

function create() {
  this.add.image(GAME_W/2, GAME_H/2, 'sky');
}

function update() { 
  
}
