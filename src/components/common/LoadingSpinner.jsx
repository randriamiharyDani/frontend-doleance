import React from 'react';

function LoadingSpinner({ text = 'Chargement...', size = 'lg' }) {
  const sizeClasses = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClasses[size] || sizeClasses.lg}`}></div>
        {text && <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{text}</p>}
      </div>
    </div>
  );
}

export default LoadingSpinner;
