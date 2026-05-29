import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  KeyIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState({
    info: false,
    password: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || ''
      });
    }
  }, [user]);

  const handleInfoChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/auth/profile', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone
      });
      
      if (response.data.success) {
        toast.success('Informations mises à jour avec succès');
        // Mettre à jour l'utilisateur dans le contexte
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Recharger la page pour mettre à jour le contexte
        window.location.reload();
      } else {
        toast.error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
      setEditMode({ ...editMode, info: false });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Mot de passe modifié avec succès');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setEditMode({ ...editMode, password: false });
      } else {
        toast.error(response.data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      administrateur: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      directeur: 'bg-green-100 text-green-800',
      maire: 'bg-red-100 text-red-800',
      citoyen: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'administrateur': return '👑';
      case 'agent': return '👨‍💼';
      case 'directeur': return '📊';
      case 'maire': return '🏛️';
      default: return '👤';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Mon profil</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte de profil */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {user?.prenom} {user?.nom}
            </h2>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user?.role)}`}>
                {getRoleIcon(user?.role)} {user?.role}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Membre depuis le {new Date(user?.date_creation).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Informations personnelles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Informations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5 text-blue-600" />
                Informations personnelles
              </h2>
              {!editMode.info && (
                <button
                  onClick={() => setEditMode({ ...editMode, info: true })}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                >
                  <PencilIcon className="h-4 w-4" />
                  Modifier
                </button>
              )}
            </div>
            
            {editMode.info ? (
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditMode({ ...editMode, info: false })}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium">{user?.prenom} {user?.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rôle</p>
                    <p className="font-medium capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{user?.telephone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Section Changement de mot de passe */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <KeyIcon className="h-5 w-5 text-blue-600" />
                Sécurité
              </h2>
              {!editMode.password && (
                <button
                  onClick={() => setEditMode({ ...editMode, password: true })}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                >
                  <PencilIcon className="h-4 w-4" />
                  Changer le mot de passe
                </button>
              )}
            </div>
            
            {editMode.password ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode({ ...editMode, password: false });
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Changement...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  Pour des raisons de sécurité, votre mot de passe n'est pas affiché.
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Cliquez sur "Changer le mot de passe" pour le modifier.
                </p>
              </div>
            )}
          </div>
          
          {/* Informations sur la direction (si applicable) */}
          {user?.direction && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                Direction
              </h2>
              <p className="text-gray-700">{user.direction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;