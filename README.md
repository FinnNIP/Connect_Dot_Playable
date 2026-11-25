# Connect Dot — YouTube Playables Edition

HTML5/Canvas Connect Dot (Flow / Numberlink) puzzle game built specifically for **YouTube Playables** (SDK v1).

## Features
- **Neon Laser Visuals**: Glowing white-hot laser beams, colored cell fills, particle bursts, and diagonal-hatched obstacle cells on higher grids.
- **100 Built-in Levels + Unlimited Random + Daily Puzzle**: 5 difficulty packs (`5×5` to `9×9`), 20 deterministic solvable levels each, plus a daily seeded `7×7` puzzle.
- **Level Chest, Shop & Goals**: Earn Coins, Gems, and Hints through gameplay (zero third-party ads, 100% compliant with YouTube Playables policies). Unlock 8 Dot shapes and 6 Board themes in Shop.
- **Bilingual (EN / VI)**: Automatically adapts to the player's locale via `ytgame.system.getLanguage()`.
- **Ultra-lightweight**: < 50 KB zipped, zero external assets/network calls, instant load (< 0.5s).

## YouTube Playables SDK v1 Compliance Checklist
- [x] `<script src="https://www.youtube.com/game_api/v1"></script>` loaded first in `<head>` of root `index.html`.
- [x] `ytgame.game.firstFrameReady()` and `ytgame.game.gameReady()` called in sequence.
- [x] `ytgame.system.isAudioEnabled()` and `ytgame.system.onAudioEnabledChange()` synced with Web Audio synthesizer.
- [x] `ytgame.system.onPause()` and `ytgame.system.onResume()` pause gameplay and audio cleanly.
- [x] `ytgame.game.saveData()` / `loadData()` cloud persistence (language is NOT stored in cloud save).
- [x] `ytgame.engagement.sendScore()` reports total score.
- [x] No external network requests, no third-party ads.
- [x] Responsive across 9:16 mobile portrait, 1:1 square, and 16:9 desktop.

## Local Testing
Run any static server in this folder, e.g.:
```powershell
npx serve .
# or Python:
python -m http.server 8080
```
Open `http://localhost:8080` in your browser, or load the folder in the official **YouTube Playables Test Suite** to verify SDK callbacks (`Pause`, `Resume`, `Audio Toggle`, `Cloud Save`).

## Packaging for Submission
Run:
```powershell
.\package_zip.ps1
```
Output archive: `dist/connect-dot-playable.zip` (with `index.html` at the archive root).
