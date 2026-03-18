import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Character from './essentials/Character.js';
import Npc from './essentials/Npc.js';

/* ================================================================
   Undertale / Pokemon-style boss fight — McArchie vs Blackbread
   Layout:
     TOP 58% of screen  → battle field (Ship.jpg shows through)
       - Boss sprite LARGE top-right
       - Boss HP info box top-left
       - Player sprite LARGE bottom-left of top area
       - Player HP info box bottom-right of top area
     BOTTOM 42% of screen → solid dark UI panel
       - MENU / MESSAGE / BOSS_TURN dodge box all live here
   ================================================================ */

class GameLevelPirateBoss {
    constructor(gameEnv) {
        const path = gameEnv.path;
        this.gameEnv = gameEnv;
        this.continue = true;

        // ── game state ──────────────────────────────────────────────────
        this.state        = 'INTRO';
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
        this.menuIndex    = 0;
        this.attackTimer  = 0;
        this.attackDur    = 200;
        this.messageQueue = [];
        this.currentMsg   = '';
        this.msgTimer     = 0;
        this.itemUsed     = false;
        this._bossHitFlash = 0;
        this.currentPattern = 0;
        this.box = { x: 0, y: 0, w: 260, h: 180 };

        // ── canvas overlay ──────────────────────────────────────────────
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'ut-battle-canvas';
        this.canvas.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            z-index:5000;pointer-events:none;image-rendering:pixelated;
        `;
        document.body.appendChild(this.canvas);
        this.ctx2 = this.canvas.getContext('2d');

        // ── key tracking ────────────────────────────────────────────────
        this.keys = {};
        this._keyDown = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                 'KeyW','KeyA','KeyS','KeyD','KeyZ','KeyX',
                 'Enter','Space'].includes(e.code)) e.stopPropagation();
            this.keys[e.code] = true;
            this._handleMenuKey(e.code);
        };
        this._keyUp = (e) => { this.keys[e.code] = false; };
        window.addEventListener('keydown', this._keyDown);
        window.addEventListener('keyup',   this._keyUp);

        // ── load sprites ────────────────────────────────────────────────
        this.bossImg   = new Image();
        this.bossImg.src = path + '/images/gamebuilder/sprites/Pirate.png';
        this.playerImg = new Image();
        this.playerImg.src = path + '/images/gamebuilder/sprites/mcarchie.png';

        // ── start intro ─────────────────────────────────────────────────
        this._queueMessages([
            '* A ferocious pirate blocks your path!',
            '* BLACKBREAD appeared!',
            '* His eyes glow with fury...',
        ], () => { this.state = 'MENU'; });

        // ── background/player objects (engine needs at least these) ─────
        const bgData = {
            name: 'boss_bg',
            src: path + '/images/gamebuilder/bg/Ship.jpg',
            pixels: { height: 600, width: 800 }
        };
        const playerData = {
            id: 'mcarchie',
            src: path + '/images/gamebuilder/sprites/mcarchie.png',
            SCALE_FACTOR: 9999,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 30,
            INIT_POSITION: { x: -9999, y: -9999 },
            pixels: { height: 256, width: 256 },
            orientation: { rows: 4, columns: 4 },
            down: { row: 0, start: 0, columns: 4 },
            right:{ row: 2, start: 0, columns: 4 },
            left: { row: 1, start: 0, columns: 4 },
            up:   { row: 3, start: 0, columns: 4 },
            hitbox: { widthPercentage: 0.01, heightPercentage: 0.01 },
            keypress: { up: 0, left: 0, down: 0, right: 0 }
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
            if (code === 'KeyZ' || code === 'Enter' || code === 'Space') this._nextMessage();
            return;
        }
        if (this.state === 'MENU') {
            if (code === 'ArrowLeft')  this.menuIndex = (this.menuIndex + 3) % 4;
            if (code === 'ArrowRight') this.menuIndex = (this.menuIndex + 1) % 4;
            if (code === 'KeyZ' || code === 'Enter') this._selectMenu();
        }
    }
    _selectMenu() {
        const opts   = ['FIGHT','ACT','ITEM','MERCY'];
        const choice = opts[this.menuIndex];
        if (choice === 'FIGHT') {
            const dmg = this.bossPhase === 3 ? 8  + Math.floor(Math.random()*8)
                      : this.bossPhase === 2 ? 14 + Math.floor(Math.random()*10)
                                              : 20 + Math.floor(Math.random()*12);
            this.bossHp = Math.max(0, this.bossHp - dmg);
            this._bossHitFlash = 12;
            if (this.bossHp <= 0) {
                this._queueMessages([
                    '* McArchie strikes the finishing blow!',
                    '* "...Well played, ye scurvy dog."',
                    '* BLACKBREAD was defeated!'
                ], () => { this.state = 'WIN'; });
            } else {
                this._queueMessages([
                    `* McArchie slashes with the cutlass!`,
                    `* Blackbread took ${dmg} damage!`
                ], () => { this._startBossTurn(); });
            }
        } else if (choice === 'ACT') {
            const acts = [
                '* McArchie checks Blackbread.\n* He looks weakened but furious.',
                '* McArchie taunts the pirate!\n* Blackbread\'s rage grows!',
                '* McArchie compliments the hat.\n* Blackbread is briefly flattered...',
            ];
            this._queueMessages([acts[Math.floor(Math.random()*acts.length)]], () => { this._startBossTurn(); });
        } else if (choice === 'ITEM') {
            if (!this.itemUsed) {
                this.itemUsed = true;
                const heal = 40;
                this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
                this._queueMessages([`* McArchie used a Grog Flask!`, `* Recovered ${heal} HP!`], () => { this._startBossTurn(); });
            } else {
                this._queueMessages(['* No items left!'], () => { this.state = 'MENU'; });
            }
        } else if (choice === 'MERCY') {
            this._queueMessages([
                '* McArchie tries to spare Blackbread.',
                '* "SPARE?! I\'m BLACKBREAD! Never!"',
                '* The fight continues...'
            ], () => { this._startBossTurn(); });
        }
    }

    // ── boss turn ────────────────────────────────────────────────────────────
    _startBossTurn() {
        this.turnCount++;
        this._checkPhase();
        const W = this.canvas.width, H = this.canvas.height;
        // place dodge box in the lower UI panel, centred
        this.box.x = W / 2 - this.box.w / 2;
        this.box.y = H * 0.61 + (H * 0.36 - this.box.h) / 2;
        this.soulX = this.box.x + this.box.w / 2;
        this.soulY = this.box.y + this.box.h / 2;
        this.bullets      = [];
        this.attackTimer  = 0;
        this.state        = 'BOSS_TURN';
        const patterns = this.bossPhase === 1 ? [0,1] : this.bossPhase === 2 ? [0,1,2] : [0,1,2,3];
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
        const ratio    = this.bossHp / this.bossMaxHp;
        const newPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
        if (newPhase !== this.bossPhase) {
            this.bossPhase = newPhase;
            const msgs = newPhase === 2
                ? ['* Blackbread\'s eye glows red!','* His attacks are faster now!']
                : ['* Blackbread ROARS in fury!','* Everything is shaking!'];
            this.messageQueue = [...msgs, ...this.messageQueue];
        }
    }

    // ── bullet patterns ──────────────────────────────────────────────────────
    _spawnBullet(x,y,vx,vy,r=6,color='#ff4444',type='circle') {
        this.bullets.push({x,y,vx,vy,r,color,type,life:300});
    }
    _spawnCannonPattern(t) {
        const box = this.box;
        if (t % 30 === 0) {
            const side = Math.random()<0.5?'left':'right';
            const y    = box.y + 20 + Math.random()*(box.h-40);
            this._spawnBullet(side==='left'?box.x-10:box.x+box.w+10, y, side==='left'?3.5:-3.5, 0, 7, '#ff6600');
        }
        if (t % 45 === 0) {
            const x = box.x + 20 + Math.random()*(box.w-40);
            this._spawnBullet(x, box.y-10, 0, 3.2, 6, '#ffaa00');
        }
    }
    _spawnCutlassPattern(t) {
        const box = this.box;
        if (t % 20 === 0) {
            const top = Math.random()<0.5;
            for (let i=0;i<4;i++) {
                const x = box.x+(box.w/5)*i+10;
                this._spawnBullet(x, top?box.y-8:box.y+box.h+8, (Math.random()-0.5)*1.5, top?4:-4, 5, '#ff2222','diamond');
            }
        }
    }
    _spawnStormPattern(t) {
        const box = this.box;
        if (t % 25 === 0) {
            const cx=box.x+box.w/2, cy=box.y+box.h/2, num=6, off=(t/25)*0.4;
            for (let i=0;i<num;i++) {
                const a=(i/num)*Math.PI*2+off;
                this._spawnBullet(cx,cy,Math.cos(a)*2.8,Math.sin(a)*2.8,5,'#cc44ff');
            }
        }
    }
    _spawnRagePattern(t) {
        const box = this.box;
        if (t % 15 === 0) this._spawnBullet(box.x+Math.random()*box.w, box.y-8, (Math.random()-0.5)*2, 5, 6, '#ff0000');
        if (t % 18 === 0) {
            const y = box.y+Math.random()*box.h;
            this._spawnBullet(box.x-8, y, 5, (Math.random()-0.5)*2, 6, '#ff4400');
            this._spawnBullet(box.x+box.w+8, y, -5, (Math.random()-0.5)*2, 6, '#ff4400');
        }
        if (t % 30 === 0) {
            const cx=box.x+box.w/2, cy=box.y+box.h/2;
            for (let i=0;i<8;i++) {
                const a=(i/8)*Math.PI*2+t*0.05;
                this._spawnBullet(cx,cy,Math.cos(a)*3.5,Math.sin(a)*3.5,5,'#ffff00');
            }
        }
    }

    // ── update dodge turn ────────────────────────────────────────────────────
    _updateBossTurn() {
        const t=this.attackTimer, box=this.box;
        if      (this.currentPattern===0) this._spawnCannonPattern(t);
        else if (this.currentPattern===1) this._spawnCutlassPattern(t);
        else if (this.currentPattern===2) this._spawnStormPattern(t);
        else if (this.currentPattern===3) this._spawnRagePattern(t);

        const spd = this.soulSpd;
        if (this.keys['ArrowLeft'] ||this.keys['KeyA']) this.soulX -= spd;
        if (this.keys['ArrowRight']||this.keys['KeyD']) this.soulX += spd;
        if (this.keys['ArrowUp']   ||this.keys['KeyW']) this.soulY -= spd;
        if (this.keys['ArrowDown'] ||this.keys['KeyS']) this.soulY += spd;
        this.soulX = Math.max(box.x+8, Math.min(box.x+box.w-8, this.soulX));
        this.soulY = Math.max(box.y+8, Math.min(box.y+box.h-8, this.soulY));

        if (this.invincFrames>0) this.invincFrames--;
        for (let i=this.bullets.length-1;i>=0;i--) {
            const b=this.bullets[i];
            b.x+=b.vx; b.y+=b.vy; b.life--;
            if (b.life<=0||b.x<box.x-20||b.x>box.x+box.w+20||b.y<box.y-20||b.y>box.y+box.h+20) {
                this.bullets.splice(i,1); continue;
            }
            if (this.invincFrames===0) {
                const dx=b.x-this.soulX, dy=b.y-this.soulY;
                if (Math.sqrt(dx*dx+dy*dy)<b.r+5) {
                    const dmg=this.bossPhase===3?12:this.bossPhase===2?8:5;
                    this.playerHp=Math.max(0,this.playerHp-dmg);
                    this.invincFrames=40;
                    this.bullets.splice(i,1);
                    if (this.playerHp<=0) { this.state='LOSE'; return; }
                }
            }
        }
        this.attackTimer++;
        if (this.attackTimer>=this.attackDur) {
            this.bullets=[]; this.state='MENU';
        }
    }

    // ── RENDER ───────────────────────────────────────────────────────────────
    _render() {
        const cv  = this.canvas;
        const ctx = this.ctx2;
        cv.width  = window.innerWidth;
        cv.height = window.innerHeight;
        const W = cv.width, H = cv.height;
        const splitY = H * 0.58; // divider between battle area and UI panel

        ctx.clearRect(0, 0, W, H);

        // ── TOP BATTLE AREA — subtle tint so Ship.jpg is visible ─────────
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, W, splitY);

        // ── BOTTOM UI PANEL — solid dark ─────────────────────────────────
        ctx.fillStyle = '#0d0d18';
        ctx.fillRect(0, splitY, W, H - splitY);
        // white divider line
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, splitY, W, 3);

        // ══════════════════════════════════════════════════════════════
        // BOSS SPRITE — large, top-RIGHT of battle area
        // ══════════════════════════════════════════════════════════════
        const bossW = Math.min(W * 0.48, splitY * 1.3);
        const bossH = bossW * (395 / 632);
        const bossX = W * 0.52;
        const bossY = splitY - bossH - 10;  // sit on the divider line

        // platform ellipse
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(bossX + bossW/2, splitY - 8, bossW*0.38, 14, 0, 0, Math.PI*2);
        ctx.fill();

        if (this.bossImg.complete && this.bossImg.naturalWidth > 0) {
            ctx.save();
            ctx.drawImage(this.bossImg, 0, 0, 632, 395, bossX, bossY, bossW, bossH);
            if (this._bossHitFlash > 0) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.globalAlpha = 0.65;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bossX, bossY, bossW, bossH);
                this._bossHitFlash--;
            }
            ctx.restore();
        } else {
            // fallback while image loads
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(bossX, bossY, bossW, bossH);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('BLACKBREAD', bossX + bossW/2, bossY + bossH/2);
        }

        // ── BOSS INFO BOX — top-LEFT ─────────────────────────────────────
        const bInfoX = 20, bInfoY = 20, bInfoW = Math.min(320, W*0.3), bInfoH = 82;
        ctx.fillStyle   = 'rgba(15,10,10,0.92)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(bInfoX, bInfoY, bInfoW, bInfoH, 8);
        ctx.fill(); ctx.stroke();

        const hpColor = this.bossPhase===3?'#cc00ff':this.bossPhase===2?'#ff8800':'#ff3300';

        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 17px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('BLACKBREAD', bInfoX+12, bInfoY+24);

        ctx.fillStyle = hpColor;
        ctx.font      = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(
            this.bossPhase===3?'★★★ ENRAGED':this.bossPhase===2?'★★ Phase II':'★ Phase I',
            bInfoX+bInfoW-10, bInfoY+24
        );

        ctx.fillStyle = '#aaa';
        ctx.font      = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('HP', bInfoX+12, bInfoY+46);

        const bBarX=bInfoX+36, bBarY=bInfoY+36, bBarW=bInfoW-55, bBarH=11;
        ctx.fillStyle='#330000'; ctx.fillRect(bBarX,bBarY,bBarW,bBarH);
        ctx.fillStyle=hpColor;  ctx.fillRect(bBarX,bBarY,bBarW*Math.max(0,this.bossHp/this.bossMaxHp),bBarH);
        ctx.strokeStyle='#444'; ctx.lineWidth=1; ctx.strokeRect(bBarX,bBarY,bBarW,bBarH);

        ctx.fillStyle='#fff'; ctx.font='12px monospace'; ctx.textAlign='right';
        ctx.fillText(`${Math.max(0,Math.round(this.bossHp))} / ${this.bossMaxHp}`, bInfoX+bInfoW-10, bInfoY+68);

        // ══════════════════════════════════════════════════════════════
        // PLAYER SPRITE — large, bottom-LEFT of battle area (near side)
        // Like Pokemon: player is bigger and closer
        // ══════════════════════════════════════════════════════════════
        const plW = Math.min(W * 0.22, splitY * 0.75);
        const plH = plW;
        const plX = W * 0.05;
        const plY = splitY - plH - 5;

        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(plX+plW/2, splitY-6, plW*0.4, 10, 0, 0, Math.PI*2);
        ctx.fill();

        if (this.playerImg.complete && this.playerImg.naturalWidth > 0) {
            // draw front-facing frame (row 0, col 0) — each frame is 256x256
            ctx.drawImage(this.playerImg, 0, 0, 256, 256, plX, plY, plW, plH);
        } else {
            ctx.fillStyle = '#0055aa';
            ctx.fillRect(plX, plY, plW, plH);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('McArchie', plX+plW/2, plY+plH/2);
        }

        // ── PLAYER INFO BOX — bottom-RIGHT of battle area ────────────────
        const pInfoW = Math.min(320, W*0.3), pInfoH = 82;
        const pInfoX = W - pInfoW - 20;
        const pInfoY = splitY - pInfoH - 20;

        ctx.fillStyle   = 'rgba(10,10,15,0.92)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(pInfoX, pInfoY, pInfoW, pInfoH, 8);
        ctx.fill(); ctx.stroke();

        const pPct     = Math.max(0, this.playerHp/this.playerMaxHp);
        const pHpColor = pPct<0.25?'#ff2200':pPct<0.5?'#ffaa00':'#00cc44';

        ctx.fillStyle='#fff'; ctx.font='bold 17px monospace'; ctx.textAlign='left';
        ctx.fillText('McArchie', pInfoX+12, pInfoY+24);

        ctx.fillStyle='#aaa'; ctx.font='bold 11px monospace';
        ctx.fillText('HP', pInfoX+12, pInfoY+46);

        const pBarX=pInfoX+36, pBarY=pInfoY+36, pBarW=pInfoW-55, pBarH=11;
        ctx.fillStyle='#003300'; ctx.fillRect(pBarX,pBarY,pBarW,pBarH);
        // flicker when low
        const flicker = pPct<0.25 && Math.floor(this.frameCount/8)%2===0 ? 0.35 : 1;
        ctx.save(); ctx.globalAlpha=flicker;
        ctx.fillStyle=pHpColor; ctx.fillRect(pBarX,pBarY,pBarW*pPct,pBarH);
        ctx.restore();
        ctx.strokeStyle='#444'; ctx.lineWidth=1; ctx.strokeRect(pBarX,pBarY,pBarW,pBarH);

        ctx.fillStyle=pHpColor; ctx.font='bold 14px monospace'; ctx.textAlign='right';
        ctx.fillText(`${Math.max(0,Math.round(this.playerHp))} / ${this.playerMaxHp}`, pInfoX+pInfoW-10, pInfoY+68);

        // item indicator
        ctx.fillStyle = this.itemUsed?'#555':'#44aaff';
        ctx.font='11px monospace';
        ctx.fillText(this.itemUsed?'Grog Flask — USED':'Grog Flask ×1', pInfoX+pInfoW-10, pInfoY+24);

        // ══════════════════════════════════════════════════════════════
        // LOWER UI PANEL CONTENT
        // ══════════════════════════════════════════════════════════════

        // ── BOSS_TURN: dodge box ──────────────────────────────────────
        if (this.state === 'BOSS_TURN') {
            const box = this.box;
            // keep box centred in lower panel
            box.x = W/2 - box.w/2;
            box.y = splitY + 10 + ((H - splitY - 3) - box.h) / 2 - 14;

            ctx.strokeStyle='#fff'; ctx.lineWidth=3;
            ctx.strokeRect(box.x-3, box.y-3, box.w+6, box.h+6);
            ctx.fillStyle='#000';
            ctx.fillRect(box.x, box.y, box.w, box.h);

            // bullets
            this.bullets.forEach(b => {
                ctx.save();
                if (b.type==='diamond') {
                    ctx.translate(b.x,b.y); ctx.rotate(Math.PI/4);
                    ctx.fillStyle=b.color; ctx.fillRect(-b.r,-b.r,b.r*2,b.r*2);
                } else {
                    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
                    ctx.fillStyle=b.color; ctx.fill();
                }
                ctx.restore();
            });

            // soul heart
            const alpha = this.invincFrames>0?(Math.sin(this.frameCount*0.5)>0?0.25:1):1;
            ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle='#0088ff';
            const sx=this.soulX,sy=this.soulY,sr=7;
            ctx.beginPath();
            ctx.moveTo(sx,sy+sr);
            ctx.bezierCurveTo(sx-sr*2,sy-sr,sx-sr*2,sy-sr*2.5,sx,sy-sr*0.8);
            ctx.bezierCurveTo(sx+sr*2,sy-sr*2.5,sx+sr*2,sy-sr,sx,sy+sr);
            ctx.fill(); ctx.restore();

            // attack label below box
            ctx.fillStyle='#fff'; ctx.font='13px monospace'; ctx.textAlign='center';
            ctx.fillText(this.currentMsg, W/2, box.y+box.h+20);

            // timer bar
            const tPct = 1 - this.attackTimer/this.attackDur;
            ctx.fillStyle='#333'; ctx.fillRect(box.x, box.y+box.h+28, box.w, 6);
            ctx.fillStyle=tPct>0.5?'#00cc44':tPct>0.25?'#ffaa00':'#ff2200';
            ctx.fillRect(box.x, box.y+box.h+28, box.w*tPct, 6);
        }

        // ── MENU ──────────────────────────────────────────────────────
        if (this.state === 'MENU') {
            const panX=20, panY=splitY+6, panW=W-40, panH=H-splitY-12;
            ctx.fillStyle='#000'; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.roundRect(panX,panY,panW,panH,4); ctx.fill(); ctx.stroke();

            const opts=['FIGHT','ACT','ITEM','MERCY'];
            const cols=['#ff4444','#ffdd00','#44aaff','#ff88cc'];
            const xs=[W*0.14,W*0.37,W*0.60,W*0.83];
            opts.forEach((label,i)=>{
                const sel=i===this.menuIndex;
                ctx.font=sel?'bold 24px monospace':'19px monospace';
                ctx.fillStyle=sel?cols[i]:'#888';
                ctx.textAlign='center';
                ctx.fillText((sel?'❯ ':'')+label, xs[i], panY+panH*0.42);
            });

            ctx.fillStyle='#666'; ctx.font='12px monospace'; ctx.textAlign='left';
            ctx.fillText(this.itemUsed?'  [Grog Flask — USED]':'  [Grog Flask ×1]', panX+10, panY+panH*0.72);
            ctx.fillStyle='#444'; ctx.font='11px monospace';
            ctx.fillText('Z / Enter — select    ← → — move', panX+10, panY+panH*0.90);
        }

        // ── MESSAGE BOX ───────────────────────────────────────────────
        if (this.state === 'MESSAGE' || this.state === 'INTRO') {
            const panX=20, panY=splitY+6, panW=W-40, panH=H-splitY-12;
            ctx.fillStyle='#000'; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.roundRect(panX,panY,panW,panH,4); ctx.fill(); ctx.stroke();

            this.msgTimer++;
            const chars   = Math.min(this.currentMsg.length, Math.floor(this.msgTimer/1.4));
            const display = this.currentMsg.slice(0, chars);
            ctx.fillStyle='#fff'; ctx.font='16px monospace'; ctx.textAlign='left';
            display.split('\n').forEach((line,i)=>{
                ctx.fillText(line, panX+18, panY+30+i*26);
            });
            if (chars>=this.currentMsg.length && Math.floor(this.frameCount/18)%2===0) {
                ctx.fillStyle='#ffff00'; ctx.textAlign='right';
                ctx.fillText('▼', panX+panW-16, panY+panH-12);
            }
        }

        // ── WIN screen ────────────────────────────────────────────────
        if (this.state === 'WIN') {
            ctx.fillStyle='rgba(0,0,0,0.88)'; ctx.fillRect(0,0,W,H);
            ctx.fillStyle='#f5d060'; ctx.font='bold 52px monospace'; ctx.textAlign='center';
            ctx.fillText('YOU WON', W/2, H/2-40);
            ctx.fillStyle='#aaffaa'; ctx.font='22px monospace';
            ctx.fillText('Blackbread was defeated!', W/2, H/2+10);
            ctx.fillStyle='#888'; ctx.font='14px monospace';
            ctx.fillText('The seas are yours, McArchie.', W/2, H/2+45);
        }

        // ── LOSE screen ───────────────────────────────────────────────
        if (this.state === 'LOSE') {
            ctx.fillStyle='rgba(0,0,0,0.88)'; ctx.fillRect(0,0,W,H);
            ctx.fillStyle='#ff4444'; ctx.font='bold 52px monospace'; ctx.textAlign='center';
            ctx.fillText('YOU DIED', W/2, H/2-40);
            ctx.fillStyle='#ffaaaa'; ctx.font='18px monospace';
            ctx.fillText('Blackbread was too powerful...', W/2, H/2+10);
            ctx.fillStyle='#666'; ctx.font='14px monospace';
            ctx.fillText('Refresh the page to try again.', W/2, H/2+45);
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