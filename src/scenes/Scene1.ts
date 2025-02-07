// @ts-nocheck


import Phaser from 'phaser';
import Hero from '../characters/hero';
import Enemy from '../characters/enemy';

export default class Scene1 extends Phaser.Scene {
    private player: Hero;
    private enemy: Enemy;
    private cursors: Phaser.Input.Keyboard.CursorKeys;
    private space: Phaser.Input.Keyboard.Key;
    private zKey: Phaser.Input.Keyboard.Key;
    private xKey: Phaser.Input.Keyboard.Key;
    private cKey: Phaser.Input.Keyboard.Key;
    private platforms: Phaser.Physics.Arcade.StaticGroup;
    private hit_sound: Phaser.Sound.BaseSound;
    private gameOverText: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.TileSprite;

    constructor() {
        super('scene-1');
    }

    preload() {
        this.load.image('samurai', 'assets/run/spritesheet.png');
        this.load.spritesheet('run', 'assets/run/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('idle', 'assets/idle/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('deflect', 'assets/deflect/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('attack1', 'assets/attack/attack1.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('attack2', 'assets/attack/attack2.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('roll', 'assets/roll/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.audio('deflect', ['assets/music/deflect.mp3']);
        this.load.audio('hithero', ['assets/music/hithero.mp3']);
        this.load.audio('hit1', ['assets/music/hit1.mp3']);
        this.load.image('ground', ['assets/platform/platform.png']);
        this.load.image('red', 'assets/particles/red.png');
        this.load.image('background', 'assets/background.jpg');
    }

    create() {


        this.fadeOut = false;
        const gameWidth = this.game.config.width as number;
        const gameHeight = this.game.config.height as number;

        const worldWidth = gameWidth * 3;   // Example: 3 times the game width
        const worldHeight = gameHeight; // Keep the height the same (or adjust as needed)

        this.physics.world.setBounds(0, 0, worldWidth, worldHeight); // Set the WORLD bounds
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight); // Se

        this.platforms = this.physics.add.staticGroup();
        // this.background = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'background').setOrigin(0);
        // this.background.setDepth(-1);
        const tileWidth = 100; // Your tile width
        const numTiles = Math.ceil(worldWidth / tileWidth); // Calculate how many tiles we need (rounding up)

        let currentX = 0; // Keep track of the current x position

        for (let i = 0; i < numTiles; i++) {
            const groundTile = this.platforms.create(currentX + tileWidth / 2, gameHeight, 'ground'); // Center the tile
            groundTile.setScale(1, 1); // Important to reset any scaling that might have been applied
            groundTile.refreshBody();

            currentX += tileWidth; // Increment x for the next tile
        }



        // Adjust the last tile's width if necessary
        const lastTile = this.platforms.getChildren()[this.platforms.getChildren().length - 1];
        if (lastTile) {
        const remainingWidth = gameWidth - (numTiles - 1) * tileWidth;
        lastTile.setScale(remainingWidth/tileWidth, 1); // Set the scale based on the remaining width
        lastTile.refreshBody();
        }

        // this.platforms.create(300, gameHeight - 150, 'ground').setScale(0.5).refreshBody(); // Smaller platform
        // this.platforms.create(600, gameHeight - 400, 'ground').setScale(0.8).refreshBody(); // Another platform
        // this.platforms.create(900, gameHeight - 200, 'ground').setScale(0.3).refreshBody(); // Another platform


        this.player = new Hero(this, 250, 200, 'samurai').setScale(0.5);
        this.cameras.main.setBounds(0, 0, worldWidth, gameHeight);
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, false, true, true); // THEN set the camera to follow
        
        this.enemies = this.add.group(); 

        for (let i = 0; i < 1; i++) { 
            const x = Phaser.Math.Between(600, 900); 
            const enemy = new Enemy(this, x, gameHeight-300, 'samurai').setScale(0.75);
            this.enemies.add(enemy);
        }
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

        this.hit_sound = this.sound.add("hithero");
        this.gameOverText = this.add.text(700, 300, '', { fontSize: "32px", fill: "#000" });

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.enemies, this.player, this.handleEnemyOverlap, null, this);  // Enemy hits player
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerOverlap, null, this);  // Player hits enemy
    }

    handleEnemyOverlap(enemy: Enemy, player: Hero) {
        if (enemy && enemy.getHealthBar) { // Check if enemy exists AND has getHealthBar
            
            if (player.anims.currentAnim.key === 'deflect' && player.anims.currentFrame.index < 20 &&
                (enemy.anims.currentAnim.key === "attackboss" || enemy.anims.currentAnim.key === "attack1") && enemy.anims.currentFrame.index === 14) {
                player.deflect(enemy);
                enemy.deflect();
            } 
            else if (enemy.anims.currentAnim.key === "attackboss" || enemy.anims.currentAnim.key === "attack1") {
                if (enemy.anims.currentFrame.index === 14 && this.isPlayerInSameSide(enemy, player) && !this.player.hit) {
                    player.takeDamage(25);
                    this.hit_sound.play();
                }
            }
            
        }
    }


    handlePlayerOverlap(player: Hero, enemy: Enemy) {
        if (enemy && enemy.getHealthBar) { // Check if enemy exists AND has getHealthBar
            if ((player.anims.currentAnim.key === "attack1" || player.anims.currentAnim.key === "attack2") && player.anims.currentFrame.index === (player.anims.currentAnim.key === "attack1" ? 14 : 19)) {
                if (!this.heroHasHit) {
                    enemy.takeDamage(20);
                    this.hit_sound.play();
                    this.heroHasHit = true;
                }
            } else {
                this.heroHasHit = false;
            }
        }
    }

    isPlayerInSameSide(enemy: Enemy, player: Hero) {
        return (!enemy.flipX && player.x > enemy.x) || (enemy.flipX && player.x < enemy.x);
    }

    update() {

        this.player.handleInput(this.cursors, this.space, this.zKey, this.xKey, this.cKey);

        this.enemies.getChildren().forEach((enemy: Enemy) => {
            if (enemy && enemy.getHealthBar) { // <--- Crucial check here!
                enemy.startAttack();

                const dx = this.player.x - enemy.x;
                const direction = Math.sign(dx);
                enemy.setFlipX(direction < 0);
                const enemySpeed = enemy.getHealthBar().getHealth() < 50 ? 300 : 200;
                if (Math.abs(dx) > 100 && !enemy.isAnime) {
                    enemy.setVelocityX(direction * enemySpeed);
                    enemy.anims.play('walk', true);
                } else {
                    enemy.setVelocityX(0);
                    if (!enemy.isAnime) {
                        enemy.anims.play('idle', true);
                    }
                }

                if (enemy.getHealthBar().getHealth() <= 0) {
                    enemy.destroy();
                }
            } else {
                enemy.destroy();
            }

        });

        if (this.player.getHealthBar().getHealth() <= 0 || !this.player || !this.player.getHealthBar()) {
            if (!this.fadeOut) { // Start fade out only once
                this.fadeOut = true;
                const fadeDuration = 1000; 
                this.player.disableBody(true, true); // Disable player's physics body

                this.cameras.main.fadeOut(fadeDuration, 0, 0, 0); // Black fade

                this.time.delayedCall(fadeDuration, () => {
                    this.scene.start('loading-scene'); // Switch to Scene2
                });
            }
        }

        if (this.enemies.getLength() <= 0 || !this.enemies) {
            if (!this.fadeOut) { // Start fade out only once
                this.fadeOut = true;
                const fadeDuration = 1000; 
                this.cameras.main.fadeOut(fadeDuration, 0, 0, 0); // Black fade
                this.time.delayedCall(1000, () => {
                    this.scene.start('story-scene', { 
                        story: `Here you see General Ishiro, once a powerful commander, 
                        now a shadow of his former self.  Weakened by age and illness, his sword, 
                        which saw so many battles, is broken. He can no longer fight in the wars,
                         and now lives a lonely life.  Please, help him find peace from his suffering.
                         Click to continue`, // Your tutorial story text
                        nextScene: 'scene-2' // The scene to go to after the story
                    }); // Switch to Scene2
                });
            }
            
        }
    }
}