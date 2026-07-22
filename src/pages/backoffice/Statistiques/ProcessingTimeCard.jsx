import React from 'react';

function ProcessingTimeCard({ data }) {
  if (!data) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Temps de traitement moyen</h2>
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Temps de traitement moyen</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Moyen</p>
            <p className="text-xl font-bold text-blue-600">{Math.round(data.moyen_heures || 0)}h</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Minimum</p>
            <p className="text-xl font-bold text-emerald-600">{Math.round(data.min_heures || 0)}h</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Maximum</p>
            <p className="text-xl font-bold text-rose-600">{Math.round(data.max_heures || 0)}h</p>
          </div>
        </div>
        <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Par priorité :</p>
          <div className="space-y-2.5">
            {[
              { label: 'Basse priorité', value: data.basse_heures, color: 'text-emerald-600' },
              { label: 'Priorité moyenne', value: data.moyenne_heures, color: 'text-blue-600' },
              { label: 'Haute priorité', value: data.haute_heures, color: 'text-amber-600' },
              { label: 'Urgente', value: data.urgente_heures, color: 'text-rose-600' }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{Math.round(item.value || 0)} heures</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessingTimeCard;
