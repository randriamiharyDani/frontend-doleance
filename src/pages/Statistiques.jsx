import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function Statistiques() {
  const [statsByCategory, setStatsByCategory] = useState([]);
  const [statsByDirection, setStatsByDirection] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const [categoryRes, directionRes] = await Promise.all([
        api.get('/statistiques/categories'),
        api.get('/statistiques/directions')
      ]);
      setStatsByCategory(categoryRes.data || []);
      setStatsByDirection(directionRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Statistiques</h1>
        <p className="text-gray-600 mt-1">Analyse des doléances par catégorie et direction</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique par catégorie */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Doléances par catégorie</h2>
          {statsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom_categorie" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Nombre de doléances" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
        
        {/* Graphique par direction */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Doléances par direction</h2>
          {statsByDirection.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={statsByDirection}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nom_direction, percent }) => `${nom_direction}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statsByDirection.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Statistiques;