import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      <span className="px-4 py-2 text-sm text-gray-600">
        Page {page} / {pages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export default Pagination;
