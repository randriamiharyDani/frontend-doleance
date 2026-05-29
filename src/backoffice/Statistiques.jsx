import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import statistiqueService from '../services/statistiqueService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

function Statistiques() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    enCours: 0,
    resolues: 0,
    urgentes: 0
  });
  const [statsByCategory, setStatsByCategory] = useState([]);
  const [statsByDirection, setStatsByDirection] = useState([]);
  const [statsByStatus, setStatsByStatus] = useState([]);
  const [evolutionData, setEvolutionData] = useState([]);
  const [avgProcessingTime, setAvgProcessingTime] = useState(null);
  const [agentsPerformance, setAgentsPerformance] = useState([]);
  const [satisfactionRate, setSatisfactionRate] = useState(null);

  useEffect(() => {
    fetchAllStats();
  }, [period]);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchStatsByCategory(),
        fetchStatsByDirection(),
        fetchStatsByStatus(),
        fetchEvolutionData(),
        fetchAvgProcessingTime(),
        fetchAgentsPerformance(),
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
    if (result.success) {
      setDashboardStats(result.data);
    }
  };

  const fetchStatsByCategory = async () => {
    const result = await statistiqueService.getStatsByCategorie(period);
    if (result.success) {
      setStatsByCategory(result.data);
    }
  };

  const fetchStatsByDirection = async () => {
    const result = await statistiqueService.getStatsByDirection();
    if (result.success) {
      setStatsByDirection(result.data);
    }
  };

  const fetchStatsByStatus = async () => {
    const result = await statistiqueService.getStatsByStatut();
    if (result.success) {
      setStatsByStatus(result.data);
    }
  };

  const fetchEvolutionData = async () => {
    const result = await statistiqueService.getEvolutionTemporelle(period, 12);
    if (result.success) {
      setEvolutionData(result.data);
    }
  };

  const fetchAvgProcessingTime = async () => {
    const result = await statistiqueService.getTempsTraitementMoyen();
    if (result.success) {
      setAvgProcessingTime(result.data);
    }
  };

  const fetchAgentsPerformance = async () => {
    const result = await statistiqueService.getPerformanceAgents(period);
    if (result.success) {
      setAgentsPerformance(result.data);
    }
  };

  const fetchSatisfactionRate = async () => {
    const result = await statistiqueService.getTauxSatisfaction();
    if (result.success) {
      setSatisfactionRate(result.data);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      await statistiqueService.exportStats({ periode: period }, format);
      toast.success(`Export ${format.toUpperCase()} généré avec succès`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const statsCards = [
    { 
      title: 'Total Doléances', 
      value: dashboardStats.total, 
      icon: DocumentTextIcon, 
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'up'
    },
    { 
      title: 'En cours', 
      value: dashboardStats.enCours, 
      icon: ClockIcon, 
      color: 'bg-yellow-500',
      change: '+5%',
      changeType: 'up'
    },
    { 
      title: 'Résolues', 
      value: dashboardStats.resolues, 
      icon: CheckCircleIcon, 
      color: 'bg-green-500',
      change: '+18%',
      changeType: 'up'
    },
    { 
      title: 'Urgentes', 
      value: dashboardStats.urgentes, 
      icon: ExclamationTriangleIcon, 
      color: 'bg-red-500',
      change: '-2%',
      changeType: 'down'
    },
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Statistiques</h1>
          <p className="text-gray-600 mt-1">Analyse des doléances et performances</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
          </select>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Exporter CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${stat.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} vs période précédente
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique d'évolution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Évolution des doléances</h2>
        {evolutionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periode" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Total" />
              <Area type="monotone" dataKey="resolues" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Résolues" />
              <Area type="monotone" dataKey="urgentes" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Urgentes" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique par catégorie */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Doléances par catégorie</h2>
          {statsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={statsByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nom_categorie" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Nombre" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Graphique par statut */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Doléances par statut</h2>
          {statsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={statsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nom_statut, percentage }) => `${nom_statut}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique par direction */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Doléances par direction</h2>
          {statsByDirection.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={statsByDirection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom_direction" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8B5CF6" name="Nombre" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Temps de traitement moyen */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Temps de traitement moyen</h2>
          {avgProcessingTime ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Moyen</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(avgProcessingTime.moyen_heures || 0)}h
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Minimum</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(avgProcessingTime.min_heures || 0)}h
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Maximum</p>
                  <p className="text-2xl font-bold text-red-600">
                    {Math.round(avgProcessingTime.max_heures || 0)}h
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Par priorité :</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basse priorité</span>
                    <span className="font-semibold">{Math.round(avgProcessingTime.basse_heures || 0)} heures</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Priorité moyenne</span>
                    <span className="font-semibold">{Math.round(avgProcessingTime.moyenne_heures || 0)} heures</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Haute priorité</span>
                    <span className="font-semibold">{Math.round(avgProcessingTime.haute_heures || 0)} heures</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgente</span>
                    <span className="font-semibold text-red-600">{Math.round(avgProcessingTime.urgente_heures || 0)} heures</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Performance des agents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Performance des agents</h2>
        {agentsPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doléances traitées</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Résolues</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux de résolution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temps moyen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agentsPerformance.map((agent, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {agent.prenom?.charAt(0)}{agent.nom?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{agent.prenom} {agent.nom}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.doleances_traitees || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.doleances_resolues || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${((agent.doleances_resolues || 0) / (agent.doleances_traitees || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {Math.round(((agent.doleances_resolues || 0) / (agent.doleances_traitees || 1)) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.round(agent.temps_moyen_heures || 0)} heures
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
        )}
      </div>

      {/* Satisfaction */}
      {satisfactionRate && satisfactionRate.total_avis > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Satisfaction citoyenne</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{satisfactionRate.taux_satisfaction || 0}%</div>
              <p className="text-gray-500 mt-1">Taux de satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{satisfactionRate.note_moyenne || 0}/5</div>
              <p className="text-gray-500 mt-1">Note moyenne</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{satisfactionRate.total_avis || 0}</div>
              <p className="text-gray-500 mt-1">Avis reçus</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistiques;