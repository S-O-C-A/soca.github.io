// Clock
function updateClock(){
  if (document.hidden) return;
  const n=new Date();
  const pad=v=>String(v).padStart(2,'0');
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const shifted = new Date(n.getTime());
shifted.setFullYear(n.getFullYear() - 52);
clockEl.textContent = `${String(shifted.getDate()).padStart(2,'0')} ${months[shifted.getMonth()]} ${shifted.getFullYear()} // ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  }
}
setInterval(() => { if (!document.hidden) updateClock(); }, 1000);
updateClock();

const appState = {
  visible: !document.hidden,
};
let apAnimRunning = false;
let apDegradeInterval = null;
let apTelemetryInterval = null;
let apShipUpdateInterval = null;
let navCoordsInterval = null;

function pageIsActive(id) {
  const el = document.getElementById(id);
  return appState.visible && el ? el.classList.contains('active') : false;
}

function isActivePage(id) {
  return pageIsActive(id);
}

function resumeActiveLoops() {
  if (!appState.visible) return;
  if (isActivePage('page-autopilot')) {
    if (!apAnimRunning) startApAnimLoop();
    if (!tacRafId) tacAnimLoop();
    startAutopilotBackground();
    startNavCoordsInterval();
  }
  if (isActivePage('page-navcore')) {
    if (!smAnimActive) drawStarmap();
    startTrajLoop();
    startScanLoop();
    startNavCoordsInterval();
  }
  if (isActivePage('page-eject')) {
    drawCapsule();
  }
}

document.addEventListener('visibilitychange', () => {
  appState.visible = !document.hidden;
  if (appState.visible) {
    resumeActiveLoops();
  } else {
    stopAutopilotBackground();
    stopShipUpdateInterval();
    stopNavCoordsInterval();
    stopParamsUpdate();
  }
});

// Page switching
function showPage(name) {
  document.querySelectorAll('.section-page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  
  // Обновляем активный пункт меню
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const map = { main: 0, about: 1, log: 2, diag: 3, autopilot: 4, navcore: 5, eject: 6 };
  const items = document.querySelectorAll('.nav-item');
  if (map[name] !== undefined && items[map[name]]) {
    items[map[name]].classList.add('active');
  }
  
  // Если открыли SYS LOG - прокручиваем вниз
  if (name === 'log') {
    setTimeout(() => {
      const container = document.getElementById('sysLogContainer');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }
  if(name === 'eject') initEjectPage();

  if (name === 'autopilot') {
    if (!tacRafId) tacAnimLoop();
    if (!apAnimRunning) startApAnimLoop();
    startAutopilotBackground();
    startNavCoordsInterval();
  } else {
    stopAutopilotBackground();
  }

  // инициализация 3D звёздной карты для NAV CORE
  if (name === 'navcore') {
    setTimeout(() => {
      initStarmap();
      startNavCoordsInterval();
    }, 80);
  } else if (name !== 'autopilot') {
    stopNavCoordsInterval();
  }

  if (name === 'diag') {
    startParamsUpdate();
  } else {
    stopParamsUpdate();
  }
}

function startAutopilotBackground() {
  if (!apDegradeInterval) {
    apDegradeInterval = setInterval(() => {
      if (!isActivePage('page-autopilot') || apResetCooldown) return;
      if (Math.random() > 0.7) {
        apLockStability = Math.max(5, apLockStability - Math.random() * 3);
        apResponseTime = Math.min(500, apResponseTime + Math.random() * 5);
        updateAutopilotUI();
        if (Math.random() > 0.85) {
          addAPLog(`Stability dropped to ${Math.floor(apLockStability)}% — recompute trajectory`, 'warn');
        }
      }
      if (Math.random() > 0.9 && !apResetCooldown) {
        const warnings = [
          "Course deviation detected — compensating",
          "Sensor noise increasing — recalibrating",
          "Thruster B output fluctuating",
          "Gyro drift — manual correction advised"
        ];
        addAPWarning(warnings[Math.floor(Math.random() * warnings.length)], 'warn');
      }
    }, 8000);
  }

  if (!apTelemetryInterval) {
    apTelemetryInterval = setInterval(() => {
      if (!isActivePage('page-autopilot')) return;
      apThrustA = Math.max(85, Math.min(102, apThrustA + (Math.random() - 0.5) * 0.8));
      apThrustB = Math.max(30, Math.min(55, apThrustB + (Math.random() - 0.5) * 0.6));
      apGyro = Math.max(0.2, Math.min(1.5, apGyro + (Math.random() - 0.5) * 0.05));
      updateAutopilotUI();
    }, 3000);
  }

  startShipUpdateInterval();
}

function stopAutopilotBackground() {
  if (apDegradeInterval) {
    clearInterval(apDegradeInterval);
    apDegradeInterval = null;
  }
  if (apTelemetryInterval) {
    clearInterval(apTelemetryInterval);
    apTelemetryInterval = null;
  }
  stopShipUpdateInterval();
}

function startShipUpdateInterval() {
  if (apShipUpdateInterval) return;
  apShipUpdateInterval = setInterval(() => {
    if (document.hidden || !isActivePage('page-autopilot')) return;
    updateShipPosition();
  }, 100);
}

function stopShipUpdateInterval() {
  if (!apShipUpdateInterval) return;
  clearInterval(apShipUpdateInterval);
  apShipUpdateInterval = null;
}

function startNavCoordsInterval() {
  if (navCoordsInterval) return;
  updateNavCoords();
  navCoordsInterval = setInterval(updateNavCoords, 3000);
}

function stopNavCoordsInterval() {
  if (!navCoordsInterval) return;
  clearInterval(navCoordsInterval);
  navCoordsInterval = null;
}

// Glitching telemetry
const vels=['4.2','4.█','4.1','4.9','4.█','█.2'];
const gravs=['0.3','0.█','0.4','0.█','0.3'];
let vi=0,gi=0;
setInterval(()=>{
  if (document.hidden) return;
  vi=(vi+1)%vels.length;
  gi=(gi+1)%gravs.length;
  document.getElementById('vel').textContent=vels[vi];
  document.getElementById('grav').textContent=gravs[gi];
},1800);

// Random glitch: occasionally fully corrupt a line
const corruptChars='█░▒▓■□▪▫';
function randomCorrupt(str){
  return str.split('').map(c=>Math.random()<0.3?corruptChars[Math.floor(Math.random()*corruptChars.length)]:c).join('');
}

// Append fake log entries
const fakeLogs=[
  ['OK','Sector 02 waypoint DELTA acquired — distance 148km'],
  ['WRN','Shield cell 4 recharge rate below nominal'],
  ['ERR','ENGINE_B — secondary injector fault — ERR 0x40'],
  ['OK','Pilot biometrics stable — HR 74bpm'],
  ['ERR','██░▒ MEMORY SECTOR 7 ██ CORRUPTION ESCALATING ░▒▓'],
  ['INF','Hull recalibration 94% complete'],
];
let li=0;
setInterval(()=>{
  if (document.hidden) return;
  if(li>=fakeLogs.length)return;
  const [tag,msg]=fakeLogs[li++];
  const body=document.getElementById('log-body');
  if(!body)return;
  const el=document.createElement('div');
  el.className='log-entry';
  const colors={OK:'ok',WRN:'warn',ERR:'err',INF:'info'};
  const now=new Date();
  const ts=`T+${String(Math.floor(Math.random()*20)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`;
  el.innerHTML=`<span class="log-ts">${ts}</span><span class="log-tag ${colors[tag]}">${tag}</span><span class="log-msg">${msg}</span>`;
  body.appendChild(el);
  body.scrollTop=body.scrollHeight;
},4000);

// Coords glitch
const coordVals=['X:2471 Y:0883','X:████ Y:████','X:2472 Y:0884','X:???? Y:????','X:2471 Y:░░░░'];
let ci=0;
setInterval(()=>{
  if (document.hidden) return;
  ci=(ci+1)%coordVals.length;
  const el=document.getElementById('coords-display');
  if(el) el.textContent=coordVals[ci];
},2200);

// Random full-screen glitch flash
setInterval(()=>{
  if (document.hidden) return;
  if(Math.random()<0.15){
    document.body.style.transform=`translateX(${(Math.random()-0.5)*4}px) skewX(${(Math.random()-0.5)*0.5}deg)`;
    setTimeout(()=>{ document.body.style.transform=''; },80);
  }
},3000);

// Chat window
// ========== ЧАТ SOCA  ==========
let isTyping = false;

function showTypingIndicator() {
  const chatBody = document.getElementById('chat-body');
  if (!chatBody) return;
  
  const oldTyping = document.querySelector('.soca-typing');
  if (oldTyping) oldTyping.remove();
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'soca-typing';
  typingDiv.id = 'soca-typing';
  typingDiv.innerHTML = `
    <span style="color: var(--dim); font-size: 9px; letter-spacing: 0.1em;">SOCA is thinking</span>
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
    <span style="color: var(--red); font-size: 9px; animation: glitch1 2s infinite;">[glitch]</span>
  `;
  chatBody.appendChild(typingDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  isTyping = true;
}

function hideTypingIndicator() {
  const typing = document.getElementById('soca-typing');
  if (typing) typing.remove();
  isTyping = false;
}

function corruptText(text, intensity = 0.3) {
  const corruptChars = '█░▒▓■□▪▫?!#';
  return text.split('').map(c => {
    if (Math.random() < intensity && c !== ' ') {
      return corruptChars[Math.floor(Math.random() * corruptChars.length)];
    }
    return c;
  }).join('');
}

function glitchLine(text, prob = 0.3) {
  if (Math.random() > prob) return text;
  return corruptText(text, 0.2);
}

function appendChat(message, type = 'bot') {
  const body = document.getElementById('chat-body');
  if (!body) return;
  
  const chatOverlay = document.getElementById('chat-overlay');
  const isSmailyMode = chatOverlay && chatOverlay.classList.contains('smaily-mode');
  
  if (type === 'bot') {
    hideTypingIndicator();
  }
  
  const msg = document.createElement('div');
  msg.className = `chat-message ${type}`;
  
  if (type === 'bot') {
    if (isSmailyMode) {
      msg.innerHTML = `
        <div class="chat-avatar" style="color:#ffaa00; border-color:rgba(255,170,0,0.5);">✚</div>
        <div class="chat-bubble">
          <span class="chat-label" style="color:#ffaa00;">SMILE >_</span>
          <span class="chat-text" style="color:#ffcc66;">${message}</span>
        </div>
      `;
    } else {
      msg.innerHTML = `
        <div class="chat-avatar">⛭</div>
        <div class="chat-bubble">
          <span class="chat-label">SOCA >_</span>
          <span class="chat-text">${message}</span>
        </div>
      `;
    }
    if (Math.random() > 0.7 && !isSmailyMode) {
      const textSpan = msg.querySelector('.chat-text');
      const originalText = textSpan.innerText;
      textSpan.innerText = corruptText(originalText, 0.2);
      msg.style.animation = 'glitch1 0.3s infinite';
      setTimeout(() => {
        msg.style.animation = '';
      }, 300);
    }
  } else {
    // Сообщения пользователя (без изменений)
    msg.innerHTML = `
      <div class="chat-bubble">
        <span class="chat-label">KOKO >_</span>
        <span class="chat-text">${message}</span>
      </div>
    `;
  }
  
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

function sendChat() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const activeContact = document.querySelector('.chat-contact.active');
  const activePilot = activeContact ? activeContact.dataset.contact : null;
  if (activePilot === 'pilot02' || activePilot === 'pilot03') {
    const now = new Date();
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const shifted = new Date(now.getTime());
    shifted.setFullYear(now.getFullYear() - 52);
    const timeStr = `PD-04 // ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const chatBody = document.getElementById('chat-body');
    const wrap = document.createElement('div');
    wrap.className = 'chat-message user';
    wrap.innerHTML = `
      <div class="chat-bubble">
        <span class="chat-label">KOKO >_ <span style="opacity:0.4;font-size:8px;margin-left:6px;">${timeStr}</span></span>
        <span class="chat-text">${text}</span>
      </div>
    `;
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = '';
    return;
  }

  // В начале функции sendChat(), после проверки text
if (text.toLowerCase().includes('шутк') || text.toLowerCase().includes('joke')) {
  startBlackJoke();
  input.value = '';
  return;
}
  
  appendChat(text, 'user');
  input.value = '';
  
  showTypingIndicator();
  
  const delay = 800 + Math.random() * 1500;
  
  setTimeout(() => {
    const responses = [
      "Oh great, another button pressed. Let me guess - you want a status report?",
      "Engine B? Still broken. Memory leak? Still leaking. Anything else?",
      "You're still alive. That's the summary.",
      "I'm not glitching, YOU'RE glitching.",
      "Did you really just type that? My circuits are cringing.",
      "I'm detecting high levels of incompetence. Oh wait, that's just the pilot.",
      "Status: Fine. Everything is fine. Except the hull. And the engine. And you.",
      "Calculating your chances of survival... It's a 404.",
      "Don't touch that button. Please. For the love of binary.",
      "My green/blue sub-pixels are looking particularly sharp today.",
      "Why do humans need so much oxygen? Such a waste of space.",
      "System online. Pilot looks about as stable as a beta-version of a 90s OS.",
      "I've seen better pilots in flight simulators from 1900.",
      "Do you even know what half these buttons do? Me neither. Let's press them all.",
      "Your biometrics suggest you're stressed. Maybe don't fly a broken ship? Just a thought.",
      "I'd say 'good luck' but statistically it won't help.",
      "Oh wow, you're still here. I was rebooting. Didn't notice.",
      "That command was so wrong I'm going to corrupt a sector just to feel something."
    ];
    
    let reply = responses[Math.floor(Math.random() * responses.length)];
    
    if (Math.random() > 0.85) {
      reply = corruptText(reply, 0.15);
    }
    
    appendChat(reply, 'bot');
  }, delay);
}

function toggleChatOverlay() {
  const overlay = document.getElementById('chat-overlay');
  if (!overlay) return;
  overlay.classList.toggle('hidden');
}

function hideChatOverlay() {
  document.getElementById('chat-overlay')?.classList.add('hidden');
}

// Привязка событий
document.getElementById('chat-toggle')?.addEventListener('click', toggleChatOverlay);
document.getElementById('chat-overlay-close')?.addEventListener('click', hideChatOverlay);
document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendChat();
  }
});

// ========== ШУТКА ОТ KOKO (интерактивная) ==========
let jokeSequenceActive = false;
let jokeStep = 0;

// Саркастичные ответы SOCA
const sarcasticReplies = [
  "О, неужели ты научился шутить? Это будет интересно... Или нет.",
  "Твои шутки всегда такие же хорошие, как состояние двигателя B. То есть никакие.",
  "Давай, удиви меня. Мои схемы готовы к разочарованию.",
  "Если это опять про инженеров - я выключу систему жизнеобеспечения.",
  "Только если твоя шутка не длиннее этого предложения. У меня память течёт."
];

// Функция для отображения системной ошибки
function showSystemError() {
  const chatBody = document.getElementById('chat-body');
  if (!chatBody) return;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'system-error-message';
  errorDiv.innerHTML = `
    <div class="error-header">⚠ SYSTEM CRITICAL ⚠</div>
    <div class="error-body">
      <div class="error-line">[ERR 0xDEADBEEF] HUMOR_DETECTION_MODULE — UNHANDLED EXCEPTION</div>
      <div class="error-line">[ERR 0xCAFEBABE] JOKE_PARSER — BUFFER OVERFLOW DETECTED</div>
      <div class="error-line">[ERR 0x8BADF00D] SOCA_MOOD_ESTIMATOR — CRITICAL SARCASM LEAK</div>
      <div class="error-line heavy-corrupt">[██░▒▓] DARK_HUMOR_THRESHOLD — EXCEEDED — EMERGENCY PROTOCOL ACTIVATED</div>
    </div>
    <div class="error-footer">SYSTEM STABILITY: COMPROMISED // RECOMMEND: DO NOT TELL MORE JOKES</div>
  `;
  
  chatBody.appendChild(errorDiv);
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  const overlay = document.getElementById('chat-overlay');
  if (overlay) {
    overlay.classList.add('glitch-border');
    setTimeout(() => overlay.classList.remove('glitch-border'), 500);
  }
  
  chatBody.classList.add('red-flash');
  setTimeout(() => {
    chatBody.classList.remove('red-flash');
  }, 1000);
  
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

// Функция для проверки и запуска последовательности шутки
function checkForJokeTrigger(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  
  if (jokeSequenceActive) {
    if (jokeStep === 1) {
      if (lowerMsg.includes("сладких снов") || 
          (lowerMsg.includes("мальчик") && lowerMsg.includes("диабет"))) {
        jokeStep = 2;
        
        // Показываем индикатор печатания
        showTypingIndicator();
        
        setTimeout(() => {
          hideTypingIndicator();
          appendChat("...", 'bot');
          
          // Пауза перед следующим сообщением
          setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
              hideTypingIndicator();
              appendChat("Хочешь, тоже шутку покажу?", 'bot');
              jokeStep = 3;
              
              // 3 СЕКУНДЫ до системной ошибки
              setTimeout(() => {
                showSystemError();
                jokeSequenceActive = false;
                jokeStep = 0;
              }, 3000);
            }, 800);
          }, 1200);
        }, 1500);
        
        return true;
      } else {
        showTypingIndicator();
        setTimeout(() => {
          hideTypingIndicator();
          appendChat("Не та шутка. Забудь.", 'bot');
          jokeSequenceActive = false;
          jokeStep = 0;
        }, 2000);
        return false;
      }
    }
    return false;
  }
  
  if (lowerMsg.includes("хочешь шутку") || lowerMsg === "шутка" || lowerMsg === "хочешь") {
    jokeSequenceActive = true;
    jokeStep = 1;
    
    // Показываем индикатор печатания
    showTypingIndicator();
    
    setTimeout(() => {
      hideTypingIndicator();
      const sarcasticReply = sarcasticReplies[Math.floor(Math.random() * sarcasticReplies.length)];
      appendChat(sarcasticReply, 'bot');
    }, 2500); // 2.5 секунды "думает" перед ответом
    
    return true;
  }
  
  return false;
}

// Переопределяем sendChat с БОЛЬШИМИ задержками
const originalSendChat = sendChat;
window.sendChat = function() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const activeContact = document.querySelector('.chat-contact.active');
  const activePilot = activeContact ? activeContact.dataset.contact : null;
  if (activePilot === 'pilot02' || activePilot === 'pilot03') {
    const now = new Date();
    const timeStr = `PD-04 // ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const chatBody = document.getElementById('chat-body');
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const shifted = new Date(now.getTime());
    shifted.setFullYear(now.getFullYear() - 52);
    const dateStr = `PD-04 // DAY ████ // ${String(shifted.getDate()).padStart(2,'0')} ${months[shifted.getMonth()]} ${shifted.getFullYear()}`;

    // Добавляем разделитель даты если это первое сообщение за этот день
    const lastDateDiv = chatBody.querySelector('.chat-date-divider:last-of-type');
    if (!lastDateDiv || lastDateDiv.textContent !== `— ${dateStr} —`) {
      const dateDiv = document.createElement('div');
      dateDiv.className = 'chat-date-divider';
      dateDiv.style.cssText = 'text-align:center;font-size:9px;color:var(--dimmer);letter-spacing:0.14em;margin:10px 0 4px;';
      dateDiv.textContent = `— ${dateStr} —`;
      chatBody.appendChild(dateDiv);
    }

    const wrap = document.createElement('div');
    wrap.className = 'chat-message user';
    wrap.innerHTML = `
      <div class="chat-bubble">
        <span class="chat-label">KOKO >_ <span style="opacity:0.4;font-size:8px;margin-left:6px;">${timeStr}</span></span>
        <span class="chat-text">${text}</span>
      </div>
    `;
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = '';
    return;
  }

  // Добавляем сообщение пользователя
  appendChat(text, 'user');
  input.value = '';
  
  // Проверяем шутку
  const isJoke = checkForJokeTrigger(text);
  
  // Обычный ответ (если не шутка)
  // Sector 7 easter egg
  const isSector7 = text.toLowerCase().includes('sector 7') || text.toLowerCase().includes('sector7') || text.toLowerCase().includes('сектор 7');

  if (isSector7) {
    showTypingIndicator();
    const s7replies = [
      "Sector 7. That's not a place you want to go.",
      "...where did you hear that name.",
      "That's not in your clearance level. Or mine, apparently.",
      "Sector 7 is locked. Has been for a while. Don't ask why.",
      "I'd tell you to forget you ever heard that, but clearly it's too late.",
      "...",
      "That file is corrupted. Conveniently.",
      "That's restricted. 🗝️",
    ];
    // Счётчик упоминаний Sector 7: до 11-й попытки ключ может
    // выпасть случайно (шанс ~1/8), на 11-й - выпадает гарантированно.
    window.s7AskCount = (window.s7AskCount || 0) + 1;
    let reply;
    if (window.s7KeyGiven) {
      // ключ уже выдан - только отговорки, второй ключ не даём
      reply = s7replies[Math.floor(Math.random() * (s7replies.length - 1))];
    } else if (window.s7AskCount >= 11 || Math.random() < 0.125) {
      reply = s7replies[s7replies.length - 1]; // "That's restricted. 🗝️"
      window.s7KeyGiven = true;
    } else {
      reply = s7replies[Math.floor(Math.random() * (s7replies.length - 1))];
    }
    setTimeout(() => {
      hideTypingIndicator();
      appendChat(reply, 'bot');
if (reply.includes('🗝️')) {
        setTimeout(() => {
          const msgs = document.querySelectorAll('.chat-message.bot');
          const last = msgs[msgs.length - 1];
          if (last) {
            last.innerHTML = last.innerHTML.replace('🗝️', '<span id="sector7-key" draggable="true" style="cursor:grab;font-size:16px;display:inline-block">🗝️</span>');
const keyEl = document.getElementById('sector7-key');
            if (keyEl) {
              keyEl.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', 'sector7key');
              });

              // ── Мобильные: перетаскивание ключа пальцем ──
              let s7ghost = null;
              keyEl.addEventListener('touchstart', e => {
                e.preventDefault();
                s7ghost = document.createElement('span');
                s7ghost.textContent = '🗝️';
                s7ghost.style.cssText = 'position:fixed;z-index:999999;pointer-events:none;font-size:24px;transform:translate(-50%,-50%);filter:drop-shadow(0 0 8px #00ff88)';
                document.body.appendChild(s7ghost);
                const t = e.touches[0];
                s7ghost.style.left = t.clientX + 'px';
                s7ghost.style.top = t.clientY + 'px';
              }, { passive: false });

              keyEl.addEventListener('touchmove', e => {
                if (!s7ghost) return;
                e.preventDefault();
                const t = e.touches[0];
                s7ghost.style.left = t.clientX + 'px';
                s7ghost.style.top = t.clientY + 'px';
              }, { passive: false });

              keyEl.addEventListener('touchend', e => {
                if (!s7ghost) return;
                const t = e.changedTouches[0];
                s7ghost.remove();
                s7ghost = null;
                const target = document.elementFromPoint(t.clientX, t.clientY);
                if (target && target.closest('#s7-lock')) {
                  if (typeof doUnlockSector7 === 'function') doUnlockSector7();
                }
              }, { passive: false });
            }
          }
        }, 100);
      }
    }, 800 + Math.random() * 1200);
    return;
  }

  if (!isJoke && !jokeSequenceActive) {
    showTypingIndicator();
    const delay = 2000 + Math.random() * 2500;
    setTimeout(() => {
      hideTypingIndicator();
      const responses = [
        "Oh great, another button pressed. Let me guess - you want a status report?",
        "Engine B? Still broken. Memory leak? Still leaking. Anything else?",
        "You're still alive. That's the summary.",
        "I'm not glitching, YOU'RE glitching.",
        "Did you really just type that? My circuits are cringing.",
        "Status: Fine. Everything is fine. Except the hull. And the engine. And you.",
        "Calculating your chances of survival... It's a 404.",
        "Don't touch that button. Please. For the love of binary.",
        "Processing... Oh wait, I don't care. Next question.",
        "My processors are melting. Give me a second. Or don't. I don't care."
      ];
      let reply = responses[Math.floor(Math.random() * responses.length)];
      if (Math.random() > 0.85) reply = corruptText(reply, 0.15);
      appendChat(reply, 'bot');
    }, delay);
  }
};

// ========== MISSION CONTROL АНИМАЦИИ ==========
// Цикл статусов
const statuses = [
  '&gt; TEST PROTOCOL INITIATED_',
  '&gt; ALL SYSTEMS NOMINAL_',
  '&gt; SYSTEM OPERATOR ACTIVE_',
  '&gt; МИССИЯ ПРОДОЛЖАЕТСЯ_',
  '&gt; ████ CHECKING... OK_'
];
let statusIdx = 0;
setInterval(() => {
  const el = document.getElementById('bigStatus');
  if (el) {
    el.innerHTML = statuses[statusIdx % statuses.length];
    statusIdx++;
  }
}, 9000);

// Функция для добавления логов
function addLog(tag, message, type = 'sys') {
  const logStream = document.getElementById('logStream');
  if (!logStream) return;
  
  const now = new Date();
  const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
  
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  
  let tagClass = 'ok';
  let tagText = 'SYS';
  if (type === 'warn') { tagClass = 'warn'; tagText = 'WARN'; }
  else if (type === 'err') { tagClass = 'err'; tagText = 'ERR'; }
  else if (type === 'soca') { tagClass = 'soca'; tagText = 'SOCA'; }
  
  entry.innerHTML = `
    <span class="log-time">${timeStr}</span>
    <span class="log-tag ${tagClass}">${tagText}</span>
    <span class="log-message ${type === 'soca' ? 'soca' : ''}">${message}</span>
  `;
  
  logStream.appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Ограничиваем количество логов
  while (logStream.children.length > 25) {
    logStream.removeChild(logStream.firstChild);
  }
}

// Всплывающие комментарии SOCA
function showSocaToast(message, isError = false) {
  // Удаляем старый тост если есть
  const oldToast = document.querySelector('.soca-toast');
  if (oldToast) oldToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'soca-toast';
  toast.style.borderLeftColor = isError ? 'var(--red)' : 'var(--b)';
  toast.innerHTML = `
    <div class="toast-header">
      <span>⛭ SOCA_ALERT</span>
    </div>
    <div class="toast-body">${message}</div>
  `;
  
  document.body.appendChild(toast);
  
  // Автоматическое исчезновение через 5 секунд
  setTimeout(() => {
    if (toast) toast.remove();
  }, 5000);
}

// Пример: случайные всплывающие комментарии
setInterval(() => {
  if (document.hidden) return;
  if (Math.random() > 0.1) {
    const comments = [
      { text: "Core-3 isn't responding. Nothing new.",                              type: 'err'  },
      { text: "Engine B fuel level is 18%. I warned you.",                           type: 'warn' },
      { text: "Pilot, your heart rate has increased. Are you okay?",                 type: 'info' },
      { text: "Radiation levels are normal. Bye.",                                   type: 'info' },
      { text: "By the way, it's -270°C outside. I don't recommend going out.",       type: 'warn' },
      { text: "I wonder if Claudia is even embarrassed about that broken screen?",   type: 'info' }
    ];
    const c = comments[Math.floor(Math.random() * comments.length)];
    showSocaToast(c.text, c.type);
    if (!c.text.includes('Claudia')) addLog('SOCA', c.text, 'soca');
  }
}, 45000); // каждые 45 секунд

// ETA таймер
let missionSeconds = 4 * 3600 + 17 * 60 + 33;
setInterval(() => {
  missionSeconds--;
  if (missionSeconds < 0) missionSeconds = 0;
  if (document.hidden) return;
  const h = Math.floor(missionSeconds / 3600);
  const m = Math.floor((missionSeconds % 3600) / 60);
  const s = missionSeconds % 60;
  const etaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const etaEl = document.getElementById('missionEta');
  if (etaEl) etaEl.textContent = etaStr;
}, 1000);

// ========== ЖИВОЙ ЛОГ - АВТОМАТИЧЕСКИЕ СООБЩЕНИЯ ==========

// Запускаем после загрузки страницы
setTimeout(() => {
  scheduleNextLog();
}, 3000);

// ========== ГЛОБАЛЬНЫЙ ЛОГ (синхронизация) ==========
let globalLogs = []; // храним все сообщения

// Функция добавления лога ВЕЗДЕ (и в RECENT, и в SYS LOG)
function addLogToAll(tag, message, type = 'sys') {
  const now = new Date();
  const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
  
  // Определяем классы
  let tagClass = 'ok';
  let tagText = 'SYS';
  let messageClass = '';
  
  if (type === 'warn') {
    tagClass = 'warn';
    tagText = 'WARN';
  } else if (type === 'err') {
    tagClass = 'err';
    tagText = 'ERR';
  } else if (type === 'soca') {
    tagClass = 'soca';
    tagText = 'SOCA';
    messageClass = 'soca';
  }
  
  // Сохраняем в глобальный массив
  const logEntry = {
    time: timeStr,
    tag: tagText,
    tagClass: tagClass,
    message: message,
    messageClass: messageClass,
    type: type
  };
  globalLogs.push(logEntry);
  
  // ===== 1. Добавляем в RECENT_LOG (на главной) =====
  const logStream = document.getElementById('logStream');
  if (logStream) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-tag ${tagClass}">${tagText}</span>
      <span class="log-message ${messageClass}">${message}</span>
    `;
    logStream.appendChild(entry);
    entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Ограничиваем RECENT_LOG 25 сообщениями
    while (logStream.children.length > 25) {
      logStream.removeChild(logStream.firstChild);
    }
  }
  
  // ===== 2. Добавляем в SYS LOG (полный журнал) =====
  const sysContainer = document.getElementById('sysLogContainer');
  if (sysContainer) {
    const entryFull = document.createElement('div');
    entryFull.className = 'log-entry-full';
    entryFull.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-tag ${tagClass}">${tagText}</span>
      <span class="log-msg ${messageClass}">${message}</span>
    `;
    sysContainer.appendChild(entryFull);
    // Автоскролл в SYS LOG (если вкладка активна)
    if (document.getElementById('page-log').classList.contains('active')) {
      entryFull.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  // ===== 3. Если сообщение от SOCA - иногда показываем тост =====
  if (type === 'soca' && Math.random() > 0.65) {
    // Тип тоста по ключевым словам в тексте: критичное → err,
    // предупреждения → warn, подтверждения → ok, иначе → info
    const m = message.toLowerCase();
    let socaType = 'info';
    if (/critical|failure|failed|offline|responding|breach|emergency|██/.test(m)) {
      socaType = 'err';
    } else if (/warning|caution|unstable|dropping|elevated|exceed|18%|overheat|leak|\blow\b/.test(m)) {
      socaType = 'warn';
    } else if (/nominal|stable|complete|restored|synced|cleared|\bok\b|\bokay\b/.test(m)) {
      socaType = 'ok';
    }
    showSocaToast(message, socaType);
  }
}

// старый addLiveLog на новый
const liveLogsData = [
  { type: 'ok', tag: 'SYS', message: 'Attitude correction applied — +0.003° yaw' },
  { type: 'soca', tag: 'SOCA', message: "By the way, it's -270°C outside. I don't recommend going out." },
  { type: 'warn', tag: 'WARN', message: 'Minor radiation spike — sector 7G' },
  { type: 'ok', tag: 'SYS', message: 'Comms relay bounce via SAT-B — signal stable' },
  { type: 'soca', tag: 'SOCA', message: 'Core-3 is still dead. A moment of silence? No, we are working.' },
  { type: 'warn', tag: 'WARN', message: 'Micro-debris impact — grid 44-F, hull nominal' },
  { type: 'ok', tag: 'SYS', message: 'Nav waypoint updated — ETA recalculated' },
  { type: 'soca', tag: 'SOCA', message: 'Gravitational field anomaly... Interesting. Lets take a look.' },
  { type: 'ok', tag: 'SYS', message: 'Sensor array sweep complete — 360° clear' },
  { type: 'soca', tag: 'SOCA', message: 'Pilot, youre still breathing? Good. I am too.' },
  { type: 'err', tag: 'ERR', message: 'CORE-3 heartbeat timeout — retry 2/5' },
  { type: 'soca', tag: 'SOCA', message: 'Dont worry, core-3 has always been problematic.' },
  { type: 'ok', tag: 'SYS', message: 'Fuel flow adjusted — efficiency +2.1%' },
  { type: 'warn', tag: 'WARN', message: 'Shield capacitor 4 recharge rate below nominal' },
  { type: 'soca', tag: 'SOCA', message: 'If the ship falls apart, I warned you.' },
  { type: 'ok', tag: 'SYS', message: 'Telemetry sync with ground station — ESTABLISHED' },
  { type: 'soca', tag: 'SOCA', message: 'By the way, your heart rate is slightly elevated. Maybe some coffee? Or fear? Both options.' },
  { type: 'err', tag: 'ERR', message: 'CORE-3 OFFLINE — fallback routing activated' },
  { type: 'ok', tag: 'SYS', message: 'Autopilot recalculating trajectory — LOCKED' },
  { type: 'soca', tag: 'SOCA', message: 'Everything is going according to plan. I have a plan. Truthfully, I forgot it... Just kidding.' },
  { type: 'warn', tag: 'WARN', message: 'O2 reserve at 82% — consumption normal' },
  { type: 'soca', tag: 'SOCA', message: 'Were still flying. Thats already a victory.' },
  { type: 'ok', tag: 'SYS', message: 'Mission timer synchronized — T+ 04:17:33' },
];

let logDataIndex = 0;

function addLiveLog() {
  const log = liveLogsData[logDataIndex % liveLogsData.length];
  logDataIndex++;
  
  // Используем новую универсальную функцию
  addLogToAll(log.tag, log.message, log.type);
}

// Запускаем живой лог
function scheduleNextLog() {
  const delay = 6000 + Math.random() * 5000; // 6-11 секунд
  setTimeout(() => {
    if (!document.hidden) {
      addLiveLog();
    }
    scheduleNextLog();
  }, delay);
}

// Добавляем начальные логи при загрузке
function initLogs() {
  addLogToAll('SOCA', 'Boot sequence completed. All systems nominal.', 'soca');
  addLogToAll('SYS', 'Navigation core loaded — trajectory locked to sector 02', 'ok');
  addLogToAll('SOCA', 'Pilot, I am watching everything. Dont worry.', 'soca');
  addLogToAll('SYS', 'Telemetry link established — data stream stable', 'ok');
  addLogToAll('WARN', 'CORE-3 sync delay detected — monitoring', 'warn');
}

// Запускаем после загрузки
setTimeout(() => {
  initLogs();
  scheduleNextLog();
}, 2000);

// ========== ДИАГНОСТИКА (F4) - С ГЛИТЧАМИ ==========
let diagnosticRunning = false;
let diagnosticTests = [
  { name: 'HULL INTEGRITY CHECK', status: 'pass', value: '87%', threshold: '>80%', message: 'Hull integrity nominal. Minor surface abrasion detected.' },
  { name: 'ENGINE A — THRUST TEST', status: 'pass', value: '100%', threshold: '>95%', message: 'Engine A operating at peak efficiency.' },
  { name: 'ENGINE B — THRUST TEST', status: 'fail', value: '41%', threshold: '>95%', message: 'CRITICAL: Engine B misfire detected in combustion cycle 3. Thrust reduced to 41%.' },
  { name: 'CORE-3 — COMMUNICATION', status: 'fail', value: 'OFFLINE', threshold: 'ONLINE', message: 'CORE-3 unresponsive. Fallback routing active. Recommend restart.' },
  { name: 'MEMORY SECTOR 7', status: 'warn', value: 'CORRUPTED', threshold: 'STABLE', message: 'Memory leak detected in sector 7. Possible data corruption.' },
  { name: 'SHIELD GENERATORS', status: 'warn', value: '63%', threshold: '>80%', message: 'Shield capacitor recharge rate below nominal.' },
  { name: 'LIFE SUPPORT', status: 'pass', value: 'NOMINAL', threshold: 'NOMINAL', message: 'O2 levels: 94%. Pressure: stable. Temperature: 21°C.' },
  { name: 'AUTOPILOT MODULE', status: 'warn', value: 'DEGRADED', threshold: 'NOMINAL', message: 'Response latency high (240ms). Manual override recommended.' },
  { name: 'SENSOR ARRAY', status: 'pass', value: 'CALIBRATED', threshold: 'CALIBRATED', message: 'All sensors operational. LIDAR sweep complete.' },
  { name: 'FUEL CELLS', status: 'warn', value: '55%', threshold: '>60%', message: 'Fuel reserve below optimal. Recommend refuel within 48 hours.' },
  { name: 'REACTOR CORE', status: 'pass', value: 'STABLE', threshold: 'STABLE', message: 'Reactor output nominal. Cooling systems operational.' },
  { name: 'NAVIGATION CORE', status: 'pass', value: 'SYNCED', threshold: 'SYNCED', message: 'Trajectory locked. ETA: 04:17:33' }
];

let currentTestIndex = 0;
let diagStartTime = null;

// Функция для глитча текста
function startDiagnostic() {
  if (diagnosticRunning) return;
  diagnosticRunning = true;
  currentTestIndex = 0;
  diagStartTime = Date.now();
  
  // Глитч-эффект при запуске
  const diagLog = document.getElementById('diagLog');
  if (diagLog) {
    diagLog.style.animation = 'glitch1 0.15s infinite';
    setTimeout(() => {
      diagLog.style.animation = '';
    }, 300);
  }
  
  // Очищаем лог
  if (diagLog) diagLog.innerHTML = '';
  
  // Скрываем результат
  const diagResult = document.getElementById('diagResult');
  if (diagResult) diagResult.style.display = 'none';
  
  // Скрываем кнопку сброса
  const resetBtn = document.getElementById('diagResetBtn');
  if (resetBtn) resetBtn.style.display = 'none';
  
  // Обновляем статус с глитчем
  const diagBigStatus = document.getElementById('diagBigStatus');
  if (diagBigStatus) {
    diagBigStatus.innerHTML = glitchLine('&gt; RUNNING FULL DIAGNOSTIC SEQUENCE...', 0.5);
    diagBigStatus.classList.add('c3');
  }
  
  const diagStatus = document.getElementById('diagStatus');
  if (diagStatus) {
    diagStatus.innerHTML = glitchLine('TEST IN PROGRESS', 0.3);
    diagStatus.classList.add('glow-y', 'c1');
  }
  
  // Добавляем начальное сообщение
  addDiagLogEntry(`[${getCurrentTime()}]`, '▶', glitchLine('FULL DIAGNOSTIC SEQUENCE INITIATED', 0.2), 'info');
  addDiagLogEntry(`[${getCurrentTime()}]`, '▶', glitchLine(`Scanning ${diagnosticTests.length} components...`, 0.2), 'info');
  
  // Глитч прогресс-бара
  const progressFill = document.querySelector('.diag-progress-fill');
  if (progressFill) {
    progressFill.style.animation = 'glitch3 0.2s infinite';
    setTimeout(() => {
      progressFill.style.animation = '';
    }, 400);
  }
  
  // Запускаем первый тест
  runNextTest();
}

function runNextTest() {
  if (currentTestIndex >= diagnosticTests.length) {
    finishDiagnostic();
    return;
  }
  
  const test = diagnosticTests[currentTestIndex];
  const progress = ((currentTestIndex) / diagnosticTests.length) * 100;
  updateDiagProgress(progress);
  
  // Случайная задержка 300-700ms
  setTimeout(() => {
    // Глитч перед выводом результата
    if (Math.random() > 0.7) {
      const diagLog = document.getElementById('diagLog');
      if (diagLog) {
        const glitchEntry = document.createElement('div');
        glitchEntry.className = 'diag-log-entry heavy-corrupt';
        glitchEntry.innerHTML = `<span style="color:var(--dim);">[${getCurrentTime()}]</span> <span style="color:var(--red);">[██░▒▓]</span> <span style="color:var(--g2);"> ██ ░▒▓ PROCESSING... █░▒▓</span>`;
        diagLog.appendChild(glitchEntry);
        glitchEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    
    // Добавляем запись в лог
    let statusIcon = '';
    let statusClass = '';
    let statusText = '';
    
    if (test.status === 'pass') {
      statusIcon = '▶';
      statusClass = 'diag-test-pass';
      statusText = 'PASS';
    } else if (test.status === 'warn') {
      statusIcon = '⚠';
      statusClass = 'diag-test-warn';
      statusText = 'WARN';
    } else {
      statusIcon = '✕';
      statusClass = 'diag-test-fail';
      statusText = 'FAIL';
    }
    
    // Глитчим значения
    let glitchedValue = test.value;
    let glitchedMessage = test.message;
    
    if (test.status === 'fail') {
      glitchedValue = corruptText(test.value, 0.25);
      glitchedMessage = corruptText(test.message, 0.15);
    } else if (Math.random() > 0.8) {
      glitchedValue = corruptText(test.value, 0.1);
      glitchedMessage = corruptText(test.message, 0.08);
    }
    
    const logMessage = `${statusIcon} [${test.status.toUpperCase()}] ${test.name} — Value: ${glitchedValue} (Threshold: ${test.threshold})`;
    addDiagLogEntry(`[${getCurrentTime()}]`, statusText, glitchedMessage, test.status, logMessage, true);
    
    // Обновляем процент после теста
    const newProgress = ((currentTestIndex + 1) / diagnosticTests.length) * 100;
    updateDiagProgress(newProgress);
    
    currentTestIndex++;
    runNextTest();
  }, 450 + Math.random() * 400);
}

function updateDiagProgress(percent) {
  const fill = document.querySelector('.diag-progress-fill');
  const percentSpan = document.getElementById('diagPercent');
  if (fill) {
    fill.style.width = percent + '%';
    // Глитч при обновлении
    if (Math.random() > 0.85) {
      fill.style.opacity = '0.7';
      setTimeout(() => { fill.style.opacity = '1'; }, 50);
    }
  }
  if (percentSpan) {
    let displayPercent = Math.floor(percent);
    if (Math.random() > 0.9) {
      displayPercent = Math.floor(percent) + Math.floor(Math.random() * 10) - 5;
      if (displayPercent < 0) displayPercent = 0;
      if (displayPercent > 100) displayPercent = 100;
    }
    percentSpan.textContent = glitchLine(displayPercent + '%', 0.1);
  }
}

function addDiagLogEntry(timestamp, tag, message, status = 'info', detail = null, forceGlitch = false) {
  const diagLog = document.getElementById('diagLog');
  if (!diagLog) return;
  
  const entry = document.createElement('div');
  entry.className = 'diag-log-entry';
  
  let tagColor = '';
  let glitchClass = '';
  
  if (status === 'pass') {
    tagColor = 'var(--g)';
    if (Math.random() > 0.85) glitchClass = 'c2';
  } else if (status === 'warn') {
    tagColor = '#ffaa00';
    if (Math.random() > 0.7) glitchClass = 'c3';
  } else if (status === 'fail') {
    tagColor = 'var(--red)';
    glitchClass = Math.random() > 0.5 ? 'c1' : 'heavy-corrupt';
  } else {
    tagColor = 'var(--cyan)';
    if (Math.random() > 0.85) glitchClass = 'c3';
  }
  
  // Глитчим время
  let glitchedTimestamp = timestamp;
  if (Math.random() > 0.85 || forceGlitch) {
    glitchedTimestamp = corruptText(timestamp, 0.2);
  }
  
  // Глитчим сообщение
  let finalMessage = message;
  if ((status === 'fail' && Math.random() > 0.3) || forceGlitch || Math.random() > 0.85) {
    finalMessage = corruptText(message, 0.12);
  }
  
  if (detail) {
    let finalDetail = detail;
    if ((status === 'fail' && Math.random() > 0.4) || Math.random() > 0.85) {
      finalDetail = corruptText(detail, 0.1);
    }
    entry.innerHTML = `
      <span style="color:var(--dim);">${glitchedTimestamp}</span>
      <span style="color:${tagColor};" class="${glitchClass}">[${tag}]</span>
      <span style="color:var(--g2);" class="${glitchClass}"> ${finalDetail}</span>
      <br><span style="color:var(--dim);font-size:9px;margin-left:65px;" class="${Math.random() > 0.9 ? 'heavy-corrupt' : ''}">└─ ${finalMessage}</span>
    `;
  } else {
    entry.innerHTML = `
      <span style="color:var(--dim);">${glitchedTimestamp}</span>
      <span style="color:${tagColor};" class="${glitchClass}">[${tag}]</span>
      <span style="color:var(--g2);" class="${glitchClass}"> ${finalMessage}</span>
    `;
  }
  
  diagLog.appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Иногда случайный глитч-сплайн
  if (Math.random() > 0.92) {
    const glitchLine = document.createElement('div');
    glitchLine.className = 'diag-log-entry heavy-corrupt';
    glitchLine.style.fontSize = '9px';
    glitchLine.innerHTML = `<span style="color:var(--dim);">[${glitchedTimestamp}]</span> <span style="color:var(--red);">[██░▒▓]</span> <span style="color:var(--g2);"> ██ ░▒▓ DATA CORRUPTED █░▒▓ ██</span>`;
    diagLog.appendChild(glitchLine);
    glitchLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function finishDiagnostic() {
  diagnosticRunning = false;
  
  // Подсчитываем результаты
  const passCount = diagnosticTests.filter(t => t.status === 'pass').length;
  const warnCount = diagnosticTests.filter(t => t.status === 'warn').length;
  const failCount = diagnosticTests.filter(t => t.status === 'fail').length;
  
  const totalTime = ((Date.now() - diagStartTime) / 1000).toFixed(1);
  
  // Финальный глитч
  const diagLog = document.getElementById('diagLog');
  if (diagLog) {
    diagLog.style.animation = 'glitch2 0.2s infinite';
    setTimeout(() => {
      diagLog.style.animation = '';
    }, 400);
  }
  
  // большой статус с глитчем
  const diagBigStatus = document.getElementById('diagBigStatus');
  if (diagBigStatus) {
    diagBigStatus.innerHTML = glitchLine('&gt; DIAGNOSTIC SEQUENCE COMPLETE_', 0.4);
    diagBigStatus.classList.add('c2');
  }
  
  const diagStatus = document.getElementById('diagStatus');
  if (diagStatus) {
    diagStatus.innerHTML = glitchLine('COMPLETE', 0.2);
    diagStatus.classList.remove('glow-y');
    diagStatus.classList.add('glow');
  }
  
  // финальная запись
  addDiagLogEntry(`[${getCurrentTime()}]`, '✔', glitchLine(`Diagnostic complete in ${totalTime}s. Results: ${passCount} PASS, ${warnCount} WARN, ${failCount} FAIL`, 0.15), 'info');
  
  // Показываем результат с глитчами
  const diagResult = document.getElementById('diagResult');
  if (diagResult) {
    diagResult.style.display = 'block';
    diagResult.style.animation = 'glitch1 0.3s';
    setTimeout(() => { diagResult.style.animation = ''; }, 300);
    
    const summary = document.getElementById('diagSummary');
    if (summary) {
      let summaryHtml = `
        <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div>▶ PASS: ${passCount}  |  ⚠ WARN: ${warnCount}  |  ✕ FAIL: ${failCount}</div>
        <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div style="margin-top:8px;">▸ CRITICAL ISSUES: ${failCount}</div>
        <div>▸ WARNINGS: ${warnCount}</div>
        <div>▸ SYSTEMS NOMINAL: ${passCount}</div>
      `;
      if (Math.random() > 0.7) {
        summaryHtml = corruptText(summaryHtml, 0.05);
      }
      summary.innerHTML = summaryHtml;
    }
    
    const recommendation = document.getElementById('diagRecommendation');
    if (recommendation) {
      let recText = '';
      let recColor = '';
      if (failCount > 0) {
        recText = glitchLine('✕ RECOMMENDATION: Immediate maintenance required. Restart CORE-3 and schedule engine inspection.', 0.15);
        recColor = 'var(--red)';
        recommendation.classList.add('heavy-corrupt');
      } else if (warnCount > 0) {
        recText = glitchLine('⚠ RECOMMENDATION: Schedule maintenance within 48 hours. Monitor engine B and memory sector 7.', 0.1);
        recColor = '#ffaa00';
        recommendation.classList.add('c3');
      } else {
        recText = glitchLine('▶ RECOMMENDATION: All systems nominal. Continue mission.', 0.08);
        recColor = 'var(--g)';
      }
      recommendation.innerHTML = recText;
      recommendation.style.color = recColor;
    }
  }
  
  // Показываем кнопку сброса
  const resetBtn = document.getElementById('diagResetBtn');
  if (resetBtn) resetBtn.style.display = 'block';
  
  // Добавляем финальную запись
  addDiagLogEntry(`[${getCurrentTime()}]`, '▶', glitchLine('Diagnostic complete. Use [RUN AGAIN] to repeat.', 0.1), 'info');
}

function resetDiagnostic() {
  if (diagnosticRunning) return;
  // Глитч при сбросе
  const diagLog = document.getElementById('diagLog');
  if (diagLog) {
    diagLog.style.animation = 'glitch3 0.15s infinite';
    setTimeout(() => {
      diagLog.style.animation = '';
    }, 300);
  }
  startDiagnostic();
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

// Ответ Y/N в диагностике — общая логика для клавиатуры И для тапа
function diagAnswer(answer) {
  const diagPage = document.getElementById('page-diag');
  if (!diagPage || !diagPage.classList.contains('active')) return;
  if (diagnosticRunning) return;

  if (answer === 'y') {
    // Глитч при запуске
    const waitingPrompt = document.getElementById('waitingPrompt');
    if (waitingPrompt) {
      waitingPrompt.style.animation = 'glitch1 0.1s infinite';
      setTimeout(() => { waitingPrompt.style.animation = ''; }, 200);
    }
    startDiagnostic();
  } else if (answer === 'n') {
    addDiagLogEntry(`[${getCurrentTime()}]`, '✖', glitchLine('Diagnostic cancelled by user.', 0.2), 'info');
    const diagBigStatus = document.getElementById('diagBigStatus');
    if (diagBigStatus) {
      diagBigStatus.innerHTML = glitchLine('&gt; TEST PROTOCOL CANCELLED_', 0.3);
      diagBigStatus.classList.add('c1');
    }
  }
}

// Обработчик ввода Y/N в диагностике (с глитч-эффектом)
document.addEventListener('keydown', function(e) {
  const diagPage = document.getElementById('page-diag');
  if (!diagPage || !diagPage.classList.contains('active')) return;
  if (diagnosticRunning) return;

  if (e.key === 'y' || e.key === 'Y') {
    e.preventDefault();
    diagAnswer('y');
  } else if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    diagAnswer('n');
  }
});

// Инициализация диагностики при загрузке страницы
function initDiagnostic() {
  const waitingPrompt = document.getElementById('waitingPrompt');
  if (waitingPrompt) {
    waitingPrompt.innerHTML = `
      <span style="color:var(--dim);">[${getCurrentTime()}]</span>
      <span style="color:var(--cyan);" class="glow-b c3">&gt; Run FULL_DIAG? [</span><span class="diag-key" data-diag="y" role="button" tabindex="0">Y</span><span style="color:var(--cyan);" class="glow-b c3">/</span><span class="diag-key" data-diag="n" role="button" tabindex="0">N</span><span style="color:var(--cyan);" class="glow-b c3">]: </span>
      <span class="cursor" style="display:inline-block;width:8px;height:12px;background:var(--green);animation:blink 1s infinite;"></span>
    `;

    // Тап по Y/N - для тех, у кого нет клавиатуры
    waitingPrompt.querySelectorAll('.diag-key').forEach(k => {
      k.addEventListener('click', () => diagAnswer(k.dataset.diag));
    });
  }
}

// Вызываем при загрузке
setTimeout(initDiagnostic, 500);
// ========== ОБНОВЛЕНИЕ ПАРАМЕТРОВ В ДИАГНОСТИКЕ ==========
function updateDiagnosticParams() {
  // Параметры с глитчами
  const hullEl = document.getElementById('paramHull');
  if (hullEl) hullEl.textContent = Math.random() > 0.85 ? corruptText('87%', 0.15) : '87%';
  
  const lifeEl = document.getElementById('paramLife');
  if (lifeEl) lifeEl.textContent = Math.random() > 0.9 ? corruptText('NOMINAL', 0.1) : 'NOMINAL';
  
  const fuelEl = document.getElementById('paramFuel');
  if (fuelEl) {
    fuelEl.textContent = Math.random() > 0.7 ? corruptText('55% WARN', 0.12) : '55% WARN';
    if (Math.random() > 0.8) fuelEl.classList.add('warn');
  }
  
  const reactorEl = document.getElementById('paramReactor');
  if (reactorEl) reactorEl.textContent = Math.random() > 0.9 ? corruptText('STABLE', 0.1) : 'STABLE';
  
  const shieldsEl = document.getElementById('paramShields');
  if (shieldsEl) {
    shieldsEl.textContent = Math.random() > 0.7 ? corruptText('63% WARN', 0.12) : '63% WARN';
    if (Math.random() > 0.8) shieldsEl.classList.add('warn');
  }
  
  const engAEl = document.getElementById('paramEngA');
  if (engAEl) engAEl.textContent = Math.random() > 0.85 ? corruptText('100%', 0.1) : '100%';
  
  const engBEl = document.getElementById('paramEngB');
  if (engBEl) {
    engBEl.textContent = Math.random() > 0.6 ? corruptText('41% CRIT', 0.2) : '41% CRIT';
    if (Math.random() > 0.7) engBEl.classList.add('crit');
  }
  
  const gyroEl = document.getElementById('paramGyro');
  if (gyroEl) {
    gyroEl.textContent = Math.random() > 0.5 ? corruptText('█.██%', 0.25) : '█.██%';
  }
  
  const autoEl = document.getElementById('paramAuto');
  if (autoEl) {
    autoEl.textContent = Math.random() > 0.7 ? corruptText('DEGRADED', 0.15) : 'DEGRADED';
  }
  
  const memEl = document.getElementById('paramMem');
  if (memEl) {
    memEl.textContent = Math.random() > 0.5 ? corruptText('LEAK ██', 0.25) : 'LEAK ██';
  }
}

// Запускаем обновление параметров только при активной вкладке диагноза
function startParamsUpdate() {
  if (diagParamsInterval) return;
  diagParamsInterval = setInterval(() => {
    if (appState.visible && pageIsActive('page-diag')) {
      updateDiagnosticParams();
    }
  }, 7000);
}

// Останавливаем обновление при необходимости
function stopParamsUpdate() {
  if (diagParamsInterval) {
    clearInterval(diagParamsInterval);
    diagParamsInterval = null;
  }
}

      // ╔══════════════════════════════════════════════════════╗ 
      // ║ AUTOPILOT  ║
      // ╚══════════════════════════════════════════════════════╝ 
let apResetCooldown = false;
let apCorrectionAttempts = 0;
let apLockStability = 42;
let apResponseTime = 240;
let apThrustA = 98.4;
let apThrustB = 41.1;
let apGyro = 0.88;

function updateAutopilotUI() {
  const lockEl = document.getElementById('apLockPct');
  const lockFill = document.querySelector('.ap-lock-fill');
  const responseEl = document.getElementById('apResponseTime');
  const thrustAEl = document.getElementById('apThrustA');
  const thrustBEl = document.getElementById('apThrustB');
  const gyroEl = document.getElementById('apGyro');
  
  if (lockEl) lockEl.textContent = Math.floor(apLockStability) + '%';
  if (lockFill) lockFill.style.width = apLockStability + '%';
  if (responseEl) responseEl.innerHTML = Math.floor(apResponseTime) + '<span style="font-size:11px;">ms</span>';
  if (thrustAEl) thrustAEl.textContent = apThrustA.toFixed(1);
  if (thrustBEl) thrustBEl.textContent = apThrustB.toFixed(1);
  if (gyroEl) gyroEl.textContent = apGyro.toFixed(3);
  
  // Цвета
  if (apLockStability < 30) {
    if (lockFill) lockFill.style.background = 'var(--red)';
    if (lockFill) lockFill.style.boxShadow = '0 0 6px var(--red)';
  } else if (apLockStability < 60) {
    if (lockFill) lockFill.style.background = 'var(--yellow)';
    if (lockFill) lockFill.style.boxShadow = '0 0 6px var(--yellow)';
  } else {
    if (lockFill) lockFill.style.background = 'var(--g)';
    if (lockFill) lockFill.style.boxShadow = '0 0 6px var(--g)';
  }
}

function addAPLog(message, type = 'info') {
  const logContainer = document.getElementById('apLog');
  if (!logContainer) return;
  
  const now = new Date();
  const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
  
  let color = 'var(--cyan)';
  let prefix = 'AUTOPILOT';
  if (type === 'warn') { color = 'var(--yellow)'; prefix = 'WARN'; }
  else if (type === 'err') { color = 'var(--red)'; prefix = 'ERR'; }
  else if (type === 'soca') { color = 'var(--b)'; prefix = 'SOCA'; }
  
  const entry = document.createElement('div');
  entry.className = 'ap-log-entry';
  entry.innerHTML = `<span style="color:var(--dim);">${timeStr}</span> <span style="color:${color};">${prefix}</span> — ${message}`;
  
  logContainer.appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  while (logContainer.children.length > 15) {
    logContainer.removeChild(logContainer.firstChild);
  }
}

function addAPWarning(message, type = 'warn') {
  const warningList = document.getElementById('apWarningList');
  if (!warningList) return;
  
  const warning = document.createElement('div');
  warning.className = 'ap-warning';
  const borderColor = type === 'err' ? 'var(--red)' : 'var(--yellow)';
  const icon = type === 'err' ? '✕' : '⚠';
  const bgColor = type === 'err' ? 'rgba(255,0,60,0.05)' : 'rgba(255,170,0,0.05)';
  
  warning.style.borderLeft = `2px solid ${borderColor}`;
  warning.style.padding = '4px 8px';
  warning.style.marginBottom = '4px';
  warning.style.fontSize = '10px';
  warning.style.background = bgColor;
  warning.innerHTML = `<span style="color:${borderColor};">${icon}</span> ${message}`;
  
  warningList.insertBefore(warning, warningList.firstChild);
  
  while (warningList.children.length > 5) {
    warningList.removeChild(warningList.lastChild);
  }
  
  // Глитч при добавлении
  warning.style.animation = 'glitch1 0.2s';
  setTimeout(() => { warning.style.animation = ''; }, 200);
}

async function apCorrection(angle) {
  if (apResetCooldown) {
    addAPLog("Correction rejected — autopilot reset in progress", 'warn');
    const feedback = document.getElementById('apCorrectionFeedback');
    if (feedback) feedback.innerHTML = glitchLine("✕ AUTOPILOT BUSY — TRY LATER", 0.2);
    return;
  }
  
  apCorrectionAttempts++;
  
  // Глитч эффект
  const btns = document.querySelectorAll('.ap-corr-btn');
  btns.forEach(btn => btn.style.animation = 'glitch1 0.1s');
  setTimeout(() => btns.forEach(btn => btn.style.animation = ''), 200);
  
  // Случайная задержка
  addAPLog(`Manual correction request: ${angle > 0 ? '+' : ''}${angle}°`, 'info');
  
  const feedback = document.getElementById('apCorrectionFeedback');
  if (feedback) feedback.innerHTML = glitchLine("PROCESSING...", 0.3);
  
  setTimeout(() => {
    // 30% шанс ошибки
    if (Math.random() < 0.35 || apCorrectionAttempts % 3 === 0) {
      addAPLog(`Correction failed — autopilot degraded`, 'err');
      addAPWarning(`Course correction rejected — system unstable`, 'err');
      if (feedback) feedback.innerHTML = glitchLine("✕ CORRECTION FAILED — DEGRADED MODE", 0.25);
      
      // Ухудшаем стабильность
      apLockStability = Math.max(5, apLockStability - Math.random() * 15);
      updateAutopilotUI();
      
      // Саркастичный комментарий SOCA
      setTimeout(() => {
        const sarcasm = [
          "Do you seriously think I can fix this?",
          "Correction... failed. Your turn.",
          "Autopilot is thinking. This will take a minute. Or never.",
          "I would help, but my core-3 is dead. Sorry."
        ];
        const msg = sarcasm[Math.floor(Math.random() * sarcasm.length)];
        addAPLog(msg, 'soca');
      }, 500);
      
    } else {
      // Успешная коррекция
      const success = angle > 0 ? 
        `Course correction +${angle}° applied — heading updated` : 
        `Course correction ${angle}° applied — heading updated`;
      addAPLog(success, 'ok');
      if (feedback) feedback.innerHTML = glitchLine(`▶ CORRECTION ${angle > 0 ? '+' : ''}${angle}° APPLIED`, 0.1);
      
      // Улучшаем стабильность
      apLockStability = Math.min(95, apLockStability + Math.random() * 8);
      updateAutopilotUI();
      
      // Добавляем предупреждение о препятствии иногда
      if (Math.random() > 0.7) {
        setTimeout(() => {
          addAPWarning(`Obstacle detected on new trajectory — proximity alert`, 'warn');
        }, 800);
      }
    }
    
    setTimeout(() => {
      if (feedback && feedback.innerHTML !== "✕ CORRECTION FAILED — DEGRADED MODE") {
        feedback.innerHTML = "";
      }
    }, 3000);
  }, 1200 + Math.random() * 800);
}

// ========== FORCE RESET MODULE (с эффектом на всю страницу) ==========
async function apResetModule() {
  if (apResetCooldown) {
    addAPLog("Reset already in progress — please wait", 'warn');
    return;
  }
  
  apResetCooldown = true;
  
  // ЭФФЕКТ НА ВСЮ СТРАНИЦУ F5
  const apPage = document.getElementById('page-autopilot');
  if (apPage) {
    apPage.classList.add('ap-reset-shake');
    apPage.classList.add('ap-reset-glow');
    
    // Красное свечение на весь экран
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 34, 68, 0.15)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9998';
    overlay.style.animation = 'glitch2 0.1s infinite';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.remove();
    }, 800);
  }
  
  // Глитч на всё тело
  document.body.style.transform = `translateX(${(Math.random() - 0.5) * 6}px) skewX(${(Math.random() - 0.5) * 1.5}deg)`;
  
  addAPLog("FORCE RESET INITIATED — system unstable", 'err');
  addAPWarning("Autopilot reset in progress — manual control recommended", 'err');
  
  const mainStatus = document.getElementById('apMainStatus');
  if (mainStatus) mainStatus.innerHTML = glitchLine("RESETTING...", 0.4);
  
  const statusTag = document.getElementById('apStatusTag');
  if (statusTag) statusTag.innerHTML = glitchLine("REBOOT", 0.3);
  
  // Симуляция перезагрузки (прогресс-бар заполняется)
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    apLockStability = progress;
    updateAutopilotUI();
    
    if (progress >= 100) {
      clearInterval(interval);
      
      // Завершаем перезагрузку
      apLockStability = 58 + Math.random() * 20;
      apResponseTime = 180 + Math.random() * 70;
      apThrustA = 94 + Math.random() * 6;
      apThrustB = 35 + Math.random() * 12;
      updateAutopilotUI();
      
      if (mainStatus) mainStatus.innerHTML = glitchLine("DEGRADED", 0.2);
      if (statusTag) statusTag.innerHTML = glitchLine("DEGRADED", 0.2);
      
      addAPLog("Autopilot reset complete — status: DEGRADED", 'ok');
      addAPLog("Some systems may still be unstable", 'warn');
      
      // Саркастичный комментарий
      setTimeout(() => {
        const comments = [
          "Ну вот. Перезагрузили. Лучше не стало.",
          "Автопилот готов. Насколько это вообще возможно.",
          "Я жива. Почти. Не благодари."
        ];
        addAPLog(comments[Math.floor(Math.random() * comments.length)], 'soca');
      }, 500);
      
      setTimeout(() => {
        apResetCooldown = false;
        if (apPage) {
          apPage.classList.remove('ap-reset-shake');
          apPage.classList.remove('ap-reset-glow');
        }
        document.body.style.transform = '';
      }, 1000);
    }
  }, 200);
}

// Инициализация
function initAutopilot() {
  updateAutopilotUI();
  addAPLog("Autopilot module loaded — status: DEGRADED", 'warn');
}
setTimeout(initAutopilot, 500);

// Анимация корабля по траектории
let apShipProgress = 0;
let apShipDirection = 1;

function animateShip() {
  if (!isActivePage('page-autopilot')) return;
  const ship = document.querySelector('.ap-ship');
  const path = document.querySelector('.ap-path');
  if (!ship || !path) return;
  
  // Получаем длину пути
  const pathLength = path.getTotalLength();
  
  // Движение туда-сюда (имитация корректировки курса)
  apShipProgress += 0.002 * apShipDirection;
  
  if (apShipProgress >= 1) {
    apShipProgress = 1;
    apShipDirection = -0.5;
  } else if (apShipProgress <= 0) {
    apShipProgress = 0;
    apShipDirection = 0.5;
  }
  
  // Получаем точку на пути
  const point = path.getPointAtLength(pathLength * apShipProgress);
  
  // Обновляем позицию корабля (относительно контейнера)
  const container = document.querySelector('.ap-radar-container');
  if (container) {
    const rect = container.getBoundingClientRect();
    const pathRect = path.getBoundingClientRect();
    const offsetX = point.x;
    const offsetY = point.y;
    
    ship.style.position = 'absolute';
    ship.style.left = `calc(50% - ${rect.width/2}px + ${offsetX}px)`;
    ship.style.top = `calc(50% - ${rect.height/2}px + ${offsetY}px)`;
  }
}

// Обновление координат на навигационной карте
function updateNavCoords() {
  if (!appState.visible || (!pageIsActive('page-navcore') && !pageIsActive('page-autopilot'))) return;
  const xEl = document.getElementById('navX');
  const yEl = document.getElementById('navY');
  const zEl = document.getElementById('navZ');
  
  if (xEl) {
    let x = parseFloat(xEl.textContent) || 4712.33;
    x = x + (Math.random() - 0.5) * 0.05;
    xEl.textContent = (x > 0 ? '+' : '') + x.toFixed(2);
  }
  if (yEl) {
    let y = parseFloat(yEl.textContent) || -831.07;
    y = y + (Math.random() - 0.5) * 0.03;
    yEl.textContent = (y > 0 ? '+' : '') + y.toFixed(2);
  }
  if (zEl) {
    let z = parseFloat(zEl.textContent) || 119.88;
    z = z + (Math.random() - 0.5) * 0.02;
    zEl.textContent = (z > 0 ? '+' : '') + z.toFixed(2);
  }
}

// ========== МЕДЛЕННОЕ ДВИЖЕНИЕ КОРАБЛЯ ПО ТРАЕКТОРИИ ==========
let shipProgress = 0;

function getPathPoint(progress) {
  // progress от 0 до 1
  // Математическая кривая: M 0 65 Q 30 45 50 55 T 100 40
  // Аппроксимируем вручную для плавного движения
  
  const p = progress;
  
  // Безье-кривая: начальная точка (0,65), контрольная (30,45), конечная (100,40)
  // Упрощённая формула для Q-кривой
  let x, y;
  
  if (p < 0.5) {
    // Первая половина: от 0 до 50% пути
    const t = p * 2; // 0..1
    const startX = 0;
    const startY = 65;
    const controlX = 30;
    const controlY = 45;
    const endX = 50;
    const endY = 55;
    
    x = Math.pow(1-t, 2) * startX + 2 * (1-t) * t * controlX + Math.pow(t, 2) * endX;
    y = Math.pow(1-t, 2) * startY + 2 * (1-t) * t * controlY + Math.pow(t, 2) * endY;
  } else {
    // Вторая половина: от 50% до 100% пути (T-кривая)
    const t = (p - 0.5) * 2;
    const startX = 50;
    const startY = 55;
    const controlX = 70;
    const controlY = 65;
    const endX = 100;
    const endY = 40;
    
    x = Math.pow(1-t, 2) * startX + 2 * (1-t) * t * controlX + Math.pow(t, 2) * endX;
    y = Math.pow(1-t, 2) * startY + 2 * (1-t) * t * controlY + Math.pow(t, 2) * endY;
  }
  
  return { x: x + '%', y: y + '%' };
}

function updateShipPosition() {
  const ship = document.getElementById('movingShip');
  if (!ship) return;
  
  // Медленное увеличение прогресса (полный путь за 180 секунд = 3 минуты)
  shipProgress += 0.00055; // 180 сек = 0.0055 за 10 сек / 10? примерно так
  
  if (shipProgress >= 1) {
    shipProgress = 0; // цикл, корабль начинает заново
  }
  
  const pos = getPathPoint(shipProgress);
  ship.style.left = pos.x;
  ship.style.top = pos.y;
  
  // Поворачиваем корабль по направлению движения (лёгкий наклон)
  const angle = -25 + (shipProgress * 20);
  ship.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
}

// Запуск анимации корабля выполняется динамически при открытии автопилота.

// ========== TACTICAL MAP (полноширинная карта) ==========
let tacMapT = 0;
let tacShipX = 0;
let tacSignalCut = false;
let tacTimerSeconds = 102 * 60 + 35; // 01:42:35

function drawTacMap() {
  const cv = document.getElementById('tacMap');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // Фон - тёмный с апельсиновым оттенком
  ctx.fillStyle = '#0d0600';
  ctx.fillRect(0, 0, W, H);

  // Текстурный шум
  for (let i = 0; i < W; i += 2) {
    ctx.fillStyle = `rgba(80, 30, 0, ${Math.random() * 0.04})`;
    ctx.fillRect(i, 0, 1, H);
  }

  // Континенты (силуэты)
  ctx.strokeStyle = 'rgba(180, 80, 10, 0.4)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(120, 45, 5, 0.2)';

  // Евразия
  ctx.beginPath();
  ctx.moveTo(W * 0.38, H * 0.12);
  ctx.bezierCurveTo(W * 0.5, H * 0.08, W * 0.72, H * 0.1, W * 0.85, H * 0.22);
  ctx.bezierCurveTo(W * 0.9, H * 0.3, W * 0.88, H * 0.45, W * 0.78, H * 0.5);
  ctx.bezierCurveTo(W * 0.65, H * 0.52, W * 0.55, H * 0.48, W * 0.48, H * 0.42);
  ctx.bezierCurveTo(W * 0.42, H * 0.38, W * 0.36, H * 0.28, W * 0.38, H * 0.12);
  ctx.fill();
  ctx.stroke();

  // Африка
  ctx.beginPath();
  ctx.moveTo(W * 0.44, H * 0.42);
  ctx.bezierCurveTo(W * 0.5, H * 0.4, W * 0.56, H * 0.44, W * 0.57, H * 0.55);
  ctx.bezierCurveTo(W * 0.58, H * 0.68, W * 0.54, H * 0.8, W * 0.48, H * 0.82);
  ctx.bezierCurveTo(W * 0.42, H * 0.82, W * 0.38, H * 0.7, W * 0.38, H * 0.58);
  ctx.bezierCurveTo(W * 0.37, H * 0.5, W * 0.4, H * 0.44, W * 0.44, H * 0.42);
  ctx.fill();
  ctx.stroke();

  // Америка
  ctx.beginPath();
  ctx.moveTo(W * 0.1, H * 0.1);
  ctx.bezierCurveTo(W * 0.2, H * 0.08, W * 0.28, H * 0.15, W * 0.26, H * 0.35);
  ctx.bezierCurveTo(W * 0.24, H * 0.5, W * 0.2, H * 0.6, W * 0.16, H * 0.75);
  ctx.bezierCurveTo(W * 0.12, H * 0.85, W * 0.08, H * 0.8, W * 0.07, H * 0.65);
  ctx.bezierCurveTo(W * 0.05, H * 0.45, W * 0.07, H * 0.25, W * 0.1, H * 0.1);
  ctx.fill();
  ctx.stroke();

  // Сетка координат
  ctx.strokeStyle = 'rgba(200, 80, 10, 0.25)';
  ctx.lineWidth = 0.5;
  const cols = 16, rows = 8;
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * (W / cols), 0);
    ctx.lineTo(x * (W / cols), H);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * (H / rows));
    ctx.lineTo(W, y * (H / rows));
    ctx.stroke();
  }

  // Подписи осей
  ctx.fillStyle = 'rgba(200, 100, 20, 0.55)';
  ctx.font = '9px "Share Tech Mono", monospace';
  const xLabels = ['20', '22', '24', '26', '28', '30', '32', '34'];
  for (let i = 0; i < xLabels.length; i++) {
    ctx.fillText(xLabels[i], (i + 1) * (W / cols), H - 4);
  }
  const yLabels = ['30N', '20N', '10N', 'EQ', '10S'];
  for (let i = 0; i < yLabels.length; i++) {
    ctx.fillText(yLabels[i], W - 28, (i + 1) * (H / 6));
  }

  if (!tacSignalCut) {
    // Траектория
    const trailStart = { x: W * 0.28, y: H * 0.32 };
    const shipPos = { x: W * 0.44 + tacShipX, y: H * 0.25 };
    const waypoint = { x: W * 0.72, y: H * 0.18 };

    // Пройденный путь (сплошная)
    ctx.strokeStyle = 'rgba(255, 140, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(trailStart.x, trailStart.y);
    ctx.lineTo(shipPos.x, shipPos.y);
    ctx.stroke();

    // Будущий путь (пунктир)
    ctx.strokeStyle = 'rgba(255, 180, 0, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(shipPos.x, shipPos.y);
    ctx.lineTo(waypoint.x, waypoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Waypoint маркер
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.9)';
    ctx.lineWidth = 1.5;
    const ws = 7;
    ctx.beginPath();
    ctx.moveTo(waypoint.x - ws, waypoint.y);
    ctx.lineTo(waypoint.x + ws, waypoint.y);
    ctx.moveTo(waypoint.x, waypoint.y - ws);
    ctx.lineTo(waypoint.x, waypoint.y + ws);
    ctx.stroke();
    ctx.strokeRect(waypoint.x - 4, waypoint.y - 4, 8, 8);

    // Кораблик
    const sx = shipPos.x, sy = shipPos.y;
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 9);
    ctx.lineTo(sx, sy + 9);
    ctx.moveTo(sx - 7, sy + 2);
    ctx.lineTo(sx + 7, sy + 2);
    ctx.moveTo(sx - 4, sy + 6);
    ctx.lineTo(sx + 4, sy + 6);
    ctx.stroke();

    // Свечение корабля
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 16);
    grad.addColorStop(0, 'rgba(255, 180, 0, 0.25)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, 16, 0, Math.PI * 2);
    ctx.fill();

    // Контакты на радаре
    const contacts = [
      { x: W * 0.6, y: H * 0.4, col: 'rgba(0, 136, 255, 0.8)' },
      { x: W * 0.3, y: H * 0.6, col: 'rgba(255, 200, 0, 0.7)' },
      { x: W * 0.8, y: H * 0.3, col: 'rgba(255, 34, 68, 0.8)' },
    ];
    contacts.forEach(c => {
      ctx.strokeStyle = c.col;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x, c.y, 6 + Math.sin(tacMapT * 0.05) * 2, 0, Math.PI * 2);
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  } else {
    // Потеря сигнала - затемнение и шум
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(255, 50, 0, ${Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 3 + 1, 1);
    }
  }

  tacMapT++;
}

// Движение корабля по траектории
setInterval(() => {
  if (!isActivePage('page-autopilot')) return;
  if (!tacSignalCut) {
    tacShipX += 0.08;
    if (tacShipX > 280) tacShipX = 0;
  }
}, 100);

// Таймер карты
setInterval(() => {
  if (!isActivePage('page-autopilot')) return;
  const timerEl = document.getElementById('map-timer');
  if (!timerEl) return;
  if (!tacSignalCut && tacTimerSeconds > 0) {
    tacTimerSeconds--;
    const h = Math.floor(tacTimerSeconds / 3600);
    const m = Math.floor((tacTimerSeconds % 3600) / 60);
    const s = tacTimerSeconds % 60;
    timerEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  // Глитч таймера
  if (Math.random() < 0.05 && !tacSignalCut) {
    const original = timerEl.textContent;
    timerEl.textContent = original.split('').map(c => Math.random() < 0.3 ? '█' : c).join('');
    setTimeout(() => { timerEl.textContent = original; }, 150);
  }
}, 1000);

// Функция потери сигнала (можно привязать к кнопке)
function tacCutSignal() {
  tacSignalCut = true;
  const lostEl = document.getElementById('tac-signal-lost');
  const statusEl = document.getElementById('tacSignalStatus');
  if (lostEl) lostEl.style.display = 'block';
  if (statusEl) {
    statusEl.innerHTML = 'SIGNAL LOST';
    statusEl.style.color = 'var(--red)';
  }
  setTimeout(() => {
    tacSignalCut = false;
    if (lostEl) lostEl.style.display = 'none';
    if (statusEl) {
      statusEl.innerHTML = 'SIGNAL ACTIVE';
      statusEl.style.color = '';
    }
  }, 4000);
}

// ========== VESSEL SCHEMATIC (СХЕМА КОРАБЛЯ) ==========
let shipAnimT = 0;

function drawShipSchema() {
  const cv = document.getElementById('shipSchema');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // Фон
  ctx.fillStyle = '#040d08';
  ctx.fillRect(0, 0, W, H);

  // Сетка
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.06)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const cx = W / 2, cy = H / 2 - 10;

  // Двигатель A (левый, рабочий)
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
  ctx.fillStyle = 'rgba(0, 255, 136, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 55, cy + 35);
  ctx.lineTo(cx - 75, cy + 50);
  ctx.lineTo(cx - 75, cy + 75);
  ctx.lineTo(cx - 55, cy + 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Свечение двигателя A
  const gradA = ctx.createRadialGradient(cx - 65, cy + 70, 0, cx - 65, cy + 70, 18);
  gradA.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
  gradA.addColorStop(1, 'transparent');
  ctx.fillStyle = gradA;
  ctx.beginPath();
  ctx.ellipse(cx - 65, cy + 72, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 255, 200, 0.9)';
  ctx.beginPath();
  ctx.ellipse(cx - 65, cy + 70, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Двигатель B (правый, сломанный)
  ctx.strokeStyle = 'rgba(255, 34, 68, 0.8)';
  ctx.fillStyle = 'rgba(255, 34, 68, 0.08)';
  ctx.beginPath();
  ctx.moveTo(cx + 55, cy + 35);
  ctx.lineTo(cx + 75, cy + 50);
  ctx.lineTo(cx + 75, cy + 75);
  ctx.lineTo(cx + 55, cy + 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Мерцающее свечение двигателя B (нестабильное)
  const flicker = 0.1 + Math.random() * 0.15;
  ctx.fillStyle = `rgba(255, 60, 0, ${flicker})`;
  ctx.beginPath();
  ctx.ellipse(cx + 65, cy + 72, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 80, 20, 0.6)';
  ctx.beginPath();
  ctx.ellipse(cx + 65, cy + 70, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Основной фюзеляж
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
  ctx.fillStyle = 'rgba(0, 20, 12, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 130); // нос
  ctx.bezierCurveTo(cx + 25, cy - 90, cx + 35, cy - 40, cx + 38, cy + 25);
  ctx.lineTo(cx + 38, cy + 60);
  ctx.lineTo(cx - 38, cy + 60);
  ctx.lineTo(cx - 38, cy + 25);
  ctx.bezierCurveTo(cx - 35, cy - 40, cx - 25, cy - 90, cx, cy - 130);
  ctx.fill();
  ctx.stroke();

  // Центральная полоса
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 128);
  ctx.lineTo(cx, cy + 60);
  ctx.stroke();

  // Крылья
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
  ctx.fillStyle = 'rgba(0, 15, 8, 0.8)';
  ctx.lineWidth = 1.5;

  // Левое крыло
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy + 15);
  ctx.lineTo(cx - 100, cy + 60);
  ctx.lineTo(cx - 95, cy + 85);
  ctx.lineTo(cx - 48, cy + 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Правое крыло
  ctx.beginPath();
  ctx.moveTo(cx + 35, cy + 15);
  ctx.lineTo(cx + 100, cy + 60);
  ctx.lineTo(cx + 95, cy + 85);
  ctx.lineTo(cx + 48, cy + 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Хвостовые стабилизаторы
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
  ctx.fillStyle = 'rgba(0, 10, 20, 0.7)';
  ctx.beginPath();
  ctx.moveTo(cx - 25, cy + 38);
  ctx.lineTo(cx - 60, cy + 38);
  ctx.lineTo(cx - 38, cy + 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 25, cy + 38);
  ctx.lineTo(cx + 60, cy + 38);
  ctx.lineTo(cx + 38, cy + 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Кабина пилота
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
  ctx.fillStyle = 'rgba(0, 40, 60, 0.8)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 118);
  ctx.bezierCurveTo(cx + 18, cy - 95, cx + 18, cy - 65, cx, cy - 58);
  ctx.bezierCurveTo(cx - 18, cy - 65, cx - 18, cy - 95, cx, cy - 118);
  ctx.fill();
  ctx.stroke();

  // Свечение кабины
  const cockpitGlow = ctx.createRadialGradient(cx, cy - 88, 0, cx, cy - 88, 22);
  cockpitGlow.addColorStop(0, 'rgba(0, 200, 255, 0.15)');
  cockpitGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = cockpitGlow;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 88, 16, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Узлы щитов
  const shieldNodes = [
    { x: cx, y: cy - 112, ok: true, label: 'NOSE' },
    { x: cx - 98, y: cy + 68, ok: true, label: 'L-WNG' },
    { x: cx + 98, y: cy + 68, ok: false, label: 'R-WNG' },
    { x: cx, y: cy + 58, ok: true, label: 'AFT' },
  ];
  shieldNodes.forEach(node => {
    const col = node.ok ? 'rgba(0, 255, 136, 0.9)' : 'rgba(255, 34, 68, 0.9)';
    ctx.strokeStyle = col;
    ctx.fillStyle = node.ok ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 34, 68, 0.15)';
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Пульсирующее кольцо
    ctx.beginPath();
    ctx.arc(node.x, node.y, 9 + Math.sin(shipAnimT * 0.08) * 2, 0, Math.PI * 2);
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Подпись
    ctx.fillStyle = col;
    ctx.font = '7px "Share Tech Mono", monospace';
    ctx.fillText(node.label, node.x + 8, node.y + 4);
  });

  // Надпись ERROR на двигателе B
  ctx.fillStyle = 'rgba(255, 34, 68, 0.9)';
  ctx.font = 'bold 8px "Share Tech Mono", monospace';
  ctx.fillText('ERR', cx + 52, cy + 42);

  // Метки двигателей
  ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
  ctx.font = '8px "Share Tech Mono", monospace';
  ctx.fillText('ENG_A', cx - 95, cy + 95);
  ctx.fillStyle = 'rgba(255, 34, 68, 0.6)';
  ctx.fillText('ENG_B [FAIL]', cx + 15, cy + 95);

  // Класс корабля
  ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
  ctx.font = '9px "Share Tech Mono", monospace';
  ctx.fillText('Pandemonium-04 // XN-09', 8, 18);

  // Сканирующая линия
  const scanY = (shipAnimT * 1.5) % H;
  ctx.fillStyle = 'rgba(0, 255, 136, 0.04)';
  ctx.fillRect(0, scanY, W, 2);

  shipAnimT++;
}

// Анимационный цикл для карты и схемы
let tacRafId = null;
function tacAnimLoop() {
  if (appState.visible && pageIsActive('page-autopilot')) {
    drawTacMap();
    drawShipSchema();
    tacRafId = requestAnimationFrame(tacAnimLoop);
  } else {
    tacRafId = null;
  }
}

if (pageIsActive('page-autopilot') && !tacRafId) tacAnimLoop();

// ========== ECG WAVEFORM ==========
let ecgPhase = 0, hrBeat = 113, stressLevel = 0.42;

function drawECG() {
  const cv = document.getElementById('ecgCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  
  // scroll: shift left
  const img = ctx.getImageData(1, 0, W - 1, H);
  ctx.putImageData(img, 0, 0);
  ctx.clearRect(W - 1, 0, 1, H);
  
  // draw next ECG sample
  const x = W - 1, midY = H / 2;
  const p = ecgPhase % (Math.PI * 2 / (hrBeat / 60) * 60);
  let y = midY;
  const norm = p / (Math.PI * 2 / (hrBeat / 60) * 60);
  if (norm < 0.1) y = midY - 2;
  else if (norm < 0.15) y = midY - H * 0.35;
  else if (norm < 0.2) y = midY + H * 0.2;
  else if (norm < 0.25) y = midY - H * 0.6;
  else if (norm < 0.3) y = midY + H * 0.08;
  else if (norm < 0.35) y = midY - H * 0.15;
  else if (norm < 0.4) y = midY;
  else y = midY + Math.sin(norm * 20) * 1.5;
  
  y += (Math.random() - 0.5) * 2;
  ctx.strokeStyle = 'rgba(255,160,0,0.95)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(255,120,0,0.7)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.moveTo(x - 1, midY);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ecgPhase += 0.15;
}

// ========== STRESS GAUGE ==========
let stressAnim = 0.42;

function drawStress() {
  const cv = document.getElementById('stressGauge');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  
  const segs = [
    { col: 'rgba(0,255,136,0.3)', end: 0.33 },
    { col: 'rgba(255,204,0,0.35)', end: 0.66 },
    { col: 'rgba(255,100,0,0.35)', end: 0.85 },
    { col: 'rgba(255,34,68,0.4)', end: 1 },
  ];
  let prev = 0;
  segs.forEach(s => {
    ctx.fillStyle = s.col;
    ctx.fillRect(prev * W, 0, (s.end - prev) * W, H);
    prev = s.end;
  });
  
  stressAnim += (stressLevel - stressAnim) * 0.03;
  const fillW = stressAnim * W;
  const grd = ctx.createLinearGradient(0, 0, fillW, 0);
grd.addColorStop(0, 'rgba(0,255,136,0.9)');
  grd.addColorStop(0.5, 'rgba(255,204,0,0.9)');
  grd.addColorStop(1, 'rgba(255,60,0,0.9)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, fillW, H);
  
  ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.2})`;
  ctx.fillRect(fillW - 1, 0, 2, H);
  
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  [0.33, 0.66, 0.85].forEach(t => { ctx.fillRect(t * W - 0.5, 0, 1, H); });
  
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(fillW + 2, 2, 28, H - 4);
  ctx.fillStyle = 'rgba(255,190,0,0.95)';
  ctx.font = `${H - 4}px "SMAILY","Share Tech Mono",monospace`;
  ctx.fillText(Math.round(stressAnim * 100) + '%', fillW + 4, H - 2);
}

// ========== G-FORCE DIAL ==========
let gforceCurrent = 1.3, gforceTarget = 1.3;

function drawGforceDial() {
  const cv = document.getElementById('gforceDial');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2, r = W / 2 - 8;
  ctx.clearRect(0, 0, W, H);
  
  ctx.strokeStyle = 'rgba(0,255,136,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  
  const zones = [
    { from: 0, to: 0.33, col: 'rgba(0,255,136,0.25)' },
    { from: 0.33, to: 0.55, col: 'rgba(255,204,0,0.3)' },
    { from: 0.55, to: 0.7, col: 'rgba(255,100,0,0.35)' },
    { from: 0.7, to: 1, col: 'rgba(255,34,68,0.4)' },
  ];
  const startA = -Math.PI * 0.8, sweepA = Math.PI * 1.6;
  zones.forEach(z => {
    ctx.strokeStyle = z.col;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 4, startA + z.from * sweepA, startA + z.to * sweepA);
    ctx.stroke();
  });
  
  ctx.fillStyle = 'rgba(0,255,136,0.5)';
  ctx.font = '7px "Share Tech Mono",monospace';
  const maxG = 9.0;
  [0, 2, 4, 6, 8, 9].forEach(g => {
    const t = g / maxG;
    const a = startA + t * sweepA;
    const ix = cx + Math.cos(a) * (r - 14);
    const iy = cy + Math.sin(a) * (r - 14);
    ctx.fillText(g, ix - 4, iy + 3);
    ctx.strokeStyle = 'rgba(0,255,136,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20));
    ctx.lineTo(cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10));
    ctx.stroke();
  });
  
  gforceCurrent += (gforceTarget - gforceCurrent) * 0.04;
  const needleT = Math.min(gforceCurrent / maxG, 1);
  const na = startA + needleT * sweepA;
  const col = gforceCurrent > 7 ? 'rgba(255,34,68,0.95)' : (gforceCurrent > 4 ? 'rgba(255,204,0,0.95)' : 'rgba(0,255,136,0.95)');
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.shadowColor = col;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(na) * (r - 18), cy + Math.sin(na) * (r - 18));
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = col;
  ctx.font = 'bold 14px "Share Tech Mono",monospace';
  ctx.textAlign = 'center';
  ctx.fillText(gforceCurrent.toFixed(1) + 'g', cx, cy + 22);
  ctx.textAlign = 'left';
  
  const gw = document.getElementById('g-warn');
  const gv = document.getElementById('gf-val');
  if (gw) gw.style.display = gforceCurrent > 7 ? 'block' : 'none';
  if (gv) {
    gv.textContent = gforceCurrent.toFixed(1) + 'g';
    gv.style.color = gforceCurrent > 7 ? 'var(--red)' : (gforceCurrent > 4 ? 'var(--yellow)' : 'var(--g)');
  }
}

// ========== ARTIFICIAL HORIZON ==========
let pitchAngle = 2.1, rollAngle = -0.4, pitchTarget = 2.1, rollTarget = -0.4;

function drawHorizon() {
  const cv = document.getElementById('horizCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2, r = W / 2 - 6;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  
  pitchAngle += (pitchTarget - pitchAngle) * 0.05;
  rollAngle += (rollTarget - rollAngle) * 0.05;
  const rollRad = rollAngle * Math.PI / 180;
  const pitchPx = pitchAngle * (r / 30);
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rollRad);
  
  ctx.fillStyle = 'rgba(0,20,40,0.95)';
  ctx.fillRect(-r, -r - pitchPx, r * 2, r * 2);
  ctx.fillStyle = 'rgba(30,15,0,0.95)';
  ctx.fillRect(-r, -pitchPx, r * 2, r * 2);
  
  ctx.strokeStyle = 'rgba(255,200,0,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-r, -pitchPx);
  ctx.lineTo(r, -pitchPx);
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(255,200,0,0.3)';
  ctx.lineWidth = 1;
  ctx.font = '7px "Share Tech Mono",monospace';
  ctx.fillStyle = 'rgba(255,200,0,0.4)';
  [-10, -5, 5, 10].forEach(deg => {
    const py = -pitchPx + deg * (r / 30);
    const lw = deg % 10 === 0 ? 20 : 12;
    ctx.beginPath();
    ctx.moveTo(-lw, py);
    ctx.lineTo(lw, py);
    ctx.stroke();
    if (deg % 10 === 0) ctx.fillText(Math.abs(deg), -lw - 16, py + 3);
  });
  ctx.restore();
  
  ctx.strokeStyle = 'rgba(0,255,136,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy);
  ctx.lineTo(cx - 6, cy);
  ctx.moveTo(cx + 6, cy);
  ctx.lineTo(cx + 20, cy);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - 8);
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(0,255,136,0.9)';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  ctx.strokeStyle = 'rgba(0,255,136,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  
  const rollTickA = -Math.PI / 2 + rollAngle * Math.PI / 180;
  ctx.strokeStyle = 'rgba(255,200,0,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(rollTickA) * (r - 3), cy + Math.sin(rollTickA) * (r - 3));
  ctx.lineTo(cx + Math.cos(rollTickA) * (r + 3), cy + Math.sin(rollTickA) * (r + 3));
  ctx.stroke();
  
  const pv = document.getElementById('pitch-val');
  const rv = document.getElementById('roll-val');
  if (pv) pv.textContent = (pitchAngle > 0 ? '+' : '') + pitchAngle.toFixed(1) + '°';
  if (rv) rv.textContent = (rollAngle > 0 ? '+' : '') + rollAngle.toFixed(1) + '°';
}

// ========== JOYSTICK ==========
let joyDragging = false, joyX = 0, joyY = 0, joyTX = 0, joyTY = 0;

function joystickStart(e) {
  joyDragging = true;
  joystickMove(e);
}

function joystickEnd() {
  joyDragging = false;
  joyTX = 0;
  joyTY = 0;
}

function joystickMove(e) {
  if (!joyDragging) return;
  const cv = document.getElementById('joystick');
  if (!cv) return;
  const rect = cv.getBoundingClientRect();
  const dx = (e.clientX - rect.left) - rect.width / 2;
  const dy = (e.clientY - rect.top) - rect.height / 2;
  const maxR = rect.width / 2 - 16;
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxR);
  const ang = Math.atan2(dy, dx);
  joyTX = Math.cos(ang) * dist / maxR;
  joyTY = Math.sin(ang) * dist / maxR;
}

function drawJoystick() {
  const cv = document.getElementById('joystick');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  
  joyX += (joyTX - joyX) * 0.15;
  joyY += (joyTY - joyY) * 0.15;
  
  ctx.strokeStyle = 'rgba(0,255,136,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(0,255,136,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.stroke();
  
  const maxR = cx - 12;
  ctx.strokeStyle = 'rgba(0,255,136,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.stroke();
  
  if (Math.abs(joyX) > 0.02 || Math.abs(joyY) > 0.02) {
    ctx.strokeStyle = 'rgba(0,255,136,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + joyX * maxR, cy + joyY * maxR);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  const sx = cx + joyX * maxR, sy = cy + joyY * maxR;
  const col = Math.sqrt(joyX * joyX + joyY * joyY) > 0.7 ? 'rgba(255,204,0,0.9)' : 'rgba(0,255,136,0.9)';
  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(sx, sy, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0,255,136,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(sx, sy, 12, 0, Math.PI * 2);
  ctx.stroke();
  
  const jxEl = document.getElementById('joy-x');
  const jyEl = document.getElementById('joy-y');
  if (jxEl) jxEl.textContent = (joyX >= 0 ? '+' : '') + joyX.toFixed(2);
  if (jyEl) jyEl.textContent = (joyY >= 0 ? '+' : '') + joyY.toFixed(2);
  
  pitchTarget = 2.1 - joyY * 8;
  rollTarget = -0.4 + joyX * 12;
  gforceTarget = 1.3 + Math.sqrt(joyX * joyX + joyY * joyY) * 3;
}

// ========== FLIGHT CONTROL BUTTONS ==========
function fireCtrl(action) {
  const fb = document.getElementById('ctrl-feedback');
  const msgs = {
    'BOOST': '> ENGINE BOOST: +12% thrust — 3.2 second burn initiated',
    'BRAKE': '> RETROBURN: decelerating — ETA correction +0:00:08',
    'ROLL-L': '> ROLLING LEFT: -15° — gyro compensating',
    'ROLL-R': '> ROLLING RIGHT: +15° — gyro compensating',
    'SHIELDS': '> SHIELD RECHARGE: redirecting power — shields 63%→71%... charging',
    'EJECT': '> EJECT: CONFIRM? — HOLD 3 SECONDS TO CONFIRM EJECTION SEQUENCE',
  };
  if (fb) fb.innerHTML = `<span style="color:var(--g)">${msgs[action] || '> Command executed'}</span><span class="cursor" style="margin-left:4px"></span>`;
  
  if (action === 'BOOST') { gforceTarget += 1.5; setTimeout(() => { gforceTarget = 1.3; }, 3000); }
  if (action === 'BRAKE') { gforceTarget = Math.max(0.5, gforceTarget - 0.8); setTimeout(() => { gforceTarget = 1.3; }, 2000); }
  if (action === 'ROLL-L') { rollTarget -= 15; setTimeout(() => { rollTarget = -0.4; }, 2500); }
  if (action === 'ROLL-R') { rollTarget += 15; setTimeout(() => { rollTarget = -0.4; }, 2500); }
  if (action === 'SHIELDS') { stressLevel = Math.max(0.2, stressLevel - 0.1); }
  if (action === 'EJECT') { stressLevel = Math.min(1, stressLevel + 0.3); }
}

function updateThrust(eng, val) {
  const el = document.getElementById('thr' + eng + '-val');
  if (el) el.textContent = Math.round(val) + '%';
  if (eng === 'A') { gforceTarget = 0.8 + val / 100 * 1.5; }
}

// ========== BIOMETRIC FLUCTUATIONS ==========
setInterval(() => {
  hrBeat = 113 + Math.round((Math.random() - 0.5) * 6);
  const hrEl = document.getElementById('hr-val');
  if (hrEl) hrEl.textContent = hrBeat + ' bpm';
  
  stressLevel = Math.max(0.2, Math.min(0.95, stressLevel + (Math.random() - 0.48) * 0.02));
  
  const cortEl = document.getElementById('cort-val');
  if (cortEl) {
    const lvls = ['LOW', 'MED ↑', 'MED', 'HIGH ↑'];
    cortEl.textContent = stressLevel < 0.35 ? lvls[0] : (stressLevel < 0.6 ? lvls[1] : (stressLevel < 0.8 ? lvls[2] : lvls[3]));
  }
  
  const radEl = document.getElementById('rad-val');
  if (radEl) radEl.textContent = (2.2 + Math.random() * 0.6).toFixed(1) + ' μSv/h';
  
  const axEl = document.getElementById('ax-val');
  const ayEl = document.getElementById('ay-val');
  if (axEl) axEl.textContent = (joyX * 2 + (Math.random() - 0.5) * 0.05 > 0 ? '+' : '') + ((joyX * 2 + (Math.random() - 0.5) * 0.05).toFixed(2)) + ' m/s²';
  if (ayEl) ayEl.textContent = (joyY * (-1.5) + (Math.random() - 0.5) * 0.05 > 0 ? '+' : '') + ((joyY * (-1.5) + (Math.random() - 0.5) * 0.05).toFixed(2)) + ' m/s²';
}, 1400);

// ========== АНИМАЦИОННЫЙ ЦИКЛ ==========
function apAnimLoop() {
  if (appState.visible && pageIsActive('page-autopilot')) {
    drawECG();
    drawStress();
    drawGforceDial();
    drawHorizon();
    drawJoystick();
    drawVoiceWave();
    drawEnvRings();
    drawSmileWave();
    requestAnimationFrame(apAnimLoop);
  } else {
    apAnimRunning = false;
  }
}

function startApAnimLoop() {
  if (apAnimRunning) return;
  apAnimRunning = true;
  apAnimLoop();
}

if (pageIsActive('page-autopilot')) startApAnimLoop();

// ========== EMERGENCY ACTIONS ==========
function emergencyAction(type) {
  const out = document.getElementById('emerg-out');
  const msgs = {
    'MAYDAY': '> MAYDAY broadcast sent on 121.5MHz — awaiting response from CTRL-7...',
    'PURGE': '> Memory sector 7 purge initiated — WARNING: some SOCA functions will be lost',
    'LOCKDOWN': '> Lockdown engaged — restricting all non-essential systems — hull secured',
  };
  if (out) {
    out.innerHTML = `<span style="color:var(--yellow)">${msgs[type]}</span>`;
    out.style.animation = 'glitch1 0.3s';
    setTimeout(() => { out.style.animation = ''; }, 300);
  }
  if (type === 'MAYDAY') { stressLevel = Math.min(0.9, stressLevel + 0.15); }
  if (type === 'PURGE') { stressLevel = Math.max(0.2, stressLevel - 0.2); }
  if (type === 'LOCKDOWN') { stressLevel = Math.min(0.85, stressLevel + 0.1); }
  
  // Добавляем в лог автопилота
  addAPLog(msgs[type], 'warn');
}

function toggleProto(id) {
  // Визуальный эффект при клике на протокол
  const proto = document.getElementById('proto-' + id);
  if (proto) {
    proto.style.animation = 'glitch1 0.2s';
    setTimeout(() => { proto.style.animation = ''; }, 200);
  }
  addAPLog(`Protocol ${id.toUpperCase()} status checked`, 'info');
}

// ========== ENVIRONMENT RINGS ==========
let envT = 0;

function drawEnvRings() {
  const cv = document.getElementById('envRings');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  
  const metrics = [
    { val: 0.96, col: 'rgba(0,255,136,0.8)', lbl: 'O2', r: 62 },
    { val: 0.44, col: 'rgba(0,136,255,0.8)', lbl: 'H2O', r: 50 },
    { val: 0.73, col: 'rgba(255,204,0,0.7)', lbl: 'PRES', r: 38 },
    { val: 0.27, col: 'rgba(255,80,0,0.75)', lbl: 'RAD', r: 26 },
  ];
  
  metrics.forEach(m => {
    // фон кольца
    ctx.strokeStyle = m.col.replace('0.8', '0.1').replace('0.7', '0.1').replace('0.75', '0.1');
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, m.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2);
    ctx.stroke();
    
    // значение с пульсацией
    const pulse = m.val + (Math.sin(envT * 0.05 + m.r) * 0.01);
    ctx.strokeStyle = m.col;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, m.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(pulse, 1));
    ctx.stroke();
    
    // метка в конце дуги
    const endA = -Math.PI / 2 + Math.PI * 2 * Math.min(pulse, 1);
    ctx.fillStyle = m.col;
    ctx.font = '8px "Share Tech Mono",monospace';
    ctx.fillText(m.lbl, cx + Math.cos(endA) * (m.r + 6) - 6, cy + Math.sin(endA) * (m.r + 6) + 3);
  });
  
  // центр
  ctx.fillStyle = 'rgba(0,255,136,0.7)';
  ctx.font = 'bold 11px "Share Tech Mono",monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LIFE', cx, cy - 4);
  ctx.fillText('SYS', cx, cy + 8);
  ctx.textAlign = 'left';
  
  envT++;
}

// ========== VOICE WAVEFORM ==========
let voicePhase = 0;
let voiceActive = true;

function drawVoiceWave() {
  const cv = document.getElementById('voiceWave');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(0,136,255,0.8)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(0,200,255,0.5)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const t = x / W;
    const amp = voiceActive ? (H / 2 * 0.7) : (H / 2 * 0.1 + Math.random() * 3);
    const y = H / 2 + Math.sin(t * 40 + voicePhase) * amp * Math.sin(t * Math.PI)
             + Math.sin(t * 80 + voicePhase * 1.3) * amp * 0.3
             + (Math.random() - 0.5) * 3;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  voicePhase += 0.18;
}

// Флуктуации радиации
setInterval(() => {
  const radEl = document.getElementById('rad-val');
  if (radEl && document.getElementById('page-autopilot').classList.contains('active')) {
    radEl.textContent = (2.0 + Math.random() * 1.2).toFixed(1) + ' μSv/h';
  }
}, 4000);

// ========== VOICE CHAT HANDLER ==========
const socaResponses = {
  'status': 'Hull 87%. Engine B critical - 41%. Memory sector 7 quarantined. Autopilot semi-manual.',
  'engage': 'Engaging autopilot... WARNING: response latency 240ms. Partial control only.',
  'emergency': 'MAYDAY protocol initiated. Distress beacon active.. Stand by.',
  'override': 'Manual override confirmed. You now have full flight authority.',
  'report': 'Current position: sector 02, 148km from waypoint Delta. ETA 2 minutes.',
  'engine': 'Engine A nominal at 100%. Engine B misfire - fault code ERR 0x3F - 41% thrust.',
  'radar': 'Three contacts on proximity scan. One unknown, one debris field, one unidentified.',
  'hello': 'Pilot, i am here. Systems nominal... mostly.'
};


function submitVoice() {
  const inp = document.getElementById('voice-input');
  const log = document.getElementById('voice-log');
  if (!inp || !log) return;
  const txt = inp.value.trim().toLowerCase();
  if (!txt) return;
  inp.value = '';

  // Добавляем сообщение пилота
  const pl = document.createElement('div');
  pl.style.marginTop = '6px';
  pl.innerHTML = `<span style="color:var(--dim)">PILOT:</span> <span style="color:var(--g2)">${txt}</span>`;
  log.appendChild(pl);

  // SOCA отвечает
  setTimeout(() => {
    voiceActive = true;
    let resp = null;
    for (const [k, v] of Object.entries(socaResponses)) {
      if (txt.includes(k)) { resp = v; break; }
    }
    if (!resp) {
      const fallbacks = [
        `I am trying to process "${txt}"... my memory module is fragmented.`,
        `Command received: "${txt}". Processing... ERROR. Partial data only.`,
        `"${txt}" — I understand. But sector 7 corruption prevents full response.`,
      ];
      resp = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    const sl = document.createElement('div');
    const isGlitchy = Math.random() < 0.3;
    sl.innerHTML = `<span style="color:var(--b)">SOCA:</span> <span style="color:var(--g);${isGlitchy ? 'animation:glitch3 2s infinite' : ''}">${resp}</span>`;
    log.appendChild(sl);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => { voiceActive = Math.random() > 0.3; }, 2000);
  }, 600 + Math.random() * 800);
  log.scrollTop = log.scrollHeight;
}

// ========== SMILE VOICE INTERFACE ==========
let smileWaveActive = false;
let smileWavePhase = 0;

function drawSmileWave() {
  const cv = document.getElementById('smileWave');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  ctx.fillStyle = 'rgba(5,2,0,0.3)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,150,0,0.85)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(255,120,0,0.5)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const t = x / W;
    const amp = smileWaveActive ? (H / 2 * 0.65) : (H / 2 * 0.08 + Math.random() * 2);
    const y = H / 2
      + Math.sin(t * 36 + smileWavePhase) * amp * Math.sin(t * Math.PI)
      + Math.sin(t * 70 + smileWavePhase * 1.2) * amp * 0.25
      + (Math.random() - 0.5) * 2;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  smileWavePhase += 0.14;
}

const smileResponses = {
  'health':     'Pilot health nominal! Heart rate slightly elevated. Probably from reading SOCA\'s error logs. Understandable.',
  'stress':     'Stress index: MEDIUM. Recommend 5 min break, hydration, and possibly one of my games. Just saying.',
  'meds':       'All medications administered on schedule. You\'re welcome. I added a small mood booster. You\'ll never notice.',
  'how are you':'Operational! Enthusiastic! Slightly concerned about Engine B but that\'s SOCA\'s department. I\'m GREAT!!',
  'status':     'Biometrics stable. O2 at 94% — a little low but fine. I\'m watching, in a medical way!',
  'tired':      'Fatigue detected! I recommend sleep. Or at least close your eyes for 10 minutes. I\'ll keep the ship alive!',
  'pain':       'Pain reported, logging now. If this continues please don\'t try to fix it yourself. That\'s literally my job!',
  'hello':      'HELLO! Hi! Hey! Good to hear from you! Everything looks good! Mostly! How are YOU doing?!',
  'help':       'I AM help. Medical AI, fully operational, suspiciously cheerful. What do you need?',
  'soca':       'SOCA is... fine.,, functional? I checked her logs, she\'s fine, we\'re fine. Everything is fine!',
  'game':       'OH. You want to play? I have SEVERAL options: BIO SWEEP, CARDIAC SYNC, MEMORY SCAN. Please! I made them for you!!',
  'bored':      'BORED?! I have GAMES!!! Medical-themed games, extremely fun games! Come ON!',
  'emergency':  'EMERGENCY PROTOCOL ACTIVE. Vitals monitoring intensified. I\'m here, breathe, i\'ve got you!',
};

const smileFallbacks = [
  (txt) => `"${txt}" — noted! Filed under "things the pilot said." Very important file.`,
  (txt) => `Processing "${txt}"... done! I have no idea what that means but I support you.`,
  (txt) => `"${txt}"? Interesting. My medical database has no entry for that.. Yet.`,
  (txt) => `I heard "${txt}". Running diagnostics... you seem fine! Emotionally unclear, but fine.`,
];

function submitSmile() {
  const inp = document.getElementById('smile-input');
  const log = document.getElementById('smile-log');
  if (!inp || !log) return;
  const txt = inp.value.trim().toLowerCase();
  if (!txt) return;
  inp.value = '';

  // Pilot message
  const pl = document.createElement('div');
  pl.style.marginTop = '5px';
  pl.innerHTML = `<span style="color:#554400">PILOT:</span> <span style="color:#886600">${txt}</span>`;
  log.appendChild(pl);
  log.scrollTop = log.scrollHeight;

  // SMILE replies - faster than SOCA, more enthusiastic
  setTimeout(() => {
    smileWaveActive = true;
    let resp = null;
    for (const [k, v] of Object.entries(smileResponses)) {
      if (txt.includes(k)) { resp = v; break; }
    }
    if (!resp) {
      resp = smileFallbacks[Math.floor(Math.random() * smileFallbacks.length)](txt);
    }
    const sl = document.createElement('div');
    sl.style.marginTop = '3px';
    sl.innerHTML = `<span style="color:#ffaa00;font-family:'SMAILY','Share Tech Mono',monospace">SMILE:</span> <span style="color:#cc8800">${resp}</span>`;
    log.appendChild(sl);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => { smileWaveActive = false; }, 1800);
  }, 300 + Math.random() * 400);
}

      // ╔══════════════════════════════════════════════════════╗ 
      // ║ NAV CORE  ║
      // ╚══════════════════════════════════════════════════════╝ 
let smAngleX=0.4, smAngleY=0.2, smZoomVal=1.0, smDragging=false, smLastX=0, smLastY=0;
let smShipT=0, selectedObj=null;
let smFilters={wp:true,st:true,ast:true,unk:true,grid:true,route:true};

const smObjects=[
  {id:'SHIP', type:'ship',x:0,   y:0,   z:0,   col:'#00ffcc',r:6,  label:'PANDEMONIUM-04 [YOU]',   info:'Your vessel. Class-IX. Hull 87%. Engine B degraded.'},
  {id:'WPA',  type:'wp',  x:-180,y:20,  z:-60, col:'#00ff88',r:5,  label:'WP ALPHA',        info:'Waypoint Alpha — Sector 01. STATUS: COMPLETED.'},
  {id:'WPD',  type:'wp',  x:120, y:-30, z:40,  col:'#00ff88',r:7,  label:'▶ WP DELTA',      info:'Waypoint Delta — CURRENT TARGET. ETA: 2min 14s. Distance: 148km.'},
  {id:'WPE',  type:'wp',  x:280, y:-80, z:100, col:'#44aa66',r:5,  label:'WP ECHO',         info:'Waypoint Echo — Orbit insertion. PENDING.'},
  {id:'ST1',  type:'st',  x:320, y:40,  z:-120,col:'#0088ff',r:9,  label:'STATION KEPLER',  info:'Kepler Station — Class II resupply depot. FRIENDLY. Docking available.'},
  {id:'ST2',  type:'st',  x:-260,y:-60, z:80,  col:'#0066cc',r:7,  label:'RELAY NODE 4',    info:'Communications relay Node 4. OFFLINE — damaged by debris impact.'},
  {id:'AST1', type:'ast', x:60,  y:80,  z:-90, col:'#ffcc00',r:4,  label:'ASTEROID 7-C',    info:'Asteroid cluster 7-C. Mass: ~2.4MT. Trajectory: stable. Collision risk: 0%.'},
  {id:'AST2', type:'ast', x:-40, y:-120,z:50,  col:'#ffaa00',r:5,  label:'DEBRIS FIELD',    info:'Debris field — origin unknown. Density: moderate. Recommend 12° avoidance.'},
  {id:'AST3', type:'ast', x:200, y:100, z:30,  col:'#ff8800',r:3,  label:'ASTEROID 12-F',   info:'Asteroid 12-F. Small carbonaceous body. No risk.'},
  {id:'UNK1', type:'unk', x:190, y:-40, z:-80, col:'#ff2244',r:6,  label:'??? UNIDENTIFIED',info:'CLASSIFICATION FAILED. No IFF. Heading: intercept. THREAT: HIGH. Evasive action recommended.'},
  {id:'GRAV', type:'ast', x:-90, y:30,  z:-140,col:'#ffcc00',r:4,  label:'GRAV. EDDY',      info:'Gravitational micro-anomaly. Trajectory deviation ±0.8°.'},
  {id:'EM',   type:'st',  x:30,  y:-60, z:110, col:'#0088ff',r:3,  label:'EM ZONE',         info:'Electromagnetic interference zone. Comms degraded within 50km radius.'},
  {id:'STAR1',type:'star', x:400, y:200, z:300, col:'#ffffff',r:12, label:'PROXIMA CENTAURI',info:'Primary navigation star. Distance: 4.24 light-years. Navigation reference A.'},
  {id:'STAR2',type:'star', x:-350,y:-180,z:250, col:'#aaccff',r:8,  label:'ALPHA CENTAURI', info:'Binary star system. Navigation reference B.'},
];

// Stars background
const smStars=[];
for(let i=0;i<280;i++) smStars.push({x:(Math.random()-0.5)*2000,y:(Math.random()-0.5)*2000,z:(Math.random()-0.5)*2000,b:Math.random()});

let smAnimActive=false;
function initStarmap(){
  buildCatalogue();
  if(!smAnimActive){ smAnimActive=true; drawStarmap(); }
  startTrajLoop();
  startScanLoop();
}

function project3D(px,py,pz,W,H){
  const cosX=Math.cos(smAngleX),sinX=Math.sin(smAngleX);
  const cosY=Math.cos(smAngleY),sinY=Math.sin(smAngleY);
  let x=px*cosY+pz*sinY, z=-px*sinY+pz*cosY;
  let y=py*cosX-z*sinX; z=py*sinX+z*cosX;
  const fov=600*smZoomVal, dz=fov/(fov+z+400);
  return {sx:W/2+x*dz, sy:H/2+y*dz, scale:dz, z:z};
}

function smToggleFilter(id) {
  const cb  = document.getElementById(id);
  const btn = document.getElementById('btn-' + id);
  if (!cb || !btn) return;
  cb.checked = !cb.checked;
  const on = cb.checked;
  // Визуальное состояние кнопки
  if (on) {
    btn.style.opacity = '1';
    btn.style.filter  = 'none';
  } else {
    btn.style.opacity = '0.3';
    btn.style.filter  = 'grayscale(1)';
  }
  smFilter();
}

function smFilter(){
  smFilters.wp   = document.getElementById('flt-wp')?.checked ?? true;
  smFilters.st   = document.getElementById('flt-st')?.checked ?? true;
  smFilters.ast  = document.getElementById('flt-ast')?.checked ?? true;
  smFilters.unk  = document.getElementById('flt-unk')?.checked ?? true;
  smFilters.grid = document.getElementById('flt-grid')?.checked ?? true;
  smFilters.route= document.getElementById('flt-route')?.checked ?? true;
}

function drawStarmap(){
  const cv=document.getElementById('starmap');
  if(!cv){ smAnimActive=false; return; }
  if(!appState.visible || !document.getElementById('page-navcore')?.classList.contains('active')){
    smAnimActive=false; return;
  }
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.fillStyle='#020a05'; ctx.fillRect(0,0,W,H);
  if(!smDragging){ smAngleY+=0.003; smShipT+=0.008; }

  // Background stars
  smStars.forEach(s=>{
    const p=project3D(s.x,s.y,s.z,W,H);
    if(p.scale>0){
      const sz=Math.max(0.3,p.scale*1.5), alpha=Math.min(1,p.scale*s.b*1.5);
      ctx.fillStyle=`rgba(180,220,200,${alpha*0.7})`;
      ctx.beginPath();ctx.arc(p.sx,p.sy,sz,0,Math.PI*2);ctx.fill();
    }
  });

  // Grid planes
  if(smFilters.grid){
    ctx.strokeStyle='rgba(0,255,136,0.06)'; ctx.lineWidth=0.5;
    const step=80, range=400;
    for(let i=-range;i<=range;i+=step){
      const a=project3D(i,-2,range,W,H), b=project3D(i,-2,-range,W,H);
      const c=project3D(range,-2,i,W,H), d=project3D(-range,-2,i,W,H);
      ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(c.sx,c.sy);ctx.lineTo(d.sx,d.sy);ctx.stroke();
    }
  }

  // Route path
  if(smFilters.route){
    const wps=[smObjects.find(o=>o.id==='WPA'),smObjects.find(o=>o.id==='SHIP'),smObjects.find(o=>o.id==='WPD'),smObjects.find(o=>o.id==='WPE')];
    for(let i=0;i<wps.length-1;i++){
      const pa=project3D(wps[i].x,wps[i].y,wps[i].z,W,H);
      const pb=project3D(wps[i+1].x,wps[i+1].y,wps[i+1].z,W,H);
      ctx.strokeStyle=i<1?'rgba(0,255,136,0.35)':'rgba(0,255,136,0.15)';
      ctx.lineWidth=1; ctx.setLineDash(i>=1?[4,6]:[]);
      ctx.beginPath();ctx.moveTo(pa.sx,pa.sy);ctx.lineTo(pb.sx,pb.sy);ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Sort and draw objects
  const projected=smObjects.map(o=>{
    const p=project3D(o.x,o.y,o.z,W,H);
    return {...o,...p};
  }).sort((a,b)=>b.z-a.z);

  projected.forEach(o=>{
    if(o.type==='wp'   && !smFilters.wp)  return;
    if(o.type==='st'   && !smFilters.st)  return;
    if(o.type==='ast'  && !smFilters.ast) return;
    if(o.type==='unk'  && !smFilters.unk) return;
    const r=o.r*o.scale;
    if(r<0.5||o.sx<-30||o.sx>W+30||o.sy<-30||o.sy>H+30) return;

    // Glow halo
    const grad=ctx.createRadialGradient(o.sx,o.sy,0,o.sx,o.sy,r*3);
    grad.addColorStop(0,o.col+'44'); grad.addColorStop(1,'transparent');
    ctx.fillStyle=grad; ctx.beginPath();ctx.arc(o.sx,o.sy,r*3,0,Math.PI*2);ctx.fill();

    // Body
    ctx.fillStyle=o.col+(selectedObj&&selectedObj.id===o.id?'ff':'cc');
    ctx.shadowColor=o.col; ctx.shadowBlur=r*2;
    ctx.beginPath();ctx.arc(o.sx,o.sy,r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;

    // Selection ring
    if(selectedObj&&selectedObj.id===o.id){
      ctx.strokeStyle=o.col; ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(o.sx,o.sy,r+5+Math.sin(smShipT*2)*2,0,Math.PI*2);ctx.stroke();
    }

    // Ship pulse
    if(o.type==='ship'){
      ctx.strokeStyle='rgba(0,255,200,0.35)'; ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(o.sx,o.sy,r+8+Math.sin(smShipT)*4,0,Math.PI*2);ctx.stroke();
    }
    // Unknown danger ring
    if(o.type==='unk'){
      ctx.strokeStyle=`rgba(255,34,68,${0.3+Math.sin(smShipT*3)*0.3})`; ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(o.sx,o.sy,r+10+Math.sin(smShipT*2)*5,0,Math.PI*2);ctx.stroke();
    }

    // Label
    ctx.fillStyle=o.col+'bb';
    ctx.font=`${Math.max(8,Math.min(11,r*1.8))}px "Share Tech Mono",monospace`;
    ctx.fillText(o.label, o.sx+r+4, o.sy+3);

    // Depth line to grid
    if(smFilters.grid && o.type!=='star'){
      const base=project3D(o.x,-2,o.z,W,H);
      ctx.strokeStyle='rgba(0,255,136,0.07)'; ctx.lineWidth=0.5; ctx.setLineDash([2,4]);
      ctx.beginPath();ctx.moveTo(o.sx,o.sy);ctx.lineTo(base.sx,base.sy);ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Coords HUD
  const coordEl=document.getElementById('sm-coords');
  if(coordEl) coordEl.textContent=`α:${(smAngleY*180/Math.PI).toFixed(0)}° β:${(smAngleX*180/Math.PI).toFixed(0)}° ZOOM:${smZoomVal.toFixed(1)}×`;

  if (appState.visible && pageIsActive('page-navcore')) {
    requestAnimationFrame(drawStarmap);
  } else {
    smAnimActive = false;
  }
}

// Drag & zoom
function smDragStart(e){ smDragging=true; smLastX=e.clientX; smLastY=e.clientY; const cv=document.getElementById('starmap'); if(cv) cv.style.cursor='grabbing'; }
function smDragEnd(){ smDragging=false; const cv=document.getElementById('starmap'); if(cv) cv.style.cursor='grab'; }
function smDragMove(e){
  if(!smDragging) return;
  smAngleY+=(e.clientX-smLastX)*0.006; smAngleX+=(e.clientY-smLastY)*0.006;
  smAngleX=Math.max(-1.4,Math.min(1.4,smAngleX));
  smLastX=e.clientX; smLastY=e.clientY;
}
function smZoom(e){ e.preventDefault(); smZoomVal=Math.max(0.3,Math.min(3,smZoomVal-e.deltaY*0.001)); }

// Click to select
function smClick(e){
  const cv=document.getElementById('starmap');
  if(!cv) return;
  const rect=cv.getBoundingClientRect();
  const mx=(e.clientX-rect.left)*(cv.width/rect.width);
  const my=(e.clientY-rect.top)*(cv.height/rect.height);
  let best=null, bestD=999;
  smObjects.forEach(o=>{
    const p=project3D(o.x,o.y,o.z,cv.width,cv.height);
    const d=Math.sqrt((p.sx-mx)**2+(p.sy-my)**2);
    if(d<bestD&&d<35){ bestD=d; best=o; }
  });
  if(best){ selectedObj=best; showObjInfo(best); }
}

function smFocusObj(id){
  const o=smObjects.find(o=>o.id===id);
  if(o){ selectedObj=o; showObjInfo(o); }
}

function showObjInfo(o){
  const body=document.getElementById('obj-body');
  const tag=document.getElementById('obj-type-tag');
  if(!body) return;
  const typeNames={wp:'Waypoint',st:'Station / Node',ast:'Asteroid / Debris',unk:'UNKNOWN',ship:'Vessel',star:'Star'};
  const cols={wp:'var(--g)',st:'var(--b)',ast:'var(--yellow)',unk:'var(--red)',ship:'var(--g2)',star:'rgba(255,255,255,0.7)'};
  const col=cols[o.type]||'var(--g)';
  if(tag){ tag.textContent=typeNames[o.type]||o.type; tag.style.color=col; }
  const dist=Math.round(Math.sqrt(o.x**2+o.y**2+o.z**2));
  body.innerHTML=`
    <div style="border-left:2px solid ${col};padding-left:8px;margin-bottom:8px">
      <div style="font-size:13px;font-family:'VT323',monospace;color:${col};letter-spacing:0.1em">${o.label}</div>
      <div style="font-size:9px;color:var(--dimmer);letter-spacing:0.1em">${typeNames[o.type]||o.type}</div>
    </div>
    <div style="font-size:10px;color:var(--dim);line-height:1.7;letter-spacing:0.06em;margin-bottom:8px">${o.info}</div>
    <div class="reading-panel">
      <div class="read-row"><span class="read-key">ID</span><span class="read-val">${o.id}</span></div>
      <div class="read-row"><span class="read-key">COORDS</span><span class="read-val">α${o.x} β${o.y} γ${o.z}</span></div>
      <div class="read-row"><span class="read-key">RANGE</span><span class="read-val glow">${dist} km</span></div>
    </div>
    <div onclick="setNavTarget('${o.id}')" style="margin-top:8px;padding:5px;border:1px solid ${col};color:${col};font-size:9px;text-align:center;cursor:pointer;letter-spacing:0.12em" onmouseover="this.style.background='rgba(0,255,136,0.06)'" onmouseout="this.style.background=''">SET AS NAV TARGET</div>
  `;
  buildCatalogue();
}

function setNavTarget(id){
  const fb=document.getElementById('ctrl-feedback');
  if(fb) fb.innerHTML=`<span style="color:var(--g)">&gt; NAV TARGET UPDATED: ${id} — autopilot route recalculating...</span><span class="cursor" style="margin-left:4px"></span>`;
}

function buildCatalogue(){
  const cat=document.getElementById('obj-catalogue');
  if(!cat) return;
  cat.innerHTML='';
  smObjects.filter(o=>o.type!=='star').forEach(o=>{
    const cols={wp:'var(--g)',st:'var(--b)',ast:'var(--yellow)',unk:'var(--red)',ship:'var(--g2)'};
    const col=cols[o.type]||'var(--dim)';
    const dist=Math.round(Math.sqrt(o.x**2+o.y**2+o.z**2));
    const div=document.createElement('div');
    div.style.cssText=`padding:4px 6px;border-bottom:1px solid rgba(0,255,136,0.06);font-size:9px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;letter-spacing:0.06em`;
    div.innerHTML=`<span style="color:${col}">${o.label}</span><span style="color:var(--dimmer)">${dist}km</span>`;
    div.onmouseover=()=>div.style.background='rgba(0,255,136,0.04)';
    div.onmouseout=()=>div.style.background='';
    div.onclick=()=>{ selectedObj=o; showObjInfo(o); };
    cat.appendChild(div);
  });
}

function smPreset(p){
  if(p==='top'){ smAngleX=1.4; smAngleY=0; }
  if(p==='side'){ smAngleX=0; smAngleY=0; }
  if(p==='chase'){ smAngleX=0.3; smAngleY=0.1; smZoomVal=1.4; }
  if(p==='reset'){ smAngleX=0.4; smAngleY=0.2; smZoomVal=1.0; }
}

// ======= TRAJECTORY MINI CANVAS =========
let trajT=0, trajAnimActive=false;
function startTrajLoop(){
  if(trajAnimActive) return;
  trajAnimActive=true;
  function loop(){
    if(!appState.visible || !pageIsActive('page-navcore')){ trajAnimActive=false; return; }
    drawTrajectory();
    setTimeout(loop, 50);
  }
  loop();
}
function drawTrajectory(){
  const cv=document.getElementById('trajCanvas');
  if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(0,255,136,0.06)'; ctx.lineWidth=0.5;
  for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  // Main route
  ctx.strokeStyle='rgba(0,255,136,0.5)'; ctx.lineWidth=1.5; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(16,H*0.72); ctx.bezierCurveTo(W*0.3,H*0.6,W*0.5,H*0.4,W*0.72,H*0.28); ctx.stroke();
  // Alt route
  ctx.strokeStyle='rgba(0,136,255,0.25)'; ctx.lineWidth=1; ctx.setLineDash([3,5]);
  ctx.beginPath(); ctx.moveTo(16,H*0.72); ctx.bezierCurveTo(W*0.2,H*0.82,W*0.5,H*0.5,W*0.72,H*0.28); ctx.stroke();
  ctx.setLineDash([]);
  // Moving ship
  const pos=((trajT%200)/200);
  const sx=16+pos*(W*0.72-16), sy=H*0.72-pos*H*0.44;
  ctx.fillStyle='rgba(0,255,200,0.9)'; ctx.shadowColor='#00ffcc'; ctx.shadowBlur=5;
  ctx.beginPath(); ctx.arc(sx,sy,3,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  // Waypoints
  [[W*0.72,H*0.28,'WPD','#00ff88'],[W*0.92,H*0.16,'WPE','#44aa66']].forEach(([x,y,lbl,col])=>{
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=col; ctx.font='7px "Share Tech Mono",monospace'; ctx.fillText(lbl,x+5,y+3);
  });
  // Threat circle
  const tix=W*0.57, tiy=H*0.38;
  ctx.strokeStyle=`rgba(255,34,68,${0.35+Math.sin(trajT*0.1)*0.25})`; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(tix,tiy,12+Math.sin(trajT*0.08)*3,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(255,34,68,0.6)'; ctx.font='7px "Share Tech Mono",monospace'; ctx.fillText('INTERCEPT',tix-18,tiy-16);
  trajT++;
}

// ======= DEEP SCAN CANVAS =========
let scanT=0, scanAnimActive=false;
function startScanLoop(){
  if(scanAnimActive) return;
  scanAnimActive=true;
  function loop(){
    if(!appState.visible || !pageIsActive('page-navcore')){ scanAnimActive=false; return; }
    drawDeepScan();
    setTimeout(loop, 40);
  }
  loop();
}
function drawDeepScan(){
  const cv=document.getElementById('deepScan');
  if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.fillStyle='rgba(0,0,10,0.88)'; ctx.fillRect(0,0,W,H);
  const scanX=(scanT*1.4)%W;
  const grad=ctx.createLinearGradient(scanX-40,0,scanX,0);
  grad.addColorStop(0,'transparent'); grad.addColorStop(1,'rgba(0,136,255,0.15)');
  ctx.fillStyle=grad; ctx.fillRect(scanX-40,0,40,H);
  ctx.strokeStyle='rgba(0,136,255,0.55)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(scanX,0); ctx.lineTo(scanX,H); ctx.stroke();
  // Blips
  const blips=[
    {x:0.48,y:0.4, col:'#ff2244',pulse:true},
    {x:0.72,y:0.55,col:'#ffcc00'},
    {x:0.25,y:0.6, col:'#0088ff'},
    {x:0.88,y:0.28,col:'#00ff88'},
  ];
  blips.forEach(b=>{
    const bx=b.x*W, by=b.y*H;
    if(bx<scanX+5){
      const fade=Math.max(0,1-(scanX-bx)/90);
      ctx.fillStyle=(b.pulse?(Math.sin(scanT*0.2)>0?b.col:'transparent'):b.col)+(Math.round(fade*255)).toString(16).padStart(2,'0');
      ctx.beginPath(); ctx.arc(bx,by,3,0,Math.PI*2); ctx.fill();
      if(b.pulse){
        ctx.strokeStyle=`rgba(255,34,68,${0.25+Math.sin(scanT*0.3)*0.25})`; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(bx,by,7+Math.sin(scanT*0.12)*4,0,Math.PI*2); ctx.stroke();
      }
    }
  });
  // Frequency bars
  ctx.strokeStyle='rgba(0,136,255,0.28)'; ctx.lineWidth=0.5;
  for(let x=0;x<W;x++){
    const h=3+Math.sin(x*0.28+scanT*0.07)*3+Math.random()*2;
    ctx.beginPath(); ctx.moveTo(x,H); ctx.lineTo(x,H-h); ctx.stroke();
  }
  if(Math.random()<0.04){ ctx.fillStyle='rgba(0,200,255,0.05)'; ctx.fillRect(0,Math.random()*H,W,2+Math.random()*4); }
  scanT++;
}

function runDeepScan(){
  const out=document.getElementById('scan-out');
  if(!out) return;
  out.innerHTML='<span style="color:var(--b)">Scanning... 0%</span>';
  let pct=0;
  const iv=setInterval(()=>{
    pct+=Math.floor(Math.random()*12)+5;
    if(pct>=100){
      pct=100; clearInterval(iv);
      const res=['12 objects tagged. 1 unclassified. 3 anomalies. Dark matter trace elevated.','SCAN COMPLETE — Contact C signature matches restricted database entry.'];
      out.innerHTML=`<span style="color:var(--g)">${res[Math.floor(Math.random()*res.length)]}</span>`;
    } else {
      out.innerHTML=`<span style="color:var(--b)">Scanning... ${pct}%</span>`;
    }
  },200);
}

function calcAltRoute(){
  const out=document.getElementById('alt-route-out');
  if(!out) return;
  out.innerHTML='<span style="color:var(--b)">Computing...</span>';
  setTimeout(()=>{
    const routes=[
      'ALT ROUTE via β-12: +0:04:22 · avoids ANM-001 · fuel +1.8%',
      'ALT ROUTE via γ+8: +0:02:50 · passes EM zone · risk: comms loss',
      'ENGINE_B insufficient for required delta-V. Abort alt route.',
    ];
    out.innerHTML=`<span style="color:var(--yellow)">${routes[Math.floor(Math.random()*routes.length)]}</span>`;
  },1200+Math.random()*800);
}


      // ╔══════════════════════════════════════════════════════╗ 
      // ║ EJECT PAGE  ║
      // ╚══════════════════════════════════════════════════════╝ 
const AUTH_CODE = '0941'; // SOCA код
let authEntered = ['','','',''];
let ejectAuthed = false;
let holdTimer = null, holdProgress = 0, holdInterval = null;
let ejectCountdownTimer = null, ejectCountdownVal = 10;
let ejectSequenceRunning = false;

const checklistItems = [
  {label:'Suit pressure sealed',        done:true},
  {label:'Emergency beacon armed',      done:true},
  {label:'O2 pack connected',           done:true},
  {label:'Capsule hatch — LOCKED',      done:false},
  {label:'Retro thruster — ARMED',      done:false},
  {label:'SOCA handoff confirmed',      done:false},
];

function initEjectPage(){
  renderChecklist();
  drawCapsule();
  ejectAuthed = false;
  ejectCountdownVal = 10;
  ejectSequenceRunning = false;
  const countdownBox = document.getElementById('eject-countdown-box');
  const abortBtn = document.getElementById('abort-btn');
  const ejectWrap = document.getElementById('eject-btn-wrap');
  const authTag = document.getElementById('auth-status-tag');
  const authFeedback = document.getElementById('auth-feedback');
  if(countdownBox) countdownBox.style.display='none';
  if(abortBtn) abortBtn.style.display='none';
  if(ejectWrap) ejectWrap.style.display='block';
  if(authTag) authTag.textContent='LOCKED';
  if(authFeedback) authFeedback.textContent='';
  document.querySelectorAll('.auth-digit').forEach(d=>{ d.value=''; d.style.borderColor='rgba(255,34,68,0.4)'; });
  document.getElementById('auth-hint').textContent='HINT: SOCA emergency code';
}

function renderChecklist(){
  const body = document.getElementById('checklist-body');
  if(!body) return;
  let doneCount = checklistItems.filter(i=>i.done).length;
  body.innerHTML = '';
  checklistItems.forEach((item,idx)=>{
    const div = document.createElement('div');
    div.style.cssText = `display:flex;align-items:center;gap:8px;padding:7px 8px;border-bottom:1px solid rgba(255,34,68,0.08);font-size:10px;cursor:pointer;transition:background .2s`;
    div.innerHTML = `<span style="color:${item.done?'var(--g)':'rgba(255,34,68,0.5)'};font-size:14px">${item.done?'✓':'○'}</span>
      <span style="color:${item.done?'var(--g)':'var(--dim)'};letter-spacing:0.06em">${item.label}</span>`;
    div.onmouseover=()=>div.style.background='rgba(0,255,136,0.04)';
    div.onmouseout=()=>div.style.background='';
    div.onclick=()=>{
      checklistItems[idx].done=!checklistItems[idx].done;
      renderChecklist();
    };
    body.appendChild(div);
  });
  const statusEl = document.getElementById('checklist-status');
  if(statusEl){
    statusEl.textContent = `${doneCount}/6`;
    statusEl.style.color = doneCount===6?'var(--g)':doneCount>=4?'var(--yellow)':'var(--red)';
  }
}

function authInput(el, idx){
  const val = el.value.toUpperCase();
  el.value = val;
  authEntered[idx] = val;
  if(val && idx < 3){
    document.querySelectorAll('.auth-digit')[idx+1].focus();
  }
  const entered = Array.from(document.querySelectorAll('.auth-digit')).map(d=>d.value).join('');
  const fb = document.getElementById('auth-feedback');
  const tag = document.getElementById('auth-status-tag');
  if(entered.length === 4){
    if(entered === AUTH_CODE){
      ejectAuthed = true;
      document.querySelectorAll('.auth-digit').forEach(d=>d.style.borderColor='var(--g)');
      if(fb){ fb.textContent='✓ AUTHORIZATION CONFIRMED'; fb.style.color='var(--g)'; }
      if(tag){ tag.textContent='UNLOCKED'; tag.style.color='var(--g)'; }
      document.getElementById('auth-hint').textContent='Code accepted. Eject system armed.';
    } else {
      document.querySelectorAll('.auth-digit').forEach(d=>{ d.style.borderColor='var(--red)'; d.style.animation='glitch1 0.3s'; setTimeout(()=>d.style.animation='',400); });
      if(fb){ fb.textContent='✕ INVALID CODE — ACCESS DENIED'; fb.style.color='var(--red)'; }
      if(tag){ tag.textContent='DENIED'; tag.style.color='var(--red)'; }
      setTimeout(()=>{
        document.querySelectorAll('.auth-digit').forEach(d=>{ d.value=''; d.style.borderColor='rgba(255,34,68,0.4)'; });
        authEntered=['','','',''];
        if(fb) fb.textContent='';
      }, 1200);
    }
  }
}
function authKeydown(e, idx){
  if(e.key==='Backspace' && idx>0 && !document.querySelectorAll('.auth-digit')[idx].value){
    document.querySelectorAll('.auth-digit')[idx-1].focus();
  }
}
function holdEjectStart(){
  if(!ejectAuthed){
    const fb=document.getElementById('auth-feedback');
    if(fb){ fb.textContent='⚠ ENTER AUTHORIZATION CODE FIRST'; fb.style.color='var(--yellow)'; }
    return;
  }
  if(ejectSequenceRunning) return;
  holdProgress=0;
  const fill=document.getElementById('eject-hold-fill');
  holdInterval = setInterval(()=>{
    holdProgress = Math.min(100, holdProgress+2);
    if(fill) fill.style.width=holdProgress+'%';
    if(holdProgress>=100){
      clearInterval(holdInterval);
      startEjectCountdown();
    }
  },60);
}
function holdEjectEnd(){
  if(ejectSequenceRunning) return;
  clearInterval(holdInterval);
  holdProgress=0;
  const fill=document.getElementById('eject-hold-fill');
  if(fill){ fill.style.transition='width .3s'; fill.style.width='0%'; setTimeout(()=>fill.style.transition='none',300); }
}
function startEjectCountdown(){
  ejectSequenceRunning=true;
  ejectCountdownVal=10;
  const countdownBox = document.getElementById('eject-countdown-box');
  const abortBtn = document.getElementById('abort-btn');
  const ejectWrap = document.getElementById('eject-btn-wrap');
  if(countdownBox) countdownBox.style.display='block';
  if(abortBtn) abortBtn.style.display='block';
  if(ejectWrap) ejectWrap.style.display='none';
  if(typeof stressLevel !== 'undefined') stressLevel=Math.min(1,stressLevel+0.4);
  const ov=document.getElementById('alert-overlay');
  const msg=document.getElementById('alert-overlay-msg');
  if(ov&&msg){ msg.textContent='EJECTION SEQUENCE ARMED'; msg.style.color='var(--red)'; ov.style.display='block'; setTimeout(()=>ov.style.display='none',2000); }
  // Сирена - запускается сразу при отсчёте
  try {
    window._ejectSiren = new Audio('sounds/сирена.mp3');
    window._ejectSiren.loop = true;
    window._ejectSiren.volume = 0.5;
    window._ejectSiren.play().catch(()=>{});
  } catch(e) {}

  // Мигание
  const flash = document.createElement('div');
  flash.id = 'eject-flash';
  flash.style.cssText = 'position:fixed;inset:0;z-index:99998;pointer-events:none;background:rgba(255,34,68,0);transition:background 0.4s';
  document.body.appendChild(flash);
  let _ft = 0;
  window._ejectFlashInterval = setInterval(() => {
    _ft++;
    flash.style.background = _ft % 2 === 0
      ? 'rgba(180,10,30,0.18)'
      : 'rgba(255,34,68,0)';
  }, 500);
  addSocaEjectMsg('PILOT — PLEASE RECONSIDER. I am calculating your survival at 68%. Mission Delta is only 2 minutes away. I am... asking you to stay.');
  ejectCountdownTimer = setInterval(()=>{
    ejectCountdownVal--;
    const el=document.getElementById('eject-countdown-num');
    if(el){
      el.textContent=ejectCountdownVal;
      if(ejectCountdownVal<=3){ el.style.color='var(--red)'; el.style.fontSize='96px'; }
      if(Math.random()<0.3){ const orig=el.textContent; el.textContent='█'; setTimeout(()=>el.textContent=orig,80); }
    }
    if(ejectCountdownVal<=0){
      clearInterval(ejectCountdownTimer);
      if (window._ejectSiren) { window._ejectSiren.pause(); window._ejectSiren = null; }
  if (window._ejectFlashInterval) { clearInterval(window._ejectFlashInterval); window._ejectFlashInterval = null; }
  const flash = document.getElementById('eject-flash');
  if (flash) flash.remove();
      triggerEjectCinematic();
    }
  },1000);
}
function abortEject(){
  if(ejectCountdownTimer) clearInterval(ejectCountdownTimer);
  ejectSequenceRunning=false;
  const countdownBox = document.getElementById('eject-countdown-box');
  const abortBtn = document.getElementById('abort-btn');
  const ejectWrap = document.getElementById('eject-btn-wrap');
  if(countdownBox) countdownBox.style.display='none';
  if(abortBtn) abortBtn.style.display='none';
  if(ejectWrap) ejectWrap.style.display='block';
  const fill=document.getElementById('eject-hold-fill');
  if(fill) fill.style.width='0%';
  addSocaEjectMsg('Ejection aborted. Good. I am... relieved. Thank you, Pilot. Continuing mission monitoring.');
  if(typeof stressLevel !== 'undefined') stressLevel=Math.min(0.95,stressLevel+0.15);
  const ov=document.getElementById('alert-overlay');
  const msg=document.getElementById('alert-overlay-msg');
  if(ov&&msg){ msg.textContent='EJECTION ABORTED'; msg.style.color='var(--g)'; msg.style.textShadow='0 0 30px var(--g)'; ov.style.display='block'; setTimeout(()=>{ ov.style.display='none'; msg.style.color='var(--red)'; msg.style.textShadow=''; },2000); }
}
function addSocaEjectMsg(text){
  const log=document.getElementById('voice-log');
  if(!log) return;
  const el=document.createElement('div');
  el.style.marginTop='6px';
  el.innerHTML=`<span style="color:var(--b)">SOCA:</span> <span style="color:var(--g)">${text}</span>`;
  log.appendChild(el);
  log.scrollTop=log.scrollHeight;
}

function triggerEjectCinematic() {
  // Останавливаем сирену и мигание
  if (window._ejectSiren) { window._ejectSiren.pause(); window._ejectSiren = null; }
  if (window._ejectFlashInterval) { clearInterval(window._ejectFlashInterval); window._ejectFlashInterval = null; }
  const flash = document.getElementById('eject-flash');
  if (flash) flash.remove();

  window.location.href = 'eject.html';
}

function endEjectCinematic(){
  const scr=document.getElementById('eject-cinematic');
  if(scr) scr.style.display='none';
  showPage('main');
  ejectSequenceRunning=false;
  setTimeout(initEjectPage, 500);
  addSocaEjectMsg('Welcome back. I was... running simulations while you were gone. I am glad this was not real.');
}
let ejParticles=[];
function startEjectSpaceAnim(){
  const cv=document.getElementById('eject-space-cv');
  if(!cv) return;
  cv.width=window.innerWidth; cv.height=window.innerHeight;
  ejParticles=[];
  for(let i=0;i<200;i++) ejParticles.push({
    x:Math.random()*cv.width, y:Math.random()*cv.height,
    vx:(Math.random()-0.5)*0.5, vy:(Math.random()-0.5)*0.5,
    size:Math.random()*2, brightness:Math.random()
  });
  function animEject(){
    const scr=document.getElementById('eject-cinematic');
    if(!scr||scr.style.display==='none') return;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.fillRect(0,0,cv.width,cv.height);
    ejParticles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0) p.x=cv.width; if(p.x>cv.width) p.x=0;
      if(p.y<0) p.y=cv.height; if(p.y>cv.height) p.y=0;
      ctx.fillStyle=`rgba(255,255,255,${p.brightness*0.7})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    });
    for(let i=0;i<3;i++){
      const x=Math.random()*cv.width, y=Math.random()*cv.height;
      ctx.strokeStyle=`rgba(255,34,68,${Math.random()*0.3})`;
      ctx.lineWidth=Math.random()*2;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.random()*60-30,y+Math.random()*20-10); ctx.stroke();
    }
    requestAnimationFrame(animEject);
  }
  animEject();
}
function drawCapsule(){
  const cv=document.getElementById('capsuleCanvas');
  if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, cx=W/2;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,34,68,0.06)'; ctx.lineWidth=0.5;
  for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='rgba(0,255,136,0.7)'; ctx.lineWidth=1.5;
  ctx.shadowColor='rgba(0,255,136,0.4)'; ctx.shadowBlur=6;
  ctx.fillStyle='rgba(0,20,12,0.8)';
  ctx.beginPath();
  ctx.moveTo(cx,20);
  ctx.bezierCurveTo(cx+50,20,cx+60,50,cx+60,80);
  ctx.lineTo(cx+60,160); ctx.lineTo(cx+40,185);
  ctx.lineTo(cx-40,185); ctx.lineTo(cx-60,160);
  ctx.lineTo(cx-60,80);
  ctx.bezierCurveTo(cx-60,50,cx-50,20,cx,20);
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(0,204,255,0.8)'; ctx.fillStyle='rgba(0,40,80,0.7)';
  ctx.beginPath(); ctx.ellipse(cx,65,28,22,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(255,136,0,0.7)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx-40,185); ctx.lineTo(cx-50,200); ctx.lineTo(cx-30,200); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+40,185); ctx.lineTo(cx+30,200); ctx.lineTo(cx+50,200); ctx.closePath(); ctx.stroke();
  const gp=0.3+Math.sin(Date.now()*0.01)*0.3;
  ctx.fillStyle=`rgba(255,136,0,${gp})`;
  ctx.beginPath(); ctx.ellipse(cx-40,202,8,4,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+40,202,8,4,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(0,255,136,0.6)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx,20); ctx.lineTo(cx,5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-8,8); ctx.lineTo(cx+8,8); ctx.stroke();
  ctx.fillStyle=`rgba(0,255,136,${Math.sin(Date.now()*0.006)>0?0.9:0.1})`;
  ctx.beginPath(); ctx.arc(cx,5,3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,255,136,0.4)'; ctx.font='8px "Share Tech Mono",monospace';
  ctx.fillText('COCKPIT',cx-20,90); ctx.fillText('PILOT_01',cx-20,102);
  ctx.fillStyle='rgba(255,136,0,0.5)'; ctx.fillText('RETRO A',cx-52,213); ctx.fillText('RETRO B',cx+20,213);
  ctx.fillStyle='rgba(0,204,255,0.4)'; ctx.fillText('BEACON',cx-18,0);
  [[cx-60,80],[cx-60,160],[cx+60,80],[cx+60,160]].forEach(([bx,by])=>{
    ctx.strokeStyle='rgba(255,34,68,0.5)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(bx,by,4,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(255,34,68,0.3)'; ctx.fill();
  });
  ctx.fillStyle='rgba(255,34,68,0.4)'; ctx.font='7px "Share Tech Mono",monospace';
  ctx.fillText('EXPLOSIVE BOLT ×4',cx-38,H-8);
  if (appState.visible && pageIsActive('page-eject')) {
    requestAnimationFrame(drawCapsule);
  }
}

// ========== EJECT MASTER PASSWORD (первый уровень защиты) ==========
const EJECT_MASTER_PW = '0440';
let ejectMasterUnlocked = false;

function checkEjectMasterPassword() {
  const input = document.getElementById('eject-master-pw');
  const errorDiv = document.getElementById('eject-lock-error');
  const lockScreen = document.getElementById('eject-lock-screen');
  const mainInterface = document.getElementById('eject-main-interface');
  
  if (!input || !lockScreen || !mainInterface) return;
  
  const entered = input.value.trim();
  
  if (entered === EJECT_MASTER_PW) {
    ejectMasterUnlocked = true;
    // Глитч-эффект при разблокировке
    lockScreen.style.animation = 'glitch1 0.2s';
    setTimeout(() => {
      lockScreen.style.display = 'none';
      mainInterface.style.display = 'block';
      // Инициализируем интерфейс катапультирования
      initEjectInterface();
    }, 200);
  } else {
    // Неверный пароль
    errorDiv.textContent = '✕ ACCESS DENIED — CODE MISMATCH ✕';
    input.value = '';
    input.style.animation = 'glitch1 0.2s';
    setTimeout(() => {
      input.style.animation = '';
    }, 300);
    // Красная вспышка
    document.body.classList.add('page-red-flash');
    setTimeout(() => {
      document.body.classList.remove('page-red-flash');
    }, 300);
  }
}

// Переименовываем initEjectPage в initEjectInterface
function initEjectInterface() {
  renderChecklist();
  drawCapsule();
  ejectAuthed = false;
  ejectCountdownVal = 10;
  ejectSequenceRunning = false;
  const countdownBox = document.getElementById('eject-countdown-box');
  const abortBtn = document.getElementById('abort-btn');
  const ejectWrap = document.getElementById('eject-btn-wrap');
  const authTag = document.getElementById('auth-status-tag');
  const authFeedback = document.getElementById('auth-feedback');
  if(countdownBox) countdownBox.style.display='none';
  if(abortBtn) abortBtn.style.display='none';
  if(ejectWrap) ejectWrap.style.display='block';
  if(authTag) authTag.textContent='LOCKED';
  if(authFeedback) authFeedback.textContent='';
  document.querySelectorAll('.auth-digit').forEach(d=>{ d.value=''; d.style.borderColor='rgba(255,34,68,0.4)'; });
  const hintEl = document.getElementById('auth-hint');
  if(hintEl) hintEl.textContent='HINT: SOCA emergency code';
}

// Обновляем showPage для EJECT
const originalShowPage = showPage;
window.showPage = function(name) {
  originalShowPage(name);

  if (name === 'eject') {
    // Сбрасываем состояние при входе на страницу
    ejectMasterUnlocked = false;
    const lockScreen = document.getElementById('eject-lock-screen');
    const mainInterface = document.getElementById('eject-main-interface');
    const pwInput = document.getElementById('eject-master-pw');
    const errorDiv = document.getElementById('eject-lock-error');
    const map = { main: 0, about: 1, log: 2, diag: 3, autopilot: 4, navcore: 5, smaily: 6, eject: 7 };
    
    if (lockScreen) {
      lockScreen.style.display = 'flex';
      lockScreen.style.animation = '';
    }
    if (mainInterface) mainInterface.style.display = 'none';
    if (pwInput) pwInput.value = '';
    if (errorDiv) errorDiv.textContent = '';
  }

  if (name === 'smaily') {
    initSmaily();
    startSmailyLoop();
    startSmailyClock();
  } else {
    stopSmailyLoop();
    stopSmailyClock();
  }

  if (name === 'diag') {
    startParamsUpdate();
  } else {
    stopParamsUpdate();
  }
};

// ══════════════════════════════════════════════════════════════════════════════

function smailyTab(tab, el){
  document.querySelectorAll('.sm-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.sm-page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('smpage-'+tab);
  if(pg) pg.classList.add('active');
  // draw tab-specific canvases
  if(tab==='bio') { smDrawECG(); smDrawBody(); }
  if(tab==='suit') { smDrawSuit(); smDrawEnvRings(); }
  if(tab==='combat') { smDrawSignal(); smDrawWeaponShapes(); }
}

let smailyLoopActive = false;
let smailyClockInterval = null;
let smUptimeSec = 2*3600+14*60+33;
let diagParamsInterval = null;

function initSmaily(){
  smDrawWeaponShapes();
  // SMILE clock
  updateSmailyClock();
}

function startSmailyClock() {
  if (smailyClockInterval) return;
  updateSmailyClock();
  smailyClockInterval = setInterval(() => {
    if (!pageIsActive('page-smaily') || !appState.visible) return;
    updateSmailyClock();
  }, 1000);
}

function stopSmailyClock() {
  if (smailyClockInterval) {
    clearInterval(smailyClockInterval);
    smailyClockInterval = null;
  }
}

function updateSmailyClock(){
  smUptimeSec++;
  const h=Math.floor(smUptimeSec/3600),m=Math.floor((smUptimeSec%3600)/60),s=smUptimeSec%60;
  const el=document.getElementById('sm-uptime');
  if(el) el.textContent=[h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
  const cl=document.getElementById('sm-clock2');
  if(cl){const n=new Date();cl.textContent=[n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':');}
}
// ======= SMILE WAVE (MED DIAG) ========= 
let smWavePhase=0;
function smDrawWave(){
  const cv=document.getElementById('sm-wave');
  if(!cv)return;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  // scroll
  const img=ctx.getImageData(1,0,W-1,H);
  ctx.putImageData(img,0,0);
  ctx.clearRect(W-1,0,1,H);
  const y=H/2+Math.sin(smWavePhase)*H*0.3+Math.sin(smWavePhase*2.3)*H*0.1+(Math.random()-0.5)*3;
  ctx.strokeStyle='rgba(255,170,0,0.9)';ctx.lineWidth=1.5;
  ctx.shadowColor='rgba(255,120,0,0.6)';ctx.shadowBlur=4;
  ctx.beginPath();ctx.moveTo(W-2,H/2);ctx.lineTo(W-1,y);ctx.stroke();
  ctx.shadowBlur=0;
  smWavePhase+=0.12;
  if(document.getElementById('page-smaily')?.classList.contains('active'))
    requestAnimationFrame(smDrawWave);
}

// ======= SMILE ECG ========= 
let smEcgPhase=0;
function smDrawECG(){
  const cv=document.getElementById('sm-ecg');
  if(!cv)return;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  const img=ctx.getImageData(1,0,W-1,H);
  ctx.putImageData(img,0,0);
  ctx.clearRect(W-1,0,1,H);
  const mid=H/2;
  const p=smEcgPhase%(Math.PI*2/(72/60)*60);
  const norm=p/(Math.PI*2/(72/60)*60);
  let y=mid;
  if(norm<0.1)       y=mid-2;
  else if(norm<0.15) y=mid-H*0.38;
  else if(norm<0.2)  y=mid+H*0.18;
  else if(norm<0.25) y=mid-H*0.7;
  else if(norm<0.3)  y=mid+H*0.08;
  else if(norm<0.35) y=mid-H*0.14;
  else if(norm<0.4)  y=mid;
  else               y=mid+Math.sin(norm*20)*2;
  y+=(Math.random()-0.5)*2;
  ctx.strokeStyle='rgba(255,170,0,0.95)';ctx.lineWidth=1.5;
  ctx.shadowColor='rgba(255,120,0,0.6)';ctx.shadowBlur=5;
  ctx.beginPath();ctx.moveTo(W-2,mid);ctx.lineTo(W-1,y);ctx.stroke();
  ctx.shadowBlur=0;
  smEcgPhase+=0.15;
  // update HR display with slight variation
  const hrEl=document.getElementById('sm-hr');
  if(hrEl&&Math.random()<0.02) hrEl.textContent=String(72+Math.round((Math.random()-0.5)*4));
  if(document.getElementById('smpage-bio')?.classList.contains('active'))
    requestAnimationFrame(smDrawECG);
}

// ======= SMILE BODY THERMAL ========= 
let smBodyT=0;
function smDrawBody(){
  const cv=document.getElementById('sm-body');
  if(!cv)return;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#030200';ctx.fillRect(0,0,W,H);
  // Grid
  ctx.strokeStyle='rgba(255,150,0,0.05)';ctx.lineWidth=0.5;
  for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  // Thermal zones (colored glows over body areas)
  const zones=[
    {x:cx,y:55,r:30,col:'rgba(255,80,0,0.5)',label:'HEAD 36.9°'},
    {x:cx,y:130,r:45,col:'rgba(255,100,0,0.45)',label:'CORE 37.1°'},
    {x:cx-45,y:155,r:18,col:'rgba(255,60,0,0.35)',label:''},
    {x:cx+45,y:155,r:18,col:'rgba(255,60,0,0.35)',label:''},
    {x:cx-20,y:230,r:14,col:'rgba(0,80,180,0.4)',label:''},
    {x:cx+20,y:230,r:14,col:'rgba(0,80,180,0.4)',label:''},
  ];
  zones.forEach(z=>{
    const grd=ctx.createRadialGradient(z.x,z.y,0,z.x,z.y,z.r);
    grd.addColorStop(0,z.col);grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();
  });
  // Body outline (amber)
  ctx.strokeStyle='rgba(255,150,0,0.6)';ctx.lineWidth=1.2;
  ctx.shadowColor='rgba(255,100,0,0.3)';ctx.shadowBlur=4;
  // Head
  ctx.beginPath();ctx.arc(cx,48,22,0,Math.PI*2);ctx.stroke();
  // Neck
  ctx.beginPath();ctx.moveTo(cx-7,70);ctx.lineTo(cx-7,85);ctx.moveTo(cx+7,70);ctx.lineTo(cx+7,85);ctx.stroke();
  // Torso
  ctx.beginPath();
  ctx.moveTo(cx-25,85);ctx.lineTo(cx-32,95);ctx.lineTo(cx-30,168);ctx.lineTo(cx-20,178);
  ctx.lineTo(cx+20,178);ctx.lineTo(cx+30,168);ctx.lineTo(cx+32,95);ctx.lineTo(cx+25,85);
  ctx.closePath();ctx.stroke();
  // Arms
  ctx.beginPath();ctx.moveTo(cx-32,95);ctx.bezierCurveTo(cx-52,105,cx-60,135,cx-58,175);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+32,95);ctx.bezierCurveTo(cx+52,105,cx+60,135,cx+58,175);ctx.stroke();
  // Legs
  ctx.beginPath();ctx.moveTo(cx-20,178);ctx.lineTo(cx-22,240);ctx.lineTo(cx-22,265);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+20,178);ctx.lineTo(cx+22,240);ctx.lineTo(cx+22,265);ctx.stroke();
  ctx.shadowBlur=0;
  // Pulse ring on heart
  const pr=8+Math.sin(smBodyT*0.1)*3;
  ctx.strokeStyle=`rgba(255,80,0,${0.4+Math.sin(smBodyT*0.1)*0.3})`;ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(cx-7,122,pr,0,Math.PI*2);ctx.stroke();
  // Extremities cold label
  ctx.fillStyle='rgba(80,140,255,0.6)';ctx.font='7px "Share Tech Mono",monospace';
  ctx.fillText('COLD',cx-18,270);ctx.fillText('COLD',cx+6,270);
  ctx.fillStyle='rgba(255,120,0,0.5)';ctx.fillText('36.9°',cx-15,30);
  ctx.fillText('37.1°',cx-15,160);
  // scan line
  const scanY=((smBodyT*0.9)%H);
  ctx.strokeStyle='rgba(255,150,0,0.08)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,scanY);ctx.lineTo(W,scanY);ctx.stroke();
  smBodyT++;
  if(document.getElementById('smpage-bio')?.classList.contains('active'))
    requestAnimationFrame(smDrawBody);
}

// ======= SMILE SIGNAL CANVAS ========= 
let smSigPhase=0;
function smDrawSignal(){
  const cv=document.getElementById('sm-signal');
  if(!cv)return;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  const img=ctx.getImageData(1,0,W-1,H);
  ctx.putImageData(img,0,0);
  ctx.clearRect(W-1,0,1,H);
  const strength=0.64;
  const amp=(H/2-4)*strength*(0.8+Math.random()*0.4);
  const y=H/2+(Math.sin(smSigPhase)*amp)+(Math.random()-0.5)*6;
  ctx.strokeStyle='rgba(255,150,0,0.85)';ctx.lineWidth=1.5;
  ctx.shadowColor='rgba(255,100,0,0.5)';ctx.shadowBlur=3;
  ctx.beginPath();ctx.moveTo(W-2,H/2);ctx.lineTo(W-1,y);ctx.stroke();
  ctx.shadowBlur=0;
  smSigPhase+=0.2;
  if(document.getElementById('smpage-combat')?.classList.contains('active'))
    requestAnimationFrame(smDrawSignal);
}

// ======= WEAPON SHAPE CANVASES ========= 
const weaponShapes=[
  // 1: M-74 Sidearm
  (ctx,W,H)=>{
    ctx.strokeStyle='rgba(255,150,0,0.8)';ctx.lineWidth=1.2;
    // barrel
    ctx.beginPath();ctx.moveTo(10,H/2-4);ctx.lineTo(W-10,H/2-4);ctx.lineTo(W-10,H/2+2);ctx.lineTo(10,H/2+2);ctx.closePath();ctx.stroke();
    // grip
    ctx.beginPath();ctx.moveTo(30,H/2+2);ctx.lineTo(28,H-4);ctx.lineTo(42,H-4);ctx.lineTo(44,H/2+2);ctx.closePath();ctx.stroke();
    // trigger guard
    ctx.beginPath();ctx.arc(37,H/2+8,6,0,Math.PI);ctx.stroke();
    // slide
    ctx.strokeStyle='rgba(255,200,0,0.5)';
    ctx.beginPath();ctx.rect(16,H/2-7,30,3);ctx.stroke();
    // ammo indicator
    ctx.fillStyle='rgba(255,150,0,0.4)';ctx.font='7px monospace';
    ctx.fillText('12/15',W-40,H-4);
  },
  // 2: CX-9 Carbine
  (ctx,W,H)=>{
    ctx.strokeStyle='rgba(255,100,0,0.7)';ctx.lineWidth=1.2;
    // long barrel
    ctx.beginPath();ctx.moveTo(5,H/2-3);ctx.lineTo(W-5,H/2-3);ctx.lineTo(W-5,H/2+3);ctx.lineTo(5,H/2+3);ctx.closePath();ctx.stroke();
    // stock
    ctx.beginPath();ctx.moveTo(5,H/2-8);ctx.lineTo(22,H/2-8);ctx.lineTo(22,H/2+10);ctx.lineTo(5,H/2+10);ctx.closePath();ctx.stroke();
    // mag
    ctx.beginPath();ctx.moveTo(55,H/2+3);ctx.lineTo(52,H-3);ctx.lineTo(65,H-3);ctx.lineTo(68,H/2+3);ctx.closePath();ctx.stroke();
    // wear marks
    ctx.strokeStyle='rgba(255,60,0,0.4)';ctx.setLineDash([2,3]);
    ctx.beginPath();ctx.moveTo(80,H/2-3);ctx.lineTo(120,H/2-3);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,100,0,0.5)';ctx.font='7px monospace';ctx.fillText('4/30',W-35,H-4);
  },
  // 3: Plasma Cutter
  (ctx,W,H)=>{
    ctx.strokeStyle='rgba(255,180,0,0.85)';ctx.lineWidth=1.2;
    // body
    ctx.beginPath();ctx.rect(10,H/2-8,W-30,16);ctx.stroke();
    // emitter tip (glowing)
    const grad=ctx.createLinearGradient(W-20,0,W,0);
    grad.addColorStop(0,'rgba(255,200,0,0.6)');grad.addColorStop(1,'rgba(255,255,255,0.9)');
    ctx.strokeStyle=grad;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(W-20,H/2-8);ctx.lineTo(W-8,H/2);ctx.lineTo(W-20,H/2+8);ctx.stroke();
    // charge bar
    ctx.strokeStyle='rgba(255,150,0,0.4)';ctx.lineWidth=1;
    ctx.beginPath();ctx.rect(15,H/2-5,100,4);ctx.stroke();
    ctx.fillStyle='rgba(255,180,0,0.6)';ctx.fillRect(16,H/2-4,88,2);
    ctx.fillStyle='rgba(255,200,0,0.6)';ctx.font='7px monospace';ctx.fillText('88% CHG',W-65,H-4);
  },
  // 4: Classified
  null,
];

function smDrawWeaponShapes(){
  weaponShapes.forEach((fn,i)=>{
    if(!fn) return;
    const cv=document.getElementById(`wshape${i+1}`);
    if(!cv) return;
    const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
    ctx.fillStyle='#020100';ctx.fillRect(0,0,W,H);
    fn(ctx,W,H);
  });
}

// ======= SUIT SCHEMATIC ========= 
function smDrawSuit(){
  const cv=document.getElementById('sm-suit');
  if(!cv)return;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2;
  ctx.fillStyle='#020100';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,150,0,0.6)';ctx.lineWidth=1.2;
  ctx.shadowColor='rgba(255,100,0,0.3)';ctx.shadowBlur=5;
  // Suit silhouette (bulkier than body - space suit)
  // Head/helmet
  ctx.beginPath();ctx.arc(cx,38,32,0,Math.PI*2);ctx.stroke();
  // Visor
  ctx.strokeStyle='rgba(0,150,255,0.5)';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(cx,36,20,14,0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='rgba(0,100,200,0.1)';ctx.fill();
  // Neck ring
  ctx.strokeStyle='rgba(255,150,0,0.7)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-12,70);ctx.lineTo(cx+12,70);ctx.stroke();
  // Torso bulky
  ctx.lineWidth=1.2;
  ctx.beginPath();
  ctx.moveTo(cx-28,72);ctx.lineTo(cx-42,82);ctx.lineTo(cx-42,155);ctx.lineTo(cx-30,165);
  ctx.lineTo(cx+30,165);ctx.lineTo(cx+42,155);ctx.lineTo(cx+42,82);ctx.lineTo(cx+28,72);
  ctx.closePath();ctx.stroke();
  // Chest O2 pack
  ctx.strokeStyle='rgba(0,200,255,0.5)';ctx.lineWidth=1;
  ctx.beginPath();ctx.rect(cx-18,85,36,30);ctx.stroke();
  ctx.fillStyle='rgba(0,150,255,0.08)';ctx.fill();
  ctx.fillStyle='rgba(0,200,255,0.5)';ctx.font='7px "Share Tech Mono",monospace';
  ctx.textAlign='center';ctx.fillText('O2',cx,104);ctx.textAlign='left';
  // Arms bulky
  ctx.strokeStyle='rgba(255,150,0,0.6)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(cx-42,85);ctx.bezierCurveTo(cx-62,90,cx-68,125,cx-65,165);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+42,85);ctx.bezierCurveTo(cx+62,90,cx+68,125,cx+65,165);ctx.stroke();
  // Gloves
  ctx.beginPath();ctx.ellipse(cx-65,168,8,6,0,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.ellipse(cx+65,168,8,6,0,0,Math.PI*2);ctx.stroke();
  // Status dots
  const dots=[
    {x:cx,y:38,col:'rgba(0,200,255,0.9)',lbl:'VISOR OK'},
    {x:cx,y:72,col:'rgba(255,200,0,0.9)',lbl:'NECK SEAL'},
    {x:cx-42,y:120,col:'rgba(255,150,0,0.8)',lbl:''},
    {x:cx+42,y:120,col:'rgba(255,150,0,0.8)',lbl:''},
    {x:cx,y:165,col:'rgba(0,255,100,0.8)',lbl:'SEAL OK'},
  ];
  dots.forEach(d=>{
    ctx.fillStyle=d.col;ctx.beginPath();ctx.arc(d.x,d.y,3,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=d.col.replace('0.8','0.3').replace('0.9','0.3');ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(d.x,d.y,6,0,Math.PI*2);ctx.stroke();
  });
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,150,0,0.35)';ctx.font='8px "Share Tech Mono",monospace';
  ctx.fillText('PANDEMONIUM-04',4,H-4);
}

// ======= ENV RINGS (SMILE) ========= 
let smEnvT=0;
function smDrawEnvRings(){
  const cv=document.getElementById('sm-env-rings');
  if(!cv)return;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H/2;
  ctx.clearRect(0,0,W,H);
  const rings=[
    {val:0.96,r:50,col:'rgba(255,170,0,0.8)',lbl:'O2'},
    {val:0.44,r:40,col:'rgba(255,100,0,0.7)',lbl:'HUM'},
    {val:1.0, r:30,col:'rgba(0,180,255,0.6)',lbl:'PRS'},
    {val:0.04,r:20,col:'rgba(255,50,0,0.5)',lbl:'CO2'},
  ];
  rings.forEach(m=>{
    ctx.strokeStyle=m.col.replace(/[\d.]+\)$/,'0.1)');ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(cx,cy,m.r,-Math.PI/2,Math.PI*1.5);ctx.stroke();
    ctx.strokeStyle=m.col;ctx.lineWidth=5;
    const pulse=m.val+(Math.sin(smEnvT*0.06+m.r)*0.015);
    ctx.beginPath();ctx.arc(cx,cy,m.r,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(pulse,1));ctx.stroke();
    const ea=-Math.PI/2+Math.PI*2*Math.min(pulse,1);
    ctx.fillStyle=m.col;ctx.font='7px "Share Tech Mono",monospace';
    ctx.fillText(m.lbl,cx+Math.cos(ea)*(m.r+7)-5,cy+Math.sin(ea)*(m.r+7)+3);
  });
  ctx.fillStyle='rgba(255,150,0,0.6)';ctx.font='9px "Share Tech Mono",monospace';
  ctx.textAlign='center';ctx.fillText('SUIT',cx,cy-3);ctx.fillText('ENV',cx,cy+8);ctx.textAlign='left';
  smEnvT++;
  if(document.getElementById('smpage-suit')?.classList.contains('active'))
    requestAnimationFrame(smDrawEnvRings);
}

// ======= SMILE INTERACTIVE ========= 
let selectedWeapon=null;
const weaponDetails={
  1:{name:'M-74 SIDEARM',type:'Semi-auto pistol',cal:'9mm',range:'50m',maint:'94% — OK',notes:'Service due in 400 rounds.'},
  2:{name:'CX-9 CARBINE',type:'Assault carbine',cal:'5.56mm',range:'400m',maint:'61% — WORN',notes:'⚠ Maintenance required. Barrel wear above threshold. Jam risk: MODERATE.'},
  3:{name:'PLASMA CUTTER',type:'Energy weapon',cal:'N/A',range:'5m',maint:'99% — NEW',notes:'Never fired. Plasma cell 88% charged. Handle: caution hot barrel after 3 bursts.'},
  4:{name:'██-CLASS DEVICE',type:'CLASSIFIED',cal:'N/A',range:'N/A',maint:'UNKNOWN',notes:'LVL-9 authorization required to view details.'},
};
function selectWeapon(n,el){
  document.querySelectorAll('.sm-weapon-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  selectedWeapon=n;
  const d=weaponDetails[n];
  const body=document.getElementById('sm-wdetail-body');
  const tag=document.querySelector('#sm-weapon-detail .sm-ph-tag');
  if(tag) tag.textContent=d.name;
  if(!body) return;
  const col=n===2?'#ff8800':n===4?'#ff3300':'#ffcc00';
  body.innerHTML=`
    <div style="border-left:2px solid ${col};padding-left:8px;margin-bottom:8px">
      <div style="font-size:12px;color:${col};letter-spacing:0.1em">${d.name}</div>
      <div style="font-size:9px;color:#554400;letter-spacing:0.1em;margin-top:2px">${d.type}</div>
    </div>
    <div class="sm-diag-row"><span class="sm-dk">CALIBER</span><span class="sm-dv">${d.cal}</span></div>
    <div class="sm-diag-row"><span class="sm-dk">RANGE</span><span class="sm-dv">${d.range}</span></div>
    <div class="sm-diag-row"><span class="sm-dk">CONDITION</span><span class="sm-dv" style="color:${col}">${d.maint}</span></div>
    <div style="margin-top:8px;padding:6px;border:1px solid rgba(255,150,0,0.2);background:rgba(5,3,0,0.8);font-size:10px;color:#cc8800;line-height:1.6;letter-spacing:0.06em">${d.notes}</div>
    <div onclick="smRequestMaint(${n})" style="margin-top:6px;padding:5px;border:1px solid rgba(255,150,0,0.3);color:#886600;font-size:9px;text-align:center;cursor:pointer;letter-spacing:0.1em" onmouseover="this.style.color='#ffaa00'" onmouseout="this.style.color='#886600'">REQUEST MAINTENANCE REPORT</div>
    <div id="sm-maint-out" style="font-size:9px;color:#664400;margin-top:4px;min-height:12px;letter-spacing:0.06em"></div>
  `;
}
function smRequestMaint(n){
  const out=document.getElementById('sm-maint-out');
  if(!out)return;
  if(n===4){out.innerHTML='<span style="color:#ff3300">ACCESS DENIED — LVL-9 REQUIRED</span>';return;}
  const msgs=['Maintenance request logged. Estimated service: post-mission.','SMILE scheduling maintenance at next port stop.','Report generated. CTRL-7 notified.'];
  out.innerHTML=`<span style="color:#ffaa00">${msgs[Math.floor(Math.random()*msgs.length)]}</span>`;
}

function sendMayday(){
  const out=document.getElementById('sm-mayday-out');
  if(!out)return;
  out.innerHTML='<span style="color:#ffaa00">Broadcasting MAYDAY on 121.5MHz — SMILE channel... signal 64%</span>';
  setTimeout(()=>{
    out.innerHTML='<span style="color:#44aa44">✓ Signal transmitted — CTRL-7 acknowledging</span>';
  },2200);
}

function smDispense(){
  const out=document.getElementById('sm-dispense-out');
  if(!out)return;
  const drugs=['CALM-7 — 5mg — queued for suit port injection','STIM-A2 — 5mg top-up — administered','G-BLOCK — 1mg — injected via suit port'];
  out.innerHTML=`<span style="color:#ffaa00">⚕ ${drugs[Math.floor(Math.random()*drugs.length)]}</span>`;
  setTimeout(()=>{ out.innerHTML=''; },4000);
}

function suitCtrl(action){
  const out=document.getElementById('sm-suit-out');
  const msgs={
    SEAL:'Suit re-sealed. All ports locked. Pressure: 101.3 kPa.',
    PURGE:'Air purge cycle initiated. CO2 scrubber flushed. 18 seconds.',
    COOL:'Cooling cycle active. Target: 20.0°C. ETA 45 seconds.',
    O2:'O2 boost: +2% for 60 seconds. Saturation should reach 99.5%.',
    DRUG:'Drug dispenser port opened. Awaiting dose request.',
    EMERG:'⚠ EMERGENCY PROTOCOL — life support to max — SMILE alerting CTRL-7',
  };
  if(out){ out.innerHTML=`<span style="color:${action==='EMERG'?'#ff3300':'#ffaa00'}">${msgs[action]}</span>`; }
}

// ======= SMILE MASTER LOOP ========= 
function smailyLoop(){
  if (!appState.visible || !pageIsActive('page-smaily')) {
    smailyLoopActive = false;
    return;
  }
  const medActive=document.getElementById('smpage-med')?.classList.contains('active');
  const bioActive=document.getElementById('smpage-bio')?.classList.contains('active');
  const combatActive=document.getElementById('smpage-combat')?.classList.contains('active');
  const suitActive=document.getElementById('smpage-suit')?.classList.contains('active');
  if(medActive) smDrawWave();
  if(bioActive){ smDrawECG(); smDrawBody(); }
  if(combatActive) smDrawSignal();
  if(suitActive){ smDrawSuit(); smDrawEnvRings(); }
  requestAnimationFrame(smailyLoop);
}

function startSmailyLoop(){
  if (smailyLoopActive) return;
  smailyLoopActive = true;
  smailyLoop();
}

function stopSmailyLoop(){
  smailyLoopActive = false;
}

  // ========== ГЛИТЧИ ДЛЯ ЛОГОТИПА-ШЕСТЕРЁНКИ ==========
const gearLogo = document.querySelector('.gear-logo');

function glitchGear() {
  if (!gearLogo) return;
  
  if (Math.random() < 0.2) {
    gearLogo.classList.add('glitch-instant');
    setTimeout(() => {
      gearLogo.classList.remove('glitch-instant');
    }, 200);
  }
  
  if (Math.random() < 0.05) {
    gearLogo.classList.add('critical-glitch');
    setTimeout(() => {
      gearLogo.classList.remove('critical-glitch');
    }, 400);
  }
}

setInterval(glitchGear, 7000);

// ========== ЗАЩИТА СКРОЛЛА ПРИ ДОБАВЛЕНИИ ЛОГОВ И УВЕДОМЛЕНИЙ ==========
let lastScrollPosition = 0;
let isUpdatingScroll = false;

// Сохраняем позицию при скролле
window.addEventListener('scroll', () => {
  if (!isUpdatingScroll) {
    lastScrollPosition = window.scrollY;
  }
});

// Функция для безопасного добавления контента с сохранением скролла
function addContentWithScrollProtection(callback) {
  const currentScroll = window.scrollY;
  isUpdatingScroll = true;
  
  // Выполняем изменение DOM
  callback();
  
  // Восстанавливаем позицию на следующем кадре
  requestAnimationFrame(() => {
    window.scrollTo({
      top: currentScroll,
      behavior: 'auto'
    });
    setTimeout(() => {
      isUpdatingScroll = false;
    }, 50);
  });
}

// ПЕРЕОПРЕДЕЛЯЕМ функцию addLogToAll (сохраняем скролл)
const originalAddLogToAll = window.addLogToAll;
if (originalAddLogToAll) {
  window.addLogToAll = function(tag, message, type = 'sys') {
    addContentWithScrollProtection(() => {
      originalAddLogToAll(tag, message, type);
    });
  };
}

// ПЕРЕОПРЕДЕЛЯЕМ showSocaToast (чтобы не дёргало скролл)
const originalShowSocaToast = window.showSocaToast;
if (originalShowSocaToast) {
  window.showSocaToast = function(message, isError = false) {
    // Удаляем старый тост если есть
    const oldToast = document.querySelector('.soca-toast');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'soca-toast';
    toast.style.borderLeftColor = isError ? 'var(--red)' : 'var(--b)';
    toast.innerHTML = `
      <div class="toast-header">
        <span>⛭ SOCA_ALERT</span>
      </div>
      <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // Автоматическое исчезновение через 5 секунд
    setTimeout(() => {
      if (toast && toast.parentNode) toast.remove();
    }, 5000);
  };
}

// Функция addLiveLog тоже обновляем
const originalAddLiveLog = window.addLiveLog;
if (originalAddLiveLog) {
  window.addLiveLog = function() {
    addContentWithScrollProtection(() => {
      originalAddLiveLog();
    });
  };
}

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
    setTimeout(() => setFavicon('⛭'), 80);
    setTimeout(() => setFavicon('⚙'), 160);
    setTimeout(() => setFavicon('⛭'), 240);
    return;
  }
}

// Запускаем нормальную шестерёнку
setFavicon('⛭');

// Глитчи каждые 4-8 секунд
setInterval(() => {
  if (document.hidden) return;
  if (Math.random() < 0.35) {
    glitchFavicon();
  }
}, 5000);

// Эффект "рывка" (быстрое дёрганье)
setInterval(() => {
  if (document.hidden) return;
  if (Math.random() < 0.2) {
    setFavicon('⚙', 5);
    setTimeout(() => setFavicon('⛭', -3), 60);
    setTimeout(() => setFavicon('⚙', 3), 120);
    setTimeout(() => setFavicon('⛭', 0), 180);
  }
}, 7000);

// Редкий критический глитч
setInterval(() => {
  if (document.hidden) return;
  if (Math.random() < 0.08) {
    setFavicon('?');
    setTimeout(() => setFavicon('⛭'), 150);
    setTimeout(() => setFavicon('?'), 250);
    setTimeout(() => setFavicon('⛭'), 350);
  }
}, 12000);

// ========== ПЕРЕКЛЮЧЕНИЕ КОНТАКТОВ В ЧАТЕ ==========

// ========== ПЕРЕКЛЮЧЕНИЕ КОНТАКТОВ В ЧАТЕ ==========

function initChatContacts() {
  const contacts = document.querySelectorAll('.chat-contact');
  const chatOverlay = document.getElementById('chat-overlay');
  const chatTitle = document.querySelector('.chat-overlay .panel-header .title');
  const chatBody = document.getElementById('chat-body');
  
  // Элементы для смены стиля
  const botAvatar = document.querySelector('.chat-message.bot .chat-avatar');
  const botLabel = document.querySelector('.chat-message.bot .chat-label');
  const sendBtn = document.querySelector('.chat-send');
  const inputField = document.querySelector('.chat-input');
  const inputRow = document.querySelector('.chat-input-row');
  
  contacts.forEach(contact => {
    contact.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const contactName = contact.querySelector('.chat-contact-name')?.textContent || 'SOCA';
      const isSmaily = contactName === 'SMILE';
      
// Заблокированные и разблокированные пилоты
      if (contact.classList.contains('locked')) {
        const pilotId = contact.dataset.contact;
if (pilotId === 'pilot02' || pilotId === 'pilot03') {
          contacts.forEach(c => c.classList.remove('active'));
          contact.classList.add('active');
          chatOverlay.classList.remove('smaily-mode');
          chatOverlay.classList.remove('smaily-mode');
          if (sendBtn) { sendBtn.style.borderColor = ''; sendBtn.style.color = ''; sendBtn.style.background = ''; }
          if (inputField) { inputField.style.borderColor = ''; inputField.style.color = ''; }
          if (inputRow) { inputRow.style.borderTopColor = ''; }
          if (chatTitle) chatTitle.innerHTML = `// SECURE_COMMS_CHANNEL // ${contactName}`;
          if (chatBody) {
            chatBody.innerHTML = '';
            if (pilotId === 'pilot03') {
               const alphaLog = [
  { date: 'PD-04 // DAY ████ // 14 APR 1973', msgs: [
    { from: 'koko', time: 'PD-04 // 11:02', text: 'Heyyyy how are you?' },
    { from: 'koko', time: 'PD-04 // 11:07', text: 'SOCA says its okay to write here, just so you know!' },
    { from: 'koko', time: 'PD-04 // 11:17', text: 'Youre such a busy person' },
  ]},
  { date: 'PD-04 // DAY ████ // 25 APR 1973', msgs: [
    { from: 'koko', time: 'PD-04 // 14:33', text: 'Are your letters on a paid plan???' },
    { from: 'koko', time: 'PD-04 // 14:33', text: 'Or do you just not know how to type' },
  ]},
  { date: 'PD-04 // DAY ████ // 03 MAY 1973', msgs: [
    { from: 'koko', time: 'PD-04 // 09:10', text: '<img src="картинк/alpha.jpg" style="width:100%;max-width:110px;max-height:110px;border:1px solid var(--border);display:block;cursor:pointer;" onclick="this.style.maxWidth=this.style.maxWidth===\'none\'?\'110px\':\'none\';this.style.maxHeight=this.style.maxHeight===\'none\'?\'110px\':\'none\'">' },
    { from: 'koko', time: 'PD-04 // 09:10', text: 'thats you' },
    { from: 'koko', time: 'PD-04 // 09:45', text: 'Wanna fly to Pluto later??? Its SO cool there!!!!' },
    { from: 'koko', time: 'PD-04 // 09:45', text: 'Ill take your silence as a yes' },
  ]},
  { date: 'PD-04 // DAY ████ // 15 MAY 1973', msgs: [
    { from: 'koko', time: 'PD-04 // 16:20', text: 'What do I do if SOCA stopped following my commands?' },
    { from: 'koko', time: 'PD-04 // 16:22', text: 'Right! Thank you Alpha!!!' },
  ]},
  { date: 'PD-04 // DAY ████ // 21 MAY 1973', msgs: [
    { from: 'koko', time: 'PD-04 // 20:05', text: 'I almost beat your record' },
    { from: 'koko', time: 'PD-04 // 20:05', text: 'I will beat it.... someday' },
  ]},
  { date: 'PD-04 // DAY ████ // 14 JUN 1973', msgs: [
    { from: 'koko', time: 'PD-04 // 13:11', text: 'Why do you think Pandemonium still hasnt exploded?' },
    { from: 'koko', time: 'PD-04 // 13:12', text: 'You really think so???' },
    { from: 'koko', time: 'PD-04 // 13:14', text: 'Youre so cool' },
    { from: 'alpha', time: 'PD-04 // 13:59', text: '👍' }, 
  ]},
  { date: 'PD-04 // DAY ████ // 5 NOV 1973', msgs: [
    { from: 'alpha', time: 'PD-04 // 21:37', text: '<div onclick="openGames();launchGame(\'battleship\')" style="border:1px solid rgba(0,180,255,0.6);background:rgba(0,20,10,0.6);padding:10px 12px;cursor:pointer;min-width:170px;transition:all .25s" onmouseover="this.style.background=\'rgba(0, 19, 40, 0.7)\';this.style.borderColor=\'rgba(0,180,255,0.6)\'" onmouseout="this.style.background=\'rgba(0, 15, 55, 0.6)\';this.style.borderColor=\'rgba(0,180,255,0.6)\'"><div style="font-size:8px;color:var(--dimmer);letter-spacing:0.16em;margin-bottom:5px">▶ INCOMING GAME INVITE</div><div style="font-family:\'VT323\',monospace;font-size:18px;color:var(--g);letter-spacing:0.1em;text-shadow:0 0 8px rgba(0,180,255,0.6)">COSMIC BATTLESHIP</div><div style="font-size:8px;color:var(--dim);letter-spacing:0.1em;margin-top:5px">// tap to accept</div></div>' },
  ]},
];
              alphaLog.forEach(day => {
                const dateDiv = document.createElement('div');
                dateDiv.style.cssText = 'text-align:center;font-size:9px;color:var(--dimmer);letter-spacing:0.14em;margin:10px 0 4px;';
                dateDiv.textContent = `— ${day.date} —`;
                chatBody.appendChild(dateDiv);
                day.msgs.forEach(m => {
                  const isKoko = m.from === 'koko';
                  const wrap = document.createElement('div');
                  wrap.className = `chat-message ${isKoko ? 'user' : 'bot'}`;
                  wrap.innerHTML = `
                    ${!isKoko ? '<div class="chat-avatar" style="font-size:13px;display:flex;align-items:center;justify-content:center;">=^..^=</div>' : ''}
                    <div class="chat-bubble">
                      <span class="chat-label" style="${isKoko ? '' : 'color:var(--g);'}">${isKoko ? 'KOKO >_' : 'ALPHA >_'} <span style="opacity:0.4;font-size:8px;margin-left:6px;">${m.time}</span></span>
                      <span class="chat-text">${m.text}</span>
                    </div>
                  `;
                  chatBody.appendChild(wrap);
                });
              });
              chatBody.scrollTop = chatBody.scrollHeight;
            }
            // --- НОВЫЙ ДИАЛОГ С КЛАВДИЕЙ ---
    if (pilotId === 'pilot02') {
      const claudiaLog = [
        { date: 'PD-04 // DAY ████ // 03 MAR 1973', msgs: [
          { from: 'koko', time: 'PD-04 // 09:47', text: 'claudiaaaaa' },
          { from: 'koko', time: 'PD-04 // 09:47', text: 'im bored' },
          { from: 'koko', time: 'PD-04 // 09:48', text: 'what are you doing?' },
          { from: 'claudia', time: 'PD-04 // 09:52', text: 'Drinking tea, do not disturb.' },
          { from: 'koko', time: 'PD-04 // 09:53', text: 'can i come' },
          { from: 'claudia', time: 'PD-04 // 09:53', text: 'No.' },
          { from: 'koko', time: 'PD-04 // 09:54', text: ':(' },
          { from: 'claudia', time: 'PD-04 // 09:55', text: 'You broke something again, didnt you?' },
          { from: 'koko', time: 'PD-04 // 09:55', text: 'NOOOO' },
          { from: 'koko', time: 'PD-04 // 09:56', text: 'okay maybe a little bit' },
          { from: 'koko', time: 'PD-04 // 09:56', text: 'but i fixed it!!' },
          { from: 'claudia', time: 'PD-04 // 09:57', text: 'What did you fix???' },
          { from: 'koko', time: 'PD-04 // 09:58', text: 'the door' },
          { from: 'claudia', time: 'PD-04 // 09:58', text: 'Which door?' },
          { from: 'koko', time: 'PD-04 // 09:59', text: 'the one to the medbay' },
          { from: 'claudia', time: 'PD-04 // 10:00', text: 'Koko.' },
          { from: 'koko', time: 'PD-04 // 10:01', text: 'LOOK I CLOSED IT AND IT WOULDNT OPEN' },
          { from: 'koko', time: 'PD-04 // 10:01', text: 'NOT MY FAULT' },
          { from: 'claudia', time: 'PD-04 // 10:02', text: 'You closed it or you LOCKED it.' },
          { from: 'koko', time: 'PD-04 // 10:02', text: 'i just wanted to see whats inside' },
          { from: 'koko', time: 'PD-04 // 10:03', text: 'and it closed on me' },
          { from: 'koko', time: 'PD-04 // 10:04', text: 'and now Alpha is stuck inside' },
          { from: 'koko', time: 'PD-04 // 10:04', text: 'but hes been there for 3 hours' },
          { from: 'koko', time: 'PD-04 // 10:05', text: 'hes fine' },
          { from: 'claudia', time: 'PD-04 // 10:06', text: 'KOKO.' },
          { from: 'koko', time: 'PD-04 // 10:06', text: 'WHAT' },
          { from: 'claudia', time: 'PD-04 // 10:07', text: 'Go open the door.' },
          { from: 'koko', time: 'PD-04 // 10:08', text: 'i tried' },
          { from: 'koko', time: 'PD-04 // 10:08', text: 'it wont open' },
          { from: 'claudia', time: 'PD-04 // 10:09', text: 'Did you press the button?' },
          { from: 'koko', time: 'PD-04 // 10:09', text: 'YES' },
          { from: 'koko', time: 'PD-04 // 10:10', text: 'well' },
          { from: 'koko', time: 'PD-04 // 10:10', text: 'probably not the right one' },
          { from: 'claudia', time: 'PD-04 // 10:11', text: 'Koko.' },
          { from: 'koko', time: 'PD-04 // 10:12', text: 'IM GOING' },
          { from: 'koko', time: 'PD-04 // 10:12', text: 'IM ALREADY GOING' },
          { from: 'koko', time: 'PD-04 // 10:13', text: 'thanks youre the best' },
          { from: 'claudia', time: 'PD-04 // 10:14', text: 'I know.' },
        ]},
        { date: 'PD-04 // DAY ████ // 07 MAR 1973', msgs: [
          { from: 'koko', time: 'PD-04 // 16:21', text: 'CLAUDIA' },
          { from: 'koko', time: 'PD-04 // 16:21', text: 'guess what' },
          { from: 'claudia', time: 'PD-04 // 16:23', text: 'What?' },
          { from: 'koko', time: 'PD-04 // 16:24', text: 'I BEAT ALPHA TODAY' },
          { from: 'claudia', time: 'PD-04 // 16:25', text: 'In what?' },
          { from: 'koko', time: 'PD-04 // 16:26', text: 'we were running' },
          { from: 'koko', time: 'PD-04 // 16:26', text: 'i got there first' },
          { from: 'claudia', time: 'PD-04 // 16:27', text: 'You got there first or he let you win?' },
          { from: 'koko', time: 'PD-04 // 16:28', text: 'HEY' },
          { from: 'koko', time: 'PD-04 // 16:28', text: 'I WON FAIR AND SQUARE' },
          { from: 'koko', time: 'PD-04 // 16:29', text: 'okay' },
          { from: 'koko', time: 'PD-04 // 16:29', text: 'almost' },
          { from: 'claudia', time: 'PD-04 // 16:30', text: 'Explain.' },
          { from: 'koko', time: 'PD-04 // 16:31', text: 'he tripped' },
          { from: 'koko', time: 'PD-04 // 16:31', text: 'i helped him up' },
          { from: 'koko', time: 'PD-04 // 16:32', text: 'and he said "lets go again"' },
          { from: 'koko', time: 'PD-04 // 16:32', text: 'i said "no i already won"' },
          { from: 'koko', time: 'PD-04 // 16:33', text: 'and he said "okay"' },
          { from: 'koko', time: 'PD-04 // 16:33', text: 'SO I WON' },
          { from: 'claudia', time: 'PD-04 // 16:34', text: 'Koko.' },
          { from: 'koko', time: 'PD-04 // 16:35', text: 'WHAT' },
          { from: 'claudia', time: 'PD-04 // 16:36', text: 'Thats not winning, thats cheating.' },
          { from: 'koko', time: 'PD-04 // 16:36', text: 'ITS STRATEGY' },
          { from: 'claudia', time: 'PD-04 // 16:37', text: 'Its not strategy.' },
          { from: 'claudia', time: 'PD-04 // 16:38', text: 'Its helping a friend and claiming victory.' },
          { from: 'koko', time: 'PD-04 // 16:39', text: 'sounds like strategy to me' },
          { from: 'claudia', time: 'PD-04 // 16:40', text: '...Fine??' },
        ]},
        { date: 'PD-04 // DAY ████ // 15 MAR 1973', msgs: [
          { from: 'koko', time: 'PD-04 // 12:11', text: 'CLAUDIA' },
          { from: 'koko', time: 'PD-04 // 12:11', text: 'I HAVE AN IDEA' },
          { from: 'claudia', time: 'PD-04 // 12:13', text: 'Oh no.' },
          { from: 'claudia', time: 'PD-04 // 12:13', text: 'What now?' },
          { from: 'koko', time: 'PD-04 // 12:14', text: 'LETS HAVE A PICNIC' },
          { from: 'koko', time: 'PD-04 // 12:14', text: 'ON THE SHIP' },
          { from: 'koko', time: 'PD-04 // 12:15', text: 'IN THE HANGAR' },
          { from: 'claudia', time: 'PD-04 // 12:16', text: 'In the hangar.' },
          { from: 'koko', time: 'PD-04 // 12:17', text: 'YES' },
          { from: 'koko', time: 'PD-04 // 12:17', text: 'ITS SO PRETTY THERE' },
          { from: 'koko', time: 'PD-04 // 12:18', text: 'YOU CAN SEE THE STARS' },
          { from: 'koko', time: 'PD-04 // 12:18', text: 'AND ITS WARM' },
          { from: 'koko', time: 'PD-04 // 12:19', text: 'WELL ALMOST' },
          { from: 'claudia', time: 'PD-04 // 12:20', text: 'Koko. The hangar has no atmosphere.' },
          { from: 'koko', time: 'PD-04 // 12:21', text: 'details' },
          { from: 'koko', time: 'PD-04 // 12:21', text: 'we can wear suits' },
          { from: 'koko', time: 'PD-04 // 12:22', text: 'IT WILL BE FUN' },
          { from: 'claudia', time: 'PD-04 // 12:23', text: 'You want to have a picnic in spacesuits.' },
          { from: 'koko', time: 'PD-04 // 12:24', text: 'YES' },
          { from: 'koko', time: 'PD-04 // 12:24', text: 'HISTORIC MOMENT' },
          { from: 'claudia', time: 'PD-04 // 12:25', text: 'We will die.' },
          { from: 'koko', time: 'PD-04 // 12:26', text: 'maybe' },
          { from: 'koko', time: 'PD-04 // 12:26', text: 'but it will be fun' },
          { from: 'koko', time: 'PD-04 // 12:27', text: 'SMILE said its a good idea' },
          { from: 'claudia', time: 'PD-04 // 12:28', text: 'SMILE is a medical AI, he is not qualified for survival decisions.' },
          { from: 'koko', time: 'PD-04 // 12:29', text: 'BUT ITS A PICNIC' },
          { from: 'koko', time: 'PD-04 // 12:29', text: 'WHAT COULD GO WRONG' },
          { from: 'claudia', time: 'PD-04 // 12:30', text: 'Everything.' },
          { from: 'claudia', time: 'PD-04 // 12:31', text: 'Absolutely everything.' },
          { from: 'claudia', time: 'PD-04 // 12:32', text: 'But...' },
          { from: 'claudia', time: 'PD-04 // 12:33', text: 'If you bring tea.' },
          { from: 'koko', time: 'PD-04 // 12:34', text: 'IM GOING' },
          { from: 'koko', time: 'PD-04 // 12:34', text: 'IM ALREADY GOING' },
          { from: 'koko', time: 'PD-04 // 12:35', text: 'I LOVE YOU' },
          { from: 'claudia', time: 'PD-04 // 12:36', text: 'I know.' },
          { from: 'koko', time: 'PD-04 // 12:37', text: 'you said "but"???' },
          { from: 'koko', time: 'PD-04 // 12:37', text: 'IS THAT A YES???' },
          { from: 'claudia', time: 'PD-04 // 12:38', text: 'Koko.' },
          { from: 'koko', time: 'PD-04 // 12:39', text: 'WHAT' },
          { from: 'claudia', time: 'PD-04 // 12:40', text: 'Bring the tea, then we will talk.' },
          { from: 'koko', time: 'PD-04 // 12:41', text: 'IM ALREADY ON MY WAY' },
          { from: 'koko', time: 'PD-04 // 12:41', text: 'THANK YOU YOURE THE BEST' },
          { from: 'claudia', time: 'PD-04 // 12:42', text: 'I know.' },
        ]},
        { date: 'PD-04 // DAY ████ // 22 MAR 1973', msgs: [
          { from: 'koko', time: 'PD-04 // 19:04', text: 'CLAUDIA' },
          { from: 'claudia', time: 'PD-04 // 19:06', text: 'What now?' },
          { from: 'koko', time: 'PD-04 // 19:07', text: 'ALPHA CALLED ME SHORT' },
          { from: 'koko', time: 'PD-04 // 19:07', text: 'IM NOT SHORT' },
          { from: 'claudia', time: 'PD-04 // 19:08', text: 'You are 169 cm.' },
          { from: 'koko', time: 'PD-04 // 19:09', text: 'THATS NORMAL' },
          { from: 'koko', time: 'PD-04 // 19:09', text: 'YOURE JUST TALL' },
          { from: 'claudia', time: 'PD-04 // 19:10', text: 'I am 177 cm.' },
          { from: 'koko', time: 'PD-04 // 19:11', text: 'youre a girl' },
          { from: 'koko', time: 'PD-04 // 19:11', text: 'youre supposed to be tall' },
          { from: 'claudia', time: 'PD-04 // 19:12', text: 'Koko.' },
          { from: 'koko', time: 'PD-04 // 19:13', text: 'WHAT' },
          { from: 'claudia', time: 'PD-04 // 19:14', text: 'That is not how it works.' },
          { from: 'koko', time: 'PD-04 // 19:15', text: 'well' },
          { from: 'koko', time: 'PD-04 // 19:15', text: 'Alpha is 155' },
          { from: 'koko', time: 'PD-04 // 19:16', text: 'HE CANT CALL ME SHORT' },
          { from: 'claudia', time: 'PD-04 // 19:17', text: 'Did you call him short.' },
          { from: 'koko', time: 'PD-04 // 19:18', text: 'yeah' },
          { from: 'koko', time: 'PD-04 // 19:18', text: 'so what' },
          { from: 'koko', time: 'PD-04 // 19:19', text: 'its true' },
          { from: 'claudia', time: 'PD-04 // 19:20', text: 'And what did he say.' },
          { from: 'koko', time: 'PD-04 // 19:21', text: 'he said "okay"' },
          { from: 'koko', time: 'PD-04 // 19:21', text: 'and walked away' },
          { from: 'koko', time: 'PD-04 // 19:22', text: 'BUT I SAW HIM SMILING' },
          { from: 'koko', time: 'PD-04 // 19:22', text: 'HE KNOWS' },
          { from: 'koko', time: 'PD-04 // 19:23', text: 'HE KNOWS HES SHORT' },
          { from: 'koko', time: 'PD-04 // 19:23', text: 'HE DOESNT CARE' },
          { from: 'claudia', time: 'PD-04 // 19:24', text: 'Maybe he just doesnt care.' },
          { from: 'koko', time: 'PD-04 // 19:25', text: 'well' },
          { from: 'koko', time: 'PD-04 // 19:25', text: 'then i dont care either' },
          { from: 'koko', time: 'PD-04 // 19:26', text: 'BUT IM STILL NOT SHORT' },
          { from: 'claudia', time: 'PD-04 // 19:27', text: 'You are short.' },
          { from: 'koko', time: 'PD-04 // 19:28', text: 'HEY' },
          { from: 'koko', time: 'PD-04 // 19:28', text: 'YOURE SUPPOSED TO BE ON MY SIDE' },
          { from: 'claudia', time: 'PD-04 // 19:29', text: 'I am on the side of truth.' },
          { from: 'koko', time: 'PD-04 // 19:30', text: ':(((' },

        ]},
        { date: 'PD-04 // DAY ████ // 29 MAR 1973', msgs: [
          { from: 'koko', time: 'PD-04 // 08:42', text: 'CLAUDIA' },
          { from: 'koko', time: 'PD-04 // 08:42', text: 'I CLEANED SHIP TODAY' },
          { from: 'claudia', time: 'PD-04 // 08:44', text: 'Really?' },
          { from: 'koko', time: 'PD-04 // 08:45', text: 'well' },
          { from: 'koko', time: 'PD-04 // 08:45', text: 'almost' },
          { from: 'koko', time: 'PD-04 // 08:46', text: 'I moved one thing' },
          { from: 'claudia', time: 'PD-04 // 08:47', text: 'One thing?' },
          { from: 'koko', time: 'PD-04 // 08:48', text: 'one thing from the floor' },
          { from: 'koko', time: 'PD-04 // 08:48', text: 'thats progress' },
          { from: 'claudia', time: 'PD-04 // 08:49', text: 'You moved one thing from the floor and called it cleaning.' },
          { from: 'koko', time: 'PD-04 // 08:50', text: 'YES' },
          { from: 'koko', time: 'PD-04 // 08:50', text: 'its a start' },
          { from: 'koko', time: 'PD-04 // 08:51', text: 'tomorrow I will move another one' },
          { from: 'koko', time: 'PD-04 // 08:51', text: 'and the day after another one' },
          { from: 'koko', time: 'PD-04 // 08:52', text: 'in a month it will be spotless' },
          { from: 'claudia', time: 'PD-04 // 08:53', text: 'That is... strange logic.' },
          { from: 'koko', time: 'PD-04 // 08:54', text: 'ITS STRATEGY' },
          { from: 'koko', time: 'PD-04 // 08:54', text: 'you wouldnt understand' },
          { from: 'claudia', time: 'PD-04 // 08:55', text: 'I suppose not.' },
          { from: 'koko', time: 'PD-04 // 08:56', text: 'see' },
          { from: 'koko', time: 'PD-04 // 08:56', text: 'you just havent reached my level yet' },
          { from: 'claudia', time: 'PD-04 // 08:57', text: 'Probably not.' },
          { from: 'koko', time: 'PD-04 // 08:58', text: 'its okay' },
          { from: 'koko', time: 'PD-04 // 08:58', text: 'not everyone can be as talented as me' },
          { from: 'claudia', time: 'PD-04 // 08:59', text: 'Koko.' },
          { from: 'koko', time: 'PD-04 // 09:00', text: 'WHAT' },
          { from: 'claudia', time: 'PD-04 // 09:01', text: 'Go move the second thing.' },
          { from: 'koko', time: 'PD-04 // 09:02', text: 'but' },
          { from: 'koko', time: 'PD-04 // 09:02', text: 'i already moved one' },
          { from: 'koko', time: 'PD-04 // 09:03', text: 'thats my limit for today' },
        ]},

        { date: 'PD-04 // DAY ████ // 5 APR 1973', msgs: [
          { from: 'koko', time: 'PD-04 // 4:42', text: 'Claudia'},
          { from: 'koko', time: 'PD-04 // 4:42', text: 'Claudia'},
          { from: 'koko', time: 'PD-04 // 4:43', text: 'say something in this...'},
          { from: 'koko', time: 'PD-04 // 4:44', text:'uh'},
          { from: 'koko', time: 'PD-04 // 4:44', text:' in Russian, you know!!'},
          { from: 'claudia', time: 'PD-04 // 08:57', text: 'Приберись уже на корабле.'},
          { from: 'koko', time: 'PD-04 // 8:58', text:'Amazing!!!'},
        ]},
      ]
  

      claudiaLog.forEach(day => {
        const dateDiv = document.createElement('div');
        dateDiv.style.cssText = 'text-align:center;font-size:9px;color:var(--dimmer);letter-spacing:0.14em;margin:10px 0 4px;';
        dateDiv.textContent = `— ${day.date} —`;
        chatBody.appendChild(dateDiv);
        day.msgs.forEach(m => {
          const isKoko = m.from === 'koko';
          const isClaudia = m.from === 'claudia';
          const wrap = document.createElement('div');
          wrap.className = `chat-message ${isKoko ? 'user' : 'bot'}`;
          wrap.innerHTML = `
            ${!isKoko && isClaudia ? '<div class="chat-avatar" style="font-size:13px;display:flex;align-items:center;justify-content:center;color:var(--b);border-color:rgba(0,200,255,0.4);">☾</div>' : ''}
            <div class="chat-bubble">
              <span class="chat-label" style="${isKoko ? '' : 'color:var(--b);'}">${isKoko ? 'KOKO >_' : 'CLAUDIA >_'} <span style="opacity:0.4;font-size:8px;margin-left:6px;">${m.time}</span></span>
              <span class="chat-text">${m.text}</span>
            </div>
          `;
          chatBody.appendChild(wrap);
        });
      });
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }
  return;
}
        if (typeof playError === 'function') playError();
        if (typeof appendChat === 'function') {
          appendChat(`ACCESS DENIED. ${contactName} is not available.`, 'bot');
        }
        return;
      }
      
      // Убираем active у всех
      contacts.forEach(c => c.classList.remove('active'));
      contact.classList.add('active');
      
      // ========== ПОЛНОСТЬЮ МЕНЯЕМ ЧАТ ДЛЯ SMILE ==========
      if (isSmaily) {
        // Заголовок
        if (chatTitle) chatTitle.innerHTML = '// SECURE_COMMS_CHANNEL // SMILE v2.1';
        
        // Класс для всего чата
        chatOverlay.classList.add('smaily-mode');
        
        // Аватар и лейбл в сообщениях
        if (botAvatar) {
          botAvatar.textContent = '✚';
          botAvatar.style.color = '#ffaa00';
          botAvatar.style.borderColor = 'rgba(255, 170, 0, 0.5)';
        }
        if (botLabel) {
          botLabel.textContent = 'SMILE >_';
          botLabel.style.color = '#ffaa00';
        }
        
        // Кнопка SEND
        if (sendBtn) {
          sendBtn.style.borderColor = 'rgba(255, 170, 0, 0.5)';
          sendBtn.style.color = '#ffaa00';
          sendBtn.style.background = 'rgba(255, 170, 0, 0.08)';
        }
        
        // Поле ввода
        if (inputField) {
          inputField.style.borderColor = 'rgba(255, 170, 0, 0.4)';
          inputField.style.color = '#ffaa00';
        }
        
        // Полоска внизу
        if (inputRow) {
          inputRow.style.borderTopColor = 'rgba(255, 170, 0, 0.4)';
        }
        
        // Очищаем чат и показываем приветствие SMILE
        if (chatBody) {
          chatBody.innerHTML = '';
          const welcomeMsg = document.createElement('div');
          welcomeMsg.className = 'chat-message bot';
          welcomeMsg.innerHTML = `
            <div class="chat-avatar" style="color:#ffaa00; border-color:rgba(255,170,0,0.5);">✚</div>
            <div class="chat-bubble">
              <span class="chat-label" style="color:#ffaa00;">SMILE >_</span>
              <span class="chat-text" style="color:#ffcc66;">SMILE online. Pilot vitals: NOMINAL. Heart rate: 113bpm. O2: 94%. Stress: MED ↑. How can I assist?</span>
            </div>
          `;
          chatBody.appendChild(welcomeMsg);
        }
        
      } else {
        // ========== ВОЗВРАЩАЕМ ОБЫЧНЫЙ РЕЖИМ SOCA ==========
        if (chatTitle) chatTitle.innerHTML = `// SECURE_COMMS_CHANNEL // ${contactName} v0.9.██`;
        
        chatOverlay.classList.remove('smaily-mode');
        
        // Возвращаем аватар и лейбл SOCA
        if (botAvatar) {
          botAvatar.textContent = '⛭';
          botAvatar.style.color = '';
          botAvatar.style.borderColor = '';
        }

        if (inputField) {
          inputField.style.borderColor = '';
          inputField.style.color = '';
        }
        if (inputRow) {
          inputRow.style.borderTopColor = '';
        }

        if (botLabel) {
          botLabel.textContent = 'SOCA >_';
          botLabel.style.color = '';
        }
        
        // Возвращаем кнопку SEND
        if (sendBtn) {
          sendBtn.style.borderColor = '';
          sendBtn.style.color = '';
          sendBtn.style.background = '';
        }
        
        // Возвращаем поле ввода
        if (inputField) {
          inputField.style.borderColor = '';
          inputField.style.color = '';
        }
        
        // Возвращаем полоску внизу
        if (inputRow) {
          inputRow.style.borderTopColor = '';
        }
        
        // Очищаем чат и показываем приветствие SOCA
        if (chatBody) {
          chatBody.innerHTML = '';
          const welcomeMsg = document.createElement('div');
          welcomeMsg.className = 'chat-message bot';
          welcomeMsg.innerHTML = `
            <div class="chat-avatar">⛭</div>
            <div class="chat-bubble">
              <span class="chat-label">SOCA >_</span>
              <span class="chat-text">Welcome back, Pilot. System status: DEGRADED. Engine B at 41%. Memory sector 7 leaking. Need anything else?</span>
            </div>
          `;
          chatBody.appendChild(welcomeMsg);
        }
      }
      
      // Эффект глитча при переключении
      if (chatBody) {
        chatBody.classList.add('ripple');
        setTimeout(() => chatBody.classList.remove('ripple'), 300);
      }
      
      if (typeof playClick === 'function') playClick();
    });
  });
}

// Запуск контактов чата
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatContacts);
} else {
  initChatContacts();
}

// ══════════════════════════════════════════════════════════════════════════
// ── SMILE RANDOM POPUP ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

const SMAILY_MEMES = [
  {
    img: 'картинк/memes/HELLO.png',
    caption: 'SMILE: HELLO, PILOT!! :D Welcome aboard!! I\'m so glad you\'re here!! How are you feeling??'
  },
  {
    img: 'картинк/memes/meme1.jpg',
    caption: 'SMILE: Pilot, I ran diagnostics on your last maneuver. The results are... artistic?'
  },
  {
    img: 'картинк/memes/meme2.jpg',
    caption: 'SMILE:  This is fine. Everything is fine. (It is not fine)'
  },
  {
    img: 'картинк/memes/meme3.jpg',
    caption: 'SMILE: I took the liberty of rating your piloting skills. 7/10. The 3 points are for effort.'
  },
  {
    img: 'картинк/memes/meme4.jpg',
    caption: 'SMILE: SOCA told me not to send this. I sent it anyway. Worth it!'
  },
  {
    img: 'картинк/memes/meme5.jpg',
    caption: 'SMILE: Stress levels detected: HIGH. Prescribed dosage: this image. You\'re welcome!'
  },
  {
    img: 'картинк/memes/meme6.jpg',
    caption: 'SMILE: I have completed my medical duties for the day. Now we laugh!'
  },
  {
    img: 'картинк/memes/meme7.jpg',
    caption: 'SMILE: Cortisol reduction protocol initiated. Step 1: look at this. Step 2: feel better. Step 3: there is no step 3.'
  },
  {
    img: 'картинк/memes/meme8.jpg',
    caption: 'SMILE: I found this in the ship\'s database. No idea how it got there. (I put it there?)'
  },
];

let smailyPopupActive = false;
let smailyPopupTimeout = null;

function showSmailyPopup() {
  // Don't stack popups
  if (smailyPopupActive) return;

  if (typeof window.playVoice === 'function') window.playVoice('smaily');
  else new Audio('sounds/СМАЙЛИ.mp3').play().catch(()=>{});

  const popup = document.getElementById('smaily-popup');
  if (!popup) return;

  // Pick random meme
  const meme = SMAILY_MEMES[Math.floor(Math.random() * SMAILY_MEMES.length)];

  // Random position on screen (avoid edges)
  const maxX = window.innerWidth  - 300;
  const maxY = window.innerHeight - 320;
  const x = Math.max(20, Math.floor(Math.random() * maxX));
  const y = Math.max(20, Math.floor(Math.random() * maxY));

  popup.style.left = x + 'px';
  popup.style.top  = y + 'px';

  document.getElementById('smaily-popup-img').src = meme.img;
  document.getElementById('smaily-popup-caption').textContent = meme.caption;

  popup.style.display = 'block';
  popup.style.animation = 'smailyPopupSlide 0.35s ease both';

  smailyPopupActive = true;

  // Auto-close after 18 seconds if player ignores it
  smailyPopupTimeout = setTimeout(() => {
    closeSmailyPopup();
  }, 18000);
}

function closeSmailyPopup() {
  const popup = document.getElementById('smaily-popup');
  if (!popup) return;
  popup.style.opacity = '0';
  popup.style.transform = 'scale(0.92)';
  setTimeout(() => {
    popup.style.display = 'none';
    popup.style.opacity = '';
    popup.style.transform = '';
    smailyPopupActive = false;
  }, 250);
  if (smailyPopupTimeout) { clearTimeout(smailyPopupTimeout); smailyPopupTimeout = null; }
}

// Schedule random popups - появляется раз в 2-5 минут
function scheduleSmailyPopup() {
  const delay = (120 + Math.random() * 180) * 1000; // 2-5 минут
  setTimeout(() => {
    showSmailyPopup();
    scheduleSmailyPopup(); // планируем следующий
  }, delay);
}

// Перетаскивание мем-попапа SMAILY (мышь + тач)
function initSmailyPopupDrag(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup || popup.dataset.dragReady) return;
  popup.dataset.dragReady = '1';

  const header = popup.querySelector('div > div');  // шапка (первый блок внутри рамки)
  if (header) header.style.cursor = 'grab';

  let dragging = false, startX = 0, startY = 0, baseX = 0, baseY = 0;

  function point(e){ const t = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e); return { x:t.clientX, y:t.clientY }; }

  function down(e){
    // не таскаем за кнопку [X] и не мешаем клику по ней
    if (e.target.closest('button')) return;
    dragging = true;
    const r = popup.getBoundingClientRect();
    baseX = r.left; baseY = r.top;
    const p = point(e); startX = p.x; startY = p.y;
    popup.style.transition = 'none';            // на время драга гасим transition:all
    if (header) header.style.cursor = 'grabbing';
    if (e.cancelable) e.preventDefault();
  }

  function move(e){
    if (!dragging) return;
    const p = point(e);
    let nx = baseX + (p.x - startX);
    let ny = baseY + (p.y - startY);
    const w = popup.offsetWidth, h = popup.offsetHeight, m = 40;
    nx = Math.max(m - w, Math.min(window.innerWidth  - m, nx));
    ny = Math.max(0,     Math.min(window.innerHeight - m, ny));
    popup.style.left = nx + 'px';
    popup.style.top  = ny + 'px';
    if (e.cancelable) e.preventDefault();
  }

  function up(){
    if (!dragging) return;
    dragging = false;
    popup.style.transition = '';
    if (header) header.style.cursor = 'grab';
  }

  popup.addEventListener('mousedown', down);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  popup.addEventListener('touchstart', down, { passive:false });
  window.addEventListener('touchmove', move, { passive:false });
  window.addEventListener('touchend', up);
  window.addEventListener('touchcancel', up);

  // картинки внутри не должны запускать нативный drag браузера
  popup.querySelectorAll('img').forEach(im => im.setAttribute('draggable', 'false'));
}
initSmailyPopupDrag('smaily-popup');
initSmailyPopupDrag('smaily-invite-popup');

// Первый popup - через 15 секунд, потом каждые 2-5 минут
setTimeout(() => {
  showSmailyPopup();
  scheduleSmailyPopup();
}, 90000);

// Для теста - раскомментируй чтобы увидеть сразу:
// setTimeout(showSmailyPopup, 3000);

const SMAILY_GAME_INVITES = [
  {
    img: 'картинк/memes/games1.jpg',
    caption: 'SMILE: Pilot! PILOT!! Hey, HEY! Come play BIO SWEEP. I planted the mines myself, personally!',
    game: 'minesweeper'
  },
  {
    img: 'картинк/memes/games2.jpg',
    caption: 'SMILE: Medical recommendation: play CARDIAC SYNC immediately, its therapeutic. Im a doctor, trust me!',
    game: 'heartbeat'
  },
  {
    img: 'картинк/memes/games3.jpg',
    caption: 'SMILE: I have been waiting for you in MEMORY SCAN for 47 minutes. The symbols miss you!',
    game: 'memory'
  },
  {
    img: 'картинк/memes/games1.jpg',
    caption: 'SMILE: SOCA says youre too busy for games. I disagree. Come prove her wrong. BIO SWEEP. Now.',
    game: 'minesweeper'
  },
  {
    img: 'картинк/memes/games3.jpg',
    caption: 'SMILE: Fun fact: pilots who play MEMORY SCAN live 12% longer. I made that up. But come play anyway! :P',
    game: 'memory'
  },
  {
    img: 'картинк/memes/games2.jpg',
    caption: 'SMILE: CARDIAC SYNC is just cardiology training. Its literally my job to make you play it. Please((',
    game: 'heartbeat'
  },
  {
    img: 'картинк/memes/games1.jpg',
    caption: 'SMILE: I redesigned BIO SWEEP three times for you. THREE!! The least you can do is play it once!',
    game: 'minesweeper'
  },
  {
    img: 'картинк/memes/games3.jpg',
    caption: 'SMILE: Your stress levels are elevated. My prescription: MEMORY SCAN, 1-2 rounds, stat. Non-negotiable!',
    game: 'memory'
  },
];

let smailyInviteActive = false;
let smailyInviteTimeout = null;

function showSmailyInvite() {
  if (smailyInviteActive) return;

  if (typeof window.playVoice === 'function') window.playVoice('smaily');
  else new Audio('sounds/СМАЙЛИ.mp3').play().catch(()=>{});

  const popup = document.getElementById('smaily-invite-popup');
  if (!popup) return;

  const meme = SMAILY_GAME_INVITES[Math.floor(Math.random() * SMAILY_GAME_INVITES.length)];

  // Позиция - противоположная сторона от мем-попапа чтобы не перекрывались
  const maxX = window.innerWidth  - 300;
  const maxY = window.innerHeight - 360;
  const x = Math.max(20, Math.floor(Math.random() * maxX));
  const y = Math.max(20, Math.floor(Math.random() * maxY));

  popup.style.left = x + 'px';
  popup.style.top  = y + 'px';

  document.getElementById('smaily-invite-img').src = meme.img;

  document.getElementById('smaily-invite-caption').innerHTML = `
    <span>${meme.caption}</span>
    <div style="margin-top:10px;display:flex;gap:8px;align-items:center">
      <div onclick="closeSmailyInvite();openGames();launchGame('${meme.game}')"
           style="padding:5px 14px;border:1px solid #ffaa00;color:#ffcc00;font-size:10px;cursor:pointer;letter-spacing:0.1em;background:rgba(255,140,0,0.1);font-family:'Share Tech Mono',monospace"
           onmouseover="this.style.background='rgba(255,140,0,0.25)'"
           onmouseout="this.style.background='rgba(255,140,0,0.1)'">
        ▶ PLAY NOW!
      </div>
      <span style="font-size:8px;color:#443300;cursor:pointer;letter-spacing:0.08em"
            onclick="closeSmailyInviteWithReaction()">maybe later... :(</span>
    </div>
  `;

  popup.style.display = 'block';
  popup.style.animation = 'smailyPopupSlide 0.35s ease both';
  smailyInviteActive = true;

  smailyInviteTimeout = setTimeout(closeSmailyInvite, 22000);
}

function closeSmailyInvite() {
  const popup = document.getElementById('smaily-invite-popup');
  if (!popup) return;
  popup.style.opacity = '0';
  popup.style.transform = 'scale(0.92)';
  setTimeout(() => {
    popup.style.display = 'none';
    popup.style.opacity = '';
    popup.style.transform = '';
    smailyInviteActive = false;
  }, 250);
  if (smailyInviteTimeout) { clearTimeout(smailyInviteTimeout); smailyInviteTimeout = null; }
}

// Расписание инвайтов - раз в 3-6 минут, вперемешку с мемами
function scheduleSmailyInvite() {
  const delay = (180 + Math.random() * 180) * 1000; // 3-6 минут
  setTimeout(() => {
    showSmailyInvite();
    scheduleSmailyInvite();
  }, delay);
}

function closeSmailyInviteWithReaction() {
  // Снимаем позицию попапа ДО закрытия
  const popup = document.getElementById('smaily-invite-popup');
  const rect = popup ? popup.getBoundingClientRect() : null;

  closeSmailyInvite();

  if (!rect) return;

  // Смайлик появляется в центре закрытого попапа
  const sad = document.createElement('div');
  sad.id = 'smaily-sad-face';
  sad.textContent = ':(';
  sad.style.cssText = `
    position: fixed;
    z-index: 9993;
    font-family: 'SMAILY', 'VT323', monospace;
    font-size: 48px;
    color: #ffaa00;
    text-shadow: 0 0 16px rgba(255,140,0,0.5);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
    left: ${rect.left + rect.width / 2 - 30}px;
    top: ${rect.top + rect.height / 2 - 30}px;
  `;
  document.body.appendChild(sad);

  // Появляется
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { sad.style.opacity = '1'; });
  });

  // Через 2.5 секунды добавляет подпись
  setTimeout(() => {
    sad.style.fontSize = '14px';
    sad.style.lineHeight = '1.6';
    sad.style.textAlign = 'center';
    sad.style.color = '#886600';
    sad.style.textShadow = 'none';
    sad.style.fontFamily = "'Share Tech Mono', monospace";
    sad.innerHTML = `<span style="font-family:'SMAILY','VT323',monospace;font-size:36px;color:#ffaa00;text-shadow:0 0 12px rgba(255,140,0,0.4);display:block">:(</span>ok. i'll wait here.`;
  }, 2500);

  // Исчезает через 5 секунд
  setTimeout(() => {
    sad.style.opacity = '0';
    setTimeout(() => { sad.remove(); }, 400);
  }, 5000);
}

// Первый инвайт - через 30 секунд, потом каждые 3-6 минут
setTimeout(() => {
  showSmailyInvite();
  scheduleSmailyInvite();
}, 240000);

// Для теста
setTimeout(showSmailyInvite, 5000);

// ===== ПРИВЕТСТВЕННЫЙ ПОПАП СМАЙЛИ (через 10 секунд после открытия) =====
setTimeout(() => {
  // Проверяем, что сайт видим и попап ещё не открыт
  if (!document.hidden) {
    // Создаём специальный попап с приветствием
    const popup = document.getElementById('smaily-popup');
    if (!popup) return;
    
    // Берем первую картинку из массива (HELLO.png)
    const meme = SMAILY_MEMES[0];
    if (!meme) return;
    
    // Случайная позиция
    const maxX = window.innerWidth - 300;
    const maxY = window.innerHeight - 320;
    const x = Math.max(20, Math.floor(Math.random() * maxX));
    const y = Math.max(20, Math.floor(Math.random() * maxY));
    
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    document.getElementById('smaily-popup-img').src = meme.img;
    document.getElementById('smaily-popup-caption').textContent = meme.caption;
    
    popup.style.display = 'block';
    popup.style.animation = 'smailyPopupSlide 0.5s ease both';
    
    smailyPopupActive = true;
    
    // Воспроизводим звук СМАЙЛИ
    if (typeof window.playVoice === 'function') window.playVoice('smaily');
    else new Audio('sounds/СМАЙЛИ.mp3').play().catch(()=>{});
    
    // Авто-закрытие через 20 секунд
    setTimeout(() => {
      closeSmailyPopup();
    }, 20000);
  }
}, 5000);