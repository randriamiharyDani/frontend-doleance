import React, { useEffect, useState, useCallback } from 'react';
import { PhoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

export default function IncomingCallModal({ callerName, callType, onAccept, onReject, onMiss }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => {
      onMiss();
    }, 30000);
    return () => clearTimeout(timer);
  }, [dismissed, onMiss]);

  const handleAccept = useCallback(() => {
    setDismissed(true);
    setVisible(false);
    setTimeout(() => onAccept(), 200);
  }, [onAccept]);

  const handleReject = useCallback(() => {
    setDismissed(true);
    setVisible(false);
    setTimeout(() => onReject(), 200);
  }, [onReject]);

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 sm:items-center sm:pb-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-sm mx-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 p-6 transform transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
            {callType === 'video' ? (
              <VideoCameraIcon className="w-8 h-8 text-white" />
            ) : (
              <PhoneIcon className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-white text-lg font-bold">{callerName || 'Appel entrant'}</h3>
            <p className="text-white/60 text-sm mt-1">
              {callType === 'video' ? 'Appel vidéo entrant' : 'Appel audio entrant'}
            </p>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={handleReject}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={handleAccept}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneIcon className="w-7 h-7 text-white" />
            </button>
          </div>

          <p className="text-white/40 text-xs mt-2">Se ferme automatiquement dans 30s</p>
        </div>
      </div>
    </div>
  );
}
