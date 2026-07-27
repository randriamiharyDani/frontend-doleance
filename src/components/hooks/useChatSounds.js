import { useCallback, useRef } from 'react';

export default function useChatSounds() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq, duration, startTime, gain = 0.3, type = 'sine') => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(gain, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }, [getCtx]);

  const playRinging = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      playTone(440, 0.3, now + i * 0.8, 0.2);
      playTone(554, 0.3, now + i * 0.8 + 0.35, 0.2);
    }
  }, [getCtx, playTone]);

  const playIncomingRingRef = useRef(null);

  const playIncomingRing = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(600, 0.4, now, 0.25);
    playTone(500, 0.4, now + 0.5, 0.25);
    playTone(600, 0.4, now + 1.0, 0.25);
    playTone(500, 0.4, now + 1.5, 0.25);
    playIncomingRingRef.current = setTimeout(() => playIncomingRing(), 2000);
  }, [getCtx, playTone]);

  const playMessageSent = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(800, 0.1, now, 0.15);
    playTone(1200, 0.1, now + 0.05, 0.12, 'triangle');
  }, [getCtx, playTone]);

  const playMessageReceived = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(880, 0.15, now, 0.2);
    playTone(1100, 0.15, now + 0.1, 0.15);
  }, [getCtx, playTone]);

  const playCallAccepted = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(440, 0.15, now, 0.2);
    playTone(660, 0.15, now + 0.12, 0.2);
    playTone(880, 0.2, now + 0.24, 0.2);
  }, [getCtx, playTone]);

  const playCallRejected = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(600, 0.2, now, 0.2);
    playTone(400, 0.3, now + 0.15, 0.2);
  }, [getCtx, playTone]);

  const playCallEnded = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(600, 0.1, now, 0.15);
    playTone(400, 0.15, now + 0.08, 0.12);
  }, [getCtx, playTone]);

  const stopAll = useCallback(() => {
    if (playIncomingRingRef.current) {
      clearTimeout(playIncomingRingRef.current);
      playIncomingRingRef.current = null;
    }
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  }, []);

  return {
    playRinging,
    playIncomingRing,
    playMessageSent,
    playMessageReceived,
    playCallAccepted,
    playCallRejected,
    playCallEnded,
    stopAll,
  };
}
