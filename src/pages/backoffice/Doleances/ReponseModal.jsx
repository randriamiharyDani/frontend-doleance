import React from 'react';
import Modal from '../../../components/common/Modal';

function ReponseModal({ isOpen, onClose, onSend, reponseText, onTextChange, doleance, isNouvelle }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Répondre à la doléance"
      subtitle={`Référence: ${doleance?.reference || ''}`}
      size="max-w-lg"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button
            onClick={onSend}
            disabled={!reponseText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Envoyer
          </button>
        </>
      }
    >
      {isNouvelle && (
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-700">
          Cette doléance est en attente. L'administrateur doit la traiter en priorité.
        </div>
      )}
      <textarea
        value={reponseText}
        onChange={(e) => onTextChange(e.target.value)}
        rows="5"
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Saisissez votre réponse..."
      />
    </Modal>
  );
}

export default ReponseModal;
