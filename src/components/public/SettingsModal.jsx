import React, { useState } from 'react';
import Modal from '../common/Modal';
import { SunIcon, MoonIcon, LanguageIcon, BellIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function Switch({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

function SettingsModal({ isOpen, onClose, darkMode, toggleDarkMode, i18n, t }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [importantOnly, setImportantOnly] = useState(true);

  const languages = [
    { code: 'fr', name: t('language.french'), flag: '🇫🇷' },
    { code: 'mg', name: t('language.malagasy'), flag: '🇲🇬' }
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    const langName = languages.find(l => l.code === langCode)?.name;
    toast.success(t('language.changed', { language: langName }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} subtitle={t('settings.subtitle')} size="max-w-lg">
      {/* Apparence */}
      <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className={`flex items-center gap-3 p-4 ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
            {darkMode ? <MoonIcon className="h-5 w-5 text-purple-400" /> : <SunIcon className="h-5 w-5 text-purple-600" />}
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t('settings.appearance')}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('settings.appearanceDesc')}</p>
          </div>
        </div>
        <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('settings.darkMode')}</span>
          <Switch enabled={darkMode} onChange={toggleDarkMode} />
        </div>
      </div>

      {/* Langue */}
      <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className={`flex items-center gap-3 p-4 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <LanguageIcon className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t('settings.language')}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('settings.languageDesc')}</p>
          </div>
        </div>
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex gap-3">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  i18n.language === lang.code
                    ? 'bg-blue-600 text-white shadow'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className={`flex items-center gap-3 p-4 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
            <BellIcon className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t('settings.notifications')}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('settings.notificationsDesc')}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            notificationsEnabled
              ? darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
              : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
          }`}>
            {notificationsEnabled ? t('settings.notificationsEnabled') : t('settings.notificationsDisabled')}
          </span>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`flex items-center justify-between p-4 ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
            <div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('settings.notificationsEnable')}
              </span>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('settings.notificationsEnableDesc')}
              </p>
            </div>
            <Switch enabled={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
          </div>
          {notificationsEnabled && (
            <div className={`flex items-center justify-between p-4 border-t ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
              <div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('settings.notificationsImportant')}
                </span>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('settings.notificationsImportantDesc')}
                </p>
              </div>
              <Switch enabled={importantOnly} onChange={() => setImportantOnly(!importantOnly)} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;
