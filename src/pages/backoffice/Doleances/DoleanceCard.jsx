import React from 'react';
import {
  UserIcon, PhoneIcon, EnvelopeIcon, FolderIcon,
  CalendarIcon, MapPinIcon, PencilIcon, TrashIcon,
  ChatBubbleLeftRightIcon, ArrowPathIcon, EyeIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '../../../components/common/StatusBadge';
import PriorityBadge from '../../../components/common/PriorityBadge';

const STATUTS_BLOQUES = ['Résolue', 'Rejetée', 'Clôturée', 'Fermée'];

function DoleanceCard({
  doleance,
  user, isAdminOrAgentCentral, canTraiter,
  onView, onDelete, onPriorite, onReponse, onStatut,
  isNouvelle, isBloquee, isDeSaDirection, userCanAct, userCanView, fullAddress
}) {
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (!isAdminOrAgentCentral && (!userCanView || isBloquee || !isDeSaDirection)) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
        isNouvelle ? 'border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {doleance.reference}
              </span>
              {isNouvelle && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white animate-pulse">
                  Nouvelle
                </span>
              )}
              <PriorityBadge priorite={doleance.nom_priorite} niveau={doleance.niveau} />
              <StatusBadge statut={doleance.nom_statut} couleur={doleance.statut_couleur} />
              {doleance.nom_direction && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {doleance.nom_direction}
                </span>
              )}
              {isBloquee && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  Non modifiable
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">{doleance.titre}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{doleance.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {doleance.citoyen_nom || 'Anonyme'} {doleance.citoyen_prenom || ''}
              </span>
              {doleance.telephone_citoyen && (
                <span className="flex items-center gap-1">
                  <PhoneIcon className="h-3 w-3" />
                  {doleance.telephone_citoyen}
                </span>
              )}
              {doleance.email_citoyen && (
                <span className="flex items-center gap-1">
                  <EnvelopeIcon className="h-3 w-3" />
                  {doleance.email_citoyen}
                </span>
              )}
              {doleance.nom_categorie && (
                <span className="flex items-center gap-1">
                  <FolderIcon className="h-3 w-3" />
                  {doleance.nom_categorie}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDateTime(doleance.date_creation)}
              </span>
            </div>

            {fullAddress && (
              <div className="flex items-start gap-1 text-xs text-gray-400 mt-1">
                <MapPinIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-500">{fullAddress}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {isAdminOrAgentCentral && (
              <button
                onClick={() => onPriorite(doleance)}
                className={`p-2 rounded-lg transition-colors ${
                  isBloquee ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600 hover:bg-yellow-50'
                }`}
                disabled={isBloquee}
                title="Changer la priorité"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            {isAdminOrAgentCentral && (
              <button
                onClick={() => onDelete(doleance)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
            {userCanAct && (
              <button
                onClick={() => onReponse(doleance)}
                className={`p-2 rounded-lg transition-colors ${
                  isNouvelle && !isAdminOrAgentCentral
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-green-600 hover:bg-green-50'
                }`}
                disabled={isNouvelle && !isAdminOrAgentCentral}
                title="Répondre"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </button>
            )}
            {isAdminOrAgentCentral && (
              <button
                onClick={() => onStatut(doleance)}
                className={`p-2 rounded-lg transition-colors ${
                  isBloquee ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'
                }`}
                disabled={isBloquee}
                title="Changer le statut"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => onView(doleance)}
              className={`p-2 rounded-lg transition-colors ${
                !userCanView ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
              }`}
              disabled={!userCanView}
              title="Voir tous les détails"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { STATUTS_BLOQUES };
export default DoleanceCard;
