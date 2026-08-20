// src/components/hooks/useCitizenCall.js
// Côté citoyen (invité, sans compte) : WebRTC + Socket.IO pour appeler un agent.
// L'invité est TOUJOURS l'appelant ; l'agent configuré est le destinataire.
import { useState, useRef, useCallback, useEffect } from 'react';
import guestSocket from '../../config/guestSocket';

function getCandidateType(candidateString) {
  if (!candidateString) return 'unknown';
  if (candidateString.includes('typ relay')) return 'relay';
  if (candidateString.includes('typ srflx')) return 'srflx';
  if (candidateString.includes('typ host')) return 'host';
  return 'unknown';
}

function buildIceServers() {
  const servers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];
  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUser = import.meta.env.VITE_TURN_USERNAME;
  const turnCred = import.meta.env.VITE_TURN_CREDENTIAL;
  if (turnUrl && turnUser && turnCred) {
    servers.push({ urls: turnUrl, username: turnUser, credential: turnCred });
    console.log('[CitizenCall] TURN server configured:', turnUrl);
  } else {
    console.warn('[CitizenCall] No TURN server configured — relay candidates will NOT be generated. Set VITE_TURN_URL, VITE_TURN_USERNAME, VITE_TURN_CREDENTIAL in .env');
  }
  return { iceServers: servers };
}

const ICE_SERVERS = buildIceServers();

const RING_TIMEOUT_MS = 45000;

export default function useCitizenCall() {
  const [status, setStatus] = useState('idle'); // idle | connecting | ringing | connected | ended
  const [endReason, setEndReason] = useState(null); // no_agent | rejected | missed | failed | timeout | cancelled | ended
  const [callId, setCallId] = useState(null);
  const [agent, setAgent] = useState(null);
  const [error, setError] = useState(null);
  const [mediaError, setMediaError] = useState(null); // { type, message, detail }
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
    setMediaError(null);

    // --- Diagnostic : contexte sécurisé ---
    if (!window.isSecureContext) {
      const detail = `isSecureContext=false | protocol=${window.location.protocol} | hostname=${window.location.hostname}`;
      console.error('Contexte non sécurisé:', detail);
      const err = { type: 'insecure_context', message: 'Ce site doit être accessible en HTTPS pour utiliser le microphone.', detail };
      setMediaError(err);
      throw new Error(err.message);
    }

    // --- Diagnostic : mediaDevices disponible ---
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const detail = `mediaDevices=${!!navigator.mediaDevices} | getUserMedia=${!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)}`;
      console.error('mediaDevices non disponible:', detail);
      const err = { type: 'no_media_devices', message: 'Votre navigateur ne supporte pas l\'accès au microphone.', detail };
      setMediaError(err);
      throw new Error(err.message);
    }

    const tryGetMedia = async (constraints) => {
      return await navigator.mediaDevices.getUserMedia(constraints);
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

      let type = 'media_error';
      let message = 'Impossible d\'accéder au microphone.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        type = 'not_allowed';
        message = 'L\'accès au microphone a été refusé. Autorisez le microphone dans les paramètres de votre navigateur, puis réessayez.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        type = 'not_readable';
        message = 'Le microphone est utilisé par une autre application ou n\'est pas disponible.';
      } else if (err.name === 'SecurityError') {
        type = 'security_error';
        message = 'Erreur de sécurité : le microphone est bloqué. Vérifiez que le site est bien en HTTPS.';
      } else if (err.name === 'OverconstrainedError') {
        type = 'overconstrained';
        message = 'Les contraintes du micro/caméra ne sont pas satisfaites par votre appareil.';
      } else if (err.message && (err.message.includes('non supporté') || err.message.includes('HTTPS'))) {
        type = 'webrtc_unsupported';
        message = err.message;
      }

      const mediaErr = { type, message, detail: `${err.name}: ${err.message}` };
      setMediaError(mediaErr);
      throw new Error(message);
    }
  }, []);

  const createPeerConnection = useCallback((stream) => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (e) {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    console.log('[CitizenCall] RTCPeerConnection created — ICE_SERVERS:', JSON.stringify(ICE_SERVERS));

    stream.getTracks().forEach((track) => {
      console.log('[CitizenCall] addTrack:', track.kind, track.label);
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      console.log('[CitizenCall] ontrack:', event.track.kind, 'streams:', event.streams?.length);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && callIdRef.current && agentRef.current) {
        const type = getCandidateType(event.candidate.candidate);
        console.log('[CitizenCall] ICE candidate sent:', type, '|', event.candidate.candidate?.substring(0, 80));
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
      console.log('[CitizenCall] Connection state:', state);
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
      console.log('[CitizenCall] ICE state:', iceState);
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
    const count = pendingCandidatesRef.current.length;
    if (count > 0) console.log(`[CitizenCall] Flushing ${count} pending ICE candidates`);
    while (pendingCandidatesRef.current.length) {
      const candidate = pendingCandidatesRef.current.shift();
      try { await pc.addIceCandidate(candidate); } catch (e) { console.warn('[CitizenCall] flush ICE error:', e.message); }
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
  // Appels Citoyen → Agent : AUDIO UNIQUEMENT, jamais de vidéo
  const startCall = useCallback(async (callType = 'audio') => {
    callTypeRef.current = 'audio';
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

      const stream = await getMedia(false);
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
      if (!mediaError) {
        setError(err.message || 'Impossible de démarrer l\'appel. Vérifiez votre connexion et les permissions caméra/micro.');
      } else {
        setError(mediaError.message);
      }
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
          console.log('[CitizenCall] Answer received — type:', sdpData?.type, '| sdp:', sdpData?.sdp ? sdpData.sdp.substring(0, 30) + '...' : 'MISSING');
          if (!sdpData || !sdpData.type || !sdpData.sdp) {
            console.error('[CitizenCall] SDP answer invalide:', sdpData);
            return;
          }
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdpData));
          console.log('[CitizenCall] setRemoteDescription(answer) — OK, flushing pending candidates:', pendingCandidatesRef.current.length);
          await flushPendingCandidates();
          // Ne pas mettre 'connected' ici — onconnectionstatechange le fera quand ICE est prêt
        } catch (e) { console.error('Erreur answer (citoyen):', e); }
      } else if (signal_type === 'ice-candidate') {
        try {
          const candidateData = typeof signal_data === 'string'
            ? JSON.parse(signal_data)
            : signal_data;
          console.log('[CitizenCall] ICE candidate received:', getCandidateType(candidateData?.candidate), '|', candidateData?.candidate?.substring(0, 80), '| pcRef:', !!pcRef.current, '| remoteDesc:', !!pcRef.current?.remoteDescription);
          if (pcRef.current && pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidateData));
          } else {
            console.log('[CitizenCall] ICE candidate queued (PC not ready yet)');
            pendingCandidatesRef.current.push(new RTCIceCandidate(candidateData));
          }
        } catch (e) {
          console.warn('[CitizenCall] ICE candidate error:', e.message);
        }
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
    mediaError,
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
