// Sandra Sorensen
// Created: 6/6/2024
// Phaser: 3.80.0

class DarkCave extends Phaser.Scene {
    constructor() {
        super("darkCaveScene");
    }

    preload() {
    }

    init() {
        this.TILESIZE = 16;
        this.SCALE = 2.0;
        this.TILEWIDTH = 40;
        this.TILEHEIGHT = 25;
    }

    create(data) {
        // Conditionals
        this.keyFlag = false;
        this.isSwordHit = false;
        this.weaponFlag = false;
        this.isVulnerable = true;
        this.isVulnerableGiant = true;
        this.isXKeyDown = false;
        this.lives = 3;
        this.enemySpeed = 5;
        this.giantLives = 3;

        this.lives = data.lives;
        if (this.lives == null) {
            this.lives = 2
        }

        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("darkCave", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.railwayLayer = this.map.createLayer("Railway", this.tileset, 0, 0);
        this.castleLayer = this.map.createLayer("Castle", this.tileset, 0, 0);
        this.graveyardLayer = this.map.createLayer("Graveyard", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({ collides: true });
        this.railwayLayer.setCollisionByProperty({ collides: true });
        this.castleLayer.setCollisionByProperty({ collides: true });
        this.graveyardLayer.setCollisionByProperty({ collides: true });

        this.giantGroup = this.add.group();
        this.heartsGroup = this.add.group();
        this.heartsGiantGroup = this.add.group();

        // Create giant sprite and add it to the giant group
        this.giant = this.physics.add.sprite(this.tileXtoWorld(25), this.tileYtoWorld(15), "giant").setOrigin(0, 0);
        this.giant.setScale(2);
        this.giantGroup.add(this.giant);

        // Create the giantSword as a physics sprite and add it to the giant group
        this.giantSword = this.physics.add.sprite(this.giant.x, this.giant.y, "giantSword").setOrigin(0.5, 0.5);
        this.giantSword.setCollideWorldBounds(true);
        this.giantSword.setScale(1.5);
        this.giantGroup.add(this.giantSword);

        // Set up random movement for the weak giant
        this.enemySpeed = 5; 
        this.setRandomgiantMovement();
        this.setRandomGiantSwordMovement();

        // Add this to the create method to repeat giantSword throwing every 3 seconds
        this.time.addEvent({
            delay: 3000, // 3 seconds
            callback: this.setRandomGiantSwordMovement,
            callbackScope: this,
            loop: true
        });

        // Create player sprite
        this.player = this.add.sprite(this.tileXtoWorld(1), this.tileYtoWorld(1), "darkCavePlayer").setOrigin(0, 0);
        this.player.setScale(1);

        // Create sword sprite using a frame from the spritesheet
        this.sword = this.physics.add.sprite(0, 0, "swordDarkCave").setOrigin(0.5, 0.5);
        this.sword.setCollideWorldBounds(true);
        this.sword.setScale(1);

        // Find the objects in the "Objects" layer in Phaser
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

        this.lockedDoor = this.map.createFromObjects("Objects", {
            name: "lockedDoor",
            key: "tilemap_sheet",
            frame: 45
        })

        this.spikes = this.map.createFromObjects("Objects", {
            name: "spikes",
            key: "tilemap_sheet",
            frame: 41
        })

        this.cartWheel = this.map.createFromObjects("Objects", {
            name: "cartWheel",
            key: "tilemap_sheet",
            frame: 54
        })

        this.coin = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 101
        })

        this.healthPotion = this.map.createFromObjects("Objects", {
            name: "healthPotion",
            key: "tilemap_sheet",
            frame: 115
        })

        this.openChest = this.map.createFromObjects("Objects", {
            name: "openChest",
            key: "tilemap_sheet",
            frame: 90
        })


        this.closedChest = this.map.createFromObjects("Objects", {
            name: "closedChest",
            key: "tilemap_sheet",
            frame: 89
        })

        // Enable the physics bodies for the objects
        this.physics.world.enable(this.leftPort, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.rightPort, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.healthPotion, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.openChest, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.closedChest, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.cartWheel, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.coin, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.lockedDoor, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(this.player, this.leftPort, () => {
            this.scene.start("mysticalCastleScene", { lives: this.lives });

        });

        this.physics.add.overlap(this.player, this.rightPort, () => {
            this.scene.start("mysticalCastleScene", { lives: this.lives });
        });

        // Add collision detection for the closed door
        this.physics.add.overlap(this.player, this.lockedDoor, (player, door) => {
            if (!this.keyFlag) {
                // Player doesn't have the key, provide feedback or take appropriate action
            } else {
                // Player has the key, open the door
                door.destroy(); // Remove the closed door
                this.openDoor = this.physics.add.sprite(door.x, door.y, "openDoor").setOrigin(0.5, 0.5);
                this.physics.world.enable(this.openDoor, Phaser.Physics.Arcade.STATIC_BODY);

                // Disable collision with the castle layer for the open door
                this.castleLayer.forEachTile(tile => {
                    if (tile.properties.collides) {
                        tile.setCollision(false);
                    }
                });
            }
        });


        // Create groups for objects
        this.coinGroup = this.add.group(this.coin);
        this.openChestGroup = this.add.group(this.openChest);
        this.closedChestGroup = this.add.group(this.closedChest);
        this.spikeGroup = this.add.group(this.spikes);

        // lives
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.sprite(20 + i * 20, 20, "fullHeartMysticalCastle").setOrigin(0.5, 0.5);
            this.heartsGroup.add(heart);
        }

        for (let i = 0; i < 3; i++) {
            const heart = this.add.sprite(20 + i * 20, 20, "fullHeartMysticalCastle").setOrigin(0.5, 0.5);
            this.heartsGiantGroup.add(heart);
        }

        // Enable physics for the player sprite without debug visuals
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.railwayLayer);
        this.physics.add.collider(this.player, this.castleLayer);
        this.physics.add.collider(this.player, this.graveyardLayer);
        this.physics.add.collider(this.giantSword, this.groundLayer);

        // KEY LISTENING
        // Listen for "X" key press event
        this.input.keyboard.on('keydown-X', () => {
            this.isXKeyDown = true;
        });

        // Listen for "X" key release event
        this.input.keyboard.on('keyup-X', () => {
            this.isXKeyDown = false;
        });

        // Listen for "X" key press event
        this.input.keyboard.on('keydown-X', () => {
            this.sword.setVisible(true); // Show the sword when "X" key is pressed
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setSize(config.width, config.height); // Set camera size to match the game config
        this.cameras.main.setZoom(this.SCALE);

        // Add camera follow to the sprite
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);

        // Overlaps in game
        this.physics.add.overlap(this.player, this.closedDoorRight, () => {
            if (!this.keyFlag) {
                alert("The door seems locked...")
            } else {
                // If the player has the key, allow them to access the closed door
                this.scene.start("mysticalCastleScene", { lives: this.lives });
            }
        });

        this.physics.add.overlap(this.player, this.closedDoorLeft, () => {
            if (!this.keyFlag) {
                alert("The door seems locked...")
            } else {
                // If the player has the key, allow them to access the closed door
                this.scene.start("mysticalCastleScene", { lives: this.lives });
            }
        });

        this.physics.add.overlap(this.sword, this.giant, () => {
            if (!this.isSwordHit) {
                // Check if the giant is currently vulnerable
                if (this.isVulnerableGiant) {
                    // Remove a heart when the giant is hit by the player's sword
                    this.removeGiantHeart();
                    // Set the giant as not vulnerable and start the cooldown timer
                    this.isVulnerableGiant = false;
                    this.time.delayedCall(1000, () => {
                        this.isVulnerableGiant = true;
                    });
                    // Restart the scene when all giant's hearts are gone
                    if (this.heartsGiantGroup.getLength() === 0) {
                        // Disable physics for each object in the giant group
                        this.giantGroup.children.iterate(child => {
                            this.physics.world.disableBody(child.body);
                        });

                        // Make the giant group invisible
                        this.giantGroup.setVisible(false);

                        // Spawn a key when the giant is defeated
                        this.key = this.physics.add.sprite(this.giant.x, this.giant.y, "key").setOrigin(0.5, 0.5);
                        // Enable collision handling for the key
                        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
                    }
                }
                this.isSwordHit = true; // Set the flag to true to indicate that the sword has hit the giant
            }
        });

        this.physics.add.overlap(this.player, this.giantSword, () => {
            // Check if the character is currently vulnerable
            if (this.isVulnerable) {
                // Set the character as not vulnerable and start the cooldown timer
                this.isVulnerable = false;
                // Remove a heart when the character is hit by an giantSword
                this.removeHeart();

                this.time.delayedCall(1000, () => {
                    this.isVulnerable = true;
                });
                // Restart the scene when all hearts are gone
                if (this.heartsGroup.getLength() === 0) {
                    this.scene.restart();
                }
            }
        });

        this.physics.add.overlap(this.player, this.spikeGroup, this.playerHitBySpikes, null, this);

        this.physics.add.overlap(this.player, this.openChestGroup, (obj1, obj2) => {
            if (!this.weaponFlag) {
                alert("You have got a new weapon. Press x to hit");
                this.weaponFlag = true;
            }
        });

        this.physics.add.overlap(this.player, this.closedChestGroup, (obj1, obj2) => {
            if (!this.weaponFlag) {
                alert("You have got a new weapon. Press x to hit");
                this.weaponFlag = true;
            }
        });

        this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
        });

        this.physics.add.overlap(this.player, this.healthPotion, (player, potion) => {
            if (this.lives < 3) {
                this.lives += 1;
                potion.destroy();
                this.updateHeartsDisplay(); // Call the function to update hearts display
            }
        });

        alert("In your way of travelling to another world. You lost your sword...");

    }

    update() {

        // Reset velocity
        this.player.body.setVelocity(0);

        if (this.cursors.space.isDown) {
            this.player.body.setVelocityY(-80);
        }

        // Check for arrow key inputs and move character accordingly
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-100);
            this.player.flipX = true; // Flip the sprite to face left
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(100);
            this.player.flipX = false; // Flip the sprite to face right
        } else if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-100);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(100);
        }

        if (this.isXKeyDown && this.weaponFlag) {
            // Update sword physics only when "X" key is pressed and the weapon flag is true
            this.physics.world.enable(this.sword);
            this.sword.setVisible(true);
            this.updateSwordPosition();
        } else {
            // Disable sword physics when "X" key is released or weapon flag is false
            if (this.sword.body) { // Check if the sword body exists before disabling
                this.physics.world.remove(this.sword.body);
                this.sword.setVisible(false);
            }
        }

        // Update heart position relative to the character
        let offsetX = -4; // Initial offset from the character's x position

        this.heartsGroup.children.iterate(heart => {
            heart.setPosition(this.player.x + offsetX, this.player.y - 8); // Adjust y-position to be above the character's head
            offsetX += 12; // Increment the offset for each heart
        });

        // Update heart position relative to the character
        let offsetGiantX = -4; // Initial offset from the character's x position

        this.heartsGiantGroup.children.iterate(heart => {
            heart.setPosition(this.giant.x + offsetGiantX, this.giant.y - 8); // Adjust y-position to be above the character's head
            offsetGiantX += 12; // Increment the offset for each heart
        });

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // Update sword position relative to the character
        this.updateSwordPosition();

        const isCollidingWithDoor = this.physics.overlap(this.player, this.openDoor);

        // If the player is not colliding with the open door, re-enable collisions with the castle layer
        if (!isCollidingWithDoor) {
            this.castleLayer.forEachTile(tile => {
                if (tile.properties.collides) {
                    tile.setCollision(true);
                }
            });
        }
    }

    updateSwordPosition() {

        // Calculate sword position relative to the townie's center
        const swordOffsetX = this.player.flipX ? -5 : 20; 
        const swordOffsetY = 10; 

        // Update the sword position
        this.sword.x = this.player.x + swordOffsetX;
        this.sword.y = this.player.y + swordOffsetY;

        // Flip the sword sprite based on the movement direction of the townie
        this.sword.setFlipX(this.player.flipX);

        if (!this.physics.overlap(this.sword, this.giant)) {
            this.isSwordHit = false; // Reset the flag if the sword is not overlapping with the giant
        }
    }

    removeHeart() {
        if (this.heartsGroup.getLength() > 0) {
            const heartToRemove = this.heartsGroup.getChildren()[this.heartsGroup.getLength() - 1];
            heartToRemove.destroy();
        }
    }

    removeGiantHeart() {
        if (this.heartsGiantGroup.getLength() > 0) {
            const heartToRemove = this.heartsGiantGroup.getChildren()[this.heartsGiantGroup.getLength() - 1];
            heartToRemove.destroy();
        }
    }

    updateHeartsDisplay() {
        // Clear existing hearts display
        this.heartsGroup.clear(true);

        // Add hearts above the character based on the current number of lives
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.sprite(20 + i * 20, 20, "fullHeartMysticalCastle").setOrigin(0.5, 0.5); // Use this.add.sprite instead of this.physics.add.sprite
            this.heartsGroup.add(heart);
        }
    }


    playerHitBySpikes() {
        // Check if the player is currently vulnerable (hasn't been hit recently)
        if (this.isVulnerable) {
            // Remove a heart when the character is hit by spikes
            this.removeHeart();

            // Set the character as not vulnerable and start the cooldown timer
            this.isVulnerable = false;
            this.time.delayedCall(1000, () => {
                this.isVulnerable = true;
            });

            // Restart the scene when all hearts are gone
            if (this.heartsGroup.getLength() === 0) {
                this.scene.restart();
            }
        }
    }


    setRandomgiantMovement() {
        // Generate a random direction and speed
        const directions = [
            { x: 1, y: 0 }, // right
            { x: -1, y: 0 }, // left
            { x: 0, y: 1 }, // down
            { x: 0, y: -1 } // up
        ];
        const randomDirection = Phaser.Math.RND.pick(directions);

        // Set velocity for both giant and giantSword
        this.giantGroup.children.iterate(child => {
            child.setVelocity(randomDirection.x * this.enemySpeed, randomDirection.y * this.enemySpeed);
        });

        // Set a timer to change direction after a random interval
        const randomInterval = Phaser.Math.Between(2000, 4000); // Increase the interval range for slower changes
        this.time.delayedCall(randomInterval, this.setRandomgiantMovement, [], this);
    }


    setRandomGiantSwordMovement() {

        // Define movement parameters
        const moveDistance = 50; 
        const moveSpeed = 1000;

        // Clear any existing tweens on the giantSword
        this.tweens.killTweensOf(this.giantSword);

        // Tween to move the giantSword away from the giant
        this.tweengiantSwordToRight = this.tweens.add({
            targets: this.giantSword,
            x: () => this.giant.x + moveDistance, // Move relative to the giant's position
            y: () => this.giant.y, // Keep the giantSword at the same vertical position as the giant
            duration: moveSpeed,
            ease: 'Linear',
            onStart: () => {
                this.giantSword.flipX = false; // Ensure the giantSword is not flipped initially
            },
            onComplete: () => {
                this.giantSword.flipX = true; // Flip the giantSword to look like it has been thrown
                this.tweengiantSwordToLeft.play(); // Start the return tween
            }
        });

        // Tween to move the giantSword back to the giant
        this.tweengiantSwordToLeft = this.tweens.add({
            targets: this.giantSword,
            x: () => this.giant.x, // Move back to the giant's position
            y: () => this.giant.y, // Keep the giantSword at the same vertical position as the giant
            duration: moveSpeed,
            ease: 'Linear',
            paused: true, // Start paused, will be played on completion of the first tween
            onComplete: () => {
                this.giantSword.flipX = false; // Reset flip for return animation
            }
        });

        // Start the first tween
        this.tweengiantSwordToRight.play();

        // Handle collision detection with coins
        if (this.key) {
            this.physics.add.overlap(this.player, this.key, (obj1, obj2) => {
                obj2.destroy();
                alert("You got a knife to pick a door open!");
                this.keyFlag = true;
            });
        }

        this.rKey = this.input.keyboard.addKey('R');
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }
}