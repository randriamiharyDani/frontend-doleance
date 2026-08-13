import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useCall } from '../contexts/CallContext';
import useChatSounds from '../components/hooks/useChatSounds';
import chatService from '../services/chatService';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhoneIcon,
  VideoCameraIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate()) return "Aujourd'hui";
  if (diff < 172800000) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function UserAvatar({ user, size = 'md', online = false }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  const initials = user?.prenom && user?.nom
    ? `${user.prenom[0]}${user.nom[0]}`
    : (user?.prenom || user?.nom || '?').slice(0, 2);

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-semibold text-white shadow-md`}>
        {initials.toUpperCase()}
      </div>
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
      )}
    </div>
  );
}

export default function Messages() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    contacts,
    messages,
    activeContact,
    loading,
    sendMessage,
    selectContact,
    loadContacts,
    loadMoreMessages,
    typingUsers,
  } = useChat();

  const { startCall } = useCall();

  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  const sounds = useChatSounds();

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (activeContact) {
      setShowMobileChat(true);
    }
  }, [activeContact]);

  const contactParam = searchParams.get('contact');
  useEffect(() => {
    if (contactParam && contacts.length > 0) {
      const target = contacts.find(c => String(c.id_utilisateur || c.id) === contactParam);
      const activeId = activeContact ? String(activeContact.id_utilisateur || activeContact.id) : null;
      if (target && activeId !== contactParam) {
        selectContact(Number(contactParam));
        setSearchParams({}, { replace: true });
      }
    }
  }, [contactParam, contacts, activeContact, selectContact, setSearchParams]);

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true;
    const name = `${c.prenom || ''} ${c.nom || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = useCallback(() => {
    if (!messageText.trim() && !selectedFile) return;
    sendMessage(messageText.trim(), selectedFile);
    setMessageText('');
    setSelectedFile(null);
    setPreviewFile(null);
    sounds.playMessageSent();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [messageText, selectedFile, sendMessage, sounds]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewFile(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewFile(null);
      }
    }
  }, []);

  const handleSelectContact = useCallback((contactId) => {
    selectContact(contactId);
    sounds.playMessageReceived();
  }, [selectContact, sounds]);

  const handleStartCall = useCallback((type) => {
    if (!activeContact) return;
    const calleeId = activeContact.id_utilisateur || activeContact.id;
    const calleeName = `${activeContact.prenom || ''} ${activeContact.nom || ''}`.trim();
    startCall(calleeId, calleeName, type);
  }, [activeContact, startCall]);

  const openCallHistory = useCallback(async () => {
    setShowCallHistory(true);
    setCallHistoryLoading(true);
    try {
      const res = await chatService.getCallHistory();
      setCallHistory(res.data?.calls || []);
    } catch (err) {
      console.error('Erreur historique appels:', err);
      toast.error('Impossible de charger l\'historique des appels');
    } finally {
      setCallHistoryLoading(false);
    }
  }, []);

  const formatCallDate = useCallback((dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatCallDuration = useCallback((seconds) => {
    if (!seconds || seconds <= 0) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m} min ${s}s` : `${s}s`;
  }, []);

  const callStatusLabel = useCallback((call) => {
    if (call.status === 'ended' || call.status === 'accepted') return 'Terminé';
    if (call.status === 'missed') return 'Manqué';
    if (call.status === 'rejected') return 'Refusé';
    if (call.status === 'ringing') return 'Sans réponse';
    return call.status || '';
  }, []);

  const handleTextareaChange = useCallback((e) => {
    setMessageText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  const myId = user?.id_utilisateur || user?.id;

  return (
    <div className={`flex h-full ${darkMode ? 'bg-slate-900' : 'bg-gray-50'} `}>
      {lightboxImage && (
        <div
          className="fixed overflow-hidden inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-1 right-1 text-white/80 hover:text-white z-10"
            onClick={() => setLightboxImage(null)}
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          <img src={lightboxImage} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}

      {showCallHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCallHistory(false)}
        >
          <div
            className={`w-full max-w-lg mx-4 max-h-[80vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
              darkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <ClockIcon className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Historique des appels
                </h3>
              </div>
              <button
                onClick={() => setShowCallHistory(false)}
                className={`p-1.5 rounded-full transition-colors ${
                  darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {callHistoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : callHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <ClockIcon className={`w-12 h-12 mb-3 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Aucun appel enregistré pour le moment.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                  {callHistory.map((call) => {
                    const name = `${call.prenom || ''} ${call.nom || ''}`.trim() || 'Utilisateur';
                    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    const isOutgoing = call.direction === 'outgoing';
                    const isEnded = call.status === 'ended' || call.status === 'accepted';
                    const statusColor = call.status === 'missed'
                      ? 'text-red-500'
                      : call.status === 'rejected'
                        ? 'text-orange-500'
                        : isEnded
                          ? 'text-emerald-500'
                          : 'text-gray-500';

                    return (
                      <li key={call.id} className={`flex items-center gap-3 px-5 py-3 ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-semibold text-white flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                              {name}
                            </p>
                            {isOutgoing ? (
                              <ArrowUpTrayIcon className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            ) : (
                              <ArrowDownTrayIcon className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            )}
                          </div>
                          <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {call.call_type === 'video' ? 'Appel vidéo' : 'Appel audio'}
                            {call.duration_seconds > 0 ? ` · ${formatCallDuration(call.duration_seconds)}` : ''}
                            <span className={`ml-2 ${statusColor}`}>{callStatusLabel(call)}</span>
                          </p>
                        </div>
                        <span className={`text-xs flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                          {formatCallDate(call.started_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact list panel */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r flex flex-col ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        } ${showMobileChat ? 'hidden md:flex' : 'flex'}`}
      >
        <div className={`border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#D4AF37]" />
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {t('chat.messages')}
            </h1>
          </div>
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder={t('chat.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${
                darkMode
                  ? 'bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50'
                  : 'bg-gray-100 text-slate-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30'
              }`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ChatBubbleLeftRightIcon className={`w-12 h-12 mb-3 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {t('chat.noContacts')}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const contactId = contact.id_utilisateur || contact.id;
              const isActive = activeContact && (activeContact.id_utilisateur || activeContact.id) === contactId;
              const isOnline = contact.is_online || contact.online || contact.live_status === 'online';
              const unread = contact.unread_count || 0;
              const lastMsg = contact.last_message || contact.dernier_message || '';
              const lastTime = contact.last_message_time || contact.updated_at || '';

              return (
                <button
                  key={contactId}
                  onClick={() => handleSelectContact(contactId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? darkMode
                        ? 'bg-blue-500/10 border-l-2 border-blue-500'
                        : 'bg-blue-50 border-l-2 border-blue-500'
                      : darkMode
                        ? 'hover:bg-slate-700/50 border-l-2 border-transparent'
                        : 'hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  <UserAvatar user={contact} online={isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {contact.prenom} {contact.nom}
                      </span>
                      <span className={`text-xs flex-shrink-0 ml-2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                        {formatDate(lastTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {lastMsg || t('chat.noMessages')}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeContact ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ChatBubbleLeftRightIcon className={`w-16 h-16 mb-4 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {t('chat.messages')}
            </h2>
            <p className={`text-sm max-w-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {t('chat.startConversation')}
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className={`flex items-center gap-3 px-4 py-3 border-b shrink-0 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <UserAvatar user={activeContact} size="sm" online={activeContact.is_online || activeContact.online || activeContact.live_status === 'online'} />
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {activeContact.prenom} {activeContact.nom}
                </h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {typingUsers[activeContact.id_utilisateur || activeContact.id]
                    ? t('chat.typing')
                    : activeContact.is_online || activeContact.online || activeContact.live_status === 'online'
                      ? t('chat.online')
                      : t('chat.offline')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openCallHistory}
                  className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-500 transition-colors"
                  title={t('chat.callHistory') || 'Historique des appels'}
                >
                  <ClockIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleStartCall('audio')}
                  className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-500 transition-colors"
                  title={t('chat.callAudio')}
                >
                  <PhoneIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleStartCall('video')}
                  className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-500 transition-colors"
                  title={t('chat.callVideo')}
                >
                  <VideoCameraIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              onScroll={(e) => {
                if (e.target.scrollTop === 0) {
                  loadMoreMessages();
                }
              }}
            >
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {t('chat.noMessages')}
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const msgSenderId = msg.id_expediteur || msg.sender_id || msg.id_utilisateur;
                  const isMine = msgSenderId === myId;
                  const msgId = msg.id_message || msg.id || idx;

                  return (
                    <div key={msgId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          isMine
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : darkMode
                              ? 'bg-slate-700 text-white rounded-bl-md'
                              : 'bg-gray-100 text-slate-800 rounded-bl-md'
                        }`}
                      >
                        {msg.fichier || msg.file_url || msg.attachment_url ? (
                          <div className="mb-2">
                            {(msg.fichier || msg.file_url || msg.attachment_url || '').match(/\.(jpg|jpeg|png|gif|webp|bmp)/i) ? (
                              <div
                                className="cursor-pointer rounded-lg overflow-hidden max-w-[250px]"
                                onClick={() => setLightboxImage(msg.fichier || msg.file_url || msg.attachment_url)}
                              >
                                <img
                                  src={msg.fichier || msg.file_url || msg.attachment_url}
                                  alt="Attachment"
                                  className="w-full h-auto rounded-lg"
                                />
                              </div>
                            ) : (
                              <a
                                href={msg.fichier || msg.file_url || msg.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-2 rounded-lg ${
                                  isMine ? 'bg-blue-400' : darkMode ? 'bg-slate-600' : 'bg-gray-200'
                                }`}
                              >
                                <DocumentIcon className="w-8 h-8 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {msg.fichier_name || msg.file_name || 'Fichier'}
                                  </p>
                                </div>
                              </a>
                            )}
                          </div>
                        ) : null}

                        {msg.message && (
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        )}

                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          isMine ? 'text-blue-100' : darkMode ? 'text-slate-400' : 'text-gray-400'
                        }`}>
                          <span className="text-[10px]">{formatTime(msg.created_at || msg.date_envoi)}</span>
                          {isMine && (
                            <CheckCircleIcon className="w-3 h-3 text-blue-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {typingUsers[activeContact.id_utilisateur || activeContact.id] && (
                <div className="flex justify-start">
                  <div className={`px-4 py-2.5 rounded-2xl rounded-bl-md ${
                    darkMode ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-slate-400' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
                      <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-slate-400' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
                      <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-slate-400' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className={`px-4 py-3 border-t shrink-0 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              {selectedFile && (
                <div className={`mb-2 p-2 rounded-lg flex items-center gap-2 text-sm ${
                  darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-slate-700'
                }`}>
                  {previewFile ? (
                    <img src={previewFile} alt="" className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <DocumentIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate">{selectedFile.name}</span>
                  <button
                    onClick={() => { setSelectedFile(null); setPreviewFile(null); }}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 rounded-full transition-colors shrink-0 ${
                    darkMode
                      ? 'hover:bg-slate-700 text-slate-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title={t('chat.attach')}
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chat.typeMessage')}
                  rows={1}
                  className={`flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition-colors max-h-[120px] ${
                    darkMode
                      ? 'bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50'
                      : 'bg-gray-100 text-slate-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() && !selectedFile}
                  className={`p-2.5 rounded-full transition-all shrink-0 ${
                    messageText.trim() || selectedFile
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : darkMode
                        ? 'bg-slate-700 text-slate-500'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
