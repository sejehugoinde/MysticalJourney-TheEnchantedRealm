class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.my = { text: {}, sprite: {}, vfx: {} };
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.MAX_HEALTH = 1;
        this.flag = false;
        this.touchedSomething = false; // Flag to track if player touched something other than water
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare.png", "KennyRocketSquare.fnt");
        this.load.audio('walk', 'footstep01.ogg');
    }

    create() {
        this.load.setPath("./assets/");

        this.myScore = 0;
        this.myHealth = this.MAX_HEALTH;

        this.walkSound = this.sound.add('walk');

        my.text.score = this.add.bitmapText(10, 0, "rocketSquare", "Score: " + this.myScore);
        my.text.health = this.add.bitmapText(10, 30, "rocketSquare", "Health: " + this.myHealth);

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.waterLayer = this.map.createLayer("Water-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.waterLayer.setCollisionByProperty({ collides: true });

        // Find coins in the "Objects" layer in Phaser
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.water = this.map.createFromObjects("Objects", {
            name: "water",
            key: "tilemap_sheet",
            frame: 53
        });

        this.bottomFlag = this.map.createFromObjects("Objects", {
            name: "bottomFlag",
            key: "tilemap_sheet",
            frame: 131
        });
        this.topFlag = this.map.createFromObjects("Objects", {
            name: "topFlag",
            key: "tilemap_sheet",
            frame: 111
        });

        // Enable collision handling
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.bottomFlag, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.topFlag, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.water, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        this.coinGroup = this.add.group(this.coins);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 200, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // set up enemy avatar
        my.sprite.enemy = this.physics.add.sprite(800, 200, "platformer_characters", "tile_0020.png");
        my.sprite.enemy.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer, () => {
            // If player collides with anything other than water, reset the flag to false
            this.touchedSomething = false;
        });

        this.physics.add.collider(my.sprite.enemy, this.groundLayer);

        this.physics.add.collider(my.sprite.player, this.waterLayer, () => {
            // If player collides with water, set the flag to true
            this.touchedSomething = true;
        });

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.myScore += 1;
            my.text.score.setText("Score: " + this.myScore);
            obj2.destroy(); // remove coin on overlap
        });

        this.physics.add.collider(my.sprite.player, my.sprite.enemy, this.handlePlayerEnemyCollision, null, this);

        // Define the horizontal path points
        const horizontalPathPoints = [
            700, // Start x-coordinate
            800 // End x-coordinate
        ];

        // Create a tween to make the enemy follow the curve
        this.tweens.add({
            targets: my.sprite.enemy,
            x: horizontalPathPoints,
            ease: 'Linear',
            duration: 5000, // Adjust duration as needed
            yoyo: true, // Return to start position
            repeat: -1 // Loop indefinitely
        });

        this.physics.add.overlap(my.sprite.player, this.bottomFlag, (obj1, obj2) =>
            {
                this.scene.start("endScene", { score: this.myScore });
            });
            
            this.physics.add.overlap(my.sprite.player, this.water, this.handleWaterCollision, null, this);
            
            // set up Phaser-provided cursor key input
            cursors = this.input.keyboard.createCursorKeys();
            
            this.rKey = this.input.keyboard.addKey('R');
            
            // debug key listener (assigned to D key)
            this.input.keyboard.on('keydown-D', () => {
                this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
                this.physics.world.debugGraphic.clear();
            }, this);
            
            // movement vfx
            my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
                frame: ['smoke_03.png', 'smoke_09.png'],
                scale: { start: 0.05, end: 0.1 },
                lifespan: 250,
                alpha: { start: 1, end: 0.3 },
                frequency: 100,
                quantity: 1
            });
            
            my.vfx.walking.stop();
            
            //camera
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
            this.cameras.main.setDeadzone(50, 50);
            this.cameras.main.setZoom(this.SCALE);
            }
            
            update() {
            if (cursors.left.isDown) {
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            
                // Only play smoke effect if touching the ground
                if (my.sprite.player.body.blocked.down) {
                    my.vfx.walking.start();
                    // Play sound
                    if (!this.walkSound.isPlaying) {
                        this.walkSound.play({ loop: true });
                    }
                }
            } else if (cursors.right.isDown) {
                my.sprite.player.setAccelerationX(this.ACCELERATION);
                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            
                // Only play smoke effect if touching the ground
                if (my.sprite.player.body.blocked.down) {
                    my.vfx.walking.start();
                    // Play sound
                    if (!this.walkSound.isPlaying) {
                        this.walkSound.play({ loop: true });
                    }
                }
            } else {
                // Set acceleration to 0 and have DRAG take over
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
                my.vfx.walking.stop();
                this.walkSound.stop();
            }
            
            // player jump
            if (!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
            }
            if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.scene.restart();
            }
            }
            
            handleWaterCollision(player, water) {
            // Check if the player has already collided with water in this interaction cycle
            if (!this.flag) {
                // Check if the player has touched something other than water before touching water again
                // Decrease health by 1
                this.myHealth -= 1;
                my.text.health.setText("Health: " + this.myHealth);
            
                // Set the flag to true to indicate that the player has collided with water in this interaction cycle
                this.flag = true;
            }
            
            // Start end scene if health reaches 0
            if (this.myHealth <= 0) {
                this.scene.start("endScene", { score: this.myScore });
            }
            }
            
            handlePlayerEnemyCollision(player, enemy) {
            // Decrease player's health/lives
            this.myHealth -= 1;
            my.text.health.setText("Health: " + this.myHealth);
            
            // Check if player has run out of health
            if (this.myHealth <= 0) {
                // Player has lost all lives, start end scene or game over logic
                this.scene.start("endScene", { score: this.myScore });
            } else {
                // Player still has lives, handle respawn logic or any other game behavior
                // For example:
                player.setX(30); // Reset player position
                player.setY(200);
            }
            }
            }
            