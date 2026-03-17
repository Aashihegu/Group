import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Character from './essentials/Character.js';
import Npc from './essentials/Npc.js';

/* ================================================================
   Undertale-style boss fight for McArchie vs Blackbread

   HOW IT WORKS:
   - A small "soul box" appears on screen (like Undertale's battle box)
   - McArchie's blue SOUL moves inside the box dodging bullet patterns
   - Press F to open the FIGHT menu and slash the boss
   - Boss has multiple attack patterns per phase (3 phases total)
   - Between attacks the player chooses: FIGHT / ACT / ITEM / MERCY
   ================================================================ */

class GameLevelPirateBoss {
    constructor(gameEnv) {
        const path = gameEnv.path;
        this.gameEnv = gameEnv;
        this.continue = true;

        // ── game state ──────────────────────────────────────────────────
        this.state        = 'INTRO';   // INTRO | MENU | PLAYER_TURN | BOSS_TURN | WIN | LOSE
        this.bossMaxHp    = 300;
        this.bossHp       = 300;
        this.playerMaxHp  = 100;
        this.playerHp     = 100;
        this.bossPhase    = 1;
        this.turnCount    = 0;
        this.attackIndex  = 0;
        this.frameCount   = 0;
        this.bullets      = [];
        this.soulX        = 0;
        this.soulY        = 0;
        this.soulSpd      = 4;
        this.invincFrames = 0;
        this.menuIndex    = 0;   // 0=FIGHT 1=ACT 2=ITEM 3=MERCY
        this.attackActive = false;
        this.attackTimer  = 0;
        this.attackDur    = 180; // frames per boss attack
        this.messageQueue = [];
        this.currentMsg   = '';
        this.msgTimer     = 0;
        this.itemUsed     = false;

        // ── battle box dimensions ───────────────────────────────────────
        this.box = { x: 0, y: 0, w: 240, h: 200 };

        // ── canvas overlay for the battle UI ───────────────────────────
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'ut-battle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 5000;
            pointer-events: none;
            image-rendering: pixelated;
        `;
        document.body.appendChild(this.canvas);
        this.ctx2 = this.canvas.getContext('2d');

        // ── key tracking ────────────────────────────────────────────────
        this.keys = {};
        this._keyDown = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                 'KeyW','KeyA','KeyS','KeyD','KeyZ','KeyX',
                 'Enter','Space'].includes(e.code)) {
                e.stopPropagation();
            }
            this.keys[e.code] = true;
            this._handleMenuKey(e.code);
        };
        this._keyUp = (e) => { this.keys[e.code] = false; };
        window.addEventListener('keydown', this._keyDown);
        window.addEventListener('keyup',   this._keyUp);

        // ── load sprites ────────────────────────────────────────────────
        this.bossImg  = new Image();
        this.bossImg.src  = path + '/images/gamebuilder/sprites/Pirate.png';
        this.playerImg = new Image();
        this.playerImg.src = path + '/images/gamebuilder/sprites/mcarchie.png';

        // ── start intro ─────────────────────────────────────────────────
        this._queueMessages([
            '* A ferocious pirate blocks your path!',
            '* BLACKBREAD appeared!',
            '* His eyes glow with fury...',
        ], () => { this.state = 'MENU'; });

        // ── background objects (engine needs these) ──────────────────────
        const bgData = {
            name: 'boss_bg',
            src: path + '/images/gamebuilder/bg/Ship.jpg',
            pixels: { height: 600, width: 800 }
        };
        const playerData = {
            id: 'mcarchie',
            src: path + '/images/gamebuilder/sprites/mcarchie.png',
            SCALE_FACTOR: 999,   // effectively hidden — battle UI takes over
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 30,
            INIT_POSITION: { x: -500, y: -500 },
            pixels: { height: 256, width: 256 },
            orientation: { rows: 4, columns: 4 },
            down:  { row: 0, start: 0, columns: 4 },
            right: { row: 2, start: 0, columns: 4 },
            left:  { row: 1, start: 0, columns: 4 },
            up:    { row: 3, start: 0, columns: 4 },
            hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
            keypress: { up: 0, left: 0, down: 0, right: 0 }  // disable WASD for game engine
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData    },
            { class: Player,            data: playerData }
        ];
    }

    // ── message system ───────────────────────────────────────────────────────
    _queueMessages(msgs, callback) {
        this.messageQueue = [...msgs];
        this._msgCallback = callback || null;
        this._nextMessage();
    }

    _nextMessage() {
        if (this.messageQueue.length === 0) {
            if (this._msgCallback) { this._msgCallback(); this._msgCallback = null; }
            return;
        }
        this.currentMsg = this.messageQueue.shift();
        this.msgTimer   = 0;
        this.state      = 'MESSAGE';
    }

    _handleMenuKey(code) {
        if (this.state === 'MESSAGE') {
            if (code === 'KeyZ' || code === 'Enter' || code === 'Space') {
                this._nextMessage();
            }
            return;
        }

        if (this.state === 'MENU') {
            if (code === 'ArrowLeft')  this.menuIndex = (this.menuIndex + 3) % 4;
            if (code === 'ArrowRight') this.menuIndex = (this.menuIndex + 1) % 4;
            if (code === 'ArrowUp')    this.menuIndex = (this.menuIndex + 2) % 4;
            if (code === 'ArrowDown')  this.menuIndex = (this.menuIndex + 2) % 4;
            if (code === 'KeyZ' || code === 'Enter') {
                this._selectMenu();
            }
        }
    }

    _selectMenu() {
        const opts = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];
        const choice = opts[this.menuIndex];

        if (choice === 'FIGHT') {
            const dmg = this.bossPhase === 3 ? 8 + Math.floor(Math.random()*8)
                      : this.bossPhase === 2 ? 14 + Math.floor(Math.random()*10)
                                              : 20 + Math.floor(Math.random()*12);
            this.bossHp = Math.max(0, this.bossHp - dmg);
            const hitMsgs = [
                `* McArchie slashes with the cutlass!`,
                `* Blackbread took ${dmg} damage!`
            ];
            if (this.bossHp <= 0) {
                this._queueMessages([
                    `* McArchie strikes the finishing blow!`,
                    `* Blackbread staggers back...`,
                    `* "...Well played, ye scurvy dog."`,
                    `* BLACKBREAD was defeated!`
                ], () => { this.state = 'WIN'; });
            } else {
                this._queueMessages(hitMsgs, () => { this._startBossTurn(); });
            }

        } else if (choice === 'ACT') {
            const acts = [
                '* McArchie checks Blackbread.\n* He looks weakened but furious.',
                '* McArchie taunts the pirate!\n* Blackbread\'s ATTACK fell a little!',
                '* McArchie compliments the hat.\n* Blackbread is briefly flattered...',
            ];
            const msg = acts[Math.floor(Math.random() * acts.length)];
            this._queueMessages([msg], () => { this._startBossTurn(); });

        } else if (choice === 'ITEM') {
            if (!this.itemUsed) {
                this.itemUsed = true;
                const heal = 40;
                this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
                this._queueMessages([
                    `* McArchie used a Grog Flask!`,
                    `* Recovered ${heal} HP!`
                ], () => { this._startBossTurn(); });
            } else {
                this._queueMessages(['* No items left!'], () => { this.state = 'MENU'; });
            }

        } else if (choice === 'MERCY') {
            const mercyMsgs = [
                '* McArchie tries to spare Blackbread.',
                '* "SPARE?! I\'m BLACKBREAD! I spare NO ONE!"',
                '* The fight continues...'
            ];
            this._queueMessages(mercyMsgs, () => { this._startBossTurn(); });
        }
    }

    // ── boss turn — launches a bullet pattern ────────────────────────────────
    _startBossTurn() {
        this.turnCount++;
        this._checkPhase();

        // centre soul in box at start of dodge phase
        const W = this.canvas.width, H = this.canvas.height;
        this.box.x = W / 2 - this.box.w / 2;
        this.box.y = H * 0.57 + (H * 0.43 - this.box.h) / 2 - 20;
        this.soulX = this.box.x + this.box.w / 2;
        this.soulY = this.box.y + this.box.h / 2;

        this.bullets      = [];
        this.attackActive = true;
        this.attackTimer  = 0;
        this.state        = 'BOSS_TURN';

        // pick attack pattern
        const patterns = this.bossPhase === 1 ? [0, 1]
                       : this.bossPhase === 2 ? [0, 1, 2]
                                              : [0, 1, 2, 3];
        this.currentPattern = patterns[this.attackIndex % patterns.length];
        this.attackIndex++;

        const flavour = [
            '* Blackbread fires his cannons!',
            '* Blackbread swings his cutlass!',
            '* Blackbread calls the storm!',
            '* Blackbread UNLEASHES his rage!'
        ];
        this.currentMsg = flavour[this.currentPattern] || flavour[0];
    }

    _checkPhase() {
        const ratio = this.bossHp / this.bossMaxHp;
        const newPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
        if (newPhase !== this.bossPhase) {
            this.bossPhase = newPhase;
            const msgs = newPhase === 2
                ? ['* Blackbread\'s eye glows red!', '* His attacks are faster now!']
                : ['* Blackbread ROARS in fury!', '* Everything is shaking!', '* His power has doubled!'];
            this.messageQueue = [...msgs, ...this.messageQueue];
        }
    }

    // ── bullet spawning helpers ──────────────────────────────────────────────
    _spawnBullet(x, y, vx, vy, r = 6, color = '#ff4444', type = 'circle') {
        this.bullets.push({ x, y, vx, vy, r, color, type, life: 300 });
    }

    _spawnCannonPattern(t) {
        const box = this.box;
        // volleys from the sides
        if (t % 30 === 0) {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const y    = box.y + 20 + Math.random() * (box.h - 40);
            const vx   = side === 'left' ? 3.5 : -3.5;
            this._spawnBullet(side === 'left' ? box.x - 10 : box.x + box.w + 10, y, vx, 0, 7, '#ff6600');
        }
        if (t % 45 === 0) {
            const x = box.x + 20 + Math.random() * (box.w - 40);
            this._spawnBullet(x, box.y - 10, 0, 3, 6, '#ffaa00');
        }
    }

    _spawnCutlassPattern(t) {
        const box = this.box;
        // diagonal sweeps
        if (t % 20 === 0) {
            const top = Math.random() < 0.5;
            for (let i = 0; i < 4; i++) {
                const x  = box.x + (box.w / 5) * i + 10;
                const vy = top ? 4 : -4;
                const vx = (Math.random() - 0.5) * 1.5;
                this._spawnBullet(x, top ? box.y - 8 : box.y + box.h + 8, vx, vy, 5, '#ff2222', 'diamond');
            }
        }
    }

    _spawnStormPattern(t) {
        const box = this.box;
        // rotating ring of bullets from centre
        if (t % 25 === 0) {
            const cx  = box.x + box.w / 2;
            const cy  = box.y + box.h / 2;
            const num = 6;
            const off = (t / 25) * 0.4;
            for (let i = 0; i < num; i++) {
                const a   = (i / num) * Math.PI * 2 + off;
                const spd = 2.8;
                this._spawnBullet(cx, cy, Math.cos(a) * spd, Math.sin(a) * spd, 5, '#cc44ff', 'circle');
            }
        }
    }

    _spawnRagePattern(t) {
        // all patterns combined, faster
        const box = this.box;
        if (t % 15 === 0) {
            const x = box.x + Math.random() * box.w;
            this._spawnBullet(x, box.y - 8, (Math.random()-0.5)*2, 5, 6, '#ff0000');
        }
        if (t % 18 === 0) {
            const y = box.y + Math.random() * box.h;
            this._spawnBullet(box.x - 8, y, 5, (Math.random()-0.5)*2, 6, '#ff4400');
            this._spawnBullet(box.x + box.w + 8, y, -5, (Math.random()-0.5)*2, 6, '#ff4400');
        }
        if (t % 30 === 0) {
            const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2 + t * 0.05;
                this._spawnBullet(cx, cy, Math.cos(a)*3.5, Math.sin(a)*3.5, 5, '#ffff00');
            }
        }
    }

    // ── update bullets & soul movement ───────────────────────────────────────
    _updateBossTurn() {
        const t   = this.attackTimer;
        const box = this.box;

        // spawn bullets based on pattern
        if      (this.currentPattern === 0) this._spawnCannonPattern(t);
        else if (this.currentPattern === 1) this._spawnCutlassPattern(t);
        else if (this.currentPattern === 2) this._spawnStormPattern(t);
        else if (this.currentPattern === 3) this._spawnRagePattern(t);

        // move soul with arrow keys
        const spd = this.soulSpd;
        if (this.keys['ArrowLeft']  || this.keys['KeyA']) this.soulX -= spd;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.soulX += spd;
        if (this.keys['ArrowUp']    || this.keys['KeyW']) this.soulY -= spd;
        if (this.keys['ArrowDown']  || this.keys['KeyS']) this.soulY += spd;

        // clamp soul inside box
        this.soulX = Math.max(box.x + 8,  Math.min(box.x + box.w - 8,  this.soulX));
        this.soulY = Math.max(box.y + 8,  Math.min(box.y + box.h - 8,  this.soulY));

        // move & check bullets
        if (this.invincFrames > 0) this.invincFrames--;

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx; b.y += b.vy; b.life--;

            // remove if out of box or expired
            if (b.life <= 0 ||
                b.x < box.x - 20 || b.x > box.x + box.w + 20 ||
                b.y < box.y - 20 || b.y > box.y + box.h + 20) {
                this.bullets.splice(i, 1); continue;
            }

            // hit soul
            if (this.invincFrames === 0) {
                const dx = b.x - this.soulX, dy = b.y - this.soulY;
                if (Math.sqrt(dx*dx + dy*dy) < b.r + 5) {
                    const dmg = this.bossPhase === 3 ? 12 : this.bossPhase === 2 ? 8 : 5;
                    this.playerHp = Math.max(0, this.playerHp - dmg);
                    this.invincFrames = 40;
                    this.bullets.splice(i, 1);
                    if (this.playerHp <= 0) {
                        this.state = 'LOSE';
                        return;
                    }
                }
            }
        }

        this.attackTimer++;
        if (this.attackTimer >= this.attackDur) {
            this.attackActive = false;
            this.bullets      = [];
            this.state        = 'MENU';
        }
    }

    // ── main draw ─────────────────────────────────────────────────────────────
    _render() {
        const cv  = this.canvas;
        const ctx = this.ctx2;
        cv.width  = window.innerWidth;
        cv.height = window.innerHeight;
        const W = cv.width, H = cv.height;

        ctx.clearRect(0, 0, W, H);

        // ── BACKGROUND: two-tone like Pokemon (grass top / dirt bottom) ──
        // top half — sky/battle field
        ctx.fillStyle = '#2a4a1a';
        ctx.fillRect(0, 0, W, H * 0.55);
        // bottom half — darker panel area
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, H * 0.55, W, H * 0.45);
        // dividing line
        ctx.fillStyle = '#4a7a2a';
        ctx.fillRect(0, H * 0.52, W, 8);

        // ── BOSS SPRITE — top-right (far side, like Pokemon enemy) ───────
        const bossW = Math.min(480, W * 0.52);
        const bossH = bossW * (395 / 632);
        const bossX = W * 0.48;
        const bossY = H * 0.01;

        // boss platform shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(bossX + bossW / 2, bossY + bossH + 10, bossW * 0.45, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.bossImg.complete && this.bossImg.naturalWidth > 0) {
            ctx.save();
            if (this._bossHitFlash > 0) {
                // white flash on hit like Pokemon
                ctx.drawImage(this.bossImg, 0, 0, 632, 395, bossX, bossY, bossW, bossH);
                ctx.globalCompositeOperation = 'source-atop';
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bossX, bossY, bossW, bossH);
                this._bossHitFlash--;
            } else {
                ctx.drawImage(this.bossImg, 0, 0, 632, 395, bossX, bossY, bossW, bossH);
            }
            ctx.restore();
        } else {
            // fallback placeholder
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(bossX + 20, bossY + 20, bossW - 40, bossH - 20);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('BLACKBREAD', bossX + bossW / 2, bossY + bossH / 2);
        }

        // ── BOSS HP BOX — top-left (like Pokemon enemy info box) ─────────
        const bInfoX = 30, bInfoY = 30, bInfoW = 320, bInfoH = 80;
        ctx.fillStyle   = '#1a1a1a';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(bInfoX, bInfoY, bInfoW, bInfoH, 8);
        ctx.fill(); ctx.stroke();

        // boss name + level
        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('BLACKBREAD', bInfoX + 14, bInfoY + 26);
        const hpColor = this.bossPhase === 3 ? '#cc00ff' : this.bossPhase === 2 ? '#ff8800' : '#ff2200';
        ctx.fillStyle = hpColor;
        ctx.font      = 'bold 12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(
            this.bossPhase === 3 ? '★★★ ENRAGED' : this.bossPhase === 2 ? '★★ Phase II' : '★ Phase I',
            bInfoX + bInfoW - 12, bInfoY + 26
        );

        // HP label
        ctx.fillStyle = '#aaaaaa';
        ctx.font      = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('HP', bInfoX + 14, bInfoY + 48);

        // HP bar
        const bBarX = bInfoX + 40, bBarY = bInfoY + 38, bBarW = bInfoW - 60, bBarH = 12;
        ctx.fillStyle = '#330000';
        ctx.fillRect(bBarX, bBarY, bBarW, bBarH);
        const hpPct = Math.max(0, this.bossHp / this.bossMaxHp);
        ctx.fillStyle = hpColor;
        ctx.fillRect(bBarX, bBarY, bBarW * hpPct, bBarH);
        ctx.strokeStyle = '#555';
        ctx.lineWidth   = 1;
        ctx.strokeRect(bBarX, bBarY, bBarW, bBarH);

        // HP numbers
        ctx.fillStyle = '#ffffff';
        ctx.font      = '13px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(
            `${Math.max(0, Math.round(this.bossHp))} / ${this.bossMaxHp}`,
            bInfoX + bInfoW - 12, bInfoY + 68
        );

        // ── PLAYER SPRITE — bottom-left (near side, like Pokemon player) ──
        const plW = Math.min(220, W * 0.25);
        const plH = plW;   // mcarchie sprite sheet is square
        const plX = W * 0.06;
        const plY = H * 0.22;

        // player platform
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(plX + plW / 2, plY + plH + 6, plW * 0.45, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.playerImg.complete && this.playerImg.naturalWidth > 0) {
            ctx.save();
            // draw just the first frame (row 0, col 0) of the mcarchie sprite sheet
            // sheet is 4 cols x 4 rows of 256x256 = 1024x1024 total
            const frameW = 256, frameH = 256;
            ctx.drawImage(this.playerImg, 0, 0, frameW, frameH, plX, plY, plW, plH);
            ctx.restore();
        } else {
            ctx.fillStyle = '#0055aa';
            ctx.fillRect(plX + 20, plY + 20, plW - 40, plH - 20);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('McArchie', plX + plW / 2, plY + plH / 2);
        }

        // ── PLAYER HP BOX — bottom-right (like Pokemon player info box) ──
        const pInfoW = 340, pInfoH = 90;
        const pInfoX = W - pInfoW - 30;
        const pInfoY = H * 0.38;

        ctx.fillStyle   = '#1a1a1a';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(pInfoX, pInfoY, pInfoW, pInfoH, 8);
        ctx.fill(); ctx.stroke();

        // player name
        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('McArchie', pInfoX + 14, pInfoY + 26);

        // HP label
        ctx.fillStyle = '#aaaaaa';
        ctx.font      = 'bold 12px monospace';
        ctx.fillText('HP', pInfoX + 14, pInfoY + 50);

        // player HP bar
        const pPct     = Math.max(0, this.playerHp / this.playerMaxHp);
        const pHpColor = pPct < 0.25 ? '#ff2200' : pPct < 0.5 ? '#ffaa00' : '#00cc44';
        const pBarX    = pInfoX + 42, pBarY = pInfoY + 40, pBarW = pInfoW - 60, pBarH = 14;

        ctx.fillStyle = '#003300';
        ctx.fillRect(pBarX, pBarY, pBarW, pBarH);

        // flicker when low HP
        const flicker = pPct < 0.25 && Math.floor(this.frameCount / 8) % 2 === 0 ? 0.4 : 1;
        ctx.save();
        ctx.globalAlpha = flicker;
        ctx.fillStyle   = pHpColor;
        ctx.fillRect(pBarX, pBarY, pBarW * pPct, pBarH);
        ctx.restore();

        ctx.strokeStyle = '#555';
        ctx.lineWidth   = 1;
        ctx.strokeRect(pBarX, pBarY, pBarW, pBarH);

        // HP numbers — big and clear
        ctx.fillStyle = pHpColor;
        ctx.font      = 'bold 16px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(
            `${Math.max(0, Math.round(this.playerHp))} / ${this.playerMaxHp}`,
            pInfoX + pInfoW - 12, pInfoY + 76
        );

        // item indicator
        ctx.fillStyle = this.itemUsed ? '#555' : '#44aaff';
        ctx.font      = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(
            this.itemUsed ? 'Grog Flask — USED' : '🧴 Grog Flask ×1',
            pInfoX + pInfoW - 12, pInfoY + 26
        );

        // ── battle box (shown during BOSS_TURN) ───────────────────────
        if (this.state === 'BOSS_TURN') {
            const box = this.box;
            // recentre box in lower panel area each frame
            box.x = W / 2 - box.w / 2;
            box.y = H * 0.57 + (H * 0.43 - box.h) / 2 - 20;

            // outer border white
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth   = 3;
            ctx.strokeRect(box.x - 3, box.y - 3, box.w + 6, box.h + 6);
            // inner black fill
            ctx.fillStyle = '#000000';
            ctx.fillRect(box.x, box.y, box.w, box.h);

            // bullets
            this.bullets.forEach(b => {
                ctx.save();
                if (b.type === 'diamond') {
                    ctx.translate(b.x, b.y);
                    ctx.rotate(Math.PI / 4);
                    ctx.fillStyle = b.color;
                    ctx.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    ctx.fillStyle = b.color;
                    ctx.fill();
                }
                ctx.restore();
            });

            // soul (blue heart)
            const alpha = this.invincFrames > 0 ? (Math.sin(this.frameCount * 0.5) > 0 ? 0.3 : 1) : 1;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle   = '#0088ff';
            // draw heart shape
            const sx = this.soulX, sy = this.soulY, sr = 7;
            ctx.beginPath();
            ctx.moveTo(sx, sy + sr);
            ctx.bezierCurveTo(sx - sr*2, sy - sr, sx - sr*2, sy - sr*2.5, sx, sy - sr*0.8);
            ctx.bezierCurveTo(sx + sr*2, sy - sr*2.5, sx + sr*2, sy - sr, sx, sy + sr);
            ctx.fill();
            ctx.restore();

            // attack label
            ctx.fillStyle   = '#ffffff';
            ctx.font        = '13px monospace';
            ctx.textAlign   = 'center';
            ctx.fillText(this.currentMsg, W / 2, box.y + box.h + 22);

            // timer bar
            const tPct = 1 - this.attackTimer / this.attackDur;
            ctx.fillStyle = '#333';
            ctx.fillRect(box.x, box.y + box.h + 30, box.w, 6);
            ctx.fillStyle = tPct > 0.5 ? '#00cc44' : tPct > 0.25 ? '#ffaa00' : '#ff2200';
            ctx.fillRect(box.x, box.y + box.h + 30, box.w * tPct, 6);
        }

        // ── menu (FIGHT / ACT / ITEM / MERCY) ────────────────────────
        if (this.state === 'MENU') {
            const menuY = H * 0.6;
            // dialogue box
            ctx.fillStyle   = '#000';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth   = 3;
            ctx.beginPath();
            ctx.roundRect(30, menuY - 10, W - 60, 110, 4);
            ctx.fill(); ctx.stroke();

            const opts   = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];
            const colors = ['#ff4444', '#ffdd00', '#44aaff', '#ff88cc'];
            const xPos   = [W*0.15, W*0.38, W*0.61, W*0.84];
            opts.forEach((label, i) => {
                const selected = i === this.menuIndex;
                ctx.font      = selected ? 'bold 22px monospace' : '18px monospace';
                ctx.fillStyle = selected ? colors[i] : '#aaaaaa';
                ctx.textAlign = 'center';
                ctx.fillText((selected ? '❯ ' : '  ') + label, xPos[i], menuY + 30);
            });

            // item status
            ctx.fillStyle = '#888';
            ctx.font      = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(this.itemUsed ? '  [Grog Flask — USED]' : '  [Grog Flask x1]', 40, menuY + 65);

            // hint
            ctx.fillStyle = '#666';
            ctx.font      = '11px monospace';
            ctx.fillText('Z / Enter to select   ←→ to move', 40, menuY + 85);
        }

        // ── message box ───────────────────────────────────────────────
        if (this.state === 'MESSAGE' || this.state === 'INTRO') {
            const msgY = H * 0.6;
            ctx.fillStyle   = '#000';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth   = 3;
            ctx.beginPath();
            ctx.roundRect(30, msgY - 10, W - 60, 110, 4);
            ctx.fill(); ctx.stroke();

            // typewriter effect
            this.msgTimer++;
            const charsToShow = Math.min(this.currentMsg.length, Math.floor(this.msgTimer / 1.5));
            const displayed   = this.currentMsg.slice(0, charsToShow);

            ctx.fillStyle = '#ffffff';
            ctx.font      = '16px monospace';
            ctx.textAlign = 'left';
            const lines = displayed.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, 50, msgY + 22 + i * 24);
            });

            // prompt blink
            if (charsToShow >= this.currentMsg.length && Math.floor(this.frameCount / 20) % 2 === 0) {
                ctx.fillStyle = '#ffff00';
                ctx.fillText('▼', W - 60, msgY + 85);
            }
        }

        // ── WIN screen ────────────────────────────────────────────────
        if (this.state === 'WIN') {
            ctx.fillStyle   = '#000';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle   = '#f5d060';
            ctx.font        = 'bold 48px monospace';
            ctx.textAlign   = 'center';
            ctx.fillText('YOU WON', W/2, H/2 - 40);
            ctx.fillStyle   = '#aaffaa';
            ctx.font        = '22px monospace';
            ctx.fillText('Blackbread was defeated!', W/2, H/2 + 10);
            ctx.fillStyle   = '#888';
            ctx.font        = '14px monospace';
            ctx.fillText('The seas are yours, McArchie.', W/2, H/2 + 45);
        }

        // ── LOSE screen ───────────────────────────────────────────────
        if (this.state === 'LOSE') {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#ff4444';
            ctx.font      = 'bold 48px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('YOU DIED', W/2, H/2 - 40);
            ctx.fillStyle = '#ffaaaa';
            ctx.font      = '18px monospace';
            ctx.fillText('Blackbread was too powerful...', W/2, H/2 + 10);
            ctx.fillStyle = '#666';
            ctx.font      = '14px monospace';
            ctx.fillText('Refresh the page to try again.', W/2, H/2 + 45);
        }
    }

    // ── engine hooks ─────────────────────────────────────────────────────────
    update() {
        this.frameCount++;
        if (this.state === 'BOSS_TURN') this._updateBossTurn();
        this._render();
    }

    draw()   {}
    resize() {}

    destroy() {
        window.removeEventListener('keydown', this._keyDown);
        window.removeEventListener('keyup',   this._keyUp);
        document.getElementById('ut-battle-canvas')?.remove();
    }
}

export default GameLevelPirateBoss;