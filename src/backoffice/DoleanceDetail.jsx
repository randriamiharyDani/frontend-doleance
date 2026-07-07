import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon,
  FlagIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentDuplicateIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function DoleanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doleance, setDoleance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reponse, setReponse] = useState('');
  const [sending, setSending] = useState(false);
  const [showReponseForm, setShowReponseForm] = useState(false);
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [loadingPieces, setLoadingPieces] = useState(false);
  const [showPiecesModal, setShowPiecesModal] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);

  useEffect(() => {
    fetchDoleance();
    fetchPiecesJointes();
  }, [id]);

  const fetchDoleance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doleances/${id}`);
      if (response.data.success) {
        setDoleance(response.data.data);
      } else {
        toast.error('Doléance non trouvée');
        navigate('/backoffice/doleances');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
      navigate('/backoffice/doleances');
    } finally {
      setLoading(false);
    }
  };

  const fetchPiecesJointes = async () => {
    setLoadingPieces(true);
    try {
      const response = await api.get(`/doleances/${id}/pieces-jointes`);
      if (response.data && response.data.success) {
        setPiecesJointes(response.data.data || []);
      } else {
        setPiecesJointes([]);
      }
    } catch (error) {
      console.warn('Aucune pièce jointe pour cette doléance');
      setPiecesJointes([]);
    } finally {
      setLoadingPieces(false);
    }
  };

  const handleUpdateStatut = async (newStatut) => {
    try {
      const response = await api.put(`/doleances/${id}/statut`, { id_statut: newStatut });
      if (response.data.success) {
        toast.success('Statut mis à jour avec succès');
        fetchDoleance();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleAddReponse = async (e) => {
    e.preventDefault();
    if (!reponse.trim()) {
      toast.error('Veuillez entrer une réponse');
      return;
    }

    setSending(true);
    try {
      const response = await api.post(`/doleances/${id}/reponses`, { message: reponse });
      if (response.data.success) {
        toast.success('Réponse ajoutée avec succès');
        setReponse('');
        setShowReponseForm(false);
        fetchDoleance();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const getFileIcon = (file) => {
    const extension = file.nom_fichier?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
      return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'].includes(extension)) {
      return <VideoCameraIcon className="h-6 w-6 text-purple-500" />;
    }
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
    }
    return <DocumentDuplicateIcon className="h-6 w-6 text-gray-500" />;
  };

  const getFileTypeLabel = (file) => {
    const extension = file.nom_fichier?.split('.').pop()?.toLowerCase();
    const types = {
      'jpg': 'Image JPEG',
      'jpeg': 'Image JPEG',
      'png': 'Image PNG',
      'gif': 'Image GIF',
      'webp': 'Image WebP',
      'bmp': 'Image BMP',
      'svg': 'Image SVG',
      'mp4': 'Vidéo MP4',
      'mov': 'Vidéo MOV',
      'avi': 'Vidéo AVI',
      'mkv': 'Vidéo MKV',
      'webm': 'Vidéo WebM',
      'wmv': 'Vidéo WMV',
 
    };
    return types[extension] || 'Fichier inconnu';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusBadge = (statut, couleur) => {
    return (
      <span 
        className="px-3 py-1 rounded-full text-sm font-medium text-white"
        style={{ backgroundColor: couleur || '#6B7280' }}
      >
        {statut}
      </span>
    );
  };

  const getPriorityBadge = (priorite, niveau) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[niveau] || 'bg-gray-100 text-gray-800'}`}>
        {priorite}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doleance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Doléance non trouvée</p>
        <button onClick={() => navigate('/backoffice/doleances')} className="mt-4 btn-primary">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Bouton retour */}
      <button
        onClick={() => navigate('/backoffice/doleances')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Retour à la liste
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Informations de la doléance */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête de la doléance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {doleance.reference}
                  </span>
                  {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{doleance.titre}</h1>
              </div>
              {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{doleance.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center text-gray-500 text-sm">
                <TagIcon className="h-4 w-4 mr-2" />
                {doleance.nom_categorie || 'Non catégorisé'}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                {doleance.nom_direction || 'Non assignée'}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDateTime(doleance.date_creation)}
              </div>
              {doleance.nom_quartier && (
                <div className="flex items-center text-gray-500 text-sm">
                  <FlagIcon className="h-4 w-4 mr-2" />
                  {doleance.nom_quartier}
                </div>
              )}
            </div>

            {doleance.assignee_nom && (
              <div className="mt-3 pt-3 border-t flex items-center text-gray-500 text-sm">
                <UserCircleIcon className="h-4 w-4 mr-2" />
                Assigné à : {doleance.assignee_nom}
              </div>
            )}
          </div>

          {/* Section Pièces jointes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PaperClipIcon className="h-5 w-5" />
                Pièces jointes
              </h3>
              <span className="text-sm text-gray-500">
                {piecesJointes.length} fichier(s)
              </span>
            </div>

            {loadingPieces ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : piecesJointes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DocumentDuplicateIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune pièce jointe pour cette doléance</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {piecesJointes.map((file, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-lg border border-gray-200 p-3 text-center hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedPiece(file);
                      setShowPiecesModal(true);
                    }}
                  >
                    <div className="flex justify-center mb-2">
                      {getFileIcon(file)}
                    </div>
                    <p className="text-xs text-gray-600 truncate" title={file.nom_fichier}>
                      {file.nom_fichier}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.taille)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {getFileTypeLabel(file)}
                    </p>
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowDownTrayIcon className="h-3 w-3" />
                        Télécharger
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section des réponses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Historique des échanges
              </h3>
              <button
                onClick={() => setShowReponseForm(!showReponseForm)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <PencilIcon className="h-4 w-4" />
                {showReponseForm ? 'Annuler' : 'Ajouter une réponse'}
              </button>
            </div>

            {doleance.reponses && doleance.reponses.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {doleance.reponses.map((rep, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">{rep.auteur || 'Agent'}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(rep.date_reponse)}
                      </span>
                    </div>
                    <p className="text-gray-700">{rep.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune réponse pour le moment</p>
            )}

            {showReponseForm && (
              <form onSubmit={handleAddReponse} className="mt-4 pt-4 border-t">
                <textarea
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  placeholder="Écrire une réponse..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {sending ? 'Envoi...' : 'Envoyer la réponse'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Historique des statuts */}
          {doleance.historique_statuts && doleance.historique_statuts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Historique du traitement
              </h3>
              <div className="space-y-3">
                {doleance.historique_statuts.map((hist, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {index === doleance.historique_statuts.length - 1 ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                      ) : (
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{hist.ancien_statut_nom || 'Création'}</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="font-medium">{hist.nouveau_statut_nom}</span>
                        {hist.auteur && <span className="text-gray-500 ml-2">par {hist.auteur}</span>}
                      </p>
                      {hist.commentaire && (
                        <p className="text-xs text-gray-500 mt-1">{hist.commentaire}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(hist.date_changement)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar droite - Informations citoyen et actions */}
        <div className="space-y-6">
          {/* Informations citoyen */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5" />
              Informations citoyen
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium">
                  {doleance.citoyen_prenom} {doleance.citoyen_nom}
                </p>
              </div>
              {doleance.citoyen_email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm">{doleance.citoyen_email}</p>
                </div>
              )}
              {doleance.citoyen_telephone && (
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="text-sm">{doleance.citoyen_telephone}</p>
                </div>
              )}
              {doleance.citoyen_adresse && (
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="text-sm">{doleance.citoyen_adresse}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <select
                onChange={(e) => handleUpdateStatut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Changer le statut</option>
                <option value="2">En attente</option>
                <option value="3">Assignée</option>
                <option value="4">En traitement</option>
                <option value="5">Résolue</option>
                <option value="6">Clôturée</option>
              </select>
              
              <button
                onClick={() => setShowReponseForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Répondre au citoyen
              </button>
            </div>
          </div>

          {/* Informations de localisation */}
          {(doleance.latitude || doleance.longitude) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Localisation</h3>
              {doleance.latitude && doleance.longitude ? (
                <div>
                  <p className="text-sm text-gray-500">Coordonnées GPS</p>
                  <p className="text-sm font-mono">
                    Lat: {doleance.latitude}, Lng: {doleance.longitude}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucune localisation fournie</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'aperçu des pièces jointes */}
      {showPiecesModal && selectedPiece && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedPiece)}
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedPiece.nom_fichier}</h3>
                  <p className="text-sm text-gray-500">
                    {getFileTypeLabel(selectedPiece)} • {formatFileSize(selectedPiece.taille)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPiecesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Aperçu du fichier */}
              {selectedPiece.url && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  {selectedPiece.nom_fichier?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) ? (
                    <img 
                      src={selectedPiece.url} 
                      alt={selectedPiece.nom_fichier}
                      className="max-w-full max-h-96 mx-auto object-contain"
                    />
                  ) : selectedPiece.nom_fichier?.match(/\.(mp4|mov|avi|mkv|webm)$/i) ? (
                    <video 
                      src={selectedPiece.url} 
                      controls 
                      className="max-w-full max-h-96 mx-auto"
                    />
                  ) : (
                    <div className="py-12">
                      <DocumentDuplicateIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aperçu non disponible pour ce type de fichier</p>
                    </div>
                  )}
                </div>
              )}

              {/* Informations du fichier */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nom du fichier</p>
                  <p className="font-medium">{selectedPiece.nom_fichier}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{getFileTypeLabel(selectedPiece)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Taille</p>
                  <p className="font-medium">{formatFileSize(selectedPiece.taille)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Téléchargement</p>
                  <a
                    href={selectedPiece.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Télécharger
                  </a>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
              <button
                onClick={() => setShowPiecesModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoleanceDetail;