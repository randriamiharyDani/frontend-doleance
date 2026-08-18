import { useState, useRef, useCallback, useEffect } from 'react';
import socket from '../../config/socket';
import chatService from '../../services/chatService';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

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
          console.warn('Aucun périphérique audio/vidéo trouvé, tentative audio seul...');
          stream = await tryGetMedia({ audio: true, video: false });
        } else {
          throw firstErr;
        }
      }
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Erreur accès média:', err);
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback((stream) => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (e) {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && callIdRef.current && remoteUserRef.current) {
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
      if (iceState === 'connected' || iceState === 'completed') {
        setCallStatus('connected');
      }
    };

    return pc;
  }, [startTimer]);

  const flushPendingCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    while (pendingCandidatesRef.current.length) {
      const candidate = pendingCandidatesRef.current.shift();
      try { await pc.addIceCandidate(candidate); } catch (e) { /* ignore */ }
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
  const acceptIncoming = useCallback(async (callId, callerId, callType = 'video') => {
    try {
      const video = callType === 'video';
      const stream = await getMedia(video);
      const pc = createPeerConnection(stream);
      callIdRef.current = callId;
      remoteUserRef.current = callerId;
      setCallStatus('connecting');

      // Accepter l'appel dans la DB
      await chatService.callAction(callId, 'accept');

      // Récupérer l'offre (reçue via socket, sinon en base)
      let offerSignal = offerRef.current;
      offerRef.current = null;

      let retries = 5;
      while (!offerSignal && retries > 0) {
        try {
          const res = await chatService.getSignals(callId);
          const signals = res.data?.signals || res.data || [];
          offerSignal = signals.find(s => s.signal_type === 'offer');
        } catch (e) { /* ignore */ }
        if (!offerSignal) {
          await new Promise(r => setTimeout(r, 500));
          retries--;
        }
      }

      if (!offerSignal) {
        throw new Error('Offre WebRTC introuvable');
      }

      const sdpData = typeof offerSignal.signal_data === 'string'
        ? JSON.parse(offerSignal.signal_data)
        : offerSignal.signal_data;

      await pc.setRemoteDescription(new RTCSessionDescription(sdpData));
      await flushPendingCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const answerData = { sdp: answer.sdp, type: answer.type };

      // Envoyer la réponse via socket
      socket.emit('call-signal', {
        call_id: callId,
        receiver_id: callerId,
        signal_type: 'answer',
        signal_data: answerData,
      });

      // Persister la réponse en base (repli)
      chatService.sendSignal(callId, callerId, 'answer', answerData).catch(() => {});

      // Ne pas mettre 'connected' ici — onconnectionstatechange le fera quand ICE est prêt

      socket.emit('call-accept', {
        call_id: callId,
        caller_id: callerId,
      });
    } catch (err) {
      console.error('Erreur acceptation appel:', err);
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
        const sdpData = typeof signal_data === 'string'
          ? JSON.parse(signal_data)
          : signal_data;
        if (pcRef.current && pcRef.current.remoteDescription) {
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdpData));
          } catch (e) { console.error('Erreur offer:', e); }
        } else {
          offerRef.current = sdpData;
        }
      } else if (signal_type === 'answer' && pcRef.current) {
        try {
          const sdpData = typeof signal_data === 'string'
            ? JSON.parse(signal_data)
            : signal_data;
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdpData));
          await flushPendingCandidates();
          setCallStatus('connected');
        } catch (e) { console.error('Erreur answer:', e); }
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
        } catch (e) {
          // Ignore non-critical ICE errors
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
