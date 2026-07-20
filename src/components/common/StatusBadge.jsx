import React from 'react';

const STATUS_STYLES = {
  'Résolue': 'bg-green-500 text-white',
  'Rejetée': 'bg-red-500 text-white',
  'Clôturée': 'bg-gray-500 text-white',
  'Fermée': 'bg-gray-500 text-white',
  'Nouvelle': 'bg-blue-500 text-white',
  'En attente': 'bg-amber-500 text-white',
  'En cours': 'bg-purple-500 text-white',
  'Transférée': 'bg-cyan-500 text-white',
  'Traitée': 'bg-emerald-500 text-white',
  'Urgente': 'bg-red-600 text-white'
};

const STATUS_ICONS = {
  'Résolue': '\u2705',
  'Rejetée': '\u274C',
  'Clôturée': '\uD83D\uDD12',
  'Fermée': '\uD83D\uDD12',
  'Nouvelle': '\uD83C\uDD95',
  'Urgente': '\u26A0\uFE0F',
};

function StatusBadge({ statut, couleur }) {
  const baseStyle = 'px-2 py-1 text-xs font-medium rounded-full';
  const customStyle = STATUS_STYLES[statut];
  const icon = STATUS_ICONS[statut] || '';

  if (customStyle) {
    return <span className={`${baseStyle} ${customStyle}`}>{icon} {statut}</span>;
  }

  return (
    <span className={`${baseStyle} text-white`} style={{ backgroundColor: couleur || '#6B7280' }}>
      {statut}
    </span>
  );
}

export default StatusBadge;
