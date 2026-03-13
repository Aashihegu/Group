import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';

class GameLevelPirateHunt {
    constructor(gameEnv) {

        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/ship.jpg",
            pixels: { height: 700, width: 1280 }
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
            downRight: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
            downLeft: { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
            right: { row: 2, start: 0, columns: 4 },
            left: { row: 1, start: 0, columns: 4 },
            up: { row: 3, start: 0, columns: 4 },
            upRight: { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
            upLeft: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },

            hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        /* ---------------- NPC 1 ---------------- */

        const npcData1 = {
            id: 'Captain Hook',
            greeting: 'Shiver me timbers! How did ye make it onto me ship??',
            src: path + "/images/gamebuilder/sprites/Hook.png",

            SCALE_FACTOR: 4,
            ANIMATION_RATE: 1000000008,
            INIT_POSITION: { x: 900, y: 420 },

            pixels: { height: 200, width: 405 },
            orientation: { rows: 1, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },

            hitbox: { widthPercentage: 0.4, heightPercentage: 0.6 },

            dialogues: [
                "Shiver me timbers! Ye shouldn't be here!",
                "This ship be cursed with treasure..."
            ]
        };

        /* ---------------- NPC 2 ---------------- */

        const npcData2 = {
            id: 'First Mate',
            greeting: 'Ahoy sailor!',
            src: path + "/images/gamebuilder/sprites/pirate.png",

            SCALE_FACTOR: 4,
            ANIMATION_RATE: 1000000008,
            INIT_POSITION: { x: 600, y: 450 },

            pixels: { height: 256, width: 256 },
            orientation: { rows: 1, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },

            hitbox: { widthPercentage: 0.4, heightPercentage: 0.6 },

            dialogues: [
                "The captain guards the treasure closely.",
                "Be careful wandering this ship..."
            ]
        };

        /* ---------------- NPC 3 ---------------- */

        const npcData3 = {
            id: 'Navigator',
            greeting: 'Lost at sea?',
            src: path + "/images/gamebuilder/sprites/pirate.png",

            SCALE_FACTOR: 4,
            ANIMATION_RATE: 1000000008,
            INIT_POSITION: { x: 350, y: 420 },

            pixels: { height: 256, width: 256 },
            orientation: { rows: 1, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },

            hitbox: { widthPercentage: 0.4, heightPercentage: 0.6 },

            dialogues: [
                "I chart the seas...",
                "But this place isn't on any map."
            ]
        };

        /* ---------------- NPC 4 ---------------- */

        const npcData4 = {
            id: 'Deckhand',
            greeting: 'Working hard!',
            src: path + "/images/gamebuilder/sprites/pirate.png",

            SCALE_FACTOR: 4,
            ANIMATION_RATE: 1000000008,
            INIT_POSITION: { x: 750, y: 500 },

            pixels: { height: 256, width: 256 },
            orientation: { rows: 1, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },

            hitbox: { widthPercentage: 0.4, heightPercentage: 0.6 },

            dialogues: [
                "I scrub the decks all day.",
                "Treasure rumors keep the crew here..."
            ]
        };

        /* -------- LEVEL OBJECTS -------- */

        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player, data: playerData },

            { class: Npc, data: npcData1 },
            { class: Npc, data: npcData2 },
            { class: Npc, data: npcData3 },
            { class: Npc, data: npcData4 }
        ];
    }
}

export default GameLevelPirateHunt;
