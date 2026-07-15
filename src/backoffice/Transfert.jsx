// backoffice/Transfert.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

function Transfert() {
  const { user } = useAuth();
  
  const [doleances, setDoleances] = useState([]);
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoleance, setSelectedDoleance] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [filters, setFilters] = useState({ categorie: '', search: '', statut: 'all' });
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [transferData, setTransferData] = useState({
    id_direction: '',
    commentaire: ''
  });
  const [statsTotals, setStatsTotals] = useState({
    total: 0,
    enAttente: 0,
    enCours: 0,
    transferees: 0,
    resolues: 0
  });

  const isAuthorized = user?.role === 'agent_central' || 
                       user?.nom_role === 'agent_central' ||
                       user?.role === 'administrateur_systeme' ||
                       user?.nom_role === 'administrateur_systeme';

  useEffect(() => {
    if (isAuthorized) {
      fetchDirections();
      fetchCategories();
      fetchStatuts();
      fetchStats();
      fetchDoleances();
    }
  }, [filters, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Cette page est réservée à l'agent central et à l'administrateur système.
          </p>
          <button
            onClick={() => window.location.href = '/backoffice/dashboard'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/doleances/stats/overview');
      if (response.data.success) {
        setStatsTotals({
          total: response.data.data.total || 0,
          enAttente: response.data.data.en_attente || 0,
          enCours: response.data.data.en_cours || 0,
          transferees: response.data.data.transferees || 0,
          resolues: response.data.data.resolues || 0
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      calculateStatsFromData();
    }
  };

  const calculateStatsFromData = () => {
    const total = doleances.length;
    const enAttente = doleances.filter(d => d.nom_statut === 'en_attente').length;
    const enCours = doleances.filter(d => d.nom_statut === 'en_cours').length;
    const resolues = doleances.filter(d => d.nom_statut === 'traitee' || d.nom_statut === 'resolue' || d.nom_statut === 'cloturee').length;
    const transferees = doleances.filter(d => d.nom_statut === 'transferee').length;
    setStatsTotals({ total, enAttente, enCours, resolues, transferees });
  };

  const fetchDoleances = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 1000,
        ...filters
      };
      if (!params.categorie) delete params.categorie;
      if (!params.search) delete params.search;
      if (!params.statut || params.statut === 'all') delete params.statut;
      
      const response = await api.get('/doleances', { params });
      
      if (response.data.success) {
        let doleancesData = [];
        
        if (response.data.data && response.data.data.doleances) {
          doleancesData = response.data.data.doleances;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          doleancesData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          doleancesData = response.data.data;
        } else {
          doleancesData = response.data.data || [];
        }
        
        setDoleances(doleancesData);
      }
    } catch (error) {
      console.error('Erreur fetchDoleances:', error);
      toast.error('Erreur lors du chargement des doléances');
      setDoleances([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDirections = async () => {
    try {
      const response = await api.get('/directions');
      if (response.data.success) {
        setDirections(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement directions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/doleances/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const fetchStatuts = async () => {
    try {
      const response = await api.get('/doleances/statuts');
      if (response.data.success) {
        setStatuts(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement statuts:', error);
    }
  };

  const handleTransfert = async (e) => {
    e.preventDefault();
    if (!selectedDoleance) return;
    
    if (!transferData.id_direction) {
      toast.error('Veuillez sélectionner une direction de destination');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(`/doleances/${selectedDoleance.id_doleance}/transfert-central`, {
        id_direction: transferData.id_direction,
        commentaire: transferData.commentaire
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowTransferModal(false);
        setSelectedDoleance(null);
        setTransferData({ id_direction: '', commentaire: '' });
        fetchStats();
        fetchDoleances();
      } else {
        toast.error(response.data.message || 'Erreur lors du transfert');
      }
    } catch (error) {
      console.error('Erreur transfert:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du transfert');
    } finally {
      setLoading(false);
    }
  };

  const openTransferModal = (doleance) => {
    setSelectedDoleance(doleance);
    setTransferData({ id_direction: '', commentaire: '' });
    setShowTransferModal(true);
  };

  const getStatusBadge = (statut) => {
    const badges = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      en_cours: 'bg-blue-100 text-blue-800',
      transferee: 'bg-purple-100 text-purple-800',
      traitee: 'bg-green-100 text-green-800',
      resolue: 'bg-green-100 text-green-800',
      cloturee: 'bg-gray-100 text-gray-800',
      rejetee: 'bg-red-100 text-red-800'
    };
    return badges[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (statut) => {
    const texts = {
      en_attente: 'En attente',
      en_cours: 'En cours',
      transferee: 'Transférée',
      traitee: 'Traitée',
      resolue: 'Résolue',
      cloturee: 'Clôturée',
      rejetee: 'Rejetée'
    };
    return texts[statut] || statut;
  };

  const getCategoryName = (idCategorie) => {
    const cat = categories.find(c => c.id_categorie === idCategorie);
    return cat?.nom_categorie || 'Non catégorisée';
  };

  // Vérifier si une doléance peut être transférée
  const canTransfer = (statut) => {
    return statut !== 'transferee' && statut !== 'traitee' && statut !== 'resolue' && statut !== 'cloturee';
  };

  const refreshData = () => {
    fetchStats();
    fetchDoleances();
    fetchDirections();
    fetchCategories();
    fetchStatuts();
    toast.success('Données rafraîchies');
  };

  if (loading && doleances.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filtrer les doléances transférées pour les afficher différemment
  const doleancesNonTransferees = doleances.filter(d => canTransfer(d.nom_statut));
  const doleancesTransferees = doleances.filter(d => !canTransfer(d.nom_statut));

  return (
    <div className="p-4">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div>
          <h1 className=" text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Transfert de doléances</h1>
          <p className="text-gray-500 ">Gérer le transfert vers les directions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Rafraîchir
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FunnelIcon className="h-4 w-4 mr-1.5" />
            {showFilters ? 'Masquer' : 'Filtres'}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-5 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow p-3 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{statsTotals.total}</p>
          <p className=" text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 text-center border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{statsTotals.enAttente}</p>
          <p className=" text-gray-500">En attente</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{statsTotals.enCours}</p>
          <p className=" text-gray-500">En cours</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-purple-600">{statsTotals.transferees}</p>
          <p className=" text-gray-500">Transférées</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{statsTotals.resolues}</p>
          <p className=" text-gray-500">Résolues</p>
        </div>
      </div>

      {/* Filtres compacts */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-3 mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block  font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={filters.categorie}
                onChange={(e) => setFilters(prev => ({ ...prev, categorie: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Toutes catégories</option>
                {categories.map(cat => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>
                    {cat.nom_categorie}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block  font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Tous statuts</option>
                {statuts.map(stat => (
                  <option key={stat.id_statut} value={stat.nom_statut}>
                    {getStatusText(stat.nom_statut)}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="block  font-medium text-gray-700 mb-1">Rechercher</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Référence, titre..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ categorie: '', search: '', statut: 'all' })}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau compact - tout visible sans scroll */}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left  font-medium text-gray-500 uppercase">Réf.</th>
                <th className="px-3 py-2 text-left  font-medium text-gray-500 uppercase hidden sm:table-cell">Citoyen</th>
                <th className="px-3 py-2 text-left  font-medium text-gray-500 uppercase hidden md:table-cell">Catégorie</th>
                <th className="px-3 py-2 text-left  font-medium text-gray-500 uppercase">Titre</th>
                <th className="px-3 py-2 text-center  font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-3 py-2 text-left  font-medium text-gray-500 uppercase hidden lg:table-cell">Direction</th>
                <th className="px-3 py-2 text-center  font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

              {/* Doléances non transférées (prioritaires) */}
              
              {doleancesNonTransferees.map((doleance) => (
                <tr key={doleance.id_doleance} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap font-mono font-medium text-blue-600 text-xs sm:text-sm">
                    {doleance.reference}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs sm:text-sm hidden sm:table-cell">
                    {doleance.citoyen_nom || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs sm:text-sm hidden md:table-cell">
                    {getCategoryName(doleance.id_categorie)}
                  </td>
                  <td className="px-3 py-2 text-gray-700 max-w-[80px] sm:max-w-[120px] truncate text-xs sm:text-sm">
                    {doleance.titre}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] rounded-full ${getStatusBadge(doleance.nom_statut)}`}>
                      {getStatusText(doleance.nom_statut)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs sm:text-sm hidden lg:table-cell">
                    {doleance.nom_direction || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <button
                      onClick={() => openTransferModal(doleance)}
                      className="inline-flex items-center px-2 sm:px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[9px] sm:text-[10px]"
                    >
                      <PaperAirplaneIcon className="h-3 w-3 mr-0.5 sm:mr-1" />
                      <span className="hidden xs:inline">Transférer</span>
                      <span className="xs:hidden">
                        <PaperAirplaneIcon className="h-3 w-3" />
                      </span>
                    </button>
                  </td>
                </tr>
              ))}

              {/* Doléances déjà transférées ou traitées */}

              {doleancesTransferees.length > 0 && (
                <>
                  <tr className="bg-gray-50">
                    <td colSpan="7" className="px-3 py-1.5 text-center text-[10px] text-gray-400 font-medium">
                      ─── Doléances déjà transférées ou traitées ───
                    </td>
                  </tr>
                  {doleancesTransferees.map((doleance) => (
                    <tr key={doleance.id_doleance} className="hover:bg-gray-50/50 bg-gray-50/30">
                      <td className="px-3 py-1.5 whitespace-nowrap text-[9px] sm:text-[10px] font-mono font-medium text-purple-400">
                        {doleance.reference}
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-[9px] sm:text-[10px] text-gray-400 hidden sm:table-cell">
                        {doleance.citoyen_nom || '-'}
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-[9px] sm:text-[10px] text-gray-400 hidden md:table-cell">
                        {getCategoryName(doleance.id_categorie)}
                      </td>
                      <td className="px-3 py-1.5 text-[9px] sm:text-[10px] text-gray-400 max-w-[60px] sm:max-w-[100px] truncate">
                        {doleance.titre}
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-center">
                        <span className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] rounded-full ${getStatusBadge(doleance.nom_statut)}`}>
                          {getStatusText(doleance.nom_statut)}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-[9px] sm:text-[10px] text-gray-400 hidden lg:table-cell">
                        {doleance.nom_direction || '-'}
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[8px] sm:text-[9px]">
                          <CheckCircleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />
                          {doleance.nom_statut === 'transferee' ? 'Transférée' : 'Traitée'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {doleances.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <p className="text-gray-500 text-sm">Aucune doléance trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination supprimée - tout est visible */}

      {/* Modal de transfert */}
      {showTransferModal && selectedDoleance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transférer la doléance</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
              <p><span className="font-medium">Réf:</span> {selectedDoleance.reference}</p>
              <p className="mt-1"><span className="font-medium">Titre:</span> {selectedDoleance.titre}</p>
            </div>

            <form onSubmit={handleTransfert}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction destinataire *
                </label>
                <select
                  value={transferData.id_direction}
                  onChange={(e) => setTransferData({...transferData, id_direction: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Sélectionner une direction</option>
                  {directions.map(dir => (
                    <option key={dir.id_direction} value={dir.id_direction}>
                      {dir.nom_direction}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif du transfert
                </label>
                <textarea
                  value={transferData.commentaire}
                  onChange={(e) => setTransferData({...transferData, commentaire: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Précisez la raison du transfert..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Transfert...' : 'Confirmer le transfert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transfert;