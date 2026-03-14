// level1.js - Red Riding Hood Level 1
import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import FloorItem from './FloorItem.js';

class GameLevelPirateMegaGame1 {
  constructor(gameEnv, game) {
    this.gameEnv = gameEnv;
    this.gameControl = game;
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

    this.continue = true;
    this.score = 0;

    // --- HTML TITLE OVERLAY ---
    this.titleElement = document.createElement('div');
    this.titleElement.style.position = 'absolute';
    this.titleElement.style.top = '60px'; 
    this.titleElement.style.width = '100%';
    this.titleElement.style.textAlign = 'center';
    this.titleElement.style.color = 'red'; 
    this.titleElement.style.fontSize = '40px';
    this.titleElement.style.fontWeight = '900';
    this.titleElement.style.fontFamily = '"Courier New", Courier, monospace';
    this.titleElement.style.textShadow = '2px 2px 4px black, 0 0 10px #ff0000';
    this.titleElement.style.zIndex = '9999';
    this.titleElement.innerHTML = "The Revelation of Little Red Riding Hood";
    document.body.appendChild(this.titleElement);

    // --- HTML SCORE OVERLAY ---
    this.scoreElement = document.createElement('div');
    this.scoreElement.style.position = 'absolute';
    this.scoreElement.style.bottom = '20px';
    this.scoreElement.style.left = '20px';
    this.scoreElement.style.color = 'red';
    this.scoreElement.style.fontSize = '28px';
    this.scoreElement.style.fontWeight = 'bold';
    this.scoreElement.style.fontFamily = '"Courier New", Courier, monospace';
    this.scoreElement.style.textShadow = '1px 1px 2px black, 0 0 5px #ff0000';
    this.scoreElement.style.zIndex = '9999'; 
    this.scoreElement.innerHTML = "Cookies Collected: 0";
    document.body.appendChild(this.scoreElement);

    // --- CONGRATS OVERLAY ---
    this.successElement = document.createElement('div');
    this.successElement.style.position = 'fixed';
    this.successElement.style.top = '50%';
    this.successElement.style.left = '50%';
    this.successElement.style.transform = 'translate(-50%, -50%)';
    this.successElement.style.backgroundColor = 'rgba(0, 0, 0, 0.92)';
    this.successElement.style.padding = '50px';
    this.successElement.style.border = '4px solid red';
    this.successElement.style.borderRadius = '15px';
    this.successElement.style.textAlign = 'center';
    this.successElement.style.display = 'none';
    this.successElement.style.zIndex = '999999';
    this.successElement.style.pointerEvents = 'auto';
    this.successElement.innerHTML = `
        <h1 style="color: red; font-size: 60px; text-shadow: 3px 3px black; font-family: 'Courier New', monospace; margin-bottom: 20px;">CONGRATS!</h1>
        <p style="color: white; font-size: 26px; font-family: 'Courier New', monospace; margin-bottom: 30px;">You collected all 5 cookies!</p>
        <button id="nextLevelBtn" style="padding: 20px 40px; font-size: 24px; cursor: pointer; background: red; color: white; border: 3px solid white; font-weight: bold; border-radius: 8px; font-family: 'Courier New', monospace; pointer-events: auto; position: relative; z-index: 999999;">
            MOVE TO LEVEL 2 →
        </button>
    `;
    document.body.appendChild(this.successElement);

    // --- BUTTON LOGIC ---
    const self = this;
    this.successElement.querySelector('#nextLevelBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        console.log("BUTTON CLICKED");

        // Walk up the chain to find the real GameControl
        const engine = self.gameEnv.gameControl || self.gameEnv.game?.gameControl || self.gameControl;
        console.log("engine:", engine);

        if (engine && typeof engine.transitionToLevel === 'function') {
            engine.currentLevelIndex = 1;
            engine.handleLevelEnd = function() {};
            engine.transitionToLevel();
        } else {
            console.error("ENGINE NOT FOUND or transitionToLevel missing. engine =", engine);
        }
    });

    // --- BACKGROUND AND PLAYER ---
    const image_data_wood = { name: 'woods', src: path + "/images/gamify/ridinghood/woods.png", pixels: { height: 580, width: 1038 } };
    const sprite_data_red = {
      id: 'Red Riding Hood',
      src: path + "/images/gamify/ridinghood/red.png",
      SCALE_FACTOR: 5, STEP_FACTOR: 1000, ANIMATION_RATE: 50,
      INIT_POSITION: { x: 0, y: height - (height / 5) },
      pixels: { height: 192, width: 144 },
      orientation: { rows: 4, columns: 3 },
      down: { row: 0, start: 0, columns: 3 },
      left: { row: 1, start: 0, columns: 3 },
      right: { row: 2, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    const list = [
      { class: GameEnvBackground, data: image_data_wood },
      { class: Player, data: sprite_data_red }
    ];

    this.classes = list;
    this.objects = list;
    this.gameObjectClasses = list;
    this.levels = list;

    this.background = new GameEnvBackground(image_data_wood, gameEnv);
    this.player = new Player(sprite_data_red, gameEnv);

    this.cookies = [];
    const cookieItem = { name: 'Cookie', image: path + '/images/gamify/ridinghood/cookie.png' };
    this.cookies.push(new FloorItem(width * 0.1, height * 0.8, cookieItem));
    this.cookies.push(new FloorItem(width * 0.3, height * 0.75, cookieItem));
    this.cookies.push(new FloorItem(width * 0.5, height * 0.8, cookieItem));
    this.cookies.push(new FloorItem(width * 0.7, height * 0.75, cookieItem));
    this.cookies.push(new FloorItem(width * 0.9, height * 0.8, cookieItem));
  }

  update() {
    if (this.player) this.player.update();
    for (let i = this.cookies.length - 1; i >= 0; i--) {
      if (this.checkCollision(this.player, this.cookies[i])) {
        this.cookies[i].element.remove();
        this.cookies.splice(i, 1);
        this.score++;
        if (this.scoreElement) {
          this.scoreElement.innerHTML = "Cookies Collected: " + this.score;
        }
        if (this.score === 5) {
          this.successElement.style.display = 'block';
        }
      }
    }
  }

  checkCollision(player, cookie) {
    if (!player || !cookie) return false;
    return !( (player.position.x + player.width) < cookie.x || 
               player.position.x > (cookie.x + 50) || 
              (player.position.y + player.height) < cookie.y || 
               player.position.y > (cookie.y + 50));
  }

  draw() {
    if (this.background) this.background.draw();
    if (this.player) this.player.draw();
  }

  resize() {
    if (this.background) this.background.resize();
    if (this.player) this.player.resize();
  }

  destroy() {
    if (this.background) this.background.destroy();
    if (this.player) this.player.destroy();
    this.cookies.forEach(c => { if(c.element) c.element.remove(); });
    if (this.titleElement && this.titleElement.parentNode) this.titleElement.remove();
    if (this.scoreElement && this.scoreElement.parentNode) this.scoreElement.remove();
    if (this.successElement && this.successElement.parentNode) this.successElement.remove();
  }
}

export default GameLevelPirateMegaGame1;