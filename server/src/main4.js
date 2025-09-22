
    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config);

    function preload ()
    {
        // this.load.image('sky', 'assets/sky.png');
        // this.load.image('ground', 'assets/platform.png');
        // this.load.image('star', 'assets/star.png');
        // this.load.image('bomb', 'assets/bomb.png');
        // this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });


        this.load.spritesheet('car11', 'assets/sprite_car_open0 (1).png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('car12', 'assets/sprite_car_open0 (2).png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('car13', 'assets/sprite_car_open0 (3).png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('car14', 'assets/sprite_car_open0 (4).png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('car21', 'assets/sprite_car0 (1).png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('car22', 'assets/sprite_car0 (2).png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('car23', 'assets/sprite_car0 (3).png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('car24', 'assets/sprite_car0 (4).png', { frameWidth: 100, frameHeight: 100 });

        this.load.setBaseURL('https://labs.phaser.io/');
        this.load.image('tiles', 'assets/tilemaps/tiles/gridtiles.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/simple-map.json');
        this.load.image('player', 'assets/sprites/phaser-dude.png');
    }

    function create ()
    {
        // 1) Make the tilemap + layer
        this.map = this.make.tilemap({ key: 'map', tileWidth: 100, tileHeight: 100 });
        this.tileset = this.map.addTilesetImage('tiles');   // matches the key you loaded
        this.layer = this.map.createLayer('Level1', this.tileset);

    }

    function update ()
    {
    }