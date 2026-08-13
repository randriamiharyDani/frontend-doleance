import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import notificationService from '../../services/notificationService';
import toast from 'react-hot-toast';
import socket from '../../config/socket';

function NotificationBell() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await notificationService.getNotifications(1, 30);
      if (result?.success) {
        setNotifications(result.data?.data?.notifications || []);
        setNonLues(result.data?.data?.non_lues || 0);
      }
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount();
      if (result?.success) setNonLues(result.count);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    const handleNewNotification = (data) => {
      setNonLues(data.non_lues || 0);
      setNotifications(prev => [data, ...prev]);
    };

    socket.on('newNotification', handleNewNotification);
    return () => socket.off('newNotification', handleNewNotification);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id_notification === id ? { ...n, lu: 1 } : n));
      setNonLues(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e?.stopPropagation();
    setLoading(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: 1 })));
      setNonLues(0);
      toast.success('Toutes les notifications marquées comme lues');
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      const deleted = notifications.find(n => n.id_notification === id);
      setNotifications(prev => prev.filter(n => n.id_notification !== id));
      if (deleted && !deleted.lu) setNonLues(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const handleNotificationClick = (notif) => {
    setOpen(false);
    if (!notif.lu) handleMarkAsRead(notif.id_notification);
    if (notif.id_doleance) {
      navigate(`/backoffice/doleances/${notif.id_doleance}`);
    }
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

  const getNotifIcon = (type) => {
    switch (type) {
      case 'nouvelle_doleance': return '📋';
      case 'transfert_doleance': return '🔀';
      case 'retour_doleance': return '↩️';
      case 'changement_statut': return '🔄';
      case 'modification_utilisateur': return '👤';
      case 'reset_password': return '🔑';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          darkMode
            ? 'text-gray-300 hover:bg-white/10 hover:text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse">
            {nonLues > 99 ? '99+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className={`fixed top-20 right-4 left-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-[380px] max-h-[480px] overflow-hidden rounded-2xl shadow-2xl border z-50 transition-all duration-200 flex flex-col ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Notifications
              </h3>
              {nonLues > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                  {nonLues}
                </span>
              )}
            </div>
            {nonLues > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors disabled:opacity-50"
              >
                <CheckIcon className="h-3.5 w-3.5" />
                Tout lire
              </button>
            )}
          </div>

          {/* Liste */}
          <div className={`overflow-y-auto flex-1 ${notifications.length === 0 ? 'flex items-center justify-center' : ''}`}>
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <BellIcon className={`mx-auto h-10 w-10 mb-2 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                  Aucune notification
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id_notification}
                    onClick={() => handleNotificationClick(notif)}
                    className={`px-4 py-3 transition-colors cursor-pointer group ${
                      darkMode
                        ? `hover:bg-slate-700/50 ${!notif.lu ? 'bg-blue-500/5' : ''}`
                        : `hover:bg-gray-50 ${!notif.lu ? 'bg-blue-50/60' : ''}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        !notif.lu
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : darkMode ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {notif.titre}
                          </p>
                          {!notif.lu && (
                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>
                        {notif.doleance_reference && (
                          <span className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] font-mono rounded ${
                            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {notif.doleance_reference}
                          </span>
                        )}
                        <p className={`text-[11px] mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                          {formatTime(notif.date_notification)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.lu && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id_notification, e)}
                            className={`p-1 rounded-md transition-colors ${darkMode ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-gray-200 text-gray-400'}`}
                            title="Marquer comme lu"
                          >
                            <CheckIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notif.id_notification, e)}
                          className={`p-1 rounded-md transition-colors ${darkMode ? 'hover:bg-slate-600 text-slate-400 hover:text-red-400' : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'}`}
                          title="Supprimer"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
