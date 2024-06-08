class EnchantedForest extends Phaser.Scene {
    constructor() {
        super("enchantedForestScene");
    }

    preload() { }

    init() {
        this.TILESIZE = 16;
        this.SCALE = 2.0;
        this.TILEWIDTH = 40;
        this.TILEHEIGHT = 25;
    }

    create() {
        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("enchantedForest", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map using the correct key
        this.tileset = this.map.addTilesetImage("colored_tilemap_packed", "colored_tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
        this.housesLayer = this.map.createLayer("Houses-n-Fences", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({ collides: true });

        // Create townsfolk sprite
        // Use setOrigin() to ensure the tile space computations work well
        this.purpleTownie = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(5), "purple").setOrigin(0, 0);

        // Create orcs
        this.weakOrc = this.physics.add.sprite(this.tileXtoWorld(25), this.tileYtoWorld(15), "weakOrch").setOrigin(0,0);

        // Enable physics for the sprite without debug visuals
        this.physics.add.existing(this.purpleTownie);
        this.purpleTownie.body.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(this.purpleTownie, this.groundLayer, () => {
        });
        this.physics.add.collider(this.weakOrc, this.groundLayer);


        // Create sword sprite using a frame from the spritesheet
        this.sword = this.add.sprite(0, 0, "colored_tilemap_sheet", 70).setOrigin(0.5, 0.5);

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setSize(config.width, config.height); // Set camera size to match the game config
        this.cameras.main.setZoom(this.SCALE);

        // Add camera follow to the sprite
        this.cameras.main.startFollow(this.purpleTownie, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);

        this.activeCharacter = this.purpleTownie;

        // Add key handlers for arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Find the port to next level in the "Objects" layer in Phaser
        this.leftPort = this.map.createFromObjects("Objects", {
            name: "leftPort",
            key: "colored_tilemap_sheet",
            frame: 23
        });

        this.rightPort = this.map.createFromObjects("Objects", {
            name: "rightPort",
            key: "colored_tilemap_sheet",
            frame: 22
        });

        this.fire = this.map.createFromObjects("Objects", {
            name: "fire",
            key: "colored_tilemap_sheet",
            frame: 136
        });
 
        this.key = this.map.createFromObjects("Objects", {
            name: "key",
            key: "colored_tilemap_sheet",
            frame: 90
        });

        // Enable collision handling
        this.physics.world.enable(this.leftPort, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.rightPort, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(this.purpleTownie, this.leftPort, (obj1, obj2) => {
            this.scene.start("mysticalCastle");
        });

        this.physics.add.overlap(this.purpleTownie, this.rightPort, (obj1, obj2) => {
            this.scene.start("mysticalCastle");
        });
    }

    update() {
        // Reset velocity
        this.activeCharacter.body.setVelocity(0);

        if (this.cursors.space.isDown) {
            this.activeCharacter.body.setVelocityY(-80);
        }

        // Check for arrow key inputs and move character accordingly
        if (this.cursors.left.isDown) {
            this.activeCharacter.body.setVelocityX(-100);
            this.activeCharacter.flipX = true; // Flip the sprite to face left
        } else if (this.cursors.right.isDown) {
            this.activeCharacter.body.setVelocityX(100);
            this.activeCharacter.flipX = false; // Flip the sprite to face right
        } else if (this.cursors.up.isDown) {
            this.activeCharacter.body.setVelocityY(-100);
        } else if (this.cursors.down.isDown) {
            this.activeCharacter.body.setVelocityY(100);
        }

        // Update sword position relative to the character
        this.updateSwordPosition();
    }

    updateSwordPosition() {
        // Adjust these offsets to position the sword correctly
        const swordOffsetX = this.activeCharacter.flipX ? -5 : 5; // Adjust this value to position the sword horizontally
        const swordOffsetY = 5;  // Adjust this value to position the sword vertically

        // Update the sword position
        this.sword.x = this.activeCharacter.x + swordOffsetX;
        this.sword.y = this.activeCharacter.y + swordOffsetY;
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }
}
