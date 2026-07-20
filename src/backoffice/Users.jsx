import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import socket from '../config/socket';
import toast from 'react-hot-toast';
import { 
  UserPlusIcon, 
  TrashIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  UserGroupIcon,
  SparklesIcon,
  StarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

function Users() {
  const { user: currentUser } = useAuth();
  
  // Tous les useState en premier
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [directions, setDirections] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDirections, setLoadingDirections] = useState(false);
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

  // Vérifier si l'utilisateur est super admin avec useMemo
  const isSuperAdmin = useMemo(() => {
    return currentUser?.role === 'administrateur_systeme' || 
           currentUser?.nom_role === 'administrateur_systeme';
  }, [currentUser]);

  // Fonctions utilitaires avec useCallback
  const getDefaultRoles = useCallback(() => {
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
  }, []);

  const getStaticDirections = useCallback(() => {
    return [
      { id: 1, nom: 'Corps des Sapeurs Pompiers d\'Antananarivo', categorie: 'Sécurité' },
      { id: 2, nom: 'Police Municipale d\'Antananarivo', categorie: 'Sécurité' },
      { id: 3, nom: 'Direction de la Sécurité Publique', categorie: 'Sécurité' },
      { id: 4, nom: 'Direction de la Gestion des Risques et Catastrophes', categorie: 'Sécurité' },
      { id: 5, nom: 'Secrétariat Général de la Mairie', categorie: 'Administration' },
      { id: 6, nom: 'Direction des Ressources Humaines', categorie: 'RH' },
      { id: 7, nom: 'Direction des Affaires Juridiques et Contentieux', categorie: 'Juridique' },
      { id: 8, nom: 'Direction des Relations avec les Institutions', categorie: 'Relations' },
      { id: 9, nom: 'Direction du Patrimoine', categorie: 'Patrimoine' },
      { id: 10, nom: 'Direction de la Logistique et des Moyens Généraux', categorie: 'Logistique' },
      { id: 11, nom: 'Direction des Finances', categorie: 'Finance' },
      { id: 12, nom: 'Direction des Marchés Publics', categorie: 'Marchés' },
      { id: 13, nom: 'Direction de l\'Urbanisme et de l\'Habitat', categorie: 'Urbanisme' },
      { id: 14, nom: 'Direction des Infrastructures et du Développement Urbain', categorie: 'Infrastructures' },
      { id: 15, nom: 'Direction des Bâtiments et Travaux Publics', categorie: 'BTP' },
      { id: 16, nom: 'Direction des Transports et de la Mobilité Urbaine', categorie: 'Transport' },
      { id: 17, nom: 'Direction de l\'Environnement et du Développement Durable', categorie: 'Environnement' },
      { id: 18, nom: 'Direction de l\'Eau, de l\'Assainissement et de l\'Hygiène', categorie: 'Environnement' },
      { id: 19, nom: 'Direction de la Salubrité et de la Propreté', categorie: 'Environnement' },
      { id: 20, nom: 'Direction des Actions Sociales et de la Santé', categorie: 'Social' },
      { id: 21, nom: 'Direction de la Culture, des Arts et du Patrimoine', categorie: 'Culture' },
      { id: 22, nom: 'Direction des Sports et des Loisirs', categorie: 'Sports' },
      { id: 23, nom: 'Direction des Systèmes d\'Information et du Numérique', categorie: 'Informatique' },
      { id: 24, nom: 'Arrondissement d\'Antananarivo-Renivohitra', categorie: 'Arrondissement' },
      { id: 25, nom: 'Arrondissement d\'Antananarivo-Atsimondrano', categorie: 'Arrondissement' },
      { id: 26, nom: 'Arrondissement d\'Antananarivo-Avaradrano', categorie: 'Arrondissement' },
      { id: 27, nom: 'Direction de la Voirie', categorie: 'Infrastructures' },
      { id: 28, nom: 'Direction de l\'Éclairage Public', categorie: 'Infrastructures' }
    ];
  }, []);

  // Fonctions de récupération de données avec useCallback
  const fetchUsers = useCallback(async () => {
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
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get('/roles');
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        setRoles(getDefaultRoles());
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
      setRoles(getDefaultRoles());
      toast.error('Erreur lors du chargement des rôles');
    }
  }, [getDefaultRoles]);

  const fetchDirections = useCallback(async () => {
    try {
      setLoadingDirections(true);
      const response = await api.get('/directions');
      if (response.data.success && response.data.data.length > 0) {
        const formattedDirections = response.data.data.map(dir => ({
          id: dir.id_direction,
          nom: dir.nom_direction,
          categorie: dir.categorie || 'Autre'
        }));
        setDirections(formattedDirections);
      } else {
        setDirections(getStaticDirections());
      }
    } catch (error) {
      console.error('Erreur chargement directions:', error);
      setDirections(getStaticDirections());
      toast.error('Erreur lors du chargement des directions');
    } finally {
      setLoadingDirections(false);
    }
  }, [getStaticDirections]);

  // useEffect pour charger les données au montage
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDirections();
  }, [fetchUsers, fetchRoles, fetchDirections]);

  // Écouter les mises à jour des utilisateurs en ligne
  useEffect(() => {
    // Récupérer la liste initiale
    setOnlineUsers(socket.getOnlineUsers());

    // S'abonner aux mises à jour
    const handleOnlineUpdate = (users) => {
      setOnlineUsers(users);
    };
    socket.setOnlineUsersCallback(handleOnlineUpdate);

    return () => {
      socket.setOnlineUsersCallback(null);
    };
  }, []);

  // Fonctions de gestion avec useCallback
  const closeModal = useCallback(() => {
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
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (!editingUser && !formData.password) {
      toast.error('Le mot de passe est requis');
      return;
    }
    
    if (formData.id_direction && formData.id_direction !== '') {
      const directionExists = directions.some(d => d.id == formData.id_direction);
      if (!directionExists) {
        toast.error('La direction sélectionnée n\'existe pas.');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      if (editingUser) {
        const response = await api.put(`/users/${editingUser.id_utilisateur}`, formData);
        if (response.data.success) {
          toast.success('Utilisateur modifié avec succès');
          await fetchUsers();
          closeModal();
        } else {
          toast.error(response.data.message || 'Erreur lors de la modification');
        }
      } else {
        const response = await api.post('/users', formData);
        if (response.data.success) {
          toast.success(`Utilisateur ${formData.prenom} ${formData.nom} créé avec succès`);
          await fetchUsers();
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
  }, [formData, editingUser, directions, fetchUsers, closeModal]);

  const confirmDelete = useCallback((user) => {
    if (user.id_utilisateur === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  }, [currentUser]);

  const handleDelete = useCallback(async () => {
    if (!userToDelete) return;
    
    try {
      const response = await api.delete(`/users/${userToDelete.id_utilisateur}`);
      if (response.data.success) {
        toast.success(`Utilisateur "${userToDelete.prenom} ${userToDelete.nom}" supprimé avec succès`);
        await fetchUsers();
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
  }, [userToDelete, fetchUsers]);

  const handleToggleActif = useCallback(async (id, actif) => {
    if (id === currentUser?.id) {
      toast.error('Vous ne pouvez pas modifier votre propre statut');
      return;
    }
    
    try {
      const response = await api.patch(`/users/${id}/toggle`, { actif: !actif });
      if (response.data.success) {
        toast.success(`Utilisateur ${!actif ? 'activé' : 'désactivé'} avec succès`);
        await fetchUsers();
      } else {
        toast.error(response.data.message || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  }, [currentUser, fetchUsers]);

  const handleEdit = useCallback((user) => {
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
  }, []);

  // Fonctions utilitaires avec useCallback
  const getRoleIcon = useCallback((roleNom) => {
    const icons = {
      administrateur_systeme: <ShieldCheckIcon className="h-4 w-4 text-purple-600" />,
      administrateur: <ShieldCheckIcon className="h-4 w-4 text-purple-600" />,
      agent: <UserIcon className="h-4 w-4 text-blue-600" />,
      chef_service: <StarIcon className="h-4 w-4 text-cyan-600" />,
      directeur: <BriefcaseIcon className="h-4 w-4 text-green-600" />,
      secretaire_general: <AcademicCapIcon className="h-4 w-4 text-indigo-600" />,
      maire: <BuildingOfficeIcon className="h-4 w-4 text-red-600" />,
      responsable_arrondissement: <UserGroupIcon className="h-4 w-4 text-teal-600" />,
      citoyen: <UserIcon className="h-4 w-4 text-gray-600" />
    };
    return icons[roleNom] || <UserIcon className="h-4 w-4 text-gray-600" />;
  }, []);

  const getRoleBadge = useCallback((roleNom) => {
    const colors = {
      administrateur_systeme: 'bg-purple-100 text-purple-800 border-purple-200',
      administrateur: 'bg-purple-100 text-purple-800 border-purple-200',
      agent: 'bg-blue-100 text-blue-800 border-blue-200',
      chef_service: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      directeur: 'bg-green-100 text-green-800 border-green-200',
      secretaire_general: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      maire: 'bg-red-100 text-red-800 border-red-200',
      responsable_arrondissement: 'bg-teal-100 text-teal-800 border-teal-200',
      citoyen: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[roleNom] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  const getRoleLabel = useCallback((roleNom) => {
    const labels = {
      administrateur_systeme: 'Admin Système',
      administrateur: 'Administrateur',
      agent: 'Agent',
      chef_service: 'Chef Service',
      directeur: 'Directeur',
      secretaire_general: 'Secrétaire Général',
      maire: 'Maire',
      responsable_arrondissement: 'Resp. Arrondissement',
      citoyen: 'Citoyen'
    };
    return labels[roleNom] || roleNom?.replace(/_/g, ' ');
  }, []);

  const getDirectionCategorie = useCallback((directionId) => {
    const direction = directions.find(d => d.id === directionId);
    return direction?.categorie || 'Non catégorisé';
  }, [directions]);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.some(u => u.userId === userId);
  }, [onlineUsers]);

  const getCategorieColor = useCallback((categorie) => {
    const colors = {
      'Sécurité': 'bg-red-100 text-red-800 border-red-200',
      'Administration': 'bg-blue-100 text-blue-800 border-blue-200',
      'RH': 'bg-pink-100 text-pink-800 border-pink-200',
      'Juridique': 'bg-purple-100 text-purple-800 border-purple-200',
      'Relations': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Patrimoine': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Logistique': 'bg-gray-100 text-gray-800 border-gray-200',
      'Finance': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Marchés': 'bg-teal-100 text-teal-800 border-teal-200',
      'Urbanisme': 'bg-lime-100 text-lime-800 border-lime-200',
      'Infrastructures': 'bg-orange-100 text-orange-800 border-orange-200',
      'BTP': 'bg-stone-100 text-stone-800 border-stone-200',
      'Transport': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Environnement': 'bg-green-100 text-green-800 border-green-200',
      'Social': 'bg-rose-100 text-rose-800 border-rose-200',
      'Culture': 'bg-violet-100 text-violet-800 border-violet-200',
      'Sports': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      'Informatique': 'bg-slate-100 text-slate-800 border-slate-200',
      'Arrondissement': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[categorie] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  // Données dérivées avec useMemo
  const directionCategories = useMemo(() => {
    return [...new Set(directions.map(d => d.categorie))];
  }, [directions]);

  const availableRolesForForm = useMemo(() => {
    return roles.filter(role => role.nom_role !== 'citoyen');
  }, [roles]);

  const filteredDirections = useMemo(() => {
    return directions.filter(dir => {
      if (selectedDirectionCategorie === 'all') return true;
      return dir.categorie === selectedDirectionCategorie;
    });
  }, [directions, selectedDirectionCategorie]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
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
  }, [users, filterRole, searchTerm]);

  // Rediriger si ce n'est pas le super admin
  if (!isSuperAdmin) {
    return (
      <div className="max-auto flex items-center justify-center bg-gray-100">
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

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-gray-600 text-sm">Consulter et gérer les comptes agents</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
            <ShieldCheckIcon className="h-3 w-3" />
            Accès réservé à l'administrateur système
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchDirections}
            className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm flex-1 sm:flex-none justify-center"
            title="Rafraîchir les directions"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Rafraîchir</span>
            <span className="sm:hidden">↻</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm flex-1 sm:flex-none justify-center"
          >
            <UserPlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvel utilisateur</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Statistiques - Version responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-3 md:p-4 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
          <span className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
          <p className="text-xs font-medium text-gray-500">Total agents</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600 tabular-nums mt-1">
            {filteredUsers.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-3 md:p-4 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
          <span className="absolute left-0 top-0 h-full w-1 bg-purple-500" />
          <p className="text-xs font-medium text-gray-500">Administrateurs</p>
          <p className="text-xl md:text-2xl font-bold text-purple-600 tabular-nums mt-1">
            {filteredUsers.filter(u => u.role_nom === 'administrateur_systeme' || u.role_nom === 'administrateur').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-3 md:p-4 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
          <span className="absolute left-0 top-0 h-full w-1 bg-green-500" />
          <p className="text-xs font-medium text-gray-500">Directeurs</p>
          <p className="text-xl md:text-2xl font-bold text-green-600 tabular-nums mt-1">
            {filteredUsers.filter(u => u.role_nom === 'directeur').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-3 md:p-4 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
          <span className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
          <p className="text-xs font-medium text-gray-500">Agents actifs</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-600 tabular-nums mt-1">
            {filteredUsers.filter(u => u.actif === 1).length}
          </p>
        </div>
      </div>

      {/* Filtres - Version compacte */}
      <div className="bg-white rounded-lg shadow p-2 md:p-3 mb-4 md:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              type="text"
              placeholder="Nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Filtrer par rôle</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les rôles</option>
              {availableRolesForForm.map(role => (
                <option key={role.id_role} value={role.nom_role}>
                  {getRoleLabel(role.nom_role)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={selectedDirectionCategorie}
              onChange={(e) => setSelectedDirectionCategorie(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {directionCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau avec overflow et taille adaptée */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Téléphone</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fonction</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Direction</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Catégorie</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">En ligne</th>
                <th className="px-2 md:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id_utilisateur} className="hover:bg-gray-50">
                  <td className="px-2 md:px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-7 w-7 md:h-8 md:w-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        {getRoleIcon(user.role_nom)}
                      </div>
                      <div className="ml-2 min-w-0">
                        <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px]">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 sm:hidden">
                          <EnvelopeIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[60px]">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs text-gray-500 max-w-[120px] truncate hidden sm:table-cell">
                    <div className="flex items-center gap-1">
                      <EnvelopeIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs text-gray-500 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span>{user.telephone || '-'}</span>
                    </div>
                  </td>
                  <td className="px-2 md:px-3 py-2 whitespace-nowrap">
                    <span className={`px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs rounded-full border ${getRoleBadge(user.role_nom)}`}>
                      {getRoleLabel(user.role_nom)}
                    </span>
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs text-gray-500 max-w-[100px] truncate hidden lg:table-cell">
                    {user.nom_direction || '-'}
                  </td>
                  <td className="px-2 md:px-3 py-2 whitespace-nowrap hidden xl:table-cell">
                    <span className={`px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs rounded-full border ${getCategorieColor(getDirectionCategorie(user.id_direction))}`}>
                      {getDirectionCategorie(user.id_direction)}
                    </span>
                  </td>
                  <td className="px-2 md:px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${isUserOnline(user.id_utilisateur) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className={`text-[10px] md:text-xs ${isUserOnline(user.id_utilisateur) ? 'text-green-600' : 'text-gray-500'}`}>
                        {isUserOnline(user.id_utilisateur) ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 md:px-3 py-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-0.5 md:gap-1">
                      <button
                        onClick={() => handleToggleActif(user.id_utilisateur, user.actif)}
                        className={`p-1 rounded-lg transition-colors ${user.actif ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={user.actif ? 'Désactiver' : 'Activer'}
                      >
                        {user.actif ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {user.id_utilisateur !== currentUser?.id && (
                        <button
                          onClick={() => confirmDelete(user)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-6 md:py-8">
            <UserIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Modales - restent identiques */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Confirmation</h3>
              <p className="text-sm text-gray-500 mb-3">
                Supprimer <span className="font-semibold">{userToDelete.prenom} {userToDelete.nom}</span> ?
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <UserPlusIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-md font-semibold">
                  {editingUser ? 'Modifier l\'agent' : 'Ajouter un agent'}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      Nom *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      Prénom *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <EnvelopeIcon className="h-3 w-3" />
                      Email *
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="h-3 w-3" />
                      Téléphone
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {!editingUser && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheckIcon className="h-3 w-3" />
                        Mot de passe *
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-2 py-1.5 text-sm border rounded-lg pr-8"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="h-3 w-3" />
                      Fonction *
                    </span>
                  </label>
                  <select
                    value={formData.id_role}
                    onChange={(e) => setFormData({...formData, id_role: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {availableRolesForForm.map(role => (
                      <option key={role.id_role} value={role.id_role}>
                        {getRoleLabel(role.nom_role)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <BuildingOfficeIcon className="h-3 w-3" />
                      Direction
                    </span>
                  </label>
                  <select
                    value={formData.id_direction}
                    onChange={(e) => setFormData({...formData, id_direction: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg"
                  >
                    <option value="">Aucune</option>
                    {filteredDirections.map(dir => (
                      <option key={dir.id} value={dir.id}>
                        {dir.nom.length > 40 ? dir.nom.substring(0, 40) + '...' : dir.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button type="button" onClick={closeModal} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  {editingUser ? (
                    <>
                      <PencilIcon className="h-3 w-3" />
                      Modifier
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="h-3 w-3" />
                      Créer
                    </>
                  )}
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