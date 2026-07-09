import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../../../components/common/StatusBadge';
import PriorityBadge from '../../../components/common/PriorityBadge';

function RecentDoleancesTable({ doleances, error }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">Doléances récentes</h2>
        <Link to="/backoffice/doleances" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Voir toutes →</Link>
      </div>

      {doleances.length > 0 ? (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[640px] sm:min-w-full">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Titre</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Catégorie</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Priorité</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Date</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {doleances.map((d) => (
                  <tr key={d.id_doleance} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono font-medium text-blue-600">{d.reference}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hidden sm:table-cell truncate max-w-[120px] md:max-w-[200px]">{d.titre}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 hidden md:table-cell">{d.nom_categorie || '-'}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3"><StatusBadge statut={d.nom_statut} couleur={d.statut_couleur} /></td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 hidden lg:table-cell"><PriorityBadge priorite={d.nom_priorite} niveau={d.niveau} /></td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                      <Link to={`/backoffice/doleances/${d.id_doleance}`} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">Voir</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <DocumentTextIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{error ? 'Erreur de chargement.' : 'Aucune doléance récente'}</p>
        </div>
      )}
    </div>
  );
}

export default RecentDoleancesTable;
