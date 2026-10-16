import React, { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import motsInterditsService from '../services/motsInterditsService';
import toast from 'react-hot-toast';

function MotsInterdits() {
  const [mots, setMots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formMot, setFormMot] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchMots = useCallback(async () => {
    setLoading(true);
    const result = await motsInterditsService.getAll();
    if (result.success) {
      setMots(Array.isArray(result.data) ? result.data : []);
    } else {
      setMots([]);
      toast.error('Erreur chargement des mots interdits');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMots();
  }, [fetchMots]);

  const filtered = mots.filter((m) =>
    !search || (m.mot || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormMot('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormMot(item.mot || '');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const mot = formMot.trim();
    if (!mot) {
      toast.error('Le mot est requis');
      return;
    }
    setSaving(true);
    const result = editing
      ? await motsInterditsService.update(editing.id_mot, mot)
      : await motsInterditsService.create(mot);

    if (result.success) {
      toast.success(editing ? 'Mot interdit modifié' : 'Mot interdit ajouté');
      setShowModal(false);
      fetchMots();
    } else {
      toast.error(result.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const result = await motsInterditsService.delete(id);
    if (result.success) {
      toast.success('Mot interdit supprimé');
    } else {
      toast.error(result.message || 'Erreur lors de la suppression');
    }
    setShowDeleteConfirm(null);
    fetchMots();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mots interdits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Les doléances contenant ces mots sont signalées automatiquement
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary btn-md">
          <PlusIcon className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un mot..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
            {mots.length === 0 ? 'Aucun mot interdit enregistré' : 'Aucun mot trouvé'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Mot</th>
                  <th className="hidden sm:table-cell">Date d'ajout</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id_mot} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td>
                      <span className="font-medium text-gray-900 dark:text-white">{item.mot}</span>
                    </td>
                    <td className="hidden sm:table-cell text-gray-500 dark:text-gray-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(item)}
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-600">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editing ? 'Modifier le mot interdit' : 'Nouveau mot interdit'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="label">Mot *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formMot}
                  onChange={(e) => setFormMot(e.target.value)}
                  className="input"
                  placeholder="Ex: insulte"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary btn-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary btn-sm"
                >
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content-custom max-w-md p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
              <TrashIcon className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Êtes-vous sûr de vouloir supprimer le mot :
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              « {showDeleteConfirm.mot} » ?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary btn-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id_mot)}
                className="btn-danger btn-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MotsInterdits;
