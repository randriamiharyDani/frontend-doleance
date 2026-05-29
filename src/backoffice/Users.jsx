import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  UserPlusIcon, 
  TrashIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Liste complète des directions de la Commune Urbaine d'Antananarivo
const DIRECTIONS_LIST = [
  // Sécurité
  { id: 1, nom: 'Corps des Sapeurs Pompiers d\'Antananarivo', categorie: 'Sécurité' },
  { id: 2, nom: 'Police Municipale d\'Antananarivo', categorie: 'Sécurité' },
  { id: 3, nom: 'Direction de la Sécurité Publique', categorie: 'Sécurité' },
  { id: 4, nom: 'Direction de la Gestion des Risques et Catastrophes', categorie: 'Sécurité' },
  
  // Administration
  { id: 5, nom: 'Secrétariat Général de la Mairie', categorie: 'Administration' },
  { id: 6, nom: 'Direction des Ressources Humaines', categorie: 'RH' },
  { id: 7, nom: 'Direction des Affaires Juridiques et Contentieux', categorie: 'Juridique' },
  { id: 8, nom: 'Direction des Relations avec les Institutions', categorie: 'Relations' },
  { id: 9, nom: 'Direction du Patrimoine', categorie: 'Patrimoine' },
  { id: 10, nom: 'Direction de la Logistique et des Moyens Généraux', categorie: 'Logistique' },
  { id: 11, nom: 'Direction des Finances', categorie: 'Finance' },
  { id: 12, nom: 'Direction des Marchés Publics', categorie: 'Marchés' },
  
  // Infrastructures
  { id: 13, nom: 'Direction de l\'Urbanisme et de l\'Habitat', categorie: 'Urbanisme' },
  { id: 14, nom: 'Direction des Infrastructures et du Développement Urbain', categorie: 'Infrastructures' },
  { id: 15, nom: 'Direction des Bâtiments et Travaux Publics', categorie: 'BTP' },
  { id: 16, nom: 'Direction des Transports et de la Mobilité Urbaine', categorie: 'Transport' },
  
  // Environnement
  { id: 17, nom: 'Direction de l\'Environnement et du Développement Durable', categorie: 'Environnement' },
  { id: 18, nom: 'Direction de l\'Eau, de l\'Assainissement et de l\'Hygiène', categorie: 'Environnement' },
  { id: 19, nom: 'Direction de la Salubrité et de la Propreté', categorie: 'Environnement' },
  
  // Social et Culture
  { id: 20, nom: 'Direction des Actions Sociales et de la Santé', categorie: 'Social' },
  { id: 21, nom: 'Direction de la Culture, des Arts et du Patrimoine', categorie: 'Culture' },
  { id: 22, nom: 'Direction des Sports et des Loisirs', categorie: 'Sports' },
  
  // Technologies
  { id: 23, nom: 'Direction des Systèmes d\'Information et du Numérique', categorie: 'Informatique' },
  
  // Arrondissements
  { id: 24, nom: 'Arrondissement d\'Antananarivo-Renivohitra', categorie: 'Arrondissement' },
  { id: 25, nom: 'Arrondissement d\'Antananarivo-Atsimondrano', categorie: 'Arrondissement' },
  { id: 26, nom: 'Arrondissement d\'Antananarivo-Avaradrano', categorie: 'Arrondissement' },
  { id: 27, nom: 'Direction de la Voirie', categorie: 'Infrastructures' },
  { id: 28, nom: 'Direction de l\'Éclairage Public', categorie: 'Infrastructures' }
];

function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // CHANGÉ: dynamique au lieu de statique
  const [directions] = useState(DIRECTIONS_LIST);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDirectionCategorie, setSelectedDirectionCategorie] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    id_role: '',
    id_direction: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles(); // AJOUTÉ: Charger les rôles depuis l'API
    fetchDirections();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // NOUVELLE FONCTION: Charger les rôles depuis l'API
  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      if (response.data.success) {
        setRoles(response.data.data);
        console.log('Rôles chargés:', response.data.data);
      } else {
        // Fallback vers les rôles par défaut si l'API ne retourne rien
        setRoles(getDefaultRoles());
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
      setRoles(getDefaultRoles());
      toast.error('Erreur lors du chargement des rôles');
    }
  };

  // Rôles par défaut en cas d'erreur
  const getDefaultRoles = () => {
    return [
      { id_role: 1, nom_role: 'citoyen', description: 'Citoyen - Peut déposer des doléances' },
      { id_role: 2, nom_role: 'agent', description: 'Agent de terrain - Traite les doléances' },
      { id_role: 3, nom_role: 'chef_service', description: 'Chef de Service - Supervise une direction' },
      { id_role: 4, nom_role: 'directeur', description: 'Directeur - Gère une direction' },
      { id_role: 5, nom_role: 'secretaire_general', description: 'Secrétaire Général - Coordination générale' },
      { id_role: 6, nom_role: 'administrateur_systeme', description: 'Administrateur - Gère tout le système' },
      { id_role: 7, nom_role: 'maire', description: 'Maire - Validation finale' },
      { id_role: 8, nom_role: 'responsable_arrondissement', description: 'Responsable d\'Arrondissement' }
    ];
  };

  const fetchDirections = async () => {
    try {
      const response = await api.get('/directions');
      if (response.data.success) {
        // Utiliser les directions de l'API si disponibles
        console.log('Directions chargées:', response.data);
      }
    } catch (error) {
      console.error('Erreur chargement directions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (!editingUser && !formData.password) {
      toast.error('Le mot de passe est requis');
      return;
    }
    
    setLoading(true);
    
    try {
      if (editingUser) {
        const response = await api.put(`/users/${editingUser.id_utilisateur}`, formData);
        if (response.data.success) {
          toast.success('Utilisateur modifié avec succès');
          fetchUsers();
          closeModal();
        } else {
          toast.error(response.data.message || 'Erreur lors de la modification');
        }
      } else {
        const response = await api.post('/users', formData);
        if (response.data.success) {
          toast.success(`Utilisateur ${formData.prenom} ${formData.nom} créé avec succès`);
          fetchUsers();
          closeModal();
        } else {
          toast.error(response.data.message || 'Erreur lors de la création');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (user) => {
    if (user.id_utilisateur === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await api.delete(`/users/${userToDelete.id_utilisateur}`);
      if (response.data.success) {
        toast.success(`Utilisateur "${userToDelete.prenom} ${userToDelete.nom}" supprimé avec succès`);
        fetchUsers();
      } else {
        toast.error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleToggleActif = async (id, actif, userName) => {
    if (id === currentUser?.id) {
      toast.error('Vous ne pouvez pas modifier votre propre statut');
      return;
    }
    
    try {
      const response = await api.patch(`/users/${id}/toggle`, { actif: !actif });
      if (response.data.success) {
        toast.success(`Utilisateur ${!actif ? 'activé' : 'désactivé'} avec succès`);
        fetchUsers();
      } else {
        toast.error(response.data.message || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      password: '',
      telephone: user.telephone || '',
      id_role: user.id_role?.toString() || '',
      id_direction: user.id_direction?.toString() || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      telephone: '',
      id_role: '',
      id_direction: ''
    });
    setShowPassword(false);
  };

  // MODIFIÉ: Fonction pour obtenir la couleur du badge selon le rôle
  const getRoleBadge = (roleNom) => {
    const colors = {
      administrateur_systeme: 'bg-purple-100 text-purple-800',
      administrateur: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      chef_service: 'bg-cyan-100 text-cyan-800',
      directeur: 'bg-green-100 text-green-800',
      secretaire_general: 'bg-indigo-100 text-indigo-800',
      maire: 'bg-red-100 text-red-800',
      responsable_arrondissement: 'bg-teal-100 text-teal-800',
      citoyen: 'bg-gray-100 text-gray-800'
    };
    return colors[roleNom] || 'bg-gray-100 text-gray-800';
  };

  // MODIFIÉ: Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (roleNom) => {
    const icons = {
      administrateur_systeme: '👑',
      administrateur: '👑',
      agent: '👨‍💼',
      chef_service: '⭐',
      directeur: '📊',
      secretaire_general: '📋',
      maire: '🏛️',
      responsable_arrondissement: '📍',
      citoyen: '👤'
    };
    return icons[roleNom] || '🔑';
  };

  // NOUVELLE FONCTION: Obtenir le libellé lisible d'un rôle
  const getRoleLabel = (roleNom) => {
    const labels = {
      administrateur_systeme: 'Administrateur Système',
      administrateur: 'Administrateur',
      agent: 'Agent',
      chef_service: 'Chef de Service',
      directeur: 'Directeur',
      secretaire_general: 'Secrétaire Général',
      maire: 'Maire',
      responsable_arrondissement: 'Responsable d\'Arrondissement',
      citoyen: 'Citoyen'
    };
    // Si le rôle n'est pas dans les labels par défaut, formater le nom
    return labels[roleNom] || roleNom?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDirectionCategorie = (directionId) => {
    const direction = directions.find(d => d.id === directionId);
    return direction?.categorie || 'Autre';
  };

  const getCategorieColor = (categorie) => {
    const colors = {
      'Sécurité': 'bg-red-100 text-red-800',
      'Administration': 'bg-blue-100 text-blue-800',
      'RH': 'bg-pink-100 text-pink-800',
      'Juridique': 'bg-purple-100 text-purple-800',
      'Relations': 'bg-indigo-100 text-indigo-800',
      'Patrimoine': 'bg-yellow-100 text-yellow-800',
      'Logistique': 'bg-gray-100 text-gray-800',
      'Finance': 'bg-emerald-100 text-emerald-800',
      'Marchés': 'bg-teal-100 text-teal-800',
      'Urbanisme': 'bg-lime-100 text-lime-800',
      'Infrastructures': 'bg-orange-100 text-orange-800',
      'BTP': 'bg-stone-100 text-stone-800',
      'Transport': 'bg-cyan-100 text-cyan-800',
      'Environnement': 'bg-green-100 text-green-800',
      'Social': 'bg-rose-100 text-rose-800',
      'Culture': 'bg-violet-100 text-violet-800',
      'Sports': 'bg-fuchsia-100 text-fuchsia-800',
      'Informatique': 'bg-slate-100 text-slate-800',
      'Arrondissement': 'bg-gray-100 text-gray-800'
    };
    return colors[categorie] || 'bg-gray-100 text-gray-800';
  };

  const filteredDirections = directions.filter(dir => {
    if (selectedDirectionCategorie === 'all') return true;
    return dir.categorie === selectedDirectionCategorie;
  });

  // MODIFIÉ: Filtrer les utilisateurs en excluant les citoyens
  const filteredUsers = users.filter(user => {
    if (user.role_nom === 'citoyen') return false;
    if (filterRole !== 'all' && user.role_nom !== filterRole) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return user.nom?.toLowerCase().includes(search) ||
             user.prenom?.toLowerCase().includes(search) ||
             user.email?.toLowerCase().includes(search);
    }
    return true;
  });

  const directionCategories = [...new Set(directions.map(d => d.categorie))];

  // NOUVELLE VARIABLE: Rôles disponibles pour le formulaire (exclure citoyen)
  const availableRolesForForm = roles.filter(role => role.nom_role !== 'citoyen');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-1">Consulter et gérer les comptes agents</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlusIcon className="h-5 w-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Total agents</p>
          <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Administrateurs</p>
          <p className="text-2xl font-bold text-purple-600">
            {filteredUsers.filter(u => u.role_nom === 'administrateur_systeme' || u.role_nom === 'administrateur').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Directeurs</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredUsers.filter(u => u.role_nom === 'directeur').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Agents actifs</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredUsers.filter(u => u.actif === 1).length}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              type="text"
              placeholder="Nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par rôle</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les rôles</option>
              {availableRolesForForm.map(role => (
                <option key={role.id_role} value={role.nom_role}>
                  {getRoleIcon(role.nom_role)} {getRoleLabel(role.nom_role)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie de direction</label>
            <select
              value={selectedDirectionCategorie}
              onChange={(e) => setSelectedDirectionCategorie(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {directionCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fonction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction/Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id_utilisateur} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg">{getRoleIcon(user.role_nom)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-sm text-gray-500">{user.telephone || 'Pas de téléphone'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role_nom)}`}>
                      {getRoleIcon(user.role_nom)} {getRoleLabel(user.role_nom)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {user.nom_direction || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategorieColor(getDirectionCategorie(user.id_direction))}`}>
                      {getDirectionCategorie(user.id_direction)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleActif(user.id_utilisateur, user.actif, `${user.prenom} ${user.nom}`)}
                      className={`mr-2 ${user.actif ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      title={user.actif ? 'Désactiver' : 'Activer'}
                    >
                      {user.actif ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Modifier"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {user.id_utilisateur !== currentUser?.id && (
                      <button
                        onClick={() => confirmDelete(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmation de suppression</h3>
              <p className="text-sm text-gray-500 mb-4">
                Êtes-vous sûr de vouloir supprimer l'agent <span className="font-semibold">{userToDelete.prenom} {userToDelete.nom}</span> ?
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

      {/* Modal d'ajout/modification - Utilisation des rôles dynamiques */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Modifier l\'agent' : 'Ajouter un agent'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Fonction *</label>
                  <select
                    value={formData.id_role}
                    onChange={(e) => setFormData({...formData, id_role: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une fonction</option>
                    {availableRolesForForm.map(role => (
                      <option key={role.id_role} value={role.id_role}>
                        {getRoleIcon(role.nom_role)} {getRoleLabel(role.nom_role)} - {role.description || 'Aucune description'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Direction/Service</label>
                  <select
                    value={formData.id_direction}
                    onChange={(e) => setFormData({...formData, id_direction: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucune direction</option>
                    {filteredDirections.map(dir => (
                      <option key={dir.id} value={dir.id}>
                        {dir.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingUser ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;