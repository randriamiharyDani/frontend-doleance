import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const ROLE_LABELS = {
  administrateur_systeme: 'Super Admin',
  agent_central: 'Agent Central',
  directeur: 'Directeur',
  chef_service: 'Chef Service',
  agent: 'Agent'
};

function DoleanceHeader({ userRole, isAdminOrAgentCentral }) {
  const roleLabel = ROLE_LABELS[userRole] || 'Utilisateur';

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gestion des doléances</h1>
        <p className="text-gray-600 mt-1">Consultez et gérez les doléances des citoyens</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
          <ShieldCheckIcon className="h-3 w-3" />
          {roleLabel}
        </div>
        {!isAdminOrAgentCentral && (
          <div className="mt-2 text-xs text-gray-500">
            Vous ne pouvez voir que les détails des doléances NON RÉSOLUES de votre direction
          </div>
        )}
      </div>
    </div>
  );
}

export default DoleanceHeader;
