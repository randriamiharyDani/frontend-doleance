import React, { useState, useEffect } from 'react';
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
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    resolues: 0,
    urgentes: 0
  });
  const [recentDoleances, setRecentDoleances] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [statsByCategory, setStatsByCategory] = useState([]);
  const [statsByStatus, setStatsByStatus] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentDoleances(),
        fetchMonthlyStats(),
        fetchStatsByCategory(),
        fetchStatsByStatus()
      ]);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/statistiques/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const fetchRecentDoleances = async () => {
    try {
      const response = await api.get('/doleances?limit=5');
      if (response.data.success) {
        setRecentDoleances(response.data.data.doleances || []);
      }
    } catch (error) {
      console.error('Erreur chargement doléances récentes:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await api.get('/statistiques/evolution?periode=month&nb=6');
      if (response.data.success) {
        const data = response.data.data || [];
        const formattedData = data.map(item => ({
          ...item,
          mois: item.periode?.substring(5, 7) || item.month || item.periode,
        }));
        setMonthlyStats(formattedData);
      }
    } catch (error) {
      console.error('Erreur chargement stats mensuelles:', error);
      setMonthlyStats([
        { mois: 'Jan', total: 12, resolues: 8 },
        { mois: 'Fév', total: 15, resolues: 10 },
        { mois: 'Mar', total: 18, resolues: 14 },
        { mois: 'Avr', total: 22, resolues: 18 },
        { mois: 'Mai', total: 25, resolues: 20 },
        { mois: 'Juin', total: 30, resolues: 25 }
      ]);
    }
  };

  const fetchStatsByCategory = async () => {
    try {
      const response = await api.get('/statistiques/categories');
      if (response.data.success) {
        setStatsByCategory(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement stats par catégorie:', error);
      setStatsByCategory([
        { nom_categorie: 'Voirie', count: 45, percentage: 25 },
        { nom_categorie: 'Éclairage', count: 30, percentage: 17 },
        { nom_categorie: 'Salubrité', count: 38, percentage: 21 },
        { nom_categorie: 'Transport', count: 25, percentage: 14 },
        { nom_categorie: 'Sécurité', count: 20, percentage: 11 },
        { nom_categorie: 'Autres', count: 22, percentage: 12 }
      ]);
    }
  };

  const fetchStatsByStatus = async () => {
    try {
      const response = await api.get('/statistiques/statuts');
      if (response.data.success) {
        setStatsByStatus(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement stats par statut:', error);
      setStatsByStatus([
        { nom_statut: 'Nouvelle', count: 15 },
        { nom_statut: 'En attente', count: 20 },
        { nom_statut: 'En traitement', count: 25 },
        { nom_statut: 'Résolue', count: 40 },
        { nom_statut: 'Clôturée', count: 30 }
      ]);
    }
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

  const statsCards = [
    { 
      title: 'Total Doléances', 
      value: stats.total, 
      icon: DocumentTextIcon, 
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'up',
      link: '/backoffice/doleances'
    },
    { 
      title: 'En cours', 
      value: stats.enCours, 
      icon: ClockIcon, 
      color: 'bg-yellow-500',
      change: '+5%',
      changeType: 'up',
      link: '/backoffice/doleances?statut=en_cours'
    },
    { 
      title: 'Résolues', 
      value: stats.resolues, 
      icon: CheckCircleIcon, 
      color: 'bg-green-500',
      change: '+18%',
      changeType: 'up',
      link: '/backoffice/doleances?statut=resolues'
    },
    { 
      title: 'Urgentes', 
      value: stats.urgentes, 
      icon: ExclamationTriangleIcon, 
      color: 'bg-red-500',
      change: '-2%',
      changeType: 'down',
      link: '/backoffice/doleances?priorite=urgente'
    },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">
          Bienvenue, {user?.prenom} {user?.nom} ({user?.role})
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${stat.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} vs mois dernier
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique mensuel */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Évolution mensuelle</h2>
          {monthlyStats.length > 0 ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3B82F6" name="Total doléances" />
                  <Bar dataKey="resolues" fill="#10B981" name="Résolues" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Graphique par statut */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Doléances par statut</h2>
          {statsByStatus.length > 0 ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nom_statut, percentage }) => `${nom_statut}: ${percentage || 0}%`}
                    outerRadius={80}
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
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Graphique par catégorie */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Doléances par catégorie</h2>
        {statsByCategory.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {statsByCategory.map((cat, idx) => (
                <div key={idx} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat.nom_categorie}</span>
                    <span className="font-semibold">{cat.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage || (cat.count / stats.total * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
        )}
      </div>

      {/* Doléances récentes */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold">Doléances récentes</h2>
          <Link 
            to="/backoffice/doleances"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Voir toutes →
          </Link>
        </div>
        
        {recentDoleances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Priorité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentDoleances.map((doleance) => (
                  <tr key={doleance.id_doleance} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {doleance.reference}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 hidden sm:table-cell truncate max-w-xs">
                      {doleance.titre}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {doleance.nom_categorie || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(doleance.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link 
                        to={`/backoffice/doleances/${doleance.id_doleance}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucune doléance récente</p>
          </div>
        )}
      </div>

      {/* Actions rapides - SANS le bouton "Nouvelle doléance" */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link
          to="/backoffice/users"
          className="bg-purple-600 text-white rounded-lg p-4 text-center hover:bg-purple-700 transition-colors"
        >
          <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
          <p className="font-medium">Gérer les utilisateurs</p>
        </Link>
        <Link
          to="/backoffice/statistiques"
          className="bg-green-600 text-white rounded-lg p-4 text-center hover:bg-green-700 transition-colors"
        >
          <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
          <p className="font-medium">Statistiques avancées</p>
        </Link>
        <Link
          to="/backoffice/profile"
          className="bg-gray-600 text-white rounded-lg p-4 text-center hover:bg-gray-700 transition-colors"
        >
          <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
          <p className="font-medium">Mon profil</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;