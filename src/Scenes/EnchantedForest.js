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
        this.keyFlag = false;
        this.isVulnerable = true;

        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("enchantedForest", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map using the correct key
        this.tileset = this.map.addTilesetImage("colored_tilemap_packed", "colored_tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
        this.housesLayer = this.map.createLayer("Houses-n-Fences", this.tileset, 0, 0);

        // Create orc group
        this.orcGroup = this.add.group();

        // Create orc sprite
        this.weakOrc = this.physics.add.sprite(this.tileXtoWorld(25), this.tileYtoWorld(15), "weakOrch").setOrigin(0, 0);
        this.weakOrc.setScale(2); // Scale up the orc sprite
        this.orcGroup.add(this.weakOrc);

        // Create the axe as a physics sprite and add it to the orc group
        this.axe = this.physics.add.sprite(this.weakOrc.x, this.weakOrc.y, "axe").setOrigin(0.5, 0.5);
        this.axe.setCollideWorldBounds(true);
        this.orcGroup.add(this.axe);

        // Set up collision between the axe and the ground layer
        this.physics.add.collider(this.axe, this.groundLayer);

        // Create townsfolk sprite
        this.purpleTownie = this.add.sprite(this.tileXtoWorld(25), this.tileYtoWorld(5), "purple").setOrigin(0, 0);

        // Set the depth of the townsfolk sprite
        this.purpleTownie.setDepth(1);

        // Set the depth of the orc group to be lower than the townsfolk sprite
        this.orcGroup.setDepth(0);

        // Enable physics for the townsfolk sprite without debug visuals
        this.physics.add.existing(this.purpleTownie);
        this.purpleTownie.body.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(this.purpleTownie, this.groundLayer, () => { });
        this.physics.add.collider(this.axe, this.groundLayer);

        // Create sword sprite using a frame from the spritesheet
        this.sword = this.add.sprite(0, 0, "sword").setOrigin(0.5, 0.5);
        this.physics.add.existing(this.sword);
        this.sword.body.setCollideWorldBounds(true);
        // Flag to track if the "X" key is pressed
        this.isXKeyDown = false;

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

        // Find the port to next level in the "Objects" layer in Phaser
        this.closedDoorLeft = this.map.createFromObjects("Objects", {
            name: "closedDoorLeft",
            key: "colored_tilemap_sheet",
            frame: 75
        });

        this.closedDoorRight = this.map.createFromObjects("Objects", {
            name: "closedDoorRight",
            key: "colored_tilemap_sheet",
            frame: 76
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
        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.closedDoorLeft, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.closedDoorRight, Phaser.Physics.Arcade.STATIC_BODY);


        this.physics.add.overlap(this.purpleTownie, this.leftPort, (obj1, obj2) => {
            this.scene.start("mysticalCastle");
        });

        this.physics.add.overlap(this.purpleTownie, this.rightPort, (obj1, obj2) => {
            this.scene.start("mysticalCastle");
        });

        this.physics.add.overlap(this.purpleTownie, this.closedDoorRight, (obj1, obj2) => {
            if (!this.keyFlag) {
                // If the player hasn't picked up the key yet, prevent them from accessing the closed door
                // You can add an alert or any other visual feedback to indicate that the door is locked
            } else {
                // If the player has the key, allow them to access the closed door
                this.scene.start("mysticalCastleScene");
            }
        });

        this.physics.add.overlap(this.purpleTownie, this.closedDoorLeft, (obj1, obj2) => {
            if (!this.keyFlag) {
                // If the player hasn't picked up the key yet, prevent them from accessing the closed door
                // You can add an alert or any other visual feedback to indicate that the door is locked
            } else {
                // If the player has the key, allow them to access the closed door
                this.scene.start("mysticalCastleScene");
            }
        });

        this.physics.add.overlap(this.sword, this.weakOrc, () => {
            // Disable physics for each object in the orc group
            this.orcGroup.children.iterate(child => {
                this.physics.world.disableBody(child.body);
            });

            // Make the orc group invisible
            this.orcGroup.setVisible(false);
        });


        // Set up random movement for the weak orc
        this.orcSpeed = 5; // Reduced speed of the orc
        this.setRandomOrcMovement();
        this.setRandomAxeMovement();

        // Add this to the create method to repeat axe throwing every 3 seconds
        this.time.addEvent({
            delay: 3000, // 3 seconds
            callback: this.setRandomAxeMovement,
            callbackScope: this,
            loop: true
        });

        // Create hearts group
        this.heartsGroup = this.add.group();

        // Add three hearts above the character
        const heart1 = this.physics.add.sprite(this.activeCharacter.x, this.activeCharacter.y - 20, "fullHeart").setOrigin(0.5, 0.5);
        const heart2 = this.physics.add.sprite(this.activeCharacter.x, this.activeCharacter.y - 40, "fullHeart").setOrigin(0.5, 0.5);
        const heart3 = this.physics.add.sprite(this.activeCharacter.x, this.activeCharacter.y - 60, "fullHeart").setOrigin(0.5, 0.5);

        this.heartsGroup.addMultiple([heart1, heart2, heart3]);

        this.physics.add.overlap(this.purpleTownie, this.axe, () => {
            // Check if the character is currently vulnerable
            if (this.isVulnerable) {
                // Remove a heart when the character is hit by an axe
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

        // Set velocity for both orc and axe
        this.orcGroup.children.iterate(child => {
            child.setVelocity(randomDirection.x * this.orcSpeed, randomDirection.y * this.orcSpeed);
        });

        // Set a timer to change direction after a random interval
        const randomInterval = Phaser.Math.Between(2000, 4000); // Increase the interval range for slower changes
        this.time.delayedCall(randomInterval, this.setRandomOrcMovement, [], this);
    }


    setRandomAxeMovement() {
        // Define movement parameters
        const moveDistance = 50; // Distance the axe will move away from the orc
        const moveSpeed = 1000; // Speed of the movement in milliseconds

        // Clear any existing tweens on the axe
        this.tweens.killTweensOf(this.axe);

        // Tween to move the axe away from the orc
        this.tweenAxeToRight = this.tweens.add({
            targets: this.axe,
            x: () => this.weakOrc.x + moveDistance, // Move relative to the orc's position
            y: () => this.weakOrc.y, // Keep the axe at the same vertical position as the orc
            duration: moveSpeed,
            ease: 'Linear',
            onStart: () => {
                this.axe.flipX = false; // Ensure the axe is not flipped initially
            },
            onComplete: () => {
                this.axe.flipX = true; // Flip the axe to look like it has been thrown
                this.tweenAxeToLeft.play(); // Start the return tween
            }
        });

        // Tween to move the axe back to the orc
        this.tweenAxeToLeft = this.tweens.add({
            targets: this.axe,
            x: () => this.weakOrc.x, // Move back to the orc's position
            y: () => this.weakOrc.y, // Keep the axe at the same vertical position as the orc
            duration: moveSpeed,
            ease: 'Linear',
            paused: true, // Start paused, will be played on completion of the first tween
            onComplete: () => {
                this.axe.flipX = false; // Reset flip for return animation
            }
        });

        // Start the first tween
        this.tweenAxeToRight.play();

        // Handle collision detection with coins
        this.physics.add.overlap(this.activeCharacter, this.key, (obj1, obj2) => {
            obj2.destroy();
            alert("You got a key!");
            this.keyFlag = true;
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

        if (this.isXKeyDown) {
            // Update sword physics only when "X" key is pressed
            this.physics.world.enable(this.sword);
            this.sword.setVisible(true);
            this.updateSwordPosition();
        } else {
            // Disable sword physics when "X" key is released
            if (this.sword.body) { // Check if the sword body exists before disabling
                this.physics.world.remove(this.sword.body);
                this.sword.setVisible(false);
            }

        }

        // Update heart position relative to the character
        let offsetX = -2; // Initial offset from the character's x position

        this.heartsGroup.children.iterate(heart => {
            heart.setPosition(this.activeCharacter.x + offsetX, this.activeCharacter.y - 2); // Adjust y-position to be above the character's head
            offsetX += 10; // Increment the offset for each heart
        });




        // Update sword position relative to the character
        this.updateSwordPosition();
    }

    updateSwordPosition() {
        // Calculate sword position relative to the townie's center
        const swordOffsetX = this.activeCharacter.flipX ? -5 : 20; // Distance from the townie's center
        const swordOffsetY = 10; // Adjust this value to position the sword vertically

        // Update the sword position
        this.sword.x = this.activeCharacter.x + swordOffsetX;
        this.sword.y = this.activeCharacter.y + swordOffsetY;

        // Flip the sword sprite based on the movement direction of the townie
        this.sword.setFlipX(this.activeCharacter.flipX);
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