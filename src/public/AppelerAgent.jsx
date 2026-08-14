// src/public/AppelerAgent.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import {
  PhoneIcon,
  PhoneXMarkIcon,
  MicrophoneIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import useCitizenCall from '../components/hooks/useCitizenCall';
import citoyenCallService from '../services/citoyenCallService';

function formatDuration(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function AppelerAgent() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const {
    status,
    endReason,
    endedDuration,
    error,
    localStream,
    remoteStream,
    callDuration,
    isMuted,
    startCall,
    hangup,
    reset,
    toggleMute,
  } = useCitizenCall();

  useEffect(() => {
    let mounted = true;
    citoyenCallService.getConfig()
      .then((res) => {
        if (mounted) {
          setConfig(res?.data?.config || res?.config || null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setConfigLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const agentName = t('citizenCall.agentName');

  const endMessage = (() => {
    switch (endReason) {
      case 'no_agent': return t('citizenCall.noAgent');
      case 'rejected': return t('citizenCall.rejected');
      case 'missed': return t('citizenCall.missed');
      case 'failed': return t('citizenCall.failed');
      case 'timeout': return t('citizenCall.noAnswer');
      case 'cancelled': return t('citizenCall.cancelled');
      case 'ended': return `${t('citizenCall.ended')} — ${formatDuration(endedDuration)}`;
      default: return '';
    }
  })();

  const isAvailable = config ? config.disponible : true;

  return (
    <div className="max-w-xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#D4AF37]/10 text-[#9A7200] dark:text-[#D4AF37] border border-[#D4AF37]/30 mb-3">
          <PhoneIcon className="w-3.5 h-3.5" />
          {t('citizenCall.badge')}
        </div>
        <h1 className="cua-display text-3xl sm:text-4xl font-semibold text-[#0F172A] dark:text-white">
          {t('citizenCall.title')}
        </h1>
        <p className={`mt-2 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('citizenCall.subtitle')}
        </p>
      </div>

      {/* Statut de disponibilité */}
      {!configLoading && !error && status === 'idle' && (
        <div
          className={`mb-6 rounded-2xl border p-4 flex items-center gap-3 text-sm ${
            isAvailable
              ? darkMode
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : darkMode
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <span className={`relative flex h-3 w-3 flex-shrink-0 ${isAvailable ? '' : 'opacity-40'}`}>
            <span className={`absolute inline-flex h-full w-full rounded-full ${isAvailable ? 'animate-ping bg-emerald-400 opacity-75' : 'bg-rose-400'}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>
          <span>
            {isAvailable
              ? t('citizenCall.available', { agent: agentName })
              : t('citizenCall.unavailable')}
          </span>
        </div>
      )}

      {/* Zone principale d'appel */}
      <div className={`relative overflow-hidden rounded-3xl border shadow-sm ${
        darkMode ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white'
      }`}>
        {/* Vidéo distante / avatar */}
        <div className={`relative ${remoteStream ? 'aspect-video' : 'h-72 sm:h-80'} bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center`}>
          {remoteStream ? (
            <video
              ref={(el) => { if (el) el.srcObject = remoteStream; }}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="text-center px-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                status === 'ringing' ? 'animate-pulse bg-[#D4AF37]/20 border border-[#D4AF37]/50' : 'bg-white/10'
              }`}>
                {status === 'ringing' ? (
                  <PhoneIcon className="w-10 h-10 text-[#D4AF37]" />
                ) : (
                  <PhoneIcon className="w-10 h-10 text-white/50" />
                )}
              </div>
              <p className="mt-4 text-lg font-semibold text-white">{agentName}</p>
            </div>
          )}

          {/* Aperçu local (petit, en appel) */}
          {localStream && (
            <div className="absolute top-3 right-3 w-20 h-20 rounded-full bg-black/50 border border-white/20 flex items-center justify-center shadow-lg">
              <PhoneIcon className="w-8 h-8 text-[#D4AF37]" />
            </div>
          )}

          {/* Timer */}
          {status === 'connected' && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-semibold tabular-nums">
              {formatDuration(callDuration)}
            </div>
          )}
        </div>

        {/* Message d'état */}
        <div className="px-6 py-5 text-center">
          {status === 'connecting' && (
            <p className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              {t('citizenCall.connecting')}
            </p>
          )}
          {status === 'ringing' && (
            <p className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]" />
              </span>
              {t('citizenCall.calling')}
            </p>
          )}
          {status === 'connected' && (
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {t('citizenCall.inCall', { agent: agentName })}
            </p>
          )}
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}
          {status === 'ended' && endMessage && (
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{endMessage}</p>
          )}
          {configLoading && status === 'idle' && (
            <p className="text-sm text-slate-400">{t('citizenCall.loading')}</p>
          )}
        </div>
      </div>

      {/* Contrôles */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {status === 'idle' && (
          <>
            <div className="flex items-center justify-center">
              <button
                onClick={() => startCall('audio')}
                disabled={!isAvailable || configLoading}
                className="group flex flex-col items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 group-disabled:hover:scale-100">
                  <PhoneIcon className="w-7 h-7" />
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('citizenCall.callAudio')}</span>
              </button>
            </div>
            <p className={`text-xs text-center max-w-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('citizenCall.noAccountHint')}
            </p>
          </>
        )}

        {(status === 'ringing' || status === 'connected') && (
          <div className="flex items-center gap-4">
            {status === 'connected' && (
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                  isMuted
                    ? 'bg-[#D4AF37] text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200'
                }`}
                title={isMuted ? t('citizenCall.unmute') : t('citizenCall.mute')}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={hangup}
              className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95"
              title={t('citizenCall.endCall')}
            >
              <PhoneXMarkIcon className="w-7 h-7" />
            </button>
          </div>
        )}

        {status === 'ended' && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E3A8A] transition-all hover:scale-[1.02] active:scale-95"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {t('citizenCall.callAgain')}
          </button>
        )}
      </div>

      {/* Information */}
      <div className={`mt-8 rounded-2xl border p-5 text-xs leading-relaxed ${
        darkMode ? 'border-slate-700 bg-slate-800/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <p className="font-semibold text-[#0F172A] dark:text-white mb-1">{t('citizenCall.infoTitle')}</p>
        {t('citizenCall.infoText')}
      </div>
    </div>
  );
}
