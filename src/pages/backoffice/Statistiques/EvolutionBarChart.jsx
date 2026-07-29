import React from 'react';
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

function formatLabel(periode) {
  if (!periode) return '';
  const parts = periode.split('-');
  if (parts.length === 2) {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const m = parseInt(parts[1], 10) - 1;
    return `${months[m] || parts[1]}`;
  }
  if (parts.length === 3) {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const m = parseInt(parts[1], 10) - 1;
    return `${months[m] || parts[1]}`;
  }
  return periode;
}

export default function EvolutionBarChart({ data = [] }) {
  const labels = data.map(d => formatLabel(d.periode));
  const totals = data.map(d => d.total || 0);
  const resolues = data.map(d => d.resolues || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total',
        data: totals,
        backgroundColor: 'rgba(59,130,246,0.8)',
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Résolues',
        data: resolues,
        backgroundColor: 'rgba(16,185,129,0.8)',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 16,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} doléance${ctx.raw > 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#6B7280' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false },
        ticks: { font: { size: 10 }, color: '#6B7280', precision: 0 },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Évolution temporelle</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Total et résolues par période</p>
      </div>
      {data.length > 0 ? (
        <div style={{ height: 260 }}>
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-56 text-gray-400 dark:text-gray-500">
          <svg className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v16.5h16.5M8 16.5v-6M13 16.5v-10M18 16.5v-3" />
          </svg>
          <p className="text-sm">Aucune donnée d'évolution</p>
        </div>
      )}
    </div>
  );
}
