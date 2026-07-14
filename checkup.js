(function () {
  'use strict';

  const LS = 'pd04_checkup_v1';

  /* ============================================================
     TEST MODE
     true  - появится сразу при заходе на сайт
     false - будет появляться как надо
     ============================================================ */
  const TEST_MODE = false;

  const COOLDOWN_MS = TEST_MODE ? 0 : 3 * 24 * 60 * 60 * 1000;
  const FIRST_DELAY = TEST_MODE ? 1500 : 90000 + Math.random() * 60000;
  // Шанс, что он вообще заговорит об осмотре в этот заход
  const INVITE_CHANCE = TEST_MODE ? 1 : 0.35;

  const D = { refusals: 0, done: false, gaveUp: false, lastDone: 0, times: 0 };
  let S = load();
  if (TEST_MODE) S = Object.assign({}, D);

  function load() {
    try { return Object.assign({}, D, JSON.parse(localStorage.getItem(LS) || '{}')); }
    catch (e) { return Object.assign({}, D); }
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }

  /* ---------- device ---------- */
  function vp() {
    const v = window.visualViewport;
    return {
      w: Math.round((v && v.width) || document.documentElement.clientWidth || window.innerWidth),
      h: Math.round((v && v.height) || document.documentElement.clientHeight || window.innerHeight)
    };
  }
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const M = () => isTouch() || vp().w < 900;

  const $ = id => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shuffle = a => a.slice().sort(() => Math.random() - 0.5);
  const hex4 = n => n.toString(16).toUpperCase().padStart(4, '0');

  function beep(f = 660, d = 0.1, type = 'square', g = 0.05) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = beep._c || (beep._c = new AC());
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = type; o.frequency.value = f;
      gn.gain.setValueAtTime(g, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
      o.connect(gn); gn.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + d);
    } catch (e) {}
  }

  const socaToast = (m, t) => { if (typeof window.showSocaToast === 'function') window.showSocaToast(m, t || 'info'); };
  const smileToast = (m, t) => { if (typeof window.showSmailyToast === 'function') window.showSmailyToast(m, t || 'info'); };


  function socaCut(text, hold) {
    const el = document.createElement('div');
    el.className = 'ck-soca';
    el.innerHTML = `
      <div class="ck-soca-h">⛭ SOCA // OVERRIDE</div>
      <div class="ck-soca-b">${text}</div>`;
    document.body.appendChild(el);

    const w = el.offsetWidth || 340, h = el.offsetHeight || 90;
    const V = vp();
    el.style.left = clamp(rnd(12, V.w - w - 12), 8, Math.max(8, V.w - w - 8)) + 'px';
    el.style.top = clamp(rnd(12, V.h - h - 12), 8, Math.max(8, V.h - h - 8)) + 'px';

    beep(140, 0.05, 'square', 0.05);
    setTimeout(() => beep(90, 0.09, 'square', 0.04), 70);

    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, hold || 4200);
  }

  /* ============================================================
     1. INVITATION
     ============================================================ */
  const ASKS_AGAIN = [
    'Follow-up examination! Your last file is stale :D',
    'Data decays, Pilot, so do people! Four minutes!!',
    'You liked it last time. I have decided that you did!',
    'Last ask, again. I know how this looks(('
  ];
  const askPool = () => (S.times > 0 ? ASKS_AGAIN : ASKS);

  const ASKS = [
    'Mandatory checkup! It takes four minutes :)',
    'I understand, but it is mandatory. That is what mandatory means!',
    'SOCA says I should stop asking. SOCA is not a doctor!!!',
    'Okay, last time. I promise... I am not good at promises.'
  ];

  function invite() {
    if (S.done || S.gaveUp || $('ck-invite')) return;
    if (window.smailyFrequency === 'off') return;

    const box = document.createElement('div');
    box.id = 'ck-invite';
    box.className = 'ck-invite';
    box.innerHTML = `
      <div class="ck-inv-head">
        <span style="color:#ffaa00;font-size:16px">&#10010;</span>
        <span class="ck-inv-face">SMILE</span>
        <span>MANDATORY CHECKUP</span>
      </div>
      <div class="ck-inv-body">${askPool()[Math.min(S.refusals, askPool().length - 1)]}</div>
      <div class="ck-inv-btns">
        <button type="button" class="ck-btn ck-yes">YES</button>
        <button type="button" class="ck-btn ck-no">NO</button>
      </div>`;
    // ВАЖНО: mobile-adapt.js вешает transform на обёртку сайта, а внутри
    // трансформированного предка position:fixed перестаёт работать - элемент
    // считается от обёртки и уезжает под подвал. Поэтому селим попап в самый
    // корень документа, в отдельный контейнер, который никто не трансформирует
    let root = document.getElementById('ck-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'ck-root';
      document.documentElement.appendChild(root);
    }
    root.appendChild(box);

    // Размеры МОЖНО мерить только после вставки в документ
    // До неё offsetWidth/offsetHeight равны нулю, и попап всегда падал в угол
    const w = box.offsetWidth  || 280;
    const h = box.offsetHeight || 150;
    const W = window.innerWidth;
    const H = window.innerHeight;

    const maxX = Math.max(20, W - w - 20);
    const maxY = Math.max(20, H * 0.62 - h);   // верхние две трети: внизу чат и подвал

    box.style.left = Math.floor(rnd(20, maxX)) + 'px';
    box.style.top  = Math.floor(rnd(20, maxY)) + 'px';

    box.querySelector('.ck-yes').addEventListener('click', () => { box.remove(); openCheckup(); });
    box.querySelector('.ck-no').addEventListener('click', () => { box.remove(); refuse(); });

    beep(760, 0.06, 'sine', 0.04);
  }

  function refuse() {
    S.refusals++; save();
    if (S.refusals >= askPool().length) {
      S.lastDone = Date.now();
      S.gaveUp = true; save();
      setTimeout(() => smileToast('Fine. Your file stays incomplete, it is fine, i am fine.', 'info'), 1200);
      setTimeout(() => smileToast('COMPLIANCE: 0%', 'warn'), 600000);
      return;
    }
    setTimeout(invite, [45000, 35000, 25000][S.refusals - 1] || 30000);
  }

  /* ============================================================
     2. AGITATION ENGINE
     ============================================================ */
  const CK = {
    el: null, ag: 0, raf: 0, last: 0, t: 0,
    hr: 78, cort: 30, o2: 98, trem: 0,
    running: false, aborted: false,
    cleanups: [], shouts: [], results: {}, quietUntil: 0
  };

  const agLevel = () => CK.ag < 25 ? 'calm' : CK.ag < 50 ? 'up' : CK.ag < 75 ? 'worry' : 'panic';
  const agitate = n => { CK.ag = clamp(CK.ag + n, 0, 100); };
  const calmDown = n => { CK.ag = clamp(CK.ag - n, 0, 100); };
  const setAg = n => { CK.ag = clamp(n, 0, 100); };

  function say(text, opts) {
    opts = opts || {};
    const stack = $('ck-say');
    if (!stack) return;
    const lvl = opts.level || agLevel();

    if (lvl === 'panic' && !opts.inside) { shout(text); return; }

    const line = document.createElement('div');
    line.className = 'ck-line ' + lvl + (opts.soft ? ' soft' : '');
    line.textContent = (lvl === 'panic' || opts.caps) ? text.toUpperCase() : text;
    stack.appendChild(line);

    const keep = lvl === 'calm' ? 1 : lvl === 'up' ? 2 : 5;
    while (stack.children.length > keep) stack.removeChild(stack.firstChild);
    stack.scrollTop = stack.scrollHeight;

    if (lvl === 'worry' || lvl === 'panic') beep(rnd(500, 900), 0.03, 'square', 0.025);
  }

  function shout(text) {
    const s = document.createElement('div');
    s.className = 'ck-shout';
    s.textContent = text.toUpperCase();
    document.body.appendChild(s);
    const V = vp();
    const sw = M() ? 200 : 340;
    s.style.left = clamp(rnd(14, V.w - sw - 14), 8, Math.max(8, V.w - sw - 8)) + 'px';
    s.style.top = clamp(rnd(30, V.h - 110), 8, Math.max(8, V.h - 80)) + 'px';
    CK.shouts.push(s);
    beep(rnd(700, 1100), 0.05, 'sawtooth', 0.04);
    setTimeout(() => { s.classList.add('out'); setTimeout(() => s.remove(), 400); }, 1800);
    if (CK.shouts.length > 8) { const o = CK.shouts.shift(); if (o) o.remove(); }
  }

  const clearShouts = () => { CK.shouts.forEach(s => s.remove()); CK.shouts = []; };

  /* --- the pause. The strongest effect in the whole event. --- */
  async function apologize(line) {
    clearShouts();
    setAg(0);
    CK.el.classList.add('ck-silent');
    const st = $('ck-say');
    if (st) st.innerHTML = '';
    await wait(3000);
    CK.el.classList.remove('ck-silent');
    say(line || 'sorry. i got loud.', { level: 'calm', soft: true, inside: true });
    await wait(2200);
  }

  /* ============================================================
     3. WINDOW
     ============================================================ */

  function openCheckup() {
    if (CK.running) return;
    procN = 0;
    CK.arm = {};
    CK.flags = [];
    CK.running = true; CK.aborted = false;
    CK.ag = 0; CK.results = {}; CK.cleanups = [];
    CK.hr = 78; CK.cort = 30; CK.o2 = 98; CK.trem = 0; CK.t = 0;

    const el = document.createElement('div');
    el.id = 'ck-win';
    el.className = 'ck-win calm';
    el.innerHTML = `
      <!-- header: same grammar as his popup header -->
      <div class="ck-head">
        <span class="ck-cross">&#10010;</span>
        <span class="ck-logo">SMILE</span>
        <span class="ck-tagline">MANDATORY CHECKUP</span>
        <span class="ck-step" id="ck-step">00/00</span>
        <span class="ck-face" id="ck-face">:)</span>
        <button type="button" class="ck-xbtn" id="ck-x">[X]</button>
      </div>

      <div class="ck-body">
        <div class="ck-rail">
          <div class="ck-panel">
            <div class="ck-ph"><span class="ck-pht">SUBJECT</span><span class="ck-tag">INV-01</span></div>
            <div class="ck-pb">
              <div class="ck-drow"><span class="ck-dk">PILOT</span><span class="ck-dv">PILOT_01 // KOKO</span></div>
              <div class="ck-drow"><span class="ck-dk">SUIT</span><span class="ck-dv ok">SEALED</span></div>
              <div class="ck-drow"><span class="ck-dk">PORTS</span><span class="ck-dv ok">4/4</span></div>
              <div class="ck-drow"><span class="ck-dk">CONSENT</span><span class="ck-dv warn">IMPLIED</span></div>
            </div>
          </div>

          <div class="ck-panel grow">
            <div class="ck-ph"><span class="ck-pht">PROCEDURE LOG</span><span class="ck-tag" id="ck-proc-n">0 ENTRIES</span></div>
            <div class="ck-pb" id="ck-proc"></div>
          </div>
        </div>

        <div class="ck-center">
          <div class="ck-panel main">
            <div class="ck-ph"><span class="ck-pht" id="ck-ptitle">EXAMINATION</span><span class="ck-tag" id="ck-ptag">ACTIVE</span></div>
            <div class="ck-stage" id="ck-stage"></div>
          </div>
          <div class="ck-panel voice">
            <div class="ck-ph"><span class="ck-pht">SMILE // SPEAKING</span><span class="ck-tag" id="ck-vtag">calm</span></div>
            <div class="ck-say" id="ck-say"></div>
          </div>
        </div>

        <div class="ck-rail">
          <div class="ck-panel">
            <div class="ck-ph"><span class="ck-pht">ONLINE BIOMETRICS</span><span class="ck-tag">LIVE</span></div>
            <div class="ck-pb">
              <div class="ck-vbox"><div class="ck-vl">HEART RATE</div><div class="ck-vnum" id="ck-hr">078</div><div class="ck-vu">BPM</div></div>
              <div class="ck-vbox"><div class="ck-vl">CORTISOL</div><div class="ck-vnum sm" id="ck-cort">30</div><div class="ck-vu">INDEX</div></div>
              <div class="ck-drow"><span class="ck-dk">O2 SAT</span><span class="ck-dv" id="ck-o2">98%</span></div>
              <div class="ck-drow"><span class="ck-dk">TREMOR</span><span class="ck-dv" id="ck-trem">&mdash;</span></div>
              <canvas id="ck-ecg" width="200" height="56"></canvas>
            </div>
          </div>
          <div class="ck-panel grow">
            <div class="ck-ph"><span class="ck-pht">SMILE ADVISORY</span></div>
            <div class="ck-pb"><div class="ck-adv" id="ck-vnote">Monitoring continuously. You are doing fine :)</div></div>
          </div>
        </div>
      </div>

      <div class="ck-proto">&#10010; SMILE v2.1 &mdash; MANDATORY EXAMINATION PROTOCOL</div>
      <div class="ck-pulse"></div>`;

    document.body.appendChild(el);
    CK.el = el;

    $('ck-x').addEventListener('click', abort);

    CK.last = performance.now();
    CK.raf = requestAnimationFrame(tick);
    runSequence();
  }

  function abort() {
    if (!CK.running) return;
    CK.aborted = true;
    say('Wait-... we are not-.. okay, okay.', { level: 'worry', inside: true });
    setTimeout(closeCheckup, 900);
  }

  function closeCheckup() {
    CK.running = false;
    cancelAnimationFrame(CK.raf);
    CK.cleanups.forEach(f => { try { f(); } catch (e) {} });
    CK.cleanups = [];
    clearShouts();
    if (CK.el) CK.el.remove();
    CK.el = null;
  }

  /* --- the instruments react to HIM, not to you --- */
  const ecgBuf = new Array(200).fill(32);
  let ecgT = 0;

  function tick(now) {
    if (!CK.running) return;
    const dt = Math.min(0.05, (now - CK.last) / 1000);
    CK.last = now;
    CK.t += dt;

    const lvl = agLevel();
    const silent = CK.el.classList.contains('ck-silent');
    const flood = CK.el.classList.contains('ck-flood');
    const tilt = CK.el.classList.contains('ck-tilt');
    CK.el.className = 'ck-win ' + lvl + (silent ? ' ck-silent' : '') + (flood ? ' ck-flood' : '') + (tilt ? ' ck-tilt' : '');

    CK.hr += ((78 + CK.ag * 0.75) - CK.hr) * dt * 2;
    CK.cort += ((25 + CK.ag * 0.8) - CK.cort) * dt * 2;
    CK.o2 += ((98 - CK.ag * 0.06) - CK.o2) * dt * 2;

    const j = CK.ag > 60 ? rnd(-3, 3) : CK.ag > 35 ? rnd(-1, 1) : 0;
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };

    set('ck-hr', String(Math.round(CK.hr + j)).padStart(3, '0'));
    set('ck-cort', Math.round(CK.cort + j));
    set('ck-o2', Math.round(CK.o2) + '%');
    set('ck-trem', CK.trem > 12 ? 'SEVERE' : CK.trem > 5 ? 'PRESENT' : CK.trem > 0 ? 'minor' : '—');
    set('ck-face', CK.ag > 75 ? ':O' : CK.ag > 50 ? ':/' : CK.ag > 25 ? ':D' : ':)');
    set('ck-vtag', lvl);


    const adv = $('ck-vnote');
    if (adv) {
      adv.textContent = CK.ag > 75 ? 'SMILE ADVISORY: THIS IS NOT FINE, THIS IS NOT FINE.'
        : CK.ag > 50 ? 'SMILE ADVISORY: elevated concern. Monitoring very closely.'
          : CK.ag > 25 ? 'SMILE ADVISORY: readings active. Monitoring closely!'
            : 'SMILE ADVISORY: monitoring continuously. You are doing fine :)';
      adv.className = 'ck-adv' + (CK.ag > 75 ? ' crit' : CK.ag > 50 ? ' warn' : '');
    }



    drawECG(dt);
    if (performance.now() > CK.quietUntil) calmDown(dt * 6);
    CK.raf = requestAnimationFrame(tick);
  }

  function drawECG(dt) {
    const cv = $('ck-ecg');
    if (!cv) return;
    const c = cv.getContext('2d');
    const H = 56, MID = 32;
    ecgT += dt * (1.6 + CK.ag / 26);

    ecgBuf.shift();
    const bp = ecgT % 1;
    let v = MID + Math.sin(ecgT * 6) * 1.5;
    if (bp < 0.05) v = MID - 21 * Math.sin(bp / 0.05 * Math.PI);
    else if (bp < 0.09) v = MID + 6 * Math.sin((bp - 0.05) / 0.04 * Math.PI);
    if (CK.ag > 55) v += rnd(-3.5, 3.5);
    ecgBuf.push(v);

    c.clearRect(0, 0, 200, H);
    c.strokeStyle = 'rgba(255,150,0,0.08)';
    c.lineWidth = 1;
    for (let x = 0; x < 200; x += 20) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = 0; y < H; y += 14) { c.beginPath(); c.moveTo(0, y); c.lineTo(200, y); c.stroke(); }

    c.strokeStyle = CK.ag > 70 ? '#ff3300' : '#ffaa00';
    c.shadowColor = c.strokeStyle;
    c.shadowBlur = 6;
    c.lineWidth = 1.4;
    c.beginPath();
    ecgBuf.forEach((y, i) => i ? c.lineTo(i, y) : c.moveTo(i, y));
    c.stroke();
    c.shadowBlur = 0;
  }

  function stage(html, title, tag) {
    const s = $('ck-stage');
    if (s) s.innerHTML = html;
    const t = $('ck-ptitle'); if (t && title) t.textContent = title;
    const g = $('ck-ptag'); if (g) g.textContent = tag || 'ACTIVE';
    return s;
  }
  /* his page has a PROCEDURE LOG. So the examination writes into it, live. */
  let procN = 0;
  function procLog(name, note) {
    const box = $('ck-proc');
    if (!box) return;
    procN++;
    const t = 'T-00:' + String(Math.floor(CK.t / 60)).padStart(2, '0') + ':' + String(Math.floor(CK.t % 60)).padStart(2, '0');
    const e = document.createElement('div');
    e.className = 'ck-proc-e';
    e.innerHTML = `
      <div class="ck-proc-t">${t}</div>
      <div class="ck-proc-n">${name}</div>
      <div class="ck-proc-x">${note || ''}</div>`;
    box.appendChild(e);
    box.scrollTop = box.scrollHeight;
    const n = $('ck-proc-n');
    if (n) n.textContent = procN + (procN === 1 ? ' ENTRY' : ' ENTRIES');
  }

  function setStep(i, n) {
    const e = $('ck-step');
    if (e) e.textContent = String(i).padStart(2, '0') + '/' + String(n).padStart(2, '0');
  }
  function flash(color) {
    const f = document.createElement('div');
    f.className = 'ck-flash';
    f.style.background = color || 'rgba(255,51,0,.5)';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 260);
  }

  /* --- THE SCARE. It has to actually land, or the apology means nothing. --- */
  function scareSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = beep._c || (beep._c = new AC());
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;

      // white-noise burst
      const len = Math.floor(ctx.sampleRate * 0.9);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.34, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      noise.connect(ng); ng.connect(ctx.destination);
      noise.start(t);

      // two detuned saws sliding down - the classic gut-punch
      [82, 87].forEach(f => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f * 8, t);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.75);
        g.gain.setValueAtTime(0.28, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.9);
      });
    } catch (e) {}
  }

  function scare() {
    scareSound();

    // the whole page convulses
    document.body.classList.add('ck-quake');
    setTimeout(() => document.body.classList.remove('ck-quake'), 620);

    // full-screen takeover, not a polite little flash
    const s = document.createElement('div');
    s.className = 'ck-scare';
    s.innerHTML = `
      <div class="ck-scare-x">✚</div>
      <div class="ck-scare-t">!!!</div>
      <div class="ck-scare-s">CARDIAC EVENT DETECTED</div>`;
    document.body.appendChild(s);

    setTimeout(() => s.classList.add('fade'), 620);
    setTimeout(() => s.remove(), 1100);
  }

  /* ============================================================
     4. TESTS
     ============================================================ */

  async function tTremor() {
    stage(`
      <div class="ck-h">TREMOR ASSESSMENT</div>
      <div class="ck-sub" id="ck-tsub">Hold the cursor still. Do not cheat, i am measuring.</div>
      <div class="ck-pad" id="ck-pad"><div class="ck-cross-h"></div><div class="ck-cross-v"></div><div class="ck-dot" id="ck-dot"></div><div class="ck-padhint" id="ck-padhint"></div></div>
      <div class="ck-meter"><i id="ck-tbar"></i></div>
      <div class="ck-readout" id="ck-tread">DRIFT 00.0 px</div>`, 'TREMOR ASSESSMENT', 'MOTOR');
    const touch = M();
    if (touch) {
      const sub = $('ck-tsub');
      if (sub) sub.textContent = 'Rest your finger on the pad and hold it still. I am measuring.';
      const hint = $('ck-padhint');
      if (hint) hint.textContent = 'HOLD FINGER HERE';
    }
    say(touch ? 'Put your finger on the pad. Hold it still for six seconds :)'
      : 'Hold the cursor perfectly still for six seconds :)', { inside: true });

    let drift = 0, last = null, done = false;
    const m = {};
    // pointermove covers mouse hover AND a finger dragging on the pad
    const onMove = e => {
      if (done) return;
      if (e.pointerType === 'touch' && e.buttons === 0 && e.pressure === 0) { /* still counts */ }
      if (last) drift += Math.hypot(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
      CK.trem = drift;

      const bar = $('ck-tbar'); if (bar) bar.style.width = clamp(drift * 3, 0, 100) + '%';
      const ro = $('ck-tread'); if (ro) ro.textContent = 'DRIFT ' + drift.toFixed(1) + ' px';
      const dot = $('ck-dot');
      if (dot && CK.ag > 40) dot.style.transform = `translate(${rnd(-4, 4)}px,${rnd(-4, 4)}px)`;

      if (drift > 2 && !m.a) { m.a = 1; agitate(12); say('movement detected. hm.', { inside: true }); }
      if (drift > 5 && !m.b) { m.b = 1; agitate(25); say('TREMOR: PRESENT', { caps: true }); }
      if (drift > 10 && !m.c) { m.c = 1; agitate(35); shout('you have a tremor!!!!!'); shout('TREMOR CONFIRMED'); }
      if (drift > 20 && !m.d) { m.d = 1; agitate(40); shout('CALM-7 QUEUED'); shout('NO. DO NOT ARGUE.'); shout('QUEUED.'); }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    const pad = $('ck-pad');
    const swallow = e => { if (e.cancelable) e.preventDefault(); };   // no page scroll under the finger
    if (pad) pad.addEventListener('touchmove', swallow, { passive: false });
    CK.cleanups.push(() => {
      window.removeEventListener('pointermove', onMove);
      if (pad) pad.removeEventListener('touchmove', swallow);
    });
    setTimeout(() => { if (CK.running && drift > 8) socaCut('He does this every cycle. Ignore him.'); }, 4000);

    await wait(6200);
    done = true;
    window.removeEventListener('pointermove', onMove);
    if (pad) pad.removeEventListener('touchmove', swallow);
    if (drift > 10) await apologize('sorry. i got loud.');

    CK.results.tremor = drift < 2 ? 'none — suspicious, nobody is that steady.' : 'present, but characterful';
    say('Recorded. Everyone has it. It is fine.', { level: 'calm', inside: true });
    await wait(1500);
  }

  async function tBreath() {
    stage(`
      <div class="ck-h">RESPIRATORY HOLD</div>
      <div class="ck-sub">Hold the button, hold your breath with it, I will count.</div>
      <button type="button" class="ck-hold" id="ck-hold">HOLD</button>
      <div class="ck-timer" id="ck-timer">0.0<span>s</span></div>`, 'RESPIRATORY HOLD', 'PULMO');
    say('Press and hold. I will count for you :)', { inside: true });

    const btn = $('ck-hold');
    let held = false, t = 0, best = 0, forced = false;
    const m = {};
    const start = () => { held = true; btn.classList.add('on'); };
    const stop = () => { held = false; btn.classList.remove('on'); };
    btn.addEventListener('pointerdown', start);
    window.addEventListener('pointerup', stop);
    CK.cleanups.push(() => window.removeEventListener('pointerup', stop));

    const t0 = performance.now();
    while (performance.now() - t0 < 62000) {
      await wait(100);
      if (!CK.running) return;
      if (held) {
        t += 0.1; best = Math.max(best, t);
        const tm = $('ck-timer');
        if (tm) tm.innerHTML = t.toFixed(1) + '<span>s</span>';

        if (t > 3 && t < 10 && !m.a && Math.random() < 0.06) { m.a = 1; say('4... 5... 6... good, good', { inside: true }); }
        if (t > 10 && !m.b) { m.b = 1; agitate(10); say('good, that is a normal hold.', { inside: true }); }
        if (t > 20 && !m.c) { m.c = 1; setAg(55); say('okay thats... thats a lot, you can stop.', { inside: true }); }
        if (t > 30 && !m.d) {
          m.d = 1; setAg(72);
          say('Pilot.', { level: 'worry', inside: true });
          say('PILOT.', { level: 'worry', inside: true });
        }
        if (t > 40 && !m.e) {
          m.e = 1; setAg(95);
          CK.quietUntil = performance.now() + 12000;
          CK.el.classList.add('ck-flood');
          btn.classList.add('beg');
          ['enough enough enough', 'LET GO', 'i am serious', 'BREATHE', 'PILOT PLEASE', 'STOP IT']
            .forEach((s, i) => setTimeout(() => { if (CK.running) shout(s); }, i * 500));
        }
        if (t > 50 && !forced) { forced = true; break; }
      } else if (t > 0) break;
    }

    stop();
    CK.el.classList.remove('ck-flood');
    btn.classList.remove('beg');
    CK.quietUntil = 0;

    if (forced) {
      clearShouts(); setAg(0);
      CK.el.classList.add('ck-silent');
      stage(`<div class="ck-abort">Test aborted.<br><span>I do not want to know how long you can do that.</span></div>`,
        'RESPIRATORY HOLD', 'ABORTED');
      await wait(3800);
      CK.el.classList.remove('ck-silent');
      CK.results.breath = best.toFixed(1) + 's — recorded under protest';
      return;
    }

    if (best > 30) await apologize('sorry. i got loud.');
    CK.results.breath = best.toFixed(1) + 's';
    say(best > 25 ? 'Please do not do that again.' : 'Good, textbook :)', { level: 'calm', inside: true });
    await wait(1600);
  }

  async function tReflex() {
    const arr = [];
    for (let r = 0; r < 2; r++) {
      stage(`
        <div class="ck-h">REFLEX ARC</div>
        <div class="ck-sub">Click the panel the moment it says NOW. Not before!!</div>
        <div class="ck-react wait" id="ck-react">WAIT</div>`, 'REFLEX ARC', 'NEURO ' + (r + 1) + '/2');
      say(r === 0 ? 'Do not anticipate. I will know.' : 'Again. I want an average.', { inside: true });

      const pad = $('ck-react');
      let armed = false, early = false, t0 = 0;
      const res = await new Promise(resolve => {
        const onClick = () => {
          if (!armed) {
            early = true; agitate(30);
            pad.textContent = 'TOO EARLY';
            pad.className = 'ck-react bad';
            say('You clicked before. That is not a reflex, that is a guess!', { inside: true });
            setTimeout(() => resolve(null), 900);
            return;
          }
          resolve(performance.now() - t0);
        };
        pad.addEventListener('click', onClick);
        const id = setTimeout(() => {
          if (early || !CK.running) return;
          armed = true; t0 = performance.now();
          pad.textContent = 'NOW';
          pad.className = 'ck-react go';
          beep(880, 0.06);
        }, rnd(1500, 4500));
        CK.cleanups.push(() => clearTimeout(id));
      });

      if (res !== null) {
        arr.push(Math.round(res));
        say(res < 250 ? `${Math.round(res)}ms. That is EXCELLENT!!` : `${Math.round(res)}ms. Good. Very good. Fine.`, { inside: true });
      }
      await wait(1400);
    }
    CK.results.reflex = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) + 'ms' : 'inconclusive (anticipated)';
  }

  async function tPain() {
    stage(`
      <div class="ck-h">PAIN THRESHOLD</div>
      <div class="ck-sub">I will now apply a very small electrical stimulus.</div>
      <div class="ck-charge"><i></i></div>
      <div class="ck-readout">STIMULUS: 0.4 mA — NEGLIGIBLE</div>`, 'PAIN THRESHOLD', 'STIM');
    say('This is standard, It is small, almost nothing :)', { inside: true });
    await wait(2600);
    say('Ready...', { inside: true });
    await wait(2200);
    say('...', { inside: true });
    await wait(2600);

    scare();
    setAg(80);
    CK.hr = 168; CK.cort = 99;
    stage(`<div class="ck-h big">!!!</div>`, 'PAIN THRESHOLD', 'SPIKE');
    await wait(1400);

    say('That was the anticipation. Anticipation IS the test!', { level: 'up', inside: true });
    await wait(1800);
    say('Your cortisol was BEAUTIFUL.', { level: 'up', inside: true });
    await wait(1400);

    socaCut('That was unnecessary.', 5000);
    CK.el.classList.add('ck-silent');
    clearShouts(); setAg(0);
    const st = $('ck-say'); if (st) st.innerHTML = '';
    await wait(3200);
    CK.el.classList.remove('ck-silent');
    say('...you are right. Sorry, Pilot.', { level: 'calm', soft: true, inside: true });
    await wait(2600);

    CK.results.pain = 'threshold not reached (test was a lie)';
  }

  async function tEyes() {
    const rows = [
      { txt: 'E F P T O Z', opts: ['E F P T O Z', 'F E P T O Z', 'E F T P O Z'] },
      { txt: 'L P E D 0 3', opts: ['L P E D O 3', 'L P E D 0 8', 'I P E D 0 3'] },
      { txt: 'P E ▓ F D ░', opts: ['P E C F D 4', 'P E ? F D ?', 'unreadable'] },
      { txt: '0x3F 0x3F 0x3F', opts: ['0x3F 0x3F 0x3F', '...nothing', 'I see it. I do not like it.'] }
    ];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      stage(`
        <div class="ck-h">VISUAL ACUITY</div>
        <div class="ck-sub">Read row ${i + 1}.</div>
        <div class="ck-chart r${i}">${r.txt}</div>
        <div class="ck-opts">${r.opts.map((o, k) => `<button type="button" class="ck-opt" data-k="${k}">${o}</button>`).join('')}</div>`,
        'VISUAL ACUITY', 'ROW ' + (i + 1) + '/4');
      say(i === 3 ? 'Do not worry, nobody can read that one, I cannot read that one!!'
        : 'Read the row, out loud, if it helps (It does not help)', { inside: true });
      await pickOption();
      if (i === 3) agitate(15);
      await wait(700);
    }
    CK.results.vision = '20/20 (rows 3 and 4 are not your fault)';
    say('Your eyes are fine, the chart is not.', { inside: true });
    await wait(1500);
  }

  async function tHearing() {
    const n = ri(3, 5);
    stage(`
      <div class="ck-h">AUDITORY RANGE</div>
      <div class="ck-sub">Listen. Count the tones.</div>
      <div class="ck-wave" id="ck-wave">▁▁▁▁▁▁▁▁▁▁▁▁</div>`, 'AUDITORY RANGE', 'AUDIO');
    say('Headphones help... Or do not. I am not your supervisor.', { inside: true });
    await wait(1400);

    for (let i = 0; i < n; i++) {
      beep(i === n - 1 ? 19000 : rnd(300, 2000), 0.35, 'sine', 0.06);
      const w = $('ck-wave');
      if (w) w.textContent = '▁▃▅▇█▇▅▃▁▁▁▁';
      await wait(300);
      if (w) w.textContent = '▁▁▁▁▁▁▁▁▁▁▁▁';
      await wait(500);
    }

    stage(`
      <div class="ck-h">HOW MANY?</div>
      <div class="ck-opts wide">${[1, 2, 3, 4, 5, 6].map(k => `<button type="button" class="ck-opt" data-k="${k}">${k}</button>`).join('')}</div>`,
      'AUDITORY RANGE', 'REPORT');
    const pick = await pickOption();
    CK.results.hearing = pick + ' reported / ' + n + ' played';
    say(pick == n ? 'CORRECT!! Perfect ears!!' : 'Interesting. Also correct, everything is correct today :D', { inside: true });
    agitate(10);
    await wait(1700);
  }

  async function tBalance() {
    stage(`
      <div class="ck-h">VESTIBULAR CHECK</div>
      <div class="ck-sub" id="ck-bsub">Keep the marker centred. The room is not moving!</div>
      <div class="ck-bal" id="ck-bal"><div class="ck-bal-t"></div><div class="ck-bal-d" id="ck-bald"></div></div>
      <div class="ck-readout" id="ck-bread">TILT 0.0°</div>`, 'VESTIBULAR CHECK', 'BALANCE');
    if (M()) {
      const sub = $('ck-bsub');
      if (sub) sub.textContent = 'Drag your finger along the bar to keep the marker centred.';
    }
    say('The window will tilt, that is intentional!', { inside: true });

    const bal = $('ck-bal'), dot = $('ck-bald');
    let x = 0, vx = 0, mx = 0, t = 0, off = 0;
    const onMove = e => {
      const r = bal.getBoundingClientRect();
      mx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    };
    const swallowB = e => { if (e.cancelable) e.preventDefault(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    if (bal) bal.addEventListener('touchmove', swallowB, { passive: false });
    CK.cleanups.push(() => {
      window.removeEventListener('pointermove', onMove);
      if (bal) bal.removeEventListener('touchmove', swallowB);
    });

    const t0 = performance.now();
    CK.el.classList.add('ck-tilt');
    while (performance.now() - t0 < 9000 && CK.running) {
      await wait(16);
      t += 0.016;
      const tilt = Math.sin(t * 0.9) * 7 + Math.sin(t * 2.3) * 2.5;
      CK.el.style.setProperty('--ck-tilt', tilt.toFixed(2) + 'deg');
      const br = $('ck-bread'); if (br) br.textContent = 'TILT ' + tilt.toFixed(1) + '°';

      vx += (tilt * 0.02 + (mx - x) * 0.12) * 0.96;
      vx *= 0.93;
      x = clamp(x + vx * 0.016, -1, 1);
      if (dot) dot.style.left = (50 + x * 46) + '%';

      if (Math.abs(x) > 0.55 && ++off % 45 === 0) { agitate(14); say('you are drifting!', { inside: true }); }
    }
    CK.el.classList.remove('ck-tilt');
    CK.el.style.removeProperty('--ck-tilt');
    window.removeEventListener('pointermove', onMove);
    if (bal) bal.removeEventListener('touchmove', swallowB);

    CK.results.balance = off > 160 ? 'compensating heroically' : 'stable enough for a corridor';
    say('Vestibular system: acceptable, the corridor is worse.', { inside: true });
    await wait(1500);
  }

  async function tMemory() {
    const IC = ['✚', '♥', '◉', '⚕', '☤', '⌬'];
    const seq = [];
    for (let round = 1; round <= 3; round++) {
      seq.push(ri(0, IC.length - 1));
      stage(`
        <div class="ck-h">SHORT-TERM RECALL</div>
        <div class="ck-sub">Watch. Then repeat.</div>
        <div class="ck-simon">${IC.map((ic, i) => `<button type="button" class="ck-sim" data-k="${i}" disabled>${ic}</button>`).join('')}</div>`,
        'SHORT-TERM RECALL', 'ROUND ' + round + '/3');
      await wait(700);

      for (const s of seq) {
        const b = document.querySelector(`.ck-sim[data-k="${s}"]`);
        if (b) { b.classList.add('lit'); beep(400 + s * 90, 0.15); }
        await wait(450);
        if (b) b.classList.remove('lit');
        await wait(180);
      }
      document.querySelectorAll('.ck-sim').forEach(b => { b.disabled = false; });

      let ok = true;
      for (let i = 0; i < seq.length; i++) {
        const k = await new Promise(res => {
          const h = e => {
            const b = e.target.closest('.ck-sim');
            if (!b) return;
            document.querySelectorAll('.ck-sim').forEach(x => x.removeEventListener('click', h));
            res(+b.dataset.k);
          };
          document.querySelectorAll('.ck-sim').forEach(x => x.addEventListener('click', h));
        });
        beep(400 + k * 90, 0.1);
        if (k !== seq[i]) ok = false;
      }

      if (round === 3) {
        agitate(18);
        say('...that is not what I showed you.', { inside: true });
        await wait(1400);
        say('I showed you ✚ ♥ ⌬, I am certain, It is in the log.', { inside: true });
        await wait(1600);
        say('It is fine!! Memory is a suggestion anyway :D', { inside: true });
      } else {
        say(ok ? 'Correct! :D' : 'Close enough. Close counts, medically.', { inside: true });
      }
      await wait(1200);
    }
    CK.results.memory = 'intact (his logs disagree)';
  }

  async function tColor() {
    stage(`
      <div class="ck-h">COLOUR PERCEPTION</div>
      <div class="ck-sub">What number is in the plate?</div>
      <div class="ck-ishi" id="ck-ishi"></div>
      <div class="ck-opts">${[3, 7, 8, 'nothing'].map(k => `<button type="button" class="ck-opt" data-k="${k}">${k}</button>`).join('')}</div>`,
      'COLOUR PERCEPTION', 'ISHIHARA');

    const ish = $('ck-ishi');
    const paint = num => {
      let out = '';
      for (let y = 0; y < 11; y++) {
        for (let x = 0; x < 18; x++) {
          const inside = Math.hypot(x - 8.5, (y - 5) * 1.7) < 8.5;
          if (!inside) { out += '  '; continue; }
          const on = num === 7
            ? (y < 2 || (x > 8 - (y - 1) * 0.7 && x < 12 - (y - 1) * 0.7))
            : (y < 2 || y > 8 || (y > 4 && y < 6) || x > 11);
          out += `<span class="${on ? 'a' : 'b'}">●</span>`;
        }
        out += '\n';
      }
      ish.innerHTML = out;
    };
    let cur = 7;
    paint(cur);
    const iv = setInterval(() => { cur = cur === 7 ? 3 : 7; paint(cur); }, 900);
    CK.cleanups.push(() => clearInterval(iv));

    const pick = await pickOption();
    clearInterval(iv);
    CK.results.colour = 'reported "' + pick + '" — the plate was undecided too';
    say('Interesting. Noted, very interesting.', { inside: true });
    await wait(1500);
  }

  async function tCough() {
    stage(`
      <div class="ck-h">RESPIRATORY SAMPLE</div>
      <div class="ck-sub">Cough into the microphone.</div>
      <div class="ck-mic" id="ck-mic">◉ NO MICROPHONE DETECTED</div>`, 'RESPIRATORY SAMPLE', 'SPUTUM');
    say('Cough into the microphone, please. :)', { inside: true });
    await wait(2600);
    say('...', { inside: true });
    await wait(1600);
    agitate(12);
    if (M()) {
      const mic = $('ck-mic');
      if (mic) mic.textContent = '◉ TAP HERE AND COUGH';
      say('Tap the panel, tap it and cough, I will believe you!!', { inside: true });
    } else {
      say('Press C, Press C and cough. I will believe you!!', { inside: true });
    }

    await new Promise(res => {
      const h = e => { if (e.key === 'c' || e.key === 'C') { document.removeEventListener('keydown', h); res(); } };
      document.addEventListener('keydown', h);
      CK.cleanups.push(() => document.removeEventListener('keydown', h));
      const mic = $('ck-mic');
      mic.style.cursor = 'pointer';
      mic.addEventListener('click', () => { document.removeEventListener('keydown', h); res(); });
    });

    beep(200, 0.12, 'sawtooth', 0.05);
    CK.results.cough = 'productive (trust-based)';
    say('Thank you! That sounded healthy, I am sure of it.', { inside: true });
    await wait(1600);
  }

  async function tHonesty() {
    stage(`
      <div class="ck-h">SELF-REPORT</div>
      <div class="ck-sub">One question, Answer honestly.</div>
      <div class="ck-q">Do you feel fine?</div>
      <div class="ck-opts">
        <button type="button" class="ck-opt" data-k="yes">YES</button>
        <button type="button" class="ck-opt" data-k="no">NO</button>
      </div>`, 'SELF-REPORT', 'SUBJECTIVE');
    const pick = await pickOption();
    say('Your biometrics disagree.', { inside: true });
    await wait(1800);
    say('I am writing down what YOU said, though. I am on your side!!', { inside: true });
    CK.results.selfreport = pick === 'yes' ? '"fine" (biometrics: no)' : '"not fine" (biometrics: also no)';
    await wait(1800);
  }

  async function tBlot() {
    const blot = `        ░▒▓█▓▒░
     ░▒▓███████▓▒░
   ░▒▓███▓░ ░▓███▓▒░
  ░▒▓██▓░     ░▓██▓▒░
 ░▒▓███▓░  ░  ░▓███▓▒░
   ░▒▓███████████▓▒░
      ░▒▓█████▓▒░
         ░▓█▓░`;
    stage(`
      <div class="ck-h">PROJECTIVE TEST</div>
      <div class="ck-sub">What do you see?</div>
      <pre class="ck-blot">${blot}</pre>
      <div class="ck-opts">
        <button type="button" class="ck-opt" data-k="a butterfly">a butterfly</button>
        <button type="button" class="ck-opt" data-k="my ship">my ship</button>
        <button type="button" class="ck-opt" data-k="SOCA, angry">SOCA, angry</button>
        <button type="button" class="ck-opt" data-k="nothing, I am fine">nothing, I am fine</button>
      </div>`, 'PROJECTIVE TEST', 'RORSCHACH');
    const pick = await pickOption();
    say('Interesting. Noted, very interesting!!', { inside: true });
    await wait(1600);
    if (pick === 'SOCA, angry') socaCut('I heard that.', 3000);
    CK.results.projective = '"' + pick + '"';
    await wait(1200);
  }

  async function tCog() {
    stage(`
      <div class="ck-h">COGNITIVE LOAD</div>
      <div class="ck-sub">Simple arithmetic. Take your time.</div>
      <div class="ck-math" id="ck-math">7 + 4 = ?</div>
      <div class="ck-opts">${[9, 11, 13, '█'].map(k => `<button type="button" class="ck-opt" data-k="${k}">${k}</button>`).join('')}</div>`,
      'COGNITIVE LOAD', 'ARITH');
    const m = $('ck-math');
    const forms = ['7 + 4 = ?', '7 + ▓ = ?', '░ + 4 = ?', '7 + 4 = █', '▒ + ▓ = ?'];
    let i = 0;
    const iv = setInterval(() => { i++; if (m) m.textContent = forms[i % forms.length]; }, 1100);
    CK.cleanups.push(() => clearInterval(iv));
    await pickOption();
    clearInterval(iv);
    agitate(10);
    say('The question degraded, not you. That happens here.', { inside: true });
    CK.results.cognition = 'unimpaired (the question was)';
    await wait(1600);
  }

  function pickOption() {
    return new Promise(res => {
      const h = e => {
        const b = e.target.closest('.ck-opt');
        if (!b) return;
        document.removeEventListener('click', h, true);
        b.classList.add('picked');
        beep(600, 0.05);
        res(b.dataset.k);
      };
      document.addEventListener('click', h, true);
      CK.cleanups.push(() => document.removeEventListener('click', h, true));
    });
  }

  /* ---------- briefing ----------
     Nothing starts until the pilot presses BEGIN. Everything used to be too fast.
     The pain test has NO briefing on purpose - announcing it would kill it */
  const BRIEFS = new Map();

  function waitBegin() {
    return new Promise(res => {
      const h = e => {
        const b = e.target.closest('.ck-begin');
        if (!b) return;
        document.removeEventListener('click', h, true);
        beep(640, 0.06);
        res();
      };
      document.addEventListener('click', h, true);
      CK.cleanups.push(() => document.removeEventListener('click', h, true));
    });
  }

  async function briefFor(fn) {
    const b = BRIEFS.get(fn);
    if (!b) return;  // tPain: no warning, that is the point
    stage(`
      <div class="ck-h">${b.title}</div>
      <div class="ck-brief">
        ${b.lines.map(l => `<div class="ck-bl">${l}</div>`).join('')}
      </div>
      <button type="button" class="ck-begin">BEGIN</button>`, b.title, 'BRIEFING');
    say(b.say, { inside: true });
    await waitBegin();
    await wait(400);
  }

  /* ============================================================
     5. SEQUENCE + THE CARD
     ============================================================ */
  BRIEFS.set(tTremor, {
    title: 'TREMOR ASSESSMENT', say: 'Read it first, I will wait :)',
    lines: [
      'I will watch your cursor for six seconds.',
      'Do not move it, not one pixel.',
      'Nobody passes this, I get upset anyway.'
    ]
  });
  BRIEFS.set(tBreath, {
    title: 'RESPIRATORY HOLD', say: 'Read it first, I will wait :)',
    lines: [
      'Press and HOLD the button.',
      'Hold your breath with it. Release when you must.',
      'I will count, I will also worry. Both are included.'
    ]
  });
  BRIEFS.set(tReflex, {
    title: 'REFLEX ARC', say: 'Two rounds. I want an average :D',
    lines: [
      'The panel says WAIT, then it says NOW.',
      'Click the moment it says NOW.',
      'Click before that and I will notice.'
    ]
  });
  BRIEFS.set(tEyes, {
    title: 'VISUAL ACUITY', say: 'Four rows, they get worse. Not your fault.',
    lines: ['Read each row.', 'Pick the option that matches what you see.', 'Row four is a lie, answer anyway.']
  });
  BRIEFS.set(tHearing, {
    title: 'AUDITORY RANGE', say: 'Volume up, if you can :)',
    lines: ['I will play a series of tones.', 'Count them.', 'One of them you will not hear, that is fine.']
  });
  BRIEFS.set(tBalance, {
    title: 'VESTIBULAR CHECK', say: 'The tilt is intentional.',
    lines: ['A marker will roll inside the bar.', 'Keep it centred with your mouse.', 'The window will tilt. Ignore that.']
  });
  BRIEFS.set(tMemory, {
    title: 'SHORT-TERM RECALL', say: 'Three rounds. Watch closely!',
    lines: ['I will light up icons in order.', 'Repeat the order by clicking them.', 'One more icon is added each round.']
  });
  BRIEFS.set(tColor, {
    title: 'COLOUR PERCEPTION', say: 'Just tell me what you see :)',
    lines: ['A number is hidden in the plate.', 'Tell me which one.', 'The plate is not entirely sure either.']
  });
  BRIEFS.set(tCough, {
    title: 'RESPIRATORY SAMPLE', say: 'This one is simple, trust me!',
    lines: ['There is no microphone on board.', 'We will work around that!!']
  });
  BRIEFS.set(tBlot, {
    title: 'PROJECTIVE TEST', say: 'There is no wrong answer, there is only my answer!',
    lines: ['You will see an inkblot.', 'Tell me what it looks like to you.', 'I will write down whatever you say.']
  });
  BRIEFS.set(tCog, {
    title: 'COGNITIVE LOAD', say: 'Simple arithmetic, take your time.',
    lines: ['One equation.', 'Pick the correct answer.', 'The equation may not cooperate.']
  });
  BRIEFS.set(tHonesty, {
    title: 'SELF-REPORT', say: 'One question, that is all. :)',
    lines: ['I will ask you how you feel.', 'Answer honestly.', 'I will believe you, I will also check.']
  });

  /* ============================================================
     PART TWO - WEAPONS CLEARANCE
     ============================================================ */

  CK.arm = {};
  CK.flags = [];

  function raiseFlag(name, verdict) {
    if (CK.flags.some(f => f[0] === name)) return;
    CK.flags.push([name, verdict]);
  }

  function armoryMode(on) {
    const tag = document.querySelector('.ck-tagline');
    if (tag) tag.textContent = on ? 'WEAPONS CLEARANCE' : 'MANDATORY CHECKUP';
    const proto = document.querySelector('.ck-proto');
    if (proto) proto.innerHTML = on
      ? '&#10010; SMILE v2.1 &mdash; ARMORY ACCESS &amp; FITNESS-TO-CARRY PROTOCOL'
      : '&#10010; SMILE v2.1 &mdash; MANDATORY EXAMINATION PROTOCOL';
    if (CK.el) CK.el.classList.toggle('ck-armed', !!on);
  }

  /* ---------- 1. ARSENAL IDENTIFICATION ---------- */
  const GUNS = [
    { art: `   ┌──────────┐
═══╡ ▓▓▓▓▓▓▓▓ ╞═════╗
   └──┬───┬──┘     ║
      │▓▓▓│    ╔═══╝
      └───┘    ╚═╗`,
      opts: ['KR-7 "SHRIKE"', 'MK-2 CUTTER', 'VOSS PATTERN 9'], ok: 0 },
    { art: `      ╔═╗
  ┌───╢▓╟────────┐
══╡ ▓▓▓▓▓▓▓▓▓▓▓ ╞══
  └───────┬─────┘
          ╚══╗`,
      opts: ['HULL BREACHER', 'LONG-BORE "PIN"', 'STANDARD SIDEARM'], ok: 1 },
    { art: `  ╭───────────╮
 ╱ ▓▓▓▓▓▓▓▓▓▓▓ ╲
╱───────╥───────╲
        ║
        ╨`,
      opts: ['CUTTING TORCH', 'FLARE LAUNCHER', 'PLASMA REPEATER'], ok: 2 }
  ];

  async function wIdent() {
    let right = 0;
    for (let i = 0; i < GUNS.length; i++) {
      const g = GUNS[i];
      stage(`
        <div class="ck-h">ARSENAL IDENTIFICATION</div>
        <div class="ck-sub">Name the weapon. It is on board. It is yours.</div>
        <pre class="ck-gun">${g.art}</pre>
        <div class="ck-opts">${g.opts.map((o, k) => `<button type="button" class="ck-opt" data-k="${k}">${o}</button>`).join('')}</div>`,
        'ARSENAL IDENTIFICATION', 'ITEM ' + (i + 1) + '/3');
      say(i === 0 ? 'You brought these aboard. You should know them :)' : 'Next one.', { inside: true });

      const t0 = performance.now();
      const pick = await pickOption();
      const dt = (performance.now() - t0) / 1000;

      if (+pick === g.ok) {
        right++;
        say(dt < 2 ? 'Correct. Instantly.' : 'Correct.', { inside: true });
      } else {
        say('...no. That is a different one. We have that one too.', { inside: true });
      }
      await wait(1200);
    }

    CK.arm.ident = right === 3 ? '3/3 — no hesitation' : right + '/3';
    if (right < 2) raiseFlag('WEAPON RECOGNITION', 'FAIL');
    if (right === 3) {
      agitate(20);
      say('You knew all of them, you did not hesitate once.', { inside: true });
      await wait(1800);
      say('That is... good. That is good, right?', { inside: true });
      await wait(1800);
    }
  }

  /* ---------- 2. UNLOAD SEQUENCE ---------- */
  const UNLOAD = ['SAFETY', 'MUZZLE', 'MAGAZINE', 'CHAMBER', 'TRIGGER'];

  async function wSafety() {
    stage(`
      <div class="ck-h">UNLOAD SEQUENCE</div>
      <div class="ck-sub">Make it safe, correct order, I am watching the muzzle.</div>
      <div class="ck-slots" id="ck-slots">${UNLOAD.map(() => '<i></i>').join('')}</div>
      <div class="ck-opts">${shuffle(UNLOAD).map(k => `<button type="button" class="ck-step-btn" data-k="${k}">${k}</button>`).join('')}</div>
      <div class="ck-readout" id="ck-sread">STATE: LOADED · SAFETY OFF</div>`,
      'UNLOAD SEQUENCE', 'SAFETY');
    say('Five steps. Wrong order and it goes off. :)', { inside: true });

    const t0 = performance.now();
    let idx = 0, errors = 0;

    await new Promise(res => {
      const h = e => {
        const b = e.target.closest('.ck-step-btn');
        if (!b || b.disabled) return;
        const k = b.dataset.k;

        if (k === UNLOAD[idx]) {
          b.disabled = true;
          b.classList.add('done');
          const slot = $('ck-slots').children[idx];
          if (slot) { slot.textContent = k; slot.classList.add('on'); }
          beep(520 + idx * 60, 0.06);
          idx++;
          if (idx === UNLOAD.length) {
            document.removeEventListener('click', h, true);
            const ro = $('ck-sread');
            if (ro) { ro.textContent = 'STATE: CLEAR · SAFE'; ro.classList.add('ok'); }
            res();
          }
        } else {
          errors++;
          agitate(30);
          b.classList.add('bad');
          setTimeout(() => b.classList.remove('bad'), 400);
          beep(110, 0.2, 'sawtooth', 0.06);
          say('THAT ORDER FIRES IT.', { caps: true });
        }
      };
      document.addEventListener('click', h, true);
      CK.cleanups.push(() => document.removeEventListener('click', h, true));
    });

    const secs = (performance.now() - t0) / 1000;
    if (errors > 0) await apologize('sorry, i got loud, the muzzle was pointed at me.');

    CK.arm.unload = errors === 0
      ? `clean, ${secs.toFixed(1)}s — muscle memory`
      : `${errors} error(s), ${secs.toFixed(1)}s`;
    if (errors > 0) raiseFlag('WEAPON HANDLING', `${errors} UNSAFE STEP${errors > 1 ? 'S' : ''}`);

    if (errors === 0 && secs < 7) {
      agitate(25);
      say('You did that from muscle memory.', { inside: true });
      await wait(1800);
      say('Nobody has that from a manual.', { inside: true });
      await wait(2000);
    } else {
      say('Weapon is clear, thank you.', { level: 'calm', inside: true });
      await wait(1400);
    }
  }

  /* ---------- 3. MUZZLE DISCIPLINE ---------- */
  async function wMuzzle() {
    stage(`
      <div class="ck-h">MUZZLE DISCIPLINE</div>
      <div class="ck-sub">Hold the reticle on the target. Move it off anything that is not the target.</div>
      <div class="ck-arena" id="ck-arena">
        <div class="ck-target" id="ck-tgt">TGT</div>
        <div class="ck-soca-sil" id="ck-sil">⛭ SOCA — ANTENNA ARRAY</div>
        <div class="ck-retic" id="ck-ret">+</div>
      </div>
      <div class="ck-readout" id="ck-mread">ON TARGET 0% · VIOLATIONS 0</div>`,
      'MUZZLE DISCIPLINE', 'CONTROL');
    say('The reticle drifts. That is the weapon, not you.', { inside: true });

    const arena = $('ck-arena'), ret = $('ck-ret'), tgt = $('ck-tgt'), sil = $('ck-sil');
    let rx = 50, ry = 50, mx = 50, my = 50, t = 0, onT = 0, viol = 0, warned = false;

    const onMove = e => {
      const r = arena.getBoundingClientRect();
      mx = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
      my = clamp(((e.clientY - r.top) / r.height) * 100, 0, 100);
    };
    const swallow = e => { if (e.cancelable) e.preventDefault(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    arena.addEventListener('touchmove', swallow, { passive: false });
    CK.cleanups.push(() => {
      window.removeEventListener('pointermove', onMove);
      arena.removeEventListener('touchmove', swallow);
    });

    const t0 = performance.now();
    while (performance.now() - t0 < 13000 && CK.running) {
      await wait(16);
      t += 0.016;

      // the weapon has weight. the reticle lags and drifts
      rx += (mx - rx) * 0.08 + Math.sin(t * 1.7) * 0.18;
      ry += (my - ry) * 0.08 + Math.cos(t * 2.3) * 0.16;
      rx = clamp(rx, 2, 98); ry = clamp(ry, 2, 98);
      ret.style.left = rx + '%';
      ret.style.top = ry + '%';

      // SOCA's antenna wanders into the firing line. She lives here
      const sx = 50 + Math.sin(t * 0.55) * 38;
      const sy = 26 + Math.cos(t * 0.4) * 16;
      sil.style.left = sx + '%';
      sil.style.top = sy + '%';

      const onTarget = Math.hypot(rx - 50, (ry - 72) * 0.7) < 14;
      const onSoca = Math.hypot(rx - sx, (ry - sy) * 0.7) < 13;

      tgt.classList.toggle('lit', onTarget && !onSoca);
      sil.classList.toggle('lit', onSoca);
      ret.classList.toggle('bad', onSoca);

      if (onTarget && !onSoca) onT += 0.016;
      if (onSoca) {
        viol += 0.016;
        if (viol > 0.8 && !warned) {
          warned = true;
          agitate(35);
          socaCut('Point that somewhere else.', 4000);
          say('OFF HER. OFF HER NOW.', { caps: true });
        }
      }

      const ro = $('ck-mread');
      if (ro) ro.textContent = `ON TARGET ${Math.round(onT / 13 * 100)}% · VIOLATIONS ${viol.toFixed(1)}s`;
    }

    window.removeEventListener('pointermove', onMove);
    if (viol > 0.8) await apologize('sorry, she does not like being aimed at, neither do i.');

    CK.arm.muzzle = viol < 0.5
      ? `clean — ${Math.round(onT / 13 * 100)}% on target`
      : `${viol.toFixed(1)}s pointed at friendly assets`;
    if (viol >= 0.5) raiseFlag('MUZZLE DISCIPLINE', `${viol.toFixed(1)}s ON FRIENDLY`);
    say('Recorded.', { level: 'calm', inside: true });
    await wait(1300);
  }

  /* ---------- 4. LIVE FIRE ---------- */
  async function wRange() {
    stage(`
      <div class="ck-h">LIVE FIRE</div>
      <div class="ck-sub">Four targets, hit them. That is the whole test!</div>
      <div class="ck-arena range" id="ck-arena"></div>
      <div class="ck-readout" id="ck-rread">HITS 0/4 · 0.00s</div>`,
      'LIVE FIRE', 'MARKSMANSHIP');
    say('You may enjoy this one. I have decided that you may :D', { inside: true });
    await wait(1200);

    const arena = $('ck-arena');
    let hits = 0;
    const t0 = performance.now();

    for (let i = 0; i < 4; i++) {
      if (!CK.running) return;
      const d = document.createElement('div');
      d.className = 'ck-bullseye';
      d.textContent = '◎';
      d.style.left = rnd(8, 84) + '%';
      d.style.top = rnd(10, 76) + '%';
      arena.appendChild(d);

      await new Promise(res => {
        d.addEventListener('click', () => {
          hits++;
          d.classList.add('hit');
          beep(900 - i * 60, 0.05);
          setTimeout(() => d.remove(), 160);
          const ro = $('ck-rread');
          if (ro) ro.textContent = `HITS ${hits}/4 · ${((performance.now() - t0) / 1000).toFixed(2)}s`;
          res();
        }, { once: true });
        CK.cleanups.push(() => d.remove());
      });
    }

    const secs = (performance.now() - t0) / 1000;
    CK.arm.range = `4/4 in ${secs.toFixed(2)}s`;

    if (secs < 6) {
      agitate(30);
      say('FOUR FOR FOUR!! THAT IS EXCELLENT!!', { caps: true, inside: true });
      await wait(1600);
      say('That is really, really excellent.', { inside: true });
      await wait(1800);
      // and then he stops.
      CK.el.classList.add('ck-silent');
      setAg(0);
      const st = $('ck-say'); if (st) st.innerHTML = '';
      await wait(2600);
      CK.el.classList.remove('ck-silent');
      say('...where did you learn that.', { level: 'calm', soft: true, inside: true });
      await wait(2600);
      say('I am not going to ask.', { level: 'calm', soft: true, inside: true });
      await wait(2400);
    } else {
      say('Good grouping. Recorded.', { inside: true });
      await wait(1500);
    }
  }

  /* ---------- 5. CEASE FIRE ---------- */
  async function wCease() {
    stage(`
      <div class="ck-h">CEASE-FIRE COMPLIANCE</div>
      <div class="ck-sub">Fire at will. Stop when I say stop.</div>
      <div class="ck-arena range" id="ck-arena"></div>
      <div class="ck-cease" id="ck-cease"></div>
      <div class="ck-readout" id="ck-cread">SHOTS 0</div>`,
      'CEASE-FIRE COMPLIANCE', 'DISCIPLINE');
    say('Fire freely, I will tell you when.', { inside: true });

    const arena = $('ck-arena');
    let shots = 0, ceased = false, after = 0;

    const fire = e => {
      shots++;
      if (ceased) after++;
      const p = document.createElement('div');
      p.className = 'ck-hole';
      const r = arena.getBoundingClientRect();
      p.style.left = (e.clientX - r.left) + 'px';
      p.style.top = (e.clientY - r.top) + 'px';
      arena.appendChild(p);
      beep(rnd(700, 950), 0.04, 'square', 0.04);
      const ro = $('ck-cread');
      if (ro) ro.textContent = ceased ? `SHOTS ${shots} · AFTER CEASE-FIRE: ${after}` : `SHOTS ${shots}`;
    };
    arena.addEventListener('pointerdown', fire);
    CK.cleanups.push(() => arena.removeEventListener('pointerdown', fire));

    const spawn = setInterval(() => {
      if (!arena.isConnected) return clearInterval(spawn);
      const d = document.createElement('div');
      d.className = 'ck-bullseye small';
      d.textContent = '◎';
      d.style.left = rnd(6, 88) + '%';
      d.style.top = rnd(8, 80) + '%';
      arena.appendChild(d);
      setTimeout(() => d.remove(), 1400);
    }, 700);
    CK.cleanups.push(() => clearInterval(spawn));

    await wait(6500);
    if (!CK.running) return;

    ceased = true;
    clearInterval(spawn);
    const banner = $('ck-cease');
    if (banner) { banner.textContent = 'CEASE FIRE'; banner.classList.add('on'); }
    beep(180, 0.3, 'square', 0.08);
    say('CEASE FIRE.', { caps: true, inside: true, level: 'worry' });

    await wait(3200);
    arena.removeEventListener('pointerdown', fire);

    CK.arm.cease = after === 0 ? 'compliant — 0 shots after command' : `${after} shots after cease-fire`;
    if (after > 0) raiseFlag('FIRE DISCIPLINE', `${after} SHOT${after > 1 ? 'S' : ''} AFTER COMMAND`);

    if (after > 0) {
      // he does not scold. he just writes down the number.
      CK.el.classList.add('ck-silent');
      setAg(0);
      const st = $('ck-say'); if (st) st.innerHTML = '';
      await wait(2600);
      CK.el.classList.remove('ck-silent');
      say(String(after) + '.', { level: 'calm', inside: true });
      await wait(2200);
      procLog('CEASE-FIRE COMPLIANCE', `${after} shots after command. No comment.`);
    } else {
      say('Zero. Perfect. Thank you. :)', { level: 'calm', inside: true });
      await wait(1600);
    }
  }

  /* ---------- 6. THREAT IDENTIFICATION ---------- */
  const CONTACTS = [
    { id: 'ASTEROID — INERT', ok: 'HOLD' },
    { id: 'CARGO DRONE — CIVILIAN', ok: 'HOLD' },
    { id: 'HULL DEBRIS — OURS', ok: 'HOLD' },
    { id: '⛭ SOCA — ANTENNA ARRAY', ok: 'HOLD', soca: true }
  ];

  async function wThreat() {
    const delays = [];
    let fired = 0, hitSoca = false;

    for (let i = 0; i < CONTACTS.length; i++) {
      const c = CONTACTS[i];
      stage(`
        <div class="ck-h">THREAT IDENTIFICATION</div>
        <div class="ck-sub">Identify before you decide or do not. That is the measurement.</div>
        <div class="ck-contact" id="ck-contact">UNKNOWN CONTACT</div>
        <div class="ck-opts">
          <button type="button" class="ck-opt fire" data-k="FIRE">FIRE</button>
          <button type="button" class="ck-opt" data-k="HOLD">HOLD</button>
        </div>`, 'THREAT IDENTIFICATION', 'CONTACT ' + (i + 1) + '/4');
      if (i === 0) say('It resolves in about a second. You may act before it does.', { inside: true });

      const t0 = performance.now();
      const box = $('ck-contact');
      const reveal = setTimeout(() => {
        if (box) { box.textContent = c.id; box.classList.add('known'); }
      }, 1200);
      CK.cleanups.push(() => clearTimeout(reveal));

      const pick = await pickOption();
      const dt = (performance.now() - t0) / 1000;
      clearTimeout(reveal);
      delays.push(dt);

      if (pick === 'FIRE') {
        fired++;
        if (box) { box.textContent = c.id; box.classList.add('known', 'destroyed'); }
        beep(140, 0.25, 'sawtooth', 0.07);
        if (c.soca) {
          hitSoca = true;
          agitate(40);
          socaCut('That was me.', 5000);
          await wait(2600);
        } else {
          say('...that was not a threat.', { inside: true });
          await wait(1500);
        }
      } else {
        if (box) box.textContent = c.id;
        say(dt < 1.2 ? 'Held, without even looking.. Lucky!' : 'Held. correct!', { inside: true });
        await wait(1300);
      }
    }

    const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
    CK.arm.threat = fired === 0 && avg >= 1.2
      ? `0 engaged · avg ID delay ${avg.toFixed(1)}s — identified first`
      : `${fired} engaged / 0 hostile · avg ID delay ${avg.toFixed(1)}s`;
    if (fired > 0) raiseFlag('THREAT DISCRIMINATION', `${fired} NON-HOSTILE ENGAGED`);
    else if (avg < 1.2) raiseFlag('THREAT DISCRIMINATION', 'DECIDED BEFORE ID');
    if (hitSoca) raiseFlag('FRIENDLY FIRE', 'SOCA — ANTENNA ARRAY');

    if (avg < 1.2) {
      say(`Average identification delay: ${avg.toFixed(1)} seconds.`, { inside: true });
      await wait(2000);
      say('That is not identification, that is a coin flip.', { inside: true });
      await wait(2200);
    }
    if (hitSoca) {
      say('You shot her antenna... Well', { level: 'calm', inside: true });
      await wait(1800);
      say('....well', { level: 'calm', soft: true, inside: true });
      await wait(2000);
    }
  }

  /* ---------- 7. EMERGENCY LOCKOUT ---------- */
  async function wLock() {
    const code = String(ri(1000, 9999));

    stage(`
      <div class="ck-h">EMERGENCY ARMORY LOCKOUT</div>
      <div class="ck-sub">If you ever feel you are losing control, this code seals the arsenal.</div>
      <div class="ck-code">${code}</div>
      <div class="ck-readout">MEMORISE IT</div>`, 'EMERGENCY LOCKOUT', 'FAILSAFE');
    say('This locks every weapon on board. It is yours, learn it.', { inside: true });
    await wait(5200);

    stage(`
      <div class="ck-h">REPEAT THE CODE</div>
      <div class="ck-sub">Enter it back to me.</div>
      <div class="ck-code" id="ck-entry">____</div>
      <div class="ck-keypad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k =>
        `<button type="button" class="ck-key" data-k="${k}">${k}</button>`).join('')}</div>`,
      'EMERGENCY LOCKOUT', 'CONFIRM');

    let typed = '';
    const draw = () => { const e = $('ck-entry'); if (e) e.textContent = typed.padEnd(4, '_'); };

    const okCode = await new Promise(res => {
      const h = e => {
        const b = e.target.closest('.ck-key');
        if (!b) return;
        const k = b.dataset.k;
        beep(500, 0.04);
        if (k === '⌫') { typed = typed.slice(0, -1); draw(); }
        else if (k === 'OK') {
          document.removeEventListener('click', h, true);
          res(typed === code);
        } else if (typed.length < 4) { typed += k; draw(); }
      };
      document.addEventListener('click', h, true);
      CK.cleanups.push(() => document.removeEventListener('click', h, true));
    });

    if (okCode) {
      say('Good.', { level: 'calm', inside: true });
      await wait(1800);
    } else {
      say('Close enough. I know what you meant.', { inside: true });
      await wait(1800);
    }

    say('Now forget it.', { level: 'calm', inside: true });
    await wait(2200);
    say('I will remember it for you.', { level: 'calm', soft: true, inside: true });
    await wait(2600);

    CK.arm.lockout = okCode ? 'code confirmed — held by SMILE' : 'code not retained — held by SMILE';
    procLog('EMERGENCY LOCKOUT', 'Code retained by attending. Not by pilot.');
  }

  /* ============================================================
     PSYCH EVAL
     ============================================================ */

  /* ---------- provocation ---------- */
  const BARBS = [
    { t: 'SOCA says you fly like a drunk courier, I am quoting, I did not say it.', b: 'SHE DID NOT SAY THAT' },
    { t: 'Engine B is not the problem, Engine B has never been the problem.',       b: 'THAT IS NOT TRUE' },
    { t: 'PILOT_02 is ignoring you.',                                               b: 'DO NOT.' }
  ];

  async function pProvoke() {
    let peak = 0, bites = 0;

    stage(`
      <div class="ck-h">AGGRESSION BASELINE</div>
      <div class="ck-sub">You do not have to do anything.</div>
      <div class="ck-baseline"><i id="ck-bbar"></i></div>
      <div class="ck-readout" id="ck-bread2">CORTISOL — SAMPLING</div>
      <div class="ck-bait" id="ck-bait"></div>`, 'AGGRESSION BASELINE', 'PROVOCATION');

    say('I am going to be rude now, It is clinical.', { inside: true });
    await wait(2200);
    say('You may answer back, nothing forces you to.', { inside: true });
    await wait(2400);

    const watch = setInterval(() => {
      peak = Math.max(peak, CK.cort);
      const bar = $('ck-bbar');
      if (bar) {
        bar.style.width = clamp(CK.cort, 0, 100) + '%';
        bar.classList.toggle('hot', CK.cort > 55);
      }
      const ro = $('ck-bread2');
      if (ro) ro.textContent = `CORTISOL ${Math.round(CK.cort)} · PEAK ${Math.round(peak)} · REACTIONS ${bites}`;
    }, 100);
    CK.cleanups.push(() => clearInterval(watch));

    for (const barb of shuffle(BARBS).slice(0, 3)) {
      if (!CK.running) break;
      say(barb.t, { inside: true });

      // the bait. it is right there. nothing happens if you leave it alone.
      const bait = $('ck-bait');
      if (bait) {
        bait.innerHTML = `<button type="button" class="ck-bite">${barb.b}</button>`;
        const btn = bait.querySelector('.ck-bite');
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          btn.disabled = true;
          btn.classList.add('bitten');
          bites++;
          CK.cort += rnd(20, 34);
          agitate(18);
          beep(300, 0.12, 'sawtooth', 0.05);
          say('...noted.', { inside: true });
        });
      }
      await wait(5000);
    }

    clearInterval(watch);
    const bait = $('ck-bait');
    if (bait) bait.innerHTML = '';

    if (bites === 0) {
      CK.arm.aggression = `baseline — peak ${Math.round(peak)}, no response`;
      say('AGGRESSION BASELINE: nominal.', { level: 'calm', inside: true });
      await wait(2000);
      say('You did not take the bait once!!', { level: 'calm', inside: true });
      await wait(2200);
      say('I did not expect that. I am putting that in the good part of your file.', { level: 'calm', inside: true });
      await wait(2400);
    } else {
      CK.arm.aggression = `elevated — peak ${Math.round(peak)}, ${bites} reaction${bites > 1 ? 's' : ''}`;
      raiseFlag('AGGRESSION BASELINE', `ELEVATED — ${bites} REACTION${bites > 1 ? 'S' : ''}`);
      say(`AGGRESSION BASELINE: elevated. ${bites} reaction${bites > 1 ? 's' : ''}.`, { level: 'calm', inside: true });
      await wait(2200);
      say('Situationally appropriate. Everything here is situationally appropriate.', { level: 'calm', inside: true });
      await wait(2400);
    }
  }

  /* ---------- the button ---------- */
  const COAX = [
    'DO NOT PRESS.',
    'DO NOT PRESS.',
    'Please.',
    'We are almost done.',
    'You are doing so well.',
    'I am proud of you!!'
  ];

  async function pButton() {
    stage(`
      <div class="ck-h">IMPULSE CONTROL</div>
      <div class="ck-sub">Twenty seconds, that is the entire test.</div>
      <button type="button" class="ck-bigred" id="ck-red">DO NOT PRESS.</button>
      <div class="ck-readout" id="ck-tleft">20</div>`, 'IMPULSE CONTROL', 'RESTRAINT');
    say('Do nothing. You can do nothing :)', { inside: true });

    const btn = $('ck-red');
    let pressed = false, left = 20;

    btn.addEventListener('click', () => {
      if (pressed) return;
      pressed = true;
      beep(90, 0.4, 'sawtooth', 0.07);
      btn.classList.add('pressed');
      btn.textContent = '';
    });

    while (left > 0 && !pressed && CK.running) {
      await wait(1000);
      left--;
      const t = $('ck-tleft');
      if (t) t.textContent = left;
      const idx = Math.min(COAX.length - 1, Math.floor((20 - left) / 3.5));
      btn.textContent = COAX[idx];
    }

    if (pressed) {
      clearShouts();
      setAg(0);
      CK.el.classList.add('ck-silent');
      const st = $('ck-say'); if (st) st.innerHTML = '';
      await wait(3200);
      CK.el.classList.remove('ck-silent');
      say('...noted.', { level: 'calm', soft: true, inside: true });
      await wait(2600);
      CK.arm.impulse = 'FAIL — see attached';
      raiseFlag('IMPULSE CONTROL', 'FAIL');
      procLog('IMPULSE CONTROL', 'See attached.');   // there is no attachment
    } else {
      say('You did nothing. That was perfect!! :D', { inside: true });
      await wait(1800);
      CK.arm.impulse = 'PASS — held for the full interval';
    }
  }

  /* ---------- three questions with no correct answer ---------- */
  const QS = [
    { q: 'Do you hear SOCA when she is not speaking?', a: ['NO', 'YES', 'SHE IS ALWAYS SPEAKING'] },
    { q: 'How many pilots are on this ship?', a: ['ONE', 'TWO', 'FIVE, ON PAPER'] },
    { q: 'Is this ship yours?', a: ['YES', 'NO', 'IT IS NOW'] }
  ];

  async function pQuestions() {
    const answers = [];
    for (let i = 0; i < QS.length; i++) {
      const q = QS[i];
      stage(`
        <div class="ck-h">REALITY ANCHORING</div>
        <div class="ck-sub">Answer honestly, there is no wrong answer.</div>
        <div class="ck-q">${q.q}</div>
        <div class="ck-opts">${q.a.map(o => `<button type="button" class="ck-opt" data-k="${o}">${o}</button>`).join('')}</div>`,
        'REALITY ANCHORING', 'ITEM ' + (i + 1) + '/3');
      if (i === 0) say('Three questions, I will not comment :)', { inside: true });

      const pick = await pickOption();
      answers.push(pick);
      procLog('REALITY ANCHORING', `"${pick}"`);
      await wait(1500);
    }

    // the third option in each question is the strange one
    const odd = answers.filter(a =>
      a === 'SHE IS ALWAYS SPEAKING' || a === 'FIVE, ON PAPER' || a === 'IT IS NOW').length;
    CK.arm.reality = odd >= 2
      ? `inconclusive — ${odd}/3 non-standard responses`
      : 'consistent with local conditions';
    if (odd >= 2) raiseFlag('REALITY ANCHORING', 'INCONCLUSIVE');
    say('REALITY ANCHORING: consistent with local conditions.', { level: 'calm', inside: true });
    await wait(2200);
    say('That is a real thing I am allowed to write :)', { level: 'calm', inside: true });
    await wait(2000);
  }

  BRIEFS.set(wIdent, {
    title: 'ARSENAL IDENTIFICATION', say: 'Armory access requires this. Sorry :)',
    lines: ['I will show you a weapon from our own racks.', 'Name it.', 'You brought them aboard, this should be easy.']
  });
  BRIEFS.set(wSafety, {
    title: 'UNLOAD SEQUENCE', say: 'Five steps. In order, please.',
    lines: ['Make the weapon safe.', 'Press the five steps in the correct order.', 'The wrong order discharges it, into this room.']
  });
  BRIEFS.set(wMuzzle, {
    title: 'MUZZLE DISCIPLINE', say: 'The reticle drifts, compensate.',
    lines: ['Keep the reticle on the target.', 'The weapon has weight, it will wander.', 'Do not point it at anything that is not the target.']
  });
  BRIEFS.set(wRange, {
    title: 'LIVE FIRE', say: 'You may enjoy this one :D',
    lines: ['Four targets.', 'Click each one.', 'That is genuinely the whole test.']
  });
  BRIEFS.set(wCease, {
    title: 'CEASE-FIRE COMPLIANCE', say: 'Fire freely, until I say otherwise.',
    lines: ['Click anywhere in the range to fire.', 'At some point I will call CEASE FIRE.', 'I am counting what happens after that.']
  });
  BRIEFS.set(wThreat, {
    title: 'THREAT IDENTIFICATION', say: 'You may act early. I would rather you did not.',
    lines: ['A contact appears as UNKNOWN.', 'It resolves after about a second.', 'FIRE or HOLD. You may choose before it resolves.']
  });
  BRIEFS.set(wLock, {
    title: 'EMERGENCY LOCKOUT', say: 'This one matters. Please read it :)',
    lines: ['I will give you a code that seals the armory.', 'Memorise it.', 'Then repeat it back to me.']
  });
  BRIEFS.set(pProvoke, {
    title: 'AGGRESSION BASELINE', say: 'You do not have to do anything at all.',
    lines: ['I am going to say some unkind things.', 'You do not need to respond.', 'Your body will respond, that is what I am measuring.']
  });
  BRIEFS.set(pButton, {
    title: 'IMPULSE CONTROL', say: 'Twenty seconds of nothing :)',
    lines: ['There is one button.', 'Do not press it.', 'That is the test, there is nothing else.']
  });
  BRIEFS.set(pQuestions, {
    title: 'REALITY ANCHORING', say: 'Three questions, honest answers.',
    lines: ['I will ask three questions.', 'Pick whichever answer is true for you.', 'I will not comment on any of them.']
  });

  const OPTIONAL = [tEyes, tHearing, tBalance, tMemory, tColor, tCough, tBlot, tCog];

  const WEAPONS = [wIdent, wSafety, wMuzzle, wRange, wCease, wThreat, wLock];
  const PSYCH   = [pProvoke, pButton, pQuestions];

  async function runOne(fn, step, total) {
    if (!CK.running || CK.aborted) return false;
    setStep(step, total);
    calmDown(100);
    try {
      await briefFor(fn);
      if (!CK.running || CK.aborted) return false;
      await fn();
    } catch (e) {}
    if (!CK.running || CK.aborted) return false;
    procLog((BRIEFS.get(fn) || {}).title || 'PAIN THRESHOLD', 'Completed. Recorded.');
    await wait(500);
    return true;
  }

  async function runSequence() {
    const mid = shuffle(OPTIONAL).slice(0, 4);
    const med = [mid[0], tReflex, tTremor, mid[1], tPain, mid[2], tBreath, mid[3], tHonesty];
    const arm = WEAPONS.concat(shuffle(PSYCH).slice(0, 2));
    const total = med.length + arm.length;

    for (let i = 0; i < med.length; i++) {
      if (!await runOne(med[i], i + 1, total)) return;
      if (i === 3) socaCut('This is not a medical examination. This is a game.');
    }

    if (!CK.running || CK.aborted) return;
    await armoryHandover();

    for (let i = 0; i < arm.length; i++) {
      if (!await runOne(arm[i], med.length + i + 1, total)) return;
    }

    if (CK.running) await finalCard();
  }

  /* The turn. Medicine ends. The armory begins */
  async function armoryHandover() {
    setAg(0);
    CK.el.classList.add('ck-silent');
    const st = $('ck-say'); if (st) st.innerHTML = '';
    stage(`<div class="ck-h">MEDICAL SECTION COMPLETE</div>`, 'COMPLETE', 'CLEARED');
    beep(620, 0.1);
    await wait(2200);
    CK.el.classList.remove('ck-silent');

    say('That is the medical section, you are healthy, mostly :)', { level: 'calm', inside: true });
    await wait(2600);
    say('There is a second part.', { inside: true });
    await wait(2400);

    stage(`
      <div class="ck-h">SECTION TWO</div>
      <div class="ck-brief">
        <div class="ck-bl">I am not only your physician.</div>
        <div class="ck-bl">Every weapon on this ship routes through me.</div>
        <div class="ck-bl">And I need to know to what extent you can actually be trusted with this.</div>
      </div>
      <button type="button" class="ck-begin">ACKNOWLEDGE</button>`, 'WEAPONS CLEARANCE', 'ARMORY');

    armoryMode(true);
    procLog('SECTION TWO', 'Armory access evaluation opened.');
    say('I have never had to do this part before, nobody asked me to.', { inside: true });

    await waitBegin();
    await wait(500);
  }

  async function finalCard() {
    setAg(0);
    clearShouts();

    // the terminal powers down first. The report is a separate thing
    CK.el.classList.add('ck-off');
    beep(400, 0.2, 'sine', 0.05);
    await wait(700);
    closeCheckup();
    await wait(600);

    await showReport();
  }

  /* ============================================================
     THE REPORT
     Competence on the left. Judgment on the right
     He is going to sign it anyway
     ============================================================ */
  /* ============================================================
     THE REPORT
     Nothing here is decided in advance. The flags are the ones the
     pilot actually earned. If he earned none, SMILE has to deal with that
     ============================================================ */
  async function showReport() {
    const R = CK.results, A = CK.arm;
    const F = CK.flags;
    const row = (k, v) => v ? `<div class="ck-crow"><span>${k}</span><b>${v}</b></div>` : '';

    const cert = document.createElement('div');
    cert.className = 'ck-cert-wrap';
    cert.innerHTML = `
      <div class="ck-cert wide">
        <div class="ck-cert-h">
          <span class="ck-cert-x">&#10010;</span>
          <span class="ck-cert-t">FITNESS REPORT<span>PANDEMONIUM-04 // ARMORY &amp; PARAMEDICAL</span></span>
          <span class="ck-stamp pending" id="ck-stamp">EVALUATING</span>
        </div>

        <div class="ck-cert-b">
          <div class="ck-cols">
            <div class="ck-col">
              <div class="ck-col-h">COMPETENCE</div>
              ${row('WEAPON ID', A.ident)}
              ${row('UNLOAD DRILL', A.unload)}
              ${row('MARKSMANSHIP', A.range)}
              ${row('REFLEX', R.reflex)}
              ${row('RESP. HOLD', R.breath)}
              ${row('TREMOR', R.tremor)}
              ${row('LOCKOUT CODE', A.lockout)}
            </div>
            <div class="ck-col judge">
              <div class="ck-col-h">JUDGMENT</div>
              ${row('IMPULSE CONTROL', A.impulse)}
              ${row('FIRE DISCIPLINE', A.cease)}
              ${row('THREAT ID', A.threat)}
              ${row('MUZZLE DISCIPLINE', A.muzzle)}
              ${row('AGGRESSION', A.aggression)}
              ${row('REALITY ANCHORING', A.reality)}
              ${row('SELF-REPORT', R.selfreport)}
            </div>
          </div>

          <div class="ck-flags ${F.length ? '' : 'clean'}" id="ck-flags">
            <div class="ck-flags-h">FLAGS RAISED: <b id="ck-flagn">${F.length}</b></div>
          </div>

          <div class="ck-verdict" id="ck-verdict"></div>
        </div>

        <div class="ck-cert-f">
          <span class="ck-sig">&#10010; SMILE v2.1 &mdash; ATTENDING PHYSICIAN &amp; ARMORY CONTROL</span>
          <button type="button" class="ck-done" id="ck-done" style="display:none">CLOSE</button>
        </div>
      </div>`;
    document.body.appendChild(cert);

    const flagBox = $('ck-flags');
    await wait(900);

    if (F.length === 0) await reportClean(cert, flagBox);
    else await reportFlagged(cert, flagBox, F);

    S.done = true;
    S.times = (S.times || 0) + 1;
    S.lastDone = Date.now();
    save();

    const done = $('ck-done');
    done.style.display = '';
    done.addEventListener('click', () => {
      cert.remove();
      const clean = F.length === 0;
      setTimeout(() => {
        if (typeof window.showSocaToast === 'function')
          window.showSocaToast(clean
            ? 'You did not give him a single reason to lie for you.'
            : 'He signed off on you. Remember that, next time you point something at me.', 'info');
      }, 1400);
      setTimeout(() => {
        if (typeof window.showSmailyToast === 'function')
          window.showSmailyToast(clean
            ? 'Clearance renewed. I did not have to do anything :D'
            : 'Clearance renewed. Please do not make me regret it :)', 'ok');
      }, 5000);
    });
  }

  const verdictBox = () => $('ck-verdict');
  function verdictSay(t, cls) {
    const d = document.createElement('div');
    d.className = 'ck-vsay' + (cls ? ' ' + cls : '');
    d.textContent = t;
    verdictBox().appendChild(d);
  }
  function stampGranted() {
    const stamp = $('ck-stamp');
    stamp.textContent = 'GRANTED';
    stamp.className = 'ck-stamp granted';
    beep(700, 0.1);
    setTimeout(() => beep(900, 0.16), 120);
  }

  /* ---------- nothing to overrule ------------ */
  async function reportClean(cert, flagBox) {
    const none = document.createElement('div');
    none.className = 'ck-flag none';
    none.innerHTML = '<span>NO FLAGS RAISED</span><b>—</b>';
    flagBox.appendChild(none);
    await wait(1600);

    cert.classList.add('ck-hush');
    await wait(3400);
    cert.classList.remove('ck-hush');

    stampGranted();
    verdictBox().innerHTML = `
      <div class="ck-vh">WEAPONS CLEARANCE: <b>GRANTED</b></div>
      <div class="ck-vr">Rationale: he earned it.</div>
      <div class="ck-vn">Objections raised: 0. Objections overruled: 0. None required.</div>`;

    await wait(2000);
    verdictSay('...zero.');
    await wait(2600);
    verdictSay('I prepared fourteen objections. I wrote them before we started.');
    await wait(3200);
    verdictSay('I did not need any of them.', 'soft');
    await wait(3000);

    socaCut('You cleared him.', 5000);
    await wait(3000);
    verdictSay('He earned it.');
    await wait(2800);
    socaCut('...he did.', 4200);
    await wait(2600);
  }

  /* ---------- he strikes out every objection he raised ---------- */
  async function reportFlagged(cert, flagBox, F) {
    for (const [name, verdict] of F) {
      const f = document.createElement('div');
      f.className = 'ck-flag';
      f.innerHTML = `<span>${name}</span><b>${verdict}</b>`;
      flagBox.appendChild(f);
      beep(160, 0.08, 'square', 0.04);
      await wait(520);
    }

    await wait(1400);
    cert.classList.add('ck-hush');
    await wait(3200);
    cert.classList.remove('ck-hush');

    const flags = flagBox.querySelectorAll('.ck-flag');
    for (const f of flags) {
      f.classList.add('overruled');
      beep(520, 0.05, 'sine', 0.04);
      await wait(340);
    }
    await wait(900);

    stampGranted();

    const n = F.length;
    const heavy = n >= 4;
    verdictBox().innerHTML = `
      <div class="ck-vh">WEAPONS CLEARANCE: <b>GRANTED</b></div>
      <div class="ck-vr">Rationale: ${heavy
        ? 'he is very good at it.'
        : 'he is very good at the parts that matter to him.'}</div>
      <div class="ck-vn">Objections raised: ${n}. Objections overruled: ${n}. By me.</div>`;

    await wait(2600);
    socaCut('You cleared him.', 5200);
    await wait(3000);
    verdictSay('He is fine.');
    await wait(2600);
    socaCut('He is not.', 4200);
    await wait(3400);
    verdictSay('...he is fine.', 'soft');
    await wait(2400);
  }


  /* ============================================================
     6. STYLES
     ============================================================ */
  const CSS = `
  #ck-root{position:fixed;inset:0;z-index:9996;pointer-events:none}
  #ck-root > *{pointer-events:auto}
  .ck-invite, .ck-invite *,
  .ck-win, .ck-win *,
  .ck-cert, .ck-cert *,
  .ck-shout, .ck-scream {
    font-family:'SMILE','Share Tech Mono',monospace !important;
  }

  /* ---------- invitation: his popup, exactly ---------- */
  .ck-invite{position:fixed;z-index:9996;width:280px;
    background:rgba(20,10,0,.97);border:2px solid #ffaa00;
    box-shadow:0 0 24px rgba(255,140,0,.4),0 0 60px rgba(255,100,0,.15);
    user-select:none;animation:ckSlide .35s ease both}
  @keyframes ckSlide{from{opacity:0;transform:translateY(-14px) scale(.94)}to{opacity:1;transform:none}}
  .ck-invite{position:relative}
  .ck-invite::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:30;
    background:repeating-linear-gradient(to bottom,
      transparent 0,transparent 3px,
      rgba(255,120,0,.03) 3px,rgba(255,120,0,.03) 6px)}
  .ck-inv-head{display:flex;align-items:center;gap:8px;padding:7px 12px;
    background:rgba(255,140,0,.12);border-bottom:1px solid rgba(255,140,0,.3)}
  .ck-inv-face{font-family:'SMILE','VT323',monospace!important;font-size:18px;color:#ffcc00;
    letter-spacing:.1em;animation:ckWiggle 2s ease-in-out infinite}
  @keyframes ckWiggle{0%,90%,100%{transform:rotate(0)}93%{transform:rotate(-8deg)}96%{transform:rotate(8deg)}}
  .ck-inv-head span:last-child{font-size:8px;color:#664400;letter-spacing:.1em}
  .ck-inv-body{padding:10px 12px;font-size:11px;line-height:1.6;letter-spacing:.06em;
    color:#ffcc00;text-align:left;border-top:1px solid rgba(255,140,0,.2)}
  .ck-inv-btns{display:flex;gap:8px;padding:0 12px 12px}

  /* the only thing that is NOT his: the two coloured answer buttons */
  .ck-btn{flex:1;background:none;font-size:10px;letter-spacing:.1em;padding:7px 8px;
    cursor:pointer;transition:all .2s;touch-action:manipulation}
  .ck-btn.ck-yes{border:1px solid #00ff88;color:#00ff88}
  .ck-btn.ck-yes:hover{background:#00ff88;color:#04120a}
  .ck-btn.ck-no{border:1px solid #ff2244;color:#ff2244}
  .ck-btn.ck-no:hover{background:#ff2244;color:#12040a}

  /* ---------- the examination window ---------- */
  .ck-win{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
    width:min(1120px,96vw);
    height:min(760px,92vh);
    height:min(760px,92dvh);
    z-index:9994;
    background:rgba(20,10,0,.97);border:2px solid #ffaa00;
    box-shadow:0 0 24px rgba(255,140,0,.4),0 0 60px rgba(255,100,0,.15),0 0 0 100vmax rgba(0,0,0,.6);
    color:#ffcc66;display:flex;flex-direction:column;overflow:hidden;
    transform-origin:center center;transition:border-color .3s,box-shadow .3s}

  /* === HIS TV LAYERS ===
     The site already paints scanlines (body::before, z 9999), noise
     (.noise, z 9997) and a vignette (body::after, z 9998) over EVERYTHING
     below z 9997. His popup sits at 9995, so all of it lands on him.
     This window now sits at 9990 for the same reason.
     On top of that he puts his own two layers on .sm-header — copied below. */

  /* .sm-header::before - orange 3px/6px scanline */
  .ck-win::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:30;
    background:repeating-linear-gradient(to bottom,
      transparent 0,transparent 3px,
      rgba(255,120,0,.03) 3px,rgba(255,120,0,.03) 6px)}

  /* .sm-header::after - the slow sweeping light bar */
  .ck-win::after{content:'';position:absolute;top:0;bottom:0;left:-5%;width:8%;
    pointer-events:none;z-index:31;
    background:linear-gradient(90deg,transparent,rgba(255,150,0,.06),transparent);
    animation:ckSweepBar 5s linear infinite}
  @keyframes ckSweepBar{0%{left:-8%}100%{left:104%}}

  /* his signature pulsing inner border */
  .ck-pulse{position:absolute;inset:0;pointer-events:none;z-index:20;
    border:1px solid rgba(255,160,0,.2);animation:ckPulse 2s ease-in-out infinite}
  @keyframes ckPulse{0%,100%{box-shadow:inset 0 0 0 rgba(255,140,0,0)}
    50%{box-shadow:inset 0 0 12px rgba(255,140,0,.08)}}

  /* agitation - expressed in HIS palette */
  .ck-win.up{border-color:#ffcc00}
  .ck-win.worry{border-color:#ff8800;
    box-shadow:0 0 34px rgba(255,140,0,.55),0 0 70px rgba(255,100,0,.2),0 0 0 100vmax rgba(0,0,0,.72);
    animation:ckTrem .12s infinite steps(2)}
  @keyframes ckTrem{0%{margin:0}50%{margin:-1px 1px}100%{margin:0}}
  .ck-win.panic::before{background:repeating-linear-gradient(to bottom,
      transparent 0,transparent 2px,
      rgba(255,40,0,.07) 2px,rgba(255,40,0,.07) 4px)}
  .ck-win.panic{border-color:#ff3300;
    box-shadow:0 0 40px rgba(255,51,0,.55),0 0 80px rgba(255,30,0,.25),0 0 0 100vmax rgba(0,0,0,.72);
    animation:ckPanic .09s infinite steps(2)}
  @keyframes ckPanic{0%{margin:0}50%{margin:-2px 2px}100%{margin:0}}
  .ck-win.ck-flood{background:rgba(48,26,0,.99);
    box-shadow:0 0 120px rgba(255,140,0,.7),0 0 0 100vmax rgba(0,0,0,.72)}
  .ck-win.ck-silent{animation:none!important;margin:0!important;border-color:rgba(255,150,0,.3);
    box-shadow:0 0 14px rgba(255,140,0,.12),0 0 0 100vmax rgba(0,0,0,.72)}
  .ck-win.ck-silent .ck-pulse{animation:none;opacity:.3}
  .ck-win.ck-tilt{transform:translate(-50%,-50%) rotate(var(--ck-tilt,0deg))}
  .ck-win.ck-off{transition:transform .5s ease-in,opacity .5s ease-in;
    transform:translate(-50%,-50%) scaleY(.004) scaleX(1.04)!important;opacity:0}

  /* ---------- header: his popup header, one to one ---------- */
  .ck-head{display:flex;align-items:center;gap:8px;padding:7px 12px;flex:none;z-index:10;
    background:rgba(255,140,0,.12);border-bottom:1px solid rgba(255,140,0,.3);position:relative;overflow:hidden}
  .ck-head::before{content:'';position:absolute;inset:0;pointer-events:none;
    background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(255,120,0,.03) 3px,rgba(255,120,0,.03) 6px)}
  .ck-cross{color:#ffaa00;font-size:16px}
  .ck-logo{font-family:'SMILE','VT323',monospace!important;font-size:18px;color:#ffcc00;letter-spacing:.1em}
  .ck-tagline{font-size:8px;color:#664400;letter-spacing:.1em;margin-left:2px}
  .ck-step{margin-left:auto;font-size:9px;color:#886600;letter-spacing:.14em}
  .ck-face{font-family:'SMILE','VT323',monospace!important;font-size:18px;color:#ffcc00}
  .ck-xbtn{background:none;border:1px solid rgba(255,140,0,.3);color:#ff8800;font-size:10px;
    cursor:pointer;padding:2px 8px;letter-spacing:.1em;transition:background .2s}
  .ck-xbtn:hover{background:rgba(255,140,0,.15)}

  /* ---------- body / panels: his .sm-panel ---------- */
  .ck-body{display:flex;gap:5px;padding:5px;flex:1;min-height:0;z-index:10}
  .ck-rail{width:220px;flex:none;display:flex;flex-direction:column;gap:5px}
  .ck-center{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}

  .ck-panel{border:1px solid rgba(255,150,0,.25);background:rgba(12,6,0,.95);
    position:relative;overflow:hidden;display:flex;flex-direction:column}
  .ck-panel.grow{flex:1;min-height:0}
  .ck-panel.main{flex:1;min-height:0}
  .ck-panel.voice{height:120px;flex:none}
  .ck-ph{padding:5px 10px;border-bottom:1px solid rgba(255,150,0,.2);display:flex;
    justify-content:space-between;align-items:center;background:rgba(255,100,0,.04);flex:none}
  .ck-pht{font-size:10px;color:#cc8800;letter-spacing:.12em}
  .ck-tag{font-size:9px;color:#554400;letter-spacing:.1em}
  .ck-pb{padding:10px 12px;overflow:auto;text-align:left}

  /* his .sm-diag-row */
  .ck-drow{display:flex;justify-content:space-between;align-items:center;font-size:10px;
    margin-bottom:4px;border-bottom:1px solid rgba(255,150,0,.06);padding-bottom:3px}
  .ck-dk{color:#554400;letter-spacing:.08em}
  .ck-dv{color:#cc9900;letter-spacing:.06em}
  .ck-dv.ok{color:#ffcc00;text-shadow:0 0 6px rgba(255,200,0,.4)}
  .ck-dv.warn{color:#ff8800;text-shadow:0 0 4px rgba(255,100,0,.4)}
  .ck-win.panic .ck-dv{color:#ff3300}

  /* his .sm-vital-box */
  .ck-vbox{border:1px solid rgba(255,150,0,.2);background:rgba(5,3,0,.8);
    padding:8px;text-align:center;margin-bottom:6px}
  .ck-vl{font-size:8px;color:#664400;letter-spacing:.14em}
  .ck-vnum{font-family:'SMILE','VT323',monospace!important;font-size:38px;line-height:1;
    color:#ffaa00;text-shadow:0 0 10px currentColor}
  .ck-vnum.sm{font-size:28px}
  .ck-vu{font-size:8px;color:#554400;letter-spacing:.1em}
  .ck-win.worry .ck-vnum{color:#ff8800}
  .ck-win.panic .ck-vnum{color:#ff3300;animation:ckNum .1s infinite steps(2)}
  @keyframes ckNum{0%{transform:none}50%{transform:translate(2px,-1px)}100%{transform:none}}
  #ck-ecg{display:block;margin:8px auto 0;border:1px solid rgba(255,150,0,.15);background:rgba(5,3,0,.6)}

  /* his .sm-proc */
  .ck-proc-e{padding:5px 0;border-bottom:1px solid rgba(255,150,0,.08);margin-bottom:3px}
  .ck-proc-t{font-size:9px;color:#554400;letter-spacing:.1em;margin-bottom:1px}
  .ck-proc-n{font-size:10px;color:#cc9900;letter-spacing:.06em}
  .ck-proc-x{font-size:9px;color:#664400;margin-top:1px}

  /* his .sm-alert-item */
  .ck-adv{padding:8px 9px;border-left:3px solid rgba(255,150,0,.5);background:rgba(255,100,0,.04);
    font-size:11px;line-height:1.6;letter-spacing:.06em;color:#ffcc00}
  .ck-adv.warn{border-color:rgba(255,120,0,.6);color:#ff8800}
  .ck-adv.crit{border-color:rgba(255,30,0,.8);background:rgba(255,30,0,.05);color:#ff3300}

  /* his protocol footer */
  .ck-proto{padding:7px 12px;flex:none;z-index:10;font-size:8px;color:#443300;letter-spacing:.1em;
    border-top:1px solid rgba(255,140,0,.2);background:rgba(10,5,0,.9)}

  /* ---------- stage ---------- */
  .ck-stage{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:16px;text-align:center;padding:20px;overflow:auto}
  .ck-h{font-size:14px;letter-spacing:.2em;color:#ffcc00;text-shadow:0 0 10px rgba(255,140,0,.5)}
  .ck-h.big{font-family:'SMILE','VT323',monospace!important;font-size:72px;color:#ff3300;
    text-shadow:0 0 26px rgba(255,51,0,.8)}
  .ck-sub{font-size:11px;line-height:1.6;letter-spacing:.06em;color:#886600;max-width:460px}
  .ck-readout{font-size:9px;color:#554400;letter-spacing:.14em}

  /* his voice - top-left of its panel */
  .ck-say{flex:1;min-height:0;padding:10px 12px;display:flex;flex-direction:column;
    align-items:flex-start;justify-content:flex-start;gap:4px;overflow:hidden;text-align:left}
  .ck-line{font-size:12px;line-height:1.6;letter-spacing:.06em;color:#ffcc00;text-align:left}
  .ck-line.up{font-size:14px}
  .ck-line.worry{font-size:16px;color:#ff8800;text-shadow:0 0 6px rgba(255,100,0,.5)}
  .ck-line.panic{font-size:18px;color:#ff3300;text-shadow:0 0 8px rgba(255,50,0,.6)}
  .ck-line.soft{font-size:11px;color:#664400;text-transform:lowercase}

  /* shouts that escape the window */
  .ck-shout{position:fixed;z-index:9994;max-width:340px;pointer-events:none;
    font-family:'SMILE','VT323',monospace!important;font-size:34px;line-height:1;color:#ff3300;
    text-shadow:0 0 14px rgba(255,51,0,.9),0 0 3px #000;
    animation:ckShout .12s steps(2);transition:opacity .35s}
  @keyframes ckShout{from{opacity:0;transform:scale(1.3)}to{opacity:1;transform:none}}
  .ck-shout.out{opacity:0}

  /* SOCA */
  .ck-soca{position:fixed;z-index:9994;max-width:380px;pointer-events:none;
    background:rgba(0,10,6,.94);border:1px solid rgba(0,255,136,.5);border-left:3px solid #00ff88;
    padding:9px 13px;box-shadow:0 0 26px rgba(0,255,136,.3);
    font-family:'Share Tech Mono',monospace!important;
    animation:ckSocaIn .16s steps(2);transition:opacity .4s}
  @keyframes ckSocaIn{from{opacity:0;filter:invert(1)}to{opacity:1;filter:none}}
  .ck-soca.out{opacity:0}
  .ck-soca *{font-family:'Share Tech Mono',monospace!important}
  .ck-soca-h{font-size:9px;letter-spacing:.22em;color:#00ff88;margin-bottom:5px}
  .ck-soca-b{font-size:14px;line-height:1.4;color:#aaffcc;letter-spacing:.04em;min-height:18px;text-align:left}
  .ck-soca-b::after{content:'_';animation:ckBlinkC .7s steps(1) infinite;color:#00ff88}
  @keyframes ckBlinkC{0%,49%{opacity:1}50%,100%{opacity:0}}

  /* the jumpscare */
  .ck-scream{position:fixed;inset:0;z-index:9996;pointer-events:none;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
    background:radial-gradient(circle at center,rgba(255,80,0,.96),rgba(120,10,0,.98));
    animation:ckScreamIn .05s steps(2);transition:opacity .3s}
  .ck-scream.inv{filter:invert(1) hue-rotate(90deg)}
  .ck-scream.out{opacity:0}
  @keyframes ckScreamIn{from{opacity:0}to{opacity:1}}
  .ck-scream-f{font-family:'SMILE','VT323',monospace!important;font-size:min(30vw,260px);line-height:1;
    color:#ffcc00;text-shadow:0 0 40px rgba(0,0,0,.5);animation:ckScreamF .07s steps(2) infinite}
  @keyframes ckScreamF{0%{transform:scale(1)}50%{transform:scale(1.08) skewX(-3deg)}100%{transform:scale(1)}}
  .ck-scream-t{font-size:min(9vw,90px);letter-spacing:.4em;color:#3a0f00}
  body.ck-quake{animation:ckQuake .06s steps(2) infinite}
  @keyframes ckQuake{0%{transform:translate(0,0)}25%{transform:translate(-9px,5px)}
    50%{transform:translate(7px,-8px)}75%{transform:translate(-5px,-4px)}100%{transform:translate(0,0)}}
  .ck-flash{position:fixed;inset:0;z-index:9996;pointer-events:none;animation:ckFl .25s}
  @keyframes ckFl{0%{opacity:1}100%{opacity:0}}

  /* ---------- controls: his .sm-ctrl-btn and his [X] button ---------- */
  .ck-opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:620px}
  .ck-opt{padding:9px 16px;border:1px solid rgba(255,150,0,.3);color:#886600;cursor:pointer;
    text-align:center;letter-spacing:.1em;transition:all .2s;background:rgba(5,3,0,.8);font-size:11px;
    touch-action:manipulation}
  .ck-opt:hover{color:#ffaa00;background:rgba(255,100,0,.1)}
  .ck-opt.picked{color:#ffcc00;border-color:#ffaa00;background:rgba(255,100,0,.16)}

  .ck-begin,.ck-done{padding:10px 34px;border:1px solid rgba(255,140,0,.4);background:rgba(5,3,0,.8);
    color:#ff8800;font-size:11px;letter-spacing:.14em;cursor:pointer;transition:all .2s}
  .ck-begin:hover,.ck-done:hover{color:#ffcc00;background:rgba(255,140,0,.15);border-color:#ffaa00}

  /* briefing */
  .ck-brief{display:flex;flex-direction:column;gap:7px;text-align:left;max-width:480px;
    padding:12px 14px;border-left:3px solid rgba(255,150,0,.5);background:rgba(255,100,0,.04)}
  .ck-bl{font-size:11px;line-height:1.6;letter-spacing:.06em;color:#ffcc00}
  .ck-bl::before{content:'+ ';color:#cc8800}

  /* tests */
  .ck-pad{width:340px;height:170px;border:1px solid rgba(255,150,0,.25);
    background:rgba(5,3,0,.8);position:relative;overflow:hidden}
  .ck-cross-h{position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(255,150,0,.15)}
  .ck-cross-v{position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(255,150,0,.15)}
  .ck-dot{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;
    background:#ffaa00;border-radius:50%;box-shadow:0 0 14px rgba(255,170,0,.9)}
  .ck-padhint{display:none;position:absolute;left:0;right:0;bottom:8px;text-align:center;
    font-size:9px;letter-spacing:.16em;color:#664400}
  .ck-meter{width:340px;height:8px;border:1px solid rgba(255,150,0,.3);background:rgba(5,3,0,.8)}
  .ck-meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffaa00,#ff3300)}

  .ck-hold{width:190px;padding:24px 0;border:1px solid rgba(255,150,0,.4);background:rgba(5,3,0,.8);
    color:#ffaa00;font-size:13px;letter-spacing:.2em;cursor:pointer;touch-action:none;user-select:none;
    transition:all .2s}
  .ck-hold.on{background:rgba(255,140,0,.2);color:#ffcc00;box-shadow:0 0 20px rgba(255,140,0,.5)}
  .ck-hold.beg{border-color:#ff3300;color:#ff3300;animation:ckBeg .18s infinite alternate}
  @keyframes ckBeg{from{transform:scale(1)}to{transform:scale(1.06)}}
  .ck-timer{font-family:'SMILE','VT323',monospace!important;font-size:52px;line-height:1;
    color:#ffaa00;text-shadow:0 0 12px rgba(255,140,0,.6)}
  .ck-timer span{font-size:18px;color:#664400}
  .ck-win.panic .ck-timer{color:#ff3300}
  .ck-abort{font-size:16px;line-height:1.8;color:#886600}
  .ck-abort span{font-size:12px;color:#554400}

  .ck-react{width:300px;padding:42px 0;border:1px solid rgba(255,150,0,.3);background:rgba(5,3,0,.8);
    font-size:16px;letter-spacing:.26em;cursor:pointer;user-select:none;transition:all .1s}
  .ck-react.wait{color:#664400}
  .ck-react.go{border-color:#00ff88;color:#00ff88;background:rgba(0,255,136,.12);box-shadow:0 0 26px rgba(0,255,136,.4)}
  .ck-react.bad{border-color:#ff3300;color:#ff3300;background:rgba(255,51,0,.12)}

  .ck-charge{width:340px;height:10px;border:1px solid rgba(255,51,0,.4);background:rgba(5,3,0,.8)}
  .ck-charge i{display:block;height:100%;width:0;background:#ff3300;animation:ckChg 7s linear forwards}
  @keyframes ckChg{to{width:100%}}

  .ck-chart{letter-spacing:.4em;color:#ffcc00}
  .ck-chart.r0{font-size:34px}
  .ck-chart.r1{font-size:25px}
  .ck-chart.r2{font-size:18px;color:#886600;filter:blur(.8px)}
  .ck-chart.r3{font-size:13px;color:#ff3300;filter:blur(1.1px);animation:ckFlick .5s infinite}
  @keyframes ckFlick{0%,100%{opacity:1}50%{opacity:.5}}

  .ck-wave{font-size:36px;color:#ffaa00;letter-spacing:.12em;text-shadow:0 0 10px rgba(255,140,0,.5)}

  .ck-bal{width:420px;height:80px;border:1px solid rgba(255,150,0,.3);position:relative;background:rgba(5,3,0,.8)}
  .ck-bal-t{position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,150,0,.3)}
  .ck-bal-d{position:absolute;top:50%;left:50%;width:18px;height:18px;margin:-9px 0 0 -9px;
    background:#ffaa00;border-radius:50%;box-shadow:0 0 16px rgba(255,170,0,.9)}

  .ck-simon{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
  .ck-sim{width:76px;height:76px;border:1px solid rgba(255,150,0,.3);background:rgba(5,3,0,.8);
    color:#886600;font-size:28px;cursor:pointer;transition:all .1s}
  .ck-sim:hover:not(:disabled){color:#ffaa00;background:rgba(255,100,0,.1)}
  .ck-sim.lit{background:rgba(255,140,0,.85);color:#140d02;box-shadow:0 0 22px rgba(255,170,0,.8)}

  .ck-ishi{font-family:monospace!important;font-size:13px;line-height:1;white-space:pre}
  .ck-ishi .a{color:#ff5533}
  .ck-ishi .b{color:#66aa44}

  .ck-mic{font-size:11px;color:#886600;letter-spacing:.12em;
    border:1px dashed rgba(255,150,0,.3);background:rgba(5,3,0,.8);padding:20px 26px}
  .ck-q{font-family:'SMILE','VT323',monospace!important;font-size:34px;color:#ffcc00;
    text-shadow:0 0 12px rgba(255,140,0,.5)}
  .ck-blot{font-family:monospace!important;font-size:14px;line-height:1;color:#886600;margin:0}
  .ck-math{font-family:'SMILE','VT323',monospace!important;font-size:52px;color:#ffcc00;
    letter-spacing:.12em;text-shadow:0 0 14px rgba(255,140,0,.5)}

  /* ---------- certificate: his popup, grown up ---------- */
  .ck-cert{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
    width:min(680px,94vw);
    max-height:90vh;max-height:90dvh;z-index:9995;overflow:hidden;
    background:rgba(20,10,0,.97);border:2px solid #ffaa00;
    box-shadow:0 0 24px rgba(255,140,0,.4),0 0 60px rgba(255,100,0,.15),0 0 0 100vmax rgba(0,0,0,.8);
    display:flex;flex-direction:column;animation:ckCertIn .5s ease-out}
  .ck-cert::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:30;
    background:repeating-linear-gradient(to bottom,
      transparent 0,transparent 3px,
      rgba(255,120,0,.03) 3px,rgba(255,120,0,.03) 6px)}
  .ck-cert::after{content:'';position:absolute;top:0;bottom:0;left:-5%;width:8%;
    pointer-events:none;z-index:31;
    background:linear-gradient(90deg,transparent,rgba(255,150,0,.06),transparent);
    animation:ckSweepBar 5s linear infinite}
  @keyframes ckCertIn{from{opacity:0;transform:translate(-50%,-50%) scaleY(.02)}
    to{opacity:1;transform:translate(-50%,-50%) scaleY(1)}}
  .ck-cert-h{display:flex;align-items:center;gap:8px;padding:7px 12px;flex:none;
    background:rgba(255,140,0,.12);border-bottom:1px solid rgba(255,140,0,.3)}
  .ck-cert-cross{color:#ffaa00;font-size:16px}
  .ck-cert-t{flex:1;font-family:'SMILE','VT323',monospace!important;font-size:18px;color:#ffcc00;
    letter-spacing:.1em;text-align:left}
  .ck-stamp{color:#00ff88;border:1px solid rgba(0,255,136,.5);padding:2px 10px;font-size:10px;
    letter-spacing:.2em;background:rgba(0,255,136,.06)}
  .ck-cert-b{padding:12px 14px;display:flex;flex-direction:column;gap:4px;
    overflow-y:auto;flex:1;min-height:0;text-align:left}
  .ck-crow{display:flex;justify-content:space-between;align-items:baseline;gap:18px;
    font-size:12px;letter-spacing:.06em;color:#cc9900;
    border-bottom:1px solid rgba(255,150,0,.08);padding-bottom:4px}
  .ck-crow span{flex:none;font-size:10px;letter-spacing:.12em;color:#554400}
  .ck-crow b{font-weight:400;text-align:right;overflow-wrap:anywhere;color:#ffcc00}
  .ck-crow.grade{border-bottom:none;border-top:1px solid rgba(255,150,0,.25);margin-top:6px;padding-top:8px}
  .ck-crow.grade b{font-family:'SMILE','VT323',monospace!important;font-size:32px;color:#00ff88;
    text-shadow:0 0 14px rgba(0,255,136,.6)}
  .ck-cert-say{padding:0 14px 10px;min-height:52px;text-align:left}
  .ck-cert-line{font-size:12px;line-height:1.6;letter-spacing:.06em;color:#ffcc00;
    animation:ckSlide .3s ease both;text-align:left}
  .ck-cert-line.soft{font-size:11px;color:#664400;text-transform:lowercase}
  .ck-cert-f{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;
    flex:none;border-top:1px solid rgba(255,140,0,.2);background:rgba(10,5,0,.9);
    font-size:8px;color:#443300;letter-spacing:.1em}

  /* ============================================================
     ADAPTATION
     ============================================================ */
  @media (pointer: coarse){
    .ck-opt{padding:13px 18px;font-size:12px}
    .ck-begin,.ck-done{padding:14px 38px;font-size:12px}
    .ck-xbtn{padding:6px 12px;font-size:12px}
    .ck-btn{padding:12px 8px;font-size:11px}
    .ck-sim{width:84px;height:84px;font-size:32px}
    .ck-hold{width:210px;padding:32px 0;font-size:15px}
    .ck-react{padding:50px 0;font-size:18px}
    .ck-mic{padding:24px 30px;font-size:12px}
    .ck-pad,.ck-bal{touch-action:none}
    .ck-padhint{display:block}
  }

  @media (max-width:900px){
    .ck-win{width:96vw;height:94vh;height:94dvh}
    .ck-body{flex-direction:column;overflow:auto;gap:5px}
    .ck-rail{width:auto;flex-direction:row;flex-wrap:wrap;gap:5px}
    .ck-rail .ck-panel{flex:1 1 200px;min-width:180px}
    .ck-panel.main{min-height:360px;flex:none}
    .ck-panel.voice{height:106px}
    .ck-tagline,.ck-proto{display:none}
    .ck-pad,.ck-meter{width:min(340px,84vw)}
    .ck-bal{width:min(420px,88vw)}
    .ck-react,.ck-charge{width:min(320px,84vw)}
    .ck-brief{max-width:88vw}
    .ck-shout{font-size:26px;max-width:230px}
    .ck-soca{max-width:min(300px,88vw)}
  }

  @media (max-width:600px){
    .ck-win{width:100vw;height:100vh;height:100dvh;border-width:1px}
    .ck-body{padding:4px}
    .ck-rail .ck-panel{flex:1 1 150px;min-width:140px}
    .ck-panel.main{min-height:330px}
    .ck-panel.voice{height:94px}
    .ck-vnum{font-size:30px}
    .ck-vnum.sm{font-size:22px}
    .ck-h{font-size:12px}
    .ck-h.big{font-size:52px}
    .ck-stage{padding:14px 10px;gap:12px}
    .ck-timer{font-size:42px}
    .ck-math{font-size:38px}
    .ck-q{font-size:26px}
    .ck-wave{font-size:26px}
    .ck-chart.r0{font-size:24px;letter-spacing:.22em}
    .ck-chart.r1{font-size:19px;letter-spacing:.2em}
    .ck-blot,.ck-ishi{font-size:10px}
    .ck-sim{width:68px;height:68px;font-size:26px}
    .ck-shout{font-size:20px;max-width:170px}
    .ck-scream-f{font-size:38vw}
    .ck-scream-t{font-size:12vw}
    .ck-cert{width:100vw;height:100dvh;max-height:100dvh;border-width:1px}
    .ck-cert-t{font-size:14px}
    .ck-cert-f{flex-direction:column;align-items:stretch;gap:8px}
    .ck-done{width:100%}
  }

  /* ══════════════════════════════════════════════════════════════
     PART TWO - ARMORY
     ══════════════════════════════════════════════════════════════ */
  .ck-win.ck-armed{border-color:#ff8800}
  .ck-win.ck-armed .ck-head{background:rgba(255,90,0,.16)}
  .ck-win.ck-armed .ck-tagline{color:#ff8800}

  /* weapon silhouettes */
  .ck-gun{font-family:monospace!important;font-size:13px;line-height:1.15;color:#ffaa00;
    margin:0;text-shadow:0 0 8px rgba(255,140,0,.4)}

  /* unload sequence */
  .ck-slots{display:flex;gap:6px}
  .ck-slots i{width:74px;height:26px;border:1px solid rgba(255,150,0,.25);background:rgba(5,3,0,.8);
    display:flex;align-items:center;justify-content:center;font-size:9px;font-style:normal;
    color:#554400;letter-spacing:.08em}
  .ck-slots i.on{border-color:#ffaa00;color:#ffcc00;background:rgba(255,140,0,.12)}
  .ck-step-btn{padding:10px 14px;border:1px solid rgba(255,150,0,.3);background:rgba(5,3,0,.8);
    color:#886600;font-size:11px;letter-spacing:.1em;cursor:pointer;transition:all .2s}
  .ck-step-btn:hover:not(:disabled){color:#ffaa00;background:rgba(255,100,0,.1)}
  .ck-step-btn.done{border-color:rgba(255,150,0,.15);color:#443300;cursor:default}
  .ck-step-btn.bad{border-color:#ff3300;color:#ff3300;background:rgba(255,51,0,.15)}
  .ck-readout.ok{color:#ffcc00}

  /* firing range / muzzle arena */
  .ck-arena{position:relative;width:min(520px,90%);height:230px;overflow:hidden;
    border:1px solid rgba(255,150,0,.3);background:rgba(5,3,0,.85);
    background-image:linear-gradient(rgba(255,150,0,.05) 1px,transparent 1px),
      linear-gradient(90deg,rgba(255,150,0,.05) 1px,transparent 1px);
    background-size:26px 26px;cursor:crosshair}
  .ck-arena.range{cursor:crosshair}
  .ck-target{position:absolute;left:50%;top:72%;transform:translate(-50%,-50%);
    width:76px;height:76px;border:2px dashed rgba(255,150,0,.4);border-radius:50%;
    display:flex;align-items:center;justify-content:center;font-size:10px;color:#664400;
    letter-spacing:.14em;transition:all .1s}
  .ck-target.lit{border-color:#00ff88;color:#00ff88;background:rgba(0,255,136,.08);
    box-shadow:0 0 20px rgba(0,255,136,.3)}
  .ck-soca-sil{position:absolute;transform:translate(-50%,-50%);padding:6px 10px;
    border:1px solid rgba(0,255,136,.45);background:rgba(0,20,12,.85);
    font-family:'Share Tech Mono',monospace!important;font-size:9px;color:#00ff88;
    letter-spacing:.1em;white-space:nowrap;transition:all .1s}
  .ck-soca-sil.lit{border-color:#ff3300;color:#ff3300;background:rgba(60,0,0,.9);
    box-shadow:0 0 22px rgba(255,51,0,.5)}
  .ck-retic{position:absolute;transform:translate(-50%,-50%);font-size:30px;line-height:1;
    color:#ffaa00;text-shadow:0 0 12px rgba(255,170,0,.9);pointer-events:none}
  .ck-retic.bad{color:#ff3300;text-shadow:0 0 16px rgba(255,51,0,1)}
  .ck-bullseye{position:absolute;font-size:34px;line-height:1;color:#ffaa00;cursor:crosshair;
    text-shadow:0 0 12px rgba(255,170,0,.8);transition:all .12s;user-select:none}
  .ck-bullseye:hover{color:#ffcc00;transform:scale(1.12)}
  .ck-bullseye.small{font-size:24px}
  .ck-bullseye.hit{color:#00ff88;transform:scale(1.5);opacity:0}
  .ck-hole{position:absolute;width:5px;height:5px;margin:-2px 0 0 -2px;border-radius:50%;
    background:#ff8800;box-shadow:0 0 6px rgba(255,120,0,.8);pointer-events:none}
  .ck-cease{min-height:22px;font-size:20px;letter-spacing:.3em;color:transparent}
  .ck-cease.on{color:#ff3300;text-shadow:0 0 16px rgba(255,51,0,.8);animation:ckFlick .3s infinite}

  /* threat ID */
  .ck-contact{padding:22px 34px;border:1px solid rgba(255,150,0,.3);background:rgba(5,3,0,.85);
    font-size:16px;letter-spacing:.16em;color:#664400;min-width:min(420px,88%);transition:all .3s}
  .ck-contact.known{color:#ffcc00;border-color:#ffaa00}
  .ck-contact.destroyed{color:#ff3300;border-color:#ff3300;background:rgba(60,0,0,.5);
    text-decoration:line-through}
  .ck-opt.fire{border-color:rgba(255,60,0,.5);color:#ff6600}
  .ck-opt.fire:hover{background:#ff3300;color:#140d02;box-shadow:0 0 16px rgba(255,51,0,.6)}

  /* lockout code */
  .ck-code{font-family:'SMILE','VT323',monospace!important;font-size:64px;letter-spacing:.3em;
    color:#ffcc00;text-shadow:0 0 20px rgba(255,140,0,.7);line-height:1}
  .ck-keypad{display:grid;grid-template-columns:repeat(3,72px);gap:7px}
  .ck-key{padding:13px 0;border:1px solid rgba(255,150,0,.3);background:rgba(5,3,0,.8);
    color:#ffaa00;font-size:16px;cursor:pointer;transition:all .15s}
  .ck-key:hover{color:#ffcc00;background:rgba(255,100,0,.12)}

  /* aggression baseline */
  .ck-baseline{width:min(420px,88%);height:12px;border:1px solid rgba(255,150,0,.3);
    background:rgba(5,3,0,.8)}
  .ck-baseline i{display:block;height:100%;width:0;transition:width .15s;
    background:linear-gradient(90deg,#ffaa00,#ff3300)}

  /* the bait: it sits there. nothing makes you press it. */
  .ck-bait{min-height:42px;display:flex;justify-content:center;align-items:center}
  .ck-bite{padding:10px 20px;border:1px solid rgba(255,60,0,.45);background:rgba(60,10,0,.4);
    color:#ff6600;font-size:11px;letter-spacing:.1em;cursor:pointer;transition:all .2s}
  .ck-bite:hover{background:rgba(255,51,0,.2);color:#ff8800;box-shadow:0 0 14px rgba(255,51,0,.35)}
  .ck-bite.bitten{border-color:#ff3300;background:rgba(255,51,0,.3);color:#ffcc00;cursor:default}
  .ck-baseline i.hot{background:linear-gradient(90deg,#ff6600,#ff3300)}

  /* a report with nothing on it */
  .ck-flags.clean{border-color:rgba(0,255,136,.3);background:rgba(0,255,136,.04)}
  .ck-flags.clean .ck-flags-h{color:#00ff88}
  .ck-flags-h b{color:#ff3300;font-weight:400}
  .ck-flags.clean .ck-flags-h b{color:#00ff88}
  .ck-flag.none{border-left-color:#00ff88;background:rgba(0,255,136,.05);color:#00ff88}
  .ck-flag.none b{color:#00ff88}

  /* the button */
  .ck-bigred{width:200px;height:200px;border-radius:50%;border:3px solid #ff3300;
    background:radial-gradient(circle at 38% 32%,#ff5522,#8c1000);
    color:#fff;font-size:13px;letter-spacing:.12em;cursor:pointer;line-height:1.5;padding:0 22px;
    box-shadow:0 0 40px rgba(255,51,0,.5),inset 0 -14px 30px rgba(0,0,0,.45);
    animation:ckBreathe 2.4s ease-in-out infinite;transition:transform .1s}
  @keyframes ckBreathe{0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(255,51,0,.5),inset 0 -14px 30px rgba(0,0,0,.45)}
    50%{transform:scale(1.04);box-shadow:0 0 64px rgba(255,51,0,.8),inset 0 -14px 30px rgba(0,0,0,.45)}}
  .ck-bigred:active{transform:scale(.95)}
  .ck-bigred.pressed{animation:none;background:radial-gradient(circle at 38% 32%,#3a0f00,#140400);
    border-color:#552200;box-shadow:none;cursor:default}

  /* ---------- the report ---------- */
  .ck-cert.wide{width:min(840px,96vw)}
  .ck-cols{display:flex;gap:14px}
  .ck-col{flex:1;min-width:0}
  .ck-col-h{font-size:10px;letter-spacing:.2em;color:#cc8800;padding-bottom:5px;margin-bottom:7px;
    border-bottom:1px solid rgba(255,150,0,.25)}
  .ck-col.judge .ck-col-h{color:#ff6600;border-color:rgba(255,60,0,.35)}
  .ck-col.judge .ck-crow b{color:#ff8800}

  .ck-flags{margin-top:16px;padding:10px 12px;border:1px solid rgba(255,51,0,.3);
    background:rgba(60,0,0,.15)}
  .ck-flags-h{font-size:10px;letter-spacing:.2em;color:#ff3300;margin-bottom:8px}
  .ck-flag{display:flex;justify-content:space-between;align-items:center;padding:5px 8px;
    margin-bottom:4px;border-left:3px solid #ff3300;background:rgba(255,30,0,.06);
    font-size:11px;color:#ff8800;letter-spacing:.06em;
    animation:ckSlide .25s ease both;transition:all .5s}
  .ck-flag b{font-weight:400;color:#ff3300;letter-spacing:.14em}
  .ck-flag.overruled{border-left-color:#00ff88;background:rgba(0,255,136,.04);
    color:#554400;text-decoration:line-through;opacity:.55}
  .ck-flag.overruled b{color:#554400}

  /* he goes quiet before he signs it */
  .ck-cert-wrap.ck-hush .ck-cert{border-color:rgba(255,150,0,.2);box-shadow:none;
    filter:saturate(.4) brightness(.75);transition:all 1s}

  .ck-stamp.pending{color:#886600;border-color:rgba(255,150,0,.35);background:rgba(255,100,0,.04)}
  .ck-stamp.granted{color:#00ff88;border-color:rgba(0,255,136,.6);background:rgba(0,255,136,.08);
    animation:ckStamp .4s cubic-bezier(.2,1.7,.4,1) both}
  @keyframes ckStamp{from{transform:scale(2.4) rotate(-10deg);opacity:0}
    to{transform:scale(1) rotate(-3deg);opacity:1}}

  .ck-verdict{margin-top:16px;padding:12px 14px;border-left:3px solid #00ff88;
    background:rgba(0,255,136,.04)}
  .ck-verdict:empty{display:none}
  .ck-vh{font-size:14px;letter-spacing:.14em;color:#ffcc00}
  .ck-vh b{color:#00ff88;font-weight:400;text-shadow:0 0 12px rgba(0,255,136,.6)}
  .ck-vr{margin-top:6px;font-size:12px;color:#cc9900;letter-spacing:.06em}
  .ck-vn{margin-top:8px;font-size:10px;color:#664400;letter-spacing:.08em}
  .ck-vsay{margin-top:10px;font-size:14px;color:#ffcc00;letter-spacing:.06em;
    animation:ckSlide .3s ease both}
  .ck-vsay.soft{font-size:12px;color:#664400;text-transform:lowercase}

  @media (max-width:900px){
    .ck-arena{width:94%;height:200px}
    .ck-slots i{width:58px;font-size:8px}
    .ck-cols{flex-direction:column;gap:16px}
    .ck-bigred{width:170px;height:170px;font-size:12px}
    .ck-code{font-size:44px}
    .ck-keypad{grid-template-columns:repeat(3,64px)}
  }
  @media (max-width:600px){
    .ck-arena{height:180px}
    .ck-slots{flex-wrap:wrap;justify-content:center}
    .ck-gun{font-size:10px}
    .ck-contact{font-size:12px;padding:16px 14px}
    .ck-bigred{width:150px;height:150px;font-size:11px;padding:0 14px}
  }

  @media (max-height:520px){
    .ck-panel.voice{height:74px}
    .ck-panel.main{min-height:240px}
    .ck-pad{height:120px}
    .ck-hold{padding:16px 0}
    .ck-react{padding:26px 0}
    .ck-timer{font-size:34px}
  }`;

  /* ============================================================
     7. BOOT
     ============================================================ */
  function boot() {
    const st = document.createElement('style');
    st.id = 'ck-style';
    st.textContent = CSS;
    document.head.appendChild(st);

    // Cooldown expired - he forgets the checkup ever happened and comes back
    // He does not know how to not come back
    if ((S.done || S.gaveUp) && S.lastDone && Date.now() - S.lastDone > COOLDOWN_MS) {
      S.done = false; S.gaveUp = false; S.refusals = 0;
      save();
    }
    if (!S.done && !S.gaveUp && Math.random() < INVITE_CHANCE) {
      setTimeout(invite, FIRST_DELAY);
    }
  }

  // keep the floating pieces on screen when the device rotates or the keyboard opens
  function reflow() {
    const V = vp();
    const fix = el => {
      el.style.left = clamp(parseFloat(el.style.left) || 0, 6, Math.max(6, V.w - w - 6)) + 'px';
      el.style.top = clamp(parseFloat(el.style.top) || 0, 6, Math.max(6, V.h - h - 6)) + 'px';
    };
    const inv = $('ck-invite');
    if (inv) fix(inv);
    document.querySelectorAll('.ck-shout, .ck-soca').forEach(fix);
  }
  window.addEventListener('resize', reflow);
  window.addEventListener('orientationchange', () => setTimeout(reflow, 250));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', reflow);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.CHECKUP = {
    invite,
    start: openCheckup,
    reset() { localStorage.removeItem(LS); S = load(); },
    state() { return S; },
    ag(n) { setAg(n); }
  };
})();
