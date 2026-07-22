import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  'Nouvelle': '#3B82F6', 'En attente': '#F59E0B', 'Assignée': '#3B82F6',
  'En traitement': '#8B5CF6', 'Résolue': '#10B981',
  'Clôturée': '#6B7280', 'Rejetée': '#EF4444', 'transferee': '#06B6D4', 'Urgente': '#DC2626'
};
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.name}
            </span>
            <span className="font-bold text-gray-800 dark:text-gray-100">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const renderLegend = (props, data) => {
  const { payload } = props;
  const total = (data || []).reduce((sum, item) => sum + (item.count || 0), 0);
  return (
    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
      {payload && payload.map((entry, index) => {
        const percentage = total > 0 ? ((entry.payload.count || 0) / total * 100).toFixed(1) : 0;
        return (
          <div key={`legend-${index}`} className="flex items-center gap-1 text-xs bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-full border border-gray-100 dark:border-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-700 dark:text-gray-200">{entry.value}</span>
            <span className="text-gray-400 dark:text-gray-500">({percentage}%)</span>
          </div>
        );
      })}
    </div>
  );
};

function StatusDonutChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Doléances par statut</h2>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}
              dataKey="count" nameKey="nom_statut">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.nom_statut] || COLORS[index % COLORS.length]}
                  stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={(props) => renderLegend(props, data)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StatusDonutChart;
