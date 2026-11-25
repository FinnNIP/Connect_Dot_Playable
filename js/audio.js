/**
 * Lightweight Web Audio API Sound Synthesizer
 * Zero external audio files — instant loading & 100% sandbox-safe for YouTube Playables.
 */
(function (global) {
  'use strict';

  let ctx = null;
  let userEnabled = true;
  let platformEnabled = true;
  let paused = false;

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended' && isAudible()) {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function isAudible() {
    return userEnabled && platformEnabled && !paused;
  }

  function playTone(freq, duration, type, volume, slideToFreq) {
    if (!isAudible()) return;
    const c = ensureContext();
    if (!c) return;

    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume || 0.12, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  const SoundFX = {
    unlock() {
      ensureContext();
    },

    setUserEnabled(enabled) {
      userEnabled = Boolean(enabled);
    },

    isUserEnabled() {
      return userEnabled;
    },

    setPlatformEnabled(enabled) {
      platformEnabled = Boolean(enabled);
      if (ctx) {
        if (isAudible()) {
          ctx.resume().catch(() => {});
        } else {
          ctx.suspend().catch(() => {});
        }
      }
    },

    setPaused(isPaused) {
      paused = Boolean(isPaused);
      if (ctx) {
        if (paused) {
          ctx.suspend().catch(() => {});
        } else if (isAudible()) {
          ctx.resume().catch(() => {});
        }
      }
    },

    isEffectiveEnabled() {
      return userEnabled && platformEnabled;
    },

    tap() {
      playTone(420, 0.07, 'sine', 0.1, 520);
    },

    step(stepIndex) {
      // Gentle rising pentatonic tick as player drags pipe
      const scale = [330, 370, 415, 494, 554, 659, 740, 831];
      const f = scale[stepIndex % scale.length];
      playTone(f, 0.055, 'triangle', 0.065);
    },

    connect() {
      // Bright harmonic chime when a pair is connected
      playTone(523.25, 0.14, 'sine', 0.13);
      setTimeout(() => playTone(783.99, 0.2, 'sine', 0.12), 55);
    },

    cut() {
      playTone(260, 0.08, 'sawtooth', 0.05, 170);
    },

    undo() {
      playTone(380, 0.09, 'triangle', 0.08, 280);
    },

    hint() {
      playTone(659.25, 0.12, 'sine', 0.1);
      setTimeout(() => playTone(880, 0.18, 'sine', 0.1), 80);
    },

    win() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => {
        setTimeout(() => playTone(n, 0.28, 'sine', 0.13), i * 85);
      });
    }
  };

  global.SoundFX = SoundFX;
})(window);
