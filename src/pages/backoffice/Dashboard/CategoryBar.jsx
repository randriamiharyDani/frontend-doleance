import React from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

function formatDelay(hours) {
  if (hours == null) return '-';
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}j`;
}

function CategoryBar({ data, error, selectedId, onSelect }) {
  const total = data.reduce((sum, c) => sum + (c.count || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">Doléances par catégorie</h2>
        {selectedId && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Tout afficher
          </button>
        )}
      </div>
      {data.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {data.map((cat) => {
            const percentage = cat.percentage != null ? cat.percentage : (total > 0 ? ((cat.count || 0) / total * 100) : 0);
            const isSelected = selectedId === cat.id_categorie;
            return (
              <div
                key={cat.id_categorie}
                onClick={() => onSelect(isSelected ? null : cat.id_categorie)}
                className={`cursor-pointer rounded-lg p-2 -m-2 transition-all duration-200 ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'}`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm mb-1 gap-1">
                  <span className={`font-medium break-words flex items-center gap-2 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.couleur || COLORS[0] }}></span>
                    {cat.nom_categorie}
                  </span>
                  <span className={`font-semibold whitespace-nowrap ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>{cat.count || 0} ({Math.round(percentage)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 sm:h-2.5">
                  <div className="h-2 sm:h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: cat.couleur || COLORS[0] }} />
                </div>
                {cat.delai_moyen_heures != null && (
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                    Délai moyen : {formatDelay(cat.delai_moyen_heures)}
                  </p>
                )}
              </div>
            );
          })}
          {error && <p className="text-xs text-amber-600 mt-2">Données partiellement chargées</p>}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">Aucune donnée disponible</p>
      )}
    </div>
  );
}

export default CategoryBar;
