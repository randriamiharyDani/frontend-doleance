import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div>
         <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
           Gestion des doléances
          </h1>
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
      {isAdminOrAgentCentral && (
        <Link
          to="/backoffice/ajouter-doleance"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40 hover:scale-[1.02] transition-all duration-200"
        >
          <PlusCircleIcon className="h-4 w-4" />
          Ajouter une doléance
        </Link>
      )}
    </div>
  );
}

export default DoleanceHeader;
