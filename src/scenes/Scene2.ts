// @ts-nocheck


import Phaser from 'phaser';
import Hero from '../characters/hero';
import Knight from '../characters/knight';

export default class Scene2 extends Phaser.Scene {
    private player: Hero;
    private enemy: Knight;
    private cursors: Phaser.Input.Keyboard.CursorKeys;
    private space: Phaser.Input.Keyboard.Key;
    private zKey: Phaser.Input.Keyboard.Key;
    private xKey: Phaser.Input.Keyboard.Key;
    private cKey: Phaser.Input.Keyboard.Key;
    private platforms: Phaser.Physics.Arcade.StaticGroup;
    private hit_sound: Phaser.Sound.BaseSound;
    private gameOverText: Phaser.GameObjects.Text;
    private playerDirection:Number;
    private playerPos: Number;
    private punch : Phaser.Sound.BaseSound;

    constructor() {
        super('scene-2');
    }

    preload() {
        this.load.image('samurai', 'assets/run/spritesheet.png');
        this.load.spritesheet('run', 'assets/run/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('idle', 'assets/idle/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('deflect', 'assets/deflect/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('attack1', 'assets/attack/attack1.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('attack2', 'assets/attack/attack2.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('roll', 'assets/roll/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('knight_attack1', 'assets/Knight/_Attack.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('knight_attack2', 'assets/Knight/_Attack2.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('knight_idle', 'assets/Knight/_Idle.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('knight_run', 'assets/Knight/_Run.png', { frameWidth: 600, frameHeight: 600 });
        this.load.audio('deflect', ['assets/music/deflect.mp3']);
        this.load.audio('hithero', ['assets/music/hithero.mp3']);
        this.load.audio('hit1', ['assets/music/hit1.mp3']);
        this.load.audio('punch', ['assets/music/punch.mp3']);
        this.load.audio('teleport', ['assets/music/teleport.mp3']);
        this.load.image('ground', ['assets/platform/platform.png']);
        this.load.image('red', 'assets/particles/red.png');
        
    }

    create() {


    
        const gameWidth = this.game.config.width as number;
        const gameHeight = this.game.config.height as number;

        const worldWidth = gameWidth * 3;   // Example: 3 times the game width
        const worldHeight = gameHeight; // Keep the height the same (or adjust as needed)

        this.physics.world.setBounds(0, 0, worldWidth, worldHeight); // Set the WORLD bounds
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight); 

        this.platforms = this.physics.add.staticGroup();
        this.punch = this.sound.add("punch");
        const tileWidth = 100; // Your tile width
        const numTiles = Math.ceil(worldWidth / tileWidth); // Calculate how many tiles we need (rounding up)

        let currentX = 0; // Keep track of the current x position

        for (let i = 0; i < numTiles; i++) {
            const groundTile = this.platforms.create(currentX + tileWidth / 2, gameHeight, 'ground'); // Center the tile
            groundTile.setScale(1, 1); // Important to reset any scaling that might have been applied
            groundTile.refreshBody();

            currentX += tileWidth; // Increment x for the next tile
        }


        this.teleport = this.sound.add("teleport");

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
            const enemy = new Knight(this, x, gameHeight-200, 'knight_idle').setScale(0.5);
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
            if ((player.anims.currentAnim.key === 'deflect' && player.anims.currentFrame.index < 20) &&
                ((enemy.anims.currentAnim.key === "knight_attackboss" && enemy.anims.currentFrame.index === 20) || (enemy.anims.currentAnim.key === "knight_attack1" && enemy.anims.currentFrame.index === 29))) {
                if (player.flipX == enemy.flipX){
                    player.deflect(enemy);
                    enemy.deflect();
                } else {
                    if (this.isPlayerInSameSide(enemy, player) && !this.player.hit) {
                        player.takeDamage(15);
                        if(enemy.anims.currentAnim.key === "knight_attack1" ){
                            player.takeDamage(15);
                        }
                        this.punch.play();
                    }
                }
                
            } 
            else if ((enemy.anims.currentAnim.key === "knight_attackboss" && enemy.anims.currentFrame.index === 20) || (enemy.anims.currentAnim.key === "knight_attack1" && enemy.anims.currentFrame.index === 32)){
                if (this.isPlayerInSameSide(enemy, player) && !this.player.hit) {
                    player.takeDamage(15);
                    if(enemy.anims.currentAnim.key === "knight_attack1" ){
                        player.takeDamage(15);
                    }
                    this.punch.play();
                }
            }
            
        }
    }


    handlePlayerOverlap(player: Hero, enemy: Enemy) {
        if (enemy && enemy.getHealthBar) { // Check if enemy exists AND has getHealthBar
            if ((player.anims.currentAnim.key === "attack1" || player.anims.currentAnim.key === "attack2") && player.anims.currentFrame.index === (player.anims.currentAnim.key === "attack1" ? 14 : 19)) {
                if (!this.heroHasHit) {
                    enemy.takeDamage(5);
                    this.hit_sound.play();
                    this.heroHasHit = true;
                }
            } else {
                this.heroHasHit = false;
            }
        }
    }

    isPlayerInSameSide(enemy: Enemy, player: Hero) {
        return (enemy.flipX && player.x > enemy.x) || (!enemy.flipX && player.x < enemy.x);
    }

    update() {


        this.player.handleInput(this.cursors, this.space, this.zKey, this.xKey, this.cKey);

        this.enemies.getChildren().forEach((enemy: Enemy) => {
            if (enemy.anims.currentAnim.key === "knight_attack1" && enemy.anims.currentFrame.index === 10){
                this.playerDirection = this.player.flipX ? -1 : 1;
                this.playerPos = this.player.x;
            }
            if (enemy.anims.currentAnim.key === "knight_attack1" && enemy.anims.currentFrame.index === 27) {
                // Frame 27 of knight_attackboss reached!
                this.teleport.play();
                // 1. Teleport enemy behind player
                const teleportDistance = 100; // Adjust as needed
                const newX = this.playerPos - this.playerDirection * teleportDistance;
                const newY = this.player.y;
                const worldBounds = this.physics.world.bounds;
                if (newX >= worldBounds.left && newX <= worldBounds.right) {
                    enemy.setPosition(newX, newY);
                    enemy.setVelocityX(0); // Stop any existing velocity
                } else {
                    if (newX < worldBounds.left) {
                        enemy.setPosition(worldBounds.left + teleportDistance/2, newY);
                    } else {
                        enemy.setPosition(worldBounds.right - teleportDistance/2, newY);
                    }
                }

            }
        



            if (enemy && enemy.getHealthBar) { // <--- Crucial check here!
                enemy.startAttack();
                
                const dx = this.player.x - enemy.x;
                const direction = Math.sign(dx);
                if (!enemy.isAnime){
                    enemy.setFlipX(direction > 0); // animation is opposite for this character
                }
                const enemySpeed = enemy.getHealthBar().getHealth() < 50 ? 100 : 50;
                const telport = enemy.getHealthBar().getHealth() < 50 ? true : false;
                if (telport && Math.abs(dx) > 100 && !enemy.isAnime){
                    enemy.setVelocityX(0);
                    enemy.anims.play('knight_attack1', true);
                }
                else if (Math.abs(dx) > 100 && !enemy.isAnime) {
                    enemy.setVelocityX(direction * enemySpeed);
                    enemy.anims.play('knight_walk', true);
                } else {
                    enemy.setVelocityX(0);
                    if (!enemy.isAnime) {
                        enemy.anims.play('knight_idle', true);
                    }
                }

                if (enemy.getHealthBar().getHealth() <= 0) {
                    enemy.destroy();
                }
            }

            if (!enemy || !enemy.getHealthBar() || enemy.getHealthBar().getHealth() <= 0) {
                if (!this.fadeOut) { // Start fade out only once
                    this.fadeOut = true;
                    const fadeDuration = 1000; 
                    this.cameras.main.fadeOut(fadeDuration, 0, 0, 0); // Black fade
    
                    this.time.delayedCall(fadeDuration, () => {
                        this.scene.start('loading-scene'); // Switch to Scene2
                    });
                }
            }
        });

        if ( !this.player || !this.player.getHealthBar() || this.player.getHealthBar().getHealth() <= 0) {
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

                this.time.delayedCall(fadeDuration, () => {
                    this.scene.start('loading-scene'); // Switch to Scene2
                });
            }
        }
    }
}