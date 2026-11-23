/**
 * GUARDIÕES DO DELTA — TOWER DEFENSE (PARNAÍBA - PI)
 * Versão completa com Sprites Pixel Art dos 8 Personagens, Responsividade e Cenários Detalhados
 */

/* =========================================================================
   MÓDULO ISOLADO DA TELA DE ENTRADA
   ========================================================================= */
(() => {
  'use strict';

  const entryScreen = document.getElementById('entry-screen');
  const canvas = document.getElementById('entry-canvas');
  const btnPlay = document.getElementById('entry-btn-play');

  if (!entryScreen || !canvas || !btnPlay) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animFrameId = null;
  let isActive = true;

  const guaras = [];
  const boats = [];
  const stars = [];

  function resizeEntryCanvas() {
    if (!isActive) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  /* =========================================================================
   MÓDULO ISOLADO — SISTEMA DE AUTO-ONDA NAS PARTIDAS
   ========================================================================= */
(() => {
  'use strict';

  const btnAutoWave = document.getElementById('btn-auto-wave');
  const btnStartWave = document.getElementById('btn-start-wave');
  const screenGame = document.getElementById('screen-game');
  const gameModal = document.getElementById('game-modal');
  const btnBackStages = document.getElementById('btn-back-stages');

  if (!btnAutoWave || !btnStartWave || !screenGame) return;

  let autoWaveEnabled = false;
  let autoWaveTimer = null;

  function clearPendingAutoWave() {
    if (autoWaveTimer) {
      clearTimeout(autoWaveTimer);
      autoWaveTimer = null;
    }
  }

  function updateAutoWaveButtonUI() {
    btnAutoWave.classList.toggle('is-active', autoWaveEnabled);
    btnAutoWave.setAttribute('aria-pressed', String(autoWaveEnabled));
    btnAutoWave.textContent = autoWaveEnabled ? '🔁 Auto: ON' : '🔁 Auto: OFF';
  }

  function canTriggerNextWave() {
    const isGameVisible = screenGame.classList.contains('active');
    const isModalClosed = !gameModal || gameModal.classList.contains('hidden');
    return autoWaveEnabled && isGameVisible && isModalClosed && !btnStartWave.disabled;
  }

  function scheduleNextWave(delayMs = 750) {
    clearPendingAutoWave();
    if (!canTriggerNextWave()) return;

    autoWaveTimer = setTimeout(() => {
      autoWaveTimer = null;
      if (canTriggerNextWave()) {
        btnStartWave.click();
      }
    }, delayMs);
  }

  btnAutoWave.addEventListener('click', () => {
    autoWaveEnabled = !autoWaveEnabled;
    updateAutoWaveButtonUI();

    if (autoWaveEnabled) {
      scheduleNextWave(120);
    } else {
      clearPendingAutoWave();
    }
  });

  if (btnBackStages) {
    btnBackStages.addEventListener('click', () => {
      autoWaveEnabled = false;
      clearPendingAutoWave();
      updateAutoWaveButtonUI();
    });
  }

  const waveBtnObserver = new MutationObserver(() => {
    if (!btnStartWave.disabled && autoWaveEnabled) {
      scheduleNextWave(750);
    }
  });
  waveBtnObserver.observe(btnStartWave, {
    attributes: true,
    attributeFilter: ['disabled']
  });

  if (gameModal) {
    const modalObserver = new MutationObserver(() => {
      if (!gameModal.classList.contains('hidden')) {
        clearPendingAutoWave();
      } else if (autoWaveEnabled) {
        scheduleNextWave(850);
      }
    });
    modalObserver.observe(gameModal, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
})();

  function initEntryEntities() {
    stars.length = 0;
    for (let i = 0; i < 36; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.32,
        r: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2
      });
    }

    guaras.length = 0;
    for (let i = 0; i < 7; i++) {
      guaras.push({
        offsetX: -i * 28 - Math.random() * 12,
        offsetY: (i % 2 === 0 ? 1 : -1) * i * 9,
        wingPhase: i * 0.7,
        scale: 0.85 + Math.random() * 0.25
      });
    }

    boats.length = 0;
    boats.push(
      { xRatio: 0.22, yOffset: 0.73, speed: 14, scale: 1.05, hasSail: true },
      { xRatio: 0.74, yOffset: 0.78, speed: -10, scale: 0.85, hasSail: false }
    );
  }

  function drawSkyAndSunset(time) {
    const horizonY = height * 0.66;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#081526');
    skyGrad.addColorStop(0.38, '#1d3557');
    skyGrad.addColorStop(0.72, '#c8553d');
    skyGrad.addColorStop(1, '#f4a261');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY + 2);

    stars.forEach((s) => {
      const alpha = 0.25 + Math.sin(time * 2 + s.phase) * 0.2;
      ctx.fillStyle = `rgba(255, 248, 230, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const sunX = width * 0.5;
    const sunY = horizonY - Math.min(width, height) * 0.04;
    const sunRadius = Math.max(46, Math.min(width, height) * 0.095);

    const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.2, sunX, sunY, sunRadius * 3.4);
    sunGlow.addColorStop(0, 'rgba(255, 243, 176, 0.95)');
    sunGlow.addColorStop(0.35, 'rgba(244, 162, 97, 0.45)');
    sunGlow.addColorStop(1, 'rgba(231, 111, 81, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 3.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPedraDoSalAndWindPark(time) {
    const horizonY = height * 0.66;

    ctx.fillStyle = '#182436';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(width * 0.18, horizonY - 26, width * 0.36, horizonY - 8);
    ctx.quadraticCurveTo(width * 0.52, horizonY - 22, width * 0.72, horizonY - 6);
    ctx.quadraticCurveTo(width * 0.88, horizonY - 32, width, horizonY - 12);
    ctx.lineTo(width, horizonY + 4);
    ctx.lineTo(0, horizonY + 4);
    ctx.closePath();
    ctx.fill();

    const turbines = [
      { x: width * 0.76, y: horizonY - 12, h: 68 },
      { x: width * 0.84, y: horizonY - 20, h: 82 },
      { x: width * 0.91, y: horizonY - 14, h: 62 }
    ];

    turbines.forEach((t, idx) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(24, 36, 54, 0.92)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(t.x, t.y - t.h);
      ctx.stroke();

      ctx.translate(t.x, t.y - t.h);
      ctx.rotate(time * 1.1 + idx);
      ctx.lineWidth = 2;
      for (let b = 0; b < 3; b++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -t.h * 0.42);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawGuarasFlock(time) {
    const baseX = ((time * 38) % (width + 260)) - 120;
    const baseY = height * 0.24 + Math.sin(time * 0.9) * 14;

    guaras.forEach((g) => {
      const gx = baseX + g.offsetX;
      const gy = baseY + g.offsetY + Math.sin(time * 3 + g.wingPhase) * 3;
      const flap = Math.sin(time * 7 + g.wingPhase) * 6;

      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(g.scale, g.scale);
      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, flap);
      ctx.quadraticCurveTo(-4, -4, 0, 0);
      ctx.quadraticCurveTo(4, -4, 10, flap);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawDeltaRiverAndBoats(time) {
    const horizonY = height * 0.66;
    const waterH = height - horizonY;

    const waterGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    waterGrad.addColorStop(0, '#0f4c5c');
    waterGrad.addColorStop(0.45, '#072a38');
    waterGrad.addColorStop(1, '#04131d');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, horizonY, width, waterH);

    const reflGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    reflGrad.addColorStop(0, 'rgba(255, 243, 176, 0.55)');
    reflGrad.addColorStop(0.6, 'rgba(244, 162, 97, 0.16)');
    reflGrad.addColorStop(1, 'rgba(231, 111, 81, 0)');
    ctx.fillStyle = reflGrad;
    ctx.beginPath();
    ctx.moveTo(width * 0.44, horizonY);
    ctx.lineTo(width * 0.56, horizonY);
    ctx.lineTo(width * 0.68, height);
    ctx.lineTo(width * 0.32, height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 230, 180, 0.16)';
    ctx.lineWidth = 1.5;
    for (let row = 1; row <= 6; row++) {
      const wy = horizonY + (waterH * row) / 7;
      const shift = Math.sin(time * 1.6 + row) * 18;
      ctx.beginPath();
      for (let wx = -40; wx < width + 40; wx += 90) {
        ctx.moveTo(wx + shift, wy);
        ctx.quadraticCurveTo(wx + 24 + shift, wy - 2.5, wx + 48 + shift, wy);
      }
      ctx.stroke();
    }

    boats.forEach((boat) => {
      boat.xRatio += (boat.speed * 0.016) / Math.max(width, 600);
      if (boat.xRatio > 1.12) boat.xRatio = -0.12;
      if (boat.xRatio < -0.12) boat.xRatio = 1.12;

      const bx = boat.xRatio * width;
      const by = height * boat.yOffset + Math.sin(time * 2.2 + bx * 0.02) * 2.5;

      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(boat.scale * (boat.speed < 0 ? -1 : 1), boat.scale);

      ctx.fillStyle = '#091522';
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.quadraticCurveTo(0, 10, 28, 0);
      ctx.lineTo(22, -5);
      ctx.lineTo(-22, -5);
      ctx.closePath();
      ctx.fill();

      if (boat.hasSail) {
        ctx.fillStyle = 'rgba(253, 248, 238, 0.85)';
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(-2, -38);
        ctx.lineTo(20, -9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawCarnaubaSilhouettes(time) {
    const drawCarnauba = (x, baseY, trunkH, swayOffset) => {
      const sway = Math.sin(time * 1.4 + swayOffset) * 5;
      const topX = x + sway;
      const topY = baseY - trunkH;

      ctx.save();
      ctx.strokeStyle = '#050d17';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.quadraticCurveTo(x + sway * 0.4, baseY - trunkH * 0.55, topX, topY);
      ctx.stroke();

      const fronds = 11;
      for (let i = 0; i < fronds; i++) {
        const angle = (i * Math.PI * 2) / fronds;
        ctx.save();
        ctx.translate(topX, topY);
        ctx.rotate(angle);
        ctx.fillStyle = '#050d17';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(18, -7, 36, 2);
        ctx.quadraticCurveTo(18, 7, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    };

    drawCarnauba(width * 0.06, height * 1.02, height * 0.36, 0.2);
    drawCarnauba(width * 0.13, height * 1.03, height * 0.25, 1.1);
    drawCarnauba(width * 0.94, height * 1.02, height * 0.34, 2.0);
    drawCarnauba(width * 0.88, height * 1.03, height * 0.23, 2.8);
  }

  function playStartChord() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audio = new AudioCtx();
      const notes = [392.0, 493.88, 587.33, 783.99];

      notes.forEach((freq, idx) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audio.currentTime + idx * 0.065);

        gain.gain.setValueAtTime(0.001, audio.currentTime + idx * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + idx * 0.065 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + idx * 0.065 + 0.45);

        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(audio.currentTime + idx * 0.065);
        osc.stop(audio.currentTime + idx * 0.065 + 0.46);
      });
    } catch (_) {}
  }

  function renderEntryLoop(timestamp) {
    if (!isActive) return;
    const time = timestamp / 1000;
    ctx.clearRect(0, 0, width, height);

    drawSkyAndSunset(time);
    drawGuarasFlock(time);
    drawPedraDoSalAndWindPark(time);
    drawDeltaRiverAndBoats(time);
    drawCarnaubaSilhouettes(time);

    animFrameId = requestAnimationFrame(renderEntryLoop);
  }

  btnPlay.addEventListener('click', () => {
    if (!isActive) return;
    playStartChord();
    entryScreen.classList.add('entry-leaving');

    setTimeout(() => {
      isActive = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resizeEntryCanvas);
      entryScreen.classList.add('entry-hidden');
    }, 550);
  });

  window.addEventListener('resize', resizeEntryCanvas);
  resizeEntryCanvas();
  initEntryEntities();
  animFrameId = requestAnimationFrame(renderEntryLoop);
})();

/* =========================================================================
   JOGO PRINCIPAL — GUARDIÕES DO DELTA
   ========================================================================= */
(() => {
  'use strict';

  /* =========================================================================
     0. SPRITES PIXEL ART DOS 8 PERSONAGENS (SVG EMBUTIDO + CACHE PARA CANVAS)
     ========================================================================= */
  const PIXEL_PALETTE = {
    '.': null,
    'k': '#141418', // Contorno escuro pixel art
    's': '#c68652', // Pele morena
    'S': '#e0a97d', // Pele clara
    'r': '#d96b43', // Pele bronzeada sol
    'p': '#f28482', // Bochecha rosada
    'h': '#e9c46a', // Chapéu de palha claro
    'H': '#c99e44', // Chapéu de palha sombra
    'b': '#3b82f6', // Azul claro / camisa
    'B': '#1d4ed8', // Azul escuro / calça jeans
    'c': '#06b6d4', // Regata ciano surfista
    'g': '#2d6a4f', // Verde musgo camisa
    'G': '#6b705c', // Calça verde oliva
    'w': '#f8fafc', // Branco
    'W': '#cbd5e1', // Cinza claro / camisa xadrez / balde
    'n': '#6b4423', // Marrom escuro / cabelo / bota
    'N': '#9c6644', // Marrom médio / remo / cesta
    'o': '#e63946', // Vermelho vivo (caranguejo / fantasia guará-boi)
    'O': '#f77f00', // Laranja (bico / penas / sino sombra)
    'y': '#facc15', // Amarelo vivo (camiseta / sino ouro)
    'Y': '#fde047', // Amarelo claro brilho
    't': '#e5d4b3', // Bege camisa aberta
    'T': '#1e3a5f'  // Boné azul marinho
  };

  const CHARACTER_GRIDS = {
    // 1. Pescador do Igaraçu (Chapéu de palha, camisa xadrez e cesto de palha)
    pescador: [
      '......kkkk......',
      '.....khhhhk.....',
      '....khhhhhhk....',
      '..kkHHHHHHHHkk..',
      '.khhhhhhhhhhhhk.',
      '..kkkkkkkkkkkk..',
      '...kssssssssk...',
      '...kskssssksk...',
      '...kpsssssspk...',
      '....kkkkkkkk....',
      '..kkWwkWWkwWkk..',
      '.kWwkWkkkkWkWwK.',
      '.ksskhHHHHhkssk.',
      '.ksskHHHHHHkssk.',
      '..kkkHHHHHHkkk..',
      '...kBBkkkkBBk...',
      '...kBBk..kBBk...',
      '...kBBk..kBBk...',
      '..ksssk..ksssk..',
      '..kkkk....kkkk..'
    ],
    // 2. Guerreira da Pedra do Sal (Chapéu de palha, camisa verde e balde metálico)
    guerreira: [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '.kkHHHHHHHHHHkk.',
      'khhhhhhhhhhhhhhk',
      '.kkkkkkkkkkkkkk.',
      '...kSSSSSSSSk...',
      '...kSkSSSSkSk...',
      '...kpSSSSSSpk...',
      '....kNkkkkNk....',
      '..kkggggggggkk..',
      '.kggggggggggggk.',
      '.kSSkGGGGGGkSSk.',
      '.kkkkGGGGGGkWWk.',
      '....kGGGGGGkWWk.',
      '....kGGkkGGkWWk.',
      '....kGGk.kGkWWk.',
      '....knnk.knkkkk.',
      '...knnkk.knnkk..',
      '...kkkk...kkkk..'
    ],
    // 3. Vaqueiro do Delta (Chapéu de palha, camisa azul e caranguejo vermelho)
    vaqueiro: [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '.kkHHHHHHHHHHkk.',
      'khhhhhhhhhhhhhhk',
      '.kkkkkkkkkkkkkk.',
      '...kssssssssk...',
      '...kskssssksk...',
      '...kpsssssspk...',
      '....kkkkkkkk....',
      '..kkbbbbbbbbkk..',
      '.kbbbbbbbbbbbbk.',
      'kokoknnnnnnkssNk',
      'koooknnnnnnkNNNk',
      'kokoknnnnnnkNNNk',
      '.kkk.knnkknkkkk.',
      '.....knnkknnk...',
      '.....kkkkkkkn...',
      '....kkkk..kkkk..',
      '................'
    ],
    // 4. Cientista da UFDPar (Chapéu safári, óculos escuros, mochila e câmera)
    cientista: [
      '.....kkkkkk.....',
      '....kHHHHHHk....',
      '...khhhhhhhhk...',
      '..kkHHHHHHHHkk..',
      '...kSSSSSSSSk...',
      '..kkkkkkkkkkkk..',
      '..kBBBBkkBBBBk..',
      '...kSSSSSSSSk...',
      '....kkkkkkkk....',
      '.BkkkkkkkkkkkkB.',
      'BByykyyyyyykSyyB',
      'BByykkyyyykkyyyB',
      '.kSSkykWWkykSSk.',
      '.kSSkykkkkkySSk.',
      '..kkkGGGGGGkkk..',
      '....kGGkkGGk....',
      '....kSSk.kSSk...',
      '...kwwwk.kwwwk..',
      '...kBBBk.kBBBk..',
      '....kkk...kkk...'
    ],
    // 5. Artista do Porto das Barcas (Cabelo espetado, regata ciano e prancha/arte)
    artista: [
      '....k.kkkk.k....',
      '...kknnnnnnkk...',
      '..knnnnnnnnnnk..',
      '..knnkSSSSknnk..',
      '...kSkSSSSkSk...',
      '...kpSSSSSSpk...',
      '....kkkkkkkk....',
      '...kkcccccckk...',
      '..kSSccccccSSk..',
      '.kWSSccccccSSk..',
      'kWWSSccccccSSk..',
      'kccSSccccccSSk..',
      'kWWkBBBBBBBBkk..',
      '.kk.kBBkkBBk....',
      '....kSSk.kSSk...',
      '....kSSk.kSSk...',
      '....kSSk.kSSk...',
      '...kSSSk.kSSSk..',
      '...kkkk...kkkk..',
      '................'
    ],
    // 6. Guardião da Lagoa (Boné marinho, pele bronzeada, camisa aberta e remo)
    guardiao: [
      '.....kkkkkk.....',
      '....kTTTTTTk....',
      '...kTTTTTTTTk...',
      '..kkkkkkkkkkkk..',
      '...krrrrrrrrk...',
      '...krkrrrrkrk...',
      '...krrrrrrrrk...',
      '....kkkkkkkk.kNk',
      '..kktttrrttt.kNk',
      '.ktttttrrttttkNk',
      '.krrtttrrtttrkNk',
      '.krrtttrrtttkNNk',
      '..kkkBBBBBBk.kNk',
      '....kBBkkBBk.kNk',
      '....kBBk.kBBkkNk',
      '....kBBk.kBBkkNk',
      '....krrk.krrkkNk',
      '...kTTTk.kTTTkNk',
      '...kkkk...kkkkNk',
      '.............kkk'
    ],
    // 7. Sino da Catedral (Sino dourado em pixel art com badalo)
    sino: [
      '.......kk.......',
      '......kyyk......',
      '.....kyYYyk.....',
      '....kyYYYYyk....',
      '...kyYYYYYYyk...',
      '...kyYYwYYYyk...',
      '..kyYYYwYYYYyk..',
      '..kyYYYwYYYYyk..',
      '..kyYYYYYYYYyk..',
      '..kyYYYYYYYYyk..',
      '.kyYYYYYYYYYYyk.',
      '.kyYYYYYYYYYYyk.',
      'kyYYYYYYYYYYYYyk',
      'kyOOOOOOOOOOOOyk',
      'kkkkkkkkkkkkkkkk',
      '......kOOk......',
      '......kkkk......',
      '................',
      '................',
      '................'
    ],
    // 8. Mestre do Bumba-Meu-Boi (Manto vermelho e laranja festivo estilo Guará/Boi)
    bumba: [
      '.....kkkkkk.....',
      '....kooooook....',
      '...kooyyyyook...',
      '..kooykyykyook..',
      '..kooyykkkyook..',
      '..kooyykkkyook..',
      '..kooooooooook..',
      '.kooooooooooook.',
      'koooOooooooOook.',
      'koooOooooooOook.',
      'koooOooooooOook.',
      'koooOooooooOook.',
      'koooOooooooOook.',
      '.kooOooooooOook.',
      '.kooO.kkkk.Oook.',
      '..kk..knnk..kk..',
      '......knnk......',
      '.....knnkk......',
      '.....kkkk.......',
      '................'
    ]
  };

  const SPRITE_DATA_URLS = {};
  const SPRITE_IMAGES = {};

  function buildCharacterSprites() {
    Object.entries(CHARACTER_GRIDS).forEach(([charId, rows]) => {
      const h = rows.length;
      const w = rows[0].length;
      let rects = '';

      for (let y = 0; y < h; y++) {
        const line = rows[y];
        for (let x = 0; x < w; x++) {
          const ch = line[x];
          const color = PIXEL_PALETTE[ch];
          if (color) {
            rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
          }
        }
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      SPRITE_DATA_URLS[charId] = dataUrl;

      const img = new Image();
      img.src = dataUrl;
      SPRITE_IMAGES[charId] = img;
    });
  }

  buildCharacterSprites();

  function getSpriteImgTag(charId, alt = '') {
    const src = SPRITE_DATA_URLS[charId] || '';
    return `<img src="${src}" alt="${alt}" class="char-sprite-img" draggable="false" />`;
  }

  /* =========================================================================
     1. DADOS DOS 8 PERSONAGENS (TORRES) COM DANO, RANGE, SPA E 2 UPGRADES
     ========================================================================= */
  const CHARACTERS_POOL = [
    {
      id: 'pescador',
      name: 'Pescador do Igaraçu',
      shortName: 'Pescador',
      role: 'Perfurador Rápido',
      icon: '🔱',
      color: '#00a896',
      cost: 100,
      damage: 18,
      range: 135,
      spa: 0.50,
      pierce: 2,
      projectileType: 'harpoon',
      description: 'Lança arpões velozes que atravessam até 2 balões em linha reta.',
      upgrades: [
        {
          name: 'Arpão de Aço Temperado',
          desc: '+10 Dano, +15 Range, -0.10s SPA (perfura 3)',
          cost: 90,
          damage: 29,
          range: 150,
          spa: 0.45,
          pierce: 3
        },
        {
          name: 'Mestre das Marés',
          desc: '+18 Dano, +20 Range, -0.15s SPA (perfura 4)',
          cost: 165,
          damage: 47,
          range: 170,
          spa: 0.35,
          pierce: 4
        }
      ]
    },
    {
      id: 'guerreira',
      name: 'Guerreira da Pedra do Sal',
      shortName: 'Guerreira',
      role: 'Explosão Costeira (AoE)',
      icon: '🌊',
      color: '#0077b6',
      cost: 140,
      damage: 25,
      range: 120,
      spa: 0.90,
      splashRadius: 58,
      projectileType: 'waveOrb',
      description: 'Dispara esferas de maré que explodem em área ao atingir o alvo.',
      upgrades: [
        {
          name: 'Onda Quebrante',
          desc: '+14 Dano, +15 Range, -0.15s SPA, +14 Área',
          cost: 120,
          damage: 39,
          range: 135,
          spa: 0.75,
          splashRadius: 72
        },
        {
          name: 'Fúria Atlântica',
          desc: '+24 Dano, +20 Range, -0.15s SPA, +18 Área',
          cost: 210,
          damage: 63,
          range: 155,
          spa: 0.80,
          splashRadius: 90
        }
      ]
    },
    {
      id: 'vaqueiro',
      name: 'Vaqueiro do Delta',
      shortName: 'Vaqueiro',
      role: 'Atirador de Elite',
      icon: '🤠',
      color: '#d97706',
      cost: 160,
      damage: 60,
      range: 280,
      spa: 1.30,
      projectileType: 'lassoSniper',
      description: 'Alcance imenso com disparo de precisão devastador contra balões fortes.',
      upgrades: [
        {
          name: 'Mira Certeira',
          desc: '+37 Dano, +45 Range, -0.25s SPA',
          cost: 145,
          damage: 95,
          range: 310,
          spa: 1.40
        },
        {
          name: 'Lenda do Sertão',
          desc: '+65 Dano, +60 Range, -0.30s SPA',
          cost: 250,
          damage: 160,
          range: 370,
          spa: 1.10
        }
      ]
    },
    {
      id: 'cientista',
      name: 'Cientista da UFDPar',
      shortName: 'Cientista',
      role: 'Controle Criogênico',
      icon: '🧪',
      color: '#38bdf8',
      cost: 130,
      damage: 25,
      range: 140,
      spa: 0.70,
      slowFactor: 0.35,
      slowDuration: 2.2,
      projectileType: 'cryo',
      description: 'Projéteis criogênicos que reduzem a velocidade dos balões em 35%.',
      upgrades: [
        {
          name: 'Fórmula Glacial',
          desc: '+8 Dano, +20 Range, -0.15s SPA (45% lentidão)',
          cost: 110,
          damage: 19,
          range: 160,
          spa: 0.75,
          slowFactor: 0.45,
          slowDuration: 2.6
        },
        {
          name: 'Zero Absoluto',
          desc: '+15 Dano, +25 Range, -0.15s SPA (55% lentidão)',
          cost: 190,
          damage: 34,
          range: 185,
          spa: 0.60,
          slowFactor: 0.55,
          slowDuration: 3.0
        }
      ]
    },
    {
      id: 'artista',
      name: 'Artista do Porto das Barcas',
      shortName: 'Artista',
      role: 'Bumerangue Multi-Alvo',
      icon: '🪃',
      color: '#e9c46a',
      cost: 150,
      damage: 27,
      range: 145,
      spa: 0.60,
      multiCount: 1,
      projectileType: 'boomerang',
      description: 'Arremessa bumerangues de carnaúba que cortam múltiplos inimigos.',
      upgrades: [
        {
          name: 'Talho Duplo',
          desc: '+10 Dano, +20 Range, -0.15s SPA (2 bumerangues)',
          cost: 130,
          damage: 30,
          range: 165,
          spa: 0.70,
          multiCount: 2
        },
        {
          name: 'Obra-Prima Artesanal',
          desc: '+17 Dano, +25 Range, -0.15s SPA (3 bumerangues)',
          cost: 230,
          damage: 46,
          range: 190,
          spa: 0.55,
          multiCount: 3
        }
      ]
    },
    {
      id: 'guardiao',
      name: 'Guardião da Lagoa',
      shortName: 'Guardião',
      role: 'Metralhadora Hidro',
      icon: '💧',
      color: '#2ec4b6',
      cost: 175,
      damage: 19,
      range: 130,
      spa: 0.30,
      projectileType: 'waterJet',
      description: 'Cadência altíssima de jatos pressurizados da Lagoa do Sobradinho.',
      upgrades: [
        {
          name: 'Pressão Máxima',
          desc: '+5 Dano, +20 Range, -0.09s SPA',
          cost: 150,
          damage: 14,
          range: 150,
          spa: 0.26
        },
        {
          name: 'Tsunami do Sobradinho',
          desc: '+9 Dano, +25 Range, -0.08s SPA',
          cost: 260,
          damage: 23,
          range: 175,
          spa: 0.18
        }
      ]
    },
    {
      id: 'sino',
      name: 'Sino da Catedral',
      shortName: 'Sino',
      role: 'Onda Sonora 360°',
      icon: '🔔',
      color: '#f4a261',
      cost: 180,
      damage: 33,
      range: 115,
      spa: 1.00,
      stunDuration: 0.35,
      projectileType: 'sonicNova',
      description: 'Emite badaladas que atingem TODOS os inimigos no alcance e atordoam.',
      upgrades: [
        {
          name: 'Badalada Ressonante',
          desc: '+16 Dano, +20 Range, -0.15s SPA',
          cost: 155,
          damage: 42,
          range: 135,
          spa: 1.15,
          stunDuration: 0.45
        },
        {
          name: 'Sinfonia da Graça',
          desc: '+28 Dano, +25 Range, -0.20s SPA',
          cost: 270,
          damage: 70,
          range: 160,
          spa: 0.95,
          stunDuration: 0.55
        }
      ]
    },
    {
      id: 'bumba',
      name: 'Mestre do Bumba-Meu-Boi',
      shortName: 'Bumba-Boi',
      role: 'Fogo & Aura de Ritmo',
      icon: '🔥',
      color: '#e76f51',
      cost: 200,
      damage: 33,
      range: 145,
      spa: 0.75,
      burnDps: 12,
      auraBonus: 0.12,
      projectileType: 'fireSpark',
      description: 'Queima balões continuamente e acelera o ataque das torres próximas.',
      upgrades: [
        {
          name: 'Ritmo Contagiante',
          desc: '+15 Dano, +20 Range, -0.15s SPA (Aura +18%)',
          cost: 175,
          damage: 39,
          range: 165,
          spa: 0.85,
          burnDps: 20,
          auraBonus: 0.18
        },
        {
          name: 'Rei do São João',
          desc: '+26 Dano, +25 Range, -0.15s SPA (Aura +25%)',
          cost: 300,
          damage: 65,
          range: 190,
          spa: 0.70,
          burnDps: 32,
          auraBonus: 0.25
        }
      ]
    }
  ];

  /* =========================================================================
     2. AS 7 FASES DE PARNAÍBA - PI (CENÁRIOS REALISTAS + DIFICULDADE +5%)
     ========================================================================= */
  const STAGES = [
    {
      id: 0,
      name: 'Porto das Barcas',
      subtitle: 'Casarões coloniais coloridos, trapiche de madeira e barcos no Rio Igaraçu.',
      trophyName: 'Troféu Porto das Barcas',
      trophyIcon: '⛵',
      roadStyle: 'cobblestone',
      roadColor: '#c9b79c',
      roadBorder: '#6f5e4c',
      waypoints: [
        { x: -20, y: 185 },
        { x: 235, y: 185 },
        { x: 235, y: 435 },
        { x: 515, y: 435 },
        { x: 515, y: 195 },
        { x: 775, y: 195 },
        { x: 775, y: 470 },
        { x: 920, y: 470 }
      ],
      blockedZones: [
        { x: 0, y: 0, w: 900, h: 72 },
        { x: 35, y: 74, w: 185, h: 66 },
        { x: 560, y: 74, w: 195, h: 66 }
      ],
      waves: [
        [{ type: 'red', count: 10, interval: 0.85 }],
        [{ type: 'red', count: 12, interval: 0.7 }, { type: 'blue', count: 5, interval: 0.9 }],
        [{ type: 'blue', count: 14, interval: 0.65 }, { type: 'green', count: 4, interval: 1.0 }],
        [{ type: 'green', count: 12, interval: 0.6 }, { type: 'yellow', count: 5, interval: 0.8 }],
        [{ type: 'blue', count: 15, interval: 0.45 }, { type: 'green', count: 10, interval: 0.55 }, { type: 'yellow', count: 6, interval: 0.65 }],
        [{ type: 'yellow', count: 10, interval: 0.5 }, { type: 'ceramic', count: 3, interval: 1.4 }]
      ]
    },
    {
      id: 1,
      name: 'Praça da Graça',
      subtitle: 'Coreto histórico, chafariz central, pedras portuguesas e oiticicas centenárias.',
      trophyName: 'Troféu Praça da Graça',
      trophyIcon: '🌳',
      roadStyle: 'portugueseStone',
      roadColor: '#e7e5e4',
      roadBorder: '#78716c',
      waypoints: [
        { x: -20, y: 280 },
        { x: 155, y: 280 },
        { x: 155, y: 100 },
        { x: 745, y: 100 },
        { x: 745, y: 460 },
        { x: 295, y: 460 },
        { x: 295, y: 365 },
        { x: 615, y: 365 },
        { x: 615, y: 190 },
        { x: 920, y: 190 }
      ],
      blockedZones: [
        { x: 385, y: 220, w: 140, h: 105 }
      ],
      waves: [
        [{ type: 'red', count: 14, interval: 0.75 }],
        [{ type: 'blue', count: 14, interval: 0.65 }],
        [{ type: 'blue', count: 10, interval: 0.55 }, { type: 'green', count: 8, interval: 0.75 }],
        [{ type: 'green', count: 14, interval: 0.55 }, { type: 'yellow', count: 7, interval: 0.7 }],
        [{ type: 'yellow', count: 12, interval: 0.5 }, { type: 'pink', count: 5, interval: 0.75 }],
        [{ type: 'green', count: 14, interval: 0.45 }, { type: 'ceramic', count: 4, interval: 1.2 }]
      ]
    },
    {
      id: 2,
      name: 'Catedral de N. Sra. da Graça',
      subtitle: 'Templo histórico de torres gêmeas, vitral rosácea, escadaria e palmeiras imperiais.',
      trophyName: 'Troféu Catedral da Graça',
      trophyIcon: '⛪',
      roadStyle: 'cobblestone',
      roadColor: '#e6ccb2',
      roadBorder: '#9c6644',
      waypoints: [
        { x: 110, y: -20 },
        { x: 110, y: 465 },
        { x: 330, y: 465 },
        { x: 330, y: 225 },
        { x: 570, y: 225 },
        { x: 570, y: 465 },
        { x: 790, y: 465 },
        { x: 790, y: -20 }
      ],
      blockedZones: [
        { x: 365, y: 18, w: 170, h: 152 }
      ],
      waves: [
        [{ type: 'blue', count: 15, interval: 0.65 }],
        [{ type: 'green', count: 14, interval: 0.65 }],
        [{ type: 'green', count: 12, interval: 0.5 }, { type: 'yellow', count: 10, interval: 0.6 }],
        [{ type: 'yellow', count: 14, interval: 0.5 }, { type: 'pink', count: 8, interval: 0.65 }],
        [{ type: 'ceramic', count: 5, interval: 1.1 }, { type: 'pink', count: 10, interval: 0.5 }],
        [{ type: 'ceramic', count: 6, interval: 0.9 }, { type: 'dirigible', count: 1, interval: 2.0 }]
      ]
    },
    {
      id: 3,
      name: 'Rio Igaraçu',
      subtitle: 'Águas do delta, manguezais com raízes aéreas, croas de areia e canoas à vela.',
      trophyName: 'Troféu Rio Igaraçu',
      trophyIcon: '🛶',
      roadStyle: 'boardwalk',
      roadColor: '#d4a373',
      roadBorder: '#6c4623',
      waypoints: [
        { x: -20, y: 95 },
        { x: 760, y: 95 },
        { x: 760, y: 235 },
        { x: 140, y: 235 },
        { x: 140, y: 380 },
        { x: 760, y: 380 },
        { x: 760, y: 500 },
        { x: -20, y: 500 }
      ],
      blockedZones: [
        { x: 0, y: 0, w: 900, h: 48 }
      ],
      waves: [
        [{ type: 'blue', count: 16, interval: 0.55 }, { type: 'green', count: 6, interval: 0.7 }],
        [{ type: 'green', count: 18, interval: 0.5 }],
        [{ type: 'yellow', count: 16, interval: 0.48 }, { type: 'pink', count: 6, interval: 0.6 }],
        [{ type: 'pink', count: 15, interval: 0.45 }, { type: 'ceramic', count: 4, interval: 1.1 }],
        [{ type: 'ceramic', count: 7, interval: 0.9 }, { type: 'yellow', count: 14, interval: 0.4 }],
        [{ type: 'ceramic', count: 6, interval: 0.8 }, { type: 'dirigible', count: 1, interval: 2.0 }]
      ]
    },
    {
      id: 4,
      name: 'Lagoa do Sobradinho',
      subtitle: 'Dunas douradas esculpidas pelo vento, lagoa azul-turquesa, carnaúbas e quiosques.',
      trophyName: 'Troféu Lagoa do Sobradinho',
      trophyIcon: '🏝️',
      roadStyle: 'sandTrail',
      roadColor: '#fefae0',
      roadBorder: '#d4a373',
      waypoints: [
        { x: 440, y: -20 },
        { x: 440, y: 115 },
        { x: 145, y: 115 },
        { x: 145, y: 445 },
        { x: 745, y: 445 },
        { x: 745, y: 235 },
        { x: 440, y: 235 },
        { x: 440, y: 580 }
      ],
      blockedZones: [
        { x: 515, y: 280, w: 175, h: 115 }
      ],
      waves: [
        [{ type: 'green', count: 18, interval: 0.5 }],
        [{ type: 'yellow', count: 18, interval: 0.45 }],
        [{ type: 'pink', count: 16, interval: 0.42 }, { type: 'ceramic', count: 5, interval: 1.0 }],
        [{ type: 'ceramic', count: 8, interval: 0.85 }, { type: 'pink', count: 12, interval: 0.4 }],
        [{ type: 'dirigible', count: 1, interval: 2.0 }, { type: 'ceramic', count: 6, interval: 0.8 }],
        [{ type: 'ceramic', count: 8, interval: 0.7 }, { type: 'dirigible', count: 2, interval: 3.2 }]
      ]
    },
    {
      id: 5,
      name: 'UFDPar — Universidade Federal',
      subtitle: 'Blocos acadêmicos, alamedas arborizadas, praça estudantil e jardins de carnaúbas.',
      trophyName: 'Troféu UFDPar',
      trophyIcon: '🎓',
      roadStyle: 'avenue',
      roadColor: '#475569',
      roadBorder: '#94a3b8',
      waypoints: [
        { x: -20, y: 475 },
        { x: 205, y: 475 },
        { x: 205, y: 125 },
        { x: 455, y: 125 },
        { x: 455, y: 440 },
        { x: 685, y: 440 },
        { x: 685, y: 125 },
        { x: 920, y: 125 }
      ],
      blockedZones: [
        { x: 260, y: 205, w: 140, h: 155 },
        { x: 740, y: 205, w: 130, h: 180 }
      ],
      waves: [
        [{ type: 'yellow', count: 20, interval: 0.45 }],
        [{ type: 'pink', count: 20, interval: 0.4 }, { type: 'ceramic', count: 5, interval: 0.95 }],
        [{ type: 'ceramic', count: 10, interval: 0.75 }],
        [{ type: 'dirigible', count: 2, interval: 2.8 }, { type: 'pink', count: 16, interval: 0.35 }],
        [{ type: 'ceramic', count: 12, interval: 0.65 }, { type: 'dirigible', count: 2, interval: 2.5 }],
        [{ type: 'dirigible', count: 3, interval: 2.4 }, { type: 'ceramic', count: 10, interval: 0.6 }]
      ]
    },
    {
      id: 6,
      name: 'Pedra do Sal',
      subtitle: 'Oceano Atlântico, formações rochosas graníticas e parque eólico girando ao vento.',
      trophyName: 'Troféu Pedra do Sal',
      trophyIcon: '🌅',
      roadStyle: 'sandTrail',
      roadColor: '#faedcd',
      roadBorder: '#c69c6d',
      waypoints: [
        { x: -20, y: 125 },
        { x: 795, y: 125 },
        { x: 795, y: 290 },
        { x: 130, y: 290 },
        { x: 130, y: 465 },
        { x: 920, y: 465 }
      ],
      blockedZones: [
        { x: 0, y: 0, w: 900, h: 68 }
      ],
      waves: [
        [{ type: 'pink', count: 22, interval: 0.38 }, { type: 'ceramic', count: 6, interval: 0.9 }],
        [{ type: 'ceramic', count: 12, interval: 0.7 }],
        [{ type: 'dirigible', count: 2, interval: 2.5 }, { type: 'ceramic', count: 10, interval: 0.65 }],
        [{ type: 'pink', count: 28, interval: 0.3 }, { type: 'dirigible', count: 2, interval: 2.2 }],
        [{ type: 'ceramic', count: 14, interval: 0.55 }, { type: 'dirigible', count: 3, interval: 2.0 }],
        [{ type: 'dirigible', count: 4, interval: 1.9 }, { type: 'ceramic', count: 14, interval: 0.5 }]
      ]
    }
  ];

  /* =========================================================================
     3. TIPOS DE INIMIGOS (BLOONS DO DELTA)
     ========================================================================= */
  const ENEMY_TYPES = {
    red: { name: 'Balão Vermelho', hp: 22, speed: 60, reward: 12, radius: 14, color: '#ef4444' },
    blue: { name: 'Balão Azul', hp: 40, speed: 75, reward: 17, radius: 15, color: '#3b82f6' },
    green: { name: 'Balão Verde', hp: 65, speed: 85, reward: 24, radius: 16, color: '#22c55e' },
    yellow: { name: 'Balão Amarelo', hp: 80, speed: 110, reward: 32, radius: 16, color: '#eab308' },
    pink: { name: 'Balão Rosa Veloz', hp: 95, speed: 130, reward: 40, radius: 15, color: '#ec4899' },
    ceramic: { name: 'Balão Cerâmica', hp: 250, speed: 65, reward: 65, radius: 18, color: '#d97706' },
    dirigible: { name: 'Dirigível Parnaíba', hp: 2000, speed: 50, reward: 190, radius: 26, color: '#7c3aed' }
  };

  /* =========================================================================
     4. ESTADO GLOBAL & PERSISTÊNCIA (LOCALSTORAGE)
     ========================================================================= */
  const STORAGE_KEY = 'guardioes_delta_parnaiba_v2';

  const state = {
    selectedSquad: ['pescador', 'guerreira', 'vaqueiro', 'cientista'],
    unlockedStage: 0,
    trophies: [],
    currentStageId: 0,
    money: 260,
    lives: 20,
    waveIndex: 0,
    waveInProgress: false,
    gameOver: false,
    speedMultiplier: 1,
    autoWave: false,
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    floatingTexts: [],
    spawnQueue: [],
    spawnTimer: 0,
    buildingCharId: null,
    selectedTowerId: null,
    mousePos: { x: -100, y: -100 },
    isTouchDragging: false
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.selectedSquad) && parsed.selectedSquad.length === 4) {
        state.selectedSquad = parsed.selectedSquad;
      }
      if (typeof parsed.unlockedStage === 'number') {
        state.unlockedStage = Math.min(STAGES.length - 1, Math.max(0, parsed.unlockedStage));
      }
      if (Array.isArray(parsed.trophies)) {
        state.trophies = parsed.trophies;
      }
    } catch (e) {
      console.warn('Não foi possível carregar o salvamento local:', e);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedSquad: state.selectedSquad,
          unlockedStage: state.unlockedStage,
          trophies: state.trophies
        })
      );
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }

  /* =========================================================================
     5. REFERÊNCIAS DO DOM
     ========================================================================= */
  const dom = {
    globalTrophyCount: document.getElementById('global-trophy-count'),
    screenSelect: document.getElementById('screen-select'),
    screenStages: document.getElementById('screen-stages'),
    screenGame: document.getElementById('screen-game'),
    characterPoolGrid: document.getElementById('character-pool-grid'),
    selectedCounter: document.getElementById('selected-counter'),
    btnConfirmSquad: document.getElementById('btn-confirm-squad'),
    btnEditSquad: document.getElementById('btn-edit-squad'),
    btnResetProgress: document.getElementById('btn-reset-progress'),
    trophyShelf: document.getElementById('trophy-shelf'),
    stagesGrid: document.getElementById('stages-grid'),
    btnBackStages: document.getElementById('btn-back-stages'),
    hudStageBadge: document.getElementById('hud-stage-badge'),
    hudStageName: document.getElementById('hud-stage-name'),
    hudMoney: document.getElementById('hud-money'),
    hudLives: document.getElementById('hud-lives'),
    hudWave: document.getElementById('hud-wave'),
    hudTrophies: document.getElementById('hud-trophies'),
    btnSpeed: document.getElementById('btn-speed'),
    btnAutoWave: document.getElementById('btn-auto-wave'),
    btnStartWave: document.getElementById('btn-start-wave'),
    canvas: document.getElementById('game-canvas'),
    placementHint: document.getElementById('placement-hint'),
    placementHintText: document.getElementById('placement-hint-text'),
    btnCancelPlacement: document.getElementById('btn-cancel-placement'),
    activeSquadBar: document.getElementById('active-squad-bar'),
    inspectorEmpty: document.getElementById('inspector-empty'),
    inspectorContent: document.getElementById('inspector-content'),
    inspAvatar: document.getElementById('insp-avatar'),
    inspName: document.getElementById('insp-name'),
    inspLevelBadge: document.getElementById('insp-level-badge'),
    inspDamage: document.getElementById('insp-damage'),
    inspRange: document.getElementById('insp-range'),
    inspSpa: document.getElementById('insp-spa'),
    inspUpgTitle: document.getElementById('insp-upg-title'),
    inspUpgDesc: document.getElementById('insp-upg-desc'),
    btnUpgradeTower: document.getElementById('btn-upgrade-tower'),
    btnSellTower: document.getElementById('btn-sell-tower'),
    btnCloseInspector: document.getElementById('btn-close-inspector'),
    gameModal: document.getElementById('game-modal'),
    modalIcon: document.getElementById('modal-icon'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalTrophyBox: document.getElementById('modal-trophy-box'),
    modalTrophyName: document.getElementById('modal-trophy-name'),
    btnModalSecondary: document.getElementById('btn-modal-secondary'),
    btnModalPrimary: document.getElementById('btn-modal-primary')
  };

  const ctx = dom.canvas.getContext('2d');

  /* =========================================================================
     6. NAVEGAÇÃO ENTRE TELAS E RENDERIZAÇÃO DOS MENUS
     ========================================================================= */
  function showScreen(screenName) {
    dom.screenSelect.classList.remove('active');
    dom.screenStages.classList.remove('active');
    dom.screenGame.classList.remove('active');

    if (screenName === 'select') {
      dom.screenSelect.classList.add('active');
      renderCharacterSelection();
    } else if (screenName === 'stages') {
      dom.screenStages.classList.add('active');
      renderStageMenu();
    } else if (screenName === 'game') {
      dom.screenGame.classList.add('active');
    }
    updateGlobalTrophyHeader();
  }

  function updateGlobalTrophyHeader() {
    const label = `${state.trophies.length} / ${STAGES.length}`;
    dom.globalTrophyCount.textContent = label;
    dom.hudTrophies.textContent = label;
  }

  function renderCharacterSelection() {
    dom.characterPoolGrid.innerHTML = '';

    CHARACTERS_POOL.forEach((char) => {
      const isSelected = state.selectedSquad.includes(char.id);
      const card = document.createElement('div');
      card.className = `char-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div>
          <span class="char-cost-badge">$${char.cost}</span>
          <div class="char-card-top">
            <div class="char-avatar" style="background:${char.color}33; border-color:${char.color}">
              ${getSpriteImgTag(char.id, char.name)}
            </div>
            <div class="char-meta">
              <h3>${char.name}</h3>
              <span class="char-role">${char.role}</span>
            </div>
          </div>
          <p class="char-desc">${char.description}</p>
        </div>
        <div class="char-stats">
          <div><small>Dano</small><strong>${char.damage}</strong></div>
          <div><small>Range</small><strong>${char.range}</strong></div>
          <div><small>SPA</small><strong>${char.spa.toFixed(2)}s</strong></div>
        </div>
      `;

      card.addEventListener('click', () => {
        toggleCharacterSelection(char.id);
      });

      dom.characterPoolGrid.appendChild(card);
    });

    const count = state.selectedSquad.length;
    dom.selectedCounter.textContent = `${count} / 4 Selecionados`;
    dom.btnConfirmSquad.disabled = count !== 4;
  }

  function toggleCharacterSelection(charId) {
    const idx = state.selectedSquad.indexOf(charId);
    if (idx !== -1) {
      state.selectedSquad.splice(idx, 1);
    } else {
      if (state.selectedSquad.length >= 4) {
        state.selectedSquad.shift();
      }
      state.selectedSquad.push(charId);
    }
    renderCharacterSelection();
  }

  function renderStageMenu() {
    dom.trophyShelf.innerHTML = '';
    STAGES.forEach((stage) => {
      const hasTrophy = state.trophies.includes(stage.id);
      const slot = document.createElement('div');
      slot.className = `trophy-slot ${hasTrophy ? 'unlocked' : ''}`;
      slot.innerHTML = `
        <span style="font-size:1.3rem">${hasTrophy ? stage.trophyIcon : '🔒'}</span>
        <div>
          <strong style="display:block;font-size:0.76rem">${stage.trophyName}</strong>
          <small>${hasTrophy ? 'Conquistado' : 'Bloqueado'}</small>
        </div>
      `;
      dom.trophyShelf.appendChild(slot);
    });

    dom.stagesGrid.innerHTML = '';
    STAGES.forEach((stage, idx) => {
      const isUnlocked = idx <= state.unlockedStage;
      const hasTrophy = state.trophies.includes(stage.id);
      const diffPct = Math.round((Math.pow(1.015, idx) - 1) * 100);

      const card = document.createElement('div');
      card.className = `stage-card ${isUnlocked ? '' : 'locked'}`;
      card.innerHTML = `
        <canvas class="stage-preview" width="450" height="280"></canvas>
        <div class="stage-body">
          <div>
            <div class="stage-header-row">
              <span class="stage-num">Fase ${idx + 1} ${hasTrophy ? '• 🏆 Concluída' : ''}</span>
              <span class="diff-badge">+${diffPct}% Dificuldade</span>
            </div>
            <h3>${stage.name}</h3>
            <p>${stage.subtitle}</p>
          </div>
          <button class="btn ${isUnlocked ? 'btn-primary' : 'btn-secondary'}" ${isUnlocked ? '' : 'disabled'}>
            ${isUnlocked ? (hasTrophy ? 'Jogar Novamente' : 'Defender Local') : '🔒 Bloqueada'}
          </button>
        </div>
      `;

      const miniCanvas = card.querySelector('canvas');
      drawStageMiniPreview(miniCanvas, stage);

      if (isUnlocked) {
        card.querySelector('button').addEventListener('click', () => {
          startStage(stage.id);
        });
      }

      dom.stagesGrid.appendChild(card);
    });
  }

  function drawStageMiniPreview(canvas, stage) {
    const mctx = canvas.getContext('2d');
    mctx.save();
    mctx.scale(canvas.width / 900, canvas.height / 560);
    renderRealisticStageBackdrop(mctx, stage, 1.2);
    renderRealisticStagePath(mctx, stage);
    mctx.restore();
  }

  /* =========================================================================
     7. LÓGICA DA PARTIDA, ONDAS, COMBATE E UPGRADES
     ========================================================================= */
  function startStage(stageId) {
    const stage = STAGES[stageId];
    state.currentStageId = stageId;
    state.money = 260 + stageId * 15;
    state.lives = 20;
    state.waveIndex = 0;
    state.waveInProgress = false;
    state.gameOver = false;
    state.speedMultiplier = 1;
    state.autoWave = false;
    state.towers = [];
    state.enemies = [];
    state.projectiles = [];
    state.effects = [];
    state.floatingTexts = [];
    state.spawnQueue = [];
    state.buildingCharId = null;
    state.selectedTowerId = null;

    dom.hudStageBadge.textContent = `Fase ${stageId + 1} / ${STAGES.length}`;
    dom.hudStageName.textContent = stage.name;
    dom.btnSpeed.textContent = '⏩ 1x';
    dom.btnAutoWave.textContent = '🔁 Auto: OFF';
    dom.btnAutoWave.classList.remove('active-auto');
    dom.btnStartWave.disabled = false;
    dom.btnStartWave.textContent = '▶ Onda 1';
    dom.gameModal.classList.add('hidden');
    dom.placementHint.classList.add('hidden');

    renderSquadBar();
    closeInspector();
    updateGameHud();
    showScreen('game');
  }

  function updateGameHud() {
    const stage = STAGES[state.currentStageId];
    dom.hudMoney.textContent = Math.floor(state.money);
    dom.hudLives.textContent = state.lives;
    const displayWave = Math.min(state.waveIndex + (state.waveInProgress ? 1 : 0), stage.waves.length);
    dom.hudWave.textContent = `${displayWave} / ${stage.waves.length}`;
    updateGlobalTrophyHeader();
    refreshSquadBarAffordability();
    if (state.selectedTowerId) {
      renderInspector();
    }
  }

  function renderSquadBar() {
    dom.activeSquadBar.innerHTML = '';
    state.selectedSquad.forEach((charId, index) => {
      const char = CHARACTERS_POOL.find((c) => c.id === charId);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tower-slot-btn';
      btn.dataset.charId = char.id;
      btn.draggable = true;
      btn.innerHTML = `
        <div class="slot-top">
          ${getSpriteImgTag(char.id, char.shortName)}
          <span class="slot-cost">$${char.cost}</span>
        </div>
        <div class="slot-name">${char.shortName}</div>
        <div class="slot-mini-stats">[${index + 1}] Dano ${char.damage} • ${char.spa}s</div>
      `;

      btn.addEventListener('click', () => {
        if (state.money < char.cost) return;
        if (state.buildingCharId === char.id) {
          cancelPlacement();
        } else {
          startPlacement(char.id);
        }
      });

      btn.addEventListener('dragstart', (e) => {
        if (state.money < char.cost) {
          e.preventDefault();
          return;
        }
        startPlacement(char.id);
        e.dataTransfer.setData('text/plain', char.id);
      });

      btn.addEventListener('touchstart', (e) => {
        if (state.money < char.cost) return;
        startPlacement(char.id);
        state.isTouchDragging = true;
        if (e.touches && e.touches[0]) {
          state.mousePos = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY, true);
        }
      }, { passive: true });

      dom.activeSquadBar.appendChild(btn);
    });
    refreshSquadBarAffordability();
  }

  function refreshSquadBarAffordability() {
    const buttons = dom.activeSquadBar.querySelectorAll('.tower-slot-btn');
    buttons.forEach((btn) => {
      const char = CHARACTERS_POOL.find((c) => c.id === btn.dataset.charId);
      btn.classList.toggle('cant-afford', state.money < char.cost);
      btn.classList.toggle('active-build', state.buildingCharId === char.id);
    });
  }

  function startPlacement(charId) {
    const char = CHARACTERS_POOL.find((c) => c.id === charId);
    state.buildingCharId = charId;
    state.selectedTowerId = null;
    closeInspector();
    if (char) {
      dom.placementHintText.textContent = `Posicionar ${char.shortName} ($${char.cost})`;
    }
    dom.placementHint.classList.remove('hidden');
    refreshSquadBarAffordability();
  }

  function cancelPlacement() {
    state.buildingCharId = null;
    state.isTouchDragging = false;
    dom.placementHint.classList.add('hidden');
    refreshSquadBarAffordability();
  }

  /* =========================================================================
     8. POSICIONAMENTO DE TORRES E VALIDAÇÃO DE PISTA / MONUMENTOS
     ========================================================================= */
  function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0) {
      t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
  }

  function isValidPlacement(x, y) {
    if (x < 26 || x > 874 || y < 26 || y > 534) return false;

    const stage = STAGES[state.currentStageId];

    for (let i = 0; i < stage.waypoints.length - 1; i++) {
      const a = stage.waypoints[i];
      const b = stage.waypoints[i + 1];
      if (distToSegment(x, y, a.x, a.y, b.x, b.y) < 39) {
        return false;
      }
    }

    if (stage.blockedZones) {
      for (const z of stage.blockedZones) {
        if (x >= z.x - 12 && x <= z.x + z.w + 12 && y >= z.y - 12 && y <= z.y + z.h + 12) {
          return false;
        }
      }
    }

    for (const t of state.towers) {
      if (Math.hypot(x - t.x, y - t.y) < 38) {
        return false;
      }
    }

    return true;
  }

  function placeTowerAt(x, y) {
    if (!state.buildingCharId) return false;
    const baseChar = CHARACTERS_POOL.find((c) => c.id === state.buildingCharId);
    if (!baseChar || state.money < baseChar.cost) return false;
    if (!isValidPlacement(x, y)) return false;

    state.money -= baseChar.cost;

    const newTower = {
      uid: `tower_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      charId: baseChar.id,
      name: baseChar.name,
      icon: baseChar.icon,
      color: baseChar.color,
      projectileType: baseChar.projectileType,
      x,
      y,
      level: 0,
      totalInvested: baseChar.cost,
      damage: baseChar.damage,
      range: baseChar.range,
      spa: baseChar.spa,
      pierce: baseChar.pierce || 1,
      splashRadius: baseChar.splashRadius || 0,
      slowFactor: baseChar.slowFactor || 0,
      slowDuration: baseChar.slowDuration || 0,
      multiCount: baseChar.multiCount || 1,
      stunDuration: baseChar.stunDuration || 0,
      burnDps: baseChar.burnDps || 0,
      auraBonus: baseChar.auraBonus || 0,
      cooldown: 0,
      angle: 0,
      recoil: 0
    };

    state.towers.push(newTower);
    addEffect('ring', x, y, baseChar.color, 36, 0.35);
    cancelPlacement();
    selectTower(newTower.uid);
    updateGameHud();
    return true;
  }

  /* =========================================================================
     9. INSPETOR, UPGRADES (MÁX. 2) E VENDA
     ========================================================================= */
  function selectTower(uid) {
    state.selectedTowerId = uid;
    cancelPlacement();
    renderInspector();
  }

  function closeInspector() {
    state.selectedTowerId = null;
    dom.inspectorEmpty.classList.remove('hidden');
    dom.inspectorContent.classList.add('hidden');
  }

  function renderInspector() {
    const tower = state.towers.find((t) => t.uid === state.selectedTowerId);
    if (!tower) {
      closeInspector();
      return;
    }

    const baseChar = CHARACTERS_POOL.find((c) => c.id === tower.charId);
    dom.inspectorEmpty.classList.add('hidden');
    dom.inspectorContent.classList.remove('hidden');

    if (dom.inspAvatar) {
      dom.inspAvatar.style.borderColor = tower.color;
      dom.inspAvatar.innerHTML = getSpriteImgTag(tower.charId, tower.name);
    }
    dom.inspName.textContent = tower.name;
    dom.inspLevelBadge.textContent = `Nível ${tower.level} / 2`;
    dom.inspDamage.textContent = tower.damage;
    dom.inspRange.textContent = tower.range;
    dom.inspSpa.textContent = `${tower.spa.toFixed(2)}s`;

    const refund = Math.floor(tower.totalInvested * 0.7);
    dom.btnSellTower.textContent = `Vender Torre (+$${refund})`;

    if (tower.level >= 2) {
      dom.inspUpgTitle.textContent = '★ Nível Máximo Atingido (2/2)';
      dom.inspUpgDesc.textContent = 'Este defensor atingiu todo o seu potencial.';
      dom.btnUpgradeTower.textContent = 'Máximo';
      dom.btnUpgradeTower.disabled = true;
    } else {
      const nextUpg = baseChar.upgrades[tower.level];
      dom.inspUpgTitle.textContent = `Upgrade ${tower.level + 1}: ${nextUpg.name}`;
      dom.inspUpgDesc.textContent = nextUpg.desc;
      dom.btnUpgradeTower.textContent = `Evoluir ($${nextUpg.cost})`;
      dom.btnUpgradeTower.disabled = state.money < nextUpg.cost;
    }
  }

  function upgradeSelectedTower() {
    const tower = state.towers.find((t) => t.uid === state.selectedTowerId);
    if (!tower || tower.level >= 2) return;

    const baseChar = CHARACTERS_POOL.find((c) => c.id === tower.charId);
    const upg = baseChar.upgrades[tower.level];
    if (state.money < upg.cost) return;

    state.money -= upg.cost;
    tower.totalInvested += upg.cost;
    tower.level += 1;
    tower.damage = upg.damage;
    tower.range = upg.range;
    tower.spa = upg.spa;

    if (upg.pierce) tower.pierce = upg.pierce;
    if (upg.splashRadius) tower.splashRadius = upg.splashRadius;
    if (upg.slowFactor) tower.slowFactor = upg.slowFactor;
    if (upg.slowDuration) tower.slowDuration = upg.slowDuration;
    if (upg.multiCount) tower.multiCount = upg.multiCount;
    if (upg.stunDuration) tower.stunDuration = upg.stunDuration;
    if (upg.burnDps) tower.burnDps = upg.burnDps;
    if (upg.auraBonus) tower.auraBonus = upg.auraBonus;

    addEffect('ring', tower.x, tower.y, '#e9c46a', 52, 0.45);
    addFloatingText(tower.x, tower.y - 28, `Nível ${tower.level}!`, '#e9c46a');
    updateGameHud();
  }

  function sellSelectedTower() {
    const idx = state.towers.findIndex((t) => t.uid === state.selectedTowerId);
    if (idx === -1) return;
    const tower = state.towers[idx];
    const refund = Math.floor(tower.totalInvested * 0.7);
    state.money += refund;
    addFloatingText(tower.x, tower.y - 16, `+$${refund}`, '#6fffe9');
    state.towers.splice(idx, 1);
    closeInspector();
    updateGameHud();
  }

  /* =========================================================================
     10. SISTEMA DE ONDAS (+5% DE DIFICULDADE POR FASE)
     ========================================================================= */
  function startNextWave() {
    if (state.waveInProgress || state.gameOver) return;
    const stage = STAGES[state.currentStageId];
    if (state.waveIndex >= stage.waves.length) return;

    const waveGroups = stage.waves[state.waveIndex];
    const difficultyMultiplier = Math.pow(1.05, state.currentStageId);

    state.spawnQueue = [];
    waveGroups.forEach((group) => {
      const template = ENEMY_TYPES[group.type];
      for (let i = 0; i < group.count; i++) {
        state.spawnQueue.push({
          type: group.type,
          delay: i === 0 ? 0.25 : group.interval,
          hp: Math.round(template.hp * difficultyMultiplier),
          speed: template.speed * (1 + state.currentStageId * 0.010),
          reward: template.reward,
          radius: template.radius,
          color: template.color
        });
      }
    });

    state.waveInProgress = true;
    state.spawnTimer = 0.1;
    dom.btnStartWave.disabled = true;
    dom.btnStartWave.textContent = `🌊 Onda ${state.waveIndex + 1}...`;
    updateGameHud();
  }

  function spawnEnemyFromSpec(spec) {
    const stage = STAGES[state.currentStageId];
    const startPt = stage.waypoints[0];
    state.enemies.push({
      id: Math.random(),
      type: spec.type,
      x: startPt.x,
      y: startPt.y,
      waypointIdx: 1,
      distanceTraveled: 0,
      hp: spec.hp,
      maxHp: spec.hp,
      baseSpeed: spec.speed,
      reward: spec.reward,
      radius: spec.radius,
      color: spec.color,
      slowTimer: 0,
      slowFactor: 0,
      stunTimer: 0,
      burnTimer: 0,
      burnDps: 0
    });
  }

  /* =========================================================================
     11. LOOP DE SIMULAÇÃO E COMBATE
     ========================================================================= */
  function updateSimulation(dt) {
    if (state.gameOver || !dom.screenGame.classList.contains('active')) return;

    const scaledDt = dt * state.speedMultiplier;
    const stage = STAGES[state.currentStageId];

    if (state.waveInProgress && state.spawnQueue.length > 0) {
      state.spawnTimer -= scaledDt;
      if (state.spawnTimer <= 0) {
        const nextSpec = state.spawnQueue.shift();
        spawnEnemyFromSpec(nextSpec);
        state.spawnTimer = nextSpec.delay;
      }
    }

    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];

      if (enemy.burnTimer > 0) {
        enemy.burnTimer -= scaledDt;
        enemy.hp -= enemy.burnDps * scaledDt;
      }
      if (enemy.slowTimer > 0) {
        enemy.slowTimer -= scaledDt;
        if (enemy.slowTimer <= 0) enemy.slowFactor = 0;
      }
      if (enemy.stunTimer > 0) {
        enemy.stunTimer -= scaledDt;
      }

      if (enemy.hp <= 0) {
        handleEnemyDefeated(enemy, i);
        continue;
      }

      if (enemy.stunTimer <= 0) {
        const targetPt = stage.waypoints[enemy.waypointIdx];
        if (!targetPt) {
          state.enemies.splice(i, 1);
          state.lives = Math.max(0, state.lives - (enemy.type === 'dirigible' ? 5 : 1));
          addEffect('ring', enemy.x, enemy.y, '#ef4444', 42, 0.4);
          updateGameHud();

          if (state.lives <= 0) {
            triggerDefeat();
            return;
          }
          continue;
        }

        const dx = targetPt.x - enemy.x;
        const dy = targetPt.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        const effectiveSpeed = enemy.baseSpeed * (1 - enemy.slowFactor);
        const step = effectiveSpeed * scaledDt;

        if (dist <= step) {
          enemy.x = targetPt.x;
          enemy.y = targetPt.y;
          enemy.distanceTraveled += dist;
          enemy.waypointIdx += 1;
        } else {
          enemy.x += (dx / dist) * step;
          enemy.y += (dy / dist) * step;
          enemy.distanceTraveled += step;
        }
      }
    }

    for (const tower of state.towers) {
      if (tower.recoil > 0) {
        tower.recoil = Math.max(0, tower.recoil - scaledDt * 4);
      }

      let auraSpeedMult = 1;
      for (const other of state.towers) {
        if (other.uid !== tower.uid && other.auraBonus > 0) {
          if (Math.hypot(tower.x - other.x, tower.y - other.y) <= other.range) {
            auraSpeedMult = Math.max(auraSpeedMult, 1 + other.auraBonus);
          }
        }
      }

      tower.cooldown = Math.max(0, tower.cooldown - scaledDt * auraSpeedMult);

      if (tower.cooldown <= 0) {
        const targetsInRange = state.enemies.filter(
          (e) => Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.range + e.radius
        );

        if (targetsInRange.length > 0) {
          targetsInRange.sort((a, b) => b.distanceTraveled - a.distanceTraveled);
          const primaryTarget = targetsInRange[0];
          tower.angle = Math.atan2(primaryTarget.y - tower.y, primaryTarget.x - tower.x);
          tower.recoil = 1;
          tower.cooldown = tower.spa;

          fireTowerAttack(tower, primaryTarget, targetsInRange);
        }
      }
    }

    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i];
      p.life -= scaledDt;
      if (p.life <= 0) {
        state.projectiles.splice(i, 1);
        continue;
      }

      if (p.type === 'boomerang') {
        p.orbitAngle += p.angularSpeed * scaledDt;
        p.x = p.originX + Math.cos(p.orbitAngle) * p.orbitRadius;
        p.y = p.originY + Math.sin(p.orbitAngle) * p.orbitRadius;
      } else {
        p.x += p.vx * scaledDt;
        p.y += p.vy * scaledDt;
      }

      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const enemy = state.enemies[j];
        if (p.hitIds.has(enemy.id)) continue;

        if (Math.hypot(p.x - enemy.x, p.y - enemy.y) <= p.radius + enemy.radius) {
          p.hitIds.add(enemy.id);
          applyHitToEnemy(p, enemy);

          if (p.splashRadius > 0) {
            addEffect('ring', p.x, p.y, p.color, p.splashRadius, 0.3);
            for (const other of state.enemies) {
              if (other.id !== enemy.id && Math.hypot(p.x - other.x, p.y - other.y) <= p.splashRadius) {
                other.hp -= p.damage * 0.75;
              }
            }
          }

          p.pierceLeft -= 1;
          if (p.pierceLeft <= 0) {
            state.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }

    for (let i = state.effects.length - 1; i >= 0; i--) {
      const fx = state.effects[i];
      fx.elapsed += scaledDt;
      if (fx.elapsed >= fx.duration) state.effects.splice(i, 1);
    }

    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y -= 26 * scaledDt;
      ft.life -= scaledDt;
      if (ft.life <= 0) state.floatingTexts.splice(i, 1);
    }

    if (state.waveInProgress && state.spawnQueue.length === 0 && state.enemies.length === 0) {
      state.waveInProgress = false;
      const waveBonus = 45 + state.waveIndex * 15;
      state.money += waveBonus;
      addFloatingText(450, 260, `Onda Concluída! +$${waveBonus}`, '#6fffe9');

      state.waveIndex += 1;
      if (state.waveIndex >= stage.waves.length) {
        triggerStageVictory();
      } else {
        dom.btnStartWave.disabled = false;
        dom.btnStartWave.textContent = `▶ Onda ${state.waveIndex + 1}`;
        updateGameHud();
      }
      
      if (state.autoWave) {
          setTimeout(() => {
            if (state.autoWave && !state.waveInProgress && !state.gameOver && dom.screenGame.classList.contains('active')) {
              startNextWave();
            }
          }, 650);
        }
    }
  }

  function fireTowerAttack(tower, primaryTarget, targetsInRange) {
    if (tower.projectileType === 'sonicNova') {
      addEffect('ring', tower.x, tower.y, tower.color, tower.range, 0.4);
      targetsInRange.forEach((enemy) => {
        enemy.hp -= tower.damage;
        enemy.stunTimer = Math.max(enemy.stunTimer, tower.stunDuration);
      });
      return;
    }

    if (tower.projectileType === 'boomerang') {
      const count = tower.multiCount || 1;
      for (let k = 0; k < count; k++) {
        const startAngle = tower.angle + (k * Math.PI * 2) / count;
        state.projectiles.push({
          type: 'boomerang',
          originX: tower.x,
          originY: tower.y,
          x: tower.x,
          y: tower.y,
          orbitAngle: startAngle,
          angularSpeed: 6.2,
          orbitRadius: tower.range * 0.65,
          radius: 9,
          color: tower.color,
          damage: tower.damage,
          pierceLeft: 4,
          splashRadius: 0,
          slowFactor: 0,
          slowDuration: 0,
          burnDps: 0,
          life: 0.95,
          hitIds: new Set()
        });
      }
      return;
    }

    const speedMap = {
      lassoSniper: 920,
      harpoon: 540,
      waterJet: 520,
      cryo: 460,
      waveOrb: 390,
      fireSpark: 430
    };
    const speed = speedMap[tower.projectileType] || 460;
    const angle = Math.atan2(primaryTarget.y - tower.y, primaryTarget.x - tower.x);

    if (tower.projectileType === 'lassoSniper') {
      addEffect('beam', tower.x, tower.y, tower.color, 0, 0.16, primaryTarget.x, primaryTarget.y);
    }

    state.projectiles.push({
      type: tower.projectileType,
      x: tower.x,
      y: tower.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: tower.projectileType === 'waveOrb' ? 8 : 6,
      color: tower.color,
      damage: tower.damage,
      pierceLeft: tower.pierce || 1,
      splashRadius: tower.splashRadius || 0,
      slowFactor: tower.slowFactor || 0,
      slowDuration: tower.slowDuration || 0,
      burnDps: tower.burnDps || 0,
      life: (tower.range + 60) / speed,
      hitIds: new Set()
    });
  }

  function applyHitToEnemy(proj, enemy) {
    enemy.hp -= proj.damage;
    if (proj.slowFactor > 0) {
      enemy.slowFactor = Math.max(enemy.slowFactor, proj.slowFactor);
      enemy.slowTimer = Math.max(enemy.slowTimer, proj.slowDuration);
    }
    if (proj.burnDps > 0) {
      enemy.burnDps = Math.max(enemy.burnDps, proj.burnDps);
      enemy.burnTimer = 2.5;
    }
  }

  function handleEnemyDefeated(enemy, index) {
    state.enemies.splice(index, 1);
    state.money += enemy.reward;
    addEffect('pop', enemy.x, enemy.y, enemy.color, enemy.radius + 10, 0.25);
    addFloatingText(enemy.x, enemy.y - 10, `+$${enemy.reward}`, '#e9c46a');
    updateGameHud();
  }

  function triggerStageVictory() {
    state.gameOver = true;
    const stage = STAGES[state.currentStageId];
    if (!state.trophies.includes(stage.id)) {
      state.trophies.push(stage.id);
    }
    if (stage.id + 1 > state.unlockedStage && stage.id + 1 < STAGES.length) {
      state.unlockedStage = stage.id + 1;
    }
    saveProgress();
    updateGameHud();

    dom.modalIcon.textContent = stage.trophyIcon;
    dom.modalTitle.textContent = `${stage.name} Protegida!`;
    dom.modalMessage.textContent = `Você derrotou todas as ${stage.waves.length} ondas e conquistou o troféu deste patrimônio de Parnaíba.`;
    dom.modalTrophyBox.classList.remove('hidden');
    dom.modalTrophyName.textContent = `${stage.trophyIcon} ${stage.trophyName}`;

    const hasNext = stage.id + 1 < STAGES.length;
    dom.btnModalPrimary.textContent = hasNext ? 'Próxima Fase →' : 'Ver Galeria de Troféus 🏆';
    dom.btnModalPrimary.onclick = () => {
      dom.gameModal.classList.add('hidden');
      if (hasNext) startStage(stage.id + 1);
      else showScreen('stages');
    };
    dom.btnModalSecondary.onclick = () => {
      dom.gameModal.classList.add('hidden');
      showScreen('stages');
    };

    dom.gameModal.classList.remove('hidden');
  }

  function triggerDefeat() {
    state.gameOver = true;
    dom.modalIcon.textContent = '💥';
    dom.modalTitle.textContent = 'Defesa Rompida!';
    dom.modalMessage.textContent = 'Os balões ultrapassaram as defesas do ponto turístico. Ajuste o posicionamento e os upgrades!';
    dom.modalTrophyBox.classList.add('hidden');

    dom.btnModalPrimary.textContent = '↻ Tentar Novamente';
    dom.btnModalPrimary.onclick = () => {
      dom.gameModal.classList.add('hidden');
      startStage(state.currentStageId);
    };
    dom.btnModalSecondary.onclick = () => {
      dom.gameModal.classList.add('hidden');
      showScreen('stages');
    };

    dom.gameModal.classList.remove('hidden');
  }

  function addEffect(type, x, y, color, maxRadius, duration, x2 = 0, y2 = 0) {
    state.effects.push({ type, x, y, x2, y2, color, maxRadius, duration, elapsed: 0 });
  }

  function addFloatingText(x, y, text, color) {
    state.floatingTexts.push({ x, y, text, color, life: 0.9 });
  }

  /* =========================================================================
     12. CENÁRIOS REALISTAS DE PARNAÍBA - PI (ARTE DETALHADA NO CANVAS)
     ========================================================================= */
  function drawPalmTree(c, x, y, scale = 1, isCarnauba = false) {
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);

    c.fillStyle = 'rgba(0, 0, 0, 0.22)';
    c.beginPath();
    c.ellipse(6, 12, 16, 7, 0, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = isCarnauba ? '#78553a' : '#6b4423';
    c.lineWidth = isCarnauba ? 4.5 : 5.5;
    c.beginPath();
    c.moveTo(0, 10);
    c.quadraticCurveTo(4, -6, 0, -20);
    c.stroke();

    const leafCount = isCarnauba ? 9 : 7;
    for (let i = 0; i < leafCount; i++) {
      const ang = (i * Math.PI * 2) / leafCount;
      c.save();
      c.translate(0, -20);
      c.rotate(ang);
      c.fillStyle = i % 2 === 0 ? (isCarnauba ? '#4d7c0f' : '#15803d') : (isCarnauba ? '#65a30d' : '#22c55e');
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(11, -5, 22, 2);
      c.quadraticCurveTo(11, 5, 0, 0);
      c.fill();
      c.restore();
    }
    c.restore();
  }

  function drawColonialCasarao(c, x, y, w, h, wallColor, roofColor) {
    c.save();
    c.fillStyle = 'rgba(0, 0, 0, 0.28)';
    c.fillRect(x + 5, y + 6, w, h);

    c.fillStyle = roofColor;
    c.fillRect(x, y, w, h * 0.45);
    c.strokeStyle = 'rgba(0,0,0,0.25)';
    c.lineWidth = 1;
    for (let rx = x + 6; rx < x + w; rx += 7) {
      c.beginPath();
      c.moveTo(rx, y);
      c.lineTo(rx, y + h * 0.45);
      c.stroke();
    }

    c.fillStyle = wallColor;
    c.fillRect(x, y + h * 0.45, w, h * 0.55);

    c.fillStyle = '#f8fafc';
    c.fillRect(x - 2, y + h * 0.43, w + 4, 4);

    const cols = Math.floor(w / 22);
    for (let i = 0; i < cols; i++) {
      const wx = x + 8 + i * 21;
      const wy = y + h * 0.54;
      c.fillStyle = '#1e293b';
      c.beginPath();
      c.arc(wx + 6, wy + 5, 6, Math.PI, 0);
      c.lineTo(wx + 12, wy + 22);
      c.lineTo(wx, wy + 22);
      c.closePath();
      c.fill();
      c.strokeStyle = '#f8fafc';
      c.lineWidth = 1.5;
      c.stroke();
    }
    c.restore();
  }

  function drawWoodenBoat(c, x, y, color, time) {
    c.save();
    const bob = Math.sin(time * 2.4 + x * 0.05) * 2;
    c.translate(x, y + bob);

    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-24, 0);
    c.quadraticCurveTo(0, -11, 24, 0);
    c.quadraticCurveTo(0, 11, -24, 0);
    c.fill();
    c.strokeStyle = '#fef3c7';
    c.lineWidth = 1.5;
    c.stroke();

    c.fillStyle = '#78350f';
    c.fillRect(-10, -4, 3, 8);
    c.fillRect(0, -5, 3, 10);
    c.fillRect(10, -4, 3, 8);
    c.restore();
  }

  function renderRealisticStageBackdrop(c, stage, time) {
    c.save();

    if (stage.id === 0) {
      c.fillStyle = '#8d7b68';
      c.fillRect(0, 0, 900, 560);

      c.fillStyle = 'rgba(255,255,255,0.05)';
      for (let gx = 0; gx < 900; gx += 28) {
        for (let gy = 80; gy < 560; gy += 28) {
          if ((gx + gy) % 56 === 0) c.fillRect(gx, gy, 24, 24);
        }
      }

      const riverGrad = c.createLinearGradient(0, 0, 0, 68);
      riverGrad.addColorStop(0, '#0c4a6e');
      riverGrad.addColorStop(1, '#0284c7');
      c.fillStyle = riverGrad;
      c.fillRect(0, 0, 900, 68);

      c.strokeStyle = 'rgba(186, 230, 253, 0.35)';
      c.lineWidth = 1.5;
      for (let wx = 20; wx < 880; wx += 95) {
        const shift = Math.sin(time * 2 + wx) * 6;
        c.beginPath();
        c.moveTo(wx + shift, 24);
        c.quadraticCurveTo(wx + 22 + shift, 20, wx + 44 + shift, 24);
        c.stroke();
      }

      c.fillStyle = '#78350f';
      c.fillRect(0, 62, 900, 12);
      c.fillStyle = '#92400e';
      for (let px = 0; px < 900; px += 14) {
        c.fillRect(px, 62, 10, 12);
      }

      drawWoodenBoat(c, 130, 36, '#dc2626', time);
      drawWoodenBoat(c, 370, 34, '#eab308', time);
      drawWoodenBoat(c, 650, 38, '#0d9488', time);
      drawWoodenBoat(c, 815, 32, '#ea580c', time);

      drawColonialCasarao(c, 35, 76, 90, 62, '#f59e0b', '#9a3412');
      drawColonialCasarao(c, 130, 76, 90, 62, '#38bdf8', '#7c2d12');
      drawColonialCasarao(c, 560, 76, 95, 62, '#fb7185', '#9a3412');
      drawColonialCasarao(c, 660, 76, 95, 62, '#fef08a', '#7c2d12');

      drawPalmTree(c, 80, 320, 1.05);
      drawPalmTree(c, 145, 480, 0.95);
      drawPalmTree(c, 375, 295, 1.0);
      drawPalmTree(c, 645, 340, 1.1);
      drawPalmTree(c, 845, 130, 0.95);

    } else if (stage.id === 1) {
      c.fillStyle = '#2d6a4f';
      c.fillRect(0, 0, 900, 560);

      c.fillStyle = '#40916c';
      c.beginPath();
      c.roundRect(22, 22, 856, 516, 22);
      c.fill();
      c.strokeStyle = '#d6d3d1';
      c.lineWidth = 4;
      c.stroke();

      c.fillStyle = '#e7e5e4';
      c.beginPath();
      c.roundRect(355, 200, 200, 140, 18);
      c.fill();
      c.strokeStyle = '#a8a29e';
      c.lineWidth = 3;
      c.stroke();

      const cx = 420;
      const cy = 270;
      c.fillStyle = 'rgba(0,0,0,0.25)';
      c.beginPath();
      c.arc(cx + 4, cy + 6, 36, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#fef3c7';
      c.beginPath();
      c.arc(cx, cy, 34, 0, Math.PI * 2);
      c.fill();
      c.lineWidth = 3;
      c.strokeStyle = '#b45309';
      c.stroke();

      c.fillStyle = '#b91c1c';
      c.beginPath();
      c.arc(cx, cy, 26, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.arc(cx, cy, 7, 0, Math.PI * 2);
      c.fill();

      const fx = 502;
      const fy = 270;
      c.fillStyle = '#cbd5e1';
      c.beginPath();
      c.arc(fx, fy, 25, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#0ea5e9';
      c.beginPath();
      c.arc(fx, fy, 20, 0, Math.PI * 2);
      c.fill();
      const pulse = 6 + Math.sin(time * 4) * 3;
      c.strokeStyle = '#e0f2fe';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(fx, fy, pulse, 0, Math.PI * 2);
      c.stroke();

      const trees = [
        [65, 70], [835, 70], [65, 490], [835, 490],
        [230, 185], [225, 385], [680, 290], [835, 310]
      ];
      trees.forEach(([tx, ty]) => drawPalmTree(c, tx, ty, 1.05));

    } else if (stage.id === 2) {
      c.fillStyle = '#3b4252';
      c.fillRect(0, 0, 900, 560);

      c.fillStyle = '#2e5a44';
      c.fillRect(165, 20, 125, 405);
      c.fillRect(610, 20, 125, 405);

      c.fillStyle = '#e5e7eb';
      c.beginPath();
      c.roundRect(350, 14, 200, 185, 12);
      c.fill();

      const bx = 372;
      const by = 22;
      const bw = 156;
      const bh = 138;

      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.fillRect(bx + 6, by + 6, bw, bh);

      c.fillStyle = '#9a3412';
      c.fillRect(bx + 24, by + 16, bw - 48, bh - 26);

      c.fillStyle = '#f8fafc';
      c.fillRect(bx + 20, by + 95, bw - 40, 42);
      c.fillStyle = '#f59e0b';
      c.fillRect(bx + 20, by + 95, bw - 40, 6);

      c.fillStyle = '#0284c7';
      c.beginPath();
      c.arc(bx + bw / 2, by + 112, 10, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#fbbf24';
      c.lineWidth = 2;
      c.stroke();

      c.fillStyle = '#78350f';
      c.beginPath();
      c.arc(bx + bw / 2, by + 128, 9, Math.PI, 0);
      c.lineTo(bx + bw / 2 + 9, by + 137);
      c.lineTo(bx + bw / 2 - 9, by + 137);
      c.closePath();
      c.fill();

      [bx + 4, bx + bw - 34].forEach((tx) => {
        c.fillStyle = '#f1f5f9';
        c.fillRect(tx, by + 48, 30, 90);
        c.strokeStyle = '#d97706';
        c.lineWidth = 2;
        c.strokeRect(tx, by + 48, 30, 90);

        c.fillStyle = '#d97706';
        c.beginPath();
        c.moveTo(tx - 2, by + 48);
        c.lineTo(tx + 15, by + 22);
        c.lineTo(tx + 32, by + 48);
        c.closePath();
        c.fill();

        c.strokeStyle = '#fef08a';
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(tx + 15, by + 10);
        c.lineTo(tx + 15, by + 23);
        c.moveTo(tx + 10, by + 15);
        c.lineTo(tx + 20, by + 15);
        c.stroke();
      });

      c.fillStyle = '#cbd5e1';
      c.fillRect(bx + 44, by + 138, bw - 88, 18);

      drawPalmTree(c, 225, 95, 1.15);
      drawPalmTree(c, 225, 240, 1.15);
      drawPalmTree(c, 225, 375, 1.15);
      drawPalmTree(c, 675, 95, 1.15);
      drawPalmTree(c, 675, 240, 1.15);
      drawPalmTree(c, 675, 375, 1.15);

    } else if (stage.id === 3) {
      c.fillStyle = '#1b4332';
      c.fillRect(0, 0, 900, 560);

      const igaracuGrad = c.createLinearGradient(0, 0, 0, 52);
      igaracuGrad.addColorStop(0, '#083344');
      igaracuGrad.addColorStop(1, '#0e7490');
      c.fillStyle = igaracuGrad;
      c.fillRect(0, 0, 900, 52);

      c.fillStyle = '#0e7490';
      c.beginPath();
      c.ellipse(440, 165, 240, 22, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(460, 308, 250, 22, 0, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#e9c46a';
      c.beginPath();
      c.ellipse(440, 165, 160, 10, 0, 0, Math.PI * 2);
      c.fill();

      drawWoodenBoat(c, 210, 25, '#f97316', time);
      drawWoodenBoat(c, 580, 27, '#38bdf8', time);
      drawWoodenBoat(c, 450, 308, '#facc15', time);

      const mangroves = [
        [75, 165], [825, 165], [75, 310], [825, 310], [835, 460], [180, 440], [670, 440]
      ];
      mangroves.forEach(([mx, my]) => drawPalmTree(c, mx, my, 1.1, true));

    } else if (stage.id === 4) {
      const sandGrad = c.createLinearGradient(0, 0, 900, 560);
      sandGrad.addColorStop(0, '#f4d58d');
      sandGrad.addColorStop(0.5, '#e9c46a');
      sandGrad.addColorStop(1, '#d4a373');
      c.fillStyle = sandGrad;
      c.fillRect(0, 0, 900, 560);

      c.fillStyle = 'rgba(180, 120, 50, 0.16)';
      c.beginPath();
      c.moveTo(0, 180);
      c.quadraticCurveTo(220, 120, 360, 240);
      c.lineTo(0, 320);
      c.closePath();
      c.fill();

      const drawLagoonPool = (lx, ly, rx, ry) => {
        c.fillStyle = '#90e0ef';
        c.beginPath();
        c.ellipse(lx, ly, rx + 8, ry + 8, 0, 0, Math.PI * 2);
        c.fill();

        const poolGrad = c.createRadialGradient(lx, ly, 10, lx, ly, rx);
        poolGrad.addColorStop(0, '#0077b6');
        poolGrad.addColorStop(0.7, '#00b4d8');
        poolGrad.addColorStop(1, '#48cae4');
        c.fillStyle = poolGrad;
        c.beginPath();
        c.ellipse(lx, ly, rx, ry, 0, 0, Math.PI * 2);
        c.fill();
      };

      drawLagoonPool(602, 338, 84, 54);
      drawLagoonPool(810, 82, 95, 58);

      drawPalmTree(c, 255, 210, 1.1, true);
      drawPalmTree(c, 330, 340, 1.0, true);
      drawPalmTree(c, 535, 165, 1.05, true);
      drawPalmTree(c, 835, 355, 1.1, true);
      drawPalmTree(c, 75, 485, 1.0, true);

    } else if (stage.id === 5) {
      c.fillStyle = '#2d6a4f';
      c.fillRect(0, 0, 900, 560);

      c.fillStyle = '#40916c';
      c.fillRect(24, 24, 852, 512);

      const drawCampusBuilding = (bx, by, bw, bh, title) => {
        c.fillStyle = 'rgba(0,0,0,0.26)';
        c.fillRect(bx + 6, by + 6, bw, bh);

        c.fillStyle = '#f1f5f9';
        c.beginPath();
        c.roundRect(bx, by, bw, bh, 8);
        c.fill();

        c.fillStyle = '#0f766e';
        c.fillRect(bx + 8, by + 8, bw - 16, bh - 16);

        c.fillStyle = '#38bdf8';
        c.fillRect(bx + 18, by + bh / 2 - 6, bw - 36, 12);

        c.fillStyle = '#ffffff';
        c.font = 'bold 11px Outfit, sans-serif';
        c.textAlign = 'center';
        c.fillText(title, bx + bw / 2, by + bh - 14);
      };

      drawCampusBuilding(262, 208, 136, 148, 'BLOCO UFDPar');
      drawCampusBuilding(742, 208, 126, 174, 'BIBLIOTECA');

      drawPalmTree(c, 95, 180, 1.05, true);
      drawPalmTree(c, 95, 340, 1.05, true);
      drawPalmTree(c, 570, 230, 1.0, true);
      drawPalmTree(c, 570, 345, 1.0, true);
      drawPalmTree(c, 560, 55, 0.95, true);

    } else if (stage.id === 6) {
      c.fillStyle = '#e9c46a';
      c.fillRect(0, 0, 900, 560);

      const seaGrad = c.createLinearGradient(0, 0, 0, 68);
      seaGrad.addColorStop(0, '#03045e');
      seaGrad.addColorStop(0.7, '#0077b6');
      seaGrad.addColorStop(1, '#00b4d8');
      c.fillStyle = seaGrad;
      c.fillRect(0, 0, 900, 64);

      c.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      c.lineWidth = 3;
      const waveOffset = Math.sin(time * 2.5) * 4;
      c.beginPath();
      for (let wx = 0; wx <= 900; wx += 45) {
        const wy = 63 + Math.sin(wx * 0.04 + time * 3) * 2.5 + waveOffset * 0.5;
        if (wx === 0) c.moveTo(wx, wy);
        else c.lineTo(wx, wy);
      }
      c.stroke();

      const drawGraniteRock = (rx, ry, rw, rh) => {
        c.fillStyle = '#334155';
        c.beginPath();
        c.ellipse(rx, ry, rw, rh, -0.15, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#64748b';
        c.beginPath();
        c.ellipse(rx - rw * 0.2, ry - rh * 0.2, rw * 0.55, rh * 0.45, -0.15, 0, Math.PI * 2);
        c.fill();
      };

      drawGraniteRock(175, 52, 42, 18);
      drawGraniteRock(230, 56, 30, 14);
      drawGraniteRock(665, 50, 48, 20);
      drawGraniteRock(730, 55, 34, 15);
      drawGraniteRock(65, 365, 36, 22);

      const drawWindTurbine = (tx, ty) => {
        c.save();
        c.strokeStyle = 'rgba(0,0,0,0.18)';
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(tx, ty);
        c.lineTo(tx + 24, ty + 14);
        c.stroke();

        c.strokeStyle = '#f8fafc';
        c.lineWidth = 4.5;
        c.beginPath();
        c.moveTo(tx, ty);
        c.lineTo(tx, ty - 48);
        c.stroke();

        c.translate(tx, ty - 48);
        c.rotate(time * 1.8 + tx * 0.02);
        c.fillStyle = '#ffffff';
        for (let b = 0; b < 3; b++) {
          c.rotate((Math.PI * 2) / 3);
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(-2.5, -26);
          c.lineTo(2.5, -26);
          c.closePath();
          c.fill();
        }
        c.fillStyle = '#0284c7';
        c.beginPath();
        c.arc(0, 0, 3.5, 0, Math.PI * 2);
        c.fill();
        c.restore();
      };

      drawWindTurbine(285, 225);
      drawWindTurbine(485, 225);
      drawWindTurbine(685, 225);
      drawWindTurbine(855, 375);
    }

    c.restore();
  }

  function renderRealisticStagePath(c, stage) {
    c.save();
    c.lineCap = 'round';
    c.lineJoin = 'round';

    c.strokeStyle = stage.roadBorder;
    c.lineWidth = 48;
    c.beginPath();
    stage.waypoints.forEach((pt, idx) => {
      if (idx === 0) c.moveTo(pt.x, pt.y);
      else c.lineTo(pt.x, pt.y);
    });
    c.stroke();

    c.strokeStyle = stage.roadColor;
    c.lineWidth = 38;
    c.stroke();

    if (stage.roadStyle === 'avenue') {
      c.strokeStyle = '#facc15';
      c.lineWidth = 2.5;
      c.setLineDash([14, 14]);
      c.stroke();
      c.setLineDash([]);
    } else if (stage.roadStyle === 'boardwalk') {
      c.strokeStyle = 'rgba(92, 51, 23, 0.35)';
      c.lineWidth = 34;
      c.setLineDash([3, 9]);
      c.stroke();
      c.setLineDash([]);
    } else if (stage.roadStyle === 'cobblestone' || stage.roadStyle === 'portugueseStone') {
      c.strokeStyle = 'rgba(0, 0, 0, 0.14)';
      c.lineWidth = 30;
      c.setLineDash([6, 8]);
      c.stroke();
      c.setLineDash([]);
    } else {
      c.strokeStyle = 'rgba(180, 120, 60, 0.25)';
      c.lineWidth = 2;
      c.setLineDash([10, 14]);
      c.stroke();
      c.setLineDash([]);
    }

    const start = stage.waypoints[0];
    const end = stage.waypoints[stage.waypoints.length - 1];
    drawPathMarker(c, Math.max(28, Math.min(872, start.x)), Math.max(28, Math.min(532, start.y)), 'INÍCIO', '#16a34a');
    drawPathMarker(c, Math.max(28, Math.min(872, end.x)), Math.max(28, Math.min(532, end.y)), 'FIM', '#dc2626');

    c.restore();
  }

  function drawPathMarker(c, x, y, label, color) {
    c.save();
    c.fillStyle = color;
    c.beginPath();
    c.roundRect(x - 24, y - 11, 48, 22, 6);
    c.fill();
    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.5;
    c.stroke();
    c.fillStyle = '#fff';
    c.font = 'bold 10px Outfit, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(label, x, y + 0.5);
    c.restore();
  }

  /* =========================================================================
     13. RENDERIZAÇÃO PRINCIPAL DO CANVAS
     ========================================================================= */
  function drawCharacterSpriteOnCanvas(charId, x, y, size = 46, flipX = false) {
    const img = SPRITE_IMAGES[charId];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (flipX) {
        ctx.translate(x, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -size * 0.4, -size * 0.56, size * 0.8, size);
      } else {
        ctx.drawImage(img, x - size * 0.4, y - size * 0.56, size * 0.8, size);
      }
      ctx.restore();
    } else {
      const char = CHARACTERS_POOL.find((c) => c.id === charId);
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char ? char.icon : '🛡️', x, y);
    }
  }

  function renderGameCanvas(nowSeconds) {
    const stage = STAGES[state.currentStageId];
    ctx.clearRect(0, 0, 900, 560);

    renderRealisticStageBackdrop(ctx, stage, nowSeconds);
    renderRealisticStagePath(ctx, stage);

    if (state.selectedTowerId) {
      const selTower = state.towers.find((t) => t.uid === state.selectedTowerId);
      if (selTower) {
        drawRangeCircle(selTower.x, selTower.y, selTower.range, 'rgba(0, 168, 150, 0.2)', '#00a896');
      }
    }

    for (const tower of state.towers) {
      drawTower(tower);
    }

    if (state.buildingCharId) {
      const char = CHARACTERS_POOL.find((c) => c.id === state.buildingCharId);
      if (char && state.mousePos.x >= 0) {
        const valid = isValidPlacement(state.mousePos.x, state.mousePos.y);
        const fill = valid ? 'rgba(0, 168, 150, 0.24)' : 'rgba(239, 68, 68, 0.26)';
        const stroke = valid ? '#00a896' : '#ef4444';
        drawRangeCircle(state.mousePos.x, state.mousePos.y, char.range, fill, stroke);

        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(state.mousePos.x, state.mousePos.y + 18, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        drawCharacterSpriteOnCanvas(char.id, state.mousePos.x, state.mousePos.y, 50, false);
        ctx.restore();
      }
    }

    for (const enemy of state.enemies) {
      drawEnemy(enemy);
    }

    for (const p of state.projectiles) {
      drawProjectile(p);
    }

    drawEffectsAndTexts();
  }

  function drawRangeCircle(x, y, radius, fillStyle, strokeStyle) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.restore();
  }

  function drawTower(tower) {
    ctx.save();
    const scale = 1 + tower.recoil * 0.14;
    ctx.translate(tower.x, tower.y);
    ctx.scale(scale, scale);

    if (tower.auraBonus > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, tower.range, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(231, 111, 81, 0.08)';
      ctx.fill();
    }

    // Sombra no chão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Anel de seleção se a torre estiver selecionada
    if (tower.uid === state.selectedTowerId) {
      ctx.beginPath();
      ctx.ellipse(0, 18, 21, 9, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#e9c46a';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Sprite Pixel Art do personagem posicionado no mapa
    const facingLeft = Math.cos(tower.angle) < -0.15;
    drawCharacterSpriteOnCanvas(tower.charId, 0, 0, 50, facingLeft);

    if (tower.level > 0) {
      ctx.fillStyle = '#e9c46a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★'.repeat(tower.level), 0, -30);
    }

    ctx.restore();
  }

  function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(2, enemy.radius * 0.4, enemy.radius * 0.9, enemy.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    if (enemy.type === 'dirigible') {
      ctx.ellipse(0, 0, enemy.radius + 6, enemy.radius - 4, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    }
    ctx.fillStyle = enemy.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-enemy.radius * 0.32, -enemy.radius * 0.32, enemy.radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();

    if (enemy.slowTimer > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy.burnTimer > 0) {
      ctx.font = '12px sans-serif';
      ctx.fillText('🔥', -6, -enemy.radius - 4);
    }

    if (enemy.hp < enemy.maxHp) {
      const barW = enemy.radius * 2;
      const pct = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(-barW / 2, enemy.radius + 5, barW, 4);
      ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(-barW / 2, enemy.radius + 5, barW * pct, 4);
    }

    ctx.restore();
  }

  function drawProjectile(p) {
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.restore();
  }

  function drawEffectsAndTexts() {
    for (const fx of state.effects) {
      const progress = fx.elapsed / fx.duration;
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      if (fx.type === 'ring' || fx.type === 'pop') {
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.maxRadius * progress, 0, Math.PI * 2);
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (fx.type === 'beam') {
        ctx.beginPath();
        ctx.moveTo(fx.x, fx.y);
        ctx.lineTo(fx.x2, fx.y2);
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();
    }

    for (const ft of state.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life * 1.4);
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#091524';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  /* =========================================================================
     14. EVENTOS DE MOUSE, TECLADO E TOQUE (MOBILE & PC)
     ========================================================================= */
  function getCanvasCoords(clientX, clientY, isTouch = false) {
    const rect = dom.canvas.getBoundingClientRect();
    const scaleX = dom.canvas.width / rect.width;
    const scaleY = dom.canvas.height / rect.height;
    const touchYOffset = isTouch && state.isTouchDragging ? -26 : 0;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY + touchYOffset
    };
  }

  function handleCanvasTapOrClick(pos) {
    state.mousePos = pos;

    if (state.buildingCharId) {
      placeTowerAt(pos.x, pos.y);
      return;
    }

    const clickedTower = state.towers.find((t) => Math.hypot(pos.x - t.x, pos.y - t.y) <= 28);
    if (clickedTower) {
      selectTower(clickedTower.uid);
    } else {
      closeInspector();
    }
  }

  function bindEvents() {
    dom.btnConfirmSquad.addEventListener('click', () => {
      if (state.selectedSquad.length === 4) {
        saveProgress();
        showScreen('stages');
      }
    });

    dom.btnEditSquad.addEventListener('click', () => showScreen('select'));

    dom.btnResetProgress.addEventListener('click', () => {
      if (confirm('Deseja realmente apagar todos os troféus e voltar para a Fase 1?')) {
        state.unlockedStage = 0;
        state.trophies = [];
        saveProgress();
        renderStageMenu();
        updateGlobalTrophyHeader();
      }
    });

    dom.btnBackStages.addEventListener('click', () => {
      cancelPlacement();
      showScreen('stages');
    });

    dom.btnStartWave.addEventListener('click', startNextWave);

    dom.btnSpeed.addEventListener('click', () => {
      state.speedMultiplier = state.speedMultiplier === 1 ? 2 : 1;
      dom.btnSpeed.textContent = `⏩ ${state.speedMultiplier}x`;
    });

    dom.btnAutoWave.addEventListener('click', () => {
      state.autoWave = !state.autoWave;
      dom.btnAutoWave.textContent = state.autoWave ? '🔁 Auto: ON' : '🔁 Auto: OFF';
      dom.btnAutoWave.classList.toggle('active-auto', state.autoWave);

      if (state.autoWave && !state.waveInProgress && !state.gameOver) {
        startNextWave();
      }
    });

    dom.btnCancelPlacement.addEventListener('click', cancelPlacement);

    dom.canvas.addEventListener('mousemove', (e) => {
      state.mousePos = getCanvasCoords(e.clientX, e.clientY, false);
    });

    dom.canvas.addEventListener('click', (e) => {
      const pos = getCanvasCoords(e.clientX, e.clientY, false);
      handleCanvasTapOrClick(pos);
    });

    dom.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (state.buildingCharId) cancelPlacement();
      else closeInspector();
    });

    dom.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      state.mousePos = getCanvasCoords(e.clientX, e.clientY, false);
    });

    dom.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const pos = getCanvasCoords(e.clientX, e.clientY, false);
      placeTowerAt(pos.x, pos.y);
    });

    dom.canvas.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const touch = e.touches[0];
      if (state.buildingCharId) {
        state.isTouchDragging = true;
        state.mousePos = getCanvasCoords(touch.clientX, touch.clientY, true);
      } else {
        const pos = getCanvasCoords(touch.clientX, touch.clientY, false);
        handleCanvasTapOrClick(pos);
      }
    }, { passive: true });

    dom.canvas.addEventListener('touchmove', (e) => {
      if (!state.buildingCharId || !e.touches || !e.touches[0]) return;
      e.preventDefault();
      const touch = e.touches[0];
      state.isTouchDragging = true;
      state.mousePos = getCanvasCoords(touch.clientX, touch.clientY, true);
    }, { passive: false });

    dom.canvas.addEventListener('touchend', () => {
      if (state.buildingCharId && state.isTouchDragging) {
        placeTowerAt(state.mousePos.x, state.mousePos.y);
        state.isTouchDragging = false;
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (!state.isTouchDragging || !state.buildingCharId || !e.touches || !e.touches[0]) return;
      const touch = e.touches[0];
      state.mousePos = getCanvasCoords(touch.clientX, touch.clientY, true);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (state.isTouchDragging && state.buildingCharId) {
        if (state.mousePos.x >= 0 && state.mousePos.x <= 900 && state.mousePos.y >= 0 && state.mousePos.y <= 560) {
          placeTowerAt(state.mousePos.x, state.mousePos.y);
        }
        state.isTouchDragging = false;
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!dom.screenGame.classList.contains('active')) return;
      if (e.key === 'Escape') {
        cancelPlacement();
        closeInspector();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        const charId = state.selectedSquad[idx];
        const char = CHARACTERS_POOL.find((c) => c.id === charId);
        if (char && state.money >= char.cost) {
          startPlacement(char.id);
        }
      }
    });

    dom.btnUpgradeTower.addEventListener('click', upgradeSelectedTower);
    dom.btnSellTower.addEventListener('click', sellSelectedTower);
    dom.btnCloseInspector.addEventListener('click', closeInspector);
  }

  let lastTimestamp = 0;
  function gameLoop(timestamp) {
    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000 || 0);
    lastTimestamp = timestamp;

    updateSimulation(dt);
    if (dom.screenGame.classList.contains('active')) {
      renderGameCanvas(timestamp / 1000);
    }

    requestAnimationFrame(gameLoop);
  }

  // Inicialização
  loadProgress();
  bindEvents();
  showScreen('select');
  requestAnimationFrame(gameLoop);
})();