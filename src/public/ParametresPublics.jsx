// src/public/ParametresPublics.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  LanguageIcon,
  BellIcon,
  CheckCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';
import toast from 'react-hot-toast';

function ParametresPublics() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { i18n, t } = useTranslation();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false
  });

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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-blue-100'
    }`}>
      <PublicNavbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>
            {t('settings.title')}
          </h1>
          <p className={darkMode ? 'text-gray-300' : 'text-sky-600'}>
            {t('settings.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Apparence */}
          <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center gap-3 p-4 border-b transition-colors duration-300 ${
              darkMode ? 'border-gray-700 bg-purple-900/30' : 'border-gray-200 bg-purple-50'
            }`}>
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
              }`}>
                <SunIcon className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('settings.appearance')}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('settings.appearanceDesc')}
                </p>
              </div>
            </div>
            <div className={`divide-y transition-colors duration-300 ${
              darkMode ? 'divide-gray-700' : 'divide-gray-100'
            }`}>
              <div className={`flex items-center justify-between p-4 transition-colors ${
                darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}>
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t('settings.darkMode')}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('settings.darkModeDesc')}
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Langue */}
          <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center gap-3 p-4 border-b transition-colors duration-300 ${
              darkMode ? 'border-gray-700 bg-green-900/30' : 'border-gray-200 bg-green-50'
            }`}>
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-green-900/50' : 'bg-green-100'
              }`}>
                <LanguageIcon className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('settings.language')}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('settings.languageDesc')}
                </p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleLanguageChange('fr')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    i18n.language === 'fr' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇫🇷 {t('language.french')}
                </button>
                <button
                  onClick={() => handleLanguageChange('mg')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    i18n.language === 'mg' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇲🇬 {t('language.malagasy')}
                </button>
              </div>
              <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('settings.currentLanguage')} : {languages.find(l => l.code === i18n.language)?.name}
              </p>
            </div>
          </div>

          {/* Notifications - Version simplifiée (affichage seulement) */}
          <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center gap-3 p-4 border-b transition-colors duration-300 ${
              darkMode ? 'border-gray-700 bg-yellow-900/30' : 'border-gray-200 bg-yellow-50'
            }`}>
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'
              }`}>
                <BellIcon className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <div>
                <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('settings.notifications')}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('settings.notificationsDesc')}
                </p>
              </div>
            </div>
            <div className={`divide-y transition-colors duration-300 ${
              darkMode ? 'divide-gray-700' : 'divide-gray-100'
            }`}>
              <div className={`flex items-center justify-between p-4 transition-colors ${
                darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}>
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t('settings.emailNotifications')}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('settings.emailNotificationsDesc')}
                  </p>
                </div>
               
              </div>

              <div className={`flex items-center justify-between p-4 transition-colors ${
                darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}>
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t('settings.smsNotifications')}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('settings.smsNotificationsDesc')}
                  </p>
                </div>
                
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center gap-3 p-4 border-b transition-colors duration-300 ${
              darkMode ? 'border-gray-700 bg-blue-900/30' : 'border-gray-200 bg-blue-50'
            }`}>
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
              }`}>
                <CheckCircleIcon className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('settings.information')}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('settings.informationDesc')}
                </p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className={`flex flex-col sm:flex-row justify-between py-2 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('settings.version')}
                </span>
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>2.0.0</span>
              </div>
              <div className={`flex flex-col sm:flex-row justify-between py-2 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('settings.platform')}
                </span>
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>
                  CUA - {t('settings.complaintManagement')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between py-2">
                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('settings.lastUpdate')}
                </span>
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>15 Juin 2024</span>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center gap-3 p-4 border-b transition-colors duration-300 ${
              darkMode ? 'border-gray-700 bg-indigo-900/30' : 'border-gray-200 bg-indigo-50'
            }`}>
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
              }`}>
                <GlobeAltIcon className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <div>
                <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('settings.support')}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('settings.supportDesc')}
                </p>
              </div>
            </div>
            <div className="p-4">
              <p className={darkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>
                {t('contact.supportDesc')} : 
                <a href="mailto:support@cua.mg" className={`ml-1 hover:underline ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  support@cua.mg
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default ParametresPublics;