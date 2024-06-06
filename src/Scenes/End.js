// Name: Sandra Sorensen
// Asssigment: Gallery shooter game

class End extends Phaser.Scene {
    constructor() {
        super("endScene");
        this.spaceKey = null;
        this.my = { sprite: {}, text: {} };
    }

    preload() {
        this.load.bitmapFont("rocketSquare", "./assets/KennyRocketSquare.png", "./assets/KennyRocketSquare.fnt");
        this.load.image("black", "./assets/black.png");
    }

    create(data) {
        // Access the score from the data object
        const score = data.score;
    
        // Calculate center of the screen
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
    
        // Display the "GAME OVER" text in the game over screen
        const gameOverText = this.add.bitmapText(centerX, centerY - 50, 'rocketSquare', 'GAME ENDED');
        // Set tint color
        gameOverText.setTint(0xff69b4);
        // Set text origin to center
        gameOverText.setOrigin(0.5);
    
        // Display the score text in the game over screen
        const scoreText = this.add.bitmapText(centerX, centerY, 'rocketSquare', 'Score: ' + score);
        // Set tint color
        scoreText.setTint(0xff69b4);
        // Set text origin to center
        scoreText.setOrigin(0.5);
    
        // Display the instruction text in the game over screen
        const instructionText = this.add.bitmapText(centerX, centerY + 50, 'rocketSquare', 'Tap space bar to restart game');
        // Set tint color
        instructionText.setTint(0xff69b4);
        // Set text origin to center
        instructionText.setOrigin(0.5);
    
        // Event listener for space key down event
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
        // Event listener for space key down event
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }
    
    
    update() {

        if (this.spaceKey.isDown) {
            this.scene.start("platformerScene");
        }
    }
}
