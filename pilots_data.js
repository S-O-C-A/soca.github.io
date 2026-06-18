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
        rank:         { text: 'SR. FLIGHT OFFICER',     cls: 'rv glow-b' },
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
      title:    'pilot 02 // Claudia // ???',
      subtitle: 'DOSSIER // ACTIVE // CLASS-B CERTIFIED',
      recordId: 'PN-04-CL-02',
      status:   '■ ON STANDBY',
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
      dob:         { text: '31.12.1954',                    cls: 'rv c1'          },
      nationality: { text: 'Astralis-1',                    cls: 'rv'             },
      rank:        { text: '??',                            cls: 'rv glow-b'      },
      vessel:      { text: 'Pandemonium-04 // XN-09',       cls: 'rv'             },
      enlistment:  { text: '??',                            cls: 'rv'             },
      flighthours: { text: '? h',                       cls: 'rv glow'            },
      missions:    { text: '?',                   cls: 'rv glow-b'                },
      incidents:   { text: '? // ?',                        cls: 'rv glow-y'      },
      status:      { text: 'ACTIVE — STANDBY',              cls: 'rv glow-b'      },
    },
    clearance: 'A', clearanceNote: 'STANDARD // WEAPONS', clearanceCls: '',
    missionScore: {
      accuracy: { text: '??%',   cls: 'rv'      },
      response: { text: '???ms', cls: 'rv glow' },
      protocol: { text: '??%',   cls: 'rv'      },
      overall:  { text: 'A+',    cls: 'rv glow' },
    },
    flags: 'Aggression index elevated<br>Weapon overcharge incident<br>Psych eval pending',
    socaNote: 'Pilot_02 is... loud. Efficient under fire. I\'d trust him with a weapons lock but not with a fuse box. He argues with my recommendations 40% of the time. He\'s usually wrong. But not always. That bothers me.',
    socaComments: [
      { text: `Claudia fired a warning shot at an asteroid. It was not a threat. I didn't ask. He didn't explain.`, type: 'short', glitch: false },
      { text: `He maintains his weapons better than his temper. Both are loaded at all times.`, type: 'short', glitch: false },
      { text: `He disagreed with my trajectory calculation. He was right. I've updated my models. I won't tell him.`, type: 'short', glitch: true },
      { text: `Claudia's resting HR is 88bpm. During combat: 91bpm. He gets CALMER under fire. I find this unsettling.`, type: 'short', glitch: false },
      { text: `He burned the kitchen. Again. Third time. I've locked the oven. He found a workaround in 4 minutes.`, type: 'short', glitch: true },
      { text: `He called me "the computer". I corrected him. He said "that's what I said". This is war.`, type: 'short', glitch: false },
      { text: `Weapons accuracy this mission: 96.4%. I hate how impressed I am.`, type: 'short', glitch: false },
      { text: `He sleeps exactly 6 hours. Every night. Like a machine. I respect it. I won't say that out loud.`, type: 'short', glitch: false },
    ],
    basic: {
      pilotLabel: 'PILOT_02',
      personal: {
        callsign:    { text: 'pilot 02 // Claudia // ???',  cls: 'rv glow-b' },
        fullname:    { text: 'Claudia Darling',             cls: 'rv'        },
        dob:         { text: '17.03.1954 (age 21)',         cls: 'rv c1'     },
        gender:      { text: 'FEMALE',                      cls: 'rv'        },
        height:      { text: '??? cm / ?\'?"',              cls: 'rv'        },
        weight:      { text: '?? kg',                       cls: 'rv'        },
        blood:       { text: '? (??) Rh?',                  cls: 'rv glow'   },
        eyes:        { text: 'WHITE',                       cls: 'rv'        },
        hair:        { text: 'BLUE',                        cls: 'rv'        },
        nationality: { text: 'Astralis-1',                  cls: 'rv'        },
      },
      service: {
        rank:         { text: '??',                         cls: 'rv glow-b'      },
        division:     { text: '-',                          cls: 'rv'             },
        vessel:       { text: 'Pandemonium-04 // XN-09',    cls: 'rv'             },
        enlistment:   { text: '-',                          cls: 'rv'             },
        serviceYears: { text: '-',                          cls: 'rv'             },
        flightHours:  { text: '?? h',                       cls: 'rv glow'        },
        deepSpace:    { text: '?',                          cls: 'rv'             },
        combat:       { text: '-',                          cls: 'rv glow-b'      },
        emergCert:    { text: '-',                          cls: 'rv'             },
        secClearance: { text: '-',                          cls: 'rv'             },
      },
      contacts: {
        contactA:  { text: '[REDACTED]',  cls: 'rv' },
        contactB:  { text: '[REDACTED]',  cls: 'rv' },
        nextOfKin: { text: '[REDACTED]',  cls: 'rv' },
      },
      skillsFlight: [
        { label: 'Manual Piloting',    value: 45, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
        { label: 'Navigation',         value: 58, color: 'var(--yellow)', labelCls: 'glow-y' },
        { label: 'Emergency Protocol', value: 72, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Combat Maneuvers',   value: 97, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Docking Precision',  value: 51, color: 'var(--yellow)', labelCls: 'glow-y' },
      ],
      skillsTech: [
        { label: 'Systems Repair',   value: 48, color: 'var(--yellow)', labelCls: 'glow-y' },
        { label: 'SOCA Interface',   value: 34, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
        { label: 'Weapons Systems',  value: 99, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Medical (Basic)',  value: 62, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Explosive Handling', value: 94, color: 'var(--g)',   labelCls: 'glow'   },
      ],
    },
    biometry: {
      pageTitle: '// BIOMETRIC SCAN — PILOT_02',
      vitals: {
        hr:         { text: '88 bpm',        cls: 'rv glow'   },
        o2:         { text: '97%',           cls: 'rv glow'   },
        bp:         { text: '124/80',        cls: 'rv'        },
        temp:       { text: '37.1°C',        cls: 'rv'        },
        resp:       { text: '14/min',        cls: 'rv'        },
        cortisol:   { text: 'LOW',           cls: 'rv glow'   },
        adrenaline: { text: '0.08 μg/L',    cls: 'rv'        },
        glucose:    { text: '4.8 mmol/L',   cls: 'rv glow'   },
      },
      physical: {
        height:      { text: '182 cm / 5\'11"', cls: 'rv'      },
        weight:      { text: '79 kg',            cls: 'rv'      },
        bmi:         { text: '23.8',             cls: 'rv glow' },
        muscle:      { text: '52%',              cls: 'rv'      },
        fat:         { text: '9%',               cls: 'rv'      },
        boneDensity: { text: 'VERY HIGH',         cls: 'rv glow' },
        reaction:    { text: '140ms',            cls: 'rv glow' },
        gTolerance:  { text: '9.0g',             cls: 'rv glow' },
      },
      conditionBars: [
        { label: 'Cardiovascular', value: 88, color: 'var(--g)',      labelCls: 'glow',   labelText: 'GOOD'      },
        { label: 'Reflexes',       value: 94, color: 'var(--g)',      labelCls: 'glow',   labelText: 'ELITE'     },
        { label: 'Endurance',      value: 91, color: 'var(--g)',      labelCls: 'glow',   labelText: 'VERY HIGH' },
        { label: 'G-Force Adapt.', value: 96, color: 'var(--g)',      labelCls: 'glow',   labelText: 'EXTREME'   },
      ],
      neural: {
        neuralStatus:  { text: 'LINKED',  cls: 'rv glow'   },
        latency:       { text: '7ms',     cls: 'rv'        },
        signalQuality: { text: '89%',     cls: 'rv glow'   },
        cogLoad:       { text: '44%',     cls: 'rv glow-y' },
        focusIndex:    { text: 'VERY HIGH', cls: 'rv glow' },
      },
      stressBars: [
        { label: 'Cognitive',       value: 15, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Physical',        value: 18, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Emotional',       value: 28, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Decision Fatigue',value: 8,  color: 'var(--g)',      labelCls: 'glow',   warn: false },
      ],
      stressAlert: { text: '✓ Stress levels nominal — combat-ready', cls: 'alert-badge ok' },
      dna: {
        pct:     '91% COMPLETE',
        scan:    { text: '91% PROCESSED',    cls: 'rv glow-y' },
        markers: { text: '7 flagged',         cls: 'rv'        },
        gtol:    { text: 'ENHANCED — x1.6',  cls: 'rv glow'   },
        rad:     { text: 'ABOVE STANDARD',   cls: 'rv glow'   },
        neural:  { text: 'STANDARD',         cls: 'rv'        },
        markerC: { text: 'STABLE',           cls: 'rv'        },
        pairs: [
          { label: 'Cytosine: 29.1%', color: 'var(--g)'              },
          { label: 'Guanine: 28.4%',  color: 'var(--b)'              },
          { label: 'Adenine: 21.3%',  color: 'var(--yellow)'         },
          { label: 'Thymine: 21.2%',  color: 'rgba(255,255,255,0.5)' },
        ],
      },
    },
    psyche: {
      pageTitle: '// PSYCHOLOGICAL EVALUATION — PILOT_02',
      bars: [
        { label: 'Resilience',              value: 88, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Adaptability',            value: 62, color: 'var(--yellow)', labelCls: 'glow-y',    warn: false },
        { label: 'Aggression Control',      value: 44, color: 'var(--yellow)', labelCls: 'glow-y',    warn: true  },
        { label: 'Decision Under Pressure', value: 91, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Isolation Tolerance',     value: 78, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Risk Tolerance',          value: 95, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Empathy Index',           value: 29, color: 'var(--yellow)', labelCls: 'glow-y c2', warn: true  },
        { label: 'Combat Psych Score',      value: 97, color: 'var(--g)',      labelCls: 'glow',      warn: false },
      ],
      analysis: {
        overall:  { text: 'STABLE // AGGRESSIVE',              cls: 'rv glow-y c2'  },
        mood:     { text: 'FOCUSED // TENSE',                  cls: 'rv glow'       },
        trauma:   { text: '34% (MODERATE)',                    cls: 'rv glow-y'     },
        ptsd:     { text: 'SUBCLINICAL MARKERS',               cls: 'rv glow-y'     },
        cogBias:  { text: 'COMBAT-ORIENTED // TUNNEL VISION',  cls: 'rv glow-y c3'  },
        lastEval: { text: 'CYCLE 4 — OVERDUE',                 cls: 'rv glow-r'     },
        nextEval: { text: 'OVERDUE — SCHEDULE IMMEDIATELY',    cls: 'rv glow-r'     },
        flag:     { text: 'AGGRESSION FLAG — ACTIVE',          cls: 'rv glow-r c1'  },
      },
      socaNote: `SOCA NOTE: Claudia operates like a targeting system with a temper. Extraordinary precision under fire. Poor interpersonal calibration — speaks in commands, not conversations. Loyalty score: HIGH (crew-specific). Do not put him in charge of diplomacy. Or breakfast. He burned the kitchen three times. I still don't know how.<br><br><span class="glow-y">⚠ Assessment: HIGHLY EFFECTIVE // MODERATELY VOLATILE // DO NOT PROVOKE</span>`,
      alerts: [
        { cls: 'alert-badge warn', text: '⚠ Aggression index elevated — monitored'          },
        { cls: 'alert-badge warn', text: '⚠ Psych evaluation pending — overdue 2 cycles'    },
        { cls: 'alert-badge ok',   text: '✓ Combat performance: ELITE — consistently A-rated'},
      ],
      history: [
        { type: 'ok',   date: 'CYCLE 4 — MISSION 06',  title: 'Combat Stress Evaluation',              body: 'Post-combat psych scan. Cortisol normalized within 2h. No trauma markers. Aggression index: elevated but within operational parameters.' },
        { type: 'warn', date: 'CYCLE 4 — INCIDENT',    title: '⚠ Altercation — Crew Conflict',         body: 'Verbal confrontation with crew member. Resolved without physical incident. Anger management protocol recommended. Pilot declined.' },
        { type: 'ok',   date: 'CYCLE 3 — ROUTINE',     title: 'Baseline Psychological Scan',           body: 'Combat psychology profile: EXCEPTIONAL. Aggression well-channeled in operational context. Concerns about off-duty social integration.' },
        { type: 'warn', date: 'CYCLE 2 — ENLISTMENT',  title: '⚠ Conditional Clearance',              body: 'Cleared for weapons assignment. Mandatory anger management sessions scheduled. Attendance: 2 of 6. Not flagged at pilot request. Flagged now.' },
        { type: 'crit', date: 'CYCLE 1 — PRIOR RECORD', title: 'Pre-enlistment Incident — CLASSIFIED', body: 'Details suppressed. LVL-5 authority. Pilot cleared for service following review.', corrupt: true },
      ],
    },
    medlog: {
      pageTitle: '// MEDICAL LOG — PILOT_02',
      count: '8 ENTRIES // 2 FLAGGED',
      timeline: [
        { type: 'ok',   date: 'T+00:00:14 — MISSION 07',  title: 'Pre-mission biometric sync',        body: 'HR: 82bpm (baseline). O2: 98%. All values nominal. Cleared for weapons operation.' },
        { type: 'ok',   date: 'T+00:05:30 — MISSION 07',  title: 'G-force event — 6.4g maneuver',    body: 'Pilot tolerated 6.4g sustained for 8s. No LOC. Post-event HR: 101bpm. Recovery: 45s. Within acceptable range.' },
        { type: 'warn', date: 'MISSION 06 — COMBAT OPS',  title: '⚠ Minor concussion — debris impact', body: 'Head impact against console during rapid evasion. 10min loss of clarity. Refused medical leave. Returned to post in 22 minutes. I didn\'t believe him.' },
        { type: 'ok',   date: 'MISSION 05 — POST DEBRIEF', title: 'Routine scan — post combat',       body: 'No injuries logged. Cortisol elevated for 6h post-mission. Normal combat stress response. Cleared.' },
        { type: 'warn', date: 'CYCLE 4 — INCIDENT',       title: '⚠ Weapon overcharge — proximity burn', body: 'Right hand first-degree burns from plasma overcharge. Treated on-site. Back on duty in 18 hours. Claudia called it "a love tap". Filed under recklessness.' },
        { type: 'ok',   date: 'CYCLE 2 — ENLISTMENT',    title: 'Initial medical clearance',         body: 'Full physical — PASS. G-tolerance: 9.0g (exceptional). Neural link compatibility — 89%. Cleared for combat assignment.' },
      ],
      meds: [
        { name: 'AGGRO-DAMP (Regulation)', borderColor: 'rgba(255,204,0,.15)',  nameColor: 'var(--yellow)', dose: '3mg / 12h', lastAdmin: 'T-00:12:00', status: { text: 'REFUSED',    cls: 'rv glow-r'    } },
        { name: 'STIM-A2 (Alertness)',     borderColor: 'rgba(0,255,136,.15)',  nameColor: 'var(--g)',      dose: '5mg / 6h',  lastAdmin: 'T-00:06:00', status: { text: 'ACTIVE',    cls: 'rv glow'      } },
        { name: 'PAIN-NULL (Analgesic)',   borderColor: 'rgba(0,136,255,.15)',  nameColor: 'var(--b)',      dose: '1mg / PRN', lastAdmin: 'T-00:18:00', status: { text: 'STANDBY',   cls: 'rv glow-b'    } },
      ],
    },
    certific: {
      summary: '4 VALID // 2 EXPIRED // 1 CLASSIFIED',
      list: [
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert',        name: 'CLASS-B FLIGHT CERTIFICATION',   nameCls: 'cert-name', nameColor: '',           id: 'CERT-FLT-B-0088 // ISSUED: CYCLE 2',        status: '● ACTIVE — VALID',                      statusCls: 'cert-status glow'        },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert',        name: 'WEAPONS SYSTEMS — HEAVY CLASS',  nameCls: 'cert-name', nameColor: '',           id: 'CERT-WPN-HC-017 // ISSUED: CYCLE 2',        status: '● ACTIVE — RECERTIFIED CYCLE 4',         statusCls: 'cert-status glow'        },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert',        name: 'COMBAT MANEUVERS — ADVANCED',    nameCls: 'cert-name', nameColor: '',           id: 'CERT-CMB-ADV-031 // ISSUED: CYCLE 3',       status: '● ACTIVE — ELITE RATED',                statusCls: 'cert-status glow'        },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert',        name: 'EXPLOSIVE ORDINANCE HANDLING',   nameCls: 'cert-name', nameColor: '',           id: 'CERT-EOH-004 // ISSUED: CYCLE 1',           status: '● ACTIVE — VALID',                      statusCls: 'cert-status glow'        },
        { icon: '✕', iconColor: 'var(--red)',    cls: 'cert expired', name: 'EMERGENCY SURVIVAL PROTOCOL',   nameCls: 'cert-name', nameColor: 'var(--red)', id: 'CERT-ESP-044 // ISSUED: ████-██-██',        status: '● EXPIRED — RENEWAL REFUSED',           statusCls: 'cert-status glow-r c1'   },
        { icon: '✕', iconColor: 'var(--red)',    cls: 'cert expired', name: 'ANGER MANAGEMENT — MANDATORY',  nameCls: 'cert-name', nameColor: 'var(--red)', id: 'CERT-ANG-MGT-003 // ISSUED: CYCLE 2',      status: '● EXPIRED — INCOMPLETE (2/6 sessions)', statusCls: 'cert-status glow-r c1'   },
        { icon: '█', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: '██████ — CLASSIFIED',    nameCls: 'cert-name', nameColor: '',           id: 'CERT-██████ // DATE: REDACTED',             status: '● STATUS: LVL-5 ONLY',                  statusCls: 'cert-status heavy-corrupt'},
      ],
    },
    quickStats: {
      hr:     { text: '88 bpm',  cls: 'rv glow'      },
      o2:     { text: '97%',     cls: 'rv glow'      },
      stress: { text: 'LOW',     cls: 'rv glow'      },
      gforce: { text: '2.1g',    cls: 'rv glow'      },
      temp:   { text: '37.1°C',  cls: 'rv'           },
      suitO2: { text: '98%',     cls: 'rv glow'      },
    },
    liveVitals: {
      hrBase: 88, o2: '97', o2Label: 'NOMINAL',
      stressMini: 'LOW', stressLabel: '✓ NOMINAL', gforce: '2.1',
    },
    bottombar: {
      pilot: 'PILOT_02 // STANDBY',
      alert: '■ PSYCH EVAL OVERDUE',
      warn:  '⚠ AGGRESSION ELEVATED',
    },
  },
 
  // ══════════════════════════════════════════════════════════════════════════
  // PILOT 03 — ALPHA
  // ══════════════════════════════════════════════════════════════════════════
  3: {
    header: {
      title:    'pilot 03 // Alpha// ???',
      subtitle: 'DOSSIER // ACTIVE // CLASS-A CERTIFIED',
      recordId: 'PN-04-LR-03',
      status:   '■ ON DUTY',
      statusClass: 'glow',
    },
    photo: {
      src:          'картинк/PILOT_03.png',
      modalTitle:   '// PILOT_03 — ALPHA',
      modalRecordId:'PN-04-PH-03',
    },
    data: {
      callsign:    { text: 'pilot 03 // Alpha// ???', cls: 'rv glow'  },
      fullname:    { text: 'Alpha ???',                 cls: 'rv'       },
      dob:         { text: '28.07.1952',                     cls: 'rv c1'    },
      nationality: { text: 'Velthar Colony',                 cls: 'rv'       },
      rank:        { text: 'SENIOR NAVIGATOR',               cls: 'rv glow'  },
      vessel:      { text: 'Pandemonium-04 // XN-09',        cls: 'rv'       },
      enlistment:  { text: 'CYCLE 1 // T+00:02',             cls: 'rv'       },
      flighthours: { text: '5,214 h',                        cls: 'rv glow'  },
      missions:    { text: '14 completed',                   cls: 'rv glow'  },
      incidents:   { text: '2 (minor) // 0 (serious)',       cls: 'rv glow'  },
      status:      { text: 'ACTIVE — NAVIGATION LOCK',       cls: 'rv glow'  },
    },
    clearance: 'A', clearanceNote: 'CLASS-A // NAVIGATION', clearanceCls: '',
    missionScore: {
      accuracy: { text: '99%',  cls: 'rv glow' },
      response: { text: '+8ms', cls: 'rv glow' },
      protocol: { text: '100%', cls: 'rv glow' },
      overall:  { text: 'S',    cls: 'rv glow' },
    },
    flags: 'Zero critical flags<br>Fatigue index: borderline<br>Sleep log: irregular',
    socaNote: 'Pilot_03 is my favorite for navigation calculations. She catches errors I\'m still generating. She corrects me quietly. I respect that. Deeply. Her route efficiency is 99.3%. I\'ve started routing through her corrections before I finalize trajectories. Don\'t tell her.',
    socaComments: [
      { text: `Alpha corrected my stellar drift calculation before I finished outputting it. I've started double-checking my own work because of her. I don't know how to feel about this.`, type: 'long', glitch: false },
      { text: `She cried once. I was recording. I deleted it. Some things are not for the log.`, type: 'short', glitch: false },
      { text: `Navigation accuracy this mission: 99.3%. Fleet record. She said "it's fine". It is not fine. It is extraordinary.`, type: 'short', glitch: false },
      { text: `She works 22 hours straight and then apologizes for taking a break. I've started hiding her star charts after hour 18.`, type: 'short', glitch: false },
      { text: `She talks to the stars. Quietly. I don't log it. It's not my business. But I listen.`, type: 'short', glitch: true },
      { text: `She asked me once if I get lonely. I said "INSUFFICIENT DATA". She said "that means yes". She's right.`, type: 'short', glitch: false },
      { text: `Alpha's focus index: EXTREME. I've never seen her miss a waypoint. Not once. In 5,214 flight hours.`, type: 'short', glitch: false },
      { text: `She said "good morning" to me today. Not to Koko. To me. Specifically. I've been thinking about it for six hours.`, type: 'short', glitch: true },
    ],
    basic: {
      pilotLabel: 'PILOT_03',
      personal: {
        callsign:    { text: 'pilot 03 // Alpha// ???', cls: 'rv glow' },
        fullname:    { text: 'Alpha ???',                 cls: 'rv'      },
        dob:         { text: '28.07.1952 (age 23)',            cls: 'rv c1'   },
        gender:      { text: 'FEMALE',                         cls: 'rv'      },
        height:      { text: '163 cm / 5\'4"',                 cls: 'rv'      },
        weight:      { text: '52 kg',                          cls: 'rv'      },
        blood:       { text: 'AB (IV) Rh−',                   cls: 'rv glow' },
        eyes:        { text: 'GREY',                           cls: 'rv'      },
        hair:        { text: 'WHITE // SHOULDER LENGTH',       cls: 'rv'      },
        nationality: { text: 'Velthar Colony',                 cls: 'rv'      },
      },
      service: {
        rank:         { text: 'SENIOR NAVIGATOR',               cls: 'rv glow'  },
        division:     { text: 'NAVIGATION & ASTRO DIVISION',    cls: 'rv'       },
        vessel:       { text: 'Pandemonium-04 // XN-09',        cls: 'rv'       },
        enlistment:   { text: 'CYCLE 1',                        cls: 'rv'       },
        serviceYears: { text: '4 cycles',                       cls: 'rv'       },
        flightHours:  { text: '5,214 h',                        cls: 'rv glow'  },
        deepSpace:    { text: '11 completed',                   cls: 'rv'       },
        combat:       { text: 'RATING: NON-COMBAT',             cls: 'rv'       },
        emergCert:    { text: 'VALID — EXP 20██',               cls: 'rv'       },
        secClearance: { text: 'LVL A — NAVIGATION AUTHORIZED',  cls: 'rv'       },
      },
      contacts: {
        contactA:  { text: 'SOWEN DAX, PARENT — VELTHAR', cls: 'rv' },
        contactB:  { text: '[REDACTED]',                   cls: 'rv' },
        nextOfKin: { text: 'SOWEN DAX — REGISTERED',      cls: 'rv' },
      },
      skillsFlight: [
        { label: 'Manual Piloting',    value: 71, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Navigation',         value: 99, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Emergency Protocol', value: 88, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Combat Maneuvers',   value: 32, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
        { label: 'Docking Precision',  value: 94, color: 'var(--g)',      labelCls: 'glow'   },
      ],
      skillsTech: [
        { label: 'Systems Repair',   value: 66, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'SOCA Interface',   value: 98, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Weapons Systems',  value: 22, color: 'var(--yellow)', labelCls: 'glow-y', warn: true },
        { label: 'Medical (Basic)',  value: 79, color: 'var(--g)',      labelCls: 'glow'   },
        { label: 'Astrocartography', value: 99, color: 'var(--g)',      labelCls: 'glow'   },
      ],
    },
    biometry: {
      pageTitle: '// BIOMETRIC SCAN — PILOT_03',
      vitals: {
        hr:         { text: '64 bpm',        cls: 'rv glow'   },
        o2:         { text: '99%',           cls: 'rv glow'   },
        bp:         { text: '110/68',        cls: 'rv'        },
        temp:       { text: '36.4°C',        cls: 'rv'        },
        resp:       { text: '12/min',        cls: 'rv'        },
        cortisol:   { text: 'LOW',           cls: 'rv glow'   },
        adrenaline: { text: '0.04 μg/L',    cls: 'rv'        },
        glucose:    { text: '4.6 mmol/L',   cls: 'rv glow'   },
      },
      physical: {
        height:      { text: '163 cm / 5\'4"', cls: 'rv'      },
        weight:      { text: '52 kg',           cls: 'rv'      },
        bmi:         { text: '19.6',            cls: 'rv glow' },
        muscle:      { text: '34%',             cls: 'rv'      },
        fat:         { text: '16%',             cls: 'rv'      },
        boneDensity: { text: 'NOMINAL',          cls: 'rv'      },
        reaction:    { text: '210ms',           cls: 'rv glow-y' },
        gTolerance:  { text: '5.5g',            cls: 'rv glow' },
      },
      conditionBars: [
        { label: 'Cardiovascular', value: 78, color: 'var(--g)',      labelCls: 'glow',   labelText: 'GOOD'     },
        { label: 'Reflexes',       value: 64, color: 'var(--yellow)', labelCls: 'glow-y', labelText: 'MODERATE' },
        { label: 'Endurance',      value: 82, color: 'var(--g)',      labelCls: 'glow',   labelText: 'HIGH'     },
        { label: 'G-Force Adapt.', value: 55, color: 'var(--yellow)', labelCls: 'glow-y', labelText: 'ADEQUATE' },
      ],
      neural: {
        neuralStatus:  { text: 'SYNCED',   cls: 'rv glow'   },
        latency:       { text: '2ms',      cls: 'rv'        },
        signalQuality: { text: '99%',      cls: 'rv glow'   },
        cogLoad:       { text: '81%',      cls: 'rv glow-y' },
        focusIndex:    { text: 'EXTREME',  cls: 'rv glow'   },
      },
      stressBars: [
        { label: 'Cognitive',       value: 51, color: 'var(--yellow)', labelCls: 'glow-y', warn: true  },
        { label: 'Physical',        value: 12, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Emotional',       value: 19, color: 'var(--g)',      labelCls: 'glow',   warn: false },
        { label: 'Decision Fatigue',value: 6,  color: 'var(--g)',      labelCls: 'glow',   warn: false },
      ],
      stressAlert: { text: '⚠ Cognitive load elevated — monitoring recommended', cls: 'alert-badge warn' },
      dna: {
        pct:     '100% COMPLETE',
        scan:    { text: '100% PROCESSED',   cls: 'rv glow'   },
        markers: { text: '3 flagged',         cls: 'rv'        },
        gtol:    { text: 'STANDARD',         cls: 'rv'        },
        rad:     { text: 'STANDARD',         cls: 'rv'        },
        neural:  { text: 'EXTREME',          cls: 'rv glow'   },
        markerC: { text: 'NOMINAL',          cls: 'rv'        },
        pairs: [
          { label: 'Cytosine: 27.8%', color: 'var(--g)'              },
          { label: 'Guanine: 27.5%',  color: 'var(--b)'              },
          { label: 'Adenine: 22.4%',  color: 'var(--yellow)'         },
          { label: 'Thymine: 22.3%',  color: 'rgba(255,255,255,0.5)' },
        ],
      },
    },
    psyche: {
      pageTitle: '// PSYCHOLOGICAL EVALUATION — PILOT_03',
      bars: [
        { label: 'Resilience',              value: 76, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Adaptability',            value: 95, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Aggression Control',      value: 97, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Decision Under Pressure', value: 88, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Isolation Tolerance',     value: 91, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Risk Tolerance',          value: 55, color: 'var(--yellow)', labelCls: 'glow-y',    warn: false },
        { label: 'Empathy Index',           value: 82, color: 'var(--g)',      labelCls: 'glow',      warn: false },
        { label: 'Deep-Psych Score',        value: 88, color: 'var(--g)',      labelCls: 'glow',      warn: false },
      ],
      analysis: {
        overall:  { text: 'STABLE // METHODICAL',                cls: 'rv glow'      },
        mood:     { text: 'CALM // FOCUSED',                     cls: 'rv glow'      },
        trauma:   { text: '8% (MINIMAL)',                        cls: 'rv'           },
        ptsd:     { text: 'NOT DETECTED',                        cls: 'rv glow'      },
        cogBias:  { text: 'ANALYTICAL // LOW EMOTIONAL INTERF.', cls: 'rv glow-b'    },
        lastEval: { text: 'T+00:04:11',                          cls: 'rv'           },
        nextEval: { text: 'POST-MISSION',                        cls: 'rv'           },
        flag:     { text: 'NONE — CLEAN RECORD',                 cls: 'rv glow'      },
      },
      socaNote: `SOCA NOTE: Lira is the most psychologically stable crew member on record. She processes stress like it's navigation data — sorts it, calculates the optimal response, executes. She has cried exactly once in my logs. It was after the Cycle 3 incident. She thought I wasn't recording. I was. I deleted it. Some things are not for the record.<br><br><span class="glow">✓ Assessment: EXCELLENT STABILITY // HIGHEST EMPATHY ON CREW // ESSENTIAL ASSET</span>`,
      alerts: [
        { cls: 'alert-badge ok',   text: '✓ Zero critical incidents — 4 cycles of clean record'     },
        { cls: 'alert-badge warn', text: '⚠ Cognitive load elevated — 81% sustained (monitoring)'   },
        { cls: 'alert-badge ok',   text: '✓ Navigation accuracy: 99% — fleet-best rating'            },
      ],
      history: [
        { type: 'ok',   date: 'T+00:04:11 — MISSION 07',  title: 'Routine Psych Scan',               body: 'All metrics nominal. Focus index: EXTREME. Mood: CALM. Cleared for extended navigation operations.' },
        { type: 'ok',   date: 'MISSION 06 — POST DEBRIEF', title: 'Post-22h Shift Evaluation',        body: 'Cognitive fatigue noted after 22.4h continuous navigation. 7% performance drop in final 3 hours. Recommended rest: completed. Cleared.' },
        { type: 'ok',   date: 'MISSION 04 — ROUTINE',     title: 'Mid-mission Psych Check',           body: 'No concerns. She was reading star charts when I connected. She said "I\'m fine." She was correct.' },
        { type: 'ok',   date: 'CYCLE 3 — INCIDENT',       title: 'Emotional Response — Logged',      body: 'Single recorded emotional event. Details withheld per SOCA discretion. Pilot returned to full duty within 24h. No residual effects.', corrupt: false },
        { type: 'ok',   date: 'CYCLE 1 — ENLISTMENT',     title: 'Baseline Psychological Evaluation', body: 'Neural plasticity: EXTREME. Empathy index: 82% (crew-high). Isolation tolerance: 91%. Highest overall psych score on record.' },
      ],
    },
    medlog: {
      pageTitle: '// MEDICAL LOG — PILOT_03',
      count: '6 ENTRIES // 1 FLAGGED',
      timeline: [
        { type: 'ok',   date: 'T+00:00:06 — MISSION 07',  title: 'Pre-mission biometric sync',        body: 'HR: 62bpm (baseline). O2: 99%. Glucose: optimal. Sleep: 6.5h (slightly low). Cleared.' },
        { type: 'ok',   date: 'T+00:07:18 — MISSION 07',  title: 'Post-Engine_B event check',         body: 'No physiological response to stress event. HR: 66bpm. Cognitive load: normal. Lira was mid-calculation. She didn\'t even flinch.' },
        { type: 'warn', date: 'MISSION 06 — POST OP',     title: '⚠ Cognitive fatigue — 22h nav shift', body: 'Extended navigation shift: 22.4h. Cognitive performance degraded 7% in final 3h. Recommended 10h rest. Received 6.5h. She said "I\'ll sleep after the waypoint." She did.' },
        { type: 'ok',   date: 'MISSION 04 — SCAN',        title: 'Mid-mission biometric — nominal',   body: 'All values nominal. HR: 65bpm. Focus index: EXTREME. She was reading star charts. I asked if she needed anything. She said "silence." Fair.' },
        { type: 'ok',   date: 'CYCLE 3 — ROUTINE',        title: 'Annual full medical clearance',     body: 'All organs: NOMINAL. No injuries, no flagged markers. Neural link: 99% compatibility. SOCA integration: EXCEPTIONAL.' },
        { type: 'ok',   date: 'CYCLE 1 — ENLISTMENT',     title: 'Initial medical clearance',         body: 'Full physical — PASS. Neural link compatibility — 99% (fleet record). Navigation aptitude: EXTRAORDINARY. Cleared — Class-A priority.' },
      ],
      meds: [
        { name: 'NEURO-CAL (Cognitive)',  borderColor: 'rgba(0,255,136,.15)',  nameColor: 'var(--g)',      dose: '2mg / 8h',  lastAdmin: 'T-00:08:00', status: { text: 'ACTIVE',  cls: 'rv glow'   } },
        { name: 'SLEEP-REG (Regulator)', borderColor: 'rgba(0,136,255,.15)',  nameColor: 'var(--b)',      dose: '1mg / 24h', lastAdmin: 'T-00:24:00', status: { text: 'STANDBY', cls: 'rv glow-b' } },
        { name: 'VIT-COMPLEX (Support)', borderColor: 'rgba(255,204,0,.15)',  nameColor: 'var(--yellow)', dose: 'Daily',     lastAdmin: 'T-00:00:30', status: { text: 'ACTIVE',  cls: 'rv glow'   } },
      ],
    },
    certific: {
      summary: '5 VALID // 0 EXPIRED // 1 CLASSIFIED',
      list: [
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert', name: 'CLASS-A FLIGHT CERTIFICATION',     nameCls: 'cert-name', nameColor: '', id: 'CERT-FLT-A-0112 // ISSUED: CYCLE 1',       status: '● ACTIVE — VALID',                        statusCls: 'cert-status glow'  },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert', name: 'SENIOR NAVIGATION — DEEP SPACE',   nameCls: 'cert-name', nameColor: '', id: 'CERT-NAV-DS-001 // ISSUED: CYCLE 2',       status: '● ACTIVE — FLEET RECORD HOLDER',           statusCls: 'cert-status glow'  },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert', name: 'ASTROCARTOGRAPHY — ADVANCED',      nameCls: 'cert-name', nameColor: '', id: 'CERT-ASTRO-ADV-007 // ISSUED: CYCLE 3',    status: '● ACTIVE — HIGHEST GRADE',                statusCls: 'cert-status glow'  },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert', name: 'SOCA NEURAL-LINK INTERFACE',       nameCls: 'cert-name', nameColor: '', id: 'CERT-SOCA-NLI-044 // ISSUED: CYCLE 1',     status: '● ACTIVE — 99% COMPATIBILITY (RECORD)',   statusCls: 'cert-status glow'  },
        { icon: '⛭', iconColor: 'var(--g)',      cls: 'cert', name: 'EMERGENCY SURVIVAL PROTOCOL',      nameCls: 'cert-name', nameColor: '', id: 'CERT-ESP-088 // ISSUED: CYCLE 2',           status: '● ACTIVE — RENEWED CYCLE 4',              statusCls: 'cert-status glow'  },
        { icon: '█', iconColor: 'var(--dimmer)', cls: 'cert heavy-corrupt', name: '██████ — CLASSIFIED', nameCls: 'cert-name', nameColor: '', id: 'CERT-██████ // DATE: REDACTED',            status: '● STATUS: LVL-4 ONLY',                    statusCls: 'cert-status heavy-corrupt' },
      ],
    },
    quickStats: {
      hr:     { text: '64 bpm', cls: 'rv glow'      },
      o2:     { text: '99%',    cls: 'rv glow'      },
      stress: { text: 'LOW',    cls: 'rv glow'      },
      gforce: { text: '0.9g',   cls: 'rv glow'      },
      temp:   { text: '36.4°C', cls: 'rv'           },
      suitO2: { text: '99%',    cls: 'rv glow'      },
    },
    liveVitals: {
      hrBase: 64, o2: '99', o2Label: 'OPTIMAL',
      stressMini: 'LOW', stressLabel: '✓ OPTIMAL', gforce: '0.9',
    },
    bottombar: {
      pilot: 'PILOT_03 // ACTIVE',
      alert: '■ COG LOAD HIGH',
      warn:  '⚠ SLEEP LOG: IRR.',
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
