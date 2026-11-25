/**
 * Main App Controller
 * Connects Home (Chest, Daily Puzzle, Level CTA, Free Play, Bottom Nav),
 * Shop (Dots & Backgrounds), Goals, Gameplay, and YouTube Playables SDK v1.
 */
(function (global) {
  'use strict';

  const CHEST_STEP = 5; // Open chest every 5 levels completed!

  const screens = {
    home: document.getElementById('screen-home'),
    packs: document.getElementById('screen-packs'),
    levels: document.getElementById('screen-levels'),
    shop: document.getElementById('screen-shop'),
    goals: document.getElementById('screen-goals'),
    play: document.getElementById('screen-play')
  };

  const els = {
    homeCoins: document.getElementById('home-coins'),
    homeGems: document.getElementById('home-gems'),
    btnSoundHome: document.getElementById('btn-sound-home'),
    btnSoundPlay: document.getElementById('btn-sound-play'),

    labelLevelChest: document.getElementById('label-level-chest'),
    chestReadyHint: document.getElementById('chest-ready-hint'),
    chestProgressFill: document.getElementById('chest-progress-fill'),
    chestProgressText: document.getElementById('chest-progress-text'),
    btnOpenChest: document.getElementById('btn-open-chest'),

    labelDailyPuzzle: document.getElementById('label-daily-puzzle'),
    dailyDateText: document.getElementById('daily-date-text'),
    btnDailyPlay: document.getElementById('btn-daily-play'),

    btnQuickPlay: document.getElementById('btn-quick-play'),
    quickPlayLabel: document.getElementById('quick-play-label'),
    btnFreePlay: document.getElementById('btn-free-play'),
    labelFreePlay: document.getElementById('label-free-play'),

    navMain: document.getElementById('nav-main'),
    navDaily: document.getElementById('nav-daily'),
    navShop: document.getElementById('nav-shop'),
    navGoals: document.getElementById('nav-goals'),
    goalsBadge: document.getElementById('goals-badge'),

    btnPacksBack: document.getElementById('btn-packs-back'),
    packsHeading: document.getElementById('packs-heading'),
    packsGrid: document.getElementById('packs-grid'),

    btnLevelsBack: document.getElementById('btn-levels-back'),
    levelsPackTitle: document.getElementById('levels-pack-title'),
    levelsPackProgress: document.getElementById('levels-pack-progress'),
    btnRandomLevel: document.getElementById('btn-random-level'),
    randomBtnLabel: document.getElementById('random-btn-label'),
    levelsGrid: document.getElementById('levels-grid'),

    btnShopBack: document.getElementById('btn-shop-back'),
    shopHeading: document.getElementById('shop-heading'),
    shopCoins: document.getElementById('shop-coins'),
    shopGems: document.getElementById('shop-gems'),
    shopHints: document.getElementById('shop-hints'),
    labelBuyHints: document.getElementById('label-buy-hints'),
    labelBuyHintsSub: document.getElementById('label-buy-hints-sub'),
    btnBuyHints: document.getElementById('btn-buy-hints'),
    tabDots: document.getElementById('tab-dots'),
    tabBgs: document.getElementById('tab-bgs'),
    shopGrid: document.getElementById('shop-grid'),

    btnGoalsBack: document.getElementById('btn-goals-back'),
    goalsHeading: document.getElementById('goals-heading'),
    goalsList: document.getElementById('goals-list'),

    btnPlayBack: document.getElementById('btn-play-back'),
    playLevelTitle: document.getElementById('play-level-title'),
    playCoins: document.getElementById('play-coins'),
    playGridBadge: document.getElementById('play-grid-badge'),
    metricFlows: document.getElementById('metric-flows'),
    metricPipe: document.getElementById('metric-pipe'),
    tutorialToast: document.getElementById('tutorial-toast'),

    btnReset: document.getElementById('btn-reset'),
    btnHint: document.getElementById('btn-hint'),
    btnUndo: document.getElementById('btn-undo'),
    hintCountBadge: document.getElementById('hint-count-badge'),
    labelReset: document.getElementById('label-reset'),
    labelHint: document.getElementById('label-hint'),
    labelUndo: document.getElementById('label-undo'),

    modalWin: document.getElementById('modal-win'),
    winStars: document.getElementById('win-stars'),
    winTitle: document.getElementById('win-title'),
    winDesc: document.getElementById('win-desc'),
    winRewards: document.getElementById('win-rewards'),
    btnWinReplay: document.getElementById('btn-win-replay'),
    btnWinNext: document.getElementById('btn-win-next'),

    modalChest: document.getElementById('modal-chest'),
    chestModalTitle: document.getElementById('chest-modal-title'),
    chestModalDesc: document.getElementById('chest-modal-desc'),
    btnChestClaim: document.getElementById('btn-chest-claim'),

    modalPause: document.getElementById('modal-pause'),
    pauseTitle: document.getElementById('pause-title'),
    btnResume: document.getElementById('btn-resume'),

    canvas: document.getElementById('game-canvas')
  };

  let saveState = {
    solved: {},
    lastPack: '5x5',
    lastLevel: 0,
    randomSolved: 0,
    dailySolvedDates: [],
    coins: 60,
    gems: 10,
    hints: 4,
    chestProgress: 0,
    ownedDots: ['circle'],
    ownedBgs: ['midnight'],
    equippedDot: 'circle',
    equippedBg: 'midnight',
    claimedGoals: [],
    soundOn: true
  };

  let currentPackId = '5x5';
  let currentLevelIndex = 0;
  let playMode = 'level'; // 'level' | 'random' | 'daily'
  let returnScreen = 'home';
  let shopTab = 'dots';
  let game = null;

  function showScreen(name) {
    Object.keys(screens).forEach((k) => screens[k].classList.toggle('active', k === name));
    if (name === 'play' && game) {
      requestAnimationFrame(() => game.resize());
    }
  }

  function applyLocalization() {
    els.labelLevelChest.textContent = I18N.t('levelChest');
    els.chestReadyHint.textContent = I18N.t('tapToOpen');
    els.labelDailyPuzzle.textContent = I18N.t('dailyPuzzle');
    els.labelFreePlay.textContent = I18N.t('freePlay');
    els.navMain.textContent = I18N.t('navMain');
    els.navDaily.textContent = I18N.t('navDaily');
    els.navShop.textContent = I18N.t('navShop');
    els.navGoals.textContent = I18N.t('navGoals');
    els.packsHeading.textContent = I18N.t('freePlay').toUpperCase();
    els.randomBtnLabel.textContent = I18N.t('random');
    els.shopHeading.textContent = I18N.t('shop');
    els.tabDots.textContent = I18N.t('dots');
    els.tabBgs.textContent = I18N.t('backgrounds');
    els.labelBuyHints.textContent = I18N.t('buyHintsTitle');
    els.labelBuyHintsSub.textContent = I18N.t('buyHintsSub');
    els.goalsHeading.textContent = I18N.t('goals').toUpperCase();
    els.labelReset.textContent = I18N.t('restart');
    els.labelHint.textContent = I18N.t('hint');
    els.labelUndo.textContent = I18N.t('undo');
    els.btnWinReplay.textContent = I18N.t('replay');
    els.chestModalTitle.textContent = I18N.t('chestTitle');
    els.chestModalDesc.textContent = I18N.t('chestDesc');
    els.btnChestClaim.textContent = I18N.t('claim');
    els.pauseTitle.textContent = I18N.t('paused');
    els.btnResume.textContent = I18N.t('resume');
  }

  function syncCurrencies() {
    els.homeCoins.textContent = String(saveState.coins);
    els.homeGems.textContent = String(saveState.gems);
    els.shopCoins.textContent = String(saveState.coins);
    els.shopGems.textContent = String(saveState.gems);
    els.shopHints.textContent = String(saveState.hints);
    els.playCoins.textContent = String(saveState.coins);
    els.hintCountBadge.textContent = String(saveState.hints);
    els.btnBuyHints.disabled = saveState.coins < 50;
  }

  function updateSoundIcons() {
    const on = SoundFX.isEffectiveEnabled();
    [els.btnSoundHome, els.btnSoundPlay].forEach((btn) => {
      btn.querySelector('.icon-sound-on').classList.toggle('hidden', !on);
      btn.querySelector('.icon-sound-off').classList.toggle('hidden', on);
    });
  }

  function toggleSound() {
    SoundFX.unlock();
    const next = !SoundFX.isUserEnabled();
    SoundFX.setUserEnabled(next);
    saveState.soundOn = next;
    updateSoundIcons();
    if (next) SoundFX.tap();
    YTSDK.saveData(saveState);
  }

  function getStatsForGoals() {
    const keys = Object.keys(saveState.solved);
    let perfects = 0;
    for (const k of keys) {
      if ((saveState.solved[k].stars || 0) === 3) perfects++;
    }
    return {
      totalSolved: keys.length + (saveState.randomSolved || 0) + (saveState.dailySolvedDates || []).length,
      perfects,
      dailySolved: (saveState.dailySolvedDates || []).length,
      ownedItems: (saveState.ownedDots || []).length + (saveState.ownedBgs || []).length - 1
    };
  }

  function hasClaimableGoal() {
    const stats = getStatsForGoals();
    return ShopCatalog.GOALS.some((g) => {
      if (saveState.claimedGoals.includes(g.id)) return false;
      return (stats[g.metric] || 0) >= g.target;
    });
  }

  function getLinearLevelNumber() {
    const packIdx = Math.max(0, LevelGenerator.PACKS.findIndex((p) => p.id === saveState.lastPack));
    return packIdx * 20 + saveState.lastLevel + 1;
  }

  function getTotalScore() {
    let stars = 0;
    for (const k in saveState.solved) stars += saveState.solved[k].stars || 0;
    return (stars + (saveState.randomSolved || 0) * 3 + (saveState.dailySolvedDates || []).length * 5) * 100;
  }

  function renderHome() {
    syncCurrencies();

    // Chest UI
    const prog = Math.min(CHEST_STEP, saveState.chestProgress || 0);
    const pct = Math.round((prog / CHEST_STEP) * 100);
    els.chestProgressFill.style.width = `${pct}%`;
    els.chestProgressText.textContent = `${prog}/${CHEST_STEP}`;
    const ready = prog >= CHEST_STEP;
    els.btnOpenChest.classList.toggle('ready', ready);
    els.chestReadyHint.classList.toggle('hidden', !ready);

    // Daily Puzzle UI
    const daily = LevelGenerator.getDailyPuzzle();
    els.dailyDateText.textContent = I18N.t('formatDate', new Date());
    const solvedToday = (saveState.dailySolvedDates || []).includes(daily.dateKey);
    els.btnDailyPlay.textContent = solvedToday ? I18N.t('playedToday') : I18N.t('play');

    // Level CTA
    const lvlNum = getLinearLevelNumber();
    els.quickPlayLabel.textContent = `${I18N.t('level').charAt(0) + I18N.t('level').slice(1).toLowerCase()} ${lvlNum}`;

    // Goals badge
    els.goalsBadge.classList.toggle('hidden', !hasClaimableGoal());
  }

  function renderPacks() {
    els.packsGrid.innerHTML = '';
    for (const p of LevelGenerator.PACKS) {
      let solvedCount = 0;
      let starsCount = 0;
      for (let i = 0; i < p.count; i++) {
        const rec = saveState.solved[`${p.id}:${i}`];
        if (rec) { solvedCount++; starsCount += rec.stars || 0; }
      }
      const pct = Math.round((solvedCount / p.count) * 100);
      const loc = I18N.pack(p.id);

      const card = document.createElement('button');
      card.className = 'pack-card';
      card.innerHTML = `
        <div class="pack-badge" style="background:${p.accent}">${p.size}×${p.size}</div>
        <div class="pack-info">
          <div class="pack-name">${loc.name}</div>
          <div class="pack-desc">${loc.desc}</div>
          <div class="pack-bar-bg">
            <div class="pack-bar-fill" style="width:${pct}%;background:${p.accent}"></div>
          </div>
        </div>
        <div class="pack-right">
          <span>${solvedCount}/${p.count}</span>
          <span style="color:#ffe249;font-size:12px;">&#9733; ${starsCount}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        SoundFX.unlock();
        SoundFX.tap();
        openPack(p.id);
      });
      els.packsGrid.appendChild(card);
    }
  }

  function openPack(packId) {
    currentPackId = packId;
    const pack = LevelGenerator.getPack(packId);
    const loc = I18N.pack(packId);

    let solvedCount = 0;
    els.levelsGrid.innerHTML = '';
    for (let i = 0; i < pack.count; i++) {
      const rec = saveState.solved[`${packId}:${i}`];
      if (rec) solvedCount++;

      const tile = document.createElement('button');
      tile.className = 'level-tile';
      if (rec) tile.classList.add(rec.stars === 3 ? 'perfect' : 'solved');
      tile.innerHTML = `
        <span class="level-num">${i + 1}</span>
        <span class="level-stars">${rec ? '&#9733;'.repeat(rec.stars) : ''}</span>
      `;
      tile.addEventListener('click', () => {
        SoundFX.unlock();
        SoundFX.tap();
        returnScreen = 'levels';
        startLevel(packId, i, 'level');
      });
      els.levelsGrid.appendChild(tile);
    }

    els.levelsPackTitle.textContent = loc.name.toUpperCase();
    els.levelsPackProgress.textContent = `${solvedCount} / ${pack.count}`;
    showScreen('levels');
  }

  function renderDotPreviewCanvas(skinId) {
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 120;
    c.style.width = '100%';
    c.style.height = '100%';
    const ctx = c.getContext('2d');
    ShopCatalog.drawDotShape(ctx, skinId, 58, 48, 25, '#FF1744', 'rgba(255,255,255,0.9)');
    ShopCatalog.drawDotShape(ctx, skinId, 102, 48, 25, '#FFE600', 'rgba(255,255,255,0.9)');
    ShopCatalog.drawDotShape(ctx, skinId, 80, 74, 25, '#2979FF', 'rgba(255,255,255,0.9)');
    return c;
  }

  function renderShop() {
    syncCurrencies();
    els.tabDots.classList.toggle('active', shopTab === 'dots');
    els.tabBgs.classList.toggle('active', shopTab === 'bgs');
    els.shopGrid.innerHTML = '';

    const isVi = I18N.getLanguage() === 'vi';
    const items = shopTab === 'dots' ? ShopCatalog.DOT_SKINS : ShopCatalog.BACKGROUNDS;
    const ownedList = shopTab === 'dots' ? saveState.ownedDots : saveState.ownedBgs;
    const equippedId = shopTab === 'dots' ? saveState.equippedDot : saveState.equippedBg;

    for (const item of items) {
      const owned = ownedList.includes(item.id);
      const equipped = equippedId === item.id;
      const canAfford = item.currency === 'gems' ? saveState.gems >= item.price : saveState.coins >= item.price;

      const card = document.createElement('div');
      card.className = 'shop-item-card';

      const prev = document.createElement('div');
      prev.className = 'shop-preview';
      if (shopTab === 'dots') {
        prev.appendChild(renderDotPreviewCanvas(item.id));
      } else {
        prev.style.background = item.previewCss;
      }

      const nameEl = document.createElement('div');
      nameEl.className = 'shop-item-name';
      nameEl.textContent = isVi ? item.nameVi : item.nameEn;

      const btn = document.createElement('button');
      btn.className = 'shop-buy-btn';

      if (equipped) {
        btn.classList.add('used-btn');
        btn.innerHTML = `&#10004; ${I18N.t('used')}`;
      } else if (owned) {
        btn.classList.add('equip-btn');
        btn.textContent = I18N.t('use');
        btn.addEventListener('click', () => {
          SoundFX.tap();
          if (shopTab === 'dots') saveState.equippedDot = item.id;
          else saveState.equippedBg = item.id;
          game.setCosmetics(saveState.equippedDot, saveState.equippedBg);
          YTSDK.saveData(saveState);
          renderShop();
        });
      } else {
        const iconHtml = item.currency === 'gems'
          ? '<span class="curr-gem mini-g">&#9670;</span>'
          : '<span class="curr-coin mini-c">$</span>';
        btn.innerHTML = `${iconHtml} ${item.price}`;
        btn.disabled = !canAfford;
        btn.addEventListener('click', () => {
          if (!canAfford) return;
          SoundFX.connect();
          if (item.currency === 'gems') saveState.gems -= item.price;
          else saveState.coins -= item.price;
          ownedList.push(item.id);
          if (shopTab === 'dots') saveState.equippedDot = item.id;
          else saveState.equippedBg = item.id;
          game.setCosmetics(saveState.equippedDot, saveState.equippedBg);
          YTSDK.saveData(saveState);
          renderShop();
        });
      }

      card.appendChild(prev);
      card.appendChild(nameEl);
      card.appendChild(btn);
      els.shopGrid.appendChild(card);
    }
  }

  function renderGoals() {
    const stats = getStatsForGoals();
    const isVi = I18N.getLanguage() === 'vi';
    els.goalsList.innerHTML = '';

    for (const g of ShopCatalog.GOALS) {
      const cur = Math.min(g.target, stats[g.metric] || 0);
      const pct = Math.round((cur / g.target) * 100);
      const claimed = saveState.claimedGoals.includes(g.id);
      const ready = !claimed && cur >= g.target;

      const rewardIcon = g.rewardType === 'gems' ? '&#9670;' : (g.rewardType === 'hints' ? '&#128161;' : '$');

      const card = document.createElement('div');
      card.className = 'goal-card';
      card.innerHTML = `
        <div class="goal-info">
          <div class="goal-title">${isVi ? g.vi : g.en}</div>
          <div class="goal-bar-bg"><div class="goal-bar-fill" style="width:${pct}%"></div></div>
          <div class="goal-prog-txt">${cur} / ${g.target} &nbsp;•&nbsp; +${g.rewardAmt} ${rewardIcon}</div>
        </div>
      `;

      const btn = document.createElement('button');
      btn.className = 'goal-claim-btn';
      if (claimed) {
        btn.classList.add('claimed');
        btn.textContent = I18N.t('claimed');
      } else if (ready) {
        btn.textContent = I18N.t('claim');
        btn.addEventListener('click', () => {
          SoundFX.win();
          saveState.claimedGoals.push(g.id);
          if (g.rewardType === 'coins') saveState.coins += g.rewardAmt;
          else if (g.rewardType === 'gems') saveState.gems += g.rewardAmt;
          else if (g.rewardType === 'hints') saveState.hints += g.rewardAmt;
          YTSDK.saveData(saveState);
          renderGoals();
          renderHome();
        });
      } else {
        btn.classList.add('locked');
        btn.textContent = `${cur}/${g.target}`;
      }

      card.appendChild(btn);
      els.goalsList.appendChild(card);
    }
  }

  function startLevel(packId, levelIndex, mode) {
    currentPackId = packId;
    currentLevelIndex = levelIndex;
    playMode = mode || 'level';

    let puzzle;
    let titleStr;
    if (playMode === 'daily') {
      const d = LevelGenerator.getDailyPuzzle();
      puzzle = d.puzzle;
      titleStr = I18N.t('dailyTitle');
    } else if (playMode === 'random') {
      puzzle = LevelGenerator.getRandomLevel(packId);
      titleStr = I18N.t('randomLevel');
    } else {
      puzzle = LevelGenerator.getLevel(packId, levelIndex);
      const packIdx = Math.max(0, LevelGenerator.PACKS.findIndex((p) => p.id === packId));
      const displayNum = returnScreen === 'home' ? (packIdx * 20 + levelIndex + 1) : (levelIndex + 1);
      titleStr = `${I18N.t('level')} ${displayNum}`;
      saveState.lastPack = packId;
      saveState.lastLevel = levelIndex;
      YTSDK.saveData(saveState);
    }

    syncCurrencies();
    game.setCosmetics(saveState.equippedDot, saveState.equippedBg);
    els.playLevelTitle.textContent = titleStr;
    els.playGridBadge.textContent = `${puzzle.size}×${puzzle.size}`;
    els.modalWin.classList.add('hidden');
    showScreen('play');
    game.loadPuzzle(puzzle);

    if (playMode === 'level' && packId === '5x5' && levelIndex === 0 && !saveState.solved['5x5:0']) {
      els.tutorialToast.textContent = I18N.t('tutorialDrag');
      els.tutorialToast.classList.remove('hidden');
    } else {
      els.tutorialToast.classList.add('hidden');
    }
  }

  function handleMetrics(m) {
    els.metricFlows.textContent = `${m.completedFlows}/${m.totalFlows}`;
    els.metricPipe.textContent = `${m.pipePct}%`;
    els.btnUndo.disabled = !m.canUndo;

    if (m.allConnectedButNotFull) {
      els.tutorialToast.textContent = I18N.t('tutorialFill');
      els.tutorialToast.classList.remove('hidden');
    } else if (m.completedFlows > 0) {
      els.tutorialToast.classList.add('hidden');
    }
  }

  function handleWin(result) {
    let coinReward = result.perfect ? 20 : 12;
    let gemReward = 0;

    if (playMode === 'daily') {
      const d = LevelGenerator.getDailyPuzzle();
      if (!saveState.dailySolvedDates.includes(d.dateKey)) {
        saveState.dailySolvedDates.push(d.dateKey);
        coinReward = 40;
        gemReward = 5;
      }
    } else if (playMode === 'random') {
      saveState.randomSolved = (saveState.randomSolved || 0) + 1;
      saveState.chestProgress = Math.min(CHEST_STEP, (saveState.chestProgress || 0) + 1);
    } else {
      const key = `${currentPackId}:${currentLevelIndex}`;
      const isFirstClear = !saveState.solved[key];
      const prev = saveState.solved[key];
      saveState.solved[key] = {
        stars: prev ? Math.max(prev.stars, result.stars) : result.stars,
        bestMoves: prev ? Math.min(prev.bestMoves, result.moves) : result.moves
      };
      if (isFirstClear) {
        saveState.chestProgress = Math.min(CHEST_STEP, (saveState.chestProgress || 0) + 1);
      } else {
        coinReward = 5;
      }

      const pack = LevelGenerator.getPack(currentPackId);
      if (currentLevelIndex + 1 < pack.count) {
        saveState.lastPack = currentPackId;
        saveState.lastLevel = currentLevelIndex + 1;
      } else {
        const pIdx = LevelGenerator.PACKS.findIndex((p) => p.id === currentPackId);
        if (pIdx >= 0 && pIdx + 1 < LevelGenerator.PACKS.length) {
          saveState.lastPack = LevelGenerator.PACKS[pIdx + 1].id;
          saveState.lastLevel = 0;
        }
      }
    }

    saveState.coins += coinReward;
    saveState.gems += gemReward;
    syncCurrencies();
    YTSDK.saveData(saveState);
    YTSDK.sendScore(getTotalScore());

    const starNodes = els.winStars.querySelectorAll('.win-star');
    starNodes.forEach((node, idx) => node.classList.toggle('lit', idx < result.stars));
    els.winTitle.textContent = result.perfect ? I18N.t('perfect') : I18N.t('levelComplete');
    els.winDesc.textContent = I18N.t('completedInMoves', result.moves);

    let rewHtml = `<span class="reward-chip"><span class="curr-coin mini-c">$</span> +${coinReward}</span>`;
    if (gemReward > 0) {
      rewHtml += `<span class="reward-chip"><span class="curr-gem mini-g">&#9670;</span> +${gemReward}</span>`;
    }
    els.winRewards.innerHTML = rewHtml;
    els.btnWinNext.textContent = playMode === 'random' ? I18N.t('newRandom') : (playMode === 'daily' ? I18N.t('navMain') : I18N.t('nextLevel'));

    els.modalWin.classList.remove('hidden');
  }

  function goToNextLevel() {
    if (playMode === 'daily') {
      renderHome();
      showScreen('home');
      return;
    }
    if (playMode === 'random') {
      startLevel(currentPackId, 0, 'random');
      return;
    }
    const pack = LevelGenerator.getPack(currentPackId);
    if (currentLevelIndex + 1 < pack.count) {
      startLevel(currentPackId, currentLevelIndex + 1, 'level');
    } else {
      const pIdx = LevelGenerator.PACKS.findIndex((p) => p.id === currentPackId);
      if (pIdx >= 0 && pIdx + 1 < LevelGenerator.PACKS.length) {
        startLevel(LevelGenerator.PACKS[pIdx + 1].id, 0, 'level');
      } else {
        renderHome();
        showScreen('home');
      }
    }
  }

  function bindUIEvents() {
    els.btnSoundHome.addEventListener('click', toggleSound);
    els.btnSoundPlay.addEventListener('click', toggleSound);

    els.btnOpenChest.addEventListener('click', () => {
      if ((saveState.chestProgress || 0) < CHEST_STEP) return;
      SoundFX.unlock();
      SoundFX.win();
      els.modalChest.classList.remove('hidden');
    });

    els.btnChestClaim.addEventListener('click', () => {
      SoundFX.tap();
      saveState.chestProgress = 0;
      saveState.coins += 50;
      saveState.gems += 5;
      saveState.hints += 1;
      els.modalChest.classList.add('hidden');
      YTSDK.saveData(saveState);
      renderHome();
    });

    els.btnDailyPlay.addEventListener('click', () => {
      SoundFX.unlock();
      SoundFX.tap();
      returnScreen = 'home';
      startLevel('7x7', 0, 'daily');
    });

    els.btnQuickPlay.addEventListener('click', () => {
      SoundFX.unlock();
      SoundFX.tap();
      returnScreen = 'home';
      startLevel(saveState.lastPack, saveState.lastLevel, 'level');
    });

    els.btnFreePlay.addEventListener('click', () => {
      SoundFX.unlock();
      SoundFX.tap();
      renderPacks();
      showScreen('packs');
    });

    // Bottom Navigation
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        SoundFX.unlock();
        SoundFX.tap();
        const tab = btn.dataset.tab;
        if (tab === 'home') {
          renderHome();
          showScreen('home');
        } else if (tab === 'daily') {
          returnScreen = 'home';
          startLevel('7x7', 0, 'daily');
        } else if (tab === 'shop') {
          renderShop();
          showScreen('shop');
        } else if (tab === 'goals') {
          renderGoals();
          showScreen('goals');
        }
      });
    });

    els.btnPacksBack.addEventListener('click', () => { SoundFX.tap(); renderHome(); showScreen('home'); });
    els.btnLevelsBack.addEventListener('click', () => { SoundFX.tap(); renderPacks(); showScreen('packs'); });
    els.btnRandomLevel.addEventListener('click', () => {
      SoundFX.unlock();
      SoundFX.tap();
      returnScreen = 'levels';
      startLevel(currentPackId, 0, 'random');
    });

    els.btnShopBack.addEventListener('click', () => { SoundFX.tap(); renderHome(); showScreen('home'); });
    els.tabDots.addEventListener('click', () => { SoundFX.tap(); shopTab = 'dots'; renderShop(); });
    els.tabBgs.addEventListener('click', () => { SoundFX.tap(); shopTab = 'bgs'; renderShop(); });
    els.btnBuyHints.addEventListener('click', () => {
      if (saveState.coins < 50) return;
      SoundFX.connect();
      saveState.coins -= 50;
      saveState.hints += 3;
      YTSDK.saveData(saveState);
      renderShop();
    });

    els.btnGoalsBack.addEventListener('click', () => { SoundFX.tap(); renderHome(); showScreen('home'); });

    els.btnPlayBack.addEventListener('click', () => {
      SoundFX.tap();
      if (returnScreen === 'levels') openPack(currentPackId);
      else { renderHome(); showScreen('home'); }
    });

    els.btnReset.addEventListener('click', () => game.reset());
    els.btnUndo.addEventListener('click', () => game.undo());
    els.btnHint.addEventListener('click', () => {
      if (saveState.hints <= 0) {
        els.tutorialToast.textContent = I18N.t('noHints');
        els.tutorialToast.classList.remove('hidden');
        setTimeout(() => els.tutorialToast.classList.add('hidden'), 2200);
        return;
      }
      if (game.hint()) {
        saveState.hints = Math.max(0, saveState.hints - 1);
        syncCurrencies();
        YTSDK.saveData(saveState);
      }
    });

    els.btnWinReplay.addEventListener('click', () => {
      SoundFX.tap();
      els.modalWin.classList.add('hidden');
      game.reset();
    });
    els.btnWinNext.addEventListener('click', () => {
      SoundFX.tap();
      els.modalWin.classList.add('hidden');
      goToNextLevel();
    });

    els.btnResume.addEventListener('click', () => {
      SoundFX.unlock();
      SoundFX.setPaused(false);
      if (game) game.setPaused(false);
      els.modalPause.classList.add('hidden');
    });

    global.addEventListener('resize', () => { if (game) game.resize(); });

    global.addEventListener('keydown', (e) => {
      if (!screens.play.classList.contains('active')) return;
      if (!els.modalWin.classList.contains('hidden') || !els.modalPause.classList.contains('hidden')) return;
      const k = e.key.toLowerCase();
      if (k === 'z') game.undo();
      else if (k === 'r') game.reset();
      else if (k === 'h') els.btnHint.click();
    });
  }

  async function init() {
    game = new ConnectDotGame(els.canvas, {
      onMetrics: handleMetrics,
      onWin: handleWin
    });

    bindUIEvents();

    SoundFX.setPlatformEnabled(YTSDK.isAudioEnabled());
    YTSDK.onAudioEnabledChange((enabled) => {
      SoundFX.setPlatformEnabled(enabled);
      updateSoundIcons();
    });

    YTSDK.onPause(() => {
      SoundFX.setPaused(true);
      if (game) game.setPaused(true);
      els.modalPause.classList.remove('hidden');
    });

    YTSDK.onResume(() => {
      SoundFX.setPaused(false);
      if (game) game.setPaused(false);
      els.modalPause.classList.add('hidden');
    });

    requestAnimationFrame(() => YTSDK.firstFrameReady());

    const [lang, loadedSave] = await Promise.all([
      YTSDK.getLanguage(),
      YTSDK.loadData()
    ]);

    I18N.setLanguage(lang);
    if (loadedSave && typeof loadedSave === 'object') {
      saveState = Object.assign(saveState, loadedSave);
    }

    game.setCosmetics(saveState.equippedDot, saveState.equippedBg);
    SoundFX.setUserEnabled(saveState.soundOn !== false);
    applyLocalization();
    updateSoundIcons();
    renderHome();
    showScreen('home');

    YTSDK.gameReady();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
