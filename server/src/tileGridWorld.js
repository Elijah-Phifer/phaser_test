// --- Tunables ---
const TILE = 100;               // tile size (px)
const COLS = 8;
const ROWS = 8;
const MARGIN = 30;
const MOVE_MS_PER_TILE = 180;

// Choose tile indexes for your tileset image:
// We'll use 0 = floor, 1 = wall (adjust if your tileset uses different indices)
const FLOOR_IDX = 0;
const WALL_IDX  = 1;

// A tiny map definition using ints that match your tileset indices.
// (0 = floor, 1 = wall)
const MAP_DATA = [
  [0,0,0,0,0,0,0,0],
  [0,1,1,0,0,0,1,0],
  [0,0,1,0,1,0,1,0],
  [0,0,1,0,1,0,0,0],
  [0,0,0,0,1,1,1,0],
  [0,1,0,0,0,0,0,0],
  [0,1,0,1,1,1,0,0],
  [0,0,0,0,0,0,0,0],
];

// Directions (clockwise)
const DIRS = ["north", "east", "south", "west"];

class GridWorldTilemap extends Phaser.Scene {
  constructor() { super({ key: 'GridWorldTilemap' }); }

  preload() {
    // You can swap this for your own tileset image (spritesheet-like grid of tiles).
    // This one is from Phaser’s CDN with lots of square grid tiles.
    // this.load.setBaseURL('https://labs.phaser.io/');
    // this.load.image('tiles', 'assets/tilemaps/tiles/gridtiles.png');
    this.load.image('tiles', 'assets/tiles.png')
    this.load.spritesheet('car', 'assets/sprite_car_open0 (4).png', {frameWidth: 100, frameHeight: 100});
  }

  create() {
    // Size / camera
    const W = COLS * TILE + MARGIN * 2;
    const H = ROWS * TILE + MARGIN * 2;
    this.scale.resize(W, H);
    this.cameras.main.setBackgroundColor('#0f1220');

    // --- Build the Tilemap from raw data ---
    this.map = this.make.tilemap({
      data: MAP_DATA,
      tileWidth: TILE,
      tileHeight: TILE
    });

    // Important: the tileset name here ('tiles') must match the key you loaded.
    // If you use a spritesheet-like image with uniform tiles, addTilesetImage works great.
    this.tileset = this.map.addTilesetImage('tiles', null, TILE, TILE);

    // Create a single layer (index 0) and position it with a margin
    this.layer = this.map.createLayer(0, this.tileset, MARGIN, MARGIN);

    // Choose which tile indices collide. Here: walls collide.
    this.layer.setCollision(WALL_IDX, true);

    // Optional: draw debug outlines for colliding tiles
    // this._debugDrawCollisions();


    // Start pos + state
    this.dirIndex = 1; // east
    const startC = 0, startR = 0;
    const { x: px, y: py } = this._cellCenterToWorld(startC, startR);
    this.player = this.add.sprite(px, py, 'car').setOrigin(0.5).setDepth(10);
    this.speedPerTile = MOVE_MS_PER_TILE;
    this._applyRotation();

    // --- Public API (same shape as before) ---
    this.grid = {
      // Coordinate helpers (use layer/world helpers under the hood)
      gridToWorld: (c, r) => this._cellTopLeftToWorld(c, r),
      gridToWorldCenter: (c, r) => this._cellCenterToWorld(c, r),
      worldToGrid: (x, y) => this._worldToCell(x, y),

      getGridPos: () => this._getPlayerCell(),
      setGridPos: (c, r, snap = true) => this._setPlayerCell(c, r, snap),

      getFacing: () => DIRS[this.dirIndex],
      face: (dirName) => this._face(dirName),
      turnLeft: () => this._turn(-1),
      turnRight: () => this._turn(1),

      moveTo: (c, r) => this._moveTo(c, r),
      moveBy: (dc, dr) => this._moveBy(dc, dr),
      forward: (steps = 1) => this._forward(steps),

      // Collision against the tilemap:
      canMoveTo: (c, r) => this._canMoveTo(c, r),

      setSpeedMsPerTile: (ms) => { this.speedPerTile = Math.max(40, ms); },
      playPath: (cells) => this._playPath(cells),
    };

    // Keyboard demo (same feel)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Tip text
    this.add.text(MARGIN, H - 22,
      'Tilemap: ←/→ or Q/E turn • ↑/W forward • A/D strafe • grid.setSpeedMsPerTile(ms)',
      { fontFamily: 'monospace', fontSize: 12, color: '#cbd5e1' });

    // Expose for console play
    window.grid = this.grid;
  }

  update() {
    if (this._busyTween) return;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyQ)) {
      this.grid.turnLeft();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.grid.turnRight();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.grid.forward(1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
      const [dc, dr] = this._leftDelta();
      this.grid.moveBy(dc, dr);
    } else if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
      const [dc, dr] = this._rightDelta();
      this.grid.moveBy(dc, dr);
    }
  }

  // ---------- Tilemap-aware helpers ----------
  // Use layer.tileToWorldX/Y and worldToTileX/Y to stay in sync with the tilemap.
  _cellTopLeftToWorld(c, r) {
    return {
      x: this.layer.tileToWorldX(c),
      y: this.layer.tileToWorldY(r),
    };
  }
  _cellCenterToWorld(c, r) {
    return {
      x: this.layer.tileToWorldX(c) + TILE / 2,
      y: this.layer.tileToWorldY(r) + TILE / 2,
    };
  }
  _worldToCell(x, y) {
    return {
      c: this.layer.worldToTileX(x),
      r: this.layer.worldToTileY(y),
    };
  }

  _getPlayerCell() { return this._worldToCell(this.player.x, this.player.y); }

  _setPlayerCell(c, r, snap = true) {
    if (!this._inBounds(c, r)) return false;
    const { x, y } = this._cellCenterToWorld(c, r);
    if (snap) { this.player.setPosition(x, y); return true; }
    return this._tweenTo(x, y);
  }

  _face(dirName) {
    const idx = DIRS.indexOf(dirName);
    if (idx >= 0) { this.dirIndex = idx; this._applyRotation(); }
  }
  _turn(delta) { this.dirIndex = (this.dirIndex + delta + 4) % 4; this._applyRotation(); }
  _applyRotation() {
    const deg = [0, 90, 180, 270][this.dirIndex];
    this.tweens.add({ targets: this.player, angle: deg, duration: 120, ease: 'Cubic.easeOut' });
  }

  _forwardDelta() { return [[0,-1],[1,0],[0,1],[-1,0]][this.dirIndex]; }
  _leftDelta()    { return [[-1,0],[0,-1],[1,0],[0,1]][this.dirIndex]; }
  _rightDelta()   { return [[1,0],[0,1],[-1,0],[0,-1]][this.dirIndex]; }

  async _forward(steps = 1) {
    for (let i = 0; i < steps; i++) {
      const [dc, dr] = this._forwardDelta();
      const ok = await this._moveBy(dc, dr);
      if (!ok) return false;
    }
    return true;
  }
  async _moveBy(dc, dr) {
    const { c, r } = this._getPlayerCell();
    return this._moveTo(c + dc, r + dr);
  }
  async _moveTo(c, r) {
    if (!this._canMoveTo(c, r)) return false;
    const { x, y } = this._cellCenterToWorld(c, r);
    await this._tweenTo(x, y);
    return true;
  }
  _tweenTo(x, y) {
    const dx = x - this.player.x, dy = y - this.player.y;
    const tiles = Math.hypot(dx, dy) / TILE;
    const duration = Math.max(60, Math.round(tiles * this.speedPerTile));
    return new Promise(resolve => {
      this._busyTween = this.tweens.add({
        targets: this.player, x, y, duration, ease: 'Sine.easeInOut',
        onComplete: () => { this._busyTween = null; resolve(true); }
      });
    });
  }

  _inBounds(c, r) {
    return c >= 0 && c < COLS && r >= 0 && r < ROWS;
  }
  _canMoveTo(c, r) {
    if (!this._inBounds(c, r)) return false;
    // Check the tile at (c,r). If it's a wall index, block.
    const t = this.layer.getTileAt(c, r, true);
    return t.index !== WALL_IDX;
  }

  async _playPath(cells) {
    for (const step of cells) {
      const [c, r] = Array.isArray(step) ? step : [step.c, step.r];
      const ok = await this._moveTo(c, r);
      if (!ok) return false;
    }
    return true;
  }

  // Optional visualizer for colliding tiles
  _debugDrawCollisions() {
    const debugGfx = this.add.graphics().setScrollFactor(0);
    this.layer.renderDebug(debugGfx, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(255, 30, 30, 120),
      faceColor: new Phaser.Display.Color(255, 255, 255, 120)
    });
  }
}

// Boot
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1220',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH,
           width: COLS * TILE + MARGIN * 2, height: ROWS * TILE + MARGIN * 2 },
  scene: [GridWorldTilemap]
});
