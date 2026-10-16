import React from 'react';
import Modal from '../../../components/common/Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightWords = (text, words) => {
  if (!text) return text || '';
  const valid = (words || []).map((w) => (w || '').trim()).filter(Boolean);
  if (valid.length === 0) return text;
  const pattern = valid.map(escapeRegExp).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={index}
        className="bg-red-200 text-red-800 dark:bg-red-700/60 dark:text-red-50 rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};

function MotsDetectesModal({ isOpen, onClose, doleance }) {
  if (!doleance) return null;

  const separator = String.fromCharCode(1);
  const mots = (doleance.mots_detectes || '')
    .split(separator)
    .map((m) => m.trim())
    .filter(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mots interdits détectés"
      subtitle={doleance.reference}
      size="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
        >
          Fermer
        </button>
      }
    >
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          Mots interdits détectés ({mots.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {mots.length === 0 ? (
            <span className="text-sm text-gray-500 dark:text-gray-400">Aucun mot</span>
          ) : (
            mots.map((mot, index) => (
              <span
                key={`${mot}-${index}`}
                className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              >
                {mot}
              </span>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Objet</p>
        <p className="text-gray-800 dark:text-gray-100 break-words">{highlightWords(doleance.titre, mots)}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Description complète</p>
        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
          {highlightWords(doleance.description, mots)}
        </p>
      </div>
    </Modal>
  );
}

export default MotsDetectesModal;
