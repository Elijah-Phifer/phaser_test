

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: '#41491aff',
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.setBaseURL('https://labs.phaser.io/');
    this.load.image('tiles', 'assets/tilemaps/iso/iso-64x64-outside.png');
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('player', 'assets/sprites/phaser-dude.png');

}

function create ()
{
    //this.add.image(0, 0, 'sky').setOrigin(0, 0);
    const mapData = new Phaser.Tilemaps.MapData({
    width: 10,
    height: 10,
    tileWidth: 64,
    tileHeight: 32,
    orientation: Phaser.Tilemaps.Orientation.ISOMETRIC,
    format: Phaser.Tilemaps.Formats.ARRAY_2D
    });

    const map = new Phaser.Tilemaps.Tilemap(this, mapData);

    const tileset = map.addTilesetImage('iso-64x64-outside', 'tiles');

    const layer = map.createBlankLayer('layer', tileset, 350, 200);

    const data = [
        [ 10, 11, 12, 13, 14, 15, 16, 10, 11, 12 ],
        [ 13, 11, 10, 12, 12, 15, 16, 10, 16, 10 ],
        [ 12, 10, 16, 13, 14, 15, 16, 16, 13, 12 ],
        [ 10, 11, 12, 13, 14, 15, 16, 10, 11, 12 ],
        [ 13, 11, 10, 12, 12, 15, 16, 10, 16, 10 ],
        [ 12, 10, 16, 13, 14, 15, 16, 16, 13, 12 ],
        [ 10, 11, 12, 13, 14, 15, 16, 10, 11, 12 ],
        [ 13, 11, 10, 12, 12, 15, 16, 10, 16, 10 ],
        [ 12, 10, 16, 13, 14, 15, 16, 16, 13, 12 ],
        [ 10, 11, 12, 13, 14, 15, 16, 10, 11, 12 ]
    ];

    layer.putTilesAt(data, 0, 0);

        // --- Helper to convert tile → world (center of tile) ---
    const tileCenterToWorld = (tx, ty) => {
      const wx = layer.tileToWorldX(tx) + map.tileWidth ;
      const wy = layer.tileToWorldY(ty) + map.tileHeight ;
      return { x: wx, y: wy };
    };

    // --- Player state (tile coords) ---
    this.playerTile = { x: 5, y: 5 };       // start in the middle-ish
    const start = tileCenterToWorld(this.playerTile.x, this.playerTile.y);

    // --- Player sprite ---
    this.player = this.add.sprite(start.x, start.y, 'player').setOrigin(0.5, 0.7);
    // Depth sort trick for iso: higher y draws on top
    this.player.depth = this.player.y;

}

function update ()
{
}

