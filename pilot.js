// ===== VISIBILITY MANAGEMENT =====
const pilotIntervals = new Set();
const pilotTimeouts = new Set();
let effectIntervals = [];
let animLoopRunning = true;

function trackInterval(id) {
  pilotIntervals.add(id);
  return id;
}
function clearTrackedInterval(id) {
  clearInterval(id);
  pilotIntervals.delete(id);
}
function trackTimeout(id) {
  pilotTimeouts.add(id);
  return id;
}
function clearTrackedTimeout(id) {
  clearTimeout(id);
  pilotTimeouts.delete(id);
}
function clearTrackedTimeouts() {
  pilotTimeouts.forEach(clearTimeout);
  pilotTimeouts.clear();
}
window.intervals = pilotIntervals;
window.timeouts = pilotTimeouts;

function pauseEffects() {
  effectIntervals.forEach(id => clearTrackedInterval(id));
  effectIntervals = [];
  animLoopRunning = false;
}

function resumeEffects() {
  if (animLoopRunning) return;
  effectIntervals = [];
  startAllEffects();
  animLoopRunning = true;
  requestAnimationFrame(animLoop);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseEffects();
  } else {
    resumeEffects();
  }
});

// ===== CLOCK =====
function updateClock(){
  if (document.hidden) return;
  const n=new Date(),pad=v=>String(v).padStart(2,'0');
  document.getElementById('clock').textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}
const clockInterval = trackInterval(setInterval(updateClock, 1000));
effectIntervals.push(clockInterval);
updateClock();

// ===== MISSION TIMER =====
let missionSec=102*60+35;
const missionTimerInterval = trackInterval(setInterval(()=>{
  if (document.hidden) return;
  missionSec++;
  const h=Math.floor(missionSec/3600),m=Math.floor((missionSec%3600)/60),s=missionSec%60;
  const el=document.getElementById('mission-timer');
  if(el){
    el.textContent=[h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
    if(Math.random()<0.04){const o=el.textContent;el.textContent=o.split('').map(c=>Math.random()<0.3?'█':c).join('');trackTimeout(setTimeout(()=>el.textContent=o,120));}
  }
},1000));
effectIntervals.push(missionTimerInterval);

// ===== PILOT / SECTION SWITCHING =====
function selectPilot(n,el){
  if(el.classList.contains('locked')){ el.classList.add('c1'); trackTimeout(setTimeout(()=>el.classList.remove('c1'),500)); return; }
  document.querySelectorAll('.pilot-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}
function showSection(name,el){
  document.querySelectorAll('.side-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('page-'+name);
  if(pg) pg.classList.add('active');
}

// ===== ECG WAVEFORMS =====
let ecgPhase=0;
function drawECG(canvasId, color='rgba(255,160,0,0.95)', glowColor='rgba(255,120,0,0.6)'){
  const cv=document.getElementById(canvasId);
  if(!cv||!cv.getContext) return;
  const ctx=cv.getContext('2d',{willReadFrequently:true}),W=cv.width,H=cv.height;
  const img=ctx.getImageData(1,0,W-1,H);
  ctx.putImageData(img,0,0);
  ctx.clearRect(W-1,0,1,H);
  const midY=H/2;
  const p=ecgPhase%(Math.PI*2/(72/60)*60);
  const norm=p/(Math.PI*2/(72/60)*60);
  let y=midY;
  if(norm<0.1)      y=midY-2;
  else if(norm<0.15) y=midY-H*0.35;
  else if(norm<0.2)  y=midY+H*0.2;
  else if(norm<0.25) y=midY-H*0.65;
  else if(norm<0.3)  y=midY+H*0.08;
  else if(norm<0.35) y=midY-H*0.12;
  else if(norm<0.4)  y=midY;
  else               y=midY+Math.sin(norm*20)*1.2;
  y+=(Math.random()-0.5)*2;
  ctx.strokeStyle=color; ctx.lineWidth=1.5;
  ctx.shadowColor=glowColor; ctx.shadowBlur=4;
  ctx.beginPath();ctx.moveTo(W-2,midY);ctx.lineTo(W-1,y);ctx.stroke();
  ctx.shadowBlur=0;
}

// ===== BODY PROJECTION CANVAS =====
let bodyT=0;
function drawBody(){
  const cv=document.getElementById('bodyCanvas');
  if(!cv)return;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);

  // Background grid
  ctx.strokeStyle='rgba(255,120,0,0.07)'; ctx.lineWidth=0.5;
  for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  const cx=W/2, pulse=Math.sin(bodyT*0.04)*2;

  // Glow base
  const grd=ctx.createRadialGradient(cx,H*0.45,0,cx,H*0.45,90);
  grd.addColorStop(0,'rgba(255,140,0,0.07)'); grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);

ctx.strokeStyle='rgba(255,160,0,0.75)'; ctx.lineWidth=1.5;
ctx.shadowColor='rgba(255,120,0,0.5)'; ctx.shadowBlur=6;
  ctx.fillStyle='rgba(0,20,40,0.0)';

  // HEAD
  ctx.beginPath(); ctx.arc(cx,50+pulse*0.3,26,0,Math.PI*2);
  ctx.stroke();
  // Head glow dot
  ctx.fillStyle='rgba(255,140,0,0.3)'; ctx.beginPath(); ctx.arc(cx,50+pulse*0.3,26,0,Math.PI*2); ctx.fill();

  // NECK
  ctx.strokeStyle='rgba(255,140,0,0.6)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx-8,76+pulse*0.3); ctx.lineTo(cx-8,92); ctx.lineTo(cx+8,92); ctx.lineTo(cx+8,76+pulse*0.3); ctx.stroke();

  // SHOULDERS
  ctx.strokeStyle='rgba(255,160,0,0.75)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(cx-8,92); ctx.bezierCurveTo(cx-20,92,cx-48,98,cx-52,108); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+8,92); ctx.bezierCurveTo(cx+20,92,cx+48,98,cx+52,108); ctx.stroke();

  // TORSO
  ctx.beginPath();
  ctx.moveTo(cx-28,92); ctx.lineTo(cx-34,100);
  ctx.lineTo(cx-32,175); ctx.lineTo(cx-22,185);
  ctx.lineTo(cx+22,185); ctx.lineTo(cx+32,175);
  ctx.lineTo(cx+34,100); ctx.lineTo(cx+28,92);
  ctx.closePath(); ctx.stroke();
  // Torso interior glow
 ctx.fillStyle='rgba(255,100,0,0.05)'; ctx.fill();

  // Chest scan lines (animated)
  const scanY=((bodyT*1.2)%90)+92;
  ctx.strokeStyle='rgba(255,100,0,0.15)'; ctx.lineWidth=1;
  for(let i=0;i<3;i++){
    const sy=scanY+i*8;
    if(sy>92&&sy<185){
      ctx.beginPath();
      const lw=28-Math.abs(sy-138)*0.15;
      ctx.moveTo(cx-lw,sy); ctx.lineTo(cx+lw,sy); ctx.stroke();
    }
  }

  // HEART indicator
  const heartPulse=0.5+Math.sin(bodyT*0.12)*0.5;
ctx.fillStyle=`rgba(255,80,80,${heartPulse*0.7})`;
ctx.strokeStyle=`rgba(255,60,60,${0.4+heartPulse*0.6})`;
  ctx.beginPath(); ctx.arc(cx-8,128,5,0,Math.PI*2); ctx.fill(); ctx.stroke();

  // ARMS
  ctx.strokeStyle='rgba(255,160,0,0.6)'; ctx.lineWidth=1.5;
  // Left arm
  ctx.beginPath(); ctx.moveTo(cx-34,100); ctx.bezierCurveTo(cx-55,110,cx-65,140,cx-62,185); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-62,185); ctx.lineTo(cx-68,205); ctx.lineTo(cx-58,215); ctx.lineTo(cx-48,210); ctx.stroke();
  // Right arm
  ctx.beginPath(); ctx.moveTo(cx+34,100); ctx.bezierCurveTo(cx+55,110,cx+65,140,cx+62,185); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+62,185); ctx.lineTo(cx+68,205); ctx.lineTo(cx+58,215); ctx.lineTo(cx+48,210); ctx.stroke();

  // LEGS
  ctx.strokeStyle='rgba(255,160,0,0.65)'; ctx.lineWidth=1.5;
  // Left
  ctx.beginPath(); ctx.moveTo(cx-22,185); ctx.lineTo(cx-26,240); ctx.lineTo(cx-28,270); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-28,270); ctx.bezierCurveTo(cx-30,272,cx-38,274,cx-36,280); ctx.lineTo(cx-14,280); ctx.stroke();
  // Right
  ctx.beginPath(); ctx.moveTo(cx+22,185); ctx.lineTo(cx+26,240); ctx.lineTo(cx+28,270); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+28,270); ctx.bezierCurveTo(cx+30,272,cx+38,274,cx+36,280); ctx.lineTo(cx+14,280); ctx.stroke();

  // STATUS INDICATORS on body
  const indicators=[
    {x:cx,y:50,col:'rgba(0,255,136,0.9)',lbl:'OK',title:'HEAD'},
    {x:cx-8,y:128,col:'rgba(0,255,136,0.9)',lbl:'♥',title:'HEART'},
    {x:cx+20,y:138,col:'rgba(0,255,136,0.9)',lbl:'OK',title:'LUNG-R'},
    {x:cx-20,y:143,col:'rgba(0,255,136,0.9)',lbl:'OK',title:'LUNG-L'},
    {x:cx,y:165,col:'rgba(0,255,136,0.9)',lbl:'!',title:'CORE'},
    {x:cx-55,y:148,col:'rgba(0,255,136,0.9)',lbl:'OK',title:'ARM-L'},
    {x:cx+55,y:148,col:'rgba(0,255,136,0.9)',lbl:'OK',title:'ARM-R'},
  ];
  indicators.forEach(ind=>{
    ctx.fillStyle=ind.col; ctx.shadowColor=ind.col; ctx.shadowBlur=4;
    ctx.beginPath(); ctx.arc(ind.x,ind.y,3,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=`${ind.col.slice(0,-4)}0.25)`; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(ind.x,ind.y,5+Math.sin(bodyT*0.08)*2,0,Math.PI*2); ctx.stroke();
  });

  // Scan beam at top
  ctx.strokeStyle='rgba(0,204,255,0.12)'; ctx.lineWidth=1;
  const beamY=((bodyT*0.8)%H);
  ctx.beginPath(); ctx.moveTo(0,beamY); ctx.lineTo(W,beamY); ctx.stroke();

  ctx.shadowBlur=0;
  bodyT++;
}

// ===== MAIN ANIMATION LOOP =====
function animLoop(){
  if (!animLoopRunning) return;
  ecgPhase+=0.15;
  drawECG('ecg-mini');
  drawECG('ecg-full');
  drawECG('ecg-bio');
  drawECG('ecg-footer');
  drawBody();
  // G-force flicker
  const gfEl=document.getElementById('gf-right');
  if(gfEl) gfEl.textContent=(1.3+Math.random()*0.2-0.1).toFixed(1)+'g';
  requestAnimationFrame(animLoop);
}
animLoop();

// ===== COORDS GLITCH =====
const coordVals=['X:2471 Y:0883','X:████ Y:████','X:2472 Y:0884','X:???? Y:????'];
let ci=0;
const coordGlitchInterval = trackInterval(setInterval(() => {
  if (document.hidden) return;
  ci = (ci + 1) % coordVals.length;
  const el = document.getElementById('bb-coords');
  if (el) el.textContent = coordVals[ci];
}, 2800));
effectIntervals.push(coordGlitchInterval);

// ===== NOTE SUBMIT =====
function addNote(){
  // Секретка: если в заметке написано SOCA (в любом виде -
  // SOCA, S+O+C+A, s o c a, s.o.c.a) - открываем секретное окно
  const inp = document.getElementById('note-input');
  const val = (inp ? inp.value : '').trim().toLowerCase().replace(/[\s+._-]/g, '');
  if (val === 'soca') {
    if (inp) inp.value = '';
    showSecretWindow();
    return;
  }
  const out=document.getElementById('note-out');
  if(out) out.innerHTML='<span style="color:var(--g)">✓ Note logged to SOCA record</span>';
  trackTimeout(setTimeout(()=>{ if(out) out.innerHTML=''; },3000));
}

// ========== SOCA COMMENTS (в анкете DATA) - чистая версия ==========

const glitchChars = '█░▒▓■□▪▫?!░▒▓';

let lastCommentIndex = -1;


// ========== ГЛОБАЛЬНЫЕ ГЛИТЧ-ЭФФЕКТЫ ДЛЯ ВСЕЙ СТРАНИЦЫ (усиленные) ==========

// Функция для случайного глитча случайной панели
function glitchRandomPanel() {
  const panels = document.querySelectorAll('.panel');
  if (panels.length === 0) return;
  
  const randomPanel = panels[Math.floor(Math.random() * panels.length)];
  if (randomPanel) {
    randomPanel.classList.add('glitch-panel');
    trackTimeout(setTimeout(() => {
      randomPanel.classList.remove('glitch-panel');
    }, 250));
  }
}

// Функция для глитча случайной строки текста
function glitchRandomText() {
  const textElements = document.querySelectorAll('.rr, .rp, .ph .title, .info-value, .info-label, .rv, .rk');
  if (textElements.length === 0) return;
  
  const randomText = textElements[Math.floor(Math.random() * textElements.length)];
  if (randomText) {
    randomText.classList.add('glitch-text-row');
    trackTimeout(setTimeout(() => {
      randomText.classList.remove('glitch-text-row');
    }, 200));
  }
}

// Функция для глитча координат в нижней панели
function glitchBottomCoords() {
  const coordsEl = document.getElementById('bb-coords');
  if (coordsEl && Math.random() < 0.3) {
    const original = coordsEl.textContent;
    const glitched = original.split('').map(c => Math.random() < 0.4 ? '█' : c).join('');
    coordsEl.textContent = glitched;
    trackTimeout(setTimeout(() => {
      coordsEl.textContent = original;
    }, 200));
  }
}

// ===== GLITCH EFFECTS INITIALIZATION =====
function startAllEffects() {
  const effectLoop = trackInterval(setInterval(() => {
    if (document.hidden) return;

    if (Math.random() < 0.0625) {
      const intensity = (Math.random() - 0.5) * 8;
      document.body.style.transform = `translateX(${intensity}px)`;
      trackTimeout(setTimeout(() => { document.body.style.transform = ''; }, 80));
      document.body.classList.add('page-red-flash');
      trackTimeout(setTimeout(() => { document.body.classList.remove('page-red-flash'); }, 300));
    }

    if (Math.random() < 0.006) {
      document.body.classList.add('page-blue-flash');
      trackTimeout(setTimeout(() => { document.body.classList.remove('page-blue-flash'); }, 200));
    }

    if (Math.random() < 0.028) {
      glitchRandomPanel();
    }

    if (Math.random() < 0.045) {
      glitchRandomText();
    }

    if (Math.random() < 0.28) {
      glitchBottomCoords();
    }

    if (Math.random() < 0.01) {
      const originalTitle = document.title;
      const glitchTitle = originalTitle.split('').map(c => Math.random() < 0.35 ? '█' : c).join('');
      document.title = glitchTitle;
      trackTimeout(setTimeout(() => { document.title = originalTitle; }, 400));
    }

    if (Math.random() < 0.0125) {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '9997';
      document.body.appendChild(overlay);
      trackTimeout(setTimeout(() => { overlay.remove(); }, 80));
    }

    if (Math.random() < 0.0025) {
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';
      trackTimeout(setTimeout(() => { document.body.style.cursor = originalCursor; }, 500));
    }

    if (Math.random() < 0.0225) {
      const panels = document.querySelectorAll('.panel');
      panels.forEach(panel => {
        if (Math.random() < 0.3) {
          panel.style.borderColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, 0.5)`;
          trackTimeout(setTimeout(() => { panel.style.borderColor = ''; }, 150));
        }
      });
    }

    if (Math.random() < 0.015) {
      const panels = document.querySelectorAll('.panel');
      panels.forEach((panel, index) => {
        trackTimeout(setTimeout(() => {
          panel.style.animation = 'panelGlitch 0.15s';
          trackTimeout(setTimeout(() => { panel.style.animation = ''; }, 200));
        }, index * 50));
      });
    }
  }, 500));

  effectIntervals.push(effectLoop);
}

// Начальная загрузка эффектов
startAllEffects();



// ========== МОДАЛЬНОЕ ОКНО ДЛЯ ФОТО ==========
let photoGlitchInterval = null;

function openPhotoModal() {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalPhotoImg');
  if (!modal) return;
  
  
  modal.style.display = 'flex';
  
  // Добавляем глитч-эффекты на фото
  const modalContent = document.querySelector('.photo-modal-content');
  if (modalContent) {
    modalContent.style.animation = 'modalGlitch 0.3s';
    trackTimeout(setTimeout(() => {
      modalContent.style.animation = '';
    }, 300));
  }
  
  // Добавляем класс глитча на фото
  if (modalImg) {
    modalImg.classList.add('photo-glitch');
    trackTimeout(setTimeout(() => {
      modalImg.classList.remove('photo-glitch');
    }, 500));
  }
  
  // Запускаем случайные глитчи на фото во время просмотра
  if (photoGlitchInterval) clearTrackedInterval(photoGlitchInterval);
  photoGlitchInterval = trackInterval(setInterval(() => {
    if (document.hidden) return;
    const img = document.getElementById('modalPhotoImg');
    if (!img || modal.style.display !== 'flex') {
      clearTrackedInterval(photoGlitchInterval);
      photoGlitchInterval = null;
      return;
    }
    
    if (Math.random() < 0.3) {
      img.classList.add('photo-glitch');
      trackTimeout(setTimeout(() => { img.classList.remove('photo-glitch'); }, 200));
    }
    
    if (Math.random() < 0.15) {
      img.classList.add('photo-flash');
      trackTimeout(setTimeout(() => { img.classList.remove('photo-flash'); }, 150));
    }
  }, 4000));
}

function closePhotoModal() {
  const modal = document.getElementById('photoModal');
  if (!modal) return;
  
  modal.style.display = 'none';
  
  // Останавливаем глитч-интервал
  if (photoGlitchInterval) {
    clearTrackedInterval(photoGlitchInterval);
    photoGlitchInterval = null;
  }
}

// Закрытие по нажатию ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('photoModal');
    if (modal && modal.style.display === 'flex') {
      closePhotoModal();
    }
  }
});

// Закрытие по клику вне контента
document.getElementById('photoModal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    closePhotoModal();
  }
});

// =========СЕКРЕТНАЯ ПАСХАЛКА (S+O+C+A)=========
let secretStep = 0;
let secretActive = false;
let secretTimeout = null;
let secretSecondTimeout = null;
const secretCode = ['s', 'o', 'c', 'a'];

function showSecretWindow() {
  if (secretActive) return;
  secretActive = true;

  const overlay = document.getElementById('secret-overlay');
  const content = document.getElementById('secret-content');
  if (!overlay || !content) return;

  overlay.style.display = 'flex';
  content.innerHTML = '';

  // "hi" появляется через 1.2 секунды - плавно, без глитча
  secretTimeout = trackTimeout(setTimeout(() => {
    content.innerHTML = `
      <div id="secret-hi" style="
        font-size:72px;
        color:var(--g);
        letter-spacing:12px;
        text-shadow:0 0 20px var(--g2), 0 0 40px rgba(0,255,136,0.3);
        opacity:0;
        transition:opacity 0.8s ease;
        font-family:'VT323',monospace;
      ">hi</div>
    `;
    // плавное появление
    trackTimeout(setTimeout(() => {
      const hi = document.getElementById('secret-hi');
      if (hi) hi.style.opacity = '1';
    }, 50));

    secretSecondTimeout = trackTimeout(setTimeout(() => {
      // исчезает
      const hi = document.getElementById('secret-hi');
      if (hi) { hi.style.opacity = '0'; hi.style.transition = 'opacity 0.4s ease'; }

      trackTimeout(setTimeout(() => {
        content.innerHTML = `
          <div style="
            font-size:22px;
            color:var(--g);
            margin-bottom:24px;
            letter-spacing:0.12em;
            text-shadow:0 0 8px var(--g2);
            font-family:'Share Tech Mono',monospace;
            opacity:0;
            transition:opacity 0.6s ease;
          " id="secret-question">Did you enjoy our flight?</div>
          <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;width:220px;margin:0 auto;opacity:0;transition:opacity 0.6s ease 0.3s;" id="secret-options">
            <div class="secret-option" data-answer="yes"   style="color:var(--dim);cursor:pointer;font-size:16px;padding:5px 12px;letter-spacing:0.12em;font-family:'Share Tech Mono',monospace;border-left:2px solid transparent;transition:all 0.15s;">yes</div>
            <div class="secret-option" data-answer="no"    style="color:var(--dim);cursor:pointer;font-size:16px;padding:5px 12px;letter-spacing:0.12em;font-family:'Share Tech Mono',monospace;border-left:2px solid transparent;transition:all 0.15s;">no</div>
            <div class="secret-option" data-answer="glitch" style="color:var(--dimmer);cursor:pointer;font-size:14px;padding:5px 12px;letter-spacing:0.08em;font-family:'Share Tech Mono',monospace;border-left:2px solid transparent;transition:all 0.15s;animation:glitch3 4s infinite;filter:blur(0.5px);">█░▒▓■□▪▫?!░▒▓</div>
          </div>
        `;
        // плавное появление вопроса
        trackTimeout(setTimeout(() => {
          const q = document.getElementById('secret-question');
          const o = document.getElementById('secret-options');
          if (q) q.style.opacity = '1';
          if (o) o.style.opacity = '1';
        }, 50));

        document.querySelectorAll('.secret-option').forEach(opt => {
          opt.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px)';
            this.style.color = 'var(--g)';
            this.style.textShadow = '0 0 6px var(--g2)';
            this.style.borderLeftColor = 'var(--g)';
          });
          opt.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.color = 'var(--dim)';
            this.style.textShadow = 'none';
            this.style.borderLeftColor = 'transparent';
          });
          opt.addEventListener('click', function() {
            secretAnswer(this.getAttribute('data-answer'));
          });
        });
      }, 500));
    }, 3000));
  }, 1200));
}

function secretAnswer(answer) {
  const content = document.getElementById('secret-content');
  if (!content) return;
  
  // Очищаем предыдущие таймеры
  if (secretTimeout) clearTimeout(secretTimeout);
  if (secretSecondTimeout) clearTimeout(secretSecondTimeout);
  
  // Очищаем контент (исчезает)
  content.innerHTML = `<div style="font-size:20px; color:var(--dim); opacity:0;">&nbsp;</div>`;
  
  trackTimeout(setTimeout(() => {
    if (answer === 'yes') {
      content.innerHTML = `<div style="font-size:64px; color:var(--g); text-shadow:0 0 15px var(--g); animation:pulse 2s infinite; letter-spacing:4px;">0440</div>`;
    } 
    else if (answer === 'no') {
      content.innerHTML = `<div style="font-size:28px; color:var(--dim); animation:blink 1s infinite; letter-spacing:4px;">. . .</div>`;
      trackTimeout(setTimeout(() => {
        closeSecretWindow();
      }, 2500));
      return;
    }
    else if (answer === 'glitch') {
      // Закрываем секретное окно
      closeSecretWindow();
      
      // ГЛОБАЛЬНЫЙ СБОЙ НА ВСЕЙ СТРАНИЦЕ
      startSystemMeltdown();
      return;
    }
  }, 5000));
}

function closeSecretWindow() {
  if (secretTimeout) clearTimeout(secretTimeout);
  if (secretSecondTimeout) clearTimeout(secretSecondTimeout);
  const overlay = document.getElementById('secret-overlay');
  if (overlay) overlay.style.display = 'none';
  secretActive = false;
  secretStep = 0;
}

// Обработчик нажатий клавиш
document.addEventListener('keydown', function(e) {
  if (secretActive) return;
  const key = e.key.toLowerCase();
  if (key === secretCode[secretStep]) {
    secretStep++;
    if (secretStep === secretCode.length) {
      showSecretWindow();
      secretStep = 0;
    }
  } else {
    secretStep = 0;
  }
});

// ========== ГЛОБАЛЬНЫЙ СБОЙ СИСТЕМЫ ==========
let meltdownActive = false;

function startSystemMeltdown() {
  if (meltdownActive) return;
  meltdownActive = true;
  
  // 1. Останавливаем ВСЕ анимации и интервалы (замораживаем страницу)
  document.body.style.pointerEvents = 'none';
  document.body.style.overflow = 'hidden';
  
  // Убираем все активные интервалы и таймауты (сохраняем ссылки)
  if (window.intervals) {
    window.intervals.forEach(clearInterval);
  }
  clearTrackedTimeouts();
  
  // 2. Красное мерцание на всей странице
  const redOverlay = document.createElement('div');
  redOverlay.style.position = 'fixed';
  redOverlay.style.top = '0';
  redOverlay.style.left = '0';
  redOverlay.style.width = '100%';
  redOverlay.style.height = '100%';
  redOverlay.style.backgroundColor = 'rgba(255, 34, 68, 0.15)';
  redOverlay.style.zIndex = '10001';
  redOverlay.style.pointerEvents = 'none';
  redOverlay.style.animation = 'glitch1 0.1s infinite';
  document.body.appendChild(redOverlay);
  
  // 3. Создаём несколько окон с системной ошибкой
  const errorMessages = [
    { text: '⚠ SYSTEM FAILURE ⚠', x: '10%', y: '15%' },
    { text: '[ERR 0xDEADBEEF] MEMORY CORRUPTION', x: '60%', y: '25%' },
    { text: 'CORE-3 OFFLINE // NO RESPONSE', x: '20%', y: '55%' },
    { text: 'CRITICAL: PILOT DATA LOST', x: '70%', y: '70%' },
    { text: 'AUTOPILOT: UNRESPONSIVE', x: '35%', y: '85%' },
    { text: 'ENGINE_B: TOTAL FAILURE', x: '80%', y: '45%' },
    { text: 'SECTOR 7 CORRUPTED', x: '5%', y: '40%' },
    { text: 'NEURAL LINK: DEGRADED', x: '50%', y: '10%' },
  ];
  
  const errorWindows = [];
  
  errorMessages.forEach((err, i) => {
    trackTimeout(setTimeout(() => {
      const win = document.createElement('div');
      win.className = 'error-window';
      win.innerHTML = `
        <div class="error-header">⚠ CRITICAL ERROR ⚠</div>
        <div class="error-body">${err.text}</div>
        <div class="error-footer">[CODE: 0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase()}]</div>
      `;
      win.style.position = 'fixed';
      win.style.left = err.x;
      win.style.top = err.y;
      win.style.transform = 'translate(-50%, -50%)';
      win.style.zIndex = '10002';
      win.style.minWidth = '280px';
      win.style.background = 'rgba(20, 0, 0, 0.95)';
      win.style.border = '2px solid var(--red)';
      win.style.padding = '12px 16px';
      win.style.fontFamily = "'Share Tech Mono', monospace";
      win.style.fontSize = '11px';
      win.style.color = 'var(--red)';
      win.style.boxShadow = '0 0 20px rgba(255, 34, 68, 0.4)';
      win.style.animation = `errorWindowGlitch ${0.2 + Math.random() * 0.2}s infinite`;
      win.style.backdropFilter = 'blur(4px)';
      win.style.textAlign = 'center';
      win.style.letterSpacing = '1px';
      
      document.body.appendChild(win);
      errorWindows.push(win);
      
      // Случайное движение окна
      const interval = trackInterval(setInterval(() => {
        if (win) {
          const shakeX = (Math.random() - 0.5) * 6;
          const shakeY = (Math.random() - 0.5) * 6;
          win.style.transform = `translate(calc(-50% + ${shakeX}px), calc(-50% + ${shakeY}px))`;
        }
      }, 100));
      win.shakeInterval = interval;
    }, i * 150));
  });
  
  // 4. Через 5 секунд - чёрный экран и перенаправление
  trackTimeout(setTimeout(() => {
    // Убираем все окна ошибок
    errorWindows.forEach(win => {
      if (win.shakeInterval) clearInterval(win.shakeInterval);
      win.remove();
    });
    if (redOverlay) redOverlay.remove();
    
    // Чёрный экран
    const blackScreen = document.createElement('div');
    blackScreen.style.position = 'fixed';
    blackScreen.style.top = '0';
    blackScreen.style.left = '0';
    blackScreen.style.width = '100%';
    blackScreen.style.height = '100%';
    blackScreen.style.backgroundColor = '#000';
    blackScreen.style.zIndex = '10099';
    blackScreen.style.display = 'flex';
    blackScreen.style.flexDirection = 'column';
    blackScreen.style.justifyContent = 'center';
    blackScreen.style.alignItems = 'center';
    blackScreen.style.fontFamily = "'VT323', monospace";
    blackScreen.style.fontSize = '48px';
    blackScreen.style.color = 'var(--red)';
    blackScreen.style.textShadow = '0 0 20px var(--red)';
    blackScreen.style.animation = 'glitch2 0.3s infinite';
    blackScreen.innerHTML = `
      <div style="letter-spacing:8px;">SYSTEM FAILURE</div>
      <div style="font-size:16px; color:var(--dim); margin-top:20px; letter-spacing:2px;">redirecting...</div>
    `;
    document.body.appendChild(blackScreen);
    
    // Перенаправление на главную страницу
    trackTimeout(setTimeout(() => {
      window.location.href = 'soca.html';
    }, 2000));
    
  }, 5000));
}

// ========== ГЛИТЧИ ДЛЯ ЛОГОТИПА-ШЕСТЕРЁНКИ ==========
const gearLogo = document.querySelector('.gear-logo');

function glitchGear() {
  if (!gearLogo) return;
  
  if (Math.random() < 0.2) {
    gearLogo.classList.add('glitch-instant');
    trackTimeout(setTimeout(() => {
      gearLogo.classList.remove('glitch-instant');
    }, 200));
  }
  
  if (Math.random() < 0.05) {
    gearLogo.classList.add('critical-glitch');
    trackTimeout(setTimeout(() => {
      gearLogo.classList.remove('critical-glitch');
    }, 400));
  }
}

trackInterval(setInterval(() => {
  if (document.hidden) return;
  glitchGear();
}, 7000));

// ========== ГЛИТЧУЮЩИЙ ФАВИКОН (шестерёнка, прозрачный фон) ==========

function setFavicon(symbol, rotate = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // ПРОЗРАЧНЫЙ фон
  ctx.clearRect(0, 0, 64, 64);
  
  // Центр
  const centerX = 32;
  const centerY = 32;
  
  // Сохраняем состояние
  ctx.save();
  
  // Поворот (для рывков)
  if (rotate !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate(rotate * Math.PI / 180);
    ctx.translate(-centerX, -centerY);
  }
  
  // Рисуем шестерёнку текстом (простой и надёжный способ)
  ctx.font = '48px "VT323", "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Градиентный цвет (зелёный → голубой)
  const gradient = ctx.createLinearGradient(16, 16, 48, 48);
  gradient.addColorStop(0, '#00ff88');
  gradient.addColorStop(0.6, '#00ffcc');
  gradient.addColorStop(1, '#0088ff');
  ctx.fillStyle = gradient;
  
  // Рисуем символ
  ctx.fillText(symbol, centerX, centerY);
  
  // Восстанавливаем
  ctx.restore();
  
  // Обновляем фавикон
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.head.appendChild(link);
  }
  link.href = canvas.toDataURL('image/png');
}

// Прямые символы шестерёнок
const gearSymbols = ['⛭', '⚙', '⛭', '⚙', '⛭'];

// Функция глитча (меняет символ и цвет)
function glitchFavicon() {
  // Случайный выбор эффекта
  const effect = Math.random();
  
  if (effect < 0.7) {
    // Нормальная шестерёнка
    setFavicon('⛭');
  }
  else if (effect < 0.85) {
    // Лёгкий глитч - другая шестерёнка
    setFavicon('⚙');
  }
  else if (effect < 0.95) {
    // Средний глитч - искажённый символ + поворот
    const glitchSymbols = ['⛭', '⚙', '⛭', '⛭'];
    const randomSymbol = glitchSymbols[Math.floor(Math.random() * glitchSymbols.length)];
    setFavicon(randomSymbol, Math.random() * 10 - 5);
  }
  else {
    // Сильный глитч - быстрая смена символов
    setFavicon('█');
    trackTimeout(setTimeout(() => setFavicon('⛭'), 80));
    trackTimeout(setTimeout(() => setFavicon('⚙'), 160));
    trackTimeout(setTimeout(() => setFavicon('⛭'), 240));
    return;
  }
}

// Запускаем нормальную шестерёнку
setFavicon('⛭');

// Глитчи каждые 4-8 секунд
trackInterval(setInterval(() => {
  if (document.hidden) return;
  if (Math.random() < 0.35) {
    glitchFavicon();
  }
}, 5000));

// Эффект "рывка" (быстрое дёрганье)
trackInterval(setInterval(() => {
  if (document.hidden) return;
  if (Math.random() < 0.2) {
    setFavicon('⚙', 5);
    trackTimeout(setTimeout(() => setFavicon('⛭', -3), 60));
    trackTimeout(setTimeout(() => setFavicon('⚙', 3), 120));
    trackTimeout(setTimeout(() => setFavicon('⛭', 0), 180));
  }
}, 7000));

// Редкий критический глитч
trackInterval(setInterval(() => {
  if (document.hidden) return;
  if (Math.random() < 0.08) {
    setFavicon('?');
    trackTimeout(setTimeout(() => setFavicon('⛭'), 150));
    trackTimeout(setTimeout(() => setFavicon('?'), 250));
    trackTimeout(setTimeout(() => setFavicon('⛭'), 350));
  }
}, 12000));

