import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { translateCategory } from '../i18n/category';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  PhotoIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Titre de section homogène (pastille icône + libellé)
const SectionTitle = ({ icon: Icon, darkMode, children }) => (
  <h3
    className={`flex items-center gap-2.5 mb-3 text-[13px] font-semibold uppercase tracking-wider ${
      darkMode ? 'text-slate-200' : 'text-[#0F172A]'
    }`}
  >
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
        darkMode ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-[#1E3A8A]/10 text-[#1E3A8A]'
      }`}
    >
      <Icon className="h-4 w-4" />
    </span>
    {children}
  </h3>
);

// Tuile d'information (icône + libellé + valeur)
const InfoTile = ({ icon: Icon, label, darkMode, className = '', children }) => (
  <div
    className={`flex items-start gap-3 rounded-xl border p-3.5 ${
      darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50/70 border-slate-200'
    } ${className}`}
  >
    <span
      className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
        darkMode ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-[#1E3A8A]/10 text-[#1E3A8A]'
      }`}
    >
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p
        className={`text-[11px] font-semibold uppercase tracking-wider ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        {label}
      </p>
      <div
        className={`mt-0.5 text-sm font-medium break-words ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}
      >
        {children}
      </div>
    </div>
  </div>
);

function SuiviDoleance() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { reference } = useParams();
  const [searchRef, setSearchRef] = useState(reference || '');
  const [doleance, setDoleance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [reponseIdentifiant, setReponseIdentifiant] = useState('');
  const [reponseMessage, setReponseMessage] = useState('');
  const [sendingReponse, setSendingReponse] = useState(false);
  const [reponseEnvoyee, setReponseEnvoyee] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchRef.trim()) {
      toast.error(t('tracking.enterReference'));
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.get(`/doleances/public/${searchRef}`);
      const data = response.data?.data || response.data;

      // Masquer les informations personnelles du citoyen
      if (data) {
        delete data.nom_citoyen;
        delete data.prenom_citoyen;
        delete data.telephone_citoyen;
        delete data.email_citoyen;
        delete data.adresse_citoyen;
      }

      setDoleance(data);
    } catch (error) {
      setDoleance(null);
      toast.error(t('tracking.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenReponse = async (e) => {
    e.preventDefault();
    if (!reponseIdentifiant.trim() || !reponseMessage.trim()) {
      toast.error(t('tracking.fillAllFields'));
      return;
    }
    setSendingReponse(true);
    try {
      const response = await api.post(`/doleances/public/${searchRef}/reponse`, {
        identifiant_citoyen: reponseIdentifiant.trim(),
        message: reponseMessage.trim()
      });
      if (response.data?.success) {
        toast.success(t('tracking.responseSent'));
        setReponseMessage('');
        setReponseEnvoyee(true);
        handleSearch(e);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('tracking.responseError'));
    } finally {
      setSendingReponse(false);
    }
  };

  // Palette institutionnelle CUA : navy (#0F172A), bleu (#1E3A8A), or (#D4AF37).
  // Le code couleur des statuts reste sémantique (chaque étape du traitement
  // garde une teinte distincte) mais harmonisé avec l'identité de la commune.
  const getStatusColor = (statut) => {
    const colors = {
      'Nouvelle': 'bg-[#1E3A8A] text-white border-[#1E3A8A]',
      'En attente': 'bg-amber-500 text-white border-amber-600',
      'Assignée': 'bg-indigo-600 text-white border-indigo-700',
      'En traitement': 'bg-purple-600 text-white border-purple-700',
      'Résolue': 'bg-emerald-600 text-white border-emerald-700',
      'Clôturée': 'bg-slate-500 text-white border-slate-600',
      'Rejetée': 'bg-red-500 text-white border-red-600',
      'Urgente': 'bg-red-600 text-white border-red-700'
    };
    return colors[statut] || 'bg-slate-500 text-white border-slate-600';
  };

  const getCategoryIcon = (categorie) => {
    const icons = {
      'Voirie': '🛣️',
      'Éclairage public': '💡',
      'Assainissement': '🚰',
      'Déchets': '🗑️',
      'Sécurité': '👮',
      'Urbanisme': '🏗️',
      'Transport': '🚌',
      'Social': '🤝',
      'Culture': '🎨',
      'Sport': '⚽',
      'Environnement': '🌳',
      'Autre': '📋',
      'Autre (Hafa)': '📋'
    };
    return icons[categorie] || '📋';
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return t('allComplaints.unknownDate');
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`cua-suivi transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <style>{`
        .cua-suivi { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cua-suivi .cua-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .cua-suivi .cua-field:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.14);
        }
        .cua-suivi .cua-btn-primary {
          background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2E4FA3 100%);
          transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
        }
        .cua-suivi .cua-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .cua-suivi .cua-gold-bar {
          background: linear-gradient(180deg, #D4AF37 0%, #B9962C 100%);
        }
        .cua-suivi .cua-top-accent {
          background: linear-gradient(90deg, #0F172A, #D4AF37, #0F172A);
        }
      `}</style>

      <div className="max-w-4xl mx-auto w-full">
        {/* ===== Titre de page ===== */}
        <div className="text-center mb-6 sm:mb-8">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-semibold mb-4 ${
            darkMode
              ? 'text-[#D4AF37] bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/20'
              : 'text-[#9A7200] bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/30'
          }`}>
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Commune Urbaine d'Antananarivo
          </span>
          <h1 className={`cua-display text-xl sm:text-3xl font-semibold tracking-tight mb-2 ${
            darkMode ? 'text-white' : 'text-[#0F172A]'
          }`}>
            {t('tracking.title')}
          </h1>
          <p className={`max-w-xl mx-auto text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('tracking.subtitle')}
          </p>
        </div>

        {/* ===== Recherche ===== */}
        <div className={`rounded-2xl shadow-lg p-4 sm:p-5 mb-6 sm:mb-8 border transition-colors duration-300 relative overflow-hidden ${
          darkMode
            ? 'bg-slate-800 border-slate-700 shadow-black/20'
            : 'bg-white border-slate-200 shadow-slate-900/5'
        }`}>
          <div className="cua-top-accent absolute top-0 left-0 right-0 h-1" />
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 ${
                darkMode ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <input
                type="text"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                placeholder={t('tracking.referencePlaceholder')}
                className={`cua-field w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none transition-all text-sm sm:text-base font-mono ${
                  darkMode
                    ? 'bg-slate-900/60 border-slate-600 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="cua-btn-primary inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 font-semibold rounded-xl disabled:opacity-50 shadow-md text-sm sm:text-base text-white"
            >
              {loading ? t('tracking.searching') : t('tracking.search')}
            </button>
          </form>
        </div>

        {searched && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className={`animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 mx-auto ${
                  darkMode ? 'border-[#D4AF37]' : 'border-[#1E3A8A]'
                }`}></div>
              </div>
            ) : doleance ? (
              <div className={`rounded-2xl shadow-lg overflow-hidden border transition-colors duration-300 ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 shadow-black/20'
                  : 'bg-white border-slate-200 shadow-slate-900/5'
              }`}>
                {/* En-tête avec référence et statut actuel */}
                <div className={`p-4 sm:p-6 border-b transition-colors duration-300 relative ${
                  darkMode
                    ? 'bg-slate-900/40 border-slate-700'
                    : 'bg-gradient-to-r from-[#F8FAFC] via-white to-[#F8FAFC] border-slate-200'
                }`}>
                  <div className="cua-top-accent absolute top-0 left-0 right-0 h-1" />
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 pt-1">
                    <div className="flex-1 w-full min-w-0">
                      <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {t('tracking.reference')}
                      </p>
                      <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-sm sm:text-base font-bold break-all ${
                        darkMode
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] ring-1 ring-[#D4AF37]/25'
                          : 'bg-[#1E3A8A]/[0.06] text-[#1E3A8A] ring-1 ring-[#1E3A8A]/15'
                      }`}>
                        <DocumentTextIcon className="h-4 w-4 flex-shrink-0" />
                        {doleance.reference}
                      </span>
                      <h2 className={`cua-display text-lg sm:text-2xl font-semibold mt-3 break-words leading-snug ${
                        darkMode ? 'text-white' : 'text-[#0F172A]'
                      }`}>
                        {doleance.titre}
                      </h2>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 w-full md:w-auto">
                      <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm ${getStatusColor(doleance.statut)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                        {doleance.statut}
                      </span>
                      <p className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <ClockIcon className="h-3.5 w-3.5" />
                        {t('tracking.lastUpdate')} : {formatDate(doleance.date_derniere_modification || doleance.date_creation)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6 sm:space-y-7">
                  {/* Description détaillée */}
                  <div>
                    <SectionTitle icon={InformationCircleIcon} darkMode={darkMode}>
                      {t('tracking.details')}
                    </SectionTitle>
                    <div className={`rounded-xl p-4 border ${
                      darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50/70 border-slate-200'
                    }`}>
                      <p className={`whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed ${
                        darkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        {doleance.description}
                      </p>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Catégorie */}
                    <InfoTile icon={TagIcon} label={t('form.category')} darkMode={darkMode}>
                      {getCategoryIcon(doleance.categorie)} {translateCategory(doleance.categorie, t)}
                    </InfoTile>

                    {/* Date de création */}
                    <InfoTile icon={CalendarIcon} label={t('tracking.submittedOn')} darkMode={darkMode}>
                      {formatDate(doleance.date_creation)}
                    </InfoTile>

                    {/* Direction concernée */}
                    {doleance.nom_direction && doleance.nom_direction !== 'Non assignée' && (
                      <InfoTile icon={BuildingOfficeIcon} label={t('tracking.concernedDirection')} darkMode={darkMode}>
                        {doleance.nom_direction}
                      </InfoTile>
                    )}

                    {/* Lieu */}
                    {(doleance.lieu_exact || doleance.nom_quartier) && (
                      <InfoTile
                        icon={MapPinIcon}
                        label={t('tracking.location')}
                        darkMode={darkMode}
                        className="sm:col-span-2"
                      >
                        {doleance.lieu_exact && <span>{doleance.lieu_exact}</span>}
                        {doleance.lieu_exact && doleance.nom_quartier && <span> - </span>}
                        {doleance.nom_quartier && <span>{t('form.neighborhood')}: {doleance.nom_quartier}</span>}
                      </InfoTile>
                    )}
                  </div>

                  {/* Photos / Pièces jointes */}
                  {doleance.pieces_jointes && doleance.pieces_jointes.length > 0 && (
                    <div>
                      <SectionTitle icon={PhotoIcon} darkMode={darkMode}>
                        {t('form.photosProbleme')} ({doleance.pieces_jointes.length})
                      </SectionTitle>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {doleance.pieces_jointes.map((piece, index) => {
                          const ext = piece.nom_fichier?.split('.').pop()?.toLowerCase();
                          const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext);
                          const isPdf = ext === 'pdf';
                          return (
                          <div
                            key={index}
                            onClick={() => isVideo || isPdf ? null : setLightboxImage(piece.url)}
                            className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ${
                              darkMode
                                ? 'border-slate-600 hover:border-[#D4AF37]'
                                : 'border-slate-200 hover:border-[#D4AF37]'
                            }`}
                          >
                            {isVideo && piece.url ? (
                              <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                                <video src={piece.url} className="w-full h-full object-cover" preload="metadata" muted />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                  </div>
                                </div>
                              </div>
                            ) : isPdf ? (
                              <div className="w-full h-full bg-red-50 dark:bg-red-900/10 flex flex-col items-center justify-center">
                                <svg className="h-10 w-10 text-red-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase">PDF</span>
                              </div>
                            ) : (
                              <img
                                src={piece.url}
                                alt={piece.nom_fichier}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <p className="text-[10px] font-medium text-slate-700 truncate">{piece.nom_fichier}</p>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {doleance.suggestions && (
                    <div>
                      <SectionTitle icon={ChatBubbleLeftRightIcon} darkMode={darkMode}>
                        {t('form.suggestions')}
                      </SectionTitle>
                      <div className={`rounded-xl p-4 border ${
                        darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#1E3A8A]/[0.04] border-[#1E3A8A]/10'
                      }`}>
                        <p className={`text-sm sm:text-[15px] leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          {doleance.suggestions}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Historique du traitement - Statuts côte à côte responsive */}
                  {/* <div>
                    <h3 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${
                      darkMode ? 'text-white' : 'text-[#1E3A8A]'
                    }`}>
                      <div className="cua-gold-bar w-1 h-5 sm:h-6 rounded-full"></div>
                      <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-[#D4AF37]' : 'text-[#1E3A8A]'}`} />
                      {t('tracking.history')}
                    </h3>
                    {doleance.historique && doleance.historique.length > 0 ? (
                      <div className="overflow-x-auto pb-2">
                        <div className="flex flex-wrap gap-2 sm:gap-3 min-w-[280px]">
                          {doleance.historique.filter(h => !h.nouveau_statut?.toLowerCase().includes('transfert')).map((hist, index) => (
                            <div key={index} className="flex items-center gap-1 sm:gap-2">
                              <div className={`rounded-lg px-2 py-1 sm:px-3 sm:py-2 border-2 min-w-[100px] sm:min-w-[130px] shadow-sm ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'
                              }`}>
                                <div className="flex flex-col items-center gap-1 sm:gap-2">
                                  <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs font-bold shadow-md text-center ${getStatusColor(hist.nouveau_statut)}`}>
                                    {hist.nouveau_statut}
                                  </span>
                                  <p className={`text-xs font-medium text-center ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                    {formatDate(hist.date_changement)}
                                  </p>
                                </div>
                              </div>
                              {index < doleance.historique.length - 1 && (
                                <span className={`text-base sm:text-lg font-bold ${darkMode ? 'text-[#D4AF37]' : 'text-[#D4AF37]'}`}>
                                  →
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-lg p-3 sm:p-4 text-center border-l-4 border-[#D4AF37] ${
                        darkMode ? 'bg-gray-700' : 'bg-slate-50'
                      }`}>
                        <p className={darkMode ? 'text-gray-300 text-sm sm:text-base' : 'text-slate-600 text-sm sm:text-base'}>
                          {t('tracking.noHistory')}
                        </p>
                      </div>
                    )}
                  </div> */}

                  {/* Réponses de la mairie */}
                  {/* {doleance.reponses && doleance.reponses.length > 0 && (
                    <div>
                      <h3 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${
                        darkMode ? 'text-white' : 'text-[#1E3A8A]'
                      }`}>
                        <div className="cua-gold-bar w-1 h-5 sm:h-6 rounded-full"></div>
                        <ChatBubbleLeftRightIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-[#D4AF37]' : 'text-[#1E3A8A]'}`} />
                        {t('tracking.municipalResponses')}
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {doleance.reponses.map((rep, index) => (
                          <div key={index} className={`rounded-lg p-3 sm:p-4 border-l-4 shadow-sm ${
                            rep.type_auteur === 'citoyen'
                              ? 'border-emerald-500'
                              : 'border-[#D4AF37]'
                          } ${
                            darkMode ? 'bg-gray-700' : 'bg-[#1E3A8A]/[0.04]'
                          }`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                                  rep.type_auteur === 'citoyen'
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700'
                                    : 'bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]'
                                }`}>
                                  <span className="text-white text-xs sm:text-sm font-bold">
                                    {rep.type_auteur === 'citoyen' ? '👤' : '🏛️'}
                                  </span>
                                </div>
                                <span className={`font-semibold text-xs sm:text-sm ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                                  {rep.auteur || (rep.type_auteur === 'citoyen' ? t('tracking.citizen') : t('tracking.municipalService'))}
                                </span>
                              </div>
                              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                {formatDate(rep.date_reponse)}
                              </span>
                            </div>
                            <p className={`text-sm sm:text-base ml-6 sm:ml-10 ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                              {rep.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}

                  {/* Formulaire de réponse du citoyen */}
                  {/* <div>
                    <h3 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${
                      darkMode ? 'text-white' : 'text-[#1E3A8A]'
                    }`}>
                      <div className="cua-gold-bar w-1 h-5 sm:h-6 rounded-full"></div>
                      <PaperAirplaneIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-[#D4AF37]' : 'text-[#1E3A8A]'}`} />
                      {t('tracking.replyToMunicipality')}
                    </h3>

                    {reponseEnvoyee ? (
                      <div className={`rounded-lg p-4 text-center border-l-4 border-emerald-500 ${
                        darkMode ? 'bg-gray-700' : 'bg-emerald-50'
                      }`}>
                        <CheckCircleIcon className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className={`font-medium text-sm sm:text-base ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                          {t('tracking.responseConfirmed')}
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleCitizenReponse} className="space-y-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            {t('tracking.citizenId')}
                          </label>
                          <input
                            type="text"
                            value={reponseIdentifiant}
                            onChange={(e) => setReponseIdentifiant(e.target.value)}
                            placeholder={t('tracking.citizenIdPlaceholder')}
                            className={`cua-field w-full px-3 py-2 border-2 rounded-xl focus:outline-none transition-all text-sm ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            {t('tracking.yourMessage')}
                          </label>
                          <textarea
                            value={reponseMessage}
                            onChange={(e) => setReponseMessage(e.target.value)}
                            rows="3"
                            placeholder={t('tracking.messagePlaceholder')}
                            className={`cua-field w-full px-3 py-2 border-2 rounded-xl focus:outline-none transition-all text-sm ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={sendingReponse || !reponseIdentifiant.trim() || !reponseMessage.trim()}
                          className="cua-btn-primary px-6 py-2 font-semibold rounded-xl disabled:opacity-50 shadow-md text-sm text-white"
                        >
                          {sendingReponse ? t('tracking.sending') : t('tracking.sendResponse')}
                        </button>
                      </form>
                    )}
                  </div> */}
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl shadow-lg p-8 sm:p-10 text-center border transition-colors duration-300 ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 shadow-black/20'
                  : 'bg-white border-slate-200 shadow-slate-900/5'
              }`}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
                  darkMode
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200'
                }`}>
                  <DocumentTextIcon className={`h-8 w-8 sm:h-10 sm:w-10 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <h3 className={`cua-display text-lg sm:text-xl font-semibold mb-2 ${darkMode ? 'text-slate-100' : 'text-[#0F172A]'}`}>
                  {t('tracking.notFound')}
                </h3>
                <p className={`text-sm sm:text-base mb-5 max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('tracking.notFoundDesc')}
                </p>
                <Link
                  to="/deposer-doleance"
                  className="cua-btn-primary inline-block px-6 py-2.5 font-semibold rounded-xl shadow-md text-sm sm:text-base text-white"
                >
                  {t('hero.btnSubmit')} →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox image */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={lightboxImage}
              alt="Aperçu"
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuiviDoleance;