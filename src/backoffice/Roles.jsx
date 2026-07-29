import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  UsersIcon,
  StarIcon,
  MapPinIcon,
  ClipboardDocumentCheckIcon,
  EyeIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

function Roles() {
  const { user } = useAuth();
  
  // Tous les useState en premier
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [formData, setFormData] = useState({
    nom_role: '',
    description: '',
    permissions: {}
  });

  // Vérifier si l'utilisateur est super admin
  const isSuperAdmin = useMemo(() => {
    return user?.role === 'administrateur_systeme' || user?.nom_role === 'administrateur_systeme';
  }, [user]);

  // Liste des rôles disponibles dans l'organigramme
  const rolesDefinition = useMemo(() => [
    { 
      id: 1, 
      nom: 'administrateur_systeme', 
      label: 'Administrateur Système', 
      description: 'Gère tout le système - Création/modification/suppression des utilisateurs et rôles',
      level: 7,
      icon: <ShieldCheckIcon className="h-5 w-5" />
    },
    { 
      id: 2, 
      nom: 'maire', 
      label: 'Maire', 
      description: 'Peut répondre aux doléances, valider les décisions importantes',
      level: 6,
      icon: <BuildingOfficeIcon className="h-5 w-5" />
    },
    { 
      id: 3, 
      nom: 'agent_central', 
      label: 'Agent Central', 
      description: 'Reçoit toutes les doléances, les transfère aux directions concernées, peut supprimer les doléances unitiles',
      level: 5,
      icon: <ArrowPathIcon className="h-5 w-5" />
    },
    { 
      id: 4, 
      nom: 'directeur', 
      label: 'Directeur', 
      description: 'Gère une direction, supervise les chefs de service, peut assigner des doléances',
      level: 4,
      icon: <BriefcaseIcon className="h-5 w-5" />
    },
    { 
      id: 5, 
      nom: 'chef_service', 
      label: 'Chef de Service', 
      description: 'Gère un service au sein d\'une direction, traite les doléances de son service',
      level: 3,
      icon: <StarIcon className="h-5 w-5" />
    },
    { 
      id: 6, 
      nom: 'agent', 
      label: 'Agent', 
      description: 'Traite les doléances qui lui sont assignées, peut répondre aux citoyens',
      level: 2,
      icon: <UserIcon className="h-5 w-5" />
    },
    { 
      id: 7, 
      nom: 'secretaire_general', 
      label: 'Secrétaire Général', 
      description: 'Coordination générale entre les directions, supervision des directeurs',
      level: 5,
      icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />
    },
    { 
      id: 8, 
      nom: 'responsable_arrondissement', 
      label: 'Responsable d\'Arrondissement', 
      description: 'Gère les doléances spécifiques à un arrondissement',
      level: 3,
      icon: <MapPinIcon className="h-5 w-5" />
    },
    { 
      id: 9, 
      nom: 'agent_terrain', 
      label: 'Agent de Terrain', 
      description: 'Intervient physiquement sur le terrain pour résoudre les problèmes',
      level: 2,
      icon: <HomeIcon className="h-5 w-5" />
    },
    { 
      id: 10, 
      nom: 'superviseur', 
      label: 'Superviseur', 
      description: 'Supervise plusieurs services, valide les traitements',
      level: 3,
      icon: <CheckBadgeIcon className="h-5 w-5" />
    },
    { 
      id: 11, 
      nom: 'consultant', 
      label: 'Consultant', 
      description: 'Peut consulter les doléances mais pas les modifier',
      level: 1,
      icon: <EyeIcon className="h-5 w-5" />
    }
  ], []);

  // Permissions disponibles par catégorie
  const availablePermissions = useMemo(() => ({
    doleances: {
      label: 'Doléances',
      icon: <DocumentTextIcon className="h-4 w-4" />,
      permissions: [
        { key: 'create', label: 'Créer des doléances', roles: ['agent_central', 'agent', 'chef_service', 'directeur'] },
        { key: 'view_all', label: 'Voir toutes les doléances', roles: ['administrateur_systeme', 'maire', 'agent_central', 'directeur', 'chef_service'] },
        { key: 'view_own', label: 'Voir ses propres doléances', roles: ['agent', 'citoyen'] },
        { key: 'transfer', label: 'Transférer aux directions', roles: ['agent_central'] },
        { key: 'assign', label: 'Assigner aux agents', roles: ['directeur', 'chef_service', 'agent_central'] },
        { key: 'respond', label: 'Répondre aux citoyens', roles: ['maire', 'agent', 'chef_service', 'directeur'] },
        { key: 'delete', label: 'Supprimer les doléances unitiles', roles: ['agent_central', 'administrateur_systeme'] },
        { key: 'update_status', label: 'Changer le statut', roles: ['agent', 'chef_service', 'directeur', 'agent_central'] },
        { key: 'validate', label: 'Valider les résolutions', roles: ['maire', 'directeur', 'secretaire_general'] },
        { key: 'stats_view', label: 'Voir les statistiques', roles: ['administrateur_systeme', 'maire', 'directeur', 'secretaire_general'] }
      ]
    },
    users: {
      label: 'Utilisateurs',
      icon: <UsersIcon className="h-4 w-4" />,
      permissions: [
        { key: 'create', label: 'Créer des utilisateurs', roles: ['administrateur_systeme'] },
        { key: 'view', label: 'Voir les utilisateurs', roles: ['administrateur_systeme', 'directeur'] },
        { key: 'update', label: 'Modifier les utilisateurs', roles: ['administrateur_systeme'] },
        { key: 'delete', label: 'Supprimer les utilisateurs', roles: ['administrateur_systeme'] },
        { key: 'manage_roles', label: 'Gérer les rôles', roles: ['administrateur_systeme'] },
        { key: 'view_agents', label: 'Voir les agents', roles: ['directeur', 'chef_service', 'agent_central'] }
      ]
    },
    profile: {
      label: 'Profil',
      icon: <UserCircleIcon className="h-4 w-4" />,
      permissions: [
        { key: 'view', label: 'Voir son profil', roles: ['*'] },
        { key: 'edit', label: 'Modifier son profil', roles: ['*'] },
        { key: 'change_password', label: 'Changer son mot de passe', roles: ['*'] }
      ]
    },
    directions: {
      label: 'Directions',
      icon: <BuildingOfficeIcon className="h-4 w-4" />,
      permissions: [
        { key: 'manage_direction', label: 'Gérer sa direction', roles: ['directeur'] },
        { key: 'manage_service', label: 'Gérer son service', roles: ['chef_service'] },
        { key: 'view_team', label: 'Voir son équipe', roles: ['directeur', 'chef_service'] }
      ]
    },
    rapports: {
      label: 'Rapports',
      icon: <ChartBarIcon className="h-4 w-4" />,
      permissions: [
        { key: 'generate', label: 'Générer des rapports', roles: ['administrateur_systeme', 'maire', 'directeur', 'secretaire_general'] },
        { key: 'export', label: 'Exporter les données', roles: ['administrateur_systeme', 'directeur'] }
      ]
    }
  }), []);

  // Fonctions avec useCallback
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setUsers([]);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        await createDefaultRoles();
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
      await createDefaultRoles();
    } finally {
      setLoading(false);
    }
  }, []);

  const createDefaultRoles = useCallback(async () => {
    try {
      for (const roleDef of rolesDefinition) {
        const defaultPermissions = {};
        
        Object.entries(availablePermissions).forEach(([category, data]) => {
          const perms = data.permissions
            .filter(p => p.roles.includes('*') || p.roles.includes(roleDef.nom))
            .map(p => p.key);
          if (perms.length > 0) {
            defaultPermissions[category] = perms;
          }
        });
        
        await api.post('/roles', {
          nom_role: roleDef.nom,
          description: roleDef.description,
          permissions: defaultPermissions
        });
      }
      await fetchRoles();
    } catch (error) {
      console.error('Erreur création rôles par défaut:', error);
    }
  }, [rolesDefinition, availablePermissions, fetchRoles]);

  // useEffect pour charger les données au montage
  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, [fetchRoles, fetchUsers]);

  // Fonctions de gestion avec useCallback
  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      nom_role: '',
      description: '',
      permissions: {}
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.nom_role) {
      toast.error('Le nom du rôle est requis');
      return;
    }
    
    setLoading(true);
    
    try {
      if (editingRole) {
        const response = await api.put(`/roles/${editingRole.id_role}`, formData);
        if (response.data.success) {
          toast.success('Rôle modifié avec succès');
          await fetchRoles();
          closeModal();
        } else {
          toast.error(response.data.message || 'Erreur lors de la modification');
        }
      } else {
        const response = await api.post('/roles', formData);
        if (response.data.success) {
          toast.success('Rôle créé avec succès');
          await fetchRoles();
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
  }, [formData, editingRole, fetchRoles, closeModal]);

  const confirmDelete = useCallback((role) => {
    const systemRoles = ['administrateur_systeme', 'maire', 'agent_central', 'directeur', 'chef_service', 'agent', 'secretaire_general'];
    if (systemRoles.includes(role.nom_role)) {
      toast.error('Impossible de supprimer un rôle système essentiel');
      return;
    }
    
    setRoleToDelete(role);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!roleToDelete) return;
    
    try {
      const response = await api.delete(`/roles/${roleToDelete.id_role}`);
      if (response.data.success) {
        toast.success(`Rôle "${roleToDelete.nom_role}" supprimé avec succès`);
        await fetchRoles();
      } else {
        toast.error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setShowDeleteConfirm(false);
      setRoleToDelete(null);
    }
  }, [roleToDelete, fetchRoles]);

  const handleEdit = useCallback((role) => {
    setEditingRole(role);
    let permissions = {};
    if (role.permissions) {
      if (typeof role.permissions === 'string') {
        try {
          permissions = JSON.parse(role.permissions);
        } catch (e) {
          permissions = {};
        }
      } else {
        permissions = role.permissions;
      }
    }
    
    setFormData({
      nom_role: role.nom_role,
      description: role.description || '',
      permissions: permissions
    });
    setShowModal(true);
  }, []);

  const togglePermission = useCallback((category, permissionKey) => {
    setFormData(prev => {
      const currentPermissions = Array.isArray(prev.permissions[category]) ? prev.permissions[category] : [];
      const newPermissions = currentPermissions.includes(permissionKey)
        ? currentPermissions.filter(p => p !== permissionKey)
        : [...currentPermissions, permissionKey];
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [category]: newPermissions
        }
      };
    });
  }, []);

  const hasPermission = useCallback((category, permissionKey) => {
    const perms = formData.permissions[category];
    return Array.isArray(perms) && perms.includes(permissionKey);
  }, [formData.permissions]);

  // Fonctions utilitaires avec useCallback
  const getRoleBadge = useCallback((roleName) => {
    const colors = {
      administrateur_systeme: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      maire: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      agent_central: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      directeur: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      chef_service: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      agent: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      secretaire_general: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      responsable_arrondissement: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      agent_terrain: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      superviseur: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      consultant: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }, []);

  const getRoleIcon = useCallback((roleName) => {
    const role = rolesDefinition.find(r => r.nom === roleName);
    return role?.icon || <KeyIcon className="h-5 w-5" />;
  }, [rolesDefinition]);

  const getRoleLabel = useCallback((roleName) => {
    const role = rolesDefinition.find(r => r.nom === roleName);
    return role?.label || roleName;
  }, [rolesDefinition]);

  const renderPermissions = useCallback((permissions) => {
    if (!permissions) return [];
    
    let permsObj = permissions;
    if (typeof permissions === 'string') {
      try {
        permsObj = JSON.parse(permissions);
      } catch (e) {
        return [];
      }
    }
    
    const items = [];
    for (const [cat, perms] of Object.entries(permsObj)) {
      if (Array.isArray(perms)) {
        perms.forEach(perm => {
          items.push({ category: cat, permission: perm });
        });
      }
    }
    return items;
  }, []);

  const getRoleStats = useCallback(() => {
    const stats = {};
    users.forEach(u => {
      const role = u.role_nom || u.nom_role;
      if (role) {
        stats[role] = (stats[role] || 0) + 1;
      }
    });
    return stats;
  }, [users]);

  // Calcul des statistiques avec useMemo
  const roleStats = useMemo(() => getRoleStats(), [getRoleStats]);
  const totalAgents = useMemo(() => users.filter(u => u.role_nom !== 'citoyen').length, [users]);

  // Rediriger si ce n'est pas le super admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Cette page est réservée à l'administrateur système.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des rôles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les rôles et permissions des utilisateurs selon l'organigramme</p>
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
          <span className="hidden sm:inline">Nouveau rôle</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <UserGroupIcon className="h-6 w-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{roles.length}</p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total des rôles</p>
        </div>
        <div className="stat-card">
          <ShieldCheckIcon className="h-6 w-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {roles.filter(r => r.nom_role === 'administrateur_systeme').length}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Administrateurs système</p>
        </div>
        <div className="stat-card">
          <UserIcon className="h-6 w-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAgents}</p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total des agents</p>
        </div>
        <div className="stat-card">
          <UserPlusIcon className="h-6 w-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.actif === 1 && u.role_nom !== 'citoyen').length}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Agents actifs</p>
        </div>
      </div>

      {/* Liste des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const roleDef = rolesDefinition.find(r => r.nom === role.nom_role);
          const permissionItems = renderPermissions(role.permissions);
          const agentCount = roleStats[role.nom_role] || 0;

          return (
            <div key={role.id_role} className="card-hover">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                      {getRoleIcon(role.nom_role)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{getRoleLabel(role.nom_role)}</h3>
                      <span className={`badge ${getRoleBadge(role.nom_role)} mt-0.5`}>
                        {role.nom_role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(role)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {!['administrateur_systeme', 'maire', 'agent_central', 'directeur', 'chef_service', 'agent', 'secretaire_general'].includes(role.nom_role) && (
                      <button
                        onClick={() => confirmDelete(role)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {roleDef?.description || role.description || 'Description non définie'}
                </p>

                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <UserIcon className="h-4 w-4" />
                  <span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{agentCount}</span> agent{agentCount > 1 ? 's' : ''} avec ce rôle
                  </span>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Permissions :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {permissionItems.length > 0 ? (
                      permissionItems.slice(0, 4).map((item, idx) => (
                        <span key={idx} className="badge bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300">
                          {item.permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Aucune permission</span>
                    )}
                    {permissionItems.length > 4 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">+{permissionItems.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom max-w-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-800 flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 rounded-t-xl">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                {editingRole ? 'Modifier le rôle' : 'Ajouter un rôle'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="label">Nom du rôle *</label>
                  <input
                    type="text"
                    value={formData.nom_role}
                    onChange={(e) => setFormData({...formData, nom_role: e.target.value})}
                    className="input"
                    placeholder="ex: agent_qualifie"
                    required
                    disabled={editingRole && ['administrateur_systeme', 'maire', 'agent_central', 'directeur', 'chef_service', 'agent', 'secretaire_general'].includes(editingRole.nom_role)}
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Nom technique (sans espace, en minuscules)</p>
                </div>
                
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="2"
                    className="input"
                    placeholder="Description des responsabilités du rôle..."
                  />
                </div>
                
                <div>
                  <label className="label">Permissions</label>
                  <div className="space-y-3 max-h-80 overflow-y-auto border border-gray-200 dark:border-slate-600 rounded-xl p-3">
                    {Object.entries(availablePermissions).map(([category, data]) => (
                      <div key={category} className="border-b border-gray-100 dark:border-slate-600 pb-2 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500 dark:text-gray-400">{data.icon}</span>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{data.label}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {data.permissions.map((perm) => (
                            <label key={perm.key} className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={hasPermission(category, perm.key)}
                                onChange={() => togglePermission(category, perm.key)}
                                className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-600 dark:text-gray-300">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
                <button type="button" onClick={closeModal} className="btn-secondary btn-sm">
                  Annuler
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  {editingRole ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && roleToDelete && (
        <div className="modal-overlay">
          <div className="modal-content-custom max-w-md">
            <div className="text-center p-6">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                <TrashIcon className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Confirmation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Supprimer le rôle <span className="font-semibold">{getRoleLabel(roleToDelete.nom_role)}</span> ?
              </p>
              <p className="text-xs text-red-500 mb-4">
                Les utilisateurs avec ce rôle perdront leurs permissions.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary btn-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger btn-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roles;
