// Sandra Sorensen
// Created: 6/6/2024
// Phaser: 3.80.0

class EndCredit extends Phaser.Scene {
    constructor() {
        super("endCreditScene");
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
        
        // Text in scene
        this.my.text.startGame = this.add.bitmapText(10, 180, "rocketSquare", "Play the game again");
        this.my.text.startGame.setFontSize(8); 
        this.my.text.learnRules = this.add.bitmapText(160, 180, "rocketSquare", "Go back to the start");
        this.my.text.learnRules.setFontSize(8);

        // Create a new tilemap
        this.map = this.add.tilemap("end", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create player sprite
        this.my.sprite.player = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(7), "playerMysticalCastle").setOrigin(0, 0);
        
        // Enable physics for the sprite without debug visuals
        this.physics.add.existing(this.my.sprite.player);
        this.my.sprite.player.body.setCollideWorldBounds(true);

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setSize(config.width, config.height); 
        this.cameras.main.setZoom(this.SCALE);

        // Add camera follow to the sprite
        this.cameras.main.startFollow(this.my.sprite.player, true, 0.25, 0.25); 
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
        this.backToStartLeft = this.map.createFromObjects("Objects", {
            name: "backToStartLeft",
            key: "tilemap_sheet",
            frame: 11
        });
        this.backToStartRight = this.map.createFromObjects("Objects", {
            name: "backToStartRight",
            key: "tilemap_sheet",
            frame: 10
        });

        // Enable collision handling
        this.physics.world.enable(this.backToStartRight, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.backToStartLeft, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.startGameLeft, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.startGameRight, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(this.activeCharacter, this.backToStartRight, (obj1, obj2) => {
            this.scene.start("startScene");
        });

        this.physics.add.overlap(this.activeCharacter, this.backToStartLeft, (obj1, obj2) => {
            this.scene.start("startScene");
        });

        this.physics.add.overlap(this.activeCharacter, this.startGameLeft, (obj1, obj2) => {
            this.scene.start("enchantedForestScene");
        });

        this.physics.add.overlap(this.activeCharacter, this.startGameRight, (obj1, obj2) => {
            this.scene.start("enchantedForestScene");
        });

        // Add title text
        this.add.bitmapText(10, 10, 'rocketSquare', 'Credits', 16);

        // Add credits text
        const creditsText = `
        Game Design: Sandra Sorensen
        Programming: Sandra Sorensen
        Assets: Kenny
        Music: Kenny
        Special Thanks: Professor Jim Whitehead 
        Code snippets from course
        `;

        this.add.bitmapText(10, 40, 'rocketSquare', creditsText, 8);
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
