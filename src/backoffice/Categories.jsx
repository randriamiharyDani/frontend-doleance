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
    description_malagasy: '',
    direction_concernee: '',
    id_direction: '',
    couleur: '#3B82F6',
    icone: '',
    module: 'CUA',
    actif: 1,
  });
  const [saving, setSaving] = useState(false);
  const [directions, setDirections] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  const tabs = [
    { key: 'CUA', label: 'Catégories CUA' },
    { key: 'Sapeurs-Pompiers', label: 'Catégories Sapeurs-Pompiers' },
    { key: 'Police Municipale', label: 'Catégories Police Municipale' },
    { key: 'BMH', label: 'Catégories BMH' },
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
      description_malagasy: '',
      direction_concernee: '',
      id_direction: '',
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
      description_malagasy: cat.description_malagasy || '',
      direction_concernee: cat.direction_concernee || '',
      id_direction: cat.id_direction || '',
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

  // La catégorie n'est jamais retirée de la liste : on bascule uniquement
  // son statut actif/inactif, et l'affichage la grise (masquage visuel).
  const toggleActif = async (cat) => {
    const newVal = cat.actif ? 0 : 1;
    setTogglingId(cat.id_categorie);

    // Mise à jour optimiste pour un retour visuel immédiat
    setCategories((prev) =>
      prev.map((c) => (c.id_categorie === cat.id_categorie ? { ...c, actif: newVal } : c))
    );

    const result = await doleanceService.updateCategory(cat.id_categorie, { ...cat, actif: newVal });

    if (result.success) {
      toast.success(newVal ? 'Catégorie activée' : 'Catégorie désactivée (masquée)');
    } else {
      // rollback si l'API échoue
      setCategories((prev) =>
        prev.map((c) => (c.id_categorie === cat.id_categorie ? { ...c, actif: cat.actif } : c))
      );
      toast.error(result.message || 'Erreur');
    }
    setTogglingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des catégories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les catégories de doléances</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary btn-md"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-1 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-800 text-blue-700 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher..."
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
            Aucune catégorie trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom français</th>
                  <th>Traduction malgache</th>
                  <th className="hidden sm:table-cell">Direction concernée</th>
                  <th className="hidden md:table-cell">Description</th>
                  <th className="hidden lg:table-cell">Description malgache</th>
                  <th className="text-center">Actif</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => {
                  const isInactive = !cat.actif;
                  return (
                    <tr
                      key={cat.id_categorie}
                      className={`transition-colors ${
                        isInactive
                          ? 'bg-gray-50/70 dark:bg-slate-800/40 opacity-60 hover:opacity-100'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          {cat.couleur && (
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.couleur, filter: isInactive ? 'grayscale(1)' : 'none' }}
                            />
                          )}
                          <span className={`font-medium ${isInactive ? 'text-gray-400 dark:text-gray-500 line-through decoration-1' : 'text-gray-900 dark:text-white'}`}>
                            {cat.nom_categorie}
                          </span>
                          {isInactive && (
                            <span className="badge bg-gray-200 text-gray-500 dark:bg-slate-600 dark:text-gray-300">
                              Masquée
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={isInactive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}>
                        {cat.nom_malgache || '-'}
                      </td>
                      <td className={`hidden sm:table-cell ${isInactive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                        {cat.direction_concernee || '-'}
                      </td>
                      <td className={`hidden md:table-cell max-w-xs truncate ${isInactive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {cat.description || '-'}
                      </td>
                      <td className={`hidden lg:table-cell max-w-xs truncate ${isInactive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {cat.description_malagasy || '-'}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => toggleActif(cat)}
                          disabled={togglingId === cat.id_categorie}
                          title={cat.actif ? 'Désactiver (masquer)' : 'Activer'}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
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
                      <td className="text-right">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-600">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <input type="hidden" name="module" value={activeTab} />
              <div>
                <label className="label">Nom français *</label>
                <input
                  type="text"
                  required
                  value={formData.nom_categorie}
                  onChange={(e) => setFormData({ ...formData, nom_categorie: e.target.value })}
                  className="input"
                  placeholder="Ex: Voirie"
                />
              </div>
              <div>
                <label className="label">Traduction malgache</label>
                <input
                  type="text"
                  value={formData.nom_malgache}
                  onChange={(e) => setFormData({ ...formData, nom_malgache: e.target.value })}
                  className="input"
                  placeholder="Ex: Lalana"
                />
              </div>
              <div>
                <label className="label">Direction/Service concerné</label>
                <select
                  value={formData.id_direction || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedDir = directions.find(d => String(d.id_direction) === selectedId);
                    setFormData({
                      ...formData,
                      id_direction: selectedId || '',
                      direction_concernee: selectedDir ? selectedDir.nom_direction : '',
                    });
                  }}
                  className="input"
                >
                  <option value="">Aucune direction (Autre / Hafa)</option>
                  {directions.map((dir) => (
                    <option key={dir.id_direction} value={dir.id_direction}>
                      {dir.nom_direction}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Description (français)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="input"
                  placeholder="Description en français"
                />
              </div>
              <div>
                <label className="label">Description malgache</label>
                <textarea
                  value={formData.description_malagasy}
                  onChange={(e) => setFormData({ ...formData, description_malagasy: e.target.value })}
                  rows={3}
                  className="input"
                  placeholder="Famaritana amin'ny teny malagasy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Couleur</label>
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
                      className="input flex-1"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Icône</label>
                  <select
                    value={formData.icone}
                    onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                    className="input"
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="actif" className="text-sm text-gray-700 dark:text-gray-200">Catégorie active</label>
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
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
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
              Êtes-vous sûr de vouloir supprimer la catégorie :
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              « {showDeleteConfirm.nom_categorie} » ?
            </p>
            <p className="text-xs text-red-500 mb-4">
              Les doléances liées à cette catégorie ne seront pas supprimées.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary btn-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id_categorie)}
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

export default Categories;
