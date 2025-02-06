// @ts-nocheck


import Phaser from 'phaser';
import Hero from './characters/hero';
import Enemy from './characters/enemy';

export default class HelloWorldScene extends Phaser.Scene {
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
    private enemyHasHit: boolean = false;
    private heroHit: boolean = false;
    private deflected: boolean = false;

    constructor() {
        super('hello-world');
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
    }

    create() {
        const gameWidth = this.game.config.width as number;
        const gameHeight = this.game.config.height as number;

        this.platforms = this.physics.add.staticGroup();

        const ground = this.platforms.create(gameWidth / 2, gameHeight, 'ground') 
            .setScale(gameWidth / 100 , 1) 
            .refreshBody();

        this.player = new Hero(this, 250, 200, 'samurai').setScale(0.5);
        this.enemies = this.add.group(); 

        for (let i = 0; i < 1; i++) { 
            const x = Phaser.Math.Between(600, 900); 
            const y = Phaser.Math.Between(200, 400); 
            const enemy = new Enemy(this, x, y, 'samurai').setScale(0.5);
            this.enemies.add(enemy);
        }
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

        this.hit_sound = this.sound.add("hit1");
        this.gameOverText = this.add.text(700, 300, '', { fontSize: "32px", fill: "#000" });

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.enemies, this.player, this.handleEnemyOverlap, null, this);  // Enemy hits player
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerOverlap, null, this);  // Player hits enemy
    }

    handleEnemyOverlap(enemy: Enemy, player: Hero) {
        if (enemy && enemy.getHealthBar) { // Check if enemy exists AND has getHealthBar
            if (enemy.anims.currentAnim.key === "attackboss" || enemy.anims.currentAnim.key === "attack1") {
                if (enemy.anims.currentFrame.index === 14 && this.isPlayerInSameSide(enemy, player) && !this.enemyHasHit) {
                    player.takeDamage(25);
                    this.hit_sound.play();
                    this.enemyHasHit = true;
                } else if (enemy.anims.currentFrame.index !== 14) {
                    this.enemyHasHit = false;
                }
            }

            if (player.anims.currentAnim.key === 'deflect' && player.anims.currentFrame.index < 20 &&
                (enemy.anims.currentAnim.key === "attackboss" || enemy.anims.currentAnim.key === "attack1") && enemy.anims.currentFrame.index === 14) {
                player.deflect(enemy);
                enemy.deflect();
                this.deflected = true;
            } else {
                this.deflected = false;
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
                const enemySpeed = enemy.getHealthBar().getHealth() < 50 ? 300 : 200;
                if (Math.abs(dx) > 150 && !enemy.isAnime) {
                    const direction = Math.sign(dx);
                    enemy.setVelocityX(direction * enemySpeed);
                    enemy.anims.play('walk', true);
                    enemy.setFlipX(direction < 0);
                } else {
                    enemy.setVelocityX(0);
                    if (!enemy.isAnime) {
                        enemy.anims.play('idle', true);
                    }
                }

                if (enemy.getHealthBar().getHealth() <= 0) {
                    enemy.destroy();
                }
            }
        });

        if (this.player.getHealthBar().getHealth() <= 0) {
            this.scene.pause();
            const gameOverMessage = "Game Over";
            this.gameOverText.setText(gameOverMessage);
        }

        if (this.enemies.getLength() <= 0) {
            this.scene.pause();
            const gameOverMessage = "You Win!";
            this.gameOverText.setText(gameOverMessage);
        }
    }
}