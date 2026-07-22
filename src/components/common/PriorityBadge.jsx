import React from 'react';

const PRIORITY_COLORS = {
  1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  3: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  4: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

function PriorityBadge({ priorite, niveau }) {
  const colorClass = PRIORITY_COLORS[niveau] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
      {priorite}
    </span>
  );
}

export default PriorityBadge;
