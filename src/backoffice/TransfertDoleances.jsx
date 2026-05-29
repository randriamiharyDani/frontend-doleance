import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  UserGroupIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

function TransfertDoleances() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedPriorite, setSelectedPriorite] = useState('');
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [priorites, setPriorites] = useState([]);
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedDoleance, setSelectedDoleance] = useState(null);
  const [selectedDestinationType, setSelectedDestinationType] = useState('direction'); // 'direction' ou 'service'
  const [selectedDirection, setSelectedDirection] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [transferMotif, setTransferMotif] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);

  useEffect(() => {
    fetchDoleances();
    fetchFilters();
    fetchDirections();
    fetchServices();
  }, [pagination.page, selectedCategorie, selectedStatut, selectedPriorite]);

  // Filtrer les services quand une direction est sélectionnée
  useEffect(() => {
    if (selectedDirection) {
      const servicesFiltered = services.filter(s => s.id_direction === parseInt(selectedDirection));
      setFilteredServices(servicesFiltered);
    } else {
      setFilteredServices([]);
    }
  }, [selectedDirection, services]);

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

  const fetchDirections = async () => {
    try {
      const response = await api.get('/directions');
      if (response.data.success) {
        setDirections(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement directions:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      if (response.data.success) {
        setServices(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement services:', error);
    }
  };

  const handleTransfer = async () => {
    // Validation selon le type de destination
    if (selectedDestinationType === 'direction' && !selectedDirection) {
      toast.error('Veuillez sélectionner une direction');
      return;
    }
    if (selectedDestinationType === 'service' && !selectedService) {
      toast.error('Veuillez sélectionner un service');
      return;
    }

    setTransferLoading(true);
    try {
      const transferData = {
        motif: transferMotif || 'Transfert par agent central',
        destination_type: selectedDestinationType
      };

      if (selectedDestinationType === 'direction') {
        transferData.id_direction = parseInt(selectedDirection);
      } else {
        transferData.id_service = parseInt(selectedService);
      }

      const response = await api.post(`/doleances/${selectedDoleance.id_doleance}/transferer`, transferData);
      
      if (response.data.success) {
        toast.success(`Doléance ${selectedDoleance.reference} transférée avec succès vers ${getDestinationName()}`);
        setShowTransferModal(false);
        resetTransferModal();
        fetchDoleances();
      } else {
        toast.error(response.data.message || 'Erreur lors du transfert');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du transfert');
    } finally {
      setTransferLoading(false);
    }
  };

  const getDestinationName = () => {
    if (selectedDestinationType === 'direction') {
      const dir = directions.find(d => d.id_direction === parseInt(selectedDirection));
      return dir ? `Direction: ${dir.nom_direction}` : 'la direction';
    } else {
      const serv = services.find(s => s.id_service === parseInt(selectedService));
      return serv ? `Service: ${serv.nom_service}` : 'le service';
    }
  };

  const resetTransferModal = () => {
    setSelectedDoleance(null);
    setSelectedDestinationType('direction');
    setSelectedDirection('');
    setSelectedService('');
    setTransferMotif('');
  };

  const openTransferModal = (doleance) => {
    setSelectedDoleance(doleance);
    setShowTransferModal(true);
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

  // Grouper les directions par catégorie
  const groupedDirections = directions.reduce((acc, dir) => {
    const categorie = dir.categorie || 'Autres';
    if (!acc[categorie]) acc[categorie] = [];
    acc[categorie].push(dir);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transfert des doléances</h1>
          <p className="text-gray-600 mt-1">Transférer les doléances vers les directions ou services concernés</p>
        </div>
      </div>

      {/* Barre de recherche et filtres - identique à votre code */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, titre, description..."
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

      {/* Statistiques */}
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
          <p className="text-sm text-gray-500">À transférer</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <BuildingOfficeIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{directions.length}</p>
          <p className="text-sm text-gray-500">Directions</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <FolderIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{services.length}</p>
          <p className="text-sm text-gray-500">Services</p>
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
            <div key={doleance.id_doleance} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {doleance.reference}
                      </span>
                      {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                      {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {doleance.titre}
                    </h3>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {doleance.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        📁 {doleance.nom_categorie || 'Non catégorisé'}
                      </span>
                      <span className="flex items-center gap-1">
                        📅 {formatDateTime(doleance.date_creation)}
                      </span>
                      {doleance.nom_direction && (
                        <span className="flex items-center gap-1 text-green-600">
                          🏢 Direction: {doleance.nom_direction}
                        </span>
                      )}
                      {doleance.nom_service && (
                        <span className="flex items-center gap-1 text-blue-600">
                          📂 Service: {doleance.nom_service}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openTransferModal(doleance)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={doleance.nom_statut === 'Clôturée' || doleance.nom_statut === 'Résolue'}
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Transférer
                    </button>
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

      {/* Modal de transfert améliorée */}
      {showTransferModal && selectedDoleance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Transférer la doléance</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Informations de la doléance */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Référence</p>
                  <p className="font-mono font-semibold text-sm">{selectedDoleance.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Catégorie</p>
                  <p className="font-medium text-sm">{selectedDoleance.nom_categorie || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Titre</p>
                  <p className="font-medium text-sm">{selectedDoleance.titre}</p>
                </div>
              </div>
            </div>

            {/* Type de destination */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de destination *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="direction"
                    checked={selectedDestinationType === 'direction'}
                    onChange={() => {
                      setSelectedDestinationType('direction');
                      setSelectedDirection('');
                      setSelectedService('');
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Direction</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="service"
                    checked={selectedDestinationType === 'service'}
                    onChange={() => {
                      setSelectedDestinationType('service');
                      setSelectedDirection('');
                      setSelectedService('');
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Service</span>
                </label>
              </div>
            </div>

            {/* Sélection de la direction */}
            {selectedDestinationType === 'direction' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direction de destination *
                </label>
                <select
                  value={selectedDirection}
                  onChange={(e) => setSelectedDirection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner une direction</option>
                  {Object.entries(groupedDirections).map(([categorie, dirs]) => (
                    <optgroup key={categorie} label={categorie}>
                      {dirs.map(dir => (
                        <option key={dir.id_direction} value={dir.id_direction}>
                                          {dir.nom_direction}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                  <MapPinIcon className="h-3 w-3 inline mr-1" />
                                  {directions.filter(d => d.id_direction === parseInt(selectedDirection))[0]?.description || 'Choisissez la direction responsable'}
                                </p>
                              </div>
                            )}
            
                            {/* Sélection du service (après la direction) */}
                            {selectedDestinationType === 'service' && (
                              <>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Direction *
                                  </label>
                                  <select
                                    value={selectedDirection}
                                    onChange={(e) => setSelectedDirection(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service de destination *
                                  </label>
                                  <select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={!selectedDirection}
                                    required
                                  >
                                    <option value="">
                                      {selectedDirection ? 'Sélectionner un service' : 'Sélectionnez d\'abord une direction'}
                                    </option>
                                    {filteredServices.map(serv => (
                                      <option key={serv.id_service} value={serv.id_service}>
                                        {serv.nom_service}
                                      </option>
                                    ))}
                                  </select>
                                  {!selectedDirection && (
                                    <p className="text-xs text-amber-600 mt-1">
                                      Veuillez d'abord sélectionner une direction
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
            
            {/* Motif du transfert */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du transfert
              </label>
              <textarea
                value={transferMotif}
                onChange={(e) => setTransferMotif(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Précisez la raison du transfert (optionnel)..."
              />
            </div>

            {/* Aperçu de la destination */}
            {(selectedDirection || selectedService) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Aperçu de la destination</p>
                <p className="text-sm font-medium text-blue-800">
                  {selectedDestinationType === 'direction' 
                    ? directions.find(d => d.id_direction === parseInt(selectedDirection))?.nom_direction 
                    : services.find(s => s.id_service === parseInt(selectedService))?.nom_service}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedDestinationType === 'direction' 
                    ? 'La doléance sera transférée à cette direction'
                    : 'La doléance sera transférée à ce service'}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferLoading || (selectedDestinationType === 'direction' && !selectedDirection) || (selectedDestinationType === 'service' && !selectedService)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {transferLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Transfert...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4" />
                    Confirmer le transfert
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransfertDoleances;