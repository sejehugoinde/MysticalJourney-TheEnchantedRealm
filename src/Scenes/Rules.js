// Sandra Sorensen
// Created: 6/6/2024
// Phaser: 3.80.0

class Rules extends Phaser.Scene {
    constructor() {
        super("rulesScene");
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
        // Sounds
        this.sound.stopAll()
        this.walkSound = this.sound.add('walk');

        // Adjusting text positions and sizes
        const textStyle = { fontSize: 8 };

        // Text in the game
        this.my.text.arrows = this.add.bitmapText(10, 50, "rocketSquare", "Use the arrows to move the character around", textStyle.fontSize);
        this.my.text.arrows = this.add.bitmapText(10, 70, "rocketSquare", "Use r-key to restart in current level", textStyle.fontSize);
        this.my.text.spaceBar = this.add.bitmapText(10, 90, "rocketSquare", "Use the space-bar to make the character jump up", textStyle.fontSize);
        this.my.text.weapon = this.add.bitmapText(10, 110, "rocketSquare", "If you equip a weapon then hold x-key to hit", textStyle.fontSize);
        this.my.text.worlds = this.add.bitmapText(10, 130, "rocketSquare", "You will have to go through three worlds\nin order to save the princess and win the game.\nIn every world you get spawned as a new character", textStyle.fontSize);
        this.my.text.startGame = this.add.bitmapText(20, 215, "rocketSquare", "Play the game", textStyle.fontSize);
        this.my.text.goBack = this.add.bitmapText(168, 215, "rocketSquare", "Go back", textStyle.fontSize);

        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("rules", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create player sprite
        // Use setOrigin() to ensure the tile space computations work well
        this.my.sprite.player = this.add.sprite(this.tileXtoWorld(1), this.tileYtoWorld(1), "darkCavePlayer").setOrigin(0, 0);

        // Enable physics for the sprite without debug visuals
        this.physics.add.existing(this.my.sprite.player);
        this.my.sprite.player.body.setCollideWorldBounds(true);

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setSize(config.width, config.height); // Set camera size to match the game config
        this.cameras.main.setZoom(this.SCALE);

        // Add camera follow to the sprite
        this.cameras.main.startFollow(this.my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);

        this.activeCharacter = this.my.sprite.player;

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
        this.goBackRight = this.map.createFromObjects("Objects", {
            name: "goBackRight",
            key: "tilemap_sheet",
            frame: 10
        });
        this.goBackLeft = this.map.createFromObjects("Objects", {
            name: "goBackLeft",
            key: "tilemap_sheet",
            frame: 11
        });

        // Enable collision handling
        this.physics.world.enable(this.startGameLeft, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.startGameRight, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.goBackRight, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.goBackLeft, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(this.activeCharacter, this.goBackRight, (obj1, obj2) => {
            this.scene.start("startScene");
        });

        this.physics.add.overlap(this.activeCharacter, this.goBackLeft, (obj1, obj2) => {
            this.scene.start("startScene");
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

        if (this.cursors.space.isDown) {
            this.activeCharacter.body.setVelocityY(-80);
        }

        // Check for arrow key inputs and move character accordingly
        if (this.cursors.left.isDown) {
            this.activeCharacter.body.setVelocityX(-100);
            if (!this.walkSound.isPlaying) {
                this.walkSound.play({ loop: true });
            }
            this.activeCharacter.flipX = true; // Flip the sprite to face left
        } else if (this.cursors.right.isDown) {
            this.activeCharacter.body.setVelocityX(100);
            if (!this.walkSound.isPlaying) {
                this.walkSound.play({ loop: true });
            }
            this.activeCharacter.flipX = false; // Flip the sprite to face right
        } else if (this.cursors.up.isDown) {
            this.activeCharacter.body.setVelocityY(-100);
            if (!this.walkSound.isPlaying) {
                this.walkSound.play({ loop: true });
            }
        } else if (this.cursors.down.isDown) {
            this.activeCharacter.body.setVelocityY(100);
            if (!this.walkSound.isPlaying) {
                this.walkSound.play({ loop: true });
            }
        }
        else{
            this.walkSound.stop();
        }
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }
}
