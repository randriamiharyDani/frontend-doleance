// src/backoffice/Settings.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  PhoneIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import citoyenCallService from '../services/citoyenCallService';
import siteSettingsService from '../services/siteSettingsService';

// ---- Design tokens ---------------------------------------------------
// Même identité que les autres écrans du backoffice : navy #1E3A8A /
// #0F172A, accent or #D4AF37. Le mode sombre reste piloté par ThemeContext.


// Champs « numéros verts » réellement éditables dans cet écran.
// Le backend expose aussi greenNumberTelma (non géré ici) : il ne doit
// jamais entrer dans l'état du formulaire, sinon la validation échoue.
const GREEN_NUMBER_FIELDS = ['greenNumberCua', 'greenNumberOrange'];

function passwordStrength(pwd, t) {
  if (!pwd) return { score: 0, label: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['strength0', 'strength1', 'strength2', 'strength3', 'strength4'].map(
    (k) => t('settings.password.' + k),
  );
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

function Settings() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  // `i18n` est nécessaire pour le formatage de la date d'inscription
  // (voir infoRows) : sans lui, i18n.language lève un ReferenceError.
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ===== Appels citoyens (Admin) =====
  const isAdmin = ['administrateur_systeme', 'agent_central'].includes(user?.role);
  const [callConfig, setCallConfig] = useState(null);
  const [callAgents, setCallAgents] = useState([]);
  const [callLoading, setCallLoading] = useState(false);
  const [callSaving, setCallSaving] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    citoyenCallService.getRecipient()
      .then((res) => {
        if (!mounted) return;
        const config = res?.data?.config || res?.config || null;
        const agents = res?.data?.agents || res?.agents || [];
        setCallConfig(config);
        setCallAgents(agents);
        setSelectedAgentId(config?.id_utilisateur ? String(config.id_utilisateur) : '');
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [isAdmin]);

  const handleSaveRecipient = async () => {
    if (!selectedAgentId) {
      toast.error(t('settings.calls.agentRequired'));
      return;
    }
    setCallSaving(true);
    try {
      const res = await citoyenCallService.updateRecipient(Number(selectedAgentId));
      const config = res?.data?.config || res?.config || null;
      setCallConfig(config);
      toast.success(t('settings.calls.agentUpdated'));
    } catch (error) {
      // On journalise le détail technique mais on affiche un message traduit :
      // le message du serveur peut être vide ou techniques en cas d'erreur 500.
      console.error('Échec mise à jour de l\'agent destinataire:', error);
      toast.error(t('settings.calls.error'));
    } finally {
      setCallSaving(false);
    }
  };

  // ===== Contacts d'urgence + Réseaux sociaux (Admin) =====
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsSaving, setContactsSaving] = useState(false);
  const [socials, setSocials] = useState({ whatsapp: '', facebook: '', instagram: '' });
  const [socialsLoading, setSocialsLoading] = useState(false);
  const [socialsSaving, setSocialsSaving] = useState(false);
  const [greenNumbers, setGreenNumbers] = useState({ greenNumberCua: '', greenNumberOrange: '' });
  const [greenErrors, setGreenErrors] = useState({});
  const [greenLoading, setGreenLoading] = useState(false);
  const [greenSaving, setGreenSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    setContactsLoading(true);
    setSocialsLoading(true);
    setGreenLoading(true);
    siteSettingsService.getSettings()
      .then((res) => {
        if (!mounted) return;
        const data = res?.data || {};
        setEmergencyContacts(Array.isArray(data.contacts) ? data.contacts : []);
        setSocials({ whatsapp: '', facebook: '', instagram: '', ...(data.socials || {}) });
        const remote = data.greenNumbers || {};
        setGreenNumbers({
          greenNumberCua: (remote.greenNumberCua || '').toString().trim(),
          greenNumberOrange: (remote.greenNumberOrange || '').toString().trim(),
        });
        setGreenErrors({});
      })
      .catch(() => {})
      .finally(() => {
        setContactsLoading(false);
        setSocialsLoading(false);
        setGreenLoading(false);
      });
    return () => { mounted = false; };
  }, [isAdmin]);

  const handleContactPhoneChange = (code, value) => {
    setEmergencyContacts((prev) => prev.map((c) => (c.code === code ? { ...c, telephone: value } : c)));
  };

  const handleSaveContacts = async () => {
    const invalid = emergencyContacts.find((c) => !(c.telephone || '').trim());
    if (invalid) {
      toast.error(t('settings.emergencyContacts.phoneRequired', { libelle: invalid.libelle }));
      return;
    }
    setContactsSaving(true);
    try {
      await siteSettingsService.updateContacts(
        emergencyContacts.map((c) => ({ code: c.code, libelle: c.libelle, telephone: c.telephone.trim() }))
      );
      toast.success(t('settings.emergencyContacts.success'));
    } catch (error) {
      console.error('Échec mise à jour des contacts:', error);
      toast.error(t('settings.emergencyContacts.error'));
    } finally {
      setContactsSaving(false);
    }
  };

  const handleSocialChange = (key, value) => {
    setSocials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSocials = async () => {
    setSocialsSaving(true);
    try {
      await siteSettingsService.updateSocials({
        whatsapp: socials.whatsapp.trim(),
        facebook: socials.facebook.trim(),
        instagram: socials.instagram.trim(),
      });
      toast.success(t('settings.socials.success'));
    } catch (error) {
      console.error('Échec mise à jour des réseaux sociaux:', error);
      toast.error(t('settings.socials.error'));
    } finally {
      setSocialsSaving(false);
    }
  };

  const handleGreenNumberChange = (key, value) => {
    setGreenNumbers((prev) => ({ ...prev, [key]: value }));
    if (greenErrors[key]) {
      setGreenErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSaveGreenNumbers = async () => {
    // Validation limitée aux champs réellement éditables : chaque champ
    // est contrôlé séparément pour indiquer précisément lequel manque.
    const errors = {};
    for (const key of GREEN_NUMBER_FIELDS) {
      const value = (greenNumbers[key] || '').trim();
      if (!value) {
        errors[key] = t('settings.greenNumbers.required');
      } else if (!/^[+]?[\d\s().-]+$/.test(value)) {
        errors[key] = t('settings.greenNumbers.invalid');
      }
    }

    if (Object.keys(errors).length > 0) {
      setGreenErrors(errors);
      toast.error(t('settings.greenNumbers.missingError'));
      return;
    }

    setGreenErrors({});
    setGreenSaving(true);
    try {
      const res = await siteSettingsService.updateGreenNumbers({
        greenNumberCua: greenNumbers.greenNumberCua.trim(),
        greenNumberOrange: greenNumbers.greenNumberOrange.trim(),
      });
      // Resynchronise avec ce qui a réellement été enregistré.
      const saved = res?.data?.greenNumbers;
      if (saved) {
        setGreenNumbers({
          greenNumberCua: (saved.greenNumberCua || '').toString().trim(),
          greenNumberOrange: (saved.greenNumberOrange || '').toString().trim(),
        });
      }
      toast.success(t('settings.greenNumbers.success'));
    } catch (error) {
      // Le message du serveur est en français : on journalise le détail
      // technique mais on affiche un message traduit à l'utilisateur.
      console.error('Échec mise à jour des numéros verts:', error);
      toast.error(t('settings.greenNumbers.saveError'));
    } finally {
      setGreenSaving(false);
    }
  };

  const strength = useMemo(
    () => passwordStrength(passwordData.newPassword, t),
    [passwordData.newPassword, t],
  );
  const strengthColors = ['bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500'];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('settings.password.errorMismatch'));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t('settings.password.errorMinLength'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.data.success) {
        toast.success(t('settings.password.success'));
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        console.error('Changement de mot de passe refusé:', response.data.message);
        toast.error(t('settings.password.error'));
      }
    } catch (error) {
      console.error('Échec changement de mot de passe:', error);
      toast.error(t('settings.password.error'));
    } finally {
      setLoading(false);
    }
  };

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || '?';

  const infoRows = [
    { icon: IdentificationIcon, label: t('settings.account.username'), value: `${user?.prenom || ''} ${user?.nom || ''}`.trim() || '—' },
    { icon: EnvelopeIcon, label: t('settings.account.email'), value: user?.email || t('settings.account.notSet') },
    { icon: ShieldCheckIcon, label: t('settings.role'), value: user?.role?.replace(/_/g, ' ') || '—', capitalize: true },
    {
      icon: CalendarDaysIcon,
      label: t('settings.account.registeredAt'),
      value: new Date(user?.date_creation || Date.now()).toLocaleDateString(
        // i18n.language peut être 'fr', 'fr-FR', 'mg-MG'... : on compare sur
        // le préfixe comme dans DeposerDoleance.jsx, sinon le repli FR s'applique
        // à tort pour MG/EN détectés par le navigateur.
        i18n.language?.startsWith('mg') ? 'mg-MG' : i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Apparence */}
      <div className="card">
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-50 dark:bg-violet-900/30">
            {darkMode ? <MoonIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" /> : <SunIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">{t('settings.appearance')}</h2>
            <p className="text-xs text-gray-400">{t('settings.appearanceDesc')}</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{t('settings.darkMode')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('settings.darkModeHint')}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex-shrink-0 ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="card">
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50 dark:bg-amber-900/30">
            <KeyIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">{t('settings.changePassword')}</h2>
            <p className="text-xs text-gray-400">{t('settings.changePasswordDesc')}</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">{t('settings.currentPassword')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">{t('settings.newPassword')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
                required
                minLength={6}
              />
              {passwordData.newPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strengthColors[Math.min(strength.score, 4)]}`}
                      style={{ width: `${(Math.min(strength.score, 5) / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 w-16 text-right">{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="label">{t('settings.confirmPassword')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                required
              />
              {passwordData.confirmPassword && (
                <p className={`mt-1.5 text-xs flex items-center gap-1 ${
                  passwordData.confirmPassword === passwordData.newPassword ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {passwordData.confirmPassword === passwordData.newPassword ? (
                    <><CheckCircleIcon className="w-3.5 h-3.5" /> {t('settings.password.match')}</>
                  ) : (
                    t('settings.password.mismatchYet')
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                {showPassword ? t('settings.password.hide') : t('settings.password.show')} {t('settings.password.showHideSuffix')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-md"
              >
                {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />}
                {loading ? t('settings.password.saving') : t('settings.password.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Appels citoyens (Admin) */}
      {/* {isAdmin && (
        <div className="card">
          <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/30">
              <PhoneIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">{t('settings.calls.title')}</h2>
              <p className="text-xs text-gray-400">
                {t('settings.calls.subtitle')}
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {callConfig && (
              <div className="mb-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {t('settings.calls.currentAgent')}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {`${callConfig.prenom || ''} ${callConfig.nom || ''}`.trim() || callConfig.email || '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {[callConfig.email, callConfig.nom_direction || callConfig.direction]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    callConfig.disponible
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${callConfig.disponible ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {callConfig.disponible ? t('settings.calls.online') : t('settings.calls.offline')}
                  </span>
                </div>
              </div>
            )}

            <label className="label">{t('settings.calls.chooseAgent')}</label>
            {callAgents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                {t('settings.calls.noAgent')}
              </p>
            ) : (
              <div className="flex items-center gap-3">
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="input flex-1"
                  disabled={callLoading}
                >
                  <option value="">{t('settings.calls.selectPlaceholder')}</option>
                  {callAgents.map((a) => (
                    <option key={a.id_utilisateur} value={a.id_utilisateur}>
                      {`${a.prenom || ''} ${a.nom || ''}`.trim()} — {a.email}
                      {a.disponible ? ` (${t('settings.calls.onlineLower')})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveRecipient}
                  disabled={callSaving || !selectedAgentId}
                  className="btn-primary btn-md whitespace-nowrap"
                >
                  {callSaving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />}
                  {callSaving ? t('settings.calls.saving') : t('settings.calls.submit')}
                </button>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Contacts d'urgence (Admin) */}
      {isAdmin && (
        <div className="card">
          <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50 dark:bg-red-900/30">
              <BellAlertIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">{t('settings.emergencyContacts.title')}</h2>
              <p className="text-xs text-gray-400">
                {t('settings.emergencyContacts.subtitle')}
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {contactsLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">{t('settings.emergencyContacts.loading')}</p>
            ) : emergencyContacts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                {t('settings.emergencyContacts.empty')}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.code}>
                      <label className="label">{contact.libelle}</label>
                      <div className="relative">
                        <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          value={contact.telephone || ''}
                          onChange={(e) => handleContactPhoneChange(contact.code, e.target.value)}
                          className="input pl-9"
                          placeholder={t('settings.emergencyContacts.phonePlaceholder')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveContacts}
                    disabled={contactsSaving || contactsLoading}
                    className="btn-primary btn-md"
                  >
                    {contactsSaving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />}
                    {contactsSaving ? t('settings.emergencyContacts.saving') : t('settings.emergencyContacts.submit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Réseaux sociaux - Footer public (Admin) */}
      {isAdmin && (
        <div className="card">
          <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-sky-50 dark:bg-sky-900/30">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">{t('settings.socials.title')}</h2>
              <p className="text-xs text-gray-400">
                {t('settings.socials.subtitle')}
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {socialsLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">{t('settings.emergencyContacts.loading')}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">{t('settings.socials.whatsapp')}</label>
                    <input
                      type="tel"
                      value={socials.whatsapp}
                      onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                      className="input"
                      placeholder={t('settings.socials.whatsappPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="label">{t('settings.socials.facebook')}</label>
                    <input
                      type="url"
                      value={socials.facebook}
                      onChange={(e) => handleSocialChange('facebook', e.target.value)}
                      className="input"
                      placeholder={t('settings.socials.facebookPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="label">{t('settings.socials.instagram')}</label>
                    <input
                      type="url"
                      value={socials.instagram}
                      onChange={(e) => handleSocialChange('instagram', e.target.value)}
                      className="input"
                      placeholder={t('settings.socials.instagramPlaceholder')}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSocials}
                    disabled={socialsSaving || socialsLoading}
                    className="btn-primary btn-md"
                  >
                    {socialsSaving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />}
                    {socialsSaving ? t('settings.socials.saving') : t('settings.socials.submit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Numéros verts - Footer public (Admin) */}
      {isAdmin && (
        <div className="card">
          <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/30">
              <PhoneIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">{t('settings.greenNumbers.title')}</h2>
              <p className="text-xs text-gray-400">
                {t('settings.greenNumbers.subtitle')}
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {greenLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">{t('settings.greenNumbers.loading')}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GREEN_NUMBER_FIELDS.map((key) => (
                    <div key={key}>
                      <label className="label">
                        {t(`settings.greenNumbers.${key === 'greenNumberCua' ? 'violence' : 'doleance'}`)}
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={greenNumbers[key] ?? ''}
                        onChange={(e) => handleGreenNumberChange(key, e.target.value)}
                        onBlur={() => {
                          const value = (greenNumbers[key] || '').trim();
                          setGreenNumbers((prev) => ({ ...prev, [key]: value }));
                        }}
                        aria-invalid={greenErrors[key] ? 'true' : 'false'}
                        aria-describedby={greenErrors[key] ? `green-error-${key}` : undefined}
                        className={`input ${greenErrors[key] ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder={t(`settings.greenNumbers.${key === 'greenNumberCua' ? 'violencePlaceholder' : 'doleancePlaceholder'}`)}
                      />
                      {greenErrors[key] && (
                        <p
                          id={`green-error-${key}`}
                          className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400"
                        >
                          {greenErrors[key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveGreenNumbers}
                    disabled={greenSaving || greenLoading}
                    className="btn-primary btn-md"
                  >
                    {greenSaving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />}
                    {greenSaving ? t('settings.greenNumbers.saving') : t('settings.greenNumbers.saveButton')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Infos du compte */}
      <div className="card">
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/30">
            <UserCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">{t('settings.accountInfo')}</h2>
            <p className="text-xs text-gray-400">{t('settings.accountInfoDesc')}</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                  <row.icon className="w-4 h-4 text-gray-400" />
                  {row.label}
                </span>
                <span className={`text-sm font-medium text-gray-900 dark:text-white text-right break-words ${
                  row.capitalize ? 'capitalize' : ''
                }`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
