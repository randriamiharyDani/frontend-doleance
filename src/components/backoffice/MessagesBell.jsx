import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import chatService from '../../services/chatService';
import socket from '../../config/socket';

function MessagesBell() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const ref = useRef(null);

  const loadContacts = useCallback(async () => {
    try {
      const res = await chatService.getContacts();
      const data = res.data?.contacts || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setContacts(list);
      setUnreadTotal(list.reduce((sum, c) => sum + (c.unread_count || 0), 0));
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
    }
  }, []);

  useEffect(() => {
    loadContacts();
    const interval = setInterval(loadContacts, 15000);
    return () => clearInterval(interval);
  }, [loadContacts]);

  useEffect(() => {
    const handleNewMessage = () => loadContacts();
    socket.on('new-message', handleNewMessage);
    return () => socket.off('new-message', handleNewMessage);
  }, [loadContacts]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenMessages = (contactId) => {
    setOpen(false);
    navigate(contactId ? `/backoffice/messages?contact=${contactId}` : '/backoffice/messages');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin}min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `il y a ${diffH}h`;
    const diffJ = Math.floor(diffH / 24);
    if (diffJ < 7) return `il y a ${diffJ}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const fullName = (c) => `${c.prenom || ''} ${c.nom || ''}`.trim() || c.email || 'Contact';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          darkMode
            ? 'text-gray-300 hover:bg-white/10 hover:text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
        aria-label="Messages"
      >
        <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        {unreadTotal > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse">
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-[340px] sm:w-[380px] max-h-[480px] overflow-hidden rounded-2xl shadow-2xl border z-50 transition-all duration-200 flex flex-col ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Messages
              </h3>
              {unreadTotal > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                  {unreadTotal}
                </span>
              )}
            </div>
            <button
              onClick={() => handleOpenMessages()}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
            >
              Tout voir
            </button>
          </div>

          {/* Liste des conversations */}
          <div className={`overflow-y-auto flex-1 ${contacts.length === 0 ? 'flex items-center justify-center' : ''}`}>
            {contacts.length === 0 ? (
              <div className="py-10 text-center">
                <ChatBubbleLeftRightIcon className={`mx-auto h-10 w-10 mb-2 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                  Aucune conversation
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {contacts.slice(0, 6).map((c) => (
                  <div
                    key={c.id_utilisateur}
                    onClick={() => handleOpenMessages(c.id_utilisateur)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm ${
                        darkMode ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {c.prenom?.charAt(0) || 'C'}{c.nom?.charAt(0) || ''}
                      </div>
                      {c.live_status === 'online' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {fullName(c)}
                        </p>
                        {c.last_message_time && (
                          <p className={`text-[11px] flex-shrink-0 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                            {formatTime(c.last_message_time)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {c.last_message || 'Aucun message'}
                        </p>
                        {c.unread_count > 0 && (
                          <span className="flex-shrink-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                            {c.unread_count > 99 ? '99+' : c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <button
            onClick={() => handleOpenMessages()}
            className={`flex items-center justify-center px-4 py-2.5 text-xs font-semibold border-t flex-shrink-0 transition-colors ${
              darkMode
                ? 'text-blue-400 border-slate-700 hover:bg-slate-700/50'
                : 'text-blue-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            Voir toutes les conversations
          </button>
        </div>
      )}
    </div>
  );
}

export default MessagesBell;
