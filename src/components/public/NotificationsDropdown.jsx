import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

function NotificationsDropdown({ notifications = [], unreadCount = 0, onMarkAsRead }) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl border z-50 transition-all duration-200 ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => onMarkAsRead?.()}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <BellIcon className={`mx-auto h-10 w-10 mb-2 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-700">
              {notifications.map((notif, i) => (
                <div
                  key={notif.id || i}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                    !notif.lu ? darkMode ? 'bg-blue-900/10' : 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notif.lu && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} line-clamp-2`}>
                        {notif.titre || notif.message}
                      </p>
                      {notif.message && notif.titre && (
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'} line-clamp-2`}>
                          {notif.message}
                        </p>
                      )}
                      <p className={`text-[11px] mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {notif.date_creation ? new Date(notif.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsDropdown;
