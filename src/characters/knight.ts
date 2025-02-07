// @ts-nocheck


import Phaser from 'phaser';
import HealthBar from '../objects/healthbar';

export default class Knight extends Phaser.Physics.Arcade.Sprite {
    private isAnime: boolean = false;
    private healthBar: HealthBar;
    private hit_sound: Phaser.Sound.BaseSound;
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private scheduled: boolean = false;
    private deflected: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.body.setSize(150, 300);
        this.body.setOffset(200, 300);

        this.healthBar = new HealthBar(scene, 600, 10); 

        this.hit_sound = scene.sound.add("hit1");

        this.emitter = scene.add.particles(0, 0, 'red', {
            speed: 100,
            scale: { start: 0.1, end: 0 },
            blendMode: 'ADD'
        });
        this.emitter.startFollow(this);
        this.emitter.visible = false;

        this.createAnimations();
        this.on('animationcomplete', () => {
            if (this.anims.currentAnim.key !== 'deflect') { // Don't reset animation if deflecting.
                this.anims.play('knight_idle', 40, false);
            }
            this.isAnime = false;

        });
        this.anims.play('knight_idle', 40, false);
    }

    getHealthBar(): HealthBar {
        return this.healthBar;
    }

    startAttack() {
        if (!this.scheduled && !this.deflected) {
            let timeDelay = 0;
            let attackAnim = 'knight_idle'; // Default animation
    
            const healthPercentage = this.healthBar.getHealth() / 100; // Calculate health percentage
    
            if (healthPercentage < 0.5) { // Phase 2 (less than 50%)
                timeDelay = 100; // No delay in phase 2
                let ran = Math.round(Math.random());
                if(ran){
                    attackAnim = 'knight_attack1'; 
                }
                else {
                    attackAnim = 'knight_attackboss'; 
                }
                // Use attack1 animation
            } else { // Phase 1 (50% or more)
                timeDelay = 100;
                attackAnim = 'knight_attackboss'; // Use attackboss animation
            }
    
            this.scheduled = true;
            setTimeout(() => {
                if (this.anims && this.anims.currentAnim.key === "knight_idle" && !this.deflected) {
                    this.anims.play(attackAnim, true);
                    this.isAnime = true;
                }
                this.scheduled = false;
            }, timeDelay);
        }
    }

    takeDamage(damage: number) {
        this.healthBar.decrease(damage);
    }

    deflect() {
        this.deflected = true;
        this.anims.play('knight_idle', false);
        setTimeout(() => { this.deflected = false }, 1500); // Reset after deflect animation
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'knight_walk',
            frames: this.scene.anims.generateFrameNumbers('knight_run', { start: 0, end: 32 }),
            frameRate: 24,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'knight_walkslow',
            frames: this.scene.anims.generateFrameNumbers('knight_run', { start: 0, end: 32 }),
            frameRate: 20,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'knight_idle',
            frames: this.scene.anims.generateFrameNumbers('knight_idle', { start: 0, end: 62 }),
            frameRate: 24,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'knight_attack1',
            frames: this.scene.anims.generateFrameNumbers('knight_attack2', { start: 0, end: 60 }),
            frameRate: 60,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'knight_attackboss',
            frames: this.scene.anims.generateFrameNumbers('knight_attack1', { start: 0, end: 35 }), // Reusing attack1 for now
            frameRate: 25,
            repeat: 0
        });

        this.on('animationstart', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if ( animation.key === 'knight_attackboss' ) {
                this.body.setSize(300, 300); 
                if(this.flipX){
                    this.body.setOffset(250,300)
                }
                else {
                    this.body.setOffset(50,300)
                }
            }

            if (animation.key === 'knight_attack1') {
                this.body.setSize(600, 300); 
                if(this.flipX){
                    this.body.setOffset(50,300)
                }
                else {
                    this.body.setOffset(50,300)
                }
            }


        });

        this.on('animationcomplete', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === 'knight_attack1' || animation.key === 'knight_attackboss') {
                this.body.setSize(150, 300); 
                this.body.setOffset(250,300)
            }
        });
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        

        this.healthBar.changePos(this.x - 40, this.y - 10);
        if (this.healthBar.getHealth() < 50) {
            this.emitter.visible = true;
        }
        this.healthBar.changePos(this.x - 40, this.y - 10);
        if (this.healthBar.getHealth() < 50) {
            this.emitter.visible = true;
        }
    }
}