import React from 'react';

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center border border-gray-100 dark:border-slate-700">
      {Icon && <Icon className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
  );
}

export default EmptyState;
