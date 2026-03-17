import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Character from './essentials/Character.js';
import Npc from './essentials/Npc.js';

// ── Boss character — mirrors Wolf from level2.js exactly ─────────────────────
class BlackbreadBoss extends Character {
    constructor(data, gameEnv) {
        super(data, gameEnv);
        this.velocity    = { x: 0, y: 0 };
        this.speed       = data.SPEED || 1.0;
        this.patrolAngle = 0;
        this.attackTimer = 0;
        this.attackCycle = 180;
        this.cannonballs = [];
    }

    update() {
        const W = this.gameEnv.innerWidth;
        const H = this.gameEnv.innerHeight;

        // Orbit the centre of the screen
        this.patrolAngle += 0.010;
        const r = Math.min(W, H) * 0.28;
        this.position.x = W / 2 + Math.cos(this.patrolAngle) * r - (this.width  || 80)  / 2;
        this.position.y = H / 2 + Math.sin(this.patrolAngle) * r - (this.height || 100) / 2;

        // Fire cannonballs toward the player
        this.attackTimer++;
        if (this.attackTimer >= this.attackCycle) {
            this.attackTimer = 0;
            this._fire();
        }

        this._tickCannonballs();
        this.draw();
    }

    _fire() {
        let player = null;
        this.gameEnv.gameObjects?.forEach(o => {
            if (o?.constructor?.name === 'Player') player = o;
        });
        if (!player?.position) return;

        const bx  = this.position.x + (this.width  || 80)  / 2;
        const by  = this.position.y + (this.height || 100) / 2;
        const px  = player.position.x + (player.width  || 30) / 2;
        const py  = player.position.y + (player.height || 40) / 2;
        const dx  = px - bx, dy = py - by;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        const spd = 3.5;

        this.cannonballs.push({ x: bx, y: by, vx: dx / mag * spd, vy: dy / mag * spd, life: 140, r: 9 });
    }

    _tickCannonballs() {
        const ctx = this.gameEnv.ctx;
        const W   = this.gameEnv.innerWidth;
        const H   = this.gameEnv.innerHeight;
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
            ctx.beginPath();
            ctx.arc(cb.x, cb.y, cb.r, 0, Math.PI * 2);
            ctx.fillStyle = '#ff6600';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cb.x - cb.vx * 1.5, cb.y - cb.vy * 1.5, cb.r * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,140,0,0.3)';
            ctx.fill();
        }
        ctx.restore();
    }
}

// ── Level class — mirrors GameLevelPirateMegaGame2 structure exactly ─────────
class GameLevelPirateBoss {
    constructor(gameEnv) {
        const width  = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;
        const path   = gameEnv.path;

        this.gameEnv      = gameEnv;
        this.continue     = true;
        this.wonGame      = false;
        this.invincTimer  = 0;
        this.atkCooldown  = 0;
        this.bossPhase    = 1;
        this.playerMaxHp  = 100;
        this.playerHp     = 100;
        this.bossMaxHp    = 300;
        this.bossHp       = 300;
        this.spawnX       = 650;
        this.spawnY       = 430;

        // ── Boss HP bar (top-centre) ──────────────────────────────────────
        const bossHud = document.createElement('div');
        bossHud.id = 'boss-hud';
        bossHud.style.cssText = `
            position:fixed;top:16px;left:50%;transform:translateX(-50%);
            width:320px;background:rgba(10,5,0,0.88);border:2px solid #8b0000;
            border-radius:10px;padding:10px 16px 12px;z-index:9999;
            font-family:'Georgia',serif;box-shadow:0 0 20px rgba(180,0,0,0.4);
        `;
        bossHud.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#ff6644;font-size:14px;font-weight:bold;">☠ Blackbread</span>
                <span id="boss-phase-lbl" style="color:#ffaa44;font-size:12px;font-style:italic;">Phase I</span>
            </div>
            <div style="background:#1a0000;border-radius:6px;height:16px;overflow:hidden;border:1px solid #550000;">
                <div id="boss-hp-fill" style="height:100%;width:100%;background:#dd2200;border-radius:6px;transition:width .15s;"></div>
            </div>
            <div id="boss-hp-txt" style="color:#ffaaaa;font-size:11px;margin-top:3px;text-align:right;">300 / 300</div>
        `;
        document.body.appendChild(bossHud);

        // ── Player HP bar (bottom-left) ───────────────────────────────────
        const playerHud = document.createElement('div');
        playerHud.id = 'player-hud';
        playerHud.style.cssText = `
            position:fixed;bottom:22px;left:20px;width:190px;
            background:rgba(0,10,20,0.88);border:2px solid #1a6aaa;
            border-radius:10px;padding:10px 14px 12px;z-index:9999;
            font-family:'Georgia',serif;
        `;
        playerHud.innerHTML = `
            <div style="color:#7ecfff;font-size:13px;font-weight:bold;margin-bottom:6px;">⚓ McArchie</div>
            <div style="background:#001020;border-radius:6px;height:13px;overflow:hidden;border:1px solid #0a3a5a;">
                <div id="player-hp-fill" style="height:100%;width:100%;background:#3388ff;border-radius:6px;transition:width .15s;"></div>
            </div>
            <div id="player-hp-txt" style="color:#aaddff;font-size:11px;margin-top:3px;text-align:right;">100 / 100</div>
        `;
        document.body.appendChild(playerHud);

        // ── Controls hint (bottom-right) ──────────────────────────────────
        const hint = document.createElement('div');
        hint.id = 'boss-hint';
        hint.style.cssText = `
            position:fixed;bottom:22px;right:20px;background:rgba(10,5,0,0.8);
            border:1px solid #6b4a00;border-radius:8px;padding:10px 14px;
            color:#c8a44a;font-family:'Georgia',serif;font-size:12px;
            z-index:9999;line-height:1.8;
        `;
        hint.innerHTML = `
            <div style="color:#f5d060;font-weight:bold;margin-bottom:4px;">Controls</div>
            WASD — Move<br>
            Pick up the sword, then press F to attack!
        `;
        document.body.appendChild(hint);

        // ── Phase flash ───────────────────────────────────────────────────
        const flash = document.createElement('div');
        flash.id = 'boss-flash';
        flash.style.cssText = `
            position:fixed;top:42%;left:50%;transform:translateX(-50%);
            color:#ff4400;font-family:'Georgia',serif;font-size:1.8rem;
            text-shadow:0 0 14px #ff2200;opacity:0;pointer-events:none;
            transition:opacity .3s;z-index:99999;white-space:nowrap;
        `;
        document.body.appendChild(flash);

        // ── Result popup ──────────────────────────────────────────────────
        const popup = document.createElement('div');
        popup.id = 'boss-popup';
        popup.style.cssText = `
            display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            background:linear-gradient(135deg,#0a0a2d,#1a1a0a);border:3px solid #c8a44a;
            border-radius:18px;padding:40px 54px;text-align:center;z-index:99999;
            box-shadow:0 0 50px rgba(200,164,74,0.4);font-family:'Georgia',serif;min-width:340px;
        `;
        document.body.appendChild(popup);

        // ── Sprites ───────────────────────────────────────────────────────

        const bgData = {
            name: 'boss_bg',
            src: path + '/images/gamebuilder/bg/Ship.jpg',
            pixels: { height: 600, width: 800 }
        };

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

        const bossData = {
            id: 'Blackbread',
            src: path + '/images/gamebuilder/sprites/Pirate.png',
            SCALE_FACTOR: 0.6,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 10,
            INIT_POSITION: { x: width * 0.45, y: height * 0.28 },
            pixels: { height: 395, width: 632 },
            orientation: { rows: 1, columns: 1 },
            down: { row: 0, start: 0, columns: 1 },
            direction: 'right',
            SPEED: 1.0,
            zIndex: 20
        };

        const swordData = {
            id: 'Cutlass',
            greeting: 'A cutlass...',
            src: path + '/images/gamebuilder/sprites/key.png',
            SCALE_FACTOR: 14,
            ANIMATION_RATE: 1000000008,
            INIT_POSITION: { x: 180, y: height * 0.6 },
            pixels: { width: 376, height: 699 },
            orientation: { rows: 1, columns: 1 },
            crop: { x: 324, y: 160, width: 376, height: 699 },
            transparentColor: { r: 0, g: 0, b: 0 },
            down: { row: 0, start: 0, columns: 1 },
            hitbox: { widthPercentage: 0.15, heightPercentage: 0.02 },
            dialogues: ['Cutlass acquired! Press F near the boss to attack!'],
            interact: function () {
                if (this.dialogueSystem?.isDialogueOpen()) {
                    this.dialogueSystem.closeDialogue();
                    return;
                }
                if (this.dialogueSystem) {
                    this.dialogueSystem.showDialogue(
                        'Cutlass acquired! Press F near the boss to attack!',
                        this.spriteData.id,
                        this.spriteData.src
                    );
                    window._pirateBossSword = true;
                }
            }
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData     },
            { class: Player,            data: playerData },
            { class: BlackbreadBoss,    data: bossData   },
            { class: Npc,               data: swordData  }
        ];
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    _overlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    _setPlayerHp(hp) {
        this.playerHp = Math.max(0, Math.min(this.playerMaxHp, hp));
        const pct  = this.playerHp / this.playerMaxHp * 100;
        const fill = document.getElementById('player-hp-fill');
        const txt  = document.getElementById('player-hp-txt');
        if (fill) {
            fill.style.width      = pct + '%';
            fill.style.background = pct < 25 ? '#dd0000' : pct < 50 ? '#ffaa00' : '#3388ff';
        }
        if (txt) txt.textContent = Math.round(this.playerHp) + ' / ' + this.playerMaxHp;
    }

    _setBossHp(hp) {
        this.bossHp = Math.max(0, hp);
        const pct  = this.bossHp / this.bossMaxHp * 100;
        const fill = document.getElementById('boss-hp-fill');
        const txt  = document.getElementById('boss-hp-txt');
        const lbl  = document.getElementById('boss-phase-lbl');
        if (fill) {
            fill.style.width      = pct + '%';
            fill.style.background =
                this.bossPhase === 3 ? '#cc00ff' :
                this.bossPhase === 2 ? '#ff6600' : '#dd2200';
        }
        if (txt) txt.textContent = Math.round(this.bossHp) + ' / ' + this.bossMaxHp;
        if (lbl) lbl.textContent =
            this.bossPhase === 3 ? 'Phase III — ENRAGED' :
            this.bossPhase === 2 ? 'Phase II — Aggressive' : 'Phase I';
    }

    _flash(msg) {
        const el = document.getElementById('boss-flash');
        if (!el) return;
        el.textContent  = msg;
        el.style.opacity = '1';
        clearTimeout(this._flashTimer);
        this._flashTimer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
    }

    _showResult(won) {
        this.wonGame = true;
        const popup = document.getElementById('boss-popup');
        if (!popup) return;
        popup.innerHTML = won ? `
            <div style="font-size:52px;margin-bottom:8px;">☠️🦜</div>
            <div style="color:#f5d060;font-size:26px;font-weight:bold;margin-bottom:12px;">Victory!</div>
            <div style="color:#c8e8c8;font-size:15px;line-height:1.9;margin-bottom:22px;">
                McArchie defeats Blackbread!<br>
                <span style="color:#ff8844;">The seas belong to you now.</span>
            </div>
            <button id="boss-popup-btn" style="background:#6b3d00;color:#f5d060;border:2px solid #c8a44a;padding:11px 28px;font-size:16px;font-family:Georgia,serif;border-radius:8px;cursor:pointer;">Close ✕</button>
        ` : `
            <div style="font-size:52px;margin-bottom:8px;">💀</div>
            <div style="color:#cc3300;font-size:26px;font-weight:bold;margin-bottom:12px;">Defeated!</div>
            <div style="color:#ffaaaa;font-size:15px;line-height:1.9;margin-bottom:22px;">
                Blackbread crushes McArchie...<br>
                <span style="color:#aaaaaa;">Return when you are stronger.</span>
            </div>
            <button id="boss-popup-btn" style="background:#3d0000;color:#ffaaaa;border:2px solid #8b0000;padding:11px 28px;font-size:16px;font-family:Georgia,serif;border-radius:8px;cursor:pointer;">Close ✕</button>
        `;
        popup.style.display = 'block';
        document.getElementById('boss-popup-btn').onclick = () => {
            popup.style.display = 'none';
        };
    }

    // ── main update called every frame by the engine ──────────────────────────
    update() {
        if (!this.gameEnv?.gameObjects || this.wonGame) return;

        let player = null;
        let boss   = null;

        this.gameEnv.gameObjects.forEach(obj => {
            if (obj?.constructor?.name === 'Player') player = obj;
            if (obj instanceof BlackbreadBoss)       boss   = obj;
        });

        if (!player?.position || !boss?.position) return;

        const px = player.position.x, py = player.position.y;
        const pw = player.width  || 30,  ph = player.height || 40;
        const bx = boss.position.x,      by = boss.position.y;
        const bw = boss.width    || 80,  bh = boss.height   || 100;

        // ── Phase transitions ─────────────────────────────────────────────
        const ratio    = this.bossHp / this.bossMaxHp;
        const newPhase = ratio > 0.6 ? 1 : ratio > 0.3 ? 2 : 3;
        if (newPhase !== this.bossPhase) {
            this.bossPhase   = newPhase;
            boss.speed       = newPhase === 3 ? 2.2 : newPhase === 2 ? 1.5 : 1.0;
            boss.attackCycle = newPhase === 3 ? 75  : newPhase === 2 ? 120  : 180;
            this._flash(newPhase === 3
                ? '☠ FINAL PHASE — BLACKBREAD ENRAGED!'
                : '⚠ PHASE 2 — Blackbread grows violent!');
        }

        // ── Player attacks with F ─────────────────────────────────────────
        if (this.atkCooldown > 0) this.atkCooldown--;

        if (window._pirateBossSword && this.atkCooldown === 0) {
            const fDown = this.gameEnv.keys?.['KeyF'] || this.gameEnv.keys?.[70] || false;
            if (fDown) {
                this.atkCooldown = 35;
                const inRange = this._overlap(px - 50, py - 30, pw + 100, ph + 60, bx, by, bw, bh);
                if (inRange) {
                    const dmg = this.bossPhase === 3 ? 10 : this.bossPhase === 2 ? 16 : 22;
                    this._setBossHp(this.bossHp - dmg);
                    if (this.bossHp <= 0) { this._showResult(true); return; }
                }
            }
        }

        // ── Cannonballs hit player ────────────────────────────────────────
        if (this.invincTimer > 0) {
            this.invincTimer--;
        } else {
            for (let i = boss.cannonballs.length - 1; i >= 0; i--) {
                const cb = boss.cannonballs[i];
                if (this._overlap(px, py, pw, ph,
                                  cb.x - cb.r, cb.y - cb.r, cb.r * 2, cb.r * 2)) {
                    const dmg = this.bossPhase === 3 ? 18 : this.bossPhase === 2 ? 12 : 8;
                    this._setPlayerHp(this.playerHp - dmg);
                    this.invincTimer = 55;
                    boss.cannonballs.splice(i, 1);
                    if (this.playerHp <= 0) {
                        this._showResult(false);
                        player.position.x = this.spawnX;
                        player.position.y = this.spawnY;
                        this._setPlayerHp(this.playerMaxHp);
                    }
                    break;
                }
            }
        }
    }

    draw()   {}
    resize() {}

    destroy() {
        ['boss-hud', 'player-hud', 'boss-hint', 'boss-flash', 'boss-popup'].forEach(id => {
            document.getElementById(id)?.remove();
        });
        delete window._pirateBossSword;
    }
}

export default GameLevelPirateBoss;