import React, { useState } from 'react';
import {
  UserIcon, MapPinIcon, ChatBubbleLeftRightIcon,
  PaperClipIcon, DocumentDuplicateIcon,
  PhotoIcon, VideoCameraIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Modal from '../../../components/common/Modal';
import StatusBadge from '../../../components/common/StatusBadge';
import PriorityBadge from '../../../components/common/PriorityBadge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

function DoleanceDetailModal({ isOpen, onClose, doleance, piecesJointes, loadingPieces }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  if (!doleance) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getFileIcon = (file) => {
    const ext = file.nom_fichier?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogg'].includes(ext)) return <VideoCameraIcon className="h-5 w-5 text-purple-500" />;
    return <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const buildFullAddress = (d) => {
    const parts = [];
    if (d.adresse_citoyen) parts.push(d.adresse_citoyen);
    if (d.lot) parts.push(`Lot ${d.lot}`);
    if (d.fokontany) parts.push(d.fokontany);
    if (d.arrondissement) parts.push(d.arrondissement);
    if (d.lieu_exact) parts.push(d.lieu_exact);
    return parts.join(', ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails complets de la doléance"
      subtitle={doleance.reference}
      size="max-w-4xl"
      footer={
        <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors">
          Fermer
        </button>
      }
    >
      <div className="flex flex-wrap gap-3">
        <PriorityBadge priorite={doleance.nom_priorite} niveau={doleance.niveau} />
        <StatusBadge statut={doleance.nom_statut} couleur={doleance.statut_couleur} />
        {doleance.nom_direction && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{doleance.nom_direction}</span>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800">{doleance.titre}</h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-2">Description détaillée</h4>
        <p className="text-gray-600 whitespace-pre-wrap">{doleance.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Informations du citoyen
          </h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Nom :</span> {doleance.citoyen_nom || ''} {doleance.citoyen_prenom || ''}</p>
            {doleance.telephone_citoyen && <p><span className="font-medium">Téléphone :</span> {doleance.telephone_citoyen}</p>}
            {doleance.email_citoyen && <p><span className="font-medium">Email :</span> {doleance.email_citoyen}</p>}
            <p><span className="font-medium">Date dépôt :</span> {formatDateTime(doleance.date_creation)}</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            Adresse
          </h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Adresse :</span> {doleance.adresse_citoyen || 'Non renseignée'}</p>
            {doleance.lot && <p><span className="font-medium">Lot :</span> {doleance.lot}</p>}
            {doleance.fokontany && <p><span className="font-medium">Fokontany :</span> {doleance.fokontany}</p>}
            {doleance.arrondissement && <p><span className="font-medium">Arrondissement :</span> {doleance.arrondissement}</p>}
            {doleance.lieu_exact && <p><span className="font-medium">Lieu exact :</span> {doleance.lieu_exact}</p>}
            {buildFullAddress(doleance) && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="font-medium text-green-700">Adresse complète :</p>
                <p className="text-gray-700">{buildFullAddress(doleance)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {doleance.suggestions && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Suggestions / Actions souhaitées
          </h4>
          <p className="text-gray-700">{doleance.suggestions}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <PaperClipIcon className="h-4 w-4" />
          Pièces jointes
          {piecesJointes.length > 0 && (
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">{piecesJointes.length}</span>
          )}
        </h4>

        {loadingPieces ? (
          <LoadingSpinner text="" size="sm" />
        ) : piecesJointes.length === 0 ? (
          <div className="text-center py-6">
            <DocumentDuplicateIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Aucune pièce jointe disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {piecesJointes.map((file, index) => {
              const ext = file.nom_fichier?.split('.').pop()?.toLowerCase();
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
              const downloadUrl = file.url || `/api/doleances/${doleance.id_doleance}/pieces-jointes/${file.id_piece || index}`;
              return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {isImage && file.url ? (
                    <div className="aspect-square cursor-pointer relative group" onClick={() => setLightboxImage(file.url)}>
                      <img src={file.url} alt={file.nom_fichier} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-gray-50">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate font-medium" title={file.nom_fichier}>{file.nom_fichier}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(file.taille)}</p>
                    <div className="mt-1.5 flex justify-center">
                      <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                        <ArrowDownTrayIcon className="h-3 w-3" /> Télécharger
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 cursor-pointer" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img src={lightboxImage} alt="Aperçu" className="w-full h-full object-contain rounded-xl" />
            <button onClick={() => setLightboxImage(null)} className="absolute top-3 right-3 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {doleance.reponses && doleance.reponses.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Historique des réponses ({doleance.reponses.length})
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {doleance.reponses.map((rep, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-purple-400">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{rep.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDateTime(rep.date_reponse)} par {rep.agent_nom || 'Service municipal'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default DoleanceDetailModal;
