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
        this.lives = data.lives;

        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("mysticalCastle", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.physics.world.setBounds(0, 0, 200 * 18, 25 * 18);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Castle", this.tileset, 0, 0);

        // Create townsfolk sprite
        // Use setOrigin() to ensure the tile space computations work well
        this.purpleTownie = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(5), "purple").setOrigin(0, 0);

        // Enable physics for the sprite without debug visuals
        this.physics.add.existing(this.purpleTownie);
        this.purpleTownie.body.setCollideWorldBounds(true);

        this.heartsGroup = this.add.group();

        // Add three hearts above the character
        for (let i = 0; i < this.lives; i++) {
            const heart = this.physics.add.sprite(20 + i * 20, 20, "fullHeartMysticalCastle").setOrigin(0.5, 0.5);
            this.heartsGroup.add(heart);
        }

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
        this.cameras.main.startFollow(this.purpleTownie, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);

        this.activeCharacter = this.purpleTownie;

        // Add key handlers for arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Find the port to next level in the "Objects" layer in Phaser
        this.princess = this.map.createFromObjects("Objects", {
            name: "princess",
            key: "tilemap_sheet",
            frame: 99
        });

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

        // Enable collision handling
        this.physics.add.overlap(this.purpleTownie, this.princess, (obj1, obj2) => {
            this.scene.start("endScene");
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

        // Update heart position relative to the character
        let offsetX = -4; // Initial offset from the character's x position

        this.heartsGroup.children.iterate(heart => {
            heart.setPosition(this.purpleTownie.x + offsetX, this.purpleTownie.y - 8); // Adjust y-position to be above the character's head
            offsetX += 12; // Increment the offset for each heart
        });
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