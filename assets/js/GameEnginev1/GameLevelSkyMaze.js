import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Character from './essentials/Character.js';
import Npc from './essentials/Npc.js';

/* ============================================================
   BOSS CHARACTER — Blackbread the Colossal
   Extends Character just like Wolf did in level2.js.
   Phases: 1 = patrol, 2 = aggressive chase, 3 = enraged
   ============================================================ */
class BlackbreadBoss extends Character {
    constructor(data, gameEnv) {
        super(data, gameEnv);
        this.velocity       = { x: 0, y: 0 };
        this.speed          = data.SPEED || 1.2;
        this.phase          = 1;
        this.hp             = data.HP || 300;
        this.maxHp          = this.hp;
        this.attackTimer    = 0;
        this.attackInterval = 180;   // frames between cannonball fires
        this.patrolAngle    = 0;
        this.cannonballs    = [];    // live projectiles owned by the boss
        this._uiBuilt       = false;
    }

    /* ---------- UI: boss health bar + phase indicator ---------- */
    _buildUI() {
        if (this._uiBuilt) return;
        this._uiBuilt = true;

        const wrap = document.createElement('div');
        wrap.id = 'boss-hud';
        wrap.style.cssText = `
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            width: 340px;
            background: rgba(10,5,0,0.88);
            border: 2px solid #8b0000;
            border-radius: 10px;
            padding: 10px 16px 12px;
            z-index: 9999;
            font-family: 'Georgia', serif;
            box-shadow: 0 0 24px rgba(180,0,0,0.4);
        `;
        wrap.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="color:#ff6644;font-size:15px;font-weight:bold;">☠ Blackbread the Colossal</span>
                <span id="boss-phase-label" style="color:#ffaa44;font-size:12px;font-style:italic;">Phase I</span>
            </div>
            <div style="background:#1a0000;border-radius:6px;height:18px;overflow:hidden;border:1px solid #550000;">
                <div id="boss-hp-bar" style="height:100%;width:100%;background:linear-gradient(90deg,#8b0000,#dd2200);border-radius:6px;transition:width 0.2s;"></div>
            </div>
            <div id="boss-hp-text" style="color:#ffaaaa;font-size:11px;margin-top:4px;text-align:right;">300 / 300</div>
        `;
        document.body.appendChild(wrap);
    }

    _removeUI() {
        const el = document.getElementById('boss-hud');
        if (el) el.remove();
    }

    _updateUI() {
        const bar   = document.getElementById('boss-hp-bar');
        const text  = document.getElementById('boss-hp-text');
        const label = document.getElementById('boss-phase-label');
        if (!bar) return;
        const pct = Math.max(0, this.hp / this.maxHp * 100).toFixed(1);
        bar.style.width = pct + '%';
        bar.style.background =
            this.phase === 3 ? 'linear-gradient(90deg,#550088,#cc00ff)' :
            this.phase === 2 ? 'linear-gradient(90deg,#7a2000,#ff6600)' :
                               'linear-gradient(90deg,#8b0000,#dd2200)';
        text.textContent = Math.max(0, Math.round(this.hp)) + ' / ' + this.maxHp;
        label.textContent =
            this.phase === 3 ? 'Phase III — ENRAGED' :
            this.phase === 2 ? 'Phase II — Aggressive' :
                               'Phase I';
    }

    /* ---------- cannonball helpers ---------- */
    _fireCannon(targetX, targetY) {
        const bx  = this.position.x + (this.width  || 80) / 2;
        const by  = this.position.y + (this.height || 100) / 2;
        const dx  = targetX - bx;
        const dy  = targetY - by;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        const spd = this.phase === 3 ? 5.5 : this.phase === 2 ? 4.2 : 3;

        this.cannonballs.push({
            x: bx, y: by,
            vx: (dx / mag) * spd,
            vy: (dy / mag) * spd,
            radius: 9,
            life: 150
        });

        /* spread shots in phase 3 */
        if (this.phase >= 3) {
            [-0.3, 0.3].forEach(offset => {
                const a = Math.atan2(dy, dx) + offset;
                this.cannonballs.push({
                    x: bx, y: by,
                    vx: Math.cos(a) * spd,
                    vy: Math.sin(a) * spd,
                    radius: 7,
                    life: 150
                });
            });
        }
    }

    _updateCannonballs(ctx) {
        const W = this.gameEnv.innerWidth;
        const H = this.gameEnv.innerHeight;

        ctx.save();
        for (let i = this.cannonballs.length - 1; i >= 0; i--) {
            const cb = this.cannonballs[i];
            cb.x += cb.vx;
            cb.y += cb.vy;
            cb.life--;

            if (cb.life <= 0 || cb.x < 0 || cb.x > W || cb.y < 0 || cb.y > H) {
                this.cannonballs.splice(i, 1);
                continue;
            }

            /* draw cannonball */
            ctx.beginPath();
            const grad = ctx.createRadialGradient(cb.x - 2, cb.y - 2, 1, cb.x, cb.y, cb.radius);
            grad.addColorStop(0, '#ffcc44');
            grad.addColorStop(1, '#331100');
            ctx.fillStyle = grad;
            ctx.arc(cb.x, cb.y, cb.radius, 0, Math.PI * 2);
            ctx.fill();

            /* glow trail */
            ctx.beginPath();
            ctx.arc(cb.x - cb.vx * 2, cb.y - cb.vy * 2, cb.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,100,0,0.25)';
            ctx.fill();
        }
        ctx.restore();
    }

    /* ---------- phase transition ---------- */
    _checkPhase() {
        const ratio = this.hp / this.maxHp;
        let newPhase = 1;
        if (ratio <= 0.6) newPhase = 2;
        if (ratio <= 0.3) newPhase = 3;

        if (newPhase !== this.phase) {
            this.phase = newPhase;
            this.speed =
                newPhase === 3 ? 2.8 :
                newPhase === 2 ? 1.9 : 1.2;
            this.attackInterval =
                newPhase === 3 ? 80 :
                newPhase === 2 ? 120 : 180;

            if (this.gameEnv._showPhaseMsg) {
                this.gameEnv._showPhaseMsg(
                    newPhase === 3 ? '☠ FINAL PHASE — BLACKBREAD ENRAGED!' :
                                     '⚠ PHASE 2 — Blackbread grows violent!'
                );
            }
        }
    }

    /* ---------- main update ---------- */
    update() {
        this._buildUI();

        const W = this.gameEnv.innerWidth;
        const H = this.gameEnv.innerHeight;

        /* find player */
        let player = null;
        this.gameEnv.gameObjects?.forEach(obj => {
            if (obj?.constructor?.name === 'Player') player = obj;
        });

        if (player && player.position) {
            const px = player.position.x + (player.width  || 30) / 2;
            const py = player.position.y + (player.height || 40) / 2;
            const bx = this.position.x   + (this.width    || 80) / 2;
            const by = this.position.y   + (this.height  || 100) / 2;
            const dx = px - bx, dy = py - by;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (this.phase === 1) {
                /* Phase 1: slow patrol orbit */
                this.patrolAngle += 0.012;
                const orbitR = Math.min(W, H) * 0.28;
                const cx     = W / 2, cy = H / 2;
                this.position.x = cx + Math.cos(this.patrolAngle) * orbitR - (this.width  || 80)  / 2;
                this.position.y = cy + Math.sin(this.patrolAngle) * orbitR - (this.height || 100) / 2;
            } else {
                /* Phase 2/3: chase player */
                const chaseRatio = this.phase === 3 ? 0.9 : 0.7;
                if (dist > 90) {
                    this.velocity.x = (dx / dist) * this.speed * chaseRatio;
                    this.velocity.y = (dy / dist) * this.speed * chaseRatio;
                } else {
                    this.velocity.x *= 0.85;
                    this.velocity.y *= 0.85;
                }
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
            }

            /* fire cannonballs */
            this.attackTimer++;
            if (this.attackTimer >= this.attackInterval) {
                this.attackTimer = 0;
                this._fireCannon(px, py);
            }

            this._checkPhase();
            this._updateUI();
        }

        this._updateCannonballs(this.gameEnv.ctx);
        this.draw();
    }

    destroy() {
        this._removeUI();
    }
}

/* ============================================================
   THE LEVEL CLASS
   ============================================================ */
class GameLevelPirateBoss {
    constructor(gameEnv) {
        console.log("Initializing GameLevelPirateBoss...");

        const width  = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;
        const path   = gameEnv.path;

        this.gameEnv      = gameEnv;
        this.continue     = true;
        this.wonGame      = false;
        this.invincTimer  = 0;
        this._attackCooldown = 0;

        /* ---- phase-change flash message ---- */
        gameEnv._showPhaseMsg = (msg) => {
            let el = document.getElementById('boss-phase-flash');
            if (!el) {
                el = document.createElement('div');
                el.id = 'boss-phase-flash';
                el.style.cssText = `
                    position: fixed;
                    top: 42%;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #ff4400;
                    font-family: 'Georgia', serif;
                    font-size: 1.9rem;
                    text-shadow: 0 0 16px #ff2200;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity .3s;
                    z-index: 99999;
                    white-space: nowrap;
                `;
                document.body.appendChild(el);
            }
            el.textContent = msg;
            el.style.opacity = '1';
            clearTimeout(el._timer);
            el._timer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
        };

        /* ---- player HP UI ---- */
        const existingPhp = document.getElementById('player-boss-hud');
        if (existingPhp) existingPhp.remove();

        this.playerMaxHp = 100;
        this.playerHp    = 100;

        const phpWrap = document.createElement('div');
        phpWrap.id = 'player-boss-hud';
        phpWrap.style.cssText = `
            position: fixed;
            bottom: 22px;
            left: 20px;
            width: 200px;
            background: rgba(0,10,20,0.88);
            border: 2px solid #1a6aaa;
            border-radius: 10px;
            padding: 10px 14px 12px;
            z-index: 9999;
            font-family: 'Georgia', serif;
            box-shadow: 0 0 18px rgba(0,100,180,0.3);
        `;
        phpWrap.innerHTML = `
            <div style="color:#7ecfff;font-size:13px;font-weight:bold;margin-bottom:6px;">⚓ McArchie</div>
            <div style="background:#001020;border-radius:6px;height:14px;overflow:hidden;border:1px solid #0a3a5a;">
                <div id="player-hp-bar" style="height:100%;width:100%;background:linear-gradient(90deg,#0055aa,#44aaff);border-radius:6px;transition:width 0.2s;"></div>
            </div>
            <div id="player-hp-text" style="color:#aaddff;font-size:11px;margin-top:4px;text-align:right;">100 / 100</div>
        `;
        document.body.appendChild(phpWrap);

        /* ---- controls hint ---- */
        const instructions = document.createElement('div');
        instructions.id = 'boss-instructions';
        instructions.style.cssText = `
            position: fixed;
            bottom: 22px;
            right: 20px;
            background: rgba(10,5,0,0.8);
            border: 1px solid #6b4a00;
            border-radius: 8px;
            padding: 10px 14px;
            color: #c8a44a;
            font-family: 'Georgia', serif;
            font-size: 12px;
            z-index: 9999;
            line-height: 1.8;
        `;
        instructions.innerHTML = `
            <div style="color:#f5d060;font-weight:bold;margin-bottom:4px;">Controls</div>
            WASD — Move<br>
            F — Attack (pick up sword first!)<br>
            Dodge cannonballs to survive!
        `;
        document.body.appendChild(instructions);

        /* ---- win/lose popup ---- */
        this.resultPopup = document.createElement('div');
        this.resultPopup.id = 'boss-result-popup';
        this.resultPopup.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #0a0a2d, #1a1a0a);
            border: 3px solid #c8a44a;
            border-radius: 18px;
            padding: 40px 54px;
            text-align: center;
            z-index: 99999;
            box-shadow: 0 0 50px rgba(200,164,74,0.4);
            font-family: 'Georgia', serif;
            min-width: 360px;
        `;
        document.body.appendChild(this.resultPopup);

        /* ---- score ---- */
        this.score   = 0;
        this.scoreEl = null;
        const scoreDiv = document.createElement('div');
        scoreDiv.id = 'boss-score';
        scoreDiv.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            color: #f5d060;
            font-family: 'Georgia', serif;
            font-size: 14px;
            z-index: 9999;
            text-shadow: 0 0 8px rgba(255,200,0,0.4);
        `;
        scoreDiv.textContent = 'Score: 0';
        document.body.appendChild(scoreDiv);
        this.scoreEl = scoreDiv;

        this.spawnX = 650;
        this.spawnY = 430;

        /* ============ BACKGROUND ============ */
        const bgData = {
            name: 'boss_ship_bg',
            src: path + '/images/gamebuilder/bg/Ship.jpg',
            pixels: { height: 600, width: 800 }
        };

        /* ============ PLAYER ============ */
        const playerData = {
            id: 'mcarchie',
            src: path + '/images/gamebuilder/sprites/mcarchie.png',
            SCALE_FACTOR: 6,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 30,
            INIT_POSITION: { x: this.spawnX, y: this.spawnY },
            pixels: { height: 256, width: 256 },
            orientation: { rows: 4, columns: 4 },
            down:      { row: 0, start: 0, columns: 4 },
            downRight: { row: 2, start: 0, columns: 3, rotate:  Math.PI / 16 },
            downLeft:  { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
            right:     { row: 2, start: 0, columns: 4 },
            left:      { row: 1, start: 0, columns: 4 },
            up:        { row: 3, start: 0, columns: 4 },
            upRight:   { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
            upLeft:    { row: 1, start: 0, columns: 3, rotate:  Math.PI / 16 },
            hitbox:  { widthPercentage: 0.45, heightPercentage: 0.2 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        /* ============ BOSS ============ */
        const bossData = {
            id: 'Blackbread',
            src: path + '/images/gamebuilder/sprites/Pirate.png',
            SCALE_FACTOR: 0.55,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 10,
            INIT_POSITION: { x: width * 0.45, y: height * 0.28 },
            pixels: { height: 395, width: 632 },
            orientation: { rows: 1, columns: 1 },
            down: { row: 0, start: 0, columns: 1 },
            direction: 'right',
            HP: 300,
            SPEED: 1.2,
            zIndex: 20
        };

        /* ============ NPC: Sword pickup ============ */
        const swordData = {
            id: 'Sword',
            greeting: 'A cutlass...',
            src: path + '/images/gamebuilder/sprites/key.png',
            SCALE_FACTOR: 14,
            ANIMATION_RATE: 1000000008,
            INIT_POSITION: { x: 200, y: height * 0.6 },
            pixels: { width: 376, height: 699 },
            orientation: { rows: 1, columns: 1 },
            crop: { x: 324, y: 160, width: 376, height: 699 },
            transparentColor: { r: 0, g: 0, b: 0 },
            down: { row: 0, start: 0, columns: 1 },
            hitbox: { widthPercentage: 0.15, heightPercentage: 0.02 },
            dialogues: ['Cutlass acquired! Press F to slash Blackbread!'],
            interact: function() {
                if (this.dialogueSystem && this.dialogueSystem.isDialogueOpen()) {
                    this.dialogueSystem.closeDialogue();
                    return;
                }
                if (this.dialogueSystem) {
                    this.dialogueSystem.showDialogue(
                        'Cutlass acquired! Press F to slash Blackbread!',
                        this.spriteData.id,
                        this.spriteData.src
                    );
                    window._bossLevelSwordCollected = true;
                }
            }
        };

        /* ============ LEVEL OBJECTS ============ */
        this.classes = [
            { class: GameEnvBackground, data: bgData     },
            { class: Player,            data: playerData },
            { class: BlackbreadBoss,    data: bossData   },
            { class: Npc,               data: swordData  }
        ];
    }

    _addScore(pts) {
        this.score += pts;
        if (this.scoreEl) this.scoreEl.textContent = 'Score: ' + this.score;
    }

    _showResult(won) {
        this.wonGame = true;
        const popup = this.resultPopup;
        popup.style.borderColor = won ? '#c8a44a' : '#8b0000';
        popup.innerHTML = won ? `
            <div style="font-size:52px;margin-bottom:8px;">☠️🦜</div>
            <div style="color:#f5d060;font-size:28px;font-weight:bold;text-shadow:0 0 12px #f5d060;margin-bottom:12px;">Victory!</div>
            <div style="color:#c8e8c8;font-size:15px;line-height:1.9;margin-bottom:22px;">
                McArchie defeats Blackbread!<br>
                <span style="color:#ff8844;">The seas belong to you now.</span><br>
                <span style="color:#f5d060;">Score: ${this.score}</span>
            </div>
            <button id="boss-result-btn" style="background:#6b3d00;color:#f5d060;border:2px solid #c8a44a;padding:11px 28px;font-size:16px;font-family:Georgia,serif;border-radius:8px;cursor:pointer;letter-spacing:1px;">Close ✕</button>
        ` : `
            <div style="font-size:52px;margin-bottom:8px;">💀</div>
            <div style="color:#cc3300;font-size:28px;font-weight:bold;text-shadow:0 0 12px #cc3300;margin-bottom:12px;">Defeated!</div>
            <div style="color:#ffaaaa;font-size:15px;line-height:1.9;margin-bottom:22px;">
                Blackbread crushes McArchie...<br>
                <span style="color:#aaaaaa;">Return when you are stronger.</span>
            </div>
            <button id="boss-result-btn" style="background:#3d0000;color:#ffaaaa;border:2px solid #8b0000;padding:11px 28px;font-size:16px;font-family:Georgia,serif;border-radius:8px;cursor:pointer;letter-spacing:1px;">Close ✕</button>
        `;
        popup.style.display = 'block';
        document.getElementById('boss-result-btn').onclick = () => {
            popup.style.display = 'none';
        };
    }

    _rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    /* ============ MAIN GAME LOOP HOOK ============ */
    update() {
        if (!this.gameEnv || !this.gameEnv.gameObjects) return;

        let player = null;
        let boss   = null;

        this.gameEnv.gameObjects.forEach(obj => {
            if (obj?.constructor?.name === 'Player') player = obj;
            if (obj instanceof BlackbreadBoss)       boss   = obj;
        });

        if (!player || !boss || this.wonGame) return;

        const px = player.position.x, py = player.position.y;
        const pw = player.width  || 30,  ph = player.height || 40;
        const bx = boss.position.x,   by = boss.position.y;
        const bw = boss.width  || 80,  bh = boss.height || 100;

        /* --- player melee attack (F key) --- */
        if (window._bossLevelSwordCollected) {
            const fPressed = this.gameEnv.keys?.['KeyF'] || this.gameEnv.keys?.[70];
            if (fPressed && !this._attackCooldown) {
                this._attackCooldown = 40;
                const inRange = this._rectsOverlap(px - 40, py - 20, pw + 80, ph + 40, bx, by, bw, bh);
                if (inRange) {
                    const dmg = boss.phase === 3 ? 12 : boss.phase === 2 ? 18 : 25;
                    boss.hp = Math.max(0, boss.hp - dmg);
                    this._addScore(dmg * 2);
                    if (boss.hp <= 0) {
                        this._showResult(true);
                        return;
                    }
                }
            }
        }
        if (this._attackCooldown > 0) this._attackCooldown--;

        /* --- cannonball hits player --- */
        if (this.invincTimer <= 0) {
            for (let i = boss.cannonballs.length - 1; i >= 0; i--) {
                const cb = boss.cannonballs[i];
                if (this._rectsOverlap(px, py, pw, ph, cb.x - cb.radius, cb.y - cb.radius, cb.radius * 2, cb.radius * 2)) {
                    const dmg = boss.phase === 3 ? 18 : boss.phase === 2 ? 12 : 8;
                    this.playerHp = Math.max(0, this.playerHp - dmg);
                    this.invincTimer = 55;
                    boss.cannonballs.splice(i, 1);

                    const bar  = document.getElementById('player-hp-bar');
                    const text = document.getElementById('player-hp-text');
                    if (bar)  bar.style.width = (this.playerHp / this.playerMaxHp * 100) + '%';
                    if (text) text.textContent = Math.round(this.playerHp) + ' / ' + this.playerMaxHp;
                    if (bar)  bar.style.background =
                        this.playerHp < 25 ? 'linear-gradient(90deg,#550000,#dd0000)' :
                        this.playerHp < 50 ? 'linear-gradient(90deg,#664400,#ffaa00)' :
                                             'linear-gradient(90deg,#0055aa,#44aaff)';

                    if (this.playerHp <= 0) {
                        this._showResult(false);
                        /* reset for retry */
                        player.position.x = this.spawnX;
                        player.position.y = this.spawnY;
                        this.playerHp     = this.playerMaxHp;
                        if (bar)  bar.style.width = '100%';
                        if (text) text.textContent = this.playerMaxHp + ' / ' + this.playerMaxHp;
                        if (bar)  bar.style.background = 'linear-gradient(90deg,#0055aa,#44aaff)';
                    }
                    break;
                }
            }
        }
        if (this.invincTimer > 0) this.invincTimer--;

        /* --- boss body pushes player back --- */
        if (this._rectsOverlap(px, py, pw, ph, bx, by, bw, bh)) {
            if (player.velocity) {
                player.position.x -= player.velocity.x || 0;
                player.position.y -= player.velocity.y || 0;
            }
        }
    }

    draw()   {}
    resize() {}

    destroy() {
        ['boss-hud', 'player-boss-hud', 'boss-instructions',
         'boss-result-popup', 'boss-score', 'boss-phase-flash'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        delete this.gameEnv._showPhaseMsg;
        delete window._bossLevelSwordCollected;
    }
}

export default GameLevelPirateBoss;