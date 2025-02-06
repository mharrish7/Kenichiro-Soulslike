// @ts-nocheck
import Phaser from 'phaser'

import Scene1 from './Scene1'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 1080,
	height: 768,
	backgroundColor: '#EBD3F8',
	dom: {
        createContainer: true
    },
    scale:{
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 1500 },
			debug: true,
		},
	},
	scene: [Scene1],
}

export default new Phaser.Game(config)
