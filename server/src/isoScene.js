const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1220',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1100, height: 700 },
  physics: { default: 'arcade' },
  scene: { preload, create, update }
};


new Phaser.Game(config);

let map, layer, tileset, hero;

function preload() {
  // IMPORTANT: keys must match what you use below
  this.load.image('tilesImg', 'assets/spritesheet.png');
  this.load.tilemapTiledJSON('level1', 'assets/level1.json');

  // optional sprite to stand on the map
  //this.load.image('hero', 'assets/sprites/hero.png');
}

function create() {
    // Create the Tilemap from Tiled’s JSON
    map = this.make.tilemap({ key: 'level1' });

    // The FIRST argument must be the exact **Tileset Name** from Tiled
    // The SECOND argument is the key of the loaded image
    tileset = map.addTilesetImage('spritesheet', 'tilesImg');

    // Use the exact layer name from Tiled (e.g., "Ground" or "Layer 1")
    layer = map.createLayer('Tile Layer 1', tileset);
    layer1 = map.createLayer('Tile Layer 2', tileset);


    // Optional: position the layer (for isometric, a small offset usually helps)
    layer.setPosition(500, 0);
    layer.setScale(2);
    layer.setDepth(0);

    layer1.setPosition(400, 0);
    layer1.setScale(2);
    layer1.setDepth(1);

    // Camera & world bounds sized to the layer
    const worldW = layer.width;
    const worldH = layer.height;
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.centerOn(worldW / 2, worldH / 2);

  
}

function update() {
  // nothing yet
}