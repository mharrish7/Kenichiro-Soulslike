// @ts-nocheck

import Phaser from 'phaser';

export default class StoryScene extends Phaser.Scene {
    private text: Phaser.GameObjects.Text;
    private storyText: string;
    private currentCharacter: number;
    private typingTimer: Phaser.Time.TimerEvent;
    private nextSceneKey: string; // Key of the scene to transition to

    constructor() { // Pass the scene key in the constructor
        super('story-scene'); // Use passed key for the scene
    }

    init(data: { story: string; nextScene: string }) {
        this.storyText = data.story;
        this.nextSceneKey = data.nextScene;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
    
        const lines = this.storyText.split('\n'); // Split the story text into an array of lines
    
        let y = height / 2 - (lines.length * 30) / 2; // Starting y position (adjust 30 for line height)
    
        this.textObjects = []; // Array to store text objects
    
        for (const line of lines) {
            const text = this.add.text(width / 2, y, '', {
                fontFamily: 'Courier New',
                fontSize: '24px',
                color: '#000000',
                align: 'center',
                wordWrap: { width: width - 100, useAdvancedWrap: true }
            }).setOrigin(0.5);
            this.textObjects.push(text);
            y += 30; // Increment y for the next line
    
        }
    
        this.currentCharacter = 0;
        this.currentTextObjectIndex = 0;
        this.typingTimer = this.time.addEvent({
            delay: 50,
            callback: this.typeNextCharacter,
            callbackScope: this,
            loop: true
        });
    
        this.input.keyboard.on('keydown', this.skipTyping, this);
    }
    
    typeNextCharacter() {
        if (this.currentTextObjectIndex < this.textObjects.length) {
            const currentTextObject = this.textObjects[this.currentTextObjectIndex];
            const currentLine = this.storyText.split('\n')[this.currentTextObjectIndex];
    
            if (this.currentCharacter < currentLine.length) {
                currentTextObject.text += currentLine.charAt(this.currentCharacter);
                this.currentCharacter++;
            } else {
                this.currentCharacter = 0;
                this.currentTextObjectIndex++;
            }
    
            if (this.currentTextObjectIndex >= this.textObjects.length) {
                this.typingTimer.remove();
            }
        }
    }
    
    skipTyping() {
        if (this.typingTimer) {
            this.typingTimer.remove();
        }
    
        for (let i = 0; i < this.textObjects.length; i++) {
            const currentLine = this.storyText.split('\n')[i];
            this.textObjects[i].setText(currentLine);
        }
    
        this.input.keyboard.off('keydown', this.skipTyping, this);
    }
    
    
    update() {
        if (!this.typingTimer || !this.typingTimer.active) { // If typing is finished
            if(this.input.activePointer.isDown) { // Or any other condition
                this.scene.start(this.nextSceneKey);
            }
        }
    }
}