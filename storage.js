// ══════════════════════════════════════════════════════════════════════════
// SOCA — CREW STORAGE MODULE (storage.js)
//
// Оверлей общего хранилища экипажа. Открывается по клику на пункт
// навигации STORAGE, работает как оверлей игр (поверх сайта, свой z-index).
// Отдельный самодостаточный файл — как games_patch.js.
//
// Подключить в soca.html ПОСЛЕ остальных скриптов:
//   <script src="storage.js"></script>
//
// Открытие из навигации:  onclick="openStorage()"
//
// ── НАПОЛНЕНИЕ: всё содержимое лежит в объекте STORAGE_DATA ниже.
//    Чтобы добавить/изменить папки и файлы — редактируй только его,
//    трогать логику рендера не нужно. Пути к медиа: storage/имя.ext
//    (onerror сам покажет CRT-заглушку, пока файла физически нет).
// ══════════════════════════════════════════════════════════════════════════

(function(){

  // ════════════════════════════════════════════════════════════════════
  //  ДАННЫЕ ХРАНИЛИЩА  — редактируй здесь
  // ════════════════════════════════════════════════════════════════════
  // Категории: photos | video | audio | files | notes
  // Папка: { name, owner, locked?, items:[...] }
  //   owner   — 'KOKO' | 'ALPHA' | 'CLAUDIA'
  //   items   — файлы внутри папки
  // Файл: { title, src?, date, size, locked?, text?, poster? }
  //   locked:true  → материал заперт: в ленте/папке показывается замок,
  //                  клик открывает поле ввода пароля (4444)
  //   text         → для заметок (NOTES) вместо src
  //   poster       → (только video, опционально) путь к кадру-превью
  //                  для окошка в ленте ALL; без него — иконка ▷
  //   comment      → (опционально) короткая заметка Коко о файле;
  //                  показывается в списке FILES и в панели свойств
  // ────────────────────────────────────────────────────────────────────
  const STORAGE_DATA = {
    photos: [
      { name: 'крррутые фотки Коко!!!', owner: 'KOKO', items: [
        { title: 'crystal_field_01', src: 'картинк/storage/photos/crystal_01.jpg', date: 'PD-04 // DAY ████ // 02 MAY 1973', size: '2.4 MB' },
        { title: 'crystal_field_02', src: 'картинк/storage/photos/crystal_02.jpg', date: 'PD-04 // DAY ████ // 02 MAY 1973', size: '2.1 MB' },
        { title: 'the_big_one',      src: 'картинк/storage/photos/crystal_big.jpg', date: 'PD-04 // DAY ████ // 02 MAY 1973', size: '3.8 MB' },
        { title: 'fuchsia_pool',     src: 'картинк/storage/photos/fuchsia_pool.jpg', date: 'PD-04 // DAY ████ // 11 MAY 1973', size: '2.9 MB' },
        { title: 'sky_at_kaela',     src: 'картинк/storage/photos/kaela_sky.jpg',   date: 'PD-04 // DAY ████ // 14 MAY 1973', size: '4.2 MB' },
        { title: 'glass_lily',       src: 'картинк/storage/photos/glass_lily.jpg',  date: 'PD-04 // DAY ████ // 19 MAY 1973', size: '2.6 MB' },
        { title: 'ME (do not open)', src: 'картинк/storage/photos/koko_selfie.jpg', date: 'PD-04 // DAY ████ // 08 NOV 1973', size: '1.9 MB', locked: true },
        { title: 'the_dark_forest',  src: 'картинк/storage/photos/dark_forest.jpg', date: 'PD-04 // DAY ████ // 03 SEP 1973', size: '3.1 MB' },
        { title: 'sunrise_maybe',    src: 'картинк/storage/photos/sunrise.jpg',     date: 'PD-04 // DAY ████ // 14 AUG 1973', size: '2.7 MB' },
      ]},
      { name: 'SHIP LOG // visual', owner: 'KOKO', items: [
        { title: 'hull_damage_engineB', src: 'картинк/storage/photos/hull_b.jpg', date: 'PD-04 // DAY ████ // 09 APR 1973', size: '1.2 MB' },
        { title: 'reactor_readout',     src: 'картинк/storage/photos/reactor.jpg', date: 'PD-04 // DAY ████ // 09 APR 1973', size: '0.8 MB' },
      ]},
      { name: 'album', owner: 'CLAUDIA', items: [] },
      { name: 'nav_reference', owner: 'ALPHA', items: [] },
    ],
    video: [
      { name: 'stuff i recorded', owner: 'KOKO', items: [
        { title: 'crystals_HUMMING',   src: 'картинк/storage/videos/crystals_hum.mp4', date: 'PD-04 // DAY ████ // 03 MAY 1973', size: '18.4 MB' },
        { title: 'first_storm',        src: 'картинк/storage/videos/first_storm.mp4',  date: 'PD-04 // DAY ████ // 07 MAY 1973', size: '31.2 MB' },
        { title: 'DONT_WATCH_THIS',    src: 'картинк/storage/videos/private_01.mp4',   date: 'PD-04 // DAY ████ // 17 FEB 1974', size: '9.6 MB', locked: true },
      ]},
      { name: 'flight_records', owner: 'ALPHA', items: [] },
    ],
    audio: [
      { name: 'voice memos (Koko)', owner: 'KOKO', items: [
        { title: '3_seconds_of_THOUGHT', src: 'картинк/storage/audio/memo_thought.mp3', date: 'PD-04 // DAY ████ // 15 MAY 1973', size: '0.1 MB' },
        { title: 'idea_at_4am',          src: 'картинк/storage/audio/memo_4am.mp3',     date: 'PD-04 // DAY ████ // 17 MAY 1973', size: '0.3 MB' },
        { title: 'note_to_alpha_DRAFT',  src: 'картинк/storage/audio/memo_alpha.mp3',   date: 'PD-04 // DAY ████ // 21 MAY 1973', size: '0.5 MB', locked: true },
        { title: 'the_planet_sings',     src: 'картинк/storage/audio/planet_song.mp3',  date: 'PD-04 // DAY ████ // 25 MAY 1973', size: '1.8 MB' },
      ]},
      { name: 'music i took with me', owner: 'KOKO', items: [
        { title: 'track_01', src: 'картинк/storage/audio/song_01.mp3', date: '—', size: '4.1 MB' },
        { title: 'track_02', src: 'картинк/storage/audio/song_02.mp3', date: '—', size: '3.7 MB' },
        { title: 'favourite_song', src: 'картинк/storage/audio/song_fav.mp3', date: '—', size: '4.9 MB', locked: true },
      ]},
    ],
    files: [
      { name: 'misc', owner: 'KOKO', items: [
        { title: 'super_important_file.docx', src: 'картинк/storage/files/super_important_file.docx', date: 'PD-04 // DAY ████ // 01 JUL 1974', size: '0.3 MB', comment: 'DO NOT DELETE. i mean it. this one is important. probably. i forgot whats in it.' },
        { title: 'planet_notes.txt',     src: 'картинк/storage/files/planet_notes.txt', date: 'PD-04 // DAY ████ // 30 MAY 1973', size: '0.2 MB', comment: 'everything i know about the planet so far. its not much. its a lot actually. read it.' },
        { title: 'crystal_data.csv',     src: 'картинк/storage/files/crystal_data.csv', date: 'PD-04 // DAY ████ // 30 MAY 1973', size: '0.6 MB', comment: '47 crystals catalogued!!! sorted by hum frequency. yes they hum. dont ask.' },
        { title: 'DIAGRAM_ship.pdf',     src: 'картинк/storage/files/ship_diagram.pdf', date: 'PD-04 // DAY ████ // 02 APR 1973', size: '1.4 MB', comment: 'ship schematics. SOCA gave me these. i drew on them. sorry SOCA.' },
        { title: '████████.dat',         src: 'картинк/storage/files/corrupt.dat',      date: 'PD-04 // DAY ████ // ?? ??? 1974', size: '0.0 MB', locked: true, comment: 'i dont remember making this file. it wont open. i locked it just in case.' },
      ]},
      { name: 'navigation', owner: 'ALPHA', items: [] },
    ],
    notes: [
      { name: 'Koko notes', owner: 'KOKO', items: [
        { title: 'ideas!!!', date: 'PD-04 // DAY ████ // 12 MAY 1973', size: '0.1 MB',
          text: `things to do before we leave (WE ARE NOT LEAVING but just in case):\n\n- name all the crystals (started. 47 so far)\n- figure out why the pink water hums\n- ask Alpha if she ever sleeps\n- beat her VOID ASSAULT record\n- do NOT tell SOCA about the crystal i put in my pocket\n\nthats it for now. more later. definitely more later.` },
        { title: 'observations_day_86', date: 'PD-04 // DAY ████ // 19 DEC 1973', size: '0.1 MB',
          text: `the shadows here fall in two directions.\ni measured it four times.\ni am not going to write down what i think that means.\nnot yet.` },
        { title: 'PRIVATE — do not read', date: 'PD-04 // DAY ████ // 04 APR 1974', size: '0.1 MB', locked: true,
          text: `[ACCESS RESTRICTED BY OWNER]` },
      ]},
      { name: 'crew', owner: 'CLAUDIA', items: [] },
    ],
  };

  // Владелец → цвет акцента (для подписи "by ...")
  const OWNER_COLOR = {
    KOKO:    'var(--g, #00ff88)',
    ALPHA:   'var(--b, #00ccff)',
    CLAUDIA: 'var(--red, #ff3c3c)',
  };

  // Категория → иконка/лейбл вкладки
  const TABS = [
    { id:'all',    label:'ALL',    icon:'▚' },
    { id:'photos', label:'PHOTOS', icon:'▤' },
    { id:'video',  label:'VIDEO',  icon:'▷' },
    { id:'audio',  label:'AUDIO',  icon:'♪' },
    { id:'files',  label:'FILES',  icon:'▦' },
    { id:'notes',  label:'NOTES',  icon:'✎' },
  ];

  // ════════════════════════════════════════════════════════════════════
  //  СТИЛИ
  // ════════════════════════════════════════════════════════════════════
  const css = document.createElement('style');
  css.textContent = `
  #storage-overlay{
    display:none; position:fixed; inset:0; z-index:9985;
    background:rgba(2,10,6,0.97); backdrop-filter:blur(4px);
    font-family:'Share Tech Mono',monospace; color:var(--g,#00ff88);
    flex-direction:column;
  }
  #storage-overlay *{ box-sizing:border-box; }

  /* ── Голубое CRT-свечение (перенесено из reports.html) ── */
  #storage-overlay .crt-glow-bg{
    position:absolute; inset:0; z-index:0; pointer-events:none;
    background:radial-gradient(ellipse 60% 55% at 50% 45%,
      rgba(0,200,255,0.07) 0%, rgba(0,150,220,0.03) 40%, transparent 70%);
  }
  #storage-overlay .crt-glow-overlay{
    position:absolute; inset:0; z-index:3; pointer-events:none;
    background:radial-gradient(ellipse 65% 60% at 50% 48%,
      rgba(80,200,255,0.035) 0%, transparent 65%);
    mix-blend-mode:screen;
  }
  /* контент оверлея — выше фонового свечения */
  #storage-overlay .st-head,
  #storage-overlay .st-toolbar,
  #storage-overlay .st-body{ position:relative; z-index:1; }

  /* Заголовок оверлея */
  .st-head{
    display:flex; align-items:center; gap:16px;
    padding:10px 20px 10px 55px;
    border-bottom:1px solid rgba(0,255,136,0.2);
    background:rgba(0,0,0,0.5);
  }
  .st-title{
    font-family:'VT323',monospace; font-size:26px;
    color:var(--g,#00ff88); letter-spacing:0.14em;
  }
  .st-sub{ font-size:10px; color:var(--dimmer,#0a3d24); letter-spacing:0.1em; }
  .st-close{
    margin-left:auto; padding:6px 16px;
    border:1px solid rgba(255,34,68,0.4); color:var(--red,#ff3c3c);
    font-size:10px; cursor:pointer; letter-spacing:0.1em; transition:all .2s;
  }
  .st-close:hover{ background:rgba(255,34,68,0.1); }

  /* Тулбар редактора (декоративный) */
  .st-toolbar{
    display:flex; align-items:center; gap:6px;
    padding:7px 20px; border-bottom:1px solid rgba(0,255,136,0.12);
    background:rgba(0,0,0,0.3); flex-wrap:wrap;
  }
  .st-tool{
    padding:4px 11px; border:1px solid rgba(0,255,136,0.28);
    color:var(--dim,#4a9d7a); font-size:9px; letter-spacing:0.1em;
    cursor:pointer; transition:all .18s; user-select:none;
  }
  .st-tool:hover{ color:var(--g,#00ff88); border-color:rgba(0,255,136,0.6); }
  .st-search{
    background:rgba(0,0,0,0.4); border:1px solid rgba(0,255,136,0.28);
    color:var(--g,#00ff88); font-family:inherit; font-size:9px;
    padding:4px 9px; letter-spacing:0.06em; width:150px; outline:none;
  }
  .st-search::placeholder{ color:var(--dimmer,#0a3d24); }
  .st-space{ margin-left:auto; font-size:9px; color:var(--dimmer,#0a3d24); letter-spacing:0.08em; }
  .st-bar-track{ display:inline-block; width:70px; height:6px; border:1px solid rgba(0,255,136,0.3); margin:0 6px; vertical-align:middle; position:relative; }
  .st-bar-fill{ position:absolute; inset:0; width:42%; background:rgba(0,255,136,0.35); }

  /* Тело: вкладки слева + контент */
  .st-body{ display:flex; flex:1; min-height:0; }
  .st-tabs{
    width:150px; flex-shrink:0; border-right:1px solid rgba(0,255,136,0.15);
    background:rgba(0,0,0,0.25); padding:10px 0; display:flex; flex-direction:column; gap:2px;
  }
  .st-tab{
    padding:9px 16px; font-size:11px; letter-spacing:0.12em; cursor:pointer;
    color:var(--dim,#4a9d7a); border-left:2px solid transparent; transition:all .16s;
    display:flex; align-items:center; gap:9px;
  }
  .st-tab:hover{ color:var(--g,#00ff88); background:rgba(0,255,136,0.04); }
  .st-tab.active{ color:var(--g,#00ff88); border-left-color:var(--g,#00ff88); background:rgba(0,255,136,0.07); }
  .st-tab .ic{ font-size:12px; opacity:0.8; }

  .st-content{ flex:1; overflow-y:auto; padding:16px 20px; overscroll-behavior:contain; }

  /* Хлебные крошки */
  .st-crumbs{ font-size:10px; letter-spacing:0.1em; color:var(--dimmer,#0a3d24); margin-bottom:14px; }
  .st-crumbs .c-link{ color:var(--dim,#4a9d7a); cursor:pointer; }
  .st-crumbs .c-link:hover{ color:var(--g,#00ff88); }

  /* Сетка папок */
  .st-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:16px; }
  .st-folder{
    border:1px solid rgba(0,255,136,0.22); background:rgba(0,20,10,0.4);
    padding:20px; cursor:pointer; transition:all .2s; position:relative;
    aspect-ratio:1 / 0.82;
    display:flex; flex-direction:column; justify-content:space-between;
  }
  .st-folder:hover{ border-color:rgba(0,255,136,0.6); background:rgba(0,35,18,0.55); }
  .st-folder .fld-ico{ font-size:34px; color:var(--g,#00ff88); }
  .st-folder .fld-name{ font-size:14px; color:var(--g,#00ff88); letter-spacing:0.04em; margin:6px 0 4px; word-break:break-word; }
  .st-folder .fld-owner{ font-size:8px; letter-spacing:0.14em; }
  .st-folder .fld-count{ position:absolute; top:12px; right:12px; font-size:8px; color:var(--dimmer,#0a3d24); }

  /* Сетка файлов (3 в ряд как ты просил, но адаптивно) */
  .st-files{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .st-files-media{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .st-file{
    border:1px solid rgba(0,255,136,0.2); background:rgba(0,15,8,0.5);
    cursor:pointer; transition:all .2s; position:relative; overflow:hidden;
    display:flex; flex-direction:column;
  }
  .st-file:hover{ border-color:rgba(0,255,136,0.55); }
  .st-thumb{
    width:100%; height:120px; object-fit:cover; display:block;
    background:rgba(0,0,0,0.4); border-bottom:1px solid rgba(0,255,136,0.12);
  }
  .st-thumb-ph{
    width:100%; height:120px; display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:6px; background:rgba(0,0,0,0.4);
    border-bottom:1px solid rgba(0,255,136,0.12); color:var(--dim,#4a9d7a);
  }
  /* Медиа-вариант (фото/видео): квадратные крупные превью */
  .st-files-media .st-thumb, .st-files-media .st-thumb-ph{
    height:auto; aspect-ratio:1 / 1; gap:8px;
  }
  .st-thumb-ph .ph-ic{ font-size:30px; opacity:0.5; }
  .st-files-media .st-thumb-ph .ph-ic{ font-size:46px; }
  .st-thumb-ph .ph-nm{ font-size:8px; letter-spacing:0.06em; opacity:0.6; padding:0 6px; text-align:center; word-break:break-word; }
  .st-file .f-meta{ padding:7px 9px; }
  .st-file .f-name{ font-size:10px; color:var(--g,#00ff88); letter-spacing:0.03em; word-break:break-word; }
  .st-file .f-info{ font-size:8px; color:var(--dimmer,#0a3d24); letter-spacing:0.08em; margin-top:3px; }
  .st-file.locked .st-thumb, .st-file.locked .st-thumb-ph, .st-file.locked .st-note-body{ filter:grayscale(1) brightness(0.4); }
  .st-lock{
    position:absolute; top:0; left:0; right:0; z-index:2;
    height:100%; display:flex; align-items:flex-start; justify-content:center;
    pointer-events:none;
  }
  .st-lock .lk{
    margin-top:34%;
    font-size:34px; color:var(--red,#ff3c3c);
    text-shadow:0 0 12px rgba(255,60,60,0.7);
  }

  /* Мини-форма ввода пароля прямо в плитке (поверх превью) */
  .st-lock.prompting{ align-items:center; pointer-events:auto; background:rgba(0,0,0,0.55); backdrop-filter:blur(1px); }
  .st-lock.prompting .lk{ display:none; }
  .st-pass{
    display:flex; flex-direction:column; align-items:center; gap:7px;
    padding:10px; width:100%;
  }
  .st-pass .pass-label{ font-size:8px; letter-spacing:0.16em; color:var(--red,#ff3c3c); text-align:center; }
  .st-pass input{
    width:82px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,60,60,0.5);
    color:var(--g,#00ff88); font-family:inherit; font-size:15px; letter-spacing:0.3em;
    text-align:center; padding:5px 4px; outline:none;
  }
  .st-pass input:focus{ border-color:var(--g,#00ff88); }
  .st-pass.shake{ animation:stShake 0.35s; }
  @keyframes stShake{ 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }

  /* Заметки — карточки текста */
  .st-note-body{ padding:9px; font-size:10px; color:var(--dim,#4a9d7a); line-height:1.5; height:120px; overflow:hidden; border-bottom:1px solid rgba(0,255,136,0.12); }

  /* Лента ALL */
  .st-feed{ display:flex; flex-direction:column; gap:10px; max-width:680px; }
  .st-feed-item{
    display:flex; align-items:center; gap:12px; padding:10px 12px;
    border:1px solid rgba(0,255,136,0.16); background:rgba(0,15,8,0.4);
    cursor:pointer; transition:all .18s; position:relative;
  }
  .st-feed-item:hover{ border-color:rgba(0,255,136,0.5); background:rgba(0,28,14,0.5); }
  .st-feed-ic{ font-size:18px; width:26px; text-align:center; flex-shrink:0; }
  .st-feed-main{ flex:1; min-width:0; }
  .st-feed-title{ font-size:11px; color:var(--g,#00ff88); letter-spacing:0.03em; }
  .st-feed-sub{ font-size:8px; color:var(--dimmer,#0a3d24); letter-spacing:0.1em; margin-top:2px; }
  .st-feed-date{ font-size:8px; color:var(--dim,#4a9d7a); letter-spacing:0.08em; flex-shrink:0; }

  /* ── МЕДИА-карточки (фото/видео): вытянутые, с превью-окном слева ── */
  .st-feed-item.media{ padding:0; align-items:stretch; min-height:74px; }
  .st-feed-thumb{
    width:104px; flex-shrink:0; background:rgba(0,0,0,0.5);
    border-right:1px solid rgba(0,255,136,0.16);
    display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;
  }
  .st-feed-thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
  .st-feed-thumb .ph{ font-size:26px; color:var(--dim,#4a9d7a); opacity:0.5; }
  .st-feed-item.media .st-feed-main{ padding:12px 14px; display:flex; flex-direction:column; justify-content:center; }
  .st-feed-item.media .st-feed-date{ padding:12px 14px; display:flex; align-items:center; }
  .st-feed-badge{
    position:absolute; bottom:5px; left:5px; font-size:7px; letter-spacing:0.12em;
    background:rgba(0,0,0,0.7); color:var(--b,#00ccff); padding:2px 5px; border:1px solid rgba(0,200,255,0.35);
  }
  .st-feed-item.media.is-video .st-feed-badge{ color:var(--yellow,#ffcc00); border-color:rgba(255,200,0,0.4); }
  .st-feed-thumb .play-tri{ position:absolute; font-size:22px; color:rgba(255,255,255,0.85); text-shadow:0 0 8px rgba(0,0,0,0.8); }

  /* ── ЗАМЕТКА: карточка с «загнутым углом» и цитатой текста ── */
  .st-feed-item.note{ border-left:2px solid var(--g,#00ff88); background:rgba(0,20,10,0.35); }
  .st-feed-note-quote{
    font-size:9px; color:var(--dim,#4a9d7a); font-style:italic; margin-top:3px;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:340px; opacity:0.8;
  }

  /* ── Запертый элемент в ленте ── */
  .st-feed-item.locked .st-feed-title{ color:var(--dim,#4a9d7a); }
  .st-feed-item.locked .st-feed-thumb img{ filter:grayscale(1) brightness(0.35); }
  .st-feed-lock{ color:var(--red,#ff3c3c); text-shadow:0 0 6px rgba(255,60,60,0.6); }

  /* ══ Лента ALL: две колонки — список + панель свойств ══ */
  .st-all-wrap{ display:flex; gap:28px; align-items:flex-start; }
  .st-all-wrap .st-feed{ width:640px; flex-shrink:0; min-width:0; max-width:640px; }
  /* правая зона занимает всё оставшееся место и центрирует панель */
  .st-props-zone{ flex:1; display:flex; align-items:flex-start; justify-content:center; position:sticky; top:0; min-height:0; }
  .st-feed-item.selected{ border-color:var(--g,#00ff88); background:rgba(0,40,20,0.55); box-shadow:0 0 0 1px rgba(0,255,136,0.3) inset; }

  /* Панель свойств справа — крупная */
  .st-props{
    width:100%; max-width:460px;
    border:1px solid rgba(0,255,136,0.22); background:rgba(0,14,8,0.6);
  }
  .st-props-empty{
    padding:80px 20px; text-align:center; color:var(--dimmer,#0a3d24);
    font-size:13px; letter-spacing:0.14em; line-height:2;
  }
  .st-props-preview{
    width:100%; height:300px; background:rgba(0,0,0,0.5);
    border-bottom:1px solid rgba(0,255,136,0.18);
    display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;
  }
  .st-props-preview img{ width:100%; height:100%; object-fit:cover; }
  .st-props-preview .pv-ic{ font-size:80px; color:var(--dim,#4a9d7a); opacity:0.5; }
  .st-props-preview .pv-lock{ font-size:70px; color:var(--red,#ff3c3c); text-shadow:0 0 18px rgba(255,60,60,0.6); }
  .st-props-preview.locked img{ filter:grayscale(1) brightness(0.3); }
  .st-props-preview .pv-play{ position:absolute; font-size:52px; color:rgba(255,255,255,0.85); text-shadow:0 0 12px rgba(0,0,0,0.8); }
  .st-props-preview .pv-note{ padding:24px; font-size:13px; color:var(--dim,#4a9d7a); font-style:italic; line-height:1.7; overflow:hidden; height:100%; }

  .st-props-title{ padding:18px 20px 6px; font-size:19px; color:var(--g,#00ff88); letter-spacing:0.03em; word-break:break-word; }
  .st-props-btns{ display:flex; gap:12px; padding:10px 20px 16px; }
  .st-props-btn{
    flex:1; text-align:center; padding:13px 8px; font-size:12px; letter-spacing:0.12em;
    border:1px solid rgba(0,255,136,0.4); color:var(--g,#00ff88);
    cursor:pointer; transition:all .18s; user-select:none;
  }
  .st-props-btn:hover{ background:rgba(0,255,136,0.12); border-color:rgba(0,255,136,0.8); }
  .st-props-btn.locked{ border-color:rgba(255,60,60,0.4); color:var(--red,#ff3c3c); }
  .st-props-btn.locked:hover{ background:rgba(255,60,60,0.1); }

  .st-props-meta{ border-top:1px solid rgba(0,255,136,0.14); padding:18px 20px; }
  .st-props-row{ display:flex; justify-content:space-between; gap:14px; font-size:12px; letter-spacing:0.06em; padding:7px 0; }
  .st-props-row .k{ color:var(--dimmer,#0a3d24); text-transform:uppercase; flex-shrink:0; }
  .st-props-row .v{ color:var(--dim,#4a9d7a); text-align:right; word-break:break-word; }
  .st-props-row .v.lock-yes{ color:var(--red,#ff3c3c); }
  .st-props-row .v.lock-no{ color:var(--g,#00ff88); }

  /* Комментарий Коко в панели свойств */
  .st-props-comment{
    margin:0 20px 4px; padding:12px 14px;
    border-left:2px solid rgba(0,255,136,0.5); background:rgba(0,255,136,0.04);
    font-size:12px; font-style:italic; color:var(--dim,#4a9d7a); line-height:1.6;
  }
  .st-props-comment .cmt-by{ font-style:normal; font-size:9px; letter-spacing:0.14em; color:var(--g,#00ff88); margin-top:6px; text-align:right; }

  /* Поле ввода пароля прямо в панели (FILES) */
  .st-panel-pass{ flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; }
  .st-panel-pass .pp-label{ font-size:10px; letter-spacing:0.14em; color:var(--red,#ff3c3c); }
  .st-panel-pass input{
    width:120px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,60,60,0.5);
    color:var(--g,#00ff88); font-family:inherit; font-size:18px; letter-spacing:0.35em;
    text-align:center; padding:8px; outline:none;
  }
  .st-panel-pass input:focus{ border-color:var(--g,#00ff88); }
  .st-panel-pass.shake{ animation:stShake 0.35s; }

  /* СКАЧАТЬ как ссылка внутри кнопки панели */
  a.st-props-btn{ text-decoration:none; display:flex; align-items:center; justify-content:center; }

  /* Пустая папка */
  .st-empty{ padding:50px 20px; text-align:center; color:var(--dimmer,#0a3d24); font-size:11px; letter-spacing:0.16em; }

  /* Просмотрщик */
  #st-viewer{
    display:none; position:fixed; inset:0; z-index:9990;
    background:rgba(0,0,0,0.88); backdrop-filter:blur(6px);
    align-items:center; justify-content:center; flex-direction:column; gap:14px; padding:30px;
  }
  #st-viewer .v-frame{ max-width:82vw; max-height:74vh; border:1px solid rgba(0,255,136,0.4); box-shadow:0 0 30px rgba(0,255,136,0.15); }
  #st-viewer img.v-frame, #st-viewer video.v-frame{ object-fit:contain; background:#000; }
  #st-viewer .v-note{
    width:min(560px,82vw); max-height:70vh; overflow-y:auto; padding:22px 26px;
    border:1px solid rgba(0,255,136,0.4); background:rgba(0,18,10,0.9);
    font-size:13px; line-height:1.7; color:var(--g,#00ff88); white-space:pre-wrap;
  }
  #st-viewer .v-meta{ font-size:10px; color:var(--dim,#4a9d7a); letter-spacing:0.1em; text-align:center; }
  #st-viewer .v-file{
    width:min(420px,82vw); padding:34px 30px; text-align:center;
    border:1px solid rgba(0,255,136,0.4); background:rgba(0,18,10,0.9);
    display:flex; flex-direction:column; align-items:center; gap:10px;
  }
  #st-viewer .v-file-ico{ font-size:66px; color:var(--g,#00ff88); opacity:0.85; line-height:1; }
  #st-viewer .v-file-ext{
    font-size:11px; letter-spacing:0.2em; color:var(--b,#00ccff);
    border:1px solid rgba(0,200,255,0.4); padding:3px 10px; margin-top:-4px;
  }
  #st-viewer .v-file-name{ font-size:16px; color:var(--g,#00ff88); letter-spacing:0.03em; word-break:break-word; margin-top:6px; }
  #st-viewer .v-file-info{ font-size:10px; color:var(--dimmer,#0a3d24); letter-spacing:0.1em; }
  #st-viewer .v-file-dl{
    margin-top:14px; padding:12px 26px; font-size:12px; letter-spacing:0.12em;
    border:1px solid rgba(0,255,136,0.5); color:var(--g,#00ff88);
    text-decoration:none; cursor:pointer; transition:all .18s;
  }
  #st-viewer .v-file-dl:hover{ background:rgba(0,255,136,0.14); border-color:rgba(0,255,136,0.9); }
  #st-viewer .v-close{
    padding:7px 20px; border:1px solid rgba(255,34,68,0.5); color:var(--red,#ff3c3c);
    font-size:11px; cursor:pointer; letter-spacing:0.12em; transition:all .2s;
  }
  #st-viewer .v-close:hover{ background:rgba(255,34,68,0.12); }

  @media (max-width:900px) and (orientation:landscape){
    .st-tabs{ width:110px; }
    .st-files{ grid-template-columns:repeat(3,1fr); }
  }
  `;
  document.head.appendChild(css);

  // ════════════════════════════════════════════════════════════════════
  //  РАЗМЕТКА ОВЕРЛЕЯ
  // ════════════════════════════════════════════════════════════════════
  const ov = document.createElement('div');
  ov.id = 'storage-overlay';
  ov.innerHTML = `
    <div class="crt-glow-bg"></div>
    <div class="st-head">
      <div>
        <div class="st-title">CREW STORAGE</div>
        <div class="st-sub">// SHARED ARCHIVE — PANDEMONIUM-04 // logged in as KOKO</div>
      </div>
      <div class="st-close" id="st-close">✕ CLOSE</div>
    </div>

    <div class="st-toolbar">
      <div class="st-tool">+ ADD</div>
      <div class="st-tool">↑ UPLOAD</div>
      <div class="st-tool">✎ EDIT</div>
      <div class="st-tool">🗑 DELETE</div>
      <input class="st-search" id="st-search" placeholder="> search archive...">
      <div class="st-tool" id="st-sort">⇅ SORT: DATE</div>
      <div class="st-space">STORAGE <span class="st-bar-track"><span class="st-bar-fill"></span></span> 847.3 MB / 2.0 GB</div>
    </div>

    <div class="st-body">
      <div class="st-tabs" id="st-tabs"></div>
      <div class="st-content" id="st-content"></div>
    </div>
    <div class="crt-glow-overlay"></div>
  `;
  document.body.appendChild(ov);

  const viewer = document.createElement('div');
  viewer.id = 'st-viewer';
  document.body.appendChild(viewer);

  // ════════════════════════════════════════════════════════════════════
  //  СОСТОЯНИЕ + РЕНДЕР
  // ════════════════════════════════════════════════════════════════════
  let activeTab = 'all';
  let openFolder = null;   // {cat, index} когда внутри папки
  let searchTerm = '';
  let selectedKey = null;  // выбранный элемент в ленте ALL (для панели свойств)
  const STORAGE_PASSWORD = '4444';  // единый код разблокировки всех запертых материалов

  const tabsEl = document.getElementById('st-tabs');
  const contentEl = document.getElementById('st-content');

  function iconFor(cat){
    return { photos:'▤', video:'▷', audio:'♪', files:'▦', notes:'✎' }[cat] || '▦';
  }

  function renderTabs(){
    tabsEl.innerHTML = '';
    TABS.forEach(t => {
      const el = document.createElement('div');
      el.className = 'st-tab' + (t.id === activeTab ? ' active' : '');
      el.innerHTML = `<span class="ic">${t.icon}</span>${t.label}`;
      el.onclick = () => { activeTab = t.id; openFolder = null; selectedKey = null; render(); };
      tabsEl.appendChild(el);
    });
  }

  // ── Плитка одного файла (фото/видео/аудио/файл)
  function fileCard(f, cat){
    const card = document.createElement('div');
    card.className = 'st-file' + (f.locked ? ' locked' : '') + (cat === 'notes' ? ' st-note' : '');

    let inner = '';
    if(f.locked) inner += `<div class="st-lock"><span class="lk">🔒</span></div>`;

    if(cat === 'notes'){
      inner += `<div class="st-note-body">${f.locked ? '[ RESTRICTED ]' : escapeHtml(f.text || '').slice(0,180)}</div>`;
    } else if(cat === 'photos'){
      inner += `<img class="st-thumb" src="${f.src}" alt="" onerror="this.outerHTML='<div class=\\'st-thumb-ph\\'><div class=\\'ph-ic\\'>▤</div><div class=\\'ph-nm\\'>${escAttr(f.title)}</div></div>'">`;
    } else {
      const ic = cat === 'video' ? '▷' : cat === 'audio' ? '♪' : '▦';
      inner += `<div class="st-thumb-ph"><div class="ph-ic">${ic}</div><div class="ph-nm">${escapeHtml(f.title)}</div></div>`;
    }

    inner += `
      <div class="f-meta">
        <div class="f-name">${escapeHtml(f.title)}</div>
        <div class="f-info">${shortDate(f.date)} · ${f.size}</div>
      </div>`;
    card.innerHTML = inner;
    if(f.locked && !f._unlocked){
      card.onclick = () => promptPassword(card, f, cat);
    } else {
      card.onclick = () => openViewer(f, cat);
    }
    return card;
  }

  // ── Содержимое открытой папки
  function renderFolderContents(cat, folder){
    contentEl.innerHTML = '';
    contentEl.appendChild(crumbs([
      { label:'STORAGE', act:()=>{ activeTab='all'; openFolder=null; render(); } },
      { label: TABS.find(t=>t.id===cat).label, act:()=>{ activeTab=cat; openFolder=null; render(); } },
      { label: folder.name },
    ]));

    if(!folder.items || folder.items.length === 0){
      const e = document.createElement('div');
      e.className = 'st-empty';
      e.textContent = '// NO SHARED FILES';
      contentEl.appendChild(e);
      return;
    }
    // ── FILES: особый вид — список строк слева + панель свойств справа ──
    if(cat === 'files'){
      renderFilesList(cat, folder);
      return;
    }

    const grid = document.createElement('div');
    // фото и видео — крупная квадратная сетка 4 в ряд; остальное — компактная 3 в ряд
    grid.className = (cat === 'photos' || cat === 'video') ? 'st-files-media' : 'st-files';
    folder.items
      .filter(f => !searchTerm || f.title.toLowerCase().includes(searchTerm))
      .forEach(f => grid.appendChild(fileCard(f, cat)));
    contentEl.appendChild(grid);
  }

  // Категория FILES: строки как в ленте ALL + панель свойств с кнопкой скачивания
  function renderFilesList(cat, folder){
    const items = folder.items.filter(f => !searchTerm || f.title.toLowerCase().includes(searchTerm));

    const allWrap = document.createElement('div');
    allWrap.className = 'st-all-wrap';
    const list = document.createElement('div');
    list.className = 'st-feed';
    const zone = document.createElement('div');
    zone.className = 'st-props-zone';
    const props = document.createElement('div');
    props.className = 'st-props';
    zone.appendChild(props);

    items.forEach(f => {
      const isLocked = f.locked && !f._unlocked;
      const ext = (f.title.split('.').pop() || 'file').toUpperCase();
      const key = 'files::' + openFolder.index + '::' + f.title;
      const item = document.createElement('div');
      item.className = 'st-feed-item' + (isLocked ? ' locked' : '');
      const quote = f.comment
        ? `<div class="st-feed-note-quote">“${escapeHtml(f.comment)}”</div>` : '';
      item.innerHTML = `
        <div class="st-feed-ic" style="color:${OWNER_COLOR[folder.owner]||'var(--dim)'}">${isLocked ? '<span class="st-feed-lock">🔒</span>' : '▦'}</div>
        <div class="st-feed-main">
          <div class="st-feed-title">${escapeHtml(f.title)}</div>
          ${quote}
          <div class="st-feed-sub">${ext} · ${f.size} · <span style="color:${OWNER_COLOR[folder.owner]||'var(--dim)'}">${folder.owner}</span></div>
        </div>
        <div class="st-feed-date">${shortDate(f.date)}</div>`;
      if(selectedKey === key) item.classList.add('selected');
      item.onclick = () => {
        selectedKey = key;
        list.querySelectorAll('.st-feed-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        renderFileProps(props, f, folder);
      };
      list.appendChild(item);
    });

    allWrap.appendChild(list);
    allWrap.appendChild(zone);
    contentEl.appendChild(allWrap);

    // восстановить выбранный / заглушка
    const sel = items.find(f => ('files::' + openFolder.index + '::' + f.title) === selectedKey);
    if(sel) renderFileProps(props, sel, folder);
    else renderProps(props, null);
  }

  // Панель свойств для файла: превью-иконка, метаданные, комментарий,
  // одна кнопка СКАЧАТЬ. Для запертого — ввод пароля прямо в панели.
  function renderFileProps(panel, f, folder){
    const isLocked = f.locked && !f._unlocked;
    const col = OWNER_COLOR[folder.owner] || 'var(--dim)';
    const ext = (f.title.split('.').pop() || 'file').toUpperCase();

    const preview = isLocked
      ? `<div class="st-props-preview locked"><span class="pv-lock">🔒</span></div>`
      : `<div class="st-props-preview"><span class="pv-ic">▦</span><span style="position:absolute;bottom:14px;font-size:12px;letter-spacing:0.2em;color:var(--b,#00ccff);border:1px solid rgba(0,200,255,0.4);padding:3px 10px">${escapeHtml(ext)}</span></div>`;

    // блок действия: скачать / ввод пароля
    const action = isLocked
      ? `<div class="st-props-btns"><div class="st-props-btn locked" data-act="unlock">🔒 UNLOCK</div></div>`
      : `<div class="st-props-btns"><a class="st-props-btn" href="${f.src}" download data-act="download">↓ DOWNLOAD</a></div>`;

    const commentRow = f.comment
      ? `<div class="st-props-comment">“${escapeHtml(f.comment)}”<div class="cmt-by">— KOKO</div></div>` : '';

    panel.innerHTML = `
      ${preview}
      <div class="st-props-title">${escapeHtml(f.title)}</div>
      ${action}
      ${commentRow}
      <div class="st-props-meta">
        <div class="st-props-row"><span class="k">type</span><span class="v">${escapeHtml(ext)} FILE</span></div>
        <div class="st-props-row"><span class="k">size</span><span class="v">${f.size}</span></div>
        <div class="st-props-row"><span class="k">added by</span><span class="v" style="color:${col}">${folder.owner}</span></div>
        <div class="st-props-row"><span class="k">date</span><span class="v">${f.date}</span></div>
        <div class="st-props-row"><span class="k">folder</span><span class="v">${escapeHtml(folder.name)}</span></div>
        <div class="st-props-row"><span class="k">access</span><span class="v ${isLocked?'lock-yes':'lock-no'}">${isLocked?'🔒 LOCKED':'✓ OPEN'}</span></div>
      </div>`;

    // разблокировка прямо в панели
    if(isLocked){
      const btn = panel.querySelector('[data-act="unlock"]');
      btn.onclick = () => showPanelPassword(panel, f, folder);
    }
  }

  // Разворачивает поле ввода пароля прямо в панели свойств (для FILES)
  function showPanelPassword(panel, f, folder){
    const btns = panel.querySelector('.st-props-btns');
    btns.innerHTML = `
      <div class="st-panel-pass">
        <div class="pp-label">🔒 ENTER ACCESS CODE</div>
        <input type="password" inputmode="numeric" maxlength="8" autocomplete="off">
      </div>`;
    const input = btns.querySelector('input');
    const box = btns.querySelector('.st-panel-pass');
    input.focus();
    const submit = () => {
      if(input.value === STORAGE_PASSWORD){
        f._unlocked = true;
        renderFileProps(panel, f, folder);  // панель обновится: замок исчез, есть СКАЧАТЬ
        render();                            // и список перерисуется без замка
      } else {
        box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
        input.value = ''; input.focus();
      }
    };
    input.addEventListener('keydown', e => {
      e.stopPropagation();
      if(e.key === 'Enter') submit();
      if(e.key === 'Escape') renderFileProps(panel, f, folder);
    });
    input.addEventListener('input', () => { if(input.value.length >= STORAGE_PASSWORD.length) submit(); });
  }

  // ── Сетка папок категории
  function renderCategory(cat){
    contentEl.innerHTML = '';
    contentEl.appendChild(crumbs([
      { label:'STORAGE', act:()=>{ activeTab='all'; openFolder=null; render(); } },
      { label: TABS.find(t=>t.id===cat).label },
    ]));

    const grid = document.createElement('div');
    grid.className = 'st-grid';
    (STORAGE_DATA[cat] || []).forEach((folder, i) => {
      const el = document.createElement('div');
      el.className = 'st-folder';
      const col = OWNER_COLOR[folder.owner] || 'var(--dim)';
      el.innerHTML = `
        <div class="fld-count">${folder.items.length} ${folder.items.length === 1 ? 'item' : 'items'}</div>
        <div class="fld-ico">🗀</div>
        <div>
          <div class="fld-name">${escapeHtml(folder.name)}</div>
          <div class="fld-owner" style="color:${col}">by ${folder.owner}</div>
        </div>`;
      el.onclick = () => { openFolder = { cat, index:i }; render(); };
      grid.appendChild(el);
    });
    contentEl.appendChild(grid);
  }

  // Уникальный ключ элемента ленты (категория+папка+имя)
  function feedKey(x){ return x.cat + '::' + x.folderIndex + '::' + x.f.title; }

  // Панель свойств справа в ленте ALL
  function renderProps(panel, x){
    if(!x){
      panel.innerHTML = `<div class="st-props-empty">// SELECT AN ITEM<br>to inspect properties</div>`;
      return;
    }
    const f = x.f, cat = x.cat;
    const isLocked = f.locked && !f._unlocked;
    const col = OWNER_COLOR[x.owner] || 'var(--dim)';

    // ── превью ──
    let preview;
    if(isLocked){
      preview = `<div class="st-props-preview locked"><span class="pv-lock">🔒</span></div>`;
    } else if(cat === 'photos'){
      preview = `<div class="st-props-preview"><img src="${f.src}" onerror="this.outerHTML='<span class=\\'pv-ic\\'>▤</span>'"></div>`;
    } else if(cat === 'video'){
      preview = `<div class="st-props-preview"><img src="${f.poster || ''}" onerror="this.outerHTML='<span class=\\'pv-ic\\'>▷</span>'"><span class="pv-play">▶</span></div>`;
    } else if(cat === 'notes'){
      const q = escapeHtml((f.text || '').replace(/\n/g,' ').trim()).slice(0,140);
      preview = `<div class="st-props-preview"><div class="pv-note">“${q}…”</div></div>`;
    } else {
      const ic = cat === 'audio' ? '♪' : '▦';
      preview = `<div class="st-props-preview"><span class="pv-ic">${ic}</span></div>`;
    }

    // ── кнопки ──
    const openBtn = isLocked
      ? `<div class="st-props-btn locked" data-act="goto">🔒 UNLOCK</div>`
      : `<div class="st-props-btn" data-act="open">▷ OPEN</div>`;
    // ── метаданные ──
    const catLabel = { photos:'IMAGE', video:'VIDEO', audio:'AUDIO', files:'FILE', notes:'NOTE' }[cat] || cat.toUpperCase();
    panel.innerHTML = `
      ${preview}
      <div class="st-props-title">${escapeHtml(f.title)}</div>
      <div class="st-props-btns">
        ${openBtn}
        <div class="st-props-btn" data-act="goto">↪ GO TO</div>
      </div>
      <div class="st-props-meta">
        <div class="st-props-row"><span class="k">type</span><span class="v">${catLabel}</span></div>
        <div class="st-props-row"><span class="k">size</span><span class="v">${f.size}</span></div>
        <div class="st-props-row"><span class="k">added by</span><span class="v" style="color:${col}">${x.owner}</span></div>
        <div class="st-props-row"><span class="k">date</span><span class="v">${f.date}</span></div>
        <div class="st-props-row"><span class="k">folder</span><span class="v">${escapeHtml(x.folder)}</span></div>
        <div class="st-props-row"><span class="k">path</span><span class="v">${cat}/${escapeHtml(x.folder)}</span></div>
        <div class="st-props-row"><span class="k">access</span><span class="v ${isLocked?'lock-yes':'lock-no'}">${isLocked?'🔒 LOCKED':'✓ OPEN'}</span></div>
      </div>`;

    // обработчики кнопок
    panel.querySelectorAll('.st-props-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const act = btn.getAttribute('data-act');
        if(act === 'open'){
          openViewer(f, cat);
        } else { // goto — перейти в папку материала (там же ввод пароля если заперт)
          activeTab = cat; openFolder = { cat, index:x.folderIndex }; selectedKey = null; render();
        }
      };
    });
  }

  // ── Лента ALL: все файлы всех категорий, вперемешку по дате
  function renderAll(){
    contentEl.innerHTML = '';
    contentEl.appendChild(crumbs([{ label:'STORAGE' }, { label:'ALL — RECENT' }]));

    const feed = [];
    Object.keys(STORAGE_DATA).forEach(cat => {
      STORAGE_DATA[cat].forEach((folder, fi) => {
        (folder.items || []).forEach(f => {
          feed.push({ f, cat, folder:folder.name, owner:folder.owner, folderIndex:fi });
        });
      });
    });
    // сорт по дате (свежие сверху); '—' и '???' в конец
    feed.sort((a,b) => dateKey(b.f.date) - dateKey(a.f.date));

    const filtered = feed.filter(x => !searchTerm || x.f.title.toLowerCase().includes(searchTerm));
    if(filtered.length === 0){
      const e = document.createElement('div'); e.className='st-empty'; e.textContent='// NOTHING FOUND';
      contentEl.appendChild(e); return;
    }

    // двухколоночная обёртка: список + панель свойств
    const allWrap = document.createElement('div');
    allWrap.className = 'st-all-wrap';
    const wrap = document.createElement('div');
    wrap.className = 'st-feed';
    const props = document.createElement('div');
    props.className = 'st-props';

    filtered.forEach((x, idx) => {
      const f = x.f, cat = x.cat;
      const col = OWNER_COLOR[x.owner] || 'var(--dim)';
      const isLocked = f.locked && !f._unlocked;
      const item = document.createElement('div');

      const sub = `${cat.toUpperCase()} · ${escapeHtml(x.folder)} · <span style="color:${col}">${x.owner}</span>`;

      if(cat === 'photos' || cat === 'video'){
        // ── ВЫТЯНУТАЯ медиа-карточка с превью-окном слева ──
        item.className = 'st-feed-item media' + (cat === 'video' ? ' is-video' : '') + (isLocked ? ' locked' : '');
        let thumbInner;
        if(isLocked){
          thumbInner = `<span class="ph st-feed-lock">🔒</span>`;
        } else if(cat === 'photos'){
          thumbInner = `<img src="${f.src}" alt="" onerror="this.outerHTML='<span class=\\'ph\\'>▤</span>'">`;
        } else {
          thumbInner = `<img src="${f.poster || ''}" alt="" onerror="this.outerHTML='<span class=\\'ph\\'>▷</span>'"><span class="play-tri">▶</span>`;
        }
        item.innerHTML = `
          <div class="st-feed-thumb">
            ${thumbInner}
            <span class="st-feed-badge">${cat === 'video' ? 'VIDEO' : 'PHOTO'}</span>
          </div>
          <div class="st-feed-main">
            <div class="st-feed-title">${escapeHtml(f.title)}</div>
            <div class="st-feed-sub">${sub}</div>
          </div>
          <div class="st-feed-date">${shortDate(f.date)}</div>`;

      } else if(cat === 'notes'){
        // ── ЗАМЕТКА: акцент слева + цитата текста ──
        item.className = 'st-feed-item note' + (isLocked ? ' locked' : '');
        const quote = isLocked ? '[ restricted ]'
          : '“' + escapeHtml((f.text || '').replace(/\n/g,' ').trim()).slice(0,70) + '…”';
        item.innerHTML = `
          <div class="st-feed-ic" style="color:${col}">${isLocked ? '<span class="st-feed-lock">🔒</span>' : '✎'}</div>
          <div class="st-feed-main">
            <div class="st-feed-title">${escapeHtml(f.title)}</div>
            <div class="st-feed-note-quote">${quote}</div>
            <div class="st-feed-sub">${sub}</div>
          </div>
          <div class="st-feed-date">${shortDate(f.date)}</div>`;

      } else {
        // ── AUDIO / FILES: компактная строка как раньше ──
        item.className = 'st-feed-item' + (isLocked ? ' locked' : '');
        item.innerHTML = `
          <div class="st-feed-ic" style="color:${col}">${isLocked ? '<span class="st-feed-lock">🔒</span>' : iconFor(cat)}</div>
          <div class="st-feed-main">
            <div class="st-feed-title">${escapeHtml(f.title)}</div>
            <div class="st-feed-sub">${sub}</div>
          </div>
          <div class="st-feed-date">${shortDate(f.date)}</div>`;
      }

      if(selectedKey === feedKey(x)) item.classList.add('selected');
      item.onclick = () => {
        selectedKey = feedKey(x);
        // снять выделение со всех, выделить текущий
        wrap.querySelectorAll('.st-feed-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        renderProps(props, x);
      };
      wrap.appendChild(item);
    });

    // правая зона центрирует панель в свободном пространстве
    const zone = document.createElement('div');
    zone.className = 'st-props-zone';
    zone.appendChild(props);

    allWrap.appendChild(wrap);
    allWrap.appendChild(zone);
    contentEl.appendChild(allWrap);

    // восстановить панель для ранее выбранного, иначе — заглушка
    const sel = filtered.find(x => feedKey(x) === selectedKey);
    if(sel) renderProps(props, sel);
    else renderProps(props, null);
  }

  function render(){
    renderTabs();
    if(activeTab === 'all'){ renderAll(); return; }
    if(openFolder){
      renderFolderContents(openFolder.cat, STORAGE_DATA[openFolder.cat][openFolder.index]);
    } else {
      renderCategory(activeTab);
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //  ПРОСМОТРЩИК
  // ════════════════════════════════════════════════════════════════════
  // Разворачивает поле ввода пароля прямо в плитке запертого файла
  function promptPassword(card, f, cat){
    const lock = card.querySelector('.st-lock');
    if(!lock || lock.classList.contains('prompting')) return;
    lock.classList.add('prompting');
    lock.innerHTML = `
      <div class="st-pass">
        <div class="pass-label">🔒 ENTER ACCESS CODE</div>
        <input type="password" inputmode="numeric" maxlength="8" autocomplete="off">
      </div>`;
    const input = lock.querySelector('input');
    const pass = lock.querySelector('.st-pass');
    input.focus();

    const submit = () => {
      if(input.value === STORAGE_PASSWORD){
        f._unlocked = true;      // разблокировано на сессию
        render();                // замок исчезает; материал НЕ открывается —
                                 // пользователь сам кликнет по нему
      } else {
        pass.classList.remove('shake'); void pass.offsetWidth;
        pass.classList.add('shake');
        input.value = '';
        input.focus();
      }
    };
    input.addEventListener('keydown', e => {
      e.stopPropagation();
      if(e.key === 'Enter') submit();
      if(e.key === 'Escape'){ lock.classList.remove('prompting'); render(); }
    });
    input.addEventListener('input', () => {
      if(input.value.length >= STORAGE_PASSWORD.length) submit();
    });
    // клик мимо поля не должен всплывать до card.onclick
    lock.onclick = e => e.stopPropagation();
  }

  function openViewer(f, cat){
    // запертые файлы сюда попадают только после верного пароля
    // (f._unlocked === true), поэтому проверки locked здесь больше нет
    let media = '';
    if(cat === 'photos'){
      media = `<img class="v-frame" src="${f.src}" onerror="this.outerHTML='<div class=\\'v-note\\'>▤ IMAGE UNAVAILABLE<br><br>${escAttr(f.title)}<br><span style=\\'font-size:10px;opacity:0.6\\'>// file not found — placeholder</span></div>'">`;
    } else if(cat === 'video'){
      media = `<video class="v-frame" src="${f.src}" controls autoplay onerror="this.outerHTML='<div class=\\'v-note\\'>▷ VIDEO UNAVAILABLE<br><br>${escAttr(f.title)}<br><span style=\\'font-size:10px;opacity:0.6\\'>// file not found — placeholder</span></div>'"></video>`;
    } else if(cat === 'audio'){
      media = `<div class="v-note" style="text-align:center">♪ ${escapeHtml(f.title)}<br><br>
        <audio src="${f.src}" controls autoplay style="width:100%" onerror="this.outerHTML='<div style=\\'font-size:11px;opacity:0.6;margin-top:8px\\'>// file not found — placeholder</div>'"></audio></div>`;
    } else if(cat === 'notes'){
      media = `<div class="v-note">${escapeHtml(f.text || '')}</div>`;
    } else {
      // FILES: карточка с иконкой, именем и кнопкой скачивания
      const ext = (f.title.split('.').pop() || 'file').toUpperCase();
      media = `<div class="v-file">
        <div class="v-file-ico">▦</div>
        <div class="v-file-ext">${escapeHtml(ext)}</div>
        <div class="v-file-name">${escapeHtml(f.title)}</div>
        <div class="v-file-info">${f.size} · added ${f.date}</div>
        <a class="v-file-dl" href="${f.src}" download>↓ DOWNLOAD FILE</a>
      </div>`;
    }

    viewer.innerHTML = `
      ${media}
      <div class="v-meta">${escapeHtml(f.title)} · ${f.date} · ${f.size}</div>
      <div class="v-close" id="v-close">✕ CLOSE</div>`;
    viewer.style.display = 'flex';
    document.getElementById('v-close').onclick = closeViewer;
  }
  function closeViewer(){
    viewer.style.display = 'none';
    viewer.innerHTML = '';  // остановит audio/video
  }
  viewer.addEventListener('click', e => { if(e.target === viewer) closeViewer(); });

  // ════════════════════════════════════════════════════════════════════
  //  ХЕЛПЕРЫ
  // ════════════════════════════════════════════════════════════════════
  function crumbs(parts){
    const el = document.createElement('div');
    el.className = 'st-crumbs';
    el.innerHTML = parts.map((p,i) => {
      const sep = i < parts.length-1 ? ' / ' : '';
      if(p.act) return `<span class="c-link" data-i="${i}">${escapeHtml(p.label)}</span>${sep}`;
      return `<span>${escapeHtml(p.label)}</span>${sep}`;
    }).join('');
    parts.forEach((p,i) => {
      if(p.act){ el.querySelector(`[data-i="${i}"]`).onclick = p.act; }
    });
    return el;
  }

  function dateKey(d){
    // Извлекает "DD MON YYYY" из любого формата, включая
    // "PD-04 // DAY ████ // 02 MAY 1973". Мусорные/неполные → -1 (в конец).
    const m = { JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12 };
    const match = String(d||'').match(/(\d{1,2})\s+([A-Z]{3})\s+(\d{4})/);
    if(!match) return -1;
    const day = parseInt(match[1],10), mon = m[match[2]], yr = parseInt(match[3],10);
    if(isNaN(day) || !mon || isNaN(yr)) return -1;
    return yr*10000 + mon*100 + day;
  }

  // Короткая дата для списков: "DD MON YYYY" из полного формата.
  // Если формат нестандартный (— или ?? ??? 1974) — вернём как есть.
  function shortDate(d){
    const m = String(d||'').match(/\d{1,2}\s+[A-Z]{3}\s+\d{4}/);
    return m ? m[0] : String(d||'');
  }

  function escapeHtml(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escAttr(s){
    return String(s).replace(/'/g,'').replace(/"/g,'').replace(/</g,'').replace(/>/g,'');
  }

  // Поиск
  document.getElementById('st-search').addEventListener('input', e => {
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  // Закрытие
  document.getElementById('st-close').onclick = closeStorage;

  // ════════════════════════════════════════════════════════════════════
  //  ПУБЛИЧНЫЕ ФУНКЦИИ
  // ════════════════════════════════════════════════════════════════════
  window.openStorage = function(){
    activeTab = 'all'; openFolder = null; searchTerm = ''; selectedKey = null;
    const s = document.getElementById('st-search'); if(s) s.value = '';
    render();
    ov.style.display = 'flex';
  };
  window.closeStorage = function(){
    ov.style.display = 'none';
    closeViewer();
  };
  function closeStorage(){ window.closeStorage(); }

})();
