// ═══════════════════════════════════════════════════════════
// SOCA — ЕДИНСТВЕННЫЙ ФАЙЛ АДАПТАЦИИ (desktop + mobile/tablet)
// style.css теперь НЕ содержит позиционирования .chat-overlay
// и НЕ скрывает .sidebar-left/.sidebar-right — всё это здесь.
//
// Подключить ОДНОЙ строкой перед закрывающим </body> в soca.html:
//   <script src="mobile-adapt.js"></script>
// ═══════════════════════════════════════════════════════════

(function(){

  const style = document.createElement('style');
  style.textContent = `

  /* ══════════════════════════════════════════════════════
     БАЗА (десктоп) — позиционирование чата.
     Раньше это жило в style.css в трёх конфликтующих местах.
     Теперь это единственное объявление, без !important нужды
     на десктопе — мобильные правки идут отдельными media ниже
     и переопределяют только то, что нужно.
     ══════════════════════════════════════════════════════ */
  .chat-overlay{
    position: fixed;
    right: 26px;
    bottom: 80px;
    width: min(400px, calc(100vw - 32px));
    max-height: 500px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ══════════════════════════════════════════════════════
     ЗАГЛУШКА "ПОВЕРНИТЕ УСТРОЙСТВО"
     ══════════════════════════════════════════════════════ */
  #rotate-overlay{
    display:none;
    position:fixed;
    inset:0;
    z-index:999999;
    background:#000;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:18px;
    font-family:'Share Tech Mono',monospace;
    color:#00ff88;
    text-align:center;
    padding:20px;
  }
  #rotate-overlay .rotate-icon{
    width:46px;height:46px;
    border:2px solid #00ff88;border-radius:4px;
    position:relative;
    animation:rotateHint 2.2s ease-in-out infinite;
  }
  #rotate-overlay .rotate-icon::after{
    content:'';position:absolute;top:-7px;right:-2px;
    width:0;height:0;
    border-left:5px solid transparent;border-right:5px solid transparent;
    border-bottom:7px solid #00ff88;
  }
  @keyframes rotateHint{
    0%,15%   { transform:rotate(0deg); }
    45%,60%  { transform:rotate(-90deg); }
    90%,100% { transform:rotate(-90deg); }
  }
  #rotate-overlay .rotate-text{ font-size:13px;letter-spacing:0.08em;opacity:0.85; }
  #rotate-overlay .rotate-sub{ font-size:9px;letter-spacing:0.06em;color:#005533; }

  @media (orientation:portrait){
    #rotate-overlay{ display:flex; }
    body > *:not(#rotate-overlay){ visibility:hidden; }
  }

  /* ══════════════════════════════════════════════════════
     ПЛАНШЕТЫ / ШИРОКИЕ ТЕЛЕФОНЫ В LANDSCAPE
     (раньше: @media(max-width:1100px) в style.css)
     ══════════════════════════════════════════════════════ */
  @media (max-width:1100px) and (orientation:landscape){
    .main-grid{ grid-template-columns:180px 1fr 200px; }
  }

  /* ══════════════════════════════════════════════════════
     ТЕЛЕФОНЫ / ПЛАНШЕТЫ В LANDSCAPE — главная адаптация.
     Стратегия: НИЧЕГО не прячем (NAVIGATION, SYS STATUS,
     PILOT DATA, TELEMETRY, PROXIMITY SCAN, COMMS, шапка,
     подвал — всё остаётся). Вместо 3 колонок делаем 1
     вертикальную колонку, всё сжимаем по масштабу так,
     чтобы НИЧЕГО не вылезало по ширине. Высота — скролл.
     ══════════════════════════════════════════════════════ */
  @media (max-width:900px) and (orientation:landscape){

    html, body{ overflow-x:hidden; }

    .terminal{
      max-width:100vw;
      padding:4px;
      font-size:11px;
    }

    /* Шапка — сжимаем, но НЕ прячем. Разрешаем перенос/скролл
       внутри неё по горизонтали если совсем не влезает, но
       сначала пытаемся ужать всё. */
    .topbar{
      height:auto;
      flex-wrap:wrap;
      font-size:8px;
    }
    .tb-seg{
      padding:0 5px;
      font-size:8px;
      height:20px;
    }
    .tb-user{ font-size:9px; }
    .tb-spacer{ display:none; } /* бегущая строка — декоративна, единственное что прячем */
    .tb-time{ font-size:9px;padding:0 6px; }
    .tb-status{ font-size:8px;padding:0 6px; }

    /* Главный грид — в одну колонку, все панели друг под другом */
    .main-grid{
      grid-template-columns:1fr;
      grid-template-rows:auto;
      gap:4px;
    }
    .sidebar-left, .sidebar-right, .center-col{
      grid-column:1;
      display:flex;
      flex-direction:column;
      gap:4px;
      width:100%;
    }

    /* Панели — компактнее, но видимы полностью */
    .panel-header{
      padding:4px 8px;
      font-size:8px;
    }
    .panel-header .title{ font-size:9px; }
    .panel-body{ padding:6px 8px; font-size:10px; }

    /* Telemetry grid — оставляем 2 колонки (как на десктопе),
       просто уменьшаем шрифт чисел чтобы не вылезало */
    .telem-num{ font-size:18px; }
    .telem-unit, .telem-label{ font-size:8px; }

    /* Радар — уменьшаем сам блок, он квадратный и легко сжимается */
    .radar{ width:100px; height:100px; margin:0 auto; }

    /* Подвал — тоже не прячем, сжимаем и разрешаем перенос строк */
    .bottombar{
      height:auto;
      flex-wrap:wrap;
      font-size:7px;
    }
    .bb-seg{ padding:0 5px;height:18px;font-size:7px; }
    .bb-version{ font-size:7px;padding:0 6px; }

    .gear-logo{ transform:scale(0.5); }
  }

  /* Совсем маленькие телефоны — ещё компактнее, но по той же схеме */
  @media (max-width:640px) and (orientation:landscape){
    .terminal{ font-size:10px; }
    .panel-header, .panel-header .title{ font-size:8px; }
    .panel-body{ font-size:9px; padding:5px 6px; }
    .telem-num{ font-size:15px; }
    .radar{ width:80px; height:80px; }
    .bb-seg{ font-size:6px;padding:0 4px; }
    .tb-seg{ font-size:7px;padding:0 4px; }
  }


  /* ══════════════════════════════════════════════════════
     ЧАТ — мобильная версия (низкие экраны в landscape)
     ══════════════════════════════════════════════════════ */
  @media (orientation:landscape) and (max-height:600px){
    .chat-overlay{
      width: min(92vw, 480px);
      max-width: 92vw;
      max-height: 80vh;
      right: 4vw;
      bottom: 4vh;
    }
    .chat-body{ max-height: 40vh; }
  }
  @media (orientation:landscape) and (max-height:420px){
    .chat-overlay{
      max-height: 88vh;
      bottom: 2vh;
      right: 2vw;
    }
    .chat-body{ max-height: 34vh; }
    .chat-message{ font-size:10px; padding:7px 9px; }
  }

  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'rotate-overlay';
  overlay.innerHTML = `
    <div class="rotate-icon"></div>
    <div class="rotate-text">ROTATE DEVICE</div>
    <div class="rotate-sub">// landscape mode required</div>
  `;
  document.body.appendChild(overlay);

})();
