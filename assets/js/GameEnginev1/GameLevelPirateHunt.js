import gameEnv from './gameEnv';

class GameLevelPirateHunt {
    constructor() {
        const path = gameEnv.path;
        this.backgroundImage = `${path}/images/background.png`;
        this.npcSprites = {
            gold: `${path}/images/gold.png`,
            chest: `${path}/images/chest.png`,
            map: `${path}/images/map.png`,
            ruby: `${path}/images/ruby.png`
        };
    }
    // Additional class methods and properties go here
}

export default GameLevelPirateHunt;