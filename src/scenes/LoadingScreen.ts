// @ts-nocheck

import Phaser from 'phaser';

export default class LoadingScene extends Phaser.Scene {
    private progressBar: Phaser.GameObjects.Graphics;
    private progressBox: Phaser.GameObjects.Graphics;
    private loadingText: Phaser.GameObjects.Text;
    private percentText: Phaser.GameObjects.Text;
    private assetText: Phaser.GameObjects.Text;

    constructor() {
        super('loading-scene');
    }

    preload() {
        // Create the progress bar elements
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        this.progressBar = this.add.graphics();

        this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
        this.percentText = this.add.text(width / 2, height / 2 - 5, '0%', { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5);
        this.assetText = this.add.text(width / 2, height / 2 + 30, '', { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5);

        // Load assets, using events to update the progress bar
        this.load.on('progress', (value: number) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0xffffff, 1);
            this.progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
            this.percentText.setText(Math.round(value * 100) + '%');
        });

        this.load.on('fileprogress', (file: Phaser.Loader.File) => {
            this.assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', () => {
            this.loadingText.destroy();
            this.percentText.destroy();
            this.assetText.destroy();
            this.progressBox.destroy();
            this.progressBar.destroy();
            this.scene.start('hello-world');
        });


        // Load your assets here:
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
        // No need to add anything here for the progress bar itself
    }
}