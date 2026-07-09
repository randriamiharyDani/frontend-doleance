import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/common/Modal';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, doleance }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="max-w-md"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Supprimer
          </button>
        </>
      }
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <TrashIcon className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmation de suppression</h3>
        <p className="text-sm text-gray-500">
          Supprimer la doléance <span className="font-semibold">{doleance?.reference}</span> ?
          Cette action est irréversible.
        </p>
      </div>
    </Modal>
  );
}

export default DeleteConfirmModal;
