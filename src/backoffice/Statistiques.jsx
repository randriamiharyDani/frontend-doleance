import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChartBarIcon, ArrowDownTrayIcon, DocumentTextIcon,
  CheckCircleIcon, TableCellsIcon
} from '@heroicons/react/24/outline';
import statistiqueService from '../services/statistiqueService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import StatsCards from '../pages/backoffice/Statistiques/StatsCards';
import EvolutionAreaChart from '../pages/backoffice/Statistiques/EvolutionAreaChart';
import EvolutionBarChart from '../pages/backoffice/Statistiques/EvolutionBarChart';
import StatusDonutChart from '../pages/backoffice/Statistiques/StatusDonutChart';
import SatisfactionCard from '../pages/backoffice/Statistiques/SatisfactionCard';

function Statistiques() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [exporting, setExporting] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({ total: 0, enCours: 0, resolues: 0, urgentes: 0 });
  const [exportSections, setExportSections] = useState({
    resume: true, categories: true, statuts: true, evolution: true, satisfaction: true
  });
  const [statsByCategory, setStatsByCategory] = useState([]);
  const [statsByStatus, setStatsByStatus] = useState([]);
  const [evolutionData, setEvolutionData] = useState([]);
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

  const fetchSatisfactionRate = async () => {
    const result = await statistiqueService.getTauxSatisfaction();
    if (result?.success) setSatisfactionRate(result.data);
  };

  const sectionMeta = useMemo(() => [
    { key: 'resume', label: 'Résumé général', count: 4, icon: ChartBarIcon },
    { key: 'categories', label: 'Par catégorie', count: statsByCategory.length, icon: TableCellsIcon },
    { key: 'statuts', label: 'Par statut', count: statsByStatus.length, icon: CheckCircleIcon },
    { key: 'evolution', label: 'Évolution', count: evolutionData.length, icon: DocumentTextIcon },
    { key: 'satisfaction', label: 'Satisfaction', count: satisfactionRate?.total_avis > 0 ? 1 : 0, icon: ChartBarIcon },
  ], [statsByCategory, statsByStatus, evolutionData, satisfactionRate]);

  const hasAnyData = useMemo(() =>
    sectionMeta.some(s => s.count > 0), [sectionMeta]);

  const toggleSection = (key) => {
    setExportSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const buildCSV = useCallback(() => {
    const s = exportSections;
    let csv = "Rapport des Statistiques CUA\n";
    csv += `Généré le ${new Date().toLocaleString('fr-FR')}\n\n`;

    if (s.resume) {
      csv += "RÉSUMÉ GÉNÉRAL\nIndicateur;Valeur\n";
      csv += `Total doléances;${dashboardStats.total || 0}\nEn cours;${dashboardStats.enCours || 0}\nRésolues;${dashboardStats.resolues || 0}\nUrgentes;${dashboardStats.urgentes || 0}\n\n`;
    }
    if (s.categories && statsByCategory.length > 0) {
      csv += "PAR CATÉGORIE\nCatégorie;Nombre;Pourcentage\n";
      statsByCategory.forEach(c => { csv += `${c.nom_categorie};${c.count || 0};${c.percentage || 0}\n`; });
      csv += "\n";
    }
    if (s.statuts && statsByStatus.length > 0) {
      csv += "PAR STATUT\nStatut;Nombre;Pourcentage\n";
      statsByStatus.forEach(st => { csv += `${st.nom_statut};${st.count || 0};${st.percentage || 0}\n`; });
      csv += "\n";
    }
    if (s.evolution && evolutionData.length > 0) {
      csv += "ÉVOLUTION\nPériode;Total;Résolues;Urgentes\n";
      evolutionData.forEach(e => { csv += `${e.periode};${e.total || 0};${e.resolues || 0};${e.urgentes || 0}\n`; });
      csv += "\n";
    }
    if (s.satisfaction && satisfactionRate?.total_avis > 0) {
      csv += "SATISFACTION\nIndicateur;Valeur\n";
      csv += `Taux;${satisfactionRate.taux_satisfaction || 0}%\nNote;${satisfactionRate.note_moyenne || 0}/5\nAvis;${satisfactionRate.total_avis || 0}\n`;
    }
    return csv;
  }, [exportSections, dashboardStats, statsByCategory, statsByStatus, evolutionData, satisfactionRate]);

  const exportToCSV = useCallback(() => {
    setExporting('csv');
    setTimeout(() => {
      try {
        const csv = buildCSV();
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
        setExporting(null);
      }
    }, 300);
  }, [buildCSV]);

  const buildExcelData = useCallback(() => {
    const s = exportSections;
    const wb = XLSX.utils.book_new();

    if (s.resume) {
      const summary = [
        ['RAPPORT STATISTIQUES CUA'], [`Généré le ${new Date().toLocaleString('fr-FR')}`], [],
        ['RÉSUMÉ GÉNÉRAL'], ['Indicateur', 'Valeur'],
        ['Total doléances', dashboardStats.total || 0],
        ['En cours', dashboardStats.enCours || 0],
        ['Résolues', dashboardStats.resolues || 0],
        ['Urgentes', dashboardStats.urgentes || 0]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Résumé');
    }
    if (s.categories && statsByCategory.length > 0) {
      const catData = [['Catégorie', 'Nombre', 'Pourcentage (%)']];
      statsByCategory.forEach(c => catData.push([c.nom_categorie, c.count || 0, c.percentage || 0]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['PAR CATÉGORIE'], [], ...catData]), 'Catégories');
    }
    if (s.statuts && statsByStatus.length > 0) {
      const stData = [['Statut', 'Nombre', 'Pourcentage (%)']];
      statsByStatus.forEach(st => stData.push([st.nom_statut, st.count || 0, st.percentage || 0]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['PAR STATUT'], [], ...stData]), 'Statuts');
    }
    if (s.evolution && evolutionData.length > 0) {
      const evData = [['Période', 'Total', 'Résolues', 'Urgentes']];
      evolutionData.forEach(e => evData.push([e.periode, e.total || 0, e.resolues || 0, e.urgentes || 0]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['ÉVOLUTION'], [], ...evData]), 'Évolution');
    }
    return wb;
  }, [exportSections, dashboardStats, statsByCategory, statsByStatus, evolutionData]);

  const exportToExcel = useCallback(() => {
    setExporting('excel');
    setTimeout(() => {
      try {
        const wb = buildExcelData();
        XLSX.writeFile(wb, `statistiques_CUA_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel exporté avec succès');
      } catch (error) {
        toast.error("Erreur export Excel");
      } finally {
        setExporting(null);
      }
    }, 300);
  }, [buildExcelData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 ml-3">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistiques</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analyse des doléances et performances</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <ChartBarIcon className="h-3 w-3" />
            {isAdmin ? 'Vue administrateur' : isDirector ? 'Vue direction' : 'Vue générale'}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input">
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
          </select>
          <button onClick={exportToExcel} disabled={exporting} className="btn-secondary btn-md bg-emerald-600 text-white hover:bg-emerald-700">
            <ArrowDownTrayIcon className="h-4 w-4" /> {exporting ? 'Export...' : 'Excel'}
          </button>
          <button onClick={exportToCSV} disabled={exporting} className="btn-secondary btn-md">
            <ArrowDownTrayIcon className="h-4 w-4" /> {exporting ? 'Export...' : 'CSV'}
          </button>
        </div>
      </div>

      <StatsCards stats={dashboardStats} />

      {chartReady && statsByCategory.length > 0 && <EvolutionAreaChart data={statsByCategory} isAdmin={isAdmin} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartReady && evolutionData.length > 0 && <EvolutionBarChart data={evolutionData} />}
        {chartReady && statsByStatus.length > 0 && <StatusDonutChart data={statsByStatus} />}
      </div>

      {satisfactionRate && <SatisfactionCard data={satisfactionRate} />}

      {/* Export card */}
      {hasAnyData && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <ArrowDownTrayIcon className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Exporter les données</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sélectionnez les sections à inclure dans le fichier</p>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
              {sectionMeta.map(({ key, label, count, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => toggleSection(key)}
                  disabled={count === 0}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    exportSections[key]
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-slate-600 dark:bg-slate-700/50 opacity-60'
                  } ${count === 0 ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                >
                  <div className={`p-1 rounded ${exportSections[key] ? 'bg-blue-100 dark:bg-blue-800/40' : 'bg-gray-100 dark:bg-slate-600'}`}>
                    <Icon className={`h-3.5 w-3.5 ${exportSections[key] ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{label}</p>
                    <p className={`text-[10px] ${count > 0 ? 'text-gray-400' : 'text-gray-300 dark:text-gray-500'}`}>
                      {count > 0 ? `${count} élément${count > 1 ? 's' : ''}` : 'Indisponible'}
                    </p>
                  </div>
                  {exportSections[key] && (
                    <CheckCircleIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Fichier : <span className="font-mono text-gray-600 dark:text-gray-300">statistiques_CUA_{new Date().toISOString().split('T')[0]}.{exporting === 'excel' ? 'xlsx' : 'csv'}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  disabled={exporting !== null}
                  className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {exporting === 'csv' ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <DocumentTextIcon className="h-3.5 w-3.5" />
                  )}
                  {exporting === 'csv' ? 'Génération...' : 'CSV'}
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={exporting !== null}
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {exporting === 'excel' ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <TableCellsIcon className="h-3.5 w-3.5" />
                  )}
                  {exporting === 'excel' ? 'Génération...' : 'Excel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {chartReady && !hasAnyData && (
        <div className="card p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-500 dark:text-gray-400">Les statistiques seront disponibles lorsque des doléances seront déposées.</p>
        </div>
      )}
    </div>
  );
}

export default Statistiques;
