// @ts-nocheck


import Phaser from 'phaser';
import HealthBar from '../objects/healthbar';

export default class Hero extends Phaser.Physics.Arcade.Sprite {
    private isAnime: boolean = false;
    private prevTime: number = 0;
    private healthBar: HealthBar;
    private hit: boolean = false;
    private deflect_sound: Phaser.Sound.BaseSound;
    private hit_sound: Phaser.Sound.BaseSound;
    private hithero_sound: Phaser.Sound.BaseSound;


    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.body.setSize(150, 300);
        this.body.setOffset(250, 300);

        this.healthBar = new HealthBar(scene, 10, 10);

        this.deflect_sound = scene.sound.add("deflect");
        this.hit_sound = scene.sound.add("hit1");
        this.hithero_sound = scene.sound.add("hithero");

        this.createAnimations();

        this.on('animationcomplete', () => {
            this.isAnime = false;
        });
    }

    getHealthBar(): HealthBar {
        return this.healthBar;
    }

    handleInput(cursors: Phaser.Input.Keyboard.CursorKeys, spaceKey: Phaser.Input.Keyboard.Key, zKey: Phaser.Input.Keyboard.Key, xKey: Phaser.Input.Keyboard.Key, cKey: Phaser.Input.Keyboard.Key) {
        if (spaceKey.isDown && this.body.onFloor()) {
            this.setVelocityY(-800);
        }

        if (cKey.isDown && this.body.onFloor() && !this.hit && !this.isAnime) {
            const direction = this.flipX ? -1 : 1;
            this.setVelocityX(direction * 800);
            this.anims.play('roll', true);
            this.isAnime = true;
            this.hit = true;
            setTimeout(() => { this.hit = false }, 400);
        }

        if (zKey.isDown && !this.isAnime) {
            const curTime = Date.now();
            if (curTime - this.prevTime < 5 * 1000) {
                this.anims.play('attack2', 40, false);
                this.prevTime = 0;
            } else {
                this.anims.play('attack1', false);
                this.prevTime = curTime;
            }
            this.isAnime = true;
        }

        if (xKey.isDown && !this.isAnime) {
            this.anims.play('deflect', false);
            this.isAnime = true;
        }

        if (cursors.left.isDown && !this.isAnime) {
            this.setVelocityX(-300);
            this.anims.play('walk', true);
            this.setFlipX(true);
        } else if (cursors.right.isDown && !this.isAnime) {
            this.setVelocityX(300);
            this.anims.play('walk', true);
            this.setFlipX(false);
        } else {
            if (!this.hit) this.setVelocityX(0);
            if (!this.isAnime) {
                this.anims.play('idle', true);
            }
        }
    }

    deflect(enemy: Enemy) {
        this.deflect_sound.play();
        this.hit = true;
        const direction = this.flipX ? -1 : 1;
        if(this.flipX == false){
            this.setVelocityX(-400);	
        } else {
            this.setVelocityX(400);	
        }
        setTimeout(() => { this.hit = false }, 500);
        
    }

    takeDamage(damage: number) {
        this.hithero_sound.play();
        this.healthBar.decrease(damage);
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNumbers('run', { start: 0, end: 32 }),
            frameRate: 24,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'walkslow',
            frames: this.scene.anims.generateFrameNumbers('run', { start: 0, end: 32 }),
            frameRate: 20,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('idle', { start: 0, end: 98 }),
            frameRate: 24,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'roll',
            frames: this.scene.anims.generateFrameNumbers('roll', { start: 0, end: 36 }),
            frameRate: 60,
            repeat: 0,
        });

        this.scene.anims.create({
            key: 'attack1',
            frames: this.scene.anims.generateFrameNumbers('attack1', { start: 0, end: 23 }),
            frameRate: 50,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'attack2',
            frames: this.scene.anims.generateFrameNumbers('attack2', { start: 0, end: 21 }),
            frameRate: 50,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'deflect',
            frames: this.scene.anims.generateFrameNumbers('deflect', { start: 0, end: 34 }),
            frameRate: 50,
            repeat: 0
        });

        this.on('animationstart', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === 'attack1' || animation.key === 'attack2') {
                this.body.setSize(300, 300); // Widen the body. Adjust 250 as needed.
                if(this.flipX){
                    this.body.setOffset(50,300)
                }
                else {
                    this.body.setOffset(250,300)
                }
            }
        });

        // Add listener for animation complete:
        this.on('animationcomplete', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === 'attack1' || animation.key === 'attack2') {
                this.body.setSize(150, 300); // Reset to the original size.
                this.body.setOffset(250,300)
            }
        });
    }

    preUpdate(time: number, delta: number) {

        this.healthBar.changePos(this.x - 40, this.y - 10);
        if (this.healthBar.getHealth() < 50) {
            this.emitter.visible = true;
        }

        super.preUpdate(time, delta);
        this.healthBar.changePos(this.x - 40, this.y - 10);
    }
}