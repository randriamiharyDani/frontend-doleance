import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  'Nouvelle': '#3B82F6', 'En attente': '#F59E0B', 'En cours': '#8B5CF6',
  'Transférée': '#06B6D4', 'Traitée': '#10B981', 'Résolue': '#10B981',
  'Clôturée': '#6B7280', 'Rejetée': '#EF4444', 'Urgente': '#DC2626'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = (payload[0]?.payload?.total || 1);
    const percentage = total > 0 ? ((data.count || 0) / total * 100).toFixed(1) : 0;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-800">{data.nom_statut}</p>
        <p className="text-sm text-gray-600">{data.count} doléances</p>
        <p className="text-sm font-semibold text-blue-600">{percentage}%</p>
      </div>
    );
  }
  return null;
};

const renderLegend = (props, total) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {payload.map((entry, index) => {
        const percentage = total > 0 ? ((entry.payload.count || 0) / total * 100).toFixed(1) : 0;
        return (
          <div key={`legend-${index}`} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-700">{entry.value}</span>
            <span className="text-gray-400">({percentage}%)</span>
          </div>
        );
      })}
    </div>
  );
};

function StatusPieChart({ data, error }) {
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
      <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Doléances par statut</h2>
      {data.length > 0 ? (
        <div style={{ width: '100%', height: 320, minHeight: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="count" nameKey="nom_statut">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.nom_statut] || '#6B7280'} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={(props) => renderLegend(props, total)} />
            </PieChart>
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

export default StatusPieChart;
