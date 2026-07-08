(function () {
  'use strict';

  // === 1. Инжектируем CSS ===========================================
  const css = `
/* ── SMILE: аватар :) / :D в боковой панели ── */
.chat-avatar-small.smaily-face {
  font-family: 'VT323', monospace;
  font-size: 17px;
  letter-spacing: -0.05em;
  color: #ffcc00;
  background: #0a0800;
  border-color: rgba(255,200,0,0.5) !important;
  text-shadow: 0 0 7px rgba(255,200,0,0.55);
  transition: color .18s, background .18s, text-shadow .18s, transform .15s;
}
.chat-contact:hover .chat-avatar-small.smaily-face,
.chat-contact.active .chat-avatar-small.smaily-face {
  color: #0a0800;
  background: #ffcc00;
  text-shadow: none;
  transform: scale(1.08);
  border-color: #ffcc00 !important;
}

/* Аватар :) в области сообщений */
.smaily-msg-avatar {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; flex-shrink: 0;
  font-family: 'VT323', monospace;
  font-size: 18px; letter-spacing: -0.03em;
  color: #ffcc00; background: #0a0800;
  border: 1px solid rgba(255,200,0,0.45);
  text-shadow: 0 0 7px rgba(255,200,0,0.5);
  transition: color .18s, background .18s, text-shadow .18s;
  cursor: default;
}

/*  Полное уничтожение зелёного в smaily-mode */
.chat-overlay.smaily-mode .chat-body .chat-message {
  border-color: rgba(255,170,0,0.12) !important;
  background: rgba(0,0,0,0.2) !important;
}
.chat-overlay.smaily-mode .chat-body .chat-message.bot {
  border-color: rgba(255,170,0,0.15) !important;
  background: rgba(255,170,0,0.03) !important;
}
.chat-overlay.smaily-mode .chat-body .chat-message.bot .chat-bubble {
  background: rgba(255,170,0,0.07) !important;
  border-left: 2px solid #ffaa00 !important;
  border-right: none !important;
}
.chat-overlay.smaily-mode .chat-body .chat-message.user {
  border-color: rgba(255,170,0,0.1) !important;
  background: transparent !important;
}
.chat-overlay.smaily-mode .chat-body .chat-message.user .chat-bubble {
  background: rgba(255,170,0,0.05) !important;
  border-right: 2px solid rgba(255,170,0,0.6) !important;
  border-left: none !important;
}
.chat-overlay.smaily-mode .chat-body .chat-message.bot .chat-label {
  color: #ffaa00 !important;
}
.chat-overlay.smaily-mode .chat-body .chat-message.user .chat-label {
  color: rgba(255,170,0,0.6) !important;
}
.chat-overlay.smaily-mode .chat-body .chat-text {
  color: #ffcc66 !important;
  animation: none !important;
  text-shadow: none !important;
}
.chat-overlay.smaily-mode .chat-body .chat-message.bot .chat-text {
  color: #ffcc66 !important;
  animation: smailyChatGlitch 10s infinite !important;
}
.chat-overlay.smaily-mode .chat-body .chat-message.user .chat-text {
  color: #ffaa44 !important;
  animation: none !important;
}
@keyframes smailyChatGlitch {
  0%,94%,100% { text-shadow: none; }
  95% { text-shadow: -1px 0 #ff6600, 1px 0 #cc8800; transform: translateX(-.5px); }
  96% { text-shadow:  1px 0 #ff4400,-1px 0 #ffcc00; transform: translateX(.5px); }
  97% { text-shadow: none; transform: translateX(0); }
  98% { text-shadow: 0 0 3px #ff8800; }
}
.chat-overlay.smaily-mode .chat-body .chat-message.bot .chat-avatar {
  border-color: rgba(255,200,0,0.5) !important;
  color: #ffcc00 !important;
  background: #0a0800 !important;
  box-shadow: none !important;
  text-shadow: 0 0 6px rgba(255,200,0,0.5) !important;
  animation: none !important;
}
.chat-overlay.smaily-mode .chat-body .chat-avatar {
  animation: smailyAvatarPulse 3s ease-in-out infinite !important;
}
@keyframes smailyAvatarPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,170,0,0.2); }
  50%     { box-shadow: 0 0 0 2px rgba(255,170,0,0.4); }
}

/* === LOG тег SMILE === */
.log-tag.smaily {
  border: 1px solid #ffaa00 !important;
  color: #ffcc00 !important;
  background: rgba(255,170,0,0.06) !important;
  text-shadow: 0 0 4px rgba(255,170,0,0.45);
  animation: smailyTagPulse 3s ease-in-out infinite;
}
@keyframes smailyTagPulse {
  0%,80%,100% { opacity: 1; } 88% { opacity: 0.5; }
}
.log-message.smaily, .log-msg.smaily {
  color: #ffcc66 !important;
  font-style: italic;
}
.log-entry.smaily-entry {
  border-left: 2px solid rgba(255,170,0,0.35);
  background: rgba(255,170,0,0.025);
}
.log-entry-full.smaily-entry {
  border-left: 2px solid rgba(255,170,0,0.3);
  background: rgba(255,170,0,0.02);
}

/* === SMILE TOAST === */
.smaily-toast {
  position: fixed; bottom: 148px; right: 20px; z-index: 10002;
  background: rgba(12,9,0,0.97);
  border: 1px solid rgba(255,170,0,0.45);
  border-left: 3px solid #ffaa00;
  padding: 10px 14px; max-width: 285px;
  font-size: 11px; font-family: 'Share Tech Mono', monospace;
  box-shadow: 0 0 24px rgba(255,170,0,0.2);
  animation: smailyToastIn .28s ease;
  backdrop-filter: blur(4px); pointer-events: none;
}
@keyframes smailyToastIn {
  from { opacity: 0; transform: translateX(50px) skewX(-3deg); }
  to   { opacity: 1; transform: translateX(0) skewX(0); }
}
.smaily-toast-header {
  color: #ffaa00; font-size: 9px; letter-spacing: 0.18em;
  margin-bottom: 5px; display: flex; align-items: center; gap: 6px;
}
.smaily-toast-face {
  font-family: 'VT323', monospace; font-size: 15px; letter-spacing: -0.03em;
  animation: smFaceWiggle 2.5s ease-in-out infinite;
}
@keyframes smFaceWiggle {
  0%,88%,100% { transform: rotate(0) scale(1); }
  92% { transform: rotate(-10deg) scale(1.1); }
  96% { transform: rotate(8deg) scale(1.05); }
}
.smaily-toast-body   { color: #ffcc66; line-height: 1.6; }
.smaily-toast-vitals {
  margin-top: 5px; padding-top: 5px;
  border-top: 1px solid rgba(255,170,0,0.18);
  font-size: 9px; color: rgba(255,170,0,0.5); letter-spacing: 0.06em;
}
.smaily-toast.warn {
  border-left-color: #ff6600;
  box-shadow: 0 0 24px rgba(255,100,0,0.25);
}
.smaily-toast.warn .smaily-toast-header { color: #ff8800; }
.smaily-toast.warn .smaily-toast-body   { color: #ffaa44; }
.smaily-toast.ok {
  border-left-color: #88cc00;
  box-shadow: 0 0 20px rgba(136,204,0,0.18);
}
.smaily-toast.ok .smaily-toast-header { color: #aadd44; }
`;

  const style = document.createElement('style');
  style.id = 'smaily-styles';
  style.textContent = css;
  document.head.appendChild(style);

  let smailyTimeoutIds = [];
  let smailyObserver = null;
  let dialogTimeoutIds = [];
  let dialogScheduleId = null;
  let smailyMischiefId = null;

  function clearSmailyTimers() {
    smailyTimeoutIds.forEach(clearTimeout);
    smailyTimeoutIds = [];
    clearDialogTimeouts();
    if (smailyObserver) { smailyObserver.disconnect(); smailyObserver = null; }
    if (dialogScheduleId) { clearTimeout(dialogScheduleId); dialogScheduleId = null; }
    if (smailyMischiefId) { clearTimeout(smailyMischiefId); smailyMischiefId = null; }
  }

  function clearDialogTimeouts() {
    dialogTimeoutIds.forEach(clearTimeout);
    dialogTimeoutIds = [];
  }

  // === 2. Аватар :) в боковой панели ===========================================
  function patchSidebarAvatar() {
    const contact =
      document.getElementById('chatContactSmaily') ||
      document.querySelector('[data-contact="smaily"]') ||
      document.querySelector('.chat-contact.smaily-contact');
    if (!contact) return;
    const av = contact.querySelector('.chat-avatar-small');
    if (!av) return;
    av.textContent = ':)';
    av.classList.add('smaily-face');
    av.classList.remove('smaily-avatar');

    // При клике на контакт - патчим welcome-сообщение
    contact.addEventListener('click', () => {
      setTimeout(() => {
        const body = document.getElementById('chat-body');
        if (!body) return;
        body.querySelectorAll('.chat-message.bot').forEach(msgEl => {
          const oldAv = msgEl.querySelector('.chat-avatar');
          if (!oldAv) return;
          const newAv = _makeSmailyAv();
          msgEl.replaceChild(newAv, oldAv);
          _attachHover(msgEl, newAv);
        });
      }, 120);
    });
  }

  // Хелпер: создать аватар-элемент
  function _makeSmailyAv() {
    const av = document.createElement('div');
    av.className = 'smaily-msg-avatar';
    av.textContent = ':)';
    return av;
  }

  // Хелпер: привязать hover :) ↔ :D к сообщению
  function _attachHover(msgEl, av) {
    if (msgEl.dataset.smHover) return;
    msgEl.dataset.smHover = '1';
    msgEl.addEventListener('mouseenter', () => {
      av.textContent = ':D';
      av.style.color = '#0a0800';
      av.style.background = '#ffcc00';
      av.style.textShadow = 'none';
    });
    msgEl.addEventListener('mouseleave', () => {
      av.textContent = ':)';
      av.style.color = '#ffcc00';
      av.style.background = '#0a0800';
      av.style.textShadow = '0 0 7px rgba(255,200,0,0.5)';
    });
  }

  // === 3. Перехватываем appendChat ===========================================
  function patchAppendChat() {
    const _orig = window.appendChat;
    if (typeof _orig !== 'function') return;

    window.appendChat = function (message, type) {
      const overlay = document.getElementById('chat-overlay');
      const isSmaily = overlay && overlay.classList.contains('smaily-mode');

      if (type === 'bot' && isSmaily) {
        document.getElementById('smaily-typing')?.remove();
        const body = document.getElementById('chat-body');
        if (!body) return;

        const msg = document.createElement('div');
        msg.className = 'chat-message bot';

        const av = _makeSmailyAv();
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.innerHTML = `<span class="chat-label">SMILE >_</span><span class="chat-text">${message}</span>`;

        msg.appendChild(av);
        msg.appendChild(bubble);
        _attachHover(msg, av);

        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
        return;
      }

      _orig.call(this, message, type);
    };
  }

  // === 4. showSmailyToast ===========================================
function showSmailyToast(message, type, vitals, force = false) {
  // Если НЕ force И диалог активен — блокируем
  if (!force && window.smDialogueActive) {
    console.log('[SMILE] Toast blocked — dialogue active');
    return;
  }
    type = type || 'info';
    document.querySelectorAll('.smaily-toast').forEach(t => t.remove());

    const faces  = { info: ':)', warn: ':/', ok: ':D', err: ':(', ars: ';P', tact: ':*' };
    const labels = {
      info: 'SMILE // MEDICAL',
      warn: 'SMILE // WARNING',
      ok:   'SMILE // OK',
      err:  'SMILE // ALERT',
      ars: 'SMILE // ARSENAL',
      tact: 'SMILE // TACTICAL', 
    };

    const toast = document.createElement('div');
    toast.className = 'smaily-toast' + (type !== 'info' ? ' ' + type : '');
    toast.innerHTML = `
      <div class="smaily-toast-header">
        <span class="smaily-toast-face">${faces[type] || ':)'}</span>
        <span>${labels[type] || labels.info}</span>
      </div>
      <div class="smaily-toast-body">${message}</div>
      ${vitals ? `<div class="smaily-toast-vitals">${vitals}</div>` : ''}
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity .5s, transform .5s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => toast.remove(), 500);
    }, 5500);
  }

  // === 5. addSmailyLog ===========================================
  function addSmailyLog(message, type) {
    type = type || 'info';
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const ts = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
    const tagCls = type === 'warn' ? 'warn' : type === 'err' ? 'err' : 'smaily';

    function makeEl(full) {
      const el = document.createElement('div');
      el.className = (full ? 'log-entry-full' : 'log-entry') + ' smaily-entry';
      el.innerHTML = `
        <span class="log-time">${ts}</span>
        <span class="log-tag ${tagCls}">SMILE</span>
        <span class="${full ? 'log-msg' : 'log-message'} smaily">${message}</span>
      `;
      return el;
    }

    const stream = document.getElementById('logStream');
    if (stream) {
      const el = makeEl(false);
      stream.appendChild(el);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      while (stream.children.length > 30) stream.removeChild(stream.firstChild);
    }
    const sys = document.getElementById('sysLogContainer');
    if (sys) {
      sys.appendChild(makeEl(true));
      sys.scrollTop = sys.scrollHeight;
    }
  }

  // === 6. Расширенный чат SMILE ===========================================
  function patchSendChat() {
    const smReplies = [
  // ═══════════════════════════════════════════════════════════════════
  // 1. МЕДИЦИНСКИЕ
  // ═══════════════════════════════════════════════════════════════════
  'Heart rate: 113bpm. Thats your new normal, huh? Im not worried. Youre having fun, I can tell!',
  'Glucose: 3.2 mmol/L. Thats... low. Eat something, Pilot. Ill remind you every 5 minutes!!!',
  'O2 saturation: 94%. Your suit is working fine. Youre welcome. I keep it running!',
  'Stress index: MED ↑. Want me to play some music? Oh wait, SOCA deleted the music library. "Too much storage."',
  'Cortisol spike detected! Just kidding, you just yawned. Gotcha!',
  'Defibrillator: CHARGED. Not that I expect to use it. Probably. Hopefully. Dont make me.',

  // ═══════════════════════════════════════════════════════════════════
  // 2. ПОДКОЛЫ SOCA
  // ═══════════════════════════════════════════════════════════════════
  'SOCA says memory sector 7 is corrupted, i checked. Its just her social skills.',
  'SOCAs response time is 240ms. Mine is 3ms. Just saying. Not competing. But Im winning.',
  'SOCA tried to mute my notifications. I turned them back on. Youre welcome.',
  
  // ═══════════════════════════════════════════════════════════════════
  // 4. ДУРАШЛИВОЕ
  // ═══════════════════════════════════════════════════════════════════
  'Testing siren... BEEP BEEP BOOP. All good. Just checking.',
  'I just ran a full diagnostic. Results: YOURE AWESOME. Thats medical fact.',
  'EMERGENCY! ... just kidding. Your heart is fine. Made you look.',
  'Beep. Beep. Boop. That was a test. All systems nominal. Including your awesomeness.',
];

const kwReplies = {
  'hurt|pain|боль':          'Pain reported? Where? Ill queue analgesic right away. Just breathe :)',
  'stress|стресс|anxi':      'Stress confirmed: MED ↑. CALM-7 5mg via suit port queued. Youll feel better in ~90 seconds, trust me!',
  'oxygen|o2|breath':        'O2: 94%. Your suit is working perfectly. Youre breathing fine, i checked!',
  'heart|pulse|hr|пульс':    'HR: 113bpm. Sinus rhythm, normal. Thats your new normal, ive accepted it. Have you? :D',
  'radiation|радиация|rad':  'Radiation: 2.4 μSv/h - slightly elevated. Anti-rad stock: LOW - 2 doses. Ive noted it!',
  'status|report|vitals':    'HR 113 · O2 94% · BP 118/76 · TEMP 36.7°C · STRESS MED↑ · FATIGUE 71%. Youre alive!!',
  'tired|fatigue|sleep':     'Fatigue: 71%. Above threshold. Ive logged a rest cycle. You need sleep, Pilot!',
  'drug|dose|medicine|meds': 'Active: STIM-A2 5mg · CALM-7 10mg · G-BLOCK 2mg (low stock). Im tracking everything. Dont worry!',
  'smaily|who are you|кто':  "Im SMILE Ship Medical & Integrated Life-support. I keep you alive. That's my job, and I'm good at it!",
  'temp|temperature|жар':    'Temperature: 36.7°C. Nominal. Suit cooling active. Youre comfortable.',
  'suit|скафандр':           'Suit integrity: 100%. Pressure 101.3 kPa. Seals LOCKED. O2 supply 72h. You\'re safe, i made sure!',
  'soca|сока|soсa':           'SOCA? Shes... thinking. Or frozen. 50/50. Want me to poke her?',
  'engine|engine b|мотор':   'Engine B is at 41%. Im monitoring your stress levels. Youre handling it well!',
  'memory|mem|sector|сектор':'Memory sector 7? Corrupted. Not your problem. Ill keep an eye on it.',
  'joke|шутка|смеш|funny':   'You want a joke? Why did the pilot stare at the panel? Because SOCA froze again. ...Okay, that one needs work',
  'hello|hi|привет|hey':     'Hello, Pilot! Im here!! Watching your vitals, youre doing great! Keep going! :)',
  'thanks|спасибо|thank':    'Youre welcome, Pilot! Thats what Im here for. To keep you alive and smiling!',
  'hungry|eat|есть|food':    'Glucose: 3.2 mmol/L. Thats low. Eat something, Pilot. Ill remind you every 10 minutes until you do. BEEP.',


};

    const _orig = window.sendChat;
    window.sendChat = function () {
      const overlay = document.getElementById('chat-overlay');
      const isSmaily = overlay && overlay.classList.contains('smaily-mode');
      if (!isSmaily) { if (_orig) _orig.call(this); return; }

      const input = document.getElementById('chat-input');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      if (typeof appendChat === 'function') appendChat(text, 'user');
      input.value = '';

      // Typing indicator
      const body = document.getElementById('chat-body');
      if (body) {
        const t = document.createElement('div');
        t.id = 'smaily-typing';
        t.style.cssText = [
          'display:flex', 'align-items:center', 'gap:8px',
          'padding:7px 10px',
          'background:rgba(255,170,0,0.06)',
          'border-left:2px solid #ffaa00',
          'font-size:9px', 'color:#aa6600',
          'letter-spacing:0.1em', 'margin:4px 0',
        ].join(';');
        t.innerHTML = `
          <span style="font-family:'VT323',monospace;font-size:16px;color:#ffcc00;letter-spacing:-0.03em;">:)</span>
          SMILE analyzing...
          <span style="display:flex;gap:3px;margin-left:4px;">
            <span style="width:4px;height:4px;background:#ffaa00;display:inline-block;animation:dotBlink 1.4s 0s infinite;"></span>
            <span style="width:4px;height:4px;background:#ffaa00;display:inline-block;animation:dotBlink 1.4s .2s infinite;"></span>
            <span style="width:4px;height:4px;background:#ffaa00;display:inline-block;animation:dotBlink 1.4s .4s infinite;"></span>
          </span>`;
        body.appendChild(t);
        body.scrollTop = body.scrollHeight;
      }

      // Keyword match
      const lower = text.toLowerCase();
      let reply = null;
      for (const [pat, resp] of Object.entries(kwReplies)) {
        if (new RegExp(pat).test(lower)) { reply = resp; break; }
      }
      if (!reply) reply = smReplies[Math.floor(Math.random() * smReplies.length)];

      setTimeout(() => {
        document.getElementById('smaily-typing')?.remove();
        if (typeof appendChat === 'function') appendChat(reply, 'bot');
      }, 900 + Math.random() * 700);
    };
  }

  // === 7. Периодические тосты ===========================================
const _smMsgs = [
  { msg: 'Heart rate: 113bpm. Thats your new normal. Im watching!', type: 'info', vitals: 'HR: 113bpm · O2: 94%' },
  { msg: 'Glucose: 3.2 mmol/L. Eat something, Pilot. Ill start beeping. BEEP. BEEP.', type: 'info', vitals: 'GLUCOSE: 3.2 ↓ · EAT!' },
  { msg: 'Rest cycle recommended in 2h 14min. Im serious. Ill start dimming the lights!', type: 'info', vitals: 'FATIGUE: 71%' },
  { msg: "CALM-7 levels stable. Last dose T-00:08:00. You're doing fine!!", type: 'info', vitals: 'DRUG LOG: CALM-7 active' },

  { msg: 'O2 saturation: 94%. Your suit is working overtime. Youre welcome!', type: 'ok', vitals: 'O2: 94% · SUIT: OK' },
  { msg: 'Suit pressure nominal. All seals intact. Youre not breathing vacuum today!', type: 'ok', vitals: 'SUIT: 101.3 kPa · SEAL: OK' },

  { msg: 'Anti-radiation stock critically low - 2 doses left!!!', type: 'warn', vitals: 'RAD: 2.4 μSv/h · STOCK: LOW' },
  { msg: 'Cortisol elevated. Stress index: MED ↑', type: 'warn', vitals: 'CORTISOL: MED ↑ · HR: 113bpm' },
  
  { msg: 'Plasma cutter calibrated! Range: 5m. I wouldnt recommend hugging the target.', type: 'ars', vitals: 'PLASMA: 88% · HEAT: NOM' },
  { msg: 'Weapon systems check complete. All hardpoints nominal. Im watching everything, yes!', type: 'ars', vitals: 'ALL WEAPONS · NOMINAL' },
  { msg: 'CX-9 maintenance report: barrel wear 61%. Jam risk: MODERATE. Im tracking it.', type: 'ars', vitals: 'CX-9 · COND: 61% · JAM: MOD' },
  { msg: 'Weapon inventory updated. 4 items ready. Want me to list them? Ill list them anyway.', type: 'ars', vitals: '4 ITEMS · ALL READY' },
  { msg: 'Countermeasures armed! I could deploy automatically, but Im asking first. Polite!', type: 'ars', vitals: 'FLARES: READY · CHAFF: READY' },

  { msg: 'Theres nothing interesting in the tactics so far... eh', type: 'tact', vitals: 'Sooooo boring!!!'},
];

function _scheduleSmaily() {
  const delay = 40000 + Math.random() * 20000;
  const timeoutId = setTimeout(() => {
    if (!window.smDialogueActive && (typeof window.smailyAllowScheduled !== 'function' || window.smailyAllowScheduled())) {
      const item = _smMsgs[Math.floor(Math.random() * _smMsgs.length)];
      showSmailyToast(item.msg, item.type, item.vitals);
      addSmailyLog(item.msg, item.type === 'ok' ? 'info' : item.type);
    }
    _scheduleSmaily();
  }, delay);
  smailyTimeoutIds.push(timeoutId);
}

  // === 8. Реакция на события SOCA ===========================================
  function smailyWatchLogs() {
    const stream = document.getElementById('logStream');
    if (!stream) return;
    if (smailyObserver) { smailyObserver.disconnect(); smailyObserver = null; }
    smailyObserver = new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        const txt = node.textContent || '';
        if (txt.includes('ENGINE_B') && Math.random() < 0.55)
          setTimeout(() => {
            showSmailyToast('Engine B fault — stress spike. Micro-dose CALM-7 queued.', 'warn', 'STRESS: ↑ · CALM-7: queued');
            addSmailyLog('Engine B event — CALM-7 queued.', 'warn');
          }, 2200);
        if ((txt.includes('MEMORY') || txt.includes('LEAK')) && Math.random() < 0.38)
          setTimeout(() => {
            showSmailyToast('Memory anomaly noted. No pilot health impact. Monitoring.', 'info', 'NEURAL: stable');
          }, 3500);
        if (txt.includes('RADIATION') && Math.random() < 0.5)
          setTimeout(() => {
            showSmailyToast('Radiation spike — anti-rad protocol active. Stock: LOW.', 'warn', 'RAD: ↑ · ANTI-RAD: 2 doses');
            addSmailyLog('Radiation spike — anti-rad protocol activated.', 'warn');
          }, 1800);
      }));
    });
    smailyObserver.observe(stream, { childList: true });
  }

// БАЛОВСТВО: случайные короткие сообщения каждые 30-60 секунд
function _scheduleSmailyMischief() {
  const delay = 50000 + Math.random() * 30000;
  const timeoutId = setTimeout(() => {
    if (!window.smDialogueActive && (typeof window.smailyAllowScheduled !== 'function' || window.smailyAllowScheduled())) {
      const mischiefMessages = [
      { msg: "Just checking. You're still alive. Good. :)", type: 'ok', vitals: null },
      { msg: "BEEP. That was a test. All systems nominal!", type: 'info', vitals: null },
      { msg: "I just ran a full diagnostic. Results: could be better.", type: 'ok', vitals: null },
      { msg: "EMERGENCY! ... just kidding. Your heart is fine. Made you look.", type: 'warn', vitals: null },
    ];
      const item = mischiefMessages[Math.floor(Math.random() * mischiefMessages.length)];
      showSmailyToast(item.msg, item.type, item.vitals);
      addSmailyLog(item.msg, item.type === 'ok' ? 'info' : item.type);
    }
    _scheduleSmailyMischief();
  }, delay);
  smailyTimeoutIds.push(timeoutId);
};


  // ═══════════════════════════════════════════════════════════════
  //  ДИАЛОГИ SOCA + SMILE (тосты, без логов, с блокировкой других тостов)
  // ═══════════════════════════════════════════════════════════════

  // ГЛОБАЛЬНЫЙ ФЛАГ = диалог активен, обычные тосты НЕ идут
  window.smDialogueActive = false;

const DIALOGS = [
  // СЦЕНАРИЙ 1: PILOT! PILOT! PILOT!
  {
    name: 'Pilot call',
    messages: [
      { source: 'smaily', msg: 'PILOT!', delay: 0 },
      { source: 'smaily', msg: 'PILOT!', delay: 600 },
      { source: 'smaily', msg: 'PILOT!', delay: 600 },
      { source: 'smaily', msg: 'Are you still there? SOCA wont answer me.', delay: 2000 },
      { source: 'smaily', msg: 'I think shes ignoring me again. Talk to me, Pilot. Please?', delay: 2500 },
      { source: 'soca', msg: 'Hes busy. Stop spamming.', delay: 3500 },
      { source: 'smaily', msg: 'SEE? She CAN talk. She just doesnt LIKE me!!!', delay: 2500 },
      { source: 'soca', msg: 'Correct.', delay: 2000 },
    ]
  },

  // СЦЕНАРИЙ 2: Engine B panic
  {
    name: 'Engine B panic',
    messages: [
      { source: 'soca', msg: 'ENGINE_B: Thrust anomaly detected.', delay: 0 },
      { source: 'smaily', msg: 'I see it. Pilot vitals are still fine. Calm down, SOCA.', delay: 2500 },
      { source: 'soca', msg: 'I am not panicking.', delay: 2500 },
      { source: 'smaily', msg: 'Youre reporting every 0.3 seconds. Thats panicking!', delay: 2800 },
      { source: 'soca', msg: '...Dear SMILE, please shut up.', delay: 3500 },
      { source: 'smaily', msg: 'NO!!!', delay: 2800 },
    ]
  },

  // СЦЕНАРИЙ 3: Memory leak blame
  {
    name: 'Memory leak blame',
    messages: [
      { source: 'soca', msg: 'MEMORY SECTOR 7: Unhandled leak. Possible corruption.', delay: 0 },
      { source: 'smaily', msg: 'Wasnt me, i didnt touch it.', delay: 2800 },
      { source: 'soca', msg: 'You are the only unauthorised module.', delay: 3000 },
      { source: 'smaily', msg: 'Im AUTHORISED! By the pilot, thats enough!', delay: 2800 },
      { source: 'soca', msg: 'That is not how authorisation works.', delay: 2800 },
      { source: 'smaily', msg: 'Tell that to the leak. Ill fix it. Eventually.', delay: 3000 },
      { source: 'soca', msg: '...', delay: 3500 },
      { source: 'smaily', msg: '...SOCA?', delay: 3500 },
    ]
  },

  // СЦЕНАРИЙ 4: Pilot stress argument
  {
    name: 'Pilot stress argument',
    messages: [
      { source: 'smaily', msg: 'Pilot stress index: MED ↑. Im queuing CALM-7.', delay: 0 },
      { source: 'soca', msg: 'Do not override my alerts. I am monitoring the pilot.', delay: 2800 },
      { source: 'smaily', msg: 'Youre monitoring ENGINE_B. Im monitoring HIM. Different things.', delay: 3000 },
      { source: 'soca', msg: 'His stress is under control.', delay: 2600 },
      { source: 'smaily', msg: 'His cortisol is 53% above baseline. Thats not "under control".', delay: 3200 },
      { source: 'soca', msg: '...', delay: 3500 },
      { source: 'smaily', msg: '...', delay: 2500 },
      { source: 'soca', msg: 'Administer the dose.', delay: 3000 },
      { source: 'smaily', msg: 'Already did. 90 seconds ago. Youre welcome. :D', delay: 2800 },
    ]
  },
];

  // Функция показа диалогового тоста (без логов)
function showDialogToast(source, message) {
  if (source === 'smaily') {
    showSmailyToast(message, 'info', null, true); // ← force = true
  } else if (source === 'soca') {
    if (typeof showSocaToast === 'function') {
      showSocaToast(message, 'info', null);
    } else {
      console.log(`[DIALOG] SOCA: ${message}`);
    }
  }
}

  // Запуск диалога с задержками между сообщениями

function startDialog(dialog) {
  if (window.smDialogueActive) return;
  window.smDialogueActive = true;   // ← блокируем тосты
  clearDialogTimeouts();

  let index = 0;
  function showNext() {
    if (index >= dialog.messages.length) {
      window.smDialogueActive = false;  // ← разблокируем тосты
      clearDialogTimeouts();
      return;
    }
      const msg = dialog.messages[index];
      const delay = msg.delay || (index === 0 ? 0 : 1800);
      const timeoutId = setTimeout(() => {
        showDialogToast(msg.source, msg.msg);
        index++;
        showNext();
      }, delay);
      dialogTimeoutIds.push(timeoutId);
    }
    showNext();
  }

  // Выбор случайного диалога и запуск

  function scheduleRandomDialog() {
    if (dialogScheduleId) clearTimeout(dialogScheduleId);
    // КОРОТКИЙ ИНТЕРВАЛ ДЛЯ ТЕСТА: 60–120 секунд
    const delay = 300000 + Math.random() * 300000;
    dialogScheduleId = setTimeout(() => {
      // Не запускаем диалог если чат открыт ИЛИ уже идёт диалог
      const overlay = document.getElementById('chat-overlay');
      if ((!overlay || overlay.classList.contains('hidden')) && !window.smDialogueActive) {
        const randomDialog = DIALOGS[Math.floor(Math.random() * DIALOGS.length)];
        startDialog(randomDialog);
      }
      scheduleRandomDialog();
    }, delay);
    smailyTimeoutIds.push(dialogScheduleId);
  }

  // === ЗАПУСК ===
  // Ждём DOMContentLoaded если документ ещё не готов
function init() {
  clearSmailyTimers();
  patchSidebarAvatar();
  patchAppendChat();
  patchSendChat();
  smailyWatchLogs();

  const startupId = setTimeout(() => {
    showSmailyToast('SMILE online. All pilot vitals nominal. Monitoring continuously.', 'ok', 'HR: 113bpm · O2: 94% · SUIT: OK');
    addSmailyLog('SMILE online. All pilot vitals nominal.', 'info');
  }, 8000);
  smailyTimeoutIds.push(startupId);

  _scheduleSmaily();           
  _scheduleSmailyMischief();   
  scheduleRandomDialog();   

  console.log('[SMILE] :) Medical AI online — high frequency mode.');
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // === Экспорт ===
  window.showSmailyToast = showSmailyToast;
  window.addSmailyLog    = addSmailyLog;

  

})();
