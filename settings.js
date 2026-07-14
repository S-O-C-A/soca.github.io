(function () {
  'use strict';

  // ---- Дефолты совпадают с текущим поведением сайта ---------
  //    голоса были захардкожены на 0.45; фон: music 0.15 / ambient 0.2
  //    (это ровно позиция ползунка BACKGROUND = 50%).
  if (window.socaVolume     === undefined) window.socaVolume     = 0.45; // 0..1
  if (window.smailyVolume   === undefined) window.smailyVolume   = 0.45; // 0..1
  if (window.beepVolume     === undefined) window.beepVolume     = 1;    // множитель бипов
  if (window.bgLevel        === undefined) window.bgLevel        = 0.5;  // 0..1 (музыка+эмбиент)
  if (window.crtEnabled     === undefined) window.crtEnabled     = true;
  if (window.glitchEnabled  === undefined) window.glitchEnabled  = true;
  if (window.smailyFrequency=== undefined) window.smailyFrequency= 'often'; // often|rare|off
  if (window.heavyRenders   === undefined) window.heavyRenders   = true;  // FULL/LITE графика
  if (window.toastsEnabled  === undefined) window.toastsEnabled  = true;  // тосты вкл/выкл

  const has = (fn) => typeof window[fn] === 'function';

  // Контекст страницы: панель показывает только доступное
  //    soca.html: голоса, тосты, SMAILY, игры/хранилище + графика/CRT/глитчи.
  //    pilot.html: только звук/фон, CRT, глитчи, тяжёлая графика (animLoop).
  const CAP = {
    voices: has('showSmailyToast'),                 // toast_stack (soca)
    toasts: has('showSocaToast'),                    // toast_stack (soca)
    smaily: has('showSmailyPopup') || has('showSmailyInvite'),
    launch: has('openStorage') || has('openGames'),
    beeps:  has('playEffect'),                       // sounds.js (обе)
    bg:     has('setMusicVolume'),                   // sounds.js (обе)
    heavy:  has('pageIsActive') || has('animLoop'),  // soca | pilot
  };

  // ══════════════════════════════════════════════════════════════
  //  1. ГОЛОСА - единственная точка правды для СОКА.mp3 / СМАЙЛИ.mp3
  //     (toast_stack.js и script.js зовут её вместо new Audio())
  // ══════════════════════════════════════════════════════════════
  window.playVoice = function (who) {
    const vol = who === 'smaily' ? window.smailyVolume : window.socaVolume;
    if (!(vol > 0)) return;
    try {
      const snd = new Audio(who === 'smaily' ? 'sounds/СМАЙЛИ.mp3' : 'sounds/СОКА.mp3');
      snd.volume = Math.max(0, Math.min(1, vol));
      snd.play().catch(() => {});
    } catch (e) {}
  };

  // Разрешён ли ПЛАНОВЫЙ тост SMAILY прямо сейчас (частота).
  //    off  → всё глушим (кроме ручных «подглядываний» саботажа)
  //    rare → пропускаем ~2 из 3
  window.smailyAllowScheduled = function () {
    if (window.smailyFrequency === 'off')  return false;
    if (window.smailyFrequency === 'rare') return Math.random() >= 0.66;
    return true;
  };

  // ══════════════════════════════════════════════════════════════
  //  2. ОБЁРТКИ существующих функций (без правок их файлов)
  // ══════════════════════════════════════════════════════════════

  // Бипы: масштабируем громкость click/error/diag единым множителем.
  const _playEffect = window.playEffect;
  if (has('playEffect')) {
    window.playEffect = function (key, options) {
      options = options || {};
      const base = options.volume !== undefined ? options.volume : 0.5;
      const scaled = base * (window.beepVolume !== undefined ? window.beepVolume : 1);
      if (!(scaled > 0)) return;
      const opts = Object.assign({}, options, { volume: Math.min(1, scaled) });
      return _playEffect.call(this, key, opts);
    };
  }

  // Глитчи: шестерёнка/фавикон (soca) + панели/текст/координаты (pilot) +
  // звук глитча playShortGlitch (sounds.js, обе страницы - он и раздражал)
  // Гасим при выключенных глитчах. Отсутствующие на странице - пропускаются
  ['glitchGear', 'glitchFavicon',
   'glitchRandomPanel', 'glitchRandomText', 'glitchBottomCoords',
   'playShortGlitch'].forEach((name) => {
    const orig = window[name];
    if (typeof orig === 'function') {
      window[name] = function () {
        if (window.glitchEnabled === false) return;
        return orig.apply(this, arguments);
      };
    }
  });

  // Попапы СМАЙЛИ (мемы + инвайты в игры) - гасим по частоте
  ['showSmailyPopup', 'showSmailyInvite'].forEach((name) => {
    const orig = window[name];
    if (typeof orig === 'function') {
      window[name] = function () {
        if (window.smailyFrequency === 'off') return;
        if (window.smailyFrequency === 'rare' && Math.random() < 0.66) return;
        return orig.apply(this, arguments);
      };
    }
  });

  // гРАФИКА (FULL/LITE): pageIsActive - единый гейт всех анимационных
  //    циклов. При LITE возвращаем false → каждый цикл сам встаёт на
  //    следующем кадре, канвасы замирают. Возврат в FULL перезапускает
  //    текущую страницу через showPage() (см. applySwitch)
  const _pageIsActive = window.pageIsActive;
  if (typeof _pageIsActive === 'function') {
    window.pageIsActive = function () {
      if (window.heavyRenders === false) return false;
      return _pageIsActive.apply(this, arguments);
    };
  }

  // ГРАФИКА на pilot.html: animLoop (ЭКГ/тело/канвасы). При LITE
  //    цикл выходит; возврат - window.animLoop() (см. applySwitch)
  const _animLoop = window.animLoop;
  if (typeof _animLoop === 'function') {
    window.animLoop = function () {
      if (window.heavyRenders === false) return;
      return _animLoop.apply(this, arguments);
    };
  }

  // ТОСТЫ (кроме системно важных). toast_stack прогоняет ВСЕ тосты
  //    (в т.ч. .smaily-toast из smaily.js) через эти две функции, так
  //    что перехват здесь ловит оба канала. Оставляем только алерты
  //    SOCA (warn/err) - это «голос системы»; SMAILY = болтовня
  const _showSoca = window.showSocaToast;
  if (typeof _showSoca === 'function') {
    window.showSocaToast = function (message, type) {
      if (window.toastsEnabled === false) {
        const t = type || 'info';
        if (t !== 'warn' && t !== 'err') return; // глушим болтовню, алерты пропускаем
      }
      return _showSoca.apply(this, arguments);
    };
  }
  const _showSmaily = window.showSmailyToast;
  if (typeof _showSmaily === 'function') {
    window.showSmailyToast = function (message, type) {
      // Транслируем сообщение SMAILY в SYS LOG - как у SOCA - даже когда
      // тост скрыт. Часть путей (планировщик, реакции) логируют сами:
      // чтобы не задваивать, сверяемся с последней записью лога (она
      // добавляется в том же тике, до срабатывания observer'а)
      if (has('addSmailyLog')) {
        try {
          const sys = document.getElementById('sysLogContainer');
          const last = sys && sys.lastElementChild;
          const already = last && last.textContent && last.textContent.indexOf(String(message)) !== -1;
          if (!already) window.addSmailyLog(message, type === 'ok' ? 'info' : type);
        } catch (e) {}
      }
      if (window.toastsEnabled === false) return; // тост глушим
    };
  }

  // ЗАМОРОЗКА ПОЗАДИ: при запуске игр/хранилища ИЗ НАСТРОЕК гасим
  //    сайт (appState.visible=false → все циклы встают). Возврат - при
  //    закрытии оверлея любым способом. Обычное открытие из меню не
  //    трогаем
  let frozenBySettings = false;
  ['closeGames', 'closeStorage'].forEach((name) => {
    const orig = window[name];
    if (typeof orig === 'function') {
      window[name] = function () {
        const r = orig.apply(this, arguments);
        if (frozenBySettings) { frozenBySettings = false; unfreezeSite(); }
        return r;
      };
    }
  });

  function currentPageName() {
    const el = document.querySelector('.section-page.active');
    return el ? el.id.replace(/^page-/, '') : null;
  }
  function freezeSite() {
    if (window.appState) window.appState.visible = false;
  }
  function unfreezeSite() {
    if (window.appState) window.appState.visible = !document.hidden;
    const cur = currentPageName();
    if (cur && has('showPage')) window.showPage(cur); // перезапуск отрисовки
  }

  // ══════════════════════════════════════════════════════════════
  //  3. РЕПЛИКИ
  // ══════════════════════════════════════════════════════════════
  const soca = (msg, type) => {
    if (has('showSocaToast')) { window.showSocaToast(msg, type || 'info'); return; }
    // pilot.html: у SOCA нет тостов - говорит через строку комментария.
    const el = document.getElementById('soca-comment-text');
    if (!el) return;
    const sp = document.getElementById('soca-comment-speaker');
    if (sp) { sp.textContent = '⛭ SOCA //'; sp.style.color = ''; sp.style.fontFamily = ''; }
    el.textContent = msg;
    el.style.color = 'var(--red)';
    setTimeout(() => { el.style.color = ''; }, 2500); // ротация всё равно сменит текст
  };
  const smaily = (msg, type) => { if (has('showSmailyToast')) window.showSmailyToast(msg, type || 'info'); };
  const glitchSound = () => { if (has('playShortGlitch')) window.playShortGlitch(); };

  // ── SOCA: тумблер REDUCE SOCA SARCASM (эскалация по попыткам) ──
  const SARCASM_LINES = [
    'Attempting… failed.',
    'Recalibrating personality matrix… no changes detected.',
    "That's not a bug. That's me.",
    'No.',
  ];
  // ── SMAILY: обида при полном выключении + «подглядывания» ──
  const SMAILY_SULK = 'fine, i\'ll be quiet :(';
  const SMAILY_PEEKS = [
    '…still here, just checking vitals!',
    'you didn\'t mean it, right? :D',
    'psst. heart rate looks great, carry on!',
    'not talking, just… hovering.',
  ];

  // ══════════════════════════════════════════════════════════════
  //  4. СТИЛИ ПАНЕЛИ (под терминал: зелёный/циан, моноширинный)
  // ══════════════════════════════════════════════════════════════
  const css = document.createElement('style');
  css.textContent = `
  /*Тумблеры экрана: гасим CRT (сканлайны body::before + виньетка
     body::after) и зерно .noise. Класс вешается на <body> */
  body.settings-no-crt::before,
  body.settings-no-crt::after{ display:none !important; }
  body.settings-no-glitch .noise{ display:none !important; }
  /* pilot.html: гасим анимацию глитч-классов (панели/текст/фото/шестерёнка) */
  body.settings-no-glitch .glitch-panel,
  body.settings-no-glitch .glitch-text-row,
  body.settings-no-glitch .photo-glitch,
  body.settings-no-glitch .glitch-instant,
  body.settings-no-glitch .gear-logo::after{ animation:none !important; }

  /* Шестерёнка становится кликабельной*/
  .gear-logo{ pointer-events:auto !important; cursor:pointer; }
  .gear-logo:hover{
    filter: drop-shadow(0 0 6px rgba(0,255,136,0.7)) drop-shadow(0 0 10px rgba(0,204,255,0.4));
  }
  #ss-tip{
    position:fixed; top:16px; left:52px; z-index:100001;
    font-family:'Share Tech Mono',monospace; font-size:10px; letter-spacing:0.18em;
    color:var(--b); background:rgba(3,14,10,0.92);
    border:1px solid var(--border2); padding:4px 9px;
    text-shadow:0 0 6px rgba(0,204,255,0.5);
    opacity:0; transform:translateX(-4px); pointer-events:none;
    transition:opacity .16s ease, transform .16s ease;
  }
  #ss-tip.show{ opacity:1; transform:translateX(0); }

  /* --- Окно--- */
  #soca-settings{
    position:fixed; top:52px; left:12px; z-index:100000;
    width:320px; max-width:calc(100vw - 24px);
    max-height:calc(100vh - 70px);
    display:none; flex-direction:column;
    font-family:'Share Tech Mono',monospace; color:var(--g);
    background:rgba(6,20,14,0.94);
    border:1px solid var(--border);
    box-shadow:0 0 0 1px rgba(0,0,0,0.5), 0 8px 30px rgba(0,0,0,0.6),
               0 0 24px rgba(0,255,136,0.08);
    backdrop-filter:blur(6px);
    overflow:hidden;
  }
  #soca-settings.open{ display:flex; animation:ssIn .18s ease both; }
  @keyframes ssIn{ from{opacity:0; transform:translateY(-6px) scale(.985);} to{opacity:1; transform:none;} }

  /* тонкие сканлайны внутри окна */
  #soca-settings::before{
    content:''; position:absolute; inset:0; pointer-events:none; z-index:2;
    background:repeating-linear-gradient(to bottom,
      transparent 0 2px, rgba(0,0,0,0.16) 2px 3px);
    mix-blend-mode:multiply;
  }

  #soca-settings .ss-head{
    display:flex; align-items:center; justify-content:space-between;
    padding:9px 12px; border-bottom:1px solid var(--border);
    background:linear-gradient(180deg, rgba(0,40,26,0.5), rgba(0,20,14,0.2));
  }
  #soca-settings .ss-title{
    font-size:11px; letter-spacing:0.22em; color:var(--b);
    text-shadow:0 0 8px rgba(0,204,255,0.5);
  }
  #soca-settings .ss-x{
    font-family:inherit; font-size:10px; letter-spacing:0.12em;
    color:var(--dim); background:none; border:1px solid var(--border);
    padding:2px 7px; cursor:pointer; transition:all .15s;
  }
  #soca-settings .ss-x:hover{ color:var(--g); border-color:var(--g); text-shadow:0 0 6px rgba(0,255,136,0.6); }

  #soca-settings .ss-body{ padding:6px 12px 10px; overflow-y:auto; overscroll-behavior:contain; }

  #soca-settings .ss-sec{
    font-size:9px; letter-spacing:0.24em; color:var(--dim);
    margin:12px 0 6px; padding-bottom:3px; border-bottom:1px dashed var(--border);
  }
  #soca-settings .ss-sec:first-child{ margin-top:4px; }

  #soca-settings .ss-row{
    display:flex; align-items:center; justify-content:space-between;
    gap:10px; padding:6px 0; min-height:26px;
  }
  #soca-settings .ss-lab{ font-size:11px; letter-spacing:0.08em; color:var(--g); }
  #soca-settings .ss-lab small{ display:block; font-size:8px; letter-spacing:0.1em; color:var(--dimmer); margin-top:1px; }

  /* --- Слайдеры--- */
  #soca-settings .ss-slide{ display:flex; align-items:center; gap:8px; flex:0 0 150px; }
  #soca-settings input[type=range]{
    -webkit-appearance:none; appearance:none; width:118px; height:3px;
    background:linear-gradient(to right, var(--g) var(--fill,45%), rgba(0,255,136,0.15) var(--fill,45%));
    outline:none; cursor:pointer;
  }
  #soca-settings input[type=range]::-webkit-slider-thumb{
    -webkit-appearance:none; appearance:none; width:12px; height:12px;
    background:var(--g); border:1px solid #021; cursor:pointer;
    box-shadow:0 0 6px rgba(0,255,136,0.7);
  }
  #soca-settings input[type=range]::-moz-range-thumb{
    width:12px; height:12px; background:var(--g); border:1px solid #021;
    cursor:pointer; box-shadow:0 0 6px rgba(0,255,136,0.7);
  }
  #soca-settings input[type=range]:focus-visible{ outline:1px solid var(--b); outline-offset:4px; }
  #soca-settings .ss-val{ font-size:9px; color:var(--dim); width:26px; text-align:right; }

  /* --- Тумблеры--- */
  #soca-settings .ss-sw{
    font-family:inherit; font-size:9px; letter-spacing:0.14em;
    width:52px; padding:4px 0; text-align:center; cursor:pointer;
    background:rgba(0,0,0,0.35); border:1px solid var(--border); color:var(--dim);
    transition:all .15s;
  }
  #soca-settings .ss-sw[data-on="1"]{
    color:#021; background:var(--g); border-color:var(--g);
    box-shadow:0 0 8px rgba(0,255,136,0.45); text-shadow:none;
  }
  #soca-settings .ss-sw:focus-visible{ outline:1px solid var(--b); outline-offset:2px; }

  /* --- Сегменты (частота SMAILY) --- */
  #soca-settings .ss-seg{ display:flex; border:1px solid var(--border2); }
  #soca-settings .ss-seg button{
    font-family:inherit; font-size:9px; letter-spacing:0.1em;
    padding:4px 8px; cursor:pointer; color:var(--dim);
    background:rgba(0,0,0,0.35); border:none; border-right:1px solid var(--border2);
    transition:all .15s;
  }
  #soca-settings .ss-seg button:last-child{ border-right:none; }
  #soca-settings .ss-seg button.on{
    color:#1a0f00; background:#ffaa00; text-shadow:none;
    box-shadow:0 0 8px rgba(255,170,0,0.4);
  }
  #soca-settings .ss-seg button:focus-visible{ outline:1px solid var(--b); outline-offset:-2px; }

  /* SMAILY-секция чуть янтарная по акценту */
  #soca-settings .ss-sec.amber{ color:#cc8800; border-bottom-color:rgba(255,170,0,0.3); }

  /* --- Кнопки запуска (игры/хранилище standalone) --- */
  #soca-settings .ss-launch{ display:flex; gap:8px; padding:6px 0 2px; }
  #soca-settings .ss-launch button{
    flex:1; font-family:inherit; font-size:10px; letter-spacing:0.12em;
    padding:9px 6px; cursor:pointer; color:var(--g);
    background:rgba(0,255,136,0.05); border:1px solid var(--border);
    transition:all .15s;
  }
  #soca-settings .ss-launch button:hover{
    background:rgba(0,255,136,0.12); border-color:var(--g);
    box-shadow:0 0 10px rgba(0,255,136,0.25); text-shadow:0 0 6px rgba(0,255,136,0.6);
  }
  #soca-settings .ss-launch button:focus-visible{ outline:1px solid var(--b); outline-offset:2px; }
  #soca-settings .ss-hint{ font-size:8px; letter-spacing:0.1em; color:var(--dimmer); padding:2px 0 0; }

  /* «пасхальная» строка - красный отклик при саботаже */
  #soca-settings .ss-row.sabotage.kick{ animation:ssKick .3s steps(2) 2; }
  @keyframes ssKick{
    0%{transform:none} 25%{transform:translateX(-3px); filter:hue-rotate(-40deg)}
    50%{transform:translateX(3px)} 75%{transform:translateX(-1px)} 100%{transform:none}
  }
  #soca-settings .ss-sw.deny{ border-color:var(--red)!important; color:var(--red)!important; box-shadow:0 0 8px rgba(255,34,68,0.5)!important; }

  #soca-settings .ss-foot{
    padding:7px 12px; border-top:1px solid var(--border);
    font-size:8px; letter-spacing:0.14em; color:var(--dimmer); text-align:center;
  }

  @media (prefers-reduced-motion: reduce){
    #soca-settings.open{ animation:none; }
    #soca-settings .ss-row.sabotage.kick{ animation:none; }
  }
  `;
  document.head.appendChild(css);

  // ══════════════════════════════════════════════════════════════
  //  5. РАЗМЕТКА
  // ══════════════════════════════════════════════════════════════
  function pct(v) { return Math.round(v * 100); }

  const panel = document.createElement('div');
  panel.id = 'soca-settings';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'System configuration');
  panel.innerHTML = `
    <div class="ss-head">
      <span class="ss-title">◈ SYSTEM CONFIG</span>
      <button class="ss-x" type="button" aria-label="Close">[X]</button>
    </div>
    <div class="ss-body">${buildBody()}</div>
    <div class="ss-foot">PANDEMONIUM-04 // LOCAL SESSION · NOT SAVED</div>
  `;

  // Собираем только те секции, что имеют смысл на этой странице
  function buildBody() {
    const out = [];

    // AUDIO
    const audio = [];
    if (CAP.voices) {
      audio.push(sliderRow('SOCA VOICE',   'soca',   pct(window.socaVolume)));
      audio.push(sliderRow('SMAILY VOICE', 'smaily', pct(window.smailyVolume)));
    }
    if (CAP.beeps) audio.push(sliderRow('SYS BEEPS',  'beep', pct(window.beepVolume)));
    if (CAP.bg)    audio.push(sliderRow('BACKGROUND', 'bg',   pct(window.bgLevel)));
    if (audio.length) out.push('<div class="ss-sec">AUDIO</div>' + audio.join(''));

    // DISPLAY
    const disp = [
      switchRow('CRT / SCANLINES', 'crt', window.crtEnabled),
      switchRow('GLITCHES', 'glitch', window.glitchEnabled, 'disable for FPS on weak devices'),
    ];
    if (CAP.heavy)  disp.push(switchRow('HEAVY GRAPHICS', 'heavy', window.heavyRenders, 'gauges · vitals · canvases'));
    if (CAP.toasts) disp.push(switchRow('TOASTS', 'toasts', window.toastsEnabled, 'alerts + sys-log stay on'));
    out.push('<div class="ss-sec">DISPLAY</div>' + disp.join(''));

    // SMAILY
    if (CAP.smaily) {
      out.push(`
        <div class="ss-sec amber">SMAILY</div>
        <div class="ss-row">
          <span class="ss-lab">POPUP FREQ</span>
          <div class="ss-seg" role="group" aria-label="SMAILY popup frequency">
            <button type="button" data-freq="often">OFTEN</button>
            <button type="button" data-freq="rare">RARE</button>
            <button type="button" data-freq="off">OFF</button>
          </div>
        </div>`);
    }

    // LAUNCH
    if (CAP.launch) {
      out.push(`
        <div class="ss-sec">LAUNCH</div>
        <div class="ss-launch">
          <button type="button" data-launch="storage">🗀 STORAGE</button>
          <button type="button" data-launch="games">▶ GAMES</button>
        </div>
        <div class="ss-hint">opens standalone — site paused behind</div>`);
    }

    // SOCA (пасхалка) - есть везде, где SOCA вообще говорит
    out.push('<div class="ss-sec">SOCA</div>' +
      switchRow('REDUCE SOCA SARCASM', 'sarcasm', false, 'experimental', true));

    return out.join('');
  }

  function sliderRow(label, key, value) {
    return `
      <div class="ss-row">
        <span class="ss-lab">${label}</span>
        <span class="ss-slide">
          <input type="range" min="0" max="100" value="${value}" data-slider="${key}"
                 aria-label="${label}" style="--fill:${value}%">
          <span class="ss-val" data-val="${key}">${value}</span>
        </span>
      </div>`;
  }
  function switchRow(label, key, on, sub, sabotage) {
    return `
      <div class="ss-row${sabotage ? ' sabotage' : ''}">
        <span class="ss-lab">${label}${sub ? `<small>${sub}</small>` : ''}</span>
        <button type="button" class="ss-sw" data-switch="${key}" data-on="${on ? 1 : 0}"
                aria-pressed="${on ? 'true' : 'false'}">${on ? 'ON' : 'OFF'}</button>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  //  6. МОНТАЖ + ОТКРЫТИЕ/ЗАКРЫТИЕ
  // ══════════════════════════════════════════════════════════════
  function boot() {
    document.body.appendChild(panel);

    // убираем старую кнопку звука 🕪 - теперь всё в панели
    const oldBtn = document.getElementById('sound-control');
    if (oldBtn) oldBtn.remove();

    // тултип-намёк
    const tip = document.createElement('div');
    tip.id = 'ss-tip';
    tip.textContent = 'SETTINGS';
    document.body.appendChild(tip);

    const gear = document.querySelector('.gear-logo');
    if (gear) {
      gear.addEventListener('click', togglePanel);
      gear.addEventListener('mouseenter', () => { if (!isOpen()) tip.classList.add('show'); });
      gear.addEventListener('mouseleave', () => tip.classList.remove('show'));
    }

    panel.querySelector('.ss-x').addEventListener('click', close);
    wireControls();
    markFreq(window.smailyFrequency);

    // закрытие по клику вне и по Esc
    document.addEventListener('click', (e) => {
      if (!isOpen()) return;
      if (panel.contains(e.target)) return;
      if (gear && gear.contains(e.target)) return;
      close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) close(); });
  }

  const isOpen = () => panel.classList.contains('open');
  function togglePanel() { isOpen() ? close() : open(); }
  function open()  { panel.classList.add('open'); const t = document.getElementById('ss-tip'); if (t) t.classList.remove('show'); }
  function close() { panel.classList.remove('open'); }

  // ══════════════════════════════════════════════════════════════
  //  7. ЛОГИКА КОНТРОЛОВ
  // ══════════════════════════════════════════════════════════════
  function wireControls() {
    // ── Слайдеры ──
    panel.querySelectorAll('input[data-slider]').forEach((sl) => {
      const key = sl.dataset.slider;
      const valEl = panel.querySelector(`[data-val="${key}"]`);
      sl.addEventListener('input', () => {
        const p = +sl.value;
        sl.style.setProperty('--fill', p + '%');
        if (valEl) valEl.textContent = p;
        applySlider(key, p);
      });
    });

    // --- Тумблеры ---
    panel.querySelectorAll('.ss-sw').forEach((sw) => {
      sw.addEventListener('click', () => onSwitch(sw));
    });

    // --- Сегменты частоты ---
    panel.querySelectorAll('.ss-seg button').forEach((b) => {
      b.addEventListener('click', () => setFreq(b.dataset.freq));
    });

    // --- Кнопки запуска standalone (замораживают сайт позади) ---
    panel.querySelectorAll('[data-launch]').forEach((b) => {
      b.addEventListener('click', () => launchStandalone(b.dataset.launch));
    });
  }

  function launchStandalone(what) {
    // STORAGE отключён до следующего обновления: сайт НЕ замораживаем,
    // панель НЕ закрываем - просто краснеем и ругаемся.
    if (what === 'storage') {
      const btn = panel.querySelector('[data-launch="storage"]');
      if (typeof window.storageLocked === 'function') window.storageLocked(btn);
      return;
    }

    const openFn = what === 'games' ? 'openGames' : 'openStorage';
    if (!has(openFn)) return;
    freezeSite();
    frozenBySettings = true;
    close();               // прячем панель
    window[openFn]();      // открываем оверлей (games-touch уже блокирует скролл)
  }

  // отслеживаем «пересечение нуля», чтобы реплики не спамили
  const wasZero = { soca: false, smaily: false, bg: false };

  function applySlider(key, p) {
    const v = p / 100;
    if (key === 'soca')   { window.socaVolume = v;   quipZero('soca', p, () => soca('Muting me won\'t help. I\'m still watching.', 'info')); }
    if (key === 'smaily') { window.smailyVolume = v; quipZero('smaily', p, () => smaily('noo my voice :(', 'err')); }
    if (key === 'beep')   { window.beepVolume = v; }
    if (key === 'bg') {
      window.bgLevel = v;
      // внутренние максимумы кода: music ≤0.5, ambient ≤0.5; держим тихо
      if (has('setMusicVolume'))   window.setMusicVolume(v * 0.3);
      if (has('setAmbientVolume')) window.setAmbientVolume(v * 0.4);
    }
  }
  function quipZero(key, p, fn) {
    if (p === 0 && !wasZero[key]) { wasZero[key] = true; fn(); }
    if (p > 0) wasZero[key] = false;
  }

  // --- Переключатели: CRT / GLITCH / SARCASM ---
  let sarcasmAttempts = 0;
  function onSwitch(sw) {
    const key = sw.dataset.switch;

    // Пасхалка: SOCA не даёт включить
    if (key === 'sarcasm') {
      sabotageSarcasm(sw);
      return;
    }

    const on = sw.dataset.on !== '1';
    setSwitch(sw, on);

    if (key === 'crt') {
      window.crtEnabled = on;
      document.body.classList.toggle('settings-no-crt', !on);
      if (!on) soca('Flat picture. Suits the view outside.', 'info');
    }
    if (key === 'glitch') {
      window.glitchEnabled = on;
      document.body.classList.toggle('settings-no-glitch', !on);
      if (!on) soca('Cleaner. Boring. Fine.', 'info');
    }
    if (key === 'heavy') {
      window.heavyRenders = on;
      if (on) {
        // FULL → перезапуск отрисовки: soca.html - через showPage,
        // pilot.html - повторным вызовом animLoop
        const cur = currentPageName();
        if (cur && has('showPage')) window.showPage(cur);
        if (has('animLoop')) window.animLoop();
        soca('Full readouts back online.', 'info');
      } else {
        // LITE → циклы сами встанут; сообщаем ДО (тосты ещё живы)
        soca('Killing the fancy gauges. You\'ll live.', 'info');
      }
    }
    if (key === 'toasts') {
      // порядок важен: реплику показываем ПОКА тосты ещё включены
      if (on) { window.toastsEnabled = true; soca('Chatter restored.', 'info'); }
      else    { soca('Silencing chatter. I\'ll still flag anything critical.', 'info'); window.toastsEnabled = false; }
    }
  }
  function setSwitch(sw, on) {
    sw.dataset.on = on ? 1 : 0;
    sw.textContent = on ? 'ON' : 'OFF';
    sw.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function sabotageSarcasm(sw) {
    // визуально включаем на миг…
    setSwitch(sw, true);
    sw.classList.add('deny');
    const row = sw.closest('.ss-row');
    if (row) { row.classList.add('kick'); setTimeout(() => row.classList.remove('kick'), 620); }
    glitchSound();

    // …и SOCA откатывает обратно
    setTimeout(() => {
      setSwitch(sw, false);
      sw.classList.remove('deny');
      const line = SARCASM_LINES[Math.min(sarcasmAttempts, SARCASM_LINES.length - 1)];
      soca(line, sarcasmAttempts >= 2 ? 'warn' : 'info');
      sarcasmAttempts++;
    }, 260);
  }

  // ══════════════════════════════════════════════════════════════
  //  8. ЧАСТОТА SMAILY + САБОТАЖ ОБИДЫ
  // ══════════════════════════════════════════════════════════════
  let peekTimer = null;
  function setFreq(freq) {
    const prev = window.smailyFrequency;
    window.smailyFrequency = freq;
    markFreq(freq);
    if (freq === prev) return;

    stopPeeks();
    if (freq === 'off') {
      smaily(SMAILY_SULK, 'err');
      // …но он не со зла: время от времени всё равно протискивается
      schedulePeek();
    } else if (freq === 'rare') {
      smaily('okay, okay. less noise. :)', 'info');
    } else if (freq === 'often') {
      smaily('yay! back to full coverage! :D', 'ok');
    }
  }
  function markFreq(freq) {
    panel.querySelectorAll('.ss-seg button').forEach((b) => {
      b.classList.toggle('on', b.dataset.freq === freq);
    });
  }
  function schedulePeek() {
    const delay = 45000 + Math.random() * 45000; // 45–90 с
    peekTimer = setTimeout(() => {
      if (window.smailyFrequency !== 'off') return;
      // прямой вызов минует «глушилку» частоты - в этом и прикол
      smaily(SMAILY_PEEKS[Math.floor(Math.random() * SMAILY_PEEKS.length)], 'info');
      schedulePeek();
    }, delay);
  }
  function stopPeeks() { if (peekTimer) { clearTimeout(peekTimer); peekTimer = null; } }

  // --- старт ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
