/* ============================================================
   PANDEMONIUM-04 // SMILE — MANDATORY CHECKUP
   Standalone event module. Touches nothing else.
   Load AFTER smaily.js / toast_stack.js.

   Core idea: SMILE's emotion is not text. It is the interface.
   One number — AG (agitation) — drives every visual in here.
   ============================================================ */
(function () {
  'use strict';

  const LS = 'pd04_checkup_v1';
  const AMBER = '#ffcc00';

  /* ---------- state ---------- */
  const D = { refusals: 0, done: false, gaveUp: false };
  let S = load();

  function load() {
    try { return Object.assign({}, D, JSON.parse(localStorage.getItem(LS) || '{}')); }
    catch (e) { return Object.assign({}, D); }
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }

  const $ = id => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shuffle = a => a.slice().sort(() => Math.random() - 0.5);

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

  function socaSays(msg, type) {
    if (typeof window.showSocaToast === 'function') window.showSocaToast(msg, type || 'info');
  }

  /* ============================================================
     1. INVITATION — lands anywhere on screen
     ============================================================ */
  const ASKS = [
    'Mandatory checkup. It takes four minutes. :)',
    'I understand. But it is mandatory. That is what mandatory means.',
    'SOCA says I should stop asking. SOCA is not a doctor.',
    'Okay. Last time. I promise. ...I am not good at promises.'
  ];

  function invite() {
    if (S.done || S.gaveUp || $('ck-invite')) return;
    if (window.smailyFrequency === 'off') return;

    const box = document.createElement('div');
    box.id = 'ck-invite';
    box.className = 'ck-invite';
    box.innerHTML = `
      <div class="ck-inv-head"><span>✚ SMILE // CHECKUP</span><span class="ck-inv-face">${S.refusals ? ':|' : ':)'}</span></div>
      <div class="ck-inv-body">${ASKS[Math.min(S.refusals, ASKS.length - 1)]}</div>
      <div class="ck-inv-btns">
        <button type="button" class="ck-btn ck-yes">YES</button>
        <button type="button" class="ck-btn ck-no">NO</button>
      </div>`;
    document.body.appendChild(box);

    // anywhere on screen — he is not tidy about this
    const w = box.offsetWidth, h = box.offsetHeight;
    box.style.left = clamp(rnd(10, window.innerWidth - w - 10), 8, Math.max(8, window.innerWidth - w - 8)) + 'px';
    box.style.top = clamp(rnd(10, window.innerHeight - h - 10), 8, Math.max(8, window.innerHeight - h - 8)) + 'px';

    box.querySelector('.ck-yes').addEventListener('click', () => { box.remove(); openCheckup(); });
    box.querySelector('.ck-no').addEventListener('click', () => { box.remove(); refuse(); });

    beep(760, 0.06, 'sine', 0.04);
  }

  function refuse() {
    S.refusals++;
    save();

    if (S.refusals >= ASKS.length) {
      S.gaveUp = true; save();
      setTimeout(() => smileToast('Fine. Your file stays incomplete. It is fine. I am fine.', 'info'), 1200);
      // ten minutes later — no words at all
      setTimeout(() => smileToast('COMPLIANCE: 0%', 'warn'), 600000);
      return;
    }
    // he comes back. sooner each time.
    setTimeout(invite, [45000, 35000, 25000][S.refusals - 1] || 30000);
  }

  function smileToast(msg, type) {
    if (typeof window.showSmailyToast === 'function') window.showSmailyToast(msg, type || 'info');
  }

  /* ============================================================
     2. AGITATION ENGINE — the whole personality lives here
     ============================================================ */
  const CK = {
    el: null, ag: 0, raf: 0, last: 0,
    hr: 78, cort: 30, o2: 98, trem: 0,
    running: false, aborted: false,
    cleanups: [], shouts: [], results: {}, quietUntil: 0
  };

  const agLevel = () => CK.ag < 25 ? 'calm' : CK.ag < 50 ? 'up' : CK.ag < 75 ? 'worry' : 'panic';

  function agitate(n) { CK.ag = clamp(CK.ag + n, 0, 100); }
  function calmDown(n) { CK.ag = clamp(CK.ag - n, 0, 100); }
  function setAg(n) { CK.ag = clamp(n, 0, 100); }

  /* --- his voice. One function. It decides how loud it looks. --- */
  function say(text, opts) {
    opts = opts || {};
    const stack = $('ck-say');
    if (!stack) return;

    const lvl = opts.level || agLevel();

    // panic: the message escapes the window entirely
    if (lvl === 'panic' && !opts.inside) {
      shout(text);
      return;
    }

    const line = document.createElement('div');
    line.className = 'ck-line ' + lvl + (opts.soft ? ' soft' : '');
    line.textContent = lvl === 'panic' || opts.caps ? text.toUpperCase() : text;
    stack.appendChild(line);

    // calm = one line at a time. worried = they pile up.
    const keep = lvl === 'calm' ? 1 : lvl === 'up' ? 2 : 5;
    while (stack.children.length > keep) stack.removeChild(stack.firstChild);

    if (lvl === 'worry' || lvl === 'panic') beep(rnd(500, 900), 0.03, 'square', 0.025);
  }

  // messages thrown across the whole site
  function shout(text) {
    const s = document.createElement('div');
    s.className = 'ck-shout';
    s.textContent = text.toUpperCase();
    document.body.appendChild(s);
    const w = 320;
    s.style.left = clamp(rnd(20, window.innerWidth - w - 20), 10, Math.max(10, window.innerWidth - w - 10)) + 'px';
    s.style.top = clamp(rnd(40, window.innerHeight - 100), 10, Math.max(10, window.innerHeight - 80)) + 'px';
    CK.shouts.push(s);
    beep(rnd(700, 1100), 0.05, 'sawtooth', 0.04);
    setTimeout(() => { s.classList.add('out'); setTimeout(() => s.remove(), 400); }, 1800);
    if (CK.shouts.length > 8) { const old = CK.shouts.shift(); old?.remove(); }
  }

  function clearShouts() {
    CK.shouts.forEach(s => s.remove());
    CK.shouts = [];
  }

  /* --- the pause. The strongest effect in the whole event. --- */
  async function apologize(line) {
    clearShouts();
    setAg(0);
    CK.el.classList.add('ck-silent');
    const stack = $('ck-say');
    if (stack) stack.innerHTML = '';
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
    CK.running = true; CK.aborted = false;
    CK.ag = 0; CK.results = {}; CK.cleanups = [];
    CK.hr = 78; CK.cort = 30; CK.o2 = 98; CK.trem = 0;

    const el = document.createElement('div');
    el.id = 'ck-win';
    el.className = 'ck-win calm';
    el.innerHTML = `
      <div class="ck-bar">
        <span class="ck-face" id="ck-face">:)</span>
        <span class="ck-title">SMILE // MANDATORY CHECKUP</span>
        <span class="ck-step" id="ck-step">00/00</span>
        <span class="ck-x" id="ck-x">[X]</span>
      </div>
      <div class="ck-main">
        <div class="ck-stage" id="ck-stage"></div>
        <div class="ck-vitals">
          <div class="ck-v"><span>HR</span><b id="ck-hr">078</b></div>
          <div class="ck-v"><span>CORTISOL</span><b id="ck-cort">30</b></div>
          <div class="ck-v"><span>O2</span><b id="ck-o2">98%</b></div>
          <div class="ck-v"><span>TREMOR</span><b id="ck-trem">—</b></div>
          <div class="ck-graph"><canvas id="ck-ecg" width="120" height="46"></canvas></div>
          <div class="ck-vnote" id="ck-vnote">monitoring :)</div>
        </div>
      </div>
      <div class="ck-say" id="ck-say"></div>`;
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
    say('Wait — we are not— okay. Okay.', { level: 'worry', inside: true });
    setTimeout(closeCheckup, 900);
  }

  function closeCheckup() {
    CK.running = false;
    cancelAnimationFrame(CK.raf);
    CK.cleanups.forEach(f => { try { f(); } catch (e) {} });
    CK.cleanups = [];
    clearShouts();
    CK.el?.remove();
    CK.el = null;
  }

  /* --- vitals loop: they react to HIM, not to you --- */
  const ecgBuf = new Array(120).fill(23);
  let ecgT = 0;

  function tick(now) {
    if (!CK.running) return;
    const dt = Math.min(0.05, (now - CK.last) / 1000);
    CK.last = now;

    const lvl = agLevel();
    CK.el.className = 'ck-win ' + lvl + (CK.el.classList.contains('ck-silent') ? ' ck-silent' : '');

    // he loses grip on his own instruments
    const targetHR = 78 + CK.ag * 0.75;
    CK.hr += (targetHR - CK.hr) * dt * 2;
    const targetC = 25 + CK.ag * 0.8;
    CK.cort += (targetC - CK.cort) * dt * 2;
    CK.o2 += ((98 - CK.ag * 0.06) - CK.o2) * dt * 2;

    const jitter = CK.ag > 60 ? rnd(-3, 3) : CK.ag > 35 ? rnd(-1, 1) : 0;

    const hrEl = $('ck-hr'), cEl = $('ck-cort'), oEl = $('ck-o2'), tEl = $('ck-trem');
    if (hrEl) hrEl.textContent = String(Math.round(CK.hr + jitter)).padStart(3, '0');
    if (cEl) cEl.textContent = Math.round(CK.cort + jitter);
    if (oEl) oEl.textContent = Math.round(CK.o2) + '%';
    if (tEl) tEl.textContent = CK.trem > 12 ? 'SEVERE' : CK.trem > 5 ? 'PRESENT' : CK.trem > 0 ? 'minor' : '—';

    const note = $('ck-vnote');
    if (note) {
      note.textContent = CK.ag > 75 ? 'THIS IS NOT FINE'
        : CK.ag > 50 ? 'i am a little worried'
          : CK.ag > 25 ? 'monitoring closely!'
            : 'monitoring :)';
    }
    const face = $('ck-face');
    if (face) face.textContent = CK.ag > 75 ? ':O' : CK.ag > 50 ? ':/' : CK.ag > 25 ? ':D' : ':)';

    drawECG(dt);

    // agitation always decays. he always comes back down.
    if (performance.now() > CK.quietUntil) calmDown(dt * 6);

    CK.raf = requestAnimationFrame(tick);
  }

  function drawECG(dt) {
    const cv = $('ck-ecg');
    if (!cv) return;
    const c = cv.getContext('2d');
    ecgT += dt * (2 + CK.ag / 22);

    ecgBuf.shift();
    const beatPos = ecgT % 1;
    let v = 23 + Math.sin(ecgT * 6) * 1.2;
    if (beatPos < 0.06) v = 23 - 15 * Math.sin(beatPos / 0.06 * Math.PI);
    if (CK.ag > 55) v += rnd(-2.5, 2.5);
    ecgBuf.push(v);

    c.clearRect(0, 0, 120, 46);
    c.strokeStyle = CK.ag > 70 ? '#ff2244' : AMBER;
    c.lineWidth = 1;
    c.beginPath();
    ecgBuf.forEach((y, i) => i ? c.lineTo(i, y) : c.moveTo(i, y));
    c.stroke();
  }

  function stage(html) {
    const s = $('ck-stage');
    if (s) s.innerHTML = html;
    return s;
  }
  function setStep(i, n) {
    const e = $('ck-step');
    if (e) e.textContent = String(i).padStart(2, '0') + '/' + String(n).padStart(2, '0');
  }
  function flash(color) {
    const f = document.createElement('div');
    f.className = 'ck-flash';
    f.style.background = color || 'rgba(255,34,68,.5)';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 260);
  }

  /* ============================================================
     4. TESTS
     ============================================================ */

  // --- TREMOR: impossible to pass. He knows. He panics anyway. ---
  async function tTremor() {
    stage(`
      <div class="ck-h">TREMOR ASSESSMENT</div>
      <div class="ck-sub">Hold the cursor still. Do not cheat. I am measuring.</div>
      <div class="ck-pad" id="ck-pad"><div class="ck-dot" id="ck-dot"></div></div>
      <div class="ck-meter"><i id="ck-tbar"></i></div>`);
    say('Hold the cursor perfectly still for six seconds. :)', { inside: true });

    let drift = 0, last = null, done = false;
    let stages = { m2: false, m5: false, m10: false, m20: false };

    const onMove = e => {
      if (done) return;
      if (last) drift += Math.hypot(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
      CK.trem = drift;

      const bar = $('ck-tbar');
      if (bar) bar.style.width = clamp(drift * 3, 0, 100) + '%';
      const dot = $('ck-dot');
      if (dot && CK.ag > 40) dot.style.transform = `translate(${rnd(-3, 3)}px,${rnd(-3, 3)}px)`;

      if (drift > 2 && !stages.m2) { stages.m2 = true; agitate(12); say('movement detected. hm.', { inside: true }); }
      if (drift > 5 && !stages.m5) { stages.m5 = true; agitate(25); say('TREMOR: PRESENT', { caps: true }); }
      if (drift > 10 && !stages.m10) { stages.m10 = true; agitate(35); shout('у тебя тремор!!!!!'); shout('TREMOR CONFIRMED'); }
      if (drift > 20 && !stages.m20) {
        stages.m20 = true; agitate(40);
        shout('CALM-7 QUEUED');
        shout('NO. DO NOT ARGUE.');
        shout('QUEUED.');
      }
    };
    window.addEventListener('mousemove', onMove);
    CK.cleanups.push(() => window.removeEventListener('mousemove', onMove));

    // SOCA has seen this before
    setTimeout(() => { if (CK.running && drift > 8) socaSays('He does this every cycle. Ignore him.', 'info'); }, 4000);

    await wait(6200);
    done = true;
    window.removeEventListener('mousemove', onMove);

    if (drift > 10) await apologize('sorry. i got loud.');

    CK.results.tremor = drift < 2 ? 'none — suspicious. nobody is that steady.' : 'present, but characterful';
    say('Recorded. Everyone has it. It is fine.', { level: 'calm', inside: true });
    await wait(1500);
  }

  // --- BREATH: he breaks first. Always. ---
  async function tBreath() {
    stage(`
      <div class="ck-h">RESPIRATORY HOLD</div>
      <div class="ck-sub">Hold the button. Hold your breath with it. I will count.</div>
      <button type="button" class="ck-hold" id="ck-hold">HOLD</button>
      <div class="ck-timer" id="ck-timer">0.0s</div>`);
    say('Press and hold. I will count for you. :)', { inside: true });

    const btn = $('ck-hold');
    let held = false, t = 0, best = 0, forced = false;
    const marks = {};

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
        if (tm) tm.textContent = t.toFixed(1) + 's';

        if (t > 3 && t < 10 && !marks.a && Math.random() < 0.06) { marks.a = 1; say('4... 5... 6... good, good', { inside: true }); }
        if (t > 10 && !marks.b) { marks.b = 1; agitate(10); say('good. that is a normal hold.', { inside: true }); }
        if (t > 20 && !marks.c) { marks.c = 1; setAg(55); say('okay thats... thats a lot. you can stop.', { inside: true }); }
        if (t > 30 && !marks.d) {
          marks.d = 1; setAg(72);
          say('Pilot.', { level: 'worry', inside: true });
          say('PILOT.', { level: 'worry', inside: true });
        }
        if (t > 40 && !marks.e) {
          marks.e = 1; setAg(95);
          CK.quietUntil = performance.now() + 12000;
          CK.el.classList.add('ck-flood');
          ['всё всё хватит', 'ОТПУСТИ', 'я серьёзно', 'ДЫШИ', 'PILOT PLEASE', 'BREATHE'].forEach((s, i) =>
            setTimeout(() => { if (CK.running) shout(s); }, i * 500));
          btn.classList.add('beg');
        }
        if (t > 50 && !forced) {
          forced = true;
          break;                       // he stops it himself
        }
      } else if (t > 0) {
        break;                         // released
      }
    }

    stop();
    CK.el.classList.remove('ck-flood');
    btn.classList.remove('beg');
    CK.quietUntil = 0;

    if (forced) {
      clearShouts();
      setAg(0);
      CK.el.classList.add('ck-silent');
      stage(`<div class="ck-abort">Test aborted.<br><span>I do not want to know how long you can do that.</span></div>`);
      await wait(3800);
      CK.el.classList.remove('ck-silent');
      CK.results.breath = best.toFixed(1) + 's — recorded under protest';
      return;
    }

    if (best > 30) await apologize('sorry. i got loud.');
    CK.results.breath = best.toFixed(1) + 's';
    say(best > 25 ? 'Please do not do that again.' : 'Good. Textbook. :)', { level: 'calm', inside: true });
    await wait(1600);
  }

  // --- REFLEX ---
  async function tReflex() {
    CK.results.reflex = [];
    for (let round = 0; round < 2; round++) {
      stage(`
        <div class="ck-h">REFLEX ARC</div>
        <div class="ck-sub">Click the panel the moment it says NOW. Not before.</div>
        <div class="ck-react wait" id="ck-react">WAIT</div>`);
      say(round === 0 ? 'Do not anticipate. I will know.' : 'Again. I want an average.', { inside: true });

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
        CK.results.reflex.push(Math.round(res));
        say(res < 250 ? `${Math.round(res)}ms. That is EXCELLENT!!` : `${Math.round(res)}ms. Good. Very good. Fine.`, { inside: true });
      }
      await wait(1400);
    }
    const arr = CK.results.reflex;
    CK.results.reflex = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) + 'ms' : 'inconclusive (anticipated)';
  }

  // --- PAIN: the anticipation IS the test ---
  async function tPain() {
    stage(`
      <div class="ck-h">PAIN THRESHOLD</div>
      <div class="ck-sub">I will now apply a very small electrical stimulus.</div>
      <div class="ck-charge" id="ck-charge"><i></i></div>`);
    say('This is standard. It is small. Almost nothing. :)', { inside: true });
    await wait(2600);
    say('Ready...', { inside: true });
    await wait(2200);
    say('...', { inside: true });
    await wait(2600);

    flash('rgba(255,34,68,.55)');
    beep(120, 0.35, 'sawtooth', 0.09);
    setAg(70);
    CK.hr = 150; CK.cort = 95;
    stage(`<div class="ck-h big">!!!</div>`);
    await wait(900);

    say('That was the anticipation. Anticipation IS the test.', { inside: true, level: 'up' });
    await wait(1800);
    say('Your cortisol was BEAUTIFUL.', { inside: true, level: 'up' });
    await wait(1400);

    // SOCA. And she is not being funny.
    socaSays('That was unnecessary.', 'warn');
    CK.el.classList.add('ck-silent');
    clearShouts();
    setAg(0);
    const st = $('ck-say');
    if (st) st.innerHTML = '';
    await wait(3200);
    CK.el.classList.remove('ck-silent');
    say('...you are right. Sorry, Pilot.', { level: 'calm', soft: true, inside: true });
    await wait(2600);

    CK.results.pain = 'threshold not reached (test was a lie)';
  }

  // --- EYE CHART ---
  async function tEyes() {
    const rows = [
      { txt: 'E F P T O Z', opts: ['E F P T O Z', 'F E P T O Z', 'E F T P O Z'], ok: 0 },
      { txt: 'L P E D 0 3', opts: ['L P E D O 3', 'L P E D 0 8', 'I P E D 0 3'], ok: 0 },
      { txt: 'P E ▓ F D ░', opts: ['P E C F D 4', 'P E ? F D ?', 'unreadable'], ok: -1 },
      { txt: '0x3F 0x3F 0x3F', opts: ['0x3F 0x3F 0x3F', '...nothing', 'I see it. I do not like it.'], ok: -1 }
    ];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      stage(`
        <div class="ck-h">VISUAL ACUITY — ROW ${i + 1}</div>
        <div class="ck-chart r${i}">${r.txt}</div>
        <div class="ck-opts">${r.opts.map((o, k) => `<button type="button" class="ck-opt" data-k="${k}">${o}</button>`).join('')}</div>`);
      if (i === 3) say('Do not worry. Nobody can read that one. I cannot read that one.', { inside: true });
      else say('Read the row. Out loud, if it helps. It does not help.', { inside: true });

      await pickOption();
      if (i === 3) agitate(15);
      await wait(700);
    }
    CK.results.vision = '20/20 (rows 3 and 4 are not your fault)';
    say('Your eyes are fine. The chart is not.', { inside: true });
    await wait(1500);
  }

  // --- HEARING ---
  async function tHearing() {
    const n = ri(3, 5);
    stage(`<div class="ck-h">AUDITORY RANGE</div><div class="ck-sub">Listen. Count the tones.</div><div class="ck-wave" id="ck-wave">▁▁▁▁▁▁▁▁</div>`);
    say('Headphones help. Or do not. I am not your supervisor.', { inside: true });
    await wait(1400);

    for (let i = 0; i < n; i++) {
      const hz = i === n - 1 ? 19000 : rnd(300, 2000);   // the last one is a cruel joke
      beep(hz, 0.35, 'sine', 0.06);
      const w = $('ck-wave');
      if (w) w.textContent = '▁▃▅▇▅▃▁▁'.slice(0, 8);
      await wait(300);
      if (w) w.textContent = '▁▁▁▁▁▁▁▁';
      await wait(500);
    }

    stage(`
      <div class="ck-h">HOW MANY?</div>
      <div class="ck-opts wide">${[1, 2, 3, 4, 5, 6].map(k => `<button type="button" class="ck-opt" data-k="${k}">${k}</button>`).join('')}</div>`);
    const pick = await pickOption();
    CK.results.hearing = pick + ' tones reported / ' + n + ' played';
    say(pick == n ? 'CORRECT!! Perfect ears!!' : 'Interesting. Also correct. Everything is correct today. :D', { inside: true });
    agitate(10);
    await wait(1700);
  }

  // --- BALANCE ---
  async function tBalance() {
    stage(`
      <div class="ck-h">VESTIBULAR CHECK</div>
      <div class="ck-sub">Keep the dot centred. The room is not moving. Probably.</div>
      <div class="ck-bal" id="ck-bal"><div class="ck-bal-t"></div><div class="ck-bal-d" id="ck-bald"></div></div>`);
    say('The window will tilt. That is intentional. Mostly.', { inside: true });

    const bal = $('ck-bal'), dot = $('ck-bald');
    let x = 0, vx = 0, tilt = 0, mx = 0, t = 0, offCount = 0;

    const onMove = e => {
      const r = bal.getBoundingClientRect();
      mx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    };
    window.addEventListener('mousemove', onMove);
    CK.cleanups.push(() => window.removeEventListener('mousemove', onMove));

    const t0 = performance.now();
    while (performance.now() - t0 < 9000 && CK.running) {
      await wait(16);
      const dt = 0.016;
      t += dt;
      tilt = Math.sin(t * 0.9) * 9 + Math.sin(t * 2.3) * 3;
      CK.el.style.setProperty('--ck-tilt', tilt.toFixed(2) + 'deg');
      CK.el.classList.add('ck-tilt');

      vx += (tilt * 0.02 + (mx - x) * 0.12) * dt * 60;
      vx *= 0.93;
      x = clamp(x + vx * dt, -1, 1);
      if (dot) dot.style.left = (50 + x * 46) + '%';

      if (Math.abs(x) > 0.55) {
        offCount++;
        if (offCount % 45 === 0) { agitate(14); say('you are drifting!', { inside: true }); }
      }
    }
    CK.el.classList.remove('ck-tilt');
    CK.el.style.removeProperty('--ck-tilt');
    window.removeEventListener('mousemove', onMove);

    CK.results.balance = offCount > 160 ? 'compensating heroically' : 'stable enough for a corridor';
    say('Vestibular system: acceptable. The corridor is worse.', { inside: true });
    await wait(1500);
  }

  // --- MEMORY (and he gaslights you) ---
  async function tMemory() {
    const ICONS = ['✚', '♥', '◉', '⚕', '☤', '⌬'];
    const seq = [];
    for (let round = 1; round <= 3; round++) {
      seq.push(ri(0, ICONS.length - 1));

      stage(`
        <div class="ck-h">SHORT-TERM RECALL — ${round}/3</div>
        <div class="ck-sub">Watch. Then repeat.</div>
        <div class="ck-simon">${ICONS.map((ic, i) => `<button type="button" class="ck-sim" data-k="${i}" disabled>${ic}</button>`).join('')}</div>`);
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
        // he shows a wrong one and acts like it was always there
        agitate(18);
        say('...that is not what I showed you.', { inside: true });
        await wait(1400);
        say('I showed you ✚ ♥ ⌬. I am certain. It is in the log.', { inside: true });
        await wait(1600);
        say('It is fine!! Memory is a suggestion anyway :D', { inside: true });
      } else {
        say(ok ? 'Correct! :D' : 'Close enough. Close counts, medically.', { inside: true });
      }
      await wait(1200);
    }
    CK.results.memory = 'intact (his logs disagree)';
  }

  // --- COLOR (ASCII Ishihara that will not sit still) ---
  async function tColor() {
    stage(`
      <div class="ck-h">COLOUR PERCEPTION</div>
      <div class="ck-sub">What number is in the circle?</div>
      <div class="ck-ishi" id="ck-ishi"></div>
      <div class="ck-opts">${[3, 7, 8, 'nothing'].map(k => `<button type="button" class="ck-opt" data-k="${k}">${k}</button>`).join('')}</div>`);

    const ish = $('ck-ishi');
    const paint = num => {
      let out = '';
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 14; x++) {
          const inside = Math.hypot(x - 6.5, (y - 4) * 1.6) < 6.5;
          if (!inside) { out += ' '; continue; }
          const on = num === 7 ? (y < 2 || (x > 6 - (y - 1) && x < 9 - (y - 1) * 0.6)) :
            num === 3 ? (y < 2 || y > 6 || (y > 3 && y < 5) || x > 8) : false;
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
    say('Interesting. Noted. Very interesting.', { inside: true });
    await wait(1500);
  }

  // --- COUGH ---
  async function tCough() {
    stage(`
      <div class="ck-h">RESPIRATORY SAMPLE</div>
      <div class="ck-sub">Cough into the microphone.</div>
      <div class="ck-mic" id="ck-mic">◉ NO MICROPHONE DETECTED</div>`);
    say('Cough into the microphone, please. :)', { inside: true });
    await wait(2600);
    say('...', { inside: true });
    await wait(1600);
    agitate(12);
    say('Press C. Press C and cough. I will believe you.', { inside: true });

    await new Promise(res => {
      const h = e => {
        if (e.key === 'c' || e.key === 'C') { document.removeEventListener('keydown', h); res(); }
      };
      document.addEventListener('keydown', h);
      CK.cleanups.push(() => document.removeEventListener('keydown', h));
      // mobile / no keyboard
      const mic = $('ck-mic');
      mic.style.cursor = 'pointer';
      mic.addEventListener('click', () => { document.removeEventListener('keydown', h); res(); });
    });

    beep(200, 0.12, 'sawtooth', 0.05);
    CK.results.cough = 'productive (trust-based)';
    say('Thank you. That sounded healthy. I am sure of it.', { inside: true });
    await wait(1600);
  }

  // --- HONESTY ---
  async function tHonesty() {
    stage(`
      <div class="ck-h">SELF-REPORT</div>
      <div class="ck-sub">One question. Answer honestly.</div>
      <div class="ck-q">Do you feel fine?</div>
      <div class="ck-opts">
        <button type="button" class="ck-opt" data-k="yes">YES</button>
        <button type="button" class="ck-opt" data-k="no">NO</button>
      </div>`);
    const pick = await pickOption();
    say('Your biometrics disagree.', { inside: true });
    await wait(1800);
    say('I am writing down what YOU said, though. I am on your side.', { inside: true });
    CK.results.selfreport = pick === 'yes' ? '"fine" (biometrics: no)' : '"not fine" (biometrics: also no)';
    await wait(1800);
  }

  // --- RORSCHACH ---
  async function tBlot() {
    const blot = `      ░▒▓█▓▒░
   ░▒▓███████▓▒░
 ░▒▓███▓░ ░▓███▓▒░
░▒▓██▓░     ░▓██▓▒░
 ░▒▓███▓░ ░▓███▓▒░
   ░▒▓███████▓▒░
      ░▒▓█▓▒░`;
    stage(`
      <div class="ck-h">PROJECTIVE TEST</div>
      <div class="ck-sub">What do you see?</div>
      <pre class="ck-blot">${blot}</pre>
      <div class="ck-opts">
        <button type="button" class="ck-opt" data-k="a butterfly">a butterfly</button>
        <button type="button" class="ck-opt" data-k="my ship">my ship</button>
        <button type="button" class="ck-opt" data-k="SOCA, angry">SOCA, angry</button>
        <button type="button" class="ck-opt" data-k="nothing, I am fine">nothing, I am fine</button>
      </div>`);
    const pick = await pickOption();
    say('Interesting. Noted. Very interesting.', { inside: true });
    await wait(1600);
    if (pick === 'SOCA, angry') socaSays('I heard that.', 'info');
    CK.results.projective = '"' + pick + '"';
    await wait(1200);
  }

  // --- COGNITIVE (the numbers rot while you read) ---
  async function tCog() {
    stage(`
      <div class="ck-h">COGNITIVE LOAD</div>
      <div class="ck-sub">Simple arithmetic. Take your time.</div>
      <div class="ck-math" id="ck-math">7 + 4 = ?</div>
      <div class="ck-opts">${[9, 11, 13, '█'].map(k => `<button type="button" class="ck-opt" data-k="${k}">${k}</button>`).join('')}</div>`);
    const m = $('ck-math');
    const forms = ['7 + 4 = ?', '7 + ▓ = ?', '░ + 4 = ?', '7 + 4 = █', '▒ + ▓ = ?'];
    let i = 0;
    const iv = setInterval(() => { i++; if (m) m.textContent = forms[i % forms.length]; }, 1100);
    CK.cleanups.push(() => clearInterval(iv));

    const pick = await pickOption();
    clearInterval(iv);
    agitate(10);
    say('The question degraded, not you. That happens here.', { inside: true });
    CK.results.cognition = 'unimpaired (the question was)';
    await wait(1600);
  }

  /* --- helper: wait for an option click --- */
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

  /* ============================================================
     5. SEQUENCE + THE CARD
     ============================================================ */
  const OPTIONAL = [tEyes, tHearing, tBalance, tMemory, tColor, tCough, tBlot, tCog];

  async function runSequence() {
    const mid = shuffle(OPTIONAL).slice(0, 4);
    const seq = [tTremor, tBreath, mid[0], tReflex, mid[1], tPain, mid[2], mid[3], tHonesty];

    for (let i = 0; i < seq.length; i++) {
      if (!CK.running || CK.aborted) return;
      setStep(i + 1, seq.length);
      calmDown(100);
      try { await seq[i](); } catch (e) { /* a test failed — he would not notice */ }
      if (!CK.running || CK.aborted) return;

      // SOCA gets irritated once, around the middle
      if (i === 3) socaSays('This is not a medical examination. This is a game.', 'info');
      await wait(500);
    }

    if (CK.running) await finalCard();
  }

  async function finalCard() {
    setAg(0);
    clearShouts();
    const R = CK.results;
    const grade = ['A', 'A', 'A+', 'A'][ri(0, 3)];

    stage(`
      <div class="ck-card">
        <div class="ck-card-h">
          <span>MEDICAL CERTIFICATE</span>
          <span class="ck-stamp">CLEARED</span>
        </div>
        <div class="ck-card-b">
          <div class="ck-row"><span>SUBJECT</span><b>PILOT_01 // KOKO</b></div>
          <div class="ck-row"><span>TREMOR</span><b>${R.tremor || 'not assessed'}</b></div>
          <div class="ck-row"><span>RESP. HOLD</span><b>${R.breath || '—'}</b></div>
          <div class="ck-row"><span>REFLEX</span><b>${R.reflex || '—'}</b></div>
          ${R.vision ? `<div class="ck-row"><span>VISION</span><b>${R.vision}</b></div>` : ''}
          ${R.hearing ? `<div class="ck-row"><span>HEARING</span><b>${R.hearing}</b></div>` : ''}
          ${R.balance ? `<div class="ck-row"><span>BALANCE</span><b>${R.balance}</b></div>` : ''}
          ${R.memory ? `<div class="ck-row"><span>RECALL</span><b>${R.memory}</b></div>` : ''}
          ${R.colour ? `<div class="ck-row"><span>COLOUR</span><b>${R.colour}</b></div>` : ''}
          ${R.cough ? `<div class="ck-row"><span>RESP. SAMPLE</span><b>${R.cough}</b></div>` : ''}
          ${R.projective ? `<div class="ck-row"><span>PROJECTIVE</span><b>${R.projective}</b></div>` : ''}
          ${R.cognition ? `<div class="ck-row"><span>COGNITION</span><b>${R.cognition}</b></div>` : ''}
          <div class="ck-row"><span>PAIN</span><b>${R.pain || '—'}</b></div>
          <div class="ck-row"><span>SELF-REPORT</span><b>${R.selfreport || '—'}</b></div>
          <div class="ck-row grade"><span>GRADE</span><b>${grade}</b></div>
        </div>
        <div class="ck-card-f">SMILE // attending. Signed :D</div>
      </div>
      <button type="button" class="ck-done" id="ck-done">CLOSE</button>`);

    say('You passed.', { level: 'calm', inside: true });
    await wait(2000);
    say('You always pass. I would never tell you otherwise.', { level: 'calm', soft: true, inside: true });

    S.done = true; save();
    beep(700, 0.09); setTimeout(() => beep(900, 0.14), 110);

    $('ck-done').addEventListener('click', () => {
      closeCheckup();
      setTimeout(() => socaSays('He measured your mouse. That is not medicine.', 'info'), 1200);
      setTimeout(() => smileToast('It is now :D', 'ok'), 4200);
    });
  }

  /* ============================================================
     6. STYLES
     ============================================================ */
  const CSS = `
  /* ---------- invitation ---------- */
  .ck-invite{position:fixed;z-index:99980;width:270px;background:#140d02;
    border:1px solid rgba(255,170,0,.7);box-shadow:0 0 22px rgba(255,170,0,.28);
    font-family:'VT323',monospace;user-select:none;animation:ck-in .25s ease-out}
  @keyframes ck-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
  .ck-inv-head{display:flex;justify-content:space-between;padding:5px 8px;
    font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.14em;
    color:${AMBER};background:rgba(255,170,0,.14);border-bottom:1px solid rgba(255,170,0,.4)}
  .ck-inv-body{padding:10px;font-size:16px;line-height:1.35;color:#ffcc66}
  .ck-inv-btns{display:flex;gap:10px;padding:0 10px 10px}

  /* buttons: no fill, coloured outline, fills on hover. Nothing else styled. */
  .ck-btn{flex:1;background:transparent;font-family:'Share Tech Mono',monospace;
    font-size:11px;letter-spacing:.2em;padding:8px 0;cursor:pointer;transition:all .15s;
    touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  .ck-btn.ck-yes{border:1px solid #00ff88;color:#00ff88}
  .ck-btn.ck-yes:hover{background:#00ff88;color:#04120a;box-shadow:0 0 14px rgba(0,255,136,.55)}
  .ck-btn.ck-no{border:1px solid #ff2244;color:#ff2244}
  .ck-btn.ck-no:hover{background:#ff2244;color:#12040a;box-shadow:0 0 14px rgba(255,34,68,.55)}
  .ck-btn:active{transform:scale(.95)}

  /* ---------- window ---------- */
  .ck-win{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
    width:min(640px,94vw);max-height:88vh;z-index:99985;
    background:#100a01;border:1px solid rgba(255,170,0,.6);
    box-shadow:0 0 40px rgba(255,170,0,.22),inset 0 0 60px rgba(0,0,0,.6);
    font-family:'Share Tech Mono',monospace;color:#ffcc66;display:flex;flex-direction:column;
    transform-origin:center center;transition:border-color .3s,box-shadow .3s}
  .ck-win.up{border-color:rgba(255,190,0,.8)}
  .ck-win.worry{border-color:#ffaa00;box-shadow:0 0 44px rgba(255,170,0,.4);
    animation:ck-tremor .12s infinite steps(2)}
  @keyframes ck-tremor{0%{margin:0 0}50%{margin:-1px 1px}100%{margin:0 0}}
  .ck-win.panic{border-color:#ff2244;box-shadow:0 0 60px rgba(255,34,68,.5);
    animation:ck-panic .09s infinite steps(2)}
  @keyframes ck-panic{0%{margin:0 0;filter:none}50%{margin:-2px 2px;filter:hue-rotate(-14deg) saturate(1.4)}100%{margin:0 0}}
  .ck-win.ck-flood{background:#2a1a00;box-shadow:0 0 120px rgba(255,170,0,.7)}
  .ck-win.ck-silent{animation:none!important;border-color:rgba(255,170,0,.3);
    box-shadow:0 0 18px rgba(255,170,0,.1);filter:none!important;margin:0!important}
  .ck-win.ck-tilt{transform:translate(-50%,-50%) rotate(var(--ck-tilt,0deg))}

  .ck-bar{display:flex;align-items:center;gap:8px;padding:6px 10px;
    background:rgba(255,170,0,.12);border-bottom:1px solid rgba(255,170,0,.35);
    font-size:9px;letter-spacing:.16em;color:${AMBER};flex:none}
  .ck-face{font-family:'VT323',monospace;font-size:16px}
  .ck-title{flex:1}
  .ck-step{color:#996600}
  .ck-x{cursor:pointer;color:#996600;padding:2px 5px}
  .ck-x:hover{color:#ff2244}

  .ck-main{display:flex;gap:12px;padding:14px;flex:1;min-height:0}
  .ck-stage{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:10px;text-align:center;min-height:220px}
  .ck-h{font-size:12px;letter-spacing:.24em;color:${AMBER};text-shadow:0 0 10px rgba(255,170,0,.5)}
  .ck-h.big{font-size:42px;color:#ff2244;text-shadow:0 0 20px rgba(255,34,68,.8)}
  .ck-sub{font-size:10px;color:#996600;letter-spacing:.08em;max-width:340px;line-height:1.5}

  /* vitals */
  .ck-vitals{width:132px;flex:none;display:flex;flex-direction:column;gap:5px;
    border-left:1px solid rgba(255,170,0,.25);padding-left:11px}
  .ck-v{display:flex;justify-content:space-between;font-size:9px;letter-spacing:.1em;color:#996600}
  .ck-v b{color:${AMBER};font-weight:400}
  .ck-win.worry .ck-v b{color:#ff8800}
  .ck-win.panic .ck-v b{color:#ff2244;animation:ck-num .1s infinite steps(2)}
  @keyframes ck-num{0%{transform:none}50%{transform:translate(2px,-1px)}100%{transform:none}}
  .ck-graph{margin-top:4px}
  .ck-vnote{font-size:8px;color:#775500;letter-spacing:.08em;margin-top:auto;line-height:1.4}
  .ck-win.panic .ck-vnote{color:#ff2244}

  /* his voice */
  .ck-say{border-top:1px solid rgba(255,170,0,.25);padding:8px 12px;min-height:34px;flex:none;
    display:flex;flex-direction:column;gap:3px;justify-content:flex-end}
  .ck-line{font-family:'VT323',monospace;font-size:16px;line-height:1.2;color:#ffcc66}
  .ck-line.up{font-size:18px}
  .ck-line.worry{font-size:20px;color:#ffaa00;text-shadow:0 0 8px rgba(255,170,0,.5)}
  .ck-line.panic{font-size:22px;color:#ff2244;letter-spacing:.05em}
  .ck-line.soft{font-size:14px;color:#997744;text-transform:lowercase}

  /* messages that escape the window */
  .ck-shout{position:fixed;z-index:99999;max-width:320px;pointer-events:none;
    font-family:'VT323',monospace;font-size:30px;line-height:1;color:#ff2244;
    text-shadow:0 0 14px rgba(255,34,68,.8),0 0 3px #000;
    animation:ck-shout-in .12s steps(2);transition:opacity .35s}
  @keyframes ck-shout-in{from{opacity:0;transform:scale(1.3)}to{opacity:1;transform:none}}
  .ck-shout.out{opacity:0}

  .ck-flash{position:fixed;inset:0;z-index:100000;pointer-events:none;animation:ck-fl .25s}
  @keyframes ck-fl{0%{opacity:1}100%{opacity:0}}

  /* option buttons */
  .ck-opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:420px}
  .ck-opts.wide .ck-opt{min-width:44px}
  .ck-opt{background:transparent;border:1px solid rgba(255,170,0,.5);color:#ffcc66;
    font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;
    padding:8px 12px;cursor:pointer;transition:all .15s;touch-action:manipulation}
  .ck-opt:hover{background:rgba(255,170,0,.85);color:#100a01;box-shadow:0 0 12px rgba(255,170,0,.5)}
  .ck-opt.picked{background:${AMBER};color:#100a01}

  /* tremor */
  .ck-pad{width:200px;height:110px;border:1px dashed rgba(255,170,0,.4);position:relative}
  .ck-dot{position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;
    background:${AMBER};border-radius:50%;box-shadow:0 0 10px rgba(255,170,0,.8)}
  .ck-meter{width:220px;height:6px;border:1px solid rgba(255,170,0,.4);background:rgba(0,0,0,.4)}
  .ck-meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,${AMBER},#ff2244)}

  /* breath */
  .ck-hold{width:150px;padding:20px 0;background:transparent;border:1px solid ${AMBER};
    color:${AMBER};font-family:'Share Tech Mono',monospace;font-size:14px;letter-spacing:.2em;
    cursor:pointer;touch-action:none;user-select:none}
  .ck-hold.on{background:rgba(255,170,0,.25);box-shadow:0 0 20px rgba(255,170,0,.5)}
  .ck-hold.beg{border-color:#ff2244;color:#ff2244;animation:ck-beg .18s infinite alternate}
  @keyframes ck-beg{from{transform:scale(1)}to{transform:scale(1.06)}}
  .ck-timer{font-family:'VT323',monospace;font-size:30px;color:${AMBER}}
  .ck-win.panic .ck-timer{color:#ff2244}
  .ck-abort{font-family:'VT323',monospace;font-size:24px;color:#997744;line-height:1.5}
  .ck-abort span{font-size:16px;color:#775500}

  /* reflex */
  .ck-react{width:220px;padding:34px 0;border:1px solid rgba(255,170,0,.5);
    font-size:16px;letter-spacing:.3em;cursor:pointer;user-select:none}
  .ck-react.wait{color:#996600}
  .ck-react.go{border-color:#00ff88;color:#00ff88;background:rgba(0,255,136,.15);
    box-shadow:0 0 24px rgba(0,255,136,.5)}
  .ck-react.bad{border-color:#ff2244;color:#ff2244;background:rgba(255,34,68,.15)}

  /* pain */
  .ck-charge{width:220px;height:8px;border:1px solid rgba(255,34,68,.5);background:rgba(0,0,0,.4)}
  .ck-charge i{display:block;height:100%;width:0;background:#ff2244;animation:ck-chg 7s linear forwards}
  @keyframes ck-chg{to{width:100%}}

  /* eye chart */
  .ck-chart{font-family:'Share Tech Mono',monospace;letter-spacing:.4em;color:${AMBER}}
  .ck-chart.r0{font-size:26px}
  .ck-chart.r1{font-size:19px}
  .ck-chart.r2{font-size:14px;color:#997744;filter:blur(.6px)}
  .ck-chart.r3{font-size:11px;color:#ff2244;filter:blur(1.1px);animation:ck-rot .5s infinite steps(2)}
  @keyframes ck-rot{0%{opacity:1}50%{opacity:.55}100%{opacity:1}}

  /* hearing */
  .ck-wave{font-family:'Share Tech Mono',monospace;font-size:28px;color:${AMBER};letter-spacing:.2em}

  /* balance */
  .ck-bal{width:260px;height:60px;border:1px solid rgba(255,170,0,.4);position:relative;background:rgba(0,0,0,.35)}
  .ck-bal-t{position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,170,0,.35)}
  .ck-bal-d{position:absolute;top:50%;left:50%;width:14px;height:14px;margin:-7px 0 0 -7px;
    background:${AMBER};border-radius:50%;box-shadow:0 0 12px rgba(255,170,0,.8)}

  /* memory */
  .ck-simon{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .ck-sim{width:56px;height:56px;background:transparent;border:1px solid rgba(255,170,0,.4);
    color:#997744;font-size:22px;cursor:pointer;transition:all .1s}
  .ck-sim.lit{background:${AMBER};color:#100a01;box-shadow:0 0 20px rgba(255,170,0,.8)}
  .ck-sim:disabled{cursor:default}

  /* colour */
  .ck-ishi{font-family:monospace;font-size:11px;line-height:.9;white-space:pre}
  .ck-ishi .a{color:#ff5555}
  .ck-ishi .b{color:#559955}

  /* misc */
  .ck-mic{font-size:11px;color:#996600;letter-spacing:.12em;border:1px dashed rgba(255,170,0,.35);padding:14px 18px}
  .ck-q{font-family:'VT323',monospace;font-size:26px;color:${AMBER}}
  .ck-blot{font-family:monospace;font-size:11px;line-height:1;color:#997744;margin:0}
  .ck-math{font-family:'VT323',monospace;font-size:34px;color:${AMBER};letter-spacing:.15em}

  /* card */
  .ck-card{width:100%;border:1px solid ${AMBER};background:rgba(255,170,0,.05);text-align:left}
  .ck-card-h{display:flex;justify-content:space-between;padding:7px 10px;
    background:rgba(255,170,0,.16);border-bottom:1px solid rgba(255,170,0,.4);
    font-size:10px;letter-spacing:.18em;color:${AMBER}}
  .ck-stamp{color:#00ff88;border:1px solid #00ff88;padding:0 6px;letter-spacing:.2em}
  .ck-card-b{padding:9px 10px;display:flex;flex-direction:column;gap:3px;
    max-height:230px;overflow-y:auto}
  .ck-row{display:flex;justify-content:space-between;gap:12px;font-size:9px;
    letter-spacing:.06em;color:#996600}
  .ck-row b{color:#ffcc66;font-weight:400;text-align:right;overflow-wrap:anywhere}
  .ck-row.grade b{color:#00ff88;font-size:13px}
  .ck-card-f{padding:6px 10px;border-top:1px solid rgba(255,170,0,.25);
    font-family:'VT323',monospace;font-size:14px;color:#997744}
  .ck-done{margin-top:10px;padding:9px 26px;background:transparent;border:1px solid ${AMBER};
    color:${AMBER};font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.2em;cursor:pointer}
  .ck-done:hover{background:${AMBER};color:#100a01}

  @media(max-width:640px){
    .ck-main{flex-direction:column}
    .ck-vitals{width:auto;border-left:none;border-top:1px solid rgba(255,170,0,.25);
      padding-left:0;padding-top:10px;flex-direction:row;flex-wrap:wrap;gap:12px}
    .ck-graph,.ck-vnote{display:none}
    .ck-stage{min-height:190px}
    .ck-shout{font-size:22px;max-width:220px}
  }`;

  /* ============================================================
     7. BOOT
     ============================================================ */
  function boot() {
    const st = document.createElement('style');
    st.id = 'ck-style';
    st.textContent = CSS;
    document.head.appendChild(st);

    // he waits a bit before he starts bothering you
    //if (!S.done && !S.gaveUp) setTimeout(invite, 90000 + Math.random() * 60000);
  // ТЕСТ: приглашение сразу при заходе. Для релиза вернуть 90000 + Math.random() * 60000
    if (!S.done && !S.gaveUp) setTimeout(invite, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // debug
  window.CHECKUP = {
    invite,
    start: openCheckup,
    reset() { localStorage.removeItem(LS); S = load(); },
    state() { return S; },
    ag(n) { setAg(n); }
  };
})();
