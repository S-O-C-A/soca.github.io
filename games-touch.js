
(function(){

  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  // ══════════════════════════════════════════════════════
  // ЧАСТЬ 1: СКРОЛЛ (нужен всем, не только тачу)
  // ══════════════════════════════════════════════════════
  const css = document.createElement('style');
  css.textContent = `
  /* Селектор игр: скроллится сам, не пропуская скролл на body.
     Трюк с margin:auto сохраняет центрирование, когда контент
     влезает, и даёт нормальный скролл сверху, когда нет. */
  #game-selector{
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    justify-content: flex-start !important;
  }
  #game-selector > :first-child{ margin-top: auto; }
  #game-selector > :last-child{ margin-bottom: auto; }

  #game-arena{
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* ── Виртуальный геймпад ── */
  #touch-pad{
    display:none;
    position:fixed;
    left:0; right:0; bottom:10px;
    z-index:9999;
    pointer-events:none;
    padding:0 14px;
    justify-content:space-between;
    align-items:flex-end;
    font-family:'Share Tech Mono',monospace;
  }
  #touch-pad .tp-group{
    display:flex; gap:10px; align-items:flex-end;
    pointer-events:none;
  }
  #touch-pad .tp-col{ display:flex; flex-direction:column; gap:10px; align-items:center; }
  #touch-pad button{
    pointer-events:auto;
    width:66px; height:66px;
    background:rgba(0,40,20,0.55);
    border:1px solid rgba(0,255,136,0.55);
    border-radius:8px;
    color:#00ff88;
    font-family:inherit;
    font-size:22px;
    text-shadow:0 0 6px rgba(0,255,136,0.6);
    -webkit-tap-highlight-color:transparent;
    touch-action:none;
    user-select:none;
    -webkit-user-select:none;
  }
  #touch-pad button.tp-wide{ width:96px; font-size:13px; letter-spacing:0.1em; }
  #touch-pad button.tp-active{
    background:rgba(0,255,136,0.28);
    box-shadow:0 0 14px rgba(0,255,136,0.4);
  }
  `;
  document.head.appendChild(css);

  // Блокируем скролл body, пока открыт оверлей игр
  // (оборачиваем существующие функции, не меняя games_patch.js)
  function wrapWhenReady(){
    if (typeof window.openGames !== 'function' || typeof window.closeGames !== 'function'){
      setTimeout(wrapWhenReady, 200);
      return;
    }
    const _open = window.openGames, _close = window.closeGames;
    window.openGames = function(){
      _open.apply(this, arguments);
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    };
    window.closeGames = function(){
      _close.apply(this, arguments);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }
  wrapWhenReady();

  // ══════════════════════════════════════════════════════
  // ЧАСТЬ 2: ВИРТУАЛЬНЫЙ ГЕЙМПАД (только тач-устройства)
  // ══════════════════════════════════════════════════════
  if(!isTouch) return;

  // Раскладки кнопок для каждой игры.
  // code — какой e.code шлём; repeat — повторять пока держат
  // (нужно играм, где 1 нажатие = 1 шаг, например Grid Breach).
  const LAYOUTS = {
    asteroids: {
      left:  [[{label:'◄',code:'ArrowLeft'},{label:'▲',code:'ArrowUp'},{label:'►',code:'ArrowRight'}]],
      right: [[{label:'FIRE',code:'Space',wide:true}]]
    },
    snake: {
      left:  [[{label:'▲',code:'ArrowUp'}],
              [{label:'◄',code:'ArrowLeft'},{label:'▼',code:'ArrowDown'},{label:'►',code:'ArrowRight'}]],
      right: [[{label:'❚❚',code:'Space'}]]
    },
    pong: {
      left:  [[{label:'▲',code:'ArrowUp'}],[{label:'▼',code:'ArrowDown'}]],
      right: [[{label:'●',code:'Space'}]]
    },
    breaker: {
      left:  [[{label:'◄',code:'ArrowLeft',repeat:true},{label:'►',code:'ArrowRight',repeat:true}]],
      right: [[{label:'●',code:'Space'}]]
    },
    heartbeat: {
      left:  [[{label:'A',code:'KeyA'},{label:'S',code:'KeyS'},{label:'D',code:'KeyD'}]],
      right: [[{label:'●',code:'Space'}]]
    }
  };

  const pad = document.createElement('div');
  pad.id = 'touch-pad';
  document.body.appendChild(pad);

  function sendKey(type, code){
    document.dispatchEvent(new KeyboardEvent(type, {
      code: code,
      key: code.startsWith('Key') ? code.slice(3).toLowerCase() : code,
      bubbles: true,
      cancelable: true
    }));
  }

  function makeButton(cfg){
    const b = document.createElement('button');
    b.textContent = cfg.label;
    if(cfg.wide) b.classList.add('tp-wide');
    let repeatTimer = null;

    b.addEventListener('touchstart', e => {
      e.preventDefault();
      b.classList.add('tp-active');
      sendKey('keydown', cfg.code);
      if(cfg.repeat){
        repeatTimer = setInterval(() => sendKey('keydown', cfg.code), 60);
      }
    }, { passive:false });

    const release = e => {
      if(e) e.preventDefault();
      b.classList.remove('tp-active');
      if(repeatTimer){ clearInterval(repeatTimer); repeatTimer = null; }
      sendKey('keyup', cfg.code);
    };
    b.addEventListener('touchend', release, { passive:false });
    b.addEventListener('touchcancel', release, { passive:false });
    return b;
  }

  function buildPad(layout){
    pad.innerHTML = '';
    ['left','right'].forEach(side => {
      const col = document.createElement('div');
      col.className = 'tp-col';
      (layout[side] || []).forEach(row => {
        const g = document.createElement('div');
        g.className = 'tp-group';
        row.forEach(cfg => g.appendChild(makeButton(cfg)));
        col.appendChild(g);
      });
      pad.appendChild(col);
    });
  }

  // Следим за текущей игрой и показываем нужную раскладку
  let shownFor = null;
  setInterval(() => {
    const game = window.currentGame;
    const overlay = document.getElementById('games-overlay');
    const overlayOpen = overlay && overlay.style.display !== 'none';

    if(overlayOpen && game && LAYOUTS[game]){
      if(shownFor !== game){
        buildPad(LAYOUTS[game]);
        shownFor = game;
      }
      pad.style.display = 'flex';
    }else{
      pad.style.display = 'none';
      shownFor = null;
    }
  }, 300);

})();
