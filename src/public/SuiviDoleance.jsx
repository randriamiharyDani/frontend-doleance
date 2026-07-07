import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
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
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

function SuiviDoleance() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { reference } = useParams();
  const [searchRef, setSearchRef] = useState(reference || '');
  const [doleance, setDoleance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
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
  
  const getStatusColor = (statut) => {
    const colors = {
      'Nouvelle': 'bg-sky-500 text-white border-sky-600',
      'En attente': 'bg-orange-500 text-white border-orange-600',
      'Assignée': 'bg-blue-500 text-white border-blue-600',
      'En traitement': 'bg-purple-500 text-white border-purple-600',
      'Résolue': 'bg-green-500 text-white border-green-600',
      'Clôturée': 'bg-gray-500 text-white border-gray-600'
    };
    return colors[statut] || 'bg-gray-500 text-white border-gray-600';
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
      'Autre': '📋'
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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-blue-100'
    }`}>
      <PublicNavbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${
            darkMode ? 'text-sky-400' : 'text-sky-800'
          }`}>
            {t('tracking.title')}
          </h1>
          <p className={darkMode ? 'text-gray-300 text-sm sm:text-base' : 'text-sky-600 text-sm sm:text-base'}>
            {t('tracking.subtitle')}
          </p>
        </div>
        
        <div className={`rounded-xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border-2 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-sky-200'
        }`}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input 
              type="text" 
              value={searchRef} 
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder={t('tracking.referencePlaceholder')}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all text-sm sm:text-base ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <button 
              type="submit" 
              disabled={loading}
              className={`px-6 sm:px-8 py-2 sm:py-3 font-semibold rounded-lg disabled:opacity-50 transition-all transform hover:scale-105 shadow-md text-sm sm:text-base ${
                darkMode 
                  ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500'
              }`}
            >
              {loading ? t('tracking.searching') : t('tracking.search')}
            </button>
          </form>
        </div>
        
        {searched && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-sky-500 mx-auto"></div>
              </div>
            ) : doleance ? (
              <div className={`rounded-xl shadow-xl overflow-hidden border-2 transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-sky-200'
              }`}>
                {/* En-tête avec référence et statut actuel */}
                <div className={`p-4 sm:p-6 border-b-2 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gradient-to-r from-sky-50 via-white to-sky-50 border-sky-200'
                }`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <DocumentTextIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                        <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tracking.reference')}
                        </p>
                      </div>
                      <p className={`text-base sm:text-xl md:text-2xl font-mono font-bold break-all ${
                        darkMode ? 'text-sky-400' : 'text-sky-700'
                      }`}>
                        {doleance.reference}
                      </p>
                      <h2 className={`text-base sm:text-lg md:text-xl font-bold mt-2 sm:mt-3 break-words ${
                        darkMode ? 'text-sky-400' : 'text-sky-800'
                      }`}>
                        {doleance.titre}
                      </h2>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                      <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-md ${getStatusColor(doleance.statut)}`}>
                        {doleance.statut}
                      </span>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {t('tracking.lastUpdate')} : {formatDate(doleance.date_derniere_modification || doleance.date_creation)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Description détaillée */}
                  <div>
                    <h3 className={`font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base ${
                      darkMode ? 'text-sky-400' : 'text-sky-800'
                    }`}>
                      <div className={`w-1 h-5 sm:h-6 rounded-full ${darkMode ? 'bg-sky-400' : 'bg-sky-400'}`}></div>
                      <InformationCircleIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                      {t('tracking.details')}
                    </h3>
                    <div className={`rounded-lg p-3 sm:p-4 border-l-4 border-sky-400 ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={darkMode ? 'text-gray-200 whitespace-pre-wrap text-sm sm:text-base' : 'text-gray-700 whitespace-pre-wrap text-sm sm:text-base'}>
                        {doleance.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Catégorie */}
                    <div className={`flex items-start gap-3 p-2 sm:p-3 rounded-lg border-l-4 border-sky-400 ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <TagIcon className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                      <div>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('form.category')}
                        </p>
                        <p className={`font-medium text-sm sm:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {getCategoryIcon(doleance.categorie)} {doleance.categorie || t('allComplaints.uncategorized')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Date de création */}
                    <div className={`flex items-start gap-3 p-2 sm:p-3 rounded-lg border-l-4 border-sky-400 ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <CalendarIcon className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                      <div>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tracking.submittedOn')}
                        </p>
                        <p className={`font-medium text-sm sm:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {formatDate(doleance.date_creation)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Lieu */}
                    {(doleance.lieu_exact || doleance.nom_quartier) && (
                      <div className={`flex items-start gap-3 p-2 sm:p-3 rounded-lg border-l-4 border-sky-400 sm:col-span-2 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <MapPinIcon className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                        <div>
                          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tracking.location')}
                          </p>
                          <p className={`font-medium text-sm sm:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {doleance.lieu_exact && <span>{doleance.lieu_exact}</span>}
                            {doleance.lieu_exact && doleance.nom_quartier && <span> - </span>}
                            {doleance.nom_quartier && <span>{t('form.neighborhood')}: {doleance.nom_quartier}</span>}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Suggestions */}
                  {doleance.suggestions && (
                    <div>
                      <h3 className={`font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base ${
                        darkMode ? 'text-sky-400' : 'text-sky-800'
                      }`}>
                        <div className={`w-1 h-5 sm:h-6 rounded-full ${darkMode ? 'bg-sky-400' : 'bg-sky-400'}`}></div>
                        <ChatBubbleLeftRightIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                        {t('form.suggestions')}
                      </h3>
                      <div className={`rounded-lg p-3 sm:p-4 border-l-4 border-sky-400 ${
                        darkMode ? 'bg-gray-700' : 'bg-sky-50'
                      }`}>
                        <p className={darkMode ? 'text-gray-200 text-sm sm:text-base' : 'text-gray-700 text-sm sm:text-base'}>
                          {doleance.suggestions}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Historique du traitement - Statuts côte à côte responsive */}
                  <div>
                    <h3 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${
                      darkMode ? 'text-sky-400' : 'text-sky-800'
                    }`}>
                      <div className={`w-1 h-5 sm:h-6 rounded-full ${darkMode ? 'bg-sky-400' : 'bg-sky-400'}`}></div>
                      <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                      {t('tracking.history')}
                    </h3>
                    {doleance.historique && doleance.historique.length > 0 ? (
                      <div className="overflow-x-auto pb-2">
                        <div className="flex flex-wrap gap-2 sm:gap-3 min-w-[280px]">
                          {doleance.historique.map((hist, index) => (
                            <div key={index} className="flex items-center gap-1 sm:gap-2">
                              <div className={`rounded-lg px-2 py-1 sm:px-3 sm:py-2 border-2 min-w-[100px] sm:min-w-[130px] shadow-sm ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-sky-200'
                              }`}>
                                <div className="flex flex-col items-center gap-1 sm:gap-2">
                                  <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs font-bold shadow-md text-center ${getStatusColor(hist.nouveau_statut)}`}>
                                    {hist.nouveau_statut}
                                  </span>
                                  <p className={`text-xs font-medium text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {formatDate(hist.date_changement)}
                                  </p>
                                </div>
                              </div>
                              {index < doleance.historique.length - 1 && (
                                <span className={`text-base sm:text-lg font-bold ${darkMode ? 'text-sky-400' : 'text-sky-400'}`}>
                                  →
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-lg p-3 sm:p-4 text-center border-l-4 border-sky-400 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <p className={darkMode ? 'text-gray-300 text-sm sm:text-base' : 'text-gray-600 text-sm sm:text-base'}>
                          {t('tracking.noHistory')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Réponses de la mairie */}
                  {doleance.reponses && doleance.reponses.length > 0 && (
                    <div>
                      <h3 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${
                        darkMode ? 'text-sky-400' : 'text-sky-800'
                      }`}>
                        <div className={`w-1 h-5 sm:h-6 rounded-full ${darkMode ? 'bg-sky-400' : 'bg-sky-400'}`}></div>
                        <ChatBubbleLeftRightIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                        {t('tracking.municipalResponses')}
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {doleance.reponses.map((rep, index) => (
                          <div key={index} className={`rounded-lg p-3 sm:p-4 border-l-4 border-sky-400 shadow-sm ${
                            darkMode ? 'bg-gray-700' : 'bg-sky-50'
                          }`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                                  darkMode 
                                    ? 'bg-gradient-to-br from-sky-600 to-blue-700' 
                                    : 'bg-gradient-to-br from-sky-500 to-blue-600'
                                }`}>
                                  <span className="text-white text-xs sm:text-sm font-bold">🏛️</span>
                                </div>
                                <span className={`font-semibold text-xs sm:text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                  {t('tracking.municipalService')}
                                </span>
                              </div>
                              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(rep.date_reponse)}
                              </span>
                            </div>
                            <p className={`text-sm sm:text-base ml-6 sm:ml-10 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              {rep.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`rounded-xl shadow-xl p-6 sm:p-8 text-center border-2 transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-sky-200'
              }`}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  darkMode 
                    ? 'bg-gray-700' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  <DocumentTextIcon className={`h-8 w-8 sm:h-10 sm:w-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {t('tracking.notFound')}
                </h3>
                <p className={`text-sm sm:text-base mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tracking.notFoundDesc')}
                </p>
                <Link 
                  to="/deposer-doleance" 
                  className={`inline-block px-5 py-2 sm:px-6 sm:py-2 font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md text-sm sm:text-base ${
                    darkMode 
                      ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500'
                  }`}
                >
                  {t('hero.btnSubmit')} →
                </Link>
              </div>
            )}
          </>
        )}
      </main>
      
      <PublicFooter />
    </div>
  );
}

export default SuiviDoleance;