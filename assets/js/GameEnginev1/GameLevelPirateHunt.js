// Adventure Game Custom Level
// Exported from GameBuilder on 2026-03-06T22:32:25.129Z
// How to use this file:
// 1) Save as assets/js/adventureGame/GameLevelSlimeyandspacey.js in your repo.
// 2) Reference it in your runner or level selector. Examples:
//    import GameLevelPlanets from '/assets/js/GameEnginev1/GameLevelPlanets.js';
//    import GameLevelSlimeyandspacey from '/assets/js/adventureGame/GameLevelSlimeyandspacey.js';
//    export const gameLevelClasses = [GameLevelPlanets, GameLevelSlimeyandspacey];
//    // or pass it directly to your GameControl as the only level.
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.
// 4) You can add more objects to this.classes inside the constructor.

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelPirateHunt {
    constructor(gameEnv) {
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/GameBackgroundCoolio.jpg",
            pixels: { height: 700, width: 1280 }
        };

        const playerData = {
            id: 'McArchie',
            src: path + "/images/gamebuilder/sprites/mcarchie.png",
            SCALE_FACTOR: 8,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 30,
            INIT_POSITION: { x: 150, y: 400 },
            pixels: { height: 256, width: 256 },
            orientation: { rows: 4, columns: 4 },
            down: { row: 0, start: 0, columns: 4 },
            downRight: { row: Math.min(2, 4 - 1), start: 0, columns: 3, rotate: Math.PI/16 },
            downLeft: { row: Math.min(1, 4 - 1), start: 0, columns: 3, rotate: -Math.PI/16 },
            right: { row: Math.min(2, 4 - 1), start: 0, columns: 4 },
            left: { row: Math.min(1, 4 - 1), start: 0, columns: 4 },
            up: { row: Math.min(3, 4 - 1), start: 0, columns: 4 },
            upRight: { row: Math.min(2, 4 - 1), start: 0, columns: 3, rotate: -Math.PI/16 },
            upLeft: { row: Math.min(1, 4 - 1), start: 0, columns: 3, rotate: Math.PI/16 },
            hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        
     const npcData1 = {
            id: 'Captain Blackbread',
            greeting: 'Hoy matey, my name is Captain Blackbeard. I am the most feared pirate on the seven seas. I have a treasure map that leads to a hidden island, but I need someone to help me find it. Are you up for the adventure?',
            src: path + "/images/gamebuilder/sprites/Pirate.png",
            SCALE_FACTOR: 5,
            ANIMATION_RATE: 1000000008,
            INIT_POSITION: { x: 857, y: 400 },
            pixels: { height: 120, width: 335 },
            orientation: { rows: 1, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },
            hitbox: { widthPercentage: 0.1, heightPercentage: 0.01 },
            dialogues: ['Hey there, Im Blackbread. You seem like a fellow human. I havent seen a human in forever, that horrid barrier forbids it! What do you say, how about we get out of here!'],
            reaction: function() { if (this.dialogueSystem) { this.showReactionDialogue(); } else { console.log(this.greeting); } },
            interact: function() { if (this.dialogueSystem) { this.showRandomDialogue(); } }
     
     };

      const dbarrier_1 = {
            id: 'dbarrier_1', x: 50, y: 76, width: 5, height: 510, visible: true /* BUILDER_DEFAULT */,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

this.classes = [      { class: GameEnvBackground, data: bgData },
      { class: Player, data: playerData },
      { class: Npc, data: npcData1 },
      { class: Barrier, data: dbarrier_1 }
];


        
    }
}

export default GameLevelPirateHunt;