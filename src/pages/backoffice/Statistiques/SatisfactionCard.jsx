import React from 'react';
import { StarIcon } from '@heroicons/react/24/outline';

function SatisfactionCard({ data }) {
  if (!data || !data.total_avis || data.total_avis === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Satisfaction citoyenne</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <div className="text-2xl font-bold text-emerald-600">{data.taux_satisfaction || 0}%</div>
          <p className="text-xs text-gray-500 mt-1 font-medium">Taux satisfaction</p>
          <div className="mt-2 w-full bg-emerald-200 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(data.taux_satisfaction || 0, 100)}%` }} />
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{data.note_moyenne || 0}/5</div>
          <p className="text-xs text-gray-500 mt-1 font-medium">Note moyenne</p>
          <div className="flex justify-center mt-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`h-4 w-4 ${i < Math.round(data.note_moyenne || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
          <div className="text-2xl font-bold text-purple-600">{data.total_avis || 0}</div>
          <p className="text-xs text-gray-500 mt-1 font-medium">Avis reçus</p>
          <div className="flex justify-center gap-4 mt-2 text-sm">
            <span className="text-emerald-600">😊 {data.satisfaits || 0}</span>
            <span className="text-rose-600">😞 {data.insatisfaits || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SatisfactionCard;
