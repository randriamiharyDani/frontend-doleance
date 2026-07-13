import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  UserCircleIcon,
  CalendarIcon,
  DocumentIcon,
  ClockIcon,
  BuildingOfficeIcon,
  TagIcon,
  FlagIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

function DoleanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doleance, setDoleance] = useState(null);
  const [reponse, setReponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newStatut, setNewStatut] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  
  useEffect(() => {
    fetchDoleance();
  }, [id]);
  
  const fetchDoleance = async () => {
    try {
      const response = await api.get(`/doleances/${id}`);
      setDoleance(response.data);
      setNewStatut(response.data.id_statut);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement de la doléance');
      navigate('/doleances');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReponse = async (e) => {
    e.preventDefault();
    if (!reponse.trim()) {
      toast.error('Veuillez écrire une réponse');
      return;
    }
    
    setSending(true);
    try {
      await api.post(`/doleances/${id}/reponses`, { message: reponse });
      toast.success('Réponse ajoutée avec succès');
      setReponse('');
      fetchDoleance();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSending(false);
    }
  };
  
  const handleStatutChange = async () => {
    if (newStatut === doleance.id_statut) return;
    
    try {
      await api.put(`/doleances/${id}/statut`, { id_statut: newStatut });
      toast.success('Statut mis à jour avec succès');
      fetchDoleance();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!doleance) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Doléance non trouvée</p>
        <button onClick={() => navigate('/doleances')} className="btn-primary mt-4">
          Retour aux doléances
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <button
        onClick={() => navigate('/doleances')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Retour à la liste
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête */}
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{doleance.reference}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    doleance.niveau === 4 ? 'bg-red-100 text-red-800' :
                    doleance.niveau === 3 ? 'bg-orange-100 text-orange-800' :
                    doleance.niveau === 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {doleance.nom_priorite}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{doleance.titre}</h1>
              </div>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: doleance.statut_couleur }}
              >
                {doleance.nom_statut}
              </span>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{doleance.description}</p>
            </div>

            {/* Photos / Pièces jointes */}
            {doleance.pieces_jointes && doleance.pieces_jointes.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5 text-blue-600" />
                  Photos du problème ({doleance.pieces_jointes.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {doleance.pieces_jointes.map((piece, index) => (
                    <div
                      key={index}
                      onClick={() => setLightboxImage(piece.url)}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all duration-200"
                    >
                      <img
                        src={piece.url}
                        alt={piece.nom_fichier}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-[10px] font-medium text-gray-700 truncate">{piece.nom_fichier}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t text-sm">
              <div className="flex items-center text-gray-500">
                <TagIcon className="h-4 w-4 mr-2" />
                {doleance.nom_categorie}
              </div>
              <div className="flex items-center text-gray-500">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                {doleance.nom_direction}
              </div>
              <div className="flex items-center text-gray-500">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {new Date(doleance.date_creation).toLocaleDateString('fr-FR')}
              </div>
              {doleance.nom_quartier && (
                <div className="flex items-center text-gray-500">
                  <FlagIcon className="h-4 w-4 mr-2" />
                  {doleance.nom_quartier}
                </div>
              )}
            </div>
          </div>
          
          {/* Réponses */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Historique des échanges</h3>
            
            {doleance.reponses && doleance.reponses.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                {doleance.reponses.map((rep) => (
                  <div key={rep.id_reponse} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">
                          {rep.prenom} {rep.nom}
                          <span className="ml-2 text-xs text-gray-400">
                            Agent
                          </span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(rep.date_reponse).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-gray-700">{rep.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune réponse pour le moment</p>
            )}
            
            {/* Formulaire de réponse pour les agents */}
            {(user?.role === 'agent' || user?.role === 'directeur' || user?.role === 'administrateur') && (
              <form onSubmit={handleReponse} className="mt-4 pt-4 border-t">
                <label className="label">Ajouter une réponse</label>
                <textarea
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  placeholder="Écrire une réponse..."
                  rows="3"
                  className="input"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-2 btn-primary flex items-center"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  {sending ? 'Envoi...' : 'Répondre'}
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations citoyen */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Citoyen</h3>
            <div className="space-y-2">
              <p>
                <span className="text-gray-500">Nom complet:</span>
                <span className="ml-2 font-medium">
                  {doleance.citoyen_prenom} {doleance.citoyen_nom}
                </span>
              </p>
              {doleance.citoyen_email && (
                <p>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 text-sm">{doleance.citoyen_email}</span>
                </p>
              )}
              {doleance.citoyen_telephone && (
                <p>
                  <span className="text-gray-500">Téléphone:</span>
                  <span className="ml-2">{doleance.citoyen_telephone}</span>
                </p>
              )}
              {doleance.citoyen_adresse && (
                <p>
                  <span className="text-gray-500">Adresse:</span>
                  <span className="ml-2 text-sm">{doleance.citoyen_adresse}</span>
                </p>
              )}
            </div>
          </div>
          
          {/* Changement de statut pour les agents */}
          {(user?.role === 'agent' || user?.role === 'directeur' || user?.role === 'administrateur') && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <label className="label">Changer le statut</label>
                <select
                  value={newStatut}
                  onChange={(e) => setNewStatut(e.target.value)}
                  className="input mb-3"
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="2">En attente</option>
                  <option value="3">Assignée</option>
                  <option value="4">En traitement</option>
                  <option value="5">Résolue</option>
                  <option value="6">Clôturée</option>
                </select>
                <button
                  onClick={handleStatutChange}
                  disabled={newStatut === doleance.id_statut}
                  className="btn-primary w-full"
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          )}
          
          {/* Historique des statuts */}
          {doleance.historique_statuts && doleance.historique_statuts.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Historique</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {doleance.historique_statuts.map((hist) => (
                  <div key={hist.id_historique} className="flex items-start gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>
                        {hist.ancien_statut || 'Création'} → {hist.nouveau_statut}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(hist.date_changement).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox image */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={lightboxImage}
              alt="Aperçu"
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoleanceDetail;