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
        this.lives = data.lives;
        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("darkCave", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);
    
        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");
    
        // Create townsfolk sprite
        this.purpleTownie = this.add.sprite(this.tileXtoWorld(25), this.tileYtoWorld(5), "purple").setOrigin(0, 0);
    
        // Set the depth of the townsfolk sprite
        this.purpleTownie.setDepth(1);
    
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
    
        this.physics.add.overlap(this.purpleTownie, this.leftPort, (obj1, obj2) => {
            this.scene.start("mysticalCastleScene", { lives: this.lives });
            
        });
    
        this.physics.add.overlap(this.purpleTownie, this.rightPort, (obj1, obj2) => {
            this.scene.start("mysticalCastleScene", { lives: this.lives });
        });
    
        // Create groups
        this.giantGroup = this.add.group();
        this.heartsGroup = this.add.group();
    
        // Add three hearts above the character
        for (let i = 0; i < this.lives; i++) {
            const heart = this.physics.add.sprite(20 + i * 20, 20, "fullHeart").setOrigin(0.5, 0.5);
            this.heartsGroup.add(heart);
        }
    
        // Create orc sprite and add it to the orc group
        this.giant = this.physics.add.sprite(this.tileXtoWorld(25), this.tileYtoWorld(15), "giant").setOrigin(0, 0);
        this.giant.setScale(2);
        this.giantGroup.add(this.giant);
    
        // Create the giantSword as a physics sprite and add it to the orc group
        this.giantSword = this.physics.add.sprite(this.giant.x, this.giant.y, "giantSword").setOrigin(0.5, 0.5);
        this.giantSword.setCollideWorldBounds(true);
        this.giantGroup.add(this.giantSword);
    
        // Set up random movement for the weak orc
        this.orcSpeed = 5; // Reduced speed of the orc
        this.setRandomOrcMovement();
        this.setRandomgiantSwordMovement();
    
        // Add this to the create method to repeat giantSword throwing every 3 seconds
        this.time.addEvent({
            delay: 3000, // 3 seconds
            callback: this.setRandomgiantSwordMovement,
            callbackScope: this,
            loop: true
        });
    
        // Set the depth of the orc group to be lower than the townsfolk sprite
        this.giantGroup.setDepth(0);
    
        // Enable physics for the townsfolk sprite without debug visuals
        this.physics.add.existing(this.purpleTownie);
        this.purpleTownie.body.setCollideWorldBounds(true);
    
        // Enable collision handling
        this.physics.add.collider(this.purpleTownie, this.groundLayer, () => { });
        this.physics.add.collider(this.giantSword, this.groundLayer);
        this.physics.add.collider(this.giantSword, this.groundLayer);
    
        // Create sword sprite using a frame from the spritesheet
        this.sword = this.add.sprite(0, 0, "sword").setOrigin(0.5, 0.5);
        this.physics.add.existing(this.sword);
        this.sword.body.setCollideWorldBounds(true);
    
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
    
        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setSize(config.width, config.height); // Set camera size to match the game config
        this.cameras.main.setZoom(this.SCALE);
    
        // Add camera follow to the sprite
        this.cameras.main.startFollow(this.purpleTownie, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
    
        // Add key handlers for arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();
    
        // Only enable physics for objects that are defined
        if (this.key) {
            this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        }
        if (this.closedDoorLeft) {
            this.physics.world.enable(this.closedDoorLeft, Phaser.Physics.Arcade.STATIC_BODY);
        }
        if (this.closedDoorRight) {
            this.physics.world.enable(this.closedDoorRight, Phaser.Physics.Arcade.STATIC_BODY);
        }
        if (this.fire) {
            this.physics.world.enable(this.fire, Phaser.Physics.Arcade.STATIC_BODY);
        }
        if (this.coin) {
            this.physics.world.enable(this.coin, Phaser.Physics.Arcade.STATIC_BODY);
        }
        if (this.chest) {
            this.physics.world.enable(this.chest, Phaser.Physics.Arcade.STATIC_BODY);
        }
    
        this.physics.add.overlap(this.purpleTownie, this.closedDoorRight, (obj1, obj2) => {
            if (!this.keyFlag) {
                // If the player hasn't picked up the key yet, prevent them from accessing the closed door
                // You can add an alert or any other visual feedback to indicate that the door is locked
            } else {
                // If the player has the key, allow them to access the closed door
                this.scene.start("mysticalCastleScene", { lives: this.lives });
            }
        });
    
        this.physics.add.overlap(this.purpleTownie, this.closedDoorLeft, (obj1, obj2) => {
            if (!this.keyFlag) {
                // If the player hasn't picked up the key yet, prevent them from accessing the closed door
                // You can add an alert or any other visual feedback to indicate that the door is locked
            } else {
                // If the player has the key, allow them to access the closed door
                this.scene.start("mysticalCastleScene", { lives: this.lives });
            }
        });
    
        this.physics.add.overlap(this.sword, this.giant, () => {
            // Disable physics for each object in the orc group
            this.giantGroup.children.iterate(child => {
                this.physics.world.disableBody(child.body);
            });
    
            // Make the orc group invisible
            this.giantGroup.setVisible(false);
        });
    
        this.physics.add.overlap(this.purpleTownie, this.giantSword, () => {
            // Check if the character is currently vulnerable
            if (this.isVulnerable) {
                // Remove a heart when the character is hit by an giantSword
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
        });
    
        this.physics.add.overlap(this.purpleTownie, this.fireGroup, (obj1, obj2) => {
            // Check if the character is currently vulnerable
            if (this.isVulnerable) {
                // Remove a heart when the character touches fire
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
        });
    
        // Listen for sword and fire collisions
        this.physics.add.overlap(this.sword, this.fireGroup, (obj1, obj2) => {
            // Remove the sword and fire when they overlap
            obj1.destroy();
            obj2.destroy();
        });
    
        // Add overlap detection for character and coins
        this.physics.add.overlap(this.purpleTownie, this.coinGroup, (obj1, obj2) => {
            // Remove the coin when the character collects it
            obj2.destroy();
        });
    
        // Add overlap detection for character and chests
        this.physics.add.overlap(this.purpleTownie, this.chestGroup, (obj1, obj2) => {
            // Open the chest and reveal its contents (if any)
            // Add logic for handling chest contents here
            // For now, we'll just remove the chest when it's opened
            obj2.destroy();
        });
    
        this.physics.add.overlap(this.purpleTownie, this.coin, (obj1, obj2) => {
            this.coinFlag = true;
            // Make the coin invisible
            this.coin.setVisible(false);
            // Remove the coin from the physics world
            this.coin.body.destroy();
        });
    }    

    setRandomOrcMovement() {
        // Generate a random direction and speed
        const directions = [
            { x: 1, y: 0 }, // right
            { x: -1, y: 0 }, // left
            { x: 0, y: 1 }, // down
            { x: 0, y: -1 } // up
        ];
        const randomDirection = Phaser.Math.RND.pick(directions);

        // Set velocity for both orc and giantSword
        this.giantGroup.children.iterate(child => {
            child.setVelocity(randomDirection.x * this.orcSpeed, randomDirection.y * this.orcSpeed);
        });

        // Set a timer to change direction after a random interval
        const randomInterval = Phaser.Math.Between(2000, 4000); // Increase the interval range for slower changes
        this.time.delayedCall(randomInterval, this.setRandomOrcMovement, [], this);
    }


    setRandomgiantSwordMovement() {
        // Define movement parameters
        const moveDistance = 50; // Distance the giantSword will move away from the orc
        const moveSpeed = 1000; // Speed of the movement in milliseconds

        // Clear any existing tweens on the giantSword
        this.tweens.killTweensOf(this.giantSword);

        // Tween to move the giantSword away from the orc
        this.tweengiantSwordToRight = this.tweens.add({
            targets: this.giantSword,
            x: () => this.giant.x + moveDistance, // Move relative to the orc's position
            y: () => this.giant.y, // Keep the giantSword at the same vertical position as the orc
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

        // Tween to move the giantSword back to the orc
        this.tweengiantSwordToLeft = this.tweens.add({
            targets: this.giantSword,
            x: () => this.giant.x, // Move back to the orc's position
            y: () => this.giant.y, // Keep the giantSword at the same vertical position as the orc
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
        this.physics.add.overlap(this.purpleTownie, this.key, (obj1, obj2) => {
            obj2.destroy();
            alert("You got a key!");
            this.keyFlag = true;
        });

        this.rKey = this.input.keyboard.addKey('R');

    }

    update() {
        // Reset velocity
        this.purpleTownie.body.setVelocity(0);

        if (this.cursors.space.isDown) {
            this.purpleTownie.body.setVelocityY(-80);
        }

        // Check for arrow key inputs and move character accordingly
        if (this.cursors.left.isDown) {
            this.purpleTownie.body.setVelocityX(-100);
            this.purpleTownie.flipX = true; // Flip the sprite to face left
        } else if (this.cursors.right.isDown) {
            this.purpleTownie.body.setVelocityX(100);
            this.purpleTownie.flipX = false; // Flip the sprite to face right
        } else if (this.cursors.up.isDown) {
            this.purpleTownie.body.setVelocityY(-100);
        } else if (this.cursors.down.isDown) {
            this.purpleTownie.body.setVelocityY(100);
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
            heart.setPosition(this.purpleTownie.x + offsetX, this.purpleTownie.y - 8); // Adjust y-position to be above the character's head
            offsetX += 12; // Increment the offset for each heart
        });

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // Update sword position relative to the character
        this.updateSwordPosition();
    }

    updateSwordPosition() {
        // Calculate sword position relative to the townie's center
        const swordOffsetX = this.purpleTownie.flipX ? -5 : 20; // Distance from the townie's center
        const swordOffsetY = 10; // Adjust this value to position the sword vertically

        // Update the sword position
        this.sword.x = this.purpleTownie.x + swordOffsetX;
        this.sword.y = this.purpleTownie.y + swordOffsetY;

        // Flip the sword sprite based on the movement direction of the townie
        this.sword.setFlipX(this.purpleTownie.flipX);
    }

    removeHeart() {
        if (this.heartsGroup.getLength() > 0) {
            const heartToRemove = this.heartsGroup.getChildren()[this.heartsGroup.getLength() - 1];
            heartToRemove.destroy();
        }
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }
}