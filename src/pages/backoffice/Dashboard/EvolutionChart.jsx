import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MOIS_NOMS = [
  'Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
];

function EvolutionChart({ data, error }) {
  const formatMoisAnnee = (value, index) => {
    const item = data[index] || data.find(d => d.mois === value);
    const moisIndex = parseInt(item?.mois, 10) - 1; // si mois = "01" à "12"
    const nomMois = MOIS_NOMS[moisIndex] || value;
    return item?.annee ? `${nomMois} ${item.annee}` : nomMois;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
      <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Évolution mensuelle</h2>
      {data.length > 0 ? (
        <div style={{ width: '100%', height: 320, minHeight: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="mois"
                stroke="#6B7280"
                fontSize={12}
                tickMargin={5}
                tickFormatter={formatMoisAnnee}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                labelFormatter={formatMoisAnnee}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="total" fill="#3B82F6" name="Total doléances" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolues" fill="#10B981" name="Résolues" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-sm">{error ? 'Erreur de chargement.' : 'Aucune donnée disponible'}</p>
        </div>
      )}
    </div>
  );
}

export default EvolutionChart;