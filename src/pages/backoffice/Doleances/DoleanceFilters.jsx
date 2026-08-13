import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

function DoleanceFilters({
  searchTerm, onSearchChange, onSubmit, onReset,
  showFilters, onToggleFilters,
  selectedCategorie, onCategorieChange,
  selectedStatut, onStatutChange,
  selectedPriorite, onPrioriteChange,
  categories, statuts, priorites
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-6">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher par référence, titre, citoyen..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleFilters}
            className="flex-1 sm:flex-none px-4 py-2 text-gray-600 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            Filtres
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 sm:flex-none px-4 py-2 text-gray-600 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rechercher
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Catégorie</label>
            <select
              value={selectedCategorie}
              onChange={(e) => onCategorieChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom_categorie}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Statut</label>
            <select
              value={selectedStatut}
              onChange={(e) => onStatutChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              {statuts.map(statut => (
                <option key={statut.id_statut} value={statut.id_statut}>{statut.nom_statut}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Priorité</label>
            <select
              value={selectedPriorite}
              onChange={(e) => onPrioriteChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">Toutes les priorités</option>
              {priorites.map(prio => (
                <option key={prio.id_priorite} value={prio.id_priorite}>{prio.nom_priorite}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoleanceFilters;
