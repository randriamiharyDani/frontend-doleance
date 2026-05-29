import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UserCircleIcon } from '@heroicons/react/24/outline';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  });
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
      setFormData({
        nom: response.data.nom || '',
        prenom: response.data.prenom || '',
        email: response.data.email || '',
        telephone: response.data.telephone || ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${user.id}`, formData);
      toast.success('Profil mis à jour avec succès');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mon profil</h1>
        <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte de profil */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <UserCircleIcon className="h-32 w-32 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {profile?.prenom} {profile?.nom}
            </h2>
            <p className="text-gray-500 capitalize mt-1">{profile?.role}</p>
            {profile?.direction && (
              <p className="text-sm text-gray-500 mt-2">Direction: {profile.direction}</p>
            )}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Membre depuis le {new Date(profile?.date_creation).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Formulaire d'édition */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Informations personnelles</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Modifier
                </button>
              )}
            </div>
            
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Téléphone</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">{profile?.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prénom</p>
                    <p className="font-medium">{profile?.prenom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{profile?.telephone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;