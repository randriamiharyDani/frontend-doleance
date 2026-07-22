import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import statistiqueService from '../services/statistiqueService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import StatsCards from '../pages/backoffice/Statistiques/StatsCards';
import EvolutionAreaChart from '../pages/backoffice/Statistiques/EvolutionAreaChart';
import CategoryBarChart from '../pages/backoffice/Statistiques/CategoryBarChart';
import StatusDonutChart from '../pages/backoffice/Statistiques/StatusDonutChart';
import ProcessingTimeCard from '../pages/backoffice/Statistiques/ProcessingTimeCard';
import SatisfactionCard from '../pages/backoffice/Statistiques/SatisfactionCard';

function Statistiques() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [exporting, setExporting] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({ total: 0, enCours: 0, resolues: 0, urgentes: 0 });
  const [statsByCategory, setStatsByCategory] = useState([]);
  const [statsByStatus, setStatsByStatus] = useState([]);
  const [evolutionData, setEvolutionData] = useState([]);
  const [avgProcessingTime, setAvgProcessingTime] = useState(null);
  const [satisfactionRate, setSatisfactionRate] = useState(null);
  const [chartReady, setChartReady] = useState(false);

  const userRole = user?.role || user?.nom_role;
  const isAdmin = userRole === 'administrateur_systeme' || userRole === 'administrateur' || userRole === 'agent_central';
  const isDirector = userRole === 'directeur' || userRole === 'chef_service';

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 300);
    fetchAllStats();
    return () => clearTimeout(timer);
  }, [period]);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchStatsByCategory(),
        fetchStatsByStatus(),
        fetchEvolutionData(),
        fetchAvgProcessingTime(),
        fetchSatisfactionRate()
      ]);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    const result = await statistiqueService.getDashboardStats();
    if (result?.success) setDashboardStats(result.data);
  };

  const fetchStatsByCategory = async () => {
    const result = await statistiqueService.getStatsByCategorie(period);
    if (result?.success) setStatsByCategory(result.data || []);
  };

  const fetchStatsByStatus = async () => {
    const result = await statistiqueService.getStatsByStatut();
    if (result?.success) setStatsByStatus(result.data || []);
  };

  const fetchEvolutionData = async () => {
    const result = await statistiqueService.getEvolutionTemporelle(period, 12);
    if (result?.success) setEvolutionData(result.data || []);
  };

  const fetchAvgProcessingTime = async () => {
    const result = await statistiqueService.getTempsTraitementMoyen();
    if (result?.success) setAvgProcessingTime(result.data);
  };

  const fetchSatisfactionRate = async () => {
    const result = await statistiqueService.getTauxSatisfaction();
    if (result?.success) setSatisfactionRate(result.data);
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      let csv = "Rapport des Statistiques CUA\n";
      csv += `Généré le ${new Date().toLocaleString('fr-FR')}\n\n`;
      csv += "RÉSUMÉ GÉNÉRAL\nIndicateur;Valeur\n";
      csv += `Total doléances;${dashboardStats.total || 0}\nEn cours;${dashboardStats.enCours || 0}\nRésolues;${dashboardStats.resolues || 0}\nUrgentes;${dashboardStats.urgentes || 0}\n\n`;

      if (statsByCategory.length > 0) {
        csv += "PAR CATÉGORIE\nCatégorie;Nombre;Pourcentage\n";
        statsByCategory.forEach(c => { csv += `${c.nom_categorie};${c.count || 0};${c.percentage || 0}\n`; });
        csv += "\n";
      }
      if (statsByStatus.length > 0) {
        csv += "PAR STATUT\nStatut;Nombre;Pourcentage\n";
        statsByStatus.forEach(s => { csv += `${s.nom_statut};${s.count || 0};${s.percentage || 0}\n`; });
        csv += "\n";
      }
      if (evolutionData.length > 0) {
        csv += "ÉVOLUTION\nPériode;Total;Résolues;Urgentes\n";
        evolutionData.forEach(e => { csv += `${e.periode};${e.total || 0};${e.resolues || 0};${e.urgentes || 0}\n`; });
        csv += "\n";
      }
      if (avgProcessingTime) {
        csv += "TEMPS TRAITEMENT\nIndicateur;Valeur (heures)\n";
        ['moyen_heures', 'min_heures', 'max_heures', 'basse_heures', 'moyenne_heures', 'haute_heures', 'urgente_heures'].forEach(k => {
          csv += `${k.replace('_heures', '').replace(/_/g, ' ')};${Math.round(avgProcessingTime[k] || 0)}\n`;
        });
        csv += "\n";
      }
      if (satisfactionRate?.total_avis > 0) {
        csv += "SATISFACTION\nIndicateur;Valeur\n";
        csv += `Taux;${satisfactionRate.taux_satisfaction || 0}%\nNote;${satisfactionRate.note_moyenne || 0}/5\nAvis;${satisfactionRate.total_avis || 0}\n`;
      }

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `statistiques_CUA_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV exporté avec succès');
    } catch (error) {
      toast.error("Erreur export CSV");
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const summary = [
        ['RAPPORT STATISTIQUES CUA'], [`Généré le ${new Date().toLocaleString('fr-FR')}`], [],
        ['RÉSUMÉ GÉNÉRAL'], ['Indicateur', 'Valeur'],
        ['Total doléances', dashboardStats.total || 0],
        ['En cours', dashboardStats.enCours || 0],
        ['Résolues', dashboardStats.resolues || 0],
        ['Urgentes', dashboardStats.urgentes || 0]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Résumé');

      if (statsByCategory.length > 0) {
        const catData = [['Catégorie', 'Nombre', 'Pourcentage (%)']];
        statsByCategory.forEach(c => catData.push([c.nom_categorie, c.count || 0, c.percentage || 0]));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['PAR CATÉGORIE'], [], ...catData]), 'Catégories');
      }
      if (statsByStatus.length > 0) {
        const stData = [['Statut', 'Nombre', 'Pourcentage (%)']];
        statsByStatus.forEach(s => stData.push([s.nom_statut, s.count || 0, s.percentage || 0]));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['PAR STATUT'], [], ...stData]), 'Statuts');
      }
      if (evolutionData.length > 0) {
        const evData = [['Période', 'Total', 'Résolues', 'Urgentes']];
        evolutionData.forEach(e => evData.push([e.periode, e.total || 0, e.resolues || 0, e.urgentes || 0]));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['ÉVOLUTION'], [], ...evData]), 'Évolution');
      }

      XLSX.writeFile(wb, `statistiques_CUA_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel exporté avec succès');
    } catch (error) {
      toast.error("Erreur export Excel");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 ml-3">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">Statistiques</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Analyse des doléances et performances</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">
            <ChartBarIcon className="h-3 w-3" />
            {isAdmin ? 'Vue administrateur' : isDirector ? 'Vue direction' : 'Vue générale'}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
          </select>
          <button onClick={exportToExcel} disabled={exporting}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 text-sm">
            <ArrowDownTrayIcon className="h-4 w-4" /> {exporting ? 'Export...' : 'Excel'}
          </button>
          <button onClick={exportToCSV} disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 text-sm">
            <ArrowDownTrayIcon className="h-4 w-4" /> {exporting ? 'Export...' : 'CSV'}
          </button>
        </div>
      </div>

      <StatsCards stats={dashboardStats} />

      {chartReady && evolutionData.length > 0 && <EvolutionAreaChart data={evolutionData} isAdmin={isAdmin} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartReady && statsByCategory.length > 0 && <CategoryBarChart data={statsByCategory} />}
        {chartReady && statsByStatus.length > 0 && <StatusDonutChart data={statsByStatus} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessingTimeCard data={avgProcessingTime} />
        <SatisfactionCard data={satisfactionRate} />
      </div>

      {chartReady && evolutionData.length === 0 && statsByCategory.length === 0 && statsByStatus.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-500 dark:text-gray-400">Les statistiques seront disponibles lorsque des doléances seront déposées.</p>
        </div>
      )}
    </div>
  );
}

export default Statistiques;
