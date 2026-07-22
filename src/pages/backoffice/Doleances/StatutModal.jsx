import React from 'react';
import Modal from '../../../components/common/Modal';

function StatutModal({ isOpen, onClose, onConfirm, statuts, selectedValue, onValueChange, doleance }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Changer le statut"
      subtitle={doleance?.reference}
      size="max-w-md"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Modifier
          </button>
        </>
      }
    >
      <select
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
      >
        {statuts.map(stat => (
          <option key={stat.id_statut} value={stat.id_statut}>{stat.nom_statut}</option>
        ))}
      </select>
    </Modal>
  );
}

export default StatutModal;
