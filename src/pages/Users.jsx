import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  UserPlusIcon, 
  TrashIcon, 
  PencilIcon, 
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function Users() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    id_role: '',
    id_direction: ''
  });

  // ⚠️ Seul l'administrateur système peut accéder à cette page
  const isSystemAdmin = currentUser?.role === 'administrateur_systeme';

  useEffect(() => {
    if (!isSystemAdmin) {
      toast.error('Accès non autorisé. Réservé à l\'administrateur système.');
      navigate('/backoffice/dashboard');
      return;
    }
    fetchUsers();
    fetchRoles();
    fetchDirections();
  }, [isSystemAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchDirections = async () => {
    try {
      const response = await api.get('/doleances/directions');
      setDirections(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
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
    
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id_utilisateur}`, formData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await api.post('/users', formData);
        toast.success('Utilisateur créé avec succès');
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id, userRole, userName) => {
    // Vérifier si l'utilisateur essaie de supprimer son propre compte
    if (id === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    // Vérifier si c'est le dernier administrateur système
    const systemAdminCount = users.filter(u => u.role_nom === 'administrateur_systeme').length;
    if (userRole === 'administrateur_systeme' && systemAdminCount <= 1) {
      toast.error('Impossible de supprimer le dernier administrateur système');
      return;
    }
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleActif = async (id, actif, userName) => {
    if (id === currentUser?.id) {
      toast.error('Vous ne pouvez pas modifier votre propre statut');
      return;
    }
    
    // Ne pas laisser désactiver un autre administrateur système
    const userToToggle = users.find(u => u.id_utilisateur === id);
    if (userToToggle?.role_nom === 'administrateur_systeme') {
      toast.error('Vous ne pouvez pas modifier le statut d\'un autre administrateur système');
      return;
    }
    
    try {
      await api.patch(`/users/${id}/toggle`, { actif: !actif });
      toast.success(`Utilisateur ${!actif ? 'activé' : 'désactivé'} avec succès`);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleEdit = (user) => {
    // Ne pas permettre la modification d'un autre administrateur système
    if (user.role_nom === 'administrateur_systeme' && user.id_utilisateur !== currentUser?.id) {
      toast.error('Vous ne pouvez pas modifier un autre administrateur système');
      return;
    }
    
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

  const resetForm = () => {
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

  const getRoleBadge = (role) => {
    const colors = {
      administrateur_systeme: 'bg-purple-700 text-white',
      administrateur: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      directeur: 'bg-green-100 text-green-800',
      maire: 'bg-red-100 text-red-800',
      secretaire_general: 'bg-indigo-100 text-indigo-800',
      chef_service: 'bg-cyan-100 text-cyan-800',
      agent_central: 'bg-orange-100 text-orange-800',
      responsable_arrondissement: 'bg-teal-100 text-teal-800',
      citoyen: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    const icons = {
      administrateur_systeme: '👑',
      administrateur: '👑',
      agent: '👨‍💼',
      directeur: '📊',
      maire: '🏛️',
      secretaire_general: '📋',
      chef_service: '⭐',
      agent_central: '🔄',
      responsable_arrondissement: '📍',
      citoyen: '👤'
    };
    return icons[role] || '👤';
  };

  // 🔒 Redirection si l'utilisateur n'est pas administrateur système
  if (!isSystemAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <ShieldCheckIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-4">
            Cette page est réservée exclusivement à l'<strong className="text-red-600">Administrateur Système</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Votre rôle actuel : <span className="font-semibold">{currentUser?.role || 'Non connecté'}</span>
          </p>
          <button 
            onClick={() => navigate('/backoffice/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold text-purple-700">Administrateur Système</span> - Gestion complète des comptes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <UserPlusIcon className="h-5 w-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Total utilisateurs</p>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Administrateurs Système</p>
          <p className="text-2xl font-bold text-purple-700">
            {users.filter(u => u.role_nom === 'administrateur_systeme').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Administrateurs</p>
          <p className="text-2xl font-bold text-purple-400">
            {users.filter(u => u.role_nom === 'administrateur').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Utilisateurs actifs</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.actif === 1).length}
          </p>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.filter(u => u.role_nom !== 'citoyen').map((user) => (
                <tr key={user.id_utilisateur} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        user.role_nom === 'administrateur_systeme' ? 'bg-purple-700' : 'bg-gray-200'
                      }`}>
                        <span className={user.role_nom === 'administrateur_systeme' ? 'text-white text-lg' : 'text-lg'}>
                          {getRoleIcon(user.role_nom)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.prenom} {user.nom}
                          {user.role_nom === 'administrateur_systeme' && (
                            <span className="ml-2 text-xs text-purple-600 font-semibold">(Système)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.telephone || 'Pas de téléphone'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role_nom)}`}>
                      {getRoleIcon(user.role_nom)} {user.role_nom}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.nom_direction || '-'}
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
                      disabled={user.role_nom === 'administrateur_systeme' && user.id_utilisateur !== currentUser?.id}
                    >
                      {user.actif ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Modifier"
                      disabled={user.role_nom === 'administrateur_systeme' && user.id_utilisateur !== currentUser?.id}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {user.id_utilisateur !== currentUser?.id && user.role_nom !== 'administrateur_systeme' && (
                      <button
                        onClick={() => handleDelete(user.id_utilisateur, user.role_nom, `${user.prenom} ${user.nom}`)}
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

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Prénom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {!editingUser && (
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mot de passe"
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
                )}
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={formData.id_role}
                  onChange={(e) => setFormData({...formData, id_role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  {roles.filter(r => r.nom_role !== 'citoyen').map(role => (
                    <option key={role.id_role} value={role.id_role}>
                      {getRoleIcon(role.nom_role)} {role.nom_role}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.id_direction}
                  onChange={(e) => setFormData({...formData, id_direction: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une direction</option>
                  {directions.map(dir => (
                    <option key={dir.id_direction} value={dir.id_direction}>
                      {dir.nom_direction}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  {editingUser ? 'Modifier' : 'Ajouter'}
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