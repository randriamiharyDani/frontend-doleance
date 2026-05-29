import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    resolues: 0,
    urgentes: 0
  });
  const [recentDoleances, setRecentDoleances] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStats();
    fetchRecentDoleances();
    fetchMonthlyStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const response = await api.get('/statistiques/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };
  
  const fetchRecentDoleances = async () => {
    try {
      const response = await api.get('/doleances?limit=5');
      setRecentDoleances(response.data.doleances || []);
    } catch (error) {
      console.error('Erreur chargement doleances:', error);
    }
  };
  
  const fetchMonthlyStats = async () => {
    try {
      const response = await api.get('/statistiques/monthly');
      setMonthlyStats(response.data || []);
    } catch (error) {
      console.error('Erreur chargement stats mensuelles:', error);
    }
  };
  
  const statsCards = [
    { title: 'Total Doléances', value: stats.total, icon: DocumentTextIcon, color: 'bg-blue-500', change: '+12%' },
    { title: 'En cours', value: stats.enCours, icon: ClockIcon, color: 'bg-yellow-500', change: '+5%' },
    { title: 'Résolues', value: stats.resolues, icon: CheckCircleIcon, color: 'bg-green-500', change: '+18%' },
    { title: 'Urgentes', value: stats.urgentes, icon: ExclamationTriangleIcon, color: 'bg-red-500', change: '-2%' },
  ];
  
  const getRoleColor = (role) => {
    const colors = {
      administrateur: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      directeur: 'bg-green-100 text-green-800',
      maire: 'bg-red-100 text-red-800',
      citoyen: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-gray-600 mt-1">
              Bienvenue, {user?.prenom} {user?.nom}
              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getRoleColor(user?.role)}`}>
                {user?.role}
              </span>
            </p>
          </div>
          <Link to="/doleances/nouvelle" className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle doléance
          </Link>
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change} vs mois dernier</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique mensuel */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Évolution mensuelle</h2>
          {monthlyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
        
        {/* Doléances récentes */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Doléances récentes</h2>
          <div className="space-y-3">
            {recentDoleances.length > 0 ? (
              recentDoleances.map((doleance) => (
                <Link
                  key={doleance.id_doleance}
                  to={`/doleances/${doleance.id_doleance}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">{doleance.reference}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClass(doleance.niveau)}`}>
                          {doleance.nom_priorite}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800">{doleance.titre}</p>
                      <p className="text-sm text-gray-500 mt-1">{doleance.nom_categorie}</p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs text-white whitespace-nowrap ml-2"
                      style={{ backgroundColor: doleance.statut_couleur }}
                    >
                      {doleance.nom_statut}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune doléance récente</p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Link to="/doleances" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Voir toutes les doléances →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Actions rapides pour admin */}
      {user?.role === 'administrateur' && (
        <div className="mt-6 card">
          <h2 className="text-lg font-semibold mb-4">Administration rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/users" className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Gérer les utilisateurs</p>
                <p className="text-sm text-gray-500">Ajouter ou modifier des comptes</p>
              </div>
            </Link>
            <Link to="/statistiques" className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium">Statistiques détaillées</p>
                <p className="text-sm text-gray-500">Analyser les performances</p>
              </div>
            </Link>
            <Link to="/doleances" className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium">Toutes les doléances</p>
                <p className="text-sm text-gray-500">Voir et traiter les demandes</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction utilitaire pour la classe de priorité
const getPriorityClass = (niveau) => {
  switch(niveau) {
    case 4: return 'bg-red-100 text-red-800';
    case 3: return 'bg-orange-100 text-orange-800';
    case 2: return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

export default Dashboard;