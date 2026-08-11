import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStatsRefresh } from '../contexts/StatsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  UserIcon,
  MapPinIcon,
  PhotoIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

function generateReference() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DOL-${year}${month}${day}-${random}`;
}

function AjouterDoleance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifyStatsChange } = useStatsRefresh();
  const fileInputRef = useRef(null);

  const [reference] = useState(generateReference());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    id_categorie: '',
    nom_citoyen: '',
    prenom_citoyen: '',
    email_citoyen: '',
    telephone_citoyen: '',
    adresse_citoyen: '',
    quartier: '',
    lieu_exact: '',
    suggestions: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/doleances/categories');
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error('Erreur chargement données:', err);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
    'application/pdf'
  ];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024;
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} est trop volumineux (max 50 Mo)`);
      } else if (!allowedMimeTypes.includes(file.type)) {
        errors.push(`${file.name} - Type non autorisé. Formats acceptés : images, vidéos (MP4, MOV, AVI, MKV), PDF`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) errors.forEach((err) => toast.error(err));
    if (validFiles.length + files.length > 5) {
      toast.error('Maximum 5 images autorisées');
      return;
    }
    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const maxSize = 50 * 1024 * 1024;
    const validFiles = [];
    const errors = [];

    droppedFiles.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} est trop volumineux (max 50 Mo)`);
      } else if (!allowedMimeTypes.includes(file.type)) {
        errors.push(`${file.name} - Type non autorisé. Formats acceptés : images, vidéos (MP4, MOV, AVI, MKV), PDF`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) errors.forEach((err) => toast.error(err));
    if (validFiles.length + files.length > 5) {
      toast.error('Maximum 5 images autorisées');
      return;
    }
    setFiles((prev) => [...prev, ...validFiles]);
  }, [files.length]);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (doleanceId) => {
    if (files.length === 0) return;
    const formDataFiles = new FormData();
    files.forEach((file) => formDataFiles.append('files', file));
    formDataFiles.append('doleance_id', doleanceId);

    const uploadResponse = await api.post('/doleances/public/upload', formDataFiles, {
      headers: { 'Content-Type': undefined },
    });
    if (!uploadResponse.data?.success) {
      throw new Error(uploadResponse.data?.message || 'Upload failed');
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.titre.trim() || !formData.description.trim() || !formData.id_categorie) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (!formData.nom_citoyen.trim() || !formData.prenom_citoyen.trim()) {
      toast.error('Le nom et le prénom du citoyen sont requis');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        telephone_citoyen: formData.telephone_citoyen || null,
        email_citoyen: formData.email_citoyen || null,
        adresse_citoyen: formData.adresse_citoyen || null,
        quartier: formData.quartier?.trim() || null,
      };

      const response = await api.post('/doleances', dataToSend);

      if (response.data.success) {
        const doleanceId = response.data.data.id_doleance;

        if (files.length > 0 && doleanceId) {
          try {
            await uploadFiles(doleanceId);
          } catch (uploadErr) {
            console.error('Erreur upload:', uploadErr);
            toast.error('Doléance créée mais erreur lors de l\'upload des images');
          }
        }

        toast.success(`Doléance créée (${response.data.data.reference})`);
        notifyStatsChange();
        navigate('/backoffice/doleances');
      }
    } catch (error) {
      console.error('Erreur création doléance:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  }, [formData, files, navigate]);

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const textareaClass = `${inputClass} resize-none`;
  const labelClass = "block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1";
  const requiredStar = <span className="text-red-500">*</span>;

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-auto mx-5">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/backoffice/doleances')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Ajouter une doléance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Créer une doléance au nom d'un citoyen</p>
        </div>
      </div>

      {/* Référence */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 mb-6 shadow-md">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="h-6 w-6 text-white/80" />
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Référence</p>
            <p className="text-lg font-mono font-bold text-white">{reference}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informations sur la doléance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            Informations sur la doléance
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Titre {requiredStar}</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: Route dégradée à Analakely"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Description {requiredStar}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={textareaClass}
                placeholder="Décrivez le problème signalé..."
                required
              />
            </div>
            <div>
              <label className={labelClass}>Catégorie {requiredStar}</label>
              <select
                name="id_categorie"
                value={formData.id_categorie}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>
                    {cat.nom_categorie}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Informations du citoyen */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <UserIcon className="h-6 w-6 text-blue-600" />
            Informations du citoyen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nom {requiredStar}</label>
              <input
                type="text"
                name="nom_citoyen"
                value={formData.nom_citoyen}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nom du citoyen"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Prénom {requiredStar}</label>
              <input
                type="text"
                name="prenom_citoyen"
                value={formData.prenom_citoyen}
                onChange={handleChange}
                className={inputClass}
                placeholder="Prénom du citoyen"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email_citoyen"
                value={formData.email_citoyen}
                onChange={handleChange}
                className={inputClass}
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input
                type="tel"
                name="telephone_citoyen"
                value={formData.telephone_citoyen}
                onChange={handleChange}
                className={inputClass}
                placeholder="034 00 000 00"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresse</label>
              <input
                type="text"
                name="adresse_citoyen"
                value={formData.adresse_citoyen}
                onChange={handleChange}
                className={inputClass}
                placeholder="Adresse du citoyen"
              />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <MapPinIcon className="h-6 w-6 text-blue-600" />
            Localisation de l'incident
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Quartier</label>
              <input
                type="text"
                name="quartier"
                value={formData.quartier}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: Analakely, Isotry, Andraharo..."
              />
            </div>
            <div>
              <label className={labelClass}>Adresse de l'incident</label>
              <input
                type="text"
                name="lieu_exact"
                value={formData.lieu_exact}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: Avenue de l'Indépendance, face au marché"
              />
            </div>
            <div>
              <label className={labelClass}>Suggestions</label>
              <textarea
                name="suggestions"
                value={formData.suggestions}
                onChange={handleChange}
                rows={2}
                className={textareaClass}
                placeholder="Suggestions du citoyen pour résoudre le problème..."
              />
            </div>
          </div>
        </div>

        {/* Images / Pièces jointes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 md:p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PhotoIcon className="h-6 w-6 text-blue-600" />
            Images (optionnel)
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">— Max 5 images, 50 Mo chacune</span>
          </h2>

          {/* Zone de drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <CloudArrowUpIcon className={`h-10 w-10 mx-auto mb-2 ${dragOver ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
              Glissez vos images ici ou <span className="text-blue-600 underline">parcourir</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, GIF — Max 50 Mo</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Aperçu des images */}
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((file, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 shadow-sm">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-28 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                  <div className="p-1.5 bg-white dark:bg-slate-800">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/backoffice/doleances')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40 disabled:opacity-60 transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/40 border-t-white" />
                Création en cours...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-6 w-6" />
                Créer la doléance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AjouterDoleance;
