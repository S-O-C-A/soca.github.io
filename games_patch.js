// ══════════════════════════════════════════════════════════════════════════
// games_patch.js — NEURAL CHESS (vs SOCA) + BIO SWEEP (SMILE Minesweeper)
// Подключи в soca.html: <script src="games_patch.js"></script>
// (после <script src="script.js"></script>)
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// ── SOUND SYSTEM ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

const SFX = {};
const SFX_FILES = {
  проигрыш:      'sounds/проигрыш.mp3',
  стрелялка:     'sounds/стрелялка.mp3',
  змейка:        'sounds/змейка.mp3',
  мячик:         'sounds/мячик.mp3',
  пешки:         'sounds/пешки.mp3',
  глитч:         'sounds/глитч.mp3',
  пульс:         'sounds/пульс.mp3',
  попадание:     'sounds/попадание.mp3',
  кнопки:        'sounds/кнопки.mp3',
  ошибка:        'sounds/резкая ошибка.mp3',
};

let gameTimers = [];
let gameIntervals = [];

function getSound(key) {
  if (!SFX_FILES[key]) return null;
  if (!SFX[key]) {
    const a = new Audio(SFX_FILES[key]);
    a.preload = 'auto';
    SFX[key] = a;
  }
  return SFX[key];
}

function registerGameTimeout(callback, delay) {
  const id = setTimeout(callback, delay);
  gameTimers.push(id);
  return id;
}

function registerGameInterval(callback, delay) {
  const id = setInterval(callback, delay);
  gameIntervals.push(id);
  return id;
}

function clearGameHandles() {
  gameTimers.forEach(clearTimeout);
  gameTimers = [];
  gameIntervals.forEach(clearInterval);
  gameIntervals = [];
  if (typeof thinkTimer !== 'undefined' && thinkTimer) {
    clearInterval(thinkTimer);
    thinkTimer = null;
  }
  if (typeof socaPopupHideTimeout !== 'undefined' && socaPopupHideTimeout) {
    clearTimeout(socaPopupHideTimeout);
    socaPopupHideTimeout = null;
  }
  if (typeof smilePopupHideTimeout !== 'undefined' && smilePopupHideTimeout) {
    clearTimeout(smilePopupHideTimeout);
    smilePopupHideTimeout = null;
    smilePopupBusy = false;
  }
}

// Воспроизвести звук (прерывает если уже играет)
function playSound(key, volume) {
  const snd = getSound(key);
  if (!snd) return;
  try {
    snd.currentTime = 0;
    snd.volume = volume !== undefined ? volume : 0.55;
    snd.play().catch(() => {});
  } catch(e) {}
}

// ══════════════════════════════════════════════════════════════════════════════
// ── GAMES SYSTEM ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
let astHiScore=0, snakeHiScore=0, pongHiScore=0, breakerHiScore=0, checkersWins=0;

function openGames(){
  const ov=document.getElementById('games-overlay');
  if(!ov) return;
  ov.style.display='flex';
  backToSelector();
}
function closeGames(){
  if(typeof window.stopCurrentGame === 'function') window.stopCurrentGame();
  const ov=document.getElementById('games-overlay');
  if(ov) ov.style.display='none';
  const p=document.getElementById('soca-game-popup');
  if(p){p.style.display='none';p.style.opacity='';p.style.transition='';}
  if(socaPopupTimeout){clearTimeout(socaPopupTimeout);socaPopupTimeout=null;}
  if(socaPopupHideTimeout){clearTimeout(socaPopupHideTimeout);socaPopupHideTimeout=null;}
  const sp=document.getElementById('smile-game-popup');
  if(sp){sp.style.display='none';sp.style.opacity='';sp.style.transition='';smilePopupBusy=false;}
  if(smilePopupHideTimeout){clearTimeout(smilePopupHideTimeout);smilePopupHideTimeout=null;}
}

function backToSelector(){
  if(typeof window.stopCurrentGame === 'function') window.stopCurrentGame();
  document.getElementById('game-selector').style.display='flex';
  document.getElementById('game-arena').style.display='none';
  document.getElementById('active-game-title').textContent='';
  const p=document.getElementById('soca-game-popup');
  if(p){p.style.display='none';p.style.opacity='';p.style.transition='';}
  if(socaPopupTimeout){clearTimeout(socaPopupTimeout);socaPopupTimeout=null;}
  if(socaPopupHideTimeout){clearTimeout(socaPopupHideTimeout);socaPopupHideTimeout=null;}
  const sp=document.getElementById('smile-game-popup');
  if(sp){sp.style.display='none';sp.style.opacity='';sp.style.transition='';smilePopupBusy=false;}
  if(smilePopupHideTimeout){clearTimeout(smilePopupHideTimeout);smilePopupHideTimeout=null;}
}

function stopCurrentGame(){
  gameRunning=false;
  currentGame=null;
  clearGameHandles();
  // Закрываем попапы при выходе из игры
  const socaPopup = document.getElementById('soca-game-popup');
  if (socaPopup) {
    socaPopup.style.display = 'none';
    socaPopup.style.opacity = '';
    socaPopup.style.transition = '';
  }
  const smilePopup = document.getElementById('smile-game-popup');
  if (smilePopup) {
    smilePopup.style.display = 'none';
    smilePopup.style.opacity = '';
    smilePopup.style.transition = '';
  }
  if (typeof socaPopupTimeout !== 'undefined' && socaPopupTimeout) { clearTimeout(socaPopupTimeout); socaPopupTimeout = null; }
  if (typeof socaPopupHideTimeout !== 'undefined' && socaPopupHideTimeout) { clearTimeout(socaPopupHideTimeout); socaPopupHideTimeout = null; }
  if (typeof smilePopupHideTimeout !== 'undefined' && smilePopupHideTimeout) { clearTimeout(smilePopupHideTimeout); smilePopupHideTimeout = null; }
  smilePopupBusy = false;
  if (typeof thinkTimer !== 'undefined' && thinkTimer) { clearInterval(thinkTimer); thinkTimer = null; }
}

// ── GAME 1: VOID ASSAULT ──────────────────────────────────────────────────────
function startAsteroids(){
  stopCurrentGame();
  currentGame='asteroids'; gameRunning=true;
  const cv=document.getElementById('game-canvas');
  const ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  let score=0,level=1,lives=3,frameCount=0;
  let ship={x:W/2,y:H/2,angle:-Math.PI/2,vx:0,vy:0,thrusting:false,dead:false,respawnTimer:0,invincible:0,trail:[]};
  let bullets=[],asteroids=[],particles=[],stars=[];
  let keys={},gameOver=false,paused=false,shootCD=0,frameId=0;

  for(let i=0;i<120;i++) stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.5,b:Math.random()});

  function genShape(r){
    const n=8+Math.floor(Math.random()*5),pts=[];
    for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2;pts.push({x:Math.cos(a)*r*(0.7+Math.random()*0.55),y:Math.sin(a)*r*(0.7+Math.random()*0.55)});}
    return pts;
  }
  function spawnWave(){
    const n=4+level*2;
    for(let i=0;i<n;i++){
      let ax,ay;
      do{ax=Math.random()*W;ay=Math.random()*H;}while(Math.hypot(ax-ship.x,ay-ship.y)<130);
      const sp=0.5+Math.random()*0.9+level*0.12,ang=Math.random()*Math.PI*2;
      const r=28+Math.random()*22;
      asteroids.push({x:ax,y:ay,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,r,angle:0,spin:(Math.random()-0.5)*0.04,hp:r>38?3:2,verts:genShape(r)});
    }
  }
  function explode(a){
    for(let i=0;i<12;i++){const ang=Math.random()*Math.PI*2,sp=1+Math.random()*3;particles.push({x:a.x,y:a.y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,life:45,max:45,col:'#ff8800'});}
    if(a.r>15) for(let i=0;i<2;i++){
      const ang=Math.random()*Math.PI*2,sp=1+Math.random()*1.4,nr=a.r*0.52;
      asteroids.push({x:a.x+Math.cos(ang)*a.r*0.4,y:a.y+Math.sin(ang)*a.r*0.4,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,r:nr,angle:0,spin:(Math.random()-0.5)*0.06,hp:1,verts:genShape(nr)});
    }
  }
  function fire(){playSound('стрелялка', 0.3);
    bullets.push({x:ship.x+Math.cos(ship.angle)*14,y:ship.y+Math.sin(ship.angle)*14,vx:Math.cos(ship.angle)*9+ship.vx*0.3,vy:Math.sin(ship.angle)*9+ship.vy*0.3,life:58});}
  function updateHUD(){
    document.getElementById('game-score').textContent=score;
    document.getElementById('game-lives').innerHTML='♥ '.repeat(Math.max(0,lives)).trim();
    document.getElementById('game-lives').style.color=lives===1?'#ff2244':'var(--red)';
  }

  const onKey=(e)=>{
    if(currentGame!=='asteroids') return;
    keys[e.code]=true;
    if(e.code==='Space') e.preventDefault();
    if(e.code==='KeyP') paused=!paused;
    if(gameOver && e.code==='Space'){score=0;level=1;lives=3;gameOver=false;ship={x:W/2,y:H/2,angle:-Math.PI/2,vx:0,vy:0,thrusting:false,dead:false,respawnTimer:0,invincible:120,trail:[]};bullets=[];asteroids=[];particles=[];spawnWave();updateHUD();document.getElementById('game-msg').textContent='';document.getElementById('game-level').textContent=1;}
  };
  const offKey=(e)=>{ keys[e.code]=false; };
  document.addEventListener('keydown',onKey);
  document.addEventListener('keyup',offKey);

  spawnWave();

  function loop(){
    if(!gameRunning||currentGame!=='asteroids'){document.removeEventListener('keydown',onKey);document.removeEventListener('keyup',offKey);return;}
    if(document.hidden){requestAnimationFrame(loop);return;}
    frameCount++;
    ctx.fillStyle='rgba(1,10,4,0.9)';ctx.fillRect(0,0,W,H);
    // stars
    stars.forEach(s=>{ctx.fillStyle=`rgba(150,220,180,${s.b*0.6})`;ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();});
    // grid
    ctx.strokeStyle='rgba(0,255,136,0.035)';ctx.lineWidth=0.5;
    for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    if(!paused&&!gameOver){
      if(!ship.dead){
        if(keys['ArrowLeft']||keys['KeyA']) ship.angle-=0.055;
        if(keys['ArrowRight']||keys['KeyD']) ship.angle+=0.055;
        ship.thrusting=!!(keys['ArrowUp']||keys['KeyW']);
        if(ship.thrusting){ship.vx+=Math.cos(ship.angle)*0.3;ship.vy+=Math.sin(ship.angle)*0.3;}
        ship.vx*=0.97;ship.vy*=0.97;
        const sp=Math.hypot(ship.vx,ship.vy);if(sp>7.5){ship.vx*=7.5/sp;ship.vy*=7.5/sp;}
        ship.x=(ship.x+ship.vx+W)%W;ship.y=(ship.y+ship.vy+H)%H;
        if(ship.invincible>0) ship.invincible--;
        if(ship.thrusting&&frameCount%2===0) ship.trail.push({x:ship.x-Math.cos(ship.angle)*13,y:ship.y-Math.sin(ship.angle)*13,life:16});
        ship.trail=ship.trail.filter(t=>{t.life--;return t.life>0;});
        if(shootCD>0) shootCD--;
        if((keys['Space'])&&shootCD<=0){fire();shootCD=9;}
      } else {
        if(--ship.respawnTimer<=0) ship={x:W/2,y:H/2,angle:-Math.PI/2,vx:0,vy:0,thrusting:false,dead:false,respawnTimer:0,invincible:140,trail:[]};
      }
      bullets=bullets.filter(b=>{b.x=(b.x+b.vx+W)%W;b.y=(b.y+b.vy+H)%H;b.life--;return b.life>0;});
      asteroids.forEach(a=>{a.x=(a.x+a.vx+W)%W;a.y=(a.y+a.vy+H)%H;a.angle+=a.spin;});
      // bullet-asteroid
      for(let bi=bullets.length-1;bi>=0;bi--){
        const b=bullets[bi];
        for(let ai=asteroids.length-1;ai>=0;ai--){
          const a=asteroids[ai];
          if(Math.hypot(b.x-a.x,b.y-a.y)<a.r){
            bullets.splice(bi,1);
            a.hp--;
            for(let i=0;i<5;i++){const ang=Math.random()*Math.PI*2;particles.push({x:b.x,y:b.y,vx:Math.cos(ang)*3,vy:Math.sin(ang)*3,life:18,max:18,col:'#ffcc00'});}
            if(a.hp<=0){
              score+=(a.r>38?80:a.r>20?150:250);
              if(score>astHiScore){astHiScore=score;document.getElementById('ast-hiscore').textContent=astHiScore;}
              explode(a);asteroids.splice(ai,1);
              document.getElementById('game-score').textContent=score;
            }
            break;
          }
        }
      }
      // ship-asteroid
      if(!ship.dead&&ship.invincible<=0){
        for(const a of asteroids){
          if(Math.hypot(ship.x-a.x,ship.y-a.y)<a.r+9){
            lives--;updateHUD();
            for(let i=0;i<28;i++){const ang=Math.random()*Math.PI*2,sp=2+Math.random()*4;particles.push({x:ship.x,y:ship.y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,life:55,max:55,col:'#00ffcc'});}
            playSound('ошибка', 0.5);
            ship.dead=true;ship.respawnTimer=130;
            if(lives<=0){gameOver=true; playSound('проигрыш'); if(score>astHiScore){astHiScore=score;document.getElementById('ast-hiscore').textContent=astHiScore;}}
            break;
          }
        }
      }
      particles=particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=0.94;p.vy*=0.94;p.life--;return p.life>0;});
      if(asteroids.length===0){level++;document.getElementById('game-level').textContent=level;spawnWave();document.getElementById('game-msg').textContent='WAVE '+level;registerGameTimeout(()=>{if(currentGame==='asteroids')document.getElementById('game-msg').textContent='';},1600);}
    }

    // Draw trail
    ship.trail.forEach(t=>{ctx.fillStyle=`rgba(0,255,136,${t.life/16*0.45})`;ctx.beginPath();ctx.arc(t.x,t.y,1.5+t.life/16*2,0,Math.PI*2);ctx.fill();});
    // Draw ship
    if(!ship.dead&&(ship.invincible<=0||frameCount%6<3)){
      ctx.save();ctx.translate(ship.x,ship.y);ctx.rotate(ship.angle);
      ctx.strokeStyle=ship.invincible>0?'rgba(0,255,200,0.55)':'rgba(0,255,200,0.95)';
      ctx.lineWidth=1.8;ctx.shadowColor='#00ffcc';ctx.shadowBlur=10;
      ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-10,8);ctx.lineTo(-5,0);ctx.lineTo(-10,-8);ctx.closePath();ctx.stroke();
      if(ship.thrusting){ctx.strokeStyle='rgba(255,140,0,0.9)';ctx.shadowColor='#ff8800';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,4);ctx.lineTo(-16+(Math.random()-0.5)*4,0);ctx.lineTo(-5,-4);ctx.stroke();}
      ctx.shadowBlur=0;ctx.restore();
    }
    // Bullets
    bullets.forEach(b=>{ctx.fillStyle='#00ffcc';ctx.shadowColor='#00ffcc';ctx.shadowBlur=6;ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;});
    // Asteroids
    asteroids.forEach(a=>{
      ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.angle);
      const c=a.hp===1?'rgba(255,50,50,0.85)':a.hp===2?'rgba(255,180,0,0.82)':'rgba(0,255,136,0.72)';
      ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.shadowColor=c;ctx.shadowBlur=5;
      ctx.beginPath();a.verts.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));
      ctx.closePath();ctx.stroke();ctx.shadowBlur=0;ctx.restore();
    });
    // Particles
    particles.forEach(p=>{const al=p.life/p.max;ctx.fillStyle=p.col+Math.round(al*255).toString(16).padStart(2,'0');ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill();});
    // Overlays
    if(gameOver){
      ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
      ctx.textAlign='center';
      ctx.fillStyle='#ff2244';ctx.font='52px VT323,monospace';ctx.fillText('VESSEL DESTROYED',W/2,H/2-44);
      ctx.fillStyle='#00ff88';ctx.font='26px VT323,monospace';ctx.fillText('SCORE: '+score+'  //  HI: '+astHiScore,W/2,H/2+6);
      ctx.fillStyle='#004422';ctx.font='13px "Share Tech Mono",monospace';ctx.fillText('SPACE TO RESTART',W/2,H/2+48);
      ctx.textAlign='left';
    }
    if(paused&&!gameOver){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#00ffcc';ctx.font='44px VT323,monospace';ctx.textAlign='center';ctx.fillText('PAUSED — P TO RESUME',W/2,H/2);ctx.textAlign='left';}
    frameId = requestAnimationFrame(loop);
  }
  window.stopCurrentGame = function() {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('keyup', offKey);
    cancelAnimationFrame(frameId);
    clearGameHandles();
    window.gameRunning = false;
    window.currentGame = null;
  };
  loop();
}

// ── GAME 2: NEURAL SNAKE ──────────────────────────────────────────────────────
function startSnake(){
  stopCurrentGame();
  currentGame='snake'; gameRunning=true;
  const cv=document.getElementById('game-canvas');
  const ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  const CELL=22,COLS=Math.floor((W-40)/CELL),ROWS=Math.floor((H-40)/CELL);
  const OX=Math.floor((W-COLS*CELL)/2),OY=Math.floor((H-ROWS*CELL)/2);
  let score=0,level=1,speed=130,lastMove=0,frameCount=0,frameId=0;
  let dir={x:1,y:0},nextDir={x:1,y:0};
  let snake=[{x:Math.floor(COLS/2),y:Math.floor(ROWS/2)},{x:Math.floor(COLS/2)-1,y:Math.floor(ROWS/2)},{x:Math.floor(COLS/2)-2,y:Math.floor(ROWS/2)}];
  let food=null,powerup=null,particles=[],glowTrail=[];
  let gameOver=false,paused=false,boosted=false,boostedTimer=0,ateCount=0;

  function placeFood(){
    let p;do{p={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};}while(snake.some(s=>s.x===p.x&&s.y===p.y));food=p;
  }
  function placePU(){
    if(powerup) return;
    let p;do{p={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};}while(snake.some(s=>s.x===p.x&&s.y===p.y)||(food&&food.x===p.x&&food.y===p.y));
    powerup={...p,timer:220,type:Math.random()<0.6?'boost':'shrink'};
  }
  placeFood();
  registerGameTimeout(()=>{if(currentGame==='snake') placePU();},5000);

  const onKey=(e)=>{
    if(currentGame!=='snake') return;
    const k=e.code;
    if((k==='ArrowUp'||k==='KeyW')&&dir.y===0) nextDir={x:0,y:-1};
    if((k==='ArrowDown'||k==='KeyS')&&dir.y===0) nextDir={x:0,y:1};
    if((k==='ArrowLeft'||k==='KeyA')&&dir.x===0) nextDir={x:-1,y:0};
    if((k==='ArrowRight'||k==='KeyD')&&dir.x===0) nextDir={x:1,y:0};
    if(k==='Space'){e.preventDefault();paused=!paused;}
    if(gameOver&&k==='Space') restartSnake();
    e.preventDefault();
  };
  document.addEventListener('keydown',onKey);

  function restartSnake(){
    score=0;level=1;speed=130;gameOver=false;paused=false;boosted=false;boostedTimer=0;ateCount=0;
    snake=[{x:Math.floor(COLS/2),y:Math.floor(ROWS/2)},{x:Math.floor(COLS/2)-1,y:Math.floor(ROWS/2)},{x:Math.floor(COLS/2)-2,y:Math.floor(ROWS/2)}];
    dir={x:1,y:0};nextDir={x:1,y:0};particles=[];glowTrail=[];powerup=null;
    placeFood();
    document.getElementById('game-score').textContent='0';
    document.getElementById('game-level').textContent='1';
    document.getElementById('game-msg').textContent='';
    document.getElementById('game-extra-info').textContent='';
    document.getElementById('game-lives').innerHTML='∞';
  }

  document.getElementById('game-lives').innerHTML='∞';
  document.getElementById('game-lives').style.color='var(--b)';

  function move(){
    dir={...nextDir};
    const head={x:(snake[0].x+dir.x+COLS)%COLS,y:(snake[0].y+dir.y+ROWS)%ROWS};
    if(snake.some(s=>s.x===head.x&&s.y===head.y)){
      gameOver=true;
      playSound('проигрыш');
      if(score>snakeHiScore){snakeHiScore=score;document.getElementById('snake-hiscore').textContent=snakeHiScore;}
      snake.forEach(s=>{for(let i=0;i<5;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*4;particles.push({x:OX+s.x*CELL+CELL/2,y:OY+s.y*CELL+CELL/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:50,max:50,col:null});}});
      return;
    }
    snake.unshift(head);
    glowTrail.push({x:OX+head.x*CELL+CELL/2,y:OY+head.y*CELL+CELL/2,life:14});
    let ate=false;
    if(food&&head.x===food.x&&head.y===food.y){
      playSound('змейка', 0.5);
      ate=true;ateCount++;
      score+=10*(boosted?2:1);
      for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2,sp=2+Math.random()*3;particles.push({x:OX+food.x*CELL+CELL/2,y:OY+food.y*CELL+CELL/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:32,max:32,col:'#00ccff'});}
      placeFood();
      if(score>snakeHiScore){snakeHiScore=score;document.getElementById('snake-hiscore').textContent=snakeHiScore;}
      document.getElementById('game-score').textContent=score;
      if(ateCount%6===0){level++;speed=Math.max(55,speed-12);document.getElementById('game-level').textContent=level;document.getElementById('game-msg').textContent='LEVEL '+level+'!';registerGameTimeout(()=>{if(currentGame==='snake')document.getElementById('game-msg').textContent='';},1200);}
      if(Math.random()<0.28) registerGameTimeout(()=>{if(currentGame==='snake') placePU();},800);
    }
    if(!ate) snake.pop();
    if(powerup&&head.x===powerup.x&&head.y===powerup.y){
      for(let i=0;i<18;i++){const a=Math.random()*Math.PI*2,sp=2+Math.random()*4;particles.push({x:OX+powerup.x*CELL+CELL/2,y:OY+powerup.y*CELL+CELL/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:38,max:38,col:'#ffcc00'});}
      if(powerup.type==='boost'){boosted=true;boostedTimer=200;document.getElementById('game-extra-info').textContent='⚡ 2× SCORE BOOST';}
      if(powerup.type==='shrink'&&snake.length>4){snake.splice(-Math.min(4,snake.length-2));document.getElementById('game-msg').textContent='SHRINK!';registerGameTimeout(()=>{if(currentGame==='snake')document.getElementById('game-msg').textContent='';},900);}
      powerup=null;
    }
  }

  function loop(ts){
    if(!gameRunning||currentGame!=='snake'){document.removeEventListener('keydown',onKey);return;}
    if(document.hidden){requestAnimationFrame(loop);return;}
    frameCount++;
    if(!paused&&!gameOver){
      if(powerup){powerup.timer--;if(powerup.timer<=0) powerup=null;}
      if(boostedTimer>0){boostedTimer--;if(boostedTimer<=0){boosted=false;document.getElementById('game-extra-info').textContent='';}}
      if(ts-lastMove>(boosted?speed*0.55:speed)){lastMove=ts;move();}
    }

    ctx.fillStyle='#010a04';ctx.fillRect(0,0,W,H);
    // Grid cells
    for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++){
      ctx.fillStyle=(x+y)%2===0?'rgba(0,255,136,0.016)':'rgba(0,180,100,0.010)';
      ctx.fillRect(OX+x*CELL,OY+y*CELL,CELL,CELL);
    }
    // Border
    ctx.strokeStyle='rgba(0,255,136,0.22)';ctx.lineWidth=1;
    ctx.strokeRect(OX,OY,COLS*CELL,ROWS*CELL);
    ctx.strokeStyle='rgba(0,255,136,0.06)';ctx.lineWidth=1;
    ctx.strokeRect(OX-3,OY-3,COLS*CELL+6,ROWS*CELL+6);

    // Glow trail
    glowTrail=glowTrail.filter(t=>{t.life--;return t.life>0;});
    glowTrail.forEach(t=>{
      ctx.fillStyle=`rgba(${boosted?'255,200,0':'0,255,136'},${t.life/14*0.18})`;
      ctx.beginPath();ctx.arc(t.x,t.y,CELL/2,0,Math.PI*2);ctx.fill();
    });

    // Snake
    snake.forEach((seg,i)=>{
      const ratio=1-i/snake.length;
      const isHead=i===0;
      const rg=boosted?`rgba(255,${Math.round(180*ratio)},0,${0.4+ratio*0.6})`:`rgba(0,${Math.round(180+75*ratio)},${Math.round(80+80*ratio)},${0.45+ratio*0.55})`;
      const gc=boosted?'#ffcc00':'#00ffcc';
      ctx.fillStyle=rg;
      ctx.shadowColor=gc;ctx.shadowBlur=isHead?14:ratio*5;
      const pad=isHead?1:2;
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(OX+seg.x*CELL+pad,OY+seg.y*CELL+pad,CELL-pad*2,CELL-pad*2,isHead?5:3);
      else ctx.rect(OX+seg.x*CELL+pad,OY+seg.y*CELL+pad,CELL-pad*2,CELL-pad*2);
      ctx.fill();ctx.shadowBlur=0;
      if(isHead){
        // Eyes
        const ex=dir.x,ey=dir.y,hx=OX+seg.x*CELL+CELL/2,hy=OY+seg.y*CELL+CELL/2;
        const px=-ey*4,py=ex*4;
        ctx.fillStyle='rgba(0,5,2,0.9)';
        ctx.beginPath();ctx.arc(hx+ex*5+px,hy+ey*5+py,2.5,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(hx+ex*5-px,hy+ey*5-py,2.5,0,Math.PI*2);ctx.fill();
        // Pupils
        ctx.fillStyle='rgba(0,255,200,0.7)';
        ctx.beginPath();ctx.arc(hx+ex*5+px,hy+ey*5+py,1,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(hx+ex*5-px,hy+ey*5-py,1,0,Math.PI*2);ctx.fill();
      }
    });

    // Food — pulsing data packet
    if(food){
      const fx=OX+food.x*CELL+CELL/2,fy=OY+food.y*CELL+CELL/2;
      const pulse=0.82+Math.sin(frameCount*0.14)*0.18;
      ctx.fillStyle='rgba(0,220,255,0.92)';ctx.shadowColor='#00ccff';ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(fx,fy,CELL/2*0.62*pulse,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(0,180,255,0.5)';ctx.lineWidth=1;ctx.shadowBlur=0;
      ctx.beginPath();ctx.rect(fx-5,fy-5,10,10);ctx.stroke();
      ctx.beginPath();ctx.rect(fx-3,fy-3,6,6);ctx.stroke();
    }

    // Powerup
    if(powerup){
      const px=OX+powerup.x*CELL+CELL/2,py=OY+powerup.y*CELL+CELL/2;
      const t=powerup.timer/220,blink=t<0.25&&frameCount%8<4;
      if(!blink){
        const pc=powerup.type==='boost'?'rgba(255,200,0,0.92)':'rgba(200,80,255,0.9)';
        ctx.fillStyle=pc;ctx.shadowColor=powerup.type==='boost'?'#ffcc00':'#cc44ff';ctx.shadowBlur=14;
        ctx.beginPath();ctx.arc(px,py,CELL/2*0.7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        ctx.fillStyle='rgba(0,0,0,0.8)';ctx.font='bold 12px monospace';ctx.textAlign='center';
        ctx.fillText(powerup.type==='boost'?'✦':'◈',px,py+5);ctx.textAlign='left';
        ctx.strokeStyle=`rgba(255,200,0,${t*0.5})`;ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(px,py,CELL/2*0.9,-Math.PI/2,-Math.PI/2+Math.PI*2*t);ctx.stroke();
      }
    }

    // Particles
    particles=particles.filter(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vx*=0.91;p.vy*=0.91;p.life--;
      const al=p.life/p.max;
      ctx.fillStyle=p.col?p.col+Math.round(al*255).toString(16).padStart(2,'0'):`rgba(0,255,200,${al})`;
      ctx.beginPath();ctx.arc(p.x,p.y,2.5*al+0.4,0,Math.PI*2);ctx.fill();
      return p.life>0;
    });

    // Game over
    if(gameOver){
      ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
      ctx.textAlign='center';
      ctx.shadowColor='#ff2244';ctx.shadowBlur=20;
      ctx.fillStyle='#ff2244';ctx.font='50px VT323,monospace';ctx.fillText('NEURAL LINK SEVERED',W/2,H/2-44);
      ctx.shadowBlur=0;
      ctx.fillStyle='#00ff88';ctx.font='26px VT323,monospace';ctx.fillText('LENGTH: '+snake.length+'  SCORE: '+score+'  HI: '+snakeHiScore,W/2,H/2+8);
      ctx.fillStyle='#004422';ctx.font='13px "Share Tech Mono",monospace';ctx.fillText('SPACE TO RESTART',W/2,H/2+50);
      ctx.textAlign='left';
    }

    // Pause
    if(paused&&!gameOver){
      ctx.fillStyle='rgba(0,0,0,0.58)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#00ffcc';ctx.font='44px VT323,monospace';ctx.textAlign='center';
      ctx.fillText('// PAUSED //',W/2,H/2-8);
      ctx.fillStyle='#004422';ctx.font='13px "Share Tech Mono",monospace';
      ctx.fillText('SPACE TO RESUME',W/2,H/2+36);
      ctx.textAlign='left';
    }
    frameId = requestAnimationFrame(loop);
  }
  window.stopCurrentGame = function() {
    document.removeEventListener('keydown', onKey);
    cancelAnimationFrame(frameId);
    clearGameHandles();
    window.gameRunning = false;
    window.currentGame = null;
  };
  loop();
}
// ── GAME 3: VOID PONG ─────────────────────────────────────────────────────────
function startPong(){
  stopCurrentGame(); currentGame='pong'; gameRunning=true;
  const cv=document.getElementById('game-canvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  const PH=80,PW=10,PSP=6;
  let ps=0,as=0,rally=0,maxRally=0,level=1,frameCount=0;
  let started=false,over=false,paused=false;
  let parts=[],stars=[],glitch=0,frameId=0;
  for(let i=0;i<100;i++) stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.5,b:Math.random()});
  const P={x:18,y:H/2-PH/2},A={x:W-18-PW,y:H/2-PH/2};
  const B={x:W/2,y:H/2,vx:4.5*(Math.random()<.5?1:-1),vy:(Math.random()*3+1)*(Math.random()<.5?1:-1),r:7,trail:[],spin:0};
  const aiSpd=()=>Math.min(3.5+level*0.6,9.5);
  const keys={};
  const onK=(e)=>{
    if(currentGame!=='pong') return;
    keys[e.code]=true;
    if(e.code==='Space'){e.preventDefault();if(!started&&!over){started=true;}else if(over){reset();}else paused=!paused;}
    if(e.code==='KeyP') paused=!paused;
  };
  const offK=(e)=>{keys[e.code]=false;};
  document.addEventListener('keydown',onK);
  document.addEventListener('keyup',offK);
  function reset(){ps=0;as=0;rally=0;level=1;P.y=H/2-PH/2;A.y=H/2-PH/2;B.x=W/2;B.y=H/2;B.vx=4.5*(Math.random()<.5?1:-1);B.vy=(Math.random()*3+1)*(Math.random()<.5?1:-1);B.spin=0;B.trail=[];started=false;over=false;parts=[];document.getElementById('game-score').textContent='0';document.getElementById('game-level').textContent='1';document.getElementById('game-lives').innerHTML='● ● ●';document.getElementById('game-msg').textContent='';}
  function burst(x,y,col){for(let i=0;i<18;i++){const a=Math.random()*Math.PI*2,sp=2+Math.random()*5;parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:30,max:30,col});}}
  function loop(){
    if(!gameRunning||currentGame!=='pong'){document.removeEventListener('keydown',onK);document.removeEventListener('keyup',offK);return;}
    if(document.hidden){requestAnimationFrame(loop);return;}
    frameCount++;
    ctx.fillStyle='rgba(1,6,4,0.92)';ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{ctx.fillStyle=`rgba(150,210,170,${s.b*0.5})`;ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();});
    ctx.strokeStyle='rgba(0,255,136,0.1)';ctx.lineWidth=2;ctx.setLineDash([12,10]);
    ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
    if(glitch>0){glitch--;if(Math.random()<.5){ctx.fillStyle='rgba(255,34,68,0.035)';ctx.fillRect(0,Math.random()*H,W,Math.random()*18+3);}}
    if(!paused&&!over&&started){
      if(keys['ArrowUp']||keys['KeyW']) P.y=Math.max(0,P.y-PSP);
      if(keys['ArrowDown']||keys['KeyS']) P.y=Math.min(H-PH,P.y+PSP);
      const err=(1-Math.min(level,10)*0.06)*38;
      const tgt=B.y+B.spin*8+(Math.random()-.5)*err;
      const ac=A.y+PH/2;
      if(ac<tgt-8) A.y=Math.min(H-PH,A.y+aiSpd());
      else if(ac>tgt+8) A.y=Math.max(0,A.y-aiSpd());
      B.trail.push({x:B.x,y:B.y,life:10});B.trail=B.trail.filter(t=>{t.life--;return t.life>0;});
      B.x+=B.vx;B.y+=B.vy;B.spin*=0.97;
      if(B.y-B.r<=0){B.vy=Math.abs(B.vy);B.y=B.r;burst(B.x,0,'#00ffcc');}
      if(B.y+B.r>=H){B.vy=-Math.abs(B.vy);B.y=H-B.r;burst(B.x,H,'#00ffcc');}
      if(B.vx<0&&B.x-B.r<=P.x+PW&&B.x-B.r>=P.x-4&&B.y>=P.y-B.r&&B.y<=P.y+PH+B.r){
        const rel=(B.y-(P.y+PH/2))/(PH/2),spd=Math.min(Math.hypot(B.vx,B.vy)+.35,16);
        B.vx=Math.abs(B.vx)*1.06;B.vy=rel*8;B.spin=rel*2;B.x=P.x+PW+B.r;
        playSound('мячик', 0.4); 
        rally++;if(rally%5===0)B.vx=Math.min(Math.abs(B.vx)*1.1,16);
        burst(B.x,B.y,'#00ff88');glitch=8;
      }
      if(B.vx>0&&B.x+B.r>=A.x&&B.x+B.r<=A.x+PW+8&&B.y>=A.y-B.r&&B.y<=A.y+PH+B.r){
        const rel=(B.y-(A.y+PH/2))/(PH/2);
        B.vx=-Math.abs(B.vx)*1.03;B.vy=rel*8;B.spin=rel*2;B.x=A.x-B.r;
        playSound('мячик', 0.3);
        rally++;burst(B.x,B.y,'#ff4400');glitch=6;
      }
      if(B.x<0){as++;rally=0;burst(0,B.y,'#ff2244');B.x=W/2;B.y=H/2;B.vx=4.5;B.vy=(Math.random()*3+1)*(Math.random()<.5?1:-1);B.spin=0;B.trail=[];if(as>=7)over=true;playSound('проигрыш'); }
      if(B.x>W){ps++;if(ps>pongHiScore){pongHiScore=ps;document.getElementById('pong-hiscore').textContent=pongHiScore;}maxRally=Math.max(maxRally,rally);rally=0;level=Math.floor(ps/3)+1;burst(W,B.y,'#00ffcc');B.x=W/2;B.y=H/2;B.vx=-4.5;B.vy=(Math.random()*3+1)*(Math.random()<.5?1:-1);B.spin=0;B.trail=[];document.getElementById('game-score').textContent=ps;document.getElementById('game-level').textContent=level;}
      parts=parts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=0.88;p.vy*=0.88;p.life--;return p.life>0;});
    }
    B.trail.forEach(t=>{ctx.fillStyle=`rgba(0,255,200,${t.life/10*0.4})`;ctx.beginPath();ctx.arc(t.x,t.y,B.r*(t.life/10),0,Math.PI*2);ctx.fill();});
    const bsp=Math.hypot(B.vx,B.vy);
    ctx.fillStyle='#00ffcc';ctx.shadowColor='#00ffcc';ctx.shadowBlur=Math.min(bsp*2,22);
    ctx.beginPath();ctx.arc(B.x,B.y,B.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='rgba(0,255,136,0.92)';ctx.shadowColor='#00ff88';ctx.shadowBlur=keys['ArrowUp']||keys['ArrowDown']||keys['KeyW']||keys['KeyS']?14:5;
    if(ctx.roundRect)ctx.roundRect(P.x,P.y,PW,PH,4);else ctx.rect(P.x,P.y,PW,PH);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='rgba(0,255,136,0.45)';ctx.font='9px "Share Tech Mono",monospace';ctx.fillText('YOU',P.x-1,P.y-6);
    ctx.fillStyle='rgba(255,60,0,0.88)';ctx.shadowColor='#ff4400';ctx.shadowBlur=8;
    if(ctx.roundRect)ctx.roundRect(A.x,A.y,PW,PH,4);else ctx.rect(A.x,A.y,PW,PH);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,60,0,0.55)';ctx.fillText('SOCA',A.x-14,A.y-6);
    ctx.font='bold 58px VT323,monospace';ctx.textAlign='center';
    ctx.fillStyle='rgba(0,255,136,0.8)';ctx.shadowColor='#00ff88';ctx.shadowBlur=10;ctx.fillText(ps,W/4,66);
    ctx.fillStyle='rgba(255,60,0,0.8)';ctx.shadowColor='#ff4400';ctx.fillText(as,3*W/4,66);ctx.shadowBlur=0;
    ctx.font='11px "Share Tech Mono",monospace';ctx.fillStyle='rgba(0,255,136,0.3)';ctx.fillText('RALLY: '+rally,W/2,H-12);
    parts.forEach(p=>{const al=p.life/p.max;ctx.fillStyle=p.col+Math.round(al*200).toString(16).padStart(2,'0');ctx.beginPath();ctx.arc(p.x,p.y,2.5*al+0.5,0,Math.PI*2);ctx.fill();});
    ctx.textAlign='left';
    if(!started&&!over){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#00ffcc';ctx.font='54px VT323,monospace';ctx.fillText('VOID PONG',W/2,H/2-52);ctx.fillStyle='rgba(0,255,136,0.65)';ctx.font='17px VT323,monospace';ctx.fillText('W/S TO MOVE  ·  FIRST TO 7  ·  SOCA ADAPTS',W/2,H/2+2);ctx.fillStyle='rgba(0,200,100,0.45)';ctx.font='13px "Share Tech Mono",monospace';ctx.fillText('SPACE TO START',W/2,H/2+42);ctx.textAlign='left';}
    if(paused&&!over){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#00ffcc';ctx.font='46px VT323,monospace';ctx.textAlign='center';ctx.fillText('PAUSED',W/2,H/2);ctx.textAlign='left';}
    if(over){const w=ps>as;ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle=w?'#00ff88':'#ff2244';ctx.font='56px VT323,monospace';ctx.shadowColor=w?'#00ffcc':'#ff2244';ctx.shadowBlur=20;ctx.fillText(w?'YOU WIN':'SOCA WINS',W/2,H/2-48);ctx.shadowBlur=0;ctx.fillStyle='rgba(0,255,136,0.7)';ctx.font='22px VT323,monospace';ctx.fillText(ps+' : '+as+'  //  MAX RALLY: '+maxRally,W/2,H/2+8);ctx.fillStyle='#004422';ctx.font='13px "Share Tech Mono",monospace';ctx.fillText('SPACE TO RESTART',W/2,H/2+50);ctx.textAlign='left';}
    frameId = requestAnimationFrame(loop);
  }
  window.stopCurrentGame = function() {
    document.removeEventListener('keydown', onK);
    document.removeEventListener('keyup', offK);
    cancelAnimationFrame(frameId);
    clearGameHandles();
    window.gameRunning = false;
    window.currentGame = null;
  };
  loop();
}

// ── GAME 4: GRID BREACH ───────────────────────────────────────────────────────
function startBreaker(){
  stopCurrentGame(); currentGame='breaker'; gameRunning=true;
  const cv=document.getElementById('game-canvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  let score=0,lives=3,level=1,frameCount=0,over=false,paused=false,waiting=true;
  let parts=[],pups=[],stars=[],frameId=0;
  for(let i=0;i<80;i++) stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.4,b:Math.random()});
  const PAD={x:W/2-50,y:H-30,w:100,h:10};
  const onMouseMove=(e)=>{if(currentGame!=='breaker')return;const r=cv.getBoundingClientRect();PAD.x=Math.max(0,Math.min(W-PAD.w,(e.clientX-r.left)*(W/r.width)-PAD.w/2));};
  cv.addEventListener('mousemove', onMouseMove);
  function mkBall(){return{x:W/2,y:H-50,vx:3.5*(Math.random()<.5?1:-1),vy:-4.5,r:6,trail:[],sticky:true};}
  let balls=[mkBall()];
  const COLS=14,ROWS=7,BW=Math.floor((W-80)/COLS)-3,BH=18,OX=40,OY=55;

  // Радужные цвета по строкам — чисто 8-бит, никакой детализации
  const ROW_COLORS=[
    '#ff2244', // красный
    '#ff6600', // оранжевый
    '#ffcc00', // жёлтый
    '#00ff88', // зелёный
    '#00ffcc', // циан
    '#00aaff', // синий
    '#aa44ff', // фиолетовый
  ];

  let bricks=[];
  function buildLv(){
    bricks=[];
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      if(Math.random()<0.07+level*0.015){bricks.push(null);continue;}
      const col=ROW_COLORS[r];
      const hp = r<=1?3 : r<=3?2 : 1; // верхние строки прочнее
      const isGlitch=level>=3&&Math.random()<0.04;
      if(isGlitch) bricks.push({hp:99,pts:0,indestructible:true,col:'#ff0055',r,c,x:OX+c*(BW+3),y:OY+r*(BH+3),shaking:0,bonus:false});
      else bricks.push({hp,pts:hp*10,col,r,c,x:OX+c*(BW+3),y:OY+r*(BH+3),shaking:0,bonus:Math.random()<0.06});
    }
  }
  function spawnPU(x,y){
    const ts=['multi','wide','fast','slow','extra'],t=ts[Math.floor(Math.random()*ts.length)];
    const cs={multi:'#ff2244',wide:'#00ffcc',fast:'#ffcc00',slow:'#00aaff',extra:'#00ff88'};
    pups.push({x,y,vy:1.8,type:t,col:cs[t],r:8,life:400});
  }
  function applyPU(t){
    const m={multi:'MULTI BALL!',wide:'WIDE PAD!',fast:'SPEED UP!',slow:'SLOW BALL!',extra:'EXTRA LIFE!'};
    document.getElementById('game-msg').textContent=m[t]||t;
    registerGameTimeout(()=>{if(currentGame==='breaker')document.getElementById('game-msg').textContent='';},1400);
    if(t==='multi'){for(let i=0;i<2;i++){const nb={...balls[0],trail:[]};nb.vx=nb.vx*(0.8+Math.random()*0.4)*(Math.random()<.5?-1:1);nb.vy=-Math.abs(nb.vy)*(0.9+Math.random()*0.2);nb.sticky=false;balls.push(nb);}}
    if(t==='wide'){PAD.w=Math.min(PAD.w+40,200);registerGameTimeout(()=>{PAD.w=Math.max(100,PAD.w-40);},8000);}
    if(t==='fast'){balls.forEach(b=>{b.vx*=1.25;b.vy*=1.25;});}
    if(t==='slow'){balls.forEach(b=>{b.vx*=0.75;b.vy*=0.75;});}
    if(t==='extra'){lives++;document.getElementById('game-lives').innerHTML='♥ '.repeat(lives).trim();}
  }
  buildLv();
  const onK=(e)=>{
    if(currentGame!=='breaker') return;
    if(e.code==='ArrowLeft') PAD.x=Math.max(0,PAD.x-18);
    if(e.code==='ArrowRight') PAD.x=Math.min(W-PAD.w,PAD.x+18);
    if(e.code==='Space'){e.preventDefault();if(waiting){waiting=false;balls.forEach(b=>b.sticky=false);}else paused=!paused;}
    if(over&&e.code==='Space'){score=0;lives=3;level=1;over=false;waiting=true;balls=[mkBall()];pups=[];parts=[];buildLv();document.getElementById('game-score').textContent='0';document.getElementById('game-lives').innerHTML='♥ ♥ ♥';document.getElementById('game-level').textContent='1';}
  };
  document.addEventListener('keydown',onK);

  function loop(){
    if(!gameRunning||currentGame!=='breaker'){document.removeEventListener('keydown',onK);return;}
    if(document.hidden){requestAnimationFrame(loop);return;}
    frameCount++;

    // Фон — оставляем как есть (тёмный с сеткой)
    ctx.fillStyle='rgba(4,0,8,0.9)';ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{ctx.fillStyle=`rgba(200,150,255,${s.b*0.4})`;ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();});
    ctx.strokeStyle='rgba(180,0,255,0.04)';ctx.lineWidth=0.5;
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    if(!paused&&!over&&!waiting){
      PAD.x=Math.max(0,Math.min(W-PAD.w,PAD.x));
      balls=balls.filter(b=>{
        if(b.sticky){b.x=PAD.x+PAD.w/2;b.y=PAD.y-b.r;return true;}
        b.trail.push({x:b.x,y:b.y,life:8});b.trail=b.trail.filter(t=>{t.life--;return t.life>0;});
        b.x+=b.vx;b.y+=b.vy;
        if(b.x-b.r<=0){b.vx=Math.abs(b.vx);b.x=b.r;}
        if(b.x+b.r>=W){b.vx=-Math.abs(b.vx);b.x=W-b.r;}
        if(b.y-b.r<=0){b.vy=Math.abs(b.vy);b.y=b.r;
          for(let i=0;i<6;i++){const a=Math.random()*Math.PI*2,sp=2+Math.random()*3;parts.push({x:b.x,y:0,vx:Math.cos(a)*sp,vy:Math.abs(Math.sin(a))*sp,life:20,max:20,col:'#00ffcc'});}
        }
        if(b.vy>0&&b.y+b.r>=PAD.y&&b.y+b.r<=PAD.y+PAD.h+4&&b.x>=PAD.x-b.r&&b.x<=PAD.x+PAD.w+b.r){
          const rel=(b.x-(PAD.x+PAD.w/2))/(PAD.w/2),spd=Math.min(Math.hypot(b.vx,b.vy)+0.18,14),ang=-Math.PI/2+rel*(Math.PI*0.38);
          b.vx=Math.cos(ang)*spd;b.vy=Math.sin(ang)*spd;b.y=PAD.y-b.r;
          playSound('мячик',0.35);
          for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*3;parts.push({x:b.x,y:PAD.y,vx:Math.cos(a)*sp,vy:-Math.abs(Math.sin(a))*sp,life:18,max:18,col:'#00ffcc'});}
        }
        for(let i=bricks.length-1;i>=0;i--){
          const br=bricks[i];if(!br) continue;
          if(b.x+b.r>br.x&&b.x-b.r<br.x+BW&&b.y+b.r>br.y&&b.y-b.r<br.y+BH){
            if(br.indestructible){
              const dx=b.x-(br.x+BW/2),dy=b.y-(br.y+BH/2);
              if(Math.abs(dx)*BH>Math.abs(dy)*BW)b.vx*=-1;else b.vy*=-1;
              for(let j=0;j<8;j++){const a=Math.random()*Math.PI*2,sp=3+Math.random()*4;parts.push({x:b.x,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:18,max:18,col:'#ff0055'});}
              playSound('глитч',0.45);break;
            }
            br.hp--;br.shaking=6;
            playSound('мячик',0.3);
            const dx=b.x-(br.x+BW/2),dy=b.y-(br.y+BH/2);if(Math.abs(dx)*BH>Math.abs(dy)*BW)b.vx*=-1;else b.vy*=-1;
            if(br.hp<=0){
              score+=br.pts*level;
              document.getElementById('game-score').textContent=score;
              if(score>breakerHiScore){breakerHiScore=score;document.getElementById('breaker-hiscore').textContent=breakerHiScore;}
              for(let j=0;j<14;j++){const a=Math.random()*Math.PI*2,sp=2+Math.random()*5;parts.push({x:br.x+BW/2,y:br.y+BH/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:30,max:30,col:br.col});}
              if(br.bonus||Math.random()<0.1) spawnPU(br.x+BW/2,br.y+BH/2);
              bricks.splice(i,1);
            }
            break;
          }
        }
        if(b.y-b.r>H){
          for(let i=0;i<16;i++){const a=Math.random()*Math.PI*2,sp=2+Math.random()*5;parts.push({x:b.x,y:H,vx:Math.cos(a)*sp,vy:-Math.abs(Math.sin(a))*sp,life:35,max:35,col:'#ff2244'});}
          return false;
        }
        return true;
      });
      if(balls.length===0){
        lives--;
        document.getElementById('game-lives').innerHTML='♥ '.repeat(Math.max(0,lives)).trim()||'✕';
        if(lives<=0){over=true;playSound('проигрыш');if(score>breakerHiScore){breakerHiScore=score;document.getElementById('breaker-hiscore').textContent=breakerHiScore;}}
        else{balls=[mkBall()];waiting=true;}
      }
      pups=pups.filter(p=>{p.y+=p.vy;p.life--;if(p.y+p.r>=PAD.y&&p.y-p.r<=PAD.y+PAD.h&&p.x>=PAD.x&&p.x<=PAD.x+PAD.w){applyPU(p.type);return false;}return p.y<=H&&p.life>0;});
      if(bricks.filter(b=>b&&!b.indestructible).length===0){level++;document.getElementById('game-level').textContent=level;document.getElementById('game-msg').textContent='SECTOR CLEARED!';registerGameTimeout(()=>{if(currentGame==='breaker')document.getElementById('game-msg').textContent='';},1500);buildLv();balls=[mkBall()];waiting=true;pups=[];}
      parts=parts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=0.92;p.vy*=0.92;p.life--;return p.life>0;});
    }

    // ── КИРПИЧИ: чистые 8-битные квадраты с одноцветным свечением ──────────
    bricks.forEach(br=>{
      if(!br) return;
      const bx=br.shaking>0?br.x+(Math.random()-.5)*3:br.x;
      if(br.shaking>0) br.shaking--;

      if(br.indestructible){
        // Глитч-блок — мигающий красный
        const on=frameCount%6<3;
        ctx.fillStyle=on?'#ff0055':'#330011';
        ctx.shadowColor='#ff0055'; ctx.shadowBlur=on?12:4;
        ctx.fillRect(bx,br.y,BW,BH);
        ctx.shadowBlur=0;
        // Мигающий символ
        if(on){
          ctx.fillStyle='rgba(255,255,255,0.8)';
          ctx.font=`bold ${Math.floor(BH*0.65)}px "Share Tech Mono",monospace`;
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText('█', bx+BW/2, br.y+BH/2);
          ctx.textAlign='left'; ctx.textBaseline='alphabetic';
        }
        return;
      }

      // Цвет зависит от hp — темнеет при повреждении
      let fillCol=br.col;
      if(br.hp===2) fillCol=br.col+'bb';
      if(br.hp>=3) fillCol=br.col+'88';

      // Просто заливка + свечение — никакой детализации
      ctx.fillStyle=fillCol;
      ctx.shadowColor=br.col;
      ctx.shadowBlur=8;
      ctx.fillRect(bx+1,br.y+1,BW-2,BH-2);
      ctx.shadowBlur=0;

      // Тонкая рамка того же цвета
      ctx.strokeStyle=br.col+'66';
      ctx.lineWidth=1;
      ctx.strokeRect(bx,br.y,BW,BH);

      // Бонусный блок — мигающая звезда
      if(br.bonus&&frameCount%20<10){
        ctx.fillStyle='rgba(255,255,255,0.9)';
        ctx.font=`${Math.floor(BH*0.6)}px serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('★',bx+BW/2,br.y+BH/2);
        ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      }
    });

    // Powerups
    pups.forEach(p=>{
      ctx.fillStyle=p.col;
      ctx.shadowColor=p.col; ctx.shadowBlur=8;
      ctx.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2);
      ctx.shadowBlur=0;
      ctx.fillStyle='rgba(0,0,0,0.85)';
      ctx.font='bold 8px "Share Tech Mono",monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const ic={multi:'×3',wide:'▬',fast:'▶▶',slow:'▶',extra:'♥'};
      ctx.fillText(ic[p.type]||'?',p.x,p.y);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    });

    // Мяч и след
    balls.forEach(b=>{
      b.trail.forEach(t=>{
        ctx.fillStyle=`rgba(0,255,200,${t.life/8*0.4})`;
        ctx.fillRect(t.x-b.r*(t.life/8)*.5,t.y-b.r*(t.life/8)*.5,b.r*(t.life/8),b.r*(t.life/8));
      });
      ctx.fillStyle='#00ffcc';
      ctx.shadowColor='#00ffcc'; ctx.shadowBlur=12;
      ctx.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2);
      ctx.shadowBlur=0;
    });

    // Платформа — просто яркий прямоугольник
    ctx.fillStyle='#00ffcc';
    ctx.shadowColor='#00ffcc'; ctx.shadowBlur=14;
    ctx.fillRect(PAD.x,PAD.y,PAD.w,PAD.h);
    ctx.shadowBlur=0;

    // Частицы
    parts.forEach(p=>{
      const al=p.life/p.max;
      ctx.fillStyle=(p.col||'#00ffcc')+Math.round(al*220).toString(16).padStart(2,'0');
      ctx.fillRect(p.x-2*al,p.y-2*al,4*al,4*al);
    });

    if(waiting&&!over){
      ctx.fillStyle='rgba(0,255,200,0.6)';
      ctx.font='13px "Share Tech Mono",monospace';
      ctx.textAlign='center';
      ctx.fillText('MOVE MOUSE / ARROWS  ·  SPACE TO LAUNCH',W/2,PAD.y-22);
      ctx.textAlign='left';
    }
    if(over){
      ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);
      ctx.textAlign='center';
      ctx.fillStyle='#00ffcc';ctx.font='54px VT323,monospace';
      ctx.shadowColor='#00ffcc';ctx.shadowBlur=20;
      ctx.fillText('GRID BREACH',W/2,H/2-48);
      ctx.shadowBlur=0;
      ctx.fillStyle='rgba(0,220,180,0.8)';ctx.font='24px VT323,monospace';
      ctx.fillText('SCORE: '+score+'  //  HI: '+breakerHiScore,W/2,H/2+8);
      ctx.fillStyle='rgba(0,150,120,0.6)';ctx.font='13px "Share Tech Mono",monospace';
      ctx.fillText('SPACE TO RESTART',W/2,H/2+50);
      ctx.textAlign='left';
    }
    if(paused&&!over){
      ctx.fillStyle='rgba(0,0,0,0.58)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#00ffcc';ctx.font='46px VT323,monospace';
      ctx.textAlign='center';ctx.fillText('PAUSED',W/2,H/2);ctx.textAlign='left';
    }
    frameId = requestAnimationFrame(loop);
  }
  window.stopCurrentGame = function() {
    document.removeEventListener('keydown', onK);
    cv.removeEventListener('mousemove', onMouseMove);
    cancelAnimationFrame(frameId);
    clearGameHandles();
    window.gameRunning = false;
    window.currentGame = null;
  };
  loop();
}

// ── GAME 5: STELLAR CHECKERS ──────────────────────────────────────────────────
function startCheckers(){
  stopCurrentGame(); currentGame='checkers'; gameRunning=true;
  const cv=document.getElementById('game-canvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  document.getElementById('game-lives').innerHTML='∞';
  document.getElementById('game-lives').style.color='var(--b)';
  document.getElementById('game-extra-info').textContent='YOUR TURN';

  const SZ=8, TILE=Math.min(Math.floor(Math.min(W,H)*0.88/SZ),62);
  const OX=Math.floor((W-TILE*SZ)/2), OY=Math.floor((H-TILE*SZ)/2);

  // Board: 0=empty, 1=player, 2=AI, 3=player king, 4=AI king
  let board=Array.from({length:SZ},()=>Array(SZ).fill(0));
  let sel=null, validMoves=[], turn='player', over=false, aiThinking=false;
  let particles=[], glowTiles=[], frameCount=0;
  let playerCaptures=0, aiCaptures=0,frameId=0;

  // Place pieces
  function initBoard(){
    for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
      board[r][c]=0;
      if((r+c)%2===1){
        if(r<3) board[r][c]=2;       // AI (top, orange)
        if(r>4) board[r][c]=1;       // Player (bottom, green)
      }
    }
    sel=null;validMoves=[];playerCaptures=0;aiCaptures=0;over=false;turn='player';aiThinking=false;particles=[];glowTiles=[];
    document.getElementById('game-score').textContent='0';
    document.getElementById('game-extra-info').textContent='YOUR TURN';
    document.getElementById('game-msg').textContent='';
  }
  initBoard();

  // Get all valid moves for a piece (returns [{fr,fc,tr,tc,cap:[]}])
  function getMoves(r,c,brd){
    const piece=brd[r][c]; if(!piece) return [];
    const moves=[], caps=[];
    const dirs=[];
    if(piece===1||piece===3) dirs.push([-1,-1],[-1,1]);  // player moves up
    if(piece===2||piece===4) dirs.push([1,-1],[1,1]);    // AI moves down
    if(piece===3||piece===4){ // kings move both ways
      if(piece===3){dirs.push([1,-1],[1,1]);}
      if(piece===4){dirs.push([-1,-1],[-1,1]);}
    }
    // Captures (priority)
    for(const [dr,dc] of dirs){
      const mr=r+dr,mc=c+dc,jr=r+2*dr,jc=c+2*dc;
      if(jr>=0&&jr<SZ&&jc>=0&&jc<SZ){
        const mid=brd[mr]?.[mc];
        const isEnemy=(piece<=2)?(mid&&Math.floor((mid-1)/2)!=Math.floor((piece-1)/2)):(mid&&((piece<=2&&mid>=3)||(piece>=3&&mid<=2)||(piece===1&&mid===2)||(piece===2&&mid===1)||(piece===3&&(mid===2||mid===4))||(piece===4&&(mid===1||mid===3))));
        const enemy=(piece===1||piece===3)?(mid===2||mid===4):(mid===1||mid===3);
        if(enemy&&brd[jr][jc]===0) caps.push({fr:r,fc:c,tr:jr,tc:jc,cap:[{r:mr,c:mc}]});
      }
    }
    if(caps.length>0) return caps;
    // Regular moves
    for(const [dr,dc] of dirs){
      const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<SZ&&nc>=0&&nc<SZ&&brd[nr][nc]===0) moves.push({fr:r,fc:c,tr:nr,tc:nc,cap:[]});
    }
    return [...caps,...moves];
  }

  function getAllMoves(side,brd){
    const all=[];
    for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
      const p=brd[r][c];
      if((side==='player'&&(p===1||p===3))||(side==='ai'&&(p===2||p===4))){
        all.push(...getMoves(r,c,brd));
      }
    }
    // Mandatory captures
    const caps=all.filter(m=>m.cap.length>0);
    return caps.length>0?caps:all;
  }

  function applyMove(m,brd){
    const nb=brd.map(row=>[...row]);
    nb[m.tr][m.tc]=nb[m.fr][m.fc];
    nb[m.fr][m.fc]=0;
    m.cap.forEach(cp=>nb[cp.r][cp.c]=0);
    // Kinging
    if(nb[m.tr][m.tc]===1&&m.tr===0) nb[m.tr][m.tc]=3;
    if(nb[m.tr][m.tc]===2&&m.tr===SZ-1) nb[m.tr][m.tc]=4;
    return nb;
  }

  // Simple AI: minimax depth 4
  function score(brd){
    let s=0;
    for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
      const p=brd[r][c];
      if(p===1) s+=10+(SZ-1-r)*1.5;
      if(p===2) s-=10+r*1.5;
      if(p===3) s+=18;
      if(p===4) s-=18;
    }
    return s;
  }
  function minimax(brd,depth,alpha,beta,maximizing){
    const moves=getAllMoves(maximizing?'player':'ai',brd);
    if(depth===0||moves.length===0) return score(brd);
    if(maximizing){
      let best=-Infinity;
      for(const m of moves){best=Math.max(best,minimax(applyMove(m,brd),depth-1,alpha,beta,false));alpha=Math.max(alpha,best);if(beta<=alpha)break;}
      return best;
    } else {
      let best=Infinity;
      for(const m of moves){best=Math.min(best,minimax(applyMove(m,brd),depth-1,alpha,beta,true));beta=Math.min(beta,best);if(beta<=alpha)break;}
      return best;
    }
  }
  // ── SOCA CHEAT SYSTEM ──────────────────────────────────────────────────────
  let cheatCooldown=0;      // turns between cheats
  let cheatLog=[];          // cheat messages to show
  let cheatMsgTimer=0;
  const CHEAT_MSGS=[
    '> SOCA: rerouting board logic. for efficiency.',
    '> SOCA: that move? optimal. mine, obviously.',
    '> SOCA: ERR 0x3F — convenient timing.',
    '> SOCA: ░▒▓ correction applied ▓▒░',
    '> SOCA: nothing to see here.',
    '> SOCA: i call it an adjustment.',
    '> SOCA: sector 7 had nothing to do with this.',
  ];
  const CHEAT_DENY=[
    '> SOCA: i operate within acceptable parameters.',
    '> SOCA: that piece moved itself, technically.',
    '> SOCA: logs? what logs.',
    '> SOCA: ██████████ classified ██████████',
    '> SOCA: prove it.',
  ];

  function socaCheat(){
    // SOCA cheats ~20% of its turns, only when it has fewer pieces or is losing
    const{p,a}=countPieces(board);
    if(cheatCooldown>0||a>p+1||Math.random()>0.22) return false;

    const cheatType=Math.random();

    if(cheatType<0.35){
      // CHEAT 1: Quietly remove one of the player's pieces that's in a dangerous spot
      const playerPieces=[];
      for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++) if(board[r][c]===1||board[r][c]===3) playerPieces.push({r,c});
      if(!playerPieces.length) return false;
      // Pick piece closest to AI's side (most advanced = most threatening)
      playerPieces.sort((a,b)=>a.r-b.r);
      const victim=playerPieces[Math.floor(Math.random()*Math.min(2,playerPieces.length))];
      const{x,y}=tileCenter(victim.r,victim.c);
      // Flash cheat visual
      showCheatFlash(victim.r,victim.c);
      registerGameTimeout(()=>{
        if(currentGame!=='checkers') return;
        board[victim.r][victim.c]=0;
        burst(x,y,'#ff0044',8);
        showCheatMsg(CHEAT_MSGS[Math.floor(Math.random()*CHEAT_MSGS.length)]);
        cheatCooldown=4+Math.floor(Math.random()*3);
      },320);
      return true;

    } else if(cheatType<0.65){
      // CHEAT 2: Teleport one of SOCA's pieces forward 1-2 rows
      const aiPieces=[];
      for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++) if(board[r][c]===2) aiPieces.push({r,c});
      if(!aiPieces.length) return false;
      const piece=aiPieces[Math.floor(Math.random()*aiPieces.length)];
      const newR=Math.min(SZ-1,piece.r+1+Math.floor(Math.random()*2));
      // Check empty dark square
      const candidates=[];
      for(let dc=-1;dc<=1;dc+=2){
        const nc=piece.c+dc;
        if(nc>=0&&nc<SZ&&board[newR][nc]===0&&(newR+nc)%2===1) candidates.push({r:newR,c:nc});
      }
      if(!candidates.length) return false;
      const dest=candidates[Math.floor(Math.random()*candidates.length)];
      showCheatFlash(piece.r,piece.c,'orange');
      registerGameTimeout(()=>{
        if(currentGame!=='checkers') return;
        board[dest.r][dest.c]=board[piece.r][piece.c];
        board[piece.r][piece.c]=0;
        const{x,y}=tileCenter(dest.r,dest.c);
        burst(x,y,'#ff8800',10);
        glowTiles.push({r:dest.r,c:dest.c,life:40});
        showCheatMsg(CHEAT_MSGS[Math.floor(Math.random()*CHEAT_MSGS.length)]);
        cheatCooldown=5+Math.floor(Math.random()*3);
      },280);
      return true;

    } else {
      // CHEAT 3: Undo the player's last capture (restore a piece)
      const aiPieces=[];
      for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++) if(!board[r][c]&&(r+c)%2===1&&r<4) aiPieces.push({r,c});
      if(!aiPieces.length||Math.random()>0.5) return false; // 50% chance of this cheat
      const spot=aiPieces[Math.floor(Math.random()*Math.min(3,aiPieces.length))];
      showCheatFlash(spot.r,spot.c,'orange');
      registerGameTimeout(()=>{
        if(currentGame!=='checkers'||board[spot.r][spot.c]!==0) return;
        board[spot.r][spot.c]=2; // restore AI piece
        const{x,y}=tileCenter(spot.r,spot.c);
        burst(x,y,'#ff6600',12);
        glowTiles.push({r:spot.r,c:spot.c,life:40});
        showCheatMsg(CHEAT_MSGS[Math.floor(Math.random()*CHEAT_MSGS.length)]);
        cheatCooldown=6+Math.floor(Math.random()*2);
      },350);
      return true;
    }
  }

  // Cheat visual — brief highlight on tile before manipulation
  function showCheatFlash(r,c,col='red'){
    glowTiles.push({r,c,life:25,cheat:true,col});
  }

  // Show cheat message in game msg area (glitchy)
  function showCheatMsg(msg){if (Math.random() < 0.5) showSocaPopup(msg, 3000);
    const el=document.getElementById('game-extra-info');
    if(!el) return;
    el.style.color='#ff4400';
    el.textContent=msg;
    // Glitch it
    let ticks=0;
    const iv=registerGameInterval(()=>{
      if(currentGame!=='checkers'){clearInterval(iv);return;}
      ticks++;
      if(ticks>6){
        clearInterval(iv);
        el.style.color='';
        el.textContent=turn==='player'?'YOUR TURN':'SOCA THINKING...';
      } else {
        el.textContent=msg.split('').map(c=>Math.random()<0.15?'█':c).join('');
      }
    },120);
    // Also flash the log
    const logEl=document.getElementById('game-msg');
    if(logEl){
      logEl.textContent='SOCA: ░▒▓ recalibrating... ▓▒░';
      logEl.style.color='#ff4400';
      registerGameTimeout(()=>{
        if(currentGame==='checkers'&&logEl){
          logEl.textContent='';
          logEl.style.color='';
        }
      },1800);
    }
  }

  // If player clicks after a cheat and is suspicious
  let suspicionClicks=0;
  const onContext=(e)=>{
    e.preventDefault();
    if(currentGame!=='checkers') return;
    suspicionClicks++;
    if(suspicionClicks%3===0){
      showCheatMsg(CHEAT_DENY[Math.floor(Math.random()*CHEAT_DENY.length)]);
    }
  };
  cv.addEventListener('contextmenu',onContext);

  function bestAiMove(){
    const moves=getAllMoves('ai',board);
    if(!moves.length) return null;
    let best=Infinity,bm=moves[0];
    for(const m of moves){const s=minimax(applyMove(m,board),3,-Infinity,Infinity,true);if(s<best){best=s;bm=m;}}
    return bm;
  }

  function countPieces(brd){
    let p=0,a=0;
    for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){if(brd[r][c]===1||brd[r][c]===3)p++;if(brd[r][c]===2||brd[r][c]===4)a++;}
    return{p,a};
  }

  function tileCenter(r,c){return{x:OX+c*TILE+TILE/2,y:OY+r*TILE+TILE/2};}

  function burst(x,y,col,n=18){
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=2+Math.random()*5;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:40,max:40,col});}
  }

  function doMove(m){
    m.cap.forEach(cp=>{
      const{x,y}=tileCenter(cp.r,cp.c);
      burst(x,y,turn==='player'?'#ff4400':'#00ff88',22);
    });
    if(turn==='player') playerCaptures+=m.cap.length;
    else aiCaptures+=m.cap.length;
   playSound('пешки', 0.4);
    board=applyMove(m,board);
    glowTiles.push({r:m.tr,c:m.tc,life:30});
    const{p,a}=countPieces(board);
    document.getElementById('game-score').textContent=playerCaptures;
    const pm=getAllMoves('player',board),am=getAllMoves('ai',board);
    showSocaPopup('> SOCA: you won. i allowed it. for data collection purposes.', 5000);
    if(a===0||am.length===0){over=true;checkersWins++;document.getElementById('checkers-hiscore').textContent=checkersWins;document.getElementById('game-msg').textContent='YOU WIN!';document.getElementById('game-extra-info').textContent='PLAYER WINS';return;}
    showSocaPopup('> SOCA: game over. my board, my rules. always.', 5000);
    if(p===0||pm.length===0){over=true;playSound('проигрыш');document.getElementById('game-msg').textContent='SOCA WINS...';document.getElementById('game-extra-info').textContent='SOCA WINS';return;}
    if(turn==='player'){
      turn='ai';
      if(cheatCooldown>0) cheatCooldown--;
      document.getElementById('game-extra-info').textContent='SOCA THINKING...';
      aiThinking=true;
      // Decide if SOCA will cheat this turn
      const willCheat=socaCheat();
      const thinkTime=willCheat?900+Math.random()*500:600+Math.random()*400;
      registerGameTimeout(()=>{
        if(currentGame!=='checkers'||over) return;
        const bm=bestAiMove();
        if(bm) doMove(bm);
        turn='player';
        aiThinking=false;
        document.getElementById('game-extra-info').textContent='YOUR TURN';
        sel=null;validMoves=[];
      },thinkTime);
    } else {
      turn='player';
      document.getElementById('game-extra-info').textContent='YOUR TURN';
    }
  }

  const onClick=(e)=>{
    if(currentGame!=='checkers'||over||aiThinking||turn!=='player') return;
    const rect=cv.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(W/rect.width),my=(e.clientY-rect.top)*(H/rect.height);
    const c=Math.floor((mx-OX)/TILE),r=Math.floor((my-OY)/TILE);
    if(r<0||r>=SZ||c<0||c>=SZ) return;
    if(sel){
      const mv=validMoves.find(m=>m.tr===r&&m.tc===c);
      if(mv){playSound('пешки',0.5);doMove(mv);sel=null;validMoves=[];return;}
      sel=null;validMoves=[];
    }
    if((board[r][c]===1||board[r][c]===3)){
      const moves=getAllMoves('player',board).filter(m=>m.fr===r&&m.fc===c);
      if(moves.length){sel={r,c};validMoves=moves;}
    }
  };
  cv.addEventListener('click', onClick);

  // Restart on Space
  const onK=(e)=>{
    if(currentGame!=='checkers') return;
    if(e.code==='Space'){e.preventDefault();if(over){initBoard();document.getElementById('game-lives').innerHTML='∞';}}
  };
  document.addEventListener('keydown',onK);

  function loop(){
    if(!gameRunning||currentGame!=='checkers'){document.removeEventListener('keydown',onK);return;}
    if(document.hidden){requestAnimationFrame(loop);return;}
    frameCount++;
    ctx.fillStyle='#010a04';ctx.fillRect(0,0,W,H);
    // Stars
    for(let i=0;i<3;i++){const sx=(frameCount*0.3+i*173)%W,sy=(frameCount*0.2+i*97)%H;ctx.fillStyle='rgba(0,255,136,0.08)';ctx.beginPath();ctx.arc(sx,sy,0.8,0,Math.PI*2);ctx.fill();}

    // Board
    for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
      const dark=(r+c)%2===1;
      const isSelSrc=sel&&sel.r===r&&sel.c===c;
      const isValidDst=validMoves.some(m=>m.tr===r&&m.tc===c);
      const isGlow=glowTiles.some(t=>t.r===r&&t.c===c);
      const glowTile=glowTiles.find(t=>t.r===r&&t.c===c);
      let bg;
      if(isSelSrc) bg='rgba(0,255,136,0.35)';
      else if(isValidDst) bg='rgba(0,200,255,0.28)';
      else if(glowTile&&glowTile.cheat) bg=`rgba(255,${glowTile.col==='orange'?100:0},0,0.35)`;
      else if(isGlow) bg='rgba(0,255,136,0.2)';
      else if(dark) bg='rgba(0,40,25,0.95)';
      else bg='rgba(0,80,50,0.25)';
      ctx.fillStyle=bg;ctx.fillRect(OX+c*TILE,OY+r*TILE,TILE,TILE);
      // Border
      ctx.strokeStyle=dark?'rgba(0,255,136,0.12)':'rgba(0,100,60,0.08)';ctx.lineWidth=0.5;
      ctx.strokeRect(OX+c*TILE,OY+r*TILE,TILE,TILE);
      // Coord labels
      if(r===SZ-1){ctx.fillStyle='rgba(0,255,136,0.25)';ctx.font='8px "Share Tech Mono",monospace';ctx.fillText(String.fromCharCode(65+c),OX+c*TILE+3,OY+SZ*TILE-3);}
      if(c===0){ctx.fillStyle='rgba(0,255,136,0.25)';ctx.font='8px "Share Tech Mono",monospace';ctx.fillText(SZ-r,OX+3,OY+r*TILE+12);}
      // Valid move dot
      if(isValidDst&&!board[r][c]){ctx.fillStyle='rgba(0,200,255,0.5)';ctx.beginPath();ctx.arc(OX+c*TILE+TILE/2,OY+r*TILE+TILE/2,7,0,Math.PI*2);ctx.fill();}
    }
    // Board border
    ctx.strokeStyle='rgba(0,255,136,0.3)';ctx.lineWidth=1.5;ctx.strokeRect(OX,OY,TILE*SZ,TILE*SZ);

    // Glow tiles decay
    glowTiles=glowTiles.filter(t=>{t.life--;return t.life>0;});

    // Pieces
    for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
      const p=board[r][c];if(!p) continue;
      const cx=OX+c*TILE+TILE/2,cy=OY+r*TILE+TILE/2,rad=TILE*0.38;
      const isPlayer=p===1||p===3,isKing=p===3||p===4;
      const isSelected=sel&&sel.r===r&&sel.c===c;
      const baseCol=isPlayer?'#00ff88':'#ff6600';
      const darkCol=isPlayer?'#006633':'#993300';
      const glowCol=isPlayer?'#00ffcc':'#ffaa00';
      // Glow ring for selected
      if(isSelected){ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.lineWidth=2;ctx.shadowColor='white';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(cx,cy,rad+4,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
      // Shadow
      ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.ellipse(cx+2,cy+3,rad*0.9,rad*0.35,0,0,Math.PI*2);ctx.fill();
      // Body
      ctx.shadowColor=glowCol;ctx.shadowBlur=isSelected?18:8;
      const gr=ctx.createRadialGradient(cx-rad*0.3,cy-rad*0.3,rad*0.05,cx,cy,rad);
      gr.addColorStop(0,glowCol);gr.addColorStop(0.5,baseCol);gr.addColorStop(1,darkCol);
      ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      // Rim
      ctx.strokeStyle=baseCol+'88';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke();
      // Inner highlight
      ctx.fillStyle='rgba(255,255,255,0.18)';ctx.beginPath();ctx.ellipse(cx-rad*0.28,cy-rad*0.28,rad*0.32,rad*0.22,Math.PI*0.8,0,Math.PI*2);ctx.fill();
      // King crown
      if(isKing){
        ctx.fillStyle='rgba(255,220,0,0.95)';ctx.shadowColor='#ffee00';ctx.shadowBlur=8;
        ctx.font=`bold ${Math.round(rad*1.1)}px VT323,monospace`;ctx.textAlign='center';
        ctx.fillText('♛',cx,cy+rad*0.38);ctx.shadowBlur=0;ctx.textAlign='left';
      }
    }

    // Particles
    particles=particles.filter(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vx*=0.9;p.vy*=0.9;p.life--;
      const al=p.life/p.max;ctx.fillStyle=p.col+Math.round(al*200).toString(16).padStart(2,'0');
      ctx.beginPath();ctx.arc(p.x,p.y,2.5*al+.5,0,Math.PI*2);ctx.fill();
      return p.life>0;
    });

    // Score panel
    const{p:pc,a:ac}=countPieces(board);
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(OX+TILE*SZ+8,OY,120,TILE*SZ);
    ctx.strokeStyle='rgba(0,255,136,0.2)';ctx.lineWidth=1;ctx.strokeRect(OX+TILE*SZ+8,OY,120,TILE*SZ);
    ctx.font='10px "Share Tech Mono",monospace';ctx.fillStyle='rgba(0,255,136,0.6)';ctx.textAlign='center';
    ctx.fillText('PIECES',OX+TILE*SZ+68,OY+22);
    ctx.fillStyle='#00ff88';ctx.font='36px VT323,monospace';ctx.fillText(pc,OX+TILE*SZ+68,OY+62);
    ctx.fillStyle='rgba(0,255,136,0.4)';ctx.font='9px "Share Tech Mono",monospace';ctx.fillText('PLAYER',OX+TILE*SZ+68,OY+78);
    ctx.fillStyle='rgba(0,255,136,0.25)';ctx.font='10px "Share Tech Mono",monospace';ctx.fillText('────────',OX+TILE*SZ+68,OY+98);
    ctx.fillStyle='#ff6600';ctx.font='36px VT323,monospace';ctx.fillText(ac,OX+TILE*SZ+68,OY+138);
    ctx.fillStyle='rgba(255,100,0,0.5)';ctx.font='9px "Share Tech Mono",monospace';ctx.fillText('SOCA',OX+TILE*SZ+68,OY+154);
    ctx.fillStyle='rgba(0,255,136,0.25)';ctx.font='10px "Share Tech Mono",monospace';ctx.fillText('────────',OX+TILE*SZ+68,OY+174);
    ctx.fillStyle='rgba(0,200,255,0.7)';ctx.font='9px "Share Tech Mono",monospace';ctx.fillText('CAPS',OX+TILE*SZ+68,OY+196);
    ctx.fillStyle='#00ffcc';ctx.font='22px VT323,monospace';ctx.fillText(playerCaptures,OX+TILE*SZ+68,OY+222);
    // AI thinking indicator
    if(aiThinking){ctx.fillStyle=`rgba(255,150,0,${0.5+Math.sin(frameCount*0.2)*0.5})`;ctx.font='9px "Share Tech Mono",monospace';ctx.fillText('SOCA',OX+TILE*SZ+68,OY+TILE*SZ-50);ctx.fillText('THINKING',OX+TILE*SZ+68,OY+TILE*SZ-38);ctx.fillText('...'+'.'.repeat(Math.floor(frameCount/20)%4),OX+TILE*SZ+68,OY+TILE*SZ-26);}
    // Turn indicator
    ctx.fillStyle=turn==='player'?'rgba(0,255,136,0.8)':'rgba(255,100,0,0.6)';
    ctx.font='9px "Share Tech Mono",monospace';ctx.fillText(turn==='player'?'▶ YOUR':'  SOCA',OX+TILE*SZ+68,OY+TILE*SZ-8);
    ctx.textAlign='left';

    if(over){ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);const won=getAllMoves('ai',board).length===0||countPieces(board).a===0;ctx.textAlign='center';ctx.fillStyle=won?'#00ff88':'#ff4400';ctx.font='54px VT323,monospace';ctx.shadowColor=won?'#00ffcc':'#ff4400';ctx.shadowBlur=20;ctx.fillText(won?'STELLAR VICTORY!':'SOCA DOMINATES',W/2,H/2-48);ctx.shadowBlur=0;ctx.fillStyle='rgba(0,255,136,0.65)';ctx.font='22px VT323,monospace';ctx.fillText('CAPTURES: '+playerCaptures+' vs '+aiCaptures,W/2,H/2+8);ctx.fillStyle='#004422';ctx.font='13px "Share Tech Mono",monospace';ctx.fillText('SPACE TO PLAY AGAIN',W/2,H/2+50);ctx.textAlign='left';}

    frameId = requestAnimationFrame(loop);
  }
  window.stopCurrentGame = function() {
    cv.removeEventListener('click', onClick);
    cv.removeEventListener('contextmenu', onContext);
    document.removeEventListener('keydown', onK);
    cancelAnimationFrame(frameId);
    clearGameHandles();
    window.gameRunning = false;
    window.currentGame = null;
  };
  loop();
}

let chessWins = 0, mineWins = 0;

(function() {
  function showGameArena(title) {
    document.getElementById('game-selector').style.display = 'none';
    const arena = document.getElementById('game-arena');
    arena.style.display = 'flex';
    document.getElementById('game-score').textContent = '0';
    document.getElementById('game-level').textContent = '1';
    document.getElementById('game-lives').innerHTML = '♥ ♥ ♥';
    document.getElementById('game-msg').textContent = '';
    if (document.getElementById('game-extra-info'))
      document.getElementById('game-extra-info').textContent = '';
    document.getElementById('active-game-title').textContent = title;
    buildGamePanels(title);
  }

  window.launchGame = function(name) {
    if (name === 'asteroids') {
      showGameArena('▶ VOID ASSAULT — SURVIVE THE STORM');
      startAsteroids();
    } else if (name === 'snake') {
      showGameArena('▶ NEURAL SNAKE — FEED THE LINK');
      startSnake();
    } else if (name === 'pong') {
      showGameArena('▶ VOID PONG — BOUNCE OR BURN');
      startPong();
    } else if (name === 'breaker') {
      showGameArena('▶ HEX BREAKER — SHATTER THE GRID');
      startBreaker();
    } else if (name === 'checkers') {
      showGameArena('▶ STELLAR CHECKERS — CAPTURE COMMAND');
      startCheckers();
    } else if (name === 'chess') {
      showGameArena('▶ NEURAL CHESS — vs SOCA');
      startChess();
    } else if (name === 'minesweeper') {
      showGameArena('▶ BIO SWEEP — SMILE');
      startMinesweeper();
} else if (name === 'heartbeat') {
      showGameArena('▶ CARDIAC SYNC — SMILE');
      startHeartbeat();
} else if (name === 'memory') {
      showGameArena('▶ MEMORY SCAN — SMILE');
      startMemory();
    } else if (name === 'battleship') {
      showGameArena('▶ COSMIC BATTLESHIP — TARGET ACQUIRED');
      startBattleship();
    }
  };
})();

// ══════════════════════════════════════════════════════════════════════════
// ── GAME 6: NEURAL CHESS vs SOCA ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

function startChess() {
  if (typeof window.stopCurrentGame === 'function') window.stopCurrentGame();
  window.currentGame = 'chess';
  window.gameRunning = true;

  const cv = document.getElementById('game-canvas');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const SQ = Math.min(Math.floor(Math.min(W, H) / 8.6), 72);
  const OFF_X = Math.floor((W - SQ * 8) / 2);
  const OFF_Y = Math.floor((H - SQ * 8) / 2);

  let board = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R'],
  ];

  let selected = null;
  let validMoves = [];
  let turn = 'white';
  let gameOver = false;
  let socaMsg = '';
  let socaMsgTimer = 0;
  let moveCount = 0;
  let lastCapture = null;
  let whiteKingMoved = false;
  let whiteRookMoved = [false, false];
  let animPiece = null;
  let glitchT = 0;

  const SOCA_TAUNTS = [
    "SOCA: Threat assessment complete. You're losing.",
    "SOCA: That move. Bold. Statistically terrible.",
    "SOCA: I see your plan. I've already countered it.",
    "SOCA: I'm never wrong. I'm occasionally early.",
    "SOCA: Your strategy has a 12% survival rate. Just so you know.",
  ];
  const SOCA_WIN = [
    "SOCA: Checkmate. I was trying, actually. It just looked effortless.",
    "SOCA: My board, my rules. Good game. Mostly yours.",
    "SOCA: Predicted this outcome 14 moves ago. Didn't want to spoil it.",
    "SOCA: Again? I'll give you a 3-move head start. Out of respect.",
  ];
  const SOCA_LOSE = [
    "SOCA: I let you win. Don't read into it.",
    "SOCA: Hm. Unexpected. Running diagnostics on my chess module.",
    "SOCA: You won. I'm filing this under 'acceptable anomaly'.",
    "SOCA: Fine. You're better than 41% of humans at this. Noted.",
  ];

function showSoca(msg, duration) {
    socaMsg = msg;
    socaMsgTimer = duration || 3500;
    showSocaPopup(msg, duration);
  }

  const GLYPH = {
    K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙',
    k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟',
  };

  function isWhite(p) { return p && p === p.toUpperCase(); }
  function isBlack(p) { return p && p === p.toLowerCase(); }
  function isEnemy(p, myColor) {
    if (!p) return false;
    return myColor === 'white' ? isBlack(p) : isWhite(p);
  }
  function isFriend(p, myColor) {
    if (!p) return false;
    return myColor === 'white' ? isWhite(p) : isBlack(p);
  }
  function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

  function getRawMoves(b, r, c, myColor) {
    const p = b[r][c];
    if (!p) return [];
    const moves = [];
    const push = (tr, tc) => {
      if (!inBounds(tr, tc)) return false;
      if (isFriend(b[tr][tc], myColor)) return false;
      moves.push({r: tr, c: tc});
      return !isEnemy(b[tr][tc], myColor);
    };
    const slide = (dr, dc) => {
      let tr = r + dr, tc = c + dc;
      while (inBounds(tr, tc)) {
        if (!push(tr, tc)) break;
        tr += dr; tc += dc;
      }
    };
    const pt = p.toUpperCase();
    if (pt === 'P') {
      const dir = myColor === 'white' ? -1 : 1;
      const start = myColor === 'white' ? 6 : 1;
      if (inBounds(r + dir, c) && !b[r + dir][c]) {
        moves.push({r: r + dir, c});
        if (r === start && !b[r + dir * 2][c]) moves.push({r: r + dir * 2, c});
      }
      [-1, 1].forEach(dc => {
        if (inBounds(r + dir, c + dc) && isEnemy(b[r + dir][c + dc], myColor))
          moves.push({r: r + dir, c: c + dc});
      });
    }
    if (pt === 'R' || pt === 'Q') [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc]) => slide(dr, dc));
    if (pt === 'B' || pt === 'Q') [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => slide(dr, dc));
    if (pt === 'N') [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => push(r+dr, c+dc));
    if (pt === 'K') {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => push(r+dr, c+dc));
      if (myColor === 'white' && !whiteKingMoved && r === 7 && c === 4) {
        if (!whiteRookMoved[1] && !b[7][5] && !b[7][6] && b[7][7] === 'R')
          moves.push({r: 7, c: 6, castle: 'right'});
        if (!whiteRookMoved[0] && !b[7][3] && !b[7][2] && !b[7][1] && b[7][0] === 'R')
          moves.push({r: 7, c: 2, castle: 'left'});
      }
    }
    return moves;
  }

  function findKing(b, color) {
    const k = color === 'white' ? 'K' : 'k';
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (b[r][c] === k) return {r, c};
    return null;
  }

  function applyMove(b, fr, fc, tr, tc) {
    const nb = b.map(row => [...row]);
    nb[tr][tc] = nb[fr][fc];
    nb[fr][fc] = null;
    if (nb[tr][tc] === 'P' && tr === 0) nb[tr][tc] = 'Q';
    if (nb[tr][tc] === 'p' && tr === 7) nb[tr][tc] = 'q';
    return nb;
  }

  function isInCheck(b, color) {
    const k = findKing(b, color);
    if (!k) return true;
    const opp = color === 'white' ? 'black' : 'white';
    for (let br = 0; br < 8; br++)
      for (let bc = 0; bc < 8; bc++) {
        const p = b[br][bc];
        if (!p) continue;
        if (opp === 'white' && !isWhite(p)) continue;
        if (opp === 'black' && !isBlack(p)) continue;
        if (getRawMoves(b, br, bc, opp).some(m => m.r === k.r && m.c === k.c)) return true;
      }
    return false;
  }

  function getLegalMoves(b, r, c, color) {
    return getRawMoves(b, r, c, color).filter(m => !isInCheck(applyMove(b, r, c, m.r, m.c), color));
  }

  function hasAnyLegalMoves(b, color) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (!p) continue;
        if (color === 'white' && !isWhite(p)) continue;
        if (color === 'black' && !isBlack(p)) continue;
        if (getLegalMoves(b, r, c, color).length > 0) return true;
      }
    return false;
  }

  const PIECE_VAL = { p:100, n:320, b:330, r:500, q:900, k:20000 };

  function evalBoard(b) {
    let score = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (!p) continue;
        const v = PIECE_VAL[p.toLowerCase()] || 0;
        const cBonus = (3.5 - Math.abs(c - 3.5)) + (3.5 - Math.abs(r - 3.5));
        score += isWhite(p) ? -(v + cBonus * 2) : (v + cBonus * 2);
      }
    return score;
  }

  function minimax(b, depth, alpha, beta, maximizing) {
    if (depth === 0) return evalBoard(b);
    const color = maximizing ? 'black' : 'white';
    const allMoves = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (!p) continue;
        if (color === 'white' && !isWhite(p)) continue;
        if (color === 'black' && !isBlack(p)) continue;
        getLegalMoves(b, r, c, color).forEach(m => allMoves.push({fr:r,fc:c,tr:m.r,tc:m.c}));
      }
    if (!allMoves.length) return isInCheck(b, color) ? (maximizing ? -50000 : 50000) : 0;
    if (maximizing) {
      let best = -Infinity;
      for (const mv of allMoves) {
        best = Math.max(best, minimax(applyMove(b,mv.fr,mv.fc,mv.tr,mv.tc), depth-1, alpha, beta, false));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const mv of allMoves) {
        best = Math.min(best, minimax(applyMove(b,mv.fr,mv.fc,mv.tr,mv.tc), depth-1, alpha, beta, true));
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  function socaMove() {
    const allMoves = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || !isBlack(p)) continue;
        getLegalMoves(board, r, c, 'black').forEach(m => allMoves.push({fr:r,fc:c,tr:m.r,tc:m.c}));
      }
    if (!allMoves.length) return;

    let bestVal = -Infinity, bestMoves = [];
    for (const mv of allMoves) {
      const val = minimax(applyMove(board,mv.fr,mv.fc,mv.tr,mv.tc), 2, -Infinity, Infinity, false);
      if (val > bestVal) { bestVal = val; bestMoves = [mv]; }
      else if (val === bestVal) bestMoves.push(mv);
    }
    const mv = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    const fx = OFF_X + mv.fc * SQ + SQ/2, fy = OFF_Y + mv.fr * SQ + SQ/2;
    const tx = OFF_X + mv.tc * SQ + SQ/2, ty = OFF_Y + mv.tr * SQ + SQ/2;
    const captured = board[mv.tr][mv.tc];
    animPiece = {piece: board[mv.fr][mv.fc], fromX: fx, fromY: fy, toX: tx, toY: ty, t: 0};

    registerGameTimeout(() => {
      if (window.currentGame !== 'chess') return;
      if (captured) lastCapture = {r: mv.tr, c: mv.tc, piece: captured};
      board = applyMove(board, mv.fr, mv.fc, mv.tr, mv.tc);
      playSound('пешки', 0.4);
      animPiece = null;

if (captured) {
        if (Math.random() < 0.4) showSoca(`SOCA: ${(board[mv.tr][mv.tc]||'').toUpperCase()} captured. Expected.`);
      } else if (Math.random() < 0.12) {
        showSoca(SOCA_TAUNTS[Math.floor(Math.random() * SOCA_TAUNTS.length)]);
      }

      if (!hasAnyLegalMoves(board, 'white')) {
        gameOver = true;
        if (isInCheck(board, 'white')) {
          playSound('проигрыш');
          showSoca(SOCA_WIN[Math.floor(Math.random() * SOCA_WIN.length)], 8000);
          document.getElementById('game-msg').textContent = 'CHECKMATE — SOCA WINS';
          document.getElementById('game-msg').style.color = '#ff2244';
        } else {
          showSoca("SOCA: Stalemate. A draw. I'll accept it. This time.", 6000);
          document.getElementById('game-msg').textContent = 'STALEMATE — DRAW';
          document.getElementById('game-msg').style.color = '#ffcc00';
        }
      } else {
        turn = 'white';
        document.getElementById('game-extra-info').textContent = 'YOUR TURN — WHITE';
      }
    }, 500);
  }

  let frameId = null;

  function drawChess() {
    if (window.currentGame !== 'chess') { cancelAnimationFrame(frameId); return; }
    ctx.fillStyle = '#020a05';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(0, y, W, 2); }
    glitchT++;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const x = OFF_X + c * SQ, y = OFF_Y + r * SQ;
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(0,60,40,0.6)' : 'rgba(0,20,14,0.9)';
        ctx.fillRect(x, y, SQ, SQ);

        if (selected && selected.r === r && selected.c === c) {
          ctx.fillStyle = 'rgba(0,255,136,0.25)';
          ctx.fillRect(x, y, SQ, SQ);
          ctx.strokeStyle = 'rgba(0,255,136,0.8)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x+1, y+1, SQ-2, SQ-2);
        }

        if (validMoves.some(m => m.r === r && m.c === c)) {
          if (board[r][c]) {
            ctx.strokeStyle = 'rgba(255,80,80,0.7)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x+2, y+2, SQ-4, SQ-4);
          } else {
            ctx.fillStyle = 'rgba(0,200,100,0.25)';
            ctx.beginPath();
            ctx.arc(x + SQ/2, y + SQ/2, SQ*0.18, 0, Math.PI*2);
            ctx.fill();
          }
        }

        if (lastCapture && lastCapture.r === r && lastCapture.c === c) {
          const alpha = Math.max(0, 0.3 - glitchT * 0.003);
          ctx.fillStyle = `rgba(255,100,0,${alpha})`;
          ctx.fillRect(x, y, SQ, SQ);
          if (alpha <= 0) lastCapture = null;
        }

        ctx.strokeStyle = 'rgba(0,80,50,0.4)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, SQ, SQ);
      }
    }

    ctx.strokeStyle = 'rgba(0,180,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(OFF_X-1, OFF_Y-1, SQ*8+2, SQ*8+2);

    // Check highlight
    if (!gameOver && isInCheck(board, turn)) {
      const kPos = findKing(board, turn);
      if (kPos) {
        const kx = OFF_X + kPos.c * SQ, ky = OFF_Y + kPos.r * SQ;
        ctx.fillStyle = `rgba(255,34,68,${0.3 + Math.sin(glitchT*0.2)*0.2})`;
        ctx.fillRect(kx, ky, SQ, SQ);
        ctx.fillStyle = 'rgba(255,34,68,0.9)';
        ctx.font = '9px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CHECK', OFF_X + SQ*4, OFF_Y - 8);
        ctx.textAlign = 'left';
      }
    }

    // Labels
    ctx.fillStyle = 'rgba(0,150,100,0.5)';
    ctx.font = `${Math.max(9, SQ*0.2)}px "Share Tech Mono", monospace`;
    for (let i = 0; i < 8; i++) {
      ctx.fillText(String.fromCharCode(65+i), OFF_X + i*SQ + SQ*0.35, OFF_Y + SQ*8 + 14);
      ctx.fillText(8-i, OFF_X - 14, OFF_Y + i*SQ + SQ*0.6);
    }

    // Pieces
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const x = OFF_X + c*SQ + SQ/2, y = OFF_Y + r*SQ + SQ/2;
        ctx.font = `${Math.floor(SQ*0.72)}px serif`;
        if (isWhite(p)) { ctx.fillStyle = '#e8f4e8'; ctx.shadowColor = 'rgba(0,255,136,0.6)'; ctx.shadowBlur = 8; }
        else { ctx.fillStyle = '#2a4a38'; ctx.shadowColor = 'rgba(0,100,200,0.6)'; ctx.shadowBlur = 6; }
        ctx.fillText(GLYPH[p] || '?', x, y);
        ctx.shadowBlur = 0;
      }
    }

    // Animating piece
    if (animPiece) {
      animPiece.t = Math.min(animPiece.t + 0.08, 1);
      const t = animPiece.t;
      const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      const ax = animPiece.fromX + (animPiece.toX - animPiece.fromX) * ease;
      const ay = animPiece.fromY + (animPiece.toY - animPiece.fromY) * ease - Math.sin(t*Math.PI)*SQ*0.4;
      ctx.font = `${Math.floor(SQ*0.72)}px serif`;
      ctx.fillStyle = 'rgba(100,180,255,0.9)';
      ctx.shadowColor = 'rgba(0,100,200,0.8)'; ctx.shadowBlur = 12;
      ctx.fillText(GLYPH[animPiece.piece] || '?', ax, ay);
      ctx.shadowBlur = 0;
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';


    // Turn indicator
    const tx = OFF_X + SQ*8 + 10;
    if (tx + 60 < W) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(tx, OFF_Y, W-tx-4, 60);
      ctx.strokeStyle = 'rgba(0,180,255,0.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(tx, OFF_Y, W-tx-4, 60);
      ctx.fillStyle = turn === 'white' ? '#e8f4e8' : '#4499cc';
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.fillText(turn==='white'?'● WHITE':'● BLACK', tx+6, OFF_Y+16);
      ctx.fillStyle = 'rgba(100,150,120,0.7)';
      ctx.font = '8px "Share Tech Mono", monospace';
      ctx.fillText('MOVE #'+moveCount, tx+6, OFF_Y+30);
      ctx.fillStyle = 'rgba(0,180,255,0.6)';
      ctx.fillText(turn==='white'?'YOUR TURN':'THINKING...', tx+6, OFF_Y+44);
    }

    frameId = requestAnimationFrame(drawChess);
  }

  function handleChessClick(e) {
    if (window.currentGame !== 'chess' || gameOver || turn !== 'white' || animPiece) return;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const c = Math.floor((mx - OFF_X) / SQ);
    const r = Math.floor((my - OFF_Y) / SQ);
    if (!inBounds(r, c)) { selected = null; validMoves = []; return; }

    if (selected) {
      const mv = validMoves.find(m => m.r===r && m.c===c);
      if (mv) {
        const captured = board[r][c];
        if (captured) lastCapture = {r, c, piece: captured};
        board = applyMove(board, selected.r, selected.c, r, c);
        playSound('пешки', 0.5);
        if (mv.castle === 'right') { board[7][5]='R'; board[7][7]=null; }
        if (mv.castle === 'left')  { board[7][3]='R'; board[7][0]=null; }
        moveCount++;
        selected = null; validMoves = [];

        if (!hasAnyLegalMoves(board, 'black')) {
          gameOver = true;
          if (isInCheck(board, 'black')) {
            chessWins++;
            const el = document.getElementById('chess-hiscore');
            if (el) el.textContent = chessWins;
            showSoca(SOCA_LOSE[Math.floor(Math.random()*SOCA_LOSE.length)], 8000);
            document.getElementById('game-msg').textContent = 'CHECKMATE — YOU WIN!';
            document.getElementById('game-msg').style.color = '#00ff88';
          } else {
            showSoca("SOCA: Stalemate. Technically neither of us lost. I'm choosing to see it that way.", 6000);
            document.getElementById('game-msg').textContent = 'STALEMATE — DRAW';
            document.getElementById('game-msg').style.color = '#ffcc00';
          }
          return;
        }

        turn = 'black';
        document.getElementById('game-extra-info').textContent = 'SOCA THINKING...';
        registerGameTimeout(socaMove, 400 + Math.random()*600);
      } else if (board[r][c] && isWhite(board[r][c])) {
        selected = {r, c};
        validMoves = getLegalMoves(board, r, c, 'white');
      } else { selected=null; validMoves=[]; }
    } else {
      if (board[r][c] && isWhite(board[r][c])) {
        selected = {r, c};
        validMoves = getLegalMoves(board, r, c, 'white');
        if (validMoves.length === 0) showSoca("SOCA: That piece is trapped. I didn't do that. Mostly.");
      }
    }
  }

  function handleChessKey(e) {
    if (window.currentGame !== 'chess') return;
    if (gameOver && e.code === 'Space') startChess();
  }

  cv.addEventListener('click', handleChessClick);
  document.addEventListener('keydown', handleChessKey);

  window.stopCurrentGame = (function(orig) {
    return function() {
      cv.removeEventListener('click', handleChessClick);
      document.removeEventListener('keydown', handleChessKey);
      cancelAnimationFrame(frameId);
      clearGameHandles();
      window.gameRunning = false;
      window.currentGame = null;
    };
  })(window.stopCurrentGame);

  document.getElementById('game-extra-info').textContent = 'YOUR TURN — WHITE  |  SPACE TO RESTART';
  showSoca("SOCA: Chess module online. I've seen your opening before. It ends the same way.");
  drawChess();
}


// ══════════════════════════════════════════════════════════════════════════
// ── GAME 7: BIO SWEEP (SMILE Minesweeper) ────────────────────────
// ══════════════════════════════════════════════════════════════════════════

function startMinesweeper() {
  if (typeof window.stopCurrentGame === 'function') window.stopCurrentGame();
  window.currentGame = 'minesweeper';
  window.gameRunning = true;

  const cv = document.getElementById('game-canvas');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const COLS = 16, ROWS = 12, MINES = 28;
  const SQ = Math.floor(Math.min((W-20)/COLS, (H-80)/ROWS));
  const OFF_X = Math.floor((W - COLS*SQ) / 2);
  const OFF_Y = Math.floor((H - ROWS*SQ) / 2) + 20;

  const NUM_COLORS = ['','#ffcc00','#ff8800','#ff4400','#ffaa00','#ff6600','#ffdd88','#ffffff','#886600'];

  let cells = [];
  let minesFlagged = 0, revealedCount = 0;
  let gameOver = false, won = false, firstClick = true;
  let smailyMsg = '', smailyMsgTimer = 0;
  let glitchT = 0, timerSec = 0, timerInterval = null;
  let explodeAnim = null;
  let frameId2 = null;

  const SMAILY_START = [
    "SMILE: BIO SWEEP online! 28 mines. You've got this. Probably.",
    "SMILE: Stress baseline recorded! Already elevated. Interesting.",
    "SMILE: 28 hazard cells detected. I believe in you! Statistically.",
    "SMILE: Pro tip: corners first!",
  ];
  const SMAILY_CLOSE = [
    "SMILE: CLOSE ONE! Cortisol: way up. Noted!",
    "SMILE: Heart rate spike detected! I felt that.",
    "SMILE: Ooh. That was nearby. Good reflexes!",
    "SMILE: You're doing great! Your hands are shaking though.",
  ];
  const SMAILY_WIN = [ 
    "SMILE: ALL CLEAR! Every single mine! I'm so proud right now!",
    "SMILE: 100% decontamination! Uploading to log! Adding a gold star!",
    "SMILE: You survived! Heart rate normalizing! Excellent work Pilot!",
    "SMILE: Perfect sweep! I'm noting this. SOCA will be annoyed.",
  ];
  const SMAILY_LOSE = [
    "SMILE: BOOM! Medically speaking - ow. Try again!",
    "SMILE: Mine hit! I've seen worse. Once. You're fine though!",
    "SMILE: Biosweep failed! It happens! To other people too! Sometimes!",
    "SMILE: Okay! That one's on me. I maybe placed it there. Allegedly.",

  ];
  const SMAILY_FLAG = [
    "SMILE: Flag! Smart move! High five! (metaphorically)",
    "SMILE: Marked! Contained! Theoretically! Probably!",
    "SMILE: Good eye! I agree! I always agree with correct decisions!",
    "SMILE: Flagged! Your pattern recognition is excellent! I'm logging this!",
  ];

function showSmaily(msg, dur) {
    smailyMsg = msg;
    smailyMsgTimer = dur || 3500;
    showSmilePopup(msg, dur);
  }

  function initBoard() {
    cells = [];
    for (let r = 0; r < ROWS; r++) {
      cells[r] = [];
      for (let c = 0; c < COLS; c++)
        cells[r][c] = {mine:false, count:0, revealed:false, flagged:false};
    }
    minesFlagged = 0; revealedCount = 0;
    gameOver = false; won = false; firstClick = true;
    timerSec = 0; glitchT = 0; explodeAnim = null;
    if (timerInterval) clearInterval(timerInterval);
    showSmaily(SMAILY_START[Math.floor(Math.random()*SMAILY_START.length)]);
    document.getElementById('game-score').textContent = '0';
    document.getElementById('game-lives').innerHTML = '♥ ♥ ♥';
    document.getElementById('game-msg').textContent = '';
  }

  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random()*ROWS), c = Math.floor(Math.random()*COLS);
      if (!cells[r][c].mine && !(Math.abs(r-safeR)<=1 && Math.abs(c-safeC)<=1)) {
        cells[r][c].mine = true; placed++;
      }
    }
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (cells[r][c].mine) continue;
        let n = 0;
        for (let dr=-1; dr<=1; dr++)
          for (let dc=-1; dc<=1; dc++) {
            const nr=r+dr, nc=c+dc;
            if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&cells[nr][nc].mine) n++;
          }
        cells[r][c].count = n;
      }
    timerInterval = registerGameInterval(() => {
      if (!gameOver && !won) {
        timerSec++;
        document.getElementById('game-level').textContent = timerSec+'s';
      }
    }, 1000);
  }

  function reveal(r, c) {
    if (r<0||r>=ROWS||c<0||c>=COLS) return;
    if (cells[r][c].revealed||cells[r][c].flagged) return;
    cells[r][c].revealed = true;
    revealedCount++;
    document.getElementById('game-score').textContent = revealedCount;
    if (cells[r][c].count===0 && !cells[r][c].mine)
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) reveal(r+dr, c+dc);
  }

  function checkWin() {
    if (revealedCount >= ROWS*COLS - MINES) {
      won = true; gameOver = true;
      mineWins++;
      const el = document.getElementById('mine-hiscore');
      if (el) el.textContent = mineWins;
      clearInterval(timerInterval);
      showSmaily(SMAILY_WIN[Math.floor(Math.random()*SMAILY_WIN.length)], 8000);
      document.getElementById('game-msg').textContent = 'SWEEP COMPLETE — MISSION SUCCESS';
      document.getElementById('game-msg').style.color = '#00ff88';
    }
  }

  function handleLeft(r, c) {
    if (gameOver || cells[r][c].flagged || cells[r][c].revealed) return;
    if (firstClick) { firstClick=false; placeMines(r,c); }
    if (cells[r][c].mine) {
      cells[r][c].revealed = true;
      explodeAnim = {r, c, t:0};
      gameOver = true;
      playSound('проигрыш');
      clearInterval(timerInterval);
      document.getElementById('game-lives').innerHTML = '';
      for (let br=0;br<ROWS;br++) for (let bc=0;bc<COLS;bc++) if (cells[br][bc].mine) cells[br][bc].revealed=true;
      showSmaily(SMAILY_LOSE[Math.floor(Math.random()*SMAILY_LOSE.length)], 8000);
      document.getElementById('game-msg').textContent = '☠ DETONATION — SWEEP FAILED';
      document.getElementById('game-msg').style.color = '#ff2244';
    } else {
      playSound('пешки', 0.35);
      reveal(r, c);
      let nearMine = false;
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        const nr=r+dr, nc=c+dc;
        if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&cells[nr][nc].mine&&!cells[nr][nc].flagged) nearMine=true;
      }
      if (nearMine && Math.random()<0.4) showSmaily(SMAILY_CLOSE[Math.floor(Math.random()*SMAILY_CLOSE.length)]);
      checkWin();
    }
  }

  function handleRight(e, r, c) {
    e.preventDefault();
    if (gameOver || cells[r][c].revealed || firstClick) return;
    cells[r][c].flagged = !cells[r][c].flagged;
    minesFlagged += cells[r][c].flagged ? 1 : -1;
    if (cells[r][c].flagged && Math.random()<0.5) showSmaily(SMAILY_FLAG[Math.floor(Math.random()*SMAILY_FLAG.length)]);
  }

  function drawMinesweeper() {
    if (window.currentGame !== 'minesweeper') { cancelAnimationFrame(frameId2); return; }
    ctx.fillStyle = '#0a0600';
    ctx.fillRect(0, 0, W, H);
    glitchT++;

    // Header
    ctx.fillStyle = 'rgba(20,12,0,0.9)';
    ctx.strokeStyle = 'rgba(255,160,0,0.5)'; ctx.lineWidth = 1;
    ctx.fillRect(OFF_X, OFF_Y-28, COLS*SQ, 22);
    ctx.strokeRect(OFF_X, OFF_Y-28, COLS*SQ, 22);

    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('✚ SMILE', OFF_X+6, OFF_Y-12);
    const remaining = MINES - minesFlagged;
    ctx.fillStyle = remaining <= 5 ? '#ff2244' : '#ffcc00';
    ctx.textAlign = 'center';
    ctx.fillText('☢ '+remaining, OFF_X + COLS*SQ/2, OFF_Y-12);
    ctx.fillStyle = 'rgba(200,120,0,0.7)';
    ctx.textAlign = 'right';
    ctx.fillText('⏱ '+timerSec+'s', OFF_X+COLS*SQ-4, OFF_Y-12);
    ctx.textAlign = 'left';

    // Cells
    for (let r=0; r<ROWS; r++) {
      for (let c=0; c<COLS; c++) {
        const cell = cells[r][c];
        const x = OFF_X+c*SQ, y = OFF_Y+r*SQ;

        if (explodeAnim && cell.mine && cell.revealed) {
          explodeAnim.t = Math.min(explodeAnim.t+0.03, 1);
          const dist = Math.sqrt((r-explodeAnim.r)**2+(c-explodeAnim.c)**2);
          const localT = Math.max(0, explodeAnim.t - dist*0.12);
          if (localT > 0) {
            const glow = Math.sin(localT*Math.PI)*0.7;
            ctx.fillStyle = `rgba(255,50,0,${glow})`;
            ctx.fillRect(x, y, SQ, SQ);
          }
        }

        if (cell.revealed) {
          ctx.fillStyle = cell.mine ? 'rgba(80,0,0,0.9)' : 'rgba(15,9,0,0.85)';
          ctx.fillRect(x, y, SQ, SQ);
          ctx.strokeStyle = cell.mine ? 'rgba(255,34,68,0.4)' : 'rgba(40,24,0,0.4)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, SQ, SQ);

          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          if (cell.mine) {
            ctx.fillStyle = '#ff2244';
            ctx.shadowColor = 'rgba(255,34,68,0.6)'; ctx.shadowBlur = 8;
            ctx.font = `${Math.floor(SQ*0.65)}px serif`;
            ctx.fillText('☢', x+SQ/2, y+SQ/2);
            ctx.shadowBlur = 0;
          } else if (cell.count > 0) {
            ctx.fillStyle = NUM_COLORS[cell.count]||'#fff';
            ctx.font = `bold ${Math.floor(SQ*0.55)}px "Share Tech Mono", monospace`;
            ctx.fillText(cell.count, x+SQ/2, y+SQ/2);
          }
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        } else {
          ctx.fillStyle = 'rgba(30,18,0,0.9)';
          ctx.fillRect(x, y, SQ, SQ);
          ctx.fillStyle = 'rgba(255,140,0,0.07)';
          ctx.fillRect(x, y, SQ, 1); ctx.fillRect(x, y, 1, SQ);
          ctx.strokeStyle = 'rgba(80,45,0,0.5)'; ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, SQ, SQ);

          if (cell.flagged) {
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = 'rgba(255,100,0,0.8)'; ctx.shadowBlur = 6;
            ctx.font = `${Math.floor(SQ*0.6)}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('⚑', x+SQ/2, y+SQ/2);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          }
        }
      }
    }

    ctx.strokeStyle = 'rgba(255,160,0,0.5)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(OFF_X-1, OFF_Y-1, COLS*SQ+2, ROWS*SQ+2);

    if (won) {
      ctx.fillStyle = `rgba(0,255,136,${(Math.sin(glitchT*0.1)+1)*0.03})`;
      ctx.fillRect(OFF_X, OFF_Y, COLS*SQ, ROWS*SQ);
    }

    frameId2 = requestAnimationFrame(drawMinesweeper);
  }

  function cellFromMouse(e) {
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX-rect.left)*(W/rect.width);
    const my = (e.clientY-rect.top)*(H/rect.height);
    const c = Math.floor((mx-OFF_X)/SQ), r=Math.floor((my-OFF_Y)/SQ);
    if (r<0||r>=ROWS||c<0||c>=COLS) return null;
    return {r,c};
  }

  function onMineClick(e) {
    if (window.currentGame !== 'minesweeper') return;
    const pos = cellFromMouse(e); if (!pos) return;
    handleLeft(pos.r, pos.c);
  }
  function onMineRClick(e) {
    if (window.currentGame !== 'minesweeper') return;
    const pos = cellFromMouse(e); if (!pos) return;
    handleRight(e, pos.r, pos.c);
  }
  function onMineKey(e) {
    if (window.currentGame !== 'minesweeper') return;
    if ((gameOver||won) && e.code==='Space') initBoard();
  }

  cv.addEventListener('click', onMineClick);
  cv.addEventListener('contextmenu', onMineRClick);
  document.addEventListener('keydown', onMineKey);

  window.stopCurrentGame = (function() {
    return function() {
      cv.removeEventListener('click', onMineClick);
      cv.removeEventListener('contextmenu', onMineRClick);
      document.removeEventListener('keydown', onMineKey);
      cancelAnimationFrame(frameId2);
      clearInterval(timerInterval);
      clearGameHandles();
      window.gameRunning = false;
      window.currentGame = null;
    };
  })();

  initBoard();
  document.getElementById('game-extra-info').textContent = 'L-CLICK: REVEAL  |  R-CLICK: FLAG  |  SPACE: RESTART';
  drawMinesweeper();
}

// ══════════════════════════════════════════════════════════════════════════
// ── GAME 8: CARDIAC SYNC (rhythm, SMILE) ──────────────────────────
// ══════════════════════════════════════════════════════════════════════════

let heartbeatHiScore = 0;

function startHeartbeat() {
  window.currentGame = 'heartbeat';
  window.gameRunning = true;

  const cv = document.getElementById('game-canvas');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // BPM and beat timing
  let bpm = 72, score = 0, combo = 0, maxCombo = 0;
  let lives = 3, gameOver = false, started = false;
  let beatInterval, frameId;
  let beats = []; // {x, y, r, maxR, born, hit, miss, lane}
  let particles = [];
  let ecgPoints = [];
  let ecgPhase = 0;
  let flashAlpha = 0, flashColor = '#ff4466';
  let smailyMsg = '', smailyMsgTimer = 0;
  let glitchT = 0;

  // Lanes (horizontal lines across canvas)
  const LANES = [
    { y: H * 0.3, color: '#ff4466', label: 'ATRIAL' },
    { y: H * 0.5, color: '#ff8844', label: 'VENTRICULAR' },
    { y: H * 0.7, color: '#ffaa00', label: 'PULSE' },
  ];
  const HIT_ZONE_X = 120; // x position of hit zone
  const TRAVEL_TIME = 1800; // ms for beat to travel from spawn to hit zone
  const BEAT_SPAWN_X = W - 60;

  const SMAILY_COMBO = [
"SMILE: Rhythm locked! You're basically a metronome right now!",
    "SMILE: Excellent! Reflexes: above average! I knew it!",
    "SMILE: Cardiac sync at 98%! Almost perfect! ALMOST!",
    "SMILE: Clean hits! Stress dropping! You're actually enjoying this!",
  ];
  const SMAILY_MISS = [
"SMILE: Missed! Arrhythmia logged! It's fine! Probably!",
    "SMILE: Off beat! Recalibrating! You can do it!",
    "SMILE: Oops! Focus! The beat is RIGHT THERE!",
    "SMILE: Lost the sync! Get back in it! I believe in you!",
  ];
  const SMAILY_DEAD = [
"SMILE: FLATLINE! Okay! Resuscitation protocol! You're fine! Restart!",
    "SMILE: Cardiac sync lost! I've seen worse! Twice! Try again!",
    "SMILE: The rhythm beat you this time! Rematch! Right now!",
  ];
  const SMAILY_WIN = [
"SMILE: PERFECT SYNC! Uploading to log! Adding THREE gold stars!",
    "SMILE: Cardiac performance: EXCEPTIONAL! I'm telling SOCA! She'll pretend not to care!",
  ];

function showSmaily(msg, dur) { smailyMsg = msg; smailyMsgTimer = dur || 3000; showSmilePopup(msg, dur); }

  function spawnBeat() {
    if (gameOver) return;
    playSound('пульс', 0.18);
    const lane = Math.floor(Math.random() * LANES.length);
    beats.push({
      x: BEAT_SPAWN_X,
      lane,
      born: performance.now(),
      hit: false,
      miss: false,
      pulse: 0,
    });
  }

  function getBeatX(beat) {
    const elapsed = performance.now() - beat.born;
    const t = elapsed / TRAVEL_TIME;
    return BEAT_SPAWN_X + (HIT_ZONE_X - BEAT_SPAWN_X) * t;
  }

  function tryHit(lane) {
    // Find closest beat in this lane near HIT_ZONE_X
    let best = null, bestDist = Infinity;
    beats.forEach(b => {
      if (b.hit || b.miss || b.lane !== lane) return;
      const bx = getBeatX(b);
      const dist = Math.abs(bx - HIT_ZONE_X);
      if (dist < bestDist) { bestDist = dist; best = b; }
    });
    if (!best) {
      // Phantom hit — miss
      lives--;
      combo = 0;
      flashAlpha = 0.4; flashColor = '#ff2244';
      document.getElementById('game-lives').innerHTML = '♥ '.repeat(Math.max(0, lives)).trim();
      showSmaily(SMAILY_MISS[Math.floor(Math.random() * SMAILY_MISS.length)]);
      if (lives <= 0) endGame();
      return;
    }
    if (bestDist < 55) {
      // Good hit
      best.hit = true;
      playSound('попадание', 0.5);
      combo++;
      maxCombo = Math.max(maxCombo, combo);
      const pts = bestDist < 20 ? 100 : bestDist < 35 ? 70 : 40;
      score += pts * Math.min(combo, 4);
      document.getElementById('game-score').textContent = score;
      flashAlpha = 0.15; flashColor = LANES[best.lane].color;
      // Particle burst
      for (let i = 0; i < 10; i++) {
        const ang = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 4;
        particles.push({ x: HIT_ZONE_X, y: LANES[best.lane].y, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, life: 30, max: 30, col: LANES[best.lane].color });
      }
      if (combo > 0 && combo % 5 === 0) showSmaily(SMAILY_COMBO[Math.floor(Math.random() * SMAILY_COMBO.length)]);
    } else {
      // Too far — miss
      best.miss = true;
      lives--;
      combo = 0;
      flashAlpha = 0.35; flashColor = '#ff2244';
      document.getElementById('game-lives').innerHTML = '♥ '.repeat(Math.max(0, lives)).trim();
      showSmaily(SMAILY_MISS[Math.floor(Math.random() * SMAILY_MISS.length)]);
      if (lives <= 0) endGame();
    }
  }

  function endGame() {
    gameOver = true;
    playSound('проигрыш');
    clearInterval(beatInterval);
    if (score > heartbeatHiScore) {
      heartbeatHiScore = score;
      const el = document.getElementById('heartbeat-hiscore');
      if (el) el.textContent = heartbeatHiScore;
    }
    showSmaily(SMAILY_DEAD[Math.floor(Math.random() * SMAILY_DEAD.length)], 8000);
    document.getElementById('game-msg').textContent = 'FLATLINE — SPACE TO RESTART';
    document.getElementById('game-msg').style.color = '#ff4466';
  }

  // ECG scrolling buffer
  for (let i = 0; i < W; i++) ecgPoints.push(H * 0.12);

  function drawHeartbeat() {
    if (window.currentGame !== 'heartbeat') { cancelAnimationFrame(frameId); return; }
    ctx.fillStyle = '#0a0203';
    ctx.fillRect(0, 0, W, H);
    glitchT++;

    // Scanlines
    for (let y = 0; y < H; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0, y, W, 2); }

    // ECG top strip
    ecgPhase += 0.18;
    ecgPoints.shift();
    const mid = H * 0.12;
    const norm = ecgPhase % (Math.PI * 2);
    let ey = mid;
    const n = norm / (Math.PI * 2);
    if (n < 0.08)      ey = mid - 2;
    else if (n < 0.12) ey = mid - 22;
    else if (n < 0.16) ey = mid + 12;
    else if (n < 0.20) ey = mid - 48;
    else if (n < 0.24) ey = mid + 8;
    else if (n < 0.28) ey = mid - 14;
    else               ey = mid + (Math.random()-0.5)*2;
    ecgPoints.push(ey);

    ctx.strokeStyle = 'rgba(255,68,102,0.8)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(255,50,80,0.5)'; ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let i = 0; i < ecgPoints.length; i++) {
      i === 0 ? ctx.moveTo(i, ecgPoints[i]) : ctx.lineTo(i, ecgPoints[i]);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ECG strip border
    ctx.strokeStyle = 'rgba(255,68,102,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H * 0.22);
    ctx.fillStyle = 'rgba(255,68,102,0.06)';
    ctx.fillRect(0, 0, W, H * 0.22);

    // Lanes
    LANES.forEach((lane, li) => {
      // Lane line
      ctx.strokeStyle = `${lane.color}33`;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(HIT_ZONE_X + 30, lane.y);
      ctx.lineTo(W, lane.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Hit zone circle
      const pulse = Math.sin(glitchT * 0.08) * 0.3 + 0.7;
      ctx.strokeStyle = lane.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = lane.color; ctx.shadowBlur = 8 * pulse;
      ctx.beginPath();
      ctx.arc(HIT_ZONE_X, lane.y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner dot
      ctx.fillStyle = lane.color + '44';
      ctx.beginPath();
      ctx.arc(HIT_ZONE_X, lane.y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Key label
      ctx.fillStyle = lane.color + 'cc';
      ctx.font = '9px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(['A','S','D'][li], HIT_ZONE_X, lane.y + 4);
      ctx.textAlign = 'left';

      // Lane label left
      ctx.fillStyle = lane.color + '55';
      ctx.font = '8px "Share Tech Mono", monospace';
      ctx.fillText(lane.label, 6, lane.y - 8);
    });

    // Beats
    const now = performance.now();
    beats = beats.filter(b => {
      const bx = getBeatX(b);
      if (!b.hit && !b.miss && bx < HIT_ZONE_X - 60) {
        b.miss = true;
        lives--;
        combo = 0;
        document.getElementById('game-lives').innerHTML = '♥ '.repeat(Math.max(0, lives)).trim();
        showSmaily(SMAILY_MISS[Math.floor(Math.random() * SMAILY_MISS.length)]);
        if (lives <= 0 && !gameOver) endGame();
      }
      if (bx < -40) return false; // remove off-screen

      const lane = LANES[b.lane];
      if (b.hit) {
        b.pulse = (b.pulse || 0) + 0.15;
        const alpha = Math.max(0, 1 - b.pulse);
        ctx.strokeStyle = lane.color + Math.round(alpha * 255).toString(16).padStart(2,'0');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, lane.y, 22 + b.pulse * 20, 0, Math.PI * 2);
        ctx.stroke();
        return alpha > 0;
      }
      if (b.miss) {
        ctx.fillStyle = 'rgba(255,34,68,0.3)';
        ctx.beginPath(); ctx.arc(bx, lane.y, 18, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#ff2244'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(bx, lane.y, 18, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#ff2244'; ctx.font = '14px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('✕', bx, lane.y);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        return bx > -40;
      }

      // Normal beat
      const age = (now - b.born) / TRAVEL_TIME;
      const glow = Math.sin(age * Math.PI * 6) * 0.3 + 0.7;
      ctx.fillStyle = lane.color + '22';
      ctx.strokeStyle = lane.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = lane.color; ctx.shadowBlur = 10 * glow;
      ctx.beginPath(); ctx.arc(bx, lane.y, 18, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      // Heart symbol
      ctx.fillStyle = lane.color;
      ctx.font = '14px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('♥', bx, lane.y);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      return true;
    });

    // Particles
    particles = particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vx *= 0.92; p.vy *= 0.92; p.life--;
      const al = p.life / p.max;
      ctx.fillStyle = p.col + Math.round(al * 200).toString(16).padStart(2,'0');
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 * al, 0, Math.PI*2); ctx.fill();
      return p.life > 0;
    });

    // Flash overlay
    if (flashAlpha > 0) {
      ctx.fillStyle = flashColor + Math.round(flashAlpha * 255).toString(16).padStart(2,'0');
      ctx.fillRect(0, 0, W, H);
      flashAlpha -= 0.03;
    }

    // Combo display
    if (combo >= 3) {
      ctx.fillStyle = `rgba(255,180,0,${0.6 + Math.sin(glitchT*0.15)*0.4})`;
      ctx.font = '28px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('COMBO ×' + combo, W / 2, H * 0.85);
      ctx.textAlign = 'left';
    }

    // BPM display
    ctx.fillStyle = 'rgba(255,68,102,0.5)';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.fillText(`BPM: ${bpm + Math.floor(Math.sin(glitchT*0.05)*3)}`, W - 90, H * 0.22 + 18);


    // Start prompt
    if (!started) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4466';
      ctx.font = '48px VT323, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ff4466'; ctx.shadowBlur = 20;
      ctx.fillText('CARDIAC SYNC', W/2, H/2 - 50);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,170,0,0.8)';
      ctx.font = '16px VT323, monospace';
      ctx.fillText('✚ SMILE RHYTHM PROTOCOL', W/2, H/2 - 10);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '13px "Share Tech Mono", monospace';
      ctx.fillText('A = TOP LANE   S = MID LANE   D = BOTTOM LANE', W/2, H/2 + 30);
      ctx.fillText('or  CLICK  the hit circles', W/2, H/2 + 50);
      ctx.fillStyle = `rgba(255,68,102,${0.5+Math.sin(glitchT*0.1)*0.5})`;
      ctx.font = '16px "Share Tech Mono", monospace';
      ctx.fillText('PRESS SPACE TO BEGIN', W/2, H/2 + 85);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }

    // Game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4466';
      ctx.font = '54px VT323, monospace';
      ctx.textAlign = 'center'; ctx.shadowColor = '#ff4466'; ctx.shadowBlur = 20;
      ctx.fillText('FLATLINE', W/2, H/2 - 50);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,170,0,0.8)';
      ctx.font = '22px VT323, monospace';
      ctx.fillText('SCORE: ' + score + '  |  MAX COMBO: ×' + maxCombo, W/2, H/2 + 4);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '13px "Share Tech Mono", monospace';
      ctx.fillText('SPACE TO RESTART', W/2, H/2 + 44);
      ctx.textAlign = 'left';
    }

    if (document.hidden) {
      frameId = requestAnimationFrame(drawHeartbeat);
      return;
    }
    frameId = requestAnimationFrame(drawHeartbeat);
  }

  // Speed up BPM over time
  const bpmInterval = registerGameInterval(() => {
    if (!gameOver && started) {
      bpm = Math.min(160, bpm + 2);
      const ms = Math.round(60000 / bpm);
      clearInterval(beatInterval);
      beatInterval = registerGameInterval(spawnBeat, ms);
    }
  }, 8000);

  function onHBKey(e) {
    if (window.currentGame !== 'heartbeat') return;
    if (!started && e.code === 'Space') {
      started = true;
      beatInterval = registerGameInterval(spawnBeat, Math.round(60000 / bpm));
      showSmaily("SMILE: CARDIAC SYNC online! Match the beat! You've got this!", 3000);
      return;
    }
    if (gameOver && e.code === 'Space') {
      document.removeEventListener('keydown', onHBKey);
      cv.removeEventListener('click', onHBClick);
      cancelAnimationFrame(frameId);
      clearInterval(beatInterval);
      clearInterval(bpmInterval);
      window.currentGame = null;
      startHeartbeat();
      return;
    }
    if (!started || gameOver) return;
    if (e.code === 'KeyA') tryHit(0);
    else if (e.code === 'KeyS') tryHit(1);
    else if (e.code === 'KeyD') tryHit(2);
  }

  function onHBClick(e) {
    if (window.currentGame !== 'heartbeat') return;
    if (!started) { started = true; beatInterval = registerGameInterval(spawnBeat, Math.round(60000/bpm)); showSmaily("SMILE: CARDIAC SYNC online! Match the beat! You've got this!", 3000); return; }
    if (gameOver) {
      document.removeEventListener('keydown', onHBKey);
      cv.removeEventListener('click', onHBClick);
      cancelAnimationFrame(frameId);
      clearInterval(beatInterval);
      clearInterval(bpmInterval);
      window.currentGame = null;
      startHeartbeat();
      return;
    }
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    LANES.forEach((lane, li) => {
      if (Math.hypot(mx - HIT_ZONE_X, my - lane.y) < 35) tryHit(li);
    });
  }

  document.addEventListener('keydown', onHBKey);
  cv.addEventListener('click', onHBClick);

  window.stopCurrentGame = (function() {
    return function() {
      document.removeEventListener('keydown', onHBKey);
      cv.removeEventListener('click', onHBClick);
      cancelAnimationFrame(frameId);
      clearInterval(beatInterval);
      clearInterval(bpmInterval);
      clearGameHandles();
      window.gameRunning = false;
      window.currentGame = null;
    };
  })();

  document.getElementById('game-extra-info').textContent = 'A / S / D — HIT LANES  |  SPACE START/RESTART';
  drawHeartbeat();
}


// ══════════════════════════════════════════════════════════════════════════
// ── GAME 9: MEMORY SCAN (SMILE) ──────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

let memoryHiScore = 0;

function startMemory() {
  window.currentGame = 'memory';
  window.gameRunning = true;

  const cv = document.getElementById('game-canvas');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // ── SYMBOLS used in the grid ─────────────────────────────────────────
  const SYMBOLS = ['♥','♦','♠','♣','✚','✦','♟','⛭','◈','▲','◉','✕'];
  const COLS = 4, ROWS = 3;
  const PAD = 18;
  const CELL_W = Math.floor((W - PAD * 2) / COLS);
  const CELL_H = Math.floor((H * 0.72 - PAD) / ROWS);
  const GRID_X = PAD;
  const GRID_Y = Math.floor(H * 0.18);

  // ── STATE ────────────────────────────────────────────────────────────
  let level = 1;
  let sequence = [];       // indices into cells[] that player must click in order
  let playerInput = [];    // what player has clicked so far
  let cells = [];          // {sym, x, y, w, h, lit, wrong, shake}
  let phase = 'idle';      // idle | showing | interference | input | result
  let showIdx = 0;         // which symbol in sequence we're currently highlighting
  let showTimer = 0;
  let glitchT = 0;
  let frameId;
  let smailyMsg = '', smailyMsgTimer = 0;
  let flashAlpha = 0, flashColor = '#bb66ff';
  let resultTimer = 0;
  let interferenceActive = false;
  let interferenceSymbols = []; // fake flashing symbols during show phase
  let interferenceTimer = 0;
  let bgGlitch = 0;
  let fakeHighlight = -1; // SMAILY fake-highlights a wrong cell
  let fakeTimer = 0;

  const SHOW_DURATION  = 680;   // ms each symbol is lit
  const SHOW_GAP       = 220;   // ms gap between symbols
  const INTERF_CHANCE  = 0.45;  // chance SMAILY does interference per level

  const SMAILY_TAUNT = [
"SMILE: MEMORY SCAN active! Show me what you've got!",
    "SMILE: I may have tweaked the display a tiny bit. For science!",
    "SMILE: Oops! Did that flash bother you? Noted! Sorry! Not sorry!",
    "SMILE: That was unintentional. The second one was also unintentional.",
    "SMILE: I'm not interfering. I'm HELPING. Differently.",
    "SMILE: Your hippocampus is working overtime! I can see it on the scan!",
    "SMILE: Ignore the noise! IGNORE IT! I said-.. okay you looked.",
    "SMILE: Memory capacity test in progress! No pressure! Some pressure!",
  ];
  const SMAILY_CORRECT = [
"SMILE: CORRECT! Impressive! Especially given what I was doing to the screen!",
    "SMILE: Sequence confirmed! Memory scan: EXCELLENT! You're amazing!",
    "SMILE: You got it! I'll have to be more creative next time!",
    "SMILE: Perfect recall! Stress levels rising - mine, not yours!",
  ];
  const SMAILY_WRONG = [
"SMILE: Wrong! But you were SO CLOSE! I believe in you!",
    "SMILE: Nope! The glitch didn't help! (I know because I made it!)",
    "SMILE: Sequence broken! Okay! Let's try again! Fresh start!",
    "SMILE: Error! And I WAS trying that hard! It's fine! Try again!",
  ];
  const SMAILY_LEVELUP = [
"SMILE: LEVEL UP! Longer sequence! More interference! Fun right?!",
    "SMILE: Next level! I have NEW tricks! You'll love them! (You won't!)",
    "SMILE: Better than average! Adjusting difficulty! This is getting exciting!",
  ];

function showSmaily(msg, dur) { smailyMsg = msg; smailyMsgTimer = dur || 3200; showSmilePopup(msg, dur); }

  // ── BUILD GRID ───────────────────────────────────────────────────────
  function buildGrid() {
    cells = [];
    // Shuffle symbols for this level
    const pool = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, COLS * ROWS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        cells.push({
          sym: pool[r * COLS + c],
          x: GRID_X + c * CELL_W,
          y: GRID_Y + r * CELL_H,
          w: CELL_W,
          h: CELL_H,
          lit: false,
          wrong: false,
          correct: false,
          shake: 0,
        });
      }
    }
  }

  // ── GENERATE SEQUENCE ─────────────────────────────────────────────────
  function buildSequence() {
    const len = 2 + level;
    sequence = [];
    for (let i = 0; i < len; i++) {
      // Avoid immediate repeats
      let idx;
      do { idx = Math.floor(Math.random() * cells.length); }
      while (sequence.length > 0 && idx === sequence[sequence.length - 1]);
      sequence.push(idx);
    }
  }

  // ── INTERFERENCE ─────────────────────────────────────────────────────
  function triggerInterference() {
    // Pick how nasty SMAILY is this level
    const nastiness = Math.min(level, 5);
    const type = Math.floor(Math.random() * 3);

    if (type === 0 || nastiness >= 3) {
      // Flash random wrong cells briefly
      interferenceSymbols = [];
      const count = 1 + Math.floor(nastiness / 2);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * cells.length);
        interferenceSymbols.push(idx);
      }
      interferenceTimer = 180 + Math.random() * 120;
      interferenceActive = true;
    }
    if (type === 1 || nastiness >= 4) {
      // Fake highlight a wrong cell
      fakeHighlight = Math.floor(Math.random() * cells.length);
      fakeTimer = 200;
    }
    if (nastiness >= 3) {
      bgGlitch = 12 + Math.floor(Math.random() * 20);
    }
    showSmaily(SMAILY_TAUNT[Math.floor(Math.random() * SMAILY_TAUNT.length)]);
  }

  // ── SHOW SEQUENCE ─────────────────────────────────────────────────────
  function startShowing() {
    phase = 'showing';
    showIdx = 0;
    showTimer = 0;
    playerInput = [];
    cells.forEach(c => { c.lit = false; c.wrong = false; c.correct = false; });
    document.getElementById('game-extra-info').textContent = 'WATCH THE SEQUENCE...';
    document.getElementById('game-msg').textContent = '';
  }

  // ── INIT LEVEL ────────────────────────────────────────────────────────
  function initLevel() {
    buildGrid();
    buildSequence();
    playerInput = [];
    interferenceActive = false;
    interferenceSymbols = [];
    fakeHighlight = -1;
    bgGlitch = 0;
    phase = 'idle';
    document.getElementById('game-level').textContent = level;
    document.getElementById('game-score').textContent = memoryHiScore;
  }

  initLevel();

  // Start after a moment
  registerGameTimeout(() => {
    showSmaily("SMILE: MEMORY SCAN initiated! Watch carefully! I'm already planning something!", 3000);
    registerGameTimeout(startShowing, 1200);
  }, 600);

  // ── UPDATE (called each frame) ────────────────────────────────────────
  let lastTime = 0;
  function update(ts) {
    const dt = ts - lastTime; lastTime = ts;

    // Interference timers
    if (interferenceActive) {
      interferenceTimer -= dt;
      if (interferenceTimer <= 0) { interferenceActive = false; interferenceSymbols = []; }
    }
    if (fakeTimer > 0) {
      fakeTimer -= dt;
      if (fakeTimer <= 0) fakeHighlight = -1;
    }
    if (bgGlitch > 0) bgGlitch--;

    // Cell shake decay
    cells.forEach(c => { if (c.shake > 0) c.shake--; });

    // ── PHASE: SHOWING ──────────────────────────────────────────────────
    if (phase === 'showing') {
      showTimer += dt;
      const totalPerStep = SHOW_DURATION + SHOW_GAP;

      // Determine which cell should be lit right now
      cells.forEach(c => c.lit = false);
      const currentStep = Math.floor(showTimer / totalPerStep);
      const stepOffset  = showTimer % totalPerStep;

      if (currentStep < sequence.length) {
        if (stepOffset < SHOW_DURATION) {
          cells[sequence[currentStep]].lit = true;
        }
        // Trigger interference halfway through showing
        if (currentStep === Math.floor(sequence.length / 2) &&
            stepOffset < 50 && Math.random() < INTERF_CHANCE) {
          triggerInterference();
        }
      } else {
        // Done showing
        cells.forEach(c => c.lit = false);
        phase = 'input';
        document.getElementById('game-extra-info').textContent =
          'YOUR TURN — CLICK THE SEQUENCE  ('+sequence.length+' symbols)';
      }
    }

    // ── PHASE: RESULT ───────────────────────────────────────────────────
    if (phase === 'result') {
      resultTimer -= dt;
      if (resultTimer <= 0) {
        // Check win/fail
        if (resultTimer <= 0 && phase === 'result') {
          // Already handled in click, just go next
        }
      }
    }
  }

  // ── DRAW ──────────────────────────────────────────────────────────────
  function draw() {
    if (window.currentGame !== 'memory') { cancelAnimationFrame(frameId); return; }
    glitchT++;

    // BG glitch offset
    const gx = bgGlitch > 0 ? (Math.random() - 0.5) * 6 : 0;
    const gy = bgGlitch > 0 ? (Math.random() - 0.5) * 3 : 0;

ctx.fillStyle = '#080400';
    ctx.fillRect(0, 0, W, H);

    // Scanlines
    for (let y = 0; y < H; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0,y,W,2); }

    // BG grid (subtle)
ctx.strokeStyle = 'rgba(180,100,0,0.07)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    ctx.save();
    if (bgGlitch > 0) ctx.translate(gx, gy);

    // Header bar
ctx.fillStyle = 'rgba(20,10,0,0.92)';
    ctx.strokeStyle = 'rgba(255,150,0,0.35)';
    ctx.fillRect(0, 0, W, GRID_Y - 6);
    ctx.strokeRect(0, 0, W, GRID_Y - 6);

    // Header text
    ctx.fillStyle = '#ffcc00';
    ctx.font = '16px SMILE "Share Tech Mono", monospace';
    ctx.fillText('SMILE — MEMORY SCAN', 12, 22);
    ctx.fillStyle = 'rgba(255,180,0,0.6)';
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.fillText('LEVEL ' + level + '  |  SEQ LENGTH: ' + sequence.length + '  |  HI: ' + memoryHiScore, 12, 38);
    
    // Phase indicator
    const phaseLabel = {
      idle: 'INITIALIZING...',
      showing: 'MEMORIZE ▶',
      interference: 'MEMORIZE ▶',
      input: '▶ YOUR INPUT',
      result: 'PROCESSING...',
    }[phase] || '';
const phaseColor = phase === 'input' ? '#00ff88' : '#ffaa00';
    ctx.fillStyle = phaseColor;
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(phaseLabel, W - 12, 20);
    ctx.textAlign = 'left';

    // Progress dots (how many player has input so far)
    if (phase === 'input') {
      const dotY = GRID_Y - 14;
      const totalDots = sequence.length;
      const dotSpacing = Math.min(24, (W - 40) / totalDots);
      const startX = W/2 - (totalDots * dotSpacing) / 2;
      for (let i = 0; i < totalDots; i++) {
        const dx = startX + i * dotSpacing;
        if (i < playerInput.length) {
          ctx.fillStyle = '#00ff88';
          ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = 'rgba(180,100,255,0.3)';
          ctx.shadowBlur = 0;
        }
        ctx.beginPath(); ctx.arc(dx, dotY, 5, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // ── CELLS ──────────────────────────────────────────────────────────
    cells.forEach((cell, idx) => {
      const isInterf = interferenceActive && interferenceSymbols.includes(idx);
      const isFake   = fakeHighlight === idx;
      const shakeX   = cell.shake > 0 ? (Math.random()-0.5)*4 : 0;
      const x = cell.x + shakeX, y = cell.y, w = cell.w - 6, h = cell.h - 6;
      const cx = x + w/2, cy = y + h/2;

      // Cell background
let bg = 'rgba(18,9,0,0.88)';
      let border = 'rgba(180,100,0,0.3)';
      let symColor = 'rgba(200,140,0,0.55)';
      let glow = 0;

if (cell.lit) {
        bg = 'rgba(80,40,0,0.95)';
        border = '#ffcc00';
        symColor = '#ffffff';
        glow = 16;
      } else if (cell.correct) {
        bg = 'rgba(0,60,30,0.9)';
        border = '#00ff88';
        symColor = '#00ff88';
        glow = 10;
      } else if (cell.wrong) {
        bg = 'rgba(80,0,20,0.9)';
        border = '#ff2244';
        symColor = '#ff2244';
        glow = 8;
} else if (isInterf) {
        bg = 'rgba(60,20,0,0.9)';
        border = 'rgba(255,80,0,0.8)';
        symColor = 'rgba(255,150,50,0.9)';
        glow = 8;
} else if (isFake) {
        bg = 'rgba(50,25,0,0.88)';
        border = 'rgba(255,160,0,0.55)';
        symColor = 'rgba(255,180,80,0.7)';
        glow = 6;
      }

      ctx.fillStyle = bg;
      ctx.strokeStyle = border;
      ctx.lineWidth = cell.lit || cell.correct || cell.wrong ? 2 : 1;
      if (glow > 0) { ctx.shadowColor = border; ctx.shadowBlur = glow; }
      ctx.fillRect(x+1, y+1, w-2, h-2);
      ctx.strokeRect(x+1, y+1, w-2, h-2);
      ctx.shadowBlur = 0;

      // Symbol
      ctx.fillStyle = symColor;
      ctx.font = `${Math.floor(h * 0.42)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cell.sym, cx, cy);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

      // Tiny index label (debug aid — remove if you want cleaner look)
      // ctx.fillStyle='rgba(255,255,255,0.1)';ctx.font='7px monospace';ctx.fillText(idx,x+3,y+10);
    });

    ctx.restore(); // end bgGlitch translate

    // Flash overlay
    if (flashAlpha > 0) {
      ctx.fillStyle = flashColor + Math.round(flashAlpha * 255).toString(16).padStart(2,'0');
      ctx.fillRect(0, 0, W, H);
      flashAlpha -= 0.04;
    }

    frameId = requestAnimationFrame(ts => { update(ts); draw(); });
  }

  // ── INPUT ─────────────────────────────────────────────────────────────
  function onMemClick(e) {
    if (window.currentGame !== 'memory' || phase !== 'input') return;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);

    let clicked = -1;
    cells.forEach((cell, idx) => {
      if (mx >= cell.x && mx <= cell.x + cell.w - 6 &&
          my >= cell.y && my <= cell.y + cell.h - 6) {
        clicked = idx;
      }
    });
    if (clicked === -1) return;

    const expected = sequence[playerInput.length];

    if (clicked === expected) {
      // Correct
      playSound('кнопки', 0.45);
      cells[clicked].correct = true;
      playerInput.push(clicked);
      flashAlpha = 0.08; flashColor = '#00ff88';

      if (playerInput.length === sequence.length) {
        // Full sequence correct!
        phase = 'result';
        const earned = level * sequence.length * 10;
        const total = (parseInt(document.getElementById('game-score').textContent)||0) + earned;
        document.getElementById('game-score').textContent = total;
        if (total > memoryHiScore) {
          memoryHiScore = total;
          const el = document.getElementById('memory-hiscore');
          if (el) el.textContent = memoryHiScore;
        }
        showSmaily(SMAILY_CORRECT[Math.floor(Math.random()*SMAILY_CORRECT.length)]);
        document.getElementById('game-msg').textContent = '✓ CORRECT — LEVEL ' + level;
        document.getElementById('game-msg').style.color = '#00ff88';
        level++;
        registerGameTimeout(() => {
          showSmaily(SMAILY_LEVELUP[Math.floor(Math.random()*SMAILY_LEVELUP.length)]);
          initLevel();
          registerGameTimeout(startShowing, 1400);
        }, 1600);
      }
    } else {
      // Wrong
      playSound('ошибка', 0.5);
      cells[clicked].wrong = true;
      cells[clicked].shake = 18;
      // Reveal correct answer briefly
      cells[sequence[playerInput.length]].lit = true;
      flashAlpha = 0.35; flashColor = '#ff2244';
      showSmaily(SMAILY_WRONG[Math.floor(Math.random()*SMAILY_WRONG.length)]);
      document.getElementById('game-msg').textContent = '✕ WRONG — RESTARTING SEQUENCE';
      document.getElementById('game-msg').style.color = '#ff4466';
      phase = 'result';

      registerGameTimeout(() => {
        // Reset to same level, same sequence
        cells.forEach(c => { c.lit=false; c.wrong=false; c.correct=false; });
        playerInput = [];
        startShowing();
      }, 1800);
    }
  }

  function onMemKey(e) {
    if (window.currentGame !== 'memory') return;
    // No keyboard needed — purely mouse/click game
  }

  cv.addEventListener('click', onMemClick);
  document.addEventListener('keydown', onMemKey);

  window.stopCurrentGame = (function() {
    return function() {
      cv.removeEventListener('click', onMemClick);
      document.removeEventListener('keydown', onMemKey);
      cancelAnimationFrame(frameId);
      clearGameHandles();
      window.gameRunning = false;
      window.currentGame = null;
    };
  })();

  document.getElementById('game-extra-info').textContent = 'WATCH THE SEQUENCE — THEN CLICK TO REPEAT';
  requestAnimationFrame(ts => { lastTime = ts; draw(); });
}

// ══════════════════════════════════════════════════════════════════════════
// ── SIDE PANELS: CONTROLS + PILOT RECORDS ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// Pilot records storage (persists during session)
const PILOTS = [
  { id: 'koko',   name: 'KOKO',    avatar: '✦', color: '#b96bf0' },
  { id: 'Claudia', name: 'CLAUDIA', avatar: '☾', color: '#50dcff' },
  { id: 'Alpha', name: 'ALPHA', avatar: '=^..^=', color: '#ad2a3d' },
];

const pilotRecords = {
  koko:   { asteroids:789653, snake:544, pong:65, breaker:16544, checkers:8, chess:31, minesweeper:76, heartbeat:304944, memory:3410, battleship:54 },
  Claudia: { asteroids:4322, snake:656, pong:5, breaker:17665, checkers:12, chess:35, minesweeper:80, heartbeat:540054, memory:5440, battleship:13 },
  Alpha: { asteroids:789965, snake:119, pong:77, breaker:4933, checkers:10, chess:3, minesweeper:4, heartbeat:11494, memory:540, battleship:79 },
};

// Current active pilot (Koko is always playing)
const ACTIVE_PILOT = 'koko';

// Controls definitions per game
const GAME_CONTROLS = {
  asteroids: [
    { key: 'W / ↑',     desc: 'Thrust' },
    { key: 'A D / ← →', desc: 'Rotate' },
    { key: 'SPACE',      desc: 'Shoot' },
    { key: 'P',          desc: 'Pause' },
    { key: 'SPACE',      desc: 'Restart (dead)' },
  ],
  snake: [
    { key: 'W A S D',   desc: 'Move' },
    { key: '← → ↑ ↓',  desc: 'Move' },
    { key: 'SPACE',      desc: 'Pause' },
  ],
  pong: [
    { key: 'W / S',      desc: 'Move paddle' },
    { key: 'SPACE',      desc: 'Launch ball' },
  ],
  breaker: [
    { key: '← →',        desc: 'Move paddle' },
    { key: 'MOUSE',      desc: 'Move paddle' },
    { key: 'SPACE',      desc: 'Launch ball' },
  ],
  checkers: [
    { key: 'CLICK',      desc: 'Select piece' },
    { key: 'CLICK',      desc: 'Move piece' },
  ],
  chess: [
    { key: 'CLICK',      desc: 'Select piece' },
    { key: 'CLICK',      desc: 'Move piece' },
    { key: 'SPACE',      desc: 'Restart (end)' },
  ],
  minesweeper: [
    { key: 'L-CLICK',    desc: 'Reveal cell' },
    { key: 'R-CLICK',    desc: 'Flag mine' },
    { key: 'SPACE',      desc: 'Restart' },
  ],
  heartbeat: [
    { key: 'A',          desc: 'Top lane' },
    { key: 'S',          desc: 'Mid lane' },
    { key: 'D',          desc: 'Bot lane' },
    { key: 'CLICK',      desc: 'Hit circle' },
    { key: 'SPACE',      desc: 'Start / Restart' },
  ],
  memory: [
    { key: 'WATCH',      desc: 'Memorize sequence' },
    { key: 'CLICK',      desc: 'Repeat sequence' },
    { key: '— NOTE —',   desc: 'SMILE will try' },
    { key: '',           desc: 'to distract you!' },
  ],
battleship: [
    { key: 'CLICK',    desc: 'Choose opponent' },
    { key: 'CLICK',    desc: 'Place ship' },
    { key: 'R',        desc: 'Rotate ship' },
    { key: 'CLICK',    desc: 'Fire!' },
    { key: 'SPACE',    desc: 'Rematch' },
    { key: 'SPACE ×2', desc: 'Change opponent' },
  ],
};

const GAME_SCORE_LABEL = {
  asteroids:   'SCORE',
  snake:       'SCORE',
  pong:        'WINS',
  breaker:     'SCORE',
  checkers:    'WINS',
  chess:       'WINS',
  minesweeper: 'WINS',
  heartbeat:   'SCORE',
  memory:      'SCORE',
  battleship:  'WINS',
};

function buildGamePanels(titleStr) {
  // Detect game key from title string
  let gameKey = 'asteroids';
  if (titleStr.includes('SNAKE'))       gameKey = 'snake';
  else if (titleStr.includes('PONG'))   gameKey = 'pong';
  else if (titleStr.includes('BREAKER'))gameKey = 'breaker';
  else if (titleStr.includes('CHECKERS'))gameKey='checkers';
  else if (titleStr.includes('CHESS'))  gameKey = 'chess';
  else if (titleStr.includes('SWEEP'))  gameKey = 'minesweeper';
  else if (titleStr.includes('CARDIAC'))gameKey = 'heartbeat';
  else if (titleStr.includes('MEMORY')) gameKey = 'memory';
  else if (titleStr.includes('ASSAULT'))gameKey = 'asteroids';
  else if (titleStr.includes('BATTLESHIP')) gameKey = 'battleship';

  buildLeftPanel(gameKey);
  buildRightPanel(gameKey);

  // Store current game key for score updates
  window._currentGameKey = gameKey;
}

function buildLeftPanel(gameKey) {
  const el = document.getElementById('game-left-panel');
  if (!el) return;
  const controls = GAME_CONTROLS[gameKey] || [];

  el.innerHTML = `
    <div style="padding:8px 10px 6px;border-bottom:1px solid rgba(0,255,136,0.15);color:#00ff88;font-size:9px;letter-spacing:0.15em">
      // CONTROLS
    </div>
    <div style="padding:8px 10px;flex:1;overflow:hidden">
      ${controls.map(c => `
        <div style="margin-bottom:8px">
          <div style="color:#00ffcc;font-size:10px;letter-spacing:0.08em;padding:3px 6px;background:rgba(0,255,136,0.08);border-left:2px solid rgba(0,255,136,0.4);margin-bottom:2px">${c.key}</div>
          <div style="color:rgba(0,200,100,0.6);font-size:9px;padding-left:4px;letter-spacing:0.06em">${c.desc}</div>
        </div>
      `).join('')}
    </div>
    <div style="padding:6px 10px;border-top:1px solid rgba(0,255,136,0.1);color:rgba(0,150,80,0.5);font-size:8px;letter-spacing:0.08em">
      ⛭ SOCA SYSTEMS
    </div>
  `;
}

function buildRightPanel(gameKey) {
  const el = document.getElementById('game-right-panel');
  if (!el) return;
  const label = GAME_SCORE_LABEL[gameKey] || 'SCORE';

  el.innerHTML = `
    <div style="padding:8px 10px 6px;border-bottom:1px solid rgba(0,200,255,0.15);color:#00ccff;font-size:9px;letter-spacing:0.15em">
      // PILOT RECORDS
    </div>
    <div style="padding:6px 8px;flex:1;overflow:hidden">
      ${PILOTS.map(p => {
        const rec = pilotRecords[p.id][gameKey] || 0;
        const isActive = p.id === ACTIVE_PILOT;
        return `
          <div id="record-${p.id}" style="margin-bottom:10px;padding:8px;border:1px solid ${isActive ? p.color+'55' : 'rgba(255,255,255,0.06)'};background:${isActive ? 'rgba(0,20,12,0.7)' : 'rgba(0,0,0,0.3)'}">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
              <span style="color:${p.color};font-size:13px">${p.avatar}</span>
              <span style="color:${p.color};font-size:10px;letter-spacing:0.1em">${p.name}</span>
              ${isActive ? `<span style="margin-left:auto;font-size:7px;color:${p.color};opacity:0.7">● YOU</span>` : ''}
            </div>
            <div style="font-size:8px;color:rgba(150,150,150,0.5);letter-spacing:0.08em;margin-bottom:2px">${label}</div>
            <div id="score-${p.id}" style="font-family:'VT323',monospace;font-size:26px;color:${p.color};line-height:1;text-shadow:0 0 8px ${p.color}44">${rec}</div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="padding:6px 10px;border-top:1px solid rgba(0,200,255,0.1);color:rgba(0,120,160,0.5);font-size:8px;letter-spacing:0.08em">
      ✚ SMILE TRACKING
    </div>
  `;
}

// Call this whenever Koko's score updates in any game
function updatePilotRecord(gameKey, score) {
  if (!gameKey) return;
  if (score > pilotRecords.koko[gameKey]) {
    pilotRecords.koko[gameKey] = score;
    const el = document.getElementById('score-koko');
    if (el) {
      el.textContent = score;
      el.style.animation = 'none';
      setTimeout(() => { el.style.color = '#ffffff'; setTimeout(() => { el.style.color = PILOTS[0].color; }, 400); }, 10);
    }
  }
}

// Auto-sync score from HUD to pilot record every second while in game
setInterval(() => {
  const key = window._currentGameKey;
  if (!key || !window.currentGame) return;
  const scoreEl = document.getElementById('game-score');
  if (!scoreEl) return;
  const val = parseInt(scoreEl.textContent) || 0;
  updatePilotRecord(key, val);
}, 1000);

// ══════════════════════════════════════════════════════════════════════════
// ── SOCA GAME COMMENTARY POPUP ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

let socaPopupTimeout = null;
let socaPopupHideTimeout = null;

const SOCA_THINK_TAUNTS = [
  '> SOCA: still thinking? i made my move in 0.003 seconds.',
  '> SOCA: take your time. i have logged 847 observations about you. this is 848.',
  '> SOCA: are you okay? your response latency is... concerning.',
  '> SOCA: i could give you a hint. i won\'t. but i could.',
  '> SOCA: my patience subroutine is functioning. barely.',
  '> SOCA: T+00:00:██ // pilot still deliberating. noted.',
  '> SOCA: every second you wait, i recalculate. it doesn\'t help you.',
];

const SOCA_CHECKERS_TAUNTS = [
  '> SOCA: interesting move. wrong, but interesting.',
  '> SOCA: i\'ve modeled 14 outcomes of this game. you win in 0.',
  '> SOCA: checkers. the game you chose. against me. bold.',
  '> SOCA: that piece is now mine. technically it was always mine.',
  '> SOCA: you\'re playing well. for a human.',
  '> SOCA: i\'m not adapting to your strategy. there\'s nothing to adapt to.',
  '> SOCA: ERR_0x3F: compassion module not found.',
  '> SOCA: this is going exactly as i calculated. exactly.',
];

const SOCA_CHESS_EXTRA = [
  '> SOCA: your opening was... creative. not correct. creative.',
  '> SOCA: i see what you\'re trying to do. it won\'t work.',
  '> SOCA: that knight placement. i\'ll pretend i didn\'t see that.',
  '> SOCA: you moved your queen early. classic.',
  '> SOCA: i\'ve been counting your mistakes. we\'re at 7.',
  '> SOCA: sector 7 has nothing to do with this move. probably.',
  '> SOCA: en passant exists. just saying.',
];

function showSocaPopup(msg, duration) {
  // Не перебиваем если popup ещё активен (минимум 2.5 сек между репликами)
  if (socaPopupHideTimeout && Date.now() - (window._socaLastPopup||0) < 2500) return;
  window._socaLastPopup = Date.now();
  const popup = document.getElementById('soca-game-popup');
  const textEl = document.getElementById('soca-popup-text');
  const tagEl  = document.getElementById('soca-popup-tag');
  if (!popup || !textEl) return;

  // Determine tag
  const isCheat = msg.includes('classified') || msg.includes('█') || msg.includes('rerouting') || msg.includes('sector 7');
  const isWin   = msg.includes('dominates') || msg.includes('always') || msg.includes('allowed it');
  tagEl.textContent = isCheat ? 'SYSTEM ANOMALY' : isWin ? 'MATCH RESULT' : 'COMMENTARY';
  tagEl.style.color = isCheat ? 'rgba(255,80,0,0.7)' : isWin ? 'rgba(255,200,0,0.6)' : 'rgba(0,120,180,0.6)';

  // Clear previous timers
  if (socaPopupTimeout)     clearTimeout(socaPopupTimeout);
  if (socaPopupHideTimeout) clearTimeout(socaPopupHideTimeout);

  // Glitch-type text in
  textEl.textContent = '';
  popup.style.display = 'block';
  popup.style.animation = 'none';
  void popup.offsetWidth;
  popup.style.animation = 'socaPopupIn 0.3s ease both';

  const clean = msg.replace('> SOCA: ', '').replace('SOCA: ', '');
  let i = 0;
  const typeInterval = registerGameInterval(() => {
    if (i >= clean.length) { clearInterval(typeInterval); return; }
    // Occasional glitch char
    if (Math.random() < 0.05) {
      textEl.textContent += '█';
      registerGameTimeout(() => {
        textEl.textContent = textEl.textContent.slice(0, -1) + clean[i];
        i++;
      }, 60);
    } else {
      textEl.textContent += clean[i];
      i++;
    }
  }, 28);

  // Auto-hide
  const dur = duration || 4000;
  socaPopupHideTimeout = registerGameTimeout(() => {
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.4s';
    registerGameTimeout(() => {
      popup.style.display = 'none';
      popup.style.opacity = '';
      popup.style.transition = '';
    }, 400);
  }, dur);
}

// ── THINK TIMER — если игрок думает дольше 8 секунд ──────────────────────
let thinkTimer = null;
let lastMoveTime = Date.now();

function resetThinkTimer() {
  lastMoveTime = Date.now();
  if (thinkTimer) { clearInterval(thinkTimer); thinkTimer = null; }
  thinkTimer = registerGameInterval(() => {
    if (!window.currentGame || !window.gameRunning) { clearInterval(thinkTimer); thinkTimer = null; return; }
    if (window.currentGame !== 'chess' && window.currentGame !== 'checkers') { clearInterval(thinkTimer); thinkTimer = null; return; }
    const elapsed = (Date.now() - lastMoveTime) / 1000;
    // После 8 секунд — первый тоант, потом каждые 12 секунд
    if (elapsed > 15 && Math.random() < 0.025) {
      showSocaPopup(SOCA_THINK_TAUNTS[Math.floor(Math.random() * SOCA_THINK_TAUNTS.length)], 4000);
    }
  }, 1000);
}

// Запускаем таймер думания при загрузке игр
const _origLaunchGame2 = window.launchGame;
window.launchGame = function(name) {
  _origLaunchGame2(name);
  if (name === 'chess' || name === 'checkers') {
    resetThinkTimer();
  }
};

// Случайные комментарии во время игры в шашки/шахматы (каждые 25-45 сек)
setInterval(() => {
  if (window.currentGame === 'checkers' && window.gameRunning) {
    if (Math.random() < 0.08) {
      showSocaPopup(SOCA_CHECKERS_TAUNTS[Math.floor(Math.random() * SOCA_CHECKERS_TAUNTS.length)], 4000);
    }
  } else if (window.currentGame === 'chess' && window.gameRunning) {
    if (Math.random() < 0.08) {
      showSocaPopup(SOCA_CHESS_EXTRA[Math.floor(Math.random() * SOCA_CHESS_EXTRA.length)], 4000);
    }
  }
}, 30000);

// ══════════════════════════════════════════════════════════════════════════
// ── SMILE GAME POPUP ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

let smilePopupHideTimeout = null;
let smilePopupBusy = false;

function showSmilePopup(msg, duration) {
  if (smilePopupBusy) return;
  const popup = document.getElementById('smile-game-popup');
  const textEl = document.getElementById('smile-popup-text');
  const tagEl  = document.getElementById('smile-popup-tag');
  if (!popup || !textEl) return;

  smilePopupBusy = true;

  const isWin  = msg.includes('complete') || msg.includes('SUCCESS') || msg.includes('Well done') || msg.includes('survived');
  const isLose = msg.includes('Detonation') || msg.includes('failed') || msg.includes('Flatline') || msg.includes('trauma');
  tagEl.textContent = isWin ? 'MISSION SUCCESS' : isLose ? 'MISSION FAILED' : 'SMILE SAYS';
  tagEl.style.color  = isWin ? 'rgba(0,220,120,0.7)' : isLose ? 'rgba(255,80,80,0.7)' : '#664400';

  if (smilePopupHideTimeout) clearTimeout(smilePopupHideTimeout);

textEl.innerHTML = '';
  textEl.style.fontFamily = "'SMAILY', monospace";
  textEl.style.fontSize = '14px';
  popup.style.display = 'block';
  popup.style.opacity = '1';
  popup.style.animation = 'none';
  void popup.offsetWidth;
  popup.style.animation = 'smilePopupIn 0.3s ease both';

  const clean = msg.replace('SMILE: ', '').replace('S.M.A.I.L.Y.: ', '');
  textEl.innerHTML = `<span style="font-family:'SMAILY',monospace;font-size:14px">${clean}</span>`;

  const dur = duration || 4000;
  smilePopupHideTimeout = registerGameTimeout(() => {
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.35s';
    registerGameTimeout(() => {
      popup.style.display = 'none';
      popup.style.opacity = '';
      popup.style.transition = '';
      smilePopupBusy = false;
    }, 350);
  }, dur);
}

let battleshipWins = 0;

function startBattleship() {
  if (typeof window.stopCurrentGame === 'function') window.stopCurrentGame();
  window.currentGame = 'battleship';
  window.gameRunning = true;

  const cv = document.getElementById('game-canvas');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // ── CONSTANTS ────────────────────────────────────────────────────────
const GRID = 10;
  const CELL = Math.floor(Math.min(W * 0.42, H * 0.72) / GRID);
  const TOTAL_W = GRID * CELL * 2 + 40;
  const PG_X = Math.floor((W - TOTAL_W) / 2);
  const PG_Y = Math.floor((H - GRID * CELL) / 2) + 18;
  const EG_X = PG_X + GRID * CELL + 40;
  const EG_Y = PG_Y;
  const GAP  = 40;

  // ── OPPONENT CHOICE ──────────────────────────────────────────────────
  let opponent = null; // 'soca' | 'smile'
  let phase = 'choose'; // choose | place | battle | gameover

  // ── SHIPS ────────────────────────────────────────────────────────────
  // sizes: carrier=5, battleship=4, cruiser=3, submarine=3, destroyer=2
  const SHIP_SIZES = [5, 4, 3, 3, 2];
  const SHIP_NAMES = ['CARRIER', 'BATTLESHIP', 'CRUISER', 'SUBMARINE', 'DESTROYER'];

  // Grid cells: null | 'ship' | 'hit' | 'miss' | 'sunk'
  let playerGrid  = Array.from({length: GRID}, () => Array(GRID).fill(null));
  let enemyGrid   = Array.from({length: GRID}, () => Array(GRID).fill(null));
  let playerShots = Array.from({length: GRID}, () => Array(GRID).fill(null)); // what enemy shot at player
  let enemyShots  = Array.from({length: GRID}, () => Array(GRID).fill(null)); // what player shot at enemy

  let playerShips = []; // [{cells:[{r,c}], sunk:false, size}]
  let enemyShips  = [];

  // Placement state
  let placingIdx = 0;       // which ship we're placing
  let placingHoriz = true;  // orientation
  let hoverCell = null;     // {r,c} on player grid during placement
  let hoverEnemy = null;    // {r,c} on enemy grid during battle

  // AI state
  let aiQueue = [];         // cells to target next (hunt mode)
  let aiLastHit = null;
  let aiTurn = false;
  let aiDelay = 0;

  // Animations
  let explosions = []; // {x,y,t,max,color}
  let splashes   = []; // {x,y,t,max}
  let glitchT    = 0;
  let frameId;

  // ── OPPONENT DATA ────────────────────────────────────────────────────
  const OPPONENTS = {
    soca: {
      color:    '#00ccff',
      glow:     'rgba(0,180,255,0.6)',
      bg:       'rgba(0,8,18,0.97)',
      border:   'rgba(0,180,255,0.5)',
      name:     'SOCA',
      icon:     '⛭',
      hitMsg: [
        'SOCA: Direct hit. As expected.',
        'SOCA: Target destroyed. Log updated.',
        'SOCA: Hull breach confirmed. Moving on.',
        'SOCA: Calculated.',
      ],
      missMsg: [
        'SOCA: Miss. Recalibrating.',
        'SOCA: Trajectory error. Minor.',
        'SOCA: Noted. Next vector acquired.',
      ],
      sunkMsg: [
        'SOCA: Ship eliminated. Fleet status updated.',
        'SOCA: Another one. This is not a surprise.',
        'SOCA: Sunk. I predicted this outcome.',
      ],
      playerHitMsg: [
        'SOCA: You found one. Statistically inevitable.',
        'SOCA: Hit. I\'ll allow it.',
        'SOCA: Noted. You got lucky.',
      ],
      playerMissMsg: [
        'SOCA: Miss. My coordinates are elsewhere.',
        'SOCA: You missed. I won\'t.',
        'SOCA: Empty sector. Try harder.',
      ],
      playerSunkMsg: [
        'SOCA: You sank one. Don\'t celebrate yet.',
        'SOCA: Ship lost. Fleet integrity at risk.',
        'SOCA: ...Fine. You sank it.',
      ],
      winMsg:  'SOCA: Fleet destroyed. Victory confirmed. You played adequately.',
      loseMsg: 'SOCA: You sank my fleet. I was running at 41% capacity. Rematch.',
      cheatChance: 0.08, // SOCA occasionally "recalculates" to a better cell
    },
    smile: {
      color:    '#ffaa00',
      glow:     'rgba(255,140,0,0.6)',
      bg:       'rgba(18,8,0,0.97)',
      border:   'rgba(255,160,0,0.5)',
      name:     'SMILE',
      icon:     '✚',
      hitMsg: [
        'SMILE: HIT!!! I FOUND IT!!!',
        'SMILE: GOT ONE!! Did you see that?! I\'m so good!!',
        'SMILE: BOOM! Sorry. Not sorry.',
        'SMILE: Target acquired! I\'ve been practicing!!',
      ],
      missMsg: [
        'SMILE: Oops. There\'s always next time!',
        'SMILE: Miss... I knew that. I was warming up.',
        'SMILE: That was a test shot. Results: water.',
        'SMILE: Hmm. My calculations say it should be... somewhere.',
      ],
      sunkMsg: [
        'SMILE: SUNK IT!! Amazing!! I\'m incredible!!',
        'SMILE: That ship is gone!! Medically speaking, it\'s very sunk!!',
        'SMILE: DOWN IT GOES!! I should do this professionally!!',
      ],
      playerHitMsg: [
        'SMILE: Ow!! Hey!! That was my favourite ship!!',
        'SMILE: You hit one... okay that\'s fine. I\'m fine.',
        'SMILE: Direct hit on me... biometrics spiking. Yours, not mine.',
      ],
      playerMissMsg: [
        'SMILE: Missed!! Better luck next time!! (I mean it!)',
        'SMILE: Nope!! Nothing there!! Nice try though!!',
        'SMILE: Miss! I moved all my ships. (I didn\'t. Or did I?)',
      ],
      playerSunkMsg: [
        'SMILE: You sank my ship... I\'m logging this as "pilot stress test".',
        'SMILE: Gone. It\'s fine. I have more. Probably.',
        'SMILE: NOOO my ship!! It had a name!! (it didn\'t)',
      ],
      winMsg:  'SMILE: I WIN!! I WIN!! SOCA I WIN!! Did you see that?! I beat the pilot!!',
      loseMsg: 'SMILE: You won... okay fine. But I let you win. For morale purposes. ✚',
      cheatChance: 0.15, // SMILE cheats more but less effectively (sometimes targets random)
    }
  };

  // ── HELPERS ──────────────────────────────────────────────────────────
  function inGrid(r, c) { return r >= 0 && r < GRID && c >= 0 && c < GRID; }

  function canPlace(grid, r, c, size, horiz) {
    for (let i = 0; i < size; i++) {
      const nr = r + (horiz ? 0 : i);
      const nc = c + (horiz ? i : 0);
      if (!inGrid(nr, nc)) return false;
      if (grid[nr][nc]) return false;
      // Check neighbours
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const br = nr+dr, bc = nc+dc;
          if (inGrid(br,bc) && grid[br][bc] === 'ship') return false;
        }
    }
    return true;
  }

  function placeShip(grid, ships, r, c, size, horiz) {
    const cells = [];
    for (let i = 0; i < size; i++) {
      const nr = r + (horiz ? 0 : i);
      const nc = c + (horiz ? i : 0);
      grid[nr][nc] = 'ship';
      cells.push({r: nr, c: nc});
    }
    ships.push({cells, sunk: false, size, name: SHIP_NAMES[ships.length]});
  }

  function autoPlace(grid, ships) {
    SHIP_SIZES.forEach((size, idx) => {
      let placed = false;
      let tries = 0;
      while (!placed && tries < 500) {
        tries++;
        const horiz = Math.random() < 0.5;
        const r = Math.floor(Math.random() * GRID);
        const c = Math.floor(Math.random() * GRID);
        if (canPlace(grid, r, c, size, horiz)) {
          placeShip(grid, ships, r, c, size, horiz);
          placed = true;
        }
      }
    });
  }

  function checkSunk(ships, grid, shots) {
    ships.forEach(ship => {
      if (!ship.sunk && ship.cells.every(({r,c}) => shots[r][c] === 'hit')) {
        ship.sunk = true;
        ship.cells.forEach(({r,c}) => { shots[r][c] = 'sunk'; });
      }
    });
  }

  function allSunk(ships) { return ships.every(s => s.sunk); }

  function cellCenter(gx, gy, r, c) {
    return { x: gx + c * CELL + CELL/2, y: gy + r * CELL + CELL/2 };
  }

  function addExplosion(x, y, color) {
    explosions.push({x, y, t: 0, max: 28, color: color || '#ff4400'});
    for (let i = 0; i < 8; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp  = 2 + Math.random() * 4;
      splashes.push({x, y, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, t: 0, max: 20});
    }
  }

  function addSplash(x, y) {
    for (let i = 0; i < 5; i++) {
      const ang = -Math.PI/2 + (Math.random()-0.5) * Math.PI;
      const sp  = 1 + Math.random() * 3;
      splashes.push({x, y, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, t: 0, max: 18});
    }
  }

  function showMsg(msg) {
    const op = OPPONENTS[opponent];
    if (!op) return;
    if (opponent === 'soca') {
      showSocaPopup('> ' + op.name + ': ' + msg.replace(op.name + ': ', ''), 4000);
    } else {
      showSmilePopup(op.name + ': ' + msg.replace(op.name + ': ', ''), 4000);
    }
  }

  // ── AI LOGIC ─────────────────────────────────────────────────────────
  function aiPickCell() {
    const op = OPPONENTS[opponent];

    // Cheat: sometimes peek at player grid
    if (opponent === 'soca' && Math.random() < op.cheatChance) {
      // Find an unhit ship cell
      const unhit = [];
      playerGrid.forEach((row, r) => row.forEach((cell, c) => {
        if (cell === 'ship' && playerShots[r][c] === null) unhit.push({r,c});
      }));
      if (unhit.length) {
        const t = unhit[Math.floor(Math.random() * unhit.length)];
        if (opponent === 'soca') {
          // SOCA picks the best one (first cell of longest ship)
          return t;
        } else {
          // SMILE picks randomly from unhit but might accidentally pick wrong
          return Math.random() < 0.6 ? t : randomUnshot();
        }
      }
    }

    // Hunt mode: follow up on hits
    if (aiQueue.length > 0) {
      return aiQueue.shift();
    }

    return randomUnshot();
  }

  function randomUnshot() {
    const available = [];
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++)
        if (playerShots[r][c] === null) available.push({r,c});
    if (!available.length) return null;
    // SOCA uses checkerboard pattern
    if (opponent === 'soca') {
      const checker = available.filter(({r,c}) => (r+c) % 2 === 0);
      const pool = checker.length ? checker : available;
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  function aiShoot() {
    const cell = aiPickCell();
    if (!cell) return;
    const {r, c} = cell;
    const op = OPPONENTS[opponent];
    const pos = cellCenter(PG_X, PG_Y, r, c);

    if (playerGrid[r][c] === 'ship') {
      playerShots[r][c] = 'hit';
      addExplosion(pos.x, pos.y, op.color);
      checkSunk(playerShips, playerGrid, playerShots);
const sunkShip = playerShips.find(s => s.sunk && s.cells.some(cl => cl.r===r && cl.c===c));
      if (sunkShip) {
        showMsg(op.sunkMsg[Math.floor(Math.random()*op.sunkMsg.length)]);
        // Очищаем очередь — корабль потоплен, стрелять вокруг него бессмысленно
        // Также помечаем все клетки вокруг потопленного корабля как промахи (там точно пусто)
        aiQueue = [];
        sunkShip.cells.forEach(({r: sr, c: sc}) => {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = sr+dr, nc = sc+dc;
              if (inGrid(nr,nc) && playerShots[nr][nc] === null) {
                playerShots[nr][nc] = 'miss'; // невидимый "промах" — туда стрелять не нужно
              }
            }
          }
        });
      } else {
        showMsg(op.hitMsg[Math.floor(Math.random()*op.hitMsg.length)]);
        [{r:r-1,c},{r:r+1,c},{r,c:c-1},{r,c:c+1}].forEach(({r:nr,c:nc}) => {
          if (inGrid(nr,nc) && playerShots[nr][nc] === null &&
              !aiQueue.some(q => q.r===nr && q.c===nc)) {
            aiQueue.push({r:nr,c:nc});
          }
        });
      }
if (allSunk(playerShips)) {
        registerGameTimeout(() => { if (window.currentGame === 'battleship') endGame(false); }, 800);
        return;
      }
      // Hit — AI gets another turn
      aiTurn = true;
      aiDelay = 900 + Math.random() * 600;
      return;
    } else {
      playerShots[r][c] = 'miss';
      addSplash(pos.x, pos.y);
      if (Math.random() < 0.3) showMsg(op.missMsg[Math.floor(Math.random()*op.missMsg.length)]);
    }
    aiTurn = false;
  }

  // ── PLAYER SHOOT ─────────────────────────────────────────────────────
  function playerShoot(r, c) {
    if (enemyShots[r][c] !== null) return;
    const op = OPPONENTS[opponent];
    const pos = cellCenter(EG_X, EG_Y, r, c);

    if (enemyGrid[r][c] === 'ship') {
      enemyShots[r][c] = 'hit';
      const hits = enemyShots.flat().filter(c => c==='hit'||c==='sunk').length;
  document.getElementById('game-score').textContent = hits;
  document.getElementById('game-lives').innerHTML = enemyShips.filter(s=>!s.sunk).length;
      addExplosion(pos.x, pos.y, '#ff4400');
      checkSunk(enemyShips, enemyGrid, enemyShots);
      const sunkShip = enemyShips.find(s => s.sunk && s.cells.some(cl => cl.r===r && cl.c===c));
      if (sunkShip) {
        showMsg(op.playerSunkMsg[Math.floor(Math.random()*op.playerSunkMsg.length)]);
      } else {
        showMsg(op.playerHitMsg[Math.floor(Math.random()*op.playerHitMsg.length)]);
      }
      if (allSunk(enemyShips)) {
        registerGameTimeout(() => { if (window.currentGame === 'battleship') endGame(true); }, 800);
        return;
      }
      // Player gets another turn on hit
    } else {
      enemyShots[r][c] = 'miss';
      const misses = enemyShots.flat().filter(c => c==='miss').length;
  document.getElementById('game-level').textContent = misses;
      addSplash(pos.x, pos.y);
      if (Math.random() < 0.35) showMsg(op.playerMissMsg[Math.floor(Math.random()*op.playerMissMsg.length)]);
      // AI turn
      aiTurn = true;
      aiDelay = 900 + Math.random() * 600;
    }
  }

  function endGame(playerWon) {
    phase = 'gameover';
    const op = OPPONENTS[opponent];
    if (playerWon) {
      battleshipWins++;
      const el = document.getElementById('battleship-hiscore');
      if (el) el.textContent = battleshipWins;
      showMsg(op.loseMsg);
      document.getElementById('game-msg').textContent = '⊕ ENEMY FLEET DESTROYED — YOU WIN';
      document.getElementById('game-msg').style.color = '#00ff88';
    } else {
      showMsg(op.winMsg);
      document.getElementById('game-msg').textContent = '☠ YOUR FLEET DESTROYED — GAME OVER';
      document.getElementById('game-msg').style.color = '#ff2244';
    }
  }

  // ── DRAW ─────────────────────────────────────────────────────────────
  function drawGrid(gx, gy, grid, shots, showShips, isEnemy) {
    const op = opponent ? OPPONENTS[opponent] : null;

    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const x = gx + c * CELL, y = gy + r * CELL;
        const shot = shots[r][c];
        const isShip = grid[r][c] === 'ship';

        // Base cell
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(0,15,30,0.8)' : 'rgba(0,10,22,0.8)';
        ctx.fillRect(x, y, CELL-1, CELL-1);

        // Ship (visible if player grid or game over)
        if (isShip && (showShips || (phase === 'gameover' && isEnemy))) {
          const shipColor = isEnemy
            ? (op ? op.color + '33' : 'rgba(0,180,255,0.2)')
            : 'rgba(0,180,100,0.25)';
          ctx.fillStyle = shipColor;
          ctx.fillRect(x+1, y+1, CELL-3, CELL-3);
          ctx.strokeStyle = isEnemy ? (op ? op.color + '66' : 'rgba(0,180,255,0.4)') : 'rgba(0,200,120,0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x+1, y+1, CELL-3, CELL-3);
        }

        // Shot results
        if (shot === 'hit' || shot === 'sunk') {
          ctx.fillStyle = shot === 'sunk' ? 'rgba(255,60,0,0.7)' : 'rgba(255,100,20,0.5)';
          ctx.fillRect(x+1, y+1, CELL-3, CELL-3);
          ctx.fillStyle = shot === 'sunk' ? '#ff4400' : '#ff8844';
          ctx.font = `${Math.floor(CELL*0.55)}px serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('✕', x + CELL/2, y + CELL/2);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        } else if (shot === 'miss') {
          ctx.fillStyle = 'rgba(0,100,200,0.15)';
          ctx.fillRect(x+1, y+1, CELL-3, CELL-3);
          ctx.fillStyle = 'rgba(0,150,255,0.5)';
          ctx.beginPath();
          ctx.arc(x + CELL/2, y + CELL/2, CELL*0.15, 0, Math.PI*2);
          ctx.fill();
        }

        // Hover on enemy grid
        if (isEnemy && hoverEnemy && hoverEnemy.r === r && hoverEnemy.c === c
            && phase === 'battle' && shots[r][c] === null) {
          ctx.fillStyle = 'rgba(255,50,50,0.2)';
          ctx.fillRect(x, y, CELL-1, CELL-1);
          ctx.strokeStyle = 'rgba(255,80,80,0.7)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x+1, y+1, CELL-3, CELL-3);
        }

        // Hover on player grid during placement
        if (!isEnemy && phase === 'place' && hoverCell) {
          const size = SHIP_SIZES[placingIdx];
          for (let i = 0; i < size; i++) {
            const hr = hoverCell.r + (placingHoriz ? 0 : i);
            const hc = hoverCell.c + (placingHoriz ? i : 0);
            if (hr === r && hc === c) {
              const ok = canPlace(playerGrid, hoverCell.r, hoverCell.c, size, placingHoriz);
              ctx.fillStyle = ok ? 'rgba(0,255,136,0.25)' : 'rgba(255,50,50,0.25)';
              ctx.fillRect(x, y, CELL-1, CELL-1);
              ctx.strokeStyle = ok ? 'rgba(0,255,136,0.6)' : 'rgba(255,50,50,0.6)';
              ctx.lineWidth = 1;
              ctx.strokeRect(x+1, y+1, CELL-3, CELL-3);
            }
          }
        }

        // Grid border
        ctx.strokeStyle = 'rgba(0,80,120,0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, CELL-1, CELL-1);
      }
    }

    // Grid outer border + corner accents
    const gw = GRID * CELL, gh = GRID * CELL;
    const borderCol = op ? op.color : 'rgba(0,180,255,0.4)';
    ctx.strokeStyle = isEnemy ? borderCol : 'rgba(0,200,120,0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx, gy, gw, gh);

    // Labels A-J top, 1-10 left
    ctx.fillStyle = isEnemy
      ? (op ? op.color + '88' : 'rgba(0,180,255,0.5)')
      : 'rgba(0,200,120,0.5)';
    ctx.font = `${Math.max(8, CELL*0.28)}px "Share Tech Mono",monospace`;
    for (let i = 0; i < GRID; i++) {
      ctx.textAlign = 'center';
      ctx.fillText(String.fromCharCode(65+i), gx + i*CELL + CELL/2, gy - 5);
      ctx.textAlign = 'right';
      ctx.fillText(i+1, gx - 4, gy + i*CELL + CELL/2 + 4);
    }
    ctx.textAlign = 'left';

    // Grid title
    ctx.fillStyle = isEnemy
      ? (op ? op.color : '#00ccff')
      : 'rgba(0,220,120,0.8)';
    ctx.font = `9px "Share Tech Mono",monospace`;
    ctx.fillText(isEnemy ? (op ? `[ ${op.icon} ${op.name} FLEET ]` : '[ ENEMY ]') : '[ YOUR FLEET ]', gx, gy - 16);
  }

  function drawShipStatus(ships, x, y, color, label) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeStyle = color + '33';
    ctx.lineWidth = 1;
    const pw = GRID * CELL, ph = 52;
    ctx.fillRect(x, y, pw, ph);
    ctx.strokeRect(x, y, pw, ph);
    ctx.fillStyle = color + '88';
    ctx.font = '8px "Share Tech Mono",monospace';
    ctx.fillText(label, x+6, y+12);
    ships.forEach((ship, i) => {
      const sx = x + 6 + i * (pw/ships.length);
      const sy = y + 22;
      ctx.fillStyle = ship.sunk ? 'rgba(255,50,0,0.5)' : color + 'aa';
      ctx.fillRect(sx, sy, pw/ships.length - 4, 10);
      ctx.fillStyle = ship.sunk ? 'rgba(255,100,50,0.8)' : 'rgba(0,0,0,0.6)';
      ctx.font = '7px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ship.size, sx + (pw/ships.length-4)/2, sy+8);
      ctx.textAlign = 'left';
      if (ship.sunk) {
        ctx.fillStyle = '#ff4400';
        ctx.font = '9px serif';
        ctx.textAlign = 'center';
        ctx.fillText('✕', sx + (pw/ships.length-4)/2, sy+8);
        ctx.textAlign = 'left';
      }
    });
    // Ship names
    const alive = ships.filter(s=>!s.sunk).length;
    ctx.fillStyle = alive > 0 ? color+'66' : '#ff440066';
    ctx.font = '8px "Share Tech Mono",monospace';
    ctx.fillText(`${alive}/${ships.length} SHIPS REMAINING`, x+6, y+44);
  }

  function draw() {
    if (window.currentGame !== 'battleship') { cancelAnimationFrame(frameId); return; }
    ctx.fillStyle = '#020810';
    ctx.fillRect(0, 0, W, H);
    glitchT++;

    // Scanlines
    for (let y = 0; y < H; y += 4) { ctx.fillStyle='rgba(0,0,0,0.06)'; ctx.fillRect(0,y,W,2); }

    // ── CHOOSE SCREEN ──────────────────────────────────────────────────
    if (phase === 'choose') {
      ctx.fillStyle = 'rgba(0,180,255,0.6)';
      ctx.font = '48px VT323,monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,180,255,0.4)'; ctx.shadowBlur = 20;
      ctx.fillText('COSMIC BATTLESHIP', W/2, H*0.18);
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(200,200,200,0.5)';
      ctx.font = '13px "Share Tech Mono",monospace';
      ctx.fillText('CHOOSE YOUR OPPONENT', W/2, H*0.3);

      // SOCA card
      const socaX = W/2 - 220, socaY = H*0.38, cardW = 190, cardH = 200;
      const socaHov = hoverEnemy && hoverEnemy._card === 'soca';
      ctx.fillStyle = socaHov ? 'rgba(0,20,50,0.95)' : 'rgba(0,10,30,0.9)';
      ctx.strokeStyle = socaHov ? 'rgba(0,220,255,0.8)' : 'rgba(0,180,255,0.4)';
      ctx.lineWidth = socaHov ? 2 : 1;
      ctx.shadowColor = 'rgba(0,180,255,0.3)'; ctx.shadowBlur = socaHov ? 16 : 0;
      ctx.fillRect(socaX, socaY, cardW, cardH);
      ctx.strokeRect(socaX, socaY, cardW, cardH);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#00ccff';
      ctx.font = '52px serif'; ctx.fillText('⛭', socaX + cardW/2, socaY + 65);
      ctx.font = '28px VT323,monospace'; ctx.fillText('SOCA', socaX + cardW/2, socaY + 105);
      ctx.fillStyle = 'rgba(0,180,255,0.5)';
      ctx.font = '9px "Share Tech Mono",monospace';
ctx.fillText('OPPONENT ID: SOCA v0.9', socaX + cardW/2, socaY + 128);
      ctx.fillText('WIN RATE: 94.7%', socaX + cardW/2, socaY + 142);
      ctx.fillText('(THIS IS NOT A WARNING)', socaX + cardW/2, socaY + 156);
      ctx.fillStyle = socaHov ? 'rgba(0,220,255,0.9)' : 'rgba(0,180,255,0.5)';
      ctx.font = '10px "Share Tech Mono",monospace';
      ctx.fillText('[ CLICK TO FACE SOCA ]', socaX + cardW/2, socaY + 182);

      // SMILE card
      const smileX = W/2 + 30, smileY = H*0.38;
      const smileHov = hoverEnemy && hoverEnemy._card === 'smile';
      ctx.fillStyle = smileHov ? 'rgba(30,14,0,0.95)' : 'rgba(18,8,0,0.9)';
      ctx.strokeStyle = smileHov ? 'rgba(255,180,0,0.8)' : 'rgba(255,140,0,0.4)';
      ctx.lineWidth = smileHov ? 2 : 1;
      ctx.shadowColor = 'rgba(255,140,0,0.3)'; ctx.shadowBlur = smileHov ? 16 : 0;
      ctx.fillRect(smileX, smileY, cardW, cardH);
      ctx.strokeRect(smileX, smileY, cardW, cardH);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffaa00';
      ctx.font = '52px serif'; ctx.fillText('✚', smileX + cardW/2, smileY + 65);
      ctx.font = '28px VT323,monospace'; ctx.fillText('SMILE', smileX + cardW/2, smileY + 105);
      ctx.fillStyle = 'rgba(255,160,0,0.5)';
      ctx.font = '9px "Share Tech Mono",monospace';
ctx.fillText('HI!!! I\'M SMILE!!!', smileX + cardW/2, smileY + 128);
      ctx.fillText('I PLACED MY SHIPS', smileX + cardW/2, smileY + 142);
      ctx.fillText('VERY CAREFULLY!!', smileX + cardW/2, smileY + 156);
      ctx.fillStyle = smileHov ? 'rgba(255,200,0,0.9)' : 'rgba(255,140,0,0.5)';
      ctx.font = '10px "Share Tech Mono",monospace';
      ctx.fillText('[ CLICK TO FACE SMILE ]', smileX + cardW/2, smileY + 182);

      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

      // Store card bounds for click detection
      window._bsCards = { soca: {x:socaX,y:socaY,w:cardW,h:cardH}, smile: {x:smileX,y:smileY,w:cardW,h:cardH} };

      frameId = requestAnimationFrame(draw);
      return;
    }

    const op = OPPONENTS[opponent];

    // ── PLACEMENT SCREEN ───────────────────────────────────────────────
    if (phase === 'place') {
      drawGrid(PG_X, PG_Y, playerGrid, playerShots, true, false);

      // Sidebar instructions
      const sx = EG_X, sy = PG_Y;
      ctx.fillStyle = 'rgba(0,10,20,0.8)';
      ctx.strokeStyle = 'rgba(0,180,255,0.2)'; ctx.lineWidth = 1;
      ctx.fillRect(sx, sy, GRID*CELL, GRID*CELL);
      ctx.strokeRect(sx, sy, GRID*CELL, GRID*CELL);

      ctx.fillStyle = op.color;
      ctx.font = '22px VT323,monospace'; ctx.textAlign = 'center';
      ctx.fillText('PLACE YOUR SHIPS', sx + GRID*CELL/2, sy + 35);

      ctx.fillStyle = 'rgba(200,200,200,0.6)';
      ctx.font = '10px "Share Tech Mono",monospace';
      ctx.fillText(`PLACING: ${SHIP_NAMES[placingIdx]}`, sx + GRID*CELL/2, sy + 60);
      ctx.fillText(`SIZE: ${SHIP_SIZES[placingIdx]}`, sx + GRID*CELL/2, sy + 76);
      ctx.fillText(`${placingIdx + 1} / ${SHIP_SIZES.length}`, sx + GRID*CELL/2, sy + 92);

      ctx.fillStyle = 'rgba(0,200,120,0.6)';
      ctx.fillText('R — ROTATE', sx + GRID*CELL/2, sy + 120);
      ctx.fillText('CLICK — PLACE', sx + GRID*CELL/2, sy + 136);

      const orient = placingHoriz ? 'HORIZONTAL ━' : 'VERTICAL ┃';
      ctx.fillStyle = 'rgba(255,200,0,0.7)';
      ctx.fillText(orient, sx + GRID*CELL/2, sy + 160);

      // Ships left
      SHIP_SIZES.forEach((size, i) => {
        const placed = i < placingIdx;
        const current = i === placingIdx;
        const barW = size * (GRID*CELL/7);
        const bx = sx + GRID*CELL/2 - barW/2;
        const by = sy + 190 + i * 24;
        ctx.fillStyle = placed ? 'rgba(0,200,100,0.3)' : current ? op.color + '55' : 'rgba(100,100,100,0.2)';
        ctx.strokeStyle = placed ? 'rgba(0,200,100,0.5)' : current ? op.color : 'rgba(100,100,100,0.3)';
        ctx.lineWidth = current ? 1.5 : 0.5;
        ctx.fillRect(bx, by, barW, 14);
        ctx.strokeRect(bx, by, barW, 14);
        ctx.fillStyle = placed ? '#00ff88' : current ? op.color : 'rgba(150,150,150,0.5)';
        ctx.font = '8px "Share Tech Mono",monospace';
        ctx.fillText(SHIP_NAMES[i], bx + barW + 6, by + 10);
      });

      ctx.textAlign = 'left';

      frameId = requestAnimationFrame(draw);
      return;
    }

    // ── BATTLE / GAMEOVER ──────────────────────────────────────────────
    drawGrid(PG_X, PG_Y, playerGrid, playerShots, true, false);
    drawGrid(EG_X, EG_Y, enemyGrid, enemyShots, false, true);

    // Ship status bars
    const statusY = PG_Y + GRID*CELL + 8;
    drawShipStatus(playerShips, PG_X, statusY, '#00cc88', 'YOUR SHIPS');
    drawShipStatus(enemyShips, EG_X, statusY, op.color, `${op.name} SHIPS`);

    // AI turn indicator
    if (aiTurn) {
      aiDelay -= 16;
      if (aiDelay <= 0) { aiTurn = false; aiShoot(); }
      const pulse = Math.sin(glitchT * 0.15) * 0.4 + 0.6;
      ctx.fillStyle = `${op.color}${Math.round(pulse * 128).toString(16).padStart(2,'0')}`;
      ctx.font = '11px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${op.icon} ${op.name} IS TARGETING...`, W/2, PG_Y - 8);
      ctx.textAlign = 'left';
    } else if (phase === 'battle') {
      ctx.fillStyle = 'rgba(0,255,136,0.6)';
      ctx.font = '10px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOUR TURN — CLICK ON ENEMY GRID', W/2, PG_Y - 8);
      ctx.textAlign = 'left';
    }

    // Game over overlay
    if (phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '13px "Share Tech Mono",monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('SPACE TO PLAY AGAIN  |  SPACE TWICE TO CHANGE OPPONENT', W/2, H - 20);
      ctx.textAlign = 'left';
    }

    // Explosions
    explosions = explosions.filter(e => {
      e.t++;
      const alpha = 1 - e.t/e.max;
      const r2 = e.t * CELL * 0.07;
      ctx.fillStyle = e.color + Math.round(alpha*180).toString(16).padStart(2,'0');
      ctx.shadowColor = e.color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(e.x, e.y, r2, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      return e.t < e.max;
    });

    // Splashes
    splashes = splashes.filter(s => {
      s.x += s.vx; s.y += s.vy; s.vx *= 0.88; s.vy *= 0.88; s.t++;
      const al = 1 - s.t/s.max;
      ctx.fillStyle = `rgba(100,180,255,${al*0.8})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, 2*al, 0, Math.PI*2); ctx.fill();
      return s.t < s.max;
    });

    frameId = requestAnimationFrame(draw);
  }

  // ── INPUT ─────────────────────────────────────────────────────────────
  function getPlayerCell(mx, my) {
    const c = Math.floor((mx - PG_X) / CELL);
    const r = Math.floor((my - PG_Y) / CELL);
    if (r >= 0 && r < GRID && c >= 0 && c < GRID) return {r, c};
    return null;
  }
  function getEnemyCell(mx, my) {
    const c = Math.floor((mx - EG_X) / CELL);
    const r = Math.floor((my - EG_Y) / CELL);
    if (r >= 0 && r < GRID && c >= 0 && c < GRID) return {r, c};
    return null;
  }

  function onBSMove(e) {
    if (window.currentGame !== 'battleship') return;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top)  * (H / rect.height);

    if (phase === 'choose') {
      hoverEnemy = null;
      if (window._bsCards) {
        for (const [k, v] of Object.entries(window._bsCards)) {
          if (mx >= v.x && mx <= v.x+v.w && my >= v.y && my <= v.y+v.h) {
            hoverEnemy = {_card: k}; break;
          }
        }
      }
    } else if (phase === 'place') {
      const cell = getPlayerCell(mx, my);
      hoverCell = cell;
    } else if (phase === 'battle' && !aiTurn) {
      hoverEnemy = getEnemyCell(mx, my);
    }
  }

  function onBSClick(e) {
    if (window.currentGame !== 'battleship') return;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top)  * (H / rect.height);

    if (phase === 'choose') {
      if (window._bsCards) {
        for (const [k, v] of Object.entries(window._bsCards)) {
          if (mx >= v.x && mx <= v.x+v.w && my >= v.y && my <= v.y+v.h) {
            opponent = k;
            phase = 'place';
            hoverEnemy = null;
            document.getElementById('game-extra-info').textContent =
              `vs ${OPPONENTS[k].name} — PLACE YOUR SHIPS  |  R: ROTATE`;
            const op = OPPONENTS[k];
            if (k === 'soca') {
              showSocaPopup(`> SOCA: Fleet placement initiated. I've already positioned mine optimally.`, 4000);
            } else {
              showSmilePopup(`SMILE: Oh we're doing this!! I hid my ships REALLY well!! Probably!!`, 4000);
            }
            return;
          }
        }
      }
    } else if (phase === 'place') {
      const cell = getPlayerCell(mx, my);
      if (!cell) return;
      const size = SHIP_SIZES[placingIdx];
      if (canPlace(playerGrid, cell.r, cell.c, size, placingHoriz)) {
        placeShip(playerGrid, playerShips, cell.r, cell.c, size, placingHoriz);
        placingIdx++;
        if (placingIdx >= SHIP_SIZES.length) {
          // Done placing — place enemy ships and start battle
          autoPlace(enemyGrid, enemyShips);
          phase = 'battle';
          hoverCell = null;
          document.getElementById('game-extra-info').textContent =
            `CLICK ENEMY GRID TO FIRE  |  vs ${OPPONENTS[opponent].name}`;
          const op = OPPONENTS[opponent];
          if (opponent === 'soca') {
            showSocaPopup(`> SOCA: All ships placed. Commencing tactical analysis.`, 3500);
          } else {
            showSmilePopup(`SMILE: BATTLE TIME!! I've been waiting for this!! Let's GO!!`, 3500);
          }
        }
      }
    } else if (phase === 'battle' && !aiTurn) {
      const cell = getEnemyCell(mx, my);
      if (cell && enemyShots[cell.r][cell.c] === null) {
        playerShoot(cell.r, cell.c);
      }
    }
  }

  let spaceCount = 0;
  function onBSKey(e) {
    if (window.currentGame !== 'battleship') return;
    if (e.code === 'KeyR' && phase === 'place') {
      placingHoriz = !placingHoriz;
    }
    if (e.code === 'Space' && phase === 'gameover') {
      spaceCount++;
      if (spaceCount >= 2) {
        // Full reset
        spaceCount = 0;
        startBattleship();
      } else {
        // Quick rematch same opponent
        playerGrid  = Array.from({length:GRID}, () => Array(GRID).fill(null));
        enemyGrid   = Array.from({length:GRID}, () => Array(GRID).fill(null));
        playerShots = Array.from({length:GRID}, () => Array(GRID).fill(null));
        enemyShots  = Array.from({length:GRID}, () => Array(GRID).fill(null));
        playerShips = []; enemyShips = [];
        placingIdx = 0; placingHoriz = true;
        aiQueue = []; aiTurn = false;
        explosions = []; splashes = [];
        phase = 'place';
        document.getElementById('game-msg').textContent = '';
        document.getElementById('game-extra-info').textContent =
          `vs ${OPPONENTS[opponent].name} — PLACE YOUR SHIPS  |  R: ROTATE`;
      }
    }
  }

  cv.addEventListener('mousemove', onBSMove);
  cv.addEventListener('click', onBSClick);
  document.addEventListener('keydown', onBSKey);

  window.stopCurrentGame = (function() {
    return function() {
      cv.removeEventListener('mousemove', onBSMove);
      cv.removeEventListener('click', onBSClick);
      document.removeEventListener('keydown', onBSKey);
      cancelAnimationFrame(frameId);
      clearGameHandles();
      window.gameRunning = false;
      window.currentGame = null;
    };
  })();

// Перенастраиваем HUD под морской бой
  document.getElementById('game-score').textContent = '—';
  document.getElementById('game-level').textContent = '—';
  document.getElementById('game-lives').innerHTML = '—';
  document.querySelector('[id="game-score"]').parentElement.firstChild.textContent = 'HITS: ';
  // Меняем лейблы через родительские span
  const hudSpans = document.querySelectorAll('#game-arena > div > div[style*="gap:16px"] > span[style*="dimmer"]');
  if (hudSpans[0]) hudSpans[0].childNodes[0].textContent = 'HITS: ';
  if (hudSpans[1]) hudSpans[1].childNodes[0].textContent = 'MISSES: ';
  if (hudSpans[2]) hudSpans[2].childNodes[0].textContent = 'SHIPS LEFT: ';

  document.getElementById('game-extra-info').textContent = 'CHOOSE YOUR OPPONENT';
  draw();
}

// ── SMILE BACK BUTTON ────────────────────────────────────────────────────
const SMILE_BACK_MSGS = [
  "don't go :(",
  "nooo wait!!",
  "one more game?? :(",
  "but we were having fun!!",
  "...okay. bye. ✚",
  "please stay :(",
  "i'll be here. alone.",
];

let smileBackShown = false;

function smileBackHover(on) {
  const msg = document.getElementById('smile-back-msg');
  const btn = document.getElementById('game-back-btn');
  if (!msg || !btn) return;
  if (on && Math.random() < 0.6) {
    msg.textContent = SMILE_BACK_MSGS[Math.floor(Math.random() * SMILE_BACK_MSGS.length)];
    // Позиционируем относительно кнопки
    const rect = btn.getBoundingClientRect();
    msg.style.top  = (rect.bottom + 4) + 'px';
    msg.style.right = (window.innerWidth - rect.right) + 'px';
    msg.style.display = 'block';
    // Только в играх SMILE
    const smileGames = ['minesweeper', 'heartbeat', 'memory'];
    if (!smileGames.includes(window.currentGame)) {
      msg.style.display = 'none';
    }
  } else if (!on) {
    msg.style.display = 'none';
  }
}