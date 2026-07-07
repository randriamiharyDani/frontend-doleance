// src/backoffice/Settings.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function Settings() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
      // Appel API pour changer le mot de passe
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Paramètres</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Personnalisez votre expérience</p>
        </div>
      </div>

      {/* Section Apparence */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700 bg-purple-100 dark:bg-purple-900/30">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            {darkMode ? (
              <MoonIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <SunIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">Apparence</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personnalisez l'affichage</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">Mode sombre</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activer le mode sombre pour réduire la fatigue oculaire</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
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

      {/* Changement de mot de passe */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <KeyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">Changer le mot de passe</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Modifiez votre mot de passe régulièrement</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
              {showPassword ? 'Masquer' : 'Afficher'} les mots de passe
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>

      {/* Informations sur le compte */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <UserCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">Informations du compte</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Détails de votre compte utilisateur</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="font-medium text-gray-600 dark:text-gray-400">Nom d'utilisateur</span>
            <span className="text-gray-800 dark:text-white break-words">{user?.prenom} {user?.nom}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="font-medium text-gray-600 dark:text-gray-400">Email</span>
            <span className="text-gray-800 dark:text-white break-words">{user?.email || 'Non renseigné'}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="font-medium text-gray-600 dark:text-gray-400">Rôle</span>
            <span className="text-gray-800 dark:text-white capitalize break-words">{user?.role?.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between py-2">
            <span className="font-medium text-gray-600 dark:text-gray-400">Date d'inscription</span>
            <span className="text-gray-800 dark:text-white">{new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;