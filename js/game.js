/**
 * Connect Dot Canvas Engine (Neon Laser Edition)
 * - White-hot glowing laser beams + colored neon cell fills (matching reference)
 * - Diagonal-hatched blocked cells
 * - Custom Dot Skins & Board Backgrounds from ShopCatalog
 * - Smooth drag, backtrack, fast-swipe interpolation, pipe cutting, Undo, Smart Hint
 */
(function (global) {
  'use strict';

  class ConnectDotGame {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.callbacks = callbacks || {};

      this.puzzle = null;
      this.size = 5;
      this.cellSize = 60;
      this.boardPx = 300;
      this.dpr = Math.min(global.devicePixelRatio || 1, 2);

      this.dotSkin = 'circle';
      this.bgTheme = global.ShopCatalog ? global.ShopCatalog.getBg('midnight') : {
        boardBg: '#0e0b1a',
        gridColor: 'rgba(138, 106, 214, 0.42)',
        hatchColor: 'rgba(138, 106, 214, 0.45)'
      };

      this.paths = new Map();
      this.endpoints = new Map();
      this.blockedSet = new Set();

      this.isDragging = false;
      this.activeColor = null;
      this.pointerPos = null;
      this.lastMovedColor = null;
      this.dragChangedBoard = false;
      this.dragSnapshot = null;

      this.moves = 0;
      this.usedHint = false;
      this.history = [];
      this.won = false;
      this.paused = false;

      this.particles = [];
      this.pulseTime = 0;
      this.lastFrameTs = 0;

      this._bindEvents();
      this._startLoop();
    }

    setCosmetics(dotSkinId, bgId) {
      this.dotSkin = dotSkinId || 'circle';
      if (global.ShopCatalog) {
        this.bgTheme = global.ShopCatalog.getBg(bgId || 'midnight');
      }
    }

    _bindEvents() {
      this.canvas.addEventListener('pointerdown', (e) => this._onPointerDown(e));
      global.addEventListener('pointermove', (e) => this._onPointerMove(e));
      global.addEventListener('pointerup', (e) => this._onPointerUp(e));
      global.addEventListener('pointercancel', (e) => this._onPointerUp(e));
    }

    setPaused(isPaused) {
      this.paused = Boolean(isPaused);
      if (this.paused) {
        this.isDragging = false;
        this.activeColor = null;
        this.pointerPos = null;
      }
    }

    loadPuzzle(puzzle) {
      this.puzzle = puzzle;
      this.size = puzzle.size;
      this.paths.clear();
      this.endpoints.clear();
      this.blockedSet.clear();
      this.particles = [];
      this.history = [];
      this.moves = 0;
      this.usedHint = false;
      this.lastMovedColor = null;
      this.won = false;
      this.isDragging = false;
      this.activeColor = null;
      this.pointerPos = null;

      if (puzzle.blocked) {
        for (const b of puzzle.blocked) {
          this.blockedSet.add(this._key(b[0], b[1]));
        }
      }

      for (const pair of puzzle.pairs) {
        this.paths.set(pair.colorId, []);
        this.endpoints.set(this._key(pair.start[0], pair.start[1]), pair.colorId);
        this.endpoints.set(this._key(pair.end[0], pair.end[1]), pair.colorId);
      }

      this.resize();
      this._emitMetrics();
    }

    resize() {
      const stage = this.canvas.parentElement ? this.canvas.parentElement.parentElement : null;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const maxDim = Math.max(200, Math.min(rect.width - 8, rect.height - 8, 460));
      const cellPx = Math.floor(maxDim / this.size);
      this.cellSize = cellPx;
      this.boardPx = cellPx * this.size;

      this.dpr = Math.min(global.devicePixelRatio || 1, 2);
      this.canvas.style.width = `${this.boardPx}px`;
      this.canvas.style.height = `${this.boardPx}px`;
      this.canvas.width = Math.round(this.boardPx * this.dpr);
      this.canvas.height = Math.round(this.boardPx * this.dpr);
    }

    _key(x, y) { return `${x},${y}`; }
    _sameCell(a, b) { return a[0] === b[0] && a[1] === b[1]; }
    _getPair(colorId) { return this.puzzle.pairs.find((p) => p.colorId === colorId); }

    _isPathComplete(colorId) {
      const path = this.paths.get(colorId);
      if (!path || path.length < 2) return false;
      const pair = this._getPair(colorId);
      const first = path[0];
      const last = path[path.length - 1];
      return (
        (this._sameCell(first, pair.start) && this._sameCell(last, pair.end)) ||
        (this._sameCell(first, pair.end) && this._sameCell(last, pair.start))
      );
    }

    _findPathOwnerAt(x, y) {
      for (const [colorId, path] of this.paths.entries()) {
        for (let i = 0; i < path.length; i++) {
          if (path[i][0] === x && path[i][1] === y) return { colorId, index: i };
        }
      }
      return null;
    }

    _clonePaths() {
      const clone = new Map();
      for (const [k, v] of this.paths.entries()) {
        clone.set(k, v.map((c) => [c[0], c[1]]));
      }
      return clone;
    }

    _pushSnapshot(snapshot) {
      this.history.push({ paths: snapshot, moves: this.moves, lastMovedColor: this.lastMovedColor });
      if (this.history.length > 60) this.history.shift();
    }

    undo() {
      if (this.won || this.history.length === 0) return false;
      const prev = this.history.pop();
      this.paths = prev.paths;
      this.moves = prev.moves;
      this.lastMovedColor = prev.lastMovedColor;
      if (global.SoundFX) global.SoundFX.undo();
      this._emitMetrics();
      return true;
    }

    reset() {
      if (!this.puzzle) return;
      if (this._getFilledCellCount() > 0 && !this.won) {
        this._pushSnapshot(this._clonePaths());
      }
      for (const pair of this.puzzle.pairs) {
        this.paths.set(pair.colorId, []);
      }
      this.moves = 0;
      this.lastMovedColor = null;
      this.won = false;
      this.isDragging = false;
      this.activeColor = null;
      if (global.SoundFX) global.SoundFX.undo();
      this._emitMetrics();
    }

    hint() {
      if (!this.puzzle || this.won) return false;
      let targetPair = null;
      for (const pair of this.puzzle.pairs) {
        if (!this._isPathComplete(pair.colorId)) { targetPair = pair; break; }
      }
      if (!targetPair) {
        for (const pair of this.puzzle.pairs) {
          const cur = this.paths.get(pair.colorId) || [];
          if (cur.length !== pair.solution.length) { targetPair = pair; break; }
        }
      }
      if (!targetPair) targetPair = this.puzzle.pairs[0];

      this._pushSnapshot(this._clonePaths());
      this.usedHint = true;

      const solSet = new Set(targetPair.solution.map((c) => this._key(c[0], c[1])));
      for (const [cid, path] of this.paths.entries()) {
        if (cid === targetPair.colorId) continue;
        const hitIdx = path.findIndex((c) => solSet.has(this._key(c[0], c[1])));
        if (hitIdx !== -1) {
          this.paths.set(cid, hitIdx <= 1 ? [] : path.slice(0, hitIdx));
        }
      }

      this.paths.set(targetPair.colorId, targetPair.solution.map((c) => [c[0], c[1]]));
      this.moves++;
      this.lastMovedColor = targetPair.colorId;

      this._spawnBurst(targetPair.start[0], targetPair.start[1], targetPair.color.hex, 14);
      this._spawnBurst(targetPair.end[0], targetPair.end[1], targetPair.color.hex, 14);

      if (global.SoundFX) global.SoundFX.hint();
      this._emitMetrics();
      this._checkWin();
      return true;
    }

    _eventToCell(e) {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const x = Math.floor(px / this.cellSize);
      const y = Math.floor(py / this.cellSize);
      return { x, y, px, py, inBounds: x >= 0 && x < this.size && y >= 0 && y < this.size };
    }

    _onPointerDown(e) {
      if (this.paused || this.won || !this.puzzle) return;
      if (global.SoundFX) global.SoundFX.unlock();

      const info = this._eventToCell(e);
      if (!info.inBounds) return;
      const k = this._key(info.x, info.y);
      if (this.blockedSet.has(k)) return;

      e.preventDefault();
      if (this.canvas.setPointerCapture) {
        try { this.canvas.setPointerCapture(e.pointerId); } catch (_) {}
      }

      const epColor = this.endpoints.get(k);
      if (epColor !== undefined) {
        this.dragSnapshot = this._clonePaths();
        this.dragChangedBoard = (this.paths.get(epColor) || []).length > 0;
        this.activeColor = epColor;
        this.paths.set(epColor, [[info.x, info.y]]);
        this.isDragging = true;
        this.pointerPos = { x: info.px, y: info.py };
        if (global.SoundFX) global.SoundFX.tap();
        this._emitMetrics();
        return;
      }

      const owner = this._findPathOwnerAt(info.x, info.y);
      if (owner) {
        this.dragSnapshot = this._clonePaths();
        this.dragChangedBoard = false;
        this.activeColor = owner.colorId;
        const existing = this.paths.get(owner.colorId);
        if (owner.index < existing.length - 1) {
          this.paths.set(owner.colorId, existing.slice(0, owner.index + 1));
          this.dragChangedBoard = true;
        }
        this.isDragging = true;
        this.pointerPos = { x: info.px, y: info.py };
        if (global.SoundFX) global.SoundFX.tap();
        this._emitMetrics();
      }
    }

    _onPointerMove(e) {
      if (!this.isDragging || this.activeColor === null || this.paused || this.won) return;
      const info = this._eventToCell(e);
      this.pointerPos = {
        x: Math.max(0, Math.min(this.boardPx, info.px)),
        y: Math.max(0, Math.min(this.boardPx, info.py))
      };
      if (!info.inBounds) return;
      this._tryStepTo(info.x, info.y);
    }

    _tryStepTo(tx, ty) {
      const path = this.paths.get(this.activeColor);
      if (!path || path.length === 0) return;
      const head = path[path.length - 1];
      if (head[0] === tx && head[1] === ty) return;

      const dx = tx - head[0];
      const dy = ty - head[1];
      const dist = Math.abs(dx) + Math.abs(dy);

      if (dist > 1) {
        if (dx === 0 || dy === 0) {
          const sx = Math.sign(dx);
          const sy = Math.sign(dy);
          let cx = head[0], cy = head[1];
          for (let s = 0; s < dist; s++) {
            cx += sx; cy += sy;
            if (!this._stepSingle(cx, cy)) break;
          }
        } else if (dist === 2) {
          if (!this._stepSingle(head[0] + Math.sign(dx), head[1])) {
            this._stepSingle(head[0], head[1] + Math.sign(dy));
          }
          this._stepSingle(tx, ty);
        }
        return;
      }
      this._stepSingle(tx, ty);
    }

    _stepSingle(nx, ny) {
      const path = this.paths.get(this.activeColor);
      if (!path || path.length === 0) return false;
      const head = path[path.length - 1];
      if (Math.abs(nx - head[0]) + Math.abs(ny - head[1]) !== 1) return false;

      const k = this._key(nx, ny);
      if (this.blockedSet.has(k)) return false;

      const selfIdx = path.findIndex((c) => c[0] === nx && c[1] === ny);
      if (selfIdx !== -1) {
        this.paths.set(this.activeColor, path.slice(0, selfIdx + 1));
        this.dragChangedBoard = true;
        if (global.SoundFX) global.SoundFX.step(selfIdx);
        this._emitMetrics();
        return true;
      }

      if (this._isPathComplete(this.activeColor)) return false;

      const epColor = this.endpoints.get(k);
      if (epColor !== undefined && epColor !== this.activeColor) return false;

      const owner = this._findPathOwnerAt(nx, ny);
      if (owner && owner.colorId !== this.activeColor) {
        const otherPath = this.paths.get(owner.colorId);
        this.paths.set(owner.colorId, owner.index <= 1 ? [] : otherPath.slice(0, owner.index));
        if (global.SoundFX) global.SoundFX.cut();
      }

      path.push([nx, ny]);
      this.dragChangedBoard = true;

      if (this._isPathComplete(this.activeColor)) {
        const pair = this._getPair(this.activeColor);
        this._spawnBurst(nx, ny, pair.color.hex, 20);
        if (global.SoundFX) global.SoundFX.connect();
      } else {
        if (global.SoundFX) global.SoundFX.step(path.length);
      }

      this._emitMetrics();
      return true;
    }

    _onPointerUp() {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.pointerPos = null;

      const cid = this.activeColor;
      this.activeColor = null;

      if (cid !== null) {
        const path = this.paths.get(cid);
        if (path && path.length <= 1) this.paths.set(cid, []);
      }

      if (this.dragChangedBoard && this.dragSnapshot) {
        this._pushSnapshot(this.dragSnapshot);
        if (cid !== this.lastMovedColor) {
          this.moves++;
          this.lastMovedColor = cid;
        }
      }

      this.dragSnapshot = null;
      this.dragChangedBoard = false;

      this._emitMetrics();
      this._checkWin();
    }

    _getPlayableCellCount() {
      return this.size * this.size - this.blockedSet.size;
    }

    _getFilledCellCount() {
      const seen = new Set();
      for (const path of this.paths.values()) {
        if (path.length < 2) continue;
        for (const c of path) seen.add(this._key(c[0], c[1]));
      }
      return seen.size;
    }

    _getCompletedFlowCount() {
      if (!this.puzzle) return 0;
      let count = 0;
      for (const pair of this.puzzle.pairs) {
        if (this._isPathComplete(pair.colorId)) count++;
      }
      return count;
    }

    _emitMetrics() {
      if (!this.puzzle || !this.callbacks.onMetrics) return;
      const totalFlows = this.puzzle.pairs.length;
      const completedFlows = this._getCompletedFlowCount();
      const playableCells = this._getPlayableCellCount();
      const filledCells = this._getFilledCellCount();
      const pipePct = Math.round((filledCells / playableCells) * 100);

      this.callbacks.onMetrics({
        completedFlows,
        totalFlows,
        moves: this.moves,
        pipePct,
        canUndo: this.history.length > 0 && !this.won,
        allConnectedButNotFull: completedFlows === totalFlows && filledCells < playableCells
      });
    }

    _checkWin() {
      if (!this.puzzle || this.won) return;
      const totalFlows = this.puzzle.pairs.length;
      const completedFlows = this._getCompletedFlowCount();
      const playableCells = this._getPlayableCellCount();
      const filledCells = this._getFilledCellCount();

      if (completedFlows === totalFlows && filledCells === playableCells) {
        this.won = true;
        this.isDragging = false;
        this.activeColor = null;

        let stars = 1;
        if (!this.usedHint && this.moves <= totalFlows) stars = 3;
        else if (this.moves <= totalFlows + 3) stars = 2;

        for (const pair of this.puzzle.pairs) {
          this._spawnBurst(pair.start[0], pair.start[1], pair.color.hex, 12);
          this._spawnBurst(pair.end[0], pair.end[1], pair.color.hex, 12);
        }

        if (global.SoundFX) global.SoundFX.win();
        this._emitMetrics();

        if (this.callbacks.onWin) {
          setTimeout(() => {
            this.callbacks.onWin({ moves: this.moves, stars, perfect: stars === 3 });
          }, 360);
        }
      }
    }

    _spawnBurst(cx, cy, hex, count) {
      const x = (cx + 0.5) * this.cellSize;
      const y = (cy + 0.5) * this.cellSize;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 70 + Math.random() * 145;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 2.5 + Math.random() * 3.5,
          hex,
          life: 1,
          decay: 1.6 + Math.random() * 0.8
        });
      }
    }

    _startLoop() {
      const tick = (ts) => {
        const dt = this.lastFrameTs ? Math.min(0.05, (ts - this.lastFrameTs) / 1000) : 0.016;
        this.lastFrameTs = ts;
        if (!this.paused) {
          this.pulseTime += dt;
          this._updateParticles(dt);
        }
        this.render();
        global.requestAnimationFrame(tick);
      };
      global.requestAnimationFrame(tick);
    }

    _updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= p.decay * dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
    }

    _drawHatchedCell(ctx, gx, gy, cs) {
      const x0 = gx * cs;
      const y0 = gy * cs;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, cs, cs);
      ctx.clip();

      ctx.fillStyle = 'rgba(20, 14, 38, 0.9)';
      ctx.fillRect(x0, y0, cs, cs);

      ctx.strokeStyle = this.bgTheme.hatchColor;
      ctx.lineWidth = Math.max(2, cs * 0.075);
      const step = Math.max(7, cs * 0.22);
      ctx.beginPath();
      for (let offset = -cs; offset < cs * 2; offset += step) {
        ctx.moveTo(x0 + offset, y0 + cs);
        ctx.lineTo(x0 + offset + cs, y0);
      }
      ctx.stroke();
      ctx.restore();
    }

    render() {
      const ctx = this.ctx;
      const cs = this.cellSize;
      const n = this.size;
      const w = this.boardPx;

      ctx.save();
      ctx.scale(this.dpr, this.dpr);

      // 1. Board Background
      ctx.fillStyle = this.bgTheme.boardBg;
      ctx.fillRect(0, 0, w, w);

      if (!this.puzzle) {
        ctx.restore();
        return;
      }

      // 2. Colored Neon Cell Tints under active/completed pipes
      for (const pair of this.puzzle.pairs) {
        const path = this.paths.get(pair.colorId);
        if (!path || path.length < 2) continue;
        ctx.fillStyle = pair.color.tint;
        for (const [cx, cy] of path) {
          ctx.fillRect(cx * cs + 1, cy * cs + 1, cs - 2, cs - 2);
        }
      }

      // 3. Hatched Blocked Cells (Obstacles)
      if (this.puzzle.blocked && this.puzzle.blocked.length > 0) {
        for (const [bx, by] of this.puzzle.blocked) {
          this._drawHatchedCell(ctx, bx, by, cs);
        }
      }

      // 4. Purple-tinted crisp Grid Lines
      ctx.strokeStyle = this.bgTheme.gridColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 1; i < n; i++) {
        const p = Math.round(i * cs) + 0.5;
        ctx.moveTo(p, 0);
        ctx.lineTo(p, w);
        ctx.moveTo(0, p);
        ctx.lineTo(w, p);
      }
      ctx.stroke();

      // 5. NEON LASER BEAMS (Outer colored glow + White-hot core like reference!)
      const outerWidth = Math.max(7, cs * 0.22);
      const coreWidth = Math.max(3, cs * 0.095);

      for (const pair of this.puzzle.pairs) {
        const path = this.paths.get(pair.colorId);
        if (!path || path.length < 2) continue;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          const px = (path[i][0] + 0.5) * cs;
          const py = (path[i][1] + 0.5) * cs;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // Layer A: wide soft neon bloom
        ctx.strokeStyle = pair.color.hex;
        ctx.lineWidth = outerWidth;
        ctx.shadowColor = pair.color.glow;
        ctx.shadowBlur = 22;
        ctx.stroke();

        // Layer B: second pass intensifies neon aura
        ctx.lineWidth = outerWidth * 0.65;
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Layer C: white-hot laser core
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = coreWidth;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 6;
        ctx.stroke();

        // Glowing energy orb at open pipe tip (when not yet connected)
        if (!this._isPathComplete(pair.colorId)) {
          const tip = path[path.length - 1];
          const tx = (tip[0] + 0.5) * cs;
          const ty = (tip[1] + 0.5) * cs;
          ctx.beginPath();
          ctx.arc(tx, ty, cs * 0.19, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = pair.color.hex;
          ctx.shadowBlur = 20;
          ctx.fill();
        }
        ctx.restore();
      }

      // 6. Dots (with equipped Shop skin & crisp white rim)
      const dotRadius = cs * 0.36;
      for (const pair of this.puzzle.pairs) {
        const isActive = this.activeColor === pair.colorId;
        const pulse = isActive ? 1 + Math.sin(this.pulseTime * 9) * 0.06 : 1;

        for (const ep of [pair.start, pair.end]) {
          const cx = (ep[0] + 0.5) * cs;
          const cy = (ep[1] + 0.5) * cs;

          ctx.save();
          ctx.shadowColor = pair.color.glow;
          ctx.shadowBlur = isActive ? 20 : 10;

          if (global.ShopCatalog) {
            global.ShopCatalog.drawDotShape(
              ctx,
              this.dotSkin,
              cx,
              cy,
              dotRadius * pulse,
              pair.color.hex,
              'rgba(255, 255, 255, 0.88)'
            );
          } else {
            ctx.beginPath();
            ctx.arc(cx, cy, dotRadius * pulse, 0, Math.PI * 2);
            ctx.fillStyle = pair.color.hex;
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // 7. Particles
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.hex;
        ctx.shadowColor = p.hex;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  global.ConnectDotGame = ConnectDotGame;
})(window);
