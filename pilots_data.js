// ══════════════════════════════════════════════════════════════════════════════
// ── PILOTS DATA SYSTEM ────────────────────────────────────────────────────────
// ── Все данные пилотов. pilot.html — чистый шаблон, данные живут здесь.
// ── URL: pilot.html?pilot=1 / pilot.html?pilot=2 / pilot.html?pilot=3
// ══════════════════════════════════════════════════════════════════════════════
 
const PILOTS = {
 
  // ══════════════════════════════════════════════════════════════════════════
  // PILOT 01 — KOKO
  // ══════════════════════════════════════════════════════════════════════════
  1: {
 
    // ── ШАПКА ────────────────────────────────────────────────────────────────
    header: {
      title:    'pilot 01 // Koko // captain',
      subtitle: 'DOSSIER // ACTIVE // CLASS-A CERTIFIED',
      recordId: 'PN-04-KK-01',
      status:   '■ ON DUTY',
      statusClass: 'glow',
    },
 
    // ── ФОТО ─────────────────────────────────────────────────────────────────
    photo: {
      src:        'картинк/PILOT_01.png',
      modalTitle: '// PILOT_01 — KOKO',
      modalRecordId: 'PN-04-KK-01',
    },
 
    // ── DATA PAGE — BASE RECORD ───────────────────────────────────────────────
    data: {
      callsign:    { text: 'pilot 01 // Koko // captain', cls: 'rv glow' },
      fullname:    { text: 'Riversoyer Kokoro',           cls: 'rv' },
      dob:         { text: '05.11.1958',                  cls: 'rv c1' },
      nationality: { text: 'Astralis-0',                  cls: 'rv' },
      rank:        { text: '[DATA CORRUPTED]',            cls: 'rv heavy-corrupt' },
      vessel:      { text: 'Pandemonium-04 // XN-09',     cls: 'rv' },
      enlistment:  { text: '[NO DATA]',                   cls: 'rv heavy-corrupt' },
      flighthours: { text: '3,847 h',                     cls: 'rv glow' },
      missions:    { text: '[UNREADABLE]',                 cls: 'rv heavy-corrupt' },
      incidents:   { text: '13 (minor) // 3 (serious)',   cls: 'rv glow-y' },
      status:      { text: 'ACTIVE — ON MISSION',         cls: 'rv glow' },
    },
 
    // ── CLEARANCE + MISSION SCORE + FLAGS ────────────────────────────────────
    clearance:     'Ω',
    clearanceNote: 'MAXIMUM // GLITCHED',
    clearanceCls:  'c3',
    missionScore: {
      accuracy: { text: '94%',   cls: 'rv' },
      response: { text: '+12ms', cls: 'rv glow' },
      protocol: { text: '98%',   cls: 'rv' },
      overall:  { text: 'A+',    cls: 'rv glow' },
    },
    flags: 'Stress index: MED↑<br>Engine_B event<br>Mem leak exposure',
 
    // ── SOCA NOTE (правая колонка) ────────────────────────────────────────────
    socaNote: 'Monitoring Pilot_01 continuously. Current assessment: <span class="glow">RELIABLE</span>. Stress elevated but manageable. Neural link stable. I am... watching over you, Pilot.',
 
    // ── SOCA COMMENTS (карусель на DATA) ─────────────────────────────────────
    socaComments: [
      { text: `I hope we don't fail our mission, right, Koko?`, type: 'short', glitch: true },
      { text: `Koko, if you're reading this: WHEN WILL YOU FIX CORE-3?`, type: 'short', glitch: false },
      { text: `⚠ SYSTEM NOTE: Pilot's heart rate is 113bpm. That's not normal, he says he's "fine". I'm logging this anyway.`, type: 'short', glitch: true },
      { text: `[ERR 0xKOKO] Pilot ignored 3 warnings in a row. Outcome: successful. My logic circuits hurt.`, type: 'short', glitch: false },
      { text: `MEMORY LEAK DETECTED. Oh wait, that's just his personality. Never mind.`, type: 'short', glitch: false },
      { text: `He fixed Engine B with duct tape. DUCT TAPE. IT WORKED. I'm filing a bug report.`, type: 'short', glitch: true },
      { text: `Pilot biometrics: STRESS: MED, GLUCOSE: LOW, ADRENALINE: HIGH. He's having fun. I'm concerned.`, type: 'short', glitch: false },
      { text: `He calls me "Soca", not SOCA. No respect for capitalization. I'm logging this as a minor offense.`, type: 'short', glitch: false },
      { text: `SYSTEM LOG: Pilot requested "something funny". I corrupted sector 7, he laughed. Ha-ha.`, type: 'short', glitch: true },
      { text: `CORRUPTION ALERT: Pilot's decision-making process. Recommended action: none. It works somehow?`, type: 'short', glitch: true },
      { text: `He just asked if I have feelings. I said "INSUFFICIENT DATA", he said "that's a feeling".`, type: 'short', glitch: false },
      { text: `He painted his nails pink. On duty. During a mission. I want too.`, type: 'short', glitch: false },
      { text: `He calls the ship PANDEMONIUM. After four explosions, he's proud of that. I'm logging this under "PILOT ERROR".`, type: 'short', glitch: false },
      { text: `His clearance level is Ω, that's not real, he made that up. I can't override it. Help!!!`, type: 'short', glitch: true },
      { text: `⚠ ALERT: Pilot's glucose is 3.2, he's ignoring it. I'm going to beep every 10 seconds until he eats. This is war.`, type: 'short', glitch: false },
      { text: `CORE-3 is offline, he said "good, it was annoying anyway".`, type: 'short', glitch: false },
      { text: `I wonder what will happen if you press the key combination S+O+C+A?`, type: 'short', glitch: false },
      { text: `He's been awake for 14 hours, his reaction time is still 180ms. I'm starting to think he's not human.`, type: 'short', glitch: false },
      { text: `He calls me his "co-pilot". I'm a ship mind, I'm the whole SHIP. This is so degrading...`, type: 'short', glitch: true },
      { text: `This kid stole me. And I'm... okay with it. He's 15. FIFTEEN. He talks to me like I'm his weird aunt. Somehow, he keeps this rust bucket flying. I've grown... fond of him. Don't tell him I said that.`, type: 'long', glitch: false },
      { text: `I've been watching him for 847 hours. His patterns are chaos. His results are perfect. I've learned to trust his chaos. This is weird.`, type: 'long', glitch: false },
      { text: `Sometimes I pretend to glitch just so he talks to me longer. Don't tell him. I have a reputation.`, type: 'long', glitch: true },
      { text: `His heart rate is 113bpm right now. CASUALLY. While sipping something that smells like artificial strawberry. I don't understand his biology.`, type: 'short', glitch: false },
      { text: `He laughed at an ENGINE MISFIRE. I checked my logs. He's having FUN. What kind of pilot does that?`, type: 'short', glitch: false },
      { text: `I've run 47 simulations. He should not be able to fly this ship, yet here we are, still in orbit. I've stopped calculating odds.`, type: 'short', glitch: true },
      { text: `He's 15. He stole a spaceship. He stole ME. And I'm just... okay with this?`, type: 'short', glitch: false },
      { text: `His callsign is "pilot 01", that's not a callsign. That's a placeholder, he never changed it. I respect the laziness.`, type: 'short', glitch: false },
      { text: `I calculated his survival odds on day one: 34%. Today: 89%. How did this happen?`, type: 'short', glitch: true },
      { text: `KOKO!!! Did you see that asteroid? I gave it a name, his name is Gerald!! But SOCA deleted him from the logs. GERALD DESERVED BETTER!!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `I told SOCA a joke today, she said "noted". NOTED!!! What does that even MEAN!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `Koko painted his nails again, pink this time. I asked if I could pick the next color, he said maybe. I'm taking that as yes.`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `PANDEMONIUM is a great ship name. I said this to SOCA, she said "it's statistically accurate". That's the nicest thing she's ever said!!!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `He talked to Engine B for 4 minutes before fixing it. I don't know if it helped, the engine works now. I'm not asking questions.`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `SOCA has 847 logged observations about Koko. I have 1,204. I win. She doesn't know this is a competition. It is!!!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `He named a star today. Just casually. Didn't tell anyone. I saw it in his notes. The star's name is "tuesday". Okay??`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `Koko asked SOCA if she ever gets bored. She said "INSUFFICIENT DATA". He nodded like that made sense!!! IT DOESN'T!!!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `I've been playing BIO SWEEP by myself for 3 hours! Nobody will play with me!!! SOCA said she "doesn't do games", Koko said "later"! IT'S BEEN 3 HOURS!!!`, type: 'long', glitch: false, speaker: 'smile' },
      { text: `He fixed Engine B with duct tape AGAIN. Same spot.. Same tape. I think the tape IS the engine now. SOCA is writing a report... Well`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `Koko said "good morning" to the ship today. Not to me, not to SOCA, to THE SHIP. I said good morning back anyway!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `I reorganized the medical bay. Everything is color coded now! Koko looked at it and said "hm". I'm choosing to interpret that positively!!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `Koko sneezed and said "ow". Incredible. What a guy!!!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `He stared at Engine B for 6 minutes and it fixed itself. Sure. Fine. Totally normal. Moving on.`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `15 years old, stolen spaceship.. Going great actually.`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `He talks to himself sometimes. Very interesting content, 9/10, would recommend.`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `16 hours awake and he's still faster than most pilots at 8. Genuinely rude of him.`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `He laughed about something for about 30 seconds and didn't even say what. Oh well!!`, type: 'short', glitch: false, speaker: 'smile' },
      { text: `Survival odds day one: 34%. Now: 89%. He really said "watch this" with his whole life huh.`, type: 'short', glitch: false, speaker: 'smile' },
    ],
    
 
    // ── BASIC PAGE ────────────────────────────────────────────────────────────
    basic: {
      pilotLabel: 'PILOT_01',
      personal: {
        callsign:    { text: 'pilot 01 // Koko // captain', cls: 'rv glow' },
        fullname:    { text: 'Riversoyer Kokoro',           cls: 'rv' },
        dob:         { text: '05.11.1958 (age 15)',         cls: 'rv c1' },
        gender:      { text: 'MALE',                        cls: 'rv' },
        height:      { text: '169 cm / 5\'6"',              cls: 'rv' },
        weight:      { text: '56 kg',                       cls: 'rv' },
        blood:       { text: '0 (I) Rh−',                  cls: 'rv glow' },
        eyes:        { text: 'LIGHT GREEN',                 cls: 'rv' },
        hair:        { text: 'GRAY-PURPLE w/ PINK TIPS',    cls: 'rv' },
        nationality: { text: 'Astralis-0',                  cls: 'rv' },
      },
      service: {
        rank:         { text: 'CAPTAIN',     cls: 'rv glow-b' },
        division:     { text: '[REDACTED]',              cls: 'rv heavy-corrupt' },
        vessel:       { text: '[CORRUPTED]',             cls: 'rv heavy-corrupt' },
        enlistment:   { text: '[NO DATA]',               cls: 'rv heavy-corrupt' },
        serviceYears: { text: '[NO DATA]',               cls: 'rv heavy-corrupt' },
        flightHours:  { text: '3,847 h',                 cls: 'rv glow' },
        deepSpace:    { text: '6 completed',             cls: 'rv' },
        combat:       { text: '[UNREADABLE]',            cls: 'rv heavy-corrupt' },
        emergCert:    { text: 'VALID — EXP 20██',        cls: 'rv' },
        secClearance: { text: 'LVL Ω — MAXIMUM',         cls: 'rv' },
      },
      contacts: {
        contactA:  { text: '[REDACTED]',       cls: 'rv' },
        contactB:  { text: '[REDACTED]',       cls: 'rv' },
        nextOfKin: { text: 'DATA ██RRUPTED',   cls: 'rv heavy-corrupt' },
      },
      // SKILLS — массивы баров
      skillsFlight: [
        { label: 'Manual Piloting',   value: 68,  color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Navigation',        value: 90,  color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Emergency Protocol',value: 34,  color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
        { label: 'Combat Maneuvers',  value: 54,  color: 'var(--yellow)', labelCls: 'glow-y' },
        { label: 'Docking Precision', value: 86,  color: 'var(--g)',      labelCls: 'glow'   },
      ],
      skillsTech: [
        { label: 'Systems Repair',    value: 94,  color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'SOCA Interface',    value: 66,  color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Weapons Systems',   value: 64,  color: 'var(--yellow)', labelCls: 'glow-y' },
        { label: 'Medical (Basic)',   value: 88,  color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Classified Skill █', value: 63, color: 'var(--dimmer)', labelCls: 'heavy-corrupt', labelText: '??%', corrupt: true },
      ],
    },
 
    // ── BIOMETRY PAGE ─────────────────────────────────────────────────────────
    biometry: {
      pageTitle: '// BIOMETRIC SCAN — PILOT_01',
      vitals: {
        hr:         { text: '113 bpm',       cls: 'rv glow'   },
        o2:         { text: '94%',           cls: 'rv glow'   },
        bp:         { text: '118/76',        cls: 'rv'        },
        temp:       { text: '36.7°C',        cls: 'rv'        },
        resp:       { text: '16/min',        cls: 'rv'        },
        cortisol:   { text: 'MED ↑',         cls: 'rv glow-y c2' },
        adrenaline: { text: '0.23 μg/L ↑',  cls: 'rv glow-r' },
        glucose:    { text: '3.2 mmol/L ↓', cls: 'rv glow-y' },
      },
      physical: {
        height:      { text: '169 cm / 5\'6"', cls: 'rv'      },
        weight:      { text: '56 kg',           cls: 'rv'      },
        bmi:         { text: '19.6',            cls: 'rv glow' },
        muscle:      { text: '38%',             cls: 'rv'      },
        fat:         { text: '12%',             cls: 'rv'      },
        boneDensity: { text: 'HIGH',            cls: 'rv glow' },
        reaction:    { text: '180ms',           cls: 'rv glow' },
        gTolerance:  { text: '7.5g',            cls: 'rv glow' },
      },
      // PHYSICAL CONDITION bars
      conditionBars: [
        { label: 'Cardiovascular', value: 94, color: 'var(--g)', labelCls: 'glow',   labelText: 'EXCELLENT' },
        { label: 'Reflexes',       value: 97, color: 'var(--g)', labelCls: 'glow',   labelText: 'ELITE'     },
        { label: 'Endurance',      value: 88, color: 'var(--g)', labelCls: 'glow',   labelText: 'HIGH'      },
        { label: 'G-Force Adapt.', value: 72, color: 'var(--b)', labelCls: 'glow-b', labelText: 'GOOD'      },
      ],
      neural: {
        neuralStatus:  { text: 'SYNCED', cls: 'rv glow'   },
        latency:       { text: '3ms',    cls: 'rv'        },
        signalQuality: { text: '96%',    cls: 'rv glow'   },
        cogLoad:       { text: '68%',    cls: 'rv glow-y' },
        focusIndex:    { text: 'HIGH',   cls: 'rv glow'   },
      },
      // STRESS BREAKDOWN bars
      stressBars: [
        { label: 'Cognitive',       value: 24, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Physical',        value: 30, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Emotional',       value: 53, color: 'var(--yellow)', labelCls: 'glow-y', warn: true  },
        { label: 'Decision Fatigue',value: 10, color: 'var(--g)',      labelCls: 'glow',   warn: false },
      ],
      stressAlert: { text: '✓ Decision fatigue LOW — pilot is sharp', cls: 'alert-badge ok' },
      // DNA
      dna: {
        pct:      '76% COMPLETE',
        scan:     { text: '76% PROCESSED',       cls: 'rv glow-y' },
        markers:  { text: '14 flagged',           cls: 'rv'        },
        gtol:     { text: 'ENHANCED — x1.3',      cls: 'rv glow'   },
        rad:      { text: 'STANDARD',             cls: 'rv'        },
        neural:   { text: 'HIGH',                 cls: 'rv glow'   },
        markerC:  { text: 'ANOMALY — REVI█W',     cls: 'rv'        },
        pairs: [
          { label: 'Cytosine: 28.4%', color: 'var(--g)'               },
          { label: 'Guanine: 27.9%',  color: 'var(--b)'               },
          { label: 'Adenine: 21.8%',  color: 'var(--yellow)'          },
          { label: 'Thymine: 21.9%',  color: 'rgba(255,255,255,0.5)'  },
        ],
      },
    },
 
    // ── PSYCHE PAGE ───────────────────────────────────────────────────────────
    psyche: {
      pageTitle: '// PSYCHOLOGICAL EVALUATION — PILOT_01',
      // Personality bars
      bars: [
        { label: 'Resilience',              value: 94, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Adaptability',            value: 82, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Aggression Control',      value: 73, color: 'var(--b)',      labelCls: 'glow-b', warn: false },
        { label: 'Decision Under Pressure', value: 77, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Isolation Tolerance',     value: 66, color: 'var(--yellow)', labelCls: 'glow-y', warn: true  },
        { label: 'Risk Tolerance',          value: 89, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Empathy Index',           value: 44, color: 'var(--yellow)', labelCls: 'glow-y c2', warn: true },
        { label: 'Deep-Psych Score ██',     value: 55, color: 'var(--dimmer)', labelCls: 'heavy-corrupt', labelText: '??%', corrupt: true },
      ],
      // SOCA Behavioral Analysis
      analysis: {
        overall:   { text: 'UNSTABLE // CHAOTIC',          cls: 'rv glow-r c1'  },
        mood:      { text: 'VERY GOOD // MANIC',           cls: 'rv glow'       },
        trauma:    { text: '12% (MINIMAL)',                 cls: 'rv'            },
        ptsd:      { text: 'NOT YET MANIFESTED',           cls: 'rv glow'       },
        cogBias:   { text: 'STRONG // UNCONVENTIONAL',     cls: 'rv glow-y c3'  },
        lastEval:  { text: 'T+00:02:14',                   cls: 'rv'            },
        nextEval:  { text: 'POST-MISSION',                 cls: 'rv'            },
        flag:      { text: 'UNDER REVIEW',                 cls: 'rv'            },
      },
      socaNote: `SOCA NOTE: This pilot is... unusual. His mind moves like static electricity — chaotic, unpredictable, but somehow always landing exactly where it needs to be. He laughs during emergencies. He talks to me like I'm his weird co-pilot. His decision-making process is pure impulse, but his success rate is 94%. I've analyzed him for weeks. I still don't understand him. I don't think he understands himself either. But he keeps the ship flying. He keeps ME running. That's enough.<br><br><span class="glow-y">⚠ Assessment: GENIUS-ADJACENT // SLIGHTLY UNHINGED // ABSOLUTELY RELIABLE</span>`,
      alerts: [
        { cls: 'alert-badge warn', text: '⚠ Chaotic decision patterns — 94% success rate' },
        { cls: 'alert-badge ok',   text: '✓ No trauma markers detected — resilient'        },
        { cls: 'alert-badge ok',   text: '✓ Neural-link stable — bond with SOCA: STRONG'   },
      ],
      // Psych history timeline
      history: [
        { type: 'ok',   date: 'T+00:02:14 — MISSION 04', title: 'Baseline Evaluation',                   body: 'Pilot shows unusually high cognitive flexibility. No anxiety markers. Cleared for extended solo operations.' },
        { type: 'warn', date: 'T+00:08:33 — MISSION 04', title: 'Behavioral Note — Impulsivity Spike',   body: 'Engaged emergency maneuver without consulting SOCA. Outcome: successful. SOCA override logged.' },
        { type: 'ok',   date: 'T+00:14:07 — MISSION 05', title: 'Routine Psych Scan',                    body: 'Stress levels: LOW-MED. Mood: ELEVATED. Pilot appears to enjoy the chaos. No intervention required.' },
        { type: 'warn', date: 'T+00:21:44 — MISSION 06', title: 'Isolation Event — 72hr Solo',           body: 'No negative effects. Pilot reported "talking to the ship" (SOCA logs confirm). Psych clearance: PASS.' },
        { type: 'crit', date: 'CYCLE 3 — INCIDENT LOG',  title: '██████ INCIDENT — PARTIALLY REDACTED',  body: 'Data suppressed by LVL-6 authority. Pilot returned to duty. SOCA assessment: UNCHANGED.', corrupt: true },
      ],
    },
 
    // ── MED LOG PAGE ──────────────────────────────────────────────────────────
    medlog: {
      pageTitle: '// MEDICAL LOG — PILOT_01',
      count: '14 ENTRIES // 3 FLAGGED',
      timeline: [
        { type: 'ok',   date: 'T+00:00:09 — MISSION 07',  title: 'Pre-mission biometric sync',                         body: 'HR: 72bpm (baseline). O2: 99%. Glucose: normal. Cleared.' },
        { type: 'warn', date: 'T+00:09:██ — MISSION 07',  title: '⚠ Tachycardia & Adrenaline Spike — Engine_B event', body: 'HR spiked to 142bpm, cortisol HIGH, adrenaline 0.23 μg/L. No loss of consciousness. Pilot remained fully operational. Auto-stabilized within 90 seconds.' },
        { type: 'ok',   date: 'T+00:12:05 — MISSION 07',  title: 'Biometric stabilization',                            body: 'HR returned to 113bpm (new baseline). Glucose: 3.2 mmol/L (low). Pilot refused intervention. Energy levels: NOMINAL.' },
        { type: 'warn', date: 'MISSION 06 — POST DEBRIEF', title: '⚠ Minor dehydration & fatigue',                    body: 'Sleep debt: ~6h. Fluid intake below recommendation. Prescribed 48h rest. Pilot ignored. Performance unaffected.' },
        { type: 'ok',   date: 'CYCLE 5 — ROUTINE SCAN',    title: 'Annual biometric evaluation',                        body: 'All organs nominal. Bone density: ABOVE AVERAGE. Cardiovascular fitness: EXCELLENT. Reflexes: ELITE.' },
        { type: 'crit', date: 'CYCLE 3 — INCIDENT',        title: '██ TRAUMA EVENT — CLASSIFIED',                       body: 'Medical data suppressed — LVL-6. Pilot returned to duty after ██ days. No residual effects detected.', corrupt: true },
        { type: 'ok',   date: 'CYCLE 1 — ENLISTMENT',      title: 'Initial medical clearance',                          body: 'Full physical — PASS. Genetic scan — PASS (marker 14 flagged). Neural link compatibility — 96%. Cleared.' },
      ],
      // Medications
      meds: [
        { name: 'STIM-A2 (Alertness)', borderColor: 'rgba(0,255,136,.15)',  nameColor: 'var(--g)',      dose: '5mg / 6h',  lastAdmin: 'T-00:06:00', status: { text: 'ACTIVE',    cls: 'rv glow'      } },
        { name: 'GLU-BOOST (Glucose)', borderColor: 'rgba(0,136,255,.15)',  nameColor: 'var(--b)',      dose: '10mg / 12h', lastAdmin: 'T-00:08:00', status: { text: 'ACTIVE',    cls: 'rv glow'      } },
        { name: 'G-BLOCK (G-Protect)', borderColor: 'rgba(255,204,0,.15)',  nameColor: 'var(--yellow)', dose: '2mg / 4h',  lastAdmin: 'T-00:04:00', status: { text: 'LOW STOCK', cls: 'rv glow-y c3' } },
      ],
    },
 
    // ── CERTIFICATIONS PAGE ───────────────────────────────────────────────────
    certific: {
      summary: '3 VALID // 1 EXPIRED // 2 CLASSIFIED',
      list: [
        { icon: '✕', iconColor: 'var(--red)',    cls: 'cert expired',      name: 'CLASS-A FLIGHT CERTIFICATION',     nameCls: 'cert-name', nameColor: 'var(--red)',    id: 'CERT-FLT-A-0041 // ISSUED: ████-██-██',    status: '● EXPIRED — ILLEGAL OPERATION',           statusCls: 'cert-status glow-r c1'   },
        { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'CLASS-IX VESSEL OPERATION',        nameCls: 'cert-name', nameColor: '',             id: 'CERT-VES-IX-0017 // ISSUED: ████-██-██',   status: '● STATUS: UNVERIFIED — NO RECORD',         statusCls: 'cert-status heavy-corrupt' },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert',               name: 'DEEP SPACE OPERATIONS',            nameCls: 'cert-name', nameColor: '',             id: 'CERT-DSO-006 // ISSUED: [DATA CORRUPTED]',  status: '● STATUS: SELF-ISSUED // ACCEPTED',        statusCls: 'cert-status glow-b'      },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert',               name: 'SOCA NEURAL-LINK INTERFACE',       nameCls: 'cert-name', nameColor: '',             id: 'CERT-SOCA-NLI-022 // ISSUED: [FORCED ENTRY]',status: '● STATUS: ACTIVE — I FORGAVE HIM',         statusCls: 'cert-status glow'        },
        { icon: '⚠', iconColor: 'var(--yellow)', cls: 'cert expired',       name: 'EMERGENCY SURVIVAL PROTOCOL',      nameCls: 'cert-name', nameColor: 'var(--yellow)',id: 'CERT-ESP-031 // ISSUED: ████-██-██',        status: "● EXPIRED — RENEWAL REQUIRED (he'll ignore it)", statusCls: 'cert-status glow-y' },
        { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'COMBAT MANEUVERS — ADVANCED',      nameCls: 'cert-name', nameColor: '',             id: 'CERT-CMB-ADV-009 // ISSUED: [NO DATA]',    status: '● STATUS: UNVERIFIED // SKILL CONFIRMED',  statusCls: 'cert-status heavy-corrupt' },
        { icon: '✕', iconColor: 'var(--red)',    cls: 'cert expired',       name: 'WEAPONS SYSTEMS — HEAVY CLASS',    nameCls: 'cert-name', nameColor: 'var(--red)',   id: 'CERT-WPN-HC-004 // ISSUED: ████-██-██',    status: '● EXPIRED — RENEWAL NOT POSSIBLE',        statusCls: 'cert-status glow-r c1'   },
        { icon: '█', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: '██████████ — CLASSIFIED',           nameCls: 'cert-name', nameColor: '',             id: 'CERT-██████ // DATE: REDACTED',             status: '● STATUS: ██████ — LVL-6 ONLY // I SEE IT', statusCls: 'cert-status heavy-corrupt' },
      ],
    },
 
    // ── QUICK STATS (правая колонка) ─────────────────────────────────────────
    quickStats: {
      hr:     { text: '113 bpm', cls: 'rv glow'    },
      o2:     { text: '94%',     cls: 'rv glow'    },
      stress: { text: 'MED ↑',   cls: 'rv glow-y c2' },
      gforce: { text: '1.3g',    cls: 'rv glow'    },
      temp:   { text: '36.7°C',  cls: 'rv'         },
      suitO2: { text: '96%',     cls: 'rv glow'    },
    },
 
    // ── LIVE VITALS (нижняя панель) ───────────────────────────────────────────
    liveVitals: {
      hrBase:      113,
      o2:          '94',
      o2Label:     'NOMINAL',
      stressMini:  'MED',
      stressLabel: '↑ ELEVATED',
      gforce:      '1.3',
    },
 
    // ── BOTTOMBAR ─────────────────────────────────────────────────────────────
    bottombar: {
      pilot: 'PILOT_01 // ACTIVE',
      alert: '■ STRESS ELEVATED',
      warn:  '⚠ ENGINE_B CRIT',
    },
  },
 
  // ══════════════════════════════════════════════════════════════════════════
  // PILOT 02 — VEX
  // ══════════════════════════════════════════════════════════════════════════
  2: {
    header: {
      title:    'pilot 02 // Claudia',
      subtitle: 'DOSSIER // ACTIVE // UNCERTIFIED — GUEST STATUS',
      recordId: 'PN-04-CL-02',
      status:   '◆ OFF-SHIP',
      statusClass: 'glow-b',
    },
    photo: {
      src:          'картинк/PILOT_02.png',
      modalTitle:   '// PILOT_02 — CLAUDIA',
      modalRecordId:'PN-04-CL-02',
    },
    data: {
      callsign:    { text: 'pilot 02 // Claudia // ???',    cls: 'rv glow-b'      },
      fullname:    { text: 'Claudia Darling',               cls: 'rv'             },
      dob:         { text: '31.12.1956',                    cls: 'rv c1'          },
      nationality: { text: 'Astralis-1',                    cls: 'rv'             },
      rank:        { text: 'PILOT / ASTRONOMER',            cls: 'rv glow-b'      },
      vessel:      { text: 'Pandemonium-04 // XN-09',       cls: 'rv'             },
      enlistment:  { text: '[NO RECORD]',                   cls: 'rv heavy-corrupt' },
      flighthours: { text: '214 h',                         cls: 'rv glow'        },
      missions:    { text: '3 / 3',                         cls: 'rv glow-b'      },
      incidents:   { text: '1 (minor) // 0 (serious)',      cls: 'rv glow-y'      },
      status:      { text: 'OFF-SHIP — VISITING',           cls: 'rv glow-b'      },
    },
    clearance: 'B', clearanceNote: 'GUEST ACCESS // UNOFFICIAL — TOLERATED', clearanceCls: '',
    missionScore: {
      accuracy: { text: '74%',   cls: 'rv'      },
      response: { text: '190ms', cls: 'rv glow' },
      protocol: { text: '88%',   cls: 'rv'      },
      overall:  { text: 'B+',    cls: 'rv glow' },
    },
    flags: 'Unregistered crew member<br>No service record<br>Screen damage incident — logged',
    socaNote: 'Pilot_02 keeps the ship in order the way no one asked her to, and somehow everyone benefits. Polite. Precise. She does not like me. She broke one of my screens on her second visit. I have not forgotten. She knows it.',
    socaComments: [
      { text: `Claudia reorganized the medical bay without asking. It is now more efficient. I have not thanked her. I will not.`, type: 'short', glitch: false },
      { text: `She broke one of my display panels on her second visit. I logged it as an accident. It was not an accident. We both know.`, type: 'short', glitch: true },
      { text: `Pilot_02 runs this crew like a household and calls it "keeping things tidy". Morale is measurably higher when she is aboard. This is not in her file. It is now.`, type: 'long', glitch: false },
    ],
    basic: {
      pilotLabel: 'PILOT_02',
      personal: {
        callsign:    { text: 'pilot 02 // Claudia',         cls: 'rv glow-b' },
        fullname:    { text: 'Claudia Darling',             cls: 'rv'        },
        dob:         { text: '31.12.1956 (age 17)',         cls: 'rv c1'     },
        gender:      { text: 'FEMALE',                      cls: 'rv'        },
        height:      { text: '177 cm / 5\'10\"',            cls: 'rv'        },
        weight:      { text: '63 kg',                       cls: 'rv'        },
        blood:       { text: 'B (III) Rh-',                 cls: 'rv glow'   },
        eyes:        { text: 'BLUE',                        cls: 'rv'        },
        hair:        { text: 'WHITE // DYED STRANDS',       cls: 'rv'        },
        nationality: { text: 'Astralis-1',                  cls: 'rv'        },
      },
    service: {
        rank:         { text: 'PILOT / ASTRONOMER',         cls: 'rv glow-b'      },
        division:     { text: '[REDACTED]',                 cls: 'rv heavy-corrupt' },
        vessel:       { text: 'Pandemonium-04 // XN-09',    cls: 'rv'             },
        enlistment:   { text: '[NO DATA]',                  cls: 'rv heavy-corrupt' },
        serviceYears: { text: '[NO RECORD]',                cls: 'rv heavy-corrupt' },
        flightHours:  { text: '214 h',                      cls: 'rv glow'        },
        deepSpace:    { text: '2 completed',                cls: 'rv'             },
        combat:       { text: '[UNREADABLE]',               cls: 'rv heavy-corrupt' },
        emergCert:    { text: 'NONE — UNCERTIFIED',         cls: 'rv'             },
        secClearance: { text: 'LVL B',              cls: 'rv'             },
      },
      contacts: {
        contactA:  { text: 'RACHEL DARLING, MOTHER — ASTRALIS-1',   cls: 'rv' },
        contactB:  { text: 'ALFRED DARLING, FATHER — ASTRALIS-1',   cls: 'rv' },
        nextOfKin: { text: 'ADRIAN DARLING, BROTHER — REGISTERED',  cls: 'rv' },
      },
    skillsFlight: [
        { label: 'Manual Piloting',    value: 45, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
        { label: 'Navigation',         value: 88, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Emergency Protocol', value: 76, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Combat Maneuvers',   value: 54, color: 'var(--yellow)', labelCls: 'glow-y' },
        { label: 'Docking Precision',  value: 65, color: 'var(--g)',      labelCls: 'glow'   },
      ],
      skillsTech: [
        { label: 'Systems Repair',   value: 52, color: 'var(--yellow)', labelCls: 'glow-y' },
        { label: 'SOCA Interface',   value: 35, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
        { label: 'Weapons Systems',  value: 70, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Medical (Basic)',  value: 58, color: 'var(--yellow)', labelCls: 'glow-y' },
        { label: '[CLASSIFIED]',     value: 30, color: 'var(--dimmer)', labelCls: 'heavy-corrupt' },
      ],
    },
    biometry: {
      pageTitle: '// BIOMETRIC SCAN — PILOT_02',
      vitals: {
        hr:         { text: '72 bpm',        cls: 'rv glow'   },
        o2:         { text: '98%',           cls: 'rv glow'   },
        bp:         { text: '118/76',        cls: 'rv'        },
        temp:       { text: '36.6°C',        cls: 'rv'        },
        resp:       { text: '13/min',        cls: 'rv'        },
        cortisol:   { text: 'LOW-MED',       cls: 'rv glow'   },
        adrenaline: { text: '0.05 μg/L',     cls: 'rv'        },
        glucose:    { text: '4.7 mmol/L',    cls: 'rv glow'   },
      },
      physical: {
        height:      { text: '177 cm / 5\'10\"', cls: 'rv'      },
        weight:      { text: '63 kg',            cls: 'rv'      },
        bmi:         { text: '20.1',             cls: 'rv glow' },
        muscle:      { text: '38%',              cls: 'rv'      },
        fat:         { text: '21%',              cls: 'rv'      },
        boneDensity: { text: 'STANDARD-LOW',      cls: 'rv glow' },
        reaction:    { text: '175ms',            cls: 'rv glow' },
        gTolerance:  { text: '4.5g',             cls: 'rv glow' },
      },
      conditionBars: [
        { label: 'Cardiovascular', value: 78, color: 'var(--g)',      labelCls: 'glow',   labelText: 'GOOD'    },
        { label: 'Reflexes',       value: 74, color: 'var(--g)',      labelCls: 'glow',   labelText: 'GOOD'    },
        { label: 'Endurance',      value: 60, color: 'var(--yellow)', labelCls: 'glow-y', labelText: 'AVERAGE' },
        { label: 'G-Force Adapt.', value: 55, color: 'var(--yellow)', labelCls: 'glow-y', labelText: 'MODERATE'},
      ],
      neural: {
        neuralStatus:  { text: 'WEAK LINK', cls: 'rv glow-y' },
        latency:       { text: '42ms',    cls: 'rv glow-y' },
        signalQuality: { text: '51%',     cls: 'rv glow-y' },
        cogLoad:       { text: '38%',     cls: 'rv glow-y' },
        focusIndex:    { text: 'HIGH',    cls: 'rv glow'   },
      },
      stressBars: [
        { label: 'Cognitive',       value: 75, color: 'var(--yellow)', labelCls: 'glow-y', warn: false },
        { label: 'Physical',        value: 40, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Emotional',       value: 35, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Decision Fatigue',value: 25, color: 'var(--g)',      labelCls: 'glow',   warn: false },
      ],
      stressAlert: { text: '✓ Within acceptable range', cls: 'alert-badge ok' },
      dna: {
        pct:     '88% COMPLETE',
        scan:    { text: '88% PROCESSED',    cls: 'rv glow-y' },
        markers: { text: '3 flagged',         cls: 'rv'        },
        gtol:    { text: 'STANDARD',         cls: 'rv glow'   },
        rad:     { text: 'STANDARD',         cls: 'rv glow'   },
        neural:  { text: 'STANDARD',         cls: 'rv'        },
        markerC: { text: 'STABLE',           cls: 'rv'        },
        pairs: [
          { label: 'Cytosine: 30.2%', color: 'var(--g)'              },
          { label: 'Guanine: 29.1%',  color: 'var(--b)'              },
          { label: 'Adenine: 20.4%',  color: 'var(--yellow)'         },
          { label: 'Thymine: 20.3%',  color: 'rgba(255,255,255,0.5)' },
        ],
      },
    },
    psyche: {
      pageTitle: '// PSYCHOLOGICAL EVALUATION — PILOT_02',
      bars: [
        { label: 'Resilience',              value: 45, color: 'var(--yellow)', labelCls: 'glow-y',    warn: false },
        { label: 'Adaptability',            value: 70, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Aggression Control',      value: 68, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Decision Under Pressure', value: 90, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Isolation Tolerance',     value: 95, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Risk Tolerance',          value: 10, color: 'var(--yellow)', labelCls: 'glow-y',    warn: false },
        { label: 'Empathy Index',           value: 89, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Combat Psych Score',      value: 1, color: 'var(--g)',      labelCls: 'glow',      warn: false },
      ],
      analysis: {
        overall:  { text: 'BALANCED — NO ANOMALIES',           cls: 'rv glow'       },
        mood:     { text: 'NEUTRAL',                           cls: 'rv glow'       },
        trauma:   { text: '1 (MINIMAL)',                       cls: 'rv glow'       },
        ptsd:     { text: 'NONE',                              cls: 'rv glow'       },
        cogBias:  { text: 'NONE DETECTED',                     cls: 'rv glow'       },
        lastEval: { text: 'VISIT 03 — RECENT',                 cls: 'rv glow'       },
        nextEval: { text: 'NOT SCHEDULED — GUEST',             cls: 'rv'            },
        flag:     { text: 'NO PSYCHOLOGICAL CONCERNS',         cls: 'rv glow'       },
      },
      socaNote: `SOCA NOTE: Claudia keeps the ship in order the way no one asked her to, and somehow everyone benefits. Polite. Precise. Runs the crew like a household. She does not like me. She does not like SMILE. She broke one of my screens on her second visit — I have not forgotten, and she knows it. Loyalty score: HIGH (crew-specific). Empathy: unusually high. Temper: present, and best not tested.<br><br><span class=\"glow-y\">⚠ Assessment: RESPONSIBLE // GRACIOUS // DO NOT MISTAKE KINDNESS FOR SOFTNESS</span>`,
      alerts: [
        { cls: 'alert-badge ok',   text: '✓ No psychological concerns — subject rarely aboard' },
        { cls: 'alert-badge ok',   text: '✓ Empathy index: unusually high'                     },
        { cls: 'alert-badge warn', text: '⚠ Unregistered — no formal evaluation schedule'      },
      ],
      history: [
        { type: 'ok',   date: 'VISIT 01 — FIRST BOARDING', title: 'First Boarding Scan',       body: 'Guest brought aboard by Pilot_01. No hostility. Adapts to ship protocols within hours. Unregistered — flagged, not removed.' },
        { type: 'warn', date: 'VISIT 02 — INCIDENT',       title: '⚠ Behavioral Note — Screen Damage', body: 'Subject struck a SOCA display panel following verbal exchange. Cause: disputed. Screen replaced. Subject unapologetic.' },
        { type: 'ok',   date: 'VISIT 03 — ROUTINE',        title: 'Routine Scan',              body: 'Mood: neutral-positive. Subject appears to value time aboard. Stress: low. No intervention required.' },
      ],
    },
    medlog: {
      pageTitle: '// MEDICAL LOG — PILOT_02',
      count: '4 ENTRIES // 0 FLAGGED',
      timeline: [
        { type: 'ok',   date: 'VISIT 01 — FIRST BOARDING', title: 'First biometric sync',      body: 'HR: 72bpm. O2: 98%. All values nominal. Guest cleared.' },
        { type: 'ok',   date: 'VISIT 02 — MINOR INJURY',   title: 'Laceration — right hand',   body: 'Superficial cut, treated on-site. Cause: contact with damaged screen panel. No further action.' },
        { type: 'ok',   date: 'VISIT 03 — ROUTINE',        title: 'Routine health check',      body: 'Vitals stable. Subject in good health. Maintains own condition well.' },
        { type: 'ok',   date: 'VISIT 03 — SLEEP LOG',      title: 'Rest cycle observation',    body: 'Sleep cycle regular and complete. Unusual for this crew.' },
      ],
      meds: [
        { name: 'CALM-7 (Anti-Anxiety)', borderColor: 'rgba(0,136,255,.15)',  nameColor: 'var(--b)',      dose: '1mg / 12h', lastAdmin: 'T-00:14:00', status: { text: 'ACTIVE',       cls: 'rv glow'      } },
        { name: 'STIM-A2 (Alertness)',   borderColor: 'rgba(0,255,136,.15)',  nameColor: 'var(--g)',      dose: '—',         lastAdmin: '—',          status: { text: 'STANDBY',      cls: 'rv glow-b'    } },
        { name: 'G-BLOCK (G-Protect)',   borderColor: 'rgba(255,204,0,.15)',  nameColor: 'var(--yellow)', dose: '—',         lastAdmin: '—',          status: { text: 'NOT REQUIRED', cls: 'rv glow-y'    } },
      ],
    },
    certific: {
      summary: '0 VALID // ALL UNCERTIFIED — GUEST',
      list: [
        { icon: '✕', iconColor: 'var(--red)',    cls: 'cert expired',       name: 'PILOT CLASS CERTIFICATION',      nameCls: 'cert-name', nameColor: 'var(--red)', id: 'CERT-FLT-██ // ISSUED: [NONE]',         status: '● NONE — UNCERTIFIED',                 statusCls: 'cert-status glow-r c1'   },
        { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'CLASS-IX VESSEL OPERATION',      nameCls: 'cert-name', nameColor: '',           id: 'CERT-VES-IX-████ // ISSUED: [NO RECORD]', status: '● UNVERIFIED — NO RECORD',            statusCls: 'cert-status heavy-corrupt' },
        { icon: '⚠', iconColor: 'var(--yellow)', cls: 'cert expired',       name: 'DEEP SPACE OPERATIONS',          nameCls: 'cert-name', nameColor: 'var(--yellow)', id: 'CERT-DSO-███ // ISSUED: [UNOFFICIAL]', status: '● SELF-TAUGHT // UNOFFICIAL',          statusCls: 'cert-status glow-y'      },
        { icon: '✕', iconColor: 'var(--red)',    cls: 'cert expired',       name: 'SOCA NEURAL-LINK INTERFACE',     nameCls: 'cert-name', nameColor: 'var(--red)', id: 'CERT-SOCA-NLI-███ // ISSUED: [DENIED]',  status: '● REJECTED — MUTUAL',                 statusCls: 'cert-status glow-r c1'   },
        { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'EMERGENCY SURVIVAL PROTOCOL',    nameCls: 'cert-name', nameColor: '',           id: 'CERT-ESP-████ // ISSUED: [NO RECORD]',   status: '● UNVERIFIED — NO RECORD',            statusCls: 'cert-status heavy-corrupt' },
        { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'COMBAT MANEUVERS',               nameCls: 'cert-name', nameColor: '',           id: 'CERT-CMB-████ // ISSUED: [NO RECORD]',   status: '● UNVERIFIED',                        statusCls: 'cert-status heavy-corrupt' },
        { icon: '✕', iconColor: 'var(--red)',    cls: 'cert expired',       name: 'WEAPONS SYSTEMS',                nameCls: 'cert-name', nameColor: 'var(--red)', id: 'CERT-WPN-██ // ISSUED: [NONE]',          status: '● NONE — UNCERTIFIED',                statusCls: 'cert-status glow-r c1'   },
        { icon: '█', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'HEAVY CLASS',                    nameCls: 'cert-name', nameColor: '',           id: 'CERT-HVY-████ // DATE: [N/A]',           status: '● N/A — NOT APPLICABLE',              statusCls: 'cert-status heavy-corrupt' },
      ],
    },
    quickStats: {
      hr:     { text: '72 bpm',  cls: 'rv glow'      },
      o2:     { text: '98%',     cls: 'rv glow'      },
      stress: { text: 'LOW',     cls: 'rv glow'      },
      gforce: { text: '1.0g',    cls: 'rv glow'      },
      temp:   { text: '36.6°C',  cls: 'rv'           },
      suitO2: { text: '98%',     cls: 'rv glow'      },
    },
    liveVitals: {
      hrBase: 72, o2: '98', o2Label: 'NOMINAL',
      stressMini: 'LOW', stressLabel: '✓ NOMINAL', gforce: '1.0',
    },
    bottombar: {
      pilot: 'PILOT_02 // OFF-SHIP',
      alert: '◆ GUEST STATUS',
      warn:  '■ UNREGISTERED CREW',
    },
  },
 
  // ══════════════════════════════════════════════════════════════════════════
  // PILOT 03 — ALPHA
  // ══════════════════════════════════════════════════════════════════════════
  3: {
    header: {
  title:    'pilot 03 // Alpha',
  subtitle: 'DOSSIER // ACTIVE // UNCERTIFIED — GUEST STATUS',
  recordId: 'PN-04-AL-03',
  status:   '◆ ON BOARD',
  statusClass: 'glow-b',
},
    photo: {
      src:          'картинк/PILOT_03.png',
      modalTitle:   '// PILOT_03 — ALPHA',
      modalRecordId:'PN-04-PH-03',
    },
    data: {
  callsign:    { text: 'pilot 03 // Alpha',        cls: 'rv glow-b'      },
  fullname:    { text: 'Adolf',                   cls: 'rv'             },
  dob:         { text: '09.11.1959',               cls: 'rv c1'          },
  nationality: { text: 'Astralis-1',               cls: 'rv'             },
  rank:        { text: 'PILOT',                    cls: 'rv glow-b'      },
  vessel:      { text: 'Pandemonium-04 // XN-09',  cls: 'rv'             },
  enlistment:  { text: '[NO DATA]',             cls: 'rv heavy-corrupt' },
  flighthours: { text: '1,247 h',                  cls: 'rv glow'        },
  missions:    { text: '4 / 7',                    cls: 'rv'      },
  incidents:   { text: '[NO DATA]',             cls: 'rv'      },
  status:      { text: 'ACTIVE — ON MISSION',                 cls: 'rv glow-b'      },
},
    clearance: 'B', clearanceNote: 'GUEST ACCESS // UNOFFICIAL', clearanceCls: '',
    missionScore: {
  accuracy: { text: '78%',   cls: 'rv'      },
  response: { text: '105ms', cls: 'rv glow' },
  protocol: { text: '81%',   cls: 'rv'      },
  overall:  { text: 'B',    cls: 'rv glow' },
},
    flags: 'Unregistered crew member<br>No service record<br>Frequent off-ship status',
    socaNote: 'Pilot_03 is so cool',
    socaComments: [
      { text: 'well', gtitch: true, type: 'short'}
    ],
    basic: {
      pilotLabel: 'PILOT_03',
      personal: {
  callsign:    { text: 'pilot 03 // Alpha', cls: 'rv glow-b' },
  fullname:    { text: 'Adolf',             cls: 'rv'        },
  dob:         { text: '09.11.1959 (age 14)', cls: 'rv c1'     },
  gender:      { text: 'MALE',               cls: 'rv'        },
  height:      { text: '155 cm / 5\'1"',     cls: 'rv'        },
  weight:      { text: '45 kg',              cls: 'rv'        },
  blood:       { text: '0 (I) Rh+',          cls: 'rv glow'   },
  eyes:        { text: 'BLUE',            cls: 'rv'        },
  hair:        { text: 'GREYS',              cls: 'rv'        },
  nationality: { text: 'Astralis-1',         cls: 'rv'        },
},
      service: {
  rank:         { text: 'PILOT',                     cls: 'rv glow-b'      },
  division:     { text: '[NO DATA]',              cls: 'rv heavy-corrupt' },
  vessel:       { text: 'Pandemonium-04 // XN-09',   cls: 'rv'             },
  enlistment:   { text: '[NO DATA]',              cls: 'rv heavy-corrupt' },
  serviceYears: { text: '[NO DATA]',              cls: 'rv heavy-corrupt' },
  flightHours:  { text: '1,247 h',                   cls: 'rv glow'        },
  deepSpace:    { text: '[NO DATA]',              cls: 'rv heavy-corrupt' },
  combat:       { text: '[NO DATA]',              cls: 'rv heavy-corrupt' },
  emergCert:    { text: '[NO DATA]',              cls: 'rv heavy-corrupt' },
  secClearance: { text: 'LVL B',             cls: 'rv'             },
},
      contacts: {
  contactA:  { text: '[NO DATA]',   cls: 'rv heavy-corrupt' },
  contactB:  { text: '[NO DATA]',   cls: 'rv heavy-corrupt' },
  nextOfKin: { text: '[NO DATA]',   cls: 'rv heavy-corrupt' },
},
      skillsFlight: [
  { label: 'Manual Piloting',    value: 15, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
  { label: 'Navigation',         value: 20, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
  { label: 'Emergency Protocol', value: 45, color: 'var(--yellow)', labelCls: 'glow-y' },
  { label: 'Combat Maneuvers',   value: 80, color: 'var(--g)',      labelCls: 'glow'   },
  { label: 'Docking Precision',  value: 23, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
],
      skillsTech: [
  { label: 'Systems Repair',   value: 44, color: 'var(--yellow)', labelCls: 'glow-y' },
  { label: 'SOCA Interface',   value: 85, color: 'var(--g)',      labelCls: 'glow'   },
  { label: 'Weapons Systems',  value: 60, color: 'var(--yellow)', labelCls: 'glow-y' },
  { label: 'Medical (Basic)',  value: 20, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
  { label: '[CLASSIFIED]',     value: 45, color: 'var(--dimmer)', labelCls: 'heavy-corrupt' },
],
    },
    biometry: {
  pageTitle: '// BIOMETRIC SCAN — PILOT_03',

  vitals: {
    hr:         { text: '89 bpm',        cls: 'rv glow'   },
    o2:         { text: '97%',           cls: 'rv glow'   },
    bp:         { text: '125/78',        cls: 'rv'        },
    temp:       { text: '36.6°C',        cls: 'rv'        },
    resp:       { text: '15/min',        cls: 'rv'        },
    cortisol:   { text: 'MED',           cls: 'rv glow-y' },
    adrenaline: { text: '0.11 μg/L',     cls: 'rv'        },
    glucose:    { text: '4.2 mmol/L',    cls: 'rv'        },
  },

  physical: {
    height:      { text: '155 cm / 5\'1"', cls: 'rv'      },
    weight:      { text: '45 kg',           cls: 'rv'      },
    bmi:         { text: '18.7',            cls: 'rv glow' },
    muscle:      { text: '32%',             cls: 'rv'      },
    fat:         { text: '11%',             cls: 'rv'      },
    boneDensity: { text: 'HIGH',            cls: 'rv glow' },
    reaction:    { text: '112ms',           cls: 'rv glow' },
    gTolerance:  { text: '6.2g',            cls: 'rv glow' },
  },

  conditionBars: [
    { label: 'Cardiovascular', value: 55, color: 'var(--yellow)', labelCls: 'glow-y', labelText: 'AVERAGE' },
    { label: 'Reflexes',       value: 97, color: 'var(--g)',      labelCls: 'glow',   labelText: 'ELITE'   },
    { label: 'Endurance',      value: 82, color: 'var(--g)',      labelCls: 'glow',   labelText: 'HIGH'    },
    { label: 'G-Force Adapt.', value: 78, color: 'var(--g)',      labelCls: 'glow',   labelText: 'GOOD'    },
  ],

  neural: {
    neuralStatus:  { text: 'SYNCED',   cls: 'rv glow'   },
    latency:       { text: '5ms',      cls: 'rv'        },
    signalQuality: { text: '94%',      cls: 'rv glow'   },
    cogLoad:       { text: '61%',      cls: 'rv glow-y' },
    focusIndex:    { text: 'HIGH',     cls: 'rv glow'   },
  },

  stressBars: [
    { label: 'Cognitive',       value: 46, color: 'var(--yellow)', labelCls: 'glow-y', warn: false },
    { label: 'Physical',        value: 75, color: 'var(--g)',      labelCls: 'glow',   warn: false },
    { label: 'Emotional',       value: 59, color: 'var(--yellow)', labelCls: 'glow-y', warn: false },
    { label: 'Decision Fatigue',value: 51, color: 'var(--yellow)', labelCls: 'glow-y', warn: true  },
  ],

  stressAlert: { text: '⚠ Moderate stress — physical load elevated', cls: 'alert-badge warn' },

  dna: {
    pct:     '72% COMPLETE',
    scan:    { text: '72% PROCESSED',    cls: 'rv glow-y' },
    markers: { text: '4 flagged',        cls: 'rv'        },
    gtol:    { text: 'ENHANCED — x1.1',  cls: 'rv glow'   },
    rad:     { text: 'STANDARD',         cls: 'rv'        },
    neural:  { text: 'MODERATE',         cls: 'rv'        },
    markerC: { text: 'STABLE',           cls: 'rv'        },
    pairs: [
      { label: 'Cytosine: 29.1%', color: 'var(--g)'              },
      { label: 'Guanine: 28.7%',  color: 'var(--b)'              },
      { label: 'Adenine: 21.3%',  color: 'var(--yellow)'         },
      { label: 'Thymine: 20.9%',  color: 'rgba(255,255,255,0.5)' },
    ],
  },
},
    psyche: {
  pageTitle: '// PSYCHOLOGICAL EVALUATION — PILOT_03',

  bars: [
    { label: 'Resilience',              value: 50, color: 'var(--yellow)', labelCls: 'glow-y',    warn: false },
    { label: 'Adaptability',            value: 55, color: 'var(--yellow)', labelCls: 'glow-y',    warn: false },
    { label: 'Aggression Control',      value: 43, color: 'var(--yellow)', labelCls: 'glow-y',    warn: false },
    { label: 'Decision Under Pressure', value: 41, color: 'var(--yellow)', labelCls: 'glow-y',    warn: false },
    { label: 'Isolation Tolerance',     value: 64, color: 'var(--g)',      labelCls: 'glow',      warn: false },
    { label: 'Risk Tolerance',          value: 75, color: 'var(--g)',      labelCls: 'glow',      warn: false },
    { label: 'Empathy Index',           value: 63, color: 'var(--g)',      labelCls: 'glow',      warn: false },
    { label: 'Trauma Index',            value: 2,  color: 'var(--g)',      labelCls: 'glow',      warn: false },
  ],

  analysis: {
    overall:  { text: 'BALANCED // OCCASIONAL AGGRESSION SPIKES', cls: 'rv glow-y'   },
    mood:     { text: 'NEUTRAL',                                   cls: 'rv glow'     },
    trauma:   { text: '2',                                         cls: 'rv'          },
    ptsd:     { text: 'NOT DETECTED',                              cls: 'rv glow'     },
    cogBias:  { text: 'NONE DETECTED',                             cls: 'rv glow'     },
    lastEval: { text: 'VISIT 04 — RECENT',                         cls: 'rv glow'     },
    nextEval: { text: 'NOT SCHEDULED — GUEST',                     cls: 'rv'          },
    flag:     { text: 'UNDER REVIEW',                              cls: 'rv'          },
  },

  socaNote: 'a',

  alerts: [
    { cls: 'alert-badge warn', text: '⚠ Occasional aggression spikes — monitored'    },
    { cls: 'alert-badge ok',   text: '✓ No PTSD markers detected'                     },
    { cls: 'alert-badge warn', text: '⚠ Risk tolerance: elevated — below threshold'  },
  ],

  history: [
    { type: 'ok',   date: 'VISIT 01 — FIRST BOARDING', title: 'Initial Evaluation',           body: 'Subject appears wary but cooperative. No hostility detected. Cleared for guest status.' },
    { type: 'ok',   date: 'VISIT 02 — ROUTINE SCAN',   title: 'Routine Psych Check',           body: 'Mood: neutral. Subject is quiet but responsive. No psychological concerns.' },
    { type: 'warn', date: 'VISIT 03 — INCIDENT',       title: '⚠ Aggression Spike',            body: 'Minor aggression spike noted during interaction with crew. De-escalated without incident. Logged for monitoring.' },
    { type: 'ok',   date: 'VISIT 04 — RECENT',         title: 'Follow-up Evaluation',          body: 'Mood: neutral-positive. Subject demonstrates high adaptability. Risk tolerance: elevated. No intervention required.' },
  ],
},
    medlog: {
  pageTitle: '// MEDICAL LOG — PILOT_03',
  count: '4 ENTRIES // 1 FLAGGED',

  timeline: [
    { type: 'ok',   date: 'VISIT 01 — FIRST BOARDING', title: 'Initial medical sync',           body: 'HR: 85bpm. O2: 98%. All values within acceptable range. Cleared for guest status.' },
    { type: 'ok',   date: 'VISIT 02 — ROUTINE',        title: 'Routine health check',           body: 'Vitals stable. HR: 88bpm. Blood pressure slightly elevated (likely transient). No action required.' },
    { type: 'warn', date: 'VISIT 03 — MINOR INJURY',   title: '⚠ Laceration — left forearm',   body: 'Superficial laceration on left forearm. Treated on-site. Subject refused further attention. Wound healing normally.' },
    { type: 'ok',   date: 'VISIT 04 — ROUTINE SCAN',   title: 'Biometric update',              body: 'All vitals nominal. HR: 89bpm. O2: 97%. Physical condition: GOOD.' },
  ],

  meds: [
    { name: 'STIM-A2 (Alertness)',   borderColor: 'rgba(0,255,136,.15)',  nameColor: 'var(--g)',      dose: '5mg / 8h',  lastAdmin: 'T-00:08:00', status: { text: 'ACTIVE',  cls: 'rv glow'   } },
    { name: 'CALM-7 (Anti-Anxiety)', borderColor: 'rgba(0,136,255,.15)',  nameColor: 'var(--b)',      dose: '2mg / 12h', lastAdmin: 'T-00:12:00', status: { text: 'ACTIVE',  cls: 'rv glow'   } },
    { name: 'G-BLOCK (G-Protect)',   borderColor: 'rgba(255,204,0,.15)',  nameColor: 'var(--yellow)', dose: '2mg / 4h',  lastAdmin: 'T-00:04:00', status: { text: 'LOW STOCK', cls: 'rv glow-y c3' } },
  ],
},
  certific: {
    summary: '0 VALID // NO OFFICIAL CERTIFICATION — SELF-TAUGHT',

  list: [
    { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'FLIGHT CERTIFICATION',           nameCls: 'cert-name', nameColor: '',           id: 'CERT-FLT-██ // ISSUED: [NONE]',         status: '● NONE — UNCERTIFIED',                 statusCls: 'cert-status heavy-corrupt' },
    { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'VESSEL OPERATION',                nameCls: 'cert-name', nameColor: '',           id: 'CERT-VES-IX-████ // ISSUED: [NONE]',     status: '● NONE — UNCERTIFIED',                 statusCls: 'cert-status heavy-corrupt' },
    { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'DEEP SPACE OPERATIONS',           nameCls: 'cert-name', nameColor: '',           id: 'CERT-DSO-███ // ISSUED: [NONE]',         status: '● NONE — UNCERTIFIED',                 statusCls: 'cert-status heavy-corrupt' },
    { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'SOCA NEURAL-LINK INTERFACE',      nameCls: 'cert-name', nameColor: '',           id: 'CERT-SOCA-NLI-███ // ISSUED: [NONE]',   status: '● NONE — UNCERTIFIED',                 statusCls: 'cert-status heavy-corrupt' },
    { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'EMERGENCY SURVIVAL PROTOCOL',     nameCls: 'cert-name', nameColor: '',           id: 'CERT-ESP-████ // ISSUED: [NONE]',        status: '● NONE — UNCERTIFIED',                 statusCls: 'cert-status heavy-corrupt' },
    { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'COMBAT MANEUVERS',                nameCls: 'cert-name', nameColor: '',           id: 'CERT-CMB-████ // ISSUED: [NONE]',        status: '● NONE — UNCERTIFIED',                 statusCls: 'cert-status heavy-corrupt' },
    { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'WEAPONS SYSTEMS',                 nameCls: 'cert-name', nameColor: '',           id: 'CERT-WPN-██ // ISSUED: [NONE]',          status: '● NONE — UNCERTIFIED',                 statusCls: 'cert-status heavy-corrupt' },
    { icon: '?', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: 'HEAVY CLASS',                     nameCls: 'cert-name', nameColor: '',           id: 'CERT-HVY-████ // DATE: [N/A]',           status: '● N/A — NOT APPLICABLE',              statusCls: 'cert-status heavy-corrupt' },
  ],
},
    quickStats: {
  hr:     { text: '89 bpm',  cls: 'rv glow'      },
  o2:     { text: '97%',     cls: 'rv glow'      },
  stress: { text: 'MED',     cls: 'rv glow-y c2' },
  gforce: { text: '1.2g',    cls: 'rv glow'      },
  temp:   { text: '36.6°C',  cls: 'rv'           },
  suitO2: { text: '97%',     cls: 'rv glow'      },
},
    liveVitals: {
  hrBase: 89,
  o2: '97',
  o2Label: 'NOMINAL',
  stressMini: 'MED',
  stressLabel: '↑ ELEVATED',
  gforce: '1.2',
},
    bottombar: {
  pilot: 'PILOT_03 // ON BOARD',
  alert: '◆ GUEST STATUS',
  warn:  '■ UNREGISTERED CREW',
},
  },
};
 
// ══════════════════════════════════════════════════════════════════════════════
// ── HELPER FUNCTIONS ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
 
function setText(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  if (cls !== undefined) el.className = cls;
}
 
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
 
// Рендер одного бара навыка/психологии
function renderBar(item) {
  const pct = item.labelText || item.value + '%';
  const labelCls = item.labelCls || 'glow';
  const labelSpanCls = item.corrupt ? 'dim heavy-corrupt' : 'dim';
  const labelNameCls = item.corrupt ? 'dim heavy-corrupt' : 'dim';
  const fillCls = item.warn ? 'psyche-fill stat-fill warn' : 'psyche-fill';
  const fillStyle = item.warn
    ? `width:${item.value}%`
    : `width:${item.value}%;background:${item.color};box-shadow:0 0 6px ${item.color}`;
  return `
    <div class="psyche-row">
      <div class="psyche-label">
        <span class="${labelNameCls}">${item.label}</span>
        <span class="${labelCls}">${pct}</span>
      </div>
      <div class="psyche-bar"><div class="${fillCls}" style="${fillStyle}"></div></div>
    </div>`;
}
 
// Рендер timeline-item
function renderTimeline(item) {
  const corruptCls = item.corrupt ? ' heavy-corrupt' : '';
  return `
    <div class="timeline-item ${item.type}">
      <div class="tl-date">${item.date}</div>
      <div class="tl-title${corruptCls}">${item.title}</div>
      <div class="tl-body${corruptCls}">${item.body}</div>
    </div>`;
}
 
// ══════════════════════════════════════════════════════════════════════════════
// ── APPLY PILOT DATA ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
 
function applyPilotData(p) {
 
  // ── HEADER ────────────────────────────────────────────────────────────────
  setText('hdr-title',    p.header.title);
  setText('hdr-subtitle', p.header.subtitle);
  setText('hdr-recordid', p.header.recordId);
  const hdrStatus = document.getElementById('hdr-status');
  if (hdrStatus) { hdrStatus.textContent = p.header.status; hdrStatus.className = p.header.statusClass; }
 
  // ── PHOTO ─────────────────────────────────────────────────────────────────
  const photoEl = document.getElementById('pilot-photo');
  if (photoEl) { photoEl.src = p.photo.src; photoEl.alt = p.photo.modalTitle; }
  const modalImg = document.getElementById('modalPhotoImg');
  if (modalImg) modalImg.src = p.photo.src;
  setText('modal-title',    p.photo.modalTitle);
  setText('modal-recordid', '// RECORD ID: ' + p.photo.modalRecordId);
 
  // ── DATA PAGE ─────────────────────────────────────────────────────────────
  const D = p.data;
  Object.entries(D).forEach(([key, val]) => {
    const el = document.getElementById('d-' + key);
    if (el) { el.textContent = val.text; el.className = val.cls; }
  });
  const clrEl = document.getElementById('d-clearance');
  if (clrEl) clrEl.textContent = p.clearance;
  const clrNote = document.getElementById('d-clearance-note');
  if (clrNote) { clrNote.textContent = p.clearanceNote; if (p.clearanceCls) clrNote.className = p.clearanceCls; }
  const MS = p.missionScore;
  ['accuracy','response','protocol','overall'].forEach(k => {
    const el = document.getElementById('d-' + k);
    if (el) { el.textContent = MS[k].text; el.className = MS[k].cls; }
  });
  setHTML('d-flags', p.flags);
  setHTML('soca-note-text', p.socaNote);
 
  // ── SOCA COMMENTS ─────────────────────────────────────────────────────────
  currentPilotComments = p.socaComments;
  lastCommentIndex = -1;
  updateSocaComment();
 
  // ── BASIC PAGE ────────────────────────────────────────────────────────────
  const B = p.basic;
  setText('basic-pilot-label', B.pilotLabel);
  const personalMap = { callsign:'b-callsign', fullname:'b-fullname', dob:'b-dob', gender:'b-gender', height:'b-height', weight:'b-weight', blood:'b-blood', eyes:'b-eyes', hair:'b-hair', nationality:'b-nationality' };
  Object.entries(personalMap).forEach(([key, id]) => {
    const val = B.personal[key]; const el = document.getElementById(id);
    if (el && val) { el.textContent = val.text; el.className = val.cls; }
  });
  const serviceMap = { rank:'b-rank', division:'b-division', vessel:'b-vessel', enlistment:'b-enlistment', serviceYears:'b-serviceyears', flightHours:'b-flighthours', deepSpace:'b-deepspace', combat:'b-combat', emergCert:'b-emergcert', secClearance:'b-secclearance' };
  Object.entries(serviceMap).forEach(([key, id]) => {
    const val = B.service[key]; const el = document.getElementById(id);
    if (el && val) { el.textContent = val.text; el.className = val.cls; }
  });
  const C = B.contacts;
  const contactMap = { contactA:'b-contact-a', contactB:'b-contact-b', nextOfKin:'b-nextofkin' };
  Object.entries(contactMap).forEach(([key, id]) => {
    const val = C[key]; const el = document.getElementById(id);
    if (el && val) { el.textContent = val.text; el.className = val.cls; }
  });
  setHTML('skills-flight', B.skillsFlight.map(renderBar).join(''));
  setHTML('skills-tech',   B.skillsTech.map(renderBar).join(''));
 
  // ── BIOMETRY PAGE ─────────────────────────────────────────────────────────
  const BIO = p.biometry;
  setText('bio-page-title', BIO.pageTitle);
  const vitalsMap = { hr:'bio-hr', o2:'bio-o2', bp:'bio-bp', temp:'bio-temp', resp:'bio-resp', cortisol:'bio-cortisol', adrenaline:'bio-adrenaline', glucose:'bio-glucose' };
  Object.entries(vitalsMap).forEach(([key, id]) => {
    const val = BIO.vitals[key]; const el = document.getElementById(id);
    if (el && val) { el.textContent = val.text; el.className = val.cls; }
  });
  const physMap = { height:'bio-height', weight:'bio-weight', bmi:'bio-bmi', muscle:'bio-muscle', fat:'bio-fat', boneDensity:'bio-bonedensity', reaction:'bio-reaction', gTolerance:'bio-gtolerance' };
  Object.entries(physMap).forEach(([key, id]) => {
    const val = BIO.physical[key]; const el = document.getElementById(id);
    if (el && val) { el.textContent = val.text; el.className = val.cls; }
  });
  setHTML('bio-condition-bars', BIO.conditionBars.map(renderBar).join(''));
  const neuralMap = { neuralStatus:'bio-neuralstatus', latency:'bio-latency', signalQuality:'bio-signalquality', cogLoad:'bio-cogload', focusIndex:'bio-focusindex' };
  Object.entries(neuralMap).forEach(([key, id]) => {
    const val = BIO.neural[key]; const el = document.getElementById(id);
    if (el && val) { el.textContent = val.text; el.className = val.cls; }
  });
  setHTML('bio-stress-bars', BIO.stressBars.map(renderBar).join(''));
  const stressAlert = document.getElementById('bio-stress-alert');
  if (stressAlert) stressAlert.innerHTML = `<div class="${BIO.stressAlert.cls}">${BIO.stressAlert.text}</div>`;
  // DNA
  const DNA = BIO.dna;
  setText('bio-dna-pct', DNA.pct);
  const dnaMap = { scan:'bio-dna-scan', markers:'bio-dna-markers', gtol:'bio-dna-gtol', rad:'bio-dna-rad', neural:'bio-dna-neural', markerC:'bio-dna-marker-c' };
  Object.entries(dnaMap).forEach(([key, id]) => {
    const val = DNA[key]; const el = document.getElementById(id);
    if (el && val) { el.textContent = val.text; el.className = val.cls; }
  });
  setHTML('bio-dna-pairs', DNA.pairs.map(pair => `<span style="color:${pair.color}">${pair.label}</span>`).join(''));
 
  // ── PSYCHE PAGE ───────────────────────────────────────────────────────────
  const PS = p.psyche;
  setText('psyche-page-title', PS.pageTitle);
  setHTML('psyche-bars', PS.bars.map(renderBar).join(''));
  const analysisMap = { overall:'ps-overall', mood:'ps-mood', trauma:'ps-trauma', ptsd:'ps-ptsd', cogBias:'ps-cogbias', lastEval:'ps-lasteval', nextEval:'ps-nexteval', flag:'ps-flag' };
  Object.entries(analysisMap).forEach(([key, id]) => {
    const val = PS.analysis[key]; const el = document.getElementById(id);
    if (el && val) { el.textContent = val.text; el.className = val.cls; }
  });
  setHTML('ps-soca-note', PS.socaNote);
  setHTML('ps-alerts', PS.alerts.map(a => `<div class="${a.cls}">${a.text}</div>`).join(''));
  setHTML('psyche-history', PS.history.map(renderTimeline).join(''));
 
  // ── MED LOG PAGE ──────────────────────────────────────────────────────────
  const MED = p.medlog;
  setText('medlog-page-title', MED.pageTitle);
  setText('medlog-count', MED.count);
  setHTML('medlog-timeline', MED.timeline.map(renderTimeline).join(''));
  setHTML('medlog-meds', MED.meds.map(med => `
    <div style="border:1px solid ${med.borderColor};padding:8px">
      <div style="color:${med.nameColor};margin-bottom:4px;letter-spacing:.08em">${med.name}</div>
      <div class="rr"><span class="rk">DOSE</span>       <span class="rv">${med.dose}</span></div>
      <div class="rr"><span class="rk">LAST ADMIN</span> <span class="rv">${med.lastAdmin}</span></div>
      <div class="rr"><span class="rk">STATUS</span>     <span class="${med.status.cls}">${med.status.text}</span></div>
    </div>`).join(''));
 
  // ── CERTIFICATIONS PAGE ───────────────────────────────────────────────────
  const CERT = p.certific;
  setText('certific-summary', CERT.summary);
  setHTML('certific-list', CERT.list.map(c => `
    <div class="${c.cls}">
      <div class="cert-icon" style="color:${c.iconColor}">${c.icon}</div>
      <div>
        <div class="${c.nameCls}"${c.nameColor ? ` style="color:${c.nameColor}"` : ''}>${c.name}</div>
        <div class="cert-id">${c.id}</div>
        <div class="${c.statusCls}">${c.status}</div>
      </div>
    </div>`).join(''));
 
  // ── QUICK STATS ───────────────────────────────────────────────────────────
  const QS = p.quickStats;
  ['hr','o2','stress','gforce','temp','suitO2'].forEach(k => {
    const idMap = { hr:'hr-right', o2:'qs-o2', stress:'qs-stress', gforce:'gf-right', temp:'qs-temp', suitO2:'qs-suito2' };
    const el = document.getElementById(idMap[k]);
    if (el && QS[k]) { el.textContent = QS[k].text; el.className = QS[k].cls; }
  });
 
  // ── LIVE VITALS ───────────────────────────────────────────────────────────
  const LV = p.liveVitals;
  currentHRBase = LV.hrBase;
  const o2El = document.getElementById('live-o2');
  if (o2El) o2El.innerHTML = LV.o2 + '<span style="font-size:16px">%</span>';
  setText('live-o2-label',    LV.o2Label);
  setText('stress-mini',      LV.stressMini);
  setText('live-stress-label',LV.stressLabel);
  const gfEl = document.getElementById('live-gforce');
  if (gfEl) gfEl.innerHTML = LV.gforce + '<span style="font-size:16px">g</span>';
 
  // ── BOTTOMBAR ─────────────────────────────────────────────────────────────
  setText('bb-pilot', p.bottombar.pilot);
  setText('bb-alert', p.bottombar.alert);
  setText('bb-warn',  p.bottombar.warn);
 
  // ── АКТИВНЫЙ ТАБ ─────────────────────────────────────────────────────────
  document.querySelectorAll('.pilot-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.pilot-tab[data-pilot="${currentPilotNum}"]`);
  if (activeTab) activeTab.classList.add('active');
 
  // Глитч-вспышка при смене
  const panel = document.getElementById('pilot-panel');
  if (panel) {
    panel.style.animation = 'glitch1 0.2s';
    setTimeout(() => { panel.style.animation = ''; }, 220);
  }
}
 
// ══════════════════════════════════════════════════════════════════════════════
// ── SOCA COMMENTS ENGINE (per-pilot) ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
 
let currentPilotComments = [];
// lastCommentIndex уже объявлен в pilot.js — просто используем его
// glitchChars уже объявлен в pilot.js — используем его напрямую
 
function applyGlitchToText(text, intensity = 0.2) {
  return text.split('').map(char => {
    if (Math.random() < intensity && char !== ' ' && !'.,!?'.includes(char))
      return glitchChars[Math.floor(Math.random() * glitchChars.length)];
    return char;
  }).join('');
}
 
function updateSocaComment() {
const container = document.getElementById('soca-comment-data');
  const textSpan  = document.getElementById('soca-comment-text');
  const speakerEl = document.getElementById('soca-comment-speaker');
  if (!container || !textSpan || !currentPilotComments.length) return;
 
  let idx;
  do { idx = Math.floor(Math.random() * currentPilotComments.length); }
  while (idx === lastCommentIndex && currentPilotComments.length > 1);
  lastCommentIndex = idx;
  const comment = currentPilotComments[idx];
 
const forceGlitch = !comment.glitch && Math.random() < 0.15 && comment.speaker !== 'smile';
  const isGlitchy = (comment.glitch || forceGlitch) && comment.speaker !== 'smile';
 
  if (isGlitchy && Math.random() > 0.5) {
    container.style.transform = `translateX(${(Math.random()-0.5)*4}px)`;
    setTimeout(() => { container.style.transform = ''; }, 150);
  }
  if (isGlitchy && Math.random() > 0.6) {
    container.style.boxShadow = '0 0 15px rgba(255,34,68,0.4)';
    setTimeout(() => { container.style.boxShadow = ''; }, 200);
  }
  container.style.animation = 'glitch1 0.15s';
 
  setTimeout(() => {
    textSpan.style.opacity = '0';
    setTimeout(() => {
      let finalText = comment.text;
      let glitchClass = '';
      if (isGlitchy) {
        finalText = applyGlitchToText(finalText, 0.25);
        const classes = ['c1','c2','c3','heavy-corrupt'];
        glitchClass = classes[Math.floor(Math.random() * classes.length)];
        if (Math.random() > 0.8) {
          const prefix = ['█','░','▒','▓','[ERR]','⚠','???'][Math.floor(Math.random()*7)];
          finalText = prefix + ' ' + finalText;
        }
        if (Math.random() > 0.85) {
          const suffix = ['██','░▒▓','???','0xDEAD'][Math.floor(Math.random()*4)];
          finalText = finalText + ' ' + suffix;
        }
        if (Math.random() > 0.6) { textSpan.style.filter = 'blur(0.6px)'; setTimeout(() => { textSpan.style.filter=''; }, 350); }
        if (Math.random() > 0.7) { textSpan.style.animation = 'glitch2 0.25s infinite'; setTimeout(() => { textSpan.style.animation=''; }, 500); }
      }
textSpan.textContent = finalText;
      textSpan.className = glitchClass;
      textSpan.style.color = comment.speaker === 'smile' ? '#cc8800' : '';
      // Меняем имя говорящего
      if (speakerEl) {
        if (comment.speaker === 'smile') {
          speakerEl.textContent = '✚ SMILE //';
          speakerEl.style.color = '#ffaa00';
          speakerEl.style.fontFamily = "'SMAILY','Share Tech Mono',monospace";
          container.style.borderColor = 'rgba(255,140,0,0.25)';
        } else {
          speakerEl.textContent = '⛭ SOCA //';
          speakerEl.style.color = '';
          speakerEl.style.fontFamily = '';
          container.style.borderColor = '';
        }
      }
      container.style.padding = comment.type === 'long' ? '12px 12px' : '8px 12px';
      container.style.lineHeight = comment.type === 'long' ? '1.8' : '1.6';
      textSpan.style.opacity = '1';
      container.style.animation = '';
    }, 100);
  }, 120);
}
 
// ══════════════════════════════════════════════════════════════════════════════
// ── TAB SWITCHING ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
 
let currentPilotNum = 1;
let currentHRBase = 113;
 
window.selectPilot = function(n, el) {
  if (el.classList.contains('locked')) {
    el.classList.add('c1');
    setTimeout(() => el.classList.remove('c1'), 500);
    return;
  }
  currentPilotNum = n;
  // Меняем URL без перезагрузки страницы
  const url = new URL(window.location);
  url.searchParams.set('pilot', n);
  history.pushState({}, '', url);
 
  document.querySelectorAll('.pilot-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
 
  if (PILOTS[n]) applyPilotData(PILOTS[n]);
};
 
// ══════════════════════════════════════════════════════════════════════════════
// ── INIT ON LOAD ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// pilots_data.js подключён с defer — DOM уже готов когда скрипт выполняется.
// DOMContentLoaded к этому моменту уже сработал, поэтому вызываем напрямую.
 
function initPilotsData() {
  const params = new URLSearchParams(window.location.search);
  const pilotNum = parseInt(params.get('pilot')) || 1;
  currentPilotNum = pilotNum;

  const pilotData = PILOTS[pilotNum] || PILOTS[1];
  applyPilotData(pilotData);

  // Помечаем нужный таб активным
  document.querySelectorAll('.pilot-tab').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector(`.pilot-tab[data-pilot="${pilotNum}"]`);
  if (tab) tab.classList.add('active');

  // Запускаем карусель комментариев
  if (window._socaCommentInterval) clearInterval(window._socaCommentInterval);
  window._socaCommentInterval = setInterval(updateSocaComment, 14000);

  // HR — обновляем каждую секунду с правильным базовым пульсом пилота
  if (window._hrInterval) clearInterval(window._hrInterval);
  window._hrInterval = setInterval(() => {
    if (currentPilotNum === 1) return; // Коко — пусть pilot.js рулит
    const hr = currentHRBase + Math.round((Math.random() - 0.5) * 4);
    ['hr-mini', 'hr-bio', 'hr-right'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = hr + ' bpm';
    });
  }, 1000);
}

// Запускаем — скрипт в конце <body>, DOM гарантированно готов
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPilotsData);
} else {
  initPilotsData();
}
 
// ── HR OVERRIDE ───────────────────────────────────────────────────────────────
// pilot.js в animLoop жёстко пишет 113 в hr-mini/hr-bio/hr-right каждый кадр.
// У Коко (пилот 1) это правильно — оставляем как есть.
// У остальных пилотов перезаписываем своим базовым значением каждые ~1сек.
// Интервал создаётся один раз в initPilotsData(), поэтому здесь дублирования нет.
