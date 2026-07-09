import React from 'react';
import {
  DocumentTextIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

function StatsCards({ stats }) {
  const cards = [
    { title: 'Total Doléances', value: stats.total || 0, icon: DocumentTextIcon, color: 'bg-blue-500' },
    { title: 'En cours', value: stats.enCours || 0, icon: ClockIcon, color: 'bg-amber-500' },
    { title: 'Résolues', value: stats.resolues || 0, icon: CheckCircleIcon, color: 'bg-emerald-500' },
    { title: 'Urgentes', value: stats.urgentes || 0, icon: ExclamationTriangleIcon, color: 'bg-rose-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">{stat.title}</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-2.5 sm:p-3 rounded-xl shadow-lg`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
