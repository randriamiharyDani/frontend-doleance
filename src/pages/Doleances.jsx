import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

function Doleances() {
  const { user } = useAuth();
  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    statut: '',
    categorie: '',
    priorite: ''
  });
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [priorites, setPriorites] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  
  useEffect(() => {
    fetchDoleances();
    fetchFilters();
  }, [filters, search, pagination.page]);
  
  const fetchDoleances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.categorie) params.append('categorie', filters.categorie);
      if (filters.priorite) params.append('priorite', filters.priorite);
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      const response = await api.get(`/doleances?${params.toString()}`);
      setDoleances(response.data.doleances || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (error) {
      console.error('Erreur:', error);
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
      setCategories(categoriesRes.data || []);
      setStatuts(statutsRes.data || []);
      setPriorites(prioritesRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const resetFilters = () => {
    setFilters({ statut: '', categorie: '', priorite: '' });
    setSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const getPriorityBadge = (niveau, nom) => {
    const colors = {
      4: 'bg-red-100 text-red-800',
      3: 'bg-orange-100 text-orange-800',
      2: 'bg-yellow-100 text-yellow-800',
      1: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${colors[niveau] || colors[1]}`}>
        {nom}
      </span>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doléances</h1>
          <p className="text-gray-600 mt-1">Gérez toutes les doléances citoyennes</p>
        </div>
        <Link to="/doleances/nouvelle" className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle doléance
        </Link>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, titre ou description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtres
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Réinitialiser
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <select
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              className="input"
            >
              <option value="">Tous les statuts</option>
              {statuts.map(statut => (
                <option key={statut.id_statut} value={statut.id_statut}>
                  {statut.nom_statut}
                </option>
              ))}
            </select>
            
            <select
              value={filters.categorie}
              onChange={(e) => handleFilterChange('categorie', e.target.value)}
              className="input"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id_categorie} value={cat.id_categorie}>
                  {cat.nom_categorie}
                </option>
              ))}
            </select>
            
            <select
              value={filters.priorite}
              onChange={(e) => handleFilterChange('priorite', e.target.value)}
              className="input"
            >
              <option value="">Toutes les priorités</option>
              {priorites.map(prio => (
                <option key={prio.id_priorite} value={prio.id_priorite}>
                  {prio.nom_priorite}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Liste des doléances */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : doleances.length === 0 ? (
        <div className="card text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune doléance trouvée</h3>
          <p className="text-gray-500 mb-4">Aucune doléance ne correspond à vos critères</p>
          <Link to="/doleances/nouvelle" className="btn-primary inline-flex">
            <PlusIcon className="h-5 w-5 mr-2" />
            Créer une doléance
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {doleances.map((doleance) => (
              <Link
                key={doleance.id_doleance}
                to={`/doleances/${doleance.id_doleance}`}
                className="block card hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-sm font-mono text-gray-500">{doleance.reference}</span>
                      {getPriorityBadge(doleance.niveau, doleance.nom_priorite)}
                      <span className="text-xs text-gray-400">
                        {new Date(doleance.date_creation).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{doleance.titre}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{doleance.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📁 {doleance.nom_categorie}</span>
                      <span>🏢 {doleance.nom_direction}</span>
                      {doleance.nom_quartier && <span>📍 {doleance.nom_quartier}</span>}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: doleance.statut_couleur }}
                    >
                      {doleance.nom_statut}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Précédent
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Doleances;