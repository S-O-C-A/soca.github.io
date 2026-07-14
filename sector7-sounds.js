(function () {
  'use strict';

  // Сообщаем игре, что [ENTER] покажем мы (её фолбэк-старт логов не сработает)
  window.__s7EnterShown = true;

  const DIR = 'sounds/звуки_сектор7/';
  const EXT = '.mp3';

  // Громкости. Музыка специально громче фонов, чтобы была слышна.
  const V = {
    music:   0.62,   // тревожная/тревожная1
    boss:    0.66,   // босс_файт
    pilot:   0.55,   // пилот (мем-локации)
    alarm:   0.5,    // тревога (D2)
    end:     0.62,   // конец (лок_10)
    trans:   0.5,    // переход_локаций
    ambient: 0.26,   // шум_везде (сервера)
    rare:    0.34,   // редкие_звуки / редкие_звуки1
    soca:    0.6,    // голос СОКИ
    act:     0.5,    // взаимодействие
    term:    0.5,    // терминал
    glitch:  0.62,   // глитчи1 (краш)
    steps:   0.42,   // шаги_монстра
    logi:    0.6,    // логи
  };

  // ── Профиль звука задаётся по комнате (см. profile() ниже) ──

  // ── Хелперы ──
  function loopTrack(name, vol) {
    const a = new Audio(DIR + name + EXT);
    a.loop = true; a.volume = vol; a.preload = 'auto';
    return a;
  }
  function one(name, vol) {           // одноразовый звук
    try { const a = new Audio(DIR + name + EXT); a.volume = vol; a.play().catch(() => {}); } catch (e) {}
  }

  // ── Зацикленные треки ──
  const MUSIC = {
    trev:  loopTrack('тревожная',  V.music),
    trev1: loopTrack('тревожная1', V.music),
    boss:  loopTrack('босс_файт',  V.boss),
    pilot: loopTrack('пилот',      V.pilot),   // мем_A/B/C
    alarm: loopTrack('тревога',    V.alarm),   // D2_A/B/C (пока тревога включена)
    end:   loopTrack('конец',      V.end),     // лок_10
  };
  const noise = loopTrack('шум_везде', V.ambient);
  const MUSIC_KEYS = Object.keys(MUSIC);

  // «конец» (лок_10): не зацикливаем нативно — повторяем с паузой 1.5 сек,
  // иначе стык конца и начала звучит некрасиво.
  MUSIC.end.loop = false;
  MUSIC.end.addEventListener('ended', () => {
    if (curMusic !== 'end') return;
    setTimeout(() => {
      if (curMusic === 'end') { MUSIC.end.currentTime = 0; MUSIC.end.play().catch(() => {}); }
    }, 700);
  });

  // ── Состояние ──
  let started   = false;   // игра началась (был enterRoom)
  let bossMusic = false;   // собран CORE FRAGMENT → музыка боя
  let bossPending = false; // ждём 2 сек перед сменой на музыку боя
  let curMusic  = undefined;
  let logiPlayed = false;

  function room() {
    return (window.S && typeof window.S.room === 'number') ? window.S.room : -1;
  }

  // Тревога в D2 выключена, когда активирован маяк (D2_C)
  function d2AlarmOff() {
    return !!(window.S && window.S.flags && window.S.flags.d2_complete);
  }

  // Монстр пройден, когда запитано ядро (см. CORE TERMINAL в sector7.html)
  function monsterPassed() {
    return !!(window.ROOMS && window.ROOMS[5] && window.ROOMS[5].coreDone);
  }

  // Профиль звука по текущей локации:
  //   {music: ключ|null, ambient: шум_везде?, rare: редкие_звуки?}
  function profile() {
    const r = room();
    if (r >= 0 && r <= 2) return { music: 'trev',  ambient: true,  rare: true };  // лок_01/2/3
    if (r === 3)          return { music: null,    ambient: true,  rare: true };  // лок_4 VOID — только шум
    if (r === 4)          return { music: bossMusic ? 'boss' : 'trev1', ambient: true, rare: true }; // лок_5
    if (r === 5)          return { music: monsterPassed() ? null : 'boss', ambient: true, rare: true };  // лок_6: после монстра музыка стихает, снова шум+редкие
    if (r >= 6 && r <= 8) return { music: 'trev',  ambient: true,  rare: true };  // лок_7/8/9 — обычная тревожная
    if (r >= 9 && r <= 11) return { music: 'pilot', ambient: false, rare: false }; // мем_A/B/C — только «пилот»
    if (r >= 12 && r <= 14) return { music: d2AlarmOff() ? null : 'alarm', ambient: false, rare: false }; // D2 — «тревога», после маяка тишина
    if (r === 15)         return { music: null,    ambient: false, rare: false }; // D3 — тишина (кроме взаим./СОКИ)
    if (r === 16)         return { music: 'end',   ambient: false, rare: false }; // лок_10 — «конец»
    return { music: null, ambient: false, rare: false };
  }

  function setMusic(name) {
    if (name === curMusic) return;
    curMusic = name;
    MUSIC_KEYS.forEach((k) => {
      const a = MUSIC[k];
      if (k === name) { if (a.paused) a.play().catch(() => {}); }
      else if (!a.paused) { a.pause(); a.currentTime = 0; }
    });
  }

  function updateAudio() {
    if (!started) return;
    const p = profile();
    setMusic(p.music);
    if (p.ambient) { if (noise.paused) noise.play().catch(() => {}); }
    else           { if (!noise.paused) noise.pause(); }
  }

  // ── Обёртки глобальных функций игры (без правок sector7.html) ──
  function wrap(name, fn) {
    const orig = window[name];
    if (typeof orig === 'function') window[name] = function () { return fn(orig, this, arguments); };
  }

  // Смена комнаты → звук перехода + пересчёт музыки/шума
  wrap('enterRoom', (orig, t, a) => {
    const wasStarted = started;               // первый вход (старт игры) — без звука перехода
    const prevRoom = room();
    const r = orig.apply(t, a);
    started = true;
    lastMonsterPos = null;
    if (wasStarted && room() !== prevRoom) one('переход_локаций', V.trans);
    updateAudio();
    return r;
  });

  // Собрали CORE FRAGMENT (задание лок_5 выполнено) → музыка боя ЧЕРЕЗ 2 сек
  wrap('invAdd', (orig, t, a) => {
    const r = orig.apply(t, a);
    if (a[0] === 'CORE FRAGMENT' && !bossMusic && !bossPending) {
      bossPending = true;
      setTimeout(() => { bossPending = false; bossMusic = true; updateAudio(); }, 2000);
    }
    return r;
  });

  // Голос СОКИ — на каждой её реплике в диалоге (описания молчат: они через descShow)
  wrap('dlgNext', (orig, t, a) => {
    let next = null;
    try { next = window.S && window.S.dlgQueue && window.S.dlgQueue[0]; } catch (e) {}
    const r = orig.apply(t, a);
    if (next && next.s && /soca/i.test(next.s)) one('СОКА', V.soca);
    return r;
  });

  // Взаимодействие / терминал (описания, люки — молчат)
  wrap('interact', (orig, t, a) => {
    let o = null;
    try { o = window.nearObj && window.nearObj(); } catch (e) {}
    const r = orig.apply(t, a);
    if (o && !o.noAct && !o.isDebugWarp) {
      if (o.isTerminal || o.isCoreTerminal) one('терминал', V.term);
      else one('взаимодействие', V.act);
    }
    return r;
  });

  // Краш (ошибка/зависание): короткий глитчи1, затем — реплика СОКИ, затем игра выкидывает
  wrap('crash', (orig, t, a) => {
    one('глитчи1', V.glitch);
    setTimeout(() => one('СОКА', V.soca), 2100); // ~после фазы глитча (2 сек)
    return orig.apply(t, a);
  });

  // ── Шаги монстра: когда двигается в лок_6 ──
  let lastMonsterPos = null;
  setInterval(() => {
    if (!started || !window.S || !window.S.monster) { lastMonsterPos = null; return; }
    const m = window.S.monster;
    if (m.active && room() === 5) {
      const pos = m.x + ',' + m.y;
      if (lastMonsterPos !== null && pos !== lastMonsterPos) one('шаги_монстра', V.steps);
      lastMonsterPos = pos;
    } else lastMonsterPos = null;
  }, 110);

  // ── Редкие короткие звуки на фоне ──
  (function scheduleRare() {
    const delay = 22000 + Math.random() * 30000; // 22–52 с
    setTimeout(() => {
      if (started && profile().rare) one(Math.random() < 0.5 ? 'редкие_звуки' : 'редкие_звуки1', V.rare);
      scheduleRare();
    }, delay);
  })();

  // ── Страховочный пересчёт (браузер мог поставить луп на паузу) ──
  setInterval(updateAudio, 1000);

  // ══════════════════════════════════════════════════════════════
  //  ЭКРАН [ENTER] — как в основном бут-экране (index.html).
  //  Жест разблокирует звук; после него стартуют логи + звук «логи» (1 раз).
  // ══════════════════════════════════════════════════════════════
  function unlock() {
    // «Прогреваем» лупы беззвучно, чтобы позже они точно заиграли
    [MUSIC.trev, MUSIC.trev1, MUSIC.boss, MUSIC.pilot, MUSIC.alarm, MUSIC.end, noise].forEach((a) => {
      const v = a.volume; a.volume = 0;
      a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = v; }).catch(() => { a.volume = v; });
    });
  }

  function buildEnter() {
    const style = document.createElement('style');
    style.textContent = `
      #s7-enter{position:fixed;inset:0;background:var(--bg);z-index:10001;
        display:flex;align-items:center;justify-content:center;cursor:pointer;
        transition:opacity .5s ease;}
      #s7-enter .s7-enter-text{font-family:'Share Tech Mono',monospace;font-size:14px;
        letter-spacing:4px;color:rgba(0,170,85,.25);text-transform:uppercase;
        animation:s7waitBlink 2s ease-in-out infinite;}
      @keyframes s7waitBlink{0%,100%{opacity:.2;letter-spacing:4px}50%{opacity:.6;letter-spacing:6px}}
    `;
    document.head.appendChild(style);

    const ov = document.createElement('div');
    ov.id = 's7-enter';
    ov.innerHTML = '<div class="s7-enter-text">[ enter ]</div>';
    document.body.appendChild(ov);

    let done = false;
    const go = () => {
      if (done) return; done = true;
      document.removeEventListener('keydown', go);
      ov.removeEventListener('click', go);

      unlock();
      if (!logiPlayed) { logiPlayed = true; one('логи', V.logi); } // ровно один раз

      ov.style.opacity = '0';
      setTimeout(() => ov.remove(), 520);

      if (typeof window.startBootLogs === 'function') window.startBootLogs();
    };
    document.addEventListener('keydown', go);
    ov.addEventListener('click', go);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildEnter);
  else buildEnter();
})();
