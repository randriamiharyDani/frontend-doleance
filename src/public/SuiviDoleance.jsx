import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const { reference } = useParams();
  const [searchRef, setSearchRef] = useState(reference || '');
  const [doleance, setDoleance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchRef.trim()) {
      toast.error('Veuillez entrer une référence');
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
      toast.error('Doléance non trouvée. Vérifiez votre référence.');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusIcon = (statut) => {
    if (statut === 'Résolue' || statut === 'Clôturée') {
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    }
    return <ClockIcon className="h-6 w-6 text-yellow-500" />;
  };
  
  const getStatusColor = (statut) => {
    const colors = {
      'Nouvelle': 'bg-orange-100 text-orange-800',
      'En attente': 'bg-yellow-100 text-yellow-800',
      'Assignée': 'bg-blue-100 text-blue-800',
      'En traitement': 'bg-blue-100 text-blue-800',
      'Résolue': 'bg-green-100 text-green-800',
      'Clôturée': 'bg-gray-100 text-gray-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
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
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Suivi de doléance</h1>
          <p className="text-gray-600 mt-2">Entrez votre numéro de référence pour suivre l'avancement</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input 
              type="text" 
              value={searchRef} 
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="Ex: DOL-202401-0001"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
            />
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </div>
        
        {searched && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : doleance ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* En-tête avec référence et statut */}
                <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                        <p className="text-sm text-gray-500">Référence</p>
                      </div>
                      <p className="text-xl md:text-2xl font-mono font-bold text-blue-700">{doleance.reference}</p>
                      <h2 className="text-lg md:text-xl font-bold text-gray-800 mt-3">{doleance.titre}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doleance.statut)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doleance.statut)}`}>
                        {doleance.statut}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Description détaillée */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                      Description
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{doleance.description}</p>
                    </div>
                  </div>
                  
                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Catégorie */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <TagIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Catégorie</p>
                        <p className="font-medium text-gray-800">
                          {getCategoryIcon(doleance.categorie)} {doleance.categorie || 'Non spécifiée'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Date de création */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Date de dépôt</p>
                        <p className="font-medium text-gray-800">
                          {new Date(doleance.date_creation).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Lieu */}
                    {(doleance.lieu_exact || doleance.nom_quartier) && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                        <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Lieu concerné</p>
                          <p className="font-medium text-gray-800">
                            {doleance.lieu_exact && <span>{doleance.lieu_exact}</span>}
                            {doleance.lieu_exact && doleance.nom_quartier && <span> - </span>}
                            {doleance.nom_quartier && <span>Quartier: {doleance.nom_quartier}</span>}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Suggestions */}
                  {doleance.suggestions && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
                        Suggestions / Actions souhaitées
                      </h3>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <p className="text-gray-700">{doleance.suggestions}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Historique du traitement */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ArrowPathIcon className="h-5 w-5 text-purple-600" />
                      Historique du traitement
                    </h3>
                    <div className="space-y-4">
                      {doleance.historique && doleance.historique.length > 0 ? (
                        <div className="relative">
                          {/* Ligne verticale */}
                          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200"></div>
                          {doleance.historique.map((hist, index) => (
                            <div key={index} className="relative flex items-start space-x-3 ml-2">
                              <div className="flex-shrink-0 z-10">
                                {index === doleance.historique.length - 1 ? 
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircleIcon className="h-4 w-4 text-white" />
                                  </div> : 
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <ClockIcon className="h-4 w-4 text-white" />
                                  </div>}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700">{hist.ancien_statut || 'Création'}</span>
                                    <span className="text-gray-400 mx-2">→</span>
                                    <span className="font-medium text-blue-700">{hist.nouveau_statut}</span>
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(hist.date_changement).toLocaleString('fr-FR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  {hist.commentaire && (
                                    <p className="text-sm text-gray-600 mt-2 italic">"{hist.commentaire}"</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-gray-600">Doléance en cours de traitement</p>
                          <p className="text-sm text-gray-400 mt-1">Les prochaines mises à jour apparaîtront ici</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Réponses de la mairie */}
                  {doleance.reponses && doleance.reponses.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                        Réponses de la mairie
                      </h3>
                      <div className="space-y-4">
                        {doleance.reponses.map((rep, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 text-xs">🏛️</span>
                                </div>
                                <span className="font-medium text-sm text-gray-700">Service municipal</span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(rep.date_reponse).toLocaleString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 ml-8">{rep.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune doléance trouvée</h3>
                <p className="text-gray-500">Vérifiez votre numéro de référence</p>
                <Link to="/deposer-doleance" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
                  Déposer une doléance →
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