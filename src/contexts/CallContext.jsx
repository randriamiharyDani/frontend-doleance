import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import socket from '../config/socket';
import useWebRTC from '../components/hooks/useWebRTC';
import useChatSounds from '../components/hooks/useChatSounds';
import CallScreen from '../components/call/CallScreen';
import IncomingCallModal from '../components/call/IncomingCallModal';
import toast from 'react-hot-toast';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callInfo, setCallInfo] = useState(null);
  const [callError, setCallError] = useState(null);

  const sounds = useChatSounds();
  const callInfoRef = useRef(null);
  callInfoRef.current = callInfo;

  const clearCall = useCallback(() => {
    setIncomingCall(null);
    setCallInfo(null);
    setCallError(null);
  }, []);

  const webrtc = useWebRTC({
    onCallAccepted: () => {
      sounds.playCallAccepted();
    },
    onCallRejected: () => {
      sounds.playCallRejected();
      clearCall();
      toast('Appel refusé');
    },
    onCallEnded: () => {
      sounds.playCallEnded();
      clearCall();
      toast('Appel terminé');
    },
    onCallFailed: () => {
      sounds.playCallEnded();
      clearCall();
      toast.error('Échec de la connexion à l\'appel');
    },
  });

  // Recevoir les notifications d'appel entrant (peu importe la page)
  useEffect(() => {
    const handleCallInvite = (data) => {
      if (!callInfoRef.current) {
        setIncomingCall(data);
      }
    };
    socket.on('call-invite', handleCallInvite);
    socket.on('incoming-call', handleCallInvite);
    return () => {
      socket.off('call-invite', handleCallInvite);
      socket.off('incoming-call', handleCallInvite);
    };
  }, []);

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
    setCallError(null);
    setCallInfo({ calleeId, calleeName, callType: type, isIncoming: false });
    webrtc.setCallStatus('calling');
    sounds.playRinging();
    try {
      await webrtc.startCall(calleeId, type);
    } catch (err) {
      const msg = err.message?.includes('non supporté') || err.message?.includes('HTTPS')
        ? err.message
        : 'Impossible de démarrer l\'appel. Vérifiez votre connexion et les permissions caméra/micro.';
      setCallError(msg);
      webrtc.setCallStatus('failed');
      toast.error(msg);
    }
  }, [webrtc, sounds]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const callId = incomingCall.call_id || incomingCall.id || incomingCall.callId;
    const callerId = incomingCall.caller_id || incomingCall.sender_id || incomingCall.callerId;
    const callerName = incomingCall.caller_name || incomingCall.sender_name || incomingCall.callerName || '';
    const callType = incomingCall.call_type || incomingCall.callType || 'audio';

    setIncomingCall(null);
    setCallError(null);
    setCallInfo({ callId, callerId, callerName, callType, isIncoming: true });
    webrtc.setCallStatus('connecting');
    sounds.playCallAccepted();
    try {
      await webrtc.acceptIncoming(callId, callerId, callType);
    } catch (err) {
      const msg = err.message?.includes('non supporté') || err.message?.includes('HTTPS')
        ? err.message
        : 'Impossible d\'accepter l\'appel. Vérifiez vos permissions caméra/micro.';
      setCallError(msg);
      webrtc.setCallStatus('failed');
      toast.error(msg);
    }
  }, [incomingCall, webrtc, sounds]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    const callId = incomingCall.call_id || incomingCall.id || incomingCall.callId;
    const callerId = incomingCall.caller_id || incomingCall.sender_id || incomingCall.callerId;
    sounds.playCallRejected();
    webrtc.rejectIncoming(callId, callerId);
    setIncomingCall(null);
  }, [incomingCall, webrtc, sounds]);

  const endCall = useCallback(() => {
    sounds.playCallEnded();
    webrtc.endCall();
    clearCall();
  }, [webrtc, sounds, clearCall]);

  const value = {
    incomingCall,
    callInfo,
    callError,
    localStream: webrtc.localStream,
    remoteStream: webrtc.remoteStream,
    callStatus: webrtc.callStatus,
    callDuration: webrtc.callDuration,
    isMuted: webrtc.isMuted,
    isVideoOff: webrtc.isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute: webrtc.toggleMute,
    toggleVideo: webrtc.toggleVideo,
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
          localStream={webrtc.localStream}
          remoteStream={webrtc.remoteStream}
          onEndCall={endCall}
          onAcceptCall={acceptCall}
          onRejectCall={rejectCall}
          isIncoming={callInfo.isIncoming}
          status={webrtc.callStatus}
          callDuration={webrtc.callDuration}
          isMuted={webrtc.isMuted}
          isVideoOff={webrtc.isVideoOff}
          onToggleMute={webrtc.toggleMute}
          onToggleVideo={webrtc.toggleVideo}
          error={callError}
        />
      )}

      {incomingCall && !callInfo && (
        <IncomingCallModal
          callerName={incomingCall.caller_name || incomingCall.sender_name || incomingCall.callerName || ''}
          callType={incomingCall.call_type || incomingCall.callType || 'audio'}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}
    </CallContext.Provider>
  );
};
