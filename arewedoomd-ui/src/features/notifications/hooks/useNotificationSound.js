import { useCallback, useEffect } from 'react';

// Shared context across all component instances — created once, stays alive.
let _ctx = null;
let _unlocked = false;

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ctx;
}

// Chrome/Safari require a user gesture before audio plays. We unlock once on
// the first click anywhere in the document so subsequent auto-triggered sounds
// (e.g. incoming notifications) actually play.
function unlockOnInteraction() {
  if (_unlocked) return;
  _unlocked = true;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {}
}

function scheduleTone(ctx, frequency, startOffset, gain, duration = 0.6) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, now + startOffset);
  osc.frequency.exponentialRampToValueAtTime(
    frequency * 0.985,
    now + startOffset + Math.min(0.3, duration * 0.4),
  );

  gainNode.gain.setValueAtTime(0.0001, now + startOffset);
  gainNode.gain.linearRampToValueAtTime(gain, now + startOffset + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(now + startOffset);
  osc.stop(now + startOffset + duration + 0.05);
}

export function useNotificationSound() {
  useEffect(() => {
    document.addEventListener('click', unlockOnInteraction, { once: false, capture: true });
    return () => document.removeEventListener('click', unlockOnInteraction, { capture: true });
  }, []);

  const playChime = useCallback(() => {
    try {
      const ctx = getCtx();
      const doPlay = () => {
        scheduleTone(ctx, 220, 0,    0.40, 1.0);
        scheduleTone(ctx, 330, 0.10, 0.22, 0.9);
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(doPlay).catch(() => {});
      } else {
        doPlay();
      }
    } catch {}
  }, []);

  return playChime;
}
