// Sandra Sorensen
// Created: 6/6/2024
// Phaser: 3.80.0

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 600,
    height: 550,
    scene: [Load, MysticalCastle, DarkCave, EnchantedForest, Start, Rules, EndCredit]
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}};

const game = new Phaser.Game(config);

