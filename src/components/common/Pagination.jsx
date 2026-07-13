import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
      >
        <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
      <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
        {page} / {pages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
      >
        <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
}

export default Pagination;
