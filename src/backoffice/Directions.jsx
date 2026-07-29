// backoffice/Directions.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  FolderIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

function Directions() {
  // ========== 1. HOOKS ==========
  const { user } = useAuth();
  
  // ========== 2. ÉTATS ==========
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingDirection, setEditingDirection] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [expandedDirections, setExpandedDirections] = useState({});
  const [activeTab, setActiveTab] = useState('directions');
  
  const [formData, setFormData] = useState({
    nom_direction: '',
    description: '',
    categorie: '',
    email: '',
    telephone: '',
    responsable: ''
  });
  
  const [serviceFormData, setServiceFormData] = useState({
    id_direction: '',
    nom_service: '',
    description: '',
    email: '',
    telephone: '',
    responsable: ''
  });

  const categories = [
    'Sécurité', 'Administration', 'RH', 'Juridique', 'Finance', 'Marchés',
    'Urbanisme', 'Infrastructures', 'Transport', 'Environnement', 'Social',
    'Culture', 'Sports', 'Informatique', 'Arrondissement'
  ];

  // ========== 3. FONCTIONS API ==========
  const fetchDirections = async () => {
    try {
      const response = await api.get('/directions');
      if (response.data.success) setDirections(response.data.data);
    } catch (error) {
      console.error('Erreur fetchDirections:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      if (response.data.success) setServices(response.data.data);
    } catch (error) {
      console.error('Erreur fetchServices:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) setUsers(response.data.data);
    } catch (error) {
      console.error('Erreur fetchUsers:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDirections(),
        fetchServices(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // ========== 4. useEffect ==========
  useEffect(() => {
    fetchAllData();
  }, []);

  // ========== 5. FONCTIONS UTILITAIRES ==========
  const getServicesByDirection = (directionId) => {
    return services.filter(s => s.id_direction === directionId);
  };

  const getUsersByDirection = (directionId) => {
    return users.filter(u => u.id_direction === directionId);
  };

  const toggleDirection = (id) => {
    setExpandedDirections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmitDirection = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDirection) {
        await api.put(`/directions/${editingDirection.id_direction}`, formData);
        toast.success('Direction modifiée avec succès');
      } else {
        await api.post('/directions', formData);
        toast.success('Direction créée avec succès');
      }
      await fetchDirections();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id_service}`, serviceFormData);
        toast.success('Service modifié avec succès');
      } else {
        await api.post('/services', serviceFormData);
        toast.success('Service créé avec succès');
      }
      await fetchServices();
      closeServiceModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDirection = (direction) => {
    setEditingDirection(direction);
    setFormData({
      nom_direction: direction.nom_direction,
      description: direction.description || '',
      categorie: direction.categorie || '',
      email: direction.email || '',
      telephone: direction.telephone || '',
      responsable: direction.responsable || ''
    });
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceFormData({
      id_direction: service.id_direction,
      nom_service: service.nom_service,
      description: service.description || '',
      email: service.email || '',
      telephone: service.telephone || '',
      responsable: service.responsable || ''
    });
    setShowServiceModal(true);
  };

  const handleDeleteDirection = async (id, nom) => {
    if (window.confirm(`Supprimer la direction "${nom}" ?`)) {
      try {
        await api.delete(`/directions/${id}`);
        toast.success('Direction supprimée avec succès');
        await fetchDirections();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteService = async (id, nom) => {
    if (window.confirm(`Supprimer le service "${nom}" ?`)) {
      try {
        await api.delete(`/services/${id}`);
        toast.success('Service supprimé avec succès');
        await fetchServices();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const openServiceModal = (direction) => {
    setSelectedDirection(direction);
    setServiceFormData({
      id_direction: direction.id_direction,
      nom_service: '',
      description: '',
      email: '',
      telephone: '',
      responsable: ''
    });
    setEditingService(null);
    setShowServiceModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDirection(null);
    setFormData({
      nom_direction: '',
      description: '',
      categorie: '',
      email: '',
      telephone: '',
      responsable: ''
    });
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
    setSelectedDirection(null);
    setServiceFormData({
      id_direction: '',
      nom_service: '',
      description: '',
      email: '',
      telephone: '',
      responsable: ''
    });
  };

  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (role) => {
    const roles = {
      'administrateur_systeme': 'Administrateur Système',
      'agent_central': 'Agent Central',
      'directeur': 'Directeur',
      'chef_service': 'Chef de Service',
      'agent': 'Agent',
      'agent_terrain': 'Agent Terrain'
    };
    return roles[role] || role;
  };

  const groupedDirections = directions.reduce((acc, dir) => {
    const cat = dir.categorie || 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(dir);
    return acc;
  }, {});

  // ========== 6. PERMISSIONS ==========
  const isSuperAdmin = user?.role === 'administrateur_systeme' || 
                       user?.nom_role === 'administrateur_systeme';

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 text-center ring-1 ring-gray-100 dark:ring-slate-700">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accès non autorisé</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Cette page est réservée à l'administrateur système.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <button
            onClick={() => window.location.href = '/backoffice/dashboard'}
            className="btn-primary btn-lg"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // ========== 7. CHARGEMENT ==========
  if (loading && directions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ========== 8. RENDU ==========
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des directions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les directions, services et agents</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <ShieldCheckIcon className="h-3 w-3" />
            Accès réservé
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary btn-md"
        >
          <PlusIcon className="h-4 w-4" />
          Nouvelle direction
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('directions')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'directions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BuildingOfficeIcon className="h-4 w-4 inline mr-1.5 -mt-0.5" />
            Directions ({directions.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FolderIcon className="h-4 w-4 inline mr-1.5 -mt-0.5" />
            Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'agents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 inline mr-1.5 -mt-0.5" />
            Agents par direction
          </button>
        </nav>
      </div>

      {/* Onglet Directions */}
      {activeTab === 'directions' && (
        <div>
          {Object.entries(groupedDirections).length === 0 ? (
            <div className="card p-12 text-center">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune direction</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Commencez par créer une direction</p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary btn-md"
              >
                Créer une direction
              </button>
            </div>
          ) : (
            Object.entries(groupedDirections).map(([categorie, dirs]) => (
              <div key={categorie} className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-2">
                  {categorie} ({dirs.length})
                </h2>
                <div className="space-y-3">
                  {dirs.map((direction) => {
                    const directionServices = getServicesByDirection(direction.id_direction);
                    const directionUsers = getUsersByDirection(direction.id_direction);
                    const isExpanded = expandedDirections[direction.id_direction];
                    
                    return (
                      <div key={direction.id_direction} className="card overflow-hidden">
                        <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <button
                                  onClick={() => toggleDirection(direction.id_direction)}
                                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                                >
                                  {isExpanded ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                                </button>
                                <BuildingOfficeIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{direction.nom_direction}</h3>
                                <span className="badge bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 flex-shrink-0">
                                  {direction.categorie || 'Non catégorisé'}
                                </span>
                              </div>
                              
                              {direction.description && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm ml-8 mb-3">{direction.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-4 ml-8 text-sm">
                                {direction.email && (
                                  <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                    <EnvelopeIcon className="h-4 w-4" /> {direction.email}
                                  </span>
                                )}
                                {direction.telephone && (
                                  <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                    <PhoneIcon className="h-4 w-4" /> {direction.telephone}
                                  </span>
                                )}
                                {direction.responsable && (
                                  <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                    <UserIcon className="h-4 w-4" /> {direction.responsable}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex gap-4 ml-8 mt-2 text-xs text-gray-400 dark:text-gray-500">
                                <span><FolderIcon className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />{directionServices.length} services</span>
                                <span><UserGroupIcon className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />{directionUsers.length} agents</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4 flex-shrink-0">
                              <Link
                                to={`/backoffice/direction/${direction.id_direction}`}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title="Voir la direction"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => openServiceModal(direction)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                                title="Ajouter un service"
                              >
                                <FolderIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEditDirection(direction)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDirection(direction.id_direction, direction.nom_direction)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Services et Agents (expandable) */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                            <div className="p-4 space-y-4">
                              {/* Services */}
                              {directionServices.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                                    <FolderIcon className="h-4 w-4" />
                                    Services ({directionServices.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {directionServices.map((service) => (
                                      <div key={service.id_service} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-gray-900 dark:text-white">{service.nom_service}</h5>
                                            {service.description && <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>}
                                            <div className="flex gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                                              {service.email && <span><EnvelopeIcon className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />{service.email}</span>}
                                              {service.telephone && <span><PhoneIcon className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />{service.telephone}</span>}
                                            </div>
                                          </div>
                                          <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={() => handleEditService(service)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                              <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteService(service.id_service, service.nom_service)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                              <TrashIcon className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Agents avec rôle */}
                              {directionUsers.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                                    <UserGroupIcon className="h-4 w-4" />
                                    Agents ({directionUsers.length})
                                  </h4>
                                  <div className="space-y-1">
                                    {directionUsers.map((user) => (
                                      <div key={user.id_utilisateur} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded-xl">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-blue-600 dark:text-blue-300 text-xs font-medium">
                                              {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                                            </span>
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.prenom} {user.nom}</span>
                                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                              <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {getRoleLabel(user.nom_role)}
                                              </span>
                                              <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                {user.email || 'Email non renseigné'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {directionServices.length === 0 && directionUsers.length === 0 && (
                                <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
                                  Aucun service ou agent pour cette direction.
                                  <button onClick={() => openServiceModal(direction)} className="text-blue-600 hover:text-blue-700 font-medium ml-2">Ajouter un service</button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Onglet Services */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const direction = directions.find(d => d.id_direction === service.id_direction);
            return (
              <div key={service.id_service} className="card-hover">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FolderIcon className="h-8 w-8 text-blue-500" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{service.nom_service}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{direction?.nom_direction || 'Direction inconnue'}</p>
                    </div>
                  </div>
                  {service.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{service.description}</p>}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500">
                    {service.email && <span><EnvelopeIcon className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />{service.email}</span>}
                    {service.telephone && <span><PhoneIcon className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />{service.telephone}</span>}
                    {service.responsable && <span><UserIcon className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />{service.responsable}</span>}
                  </div>
                  <div className="mt-3 flex gap-1 justify-end border-t border-gray-100 dark:border-slate-700 pt-3">
                    <button onClick={() => handleEditService(service)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteService(service.id_service, service.nom_service)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onglet Agents par direction */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          {directions.filter(d => getUsersByDirection(d.id_direction).length > 0).map((direction) => {
            const directionUsers = getUsersByDirection(direction.id_direction);
            return (
              <div key={direction.id_direction} className="card overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">{direction.nom_direction}</h3>
                  <span className="text-sm text-blue-600 dark:text-blue-400">{directionUsers.length} agent{directionUsers.length > 1 ? 's' : ''}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Agent</th>
                        <th>Email</th>
                        <th className="hidden sm:table-cell">Téléphone</th>
                        <th>Rôle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {directionUsers.map((agent) => (
                        <tr key={agent.id_utilisateur} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">{agent.prenom?.charAt(0)}{agent.nom?.charAt(0)}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.prenom} {agent.nom}</span>
                            </div>
                          </td>
                          <td className="text-sm text-gray-500 dark:text-gray-400">{agent.email}</td>
                          <td className="text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{agent.telephone || '-'}</td>
                          <td>
                            <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {getRoleLabel(agent.nom_role)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {directions.filter(d => getUsersByDirection(d.id_direction).length > 0).length === 0 && (
            <div className="card p-12 text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucun agent affecté à une direction</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Nouvelle/Modification Direction */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom max-w-lg">
            <div className="sticky top-0 bg-white dark:bg-slate-800 flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingDirection ? 'Modifier la direction' : 'Nouvelle direction'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitDirection} className="p-4 space-y-4">
              <div>
                <label className="label">Nom de la direction <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.nom_direction}
                  onChange={(e) => setFormData({...formData, nom_direction: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label">Catégorie</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                  className="input"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input 
                    type="tel" 
                    value={formData.telephone} 
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Responsable</label>
                <input 
                  type="text" 
                  value={formData.responsable} 
                  onChange={(e) => setFormData({...formData, responsable: e.target.value})} 
                  className="input"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button type="button" onClick={closeModal} className="btn-secondary btn-md">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="btn-primary btn-md">
                  {loading ? 'Enregistrement...' : (editingDirection ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Service */}
      {showServiceModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom max-w-lg">
            <div className="sticky top-0 bg-white dark:bg-slate-800 flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingService ? 'Modifier le service' : `Ajouter un service à ${selectedDirection?.nom_direction}`}
              </h3>
              <button onClick={closeServiceModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitService} className="p-4 space-y-4">
              <div>
                <label className="label">Nom du service <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={serviceFormData.nom_service} 
                  onChange={(e) => setServiceFormData({...serviceFormData, nom_service: e.target.value})} 
                  className="input"
                  required 
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea 
                  value={serviceFormData.description} 
                  onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})} 
                  rows="3" 
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input 
                    type="email" 
                    value={serviceFormData.email} 
                    onChange={(e) => setServiceFormData({...serviceFormData, email: e.target.value})} 
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input 
                    type="tel" 
                    value={serviceFormData.telephone} 
                    onChange={(e) => setServiceFormData({...serviceFormData, telephone: e.target.value})} 
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Responsable</label>
                <input 
                  type="text" 
                  value={serviceFormData.responsable} 
                  onChange={(e) => setServiceFormData({...serviceFormData, responsable: e.target.value})} 
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button type="button" onClick={closeServiceModal} className="btn-secondary btn-md">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="btn-primary btn-md">
                  {loading ? 'Enregistrement...' : (editingService ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Directions;
