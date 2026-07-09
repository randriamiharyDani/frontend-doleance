import React from 'react';

const PRIORITY_COLORS = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-orange-100 text-orange-800',
  4: 'bg-red-100 text-red-800'
};

function PriorityBadge({ priorite, niveau }) {
  const colorClass = PRIORITY_COLORS[niveau] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
      {priorite}
    </span>
  );
}

export default PriorityBadge;
