import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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

function EvolutionAreaChart({ data, isAdmin }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Évolution des doléances</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="periode" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="total" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Total" strokeWidth={2} />
            <Area type="monotone" dataKey="resolues" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Résolues" strokeWidth={2} />
            {isAdmin && (
              <Area type="monotone" dataKey="urgentes" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} name="Urgentes" strokeWidth={2} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EvolutionAreaChart;
