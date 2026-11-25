/**
 * YouTube Playables SDK v1 Wrapper
 * Handles lifecycle, audio sync, pause/resume, cloud save with local fallback,
 * score reporting, and locale detection cleanly in both YT Playables & local browser.
 */
(function (global) {
  'use strict';

  const LOCAL_STORAGE_KEY = 'connect_dot_playable_save_v1';

  const hasSDK = typeof global.ytgame !== 'undefined' && global.ytgame !== null;
  const inPlayables = hasSDK && Boolean(global.ytgame.IN_PLAYABLES_ENV);

  let firstFrameSent = false;
  let gameReadySent = false;

  const YTSDK = {
    inPlayables,

    firstFrameReady() {
      if (firstFrameSent) return;
      firstFrameSent = true;
      try {
        if (hasSDK && global.ytgame.game && typeof global.ytgame.game.firstFrameReady === 'function') {
          global.ytgame.game.firstFrameReady();
        }
      } catch (err) {
        console.warn('[YTSDK] firstFrameReady error:', err);
      }
    },

    gameReady() {
      if (gameReadySent) return;
      gameReadySent = true;
      try {
        if (hasSDK && global.ytgame.game && typeof global.ytgame.game.gameReady === 'function') {
          global.ytgame.game.gameReady();
        }
      } catch (err) {
        console.warn('[YTSDK] gameReady error:', err);
      }
    },

    isAudioEnabled() {
      try {
        if (inPlayables && global.ytgame.system && typeof global.ytgame.system.isAudioEnabled === 'function') {
          return Boolean(global.ytgame.system.isAudioEnabled());
        }
      } catch (err) {
        console.warn('[YTSDK] isAudioEnabled error:', err);
      }
      return true;
    },

    onAudioEnabledChange(callback) {
      try {
        if (hasSDK && global.ytgame.system && typeof global.ytgame.system.onAudioEnabledChange === 'function') {
          return global.ytgame.system.onAudioEnabledChange(callback);
        }
      } catch (err) {
        console.warn('[YTSDK] onAudioEnabledChange error:', err);
      }
      return () => {};
    },

    onPause(callback) {
      try {
        if (hasSDK && global.ytgame.system && typeof global.ytgame.system.onPause === 'function') {
          return global.ytgame.system.onPause(callback);
        }
      } catch (err) {
        console.warn('[YTSDK] onPause error:', err);
      }
      return () => {};
    },

    onResume(callback) {
      try {
        if (hasSDK && global.ytgame.system && typeof global.ytgame.system.onResume === 'function') {
          return global.ytgame.system.onResume(callback);
        }
      } catch (err) {
        console.warn('[YTSDK] onResume error:', err);
      }
      return () => {};
    },

    async getLanguage() {
      try {
        if (hasSDK && global.ytgame.system && typeof global.ytgame.system.getLanguage === 'function') {
          const lang = await global.ytgame.system.getLanguage();
          if (lang) return String(lang).toLowerCase();
        }
      } catch (err) {
        console.warn('[YTSDK] getLanguage error:', err);
      }
      const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
      return navLang;
    },

    async loadData() {
      try {
        if (inPlayables && global.ytgame.game && typeof global.ytgame.game.loadData === 'function') {
          const raw = await global.ytgame.game.loadData();
          if (raw && raw.length > 0) {
            return JSON.parse(raw);
          }
        }
      } catch (err) {
        console.warn('[YTSDK] Cloud loadData error, falling back to localStorage:', err);
      }

      try {
        const localRaw = global.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localRaw) return JSON.parse(localRaw);
      } catch (err) {
        // Ignore storage errors in restricted iframes
      }
      return null;
    },

    async saveData(dataObj) {
      const payload = JSON.stringify(dataObj);
      try {
        global.localStorage.setItem(LOCAL_STORAGE_KEY, payload);
      } catch (err) {
        // Ignore storage errors
      }

      try {
        if (inPlayables && global.ytgame.game && typeof global.ytgame.game.saveData === 'function') {
          await global.ytgame.game.saveData(payload);
        }
      } catch (err) {
        console.warn('[YTSDK] Cloud saveData error:', err);
      }
    },

    async sendScore(value) {
      const intVal = Math.max(0, Math.floor(Number(value) || 0));
      try {
        if (hasSDK && global.ytgame.engagement && typeof global.ytgame.engagement.sendScore === 'function') {
          await global.ytgame.engagement.sendScore({ value: intVal });
        }
      } catch (err) {
        console.warn('[YTSDK] sendScore error:', err);
      }
    },

    logError() {
      try {
        if (hasSDK && global.ytgame.system && typeof global.ytgame.system.logError === 'function') {
          global.ytgame.system.logError();
        }
      } catch (err) {
        // no-op
      }
    }
  };

  global.YTSDK = YTSDK;
})(window);
