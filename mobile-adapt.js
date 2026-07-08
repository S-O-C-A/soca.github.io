(function(){

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
      // Пользователь может свободно приближать (до 5x) и
      // отдалять (до 0.25x) щипком двумя пальцами.
      meta.setAttribute('content',
        'width=' + DESIGN_WIDTH +
        ', user-scalable=yes, minimum-scale=0.25, maximum-scale=5');
    }else{
      // Десктоп / большой планшет: обычное поведение, зум разрешён.
      meta.setAttribute('content',
        'width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5');
    }
  }

  applyViewport();
  window.addEventListener('orientationchange', applyViewport);

  // ══════════════════════════════════════════════════════
  // ВЫСОКИЕ СТРАНИЦЫ (index.html, eject.html): спроектированы
  // под высокий экран. На низких экранах рендерим контейнер
  // в виртуальной высоте 800px и ужимаем ЦЕЛИКОМ одним scale.
  // Ширина задаётся В ПИКСЕЛЯХ (не %!) - иначе композиция
  // уезжает влево. На soca.html таких контейнеров нет.
  // ══════════════════════════════════════════════════════
  const PAGE_DESIGN_HEIGHT = 800;

  function scaleTallPage(){
    const target = document.querySelector('.boot-container')
                || document.getElementById('eject-ui');
    if(!target) return;
    const H = window.innerHeight;
    const W = window.innerWidth;

    if(H < 620){
      const k = H / PAGE_DESIGN_HEIGHT;
      // Вытаскиваем контейнер из флекс-центрирования body
      // (иначе body центрирует контейнер шире экрана,
      // выдвигая его левый край в минус - сдвиг влево)
      target.style.position = 'absolute';
      target.style.left = '0';
      target.style.top = '0';
      target.style.width = (W / k) + 'px';
      target.style.height = PAGE_DESIGN_HEIGHT + 'px';
      target.style.minHeight = '0';
      target.style.transform = 'scale(' + k + ')';
      target.style.transformOrigin = 'top left';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }else{
      target.style.position = '';
      target.style.left = '';
      target.style.top = '';
      target.style.width = '';
      target.style.height = '';
      target.style.minHeight = '';
      target.style.transform = '';
      target.style.transformOrigin = '';
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }

  scaleTallPage();
  window.addEventListener('resize', scaleTallPage);

  // Страницы измеряют экран при загрузке - ДО нашей смены
  // viewport. Пинаем их обработчики resize (канвас звёзд
  // в eject.html пересоберёт свой буфер под новый размер).
  setTimeout(() => window.dispatchEvent(new Event('resize')), 50);

  // ══════════════════════════════════════════════════════
  // CSS: база чата + компактные тосты + заглушка поворота
  // ══════════════════════════════════════════════════════
  const style = document.createElement('style');
  style.textContent = `

  /*  БАЗА (десктоп) — позиционирование чата.
     Единственное объявление, style.css его не содержит.*/
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

  /* Чат на низких экранах (телефон в landscape).
     Внимание: после фиксации viewport высота меряется в
     виртуальных px, поэтому пороги подняты.  */
  @media (orientation:landscape) and (max-height:620px){
    .chat-overlay{
      max-height: 78vh;
      bottom: 3vh;
    }
    .chat-body{ max-height: 38vh; }
  }

  /* ТОСТЫ / SMAILY / ОПРОС - компактнее на тач-устройствах.
     pointer:coarse = палец вместо мыши, max-height отсекает
     планшеты с большим экраном. !important обязателен:
     #toast-stack задаёт размеры инлайн-стилями */
  @media (pointer:coarse) and (max-height:620px){

    /* Стек системных тостов — уже и ближе к углу */
    #toast-stack{
      width: 230px !important;
      bottom: 12px !important;
      right: 12px !important;
      gap: 6px !important;
    }
    .ts-toast{ padding: 7px 10px; }
    .ts-body{ font-size: 10px; line-height: 1.45; }

    /* Тосты SMAILY */
    .smaily-toast{
      max-width: 220px;
      bottom: 110px;
      right: 12px;
      padding: 8px 10px;
      font-size: 10px;
    }
    .smaily-toast-body{ line-height: 1.45; }

    /* Окно опроса SOCA - уже + скролл внутри, если не влезает
       по высоте (на телефонах виртуальная высота всего ~450-520px) */
    #soca-survey-box{
      width: 440px;
      max-height: 90vh;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
  }

  /*ЗАГЛУШКА "ПОВЕРНИТЕ УСТРОЙСТВО" */
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
