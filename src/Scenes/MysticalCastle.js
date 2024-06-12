// Sandra Sorensen
// Created: 6/6/2024
// Phaser: 3.80.0

class MysticalCastle extends Phaser.Scene {
    constructor() {
        super("mysticalCastleScene");
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
        // Sounds
        this.sound.stopAll()
        this.walkSound = this.sound.add('walk');

        this.lives = data.lives;
        this.keyFlag = false;
        this.isSwordHit = false;
        this.weaponFlag = false;
        this.isVulnerable = true;
        this.isVulnerableWizard = true;
        this.isXKeyDown = false;
        this.lives = 5;
        this.enemySpeed = 5;
        this.wizardLives = 3;

        this.lives = data.lives;
        if (this.lives == null) {
            this.lives = 2
        }

        // Create groups
        this.wizardGroup = this.add.group();
        this.heartsGroup = this.add.group();
        this.heartsWizardGroup = this.add.group();
        this.ghostWizardGroup = this.add.group();

        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("mysticalCastle", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.castleLayer = this.map.createLayer("Castle", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({ collides: true });
        this.castleLayer.setCollisionByProperty({ collides: true });

        // Creating the enemy wizard
        this.wizard = this.physics.add.sprite(this.tileXtoWorld(25), this.tileYtoWorld(15), "wizardMysticalCastle").setOrigin(0, 0);
        this.wizard.setScale(2);
        this.wizardGroup.add(this.wizard);

        const wandOffsetX = -5;
        const wandOffsetY = 15;
        this.wizardWand = this.physics.add.sprite(this.wizard.x + wandOffsetX, this.wizard.y + wandOffsetY, "wizardWand").setOrigin(0.5, 0.5);
        this.wizardWand.setCollideWorldBounds(true);
        this.wizardWand.setScale(1.5);
        this.wizardWand.angle = -10;
        this.wizardGroup.add(this.wizardWand);

        this.wizardWandMagic = this.physics.add.sprite(this.wizard.x, this.wizard.y, "wizardWandMagic").setOrigin(0.5, 0.5);
        this.wizardWandMagic.setCollideWorldBounds(true);
        this.wizardWandMagic.setScale(1.5);
        this.wizardGroup.add(this.wizardWandMagic)

        this.wizardSpeed = 5;
        this.setRandomWizardMovement();
        this.setRandomWizardWandMagicMovement();

        // Add this to the create method to repeat wizardWandMagic throwing every 3 seconds
        this.time.addEvent({
            delay: 3000,
            callback: this.setRandomWizardWandMagicMovement,
            callbackScope: this,
            loop: true
        });

        // Create an array to hold all the ghost wizards
        this.ghostWizards = [];
        this.numGhostWizards = 10;

        // Define the spawn area along the edges of the map
        const spawnArea = {
            top: this.map.heightInPixels * 0.2, // 20% from the top
            bottom: this.map.heightInPixels * 0.8, // 20% from the bottom
            left: this.map.widthInPixels * 0.2, // 20% from the left
            right: this.map.widthInPixels * 0.8 // 20% from the right
        };

        // Create multiple ghost wizards sprites and add them to the ghost wizard group
        for (let i = 0; i < this.numGhostWizards; i++) {
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

            this.ghostWizard = this.physics.add.sprite(x, y, "ghostWizard").setOrigin(0, 0);
            this.ghostWizard.setScale(1);
            this.ghostWizards.push(this.ghostWizard);
            this.ghostWizardGroup.add(this.ghostWizard);
        }

        // Set up random movement for each snake
        this.setRandomGhostWizardMovement();

        // Set up initial visibility for ghost wizards
        this.toggleGhostWizardsVisibility();

        // Schedule a repeating event to toggle visibility every few seconds
        this.time.addEvent({
            delay: 2000,
            callback: this.toggleGhostWizardsVisibility,
            callbackScope: this,
            loop: true
        });

        // Use setOrigin() to ensure the tile space computations work well
        this.player = this.add.sprite(this.tileXtoWorld(1), this.tileYtoWorld(1), "playerMysticalCastle").setOrigin(0, 0);

        // Enable physics for the sprite without debug visuals
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Create sword sprite using a frame from the spritesheet
        this.sword = this.physics.add.sprite(0, 0, "swordDarkCave").setOrigin(0.5, 0.5);
        this.sword.setCollideWorldBounds(true);
        this.sword.setScale(1);

        this.heartsGroup = this.add.group();

        // Add three hearts above the character
        for (let i = 0; i < this.lives; i++) {
            const heart = this.physics.add.sprite(20 + i * 20, 20, "fullHeartMysticalCastle").setOrigin(0.5, 0.5);
            this.heartsGroup.add(heart);
        }

        // Add hearts above the wizard
        for (let i = 0; i < 3; i++) {
            const heart = this.physics.add.sprite(20 + i * 20, 20, "fullHeartMysticalCastle").setOrigin(0.5, 0.5);
            this.heartsWizardGroup.add(heart);
        }

        // Enable collision handling
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.sword, this.groundLayer);
        this.physics.add.collider(this.player, this.castleLayer);

        // Creating speaking bubble for the princess
        this.speakingBubble = this.add.sprite(this.tileXtoWorld(36), this.tileYtoWorld(6), "speakingBubble").setOrigin(0, 0);
        this.speakingBubble.setScale(1.3); // Scale the speaking bubble to 1.3 times its original size
        this.physics.add.existing(this.speakingBubble);
        this.speakingBubble.body.setCollideWorldBounds(true);

        // Add text inside the speaking bubble
        let textStyle = {
            font: "4px Arial", // Adjust font size to make it smaller
            fill: "#000000",
            align: "center",
            wordWrap: { width: this.speakingBubble.width - 10, useAdvancedWrap: true }
        };
        this.speakingText = this.add.text(
            this.speakingBubble.x + this.speakingBubble.width / 3,
            this.speakingBubble.y + this.speakingBubble.height / 4,
            "save \n me",
            textStyle
        ).setOrigin(0.5, 0.5).setResolution(3); // Increase resolution for better clarity

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setSize(config.width, config.height); // Set camera size to match the game config
        this.cameras.main.setZoom(3);

        // Add camera follow to the sprite
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);

        this.activeCharacter = this.player;

        // Add key handlers for arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Find the port to next level in the "Objects" layer in Phaser
        this.princess = this.map.createFromObjects("Objects", {
            name: "princess",
            key: "tilemap_sheet",
            frame: 99
        });

        this.lockedDoor = this.map.createFromObjects("Objects", {
            name: "lockedDoor",
            key: "tilemap_sheet",
            frame: 45
        })

        this.chestTongue = this.map.createFromObjects("Objects", {
            name: "chestTongue",
            key: "tilemap_sheet",
            frame: 92
        })

        this.barrels = this.map.createFromObjects("Objects", {
            name: "barrels",
            key: "tilemap_sheet",
            frame: 82
        })

        this.healthPotion = this.map.createFromObjects("Objects", {
            name: "healthPotion",
            key: "tilemap_sheet",
            frame: 115
        })

        // Enabling the physics bodies 
        this.physics.world.enable(this.princess, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.lockedDoor, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.chestTongue, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.barrels, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.healthPotion, Phaser.Physics.Arcade.STATIC_BODY);

        // Convert this.princess to a Phaser GameObject
        if (this.princess.length > 0) {
            this.princess = this.princess[0]; // Take the first created object if multiple are created
            this.physics.add.existing(this.princess, true); // Static body
        }

        // Add waving animation for the princess
        this.tweens.add({
            targets: this.princess,
            angle: { from: -10, to: 10 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Enable overlaps in game
        this.physics.add.overlap(this.player, this.princess, (obj1, obj2) => {
            this.scene.start("endScene");
        });

        this.physics.add.overlap(this.player, this.chestTongue, (obj1, obj2) => {
            // Check if the character is currently vulnerable
            if (this.isVulnerable) {
                // Remove a heart when the character is hit by an wizardSword
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

        this.physics.add.overlap(this.sword, this.ghostWizardGroup, this.killGhostWizard, null, this);
        this.physics.add.overlap(this.player, this.ghostWizardGroup, this.playerHitByGhostWizard, null, this);
        
        this.physics.add.overlap(this.player, this.barrels, (obj1, obj2) => {
            if (!this.weaponFlag) {
                alert("You have got a new weapon. Press x to hit");
                this.weaponFlag = true;
            }        });

        this.physics.add.overlap(this.player, this.wizardWand, () => {
            // Check if the character is currently vulnerable
            if (this.isVulnerable) {
                // Remove a heart when the character is hit by an wizardSword
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

        this.physics.add.overlap(this.player, this.wizardWandMagic, () => {
            // Check if the character is currently vulnerable
            if (this.isVulnerable) {
                // Remove a heart when the character is hit by an wizardSword
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

        this.physics.add.overlap(this.sword, this.wizard, () => {
            if (!this.isSwordHit) {
                // Check if the wizard is currently vulnerable
                if (this.isVulnerableWizard) {
                    // Remove a heart when the wizard is hit by the player's sword
                    this.removeWizardHeart();
                    // Set the wizard as not vulnerable and start the cooldown timer
                    this.isVulnerableWizard = false;
                    this.time.delayedCall(1000, () => {
                        this.isVulnerableWizard = true;
                    });
                    // Restart the scene when all wizard's hearts are gone
                    if (this.heartsWizardGroup.getLength() === 0) {
                        // Disable physics for each object in the wizard group
                        this.wizardGroup.children.iterate(child => {
                            this.physics.world.disableBody(child.body);
                        });

                        // Make the wizard group invisible
                        this.wizardGroup.setVisible(false);

                        //TODO: Change this
                        this.keyFlag = true;
                    }
                }
                this.isSwordHit = true; // Set the flag to true to indicate that the sword has hit the wizard
            }
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

        this.physics.add.overlap(this.player, this.healthPotion, (player, potion) => {
            if (this.lives < 3) {
                this.lives += 1;
                potion.destroy();
                this.updateHeartsDisplay(); // Call the function to update hearts display
            }
        });

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
        this.rKey = this.input.keyboard.addKey('R');

        alert("In your way of travelling to another world. You lost your sword...");

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
        let offsetWizardX = -4; // Initial offset from the character's x position

        this.heartsWizardGroup.children.iterate(heart => {
            heart.setPosition(this.wizard.x + offsetWizardX, this.wizard.y - 8); // Adjust y-position to be above the character's head
            offsetWizardX += 12; // Increment the offset for each heart
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

    setRandomWizardWandMagicMovement() {
        // Define movement parameters
        const moveDistance = 200; // Maximum distance the wizardWandMagic will move away from the wizard
        const moveSpeed = 2000; // Speed of the movement in milliseconds

        // Clear any existing tweens on the wizardWandMagic
        this.tweens.killTweensOf(this.wizardWandMagic);

        // Generate random x and y offsets within the specified range
        const randomX = Phaser.Math.Between(-moveDistance, moveDistance);
        const randomY = Phaser.Math.Between(-moveDistance, moveDistance);

        // Tween to move the wizardWandMagic away from the wizard in a random direction
        this.tweenwizardWandMagic = this.tweens.add({
            targets: this.wizardWandMagic,
            x: () => this.wizard.x + randomX, // Move to a random position relative to the wizard's x position
            y: () => this.wizard.y + randomY, // Move to a random position relative to the wizard's y position
            duration: moveSpeed,
            ease: 'Linear',
            onComplete: () => {
                // Tween to move the wizardWandMagic back to the wizard's position
                this.tweens.add({
                    targets: this.wizardWandMagic,
                    x: this.wizard.x,
                    y: this.wizard.y,
                    duration: moveSpeed,
                    ease: 'Linear',
                    onComplete: () => {
                        // Call the function again to create continuous random movement
                        this.setRandomWizardWandMagicMovement();
                    }
                });
            }
        });
    }

    setRandomWizardMovement() {
        // Generate a random direction and speed
        const directions = [
            { x: 1, y: 0 }, // right
            { x: -1, y: 0 }, // left
            { x: 0, y: 1 }, // down
            { x: 0, y: -1 } // up
        ];
        const randomDirection = Phaser.Math.RND.pick(directions);

        // Set velocity for both wizard and wizardWandMagic
        this.wizardGroup.children.iterate(child => {
            child.setVelocity(randomDirection.x * this.wizardSpeed, randomDirection.y * this.wizardSpeed);
        });

        // Set a timer to change direction after a random interval
        const randomInterval = Phaser.Math.Between(2000, 4000); // Increase the interval range for slower changes
        this.time.delayedCall(randomInterval, this.setRandomWizardMovement, [], this);
    }

    removeHeart() {
        if (this.heartsGroup.getLength() > 0) {
            const heartToRemove = this.heartsGroup.getChildren()[this.heartsGroup.getLength() - 1];
            heartToRemove.destroy();
        }
    }

    removeWizardHeart() {
        if (this.heartsWizardGroup.getLength() > 0) {
            const heartToRemove = this.heartsWizardGroup.getChildren()[this.heartsWizardGroup.getLength() - 1];
            heartToRemove.destroy();
        }
    }

    updateSwordPosition() {
        // Calculate sword position relative to the townie's center
        const swordOffsetX = this.player.flipX ? -5 : 20; // Distance from the townie's center
        const swordOffsetY = 10; // Adjust this value to position the sword vertically

        // Update the sword position
        this.sword.x = this.player.x + swordOffsetX;
        this.sword.y = this.player.y + swordOffsetY;

        if (!this.physics.overlap(this.sword, this.wizard)) {
            this.isSwordHit = false; // Reset the flag if the sword is not overlapping with the wizard
        }
    }

    setRandomGhostWizardMovement() {
        // Iterate through each ghostWizard and set random movement
        this.ghostWizards.forEach(ghostWizard => {
            // Generate a random direction
            const directions = [
                { x: 1, y: 0 }, // right
                { x: -1, y: 0 }, // left
                { x: 0, y: 1 }, // down
                { x: 0, y: -1 } // up
            ];
            const randomDirection = Phaser.Math.RND.pick(directions);

            // Set velocity for each ghostWizard based on the wizard ghosts speed
            const velocityX = randomDirection.x * this.enemySpeed + 2;
            const velocityY = randomDirection.y * this.enemySpeed + 2;
            ghostWizard.setVelocity(velocityX, velocityY);
        });

        // Set a timer to change direction for each ghostWizard after a random interval
        const randomInterval = Phaser.Math.Between(2000, 4000); // Increase the interval range for slower changes
        this.time.delayedCall(randomInterval, this.setRandomGhostWizardMovement, [], this);
    }

    killGhostWizard(sword, ghostWizard) {
        // Disable physics for the ghostWizard
        this.physics.world.disableBody(ghostWizard.body);
        // Make the ghostWizard sprite invisible
        ghostWizard.setVisible(false);
        // Destroy the ghostWizard sprite
        ghostWizard.destroy();
        // Remove the ghostWizard from the ghostWizards array
        const index = this.ghostWizards.indexOf(ghostWizard);
        if (index !== -1) {
            this.ghostWizards.splice(index, 1);
        }
    }

    playerHitByGhostWizard() {
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

    toggleGhostWizardsVisibility() {
        // Determine the number of ghost wizards to toggle visibility
        const numToToggle = Phaser.Math.Between(1, this.ghostWizards.length);

        // Create an array of indices representing all ghost wizards
        const allIndices = Array.from({ length: this.ghostWizards.length }, (_, index) => index);

        // Shuffle the array of indices randomly
        Phaser.Utils.Array.Shuffle(allIndices);

        // Select the first 'numToToggle' indices from the shuffled array
        const indicesToToggle = allIndices.slice(0, numToToggle);

        // Toggle visibility for selected ghost wizards
        this.ghostWizards.forEach((ghostWizard, index) => {
            ghostWizard.setVisible(indicesToToggle.includes(index));
        });
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }
}