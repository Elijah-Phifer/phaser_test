const TILE_WIDTH = 100;
const TILE_HEIGHT = 100;
const TILE_MARGIN = 0;
const TILE_SPACING = 0;
const COLS = 8;
const ROWS = 4;
const TILE = 100;               // tile size (px)

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1220',
  pixelArt:true,
  scale: {
    mode: Phaser.Scale.FIT,          // keep aspect, fit inside browser
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: COLS * TILE + TILE_MARGIN * 2,
    height: ROWS * TILE + TILE_MARGIN * 2
  },
  scene: { preload, create, update }
};

new Phaser.Game(config);

function preload() {
    this.load.image('tiles', 'assets/tiles.png');
}

function create() {

    const data = [
        [0, 0, 1, 1, 2, 2, 1, 0],
        [0, 1, 1, 2, 2, 1, 0, 0],
        [1, 1, 2, 2, 1, 0, 0, 0],
        [2, 2, 2, 1, 0, 0, 1, 1]
    ];

    const map = this.make.tilemap({
        data: data,
        tileWidth: TILE_WIDTH,
        tileHeight: TILE_HEIGHT
    });

    const tileset = map.addTilesetImage('tiles', 'tiles', TILE_WIDTH, TILE_HEIGHT, TILE_MARGIN, TILE_SPACING);
    const layer = map.createLayer(0, tileset, 0, 0);

    this.cameras.main.setBounds(0, 0, layer.width, layer.height);
    this.cameras.main.centerOn(layer.width / 2, layer.height / 2);
    // Optionally resize the canvas to exactly fit the map:
    this.scale.resize(layer.width, layer.height);
}

function update() {
  // not used, but referenced in config so keep it defined
}