import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
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
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';


function ToutesDoleances() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
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
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [priorites, setPriorites] = useState([]);
  const [statsCount, setStatsCount] = useState({
    totalCategories: 0,
    totalPriorites: 0,
    totalStatuts: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDoleance, setSelectedDoleance] = useState(null);

  useEffect(() => {
    fetchDoleances();
    fetchFilters();
  }, [pagination.page, selectedCategorie, selectedStatut, selectedPriorite, sortBy, dateDebut, dateFin]);

  const debouncedSearch = useCallback(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchDoleances();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategorie, selectedStatut, selectedPriorite, sortBy, dateDebut, dateFin]);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, selectedCategorie, selectedStatut, selectedPriorite, sortBy, dateDebut, dateFin]);

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

  const toggleDescription = (id) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return t('allComplaints.unknownDate');
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

    if (diffMins < 1) return t('allComplaints.justNow');
    if (diffMins < 60) return t('allComplaints.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('allComplaints.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('allComplaints.daysAgo', { count: diffDays });
    return formatDateTime(dateString);
  };

  const getCategoryColor = (categorie) => {
    const colors = {
      'Administration': 'bg-sky-100 text-sky-800',
      'Sécurité': 'bg-red-100 text-red-800',
      'Infrastructure': 'bg-gray-100 text-gray-800',
      'Éducation': 'bg-indigo-100 text-indigo-800',
      'Électricité': 'bg-yellow-100 text-yellow-800',
      'Voirie': 'bg-teal-100 text-teal-800',
      'Eau et Assainissement': 'bg-cyan-100 text-cyan-800',
      'Déchets et Propreté': 'bg-green-100 text-green-800',
      'Santé': 'bg-pink-100 text-pink-800',
      'Transport et Mobilité': 'bg-purple-100 text-purple-800',
      'Environnement': 'bg-emerald-100 text-emerald-800',
      'Social': 'bg-rose-100 text-rose-800',
      'Jeunesse et Sports': 'bg-amber-100 text-amber-800'
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
      
      if (selectedCategorie && selectedCategorie !== '') {
        params.append('categorie', selectedCategorie);
      }
      if (selectedStatut && selectedStatut !== '') {
        params.append('statut', selectedStatut);
      }
      if (selectedPriorite && selectedPriorite !== '') {
        params.append('priorite', selectedPriorite);
      }
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm);
      }
      if (dateDebut && dateDebut !== '') {
        params.append('date_debut', dateDebut);
      }
      if (dateFin && dateFin !== '') {
        params.append('date_fin', dateFin);
      }
      
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
      
      const categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
      const statutsData = statutsRes.data?.data || statutsRes.data || [];
      const prioritesData = prioritesRes.data?.data || prioritesRes.data || [];
      
      setCategories(categoriesData);
      setStatuts(statutsData);
      setPriorites(prioritesData);
      
      setStatsCount({
        totalCategories: categoriesData.length,
        totalPriorites: prioritesData.length,
        totalStatuts: statutsData.length
      });
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
      const fallbackCategories = [
        { id_categorie: 1, nom_categorie: 'Administration' },
        { id_categorie: 2, nom_categorie: 'Sécurité' },
        { id_categorie: 3, nom_categorie: 'Infrastructure' }
      ];
      const fallbackPriorites = [
        { id_priorite: 1, nom_priorite: t('status.pending'), niveau: 1 },
        { id_priorite: 2, nom_priorite: t('status.processing'), niveau: 2 },
        { id_priorite: 3, nom_priorite: t('status.inProgress'), niveau: 3 },
        { id_priorite: 4, nom_priorite: t('allComplaints.urgent'), niveau: 4 }
      ];
      setCategories(fallbackCategories);
      setPriorites(fallbackPriorites);
      setStatsCount({
        totalCategories: fallbackCategories.length,
        totalPriorites: fallbackPriorites.length,
        totalStatuts: 0
      });
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

  const openDetailModal = (doleance) => {
    setSelectedDoleance(doleance);
    setShowDetailModal(true);
  };

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

  const getStatusIcon = (statut) => {
    switch(statut) {
      case 'Résolue':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'Clôturée':
        return <CheckCircleIcon className="h-4 w-4 text-gray-500" />;
      case 'En attente':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'En cours':
        return <ExclamationTriangleIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const activeFiltersCount = [
    selectedCategorie, selectedStatut, selectedPriorite, 
    dateDebut, dateFin, searchTerm
  ].filter(f => f && f !== '').length;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 `}>
      {/* <PublicNavbar /> */}
      
      <main className="flex-1 max-w_full mx-auto px-4 w-full">
        {/* <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>
            {t('allComplaints.title')}
          </h1>
          <p className={darkMode ? 'text-gray-300 mt-2' : 'text-sky-600 mt-2'}>
            {t('allComplaints.subtitle')}
          </p>
        </div> */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800"> {t('allComplaints.title')}</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1"> {t('allComplaints.subtitle')}
          </p>
        </div>
       
      </div>

        {/* Barre de recherche */}
        <div className={`rounded-lg shadow-md p-4 mb-4 border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-sky-200'
        }`}>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder={t('allComplaints.search')}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                className={`w-full pl-10 pr-24 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${
                      darkMode 
                        ? 'hover:bg-gray-600 text-gray-200' 
                        : 'hover:bg-sky-50 text-gray-700'
                    }`}
                  >
                    <MagnifyingGlassIcon className={`h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </form>
          
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 text-sm ${
                darkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-700'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              {showAdvancedFilters ? t('allComplaints.hideFilters') : t('allComplaints.advancedFilters')}
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-sky-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 text-sm ${
                darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <ArrowPathIcon className="h-4 w-4" />
              {t('allComplaints.reset')}
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showAdvancedFilters && (
          <div className={`rounded-lg shadow-md p-4 mb-6 border transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-sky-200'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('allComplaints.category')}
                </label>
                <select
                  value={selectedCategorie}
                  onChange={(e) => setSelectedCategorie(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('allComplaints.allCategories')}</option>
                  {categories.map(cat => (
                    <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom_categorie}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('allComplaints.status')}
                </label>
                <select
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('allComplaints.allStatuses')}</option>
                  {statuts.map(statut => (
                    <option key={statut.id_statut} value={statut.id_statut}>{statut.nom_statut}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('allComplaints.priority')}
                </label>
                <select
                  value={selectedPriorite}
                  onChange={(e) => setSelectedPriorite(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('allComplaints.allPriorities')}</option>
                  {priorites.map(prio => (
                    <option key={prio.id_priorite} value={prio.id_priorite}>{prio.nom_priorite}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('allComplaints.sortBy')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="date_desc">{t('allComplaints.newest')}</option>
                  <option value="date_asc">{t('allComplaints.oldest')}</option>
                  <option value="priorite_desc">{t('allComplaints.highPriority')}</option>
                  <option value="priorite_asc">{t('allComplaints.lowPriority')}</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('allComplaints.startDate')}
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('allComplaints.endDate')}
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleReset}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('allComplaints.clearFilters')}
              </button>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`rounded-lg shadow-md p-4 text-center border-t-4 border-sky-500 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <DocumentTextIcon className="h-8 w-8 text-sky-500 mx-auto mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>
              {pagination.total}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('allComplaints.totalComplaints')}
            </p>
          </div>
          <div className={`rounded-lg shadow-md p-4 text-center border-t-4 border-yellow-500 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">
              {doleances.filter(d => d.nom_statut !== 'Résolue' && d.nom_statut !== 'Clôturée').length}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('allComplaints.inProgress')}
            </p>
          </div>
          <div className={`rounded-lg shadow-md p-4 text-center border-t-4 border-green-500 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {doleances.filter(d => d.nom_statut === 'Résolue' || d.nom_statut === 'Clôturée').length}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('allComplaints.resolved')}
            </p>
          </div>
          <div className={`rounded-lg shadow-md p-4 text-center border-t-4 border-purple-500 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <TagIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>
              {statsCount.totalCategories}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('allComplaints.categories')}
            </p>
          </div>
          <div className={`rounded-lg shadow-md p-4 text-center border-t-4 border-orange-500 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <ChartBarIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>
              {statsCount.totalPriorites}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('allComplaints.levels')}
            </p>
          </div>
        </div>

        {/* Liste des doléances */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : doleances.length === 0 ? (
          <div className={`rounded-lg shadow-md p-12 text-center border transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-sky-200'
          }`}>
            <DocumentTextIcon className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {t('allComplaints.noResults')}
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {t('allComplaints.noResultsDesc')}
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400"
            >
              {t('allComplaints.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {doleances.map((doleance) => {
              const isExpanded = expandedDescriptions[doleance.id_doleance];
              const description = doleance.description || '';
              const shouldTruncate = description.length > 300;
              const displayDescription = isExpanded ? description : truncateText(description, 300);
              
              return (
                <div key={doleance.id_doleance} className={`rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-sky-500 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                          {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}
                        </div>
                        
                        {/* Titre */}
                        <h3 className={`text-lg font-semibold mb-2 break-words ${
                          darkMode ? 'text-sky-400' : 'text-sky-800'
                        }`}>
                          {doleance.titre}
                        </h3>
                        
                        {/* Description */}
                        <div className={`text-sm mb-3 break-words whitespace-pre-wrap ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {displayDescription}
                          {shouldTruncate && (
                            <button
                              onClick={() => toggleDescription(doleance.id_doleance)}
                              className={`ml-2 font-medium inline-flex items-center gap-1 ${
                                darkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-800'
                              }`}
                            >
                              {isExpanded ? (
                                <>{t('allComplaints.showLess')} <ChevronUpIcon className="h-4 w-4" /></>
                              ) : (
                                <>{t('allComplaints.showMore')} <ChevronDownIcon className="h-4 w-4" /></>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {/* Informations supplémentaires */}
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doleance.nom_categorie)}`}>
                            <TagIcon className="h-3 w-3" />
                            {doleance.nom_categorie || t('allComplaints.uncategorized')}
                          </span>
                          
                          <span className={`flex items-center gap-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <CalendarIcon className="h-3 w-3" />
                            {formatDateTime(doleance.date_creation)}
                          </span>
                          
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            ({getRelativeTime(doleance.date_creation)})
                          </span>
                          
                          {doleance.nom_direction && (
                            <span className={`flex items-center gap-1 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              🏢 {doleance.nom_direction}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Bouton pour voir les détails */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusIcon(doleance.nom_statut)}
                        <button
                          onClick={() => openDetailModal(doleance)}
                          className="text-sm bg-sky-500 hover:bg-sky-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          {t('allComplaints.viewDetails')}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className={`px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-sky-300 text-sky-700 hover:bg-sky-50'
              }`}
            >
              {t('allComplaints.previous')}
            </button>
            <span className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-sky-700'}`}>
              {t('allComplaints.page')} {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className={`px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-sky-300 text-sky-700 hover:bg-sky-50'
              }`}
            >
              {t('allComplaints.next')}
            </button>
          </div>
        )}
      </main>

      {/* Modal détail doléance */}
      {showDetailModal && selectedDoleance && (
        <div className={`fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 ${
          darkMode ? 'bg-black/80' : 'bg-gray-600/50'
        }`}>
          <div className={`relative rounded-lg shadow-xl max-w-2xl w-full transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex justify-between items-center p-4 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Détail de la doléance
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Titre */}
              <h4 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>
                {selectedDoleance.titre}
              </h4>

              {/* Description complète */}
              {selectedDoleance.description && (
                <div className={`mb-4 p-3 rounded-lg text-sm whitespace-pre-wrap ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'
                }`}>
                  {selectedDoleance.description}
                </div>
              )}

              {/* Grille d'informations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    reference
                  </span>
                  <span className={`font-mono font-medium ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>
                    {selectedDoleance.reference}
                  </span>
                </div>
                <div>
                  <span className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('allComplaints.category')}
                  </span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {selectedDoleance.nom_categorie || '-'}
                  </span>
                </div>
                <div>
                  <span className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('allComplaints.status')}
                  </span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {selectedDoleance.nom_statut}
                  </span>
                </div>
                <div>
                  <span className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('allComplaints.priority')}
                  </span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {selectedDoleance.nom_priorite}
                  </span>
                </div>
                <div>
                  <span className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Date de création
                  </span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {formatDateTime(selectedDoleance.date_creation)}
                  </span>
                </div>
                <div>
                  <span className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                   dernière mise à jour
                  </span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {formatDateTime(selectedDoleance.date_mise_a_jour)}
                  </span>
                </div>
                {selectedDoleance.nom_direction && (
                  <div>
                    <span className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                     direction
                    </span>
                    <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                      {selectedDoleance.nom_direction}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={`flex justify-end p-4 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
              >
               Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <PublicFooter /> */}
    </div>
  );
}

export default ToutesDoleances;