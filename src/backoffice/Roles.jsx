import React, { useState, useEffect } from 'react';
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
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

function Roles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
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

  // Liste des rôles disponibles dans l'organigramme
  const rolesDefinition = [
    { 
      id: 1, 
      nom: 'administrateur_systeme', 
      label: 'Administrateur Système', 
      description: 'Gère tout le système - Création/modification/suppression des utilisateurs et rôles',
      level: 7,
      icon: '👑'
    },
    { 
      id: 2, 
      nom: 'maire', 
      label: 'Maire', 
      description: 'Peut répondre aux doléances, valider les décisions importantes',
      level: 6,
      icon: '🏛️'
    },
    { 
      id: 3, 
      nom: 'agent_central', 
      label: 'Agent Central', 
      description: 'Reçoit toutes les doléances, les transfère aux directions concernées, peut supprimer les doléances unitiles',
      level: 5,
      icon: '🔄'
    },
    { 
      id: 4, 
      nom: 'directeur', 
      label: 'Directeur', 
      description: 'Gère une direction, supervise les chefs de service, peut assigner des doléances',
      level: 4,
      icon: '📊'
    },
    { 
      id: 5, 
      nom: 'chef_service', 
      label: 'Chef de Service', 
      description: 'Gère un service au sein d\'une direction, traite les doléances de son service',
      level: 3,
      icon: '⭐'
    },
    { 
      id: 6, 
      nom: 'agent', 
      label: 'Agent', 
      description: 'Traite les doléances qui lui sont assignées, peut répondre aux citoyens',
      level: 2,
      icon: '👨‍💼'
    },
    { 
      id: 7, 
      nom: 'secretaire_general', 
      label: 'Secrétaire Général', 
      description: 'Coordination générale entre les directions, supervision des directeurs',
      level: 5,
      icon: '📋'
    },
    { 
      id: 8, 
      nom: 'responsable_arrondissement', 
      label: 'Responsable d\'Arrondissement', 
      description: 'Gère les doléances spécifiques à un arrondissement',
      level: 3,
      icon: '📍'
    },
    { 
      id: 9, 
      nom: 'agent_terrain', 
      label: 'Agent de Terrain', 
      description: 'Intervient physiquement sur le terrain pour résoudre les problèmes',
      level: 2,
      icon: '👷'
    },
    { 
      id: 10, 
      nom: 'superviseur', 
      label: 'Superviseur', 
      description: 'Supervise plusieurs services, valide les traitements',
      level: 3,
      icon: '🎯'
    },
    { 
      id: 11, 
      nom: 'consultant', 
      label: 'Consultant', 
      description: 'Peut consulter les doléances mais pas les modifier',
      level: 1,
      icon: '👁️'
    }
  ];

  // Permissions disponibles par catégorie
  const availablePermissions = {
    doleances: {
      label: 'Doléances',
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
      permissions: [
        { key: 'view', label: 'Voir son profil', roles: ['*'] },
        { key: 'edit', label: 'Modifier son profil', roles: ['*'] },
        { key: 'change_password', label: 'Changer son mot de passe', roles: ['*'] }
      ]
    },
    directions: {
      label: 'Directions',
      permissions: [
        { key: 'manage_direction', label: 'Gérer sa direction', roles: ['directeur'] },
        { key: 'manage_service', label: 'Gérer son service', roles: ['chef_service'] },
        { key: 'view_team', label: 'Voir son équipe', roles: ['directeur', 'chef_service'] }
      ]
    },
    rapports: {
      label: 'Rapports',
      permissions: [
        { key: 'generate', label: 'Générer des rapports', roles: ['administrateur_systeme', 'maire', 'directeur', 'secretaire_general'] },
        { key: 'export', label: 'Exporter les données', roles: ['administrateur_systeme', 'directeur'] }
      ]
    }
  };

  const isSuperAdmin = user?.role === 'administrateur_systeme';

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error('Accès non autorisé. Réservé à l\'administrateur système.');
      return;
    }
    fetchRoles();
  }, [isSuperAdmin]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        // Si aucun rôle n'existe, créer les rôles par défaut
        createDefaultRoles();
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
      createDefaultRoles();
    } finally {
      setLoading(false);
    }
  };

  const createDefaultRoles = async () => {
    try {
      for (const roleDef of rolesDefinition) {
        // Définir les permissions par défaut pour chaque rôle
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
      fetchRoles();
    } catch (error) {
      console.error('Erreur création rôles par défaut:', error);
    }
  };

  const handleSubmit = async (e) => {
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
          fetchRoles();
          closeModal();
        } else {
          toast.error(response.data.message || 'Erreur lors de la modification');
        }
      } else {
        const response = await api.post('/roles', formData);
        if (response.data.success) {
          toast.success('Rôle créé avec succès');
          fetchRoles();
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

  const confirmDelete = (role) => {
    const systemRoles = ['administrateur_systeme', 'maire', 'agent_central', 'directeur', 'chef_service', 'agent', 'secretaire_general'];
    if (systemRoles.includes(role.nom_role)) {
      toast.error('Impossible de supprimer un rôle système essentiel');
      return;
    }
    
    setRoleToDelete(role);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    
    try {
      const response = await api.delete(`/roles/${roleToDelete.id_role}`);
      if (response.data.success) {
        toast.success(`Rôle "${roleToDelete.nom_role}" supprimé avec succès`);
        fetchRoles();
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
  };

  const handleEdit = (role) => {
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
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      nom_role: '',
      description: '',
      permissions: {}
    });
  };

  const togglePermission = (category, permissionKey) => {
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
  };

  const hasPermission = (category, permissionKey) => {
    const perms = formData.permissions[category];
    return Array.isArray(perms) && perms.includes(permissionKey);
  };

  const getRoleBadge = (roleName) => {
    const role = rolesDefinition.find(r => r.nom === roleName);
    const colors = {
      administrateur_systeme: 'bg-purple-100 text-purple-800',
      maire: 'bg-red-100 text-red-800',
      agent_central: 'bg-blue-100 text-blue-800',
      directeur: 'bg-green-100 text-green-800',
      chef_service: 'bg-cyan-100 text-cyan-800',
      agent: 'bg-gray-100 text-gray-800',
      secretaire_general: 'bg-indigo-100 text-indigo-800',
      responsable_arrondissement: 'bg-teal-100 text-teal-800',
      agent_terrain: 'bg-orange-100 text-orange-800',
      superviseur: 'bg-yellow-100 text-yellow-800',
      consultant: 'bg-slate-100 text-slate-800'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (roleName) => {
    const role = rolesDefinition.find(r => r.nom === roleName);
    return role?.icon || '🔑';
  };

  const getRoleLabel = (roleName) => {
    const role = rolesDefinition.find(r => r.nom === roleName);
    return role?.label || roleName;
  };

  const renderPermissions = (permissions) => {
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
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <ShieldCheckIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Cette page est réservée à l'administrateur système.</p>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des rôles</h1>
          <p className="text-gray-600 mt-1">Gérez les rôles et permissions des utilisateurs selon l'organigramme</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nouveau rôle
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{roles.length}</p>
          <p className="text-sm text-gray-500">Total des rôles</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <ShieldCheckIcon className="h-8 w-8 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            {roles.filter(r => r.nom_role === 'administrateur_systeme').length}
          </p>
          <p className="text-sm text-gray-500">Administrateurs système</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <BuildingOfficeIcon className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            {roles.filter(r => ['directeur', 'chef_service'].includes(r.nom_role)).length}
          </p>
          <p className="text-sm text-gray-500">Encadrement</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <UserCircleIcon className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            {roles.filter(r => ['agent', 'agent_terrain'].includes(r.nom_role)).length}
          </p>
          <p className="text-sm text-gray-500">Agents de terrain</p>
        </div>
      </div>

      {/* Liste des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const roleDef = rolesDefinition.find(r => r.nom === role.nom_role);
          const permissionItems = renderPermissions(role.permissions);
          
          return (
            <div key={role.id_role} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{getRoleIcon(role.nom_role)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{getRoleLabel(role.nom_role)}</h3>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getRoleBadge(role.nom_role)}`}>
                        {role.nom_role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Modifier"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {!['administrateur_systeme', 'maire', 'agent_central', 'directeur', 'chef_service', 'agent', 'secretaire_general'].includes(role.nom_role) && (
                      <button
                        onClick={() => confirmDelete(role)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {roleDef?.description || role.description || 'Description non définie'}
                </p>
                
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Permissions :</p>
                  <div className="flex flex-wrap gap-1">
                    {permissionItems.length > 0 ? (
                      permissionItems.slice(0, 5).map((item, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {item.permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Aucune permission spécifique</span>
                    )}
                    {permissionItems.length > 5 && (
                      <span className="text-xs text-gray-400">+{permissionItems.length - 5}</span>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingRole ? 'Modifier le rôle' : 'Ajouter un rôle'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom du rôle *</label>
                  <input
                    type="text"
                    value={formData.nom_role}
                    onChange={(e) => setFormData({...formData, nom_role: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: agent_qualifie"
                    required
                    disabled={editingRole && ['administrateur_systeme', 'maire', 'agent_central', 'directeur', 'chef_service', 'agent', 'secretaire_general'].includes(editingRole.nom_role)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Nom technique (sans espace, en minuscules)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Libellé du rôle</label>
                  <input
                    type="text"
                    value={formData.label || ''}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Agent Qualifié"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description des responsabilités du rôle..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3">Permissions</label>
                  <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {Object.entries(availablePermissions).map(([category, data]) => (
                      <div key={category} className="border-b pb-3 last:border-0">
                        <h4 className="font-semibold text-gray-700 mb-2">{data.label}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {data.permissions.map((perm) => (
                            <label key={perm.key} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={hasPermission(category, perm.key)}
                                onChange={() => togglePermission(category, perm.key)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-600">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingRole ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && roleToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmation de suppression</h3>
              <p className="text-sm text-gray-500 mb-4">
                Êtes-vous sûr de vouloir supprimer le rôle <span className="font-semibold">{getRoleLabel(roleToDelete.nom_role)}</span> ?
              </p>
              <p className="text-xs text-red-500 mb-4">
                Attention : Les utilisateurs avec ce rôle perdront leurs permissions.
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
    </div>
  );
}

export default Roles;