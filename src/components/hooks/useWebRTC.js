import { useState, useRef, useCallback, useEffect } from 'react';
import socket from '../../config/socket';
import chatService from '../../services/chatService';

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
    console.log('[WebRTC] TURN server configured:', turnUrl);
  } else {
    console.warn('[WebRTC] No TURN server configured — relay candidates will NOT be generated. Set VITE_TURN_URL, VITE_TURN_USERNAME, VITE_TURN_CREDENTIAL in .env');
  }
  return { iceServers: servers };
}

const ICE_SERVERS = buildIceServers();

export default function useWebRTC({ onIncomingCall, onCallAccepted, onCallRejected, onCallEnded, onCallFailed } = {}) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const pcRef = useRef(null);
  const timerRef = useRef(null);
  const callIdRef = useRef(null);
  const remoteUserRef = useRef(null);
  const offerRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const callbacksRef = useRef({ onIncomingCall, onCallAccepted, onCallRejected, onCallEnded, onCallFailed });
  callbacksRef.current = { onIncomingCall, onCallAccepted, onCallRejected, onCallEnded, onCallFailed };

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, [clearTimer]);

  const cleanup = useCallback(() => {
    clearTimer();
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (e) {}
      pcRef.current = null;
    }
    setLocalStream(prev => {
      if (prev) {
        prev.getTracks().forEach(t => t.stop());
      }
      return null;
    });
    setRemoteStream(null);
    setCallStatus('idle');
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    callIdRef.current = null;
    remoteUserRef.current = null;
    offerRef.current = null;
    pendingCandidatesRef.current = [];
  }, [clearTimer]);

  const getMedia = useCallback(async (video = false) => {
    console.log('[WebRTC] getMedia() called — video:', video, '| isSecureContext:', window.isSecureContext);

    if (!window.isSecureContext) {
      const detail = `isSecureContext=false | protocol=${window.location.protocol} | hostname=${window.location.hostname}`;
      console.error('[WebRTC] Contexte non sécurisé:', detail);
      throw new Error('Ce site doit être accessible en HTTPS pour utiliser le microphone.');
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const detail = `mediaDevices=${!!navigator.mediaDevices}`;
      console.error('[WebRTC] mediaDevices non disponible:', detail);
      throw new Error('Votre navigateur ne supporte pas l\'accès au microphone.');
    }

    const tryGetMedia = async (constraints) => {
      console.log('[WebRTC] getUserMedia constraints:', JSON.stringify(constraints));
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
        console.warn('[WebRTC] First getUserMedia attempt failed:', firstErr.name, firstErr.message);
        if (firstErr.name === 'NotFoundError' || firstErr.name === 'DevicesNotFoundError') {
          console.warn('[WebRTC] Aucun périphérique trouvé, tentative audio seul...');
          stream = await tryGetMedia({ audio: true, video: false });
        } else {
          throw firstErr;
        }
      }
      console.log('[WebRTC] getUserMedia success — tracks:', stream.getTracks().map(t => `${t.kind}:${t.label}`).join(', '));
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('[WebRTC] Erreur accès média:', err.name, err.message);
      let message = 'Impossible d\'accéder au microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'L\'accès au microphone a été refusé. Autorisez le microphone dans les paramètres de votre navigateur.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Le microphone est utilisé par une autre application ou n\'est pas disponible.';
      } else if (err.name === 'SecurityError') {
        message = 'Erreur de sécurité : le microphone est bloqué. Vérifiez que le site est bien en HTTPS.';
      } else if (err.name === 'OverconstrainedError') {
        message = 'Les contraintes du micro/caméra ne sont pas satisfaites par votre appareil.';
      } else if (err.message?.includes('non supporté') || err.message?.includes('HTTPS') || err.message?.includes('HTTPS')) {
        message = err.message;
      }
      throw new Error(message);
    }
  }, []);

  const createPeerConnection = useCallback((stream) => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (e) {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    console.log('[WebRTC] RTCPeerConnection created — ICE_SERVERS:', JSON.stringify(ICE_SERVERS));

    stream.getTracks().forEach(track => {
      console.log('[WebRTC] addTrack:', track.kind, track.label);
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      console.log('[WebRTC] ontrack:', event.track.kind, 'streams:', event.streams?.length);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && callIdRef.current && remoteUserRef.current) {
        const type = getCandidateType(event.candidate.candidate);
        console.log('[WebRTC] ICE candidate sent:', type, '|', event.candidate.candidate?.substring(0, 80));
        socket.emit('call-signal', {
          call_id: callIdRef.current,
          receiver_id: remoteUserRef.current,
          signal_type: 'ice-candidate',
          signal_data: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (state === 'connected') {
        setCallStatus('connected');
        startTimer();
      } else if (state === 'failed') {
        setCallStatus('failed');
        if (callIdRef.current && remoteUserRef.current) {
          socket.emit('call-end', {
            call_id: callIdRef.current,
            receiver_id: remoteUserRef.current,
          });
        }
        if (callbacksRef.current.onCallFailed) callbacksRef.current.onCallFailed(callIdRef.current);
      } else if (state === 'disconnected' || state === 'closed') {
        setCallStatus('ended');
        if (callIdRef.current && remoteUserRef.current) {
          socket.emit('call-end', {
            call_id: callIdRef.current,
            receiver_id: remoteUserRef.current,
          });
        }
        if (callbacksRef.current.onCallEnded) callbacksRef.current.onCallEnded();
      }
    };

    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      console.log('[WebRTC] ICE state:', iceState);
      if (iceState === 'connected' || iceState === 'completed') {
        setCallStatus('connected');
      }
    };

    return pc;
  }, [startTimer]);

  const flushPendingCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const count = pendingCandidatesRef.current.length;
    if (count > 0) console.log(`[WebRTC] Flushing ${count} pending ICE candidates`);
    while (pendingCandidatesRef.current.length) {
      const candidate = pendingCandidatesRef.current.shift();
      try { await pc.addIceCandidate(candidate); } catch (e) { console.warn('[WebRTC] flush ICE error:', e.message); }
    }
  }, []);

  // Appeler quelqu'un
  const startCall = useCallback(async (calleeId, callType = 'audio') => {
    try {
      const video = callType === 'video';
      const stream = await getMedia(video);
      const pc = createPeerConnection(stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const res = await chatService.startCall(calleeId, callType);
      const callId = res.data?.call?.id || res.data?.call_id || res.data?.id;
      callIdRef.current = callId;
      remoteUserRef.current = calleeId;

      const offerData = { sdp: offer.sdp, type: offer.type };

      // Envoyer l'offre via socket
      socket.emit('call-signal', {
        call_id: callId,
        receiver_id: calleeId,
        signal_type: 'offer',
        signal_data: offerData,
      });

      // Persister l'offre en base (repli si l'événement socket est manqué)
      chatService.sendSignal(callId, calleeId, 'offer', offerData).catch(() => {});

      setCallStatus('calling');

      // Repli : interroger la base pour récupérer la réponse si le socket ne passe pas
      (async () => {
        for (let i = 0; i < 15; i++) {
          await new Promise(r => setTimeout(r, 1000));
          if (callIdRef.current !== callId || !pcRef.current || pcRef.current.remoteDescription) return;
          try {
            const res = await chatService.getSignals(callId);
            const signals = res.data?.signals || res.data || [];
            const answerSignal = signals.find(s => s.signal_type === 'answer');
            if (answerSignal) {
              const sdpData = typeof answerSignal.signal_data === 'string'
                ? JSON.parse(answerSignal.signal_data)
                : answerSignal.signal_data;
              if (!sdpData || !sdpData.type || !sdpData.sdp) {
                console.error('[WebRTC] startCall: SDP answer invalide depuis DB:', sdpData);
                continue;
              }
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdpData));
              await flushPendingCandidates();
              setCallStatus('connected');
              startTimer();
              return;
            }
          } catch (e) { /* ignore */ }
        }
      })();
    } catch (err) {
      console.error('Erreur démarrage appel:', err);
      cleanup();
      throw err;
    }
  }, [getMedia, createPeerConnection, flushPendingCandidates, startTimer, cleanup]);

  // Accepter un appel entrant
  const acceptIncoming = useCallback(async (callId, callerId, callType = 'audio') => {
    console.log(`[WebRTC] acceptIncoming() callId=${callId} callerId=${callerId} callType=${callType}`);
    try {
      const video = callType === 'video';
      console.log('[WebRTC] Step 1: getMedia video=', video);
      const stream = await getMedia(video);
      console.log('[WebRTC] Step 2: createPeerConnection');
      const pc = createPeerConnection(stream);
      callIdRef.current = callId;
      remoteUserRef.current = callerId;
      setCallStatus('connecting');

      console.log('[WebRTC] Step 3: callAction accept');
      await chatService.callAction(callId, 'accept');
      console.log('[WebRTC] Step 3: callAction accept — OK');

      // Récupérer l'offre (reçue via socket, sinon en base)
      let offerSignal = offerRef.current;
      offerRef.current = null;
      console.log('[WebRTC] Step 4: offerRef.current was', offerSignal ? 'FOUND' : 'NULL');

      let retries = 5;
      while (!offerSignal && retries > 0) {
        try {
          console.log(`[WebRTC] Step 4: fetching offer from DB (retries=${retries})`);
          const res = await chatService.getSignals(callId);
          const signals = res.data?.signals || res.data || [];
          offerSignal = signals.find(s => s.signal_type === 'offer');
          if (offerSignal) console.log('[WebRTC] Step 4: offer found in DB');
        } catch (e) {
          console.warn('[WebRTC] Step 4: getSignals error:', e.message);
        }
        if (!offerSignal) {
          await new Promise(r => setTimeout(r, 500));
          retries--;
        }
      }

      if (!offerSignal) {
        console.error('[WebRTC] Step 4: OFFER NOT FOUND after all retries');
        throw new Error('Offre WebRTC introuvable');
      }

      const sdpData = typeof offerSignal.signal_data === 'string'
        ? JSON.parse(offerSignal.signal_data)
        : offerSignal.signal_data;

      console.log('[WebRTC] Step 5: sdpData check:', sdpData ? `type=${sdpData.type}, sdp=${sdpData.sdp ? sdpData.sdp.substring(0, 30) + '...' : 'MISSING'}` : 'NULL');
      if (!sdpData || !sdpData.type || !sdpData.sdp) {
        console.error('[WebRTC] SDP offer invalide:', sdpData);
        throw new Error('Offre SDP invalide : données manquantes');
      }

      console.log('[WebRTC] Step 5: setRemoteDescription');
      await pc.setRemoteDescription(new RTCSessionDescription(sdpData));
      console.log('[WebRTC] Step 5: setRemoteDescription — OK');
      await flushPendingCandidates();

      console.log('[WebRTC] Step 6: createAnswer');
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('[WebRTC] Step 6: createAnswer — OK');

      const answerData = { sdp: answer.sdp, type: answer.type };

      // Envoyer la réponse via socket
      socket.emit('call-signal', {
        call_id: callId,
        receiver_id: callerId,
        signal_type: 'answer',
        signal_data: answerData,
      });
      console.log('[WebRTC] Step 7: answer sent via socket');

      // Persister la réponse en base (repli)
      chatService.sendSignal(callId, callerId, 'answer', answerData).catch(() => {});

      // Ne pas mettre 'connected' ici — onconnectionstatechange le fera quand ICE est prêt

      socket.emit('call-accept', {
        call_id: callId,
        caller_id: callerId,
      });
      console.log('[WebRTC] Step 8: call-accept emitted — DONE');
    } catch (err) {
      console.error('[WebRTC] acceptIncoming FAILED:', err.name, err.message, err);
      cleanup();
      throw err;
    }
  }, [getMedia, createPeerConnection, flushPendingCandidates, startTimer, cleanup]);

  // Refuser un appel entrant
  const rejectIncoming = useCallback(async (callId, callerId) => {
    try {
      await chatService.callAction(callId, 'reject');
      socket.emit('call-reject', {
        call_id: callId,
        caller_id: callerId,
      });
    } catch (err) {
      console.error('Erreur refus appel:', err);
    }
  }, []);

  // Terminer l'appel
  const endCall = useCallback(() => {
    if (callIdRef.current && remoteUserRef.current) {
      chatService.callAction(callIdRef.current, 'end').catch(() => {});
      socket.emit('call-end', {
        call_id: callIdRef.current,
        receiver_id: remoteUserRef.current,
      });
    }
    cleanup();
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setLocalStream(prev => {
      if (prev) {
        prev.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      }
      return prev;
    });
    setIsMuted(prev => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    setLocalStream(prev => {
      if (prev) {
        prev.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      }
      return prev;
    });
    setIsVideoOff(prev => !prev);
  }, []);

  // Écouter les signaux entrants
  useEffect(() => {
    const handleCallSignal = async (data) => {
      const { signal_type, signal_data, senderId, call_id } = data;

      if (signal_type === 'offer') {
        console.log('[WebRTC] call-signal OFFER received from', data.senderId, 'call_id:', call_id);
        const sdpData = typeof signal_data === 'string'
          ? JSON.parse(signal_data)
          : signal_data;
        console.log('[WebRTC] offer sdpData type:', typeof sdpData, '→ keys:', sdpData ? Object.keys(sdpData) : 'null');
        if (pcRef.current && pcRef.current.remoteDescription) {
          console.log('[WebRTC] offer: PC already has remoteDescription, attempting setRemoteDescription');
          if (!sdpData || !sdpData.type || !sdpData.sdp) {
            console.error('[WebRTC] offer: SDP invalide:', sdpData);
          } else {
            try {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdpData));
            } catch (e) { console.error('[WebRTC] Erreur offer:', e); }
          }
        } else {
          console.log('[WebRTC] offer: storing in offerRef.current');
          offerRef.current = { signal_type: 'offer', signal_data: sdpData };
        }
      } else if (signal_type === 'answer' && pcRef.current) {
        try {
          const sdpData = typeof signal_data === 'string'
            ? JSON.parse(signal_data)
            : signal_data;
          console.log('[WebRTC] Answer received — type:', sdpData?.type, '| sdp:', sdpData?.sdp ? sdpData.sdp.substring(0, 30) + '...' : 'MISSING');
          if (!sdpData || !sdpData.type || !sdpData.sdp) {
            console.error('[WebRTC] SDP answer invalide:', sdpData);
            return;
          }
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdpData));
          console.log('[WebRTC] setRemoteDescription(answer) — OK, flushing pending candidates:', pendingCandidatesRef.current.length);
          await flushPendingCandidates();
          setCallStatus('connected');
        } catch (e) { console.error('Erreur answer:', e); }
      } else if (signal_type === 'ice-candidate') {
        try {
          const candidateData = typeof signal_data === 'string'
            ? JSON.parse(signal_data)
            : signal_data;
          console.log('[WebRTC] ICE candidate received:', getCandidateType(candidateData?.candidate), '|', candidateData?.candidate?.substring(0, 80), '| pcRef:', !!pcRef.current, '| remoteDesc:', !!pcRef.current?.remoteDescription);
          if (pcRef.current && pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidateData));
          } else {
            console.log('[WebRTC] ICE candidate queued (PC not ready yet)');
            pendingCandidatesRef.current.push(new RTCIceCandidate(candidateData));
          }
        } catch (e) {
          console.warn('[WebRTC] ICE candidate error:', e.message);
        }
      } else if (signal_type === 'end' || signal_type === 'hangup') {
        if (callbacksRef.current.onCallEnded) callbacksRef.current.onCallEnded();
        cleanup();
      }
    };

    const handleCallAccept = (data) => {
      setCallStatus('connected');
      startTimer();
      if (callbacksRef.current.onCallAccepted) callbacksRef.current.onCallAccepted(data);
    };

    const handleCallReject = (data) => {
      if (callbacksRef.current.onCallRejected) callbacksRef.current.onCallRejected(data);
      cleanup();
    };

    const handleCallEnd = (data) => {
      if (callbacksRef.current.onCallEnded) callbacksRef.current.onCallEnded(data);
      cleanup();
    };

    socket.on('call-signal', handleCallSignal);
    socket.on('call-accept', handleCallAccept);
    socket.on('call-reject', handleCallReject);
    socket.on('call-end', handleCallEnd);

    return () => {
      socket.off('call-signal', handleCallSignal);
      socket.off('call-accept', handleCallAccept);
      socket.off('call-reject', handleCallReject);
      socket.off('call-end', handleCallEnd);
      cleanup();
    };
  }, [flushPendingCandidates, cleanup]);

  return {
    localStream,
    remoteStream,
    startCall,
    acceptIncoming,
    rejectIncoming,
    endCall,
    toggleMute,
    toggleVideo,
    callStatus,
    callDuration,
    isMuted,
    isVideoOff,
    setCallStatus,
  };
}
