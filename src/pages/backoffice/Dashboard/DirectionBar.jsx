import React from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

function DirectionBar({ data, error }) {
  const total = data.reduce((sum, d) => sum + (d.count || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
      <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Doléances par direction</h2>
      {data.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {data.map((dir) => {
            const percentage = dir.percentage != null ? dir.percentage : (total > 0 ? ((dir.count || 0) / total * 100) : 0);
            return (
              <div key={dir.id_direction} className="rounded-lg p-2 -m-2 hover:bg-gray-50 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm mb-1 gap-1">
                  <span className="font-medium break-words text-gray-700">
                    {dir.nom_direction}
                  </span>
                  <span className="font-semibold whitespace-nowrap text-gray-600">{dir.count || 0} ({Math.round(percentage)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 sm:h-2.5">
                  <div
                    className="h-2 sm:h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: COLORS[data.indexOf(dir) % COLORS.length] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">{error ? 'Erreur de chargement' : 'Aucune donnée disponible'}</p>
      )}
    </div>
  );
}

export default DirectionBar;
