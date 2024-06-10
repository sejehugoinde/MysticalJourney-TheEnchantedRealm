class Start extends Phaser.Scene {
    constructor() {
        super("startScene");
        this.my = { sprite: {}, text: {} };
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare.png", "KennyRocketSquare.fnt");
    }

    init() {
        this.TILESIZE = 16;
        this.SCALE = 2.0;
        this.TILEWIDTH = 40;
        this.TILEHEIGHT = 25;
    }

    create() {
        // Adjusting text positions and sizes
        this.my.text.startGame = this.add.bitmapText(10, 100, "rocketSquare", "Play the game");
        this.my.text.startGame.setFontSize(8); // Set the font size to a smaller value
        this.my.text.startGame.setDepth(1); // Set depth to render above tilemap layers

        // Position "Learn the rules" to the right of "Play the game"
        const startGameWidth = this.my.text.startGame.width;
        this.my.text.learnRules = this.add.bitmapText(10 + startGameWidth + 20, 100, "rocketSquare", "Learn the rules of the game"); // 20 pixels right
        this.my.text.learnRules.setFontSize(8); // Set the font size to a smaller value
        this.my.text.learnRules.setDepth(1); // Set depth to render above tilemap layers

        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("start", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);

        // Create townsfolk sprite
        // Use setOrigin() to ensure the tile space computations work well
        this.my.sprite.purpleTownie = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(5), "purple").setOrigin(0, 0);

        // Enable physics for the sprite without debug visuals
        this.physics.add.existing(this.my.sprite.purpleTownie);
        this.my.sprite.purpleTownie.body.setCollideWorldBounds(true);

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setSize(config.width, config.height); // Set camera size to match the game config
        this.cameras.main.setZoom(this.SCALE);

        // Add camera follow to the sprite
        this.cameras.main.startFollow(this.my.sprite.purpleTownie, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);

        this.activeCharacter = this.my.sprite.purpleTownie;

        // Add key handlers for arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Find the objects
        this.startGameLeft = this.map.createFromObjects("Objects", {
            name: "startGameLeft",
            key: "tilemap_sheet",
            frame: 11
        });
        this.startGameRight = this.map.createFromObjects("Objects", {
            name: "startGameRight",
            key: "tilemap_sheet",
            frame: 10
        });
        this.learnRulesRight = this.map.createFromObjects("Objects", {
            name: "learnRulesRight",
            key: "tilemap_sheet",
            frame: 10
        });
        this.learnRulesLeft = this.map.createFromObjects("Objects", {
            name: "learnRulesLeft",
            key: "tilemap_sheet",
            frame: 11
        });

        // Enable collision handling
        this.physics.world.enable(this.learnRulesRight, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.learnRulesLeft, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.startGameLeft, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.startGameRight, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(this.activeCharacter, this.learnRulesRight, (obj1, obj2) => {
            this.scene.start("enchantedForestScene");
        });

        this.physics.add.overlap(this.activeCharacter, this.learnRulesLeft, (obj1, obj2) => {
            this.scene.start("enchantedForestScene");
        });

        this.physics.add.overlap(this.activeCharacter, this.startGameLeft, (obj1, obj2) => {
            this.scene.start("enchantedForestScene");
        });

        this.physics.add.overlap(this.activeCharacter, this.startGameRight, (obj1, obj2) => {
            this.scene.start("enchantedForestScene");
        });

    }

    update() {
        // Reset velocity
        this.activeCharacter.body.setVelocity(0);

        if(this.cursors.space.isDown) {
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
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }
}
