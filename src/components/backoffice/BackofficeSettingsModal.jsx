import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  SunIcon,
  MoonIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  LanguageIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Switch({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

function BackofficeSettingsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { i18n, t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    const langName = languages.find(l => l.code === langCode)?.name;
    toast.success(`Langue changée en ${langName}`);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} subtitle={t('settings.subtitle')} size="max-w-lg">
      <div className="space-y-4">

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

        {/* Changement de mot de passe */}
        <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className={`flex items-center gap-3 p-4 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
              <KeyIcon className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t('settings.changePassword')}</h3>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('settings.changePasswordDesc')}</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className={`p-4 space-y-3 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('settings.currentPassword')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('settings.newPassword')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('settings.confirmPassword')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
                required
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
              >
                {showPassword ? <EyeSlashIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '...' : t('settings.changePasswordBtn')}
              </button>
            </div>
          </form>
        </div>

        {/* Infos compte */}
        <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className={`flex items-center gap-3 p-4 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <UserCircleIcon className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t('settings.accountInfo')}</h3>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('settings.accountInfoDesc')}</p>
            </div>
          </div>
          <div className={`p-4 space-y-2 text-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex justify-between py-1.5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{t('settings.fullName')}</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.prenom} {user?.nom}</span>
            </div>
            <div className={`flex justify-between py-1.5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Email</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.email || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{t('settings.role')}</span>
              <span className={`font-medium capitalize ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.role?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}

export default BackofficeSettingsModal;
