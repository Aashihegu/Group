import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Character from './essentials/Character.js';
import Npc from './essentials/Npc.js';

/* ================================================================
   Gen 3/4 Pokemon FireRed/LeafGreen style boss fight
   - Blue diagonal bottom panel
   - Rounded white info boxes with drop shadow
   - 2x2 move grid (Fight / Bag / Pokemon / Run)
   - EXP bar on player info box
   - Proper grass battlefield
   ================================================================ */

class GameLevelPirateBoss {
    constructor(gameEnv) {
        const path = gameEnv.path;
        this.gameEnv  = gameEnv;
        this.continue = true;

        this.state          = 'INTRO';
        this.bossMaxHp      = 300;
        this.bossHp         = 300;
        this.playerMaxHp    = 100;
        this.playerHp       = 100;
        this.playerExp      = 0;
        this.playerMaxExp   = 100;
        this.bossPhase      = 1;
        this.attackIndex    = 0;
        this.frameCount     = 0;
        this.bullets        = [];
        this.soulX          = 0;
        this.soulY          = 0;
        this.soulSpd        = 4;
        this.invincFrames   = 0;
        this.menuIndex      = 0;   // 0=Fight 1=Bag 2=Pokemon 3=Run
        this.fightIndex     = 0;
        this.attackTimer    = 0;
        this.attackDur      = 200;
        this.messageQueue   = [];
        this.currentMsg     = '';
        this.msgTimer       = 0;
        this.itemUsed       = false;
        this._bossHitFlash  = 0;
        this._shakeDur      = 0;
        this.currentPattern = 0;
        this.box            = { x:0, y:0, w:280, h:155 };

        this._getNavH = () => {
            const nav = document.querySelector('nav,header,.navbar,#topNavbar,#nav-bar');
            return nav ? nav.offsetHeight : 0;
        };

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'pk-canvas';
        this.canvas.style.cssText = `position:fixed;left:0;width:100%;z-index:99999;pointer-events:none;image-rendering:pixelated;`;
        document.body.appendChild(this.canvas);
        this.ctx2 = this.canvas.getContext('2d');

        this._hideEngine = () => {
            const gc = document.getElementById('gameContainer');
            const c  = gc ? gc.querySelector('canvas') : document.querySelector('canvas:not(#pk-canvas)');
            if (c) { c.style.opacity='0'; c.style.pointerEvents='none'; }
            else   { setTimeout(this._hideEngine, 150); }
        };
        setTimeout(this._hideEngine, 300);

        this.keys = {};
        this._keyDown = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                 'KeyW','KeyA','KeyS','KeyD','KeyZ','KeyX','Enter','Space'].includes(e.code))
                e.stopPropagation();
            this.keys[e.code] = true;
            this._handleMenuKey(e.code);
        };
        this._keyUp = (e) => { this.keys[e.code] = false; };
        window.addEventListener('keydown', this._keyDown);
        window.addEventListener('keyup',   this._keyUp);

        this.bossImg   = new Image();
        this.bossImg.src   = path + '/images/gamebuilder/sprites/Pirate.png';
        this.playerImg = new Image();
        this.playerImg.src = path + '/images/gamebuilder/sprites/mcarchie.png';

        this._queueMessages([
            'Wild BLACKBREAD appeared!',
            'Go! McArchie!',
        ], () => { this.state = 'MENU'; });

        const bgData = { name:'boss_bg', src:path+'/images/gamebuilder/bg/Ship.jpg', pixels:{height:600,width:800} };
        const playerData = {
            id:'mcarchie', src:path+'/images/gamebuilder/sprites/mcarchie.png',
            SCALE_FACTOR:9999, STEP_FACTOR:1000, ANIMATION_RATE:30,
            INIT_POSITION:{x:-9999,y:-9999},
            pixels:{height:256,width:256}, orientation:{rows:4,columns:4},
            down:{row:0,start:0,columns:4}, right:{row:2,start:0,columns:4},
            left:{row:1,start:0,columns:4}, up:{row:3,start:0,columns:4},
            hitbox:{widthPercentage:0.01,heightPercentage:0.01},
            keypress:{up:0,left:0,down:0,right:0}
        };
        this.classes = [
            { class: GameEnvBackground, data: bgData    },
            { class: Player,            data: playerData }
        ];
    }

    _queueMessages(msgs, cb) {
        this.messageQueue = [...msgs];
        this._msgCallback = cb||null;
        this._nextMessage();
    }
    _nextMessage() {
        if (!this.messageQueue.length) {
            if (this._msgCallback) { this._msgCallback(); this._msgCallback=null; }
            return;
        }
        this.currentMsg = this.messageQueue.shift();
        this.msgTimer   = 0;
        this.state      = 'MESSAGE';
    }
    _handleMenuKey(code) {
        if (this.state==='MESSAGE') {
            if (code==='KeyZ'||code==='Enter'||code==='Space') this._nextMessage();
            return;
        }
        if (this.state==='MENU') {
            // 2x2 grid: 0=Fight 1=Bag  /  2=Pokemon 3=Run
            if (code==='ArrowLeft')  this.menuIndex = this.menuIndex%2===0 ? this.menuIndex+1 : this.menuIndex-1;
            if (code==='ArrowRight') this.menuIndex = this.menuIndex%2===0 ? this.menuIndex+1 : this.menuIndex-1;
            if (code==='ArrowUp')    this.menuIndex = this.menuIndex<2 ? this.menuIndex+2 : this.menuIndex-2;
            if (code==='ArrowDown')  this.menuIndex = this.menuIndex<2 ? this.menuIndex+2 : this.menuIndex-2;
            if (code==='KeyZ'||code==='Enter') this._selectMenu();
        }
        if (this.state==='FIGHT_MENU') {
            if (code==='ArrowLeft'||code==='ArrowRight') this.fightIndex = this.fightIndex%2===0 ? this.fightIndex+1 : this.fightIndex-1;
            if (code==='ArrowUp'||code==='ArrowDown')    this.fightIndex = this.fightIndex<2 ? this.fightIndex+2 : this.fightIndex-2;
            if (code==='KeyZ'||code==='Enter') this._selectMove();
            if (code==='KeyX'||code==='Escape') this.state='MENU';
        }
    }
    _selectMenu() {
        const choice = ['FIGHT','BAG','POKEMON','RUN'][this.menuIndex];
        if (choice==='FIGHT') {
            this.fightIndex=0; this.state='FIGHT_MENU';
        } else if (choice==='BAG') {
            if (!this.itemUsed) {
                this.itemUsed=true;
                this.playerHp=Math.min(this.playerMaxHp, this.playerHp+40);
                this._queueMessages(['McArchie used Grog Flask!','McArchie\'s HP was restored!'], ()=>this._startBossTurn());
            } else {
                this._queueMessages(['The bag is empty!'], ()=>{this.state='MENU';});
            }
        } else if (choice==='POKEMON') {
            this._queueMessages(['There\'s no other crew member!'], ()=>{this.state='MENU';});
        } else {
            this._queueMessages(['McArchie can\'t escape!'], ()=>{this.state='MENU';});
        }
    }
    _selectMove() {
        const moves = [
            { name:'Cutlass Slash', dmgMin:20, dmgMax:30, type:'PHYSICAL' },
            { name:'Sea Taunt',     dmgMin:0,  dmgMax:0,  type:'STATUS'   },
            { name:'Grapple Hook',  dmgMin:14, dmgMax:22, type:'PHYSICAL' },
            { name:'Cannon Dodge',  dmgMin:10, dmgMax:16, type:'SPECIAL'  },
        ];
        const mv  = moves[this.fightIndex];
        const dmg = mv.dmgMin + Math.floor(Math.random()*(mv.dmgMax-mv.dmgMin+1));
        this.bossHp = Math.max(0, this.bossHp-dmg);
        this._bossHitFlash=16; this._shakeDur=18;
        this.playerExp = Math.min(this.playerMaxExp, this.playerExp + Math.floor(dmg/3));

        const eff = dmg>=25?"\nIt's super effective!"  : dmg<=10?"\nIt's not very effective...":"";
        if (this.bossHp<=0) {
            this._queueMessages([
                `McArchie used ${mv.name}!`,
                'BLACKBREAD fainted!',
                'McArchie wins the battle!'
            ], ()=>{this.state='WIN';});
        } else {
            this._queueMessages([
                `McArchie used ${mv.name}!${eff}`,
                `BLACKBREAD took ${dmg} damage!`
            ], ()=>this._startBossTurn());
        }
    }

    _startBossTurn() {
        this._checkPhase();
        const W=this.canvas.width, H=this.canvas.height, splitY=Math.floor(H*0.56);
        const panH=H-splitY;
        this.box.x = W/2-this.box.w/2;
        this.box.y = splitY+(panH-this.box.h)/2-8;
        this.soulX = this.box.x+this.box.w/2;
        this.soulY = this.box.y+this.box.h/2;
        this.bullets=[]; this.attackTimer=0; this.state='BOSS_TURN';
        const patterns=this.bossPhase===1?[0,1]:this.bossPhase===2?[0,1,2]:[0,1,2,3];
        this.currentPattern=patterns[this.attackIndex%patterns.length];
        this.attackIndex++;
        this.currentMsg=['BLACKBREAD used CANNON VOLLEY!','BLACKBREAD used CUTLASS FURY!',
            'BLACKBREAD used STORM SPIN!','BLACKBREAD used RAGE BURST!'][this.currentPattern];
    }
    _checkPhase() {
        const r=this.bossHp/this.bossMaxHp, np=r>0.66?1:r>0.33?2:3;
        if (np!==this.bossPhase) {
            this.bossPhase=np;
            const msgs=np===2?["BLACKBREAD's power rose!","His attacks are stronger!"]
                              :["BLACKBREAD is enraged!","It's getting dangerous!"];
            this.messageQueue=[...msgs,...this.messageQueue];
        }
    }

    _sb(x,y,vx,vy,r=6,col='#ff4444',type='circle'){this.bullets.push({x,y,vx,vy,r,color:col,type,life:300});}
    _spawnCannonPattern(t){const b=this.box;if(t%30===0){const s=Math.random()<.5;this._sb(s?b.x-10:b.x+b.w+10,b.y+20+Math.random()*(b.h-40),s?3.5:-3.5,0,7,'#ff6600');}if(t%45===0){this._sb(b.x+20+Math.random()*(b.w-40),b.y-10,0,3.2,6,'#ffaa00');}}
    _spawnCutlassPattern(t){const b=this.box;if(t%20===0){const top=Math.random()<.5;for(let i=0;i<4;i++)this._sb(b.x+(b.w/5)*i+10,top?b.y-8:b.y+b.h+8,(Math.random()-.5)*1.5,top?4:-4,5,'#ff2222','diamond');}}
    _spawnStormPattern(t){const b=this.box;if(t%25===0){const cx=b.x+b.w/2,cy=b.y+b.h/2,off=(t/25)*.4;for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+off;this._sb(cx,cy,Math.cos(a)*2.8,Math.sin(a)*2.8,5,'#cc44ff');}}}
    _spawnRagePattern(t){const b=this.box;if(t%12===0)this._sb(b.x+Math.random()*b.w,b.y-8,(Math.random()-.5)*2,5.5,6,'#ff0000');if(t%16===0){const y=b.y+Math.random()*b.h;this._sb(b.x-8,y,5.5,(Math.random()-.5)*2,6,'#ff4400');this._sb(b.x+b.w+8,y,-5.5,(Math.random()-.5)*2,6,'#ff4400');}if(t%28===0){const cx=b.x+b.w/2,cy=b.y+b.h/2;for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2+t*.05;this._sb(cx,cy,Math.cos(a)*3.5,Math.sin(a)*3.5,5,'#ffff00');}}}

    _updateBossTurn() {
        const t=this.attackTimer,box=this.box;
        if(this.currentPattern===0)this._spawnCannonPattern(t);
        else if(this.currentPattern===1)this._spawnCutlassPattern(t);
        else if(this.currentPattern===2)this._spawnStormPattern(t);
        else this._spawnRagePattern(t);
        const spd=this.soulSpd;
        if(this.keys['ArrowLeft'] ||this.keys['KeyA'])this.soulX-=spd;
        if(this.keys['ArrowRight']||this.keys['KeyD'])this.soulX+=spd;
        if(this.keys['ArrowUp']   ||this.keys['KeyW'])this.soulY-=spd;
        if(this.keys['ArrowDown'] ||this.keys['KeyS'])this.soulY+=spd;
        this.soulX=Math.max(box.x+8,Math.min(box.x+box.w-8,this.soulX));
        this.soulY=Math.max(box.y+8,Math.min(box.y+box.h-8,this.soulY));
        if(this.invincFrames>0)this.invincFrames--;
        for(let i=this.bullets.length-1;i>=0;i--){
            const b=this.bullets[i];b.x+=b.vx;b.y+=b.vy;b.life--;
            if(b.life<=0||b.x<box.x-20||b.x>box.x+box.w+20||b.y<box.y-20||b.y>box.y+box.h+20){this.bullets.splice(i,1);continue;}
            if(this.invincFrames===0){const dx=b.x-this.soulX,dy=b.y-this.soulY;if(Math.sqrt(dx*dx+dy*dy)<b.r+4){this.playerHp=Math.max(0,this.playerHp-(this.bossPhase===3?12:this.bossPhase===2?8:5));this.invincFrames=40;this.bullets.splice(i,1);if(this.playerHp<=0){this.state='LOSE';return;}}}
        }
        this.attackTimer++;
        if(this.attackTimer>=this.attackDur){this.bullets=[];this._queueMessages([`McArchie endured the attack!`],()=>{this.state='MENU';});}
    }

    // ── DRAWING HELPERS ──────────────────────────────────────────────────────

    // Rounded rectangle helper
    _rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.closePath();}

    // HP bar — Pokemon style green/yellow/red
    _hpBar(ctx,x,y,w,h,pct){
        ctx.fillStyle='#101010';ctx.fillRect(x-1,y-1,w+2,h+2);
        ctx.fillStyle='#505050';ctx.fillRect(x,y,w,h);
        const col=pct>0.5?'#40c840':pct>0.2?'#f0c000':'#e02000';
        ctx.fillStyle=col;ctx.fillRect(x,y,Math.max(0,w*pct),h);
    }

    // Pokemon-style info box with rounded corners + drop shadow
    _infoBox(ctx,x,y,w,h){
        // shadow
        ctx.fillStyle='rgba(0,0,0,0.35)';
        this._rr(ctx,x+4,y+4,w,h,10);ctx.fill();
        // white box
        ctx.fillStyle='#f8f8e8';
        this._rr(ctx,x,y,w,h,10);ctx.fill();
        ctx.strokeStyle='#282820';ctx.lineWidth=2.5;
        this._rr(ctx,x,y,w,h,10);ctx.stroke();
    }

    _render() {
        const cv=this.canvas,ctx=this.ctx2;
        const navH=this._getNavH();
        cv.style.top=navH+'px';
        cv.width=window.innerWidth;
        cv.height=window.innerHeight-navH;
        const W=cv.width,H=cv.height;
        const splitY=Math.floor(H*0.56);
        const panH=H-splitY;

        ctx.clearRect(0,0,W,H);

        // ══════════════════════════════════════════════════════════════
        // BATTLEFIELD — Gen 3 style sky + grass
        // ══════════════════════════════════════════════════════════════
        // sky
        const sky=ctx.createLinearGradient(0,0,0,splitY*.7);
        sky.addColorStop(0,'#88c8f0');sky.addColorStop(1,'#b8e0f8');
        ctx.fillStyle=sky;ctx.fillRect(0,0,W,splitY*.7);
        // far grass
        ctx.fillStyle='#80b840';ctx.fillRect(0,splitY*.55,W,splitY*.20);
        ctx.fillStyle='#70a830';ctx.fillRect(0,splitY*.62,W,splitY*.08);
        // near grass
        ctx.fillStyle='#78c040';ctx.fillRect(0,splitY*.76,W,splitY*.24);
        ctx.fillStyle='#60a830';ctx.fillRect(0,splitY*.88,W,splitY*.12);

        // enemy platform
        ctx.fillStyle='rgba(90,60,10,0.45)';
        ctx.beginPath();ctx.ellipse(W*.72,splitY*.62,W*.16,splitY*.065,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(110,80,20,0.25)';
        ctx.beginPath();ctx.ellipse(W*.72,splitY*.62,W*.13,splitY*.045,0,0,Math.PI*2);ctx.fill();

        // player platform
        ctx.fillStyle='rgba(90,60,10,0.45)';
        ctx.beginPath();ctx.ellipse(W*.28,splitY*.90,W*.15,splitY*.055,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(110,80,20,0.25)';
        ctx.beginPath();ctx.ellipse(W*.28,splitY*.90,W*.11,splitY*.038,0,0,Math.PI*2);ctx.fill();

        // ══════════════════════════════════════════════════════════════
        // BOSS sprite — top-RIGHT on far platform
        // ══════════════════════════════════════════════════════════════
        const bW=Math.min(W*.38,splitY*.95);
        const bH=bW*(395/632);
        const bX=W*.55;
        const bY=splitY*.62-bH;
        let bsx=0,bsy=0;
        if(this._shakeDur>0){bsx=(Math.random()-.5)*8;bsy=(Math.random()-.5)*4;this._shakeDur--;}
        if(this.bossImg.complete&&this.bossImg.naturalWidth>0){
            ctx.save();
            ctx.drawImage(this.bossImg,0,0,632,395,bX+bsx,bY+bsy,bW,bH);
            if(this._bossHitFlash>0){ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=.7;ctx.fillStyle='#fff';ctx.fillRect(bX+bsx,bY+bsy,bW,bH);this._bossHitFlash--;}
            ctx.restore();
        } else {
            ctx.fillStyle='#5a0000';ctx.fillRect(bX,bY,bW,bH);
            ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('BLACKBREAD',bX+bW/2,bY+bH/2);
        }

        // ── BOSS info box — top-LEFT ──────────────────────────────────
        const bIW=Math.min(W*.32,260),bIH=Math.min(splitY*.32,88);
        const bIX=14,bIY=12;
        this._infoBox(ctx,bIX,bIY,bIW,bIH);

        const bFs=Math.floor(bIH*.20);
        ctx.fillStyle='#1a1a10';ctx.font=`bold ${bFs}px monospace`;ctx.textAlign='left';
        ctx.fillText('BLACKBREAD',bIX+12,bIY+bIH*.32);
        const phaseStr=this.bossPhase===3?'Lv.??':this.bossPhase===2?'Lv.50':'Lv.45';
        ctx.fillStyle=this.bossPhase===3?'#e02000':this.bossPhase===2?'#e08000':'#1a1a10';
        ctx.font=`bold ${Math.floor(bFs*.85)}px monospace`;ctx.textAlign='right';
        ctx.fillText(phaseStr,bIX+bIW-10,bIY+bIH*.32);

        ctx.fillStyle='#484838';ctx.font=`bold ${Math.floor(bFs*.75)}px monospace`;ctx.textAlign='left';
        ctx.fillText('HP:',bIX+10,bIY+bIH*.62);
        this._hpBar(ctx,bIX+bIW*.22,bIY+bIH*.50,bIW*.68,bIH*.14,Math.max(0,this.bossHp/this.bossMaxHp));

        // ══════════════════════════════════════════════════════════════
        // PLAYER sprite — bottom-LEFT on near platform
        // ══════════════════════════════════════════════════════════════
        const pW=Math.min(W*.20,splitY*.55);
        const pX=W*.06,pY=splitY*.90-pW;
        if(this.playerImg.complete&&this.playerImg.naturalWidth>0){
            ctx.drawImage(this.playerImg,0,0,256,256,pX,pY,pW,pW);
        } else {
            ctx.fillStyle='#003388';ctx.fillRect(pX,pY,pW,pW);
        }

        // ── PLAYER info box — bottom-RIGHT of battle area ─────────────
        const pIW=Math.min(W*.34,270),pIH=Math.min(splitY*.38,105);
        const pIX=W-pIW-14,pIY=splitY-pIH-12;
        this._infoBox(ctx,pIX,pIY,pIW,pIH);

        const pFs=Math.floor(pIH*.19);
        ctx.fillStyle='#1a1a10';ctx.font=`bold ${pFs}px monospace`;ctx.textAlign='left';
        ctx.fillText('McARCHIE',pIX+12,pIY+pIH*.26);
        ctx.fillStyle='#1a1a10';ctx.font=`bold ${Math.floor(pFs*.82)}px monospace`;ctx.textAlign='right';
        ctx.fillText('Lv9',pIX+pIW-10,pIY+pIH*.26);

        ctx.fillStyle='#484838';ctx.font=`bold ${Math.floor(pFs*.72)}px monospace`;ctx.textAlign='left';
        ctx.fillText('HP:',pIX+10,pIY+pIH*.52);
        const pHpPct=Math.max(0,this.playerHp/this.playerMaxHp);
        this._hpBar(ctx,pIX+pIW*.22,pIY+pIH*.40,pIW*.68,pIH*.13,pHpPct);

        // HP numbers like Pokemon
        const pHpCol=pHpPct<0.2?'#e02000':pHpPct<0.5?'#e08000':'#1a1a10';
        ctx.fillStyle=pHpCol;ctx.font=`bold ${Math.floor(pFs*.82)}px monospace`;ctx.textAlign='right';
        ctx.fillText(`${Math.max(0,Math.round(this.playerHp))}/ ${this.playerMaxHp}`,pIX+pIW-10,pIY+pIH*.72);

        // EXP bar — yellow, no label (like FireRed)
        ctx.fillStyle='#101010';ctx.fillRect(pIX+pIW*.10,pIY+pIH*.82,pIW*.82,pIH*.10);
        ctx.fillStyle='#4090f0';
        ctx.fillRect(pIX+pIW*.10,pIY+pIH*.82,Math.max(0,pIW*.82*(this.playerExp/this.playerMaxExp)),pIH*.10);
        ctx.fillStyle='#484838';ctx.font=`${Math.floor(pFs*.60)}px monospace`;ctx.textAlign='left';
        ctx.fillText('EXP',pIX+10,pIY+pIH*.96);

        // ══════════════════════════════════════════════════════════════
        // BOTTOM PANEL — dark blue diagonal shape like FireRed
        // ══════════════════════════════════════════════════════════════
        ctx.fillStyle='#3050a0';
        ctx.beginPath();
        ctx.moveTo(0,splitY+H*.04);
        ctx.lineTo(W*.18,splitY);
        ctx.lineTo(W,splitY);
        ctx.lineTo(W,H);
        ctx.lineTo(0,H);
        ctx.closePath();
        ctx.fill();

        // panel border line
        ctx.strokeStyle='#182860';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(0,splitY+H*.04);ctx.lineTo(W*.18,splitY);ctx.lineTo(W,splitY);ctx.stroke();
        ctx.strokeStyle='#6080d0';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(0,splitY+H*.04+3);ctx.lineTo(W*.18,splitY+3);ctx.lineTo(W,splitY+3);ctx.stroke();

        // white message/action area inside panel
        const msgX=12,msgY=splitY+panH*.08,msgW=W*.48,msgH=panH*.82;
        this._infoBox(ctx,msgX,msgY,msgW,msgH);

        // ── BOSS_TURN dodge box ───────────────────────────────────────
        if(this.state==='BOSS_TURN'){
            const box=this.box;
            box.x=msgX+msgW*.08;
            box.y=msgY+(msgH-box.h)/2;
            box.w=msgW*.84;

            ctx.strokeStyle='#282820';ctx.lineWidth=3;
            ctx.strokeRect(box.x-3,box.y-3,box.w+6,box.h+6);
            ctx.fillStyle='#000';ctx.fillRect(box.x,box.y,box.w,box.h);

            this.bullets.forEach(b=>{
                ctx.save();
                if(b.type==='diamond'){ctx.translate(b.x,b.y);ctx.rotate(Math.PI/4);ctx.fillStyle=b.color;ctx.fillRect(-b.r,-b.r,b.r*2,b.r*2);}
                else{ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=b.color;ctx.fill();}
                ctx.restore();
            });

            const al=this.invincFrames>0?(Math.sin(this.frameCount*.5)>0?.2:1):1;
            ctx.save();ctx.globalAlpha=al;ctx.fillStyle='#0088ff';
            const sx=this.soulX,sy=this.soulY,sr=7;
            ctx.beginPath();ctx.moveTo(sx,sy+sr);
            ctx.bezierCurveTo(sx-sr*2,sy-sr,sx-sr*2,sy-sr*2.5,sx,sy-sr*.8);
            ctx.bezierCurveTo(sx+sr*2,sy-sr*2.5,sx+sr*2,sy-sr,sx,sy+sr);
            ctx.fill();ctx.restore();

            // timer bar
            const tPct=1-this.attackTimer/this.attackDur;
            ctx.fillStyle='#505050';ctx.fillRect(box.x,box.y+box.h+6,box.w,5);
            ctx.fillStyle=tPct>.5?'#40c840':tPct>.25?'#f0c000':'#e02000';
            ctx.fillRect(box.x,box.y+box.h+6,box.w*tPct,5);
        }

        // ── MESSAGE text ──────────────────────────────────────────────
        if(this.state==='MESSAGE'||this.state==='BOSS_TURN'){
            const txt = this.state==='BOSS_TURN' ? this.currentMsg : this.currentMsg;
            if(this.state==='MESSAGE') this.msgTimer++;
            const shown = this.state==='MESSAGE'
                ? txt.slice(0,Math.min(txt.length,Math.floor(this.msgTimer/1.2)))
                : txt;
            const tFs=Math.floor(msgH*.17);
            ctx.fillStyle='#1a1a10';ctx.font=`bold ${tFs}px monospace`;ctx.textAlign='left';
            shown.split('\n').forEach((line,i)=>{
                ctx.fillText(line,msgX+18,msgY+msgH*.32+i*tFs*1.3);
            });
            if(this.state==='MESSAGE'&&shown.length>=txt.length&&Math.floor(this.frameCount/16)%2===0){
                ctx.fillText('▼',msgX+msgW-22,msgY+msgH*.88);
            }
        }

        // ── MAIN MENU — 2x2 grid right side ──────────────────────────
        if(this.state==='MENU'){
            // "What will X do?" in message box
            const tFs=Math.floor(msgH*.17);
            ctx.fillStyle='#1a1a10';ctx.font=`bold ${tFs}px monospace`;ctx.textAlign='left';
            ctx.fillText('What will',msgX+18,msgY+msgH*.34);
            ctx.fillText('McArchie do?',msgX+18,msgY+msgH*.66);

            // 2x2 option box — right side of panel
            const optX=W*.52,optY=splitY+panH*.06,optW=W*.46,optH=panH*.86;
            this._infoBox(ctx,optX,optY,optW,optH);

            const opts=['Fight','Bag','POKéMON','Run'];
            const oFs=Math.floor(optH*.20);
            [[0,1],[2,3]].forEach((row,ri)=>{
                row.forEach((idx,ci)=>{
                    const ox=optX+optW*(.08+ci*.50);
                    const oy=optY+optH*(.30+ri*.42);
                    const sel=idx===this.menuIndex;
                    ctx.fillStyle=sel?'#1a1a10':'#505050';
                    ctx.font=`${sel?'bold ':''  }${oFs}px monospace`;
                    ctx.textAlign='left';
                    ctx.fillText((sel?'▶':' ')+opts[idx],ox,oy);
                });
            });

            // bag status
            ctx.fillStyle='#808070';ctx.font=`${Math.floor(oFs*.55)}px monospace`;ctx.textAlign='right';
            ctx.fillText(this.itemUsed?'Flask: USED':'Flask: ×1',optX+optW-12,optY+optH*.95);
        }

        // ── FIGHT MENU — 2x2 move grid ────────────────────────────────
        if(this.state==='FIGHT_MENU'){
            const moves=['Cutlass Slash','Sea Taunt','Grapple Hook','Cannon Dodge'];
            const types=['PHYSICAL','STATUS','PHYSICAL','SPECIAL'];
            const typeCols={'PHYSICAL':'#c03028','STATUS':'#9858c8','SPECIAL':'#6890f0'};

            // move grid left
            const mX=msgX+8,mY=msgY+8,mW=msgW*.65,mH=msgH-16;
            ctx.fillStyle='#1a1a10';
            const mFs=Math.floor(mH*.18);
            [[0,1],[2,3]].forEach((row,ri)=>{
                row.forEach((idx,ci)=>{
                    const ox=mX+mW*(.04+ci*.52);
                    const oy=mY+mH*(.28+ri*.44);
                    const sel=idx===this.fightIndex;
                    ctx.fillStyle=sel?typeCols[types[idx]]:'#404040';
                    ctx.font=`${sel?'bold ':''  }${mFs}px monospace`;
                    ctx.textAlign='left';
                    ctx.fillText((sel?'▶':' ')+moves[idx],ox,oy);
                });
            });

            // type box right
            const tX=msgX+msgW*.68,tY=msgY+msgH*.1,tW=msgW*.30,tH=msgH*.80;
            ctx.fillStyle='#e8e8d8';
            this._rr(ctx,tX,tY,tW,tH,6);ctx.fill();
            ctx.strokeStyle='#484838';ctx.lineWidth=1.5;this._rr(ctx,tX,tY,tW,tH,6);ctx.stroke();
            const tFs2=Math.floor(tH*.14);
            ctx.fillStyle='#484838';ctx.font=`${tFs2}px monospace`;ctx.textAlign='center';
            ctx.fillText('TYPE/',tX+tW/2,tY+tH*.35);
            ctx.fillStyle=typeCols[types[this.fightIndex]];
            ctx.font=`bold ${Math.floor(tFs2*1.1)}px monospace`;
            ctx.fillText(types[this.fightIndex],tX+tW/2,tY+tH*.62);
            ctx.fillStyle='#808070';ctx.font=`${Math.floor(tFs2*.75)}px monospace`;
            ctx.fillText('X: back',tX+tW/2,tY+tH*.88);
        }

        // ── WIN ───────────────────────────────────────────────────────
        if(this.state==='WIN'){
            ctx.fillStyle='rgba(248,248,232,0.97)';ctx.fillRect(0,0,W,H);
            ctx.fillStyle='#1a1a10';ctx.font=`bold ${Math.floor(W*.055)}px monospace`;ctx.textAlign='center';
            ctx.fillText('BLACKBREAD fainted!',W/2,H*.38);
            ctx.fillStyle='#4090f0';ctx.font=`bold ${Math.floor(W*.038)}px monospace`;
            ctx.fillText('McArchie gained EXP!',W/2,H*.52);
            ctx.fillStyle='#505050';ctx.font=`${Math.floor(W*.024)}px monospace`;
            ctx.fillText('The seas are yours.',W/2,H*.64);
        }

        // ── LOSE ──────────────────────────────────────────────────────
        if(this.state==='LOSE'){
            ctx.fillStyle='rgba(8,8,16,0.97)';ctx.fillRect(0,0,W,H);
            ctx.fillStyle='#e02000';ctx.font=`bold ${Math.floor(W*.055)}px monospace`;ctx.textAlign='center';
            ctx.fillText('McArchie fainted!',W/2,H*.40);
            ctx.fillStyle='#f0f0e0';ctx.font=`${Math.floor(W*.024)}px monospace`;
            ctx.fillText('Refresh to try again.',W/2,H*.58);
        }
    }

    update() {
        this.frameCount++;
        if(this.state==='BOSS_TURN') this._updateBossTurn();
        this._render();
    }
    draw()   {}
    resize() {}
    destroy() {
        window.removeEventListener('keydown', this._keyDown);
        window.removeEventListener('keyup',   this._keyUp);
        document.getElementById('pk-canvas')?.remove();
    }
}

export default GameLevelPirateBoss;