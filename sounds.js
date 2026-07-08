// ========== ЗВУКИ ДЛЯ СОКА ==========

const SOUNDS_PATH = 'sounds/';

const soundFiles = {
  click: 'кнопки.mp3',
  error: 'ошибка.mp3',
  glitch: 'глитчи.mp3',
  diag: 'диагностика.mp3',
  music: 'музыка на фон.mp3',
  ambient: 'звуки на фон.mp3'
};

const sounds = {};
const soundPools = {
  click: [],
  error: [],
  diag: []
};
const poolIndexes = {
  click: 0,
  error: 0,
  diag: 0
};
const SOUND_POOL_SIZE = 4;

const soundObservers = [];
const soundIntervals = [];
const soundTimeouts = [];

function registerSoundTimeout(timeoutId) {
  soundTimeouts.push(timeoutId);
  return timeoutId;
}

function registerSoundInterval(intervalId) {
  soundIntervals.push(intervalId);
  return intervalId;
}

function registerSoundObserver(observer) {
  soundObservers.push(observer);
  return observer;
}

function clearSoundHandles() {
  soundTimeouts.forEach(clearTimeout);
  soundTimeouts.length = 0;
  soundIntervals.forEach(clearInterval);
  soundIntervals.length = 0;
  soundObservers.forEach(observer => observer.disconnect());
  soundObservers.length = 0;
}

function getBaseSound(key) {
  if (!soundFiles[key]) return null;
  if (!sounds[key]) {
    const audio = new Audio(SOUNDS_PATH + soundFiles[key]);
    audio.preload = 'auto';
    sounds[key] = audio;
  }
  return sounds[key];
}

function getPooledSound(key) {
  const pool = soundPools[key];
  if (!pool) return null;
  const idx = poolIndexes[key] = (poolIndexes[key] + 1) % SOUND_POOL_SIZE;
  if (!pool[idx]) {
    const base = getBaseSound(key);
    if (!base) return null;
    pool[idx] = base.cloneNode();
    pool[idx].preload = 'auto';
  }
  const audio = pool[idx];
  audio.pause();
  audio.currentTime = 0;
  return audio;
}

function playEffect(key, options = {}) {
  if (!isSoundEnabled) return;
  const audio = getPooledSound(key) || getBaseSound(key)?.cloneNode();
  if (!audio) return;
  audio.volume = options.volume !== undefined ? options.volume : 0.5;
  if (options.startTime !== undefined) audio.currentTime = options.startTime;
  audio.play().catch(() => {});
}

function maybePlayShortGlitch(sound) {
  if (!sound) return;
  sound.play().catch(() => {});
  registerSoundTimeout(setTimeout(() => sound.pause(), 600));
}

function playClick() {
  playEffect('click', { volume: 0.3 });
}

function playError() {
  playEffect('error', { volume: 0.4 });
}

function playShortGlitch() {
  if (!isSoundEnabled || document.hidden) return;
  const base = getBaseSound('glitch');
  if (!base) return;
  const sound = base.cloneNode();
  sound.preload = 'auto';
  sound.volume = 0.35;
  sound.currentTime = 0.2;
  maybePlayShortGlitch(sound);
}

function playDiag() {
  playEffect('diag', { volume: 0.3 });
}

// ========== КЛИКИ НА КНОПКИ (без ошибок) ==========
// ========== УНИВЕРСАЛЬНЫЙ ВАРИАНТ (ловит все клики) ==========
function addClickSounds() {
  // Ловим клики на всех элементах, у которых есть onclick или role="button"
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[onclick], .nc-btn, .ap-corr-btn, .ctrl-btn, .proto-item, .eject-lock-btn, #eject-hold-btn, #abort-btn, [onclick*="runDeepScan"], [onclick*="calcAltRoute"], [onclick*="emergencyAction"], [onclick*="toggleProto"], #apForceResetBtn, [onclick*="resetDiagnostic"]');
    
    if (target) {
      playClick();
    }
  });
}

// ========== КОНКРЕТНЫЕ ОШИБКИ ==========

// 1. Неправильный пароль в boot-экране
function setupBootPasswordError() {
  const passInput = document.getElementById('bootPassword');
  const msgDiv = document.getElementById('promptMessage');
  
  if (!passInput) return;
  
  const originalHandler = passInput.onkeypress;
  passInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const val = passInput.value.trim();
      if (val !== '0440') {
        playError();
      }
    }
  });
}

// 2. EJECT система (неправильный код)
function setupEjectAuthError() {
  const authDigits = document.querySelectorAll('.auth-digit');
  const authBtn = document.querySelector('.eject-lock-btn');
  
  if (authDigits.length) {
    const inputs = document.querySelectorAll('#auth-digits input');
    inputs.forEach((input, idx) => {
      input.addEventListener('change', () => {
        const code = Array.from(inputs).map(i => i.value).join('');
        if (code.length === 4 && code !== '0941') {
          playError();
        }
      });
    });
  }
  
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      const pwInput = document.getElementById('eject-master-pw');
      if (pwInput && pwInput.value.trim() !== '0440') {
        playError();
      }
    });
  }
}

// 3. Заблокированные пилоты
function setupLockedPilots() {
  const lockedPilots = document.querySelectorAll('.pilot-tab.locked');
  lockedPilots.forEach(pilot => {
    pilot.addEventListener('click', () => {
      playError();
    });
  });
}

// 4. EXPIRED сертификаты
function setupExpiredCerts() {
  const expired = document.querySelectorAll('.cert.expired');
  expired.forEach(cert => {
    cert.addEventListener('click', () => {
      playError();
    });
  });
}

// 5. Диагностика - неверный ввод Y/N
function setupDiagError() {
  document.addEventListener('keydown', (e) => {
    const diagPage = document.getElementById('page-diag');
    if (diagPage && diagPage.classList.contains('active')) {
      const waitingPrompt = document.getElementById('waitingPrompt');
      if (waitingPrompt && !window.diagnosticRunning) {
        if (e.key !== 'y' && e.key !== 'Y' && e.key !== 'n' && e.key !== 'N') {
          playError();
        }
      }
    }
  });
}

// 6. Системные ошибки (глобально)
function setupSystemErrors() {
  // Отслеживаем появление красных сообщений об ошибках
  const observer = registerSoundObserver(new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.classList && (node.classList.contains('alert-item') || node.classList.contains('glow-r'))) {
              playShortGlitch();
            }
          }
        });
      }
    });
  }));
  
  observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => {
  addClickSounds();
  setupForceReset();
  setupEjectHold();
  setupAbortEject();
  setupRunFullScan();
  setupCalcAltRoute();
  setupEmergencyProtocols();
  setupProtocolItems();
  setupChatSend();
  setupDiagnosticRun();
  
  // ========== НОВЫЕ ВЫЗОВЫ ==========
  setupDiagnosticSound();   // звуки диагностики
  setupRandomGlitches();    // случайные глитчи по сайту
  setupChatGlitch();        // глитчи при сообщениях SOCA
  
  console.log('🕪 Sound system ready');
});

// ========== ОСОБЫЕ ЗВУКИ ДЛЯ КОНКРЕТНЫХ КНОПОК ==========

// 1. FORCE RESET - звук глитча + сбой
function setupForceReset() {
  const resetBtn = document.getElementById('apForceResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      playShortGlitch();
      registerSoundTimeout(setTimeout(() => {
        playError();
      }, 200));
    });
  }
}

// 2. EJECT HOLD - долгий глитч / тревога
function setupEjectHold() {
  const ejectBtn = document.getElementById('eject-hold-btn');
  if (ejectBtn) {
    ejectBtn.addEventListener('mousedown', () => {
      playShortGlitch();
    });
    ejectBtn.addEventListener('click', () => {
      playError();
    });
  }
}

// 3. ABORT EJECT - звук отмены (короткий клик)
function setupAbortEject() {
  const abortBtn = document.getElementById('abort-btn');
  if (abortBtn) {
    abortBtn.addEventListener('click', () => {
      playClick();
    });
  }
}

// 4. RUN FULL SCAN (NAV CORE) - звук диагностики
function setupRunFullScan() {
  const scanBtn = document.querySelector('[onclick*="runDeepScan"]');
  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      playDiag();
    });
  }
}

// 5. CALCULATE ALT. ROUTE (NAV CORE) - звук клика + короткий глитч
function setupCalcAltRoute() {
  const calcBtn = document.querySelector('[onclick*="calcAltRoute"]');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      playClick();
      registerSoundTimeout(setTimeout(() => playShortGlitch(), 100));
    });
  }
}

// 6. EMERGENCY PROTOCOLS (MAYDAY, PURGE, LOCKDOWN) - тревожный звук
function setupEmergencyProtocols() {
  const emergencyBtns = document.querySelectorAll('[onclick*="emergencyAction"]');
  emergencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playError();
      registerSoundTimeout(setTimeout(() => playShortGlitch(), 300));
    });
  });
}

// 7. PROTOCOL ITEMS (PROTO-01, PROTO-02) - звук диагностики
function setupProtocolItems() {
  const protoBtns = document.querySelectorAll('[onclick*="toggleProto"]');
  protoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playDiag();
    });
  });
}

// 8. CHAT SEND - короткий "отправка"
function setupChatSend() {
  const chatSend = document.querySelector('.chat-send');
  const chatInput = document.getElementById('chat-input');
  
  if (chatSend) {
    chatSend.addEventListener('click', () => {
      playClick();
    });
  }
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        playClick();
      }
    });
  }
}

// 9. RUN DIAGNOSTIC (F4) - звук диагностики
function setupDiagnosticRun() {
  const diagRun = document.querySelector('#diagResetBtn button, [onclick*="resetDiagnostic"]');
  if (diagRun) {
    diagRun.addEventListener('click', () => {
      playDiag();
    });
  }
}

// ========== СПЕЦИАЛЬНЫЙ ЗВУК ДЛЯ ДИАГНОСТИКИ ==========

function setupDiagnosticSound() {
  // Отслеживаем начало диагностики (нажатие Y)
  document.addEventListener('keydown', (e) => {
    const diagPage = document.getElementById('page-diag');
    if (diagPage && diagPage.classList.contains('active')) {
      const waitingPrompt = document.getElementById('waitingPrompt');
      if (waitingPrompt && !window.diagnosticRunning) {
        if (e.key === 'y' || e.key === 'Y') {
          // Специальный звук при запуске диагностики
          const baseDiag = getBaseSound('diag');
          if (!baseDiag) return;
          const specialSound = baseDiag.cloneNode();
          specialSound.volume = 0.35;
          specialSound.play().catch(err => console.log('Audio error:', err));
        }
      }
    }
  });
  
  // Отслеживаем появление новых строк в диагностическом логе
  const observer = registerSoundObserver(new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList && node.classList.contains('diag-log-entry')) {
            // При каждом новом логе в диагностике — короткий звук (негромкий)
            const baseDiag = getBaseSound('diag');
            if (!baseDiag) return;
            const logSound = baseDiag.cloneNode();
            logSound.volume = 0.12;
            logSound.currentTime = 0.1;
            logSound.play().catch(err => console.log('Audio error:', err));
          }
        });
      }
    });
  }));
  
  const diagLog = document.getElementById('diagLog');
  if (diagLog) {
    observer.observe(diagLog, { childList: true });
  }
}

// ========== СЛУЧАЙНЫЕ ГЛИТЧИ ПО ВСЕМУ САЙТУ ==========

function setupRandomGlitches() {
  // Случайный глитч-звук (не часто)
  registerSoundInterval(setInterval(() => {
    // 8% шанс каждые 15-25 секунд
    if (!document.hidden && Math.random() < 0.08) {
      playShortGlitch();
    }
  }, 18000));
  
  // При любом глитч-эффекте на странице (дерганье, красная вспышка)
  const observer = registerSoundObserver(new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList && (
          target.classList.contains('glitch-instant') ||
          target.classList.contains('critical-glitch') ||
          target.classList.contains('red-flash') ||
          target.classList.contains('page-red-flash')
        )) {
          playShortGlitch();
        }
      }
    });
  }));
  
  observer.observe(document.body, { attributes: true });
  observer.observe(document.querySelector('.boot-gear') || document.body, { attributes: true });
}

// ========== ГЛИТЧ ПРИ ОШИБКАХ В ЧАТЕ ==========

function setupChatGlitch() {
  const chatBody = document.getElementById('chat-body');
  if (!chatBody) return;
  
  const observer = registerSoundObserver(new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList && node.classList.contains('chat-message')) {
            // 30% шанс, что сообщение SOCA сопровождается глитчем
            if (node.classList.contains('bot') && Math.random() < 0.3) {
              playShortGlitch();
            }
          }
        });
      }
    });
  }));
  
  observer.observe(chatBody, { childList: true });
}

// ========== ФОНОВЫЕ ЗВУКИ И МУЗЫКА ==========

let backgroundMusic = null;
let ambientSounds = null;
let isSoundEnabled = true;
let musicVolume = 0.15;      // тихая музыка
let ambientVolume = 0.2;     // фоновые звуки

// Запуск фоновой музыки и звуков
function startBackgroundAudio() {
  if (!isSoundEnabled) return;

  if (!backgroundMusic) {
    const baseMusic = getBaseSound('music');
    if (baseMusic) {
      backgroundMusic = baseMusic.cloneNode();
      backgroundMusic.loop = true;
      backgroundMusic.volume = musicVolume;
    }
  }
  if (backgroundMusic && backgroundMusic.paused) {
    backgroundMusic.play().catch(e => console.log('Music autoplay blocked:', e));
  }

  if (!ambientSounds) {
    const baseAmbient = getBaseSound('ambient');
    if (baseAmbient) {
      ambientSounds = baseAmbient.cloneNode();
      ambientSounds.loop = true;
      ambientSounds.volume = ambientVolume;
    }
  }
  if (ambientSounds && ambientSounds.paused) {
    ambientSounds.play().catch(e => console.log('Ambient autoplay blocked:', e));
  }
}

// Остановка всех фоновых звуков
function stopBackgroundAudio() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  if (ambientSounds) {
    ambientSounds.pause();
    ambientSounds.currentTime = 0;
  }
}

// Переключение звука (вкл/выкл)
function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  if (isSoundEnabled) {
    startBackgroundAudio();
  } else {
    stopBackgroundAudio();
  }
  return isSoundEnabled;
}

// Изменение громкости музыки
function setMusicVolume(volume) {
  musicVolume = Math.min(0.5, Math.max(0, volume));
  if (backgroundMusic) {
    backgroundMusic.volume = musicVolume;
  }
}

// Изменение громкости фоновых звуков
function setAmbientVolume(volume) {
  ambientVolume = Math.min(0.5, Math.max(0, volume));
  if (ambientSounds) {
    ambientSounds.volume = ambientVolume;
  }
}

// ========== ЗАПУСК ФОНА ПРИ ЗАГРУЗКЕ ==========

// Автозапуск после любого взаимодействия с пользователем (т.к. браузеры блокируют autoplay)
let audioStarted = false;

function tryStartAudio() {
  if (audioStarted) return;
  audioStarted = true;
  startBackgroundAudio();
  
  // Удаляем обработчики после первого запуска
  document.removeEventListener('click', tryStartAudio);
  document.removeEventListener('keydown', tryStartAudio);
  document.body.removeEventListener('touchstart', tryStartAudio);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopBackgroundAudio();
  } else if (isSoundEnabled) {
    startBackgroundAudio();
  }
});

// Ждём первого взаимодействия пользователя
document.addEventListener('click', tryStartAudio);
document.addEventListener('keydown', tryStartAudio);
document.body.addEventListener('touchstart', tryStartAudio);

// ========== ДОБАВЛЯЕМ КНОПКУ УПРАВЛЕНИЯ ЗВУКОМ ==========

function addSoundControlButton() {
  const button = document.createElement('div');
  button.id = 'sound-control';
  button.innerHTML = '🕪';
  button.style.cssText = `
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid var(--border);
    color: var(--g);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
  `;
  
  button.onmouseenter = () => {
    button.style.borderColor = 'var(--g)';
    button.style.background = 'rgba(0, 255, 136, 0.1)';
  };
  button.onmouseleave = () => {
    button.style.borderColor = 'var(--border)';
    button.style.background = 'rgba(0, 0, 0, 0.6)';
  };
  
  let soundOn = true;
  button.onclick = () => {
    soundOn = toggleSound();
    button.innerHTML = soundOn ? '🕪' : '🕨';
    if (!soundOn) {
      button.style.opacity = '0.5';
    } else {
      button.style.opacity = '1';
    }
  };
  
  document.body.appendChild(button);
}

// Запускаем добавление кнопки
document.addEventListener('DOMContentLoaded', () => {
  addSoundControlButton();
});
