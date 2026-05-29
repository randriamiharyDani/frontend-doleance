import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';
import { 
  DocumentTextIcon, 
  ClipboardDocumentIcon, 
  ListBulletIcon,
  EyeIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';

function DeposerDoleance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [arrondissements, setArrondissements] = useState([]);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showReferencesList, setShowReferencesList] = useState(false);
  const [savedReference, setSavedReference] = useState('');
  const [referencesList, setReferencesList] = useState([]);
  const [referencesLoading, setReferencesLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Informations personnelles
    nom_citoyen: '',
    prenom_citoyen: '',
    telephone_citoyen: '',
    adresse_citoyen: '',
    lot: '',
    fokontany: '',
    arrondissement: '',
    
    // Détails de la doléance
    titre: '',
    description: '',
    id_categorie: '',
    id_quartier: '',
    lieu_exact: '',
    suggestions: ''
  });
  
  useEffect(() => {
    fetchData();
    fetchReferences();
  }, []);
  
  const fetchData = async () => {
    try {
      const [categoriesRes, quartiersRes] = await Promise.all([
        api.get('/doleances/categories'),
        api.get('/doleances/quartiers')
      ]);
      
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setQuartiers(quartiersRes.data?.data || quartiersRes.data || []);
      
      // Données statiques pour Antananarivo
      setArrondissements([
        '1er Arrondissement (Antananarivo-Renivohitra)',
        '2ème Arrondissement (Antananarivo-Atsimondrano)',
        '3ème Arrondissement (Antananarivo-Avaradrano)',
        '4ème Arrondissement (Antananarivo-Ouest)',
        '5ème Arrondissement (Antananarivo-Sud)',
        '6ème Arrondissement (Antananarivo-Est)'
      ]);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };
  
  const fetchReferences = async () => {
    setReferencesLoading(true);
    try {
      const response = await api.get('/doleances/public?limit=10');
      if (response.data.success) {
        const doleances = response.data.data.doleances || [];
        const refs = doleances.map(d => ({
          reference: d.reference,
          titre: d.titre,
          date: d.date_creation,
          statut: d.nom_statut
        }));
        setReferencesList(refs);
      }
    } catch (error) {
      console.error('Erreur chargement références:', error);
    } finally {
      setReferencesLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Référence copiée dans le presse-papiers !');
    } catch (err) {
      console.error('Erreur de copie:', err);
      toast.error('Impossible de copier la référence');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom_citoyen || !formData.prenom_citoyen || !formData.telephone_citoyen || !formData.titre || !formData.description || !formData.id_categorie) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setLoading(true);
    
    try {
      // Construction de l'adresse complète
      const adresseComplete = `${formData.adresse_citoyen || ''}${formData.lot ? `, Lot ${formData.lot}` : ''}${formData.fokontany ? `, Fokontany ${formData.fokontany}` : ''}${formData.arrondissement ? `, ${formData.arrondissement}` : ''}`;
      
      const dataToSend = {
        ...formData,
        adresse_citoyen: adresseComplete,
        email_citoyen: null, // Pas d'email requis
        description: `${formData.description}\n\nLieu exact: ${formData.lieu_exact || 'Non précisé'}\nSuggestions: ${formData.suggestions || 'Aucune suggestion'}`
      };
      
      const response = await api.post('/doleances', dataToSend);
      const reference = response.data.data?.reference || response.data.reference;
      
      setSavedReference(reference);
      fetchReferences();
      
      toast.success(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="font-bold">✅ Doléance déposée avec succès !</div>
            <div className="text-sm">Votre référence : <span className="font-mono font-bold">{reference}</span></div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  copyToClipboard(reference);
                  toast.dismiss(t.id);
                }}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Copier
              </button>
              <button
                onClick={() => {
                  navigate(`/suivi-doleance/${reference}`);
                  toast.dismiss(t.id);
                }}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Suivre
              </button>
            </div>
          </div>
        ),
        { duration: 10000 }
      );
      
      setShowReferenceModal(true);
      
      setTimeout(() => {
        if (showReferenceModal) {
          setShowReferenceModal(false);
          navigate(`/suivi-doleance/${reference}`);
        }
      }, 5000);
      
      setFormData({
        nom_citoyen: '',
        prenom_citoyen: '',
        telephone_citoyen: '',
        adresse_citoyen: '',
        lot: '',
        fokontany: '',
        arrondissement: '',
        titre: '',
        description: '',
        id_categorie: '',
        id_quartier: '',
        lieu_exact: '',
        suggestions: ''
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du dépôt');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseModal = () => {
    setShowReferenceModal(false);
    if (savedReference) {
      navigate(`/suivi-doleance/${savedReference}`);
    }
  };
  
  const handleCopyAndContinue = () => {
    copyToClipboard(savedReference);
  };
  
  const handleViewReference = (reference) => {
    navigate(`/suivi-doleance/${reference}`);
    setShowReferencesList(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Déposer une doléance</h1>
          <p className="text-gray-600 mt-2">Commune Urbaine d'Antananarivo</p>
        </div>
        
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowReferencesList(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ListBulletIcon className="h-5 w-5" />
            Voir mes références
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section Vos informations */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
                Vos informations
              </h2>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="nom_citoyen" 
                value={formData.nom_citoyen} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                placeholder="Votre nom"
                required 
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="prenom_citoyen" 
                value={formData.prenom_citoyen} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                placeholder="Votre prénom"
                required 
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel" 
                name="telephone_citoyen" 
                value={formData.telephone_citoyen} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                placeholder="034 12 345 67"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Adresse (Logement / Lieu-dit) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="adresse_citoyen" 
                value={formData.adresse_citoyen} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                placeholder="Lot II M... Ankatso"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Lot
              </label>
              <input 
                type="text" 
                name="lot" 
                value={formData.lot} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                placeholder="Lot II M 123"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Fokontany <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="fokontany" 
                value={formData.fokontany} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                placeholder="Ex: Ambohidahy, Analakely, Isotry..."
                required
              />
              <p className="text-xs text-gray-400 mt-1">Saisissez manuellement le nom de votre Fokontany</p>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Arrondissement
              </label>
              <select
                name="arrondissement"
                value={formData.arrondissement}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Sélectionnez votre arrondissement</option>
                {arrondissements.map(arr => (
                  <option key={arr} value={arr}>{arr}</option>
                ))}
              </select>
            </div>
            
            {/* Section Détails de la doléance */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                Détails de la doléance
              </h2>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Objet / Titre <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="titre" 
                value={formData.titre} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                placeholder="Ex: Dysfonctionnements dans le quartier..."
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description détaillée <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                rows="6" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Décrivez votre problème en détail (gestion des déchets, voirie, éclairage, sécurité...)" 
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Lieu exact du problème
              </label>
              <input 
                type="text" 
                name="lieu_exact" 
                value={formData.lieu_exact} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                placeholder="Ex: Rue X, entre Y et Z"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Suggestions / Actions souhaitées
              </label>
              <textarea 
                name="suggestions" 
                value={formData.suggestions} 
                onChange={handleChange}
                rows="3" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Ex: Curer les canaux, renforcer la collecte des déchets, réparer les lampadaires..."
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select 
                name="id_categorie" 
                value={formData.id_categorie} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>
                    {cat.nom_categorie}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quartier
              </label>
              <select 
                name="id_quartier" 
                value={formData.id_quartier} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
          
          <div className="mt-8 flex justify-center">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                'Déposer la doléance'
              )}
            </button>
          </div>
        </form>
      </main>
      
      {/* Modal de confirmation */}
      {showReferenceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Doléance déposée avec succès !</h3>
              <p className="text-sm text-gray-500 mb-4">
                Votre doléance a bien été enregistrée. Voici votre numéro de référence unique :
              </p>
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <code className="text-lg font-mono font-bold text-blue-600">{savedReference}</code>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Conservez précieusement cette référence. Elle vous permettra de suivre l'évolution de votre doléance.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopyAndContinue}
                  className="inline-flex justify-center items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                  Copier la référence
                </button>
                <button
                  onClick={handleCloseModal}
                  className="inline-flex justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Suivre ma doléance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal des références */}
      {showReferencesList && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mes références de doléances</h3>
              <button
                onClick={() => setShowReferencesList(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Liste des doléances que vous avez récemment déposées
            </p>
            
            {referencesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : referencesList.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aucune doléance trouvée</p>
                <p className="text-sm text-gray-400">Déposez votre première doléance !</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {referencesList.map((ref, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold text-blue-600">
                          {ref.reference}
                        </code>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          ref.statut === 'Résolue' ? 'bg-green-100 text-green-800' :
                          ref.statut === 'Clôturée' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ref.statut || 'En cours'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 truncate">{ref.titre}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(ref.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(ref.reference)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Copier la référence"
                      >
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleViewReference(ref.reference)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Voir le suivi"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowReferencesList(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <PublicFooter />
    </div>
  );
}

export default DeposerDoleance;