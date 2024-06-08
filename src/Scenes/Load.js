class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load townsfolk
        this.load.image("purple", "purple_townie.png");
        this.load.image("blue", "blue_townie.png");
        this.load.image("weakOrch", "tile_0004.png");


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
        });                 // Packed tilemap



        this.load.tilemapTiledJSON("mysticalCastle", "mysticalCastle.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("darkCave", "darkCave.tmj");
        this.load.tilemapTiledJSON("enchantedForest", "enchantedForest.tmj");   // Tilemap in JSON
           // Tilemap in JSON
    }

    create() {
        

         // ...and pass to the next Scene
         this.scene.start("enchantedForestScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}