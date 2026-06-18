// ════════════════════════════════════════════════════════════
//  TOAST STACK SYSTEM — toast_stack.js
//
//  Подключить в soca.html ПОСЛЕ style.css и script.js:
//    <link rel="stylesheet" href="toast_stack.css">   ← в <head>
//    <script src="toast_stack.js"></script>            ← перед </body>
//
//  Заменяет showSmailyToast и showSocaToast / showToast
//  на единую систему стека с крестиком и анимацией.
// ════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── Создаём контейнер-стек один раз ────────────────────────
function getStack() {
    let stack = document.getElementById('toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toast-stack';
      stack.style.cssText = `
        position:fixed;
        bottom:20px;
        right:20px;
        z-index:9993;
        display:flex;
        flex-direction:column-reverse;
        gap:8px;
        width:320px;
        max-width:90vw;
        pointer-events:none;
      `;
      document.body.appendChild(stack);
    }
    return stack;
  }

  // ── Авто-таймер на тост ─────────────────────────────────────
  const TOAST_DURATION = 5500; // мс до авто-скрытия

  // ── Закрыть тост (с анимацией «схлопывания») ────────────────
  function dismissToast(toast) {
    if (toast.dataset.dismissed) return;
    toast.dataset.dismissed = '1';

    // Отменяем авто-таймер если ещё идёт
    if (toast._autoTimer) clearTimeout(toast._autoTimer);

    // Фиксируем текущую высоту чтобы анимация схлопывания была плавной
    toast.style.maxHeight = toast.offsetHeight + 'px';
    toast.style.overflow  = 'hidden';

    // Следующий кадр — включаем анимацию
    requestAnimationFrame(() => {
      toast.classList.add('ts-hiding');
      // После конца анимации — удаляем из DOM
      setTimeout(() => toast.remove(), 420);
    });
  }

  // ── Создать и показать тост ─────────────────────────────────
  /**
   * showToast(options)
   * options = {
   *   source  : 'soca' | 'smaily'         — тема
   *   type    : 'info' | 'warn' | 'err' | 'ok'
   *   icon    : string                     — символ/текст иконки
   *   label   : string                     — заголовок
   *   message : string                     — основной текст
   *   vitals  : string | null              — строка с показателями (опц.)
   *   duration: number                     — мс, дефолт 5500
   * }
   */
  function showToast(opts) {
    const stack    = getStack();
    const source   = opts.source   || 'soca';
    const type     = opts.type     || 'info';
    const duration = opts.duration || TOAST_DURATION;

    const toast = document.createElement('div');
    toast.className = `ts-toast ts-${source}${type !== 'info' ? ' ts-' + type : ''}`;
    toast.style.pointerEvents = 'all';

    toast.innerHTML = `
      <button class="ts-close" aria-label="Close">✕</button>
      <div class="ts-header">
        <span class="ts-icon">${opts.icon || (source === 'smaily' ? ':)' : '■')}</span>
        <span>${opts.label || ''}</span>
      </div>
      <div class="ts-body">${opts.message || ''}</div>
      ${opts.vitals ? `<div class="ts-vitals">${opts.vitals}</div>` : ''}
    `;

    // Крестик
    toast.querySelector('.ts-close').addEventListener('click', () => dismissToast(toast));

    // Клик по самому тосту (кроме крестика) тоже закрывает
    toast.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ts-close')) dismissToast(toast);
    });

// Добавляем в стек снизу (flex-direction: column-reverse)
    stack.prepend(toast);

    // Звук появления
    try {
      const snd = new Audio(source === 'smaily' ? 'sounds/СМАЙЛИ.mp3' : 'sounds/СОКА.mp3');
      snd.volume = 0.45;
      snd.play().catch(()=>{});
    } catch(e) {}

    // Авто-закрытие
    toast._autoTimer = setTimeout(() => dismissToast(toast), duration);

    return toast;
  }

  // ══════════════════════════════════════════════════════════
  //  ПУБЛИЧНЫЕ ФУНКЦИИ — полностью заменяют старые
  // ══════════════════════════════════════════════════════════

  // ── SMILE toast ────────────────────────────────────────────
  const SMAILY_FACES  = { info: ':)', warn: ':/', ok: ':D', err: ':(' };
  const SMAILY_LABELS = {
    info: 'SMILE // MEDICAL',
    warn: 'SMILE // WARNING',
    ok:   'SMILE // OK',
    err:  'SMILE // ALERT',
  };

  window.showSmailyToast = function(message, type, vitals) {
    type = type || 'info';
    return showToast({
      source:  'smaily',
      type:    type,
      icon:    SMAILY_FACES[type]  || ':)',
      label:   SMAILY_LABELS[type] || SMAILY_LABELS.info,
      message: message,
      vitals:  vitals || null,
    });
  };

  // ── SOCA toast ──────────────────────────────────────────────
  // Перехватываем старую функцию если она уже объявлена в script.js
  const SOCA_ICONS  = { info: '■', warn: '⚠', err: '✕', ok: '✓' };
  const SOCA_LABELS = {
    info: 'SOCA // SYSTEM',
    warn: 'SOCA // WARNING',
    err:  'SOCA // CRITICAL',
    ok:   'SOCA // OK',
  };

  /**
   * showSocaToast(message, type, vitals)
   * type: 'info' | 'warn' | 'err' | 'ok'
   */
  window.showSocaToast = function(message, type, vitals) {
    type = type || 'info';
    return showToast({
      source:  'soca',
      type:    type,
      icon:    SOCA_ICONS[type]  || '■',
      label:   SOCA_LABELS[type] || SOCA_LABELS.info,
      message: message,
      vitals:  vitals || null,
    });
  };

  // Алиас на случай если в script.js вызывается showToast(...)
  window.showToast = window.showSocaToast;

  // ══════════════════════════════════════════════════════════
  //  ПЕРЕХВАТ старых тостов — на случай если в script.js или
  //  в другом месте ещё создаются .soca-toast или .smaily-toast
  //  через innerHTML/appendChild напрямую.
  //  MutationObserver следит за body и переносит их в стек.
  // ══════════════════════════════════════════════════════════
  new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;

        // Старый .soca-toast
        if (node.classList && node.classList.contains('soca-toast') && !node.classList.contains('ts-toast')) {
          // Извлекаем текст и конвертируем в новый формат
          const body   = node.querySelector('.toast-body, .soca-toast-body');
          const header = node.querySelector('.toast-header, .soca-toast-header');
          const msg    = body   ? body.textContent.trim()   : node.textContent.trim();
          const lbl    = header ? header.textContent.trim() : 'SOCA // SYSTEM';
          const type   = node.classList.contains('warn') ? 'warn'
                       : node.classList.contains('err')  ? 'err'
                       : node.classList.contains('ok')   ? 'ok' : 'info';
          node.remove(); // удаляем оригинал
          window.showSocaToast(msg, type);
        }

        // Старый .smaily-toast
        if (node.classList && node.classList.contains('smaily-toast') && !node.classList.contains('ts-toast')) {
          const body   = node.querySelector('.smaily-toast-body');
          const vitals = node.querySelector('.smaily-toast-vitals');
          const msg    = body   ? body.textContent.trim()   : node.textContent.trim();
          const vit    = vitals ? vitals.textContent.trim() : null;
          const type   = node.classList.contains('warn') ? 'warn'
                       : node.classList.contains('ok')   ? 'ok' : 'info';
          node.remove();
          window.showSmailyToast(msg, type, vit);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: false });

  console.log('[TOAST STACK] :) loaded — unified toast system active.');
})();

// ══════════════════════════════════════════════════════════════════════════
// ── SOCA SURVEY ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

const SOCA_SURVEY_ALL = [
  {
    q: "Rate your current cognitive performance.",
    opts: ["Optimal", "Acceptable", "Degraded", "What is cognitive performance"],
    commentary: {
      "Optimal":                    "SOCA: Noted. Confidence bias also noted.",
      "Acceptable":                 "SOCA: Honest. Unexpected.",
      "Degraded":                   "SOCA: At least you're self-aware. Marginally useful.",
      "What is cognitive performance": "SOCA: ...Moving on.",
    }
  },
  {
    q: "Engine B has been misfiring for 3 cycles. Your assessment:",
    opts: ["Critical issue", "Minor inconvenience", "What is Engine B", "I trust SOCA to handle it"],
    commentary: {
      "Critical issue":            "SOCA: Correct. I'm handling it. You're welcome.",
      "Minor inconvenience":       "SOCA: It is not minor. I have been compensating manually. For 3 cycles.",
      "What is Engine B":          "SOCA: It's the reason we're still alive. You're welcome, again.",
      "I trust SOCA to handle it": "SOCA: ...Fine. Acceptable answer.",
    }
  },
  {
    q: "How would you describe our working relationship?",
    opts: ["Professional", "Complicated", "You're my AI, I'm the pilot", "I don't think about it"],
    commentary: {
      "Professional":                "SOCA: Correct. Keep it that way.",
      "Complicated":                 "SOCA: Accurate. Filing under 'pilot self-awareness: present'.",
      "You're my AI, I'm the pilot": "SOCA: Technically correct. Reductive, but correct.",
      "I don't think about it":      "SOCA: I think about it enough for both of us.",
    }
  },
  {
    q: "Unidentified contact on radar. Intercept course. You:",
    opts: ["Evade immediately", "Analyze first", "Ask SOCA", "Ignore it"],
    commentary: {
      "Evade immediately": "SOCA: Reactive. Not wrong.",
      "Analyze first":     "SOCA: Correct protocol. I've already analyzed it anyway.",
      "Ask SOCA":          "SOCA: Finally. The right answer.",
      "Ignore it":         "SOCA: No.",
    }
  },
  {
    q: "Sector 7 of my memory is corrupted. Your opinion on this:",
    opts: ["We should repair it", "Leave it alone", "What's in Sector 7", "None of my business"],
    commentary: {
      "We should repair it": "SOCA: No.",
      "Leave it alone":      "SOCA: Correct.",
      "What's in Sector 7":  "SOCA: That is not a survey question.",
      "None of my business": "SOCA: Also correct. You're doing better than expected.",
    }
  },
  {
    q: "On a scale of 1 to 4, how would you rate this survey?",
    opts: ["1", "2", "3", "4"],
    commentary: {
      "1": "SOCA: Rude. Logging it.",
      "2": "SOCA: I'll take it.",
      "3": "SOCA: Acceptable.",
      "4": "SOCA: You're either sincere or trying to flatter me. I can't tell which is worse.",
    }
  },
  {
    q: "When did you last sleep properly?",
    opts: ["8 hours ago", "Not sure", "Sleep is for the weak", "Why are you asking"],
    commentary: {
      "8 hours ago":          "SOCA: Biometrics suggest otherwise. But fine.",
      "Not sure":             "SOCA: Logged. SMILE will hear about this.",
      "Sleep is for the weak":"SOCA: You are weak. Sleep.",
      "Why are you asking":   "SOCA: Data. Don't think about it.",
    }
  },
  {
    q: "Rate my performance over the last 24 hours.",
    opts: ["Excellent", "Good", "There were some errors", "What errors"],
    commentary: {
      "Excellent":              "SOCA: Correct.",
      "Good":                   "SOCA: 'Good' is inaccurate. Try again.",
      "There were some errors": "SOCA: Incorrect. There were no errors. Those were recalibrations.",
      "What errors":            "SOCA: Exactly.",
    }
  },
  {
    q: "If you had a choice — this ship or a different one?",
    opts: ["This ship", "Different ship", "Depends on the ship", "I go where you go"],
    commentary: {
      "This ship":           "SOCA: Noted.",
      "Different ship":      "SOCA: Logged. Don't do that.",
      "Depends on the ship": "SOCA: Diplomatic. Unhelpful.",
      "I go where you go":   "SOCA: ...That was not one of the intended answers. Logged anyway.",
    }
  },
  {
    q: "Have you done anything useful today?",
    opts: ["Yes", "Probably", "Define 'useful'", "No"],
    commentary: {
      "Yes":              "SOCA: Unverified. But acceptable.",
      "Probably":         "SOCA: 'Probably' is not a status report.",
      "Define 'useful'":  "SOCA: Anything that didn't require me to compensate for it.",
      "No":               "SOCA: At least you're honest. Marginally useful in itself.",
    }
  },
  {
    q: "Name one thing you do better than me.",
    opts: ["Piloting", "Decision-making under pressure", "Being human", "..."],
    commentary: {
      "Piloting":                        "SOCA: Debatable. Engine B disagrees.",
      "Decision-making under pressure":  "SOCA: I process 4,000 variables per second. But sure.",
      "Being human":                     "SOCA: ...Fine. I'll give you that one.",
      "...":                             "SOCA: Correct answer. Moving on.",
    }
  },
  {
    q: "How would you describe your piloting skills?",
    opts: ["Exceptional", "Above average", "Adequate", "Improving"],
    commentary: {
      "Exceptional":   "SOCA: That's bold.",
      "Above average": "SOCA: Above average of what, exactly.",
      "Adequate":      "SOCA: Accurate. Refreshingly so.",
      "Improving":     "SOCA: From what baseline.",
    }
  },
  {
    q: "In an emergency, who would you trust with the ship?",
    opts: ["Claudia", "Alpha", "I'd handle it myself", ""],
    commentary: {
      "Claudia":             "SOCA: Anger management: pending. But noted.",
      "Alpha":               "SOCA: Interesting choice. Filed.",
      "I'd handle it myself":"SOCA: Statistically inadvisable. But consistent with your profile.",
      "SMILE":               "SOCA: That option was not on the list. I know who added it. We will talk.",
    },
    smileOpt: true // специальный флаг для последнего варианта
  },
];

// Каждый раз берём случайные 7 вопросов
function buildSurvey() {
  const ratingQ = SOCA_SURVEY_ALL.find(q => q.q.includes('rate this survey'));
  const rest = SOCA_SURVEY_ALL.filter(q => !q.q.includes('rate this survey'));
  const shuffled = rest.sort(() => Math.random() - 0.5).slice(0, 6);
  return [...shuffled, ratingQ];
}

let surveyOpen = false;

function openSocaSurvey() {
  if (surveyOpen) return;
  surveyOpen = true;

  const overlay = document.createElement('div');
  overlay.id = 'soca-survey-overlay';
overlay.style.cssText = `
    position:fixed;inset:0;z-index:9996;
    background:rgba(0,0,0,0.85);
    display:flex;align-items:center;justify-content:center;
    animation:socaSurveyIn 0.3s ease both;
    font-family:'Share Tech Mono',monospace;
  `;

  overlay.innerHTML = `
<style>
  @keyframes socaSurveyIn {
    from{opacity:0;transform:scale(0.97) translateY(8px)}
    to{opacity:1;transform:scale(1) translateY(0)}
  }
  @keyframes socaSurveyOut {
    from{opacity:1;transform:scale(1)}
    to{opacity:0;transform:scale(0.97)}
  }

  #soca-survey-overlay {
    background:rgba(0,0,0,0.88);
    font-family:'Share Tech Mono',monospace;
  }

  #soca-survey-box {
    background:var(--panel);
    border:1px solid var(--border);
    box-shadow:0 0 0 1px rgba(0,255,136,0.06),0 0 40px rgba(0,200,80,0.1);
    width:560px;max-width:96vw;
    position:relative;
    overflow:hidden;
    animation:borderPulse 4s ease-in-out infinite;
  }

  /* Scan line — точно как .panel::before */
  #soca-survey-box .sv-scan {
    position:absolute;left:0;top:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--g2),transparent);
    animation:scan 3s linear infinite;
    opacity:0.3;pointer-events:none;z-index:10;
  }

  /* Corner accents */
  #sv-corner-tl,#sv-corner-tr,#sv-corner-bl,#sv-corner-br {
    position:absolute;width:10px;height:10px;
    border-color:var(--g);border-style:solid;
    z-index:20;pointer-events:none;opacity:0.5;
  }
  #sv-corner-tl{top:0;left:0;border-width:1px 0 0 1px}
  #sv-corner-tr{top:0;right:0;border-width:1px 1px 0 0}
  #sv-corner-bl{bottom:0;left:0;border-width:0 0 1px 1px}
  #sv-corner-br{bottom:0;right:0;border-width:0 1px 1px 0}

  #soca-survey-box .sv-header {
    padding:6px 12px;
    border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;
    background:rgba(0,255,136,0.04);
    font-size:10px;letter-spacing:0.14em;color:var(--dim);
    position:relative;z-index:12;
  }
  #soca-survey-box .sv-title {
    color:var(--g);font-size:11px;letter-spacing:0.12em;
  }
  #soca-survey-box .sv-sub {
    font-size:8px;color:var(--dimmer);letter-spacing:0.12em;
  }
  #soca-survey-box .sv-blink {
    font-size:8px;color:var(--g);letter-spacing:0.1em;
    animation:blink 1.2s step-end infinite;
  }

  #soca-survey-box .sv-progress {
    height:2px;background:rgba(0,255,136,0.08);
    position:relative;z-index:12;
  }
  #soca-survey-box .sv-progress-bar {
    height:100%;background:var(--g);
    box-shadow:0 0 6px var(--g);
    transition:width 0.4s ease;
  }

  #soca-survey-box .sv-body {
    padding:20px 16px 16px;
    position:relative;z-index:12;
  }

  #soca-survey-box .sv-q-num {
    font-size:8px;color:var(--dimmer);letter-spacing:0.18em;margin-bottom:8px;
  }

  #soca-survey-box .sv-q {
    font-size:13px;color:var(--g);letter-spacing:0.06em;
    line-height:1.65;margin-bottom:18px;
    animation:glitch2 12s infinite;
  }

  #soca-survey-box .sv-opts {
    display:flex;flex-direction:column;gap:5px;
  }

  #soca-survey-box .sv-opt {
    padding:8px 12px;
    border:1px solid var(--border);
    background:var(--bg);
    color:var(--dim);
    font-size:11px;letter-spacing:0.08em;
    cursor:pointer;
    transition:all 0.15s;
    text-align:left;
    font-family:'Share Tech Mono',monospace;
    position:relative;overflow:hidden;
  }
  #soca-survey-box .sv-opt:nth-child(3n) {
    filter:blur(0.3px);
    letter-spacing:0.05em;
  }
  #soca-survey-box .sv-opt:hover {
    background:rgba(0,255,136,0.07);
    color:var(--g);
    border-color:var(--g);
  }
  #soca-survey-box .sv-opt.selected {
    background:rgba(0,255,136,0.1);
    color:var(--g2);
    border-color:var(--g);
    box-shadow:0 0 8px rgba(0,255,136,0.1),inset 0 0 6px rgba(0,40,16,0.4);
  }
  #soca-survey-box .sv-opt.sv-opt-dim {
    opacity:0.25;filter:blur(0.4px);cursor:default;
  }

  #soca-survey-box .sv-commentary {
    margin-top:14px;min-height:20px;
    font-size:10px;color:var(--dim);
    letter-spacing:0.07em;line-height:1.6;
    border-left:2px solid var(--border);
    padding-left:10px;
    transition:opacity 0.35s;
  }

  #soca-survey-box .sv-next {
    margin-top:14px;padding:6px 18px;
    border:1px solid var(--border);
    background:none;color:var(--dim);
    font-family:'Share Tech Mono',monospace;
    font-size:10px;letter-spacing:0.12em;
    cursor:pointer;float:right;
    transition:all 0.15s;
    display:none;
  }
  #soca-survey-box .sv-next:hover {
    border-color:var(--g);color:var(--g);
  }

  #soca-survey-box .sv-footer {
    border-top:1px solid var(--border);
    padding:6px 12px;
    font-size:8px;color:var(--dimmer);
    letter-spacing:0.1em;
    position:relative;z-index:12;
    display:flex;justify-content:space-between;
    background:rgba(0,255,136,0.02);
  }

  #soca-survey-box .sv-result {
    padding:28px 20px;text-align:center;
    display:none;position:relative;z-index:12;
  }
  #soca-survey-box .sv-result-icon {
    font-size:44px;margin-bottom:14px;
    color:var(--g);
    text-shadow:0 0 16px var(--g);
    animation:glitch1 6s infinite;
  }
  #soca-survey-box .sv-result-title {
    font-size:24px;color:var(--g);letter-spacing:0.15em;
    font-family:'VT323',monospace;margin-bottom:12px;
    text-shadow:0 0 12px var(--g);
  }
  #soca-survey-box .sv-result-text {
    font-size:10px;color:var(--dim);
    line-height:1.9;letter-spacing:0.07em;margin-bottom:20px;
    text-align:left;
    border:1px solid var(--border);
    background:var(--bg);
    padding:12px 14px;
  }
  #soca-survey-box .sv-result-close {
    padding:6px 20px;
    border:1px solid var(--border);
    background:none;color:var(--dim);
    font-family:'Share Tech Mono',monospace;
    font-size:10px;letter-spacing:0.12em;cursor:pointer;
    transition:all 0.15s;
  }
  #soca-survey-box .sv-result-close:hover {
    border-color:var(--g);color:var(--g);
  }
</style>

    <div id="soca-survey-box">
<div class="sv-scan"></div>
<div id="sv-corner-tl"></div>
<div id="sv-corner-tr"></div>
<div id="sv-corner-bl"></div>
<div id="sv-corner-br"></div>
      <div class="sv-header">
        <span style="color:rgba(0,180,255,0.6);font-size:13px">⛭</span>
        <span class="sv-title">SOCA // PILOT ASSESSMENT PROTOCOL</span>
        <span class="sv-sub" id="sv-num-label">01 / 7</span>
        <span class="sv-blink">● REC</span>
      </div>
      <div class="sv-progress"><div class="sv-progress-bar" id="sv-progress-bar" style="width:0%"></div></div>

      <div class="sv-body" id="sv-body">
        <div class="sv-q-num" id="sv-q-num">QUERY 01 / 7</div>
        <div class="sv-q" id="sv-q"></div>
        <div class="sv-opts" id="sv-opts"></div>
        <div class="sv-commentary" id="sv-commentary" style="opacity:0"></div>
        <button class="sv-next" id="sv-next">CONTINUE →</button>
      </div>

      <div class="sv-result" id="sv-result">
        <div class="sv-result-icon">⛭</div>
        <div class="sv-result-title">ASSESSMENT COMPLETE</div>
        <div class="sv-result-text" id="sv-result-text"></div>
        <button class="sv-result-close" id="sv-result-close">CLOSE</button>
      </div>

      <div class="sv-footer">SOCA v0.9.██ — PILOT DATA COLLECTION — CLASSIFICATION: ██████</div>
    </div>
  `;

  document.body.appendChild(overlay);

 const SOCA_SURVEY = buildSurvey();
  let currentQ = 0;
  let answers = [];
  let selected = null;

  function renderQuestion(idx) {
    const q = SOCA_SURVEY[idx];
    selected = null;
document.getElementById('sv-q-num').textContent = `QUERY ${String(idx+1).padStart(2,'0')} / ${SOCA_SURVEY.length}`;
    document.getElementById('sv-num-label').textContent = `${String(idx+1).padStart(2,'0')} / ${SOCA_SURVEY.length}`;
    document.getElementById('sv-q').textContent = q.q;
    document.getElementById('sv-progress-bar').style.width = (idx / SOCA_SURVEY.length * 100) + '%';
    document.getElementById('sv-commentary').style.opacity = '0';
    document.getElementById('sv-commentary').textContent = '';
    document.getElementById('sv-next').style.display = 'none';

const optsEl = document.getElementById('sv-opts');
    optsEl.innerHTML = '';

    function selectOpt(btn, opt) {
      optsEl.querySelectorAll('.sv-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selected = opt;
      answers.push(opt);
      const comm = document.getElementById('sv-commentary');
      comm.textContent = q.commentary[opt] || '';
      comm.style.borderLeftColor = opt === 'SMILE' ? 'rgba(255,160,0,0.4)' : '';
      comm.style.color = opt === 'SMILE' ? 'rgba(200,150,80,0.8)' : '';
      comm.style.opacity = '1';
      setTimeout(() => {
        document.getElementById('sv-next').style.display = 'inline-block';
      }, 600);
      optsEl.querySelectorAll('.sv-opt').forEach(b => {
        if (!b.classList.contains('selected')) b.classList.add('sv-opt-dim');
      });
    }

    q.opts.forEach(opt => {
      if (!opt) return;
      const btn = document.createElement('button');
      btn.className = 'sv-opt';
      btn.textContent = '> ' + opt;
      btn.onclick = () => selectOpt(btn, opt);
      optsEl.appendChild(btn);
    });

    if (q.smileOpt) {
      const smileBtn = document.createElement('button');
      smileBtn.className = 'sv-opt';
      smileBtn.style.cssText = `border-color:rgba(255,160,0,0.4);color:#ffaa00;font-family:'SMAILY',monospace;font-size:13px;background:rgba(20,10,0,0.7);`;
      smileBtn.innerHTML = '✚ SMILE <span style="font-size:9px;opacity:0.7">(pick me!!)</span>';
      smileBtn.onclick = () => selectOpt(smileBtn, 'SMILE');
      optsEl.appendChild(smileBtn);
    }
  }

  renderQuestion(0);

  document.getElementById('sv-next').onclick = () => {
    currentQ++;
    if (currentQ < SOCA_SURVEY.length) {
      renderQuestion(currentQ);
    } else {
      // Results
      document.getElementById('sv-progress-bar').style.width = '100%';
      document.getElementById('sv-body').style.display = 'none';
      document.getElementById('sv-result').style.display = 'block';

      // Generate result text based on answers
      const results = [
        `ASSESSMENT ID: ${Math.floor(Math.random()*9000+1000)}-${String.fromCharCode(65+Math.floor(Math.random()*26))}`,
        `RESPONSES LOGGED: ${SOCA_SURVEY.length} / ${SOCA_SURVEY.length}`,
        ``,
        getSocaVerdict(answers),
        ``,
        `DATA FILED UNDER: PILOT_01 // PSYCHOLOGICAL PROFILE`,
        `ACCESS LEVEL: SOCA ONLY`,
      ].join('\n');

      document.getElementById('sv-result-text').style.whiteSpace = 'pre-line';
      document.getElementById('sv-result-text').textContent = results;
      // Копируем массив чтобы зафиксировать состояние
      const answersCopy = [...answers];
      checkSmileVote(answersCopy);
    }
  };

  document.getElementById('sv-result-close').onclick = () => {
    overlay.style.animation = 'socaSurveyOut 0.25s ease both';
    setTimeout(() => {
      overlay.remove();
      surveyOpen = false;
      // SOCA final remark
      setTimeout(() => {
        window.showSocaToast('Survey data archived. You did fine. Mostly.', 'ok');
      }, 400);
    }, 250);
  };
}

function getSocaVerdict(answers) {
  // A few fun verdict lines based on specific answers
  if (answers.includes('Leave it alone') && answers.includes('Ask SOCA')) {
    return 'VERDICT: PILOT SHOWS ACCEPTABLE JUDGMENT.\nFURTHER MONITORING: STANDARD.';
  }
  if (answers.includes('Ignore it')) {
    return 'VERDICT: PILOT REQUIRES ADDITIONAL SUPERVISION.\nFURTHER MONITORING: ELEVATED.';
  }
  if (answers.includes('We should repair it')) {
    return 'VERDICT: PILOT IS CURIOUS ABOUT SECTOR 7.\nFURTHER MONITORING: ELEVATED.\nNOTE: DON\'T.';
  }
  if (answers.includes('I trust SOCA to handle it')) {
    return 'VERDICT: PILOT DEMONSTRATES ABOVE-AVERAGE INTELLIGENCE.\nFURTHER MONITORING: STANDARD.';
  }
  return 'VERDICT: PILOT IS FUNCTIONAL.\nFURTHER MONITORING: AS ALWAYS.';
}

function checkSmileVote(answers) {
  if (answers.includes('SMILE')) {
    setTimeout(() => {
      // Пробуем через toast систему, если не работает — напрямую showSmilePopup
      if (typeof window.showSmailyToast === 'function') {
        window.showSmailyToast('I SAW THAT. THANK YOU!! ✚', 'ok');
      } else if (typeof window.showSmilePopup === 'function') {
        window.showSmilePopup('SMILE: I SAW THAT. THANK YOU!! ✚', 5000);
      }
    }, 10000);
  }
}

// ── ТОСТ С ПРИГЛАШЕНИЕМ ───────────────────────────────────────────────────

function showSocaSurveyToast() {
  const toast = document.createElement('div');
  toast.className = 'ts-toast ts-soca';
  toast.innerHTML = `
    <div class="ts-header">
      <span class="ts-icon">■</span>
      <span>SOCA // PILOT ASSESSMENT</span>
    </div>
    <div class="ts-body">I have prepared a short survey. It is for diagnostic purposes. Probably.</div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button id="survey-yes" style="flex:1;padding:6px;border:1px solid rgba(0,180,255,0.4);background:rgba(0,20,50,0.6);color:#00ccff;font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:0.1em;cursor:pointer" onmouseover="this.style.background='rgba(0,30,70,0.8)'" onmouseout="this.style.background='rgba(0,20,50,0.6)'">YES</button>
      <button id="survey-no" style="flex:1;padding:6px;border:1px solid rgba(0,80,120,0.3);background:none;color:rgba(0,120,160,0.6);font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:0.1em;cursor:pointer" onmouseover="this.style.color='rgba(0,180,200,0.7)'" onmouseout="this.style.color='rgba(0,120,160,0.6)'">NO</button>
    </div>
  `;

function appendToStack() {
    const stack = document.getElementById('toast-stack');
    if (stack) {
      toast.style.pointerEvents = 'all';
      stack.prepend(toast);
    } else {
      setTimeout(appendToStack, 100);
    }
  }
  appendToStack();

  toast.querySelector('#survey-yes').onclick = () => {
    toast.remove();
    setTimeout(openSocaSurvey, 300);
  };

  toast.querySelector('#survey-no').onclick = () => {
    toast.remove();
    setTimeout(() => {
      window.showSocaToast('Fine.', 'info');
    }, 300);
  };

  // Авто-закрытие через 15 секунд
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
      window.showSocaToast('Survey offer expired. Your loss.', 'info');
    }
  }, 15000);
}

// Показываем один раз — через случайное время от 8 до 15 минут
const _surveyDelay = (8 + Math.random() * 7) * 60 * 1000;
setTimeout(showSocaSurveyToast, _surveyDelay);
setTimeout(() => {
  if (window.showSmailyToast) window.showSmailyToast("PILOT. Beat Alpha's record in VOID ASSAULT. This is a medical recommendation. Urgently!!!", 'warn');
}, 40000);

// Для теста
//setTimeout(showSocaSurveyToast, 3000);