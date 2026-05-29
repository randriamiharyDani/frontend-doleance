import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function NouvelleDoleance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [priorites, setPriorites] = useState([]);
  const [directions, setDirections] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  
  const [formData, setFormData] = useState({
    nom_citoyen: '',
    prenom_citoyen: '',
    email_citoyen: '',
    telephone_citoyen: '',
    adresse_citoyen: '',
    titre: '',
    description: '',
    id_categorie: '',
    id_priorite: '',
    id_direction: '',
    id_quartier: ''
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [categoriesRes, prioritesRes, directionsRes, quartiersRes] = await Promise.all([
        api.get('/doleances/categories'),
        api.get('/doleances/priorites'),
        api.get('/doleances/directions'),
        api.get('/doleances/quartiers')
      ]);
      
      setCategories(categoriesRes.data || []);
      setPriorites(prioritesRes.data || []);
      setDirections(directionsRes.data || []);
      setQuartiers(quartiersRes.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
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
    
    // Validation
    if (!formData.nom_citoyen || !formData.prenom_citoyen || !formData.titre || !formData.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/doleances', formData);
      toast.success(`Doléance créée avec succès ! Référence: ${response.data.reference}`);
      navigate('/doleances');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nouvelle doléance</h1>
        <p className="text-gray-600 mt-1">Remplissez le formulaire pour déposer une doléance</p>
      </div>
      
      <form onSubmit={handleSubmit} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section citoyen */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informations du citoyen</h2>
          </div>
          
          <div>
            <label className="label">Nom *</label>
            <input
              type="text"
              name="nom_citoyen"
              value={formData.nom_citoyen}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="label">Prénom *</label>
            <input
              type="text"
              name="prenom_citoyen"
              value={formData.prenom_citoyen}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email_citoyen"
              value={formData.email_citoyen}
              onChange={handleChange}
              className="input"
              placeholder="exemple@email.com"
            />
          </div>
          
          <div>
            <label className="label">Téléphone</label>
            <input
              type="tel"
              name="telephone_citoyen"
              value={formData.telephone_citoyen}
              onChange={handleChange}
              className="input"
              placeholder="0612345678"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="label">Adresse</label>
            <input
              type="text"
              name="adresse_citoyen"
              value={formData.adresse_citoyen}
              onChange={handleChange}
              className="input"
              placeholder="Numéro et nom de rue"
            />
          </div>
          
          {/* Section doléance */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Détails de la doléance</h2>
          </div>
          
          <div className="md:col-span-2">
            <label className="label">Titre *</label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              className="input"
              placeholder="Résumez votre doléance en quelques mots"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className="input"
              placeholder="Décrivez votre problème en détail..."
              required
            ></textarea>
          </div>
          
          <div>
            <label className="label">Catégorie *</label>
            <select
              name="id_categorie"
              value={formData.id_categorie}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id_categorie} value={cat.id_categorie}>
                  {cat.nom_categorie} - {cat.description}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Priorité *</label>
            <select
              name="id_priorite"
              value={formData.id_priorite}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Sélectionnez une priorité</option>
              {priorites.map(prio => (
                <option key={prio.id_priorite} value={prio.id_priorite}>
                  {prio.nom_priorite} (Niveau {prio.niveau})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Direction *</label>
            <select
              name="id_direction"
              value={formData.id_direction}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Sélectionnez une direction</option>
              {directions.map(dir => (
                <option key={dir.id_direction} value={dir.id_direction}>
                  {dir.nom_direction}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Quartier</label>
            <select
              name="id_quartier"
              value={formData.id_quartier}
              onChange={handleChange}
              className="input"
            >
              <option value="">Sélectionnez un quartier</option>
              {quartiers.map(quartier => (
                <option key={quartier.id_quartier} value={quartier.id_quartier}>
                  {quartier.nom_quartier}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/doleances')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer la doléance'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NouvelleDoleance;