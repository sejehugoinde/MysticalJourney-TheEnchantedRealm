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
        this.weaponFlag = false;
        this.isVulnerable = true;
        this.isXKeyDown = false;
        this.lives = 3;
        this.enemySpeed = 5; // Reduced speed of the orc

        // Add a cooldown timer for portal transitions
        this.portalCooldown = false;
        this.portalCooldownDuration = 1500; // 1.5 seconds

        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("enchantedForest", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map using the correct key
        this.tileset = this.map.addTilesetImage("colored_tilemap_packed", "colored_tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Create townsfolk sprite
        this.player = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(15), "playerEnchantedForest").setOrigin(0, 0);

        // Set the depth of the townsfolk sprite
        this.player.setDepth(1);

        // Find the objects in the "Objects" layer in Phaser
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

        this.chest = this.map.createFromObjects("Objects", {
            name: "chest",
            key: "colored_tilemap_sheet",
            frame: 57
        });

        this.coin = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "colored_tilemap_sheet",
            frame: 88
        });

        this.portal1 = this.map.createFromObjects("Objects", {
            name: "portal1",
            key: "colored_tilemap_sheet",
            frame: 129
        });


        this.portal2 = this.map.createFromObjects("Objects", {
            name: "portal2",
            key: "colored_tilemap_sheet",
            frame: 129
        });

        // Create groups
        this.orcGroup = this.add.group();
        this.fireGroup = this.add.group(this.fire);
        this.coinGroup = this.add.group(this.coin);
        this.chestGroup = this.add.group(this.chest);
        this.heartsGroup = this.add.group();
        this.snakeGroup = this.add.group();

        // Add three hearts above the character
        const heart1 = this.physics.add.sprite(this.player.x, this.player.y - 20, "fullHeart").setOrigin(0.5, 0.5);
        heart1.setScale(0.6);
        const heart2 = this.physics.add.sprite(this.player.x, this.player.y - 40, "fullHeart").setOrigin(0.5, 0.5);
        heart2.setScale(0.6);
        const heart3 = this.physics.add.sprite(this.player.x, this.player.y - 60, "fullHeart").setOrigin(0.5, 0.5);
        heart3.setScale(0.6);

        this.heartsGroup.addMultiple([heart1, heart2, heart3]);

        // Create orc sprite and add it to the orc group
        this.weakOrc = this.physics.add.sprite(this.tileXtoWorld(14), this.tileYtoWorld(6), "weakOrch").setOrigin(0, 0);
        this.weakOrc.setScale(1.5);
        this.orcGroup.add(this.weakOrc);

        this.snakes = [];

        // Define the number of snakes you want
        this.numSnakes = 10;

        // Create multiple snake sprites and add them to the snake group
        // Define the spawn area along the edges of the map
        const spawnArea = {
            top: this.map.heightInPixels * 0.2, // 20% from the top
            bottom: this.map.heightInPixels * 0.8, // 20% from the bottom
            left: this.map.widthInPixels * 0.2, // 20% from the left
            right: this.map.widthInPixels * 0.8 // 20% from the right
        };

        // Create multiple snake sprites and add them to the snake group
        for (let i = 0; i < this.numSnakes; i++) {
            let x, y;
            if (i % 4 === 0) {
                // Spawn from the top edge
                x = Phaser.Math.Between(spawnArea.left, spawnArea.right);
                y = spawnArea.top;
            } else if (i % 4 === 1) {
                // Spawn from the bottom edge
                x = Phaser.Math.Between(spawnArea.left, spawnArea.right);
                y = spawnArea.bottom;
            } else if (i % 4 === 2) {
                // Spawn from the left edge
                x = spawnArea.left;
                y = Phaser.Math.Between(spawnArea.top, spawnArea.bottom);
            } else {
                // Spawn from the right edge
                x = spawnArea.right;
                y = Phaser.Math.Between(spawnArea.top, spawnArea.bottom);
            }

            this.snake = this.physics.add.sprite(x, y, "snake").setOrigin(0, 0);
            this.snake.setScale(1);
            this.snakes.push(this.snake);
            this.snakeGroup.add(this.snake);
        }

        this.snakeGroup.setDepth(0);


        // Set up random movement for each snake
        this.setRandomSnakeMovement();

        // Create the axe as a physics sprite and add it to the orc group
        this.axe = this.physics.add.sprite(this.weakOrc.x, this.weakOrc.y, "axe").setOrigin(0.5, 0.5);
        this.axe.setCollideWorldBounds(true);
        this.orcGroup.add(this.axe);

        // Set up random movement for the weak orc
        this.setRandomOrcMovement();
        this.setRandomAxeMovement();

        // Add this to the create method to repeat axe throwing every 3 seconds
        this.time.addEvent({
            delay: 3000, // 3 seconds
            callback: this.setRandomAxeMovement,
            callbackScope: this,
            loop: true
        });

        // Set the depth of the orc group to be lower than the townsfolk sprite
        this.orcGroup.setDepth(0);

        // Enable physics for the townsfolk sprite without debug visuals
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(this.player, this.groundLayer, () => { });
        this.physics.add.collider(this.axe, this.groundLayer);

        // Create sword sprite using a frame from the spritesheet
        this.sword = this.add.sprite(0, 0, "sword").setOrigin(0.5, 0.5);
        this.sword.setScale(0.7);
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
        this.cameras.main.setZoom(2);

        // Add camera follow to the sprite
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);

        // Add key handlers for arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Enable collision handling
        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.closedDoorLeft, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.closedDoorRight, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.fire, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.coin, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.chest, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.portal1, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.portal2, Phaser.Physics.Arcade.STATIC_BODY);


        this.physics.add.overlap(this.player, this.closedDoorRight, (obj1, obj2) => {
            if (!this.keyFlag) {
                // If the player hasn't picked up the key yet, prevent them from accessing the closed door
                // You can add an alert or any other visual feedback to indicate that the door is locked
            } else {
                // If the player has the key, allow them to access the closed door
                this.scene.start("darkCaveScene", { lives: this.lives });
            }
        });

        this.physics.add.overlap(this.player, this.closedDoorLeft, (obj1, obj2) => {
            if (!this.keyFlag) {
                // If the player hasn't picked up the key yet, prevent them from accessing the closed door
                // You can add an alert or any other visual feedback to indicate that the door is locked
            } else {
                // If the player has the key, allow them to access the closed door
                this.scene.start("darkCaveScene", { lives: this.lives });
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

        this.physics.add.overlap(this.sword, this.snakeGroup, this.killSnake, null, this);

        this.physics.add.overlap(this.player, this.axe, () => {
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

        this.physics.add.overlap(this.player, this.fireGroup, () => {
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

        this.physics.add.overlap(this.player, this.coinGroup, () => {
            //TODO: implement score system
        });

        this.physics.add.overlap(this.player, this.chestGroup, () => {
            // Check if the character is currently vulnerable
            if (!this.weaponFlag) {
                alert("You have got a new weapon. Press x to hit");
                this.weaponFlag = true;
            }
        });

        // Check for collision between player character and snakes
        this.physics.add.overlap(this.player, this.snakeGroup, this.playerHitBySnake, null, this);

        // Add overlap detection between player and portals
        this.physics.add.overlap(this.player, this.portal1, () => {
            if (!this.portalCooldown) {
                this.player.setPosition(this.tileXtoWorld(4), this.tileYtoWorld(14));
                this.setPortalCooldown();
            }
        });

        this.physics.add.overlap(this.player, this.portal2, () => {
            if (!this.portalCooldown) {
                this.player.setPosition(this.tileXtoWorld(12), this.tileYtoWorld(5));
                this.setPortalCooldown();
            }
        });


        this.rKey = this.input.keyboard.addKey('R');

    }

    killSnake(snake) {
        // Disable physics for the snake
        this.physics.world.disableBody(snake.body);
        // Make the snake sprite invisible
        snake.setVisible(false);
        // Optionally, you can also destroy the snake sprite
        snake.destroy();
        // Remove the snake from the snakes array
        const index = this.snakes.indexOf(snake);
        if (index !== -1) {
            this.snakes.splice(index, 1);
        }
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
            child.setVelocity(randomDirection.x * this.enemySpeed, randomDirection.y * this.enemySpeed);
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

        // Handle collision detection with key
        this.physics.add.overlap(this.player, this.key, (obj1, obj2) => {
            obj2.destroy();
            alert("You got a key!");
            this.keyFlag = true;
        });
    }

    update() {
        // Reset velocity
        this.player.body.setVelocity(0);

        if (this.cursors.space.isDown) {
            this.player.body.setVelocityY(-50);
        }

        // Check for arrow key inputs and move character accordingly
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-40);
            this.player.flipX = true; // Flip the sprite to face left
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(40);
            this.player.flipX = false; // Flip the sprite to face right
        } else if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-40);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(40);
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
        let offsetX = -2; // Initial offset from the character's x position

        this.heartsGroup.children.iterate(heart => {
            heart.setPosition(this.player.x + offsetX, this.player.y - 2); // Adjust y-position to be above the character's head
            offsetX += 6; // Increment the offset for each heart
        });

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // Update sword position relative to the character
        this.updateSwordPosition();

        if (this.portalCooldown) {
            this.portalCooldownTimer -= this.time.deltaTime;
            if (this.portalCooldownTimer <= 0) {
                this.portalCooldown = false;
            }
        }


    }

    updateSwordPosition() {
        // Calculate sword position relative to the player's center
        const swordOffsetX = this.player.flipX ? -2 : 10; // Distance from the player's center
        const swordOffsetY = 5; // Adjust this value to position the sword vertically

        // Update the sword position
        this.sword.x = this.player.x + swordOffsetX;
        this.sword.y = this.player.y + swordOffsetY;

        // Flip the sword sprite based on the movement direction of the player
        this.sword.setFlipX(this.player.flipX);
    }

    removeHeart() {
        if (this.heartsGroup.getLength() > 0) {
            const heartToRemove = this.heartsGroup.getChildren()[this.heartsGroup.getLength() - 1];
            heartToRemove.destroy();
            this.lives--;
        }
    }

    playerHitBySnake() {
        // Check if the player is currently vulnerable (hasn't been hit recently)
        if (this.isVulnerable) {
            // Remove a heart when the character is hit by a snake
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

    setRandomSnakeMovement() {
        // Iterate through each snake and set random movement
        this.snakes.forEach(snake => {
            // Generate a random direction
            const directions = [
                { x: 1, y: 0 }, // right
                { x: -1, y: 0 }, // left
                { x: 0, y: 1 }, // down
                { x: 0, y: -1 } // up
            ];
            const randomDirection = Phaser.Math.RND.pick(directions);

            // Set velocity for each snake based on the orc speed
            const velocityX = randomDirection.x * this.enemySpeed;
            const velocityY = randomDirection.y * this.enemySpeed;
            snake.setVelocity(velocityX, velocityY);
        });

        // Set a timer to change direction for each snake after a random interval
        const randomInterval = Phaser.Math.Between(2000, 4000); // Increase the interval range for slower changes
        this.time.delayedCall(randomInterval, this.setRandomSnakeMovement, [], this);
    }

    setPortalCooldown() {
        this.portalCooldown = true;
        this.portalCooldownTimer = this.portalCooldownDuration;
    
        // Reset the portal cooldown after the specified duration
        this.time.delayedCall(this.portalCooldownDuration, () => {
            this.portalCooldown = false;
        });
    }
    

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }
}