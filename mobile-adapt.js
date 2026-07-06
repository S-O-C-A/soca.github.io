// ═══════════════════════════════════════════════════════════
// SOCA — ЕДИНСТВЕННЫЙ ФАЙЛ АДАПТАЦИИ (desktop + mobile/tablet)
//
// СТРАТЕГИЯ v2: никакой перестройки сетки. На маленьких
// экранах (landscape) сайт показывается ЦЕЛИКОМ в полном
// десктопном виде — просто пропорционально уменьшенный.
// Достигается через meta viewport: телефону говорим, что
// его экран шириной DESIGN_WIDTH px, и браузер сам
// вписывает весь макет в экран.
//
// Подключить ОДНОЙ строкой перед закрывающим </body>:
//   <script src="mobile-adapt.js"></script>
// ═══════════════════════════════════════════════════════════

(function(){

  // ── Ширина "виртуального экрана" для телефонов/планшетов.
  //    Макет .terminal рассчитан на ~1100-1400px, при 1150
  //    три колонки (220px | 1fr | 240px) выглядят как на десктопе.
  const DESIGN_WIDTH = 1150;

  // ══════════════════════════════════════════════════════
  // VIEWPORT: масштабирование целиком вместо перестройки
  // ══════════════════════════════════════════════════════
  let meta = document.querySelector('meta[name="viewport"]');
  if(!meta){
    meta = document.createElement('meta');
    meta.name = 'viewport';
    document.head.appendChild(meta);
  }

  function applyViewport(){
    // Большая сторона экрана = ширина устройства в landscape.
    const landscapeWidth = Math.max(screen.width, screen.height);

    if(landscapeWidth < DESIGN_WIDTH){
      // Телефон / небольшой планшет: рисуем макет в DESIGN_WIDTH
      // виртуальных px, браузер сам ужмёт его до ширины экрана.
      meta.setAttribute('content', 'width=' + DESIGN_WIDTH);
    }else{
      // Десктоп / большой планшет: обычное поведение.
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
  }

  applyViewport();
  window.addEventListener('orientationchange', applyViewport);

  // ══════════════════════════════════════════════════════
  // CSS: база чата + заглушка поворота.
  // Перестроечных media-правил (одна колонка, сжатие шапки
  // и т.д.) больше НЕТ — они и создавали "урезанный" вид.
  // ══════════════════════════════════════════════════════
  const style = document.createElement('style');
  style.textContent = `

  /* ── БАЗА (десктоп) — позиционирование чата.
     Единственное объявление, style.css его не содержит. ── */
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

  /* ── Чат на низких экранах (телефон в landscape).
     Внимание: после фиксации viewport высота меряется в
     виртуальных px, поэтому пороги подняты. ── */
  @media (orientation:landscape) and (max-height:620px){
    .chat-overlay{
      max-height: 78vh;
      bottom: 3vh;
    }
    .chat-body{ max-height: 38vh; }
  }

  /* ── ЗАГЛУШКА "ПОВЕРНИТЕ УСТРОЙСТВО" ── */
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
