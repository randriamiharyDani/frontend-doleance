import React, { useState, useEffect, useCallback } from 'react';
import doleanceService from '../services/doleanceService';
import toast from 'react-hot-toast';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { TrashIcon, ArrowPathIcon, MagnifyingGlassIcon, FunnelIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function Corbeille() {
  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [doleanceToRestore, setDoleanceToRestore] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doleanceToDelete, setDoleanceToDelete] = useState(null);

  const [showEmptyModal, setShowEmptyModal] = useState(false);

  const fetchDoleances = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      if (selectedDirection) params.direction = selectedDirection;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const result = await doleanceService.getTrashed(params);
      if (result?.success) {
        setDoleances(result.data.data?.doleances || []);
        setPagination(prev => ({
          ...prev,
          total: result.data.data?.pagination?.total || 0,
          pages: result.data.data?.pagination?.pages || 0
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur chargement corbeille');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, searchTerm, selectedDirection, dateFrom, dateTo]);

  const fetchDirections = useCallback(async () => {
    try {
      const result = await doleanceService.getDirections();
      if (result?.success) {
        setDirections(Array.isArray(result.data) ? result.data : result.data?.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  useEffect(() => {
    fetchDoleances();
  }, [fetchDoleances]);

  useEffect(() => {
    if (selectAll) {
      setSelectedIds(doleances.map(d => d.id_doleance));
    } else {
      setSelectedIds([]);
    }
  }, [selectAll, doleances]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedDirection('');
    setDateFrom('');
    setDateTo('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openRestoreModal = (doleance) => {
    setDoleanceToRestore(doleance);
    setShowRestoreModal(true);
  };

  const handleRestore = async () => {
    try {
      const result = await doleanceService.restoreDoleance(doleanceToRestore.id_doleance);
      if (result?.success) {
        toast.success(result.data?.message || 'Doléance restaurée');
        fetchDoleances();
      } else {
        toast.error(result?.message || 'Erreur lors de la restauration');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la restauration');
    } finally {
      setShowRestoreModal(false);
      setDoleanceToRestore(null);
    }
  };

  const openDeleteModal = (doleance) => {
    setDoleanceToDelete(doleance);
    setShowDeleteModal(true);
  };

  const handlePermanentDelete = async () => {
    try {
      const result = await doleanceService.permanentDelete(doleanceToDelete.id_doleance);
      if (result?.success) {
        toast.success(result.data?.message || 'Doléance supprimée définitivement');
        fetchDoleances();
      } else {
        toast.error(result?.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setShowDeleteModal(false);
      setDoleanceToDelete(null);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const idsToSend = selectedIds.length > 0 ? selectedIds : null;
      const result = await doleanceService.emptyTrash(idsToSend);
      if (result?.success) {
        toast.success(result.data?.message || 'Corbeille vidée');
        setSelectedIds([]);
        setSelectAll(false);
        fetchDoleances();
      } else {
        toast.error(result?.message || 'Erreur lors du vidage');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors du vidage');
    } finally {
      setShowEmptyModal(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            Corbeille
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} doléance(s) supprimée(s)
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowEmptyModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              <TrashIcon className="h-4 w-4" />
              Supprimer ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => { setSelectAll(!selectAll); }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
              selectAll
                ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {selectAll ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
          {selectedIds.length === 0 && doleances.length > 0 && (
            <button
              onClick={() => setShowEmptyModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              <TrashIcon className="h-4 w-4" />
              Vider la corbeille
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, titre ou citoyen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
              showFilters
                ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            Filtres
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            Rechercher
          </button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Direction</label>
              <select
                value={selectedDirection}
                onChange={(e) => { setSelectedDirection(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Toutes les directions</option>
                {directions.map((d) => (
                  <option key={d.id_direction} value={d.id_direction}>{d.nom_direction}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date suppression (début)</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date suppression (fin)</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                onClick={handleReset}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Chargement de la corbeille..." />
      ) : doleances.length === 0 ? (
        <EmptyState
          icon={TrashIcon}
          title="La corbeille est vide"
          description="Aucune doléance n'a été supprimée."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={() => setSelectAll(!selectAll)}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Citoyen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date suppression
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {doleances.map((doleance) => (
                  <tr
                    key={doleance.id_doleance}
                    className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
                      selectedIds.includes(doleance.id_doleance) ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(doleance.id_doleance)}
                        onChange={() => toggleSelect(doleance.id_doleance)}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                        {doleance.reference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white font-medium line-clamp-1">
                        {doleance.titre}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {doleance.citoyen_nom || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {doleance.nom_direction || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: doleance.statut_couleur ? `${doleance.statut_couleur}20` : '#f3f4f6',
                          color: doleance.statut_couleur || '#6b7280'
                        }}
                      >
                        {doleance.nom_statut || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(doleance.date_suppression)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openRestoreModal(doleance)}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors"
                          title="Restaurer"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(doleance)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                          title="Supprimer définitivement"
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
        </div>
      )}

      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
      />

      {/* Restore Confirmation Modal */}
      <Modal isOpen={showRestoreModal} onClose={() => { setShowRestoreModal(false); setDoleanceToRestore(null); }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <ArrowPathIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Restaurer la doléance</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Voulez-vous restaurer la doléance <strong className="text-gray-900 dark:text-white">{doleanceToRestore?.reference}</strong> ?
            Elle sera remise dans la liste principale.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowRestoreModal(false); setDoleanceToRestore(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleRestore}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              Restaurer
            </button>
          </div>
      </Modal>

      {/* Permanent Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDoleanceToDelete(null); }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Suppression définitive</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Voulez-vous supprimer <strong className="text-gray-900 dark:text-white">{doleanceToDelete?.reference}</strong> définitivement ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-6 flex items-center gap-1">
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            Cette action est irréversible. Toutes les données associées seront perdues.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowDeleteModal(false); setDoleanceToDelete(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handlePermanentDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              Supprimer définitivement
            </button>
          </div>
      </Modal>

      {/* Empty Trash Confirmation Modal */}
      <Modal isOpen={showEmptyModal} onClose={() => setShowEmptyModal(false)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedIds.length > 0 ? `Supprimer ${selectedIds.length} doléance(s) ?` : 'Vider la corbeille ?'}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {selectedIds.length > 0
              ? `Vous êtes sur le point de supprimer définitivement ${selectedIds.length} doléance(s) sélectionnée(s).`
              : 'Vous êtes sur le point de supprimer définitivement toutes les doléances de la corbeille.'
            }
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-6 flex items-center gap-1">
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            Cette action est irréversible. Toutes les données seront perdues.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowEmptyModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleEmptyTrash}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              Supprimer définitivement
            </button>
          </div>
      </Modal>
    </div>
  );
}

export default Corbeille;
