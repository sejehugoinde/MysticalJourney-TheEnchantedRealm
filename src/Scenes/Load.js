// Sandra Sorensen
// Created: 6/6/2024
// Phaser: 3.80.0

class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        
        // Load png's to darkCaveScene
        this.load.image("darkCavePlayer", "darkCavePlayer.png");
        this.load.image("key", "key.png");
        this.load.image("giantSword", "giantSword.png");
        this.load.image("giant", "giant.png");
        this.load.image("swordDarkCave", "swordDarkCave.png");
        this.load.image("openDoor", "openDoor.png");

        // Load png's to mysticalCastleScene
        this.load.image("fullHeartMysticalCastle", "fullHeartMysticalCastle.png");
        this.load.image("speakingBubble", "message_square.png");
        this.load.image("wizardMysticalCastle", "wizardMysticalCastle.png");
        this.load.image("wizardWand", "wizardWand.png");
        this.load.image("wizardWandMagic", "wizardWandMagic.png");
        this.load.image("ghostWizard", "ghostWizard.png");

        // Load png's to enchantedForestScene
        this.load.image("weakOrch", "weak_orch.png");
        this.load.image("axe", "weakOrcAttack.png");
        this.load.image("sword", "weakOrcAttack.png");
        this.load.image("fullHeart", "fullHeart.png");
        this.load.image("snake", "snake.png");
        this.load.image("playerEnchantedForest", "playerEnchantedForest.png");

        // TODO: clean-up
        this.load.image("purple", "purple_townie.png");
        this.load.image("blue", "blue_townie.png");

        // Load tilemap images with unique keys
        this.load.image("colored_tilemap_tiles", "colored_tilemap_packed.png");
        this.load.spritesheet("colored_tilemap_sheet", "colored_tilemap_packed.png", {
            frameWidth: 8,
            frameHeight: 8
        });
        
        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png"); 
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Tilemap in JSON
        this.load.tilemapTiledJSON("mysticalCastle", "mysticalCastle.tmj");
        this.load.tilemapTiledJSON("darkCave", "darkCave.tmj");
        this.load.tilemapTiledJSON("enchantedForest", "enchantedForest.tmj");
        this.load.tilemapTiledJSON("start", "start.tmj");
        this.load.tilemapTiledJSON("rules", "rules.tmj");
        this.load.tilemapTiledJSON("end", "end.tmj");
    }   

    create() {
        
         this.scene.start("endScene");
    }

}