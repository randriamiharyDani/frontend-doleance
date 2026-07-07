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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-4">
            Cette page est réservée à l'administrateur système.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <button
            onClick={() => window.location.href = '/backoffice/dashboard'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des directions</h1>
          <p className="text-gray-600 mt-1">Gérez les directions, services et agents</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
            <ShieldCheckIcon className="h-3 w-3" />
            Accès réservé à l'administrateur système
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nouvelle direction
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('directions')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'directions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏢 Directions ({directions.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📂 Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'agents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Agents par direction
          </button>
        </nav>
      </div>

      {/* Onglet Directions */}
      {activeTab === 'directions' && (
        <div>
          {Object.entries(groupedDirections).length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune direction</h3>
              <p className="text-gray-500">Commencez par créer une direction</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer une direction
              </button>
            </div>
          ) : (
            Object.entries(groupedDirections).map(([categorie, dirs]) => (
              <div key={categorie} className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 px-2">
                  {categorie} ({dirs.length})
                </h2>
                <div className="space-y-3">
                  {dirs.map((direction) => {
                    const directionServices = getServicesByDirection(direction.id_direction);
                    const directionUsers = getUsersByDirection(direction.id_direction);
                    const isExpanded = expandedDirections[direction.id_direction];
                    
                    return (
                      <div key={direction.id_direction} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <button
                                  onClick={() => toggleDirection(direction.id_direction)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {isExpanded ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                                </button>
                                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-800">{direction.nom_direction}</h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {direction.categorie || 'Non catégorisé'}
                                </span>
                              </div>
                              
                              {direction.description && (
                                <p className="text-gray-600 text-sm ml-8 mb-3">{direction.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-4 ml-8 text-sm">
                                {direction.email && (
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <EnvelopeIcon className="h-4 w-4" /> {direction.email}
                                  </span>
                                )}
                                {direction.telephone && (
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <PhoneIcon className="h-4 w-4" /> {direction.telephone}
                                  </span>
                                )}
                                {direction.responsable && (
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <UserIcon className="h-4 w-4" /> {direction.responsable}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex gap-4 ml-8 mt-2 text-xs text-gray-400">
                                <span>📂 {directionServices.length} services</span>
                                <span>👥 {directionUsers.length} agents</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Link
                                to={`/backoffice/direction/${direction.id_direction}`}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Voir la direction"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                              {/* ❌ Bouton Ajouter un agent SUPPRIMÉ */}
                              <button
                                onClick={() => openServiceModal(direction)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                title="Ajouter un service"
                              >
                                <FolderIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEditDirection(direction)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Modifier"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDirection(direction.id_direction, direction.nom_direction)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Services et Agents (expandable) */}
                        {isExpanded && (
                          <div className="border-t bg-gray-50">
                            <div className="p-4">
                              {/* Services */}
                              {directionServices.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FolderIcon className="h-4 w-4" />
                                    Services ({directionServices.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {directionServices.map((service) => (
                                      <div key={service.id_service} className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <h5 className="font-medium text-gray-800">{service.nom_service}</h5>
                                            {service.description && <p className="text-sm text-gray-500">{service.description}</p>}
                                            <div className="flex gap-3 mt-1 text-xs text-gray-400">
                                              {service.email && <span>📧 {service.email}</span>}
                                              {service.telephone && <span>📞 {service.telephone}</span>}
                                            </div>
                                          </div>
                                          <div className="flex gap-1">
                                            <button onClick={() => handleEditService(service)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                              <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteService(service.id_service, service.nom_service)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <UserGroupIcon className="h-4 w-4" />
                                    Agents ({directionUsers.length})
                                  </h4>
                                  <div className="space-y-1">
                                    {directionUsers.map((user) => (
                                      <div key={user.id_utilisateur} className="flex justify-between items-center p-2 bg-white rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-blue-600 text-xs font-medium">
                                              {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-sm font-medium text-gray-700">{user.prenom} {user.nom}</span>
                                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                                {getRoleLabel(user.nom_role)}
                                              </span>
                                              <span className="text-xs text-gray-400">
                                                📧 {user.email || 'Email non renseigné'}
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
                                <div className="text-center text-gray-500 text-sm py-4">
                                  Aucun service ou agent pour cette direction.
                                  <button onClick={() => openServiceModal(direction)} className="text-blue-600 ml-2">Ajouter un service</button>
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
              <div key={service.id_service} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <FolderIcon className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{service.nom_service}</h3>
                    <p className="text-xs text-gray-500">{direction?.nom_direction || 'Direction inconnue'}</p>
                  </div>
                </div>
                {service.description && <p className="text-sm text-gray-600 mb-3">{service.description}</p>}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {service.email && <span>📧 {service.email}</span>}
                  {service.telephone && <span>📞 {service.telephone}</span>}
                  {service.responsable && <span>👤 {service.responsable}</span>}
                </div>
                <div className="mt-3 flex gap-2 justify-end">
                  <button onClick={() => handleEditService(service)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteService(service.id_service, service.nom_service)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <TrashIcon className="h-4 w-4" />
                  </button>
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
              <div key={direction.id_direction} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
                  <h3 className="font-semibold text-blue-800">{direction.nom_direction}</h3>
                  <span className="text-sm text-blue-600">{directionUsers.length} agent{directionUsers.length > 1 ? 's' : ''}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {directionUsers.map((agent) => (
                        <tr key={agent.id_utilisateur} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">{agent.prenom?.charAt(0)}{agent.nom?.charAt(0)}</span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{agent.prenom} {agent.nom}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.telephone || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
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
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Aucun agent affecté à une direction</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Nouvelle/Modification Direction */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                {editingDirection ? 'Modifier la direction' : 'Nouvelle direction'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitDirection} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la direction <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom_direction}
                  onChange={(e) => setFormData({...formData, nom_direction: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input 
                    type="tel" 
                    value={formData.telephone} 
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <input 
                  type="text" 
                  value={formData.responsable} 
                  onChange={(e) => setFormData({...formData, responsable: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Enregistrement...' : (editingDirection ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Service */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingService ? 'Modifier le service' : `Ajouter un service à ${selectedDirection?.nom_direction}`}
              </h3>
              <button onClick={closeServiceModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitService} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={serviceFormData.nom_service} 
                  onChange={(e) => setServiceFormData({...serviceFormData, nom_service: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={serviceFormData.description} 
                  onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})} 
                  rows="3" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={serviceFormData.email} 
                    onChange={(e) => setServiceFormData({...serviceFormData, email: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input 
                    type="tel" 
                    value={serviceFormData.telephone} 
                    onChange={(e) => setServiceFormData({...serviceFormData, telephone: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <input 
                  type="text" 
                  value={serviceFormData.responsable} 
                  onChange={(e) => setServiceFormData({...serviceFormData, responsable: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeServiceModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
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