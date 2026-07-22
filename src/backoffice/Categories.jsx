import React, { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import doleanceService from '../services/doleanceService';
import toast from 'react-hot-toast';

const ICON_OPTIONS = [
  { value: 'road', label: 'Voirie' },
  { value: 'lightbulb', label: 'Éclairage' },
  { value: 'trash', label: 'Salubrité' },
  { value: 'tree', label: 'Espaces verts' },
  { value: 'bus', label: 'Transport' },
  { value: 'security', label: 'Sécurité' },
  { value: 'building', label: 'Urbanisme' },
  { value: 'people', label: 'Social' },
  { value: 'fire', label: 'Incendie' },
  { value: 'accident', label: 'Accident' },
  { value: 'medical', label: 'Secours' },
  { value: 'flood', label: 'Inondation' },
  { value: 'disaster', label: 'Catastrophe' },
  { value: 'animal', label: 'Animal' },
  { value: 'hazard', label: 'Danger' },
];

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#10B981', label: 'Vert' },
  { value: '#F59E0B', label: 'Ambre' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EC4899', label: 'Rose' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Citron' },
  { value: '#F97316', label: 'Orange' },
  { value: '#6B7280', label: 'Gris' },
  { value: '#1E3A8A', label: 'Bleu foncé' },
  { value: '#9C27B0', label: 'Pourpre' },
  { value: '#795548', label: 'Brun' },
  { value: '#E91E63', label: 'Rose vif' },
  { value: '#4CAF50', label: 'Vert foncé' },
];
// function Direction(){

// }
function Categories() {
  const [activeTab, setActiveTab] = useState('CUA');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    nom_categorie: '',
    nom_malgache: '',
    description: '',
    direction_concernee: '',
    couleur: '#3B82F6',
    icone: '',
    module: 'CUA',
    actif: 1,
  });
  const [saving, setSaving] = useState(false);
  const [directions, setDirections] = useState([]);

  const tabs = [
    { key: 'CUA', label: 'Catégories CUA' },
    { key: 'Sapeurs-Pompiers', label: 'Catégories Sapeurs-Pompiers' },
  ];

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const result = await doleanceService.getCategories({ module: activeTab });
    if (result.success) {
      setCategories(Array.isArray(result.data) ? result.data : []);
    } else {
      setCategories([]);
      toast.error('Erreur chargement catégories');
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const loadDirections = async () => {
      const result = await doleanceService.getDirections();
      if (result.success) {
        setDirections(Array.isArray(result.data) ? result.data : []);
      }
    };
    loadDirections();
  }, []);

  const filtered = categories.filter((c) =>
    !search || 
    (c.nom_categorie || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.nom_malgache || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.direction_concernee || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormData({
      nom_categorie: '',
      nom_malgache: '',
      description: '',
      direction_concernee: '',
      couleur: '#3B82F6',
      icone: '',
      module: activeTab,
      actif: 1,
    });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setFormData({
      nom_categorie: cat.nom_categorie || '',
      nom_malgache: cat.nom_malgache || '',
      description: cat.description || '',
      direction_concernee: cat.direction_concernee || '',
      couleur: cat.couleur || '#3B82F6',
      icone: cat.icone || '',
      module: cat.module || activeTab,
      actif: cat.actif !== undefined ? cat.actif : 1,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nom_categorie.trim()) {
      toast.error('Le nom français est requis');
      return;
    }
    setSaving(true);
    let result;
    if (editing) {
      result = await doleanceService.updateCategory(editing.id_categorie, formData);
    } else {
      result = await doleanceService.createCategory(formData);
    }
    if (result.success) {
      toast.success(editing ? 'Catégorie modifiée' : 'Catégorie créée');
      setShowModal(false);
      fetchCategories();
    } else {
      toast.error(result.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const result = await doleanceService.deleteCategory(id);
    if (result.success) {
      toast.success('Catégorie supprimée');
      setShowDeleteConfirm(null);
      fetchCategories();
    } else {
      toast.error(result.message || 'Erreur lors de la suppression');
      setShowDeleteConfirm(null);
    }
  };

  const toggleActif = async (cat) => {
    const newVal = cat.actif ? 0 : 1;
    const result = await doleanceService.updateCategory(cat.id_categorie, { ...cat, actif: newVal });
    if (result.success) {
      toast.success(newVal ? 'Catégorie activée' : 'Catégorie désactivée');
      fetchCategories();
    } else {
      toast.error(result.message || 'Erreur');
    }
  };

  return (
    <div className="max-auto mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestion des catégories</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-800 text-blue-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
            Aucune catégorie trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nom français</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Traduction malgache</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">Direction concernée</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden md:table-cell">Description</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actif</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((cat) => (
                  <tr key={cat.id_categorie} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {cat.couleur && (
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.couleur }} />
                        )}
                        <span className="font-medium text-gray-800 dark:text-gray-100">{cat.nom_categorie}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{cat.nom_malgache || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{cat.direction_concernee || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                      {cat.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActif(cat)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          cat.actif ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            cat.actif ? 'translate-x-[18px]' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(cat)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-600">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <input type="hidden" name="module" value={activeTab} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nom français *</label>
                <input
                  type="text"
                  required
                  value={formData.nom_categorie}
                  onChange={(e) => setFormData({ ...formData, nom_categorie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Voirie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Traduction malgache</label>
                <input
                  type="text"
                  value={formData.nom_malgache}
                  onChange={(e) => setFormData({ ...formData, nom_malgache: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Lalana"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Direction/Service concerné</label>
                <select
                  value={formData.direction_concernee}
                  onChange={(e) => setFormData({ ...formData, direction_concernee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucune direction</option>
                  {directions.map((dir) => (
                    <option key={dir.id_direction} value={dir.nom_direction}>
                      {dir.nom_direction}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description de la catégorie"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Couleur</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.couleur || '#3B82F6'}
                      onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                      className="w-9 h-9 rounded cursor-pointer border border-gray-200 dark:border-slate-600"
                    />
                    <select
                      value={formData.couleur || '#3B82F6'}
                      onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Icône</label>
                  <select
                    value={formData.icone}
                    onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic.value} value={ic.value}>{ic.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif !== 0}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked ? 1 : 0 })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="actif" className="text-sm text-gray-700 dark:text-gray-200">Catégorie active</label>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Êtes-vous sûr de vouloir supprimer la catégorie :
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
              « {showDeleteConfirm.nom_categorie} » ?
            </p>
            <p className="text-xs text-red-600 mb-4">
              Les doléances liées à cette catégorie ne seront pas supprimées.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id_categorie)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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

export default Categories;