// level2.js - Red Riding Hood Level 2: The Chase
import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Character from './essentials/Character.js';

class PathBarrier {
    constructor(x, y, w, h, gameEnv) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.ctx = gameEnv.ctx;
    }

    draw(debug = false) {
        if (debug) {
            this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; 
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Wolf extends Character {
  constructor(data, gameEnv) {
    super(data, gameEnv);
    this.velocity = { x: 0, y: 0 };
    this.speed = data.SPEED || 2;
    this.waypoints = null;
    this.waypointIndex = 0;
  }

  buildWaypoints() {
    const W = this.gameEnv.innerWidth;
    const H = this.gameEnv.innerHeight;
    return [
      { x: W * 0.09, y: H * 0.80 },
      { x: W * 0.14, y: H * 0.72 },
      { x: W * 0.20, y: H * 0.68 },
      { x: W * 0.26, y: H * 0.67 },
      { x: W * 0.32, y: H * 0.41 },
      { x: W * 0.37, y: H * 0.28 },
      { x: W * 0.44, y: H * 0.23 },
      { x: W * 0.50, y: H * 0.22 },
      { x: W * 0.56, y: H * 0.28 },
      { x: W * 0.58, y: H * 0.40 },
      { x: W * 0.57, y: H * 0.53 },
      { x: W * 0.58, y: H * 0.72 },
      { x: W * 0.63, y: H * 0.81 },
      { x: W * 0.68, y: H * 0.82 },
      { x: W * 0.72, y: H * 0.82 },
      { x: W * 0.76, y: H * 0.44 },
      { x: W * 0.80, y: H * 0.30 },
      { x: W * 0.85, y: H * 0.20 },
      { x: W * 0.90, y: H * 0.13 },
    ];
  }

  update() {
    if (!this.waypoints) {
      this.waypoints = this.buildWaypoints();
      this.position.x = this.waypoints[0].x;
      this.position.y = this.waypoints[0].y;
      this.waypointIndex = 1;
    }

    if (this.waypointIndex >= this.waypoints.length) {
      this.waypointIndex = 0;
      this.position.x = this.waypoints[0].x;
      this.position.y = this.waypoints[0].y;
      this.waypointIndex = 1;
    }

    const target = this.waypoints[this.waypointIndex];
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.speed + 1) {
      this.position.x = target.x;
      this.position.y = target.y;
      this.waypointIndex++;
    } else {
      this.velocity.x = (dx / dist) * this.speed;
      this.velocity.y = (dy / dist) * this.speed;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }

    this.draw();
  }
}

class GameLevelPirateMegaGame2 {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

    this.continue = true;
    this.debugMode = false;
    this.wonGame = false;

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
    this.titleElement.innerHTML = "LEVEL 2: THE CHASE";
    document.body.appendChild(this.titleElement);

    this.cottageZone = {
      x: width * 0.82,
      y: 0,
      width: width * 0.15,
      height: height * 0.25
    };

    this.winPopup = document.createElement('div');
    this.winPopup.style.display = 'none';
    this.winPopup.style.position = 'absolute';
    this.winPopup.style.top = '50%';
    this.winPopup.style.left = '50%';
    this.winPopup.style.transform = 'translate(-50%, -50%)';
    this.winPopup.style.background = 'linear-gradient(135deg, #2d0a0a, #6b1a1a)';
    this.winPopup.style.border = '4px solid #ff4444';
    this.winPopup.style.borderRadius = '20px';
    this.winPopup.style.padding = '40px 50px';
    this.winPopup.style.textAlign = 'center';
    this.winPopup.style.zIndex = '99999';
    this.winPopup.style.boxShadow = '0 0 40px rgba(255,0,0,0.6), 0 0 80px rgba(255,0,0,0.3)';
    this.winPopup.style.maxWidth = '500px';
    this.winPopup.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 10px;">🐺😶</div>
      <div style="color: #ff6666; font-size: 32px; font-weight: 900; font-family: 'Courier New', monospace; text-shadow: 0 0 10px #ff0000; margin-bottom: 15px;">
        CHAPTER CLOSED.
      </div>
      <div style="color: #ffcccc; font-size: 17px; font-family: 'Courier New', monospace; line-height: 1.8; margin-bottom: 25px;">
        Red Riding Hood ran away.<br>
        The wolf tried.<br>
        <span style="color:#ff4444;">Red knew the fairytale better.</span>
      </div>
      <button id="winContinueBtn" style="
        background: #ff2222;
        color: white;
        border: none;
        padding: 12px 30px;
        font-size: 18px;
        font-weight: 900;
        font-family: 'Courier New', monospace;
        border-radius: 10px;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 2px;
        box-shadow: 0 0 15px rgba(255,0,0,0.5);
      ">Close ✕</button>
    `;
    document.body.appendChild(this.winPopup);

    this.redStartPosition = { x: 50, y: height * 0.75 };

    this.barriers = [
      new PathBarrier(0, 0, width * 0.28, height * 0.70, gameEnv),
      new PathBarrier(width * 0.38, height * 0.27, width * 0.22, height * 0.37, gameEnv),
      new PathBarrier(width * 0.64, 0, width * 0.33, height * 0.22, gameEnv),
      new PathBarrier(width * 0.75, height * 0.55, width * 0.22, height * 0.37, gameEnv),
    ];

    const image_data_chase = {
      name: 'chase',
      src: path + "/images/gamebuilder/bg/PirateMap.jpg",
      pixels: { height: 580, width: 1038 }
    };

    const sprite_data_red = {
      id: 'Red Riding Hood',
      src: path + "/images/gamebuilder/sprites/mcarchie.png",
      SCALE_FACTOR: 5, STEP_FACTOR: 1000, ANIMATION_RATE: 50,
      INIT_POSITION: { x: 50, y: height * 0.75 },
      pixels: { height: 192, width: 144 },
      orientation: { rows: 4, columns: 3 },
      down: { row: 0, start: 0, columns: 3 },
      left: { row: 1, start: 0, columns: 3 },
      right: { row: 2, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    const sprite_data_wolf = {
      id: 'Wolf',
      src: path + "/images/gamebuilder/sprites/Pirate.png",
      SCALE_FACTOR: 3.5,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 8,
      INIT_POSITION: { x: width * 0.09, y: height * 0.82 },
      pixels: { height: 395, width: 632 },
      orientation: { rows: 1, columns: 1 },
      direction: 'right',
      SPEED: 2,
      zIndex: 20
    };

    this.classes = [
      { class: GameEnvBackground, data: image_data_chase },
      { class: Player, data: sprite_data_red },
      { class: Wolf, data: sprite_data_wolf }
    ];
  }

  showWinPopup() {
    this.winPopup.style.display = 'block';
    const btn = document.getElementById('winContinueBtn');
    if (btn) {
      btn.onclick = () => {
        this.winPopup.style.display = 'none';
      };
    }
  }

  checkInZone(player, zone) {
    if (!player?.position) return false;
    return (
      player.position.x + player.width > zone.x &&
      player.position.x < zone.x + zone.width &&
      player.position.y + player.height > zone.y &&
      player.position.y < zone.y + zone.height
    );
  }

  checkCollision(rect1, rect2) {
    if (!rect1 || !rect1.position) return false;
    return (
      rect1.position.x < rect2.x + rect2.width &&
      rect1.position.x + (rect1.width / 2) > rect2.x &&
      rect1.position.y < rect2.y + rect2.height &&
      rect1.position.y + (rect1.height / 2) > rect2.y
    );
  }

  checkPlayerWolfCollision(player, wolf) {
    if (!player?.position || !wolf?.position) return false;
    return (
      player.position.x < wolf.position.x + wolf.width &&
      player.position.x + player.width > wolf.position.x &&
      player.position.y < wolf.position.y + wolf.height &&
      player.position.y + player.height > wolf.position.y
    );
  }

  update() {
    if (!this.gameEnv || !this.gameEnv.gameObjects) return;

    let player = null;
    let wolf = null;

    this.gameEnv.gameObjects.forEach(obj => {
      if (obj instanceof Player) player = obj;
      if (obj instanceof Wolf) wolf = obj;
    });

    if (player && !this.wonGame && this.checkInZone(player, this.cottageZone)) {
      this.wonGame = true;
      this.showWinPopup();
    }

    if (player && wolf && this.checkPlayerWolfCollision(player, wolf)) {
      player.position.x = this.redStartPosition.x;
      player.position.y = this.redStartPosition.y;
      player.velocity.x = 0;
      player.velocity.y = 0;
    }

    this.barriers.forEach(barrier => {
      this.gameEnv.gameObjects.forEach(obj => {
        if (obj instanceof Player && this.checkCollision(obj, barrier)) {
          obj.position.x -= obj.velocity.x;
          obj.position.y -= obj.velocity.y;
        }
      });
    });
  }

  draw() {
    this.barriers.forEach(barrier => barrier.draw(this.debugMode));
  }

  resize() {}

  destroy() {
    if (this.titleElement && this.titleElement.parentNode) this.titleElement.remove();
    if (this.winPopup && this.winPopup.parentNode) this.winPopup.remove();
  }
}

export default GameLevelPirateMegaGame2;