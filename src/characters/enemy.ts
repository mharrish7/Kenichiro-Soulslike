// @ts-nocheck


import Phaser from 'phaser';
import HealthBar from '../objects/healthbar';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
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
                this.anims.play('idle', 40, false);
            }
            this.isAnime = false;

        });
        this.anims.play('idle', 40, false);
    }

    getHealthBar(): HealthBar {
        return this.healthBar;
    }

    startAttack() {
        if (!this.scheduled && !this.deflected) {
            let timeDelay = 0;
            let attackAnim = 'idle'; // Default animation
    
            const healthPercentage = this.healthBar.getHealth() / 100; // Calculate health percentage
    
            if (healthPercentage < 0.5) { // Phase 2 (less than 50%)
                timeDelay = 100; // No delay in phase 2
                attackAnim = 'attack1'; // Use attack1 animation
            } else { // Phase 1 (50% or more)
                timeDelay = (Math.random() * 3) * 500;
                attackAnim = 'attackboss'; // Use attackboss animation
            }
    
            this.scheduled = true;
            setTimeout(() => {
                if ( this.anims && this.anims.currentAnim.key === "idle" && !this.deflected) {
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
        this.anims.play('deflect', false);
        setTimeout(() => { this.deflected = false }, 1500); // Reset after deflect animation
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
            key: 'attack1',
            frames: this.scene.anims.generateFrameNumbers('attack1', { start: 0, end: 23 }),
            frameRate: 30,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'attackboss',
            frames: this.scene.anims.generateFrameNumbers('attack1', { start: 0, end: 23 }), // Reusing attack1 for now
            frameRate: 25,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'deflect',
            frames: this.scene.anims.generateFrameNumbers('deflect', { start: 0, end: 34 }),
            frameRate: 50,
            repeat: 0
        });

        this.on('animationstart', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === 'attack1' || animation.key === 'attackboss') {
                this.body.setSize(300, 300); 
                if(this.flipX){
                    this.body.setOffset(50,300)
                }
                else {
                    this.body.setOffset(250,300)
                }
            }
        });

        this.on('animationcomplete', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === 'attack1' || animation.key === 'attackboss') {
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