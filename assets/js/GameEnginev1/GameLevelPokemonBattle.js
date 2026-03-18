import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';

class GameLevelPokemonBattle {
    constructor(gameEnv) {
        const path = gameEnv.path;
        this.gameEnv  = gameEnv;
        this.continue = true;

        // Pokemon stuff like stats etc.
        this.PLAYER_MON = {
            name: 'CHARMANDER', nickname: 'Fred', gender: '♀', level: 9,
            hp: 26, maxHp: 26, exp: 18, maxExp: 40,
            moves: [
                { name: 'Scratch',    pp: 35, maxPp: 35, dmgMin: 8,  dmgMax: 14, type: 'NORMAL' },
                { name: 'Ember',      pp: 25, maxPp: 25, dmgMin: 14, dmgMax: 22, type: 'FIRE'   },
                { name: 'Growl',      pp: 40, maxPp: 40, dmgMin: 0,  dmgMax: 0,  type: 'NORMAL' },
                { name: 'Metal Claw', pp: 15, maxPp: 15, dmgMin: 10, dmgMax: 18, type: 'STEEL'  },
            ]
        };
// Enemy some pokemon bird
        this.ENEMY_MON = {
            name: 'PIDGEY', gender: '♂', level: 9,
            hp: 23, maxHp: 23,
            moves: [
                { name: 'Tackle',      dmgMin: 6, dmgMax: 10 },
                { name: 'Sand Attack', dmgMin: 0, dmgMax: 0  },
                { name: 'Gust',        dmgMin: 8, dmgMax: 14 },
            ]
        };

        // Battle starting for the game loop
        this.state        = 'INTRO';
        this.frameCount   = 0;
        this.menuIndex    = 0;
        this.fightIndex   = 0;
        this.playerHp     = this.PLAYER_MON.hp;
        this.playerMaxHp  = this.PLAYER_MON.maxHp;
        this.enemyHp      = this.ENEMY_MON.hp;
        this.enemyMaxHp   = this.ENEMY_MON.hp;
        this.playerExp    = this.PLAYER_MON.exp;
        this.playerMaxExp = this.PLAYER_MON.maxExp;
        this.itemUsed     = false;
        this.messageQueue = [];
        this.currentMsg   = '';
        this.msgTimer     = 0;
        this._msgCallback = null;
        this.enemyFlash   = 0;
        this.playerFlash  = 0;
        this.shakeEnemy   = 0;
        this.shakePlayer  = 0;

        //Canvas stuff for UI
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'pk-battle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            left: 0;
            width: 100%;
            z-index: 99999;
            pointer-events: none;
            image-rendering: pixelated;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // loading 2p button stuff
        if (!document.getElementById('pk-font-link')) {
            const link = document.createElement('link');
            link.id   = 'pk-font-link';
            link.rel  = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
            document.head.appendChild(link);
        }

        // hide the canvas
        this._hideEngine = () => {
            const gc = document.getElementById('gameContainer');
            const c  = gc ? gc.querySelector('canvas') : document.querySelector('canvas:not(#pk-battle-canvas)');
            if (c) { c.style.opacity = '0'; c.style.pointerEvents = 'none'; }
            else   { setTimeout(this._hideEngine, 150); }
        };
        setTimeout(this._hideEngine, 300);

        // Key chacker prety simply u should know what this is by now
        this.keys = {};
        this._keyDown = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.key))
                e.preventDefault();
            this.keys[e.code] = true;
            this._handleMenuKey(e.code);
        };
        this._keyUp = (e) => { this.keys[e.code] = false; };
        window.addEventListener('keydown', this._keyDown);
        window.addEventListener('keyup',   this._keyUp);

        // Starting messages
        this._queueMessages(
            ['Wild PIDGEY appeared!', 'Go! Fred!'],
            () => { this.state = 'MENU'; }
        );

        // More ui things
        const bgData = {
            name: 'battle_bg',
            src: path + '/images/gamebuilder/bg/Ship.jpg',
            pixels: { height: 600, width: 800 }
        };

        const playerData = {
            id: 'fred',
            src: path + '/images/gamebuilder/sprites/mcarchie.png',
            SCALE_FACTOR: 9999,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 30,
            INIT_POSITION: { x: -9999, y: -9999 },
            pixels: { height: 256, width: 256 },
            orientation: { rows: 4, columns: 4 },
            down:  { row: 0, start: 0, columns: 4 },
            right: { row: 2, start: 0, columns: 4 },
            left:  { row: 1, start: 0, columns: 4 },
            up:    { row: 3, start: 0, columns: 4 },
            hitbox: { widthPercentage: 0.01, heightPercentage: 0.01 },
            keypress: { up: 0, left: 0, down: 0, right: 0 }
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData    },
            { class: Player,            data: playerData }
        ];
    }

    // messeging thing to talk to enemy.
    _queueMessages(msgs, cb) {
        this.messageQueue = [...msgs];
        this._msgCallback = cb || null;
        this._nextMessage();
    }

    _nextMessage() {
        if (!this.messageQueue.length) {
            if (this._msgCallback) { this._msgCallback(); this._msgCallback = null; }
            return;
        }
        this.currentMsg = this.messageQueue.shift();
        this.msgTimer   = 0;
        this.state      = 'MESSAGE';
    }

    // Handles key inputs self explainable.
    _handleMenuKey(code) {
        if (this.state === 'MESSAGE') {
            if (code === 'KeyZ' || code === 'Enter' || code === 'Space') this._nextMessage();
            return;
        }
        if (this.state === 'MENU') {
            if (code === 'ArrowLeft' || code === 'ArrowRight')
                this.menuIndex = this.menuIndex % 2 === 0 ? this.menuIndex + 1 : this.menuIndex - 1;
            if (code === 'ArrowUp' || code === 'ArrowDown')
                this.menuIndex = this.menuIndex < 2 ? this.menuIndex + 2 : this.menuIndex - 2;
            if (code === 'KeyZ' || code === 'Enter') this._selectMenu();
        }
        if (this.state === 'FIGHT_MENU') {
            if (code === 'ArrowLeft' || code === 'ArrowRight')
                this.fightIndex = this.fightIndex % 2 === 0 ? this.fightIndex + 1 : this.fightIndex - 1;
            if (code === 'ArrowUp' || code === 'ArrowDown')
                this.fightIndex = this.fightIndex < 2 ? this.fightIndex + 2 : this.fightIndex - 2;
            if (code === 'KeyZ' || code === 'Enter') this._selectMove();
            if (code === 'KeyX' || code === 'Escape') this.state = 'MENU';
        }
        if ((this.state === 'WIN' || this.state === 'LOSE') && code === 'KeyZ') {
            this._resetBattle();
        }
    }
// Like my other game but better trust.
    _selectMenu() {
        const choice = ['FIGHT', 'BAG', 'POKEMON', 'RUN'][this.menuIndex];
        if (choice === 'FIGHT') {
            this.fightIndex = 0;
            this.state = 'FIGHT_MENU';
        } else if (choice === 'BAG') {
            if (!this.itemUsed) {
                this.itemUsed = true;
                this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 15);
                this._queueMessages(
                    ['Fred used Potion!', "Fred's HP was restored!"],
                    () => this._enemyTurn()
                );
            } else {
                this._queueMessages(['Nothing more to use!'], () => { this.state = 'MENU'; });
            }
        } else if (choice === 'POKEMON') {
            this._queueMessages(["There's no other Pokemon!"], () => { this.state = 'MENU'; });
        } else {
            this._queueMessages(["Can't escape from wild Pokemon!"], () => { this.state = 'MENU'; });
        }
    }
//Handles selection of moves and stuff.
    _selectMove() {
        const mv = this.PLAYER_MON.moves[this.fightIndex];
        if (mv.pp <= 0) {
            this._queueMessages(['No PP left for that move!'], () => { this.state = 'FIGHT_MENU'; });
            return;
        }
        mv.pp--;
        const dmg = mv.dmgMin + Math.floor(Math.random() * (mv.dmgMax - mv.dmgMin + 1));
        this.enemyHp    = Math.max(0, this.enemyHp - dmg);
        this.enemyFlash = 20;
        this.shakeEnemy = 14;
        this.playerExp  = Math.min(this.playerMaxExp, this.playerExp + Math.floor(dmg / 2 + 1));

        const eff = dmg >= 18 ? "\nIt's super effective!" : dmg <= 5 ? "\nNot very effective..." : '';

        if (this.enemyHp <= 0) {
            this._queueMessages(
                [`Fred used ${mv.name}!`, 'Wild PIDGEY fainted!', 'Fred gained EXP. Points!'],
                () => { this.state = 'WIN'; }
            );
        } else {
            this._queueMessages(
                [`Fred used ${mv.name}!${eff}`, `PIDGEY took ${dmg} damage!`],
                () => this._enemyTurn()
            );
        }
    }

    _enemyTurn() {
        const em  = this.ENEMY_MON.moves[Math.floor(Math.random() * this.ENEMY_MON.moves.length)];
        const dmg = em.dmgMin + Math.floor(Math.random() * (em.dmgMax - em.dmgMin + 1));
        this.playerHp    = Math.max(0, this.playerHp - dmg);
        this.playerFlash = 20;
        this.shakePlayer = 14;

        if (this.playerHp <= 0) {
            this._queueMessages(
                [`Wild PIDGEY used ${em.name}!`, 'Fred fainted!'],
                () => { this.state = 'LOSE'; }
            );
        } else {
            const effMsg = dmg === 0 ? "\nPIDGEY's accuracy fell!" : '';
            this._queueMessages(
                [`Wild PIDGEY used ${em.name}!${effMsg}`],
                () => { this.state = 'MENU'; }
            );
        }
    }

    _resetBattle() {
        this.playerHp     = this.PLAYER_MON.hp;
        this.enemyHp      = this.ENEMY_MON.maxHp;
        this.playerExp    = this.PLAYER_MON.exp;
        this.menuIndex    = 0;
        this.fightIndex   = 0;
        this.itemUsed     = false;
        this.enemyFlash   = 0;
        this.playerFlash  = 0;
        this.messageQueue = [];
        this.currentMsg   = '';
        this.msgTimer     = 0;
        this.PLAYER_MON.moves.forEach(m => m.pp = m.maxPp);
        this._queueMessages(['Wild PIDGEY appeared!', 'Go! Fred!'], () => { this.state = 'MENU'; });
    }

    
    _rr(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, w, h, r);
        this.ctx.closePath();
    }

    _hpBar(x, y, w, h, pct) {
        const ctx = this.ctx;
        ctx.fillStyle = '#101010'; ctx.fillRect(x-1, y-1, w+2, h+2);
        ctx.fillStyle = '#606060'; ctx.fillRect(x, y, w, h);
        const col = pct > 0.5 ? '#30c030' : pct > 0.2 ? '#f0c000' : '#d02000';
        ctx.fillStyle = col;
        ctx.fillRect(x, y, Math.max(0, w * pct), h);
    }

    _infoBox(x, y, w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this._rr(x+3, y+3, w, h, 8); ctx.fill();
        ctx.fillStyle = '#f0f0e0';
        this._rr(x, y, w, h, 8); ctx.fill();
        ctx.strokeStyle = '#202018'; ctx.lineWidth = 2;
        this._rr(x, y, w, h, 8); ctx.stroke();
    }

    _label(text, x, y, size, color, align) {
        this.ctx.fillStyle = color || '#1a1a10';
        this.ctx.font      = `${size}px 'Press Start 2P', monospace`;
        this.ctx.textAlign = align || 'left';
        this.ctx.fillText(text, x, y);
    }

    // ── sprite: Charmander (player, bottom-left) ──────────────────────────
    _drawCharmander(cx, cy, size) {
        const ctx = this.ctx;
        const s   = size / 40;
        ctx.save();
        if (this.playerFlash > 0 && Math.floor(this.frameCount / 4) % 2 === 0)
            ctx.filter = 'brightness(10)';

        // tail flame
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.ellipse(cx+16*s, cy+22*s, 5*s, 8*s, 0.4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff6600';
        ctx.beginPath(); ctx.ellipse(cx+17*s, cy+19*s, 3*s, 5*s, 0.3, 0, Math.PI*2); ctx.fill();

        // tail
        ctx.fillStyle = '#f08030';
        ctx.beginPath();
        ctx.moveTo(cx+8*s, cy+30*s);
        ctx.quadraticCurveTo(cx+20*s, cy+28*s, cx+18*s, cy+22*s);
        ctx.quadraticCurveTo(cx+14*s, cy+28*s, cx+8*s,  cy+30*s);
        ctx.fill();

        // body
        ctx.fillStyle = '#f08030';
        ctx.beginPath(); ctx.ellipse(cx, cy+18*s, 12*s, 14*s, 0, 0, Math.PI*2); ctx.fill();

        // belly
        ctx.fillStyle = '#ffd090';
        ctx.beginPath(); ctx.ellipse(cx+2*s, cy+20*s, 7*s, 9*s, 0.1, 0, Math.PI*2); ctx.fill();

        // head
        ctx.fillStyle = '#f08030';
        ctx.beginPath(); ctx.arc(cx, cy+3*s, 14*s, 0, Math.PI*2); ctx.fill();

        // eyes
        ctx.fillStyle = '#1a0a00';
        ctx.beginPath(); ctx.arc(cx-5*s, cy+1*s, 2.5*s, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+5*s, cy+1*s, 2.5*s, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx-4*s, cy+0.5*s, 1*s, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+6*s, cy+0.5*s, 1*s, 0, Math.PI*2); ctx.fill();

        // arms
        ctx.fillStyle = '#f08030';
        ctx.beginPath(); ctx.ellipse(cx-13*s, cy+14*s, 4*s, 7*s, -0.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+14*s, cy+14*s, 4*s, 6*s,  0.3, 0, Math.PI*2); ctx.fill();

        // legs
        ctx.fillStyle = '#e07020';
        ctx.beginPath(); ctx.ellipse(cx-7*s, cy+31*s, 5*s, 4*s, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+5*s, cy+31*s, 5*s, 4*s, 0, 0, Math.PI*2); ctx.fill();

        ctx.restore();
        if (this.playerFlash > 0) this.playerFlash--;
    }

    // ── sprite: Pidgey (enemy, top-right) ────────────────────────────────
    _drawPidgey(cx, cy, size) {
        const ctx = this.ctx;
        const s   = size / 40;
        const bob = Math.sin(this.frameCount * 0.05) * 2;
        cy += bob;
        ctx.save();
        if (this.enemyFlash > 0 && Math.floor(this.frameCount / 4) % 2 === 0)
            ctx.filter = 'brightness(10)';

        // tail feathers
        ctx.fillStyle = '#c09060';
        ctx.beginPath();
        ctx.moveTo(cx+10*s, cy+18*s); ctx.lineTo(cx+22*s, cy+25*s); ctx.lineTo(cx+18*s, cy+18*s);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx+10*s, cy+18*s); ctx.lineTo(cx+24*s, cy+20*s); ctx.lineTo(cx+18*s, cy+14*s);
        ctx.fill();

        // wings
        ctx.fillStyle = '#b89060';
        ctx.beginPath(); ctx.ellipse(cx-4*s, cy+10*s, 14*s, 9*s, -0.3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#d0b080';
        ctx.beginPath(); ctx.ellipse(cx-5*s, cy+9*s,  10*s, 6*s, -0.2, 0, Math.PI*2); ctx.fill();

        // body
        ctx.fillStyle = '#c09868';
        ctx.beginPath(); ctx.ellipse(cx, cy+14*s, 12*s, 14*s, 0, 0, Math.PI*2); ctx.fill();

        // chest
        ctx.fillStyle = '#f0ddb0';
        ctx.beginPath(); ctx.ellipse(cx-2*s, cy+16*s, 7*s, 9*s, 0, 0, Math.PI*2); ctx.fill();

        // head
        ctx.fillStyle = '#b89068';
        ctx.beginPath(); ctx.arc(cx-2*s, cy+1*s, 13*s, 0, Math.PI*2); ctx.fill();

        // crest
        ctx.fillStyle = '#c8a878';
        ctx.beginPath();
        ctx.moveTo(cx-6*s, cy-10*s);
        ctx.quadraticCurveTo(cx-2*s, cy-18*s, cx+2*s, cy-10*s);
        ctx.fill();

        // eye
        ctx.fillStyle = '#200800';
        ctx.beginPath(); ctx.arc(cx-6*s, cy-1*s, 2.5*s, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx-5*s, cy-1.5*s, 1*s, 0, Math.PI*2); ctx.fill();

        // beak
        ctx.fillStyle = '#e0a000';
        ctx.beginPath();
        ctx.moveTo(cx-14*s, cy+3*s); ctx.lineTo(cx-10*s, cy+1*s); ctx.lineTo(cx-10*s, cy+5*s);
        ctx.fill();

        // feet
        ctx.strokeStyle = '#e0a000'; ctx.lineWidth = 2*s;
        ctx.beginPath(); ctx.moveTo(cx-4*s, cy+27*s); ctx.lineTo(cx-8*s, cy+33*s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx-4*s, cy+27*s); ctx.lineTo(cx-2*s, cy+33*s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+3*s, cy+27*s); ctx.lineTo(cx-1*s, cy+33*s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+3*s, cy+27*s); ctx.lineTo(cx+7*s, cy+33*s); ctx.stroke();

        ctx.restore();
        if (this.enemyFlash > 0) this.enemyFlash--;
    }

    // Main part of every thing.
    _render() {
        const nav  = document.querySelector('nav,header,.navbar,#topNavbar,#nav-bar');
        const navH = nav ? nav.offsetHeight : 0;

        const cv  = this.canvas;
        const ctx = this.ctx;
        cv.style.top = navH + 'px';
        cv.width     = window.innerWidth;
        cv.height    = window.innerHeight - navH;

        const W      = cv.width;
        const H      = cv.height;
        const splitY = Math.floor(H * 0.625);
        const panH   = H - splitY;

        ctx.clearRect(0, 0, W, H);

        // ── sky + grass background
        const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        sky.addColorStop(0, '#c0e8f8'); sky.addColorStop(1, '#e8f4f8');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.6);

        ctx.strokeStyle = 'rgba(160,210,240,0.35)'; ctx.lineWidth = 1;
        for (let i = 0; i < W; i += 24) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H*0.6); ctx.stroke();
        }

        ctx.fillStyle = '#90c840'; ctx.fillRect(0, H*0.44, W, H*0.12);
        ctx.fillStyle = '#70a828'; ctx.fillRect(0, H*0.50, W, H*0.06);
        ctx.fillStyle = '#78c038'; ctx.fillRect(0, H*0.60, W, H*0.05);

        // platforms
        ctx.fillStyle = 'rgba(80,55,10,0.50)';
        ctx.beginPath(); ctx.ellipse(W*0.72, H*0.48, W*0.16, H*0.055, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(80,55,10,0.50)';
        ctx.beginPath(); ctx.ellipse(W*0.24, H*0.76, W*0.15, H*0.050, 0, 0, Math.PI*2); ctx.fill();

        // Where sprites and stuff are.
        let esx = 0, esy = 0, psx = 0, psy = 0;
        if (this.shakeEnemy  > 0) { esx=(Math.random()-.5)*8; esy=(Math.random()-.5)*4; this.shakeEnemy--;  }
        if (this.shakePlayer > 0) { psx=(Math.random()-.5)*6; psy=(Math.random()-.5)*3; this.shakePlayer--; }

        if (this.enemyHp  > 0) this._drawPidgey(W*0.70+esx, H*0.10+esy, 80);
        if (this.playerHp > 0) this._drawCharmander(W*0.21+psx, H*0.40+psy, 90);

        // ── enemy info box (top-left) ─────────────────────────────────
        const eIW=168, eIH=52, eIX=10, eIY=8;
        this._infoBox(eIX, eIY, eIW, eIH);
        this._label(this.ENEMY_MON.name,               eIX+8,       eIY+15, 7, '#1a1a10', 'left');
        this._label(this.ENEMY_MON.gender,              eIX+eIW-26,  eIY+15, 7, '#5080c0', 'left');
        this._label('Lv'+this.ENEMY_MON.level,          eIX+eIW-44,  eIY+15, 7, '#1a1a10', 'right');
        this._label('HP:',                              eIX+8,       eIY+32, 6, '#484838', 'left');
        this._hpBar(eIX+36, eIY+24, eIW-48, 7, Math.max(0, this.enemyHp/this.enemyMaxHp));

        // ── player info things
        const pIW=180, pIH=68, pIX=W-pIW-8, pIY=H*0.55-pIH-5;
        this._infoBox(pIX, pIY, pIW, pIH);
        this._label(this.PLAYER_MON.nickname,           pIX+8,       pIY+14, 7, '#1a1a10', 'left');
        this._label(this.PLAYER_MON.gender,             pIX+pIW-50,  pIY+14, 7, '#e03060', 'left');
        this._label('Lv'+this.PLAYER_MON.level,         pIX+pIW-10,  pIY+14, 7, '#1a1a10', 'right');
        this._label('HP:',                              pIX+8,       pIY+30, 6, '#484838', 'left');
        const pPct = Math.max(0, this.playerHp / this.playerMaxHp);
        this._hpBar(pIX+36, pIY+22, pIW-48, 7, pPct);
        const hpCol = pPct < 0.2 ? '#d02000' : pPct < 0.5 ? '#e08000' : '#1a1a10';
        this._label(`${Math.max(0,this.playerHp)}/ ${this.playerMaxHp}`, pIX+pIW-8, pIY+44, 6, hpCol, 'right');
        ctx.fillStyle = '#101010'; ctx.fillRect(pIX+8,  pIY+54, pIW-16, 6);
        ctx.fillStyle = '#4890f0';
        ctx.fillRect(pIX+8, pIY+54, Math.max(0, (pIW-16)*(this.playerExp/this.playerMaxExp)), 6);
        this._label('EXP', pIX+8, pIY+66, 5, '#808070', 'left');

        // ── bottom panel stuff
        ctx.fillStyle = '#3858b0';
        ctx.beginPath();
        ctx.moveTo(0, splitY + panH*0.06);
        ctx.lineTo(W*0.16, splitY);
        ctx.lineTo(W, splitY);
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#182868'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(0, splitY+panH*0.06); ctx.lineTo(W*0.16, splitY); ctx.lineTo(W, splitY); ctx.stroke();
        ctx.strokeStyle = '#7090e0'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, splitY+panH*0.06+2.5); ctx.lineTo(W*0.16, splitY+2.5); ctx.lineTo(W, splitY+2.5); ctx.stroke();

        // message box 
        const msgX=8, msgY=splitY+panH*0.08, msgW=W*0.50, msgH=panH*0.82;
        this._infoBox(msgX, msgY, msgW, msgH);

        // MESSAGE state 
        if (this.state === 'MESSAGE') {
            this.msgTimer++;
            const shown = this.currentMsg.slice(0, Math.min(this.currentMsg.length, Math.floor(this.msgTimer / 1.5)));
            shown.split('\n').forEach((line, i) => {
                this._label(line, msgX+10, msgY+msgH*0.38+i*13, 7, '#1a1a10', 'left');
            });
            if (shown.length >= this.currentMsg.length && Math.floor(this.frameCount/18)%2===0)
                this._label('▼', msgX+msgW-14, msgY+msgH*0.90, 7, '#1a1a10', 'left');
        }

        // MENU state
        if (this.state === 'MENU') {
            this._label('What will',  msgX+10, msgY+msgH*0.36, 7, '#1a1a10', 'left');
            this._label('Fred do?',   msgX+10, msgY+msgH*0.70, 7, '#1a1a10', 'left');

            const opX=W*0.52, opY=splitY+panH*0.06, opW=W*0.46, opH=panH*0.90;
            this._infoBox(opX, opY, opW, opH);
            const opts = ['FIGHT', 'BAG', 'POKeMON', 'RUN'];
            [[0,1],[2,3]].forEach((row, ri) => {
                row.forEach((idx, ci) => {
                    const ox  = opX + opW*(0.06 + ci*0.50);
                    const oy  = opY + opH*(0.28 + ri*0.44);
                    const sel = idx === this.menuIndex;
                    this._label((sel?'▶':' ')+opts[idx], ox, oy, 7, sel?'#1a1a10':'#606060', 'left');
                });
            });
            this._label(this.itemUsed?'Potion: USED':'Potion: x1', opX+opW-8, opY+opH*0.96, 5, '#808070', 'right');
        }

        // Fight menu state thing
        if (this.state === 'FIGHT_MENU') {
            const moves    = this.PLAYER_MON.moves;
            const typeCols = { NORMAL:'#888860', FIRE:'#d04010', STEEL:'#9090b0' };
            [[0,1],[2,3]].forEach((row, ri) => {
                row.forEach((idx, ci) => {
                    const ox  = msgX + msgW*(0.04 + ci*0.52);
                    const oy  = msgY + msgH*(0.28 + ri*0.46);
                    const sel = idx === this.fightIndex;
                    const mv  = moves[idx];
                    this._label((sel?'▶':' ')+mv.name, ox, oy, 6, sel?(typeCols[mv.type]||'#1a1a10'):'#555545', 'left');
                });
            });

            const tX=W*0.52, tY=splitY+panH*0.06, tW=W*0.46, tH=panH*0.90;
            this._infoBox(tX, tY, tW, tH);
            const mv = moves[this.fightIndex];
            const tc = typeCols[mv.type] || '#666';
            this._label('TYPE/',                   tX+tW/2, tY+tH*0.28, 6, '#606050', 'center');
            this._label(mv.type,                   tX+tW/2, tY+tH*0.48, 6, tc,        'center');
            this._label(`PP ${mv.pp}/${mv.maxPp}`, tX+tW/2, tY+tH*0.68, 6, '#484838', 'center');
            this._label('X: BACK',                 tX+tW/2, tY+tH*0.90, 5, '#909080', 'center');
        }

        // Checks weather to win like a good person
        if (this.state === 'WIN') {
            ctx.fillStyle = 'rgba(248,248,232,0.96)'; ctx.fillRect(0, 0, W, H);
            this._label('Wild PIDGEY fainted!', W/2, H*0.34, 9, '#1a1a10', 'center');
            this._label('Fred gained EXP!',     W/2, H*0.52, 7, '#2060d0', 'center');
            this._label('Z - play again',        W/2, H*0.74, 6, '#909080', 'center');
        }

        //Checks weather to lose like a bozoo
        if (this.state === 'LOSE') {
            ctx.fillStyle = 'rgba(8,8,20,0.97)'; ctx.fillRect(0, 0, W, H);
            this._label('Fred fainted!', W/2, H*0.38, 9, '#d02000', 'center');
            this._label('Z - try again', W/2, H*0.60, 6, '#909080', 'center');
        }
    }

    // ── engine hooks 
    update() {
        this.frameCount++;
        this._render();
    }

    draw()   {}
    resize() {}

    destroy() {
        window.removeEventListener('keydown', this._keyDown);
        window.removeEventListener('keyup',   this._keyUp);
        document.getElementById('pk-battle-canvas')?.remove();

        // restore engine canvas visibility
        const gc = document.getElementById('gameContainer');
        const c  = gc ? gc.querySelector('canvas') : document.querySelector('canvas');
        if (c) { c.style.opacity = '1'; c.style.pointerEvents = 'auto'; }
    }
}

export default GameLevelPokemonBattle;


// Why This Kolaveri Di ? (The Soup of Love)
//Song by

//Dhanush, Anirudh Ravichander

//Yo boys, I am sing song
//Soup song
//Flop song

//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Rhythm correct?
//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Maintain please
//Why this கொலவெறி... அடி?

//Distance'uல moon'u, moon'u
//Moon'u colour'u white'u
//White'u background night'u, night'u
//Night'u colour'u black'u

//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?

//White'u skin'u girl'u, girl'u
//Girl'u heart'u black'u
//Eyes'u-eyes'u meet'u, meet'u
//My future'u dark'u

//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?

//மாமா notes எடுத்துக்கோ
//அப்டே கைல snacks எடுத்துக்கோ
//பப்பாப பொய்ங், பப்பாப பொய்ங், பப்பாபப பபபோய்ங்
//சரியா வாசி
//Super மாமா ready
//Ready one, two, three, four
//Wah, what a changeover மாமா
//Ok மாமா, now tune change'u

//கைல glass'u... Only english'u
//Hand'la glass'u glass'la scotch'u
//Eyes'u full'ah tear'u
//Empty life'u girl'u come'u
//Life'u reverse'u gear'u

//Love'u-love'u, oh my love'u
//You showed me bow'u
//Cow'u-cow'u holy cow'u
//I want you here now'u

//God'u I am dying now
//She is happy how'u?
//This'u song'u for soup boys'u
//We don't have choice'u

//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Why this கொலவெறி, கொலவெறி, கொலவெறிடி?
//Flop song
