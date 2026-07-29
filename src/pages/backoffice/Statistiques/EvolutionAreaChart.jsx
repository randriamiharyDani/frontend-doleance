import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
);

const FALLBACK_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

export default function EvolutionAreaChart({ data = [], isAdmin }) {
  const enriched = useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
    return data
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .map((d, i) => ({
        ...d,
        pct: total > 0 ? Math.round(((d.count || 0) / total) * 100) : 0,
        fill: d.couleur || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }));
  }, [data]);

  const chartData = {
    labels: enriched.map(d => d.nom_categorie),
    datasets: [
      {
        label: 'Nombre de doléances',
        data: enriched.map(d => d.count || 0),
        backgroundColor: enriched.map(d => d.fill),
        borderColor: enriched.map(d => d.fill),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const item = enriched[ctx.dataIndex];
            return ` ${item.count} doléance${item.count > 1 ? 's' : ''} (${item.pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: '#6B7280',
          maxRotation: 40,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.06)',
          drawBorder: false,
        },
        ticks: {
          font: { size: 11 },
          color: '#6B7280',
          precision: 0,
        },
      },
    },
  };

  const totalCount = enriched.reduce((s, d) => s + d.count, 0);
  const topCategory = enriched[0];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Doléances par catégorie</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Répartition des doléances par catégorie</p>
        </div>
        {totalCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
            {totalCount} au total
          </span>
        )}
      </div>

      {enriched.length > 0 ? (
        <div style={{ height: 300 }}>
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-64 text-gray-400 dark:text-gray-500">
          <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v16.5h16.5M8 16.5v-6M13 16.5v-10M18 16.5v-3" />
          </svg>
          <p className="text-sm font-medium">Aucune catégorie à afficher</p>
          <p className="text-xs mt-1">Les données apparaîtront lorsque des doléances seront créées.</p>
        </div>
      )}

      {topCategory && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Catégorie principale</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{topCategory.nom_categorie}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Doléances</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{topCategory.count}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Part du total</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{topCategory.pct}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
