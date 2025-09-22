// === Tunables ===
const TILE = 100;           // tile size in pixels
const COLS = 8;             // grid width (columns)
const ROWS = 8;             // grid height (rows)
const MARGIN = 30;          // padding around board
const MOVE_MS_PER_TILE = 180; // tween time per tile (ms)

// Optional obstacles: 1 = wall, 0 = floor (COLS x ROWS)
const OBSTACLES = [
  // c0 1 2 3 4 5 6 7
  [ 0, 0, 0, 0, 0, 0, 0, 0 ], // r0
  [ 0, 1, 1, 0, 0, 0, 1, 0 ],
  [ 0, 0, 1, 0, 1, 0, 1, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0 ],
  [ 0, 0, 0, 0, 1, 1, 1, 0 ],
  [ 0, 1, 0, 0, 0, 0, 0, 0 ],
  [ 0, 1, 0, 1, 1, 1, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0 ], // r7
];

// === Directions enum (clockwise) ===
const DIRS = ["north", "east", "south", "west"];

// === Utility: clamp & bounds ===
const inBounds = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS;
const isBlocked = (c, r) => (inBounds(c, r) ? OBSTACLES[r][c] === 1 : true);

// === Grid World Scene ===
class GridWorld extends Phaser.Scene {
  constructor() { super({ key: 'GridWorld' }); }

  preload() {
    // We'll generate a simple square texture for the player at runtime.
  }

  create() {
    // --- Camera & sizing ---
    const W = COLS * TILE + MARGIN * 2;
    const H = ROWS * TILE + MARGIN * 2;
    this.scale.resize(W, H);
    this.cameras.main.setBackgroundColor('#0f1220');

    // --- Draw board grid ---
    this.gridGfx = this.add.graphics();
    this.gridGfx.lineStyle(2, 0x394264, 1);
    const left = MARGIN, top = MARGIN, right = MARGIN + COLS*TILE, bottom = MARGIN + ROWS*TILE;
    // outer border
    this.gridGfx.strokeRect(left, top, COLS*TILE, ROWS*TILE);
    // cell lines
    for (let c = 1; c < COLS; c++) {
      const x = MARGIN + c * TILE;
      this.gridGfx.lineBetween(x, top, x, bottom);
    }
    for (let r = 1; r < ROWS; r++) {
      const y = MARGIN + r * TILE;
      this.gridGfx.lineBetween(left, y, right, y);
    }

    // --- Draw obstacles ---
    this.blockGfx = this.add.graphics();
    this.blockGfx.fillStyle(0x242a47, 1);
    this.blockGfx.lineStyle(2, 0x5d6a9a, 1);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (OBSTACLES[r][c] === 1) {
          const { x, y } = this.gridToWorld(c, r);
          this.blockGfx.fillRect(x, y, TILE, TILE);
          this.blockGfx.strokeRect(x, y, TILE, TILE);
        }
      }
    }

    // --- Player texture (arrow triangle) ---
    const sz = Math.floor(TILE * 0.6);
    const key = 'playerTri';
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xe2e8f0, 1);
    g.lineStyle(4, 0x0f1220, 1);
    // draw a triangle pointing "up" (north)
    g.beginPath();
    g.moveTo(sz/2, 0);
    g.lineTo(sz, sz);
    g.lineTo(0, sz);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.generateTexture(key, sz, sz);
    g.destroy();

    // --- Player sprite & state ---
    this.dirIndex = 1; // 0 n, 1 e, 2 s, 3 w (start facing east)
    this.speedPerTile = MOVE_MS_PER_TILE;

    const startCol = 0, startRow = 0;
    const { x: px, y: py } = this.gridToWorldCenter(startCol, startRow);
    this.player = this.add.sprite(px, py, key);
    this.player.setOrigin(0.5);
    this.player.setDepth(10);
    this._applyRotation(); // rotate to match dirIndex

    // --- PUBLIC API (easy-to-use helpers) ---
    this.grid = {
      // Position helpers
      gridToWorld: (c, r) => this.gridToWorld(c, r),
      gridToWorldCenter: (c, r) => this.gridToWorldCenter(c, r),
      worldToGrid: (x, y) => this.worldToGrid(x, y),

      // Get/set
      getGridPos: () => this.getPlayerGrid(),
      setGridPos: (c, r, snap = true) => this.setPlayerGrid(c, r, snap),

      // Facing
      getFacing: () => DIRS[this.dirIndex],
      face: (dirName) => this.face(dirName),
      turnLeft: () => this.turn(-1),
      turnRight: () => this.turn(1),

      // Movement (all return a Promise that resolves when done)
      moveTo: (c, r) => this.moveTo(c, r),
      moveBy: (dc, dr) => this.moveBy(dc, dr),
      forward: (steps = 1) => this.forward(steps),

      // Collision & speed
      canMoveTo: (c, r) => inBounds(c, r) && !isBlocked(c, r),
      setSpeedMsPerTile: (ms) => { this.speedPerTile = Math.max(40, ms); },

      // Path helper: array of {c,r} or [c,r]
      playPath: (cells) => this.playPath(cells),
    };

    // --- Keyboard demo controls ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Tip text
    this.add.text(MARGIN, H - 22, '←/→ or Q/E: turn • ↑/W: forward • A/D: strafe • Speed: grid.setSpeedMsPerTile(ms)',
      { fontFamily: 'monospace', fontSize: 12, color: '#cbd5e1' });

    // Example: expose for console
    window.grid = this.grid;
  }

  update() {
    // Simple input mapping (one action at a time)
    if (this._busyTween) return; // avoid stacking

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyQ)) {
      this.grid.turnLeft();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.grid.turnRight();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.grid.forward(1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
      // strafe left relative to facing
      const [dc, dr] = this._leftDelta();
      this.grid.moveBy(dc, dr);
    } else if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
      // strafe right relative to facing
      const [dc, dr] = this._rightDelta();
      this.grid.moveBy(dc, dr);
    }
  }

  // === Coordinate helpers ===
  gridToWorld(c, r) { return { x: MARGIN + c*TILE, y: MARGIN + r*TILE }; }
  gridToWorldCenter(c, r) { const {x,y} = this.gridToWorld(c, r); return { x: x + TILE/2, y: y + TILE/2 }; }
  worldToGrid(x, y) {
    const c = Math.floor((x - MARGIN) / TILE);
    const r = Math.floor((y - MARGIN) / TILE);
    return { c, r };
  }

  getPlayerGrid() { return this.worldToGrid(this.player.x, this.player.y); }

  setPlayerGrid(c, r, snap = true) {
    if (!inBounds(c, r)) return false;
    const center = this.gridToWorldCenter(c, r);
    if (snap) {
      this.player.setPosition(center.x, center.y);
      return true;
    } else {
      return this._tweenTo(center.x, center.y);
    }
  }

  face(dirName) {
    const idx = DIRS.indexOf(dirName);
    if (idx >= 0) { this.dirIndex = idx; this._applyRotation(); }
  }

  turn(delta) {
    this.dirIndex = (this.dirIndex + delta + 4) % 4;
    this._applyRotation();
  }

  _applyRotation() {
    // base graphic points "north" (up). Rotate to match dirIndex.
    const angleDeg = [0, 90, 180, 270][this.dirIndex];
    this.tweens.add({ targets: this.player, angle: angleDeg, duration: 120, ease: 'Cubic.easeOut' });
  }

  // Facing deltas (col,row)
  _forwardDelta() { return [[0,-1],[1,0],[0,1],[-1,0]][this.dirIndex]; }
  _leftDelta()    { return [[-1,0],[0,-1],[1,0],[0,1]][this.dirIndex]; }
  _rightDelta()   { return [[1,0],[0,1],[-1,0],[0,-1]][this.dirIndex]; }

  async forward(steps = 1) {
    for (let i=0; i<steps; i++) {
      const [dc, dr] = this._forwardDelta();
      const ok = await this.moveBy(dc, dr);
      if (!ok) return false;
    }
    return true;
  }

  async moveBy(dc, dr) {
    const { c, r } = this.getPlayerGrid();
    return this.moveTo(c + dc, r + dr);
  }

  async moveTo(c, r) {
    if (!inBounds(c, r) || isBlocked(c, r)) return false;
    const { x, y } = this.gridToWorldCenter(c, r);
    await this._tweenTo(x, y);
    return true;
  }

  _tweenTo(x, y) {
    // Compute distance to set duration (supports diagonal paths if you ever allow them)
    const dx = x - this.player.x;
    const dy = y - this.player.y;
    const tiles = Math.hypot(dx, dy) / TILE;
    const duration = Math.max(60, Math.round(tiles * this.speedPerTile));

    return new Promise(resolve => {
      this._busyTween = this.tweens.add({
        targets: this.player,
        x, y,
        duration,
        ease: 'Sine.easeInOut',
        onComplete: () => { this._busyTween = null; resolve(true); }
      });
    });
  }

  async playPath(cells) {
    for (const step of cells) {
      const [c, r] = Array.isArray(step) ? step : [step.c, step.r];
      const ok = await this.moveTo(c, r);
      if (!ok) return false;
    }
    return true;
  }
}

// --- Boot game ---
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1220',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: COLS*TILE + MARGIN*2, height: ROWS*TILE + MARGIN*2 },
  scene: [GridWorld]
};
new Phaser.Game(config);
