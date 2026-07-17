// src/backoffice/Settings.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  SunIcon,
  MoonIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

// ---- Design tokens ---------------------------------------------------
// Même identité que les autres écrans du backoffice : navy #1E3A8A /
// #0F172A, accent or #D4AF37. Le mode sombre reste piloté par ThemeContext.

function SectionCard({ icon: Icon, iconBg, iconColor, title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <h2 className="font-bold text-[#0F172A] dark:text-white text-sm">{title}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/40 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex-shrink-0 ${
        checked ? 'bg-[#1E3A8A]' : 'bg-slate-200 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function PasswordField({ label, value, onChange, show, required, minLength }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-transparent rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:border-[#1E3A8A]/30 focus:bg-white dark:focus:bg-slate-700 transition-all"
        required={required}
        minLength={minLength}
      />
    </div>
  );
}

function passwordStrength(pwd) {
  if (!pwd) return { score: 0, label: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Très faible', 'Faible', 'Correct', 'Bon', 'Fort'];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

function Settings() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const strength = useMemo(() => passwordStrength(passwordData.newPassword), [passwordData.newPassword]);
  const strengthColors = ['bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500'];

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
      const response = await api.post('/auth/change-password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.data.success) {
        toast.success('Mot de passe modifié avec succès');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || '?';

  const infoRows = [
    { icon: IdentificationIcon, label: "Nom d'utilisateur", value: `${user?.prenom || ''} ${user?.nom || ''}`.trim() || '—' },
    { icon: EnvelopeIcon, label: 'Email', value: user?.email || 'Non renseigné' },
    { icon: ShieldCheckIcon, label: 'Rôle', value: user?.role?.replace(/_/g, ' ') || '—', capitalize: true },
    { icon: CalendarDaysIcon, label: "Date d'inscription", value: new Date().toLocaleDateString('fr-FR') },
  ];

  return (
    <div className=" mx-auto p-4 sm:p-6 space-y-5">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">Paramètres</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Personnalisez votre expérience</p>
        </div>
      </div>

      {/* Apparence */}
      <SectionCard
        icon={darkMode ? MoonIcon : SunIcon}
        iconBg="bg-violet-50 dark:bg-violet-900/30"
        iconColor="text-violet-600 dark:text-violet-400"
        title="Apparence"
        subtitle="Personnalisez l'affichage"
      >
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <h3 className="font-semibold text-sm text-[#0F172A] dark:text-white">Mode sombre</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Réduit la fatigue oculaire en environnement peu éclairé
            </p>
          </div>
          <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
        </div>
      </SectionCard>

      {/* Mot de passe */}
      <SectionCard
        icon={KeyIcon}
        iconBg="bg-amber-50 dark:bg-amber-900/30"
        iconColor="text-amber-600 dark:text-amber-400"
        title="Changer le mot de passe"
        subtitle="Modifiez votre mot de passe régulièrement"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <PasswordField
            label="Mot de passe actuel"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            show={showPassword}
            required
          />

          <div>
            <PasswordField
              label="Nouveau mot de passe"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              show={showPassword}
              required
              minLength={6}
            />
            {passwordData.newPassword && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strengthColors[Math.min(strength.score, 4)]}`}
                    style={{ width: `${(Math.min(strength.score, 5) / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 w-16 text-right">{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <PasswordField
              label="Confirmer le mot de passe"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              show={showPassword}
              required
            />
            {passwordData.confirmPassword && (
              <p
                className={`mt-1.5 text-xs flex items-center gap-1 ${
                  passwordData.confirmPassword === passwordData.newPassword ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {passwordData.confirmPassword === passwordData.newPassword ? (
                  <>
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Les mots de passe correspondent
                  </>
                ) : (
                  'Les mots de passe ne correspondent pas encore'
                )}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#0F172A] dark:hover:text-blue-300 transition-colors"
            >
              {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              {showPassword ? 'Masquer' : 'Afficher'} les mots de passe
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-semibold text-sm hover:bg-[#0F172A] disabled:opacity-50 shadow-sm transition-colors"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Infos du compte */}
      <SectionCard
        icon={UserCircleIcon}
        iconBg="bg-emerald-50 dark:bg-emerald-900/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        title="Informations du compte"
        subtitle="Détails de votre compte utilisateur"
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {infoRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">
                <row.icon className="w-4 h-4 text-slate-400" />
                {row.label}
              </span>
              <span
                className={`text-sm font-medium text-[#0F172A] dark:text-white text-right break-words ${
                  row.capitalize ? 'capitalize' : ''
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default Settings;
