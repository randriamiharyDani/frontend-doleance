// src/components/hooks/useCitizenCall.js
// Côté citoyen (invité, sans compte) : WebRTC + Socket.IO pour appeler un agent.
// L'invité est TOUJOURS l'appelant ; l'agent configuré est le destinataire.
import { useState, useRef, useCallback, useEffect } from 'react';
import guestSocket from '../../config/guestSocket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const RING_TIMEOUT_MS = 45000;

export default function useCitizenCall() {
  const [status, setStatus] = useState('idle'); // idle | connecting | ringing | connected | ended
  const [endReason, setEndReason] = useState(null); // no_agent | rejected | missed | failed | timeout | cancelled | ended
  const [callId, setCallId] = useState(null);
  const [agent, setAgent] = useState(null);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [endedDuration, setEndedDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const pcRef = useRef(null);
  const timerRef = useRef(null);
  const durationRef = useRef(0);
  const ringTimerRef = useRef(null);
  const callIdRef = useRef(null);
  const agentRef = useRef(null);
  const callTypeRef = useRef('audio');
  const pendingCandidatesRef = useRef([]);
  const endReasonRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setCallDuration(0);
    durationRef.current = 0;
    timerRef.current = setInterval(() => {
      durationRef.current += 1;
      setCallDuration(durationRef.current);
    }, 1000);
  }, [clearTimer]);

  const clearRingTimer = useCallback(() => {
    if (ringTimerRef.current) {
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearTimer();
    clearRingTimer();
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (e) {}
      pcRef.current = null;
    }
    setLocalStream((prev) => {
      if (prev) prev.getTracks().forEach((t) => t.stop());
      return null;
    });
    setRemoteStream(null);
    setCallDuration(0);
    durationRef.current = 0;
    setIsMuted(false);
    setIsVideoOff(false);
    callIdRef.current = null;
    agentRef.current = null;
    pendingCandidatesRef.current = [];
  }, [clearTimer, clearRingTimer]);

  const getMedia = useCallback(async (video = false) => {
    const tryGetMedia = async (constraints) => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return await navigator.mediaDevices.getUserMedia(constraints);
      }
      if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        return await new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
      throw new Error('WebRTC non supporté. Accédez au site via HTTPS ou localhost.');
    };

    try {
      let stream;
      try {
        stream = await tryGetMedia({
          audio: true,
          video: video ? { width: 640, height: 480 } : false,
        });
      } catch (firstErr) {
        if (firstErr.name === 'NotFoundError' || firstErr.name === 'DevicesNotFoundError') {
          stream = await tryGetMedia({ audio: true, video: false });
        } else {
          throw firstErr;
        }
      }
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Erreur accès média (citoyen):', err);
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback((stream) => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (e) {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && callIdRef.current && agentRef.current) {
        guestSocket.emit('call-signal', {
          call_id: callIdRef.current,
          receiver_id: agentRef.current.id_utilisateur,
          signal_type: 'ice-candidate',
          signal_data: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        setStatus('connected');
        startTimer();
      } else if (state === 'failed') {
        if (callIdRef.current && agentRef.current) {
          guestSocket.emit('call-end', {
            call_id: callIdRef.current,
            receiver_id: agentRef.current.id_utilisateur,
          });
        }
        finishCall('failed');
      } else if (state === 'disconnected' || state === 'closed') {
        if (callIdRef.current && agentRef.current) {
          guestSocket.emit('call-end', {
            call_id: callIdRef.current,
            receiver_id: agentRef.current.id_utilisateur,
          });
        }
        finishCall(endReasonRef.current || 'ended');
      }
    };

    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      if (iceState === 'connected' || iceState === 'completed') {
        setStatus('connected');
      }
    };

    return pc;
  }, [startTimer]);

  const finishCall = useCallback((reason) => {
    setEndedDuration(durationRef.current);
    endReasonRef.current = reason;
    setEndReason(reason);
    setStatus('ended');
    cleanup();
  }, [cleanup]);

  const flushPendingCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    while (pendingCandidatesRef.current.length) {
      const candidate = pendingCandidatesRef.current.shift();
      try { await pc.addIceCandidate(candidate); } catch (e) { /* ignore */ }
    }
  }, []);

  const hangup = useCallback(() => {
    const wasConnected = endReasonRef.current === null && pcRef.current && status === 'connected';
    if (callIdRef.current && agentRef.current) {
      guestSocket.emit('call-end', {
        call_id: callIdRef.current,
        receiver_id: agentRef.current.id_utilisateur,
      });
    }
    finishCall(wasConnected ? 'ended' : 'cancelled');
  }, [status, finishCall]);

  // Démarrer l'appel vers l'agent destinataire configuré
  const startCall = useCallback(async (callType = 'audio') => {
    callTypeRef.current = callType === 'video' ? 'video' : 'audio';
    setEndReason(null);
    endReasonRef.current = null;
    setError(null);
    setAgent(null);
    setStatus('connecting');

    try {
      // 1) Connecter le socket invité et attendre guest-ready
      guestSocket.connect();
      let waited = 0;
      while (!guestSocket.isConnected() || !guestSocket.ready) {
        await new Promise((r) => setTimeout(r, 150));
        waited += 150;
        if (waited > 6000) throw new Error('Connexion au serveur impossible');
      }

      // 2) Demander le démarrage de l'appel au serveur
      const started = await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(null), 8000);
        const handler = (data) => {
          clearTimeout(timeout);
          guestSocket.off('citizen-call-started', handler);
          resolve(data);
        };
        guestSocket.on('citizen-call-started', handler);
        guestSocket.emit('citizen-call-start', { call_type: callTypeRef.current });
      });

      if (!started) {
        setError('Erreur serveur. Veuillez réessayer.');
        setStatus('idle');
        return;
      }

      if (!started.success) {
        if (started.reason === 'no_agent') {
          setStatus('ended');
          endReasonRef.current = 'no_agent';
          setEndReason('no_agent');
        } else {
          setError(started.message || 'Erreur serveur');
          setStatus('idle');
        }
        return;
      }

      // 3) Appel confirmé : lancer WebRTC
      callIdRef.current = started.callId;
      agentRef.current = started.agent;
      setCallId(started.callId);
      setAgent(started.agent);

      const video = callTypeRef.current === 'video';
      const stream = await getMedia(video);
      const pc = createPeerConnection(stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      guestSocket.emit('call-signal', {
        call_id: started.callId,
        receiver_id: started.agent.id_utilisateur,
        signal_type: 'offer',
        signal_data: { sdp: offer.sdp, type: offer.type },
      });

      setStatus('ringing');

      // 4) Délai de sonnerie : si l'agent ne répond pas, raccrocher
      clearRingTimer();
      ringTimerRef.current = setTimeout(() => {
        if (callIdRef.current && agentRef.current) {
          guestSocket.emit('call-end', {
            call_id: callIdRef.current,
            receiver_id: agentRef.current.id_utilisateur,
          });
        }
        finishCall('timeout');
      }, RING_TIMEOUT_MS);
    } catch (err) {
      console.error('Erreur démarrage appel citoyen:', err);
      const msg = err.message?.includes('non supporté') || err.message?.includes('HTTPS')
        ? err.message
        : 'Impossible de démarrer l\'appel. Vérifiez votre connexion et les permissions caméra/micro.';
      setError(msg);
      cleanup();
      setStatus('idle');
    }
  }, [getMedia, createPeerConnection, clearRingTimer, finishCall, cleanup]);

  // Écouter les événements de l'agent (réponse, signaux WebRTC, fin d'appel)
  useEffect(() => {
    const handleCallSignal = async (data) => {
      const { signal_type, signal_data } = data;
      if (signal_type === 'answer' && pcRef.current) {
        try {
          const sdpData = typeof signal_data === 'string'
            ? JSON.parse(signal_data)
            : signal_data;
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdpData));
          await flushPendingCandidates();
          // Ne pas mettre 'connected' ici — onconnectionstatechange le fera quand ICE est prêt
        } catch (e) { console.error('Erreur answer (citoyen):', e); }
      } else if (signal_type === 'ice-candidate' && pcRef.current) {
        try {
          const candidateData = typeof signal_data === 'string'
            ? JSON.parse(signal_data)
            : signal_data;
          if (pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidateData));
          } else {
            pendingCandidatesRef.current.push(new RTCIceCandidate(candidateData));
          }
        } catch (e) { /* ignore */ }
      }
    };

    const handleCallAccept = () => {
      // Ne pas mettre 'connected' ici — onconnectionstatechange le fera quand ICE est prêt
    };

    const handleCallReject = () => {
      finishCall('rejected');
    };

    const handleCallEnd = () => {
      finishCall(timerRef.current ? 'ended' : 'cancelled');
    };

    const handleCallMissed = () => {
      finishCall('missed');
    };

    const handleCallFailed = () => {
      finishCall('failed');
    };

    guestSocket.on('call-signal', handleCallSignal);
    guestSocket.on('call-accept', handleCallAccept);
    guestSocket.on('call-reject', handleCallReject);
    guestSocket.on('call-end', handleCallEnd);
    guestSocket.on('call-missed', handleCallMissed);
    guestSocket.on('call-failed', handleCallFailed);

    return () => {
      guestSocket.off('call-signal', handleCallSignal);
      guestSocket.off('call-accept', handleCallAccept);
      guestSocket.off('call-reject', handleCallReject);
      guestSocket.off('call-end', handleCallEnd);
      guestSocket.off('call-missed', handleCallMissed);
      guestSocket.off('call-failed', handleCallFailed);
    };
  }, [flushPendingCandidates, startTimer, finishCall]);

  // Nettoyage au démontage de la page
  useEffect(() => {
    return () => {
      cleanup();
      guestSocket.disconnect();
    };
  }, [cleanup]);

  const reset = useCallback(() => {
    setStatus('idle');
    setEndReason(null);
    endReasonRef.current = null;
    setEndedDuration(0);
    setError(null);
    setCallId(null);
    setAgent(null);
  }, []);

  const toggleMute = useCallback(() => {
    setLocalStream((prev) => {
      if (prev) prev.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
      return prev;
    });
    setIsMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    setLocalStream((prev) => {
      if (prev) prev.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
      return prev;
    });
    setIsVideoOff((prev) => !prev);
  }, []);

  return {
    status,
    endReason,
    endedDuration,
    callId,
    agent,
    error,
    localStream,
    remoteStream,
    callDuration,
    isMuted,
    isVideoOff,
    startCall,
    hangup,
    reset,
    toggleMute,
    toggleVideo,
  };
}
