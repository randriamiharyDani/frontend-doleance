import React, { useEffect, useRef, useState } from 'react';
import {
  PhoneIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  MicrophoneIcon as MicrophoneSlashIcon,
  VideoCameraSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function CallScreen({
  callId,
  calleeName,
  callerName,
  callType,
  localStream,
  remoteStream,
  onEndCall,
  onAcceptCall,
  onRejectCall,
  isIncoming,
  status,
  callDuration,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  error,
}) {
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const displayName = isIncoming ? callerName : calleeName;
  const statusText = {
    idle: '',
    calling: 'Appel en cours...',
    ringing: 'Sonner...',
    connecting: 'Connexion...',
    connected: formatDuration(callDuration),
    ended: 'Appel terminé',
    failed: 'Erreur d\'appel',
    rejected: 'Appel refusé',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {callType === 'video' && remoteStream && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Audio uniquement — flux distant pour appels audio */}
      {callType !== 'video' && remoteStream && (
        <audio
          ref={remoteAudioRef}
          autoPlay
        />
      )}

      {callType === 'video' && localStream && (
        <div className="absolute top-4 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-10">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`absolute inset-0 ${callType === 'video' && remoteStream ? 'bg-black/30' : 'bg-transparent'}`} />

      <div className="relative z-10 flex flex-col items-center gap-6 text-white">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <span className="text-3xl font-bold">
            {displayName ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
          </span>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold">{displayName || 'Utilisateur'}</h2>
          <p className="text-white/70 mt-1">
            {status === 'connected'
              ? formatDuration(callDuration)
              : statusText[status] || 'Appel'}
          </p>
          {status === 'connected' && (
            <p className="text-white/50 text-sm mt-1">
              {callType === 'video' ? 'Appel vidéo' : 'Appel audio'}
            </p>
          )}
        </div>

        {error && (
          <div className="max-w-sm text-center bg-red-500/20 border border-red-400/30 text-red-200 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 mt-8">
          {isIncoming && status === 'ringing' ? (
            <>
              <button
                onClick={onRejectCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              <button
                onClick={onAcceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
              >
                <PhoneIcon className="w-8 h-8" />
              </button>
            </>
          ) : (
            <>
              {callType === 'video' && (
                <button
                  onClick={onToggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                    isVideoOff
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  {isVideoOff ? (
                    <VideoCameraSlashIcon className="w-6 h-6" />
                  ) : (
                    <VideoCameraIcon className="w-6 h-6" />
                  )}
                </button>
              )}

              <button
                onClick={onToggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                  isMuted
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                {isMuted ? (
                  <MicrophoneSlashIcon className="w-6 h-6" />
                ) : (
                  <MicrophoneIcon className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={onEndCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105"
              >
                <PhoneIcon className="w-8 h-8 rotate-[135deg]" />
              </button>
            </>
          )}
        </div>
      </div>

      {(status === 'calling' || status === 'ringing') && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
}
