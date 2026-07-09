import React from 'react';

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      {Icon && <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500">{description}</p>}
    </div>
  );
}

export default EmptyState;
