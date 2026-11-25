/**
 * Connect Dot Level Generator (with Hatched Blocked Cells, Campaign Levels & Daily Puzzle)
 * - Guarantees 100% playable-cell fill solvability
 * - Level 1 of 5x5 matches the classic reference layout
 * - Higher levels & Campaign levels include stylish diagonal-hatched corner obstacles!
 */
(function (global) {
  'use strict';

  const PALETTE = [
    { id: 0, name: 'Yellow', hex: '#FFE600', glow: 'rgba(255, 230, 0, 0.85)',  tint: 'rgba(255, 230, 0, 0.22)' },
    { id: 1, name: 'Blue',   hex: '#2979FF', glow: 'rgba(41, 121, 255, 0.85)', tint: 'rgba(41, 121, 255, 0.24)' },
    { id: 2, name: 'Red',    hex: '#FF1744', glow: 'rgba(255, 23, 68, 0.85)',  tint: 'rgba(255, 23, 68, 0.24)' },
    { id: 3, name: 'Orange', hex: '#FF8A00', glow: 'rgba(255, 138, 0, 0.85)',  tint: 'rgba(255, 138, 0, 0.24)' },
    { id: 4, name: 'Green',  hex: '#00E65B', glow: 'rgba(0, 230, 91, 0.85)',   tint: 'rgba(0, 230, 91, 0.22)' },
    { id: 5, name: 'Cyan',   hex: '#00E5FF', glow: 'rgba(0, 229, 255, 0.85)',  tint: 'rgba(0, 229, 255, 0.22)' },
    { id: 6, name: 'Purple', hex: '#C84BFF', glow: 'rgba(200, 75, 255, 0.85)', tint: 'rgba(200, 75, 255, 0.24)' },
    { id: 7, name: 'Pink',   hex: '#FF2E93', glow: 'rgba(255, 46, 147, 0.85)', tint: 'rgba(255, 46, 147, 0.24)' },
    { id: 8, name: 'Lime',   hex: '#B2FF59', glow: 'rgba(178, 255, 89, 0.85)', tint: 'rgba(178, 255, 89, 0.20)' },
    { id: 9, name: 'Coral',  hex: '#FF7043', glow: 'rgba(255, 112, 67, 0.85)', tint: 'rgba(255, 112, 67, 0.22)' },
    { id: 10, name: 'Teal',  hex: '#1DE9B6', glow: 'rgba(29, 233, 182, 0.85)', tint: 'rgba(29, 233, 182, 0.22)' },
    { id: 11, name: 'Ice',   hex: '#DCE6FF', glow: 'rgba(220, 230, 255, 0.85)',tint: 'rgba(220, 230, 255, 0.20)' }
  ];

  const PACKS = [
    { id: '5x5', size: 5, count: 20, minColors: 4, maxColors: 5, accent: '#00E65B', seedBase: 5001, allowObstacles: false },
    { id: '6x6', size: 6, count: 20, minColors: 5, maxColors: 6, accent: '#2979FF', seedBase: 6001, allowObstacles: true },
    { id: '7x7', size: 7, count: 20, minColors: 6, maxColors: 7, accent: '#FFE600', seedBase: 7001, allowObstacles: true },
    { id: '8x8', size: 8, count: 20, minColors: 7, maxColors: 8, accent: '#FF8A00', seedBase: 8001, allowObstacles: true },
    { id: '9x9', size: 9, count: 20, minColors: 8, maxColors: 10, accent: '#FF2E93', seedBase: 9001, allowObstacles: true }
  ];

  // Curated Level 1 (5x5) matching the iconic reference design
  const CURATED_LEVELS = {
    '5x5:0': {
      size: 5,
      blocked: [],
      solutions: [
        [[0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2]], // Yellow
        [[0, 2], [0, 3], [0, 4]],                                 // Blue
        [[1, 2], [1, 3], [1, 4], [2, 4]],                         // Red
        [[1, 1], [2, 1], [2, 2], [2, 3], [3, 3]],                 // Orange
        [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [3, 4]]          // Green
      ]
    }
  };

  function createRNG(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function manhattan(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }

  /**
   * Generates a randomized Hamiltonian path on size x size grid via Backbite,
   * optionally trimming 2..4 corner cells from the path ends to form hatched obstacles!
   * Trimming from the ends of a Hamiltonian path guarantees the remaining cells
   * ALWAYS form a valid 100% fillable Hamiltonian path.
   */
  function generateHamiltonianPath(size, rng) {
    const total = size * size;
    const path = [];
    for (let y = 0; y < size; y++) {
      if (y % 2 === 0) {
        for (let x = 0; x < size; x++) path.push(y * size + x);
      } else {
        for (let x = size - 1; x >= 0; x--) path.push(y * size + x);
      }
    }

    const pos = new Int32Array(total);
    for (let i = 0; i < total; i++) pos[path[i]] = i;

    const iterations = total * 14;
    for (let step = 0; step < iterations; step++) {
      const fromEnd = rng() < 0.5;
      const tipCell = fromEnd ? path[total - 1] : path[0];
      const tx = tipCell % size;
      const ty = (tipCell / size) | 0;

      const neighbors = [];
      if (tx > 0) neighbors.push(tipCell - 1);
      if (tx < size - 1) neighbors.push(tipCell + 1);
      if (ty > 0) neighbors.push(tipCell - size);
      if (ty < size - 1) neighbors.push(tipCell + size);

      const chosen = neighbors[(rng() * neighbors.length) | 0];
      const idx = pos[chosen];

      if (fromEnd) {
        if (idx >= total - 2) continue;
        let l = idx + 1;
        let r = total - 1;
        while (l < r) {
          const tmp = path[l];
          path[l] = path[r];
          path[r] = tmp;
          pos[path[l]] = l;
          pos[path[r]] = r;
          l++;
          r--;
        }
      } else {
        if (idx <= 1) continue;
        let l = 0;
        let r = idx - 1;
        while (l < r) {
          const tmp = path[l];
          path[l] = path[r];
          path[r] = tmp;
          pos[path[l]] = l;
          pos[path[r]] = r;
          l++;
          r--;
        }
      }
    }

    return path.map((cell) => [cell % size, (cell / size) | 0]);
  }

  function isEdgeCell(cell, size) {
    return cell[0] === 0 || cell[0] === size - 1 || cell[1] === 0 || cell[1] === size - 1;
  }

  /**
   * Carve stylish hatched obstacle cells from the ends of the Hamiltonian path
   * (only if those end cells lie on the outer border, so obstacles look clean like the reference!)
   */
  function carveObstacles(hamPath, size, wantObstacles, rng) {
    if (!wantObstacles || size < 6) {
      return { path: hamPath, blocked: [] };
    }
    const blocked = [];
    let startIdx = 0;
    let endIdx = hamPath.length - 1;

    const maxTrimStart = 1 + Math.floor(rng() * 3); // 1..3 cells
    for (let i = 0; i < maxTrimStart; i++) {
      if (isEdgeCell(hamPath[startIdx], size) && endIdx - startIdx > size * 3) {
        blocked.push(hamPath[startIdx]);
        startIdx++;
      } else {
        break;
      }
    }

    const maxTrimEnd = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < maxTrimEnd; i++) {
      if (isEdgeCell(hamPath[endIdx], size) && endIdx - startIdx > size * 3) {
        blocked.push(hamPath[endIdx]);
        endIdx--;
      } else {
        break;
      }
    }

    return {
      path: hamPath.slice(startIdx, endIdx + 1),
      blocked
    };
  }

  function countTurns(seg) {
    let turns = 0;
    for (let i = 1; i < seg.length - 1; i++) {
      const dx1 = seg[i][0] - seg[i - 1][0];
      const dy1 = seg[i][1] - seg[i - 1][1];
      const dx2 = seg[i + 1][0] - seg[i][0];
      const dy2 = seg[i + 1][1] - seg[i][1];
      if (dx1 !== dx2 || dy1 !== dy2) turns++;
    }
    return turns;
  }

  function scoreSegments(segments) {
    let score = 0;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const dist = manhattan(seg[0], seg[seg.length - 1]);
      const turns = countTurns(seg);
      if (dist <= 1) score -= 50;
      else score += Math.min(dist, 5) * 4;
      score += Math.min(turns, 5) * 5;
      if (seg.length >= 4) score += 4;
    }
    return score;
  }

  function partitionPath(path, numColors, rng) {
    const total = path.length;
    const minLen = 3;
    const extra = total - numColors * minLen;
    if (extra < 0) return null;

    const lengths = new Array(numColors).fill(minLen);
    for (let i = 0; i < extra; i++) {
      const maxAllowed = Math.max(minLen + 2, Math.ceil((total / numColors) * 1.85));
      let idx = (rng() * numColors) | 0;
      for (let tries = 0; tries < 5 && lengths[idx] >= maxAllowed; tries++) {
        idx = (rng() * numColors) | 0;
      }
      lengths[idx]++;
    }

    const segments = [];
    let cursor = 0;
    for (let i = 0; i < numColors; i++) {
      segments.push(path.slice(cursor, cursor + lengths[i]));
      cursor += lengths[i];
    }
    return segments;
  }

  function buildPuzzle(size, solutions, blocked) {
    const pairs = solutions.map((sol, idx) => ({
      colorId: idx,
      color: PALETTE[idx % PALETTE.length],
      start: sol[0],
      end: sol[sol.length - 1],
      solution: sol
    }));
    return {
      size,
      blocked: blocked || [],
      pairs
    };
  }

  function generatePuzzle(size, minColors, maxColors, seed, wantObstacles) {
    const rng = createRNG(seed);
    let bestSegments = null;
    let bestBlocked = [];
    let bestScore = -Infinity;

    for (let c = 0; c < 18; c++) {
      const rawHam = generateHamiltonianPath(size, rng);
      const carved = carveObstacles(rawHam, size, wantObstacles, rng);
      const numColors = minColors + Math.floor(rng() * (maxColors - minColors + 1));

      for (let p = 0; p < 6; p++) {
        const segs = partitionPath(carved.path, numColors, rng);
        if (!segs) continue;
        let sc = scoreSegments(segs);
        if (wantObstacles && carved.blocked.length >= 2) sc += 12;
        if (sc > bestScore) {
          bestScore = sc;
          bestSegments = segs;
          bestBlocked = carved.blocked;
        }
      }
    }

    return buildPuzzle(size, bestSegments, bestBlocked);
  }

  const levelCache = {};

  const LevelGenerator = {
    PALETTE,
    PACKS,

    getPack(packId) {
      return PACKS.find((p) => p.id === packId) || PACKS[0];
    },

    getLevel(packId, levelIndex) {
      const key = `${packId}:${levelIndex}`;
      if (levelCache[key]) return levelCache[key];

      if (CURATED_LEVELS[key]) {
        const cur = CURATED_LEVELS[key];
        const puzzle = buildPuzzle(cur.size, cur.solutions, cur.blocked);
        levelCache[key] = puzzle;
        return puzzle;
      }

      const pack = this.getPack(packId);
      const seed = pack.seedBase + levelIndex * 7919 + pack.size * 313;
      // Add hatched obstacles on every 2nd/3rd level in 6x6+ packs for variety
      const wantObs = pack.allowObstacles && (levelIndex % 2 === 1);
      const puzzle = generatePuzzle(pack.size, pack.minColors, pack.maxColors, seed, wantObs);
      levelCache[key] = puzzle;
      return puzzle;
    },

    getRandomLevel(packId) {
      const pack = this.getPack(packId);
      const seed = (Date.now() ^ Math.floor(Math.random() * 0xFFFFFF)) >>> 0;
      const wantObs = pack.allowObstacles && Math.random() < 0.5;
      return generatePuzzle(pack.size, pack.minColors, pack.maxColors, seed, wantObs);
    },

    /**
     * Daily Puzzle seeded by current YYYY-MM-DD date (7x7 with hatched obstacles)
     */
    getDailyPuzzle() {
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const cacheKey = `daily:${dateKey}`;
      if (levelCache[cacheKey]) return { dateKey, puzzle: levelCache[cacheKey] };

      const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + 424242;
      const puzzle = generatePuzzle(7, 6, 7, seed, true);
      levelCache[cacheKey] = puzzle;
      return { dateKey, puzzle };
    }
  };

  global.LevelGenerator = LevelGenerator;
})(window);
