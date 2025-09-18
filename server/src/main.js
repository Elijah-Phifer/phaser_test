// Base game size (virtual resolution). Change to make it “bigger” logically.
const GAME_SIZE = 1280;
const TILE = 64;  // tile size
const GRID_W = 8;   // how many tiles fit horizontally
const GRID_H = 8;   // how many tiles fit vertically
const PADDING = 30; // padding around the edges
const BOARD_W = GRID_W*TILE;  // how many tiles wide
const BOARD_H = GRID_H*TILE;  // how many tiles high



var config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1220',
  scale: {
    mode: Phaser.Scale.FIT,          // keep aspect, fit inside browser
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: BOARD_W + PADDING*2,
    height: BOARD_H + PADDING*2
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let hero, gridGfx;

function preload() {
  const g = this.add.graphics();
  g.fillStyle(0x4cc9f0, 1); // light blue
  g.fillRoundedRect(0, 0, TILE-12, TILE-12, 10);
  g.generateTexture('hero', TILE-12, TILE-12);
  g.destroy();
//  this.load.image('sky', 'assets/sky.png');
}

function create() {
 // this.add.image(BOARD_W/2, BOARD_H/2, 'sky');
  gridGfx = this.add.graphics();
  gridGfx.lineStyle(2, 0x2a2f45, 1);
  gridGfx.strokeRect(PADDING, PADDING, BOARD_W, BOARD_H);

  for (let x = 1; x < GRID_W; x++) {
    const px = PADDING + x * TILE;
    gridGfx.lineBetween(px, PADDING, px, PADDING + BOARD_H);
  }
  for (let y = 1; y < GRID_H; y++) {
    const py = PADDING + y * TILE;
    gridGfx.lineBetween(PADDING, py, PADDING + BOARD_W, py);
  }

  // add hero at grid (3,3)
  const start = { gx: 3, gy: 3 };
  const { wx, wy } = tileToWorld(start.gx, start.gy);
  hero = this.add.sprite(wx, wy, 'hero').setOrigin(0.5);
  hero.setData({ gx: start.gx, gy: start.gy });

  // keyboard arrows
  this.input.keyboard.on('keydown-UP', () => moveBy(0,-1, this));
  this.input.keyboard.on('keydown-DOWN', () => moveBy(0, 1, this));
  this.input.keyboard.on('keydown-LEFT', () => moveBy(-1,0, this));
  this.input.keyboard.on('keydown-RIGHT', () => moveBy(1,0, this));
}

// ==== helpers ====
function tileToWorld(gx, gy) {
  const wx = PADDING + gx * TILE + TILE/2;
  const wy = PADDING + gy * TILE + TILE/2;
  return { wx, wy };
}

function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

function moveBy(dx, dy, scene) {
  let gx = hero.getData('gx');
  let gy = hero.getData('gy');
  gx = clamp(gx + dx, 0, GRID_W-1);
  gy = clamp(gy + dy, 0, GRID_H-1);
  hero.setData('gx', gx); hero.setData('gy', gy);
  const { wx, wy } = tileToWorld(gx, gy);
  scene.tweens.add({ targets: hero, x: wx, y: wy, duration: 100 });
}

function update() { 

}
