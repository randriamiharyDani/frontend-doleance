import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import statistiqueService from '../services/statistiqueService';
import doleanceService from '../services/doleanceService';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon,
  TagIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import StatCard from '../pages/backoffice/Dashboard/StatCard';
import InfoCard from '../pages/backoffice/Dashboard/InfoCard';
import EvolutionChart from '../pages/backoffice/Dashboard/EvolutionChart';
import StatusPieChart from '../pages/backoffice/Dashboard/StatusPieChart';
import CategoryBar from '../pages/backoffice/Dashboard/CategoryBar';
import RecentDoleancesTable from '../pages/backoffice/Dashboard/RecentDoleancesTable';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, enCours: 0, resolues: 0, urgentes: 0 });
  const [recentDoleances, setRecentDoleances] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [statsByCategory, setStatsByCategory] = useState([]);
  const [statsByStatus, setStatsByStatus] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [prioritesCount, setPrioritesCount] = useState(0);
  const [errors, setErrors] = useState({ monthly: false, categories: false, status: false, recent: false });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const sortAlpha = (data, key = 'nom_categorie') => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => (a[key] || '').localeCompare(b[key] || '', 'fr'));
  };

  const fetchStats = useCallback(async (idCategorie = null) => {
    const result = await statistiqueService.getDashboardStats(idCategorie);
    if (result?.success) setStats(result.data);
    else toast.error('Erreur chargement statistiques');
  }, []);

  const fetchRecentDoleances = useCallback(async () => {
    const result = await doleanceService.getBackoffice({ limit: 5, page: 1 });
    if (result?.success) setRecentDoleances(result.data?.data?.doleances || []);
    else setErrors(prev => ({ ...prev, recent: true }));
  }, []);

  const fetchMonthlyStats = useCallback(async () => {
    const result = await statistiqueService.getEvolutionTemporelle('month', 6);
    if (result?.success && result.data?.length > 0) {
      setMonthlyStats(result.data.map(item => ({
        ...item, mois: item.periode ? item.periode.substring(5, 7) : item.periode || ''
      })));
    } else setErrors(prev => ({ ...prev, monthly: true }));
  }, []);

  const fetchStatsByCategory = useCallback(async () => {
    const result = await statistiqueService.getStatsByCategorie();
    if (result?.success && result.data?.length > 0) {
      setStatsByCategory(sortAlpha(result.data, 'nom_categorie'));
      setCategoriesCount(result.data.length);
    } else setErrors(prev => ({ ...prev, categories: true }));
  }, []);

  const fetchStatsByStatus = useCallback(async () => {
    const result = await statistiqueService.getStatsByStatut();
    if (result?.success && result.data?.length > 0) setStatsByStatus(result.data);
    else setErrors(prev => ({ ...prev, status: true }));
  }, []);

  const fetchFiltersCount = useCallback(async () => {
    const [catRes, prioRes] = await Promise.all([
      doleanceService.getCategories(),
      doleanceService.getPriorites()
    ]);
    setCategoriesCount(catRes?.data?.length || 0);
    setPrioritesCount(prioRes?.data?.length || 0);
  }, []);

  const handleCategorySelect = useCallback(async (categoryId) => {
    setSelectedCategoryId(categoryId);
    await fetchStats(categoryId);
  }, [fetchStats]);

  const fetchAll = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true); else setRefreshing(true);
    await Promise.allSettled([
      fetchStats(selectedCategoryId), fetchRecentDoleances(), fetchMonthlyStats(),
      fetchStatsByCategory(), fetchStatsByStatus(), fetchFiltersCount()
    ]);
    setLoading(false); setRefreshing(false);
  }, [fetchStats, selectedCategoryId, fetchRecentDoleances, fetchMonthlyStats, fetchStatsByCategory, fetchStatsByStatus, fetchFiltersCount]);

  useEffect(() => { fetchAll(true); }, [fetchAll]);

  const statsCards = [
    { title: 'Total Doléances', value: stats.total, icon: DocumentTextIcon, color: 'bg-blue-500', link: '/backoffice/doleances' },
    { title: 'En cours', value: stats.enCours, icon: ClockIcon, color: 'bg-amber-500', link: '/backoffice/doleances?statut=en_cours' },
    { title: 'Résolues', value: stats.resolues, icon: CheckCircleIcon, color: 'bg-emerald-500', link: '/backoffice/doleances?statut=resolues' },
    { title: 'Urgentes', value: stats.urgentes, icon: ExclamationTriangleIcon, color: 'bg-rose-500', link: '/backoffice/doleances?priorite=urgente' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Bienvenue, <span className="font-medium text-gray-700">{user?.prenom || ''} {user?.nom || ''}</span>
          </p>
        </div>
        <button onClick={() => fetchAll(false)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {statsCards.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <InfoCard title="Catégories disponibles" value={categoriesCount} subtitle="Types de doléances"
          icon={TagIcon} iconBg="bg-blue-50" iconColor="text-blue-500" borderClass="border-blue-100" error={errors.categories} />
        <InfoCard title="Niveaux de priorité" value={prioritesCount} subtitle="De basse à urgente"
          icon={ExclamationTriangleIcon} iconBg="bg-orange-50" iconColor="text-orange-500" borderClass="border-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <EvolutionChart data={monthlyStats} error={errors.monthly} />
        <StatusPieChart data={statsByStatus} error={errors.status} />
      </div>

      <CategoryBar data={statsByCategory} error={errors.categories} selectedId={selectedCategoryId} onSelect={handleCategorySelect} />

      <div className="mt-6 sm:mt-8">
        <RecentDoleancesTable doleances={recentDoleances} error={errors.recent} />
      </div>
    </div>
  );
}

export default Dashboard;
