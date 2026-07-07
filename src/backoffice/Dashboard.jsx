// Dashboard.jsx - version corrigée avec logs de débogage

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Données fallback (gardées)
const FALLBACK_DATA = {
  monthlyStats: [
    { mois: 'Jan', total: 12, resolues: 8 },
    { mois: 'Fév', total: 15, resolues: 10 },
    { mois: 'Mar', total: 18, resolues: 14 },
    { mois: 'Avr', total: 22, resolues: 18 },
    { mois: 'Mai', total: 25, resolues: 20 },
    { mois: 'Juin', total: 30, resolues: 25 }
  ],
  statsByCategory: [
    { nom_categorie: 'Assainissement', count: 38 },
    { nom_categorie: 'Déchets', count: 42 },
    { nom_categorie: 'Éclairage public', count: 25 },
    { nom_categorie: 'Santé', count: 15 },
    { nom_categorie: 'Sécurité', count: 20 },
    { nom_categorie: 'Transport', count: 22 },
    { nom_categorie: 'Voirie', count: 20 }
  ],
  statsByStatus: [
    { nom_statut: 'Clôturée', count: 30 },
    { nom_statut: 'En attente', count: 20 },
    { nom_statut: 'En traitement', count: 25 },
    { nom_statut: 'Nouvelle', count: 15 },
    { nom_statut: 'Résolue', count: 40 }
  ]
};

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    resolues: 0,
    urgentes: 0
  });
  const [recentDoleances, setRecentDoleances] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(FALLBACK_DATA.monthlyStats);
  const [statsByCategory, setStatsByCategory] = useState(FALLBACK_DATA.statsByCategory);
  const [statsByStatus, setStatsByStatus] = useState(FALLBACK_DATA.statsByStatus);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [prioritesCount, setPrioritesCount] = useState(0);
  
  const [errors, setErrors] = useState({
    stats: false,
    recent: false,
    monthly: false,
    categories: false,
    status: false,
    filters: false
  });

  const dashboardRef = useRef(null);
  const chartContainerRef = useRef(null);

  const sortByAlphabetical = (data, key = 'nom_categorie') => {
    if (!data || !Array.isArray(data)) return [];
    return [...data].sort((a, b) => {
      const aVal = (a[key] || '').toString();
      const bVal = (b[key] || '').toString();
      return aVal.localeCompare(bVal, 'fr');
    });
  };

  const checkContainerSize = useCallback(() => {
    try {
      if (chartContainerRef.current) {
        const { width, height } = chartContainerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setChartReady(true);
        } else {
          setTimeout(() => checkContainerSize(), 100);
        }
      }
    } catch (error) {
      console.warn('Erreur de dimension du graphique:', error);
      setChartReady(true);
    }
  }, []);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    setErrors({
      stats: false,
      recent: false,
      monthly: false,
      categories: false,
      status: false,
      filters: false
    });

    try {
      await Promise.allSettled([
        fetchStats(),
        fetchRecentDoleances(),
        fetchMonthlyStats(),
        fetchStatsByCategory(),
        fetchStatsByStatus(),
        fetchFiltersCount()
      ]);
    } catch (error) {
      console.error('Erreur globale:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkContainerSize(), 300);
    fetchDashboardData(true);

    const observer = new ResizeObserver(() => {
      try { checkContainerSize(); } catch (_) {}
    });
    if (dashboardRef.current) observer.observe(dashboardRef.current);

    return () => {
      clearTimeout(timer);
      try { observer.disconnect(); } catch (_) {}
    };
  }, [fetchDashboardData, checkContainerSize]);

  // --- Fonctions de récupération avec logs détaillés ---

  const fetchStats = async () => {
    try {
      const response = await api.get('/statistiques/dashboard');
      console.log('📊 Dashboard stats response:', response.data);
      console.log('📊 Dashboard stats data:', response.data?.data);
      if (response.data?.success && response.data.data) {
        setStats(response.data.data);
        setErrors(prev => ({ ...prev, stats: false }));
      } else {
        setErrors(prev => ({ ...prev, stats: true }));
        toast.error('Erreur chargement statistiques générales');
      }
    } catch (error) {
      console.error('❌ fetchStats error:', error);
      setErrors(prev => ({ ...prev, stats: true }));
      toast.error('Erreur lors du chargement des statistiques');
    }
  };

  const fetchRecentDoleances = async () => {
    try {
      const response = await api.get('/doleances/backoffice?limit=5&page=1');
      console.log('📋 Recent doleances response:', response.data);
      console.log('📋 Recent doleances data.doleances:', response.data?.data?.doleances);
      if (response.data?.success) {
        const doleances = response.data.data?.doleances || [];
        setRecentDoleances(doleances);
        setErrors(prev => ({ ...prev, recent: false }));
      } else {
        setRecentDoleances([]);
        setErrors(prev => ({ ...prev, recent: true }));
        toast.error('Erreur chargement doléances récentes');
      }
    } catch (error) {
      console.error('❌ fetchRecentDoleances error:', error);
      setRecentDoleances([]);
      setErrors(prev => ({ ...prev, recent: true }));
      toast.error('Erreur lors du chargement des doléances récentes');
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await api.get('/statistiques/evolution?periode=month&nb=6');
      console.log('📈 Monthly stats response:', response.data);
      console.log('📈 Monthly stats data:', response.data?.data);
      if (response.data?.success && response.data.data?.length > 0) {
        const formatted = response.data.data.map(item => ({
          ...item,
          mois: item.periode ? item.periode.substring(5, 7) : (item.month || item.periode || '')
        }));
        setMonthlyStats(formatted);
        setErrors(prev => ({ ...prev, monthly: false }));
      } else {
        // Si vide, on garde les fallbacks mais on signale l'erreur
        setMonthlyStats(FALLBACK_DATA.monthlyStats);
        setErrors(prev => ({ ...prev, monthly: true }));
        // On ne toast pas pour ne pas alourdir
      }
    } catch (error) {
      console.error('❌ fetchMonthlyStats error:', error);
      setMonthlyStats(FALLBACK_DATA.monthlyStats);
      setErrors(prev => ({ ...prev, monthly: true }));
      toast.error('Erreur lors du chargement de l\'évolution');
    }
  };

  const fetchStatsByCategory = async () => {
    try {
      const response = await api.get('/statistiques/categories');
      console.log('📊 Categories stats response:', response.data);
      console.log('📊 Categories stats data:', response.data?.data);
      if (response.data?.success && response.data.data?.length > 0) {
        const sorted = sortByAlphabetical(response.data.data, 'nom_categorie');
        setStatsByCategory(sorted);
        setCategoriesCount(sorted.length);
        setErrors(prev => ({ ...prev, categories: false }));
      } else {
        // Si vide, on garde les fallbacks
        setErrors(prev => ({ ...prev, categories: true }));
      }
    } catch (error) {
      console.error('❌ fetchStatsByCategory error:', error);
      setErrors(prev => ({ ...prev, categories: true }));
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const fetchStatsByStatus = async () => {
    try {
      const response = await api.get('/statistiques/statuts');
      console.log('📊 Status stats response:', response.data);
      console.log('📊 Status stats data:', response.data?.data);
      if (response.data?.success && response.data.data?.length > 0) {
        setStatsByStatus(response.data.data);
        setErrors(prev => ({ ...prev, status: false }));
      } else {
        setErrors(prev => ({ ...prev, status: true }));
      }
    } catch (error) {
      console.error('❌ fetchStatsByStatus error:', error);
      setErrors(prev => ({ ...prev, status: true }));
      toast.error('Erreur lors du chargement des statuts');
    }
  };

  const fetchFiltersCount = async () => {
    try {
      const [categoriesRes, prioritesRes] = await Promise.all([
        api.get('/doleances/categories'),
        api.get('/doleances/priorites')
      ]);
      console.log('📋 Categories list:', categoriesRes.data);
      console.log('📋 Priorites list:', prioritesRes.data);
      const categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
      const prioritesData = prioritesRes.data?.data || prioritesRes.data || [];
      setCategoriesCount(categoriesData.length);
      setPrioritesCount(prioritesData.length);
      setErrors(prev => ({ ...prev, filters: false }));
    } catch (error) {
      console.error('❌ fetchFiltersCount error:', error);
      setCategoriesCount(0);
      setPrioritesCount(0);
      setErrors(prev => ({ ...prev, filters: true }));
      toast.error('Erreur chargement des compteurs');
    }
  };

  // --- Badges (inchangés) ---

  const getStatusBadge = (statut, couleur) => {
    const defaultColors = {
      'Nouvelle': '#3B82F6',
      'En attente': '#F59E0B',
      'En cours': '#8B5CF6',
      'Transférée': '#06B6D4',
      'Traitée': '#10B981',
      'Résolue': '#10B981',
      'Clôturée': '#6B7280',
      'Rejetée': '#EF4444'
    };
    const bgColor = couleur || defaultColors[statut] || '#6B7280';
    return <span className="px-2 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: bgColor }}>{statut}</span>;
  };

  const getPriorityBadge = (priorite, niveau) => {
    const colors = { 1: 'bg-green-100 text-green-800', 2: 'bg-yellow-100 text-yellow-800', 3: 'bg-orange-100 text-orange-800', 4: 'bg-red-100 text-red-800' };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[niveau] || 'bg-gray-100 text-gray-800'}`}>{priorite}</span>;
  };

  // --- Cartes de stats ---

  const statsCards = [
    { title: 'Total Doléances', value: stats.total, icon: DocumentTextIcon, color: 'bg-blue-500', change: '+12%', changeType: 'up', link: '/backoffice/doleances' },
    { title: 'En cours', value: stats.enCours, icon: ClockIcon, color: 'bg-amber-500', change: '+5%', changeType: 'up', link: '/backoffice/doleances?statut=en_cours' },
    { title: 'Résolues', value: stats.resolues, icon: CheckCircleIcon, color: 'bg-emerald-500', change: '+18%', changeType: 'up', link: '/backoffice/doleances?statut=resolues' },
    { title: 'Urgentes', value: stats.urgentes, icon: ExclamationTriangleIcon, color: 'bg-rose-500', change: '-2%', changeType: 'down', link: '/backoffice/doleances?priorite=urgente' },
  ];

  const STATUS_COLORS = {
    'Nouvelle': '#3B82F6',
    'En attente': '#F59E0B',
    'En cours': '#8B5CF6',
    'Transférée': '#06B6D4',
    'Traitée': '#10B981',
    'Résolue': '#10B981',
    'Clôturée': '#6B7280',
    'Rejetée': '#EF4444'
  };

  const getStatusColor = (statut) => STATUS_COLORS[statut] || '#6B7280';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = statsByStatus.reduce((sum, item) => sum + (item.count || 0), 0);
      const percentage = total > 0 ? ((data.count || 0) / total * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{data.nom_statut}</p>
          <p className="text-sm text-gray-600">{data.count} doléances</p>
          <p className="text-sm font-semibold text-blue-600">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    const total = statsByStatus.reduce((sum, item) => sum + (item.count || 0), 0);
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {payload.map((entry, index) => {
          const percentage = total > 0 ? ((entry.payload.count || 0) / total * 100).toFixed(1) : 0;
          return (
            <div key={`legend-${index}`} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-700">{entry.value}</span>
              <span className="text-gray-400">({percentage}%)</span>
            </div>
          );
        })}
      </div>
    );
  };

  // --- Rendu ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Bienvenue, <span className="font-medium text-gray-700">{user?.prenom || ''} {user?.nom || ''}</span> ({user?.role || 'Utilisateur'})
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(false)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <Link key={index} to={stat.link} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-1 sm:mt-2 flex-wrap">
                    {stat.changeType === 'up' ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mr-1 flex-shrink-0" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500 mr-1 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${stat.changeType === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>{stat.change}</span>
                  </div>
                </div>
                <div className={`${stat.color} p-2.5 sm:p-3 rounded-xl ml-2 flex-shrink-0 shadow-lg`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Cartes supplémentaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">Catégories disponibles</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-1">{categoriesCount}</p>
              <p className="text-gray-400 text-xs mt-1 sm:mt-2">Types de doléances</p>
            </div>
            <div className="bg-blue-50 p-2.5 sm:p-3 rounded-xl flex-shrink-0 ml-2 border border-blue-100">
              <TagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
          </div>
          {errors.filters && <p className="text-xs text-amber-600 mt-2">⚠️ Données partiellement chargées</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">Niveaux de priorité</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-1">{prioritesCount}</p>
              <p className="text-gray-400 text-xs mt-1 sm:mt-2">De basse à urgente</p>
            </div>
            <div className="bg-orange-50 p-2.5 sm:p-3 rounded-xl flex-shrink-0 ml-2 border border-orange-100">
              <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            </div>
          </div>
          {errors.filters && <p className="text-xs text-amber-600 mt-2">⚠️ Données partiellement chargées</p>}
        </div>
      </div>

      {/* Graphiques */}
      <div ref={chartContainerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Évolution mensuelle */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Évolution mensuelle</h2>
          {chartReady && monthlyStats.length > 0 ? (
            <div style={{ width: '100%', height: 320, minHeight: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="mois" stroke="#6B7280" fontSize={12} tickMargin={5} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="total" fill="#3B82F6" name="Total doléances" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolues" fill="#10B981" name="Résolues" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 text-sm">
                {errors.monthly ? 'Erreur de chargement. Affichage des données par défaut.' : 'Aucune donnée disponible'}
              </p>
            </div>
          )}
        </div>

        {/* Doléances par statut */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Doléances par statut</h2>
          {chartReady && statsByStatus.length > 0 ? (
            <div style={{ width: '100%', height: 320, minHeight: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="count" nameKey="nom_statut">
                    {statsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.nom_statut)} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 text-sm">{errors.status ? 'Erreur de chargement. Affichage des données par défaut.' : 'Aucune donnée disponible'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Doléances par catégorie */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Doléances par catégorie</h2>
        {statsByCategory.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {statsByCategory.map((cat, idx) => {
              const total = statsByCategory.reduce((sum, c) => sum + (c.count || 0), 0);
              const percentage = total > 0 ? ((cat.count || 0) / total * 100) : 0;
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
              return (
                <div key={idx}>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm mb-1 gap-1">
                    <span className="font-medium text-gray-700 break-words flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                      {cat.nom_categorie}
                    </span>
                    <span className="font-semibold text-gray-600 whitespace-nowrap">{cat.count || 0} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 sm:h-2.5">
                    <div className="h-2 sm:h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: colors[idx % colors.length] }} />
                  </div>
                </div>
              );
            })}
            {errors.categories && <p className="text-xs text-amber-600 mt-2">⚠️ Données partiellement chargées (affichage des valeurs par défaut)</p>}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">Aucune donnée disponible</p>
        )}
      </div>

      {/* Doléances récentes */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">Doléances récentes</h2>
          <Link to="/backoffice/doleances" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Voir toutes →</Link>
        </div>
        
        {recentDoleances.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[640px] sm:min-w-full">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Titre</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Catégorie</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Priorité</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {recentDoleances.map((doleance) => (
                    <tr key={doleance.id_doleance} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono font-medium text-blue-600 break-all">{doleance.reference}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hidden sm:table-cell truncate max-w-[120px] md:max-w-[200px]">{doleance.titre}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 hidden md:table-cell">{doleance.nom_categorie || '-'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">{getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">{getPriorityBadge(doleance.nom_priorite, doleance.niveau)}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">{new Date(doleance.date_creation).toLocaleDateString('fr-FR')}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                        <Link to={`/backoffice/doleances/${doleance.id_doleance}`} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors">Voir</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <DocumentTextIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{errors.recent ? 'Erreur de chargement des doléances récentes.' : 'Aucune doléance récente'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;