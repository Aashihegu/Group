import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelSkyMaze {
    constructor(gameEnv) {

        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/Deck.jpg",
            pixels: { height: 720, width: 1280 }
        };

        const playerData = {
            id: 'lost sailor',
            src: path + "/images/gamebuilder/sprites/mcarchie.png",
            SCALE_FACTOR: 8,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 30,
            INIT_POSITION: { x: 150, y: 470 },
            pixels: { height: 256, width: 256 },
            orientation: { rows: 4, columns: 4 },

            down: { row: 0, start: 0, columns: 4 },
            downRight: { row: Math.min(2, 4 - 1), start: 0, columns: 3, rotate: Math.PI / 16 },
            downLeft: { row: Math.min(1, 4 - 1), start: 0, columns: 3, rotate: -Math.PI / 16 },
            right: { row: Math.min(2, 4 - 1), start: 0, columns: 4 },
            left: { row: Math.min(1, 4 - 1), start: 0, columns: 4 },
            up: { row: Math.min(3, 4 - 1), start: 0, columns: 4 },
            upRight: { row: Math.min(2, 4 - 1), start: 0, columns: 3, rotate: -Math.PI / 16 },
            upLeft: { row: Math.min(1, 4 - 1), start: 0, columns: 3, rotate: Math.PI / 16 },

            hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        const npcData1 = {
            id: 'Captain Hook',
            greeting: 'Shiver me timbers! How did ye make it onto me ship??',
            src: path + "/images/gamebuilder/sprites/Hook.png",
            SCALE_FACTOR: 4,
            ANIMATION_RATE: 1000000008,
            INIT_POSITION: { x: 857, y: 400 },

            pixels: { height: 200, width: 405 },
            orientation: { rows: 1, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },

            hitbox: { widthPercentage: 0.4, heightPercentage: 0.6 },

            dialogues: [
                'rUN bEFORE I '
            ],

            reaction: function () {
                if (this.dialogueSystem) {
                    this.showReactionDialogue();
                } else {
                    console.log(this.greeting);
                }
            },

            interact: function () {
                if (this.dialogueSystem) {
                    this.showRandomDialogue();
                }
            }
        };

        const dbarrier_1 = {
            id: 'dbarrier_1', x: 329, y: 100, width: 127, height: 270, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_2 = {
            id: 'dbarrier_2', x: 129, y: 4, width: 98, height: 249, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };
this.classes = [      
      { class: GameEnvBackground, data: bgData },
      { class: Player, data: playerData },
      { class: Npc, data: npcData1 },
      { class: Barrier, data: dbarrier_1 },
      { class: Barrier, data: dbarrier_2 }
];

        
    }
}

export default GameLevelSkyMaze;