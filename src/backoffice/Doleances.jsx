import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

function Doleances() {
  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedPriorite, setSelectedPriorite] = useState('');
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [priorites, setPriorites] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doleanceToDelete, setDoleanceToDelete] = useState(null);
  const [showPrioriteModal, setShowPrioriteModal] = useState(false);
  const [doleanceToUpdate, setDoleanceToUpdate] = useState(null);
  const [selectedPrioriteValue, setSelectedPrioriteValue] = useState('');

  useEffect(() => {
    fetchDoleances();
    fetchFilters();
  }, [pagination.page, selectedCategorie, selectedStatut, selectedPriorite]);

  const fetchDoleances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      if (selectedCategorie) params.append('categorie', selectedCategorie);
      if (selectedStatut) params.append('statut', selectedStatut);
      if (selectedPriorite) params.append('priorite', selectedPriorite);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/doleances?${params.toString()}`);
      if (response.data.success) {
        setDoleances(response.data.data.doleances || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0,
          pages: response.data.data.pagination?.pages || 0
        }));
      }
    } catch (error) {
      console.error('Erreur chargement doléances:', error);
      toast.error('Erreur lors du chargement des doléances');
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
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setStatuts(statutsRes.data?.data || statutsRes.data || []);
      setPriorites(prioritesRes.data?.data || prioritesRes.data || []);
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDoleances();
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategorie('');
    setSelectedStatut('');
    setSelectedPriorite('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Confirmation de suppression
  const confirmDelete = (doleance) => {
    setDoleanceToDelete(doleance);
    setShowDeleteConfirm(true);
  };

  // Supprimer une doléance
  const handleDelete = async () => {
    if (!doleanceToDelete) return;
    
    try {
      const response = await api.delete(`/doleances/${doleanceToDelete.id_doleance}`);
      if (response.data.success) {
        toast.success(`Doléance "${doleanceToDelete.reference}" supprimée avec succès`);
        fetchDoleances();
      } else {
        toast.error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setShowDeleteConfirm(false);
      setDoleanceToDelete(null);
    }
  };

  // Ouvrir modal de changement de priorité
  const openPrioriteModal = (doleance) => {
    setDoleanceToUpdate(doleance);
    setSelectedPrioriteValue(doleance.id_priorite.toString());
    setShowPrioriteModal(true);
  };

  // Changer la priorité d'une doléance
  const handleUpdatePriorite = async () => {
    if (!doleanceToUpdate || !selectedPrioriteValue) return;
    
    try {
      // Appel API pour mettre à jour la priorité
      const response = await api.put(`/doleances/${doleanceToUpdate.id_doleance}/priorite`, {
        id_priorite: parseInt(selectedPrioriteValue)
      });
      
      if (response.data.success) {
        const newPriorite = priorites.find(p => p.id_priorite === parseInt(selectedPrioriteValue));
        toast.success(`Priorité de la doléance ${doleanceToUpdate.reference} modifiée en ${newPriorite?.nom_priorite || 'Nouvelle priorité'}`);
        fetchDoleances();
        setShowPrioriteModal(false);
        setDoleanceToUpdate(null);
      } else {
        toast.error(response.data.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
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

  const getStatusIcon = (statut) => {
    if (statut === 'Résolue' || statut === 'Clôturée') {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    } else if (statut === 'En attente' || statut === 'Nouvelle') {
      return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    } else {
      return <ExclamationTriangleIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des doléances</h1>
          <p className="text-gray-600 mt-1">Consultez, gérez et supprimez les doléances des citoyens</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, titre, description ou citoyen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              Filtres
              {(selectedCategorie || selectedStatut || selectedPriorite) && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {[selectedCategorie, selectedStatut, selectedPriorite].filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={selectedCategorie}
                onChange={(e) => setSelectedCategorie(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom_categorie}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                {statuts.map(statut => (
                  <option key={statut.id_statut} value={statut.id_statut}>{statut.nom_statut}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={selectedPriorite}
                onChange={(e) => setSelectedPriorite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les priorités</option>
                {priorites.map(prio => (
                  <option key={prio.id_priorite} value={prio.id_priorite}>{prio.nom_priorite}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <DocumentTextIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
          <p className="text-sm text-gray-500">Total doléances</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-600">
            {doleances.filter(d => d.nom_statut !== 'Résolue' && d.nom_statut !== 'Clôturée').length}
          </p>
          <p className="text-sm text-gray-500">En cours</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">
            {doleances.filter(d => d.nom_statut === 'Résolue' || d.nom_statut === 'Clôturée').length}
          </p>
          <p className="text-sm text-gray-500">Résolues</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">
            {doleances.filter(d => d.nom_priorite === 'Urgente' || d.niveau === 4).length}
          </p>
          <p className="text-sm text-gray-500">Urgentes</p>
        </div>
      </div>

      {/* Liste des doléances */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : doleances.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune doléance trouvée</h3>
          <p className="text-gray-500">Aucune doléance ne correspond à vos critères</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doleances.map((doleance) => (
            <div key={doleance.id_doleance} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    {/* En-tête avec références et badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {doleance.reference}
                      </span>
                      {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                      {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}
                    </div>
                    
                    {/* Titre */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {doleance.titre}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {doleance.description}
                    </p>
                    
                    {/* Informations supplémentaires */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        👤 {doleance.citoyen_nom || 'Anonyme'}
                      </span>
                      <span className="flex items-center gap-1">
                        📁 {doleance.nom_categorie || 'Non catégorisé'}
                      </span>
                      <span className="flex items-center gap-1">
                        🕐 {formatDateTime(doleance.date_creation)}
                      </span>
                      {doleance.nom_direction && (
                        <span className="flex items-center gap-1">
                          🏢 {doleance.nom_direction}
                        </span>
                      )}
                      {doleance.assignee_nom && (
                        <span className="flex items-center gap-1">
                          👨‍💼 Assigné à: {doleance.assignee_nom}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPrioriteModal(doleance)}
                      className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Changer la priorité"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(doleance)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <Link
                      to={`/backoffice/doleances/${doleance.id_doleance}`}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      title="Voir détails"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Précédent
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
          >
            Suivant
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && doleanceToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmation de suppression</h3>
              <p className="text-sm text-gray-500 mb-4">
                Êtes-vous sûr de vouloir supprimer la doléance <span className="font-semibold">{doleanceToDelete.reference}</span> ?
              </p>
              <p className="text-xs text-red-500 mb-4">
                Cette action est irréversible. Toutes les données associées seront supprimées.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de changement de priorité */}
      {showPrioriteModal && doleanceToUpdate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <PencilIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Changer la priorité</h3>
              <p className="text-sm text-gray-500 mb-4">
                Doléance: <span className="font-semibold">{doleanceToUpdate.reference}</span>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouvelle priorité</label>
                <select
                  value={selectedPrioriteValue}
                  onChange={(e) => setSelectedPrioriteValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorites.map(prio => (
                    <option key={prio.id_priorite} value={prio.id_priorite}>
                      {prio.nom_priorite} - Niveau {prio.niveau}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowPrioriteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdatePriorite}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doleances;