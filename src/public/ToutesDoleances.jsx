import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

function ToutesDoleances() {
  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedPriorite, setSelectedPriorite] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [priorites, setPriorites] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // États pour les suggestions de recherche
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchDoleances();
    fetchFilters();
  }, [pagination.page, selectedCategorie, selectedStatut, selectedPriorite, sortBy, dateDebut, dateFin]);

  // Debounce pour la recherche
  const debouncedSearch = useCallback(
    debounce(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchDoleances();
    }, 500),
    [searchTerm]
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    try {
      const response = await api.get(`/doleances/public/suggestions?q=${query}`);
      if (response.data.success) {
        setSearchSuggestions(response.data.data);
      }
    } catch (error) {
      console.error('Erreur suggestions:', error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSuggestions(value);
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDoleances();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return formatDateTime(dateString);
  };

  const getCategoryColor = (categorie) => {
    const colors = {
      'Voirie': 'bg-blue-100 text-blue-800',
      'Éclairage public': 'bg-yellow-100 text-yellow-800',
      'Salubrité': 'bg-green-100 text-green-800',
      'Espaces verts': 'bg-emerald-100 text-emerald-800',
      'Transport': 'bg-purple-100 text-purple-800',
      'Sécurité': 'bg-red-100 text-red-800',
      'Urbanisme': 'bg-indigo-100 text-indigo-800',
      'Social': 'bg-pink-100 text-pink-800'
    };
    return colors[categorie] || 'bg-gray-100 text-gray-800';
  };

  const fetchDoleances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      params.append('sort', sortBy);
      if (selectedCategorie) params.append('categorie', selectedCategorie);
      if (selectedStatut) params.append('statut', selectedStatut);
      if (selectedPriorite) params.append('priorite', selectedPriorite);
      if (searchTerm) params.append('search', searchTerm);
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin) params.append('date_fin', dateFin);
      
      const response = await api.get(`/doleances/public?${params.toString()}`);
      if (response.data.success) {
        setDoleances(response.data.data.doleances || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0,
          pages: response.data.data.pagination?.pages || 0
        }));
      }
    } catch (error) {
      console.error('Erreur chargement doléances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [categoriesRes, statutsRes, prioritesRes] = await Promise.all([
        api.get('/doleances/categories'),
        api.get('/doleances/statuts'),
        api.get('/doleances/priorites')
      ]);
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setStatuts(statutsRes.data?.data || statutsRes.data || []);
      setPriorites(prioritesRes.data?.data || prioritesRes.data || []);
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDoleances();
    setShowSuggestions(false);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategorie('');
    setSelectedStatut('');
    setSelectedPriorite('');
    setDateDebut('');
    setDateFin('');
    setSortBy('date_desc');
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowSuggestions(false);
  };

  // Fonction pour obtenir le badge de statut avec la couleur
  const getStatusBadge = (statut, couleur) => {
    return (
      <span 
        className="px-2 py-1 text-xs font-medium rounded-full text-white"
        style={{ backgroundColor: couleur || '#6B7280' }}
      >
        {statut}
      </span>
    );
  };

  // Fonction pour obtenir le badge de priorité
  const getPriorityBadge = (priorite, niveau) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[niveau] || 'bg-gray-100 text-gray-800'}`}>
        {priorite}
      </span>
    );
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut) => {
    switch(statut) {
      case 'Résolue':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'Clôturée':
        return <CheckCircleIcon className="h-4 w-4 text-gray-500" />;
      case 'En attente':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'Assignée':
        return <ExclamationTriangleIcon className="h-4 w-4 text-blue-500" />;
      case 'En traitement':
        return <ExclamationTriangleIcon className="h-4 w-4 text-purple-500" />;
      case 'Nouvelle':
        return <DocumentTextIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Statistiques par catégorie
  const getStatsByCategory = () => {
    const stats = {};
    doleances.forEach(d => {
      const cat = d.nom_categorie || 'Non catégorisé';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return Object.entries(stats).slice(0, 5);
  };

  // Statistiques par statut
  const getStatsByStatus = () => {
    const stats = {};
    doleances.forEach(d => {
      const status = d.nom_statut || 'Inconnu';
      stats[status] = (stats[status] || 0) + 1;
    });
    return Object.entries(stats);
  };

  // Compter les filtres actifs
  const activeFiltersCount = [
    selectedCategorie, selectedStatut, selectedPriorite, 
    dateDebut, dateFin, searchTerm
  ].filter(f => f).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Toutes les doléances</h1>
          <p className="text-gray-600 mt-2">Consultez l'ensemble des doléances déposées par les citoyens</p>
        </div>

        {/* Barre de recherche principale */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, description, référence ou mot-clé..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Suggestions de recherche */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </form>
          
          {/* Boutons d'action rapide */}
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
            >
              <FunnelIcon className="h-4 w-4" />
              {showAdvancedFilters ? 'Masquer les filtres avancés' : 'Filtres avancés'}
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showAdvancedFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={selectedCategorie}
                  onChange={(e) => setSelectedCategorie(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom_categorie}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  {statuts.map(statut => (
                    <option key={statut.id_statut} value={statut.id_statut}>{statut.nom_statut}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={selectedPriorite}
                  onChange={(e) => setSelectedPriorite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les priorités</option>
                  {priorites.map(prio => (
                    <option key={prio.id_priorite} value={prio.id_priorite}>{prio.nom_priorite}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date_desc">Plus récentes</option>
                  <option value="date_asc">Plus anciennes</option>
                  <option value="priorite_desc">Priorité haute</option>
                  <option value="priorite_asc">Priorité basse</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Effacer tous les filtres
              </button>
            </div>
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
            <p className="text-sm text-gray-500">Total doléances</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">
              {doleances.filter(d => d.nom_statut !== 'Résolue' && d.nom_statut !== 'Clôturée').length}
            </p>
            <p className="text-sm text-gray-500">En cours</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {doleances.filter(d => d.nom_statut === 'Résolue' || d.nom_statut === 'Clôturée').length}
            </p>
            <p className="text-sm text-gray-500">Résolues</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <TagIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
            <p className="text-sm text-gray-500">Catégories</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <ChartBarIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{priorites.length}</p>
            <p className="text-sm text-gray-500">Niveaux</p>
          </div>
        </div>

        {/* Mini graphiques */}
        {doleances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-blue-500" />
                Répartition par catégorie
              </h3>
              <div className="space-y-2">
                {getStatsByCategory().map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / doleances.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4 text-green-500" />
                Répartition par statut
              </h3>
              <div className="space-y-2">
                {getStatsByStatus().map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(count / doleances.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Liste des doléances */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : doleances.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune doléance trouvée</h3>
            <p className="text-gray-500">Aucune doléance ne correspond à vos critères de recherche</p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {doleances.map((doleance) => (
              <Link
                key={doleance.id_doleance}
                to={`/suivi-doleance/${doleance.reference}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {doleance.reference}
                        </span>
                        {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                        {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}
                      </div>
                      
                      {/* Titre */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600">
                        {doleance.titre}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {doleance.description}
                      </p>
                      
                      {/* Informations supplémentaires */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        {/* Catégorie */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doleance.nom_categorie)}`}>
                          <TagIcon className="h-3 w-3" />
                          {doleance.nom_categorie || 'Non catégorisé'}
                        </span>
                        
                        {/* Date et heure */}
                        <span className="flex items-center gap-1 text-gray-500">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDateTime(doleance.date_creation)}
                        </span>
                        
                        {/* Temps relatif */}
                        <span className="text-xs text-gray-400">
                          ({getRelativeTime(doleance.date_creation)})
                        </span>
                        
                        {/* Direction */}
                        {doleance.nom_direction && (
                          <span className="flex items-center gap-1 text-gray-500">
                            🏢 {doleance.nom_direction}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Icône statut et lien */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doleance.nom_statut)}
                      <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Voir détails →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        )}
      </main>
      
      <PublicFooter />
    </div>
  );
}

export default ToutesDoleances;