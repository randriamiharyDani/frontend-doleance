// src/backoffice/Settings.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
      toast.error('Veuillez choisir un agent destinataire');
      return;
    }
    setCallSaving(true);
    try {
      const res = await citoyenCallService.updateRecipient(Number(selectedAgentId));
      const config = res?.data?.config || res?.config || null;
      setCallConfig(config);
      toast.success('Agent destinataire mis à jour');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
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
  const [greenNumbers, setGreenNumbers] = useState({ greenNumberCua: '', greenNumberTelma: '', greenNumberOrange: '' });
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
        setGreenNumbers({ greenNumberCua: '', greenNumberTelma: '', greenNumberOrange: '', ...(data.greenNumbers || {}) });
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
      toast.error(`Numéro requis pour : ${invalid.libelle}`);
      return;
    }
    setContactsSaving(true);
    try {
      await siteSettingsService.updateContacts(
        emergencyContacts.map((c) => ({ code: c.code, libelle: c.libelle, telephone: c.telephone.trim() }))
      );
      toast.success("Contacts d'urgence mis à jour");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour des contacts");
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
      toast.success('Réseaux sociaux mis à jour');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour des réseaux sociaux');
    } finally {
      setSocialsSaving(false);
    }
  };

  const handleGreenNumberChange = (key, value) => {
    setGreenNumbers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveGreenNumbers = async () => {
    const invalid = Object.entries(greenNumbers).find(([key, value]) => !(value || '').trim());
    if (invalid) {
      toast.error('Veuillez renseigner tous les numéros verts');
      return;
    }
    setGreenSaving(true);
    try {
      await siteSettingsService.updateGreenNumbers({
        greenNumberCua: greenNumbers.greenNumberCua.trim(),
        greenNumberTelma: greenNumbers.greenNumberTelma.trim(),
        greenNumberOrange: greenNumbers.greenNumberOrange.trim(),
      });
      toast.success('Numéros verts mis à jour');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour des numéros verts');
    } finally {
      setGreenSaving(false);
    }
  };

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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Personnalisez votre expérience</p>
        </div>
      </div>

      {/* Apparence */}
      <div className="card">
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-50 dark:bg-violet-900/30">
            {darkMode ? <MoonIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" /> : <SunIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Apparence</h2>
            <p className="text-xs text-gray-400">Personnalisez l'affichage</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Mode sombre</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Réduit la fatigue oculaire en environnement peu éclairé
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
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Changer le mot de passe</h2>
            <p className="text-xs text-gray-400">Modifiez votre mot de passe régulièrement</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Mot de passe actuel</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Nouveau mot de passe</label>
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
              <label className="label">Confirmer le mot de passe</label>
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
                    <><CheckCircleIcon className="w-3.5 h-3.5" /> Les mots de passe correspondent</>
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                {showPassword ? 'Masquer' : 'Afficher'} les mots de passe
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-md"
              >
                {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />}
                {loading ? 'Changement...' : 'Changer le mot de passe'}
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
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Appels citoyens</h2>
              <p className="text-xs text-gray-400">
                Configurez l'agent destinataire des appels directs Citoyen → Agent
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {callConfig && (
              <div className="mb-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Agent destinataire actuel
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
                    {callConfig.disponible ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>
            )}

            <label className="label">Choisir l'agent destinataire</label>
            {callAgents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                Aucun agent disponible (rôle requis : administrateur système ou agent central)
              </p>
            ) : (
              <div className="flex items-center gap-3">
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="input flex-1"
                  disabled={callLoading}
                >
                  <option value="">— Sélectionner un agent —</option>
                  {callAgents.map((a) => (
                    <option key={a.id_utilisateur} value={a.id_utilisateur}>
                      {`${a.prenom || ''} ${a.nom || ''}`.trim()} — {a.email}
                      {a.disponible ? ' (en ligne)' : ''}
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
                  {callSaving ? 'Enregistrement...' : 'Enregistrer'}
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
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Contacts d'urgence</h2>
              <p className="text-xs text-gray-400">
                Numéros affichés dans la barre d'urgence du site public
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {contactsLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">Chargement...</p>
            ) : emergencyContacts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                Aucun contact d'urgence configuré
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
                          placeholder="Ex : 034 12 345 67"
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
                    {contactsSaving ? 'Enregistrement...' : "Enregistrer les contacts"}
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
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Réseaux sociaux</h2>
              <p className="text-xs text-gray-400">
                Numéro WhatsApp et liens Facebook / Instagram affichés dans le pied de page du site public
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {socialsLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">Chargement...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Numéro WhatsApp</label>
                    <input
                      type="tel"
                      value={socials.whatsapp}
                      onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                      className="input"
                      placeholder="Ex : 034 00 000 00"
                    />
                  </div>
                  <div>
                    <label className="label">Lien Facebook</label>
                    <input
                      type="url"
                      value={socials.facebook}
                      onChange={(e) => handleSocialChange('facebook', e.target.value)}
                      className="input"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="label">Lien Instagram</label>
                    <input
                      type="url"
                      value={socials.instagram}
                      onChange={(e) => handleSocialChange('instagram', e.target.value)}
                      className="input"
                      placeholder="https://instagram.com/..."
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
                    {socialsSaving ? 'Enregistrement...' : 'Enregistrer les réseaux sociaux'}
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
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Numéros verts</h2>
              <p className="text-xs text-gray-400">
                Numéros verts affichés dans le pied de page du site public (CUA, Telma, Orange)
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {greenLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">Chargement...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">CUA (147)</label>
                    <input
                      type="tel"
                      value={greenNumbers.greenNumberCua}
                      onChange={(e) => handleGreenNumberChange('greenNumberCua', e.target.value)}
                      className="input"
                      placeholder="Ex : 147"
                    />
                  </div>
                  <div>
                    <label className="label">Telma</label>
                    <input
                      type="tel"
                      value={greenNumbers.greenNumberTelma}
                      onChange={(e) => handleGreenNumberChange('greenNumberTelma', e.target.value)}
                      className="input"
                      placeholder="Ex : +261 34 222 11 11"
                    />
                  </div>
                  <div>
                    <label className="label">Orange</label>
                    <input
                      type="tel"
                      value={greenNumbers.greenNumberOrange}
                      onChange={(e) => handleGreenNumberChange('greenNumberOrange', e.target.value)}
                      className="input"
                      placeholder="Ex : +261 32 113 32"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveGreenNumbers}
                    disabled={greenSaving || greenLoading}
                    className="btn-primary btn-md"
                  >
                    {greenSaving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />}
                    {greenSaving ? 'Enregistrement...' : 'Enregistrer les numéros verts'}
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
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Informations du compte</h2>
            <p className="text-xs text-gray-400">Détails de votre compte utilisateur</p>
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
