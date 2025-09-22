// Base game size (virtual resolution). Change to make it “bigger” logically.
const GAME_SIZE = 1280;
const TILE = 100;            // tile size (matches sprite frame size)
const GRID_W = 8;
const GRID_H = 8;
const PADDING = 30;
const BOARD_W = GRID_W * TILE;
const BOARD_H = GRID_H * TILE;

var config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1220',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: BOARD_W + PADDING * 2,
    height: BOARD_H + PADDING * 2
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let hero, gridGfx;

function preload () {
  // Four separate sheets: one per facing. Each frame = 100x100.
  this.load.spritesheet('car_left',  'assets/sprite_car_open0 (1).png',  { frameWidth: 100, frameHeight: 100 });
  this.load.spritesheet('car_down',  'assets/sprite_car_open0 (2).png',  { frameWidth: 100, frameHeight: 100 });
  this.load.spritesheet('car_right', 'assets/sprite_car_open0 (3).png', { frameWidth: 100, frameHeight: 100 });
  this.load.spritesheet('car_up',    'assets/sprite_car_open0 (4).png',    { frameWidth: 100, frameHeight: 100 });
}

function create () {
  // grid
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

  // Animations (assumes each sheet has at least 4 frames; adjust end as needed)
  this.anims.create({
    key: 'drive_left',
    frames: this.anims.generateFrameNumbers('car_left', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'drive_down',
    frames: this.anims.generateFrameNumbers('car_down', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'drive_right',
    frames: this.anims.generateFrameNumbers('car_right', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'drive_up',
    frames: this.anims.generateFrameNumbers('car_up', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  // add hero at grid (3,3), facing up by default
  const start = { gx: 3, gy: 3 };
  const { wx, wy } = tileToWorld(start.gx, start.gy);
  hero = this.add.sprite(wx, wy, 'car_up', 0).setOrigin(0.5);
  hero.setData({ gx: start.gx, gy: start.gy });

  // keyboard arrows
  this.input.keyboard.on('keydown-UP',    () => moveBy(0, -1, this, 'up'));
  this.input.keyboard.on('keydown-DOWN',  () => moveBy(0,  1, this, 'down'));
  this.input.keyboard.on('keydown-LEFT',  () => moveBy(-1, 0, this, 'left'));
  this.input.keyboard.on('keydown-RIGHT', () => moveBy( 1, 0, this, 'right'));
}

// ==== helpers ====
function tileToWorld(gx, gy) {
  const wx = PADDING + gx * TILE + TILE / 2;
  const wy = PADDING + gy * TILE + TILE / 2;
  return { wx, wy };
}

function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

const FACE_TO_SHEET = {
  left:  'car_left',
  down:  'car_down',
  right: 'car_right',
  up:    'car_up'
};
const FACE_TO_ANIM = {
  left:  'drive_left',
  down:  'drive_down',
  right: 'drive_right',
  up:    'drive_up'
};

function moveBy(dx, dy, scene, dir) {
  let gx = hero.getData('gx');
  let gy = hero.getData('gy');

  const nextGx = clamp(gx + dx, 0, GRID_W - 1);
  const nextGy = clamp(gy + dy, 0, GRID_H - 1);

  // Turn: swap to the correct sheet + start that direction's animation
  hero.setTexture(FACE_TO_SHEET[dir]);
  hero.play(FACE_TO_ANIM[dir], true);

  hero.setData('gx', nextGx);
  hero.setData('gy', nextGy);

  const { wx, wy } = tileToWorld(nextGx, nextGy);

  // Move; when done, stop anim and idle on frame 0 for that facing
  scene.tweens.add({
    targets: hero,
    x: wx,
    y: wy,
    duration: 1000,
    ease: 'Quad.easeOut',
    onComplete: () => {
      hero.stop();
      hero.setFrame(0); // idle frame; change if you want a different idle look
    }
  });
}

function update () { }
