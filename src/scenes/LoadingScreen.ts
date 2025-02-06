// @ts-nocheck
import Phaser from 'phaser';

export default class LoadingScene extends Phaser.Scene {
    private progressBar: Phaser.GameObjects.Graphics;
    private progressBox: Phaser.GameObjects.Graphics;
    private loadingText: Phaser.GameObjects.Text;
    private percentText: Phaser.GameObjects.Text;
    private assetText: Phaser.GameObjects.Text;
    private gameNameText: Phaser.GameObjects.Text;
    private tutorialButton: Phaser.GameObjects.Rectangle;
    private tutorialText: Phaser.GameObjects.Text;
    private miniBossButton: Phaser.GameObjects.Rectangle;
    private miniBossText: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.TileSprite; // Added background

    constructor() {
        super('loading-scene');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;


        // Game Name Text
        this.gameNameText = this.add.text(width / 2, height / 4, 'KENICHIRO', { // Adjusted position
            fontSize: '64px', // Increased size
            fontFamily: 'Impact', // More impactful font (or your choice)
            color: '#FFD700', // Gold
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 5, offsetY: 5, color: '#000000', blur: 0, fill: true, stroke: true } // Added shadow
        }).setOrigin(0.5);

        // Progress Bar and Box (Styled)
        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x000000, 0.5); // Semi-transparent black
        this.progressBox.fillRoundedRect(width / 2 - 200, height / 2 - 25, 400, 50, 10); // Rounded corners

        this.progressBar = this.add.graphics();

        // Loading Text (More subtle)
        this.loadingText = this.add.text(width / 2, height / 2 - 70, 'Loading...', { 
            fontSize: '24px', 
            fontFamily: 'Arial',
            color: '#000000',
            alpha: 0.7 // Slightly transparent
        }).setOrigin(0.5);

        this.percentText = this.add.text(width / 2, height / 2 , '0%', { 
            fontSize: '20px', 
            fontFamily: 'Arial',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        this.assetText = this.add.text(width / 2, height / 2 + 35, '', { 
            fontSize: '18px', 
            fontFamily: 'Arial',
            color: '#000000',
            alpha:0.7
        }).setOrigin(0.5);


        this.load.on('progress', (value: number) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0xA0C878, 1); // Yellow progress
            this.progressBar.fillRoundedRect(width / 2 - 190, height / 2 - 15, 380 * value, 30, 10); // Rounded corners
            this.percentText.setText(Math.round(value * 100) + '%');
        });

        this.load.on('fileprogress', (file: Phaser.Loader.File) => {
            this.assetText.setText('Loading: ' + file.key);
        });

        this.load.on('complete', () => {
            this.loadingText.destroy();
            this.percentText.destroy();
            this.assetText.destroy();
            this.progressBox.destroy();
            this.progressBar.destroy();

            // Button Styling
            const buttonStyle = {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2,
                padding: { x: 20, y: 10 },
                borderRadius: 10,
                backgroundColor: '#007bff', // Blue
            };

            // Tutorial Button
            this.tutorialButton = this.add.rectangle(width / 2 - 150, height / 2 + 70, 200, 100, 0x007bff).setInteractive();
            this.tutorialText = this.add.text(width / 2 - 150, height / 2 + 70, 'Tutorial', buttonStyle).setOrigin(0.5);

            this.tutorialButton.on('pointerdown', () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('story-scene', { 
                        story: `Welcome to Kenichiro!

                        Use the Arrow Keys to move left and right.

                        Z Key: Attack
                        X Key: Parry (Deflect enemy attacks)
                        C Key: Roll (Dodge attacks and move quickly)

                        Press any key to see the full text

                        Good luck, Samurai!
                        Click to continue`, // Your tutorial story text
                        nextScene: 'scene-1' // The scene to go to after the story
                    });
                });
            });

            // Mini Boss Button
            this.miniBossButton = this.add.rectangle(width / 2 + 150, height / 2 + 70, 200, 100, 0x007bff).setInteractive();
            this.miniBossText = this.add.text(width / 2 + 150, height / 2 + 70, 'Mini Boss \n (Testing)', buttonStyle).setOrigin(0.5);

            this.miniBossButton.on('pointerdown', () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('story-scene', { 
                        story: `Here you see General Ishiro, once a powerful commander, 
                        now a shadow of his former self.  Weakened by age and illness, his sword, 
                        which saw so many battles, is broken. He can no longer fight in the wars,
                         and now lives a lonely life.  Please, help him find peace from his suffering.
                         Click to continue`, // Your tutorial story text
                        nextScene: 'scene-2' // The scene to go to after the story
                    });
                });
            });
        });


        // Load your assets here (unchanged)
       this.load.image('samurai', 'assets/Samurai/run/spritesheet.png');
        this.load.spritesheet('run', 'assets/Samurai/run/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('idle', 'assets/Samurai/idle/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('deflect', 'assets/Samurai/deflect/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('attack1', 'assets/Samurai/attack/attack1.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('attack2', 'assets/Samurai/attack/attack2.png', { frameWidth: 600, frameHeight: 600 });
        this.load.spritesheet('roll', 'assets/Samurai/roll/spritesheet.png', { frameWidth: 600, frameHeight: 600 });
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

    }
}