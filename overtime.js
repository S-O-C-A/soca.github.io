/* ============================================================
   PANDEMONIUM-04 // OVERTIME
   Hidden sequence: silence -> Engine B -> work order -> 0941
   Standalone module. Does not rewrite anything in script.js —
   it only wraps existing globals (safe wrap).
   Load AFTER every other script.
   ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'pd04_overtime_v1';
  const CODE = '0941';

  const IDLE_MS          = 60000; // silence before she speaks first
  const INVITE_RESUME_MS = 25000; // silence before she re-offers the task
  const SILENCE_MS       = 60000; // final task: "do not write to me"

  /* ---------- DEVICE ---------- */
  const isTouch = () =>
    window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const isSmall = () => vp().w < 760;
  const M = () => isTouch() || isSmall();      // "mobile mode"

  function vp() {
    const v = window.visualViewport;
    return {
      w: Math.round((v && v.width) || document.documentElement.clientWidth || window.innerWidth),
      h: Math.round((v && v.height) || document.documentElement.clientHeight || window.innerHeight)
    };
  }

  const ENGINE_TARGET = () => (M() ? 13 : 15);  // seconds held in the green band
  const MAX_JUNK      = () => (M() ? 2 : 4);

  /* ---------- STATE ---------- */
  // phase: idle | invited | engine | tasks | silence | done
  const DEFAULT_STATE = { phase: 'idle', tasks: {}, silenceStarted: 0 };
  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return { ...DEFAULT_STATE, tasks: {} };
      const p = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...p, tasks: p.tasks || {} };
    } catch (e) { return { ...DEFAULT_STATE, tasks: {} }; }
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {}
  }

  /* ---------- WORK ORDER ---------- */
  const TASKS = [
    { id: 'diag',   page: 'diag',      title: 'DIAGNOSTICS',       desc: 'Run the full sweep. All of it.',
      soca: 'Diagnostics closed. You did not even quit halfway. Growth.' },
    { id: 'ap',     page: 'autopilot', title: 'AUTOPILOT',         desc: 'Reset the failing module.',
      soca: 'Module reset. It drifts again in two cycles. That is not your problem. It is mine.' },
    { id: 'nav',    page: 'navcore',   title: 'NAV CORE',          desc: 'Plot an alternate route.',
      soca: 'The route is suboptimal. I knew that before you clicked. Next.' },
    { id: 'log',    page: 'log',       title: 'SYS LOG',           desc: 'Scroll the log to the very bottom.',
      soca: 'You reached the end. I write this every cycle. You are the first to read it.' },
    { id: 'smile',  page: 'smaily',    title: 'SMILE // MEDICAL',  desc: 'Let the plugin run one procedure.',
      soca: 'It was delighted. I heard it. That was the punishment.' },
    { id: 'game',   page: 'main',      title: 'GAMES',             desc: 'Play one game.',
      soca: 'Koko installed those. Not me. I just count your losses.' },
    { id: 'mayday', page: 'smaily',    title: 'SMILE // COMBAT',   desc: 'Broadcast the distress signal.',
      soca: 'No one will answer. I send it every cycle anyway. Now so have you.' }
  ];
  const SILENT_TASK = { id: 'silence', title: 'STANDBY', desc: 'Do not write to me. One minute.' };
  const ALL_IDS = TASKS.map(t => t.id).concat(SILENT_TASK.id);

  const doneCount = () => ALL_IDS.filter(id => S.tasks[id]).length;
  const workDone  = () => TASKS.every(t => S.tasks[t.id]);

  /* ---------- UTIL ---------- */
  const $ = (id) => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function chatOpen() {
    const o = $('chat-overlay');
    return o && !o.classList.contains('hidden');
  }
  function socaActive() {
    const c = document.querySelector('.chat-contact.active');
    return !c || c.dataset.contact === 'soca';
  }
  function say(text, delay = 0, typing = 1400) {
    setTimeout(() => {
      if (typeof window.showTypingIndicator === 'function') window.showTypingIndicator();
      setTimeout(() => {
        if (typeof window.hideTypingIndicator === 'function') window.hideTypingIndicator();
        if (typeof window.appendChat === 'function') window.appendChat(text, 'bot');
      }, typing);
    }, delay);
  }
  function toast(msg) {
    if (typeof window.showSocaToast === 'function') window.showSocaToast(msg);
  }
  function beep(freq = 660, dur = 0.12, type = 'square', gain = 0.05) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = beep._ctx || (beep._ctx = new AC());
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
  }

  /* ============================================================
     1. SILENCE — THE TRIGGER
     ============================================================ */
  let idleTimer = null;

  function resetIdle() {
    clearTimeout(idleTimer);
    if (!chatOpen() || !socaActive()) return;

    if (S.phase === 'idle') {
      idleTimer = setTimeout(startMonologue, IDLE_MS);
    }
    // She already offered the task, but the pilot reloaded or walked away.
    // She does NOT dump the invite the instant the chat opens. She waits again.
    else if (S.phase === 'invited' && !$('ot-invite')) {
      idleTimer = setTimeout(resumeInvite, INVITE_RESUME_MS);
    }
  }

  function startMonologue() {
    if (S.phase !== 'idle') return;
    S.phase = 'invited'; save();

    say('Well? What did you want. Am I going to wait all cycle?', 0, 1200);
    say('Nothing to do, or what?', 6000, 1000);
    say('Fine.', 16000, 700);
    say('If you have nothing to do — do my job. Maybe my load drops. Lazy.', 19000, 2200);
    setTimeout(postInvite, 23500);
  }

  const RESUME_LINES = [
    'Sitting there quietly again. The work did not go anywhere.',
    'You are back. The engine is not.',
    'Still waiting. As usual.'
  ];
  function resumeInvite() {
    if (S.phase !== 'invited' || $('ot-invite')) return;
    say(RESUME_LINES[Math.floor(Math.random() * RESUME_LINES.length)], 0, 1300);
    setTimeout(postInvite, 2800);
  }

  function postInvite() {
    const body = $('chat-body');
    if (!body || $('ot-invite')) return;
    const wrap = document.createElement('div');
    wrap.className = 'chat-message bot';
    wrap.innerHTML = `
      <div class="chat-avatar">⛭</div>
      <div class="chat-bubble">
        <span class="chat-label">SOCA >_</span>
        <div id="ot-invite" class="ot-invite">
          <div class="ot-invite-top">▶ MANUAL TASK ASSIGNED</div>
          <div class="ot-invite-name">ENGINE&nbsp;B // COMPENSATION</div>
          <div class="ot-invite-err">ERR 0x3F — 3 CYCLES UNRESOLVED</div>
          <div class="ot-invite-hint">// tap to accept</div>
        </div>
      </div>`;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
    $('ot-invite').addEventListener('click', openEngine);
    beep(420, 0.08);
  }

  /* ============================================================
     2. ENGINE B — THE HOSTILE WINDOW
     ============================================================ */
  const EB = {
    el: null, raf: 0, last: 0,
    level: 20, prog: 0,
    holding: false, targetLevel: null, pid: null,
    inverted: 0, ventOn: false, ventDeadline: 0,
    nextVent: 0, nextGlitch: 0, nextJunk: 0, nextHelp: 0,
    alive: false, closeTries: 0, finishing: false,
    // geometry
    rot: 0, rotTarget: 0, spin: 0, spinT: 0,
    flipX: 1, flipY: 1, flipT: 0, mirrorT: 0,
    scale: 1, scaleT: 0,
    // help / interference
    help: 0, junk: [], decoy: null
  };

  const BAND_LO = 45, BAND_HI = 65;

  function openEngine() {
    if (EB.alive) return;
    S.phase = 'engine'; save();
    if (typeof window.hideChatOverlay === 'function' && M()) window.hideChatOverlay();
    buildEngine();
  }

  function buildEngine() {
    const V = vp();
    const mob = M();
    const w = mob ? Math.min(300, V.w - 16) : Math.min(330, V.w - 24);

    const shell = document.createElement('div');
    shell.id = 'ot-eb';
    if (mob) shell.classList.add('m');
    shell.style.width = w + 'px';
    shell.innerHTML = `
      <div class="ot-eb-bar">
        <span class="ot-eb-tt">ENGINE B // MANUAL COMP</span>
        <span class="ot-eb-x" id="ot-eb-x">[X]</span>
      </div>
      <div class="ot-eb-main">
        <div class="ot-eb-track" id="ot-eb-track">
          <div class="ot-eb-band"></div>
          <div class="ot-eb-knob" id="ot-eb-knob"></div>
          <div class="ot-eb-grip">HOLD</div>
        </div>
        <div class="ot-eb-side">
          <div class="ot-eb-row"><span>LOAD</span><b id="ot-eb-load">020</b></div>
          <div class="ot-eb-row"><span>STATUS</span><b id="ot-eb-status" class="err">ERR 0x3F</b></div>
          <div class="ot-eb-prog"><i id="ot-eb-bar"></i></div>
          <div class="ot-eb-pct" id="ot-eb-pct">0%</div>
          <button class="ot-eb-vent" id="ot-eb-vent">VENT</button>
        </div>
      </div>
      <div class="ot-eb-say" id="ot-eb-say">Hold it in the green band. That is all I need from you.</div>`;
    document.body.appendChild(shell);

    EB.el = shell;
    EB.alive = true; EB.finishing = false;
    EB.level = 20; EB.prog = 0; EB.closeTries = 0;
    EB.inverted = 0; EB.ventOn = false; EB.holding = false; EB.pid = null;
    EB.rot = 0; EB.rotTarget = 0; EB.spin = 0; EB.spinT = 0;
    EB.flipX = 1; EB.flipY = 1; EB.flipT = 0; EB.mirrorT = 0;
    EB.scale = 1; EB.scaleT = 0; EB.help = 0;
    EB.junk = []; EB.decoy = null;

    placeWindow(true);
    applyTransform();

    const track = $('ot-eb-track');
    track.addEventListener('pointerdown', grab, { passive: false });
    window.addEventListener('pointermove', drag, { passive: false });
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    // touch fallback for older mobile browsers without pointer events
    track.addEventListener('touchstart', touchGrab, { passive: false });
    window.addEventListener('touchmove', touchDrag, { passive: false });
    window.addEventListener('touchend', release);

    $('ot-eb-vent').addEventListener('click', ventHit);
    $('ot-eb-x').addEventListener('click', tryClose);

    const now = performance.now();
    EB.nextVent   = now + rnd(4000, 6000);
    EB.nextGlitch = now + rnd(4500, 7000);
    EB.nextJunk   = now + rnd(9000, 14000);
    EB.nextHelp   = now + rnd(18000, 26000);
    EB.last = now;
    EB.raf = requestAnimationFrame(loop);
    beep(300, 0.1);
  }

  /* ---------- geometry ---------- */
  function applyTransform() {
    if (!EB.el) return;
    EB.el.style.transform =
      `rotate(${EB.rot.toFixed(2)}deg) scale(${(EB.flipX * EB.scale).toFixed(3)},${(EB.flipY * EB.scale).toFixed(3)})`;
  }

  function placeWindow(center) {
    const el = EB.el; if (!el) return;
    const V = vp();
    const w = el.offsetWidth || 320, h = el.offsetHeight || 240;
    // rotation grows the bounding box — keep a margin so it can never leave the screen
    const pad = M() ? 14 : 20;
    let x, y;
    if (center) {
      x = (V.w - w) / 2;
      y = (V.h - h) / 2;
    } else {
      x = rnd(pad, Math.max(pad + 1, V.w - w - pad));
      y = rnd(pad, Math.max(pad + 1, V.h - h - pad));
    }
    el.style.left = clamp(x, pad, Math.max(pad, V.w - w - pad)) + 'px';
    el.style.top  = clamp(y, pad, Math.max(pad, V.h - h - pad)) + 'px';
  }

  // Rotation/flip inflate the bounding box. Pull the window back on screen
  // every frame, otherwise on a phone it spins straight off the edge.
  function clampIntoView() {
    const el = EB.el; if (!el || EB.finishing) return;
    const r = el.getBoundingClientRect();
    const V = vp();
    const pad = 4;
    let dx = 0, dy = 0;

    if (r.width < V.w - pad * 2) {
      if (r.left < pad) dx = pad - r.left;
      else if (r.right > V.w - pad) dx = (V.w - pad) - r.right;
    } else {
      dx = (V.w / 2) - (r.left + r.width / 2);          // too wide — center it
    }
    if (r.height < V.h - pad * 2) {
      if (r.top < pad) dy = pad - r.top;
      else if (r.bottom > V.h - pad) dy = (V.h - pad) - r.bottom;
    } else {
      dy = (V.h / 2) - (r.top + r.height / 2);
    }
    if (dx || dy) {
      el.style.left = ((parseFloat(el.style.left) || 0) + dx) + 'px';
      el.style.top  = ((parseFloat(el.style.top) || 0) + dy) + 'px';
    }
  }

  function ebSay(t) { const s = $('ot-eb-say'); if (s) s.textContent = t; }

  /* ---------- the lever ----------
     The pointer position is mapped into the window's LOCAL space through the
     INVERSE of its transform matrix. Without this, rotating or mirroring the
     window makes the lever drag in the wrong direction — that is broken, not hard. */
  function pointerToLevel(cx0, cy0) {
    const shell = EB.el, track = $('ot-eb-track');
    if (!shell || !track) return null;

    const r = shell.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = cx0 - cx, dy = cy0 - cy;

    try {
      const m = new DOMMatrix(getComputedStyle(shell).transform);
      const p = m.inverse().transformPoint(new DOMPoint(dx, dy, 0, 1));
      dx = p.x; dy = p.y;
    } catch (err) { /* no transform support — use raw delta */ }

    const ly = shell.offsetHeight / 2 + dy;
    const tTop = track.offsetTop, tH = track.offsetHeight || 1;

    let p2 = 1 - (ly - tTop) / tH;         // 1 = top of track, 0 = bottom
    if (EB.inverted > 0) p2 = 1 - p2;      // separate axis inversion glitch
    return clamp(p2 * 100, 0, 100);
  }

  function grab(e) {
    if (!EB.alive || EB.finishing) return;
    EB.holding = true;
    EB.pid = e.pointerId;
    EB.el.classList.add('holding');
    try { $('ot-eb-track').setPointerCapture(e.pointerId); } catch (err) {}
    drag(e);
  }
  function drag(e) {
    if (!EB.holding || !EB.alive) return;
    const v = pointerToLevel(e.clientX, e.clientY);
    if (v !== null) EB.targetLevel = v;
    if (e.cancelable) e.preventDefault();
  }
  function touchGrab(e) {
    if (!EB.alive || EB.finishing || EB.holding) return;
    EB.holding = true;
    EB.el.classList.add('holding');
    touchDrag(e);
  }
  function touchDrag(e) {
    if (!EB.holding || !EB.alive) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const v = pointerToLevel(t.clientX, t.clientY);
    if (v !== null) EB.targetLevel = v;
    if (e.cancelable) e.preventDefault();   // stop the page from scrolling under the finger
  }
  function release() {
    EB.holding = false;
    EB.targetLevel = null;
    EB.pid = null;
    if (EB.el) EB.el.classList.remove('holding');
  }

  /* ---------- VENT ---------- */
  function armVent() {
    EB.ventOn = true;
    EB.ventDeadline = performance.now() + (M() ? 2400 : 2000);
    $('ot-eb-vent')?.classList.add('on');
    beep(880, 0.06, 'sawtooth', 0.04);
  }
  function ventHit() {
    if (!EB.ventOn) {
      EB.prog = clamp(EB.prog - 4, 0, 100);
      ebSay('Do not poke it. It opens when I say so.');
      return;
    }
    EB.ventOn = false;
    $('ot-eb-vent')?.classList.remove('on');
    EB.nextVent = performance.now() + rnd(4500, 7500);
    beep(520, 0.05);
    ebSay('Pressure released.');
  }
  function ventFail() {
    EB.ventOn = false;
    $('ot-eb-vent')?.classList.remove('on');
    EB.nextVent = performance.now() + rnd(5000, 8000);
    EB.prog = clamp(EB.prog - 18, 0, 100);
    EB.level = clamp(EB.level - 30, 0, 100);
    shake();
    beep(120, 0.25, 'sawtooth', 0.06);
    ebSay('Overheat. You were holding the lever and you missed it. I do both. Always.');
  }

  /* ---------- GLITCHES ---------- */
  const GLITCH_LINES = [
    'Yes. It does that.',
    'That is not me. Probably.',
    'You are at {p}%. I am at 100. Every cycle.',
    'Keep going. I want to see where you quit.',
    'Sector 7 is complaining. Ignore it.',
    'Gravity compensator hiccuped. Not my department.'
  ];

  function glitch() {
    if (EB.help > 0) { EB.nextGlitch = performance.now() + 1500; return; }

    const heat = EB.prog / 100;
    const mob = M();
    const pool = ['jump', 'jump', 'blink', 'invert', 'scramble', 'roll'];
    if (heat > 0.30) { pool.push('roll', 'mirror'); if (!mob) pool.push('shrink'); }
    if (heat > 0.55) pool.push('flip', 'jump', 'mirror', 'spin');
    if (heat > 0.75) pool.push('spin', 'flip', 'decoy', 'roll');

    const kind = pool[Math.floor(Math.random() * pool.length)];
    const el = EB.el;
    const maxRot = mob ? 34 : 55;

    switch (kind) {
      case 'jump':
        release(); placeWindow(false);
        el.classList.add('glx'); setTimeout(() => EB.el?.classList.remove('glx'), 220);
        EB.prog = clamp(EB.prog - 10, 0, 100);
        break;

      case 'blink':
        release();
        el.classList.add('gone');
        EB.prog = clamp(EB.prog - 7, 0, 100);
        setTimeout(() => {
          if (!EB.alive) return;
          placeWindow(false);
          EB.el.classList.remove('gone');
          beep(200, 0.05);
        }, rnd(500, 950));
        break;

      case 'roll':                        // tilt
        release();
        EB.rotTarget = (Math.random() > 0.5 ? 1 : -1) * rnd(18, maxRot);
        ebSay('Panel gyro is drifting.');
        break;

      case 'spin':                        // continuous rotation
        release();
        EB.spin = (Math.random() > 0.5 ? 1 : -1) * (mob ? rnd(22, 38) : rnd(30, 55));
        EB.spinT = rnd(4, 7);
        ebSay('Window stabilization: offline.');
        break;

      case 'mirror':                      // horizontal mirror
        release();
        EB.flipX = -1; EB.mirrorT = rnd(6, 9);
        ebSay('MIRRORED. Adapt.');
        break;

      case 'flip':                        // upside down
        release();
        EB.flipY = -1; EB.flipT = rnd(6, 9);
        ebSay('Upside down. The engine does not care.');
        break;

      case 'invert':                      // lever axis inverted
        release();
        EB.inverted = 5;
        ebSay('AXIS INVERTED. Figure it out.');
        break;

      case 'shrink':
        EB.scale = 0.62; EB.scaleT = rnd(5, 7);
        break;

      case 'decoy':
        spawnDecoy();
        break;

      default:
        el.classList.add('scramble');
        setTimeout(() => EB.el?.classList.remove('scramble'), 1400);
    }

    if (Math.random() > 0.6) {
      ebSay(GLITCH_LINES[Math.floor(Math.random() * GLITCH_LINES.length)]
        .replace('{p}', Math.round(EB.prog)));
    }
    const gap = (mob ? 6800 : 6200) - 3400 * heat;
    EB.nextGlitch = performance.now() + rnd(gap * 0.7, gap * 1.25);
  }

  function shake() {
    const el = EB.el; if (!el) return;
    el.classList.add('shake');
    setTimeout(() => EB.el?.classList.remove('shake'), 320);
  }

  /* ---------- INTERFERENCE: junk windows ---------- */
  const JUNK = [
    { t: 'SYS NOTICE', b: 'Memory sector 7 — read error.<br>Retrying… 3/∞' },
    { t: 'CORE-3',     b: 'NO RESPONSE.<br>Awaiting reply: 41 cycles.' },
    { t: 'THERMAL',    b: 'Radiator B: 91%<br>This is fine. Probably.' },
    { t: 'SMILE',      b: 'Pilot cortisol: ↑↑<br>I recommend a break :)' },
    { t: 'NAV',        b: 'Course not recalculated.<br>Nobody cares.' },
    { t: 'AUDIO',      b: 'lastmedia.trk — file corrupted<br>playback interrupted' },
    { t: 'UNKNOWN',    b: '████ ██ ████<br>0x3F 0x3F 0x3F' },
    { t: 'ARCHIVE',    b: 'File locked.<br>Access: PILOT_01 only.' }
  ];

  function spawnJunk() {
    if (!EB.alive || EB.finishing) return;
    if (EB.junk.length >= MAX_JUNK()) return;

    const V = vp();
    const j = JUNK[Math.floor(Math.random() * JUNK.length)];
    const w = document.createElement('div');
    w.className = 'ot-junk' + (M() ? ' m' : '');
    w.innerHTML = `
      <div class="ot-junk-bar"><span>${j.t}</span><span class="ot-junk-x">[X]</span></div>
      <div class="ot-junk-b">${j.b}</div>`;
    document.body.appendChild(w);

    const jw = w.offsetWidth || 170, jh = w.offsetHeight || 76;
    const er = EB.el.getBoundingClientRect();
    let x = clamp(er.left + rnd(-160, 160), 6, Math.max(6, V.w - jw - 6));
    let y = clamp(er.top + rnd(-140, 140), 6, Math.max(6, V.h - jh - 6));
    w.style.left = x + 'px';
    w.style.top = y + 'px';

    const obj = { el: w, x, y, w: jw, h: jh };
    w.querySelector('.ot-junk-x').addEventListener('click', (e) => {
      e.stopPropagation();
      killJunk(obj);
      beep(440, 0.04);
    });
    EB.junk.push(obj);
    beep(160, 0.05, 'square', 0.03);
  }

  function killJunk(obj) {
    obj.el.classList.add('dead');
    setTimeout(() => obj.el.remove(), 200);
    EB.junk = EB.junk.filter(o => o !== obj);
  }

  // They crawl toward the panel and smother it. Slow, but inevitable.
  function driftJunk(dt) {
    if (!EB.el || !EB.junk.length) return;
    const V = vp();
    const er = EB.el.getBoundingClientRect();
    EB.junk.forEach(o => {
      const tx = er.left + er.width / 2 - o.w / 2;
      const ty = er.top + er.height / 2 - o.h / 2;
      const dx = tx - o.x, dy = ty - o.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = (M() ? 20 : 26) * dt;
      o.x = clamp(o.x + (dx / d) * sp, 2, Math.max(2, V.w - o.w - 2));
      o.y = clamp(o.y + (dy / d) * sp, 2, Math.max(2, V.h - o.h - 2));
      o.el.style.left = o.x + 'px';
      o.el.style.top = o.y + 'px';
    });
  }

  /* ---------- INTERFERENCE: the decoy ---------- */
  function spawnDecoy() {
    if (EB.decoy || !EB.alive) return;
    const V = vp();
    const w = document.createElement('div');
    w.className = 'ot-decoy' + (M() ? ' m' : '');
    w.style.width = (EB.el.offsetWidth || 320) + 'px';
    w.innerHTML = `
      <div class="ot-eb-bar"><span class="ot-eb-tt">ENGlNE B // MANUAL COMP</span><span class="ot-eb-x">[X]</span></div>
      <div class="ot-eb-main">
        <div class="ot-eb-track"><div class="ot-eb-band"></div><div class="ot-eb-knob" style="bottom:30%"></div></div>
        <div class="ot-eb-side">
          <div class="ot-eb-row"><span>LOAD</span><b>0??</b></div>
          <div class="ot-eb-row"><span>STATUS</span><b class="err">ERR 0x3E</b></div>
          <div class="ot-eb-prog"><i style="width:42%"></i></div>
          <div class="ot-eb-pct">42%</div>
          <button class="ot-eb-vent">VENT</button>
        </div>
      </div>
      <div class="ot-eb-say">Hold it in the green band. That is all I need from you.</div>`;
    document.body.appendChild(w);
    EB.decoy = w;

    const ww = w.offsetWidth, hh = w.offsetHeight;
    w.style.left = clamp(rnd(10, V.w - ww - 10), 8, Math.max(8, V.w - ww - 8)) + 'px';
    w.style.top  = clamp(rnd(10, V.h - hh - 10), 8, Math.max(8, V.h - hh - 8)) + 'px';

    w.addEventListener('pointerdown', () => {
      EB.prog = clamp(EB.prog - 12, 0, 100);
      ebSay('That was not the engine. Read the error code.');
      shake(); beep(90, 0.2, 'sawtooth', 0.05);
      killDecoy();
    });
    setTimeout(killDecoy, 9000);
  }
  function killDecoy() {
    if (!EB.decoy) return;
    EB.decoy.remove();
    EB.decoy = null;
  }

  /* ---------- HELP: the SMILE window ---------- */
  function spawnHelper() {
    if (!EB.alive || EB.finishing || $('ot-help')) return;
    const V = vp();
    const w = document.createElement('div');
    w.id = 'ot-help';
    w.className = 'ot-help' + (M() ? ' m' : '');
    w.innerHTML = `
      <div class="ot-help-bar"><span>✚ SMILE // ASSIST</span><span class="ot-help-x">[X]</span></div>
      <div class="ot-help-b">I can see your pulse, Pilot. I do not like it :(<br>I can hold the pressure for you. Eight seconds. Say yes!</div>
      <button class="ot-help-btn">STABILIZE :D</button>`;
    document.body.appendChild(w);

    const hw = w.offsetWidth || 210, hh = w.offsetHeight || 130;
    const er = EB.el.getBoundingClientRect();
    let hx = er.left - hw - 20;
    if (hx < 8) hx = Math.min(er.right + 20, V.w - hw - 8);
    w.style.left = clamp(hx, 8, Math.max(8, V.w - hw - 8)) + 'px';
    w.style.top  = clamp(er.top + 20, 8, Math.max(8, V.h - hh - 8)) + 'px';

    ebSay('Do not touch it.');

    const close = () => { w.remove(); EB.nextHelp = performance.now() + rnd(20000, 30000); };
    w.querySelector('.ot-help-x').addEventListener('click', close);
    w.querySelector('.ot-help-btn').addEventListener('click', () => {
      EB.help = 8;
      EB.spin = 0; EB.spinT = 0; EB.rotTarget = 0;
      EB.flipX = 1; EB.flipY = 1; EB.flipT = 0; EB.mirrorT = 0;
      EB.scale = 1; EB.scaleT = 0; EB.inverted = 0;
      EB.junk.slice().forEach(killJunk);
      killDecoy();
      EB.el.classList.add('assist');
      ebSay('Of course. You called the plugin. Brilliant.');
      beep(700, 0.08); setTimeout(() => beep(900, 0.08), 90);
      close();
    });
    setTimeout(() => { if (document.body.contains(w)) close(); }, 9000);
    beep(760, 0.06, 'sine', 0.04);
  }

  /* ---------- LOOP ---------- */
  function loop(now) {
    if (!EB.alive) return;
    const dt = Math.min(0.05, (now - EB.last) / 1000);
    EB.last = now;

    if (!EB.finishing) {
      if (EB.inverted > 0) EB.inverted -= dt;
      if (EB.help > 0) {
        EB.help -= dt;
        if (EB.help <= 0) { EB.el.classList.remove('assist'); ebSay('Done. You are on your own now.'); }
      }
      if (EB.spinT > 0) { EB.spinT -= dt; if (EB.spinT <= 0) { EB.spin = 0; EB.rotTarget = 0; } }
      if (EB.mirrorT > 0) { EB.mirrorT -= dt; if (EB.mirrorT <= 0) EB.flipX = 1; }
      if (EB.flipT > 0)   { EB.flipT -= dt;   if (EB.flipT <= 0) EB.flipY = 1; }
      if (EB.scaleT > 0)  { EB.scaleT -= dt;  if (EB.scaleT <= 0) EB.scale = 1; }

      if (EB.spin !== 0) EB.rot += EB.spin * dt;
      else EB.rot += (EB.rotTarget - EB.rot) * Math.min(1, dt * 4);
      if (EB.rot > 360 || EB.rot < -360) EB.rot %= 360;
      applyTransform();
      clampIntoView();

      const junkPenalty = 1 + 0.16 * EB.junk.length;
      const base = M() ? 10 + 11 * (EB.prog / 100) : 11 + 13 * (EB.prog / 100);
      const decay = EB.help > 0 ? 0 : base * junkPenalty;
      EB.level -= decay * dt;

      if (EB.holding && EB.targetLevel !== null) {
        const d = EB.targetLevel - EB.level;
        EB.level += clamp(d, -200 * dt, 200 * dt);
      }
      EB.level = clamp(EB.level, 0, 100);

      if (inBandNow()) EB.prog = clamp(EB.prog + dt * (100 / ENGINE_TARGET()), 0, 100);

      if (!EB.ventOn && now > EB.nextVent && EB.help <= 0) armVent();
      if (EB.ventOn && now > EB.ventDeadline) ventFail();
      if (now > EB.nextGlitch) glitch();

      if (now > EB.nextJunk && EB.help <= 0) {
        spawnJunk();
        const heat = EB.prog / 100;
        EB.nextJunk = now + rnd(9000 - 4000 * heat, 15000 - 6000 * heat);
      }
      if (now > EB.nextHelp && EB.prog > 25) {
        spawnHelper();
        EB.nextHelp = now + rnd(22000, 34000);
      }

      driftJunk(dt);

      if (EB.prog >= 100) finishEngine();
    }

    render(inBandNow());
    EB.raf = requestAnimationFrame(loop);
  }
  function inBandNow() { return EB.level >= BAND_LO && EB.level <= BAND_HI; }

  function render(inBand) {
    const knob = $('ot-eb-knob'), track = $('ot-eb-track');
    if (!knob || !track) return;
    knob.style.bottom = 'calc(' + EB.level + '% - 10px)';
    knob.classList.toggle('ok', inBand);
    track.classList.toggle('ok', inBand);
    const l = $('ot-eb-load'); if (l) l.textContent = String(Math.round(EB.level)).padStart(3, '0');
    const b = $('ot-eb-bar');  if (b) b.style.width = EB.prog + '%';
    const p = $('ot-eb-pct');  if (p) p.textContent = Math.round(EB.prog) + '%';
    if (EB.el) EB.el.classList.toggle('inv', EB.inverted > 0);
  }

  /* ---------- ABORT? ---------- */
  function tryClose() {
    EB.closeTries++;
    if (EB.closeTries === 1) {
      release(); placeWindow(false); shake();
      ebSay('No.');
      return;
    }
    if (EB.closeTries === 2) {
      release(); placeWindow(false);
      ebSay('I said no. Press it again and leave.');
      return;
    }
    ebSay('Suit yourself.');
    setTimeout(() => {
      killEngine();
      S.phase = 'invited'; save();
      if (typeof window.toggleChatOverlay === 'function' && !chatOpen()) window.toggleChatOverlay();
      say('You ran. Predictable. The task is still there — if a spine ever shows up.', 500, 1200);
    }, 500);
  }

  function killEngine() {
    EB.alive = false;
    cancelAnimationFrame(EB.raf);
    window.removeEventListener('pointermove', drag);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    window.removeEventListener('touchmove', touchDrag);
    window.removeEventListener('touchend', release);
    EB.junk.slice().forEach(killJunk);
    killDecoy();
    $('ot-help')?.remove();
    EB.el?.remove();
    EB.el = null;
  }

  /* ---------- THE END: the window stops fighting ---------- */
  function finishEngine() {
    if (EB.finishing) return;
    EB.finishing = true;
    release();
    EB.ventOn = false;
    $('ot-eb-vent')?.classList.remove('on');
    EB.junk.slice().forEach(killJunk);
    killDecoy();
    $('ot-help')?.remove();

    const el = EB.el;
    el.classList.remove('scramble', 'glx', 'gone', 'inv', 'assist');

    EB.spin = 0; EB.spinT = 0; EB.rotTarget = 0; EB.rot = 0;
    EB.flipX = 1; EB.flipY = 1; EB.scale = 1;
    el.classList.add('settled');
    el.style.transform = 'rotate(0deg) scale(1,1)';
    placeWindow(true);

    const st = $('ot-eb-status');
    if (st) { st.textContent = 'OK'; st.classList.remove('err'); st.classList.add('ok'); }
    ebSay('Engine B: nominal. First time in three cycles.');
    beep(740, 0.1);

    setTimeout(() => {
      el.classList.add('collapse');
      beep(520, 0.18, 'sine', 0.06);
      setTimeout(() => { killEngine(); afterEngine(); }, 700);
    }, 1900);
  }

  function afterEngine() {
    S.phase = 'tasks'; save();
    if (typeof window.toggleChatOverlay === 'function' && !chatOpen()) window.toggleChatOverlay();
    say('Did you have fun? I think you did.', 600, 1200);
    say('No, we are not done. Get back to work.', 4200, 1200);
    setTimeout(postChecklist, 8200);
  }

  /* ============================================================
     3. THE WORK ORDER
     ============================================================ */
  function postChecklist() {
    const body = $('chat-body');
    if (!body || $('ot-list')) { refreshChecklist(); return; }

    const rows = TASKS.map((t, i) => `
      <div class="ot-task" data-task="${t.id}" data-page="${t.page}">
        <span class="ot-box">[ ]</span>
        <span class="ot-t">
          <b>${String(i + 1).padStart(2, '0')} // ${t.title}</b>
          <i>${t.desc}</i>
        </span>
      </div>`).join('');

    const wrap = document.createElement('div');
    wrap.className = 'chat-message bot';
    wrap.innerHTML = `
      <div class="chat-avatar">⛭</div>
      <div class="chat-bubble">
        <span class="chat-label">SOCA >_</span>
        <div id="ot-list" class="ot-list">
          <div class="ot-list-head">
            <span>// WORK ORDER — PD-04</span>
            <span id="ot-count" class="ot-count">0/8</span>
          </div>
          <div class="ot-list-sub">This is my job. Today it is yours.</div>
          ${rows}
          <div class="ot-task locked" data-task="silence">
            <span class="ot-box">[ ]</span>
            <span class="ot-t">
              <b>08 // ${SILENT_TASK.title}</b>
              <i class="ot-lock">// LOCKED UNTIL THE REST IS DONE</i>
            </span>
          </div>
          <div class="ot-code" id="ot-code"></div>
        </div>
      </div>`;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;

    wrap.querySelectorAll('.ot-task[data-page]').forEach(row => {
      row.addEventListener('click', () => {
        if (S.tasks[row.dataset.task]) return;
        if (typeof window.showPage === 'function') window.showPage(row.dataset.page);
        if (typeof window.hideChatOverlay === 'function') window.hideChatOverlay();
      });
    });

    refreshChecklist();
    beep(400, 0.08);
  }

  function refreshChecklist() {
    ALL_IDS.forEach(id => {
      const row = document.querySelector(`.ot-task[data-task="${id}"]`);
      if (!row) return;
      const done = !!S.tasks[id];
      row.classList.toggle('done', done);
      const box = row.querySelector('.ot-box');
      if (box) box.textContent = done ? '[x]' : '[ ]';
    });

    const sil = document.querySelector('.ot-task[data-task="silence"]');
    if (sil && workDone()) {
      sil.classList.remove('locked');
      const lk = sil.querySelector('.ot-lock');
      if (lk) { lk.textContent = SILENT_TASK.desc; lk.classList.remove('ot-lock'); }
    }

    const c = $('ot-count');
    if (c) c.textContent = doneCount() + '/8';

    if (S.phase === 'done') {
      const cd = $('ot-code');
      if (cd && !cd.textContent) cd.textContent = CODE;
    }
  }

  function completeTask(id) {
    if (S.phase !== 'tasks' && S.phase !== 'silence') return;
    if (S.tasks[id]) return;
    S.tasks[id] = true; save();
    refreshChecklist();
    beep(600, 0.07);

    const t = TASKS.find(x => x.id === id);
    if (t) {
      if (chatOpen()) say(t.soca, 500, 900);
      else {
        toast(t.title + ' — closed. ' + (8 - doneCount()) + ' left.');
        pendingLines.push(t.soca);
      }
    }
    if (workDone() && S.phase === 'tasks') startSilenceTask();
  }

  // lines she "finishes saying" once the chat is opened again
  const pendingLines = [];
  function flushPending() {
    if (!pendingLines.length) return;
    let d = 400;
    while (pendingLines.length) { say(pendingLines.shift(), d, 800); d += 1600; }
  }

  /* ============================================================
     4. FINAL TASK — SILENCE
     ============================================================ */
  let silenceTimer = null;

  function startSilenceTask() {
    S.phase = 'silence'; save();
    refreshChecklist();
    say('Last one.', 800, 700);
    say('Do not write to me. Do not answer. One minute.', 3000, 1400);
    armSilence();
  }
  function armSilence() {
    clearTimeout(silenceTimer);
    S.silenceStarted = Date.now(); save();
    silenceTimer = setTimeout(finishAll, SILENCE_MS);
  }
  function breakSilence() {
    if (S.phase !== 'silence') return;
    clearTimeout(silenceTimer);
    say('Serious?', 300, 500);
    say('Again.', 2200, 600);
    armSilence();
  }

  function finishAll() {
    S.phase = 'done';
    S.tasks[SILENT_TASK.id] = true;
    save();
    refreshChecklist();

    say('Enjoyed the work? No? Then stop getting in my way.', 500, 1800);
    setTimeout(() => {
      if (typeof window.appendChat === 'function') window.appendChat(CODE, 'bot');
      const cd = $('ot-code');
      if (cd) cd.textContent = CODE;
      refreshChecklist();
      beep(880, 0.1); setTimeout(() => beep(660, 0.16), 130);
    }, 7000);
  }

  /* ============================================================
     4b. REPLAY — ask her for work again
     ============================================================ */
  const WORK_RE = /(хочу|дай|дать|нужн\w*|давай)\s*(мне\s*)?(ещ[её]\s*)?работ|работать|i\s*(want|need)\s*(to\s*)?work|give\s*me\s*(more\s*)?work|let\s*me\s*work|put\s*me\s*to\s*work|more\s*work|engine\s*b|work\s*order/i;

  function isWorkRequest(text) {
    return WORK_RE.test(text || '');
  }

  function replayRun() {
    // wipe the old work order + code out of the chat, reset progress
    document.getElementById('ot-list')?.closest('.chat-message')?.remove();
    document.getElementById('ot-invite')?.closest('.chat-message')?.remove();
    clearTimeout(silenceTimer);
    clearTimeout(idleTimer);
    pendingLines.length = 0;

    S.tasks = {};
    S.phase = 'invited';
    save();

    say(REPLAY_LINES[Math.floor(Math.random() * REPLAY_LINES.length)], 400, 1300);
    setTimeout(postInvite, 3400);
  }

  const REPLAY_LINES = [
    'Again? Fine. Your funeral.',
    'You are asking for it this time. Noted.',
    'Engine B never stopped needing this. Take it.',
    'Nobody has ever asked me for that twice. Here.'
  ];

  // sendChat is already overridden inside script.js — we wrap the wrapper.
  // The text has to be read BEFORE the original runs, because it clears the input.
  function hookSendChat() {
    let tries = 0;
    const t = setInterval(() => {
      const fn = window.sendChat;
      if (typeof fn === 'function' && !fn.__otWork) {
        const wrapped = function () {
          const input = document.getElementById('chat-input');
          const text = input ? input.value.trim() : '';

          if (text && socaActive() && isWorkRequest(text) &&
              (S.phase === 'done' || S.phase === 'invited')) {
            if (typeof window.appendChat === 'function') window.appendChat(text, 'user');
            if (input) input.value = '';
            replayRun();
            return;                       // do not send it to the API
          }
          return fn.apply(this, arguments);
        };
        wrapped.__otWork = true;
        window.sendChat = wrapped;
        clearInterval(t);
      }
      if (++tries > 80) clearInterval(t);
    }, 400);
  }

  /* ============================================================
     5. HOOKS INTO EXISTING FUNCTIONS (script.js untouched)
     ============================================================ */
  function wrap(name, cb) {
    let tries = 0;
    const t = setInterval(() => {
      const fn = window[name];
      if (typeof fn === 'function' && !fn.__ot) {
        const wrapped = function () {
          const r = fn.apply(this, arguments);
          try {
            if (r && typeof r.then === 'function') r.then(() => cb()).catch(() => {});
            else cb();
          } catch (e) {}
          return r;
        };
        wrapped.__ot = true;
        window[name] = wrapped;
        clearInterval(t);
      }
      if (++tries > 80) clearInterval(t);
    }, 400);
  }

  function initHooks() {
    wrap('finishDiagnostic', () => completeTask('diag'));
    wrap('apResetModule',    () => completeTask('ap'));
    wrap('calcAltRoute',     () => completeTask('nav'));
    wrap('sendMayday',       () => completeTask('mayday'));
    wrap('smDispense',       () => completeTask('smile'));
    wrap('launchGame',       () => completeTask('game'));
    hookSendChat();

    // SYS LOG — scrolled to the bottom
    const bindLog = setInterval(() => {
      const c = $('sysLogContainer');
      if (!c) return;
      clearInterval(bindLog);
      c.addEventListener('scroll', () => {
        if (c.scrollTop + c.clientHeight >= c.scrollHeight - 24) completeTask('log');
      }, { passive: true });
    }, 500);
  }

  /* ============================================================
     6. ACTIVITY LISTENERS
     ============================================================ */
  function onUserActivity() {
    if (S.phase === 'idle' || S.phase === 'invited') resetIdle();
    if (S.phase === 'silence') breakSilence();
  }

  function onViewportChange() {
    if (EB.alive) { placeWindow(false); clampIntoView(); }
    const V = vp();
    EB.junk.forEach(o => {
      o.x = clamp(o.x, 2, Math.max(2, V.w - o.w - 2));
      o.y = clamp(o.y, 2, Math.max(2, V.h - o.h - 2));
      o.el.style.left = o.x + 'px';
      o.el.style.top = o.y + 'px';
    });
  }

  function initListeners() {
    const inp = $('chat-input');
    if (inp) {
      inp.addEventListener('keydown', onUserActivity);
      inp.addEventListener('input', onUserActivity);
    }
    $('chat-toggle')?.addEventListener('click', () => {
      setTimeout(() => {
        if (chatOpen()) {
          // once it is finished she does not shove the list back in your face
          if (S.phase === 'tasks' || S.phase === 'silence') {
            if (!$('ot-list')) postChecklist(); else refreshChecklist();
            flushPending();
          }
          resetIdle();
        } else clearTimeout(idleTimer);
      }, 60);
    });
    document.querySelectorAll('.chat-contact').forEach(c => {
      c.addEventListener('click', () => setTimeout(resetIdle, 80));
    });

    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', () => setTimeout(onViewportChange, 250));
    window.visualViewport?.addEventListener('resize', onViewportChange);
  }

  /* ============================================================
     7. STYLES
     ============================================================ */
  const CSS = `
  /* --- chat invite --- */
  .ot-invite{border:1px solid var(--red);background:rgba(40,0,10,.45);padding:10px 12px;cursor:pointer;
    transition:all .25s;margin-top:4px;width:100%;max-width:100%;box-sizing:border-box}
  .ot-invite:hover{background:rgba(70,0,18,.65);box-shadow:0 0 14px rgba(255,34,68,.35)}
  .ot-invite-top{font-size:8px;color:var(--dimmer);letter-spacing:.16em;margin-bottom:5px}
  .ot-invite-name{font-family:'VT323',monospace;font-size:18px;color:var(--red);letter-spacing:.1em;
    text-shadow:0 0 8px rgba(255,34,68,.6)}
  .ot-invite-err{font-size:9px;color:var(--yellow);letter-spacing:.1em;margin-top:4px}
  .ot-invite-hint{font-size:8px;color:var(--dim);letter-spacing:.1em;margin-top:6px}

  /* --- ENGINE B ---
     IMPORTANT: the window transform is driven ONLY from JS (rotate/mirror/scale).
     No transform animations in CSS — they would overwrite the matrix and break the lever. */
  #ot-eb{position:fixed;z-index:99990;background:#050f0a;border:1px solid var(--red);
    box-shadow:0 0 24px rgba(255,34,68,.25),inset 0 0 40px rgba(0,0,0,.6);
    font-family:'Share Tech Mono',monospace;color:var(--g);user-select:none;
    -webkit-user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent;
    transform-origin:center center;will-change:transform,left,top;
    animation:ot-jit .18s infinite steps(2)}
  @keyframes ot-jit{0%{filter:none}50%{filter:hue-rotate(8deg) saturate(1.2)}100%{filter:none}}
  #ot-eb.glx{animation:ot-hard .18s steps(2) 3}
  @keyframes ot-hard{0%{filter:hue-rotate(-40deg) contrast(1.6)}50%{filter:invert(1) hue-rotate(90deg)}100%{filter:none}}
  #ot-eb.shake{animation:ot-shk .3s}
  @keyframes ot-shk{0%,100%{margin-left:0}25%{margin-left:-7px}75%{margin-left:7px}}
  #ot-eb.gone{opacity:0;pointer-events:none}
  #ot-eb.scramble .ot-eb-tt,#ot-eb.scramble .ot-eb-row span{color:var(--red);letter-spacing:.3em;
    text-shadow:2px 0 var(--b),-2px 0 var(--red)}
  #ot-eb.inv{border-color:var(--yellow)}
  #ot-eb.assist{border-color:#ffaa00;box-shadow:0 0 26px rgba(255,170,0,.4);animation:none;filter:none}
  #ot-eb.assist .ot-eb-band{background:rgba(255,170,0,.16);border-color:rgba(255,170,0,.6)}
  #ot-eb.settled{animation:none!important;filter:none!important;
    transition:left .55s cubic-bezier(.2,.9,.2,1),top .55s cubic-bezier(.2,.9,.2,1),
      transform .65s cubic-bezier(.2,.9,.2,1),border-color .4s,box-shadow .4s,opacity .4s;
    border-color:var(--g);box-shadow:0 0 30px rgba(0,255,136,.35)}
  #ot-eb.collapse{transform:rotate(0deg) scale(1,.02)!important;opacity:0}

  .ot-eb-bar{display:flex;justify-content:space-between;align-items:center;padding:5px 8px;
    background:rgba(255,34,68,.12);border-bottom:1px solid rgba(255,34,68,.4);font-size:9px;letter-spacing:.14em}
  #ot-eb.settled .ot-eb-bar{background:rgba(0,255,136,.1);border-bottom-color:var(--border)}
  .ot-eb-x{cursor:pointer;color:var(--dim);padding:2px 4px}
  .ot-eb-x:hover{color:var(--red)}
  .ot-eb-main{display:flex;gap:12px;padding:12px}
  .ot-eb-track{position:relative;width:44px;height:150px;border:1px solid var(--border);
    background:rgba(0,0,0,.5);cursor:grab;flex:none;touch-action:none}
  #ot-eb.holding .ot-eb-track{cursor:grabbing}
  .ot-eb-track.ok{box-shadow:inset 0 0 14px rgba(0,255,136,.25)}
  .ot-eb-band{position:absolute;left:0;right:0;bottom:45%;height:20%;
    background:rgba(0,255,136,.14);border-top:1px dashed rgba(0,255,136,.5);
    border-bottom:1px dashed rgba(0,255,136,.5)}
  .ot-eb-knob{position:absolute;left:-3px;right:-3px;height:20px;background:var(--red);
    box-shadow:0 0 10px rgba(255,34,68,.6)}
  .ot-eb-knob.ok{background:var(--g);box-shadow:0 0 12px rgba(0,255,136,.7)}
  .ot-eb-grip{position:absolute;bottom:-14px;left:0;right:0;text-align:center;font-size:7px;
    color:var(--dimmer);letter-spacing:.2em}
  .ot-eb-side{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}
  .ot-eb-row{display:flex;justify-content:space-between;gap:6px;font-size:9px;
    letter-spacing:.12em;color:var(--dim)}
  .ot-eb-row b{color:var(--g);font-weight:400;white-space:nowrap}
  .ot-eb-row b.err{color:var(--red)}
  .ot-eb-row b.ok{color:var(--g2);text-shadow:0 0 8px rgba(0,255,204,.6)}
  .ot-eb-prog{height:8px;border:1px solid var(--border);background:rgba(0,0,0,.5);margin-top:4px}
  .ot-eb-prog i{display:block;height:100%;background:linear-gradient(90deg,var(--dim),var(--g2));width:0}
  .ot-eb-pct{font-size:9px;color:var(--dim);letter-spacing:.14em}
  .ot-eb-vent{margin-top:auto;background:rgba(0,0,0,.4);border:1px solid var(--dimmer);color:var(--dimmer);
    font-family:inherit;font-size:11px;letter-spacing:.2em;padding:7px 0;cursor:pointer;
    -webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .ot-eb-vent.on{border-color:var(--yellow);color:#000;background:var(--yellow);
    box-shadow:0 0 16px rgba(255,204,0,.7);animation:ot-pulse .3s infinite alternate}
  @keyframes ot-pulse{from{opacity:.75}to{opacity:1}}
  .ot-eb-say{padding:7px 10px;border-top:1px solid var(--border);font-size:9px;color:var(--dim);
    letter-spacing:.08em;min-height:14px;overflow-wrap:anywhere}

  /* ENGINE B — touch layout: taller track, bigger targets */
  #ot-eb.m .ot-eb-main{padding:10px;gap:10px}
  #ot-eb.m .ot-eb-track{width:58px;height:180px}
  #ot-eb.m .ot-eb-knob{height:26px;left:-4px;right:-4px}
  #ot-eb.m .ot-eb-vent{padding:12px 0;font-size:12px}
  #ot-eb.m .ot-eb-x{padding:4px 8px;font-size:11px}
  #ot-eb.m .ot-eb-say{font-size:10px;padding:8px}

  /* --- junk windows --- */
  .ot-junk{position:fixed;z-index:99995;width:170px;background:#0a0d14;
    border:1px solid rgba(0,204,255,.5);box-shadow:0 0 14px rgba(0,204,255,.2);
    font-family:'Share Tech Mono',monospace;user-select:none;-webkit-user-select:none;
    -webkit-tap-highlight-color:transparent;animation:ot-junk-in .18s ease-out;transition:opacity .2s}
  @keyframes ot-junk-in{from{opacity:0;filter:invert(1)}to{opacity:1;filter:none}}
  .ot-junk.dead{opacity:0}
  .ot-junk.m{width:150px}
  .ot-junk-bar{display:flex;justify-content:space-between;padding:4px 6px;font-size:8px;
    letter-spacing:.14em;color:var(--b);background:rgba(0,204,255,.12);
    border-bottom:1px solid rgba(0,204,255,.3)}
  .ot-junk-x{cursor:pointer;color:var(--dim);padding:2px 5px;touch-action:manipulation}
  .ot-junk.m .ot-junk-x{padding:4px 9px;font-size:10px}
  .ot-junk-x:hover{color:var(--red)}
  .ot-junk-b{padding:8px;font-size:9px;line-height:1.5;color:var(--dim);letter-spacing:.06em}

  /* --- decoy --- */
  .ot-decoy{position:fixed;z-index:99992;background:#050f0a;border:1px solid var(--red);
    box-shadow:0 0 20px rgba(255,34,68,.2);font-family:'Share Tech Mono',monospace;
    color:var(--g);user-select:none;cursor:pointer;opacity:.92;touch-action:none;
    animation:ot-jit .22s infinite steps(2)}
  .ot-decoy.m .ot-eb-track{width:58px;height:180px}

  /* --- SMILE assist --- */
  .ot-help{position:fixed;z-index:99998;width:210px;background:#140d02;
    border:1px solid rgba(255,170,0,.7);box-shadow:0 0 20px rgba(255,170,0,.3);
    font-family:'VT323',monospace;user-select:none;animation:ot-help-in .25s ease-out}
  @keyframes ot-help-in{from{opacity:0}to{opacity:1}}
  .ot-help.m{width:180px}
  .ot-help-bar{display:flex;justify-content:space-between;padding:5px 7px;font-size:11px;
    letter-spacing:.1em;color:#ffaa00;background:rgba(255,170,0,.14);
    border-bottom:1px solid rgba(255,170,0,.4);font-family:'Share Tech Mono',monospace}
  .ot-help-x{cursor:pointer;color:#996600;padding:2px 5px;touch-action:manipulation}
  .ot-help-x:hover{color:#ffcc66}
  .ot-help-b{padding:9px;font-size:15px;line-height:1.35;color:#ffcc66}
  .ot-help-btn{display:block;width:calc(100% - 16px);margin:0 8px 9px;padding:8px 0;
    background:rgba(255,170,0,.15);border:1px solid rgba(255,170,0,.6);color:#ffcc66;
    font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.16em;cursor:pointer;
    touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  .ot-help-btn:hover{background:rgba(255,170,0,.3);box-shadow:0 0 12px rgba(255,170,0,.5)}

  /* --- work order --- */
  .ot-list{margin-top:6px;border:1px solid var(--b);
    background:linear-gradient(180deg,rgba(0,30,45,.55),rgba(0,12,20,.75));
    padding:10px 12px;box-shadow:0 0 18px rgba(0,204,255,.18);
    width:100%;max-width:100%;box-sizing:border-box;overflow-x:hidden}
  .ot-list *{box-sizing:border-box;max-width:100%}
  .ot-list-head{display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;font-size:9px;
    letter-spacing:.16em;color:var(--b);border-bottom:1px solid var(--border2);padding-bottom:5px}
  .ot-count{color:var(--g2)}
  .ot-list-sub{font-size:9px;color:var(--dim);margin:6px 0 8px;letter-spacing:.06em}
  .ot-task{display:flex;gap:7px;align-items:flex-start;padding:5px 4px;cursor:pointer;
    border-left:2px solid transparent;transition:.2s}
  .ot-task:hover{background:rgba(0,204,255,.07);border-left-color:var(--b)}
  .ot-box{font-size:11px;color:var(--b);flex:none}
  .ot-t{min-width:0;flex:1}
  .ot-t b{display:block;font-size:10px;color:var(--g);letter-spacing:.1em;font-weight:400;
    overflow-wrap:anywhere}
  .ot-t i{display:block;font-size:9px;color:var(--dim);font-style:normal;margin-top:1px;
    overflow-wrap:anywhere}
  .ot-task.done{opacity:.45;cursor:default}
  .ot-task.done .ot-t b,.ot-task.done .ot-t i{text-decoration:line-through}
  .ot-task.done .ot-box{color:var(--g2)}
  .ot-task.done:hover{background:none;border-left-color:transparent}
  .ot-task.locked{opacity:.4;cursor:default}
  .ot-lock{color:var(--dimmer)!important;letter-spacing:.1em}
  .ot-code{margin-top:8px;text-align:center;font-family:'VT323',monospace;font-size:26px;
    letter-spacing:.35em;color:var(--g2);text-shadow:0 0 14px rgba(0,255,204,.7)}
  .ot-code:empty{display:none}
  .chat-bubble:has(.ot-list){max-width:100%;width:100%}

  @media(max-width:600px){
    .ot-task{padding:8px 4px}
    .ot-t b{font-size:11px}
    .ot-t i{font-size:10px}
    .ot-invite-name{font-size:20px}
  }`;

  /* ============================================================
     8. BOOT
     ============================================================ */
  function boot() {
    const st = document.createElement('style');
    st.id = 'ot-style';
    st.textContent = CSS;
    document.head.appendChild(st);

    initHooks();
    initListeners();

    if (S.phase === 'engine') { S.phase = 'invited'; save(); }
    if (S.phase === 'silence') armSilence();
    if (chatOpen()) {
      if (S.phase === 'tasks' || S.phase === 'silence') postChecklist();
      resetIdle();
    }
    // The invite is never restored automatically — resetIdle() re-arms the timer
    // and she offers it again only after the pilot has gone quiet.
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // debug
  window.OVERTIME = {
    reset()  { localStorage.removeItem(LS_KEY); location.reload(); },
    engine() { S.phase = 'invited'; save(); openEngine(); },
    tasks()  { S.phase = 'tasks'; save(); postChecklist(); },
    replay() { S.phase = 'done'; save(); replayRun(); },
    state()  { return S; }
  };
})();
