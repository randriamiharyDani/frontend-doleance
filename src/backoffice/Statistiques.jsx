import React, { useState, useEffect, useRef } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import statistiqueService from '../services/statistiqueService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.name}
            </span>
            <span className="font-bold text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Légende personnalisée pour le PieChart
const renderLegend = (props, data) => {
  const { payload } = props;
  const total = (data || []).reduce((sum, item) => sum + (item.count || 0), 0);
  
  return (
    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
      {payload && payload.map((entry, index) => {
        const percentage = total > 0 ? ((entry.payload.count || 0) / total * 100).toFixed(1) : 0;
        return (
          <div key={`legend-${index}`} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-700">{entry.value}</span>
            <span className="text-gray-400">({percentage}%)</span>
          </div>
        );
      })}
    </div>
  );
};

function Statistiques() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [exporting, setExporting] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    enCours: 0,
    resolues: 0,
    urgentes: 0
  });
  const [statsByCategory, setStatsByCategory] = useState([]);
  const [statsByDirection, setStatsByDirection] = useState([]); // gardé pour usage futur
  const [statsByStatus, setStatsByStatus] = useState([]);
  const [evolutionData, setEvolutionData] = useState([]);
  const [avgProcessingTime, setAvgProcessingTime] = useState(null);
  const [satisfactionRate, setSatisfactionRate] = useState(null);

  const userRole = user?.role || user?.nom_role;
  const isAdmin = userRole === 'administrateur_systeme' || userRole === 'administrateur' || userRole === 'agent_central';
  const isDirector = userRole === 'directeur' || userRole === 'chef_service';

  // Référence pour les conteneurs de graphiques
  const chartContainerRef = useRef(null);

  useEffect(() => {
    // Attendre que le DOM soit prêt pour les graphiques
    const timer = setTimeout(() => setChartReady(true), 300);
    fetchAllStats();
    return () => clearTimeout(timer);
  }, [period]);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const promises = [
        fetchDashboardStats(),
        fetchStatsByCategory(),
        fetchStatsByStatus(),
        fetchEvolutionData(),
        fetchAvgProcessingTime(),
        fetchSatisfactionRate()
      ];
      
      // La route /statistiques/directions n'existe pas, on la commente
      // if (isAdmin) {
      //   promises.push(fetchStatsByDirection());
      // }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  // --- Appels API ---
  const fetchDashboardStats = async () => {
    try {
      const result = await statistiqueService.getDashboardStats();
      if (result?.success) {
        setDashboardStats(result.data);
      }
    } catch (error) {
      console.error('Erreur fetch dashboard stats:', error);
    }
  };

  const fetchStatsByCategory = async () => {
    try {
      const result = await statistiqueService.getStatsByCategorie(period);
      if (result?.success) {
        setStatsByCategory(result.data || []);
      }
    } catch (error) {
      console.error('Erreur fetch stats by category:', error);
    }
  };

  // Cette fonction n'est plus appelée mais conservée
  const fetchStatsByDirection = async () => {
    try {
      // La route n'existe pas, on simule un succès avec des données vides
      setStatsByDirection([]);
    } catch (error) {
      console.error('Erreur fetch stats by direction:', error);
    }
  };

  const fetchStatsByStatus = async () => {
    try {
      const result = await statistiqueService.getStatsByStatut();
      if (result?.success) {
        setStatsByStatus(result.data || []);
      }
    } catch (error) {
      console.error('Erreur fetch stats by status:', error);
    }
  };

  const fetchEvolutionData = async () => {
    try {
      const result = await statistiqueService.getEvolutionTemporelle(period, 12);
      if (result?.success) {
        setEvolutionData(result.data || []);
      }
    } catch (error) {
      console.error('Erreur fetch evolution data:', error);
    }
  };

  const fetchAvgProcessingTime = async () => {
    try {
      const result = await statistiqueService.getTempsTraitementMoyen();
      if (result?.success) {
        setAvgProcessingTime(result.data);
      }
    } catch (error) {
      console.error('Erreur fetch avg processing time:', error);
    }
  };

  const fetchSatisfactionRate = async () => {
    try {
      const result = await statistiqueService.getTauxSatisfaction();
      if (result?.success) {
        setSatisfactionRate(result.data);
      }
    } catch (error) {
      console.error('Erreur fetch satisfaction rate:', error);
    }
  };

  // --- Export CSV ---
  const exportToCSV = () => {
    setExporting(true);
    try {
      let csvContent = "Rapport des Statistiques CUA\n";
      csvContent += `Généré le ${new Date().toLocaleString('fr-FR')}\n\n`;
      
      csvContent += "RÉSUMÉ GÉNÉRAL\n";
      csvContent += "Indicateur;Valeur\n";
      csvContent += `Total doléances;${dashboardStats.total || 0}\n`;
      csvContent += `En cours;${dashboardStats.enCours || 0}\n`;
      csvContent += `Résolues;${dashboardStats.resolues || 0}\n`;
      csvContent += `Urgentes;${dashboardStats.urgentes || 0}\n\n`;
      
      if (statsByCategory.length > 0) {
        csvContent += "DOLÉANCES PAR CATÉGORIE\n";
        csvContent += "Catégorie;Nombre;Pourcentage\n";
        statsByCategory.forEach(cat => {
          csvContent += `${cat.nom_categorie};${cat.count || 0};${cat.percentage || 0}\n`;
        });
        csvContent += "\n";
      }
      
      if (statsByStatus.length > 0) {
        csvContent += "DOLÉANCES PAR STATUT\n";
        csvContent += "Statut;Nombre;Pourcentage\n";
        statsByStatus.forEach(status => {
          csvContent += `${status.nom_statut};${status.count || 0};${status.percentage || 0}\n`;
        });
        csvContent += "\n";
      }
      
      // Section direction désactivée car route non disponible
      
      if (evolutionData.length > 0) {
        csvContent += "ÉVOLUTION\n";
        csvContent += "Période;Total;Résolues;Urgentes\n";
        evolutionData.forEach(ev => {
          csvContent += `${ev.periode};${ev.total || 0};${ev.resolues || 0};${ev.urgentes || 0}\n`;
        });
        csvContent += "\n";
      }
      
      if (avgProcessingTime) {
        csvContent += "TEMPS DE TRAITEMENT MOYEN\n";
        csvContent += "Indicateur;Valeur (heures)\n";
        csvContent += `Moyen;${Math.round(avgProcessingTime.moyen_heures || 0)}\n`;
        csvContent += `Minimum;${Math.round(avgProcessingTime.min_heures || 0)}\n`;
        csvContent += `Maximum;${Math.round(avgProcessingTime.max_heures || 0)}\n`;
        csvContent += `Basse priorité;${Math.round(avgProcessingTime.basse_heures || 0)}\n`;
        csvContent += `Priorité moyenne;${Math.round(avgProcessingTime.moyenne_heures || 0)}\n`;
        csvContent += `Haute priorité;${Math.round(avgProcessingTime.haute_heures || 0)}\n`;
        csvContent += `Urgente;${Math.round(avgProcessingTime.urgente_heures || 0)}\n\n`;
      }
      
      if (satisfactionRate && satisfactionRate.total_avis > 0) {
        csvContent += "SATISFACTION CITOYENNE\n";
        csvContent += "Indicateur;Valeur\n";
        csvContent += `Taux de satisfaction;${satisfactionRate.taux_satisfaction || 0}%\n`;
        csvContent += `Note moyenne;${satisfactionRate.note_moyenne || 0}/5\n`;
        csvContent += `Nombre d'avis;${satisfactionRate.total_avis || 0}\n`;
        csvContent += `Citoyens satisfaits;${satisfactionRate.satisfaits || 0}\n`;
        csvContent += `Citoyens insatisfaits;${satisfactionRate.insatisfaits || 0}\n`;
      }
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", `statistiques_CUA_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('CSV exporté avec succès');
    } catch (error) {
      console.error('Erreur export CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    } finally {
      setExporting(false);
    }
  };

  // --- Export Excel ---
  const exportToExcel = () => {
    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      const summaryData = [
        ['RAPPORT DES STATISTIQUES CUA'],
        [`Généré le ${new Date().toLocaleString('fr-FR')}`],
        [],
        ['RÉSUMÉ GÉNÉRAL'],
        ['Indicateur', 'Valeur'],
        ['Total doléances', dashboardStats.total || 0],
        ['Doléances en cours', dashboardStats.enCours || 0],
        ['Doléances résolues', dashboardStats.resolues || 0],
        ['Doléances urgentes', dashboardStats.urgentes || 0],
        []
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé général');
      
      if (statsByCategory.length > 0) {
        const categoryData = [['DOLÉANCES PAR CATÉGORIE'], [], ['Catégorie', 'Nombre', 'Pourcentage (%)']];
        statsByCategory.forEach(cat => {
          categoryData.push([cat.nom_categorie, cat.count || 0, cat.percentage || 0]);
        });
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Par catégorie');
      }
      
      if (statsByStatus.length > 0) {
        const statusData = [['DOLÉANCES PAR STATUT'], [], ['Statut', 'Nombre', 'Pourcentage (%)']];
        statsByStatus.forEach(status => {
          statusData.push([status.nom_statut, status.count || 0, status.percentage || 0]);
        });
        const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
        XLSX.utils.book_append_sheet(workbook, statusSheet, 'Par statut');
      }
      
      // Section direction désactivée
      
      if (evolutionData.length > 0) {
        const evolutionDataSheet = [['ÉVOLUTION'], [], ['Période', 'Total', 'Résolues', 'Urgentes']];
        evolutionData.forEach(ev => {
          evolutionDataSheet.push([ev.periode, ev.total || 0, ev.resolues || 0, ev.urgentes || 0]);
        });
        const evolutionSheet = XLSX.utils.aoa_to_sheet(evolutionDataSheet);
        XLSX.utils.book_append_sheet(workbook, evolutionSheet, 'Évolution');
      }
      
      if (avgProcessingTime) {
        const timeData = [
          ['TEMPS DE TRAITEMENT MOYEN'],
          [],
          ['Indicateur', 'Valeur (heures)'],
          ['Temps moyen', Math.round(avgProcessingTime.moyen_heures || 0)],
          ['Temps minimum', Math.round(avgProcessingTime.min_heures || 0)],
          ['Temps maximum', Math.round(avgProcessingTime.max_heures || 0)],
          ['Basse priorité', Math.round(avgProcessingTime.basse_heures || 0)],
          ['Priorité moyenne', Math.round(avgProcessingTime.moyenne_heures || 0)],
          ['Haute priorité', Math.round(avgProcessingTime.haute_heures || 0)],
          ['Urgente', Math.round(avgProcessingTime.urgente_heures || 0)]
        ];
        const timeSheet = XLSX.utils.aoa_to_sheet(timeData);
        XLSX.utils.book_append_sheet(workbook, timeSheet, 'Temps de traitement');
      }
      
      if (satisfactionRate && satisfactionRate.total_avis > 0) {
        const satisfactionData = [
          ['SATISFACTION CITOYENNE'],
          [],
          ['Indicateur', 'Valeur'],
          ['Taux de satisfaction', `${satisfactionRate.taux_satisfaction || 0}%`],
          ['Note moyenne', `${satisfactionRate.note_moyenne || 0}/5`],
          ['Nombre d\'avis', satisfactionRate.total_avis || 0],
          ['Citoyens satisfaits', satisfactionRate.satisfaits || 0],
          ['Citoyens insatisfaits', satisfactionRate.insatisfaits || 0]
        ];
        const satisfactionSheet = XLSX.utils.aoa_to_sheet(satisfactionData);
        XLSX.utils.book_append_sheet(workbook, satisfactionSheet, 'Satisfaction');
      }
      
      XLSX.writeFile(workbook, `statistiques_CUA_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel exporté avec succès');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      toast.error('Erreur lors de l\'export Excel: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // --- Cartes de résumé ---
  const statsCards = [
    { title: 'Total Doléances', value: dashboardStats.total || 0, icon: DocumentTextIcon, color: 'bg-blue-500' },
    { title: 'En cours', value: dashboardStats.enCours || 0, icon: ClockIcon, color: 'bg-amber-500' },
    { title: 'Résolues', value: dashboardStats.resolues || 0, icon: CheckCircleIcon, color: 'bg-emerald-500' },
    { title: 'Urgentes', value: dashboardStats.urgentes || 0, icon: ExclamationTriangleIcon, color: 'bg-rose-500' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* En-tête avec boutons d'export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Statistiques</h1>
          <p className="text-gray-500 mt-1">Analyse des doléances et performances</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">
            <ChartBarIcon className="h-3 w-3" />
            {isAdmin ? 'Vue administrateur - Données complètes' : (isDirector ? 'Vue direction - Données de votre service' : 'Vue générale')}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-white"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
          </select>
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 text-sm transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {exporting ? 'Export...' : 'Excel'}
          </button>
          <button
            onClick={exportToCSV}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 text-sm transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {exporting ? 'Export...' : 'CSV'}
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">{stat.title}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2.5 sm:p-3 rounded-xl shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique d'évolution - AreaChart */}
      {chartReady && evolutionData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Évolution des doléances</h2>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="periode" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Total" strokeWidth={2} />
                <Area type="monotone" dataKey="resolues" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Résolues" strokeWidth={2} />
                {isAdmin && (
                  <Area type="monotone" dataKey="urgentes" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} name="Urgentes" strokeWidth={2} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique par catégorie - BarChart horizontal */}
        {chartReady && statsByCategory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Doléances par catégorie</h2>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis type="category" dataKey="nom_categorie" stroke="#6B7280" fontSize={11} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3B82F6" name="Nombre" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Graphique par statut - Donut */}
        {chartReady && statsByStatus.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Doléances par statut</h2>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="nom_statut"
                  >
                    {statsByStatus.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.nom_statut] || COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={(props) => renderLegend(props, statsByStatus)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Graphique par direction (désactivé car route non disponible) */}
      {false && chartReady && isAdmin && statsByDirection.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Doléances par direction</h2>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsByDirection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="nom_direction" angle={-45} textAnchor="end" height={80} interval={0} stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8B5CF6" name="Nombre" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temps de traitement moyen */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Temps de traitement moyen</h2>
          {avgProcessingTime ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs text-gray-500 font-medium">Moyen</p>
                  <p className="text-xl font-bold text-blue-600">
                    {Math.round(avgProcessingTime.moyen_heures || 0)}h
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs text-gray-500 font-medium">Minimum</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {Math.round(avgProcessingTime.min_heures || 0)}h
                  </p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                  <p className="text-xs text-gray-500 font-medium">Maximum</p>
                  <p className="text-xl font-bold text-rose-600">
                    {Math.round(avgProcessingTime.max_heures || 0)}h
                  </p>
                </div>
              </div>
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Par priorité :</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Basse priorité', value: avgProcessingTime.basse_heures, color: 'text-emerald-600' },
                    { label: 'Priorité moyenne', value: avgProcessingTime.moyenne_heures, color: 'text-blue-600' },
                    { label: 'Haute priorité', value: avgProcessingTime.haute_heures, color: 'text-amber-600' },
                    { label: 'Urgente', value: avgProcessingTime.urgente_heures, color: 'text-rose-600' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className={`font-semibold ${item.color}`}>{Math.round(item.value || 0)} heures</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-48">
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Satisfaction citoyenne */}
        {satisfactionRate && satisfactionRate.total_avis > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Satisfaction citoyenne</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-600">{satisfactionRate.taux_satisfaction || 0}%</div>
                <p className="text-xs text-gray-500 mt-1 font-medium">Taux satisfaction</p>
                <div className="mt-2 w-full bg-emerald-200 rounded-full h-1.5">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(satisfactionRate.taux_satisfaction || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{satisfactionRate.note_moyenne || 0}/5</div>
                <p className="text-xs text-gray-500 mt-1 font-medium">Note moyenne</p>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < Math.round(satisfactionRate.note_moyenne || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{satisfactionRate.total_avis || 0}</div>
                <p className="text-xs text-gray-500 mt-1 font-medium">Avis reçus</p>
                <div className="flex justify-center gap-4 mt-2 text-sm">
                  <span className="text-emerald-600">😊 {satisfactionRate.satisfaits || 0}</span>
                  <span className="text-rose-600">😞 {satisfactionRate.insatisfaits || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Message si aucune donnée */}
      {chartReady && evolutionData.length === 0 && statsByCategory.length === 0 && statsByStatus.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-500">Les statistiques seront disponibles lorsque des doléances seront déposées.</p>
        </div>
      )}
    </div>
  );
}

export default Statistiques;