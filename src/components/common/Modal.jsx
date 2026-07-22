import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function Modal({ isOpen, onClose, title, subtitle, children, footer, size = 'max-w-md' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ${size} w-full max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">{children}</div>
        {footer && (
          <div className="sticky bottom-0 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-700 p-3 sm:p-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
