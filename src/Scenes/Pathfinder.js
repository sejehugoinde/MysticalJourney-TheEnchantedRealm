class Pathfinder extends Phaser.Scene {
    constructor() {
        super("pathfinderScene");
    }

    preload() {
    }

    init() {
        this.TILESIZE = 16;
        this.SCALE = 2.0;
        this.TILEWIDTH = 40;
        this.TILEHEIGHT = 25;
    }

    create() {
        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("three-farmhouses", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
        this.housesLayer = this.map.createLayer("Houses-n-Fences", this.tileset, 0, 0);

        // Create townsfolk sprite
        // Use setOrigin() to ensure the tile space computations work well
        my.sprite.purpleTownie = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(5), "purple").setOrigin(0, 0);

        // Enable physics for the sprite without debug visuals
        this.physics.add.existing(my.sprite.purpleTownie);
        my.sprite.purpleTownie.body.setCollideWorldBounds(true);

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setSize(config.width, config.height); // Set camera size to match the game config
        this.cameras.main.setZoom(this.SCALE);

        // Add camera follow to the sprite
        this.cameras.main.startFollow(my.sprite.purpleTownie, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);

        this.activeCharacter = my.sprite.purpleTownie;

        // Add key handlers for arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Find the port to next level in the "Objects" layer in Phaser
        this.leftPort = this.map.createFromObjects("Objects", {
            name: "leftPort",
            key: "tilemap_sheet",
            frame: 23
        })

        this.rightPort = this.map.createFromObjects("Objects", {
            name: "rightPort",
            key: "tilemap_sheet",
            frame: 22
        })

        // Enable collision handling
        this.physics.world.enable(this.leftPort, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.rightPort, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(my.sprite.purpleTownie, this.leftPort, (obj1, obj2) => {
            this.scene.start("pathfinderScene");
        });

        this.physics.add.overlap(my.sprite.purpleTownie, this.rightPort, (obj1, obj2) => {
            this.scene.start("pathfinderScene");
        });
    }

    update() {
        // Reset velocity
        this.activeCharacter.body.setVelocity(0);

        if(this.cursors.space.isDown)
        {
            this.activeCharacter.body.setVelocityY(-80);
        }

        // Check for arrow key inputs and move character accordingly
        if (this.cursors.left.isDown) {
            this.activeCharacter.body.setVelocityX(-100);
        } else if (this.cursors.right.isDown) {
            this.activeCharacter.body.setVelocityX(100);
        } else if (this.cursors.up.isDown) {
            this.activeCharacter.body.setVelocityY(-100);
        } else if (this.cursors.down.isDown) {
            this.activeCharacter.body.setVelocityY(100);
        }
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }
}