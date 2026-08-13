import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import socket from '../config/socket';
import chatService from '../services/chatService';
import useWebRTC from '../components/hooks/useWebRTC';
import useChatSounds from '../components/hooks/useChatSounds';
import CallScreen from '../components/call/CallScreen';
import IncomingCallModal from '../components/call/IncomingCallModal';
import toast from 'react-hot-toast';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

function formatDuration(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export const CallProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callInfo, setCallInfo] = useState(null);
  const [callError, setCallError] = useState(null);

  const sounds = useChatSounds();
  const callInfoRef = useRef(null);
  const callDurationRef = useRef(0);
  const locallyEndedRef = useRef(false);
  const failureShownRef = useRef(false);
  const lastEventRef = useRef({ type: null, at: 0 });
  callInfoRef.current = callInfo;

  const clearCall = useCallback(() => {
    setIncomingCall(null);
    setCallInfo(null);
    setCallError(null);
  }, []);

  // Les événements d'appel sont émis en double (relais socket client + serveur) :
  // on déduplique les toasts côté affichage, sans toucher à la logique WebRTC.
  const dedupeEvent = useCallback((type) => {
    const now = Date.now();
    if (lastEventRef.current.type === type && now - lastEventRef.current.at < 3000) {
      return true;
    }
    lastEventRef.current = { type, at: now };
    return false;
  }, []);

  const webrtcState = useWebRTC({
    onCallAccepted: () => {
      if (dedupeEvent('accepted')) return;
      sounds.playCallAccepted();
      toast.success('📞 Appel accepté');
    },
    onCallRejected: () => {
      if (dedupeEvent('rejected')) return;
      sounds.playCallRejected();
      clearCall();
      toast('🚫 Appel refusé');
    },
    onCallEnded: () => {
      if (dedupeEvent('ended')) return;
      sounds.playCallEnded();
      clearCall();
      if (locallyEndedRef.current) {
        locallyEndedRef.current = false;
        return;
      }
      const duration = callDurationRef.current;
      if (duration > 0) {
        toast(`📞 Appel terminé — ${formatDuration(duration)}`);
      }
    },
    onCallFailed: (callId) => {
      if (dedupeEvent('failed')) return;
      sounds.playCallEnded();
      failureShownRef.current = true;
      if (callId) chatService.callAction(callId, 'fail').catch(() => {});
      clearCall();
      toast.error('❌ Appel échoué');
    },
  });

  callDurationRef.current = webrtcState.callDuration;

  // Recevoir les notifications d'appel entrant (peu importe la page)
  useEffect(() => {
    const handleCallInvite = (data) => {
      if (callInfoRef.current) return;
      const name = data.caller_name || data.sender_name || data.callerName || 'Utilisateur';
      setIncomingCall(data);
      toast.success(`📵 Appel entrant de ${name}`);
    };
    const handleCallMissed = () => {
      sounds.playCallEnded();
      clearCall();
      toast('📵 Appel manqué');
    };
    const handleCallFailed = () => {
      sounds.playCallEnded();
      clearCall();
      if (failureShownRef.current) {
        failureShownRef.current = false;
        return;
      }
      toast.error('❌ Appel échoué');
    };
    socket.on('call-invite', handleCallInvite);
    socket.on('incoming-call', handleCallInvite);
    socket.on('call-missed', handleCallMissed);
    socket.on('call-failed', handleCallFailed);
    return () => {
      socket.off('call-invite', handleCallInvite);
      socket.off('incoming-call', handleCallInvite);
      socket.off('call-missed', handleCallMissed);
      socket.off('call-failed', handleCallFailed);
    };
  }, [sounds, clearCall]);

  // Sonnerie d'appel entrant
  useEffect(() => {
    if (incomingCall) {
      sounds.playIncomingRing();
    }
    return () => {
      if (incomingCall) sounds.stopAll();
    };
  }, [incomingCall, sounds]);

  const startCall = useCallback(async (calleeId, calleeName, type = 'audio') => {
    locallyEndedRef.current = false;
    failureShownRef.current = false;
    setCallError(null);
    setCallInfo({ calleeId, calleeName, callType: type, isIncoming: false });
    webrtcState.setCallStatus('calling');
    sounds.playRinging();
    try {
      await webrtcState.startCall(calleeId, type);
    } catch (err) {
      const msg = err.message?.includes('non supporté') || err.message?.includes('HTTPS')
        ? err.message
        : 'Impossible de démarrer l\'appel. Vérifiez votre connexion et les permissions caméra/micro.';
      setCallError(msg);
      webrtcState.setCallStatus('failed');
      toast.error(msg);
    }
  }, [webrtcState, sounds]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const callId = incomingCall.call_id || incomingCall.id || incomingCall.callId;
    const callerId = incomingCall.caller_id || incomingCall.sender_id || incomingCall.callerId;
    const callerName = incomingCall.caller_name || incomingCall.sender_name || incomingCall.callerName || '';
    const callType = incomingCall.call_type || incomingCall.callType || 'audio';

    locallyEndedRef.current = false;
    failureShownRef.current = false;
    setIncomingCall(null);
    setCallError(null);
    setCallInfo({ callId, callerId, callerName, callType, isIncoming: true });
    webrtcState.setCallStatus('connecting');
    sounds.playCallAccepted();
    toast.success('📞 Appel accepté');
    try {
      await webrtcState.acceptIncoming(callId, callerId, callType);
    } catch (err) {
      const msg = err.message?.includes('non supporté') || err.message?.includes('HTTPS')
        ? err.message
        : 'Impossible d\'accepter l\'appel. Vérifiez vos permissions caméra/micro.';
      setCallError(msg);
      webrtcState.setCallStatus('failed');
      toast.error(msg);
    }
  }, [incomingCall, webrtcState, sounds]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    const callId = incomingCall.call_id || incomingCall.id || incomingCall.callId;
    const callerId = incomingCall.caller_id || incomingCall.sender_id || incomingCall.callerId;
    failureShownRef.current = false;
    sounds.playCallRejected();
    webrtcState.rejectIncoming(callId, callerId);
    setIncomingCall(null);
    toast('🚫 Appel refusé');
  }, [incomingCall, webrtcState, sounds]);

  const missCall = useCallback(() => {
    if (!incomingCall) return;
    const callId = incomingCall.call_id || incomingCall.id || incomingCall.callId;
    failureShownRef.current = false;
    sounds.playCallEnded();
    chatService.callAction(callId, 'miss').catch(() => {});
    setIncomingCall(null);
    toast('📵 Appel manqué');
  }, [incomingCall, webrtcState, sounds]);

  const endCall = useCallback(() => {
    const wasRinging = ['calling', 'connecting', 'ringing'].includes(webrtcState.callStatus);
    const duration = callDurationRef.current;
    locallyEndedRef.current = true;
    sounds.playCallEnded();
    webrtcState.endCall();
    clearCall();
    if (wasRinging) {
      toast('🔕 Appel annulé');
    } else {
      toast(duration > 0 ? `📞 Appel terminé — ${formatDuration(duration)}` : '📞 Appel terminé');
    }
  }, [webrtcState, sounds, clearCall]);

  const value = {
    incomingCall,
    callInfo,
    callError,
    localStream: webrtcState.localStream,
    remoteStream: webrtcState.remoteStream,
    callStatus: webrtcState.callStatus,
    callDuration: webrtcState.callDuration,
    isMuted: webrtcState.isMuted,
    isVideoOff: webrtcState.isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    missCall,
    endCall,
    toggleMute: webrtcState.toggleMute,
    toggleVideo: webrtcState.toggleVideo,
  };

  return (
    <CallContext.Provider value={value}>
      {children}

      {callInfo && (
        <CallScreen
          callId={callInfo.callId}
          calleeName={callInfo.calleeName}
          callerName={callInfo.callerName}
          callType={callInfo.callType}
          localStream={webrtcState.localStream}
          remoteStream={webrtcState.remoteStream}
          onEndCall={endCall}
          onAcceptCall={acceptCall}
          onRejectCall={rejectCall}
          isIncoming={callInfo.isIncoming}
          status={webrtcState.callStatus}
          callDuration={webrtcState.callDuration}
          isMuted={webrtcState.isMuted}
          isVideoOff={webrtcState.isVideoOff}
          onToggleMute={webrtcState.toggleMute}
          onToggleVideo={webrtcState.toggleVideo}
          error={callError}
        />
      )}

      {incomingCall && !callInfo && (
        <IncomingCallModal
          callerName={incomingCall.caller_name || incomingCall.sender_name || incomingCall.callerName || ''}
          callType={incomingCall.call_type || incomingCall.callType || 'audio'}
          onAccept={acceptCall}
          onReject={rejectCall}
          onMiss={missCall}
        />
      )}
    </CallContext.Provider>
  );
};
