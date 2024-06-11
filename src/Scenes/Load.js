class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load townsfolk
        this.load.image("purple", "purple_townie.png");
        this.load.image("blue", "blue_townie.png");
        this.load.image("weakOrch", "weak_orch.png");
        this.load.image("axe", "weakOrcAttack.png");
        this.load.image("sword", "weakOrcAttack.png");
        this.load.image("fullHeart", "fullHeart.png");
        this.load.image("giant", "giant.png");
        this.load.image("giantSword", "giantSword.png");
        this.load.image("speakingBubble", "message_square.png");
        this.load.image("fullHeartMysticalCastle", "fullHeartMysticalCastle.png");
        this.load.image("snake", "snake.png");
        this.load.image("playerEnchantedForest", "playerEnchantedForest.png");

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
        
         // ...and pass to the next Scene
         this.scene.start("enchantedForestScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}