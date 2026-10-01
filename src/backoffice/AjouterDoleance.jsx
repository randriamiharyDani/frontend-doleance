import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useStatsRefresh } from '../contexts/StatsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LocationPickerMap from '../components/common/LocationPickerMap';
import {
  ANTANANARIVO_CENTER,
  reverseGeocode,
  searchGeocode,
} from '../services/geocodingService';
import {
  DocumentTextIcon,
  UserIcon,
  MapPinIcon,
  PhotoIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

function generateReference() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DOL-${year}${month}${day}-${random}`;
}

const MAP_LABELS = {
  coordinates: 'Coordonnées GPS',
  copy: 'Copier',
  copied: 'Coordonnées copiées !',
  copyError: 'Copie impossible',
  noPosition: 'Aucune position sélectionnée',
  hint: 'Cliquez sur la carte ou déplacez le marqueur pour situer l\'incident',
  recenter: 'Recentrer sur le marqueur',
  showQuartiers: 'Afficher les quartiers',
  hideQuartiers: 'Masquer les quartiers',
  refLabel: 'Référence :',
};

/* --- Recherche d'adresse sur la carte ----------------------------------- */
const MIN_SEARCH_CHARS = 3;
const SEARCH_RESULT_LIMIT = 8;
/** Demi-largeur (en degrés) de la zone de biais géographique, ~20 km. */
const SEARCH_BIAS_SPAN = 0.18;
/** Attente avant interrogation automatique pendant la saisie. */
const SEARCH_DEBOUNCE_MS = 350;

/** Découpe un `display_name` Nominatim en libellé principal + complément. */
function splitDisplayName(displayName) {
  const parts = String(displayName || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return { primary: parts[0] || '', secondary: parts.slice(1, 3).join(', ') };
}

/** Type de lieu lisible, utilisé comme pastille sur chaque résultat. */
function resultTypeLabel(item) {
  const raw = item?.type || item?.category || item?.class;
  if (!raw) return '';
  const map = {
    amenity: 'équipement',
    building: 'bâtiment',
    shop: 'commerce',
    highway: 'voie',
    place: 'lieu',
    tourism: 'tourisme',
    office: 'bureau',
    craft: 'atelier',
    healthcare: 'santé',
    school: 'école',
    university: 'université',
    railway: 'gare',
    aeroway: 'aéroport',
  };
  return map[raw] || raw;
}

/** Met en évidence le fragment de texte correspondant à la saisie. */
function HighlightMatch({ text, query }) {
  const needle = (query || '').trim();
  if (!needle || !text) return <>{text}</>;
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 rounded px-0.5">
        {text.slice(index, index + needle.length)}
      </mark>
      {text.slice(index + needle.length)}
    </>
  );
}

function AjouterDoleance() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { notifyStatsChange } = useStatsRefresh();
  const fileInputRef = useRef(null);

  const [reference, setReference] = useState(generateReference());
  const [manualReferenceMode, setManualReferenceMode] = useState(false);
  const [referenceAvailable, setReferenceAvailable] = useState(null);
  const [referenceChecking, setReferenceChecking] = useState(false);
  const referenceCheckTimerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  /* --- Localisation ------------------------------------------------------ */
  const [mapPosition, setMapPosition] = useState(null);
  const [flyToSignal, setFlyToSignal] = useState(0);
  const [quartierGeoJSON, setQuartierGeoJSON] = useState(null);
  const [resolvedPlace, setResolvedPlace] = useState('');
  const [mapSearch, setMapSearch] = useState('');
  const [mapSuggestions, setMapSuggestions] = useState([]);
  const [showMapSuggestions, setShowMapSuggestions] = useState(false);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [mapSearchDone, setMapSearchDone] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const mapSearchAbortRef = useRef(null);
  const mapSearchTimerRef = useRef(null);
  const mapSearchInputRef = useRef(null);
  const mapOptionRefs = useRef([]);
  const reverseAbortRef = useRef(null);
  const reverseTimerRef = useRef(null);

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
      const [catRes, geoRes] = await Promise.all([
        api.get('/doleances/categories').catch(() => null),
        api.get('/doleances/quartiers/geojson').catch(() => null),
      ]);

      if (catRes?.data?.success) setCategories(catRes.data.data);
      else if (!catRes) toast.error('Erreur lors du chargement des données');

      if (geoRes?.data) {
        setQuartierGeoJSON(
          geoRes.data?.features?.length
            ? geoRes.data
            : { type: 'FeatureCollection', features: [] },
        );
      }

      setLoadingData(false);
    };
    fetchData();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'lieu_exact' && value.trim()) setResolvedPlace('');
  }, []);

  /* --- Géocodage inverse (adresse déduite du point choisi) --------------- */
  const cancelReverse = useCallback(() => {
    if (reverseTimerRef.current) {
      clearTimeout(reverseTimerRef.current);
      reverseTimerRef.current = null;
    }
    reverseAbortRef.current?.abort();
  }, []);

  const applyResolvedPlace = useCallback((data) => {
    const addr = data?.address || {};
    setResolvedPlace(data.display_name || '');
    // Ne jamais écraser une saisie manuelle de l'agent.
    setFormData((prev) => {
      const next = { ...prev };
      if (!next.lieu_exact?.trim() && data.display_name) next.lieu_exact = data.display_name;
      if (!next.quartier?.trim()) {
        const quartier = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district;
        if (quartier) next.quartier = quartier;
      }
      return next;
    });
  }, []);

  const resolvePlace = useCallback(
    (latlng) => {
      cancelReverse();
      const controller = new AbortController();
      reverseAbortRef.current = controller;
      reverseTimerRef.current = setTimeout(async () => {
        try {
          const data = await reverseGeocode(latlng, { signal: controller.signal });
          if (data) applyResolvedPlace(data);
          else setResolvedPlace('');
        } catch (err) {
          if (err.name === 'AbortError') return;
          setResolvedPlace('');
        }
      }, 500);
    },
    [cancelReverse, applyResolvedPlace],
  );

  /* --- Sélection du point sur la carte ---------------------------------- */
  const handleMapPick = useCallback(
    (latlng) => {
      setMapPosition([latlng.lat, latlng.lng]);
      resolvePlace(latlng);
    },
    [resolvePlace],
  );

  /* --- Recherche d'adresse --------------------------------------------- */
  // Biais géographique : sans point placé, on centre sur Antananarivo. Le
  // viewbox ne restreint pas les résultats, il les ordonne par proximité.
  const mapSearchViewbox = useMemo(() => {
    const [lat, lng] = mapPosition || ANTANANARIVO_CENTER;
    const span = SEARCH_BIAS_SPAN;
    return `${lng - span},${lat - span},${lng + span},${lat + span}`;
  }, [mapPosition]);

  const resetMapSearch = useCallback(() => {
    if (mapSearchTimerRef.current) clearTimeout(mapSearchTimerRef.current);
    mapSearchAbortRef.current?.abort();
    setMapSearch('');
    setMapSuggestions([]);
    setShowMapSuggestions(false);
    setMapSearchDone(false);
    setActiveSuggestion(-1);
  }, []);

  const runMapSearch = useCallback(
    async (value) => {
      const query = value.trim();
      if (query.length < MIN_SEARCH_CHARS) return [];

      if (mapSearchAbortRef.current) mapSearchAbortRef.current.abort();
      const controller = new AbortController();
      mapSearchAbortRef.current = controller;
      setIsSearchingMap(true);
      setShowMapSuggestions(true);
      setActiveSuggestion(-1);

      try {
        const results = await searchGeocode(query, {
          signal: controller.signal,
          limit: SEARCH_RESULT_LIMIT,
          viewbox: mapSearchViewbox,
        });
        // Élimine les doublons exacts renvoyés par Nominatim.
        const seen = new Set();
        const unique = results.filter((item) => {
          const key = `${item.lat},${item.lon},${item.display_name}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setMapSuggestions(unique);
        setMapSearchDone(true);
        return unique;
      } catch (err) {
        if (err.name === 'AbortError') return [];
        setMapSuggestions([]);
        setMapSearchDone(true);
        toast.error('Recherche indisponible. Réessayez dans un instant.');
        return [];
      } finally {
        // Ne libère l'indicateur que si aucune requête plus récente n'a démarré.
        if (mapSearchAbortRef.current === controller) setIsSearchingMap(false);
      }
    },
    [mapSearchViewbox],
  );

  const handleMapSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setMapSearch(value);
      setActiveSuggestion(-1);
      setMapSearchDone(false);
      if (mapSearchTimerRef.current) clearTimeout(mapSearchTimerRef.current);

      if (value.trim().length < MIN_SEARCH_CHARS) {
        // L'abort déclenche le `finally` de la requête en cours, qui libère
        // l'indicateur d'activité.
        mapSearchAbortRef.current?.abort();
        setMapSuggestions([]);
        setShowMapSuggestions(false);
        return;
      }
      mapSearchTimerRef.current = setTimeout(() => runMapSearch(value), SEARCH_DEBOUNCE_MS);
    },
    [runMapSearch],
  );

  const pickMapSuggestion = useCallback(
    (item) => {
      cancelReverse();
      setMapPosition([parseFloat(item.lat), parseFloat(item.lon)]);
      setFlyToSignal((n) => n + 1);
      applyResolvedPlace(item);
      setMapSearch('');
      setMapSuggestions([]);
      setShowMapSuggestions(false);
      setMapSearchDone(false);
      setActiveSuggestion(-1);
    },
    [cancelReverse, applyResolvedPlace],
  );

  const submitMapSearch = useCallback(async () => {
    const value = mapSearch.trim();
    if (value.length < MIN_SEARCH_CHARS) {
      toast.error(`Saisissez au moins ${MIN_SEARCH_CHARS} caractères pour rechercher.`);
      mapSearchInputRef.current?.focus();
      return;
    }
    if (isSearchingMap) return;

    // Résultats déjà affichés pour cette saisie : on sélectionne la ligne
    // surlignée au clavier, sinon le premier résultat, sans appel réseau.
    if (mapSuggestions.length > 0 && showMapSuggestions) {
      const target =
        activeSuggestion >= 0 ? mapSuggestions[activeSuggestion] : mapSuggestions[0];
      if (target) {
        pickMapSuggestion(target);
        return;
      }
    }

    const results = await runMapSearch(value);
    if (results.length > 0) pickMapSuggestion(results[0]);
    else toast.error(`Aucun résultat trouvé pour « ${value} ».`);
  }, [
    mapSearch,
    mapSuggestions,
    showMapSuggestions,
    isSearchingMap,
    activeSuggestion,
    runMapSearch,
    pickMapSuggestion,
  ]);

  const handleMapSearchKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setShowMapSuggestions(false);
        setActiveSuggestion(-1);
        return;
      }
      const count = mapSuggestions.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!showMapSuggestions || count === 0) return;
        e.preventDefault();
        setActiveSuggestion((current) => {
          const next =
            e.key === 'ArrowDown'
              ? (current + 1) % count
              : (current <= 0 ? count - 1 : current - 1);
          mapOptionRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        submitMapSearch();
      }
    },
    [mapSuggestions.length, showMapSuggestions, submitMapSearch],
  );

  const clearMapPosition = useCallback(() => {
    cancelReverse();
    setMapPosition(null);
    setResolvedPlace('');
  }, [cancelReverse]);

  useEffect(() => {
    return () => {
      if (mapSearchTimerRef.current) clearTimeout(mapSearchTimerRef.current);
      if (mapSearchAbortRef.current) mapSearchAbortRef.current.abort();
      if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
      if (reverseAbortRef.current) reverseAbortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (referenceCheckTimerRef.current) clearTimeout(referenceCheckTimerRef.current);
    };
  }, []);

  const checkReferenceAvailability = useCallback(async (value) => {
    const ref = (value ?? '').trim();
    if (!ref) {
      setReferenceAvailable(null);
      setReferenceChecking(false);
      return true;
    }
    setReferenceChecking(true);
    try {
      const res = await api.get(`/doleances/public/check-reference/${encodeURIComponent(ref)}`);
      const available = res.data?.success ? res.data.available !== false : null;
      setReferenceAvailable(available);
      return available;
    } catch (err) {
      console.error('Erreur vérification référence:', err);
      setReferenceAvailable(null);
      return null;
    } finally {
      setReferenceChecking(false);
    }
  }, []);

  const handleReferenceChange = (e) => {
    const value = e.target.value;
    setReference(value);
    setReferenceAvailable(null);
    if (referenceCheckTimerRef.current) clearTimeout(referenceCheckTimerRef.current);
    referenceCheckTimerRef.current = setTimeout(() => {
      checkReferenceAvailability(value);
    }, 400);
  };

  const enableManualReference = () => {
    if (referenceCheckTimerRef.current) clearTimeout(referenceCheckTimerRef.current);
    setManualReferenceMode(true);
    setReference('');
    setReferenceAvailable(null);
  };

  const disableManualReference = () => {
    if (referenceCheckTimerRef.current) clearTimeout(referenceCheckTimerRef.current);
    setReferenceAvailable(null);
    setReferenceChecking(false);
    setManualReferenceMode(false);
    setReference(generateReference());
  };

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

    if (manualReferenceMode) {
      if (!reference || !reference.trim()) {
        toast.error('Veuillez saisir une référence manuelle');
        setLoading(false);
        return;
      }
      if (reference.length > 50) {
        toast.error('La référence ne doit pas dépasser 50 caractères');
        setLoading(false);
        return;
      }
      if (referenceAvailable === false) {
        toast.error('Cette référence existe déjà. Veuillez en choisir une autre.');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        telephone_citoyen: formData.telephone_citoyen || null,
        email_citoyen: formData.email_citoyen || null,
        adresse_citoyen: formData.adresse_citoyen || null,
        quartier: formData.quartier?.trim() || null,
        latitude: mapPosition ? mapPosition[0] : null,
        longitude: mapPosition ? mapPosition[1] : null,
      };

      if (manualReferenceMode && reference.trim()) {
        const isAvailable = await checkReferenceAvailability(reference.trim());
        if (isAvailable === false) {
          toast.error('Cette référence existe déjà. Veuillez en choisir une autre.');
          setLoading(false);
          return;
        }
        dataToSend.reference = reference.trim();
      }

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
  }, [formData, files, navigate, manualReferenceMode, reference, referenceAvailable, checkReferenceAvailability, mapPosition]);

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const textareaClass = `${inputClass} resize-none`;
  const labelClass = "block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1";
  const requiredStar = <span className="text-red-500">*</span>;

  /* --- Boutons : base commune pour un rendu homogène -------------------- */
  const btnBase = 'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed';
  const btnPrimary = `${btnBase} px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40 hover:from-blue-700 hover:to-blue-800`;
  const btnSecondary = `${btnBase} px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700`;
  const btnGhost = `${btnBase} px-3 py-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600`;
  const btnIcon = `${btnBase} p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700`;
  const btnOnBlue = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-white/20 hover:bg-white/30 border border-white/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/backoffice/doleances')}
          className={btnIcon}
          aria-label="Retour à la liste des doléances"
          title="Retour à la liste des doléances"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Ajouter une doléance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Créer une doléance au nom d'un citoyen</p>
        </div>
      </div>

      {/* Référence */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 mb-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-6 w-6 text-white/80" />
            <p className="text-xs text-white/60 uppercase tracking-wide">Référence</p>
          </div>
          <button
            type="button"
            onClick={manualReferenceMode ? disableManualReference : enableManualReference}
            className={btnOnBlue}
            aria-pressed={manualReferenceMode}
          >
            {manualReferenceMode ? 'Génération auto' : 'Saisir manuellement'}
          </button>
        </div>

        {manualReferenceMode ? (
          <div>
            <input
              type="text"
              value={reference}
              onChange={handleReferenceChange}
              maxLength={50}
              placeholder="Ex: DOL-20250901-0001"
              className="w-full px-3 py-2 text-lg font-mono font-bold bg-white/20 border border-white/30 text-white placeholder-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <div className="flex items-center gap-2 mt-1 min-h-[20px]">
              {referenceChecking && (
                <p className="text-xs text-white/60 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Vérification…
                </p>
              )}
              {!referenceChecking && reference && referenceAvailable === true && (
                <p className="text-xs text-green-300">Référence disponible</p>
              )}
              {!referenceChecking && reference && referenceAvailable === false && (
                <p className="text-xs text-red-300">Cette référence existe déjà</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-lg font-mono font-bold text-white">{reference}</p>
        )}
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <MapPinIcon className="h-6 w-6 text-blue-600" />
              Localisation de l'incident
            </h2>
            {mapPosition && (
              <button
                type="button"
                onClick={clearMapPosition}
                className={btnGhost}
                aria-label="Effacer le point sélectionné sur la carte"
                title="Retirer le marqueur et l'adresse associée"
              >
                <XMarkIcon className="h-4 w-4" />
                Effacer le point
              </button>
            )}
          </div>

          {/* Recherche d'adresse */}
          <div className="mb-4">
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  ref={mapSearchInputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={showMapSuggestions}
                  aria-controls="map-search-results"
                  aria-autocomplete="list"
                  aria-label="Rechercher une adresse sur la carte"
                  aria-activedescendant={
                    activeSuggestion >= 0 ? `map-search-option-${activeSuggestion}` : undefined
                  }
                  value={mapSearch}
                  onChange={handleMapSearchChange}
                  onKeyDown={handleMapSearchKeyDown}
                  onFocus={() => mapSearch.trim().length >= MIN_SEARCH_CHARS && setShowMapSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowMapSuggestions(false), 200)}
                  placeholder="Rechercher un lieu, une adresse, un quartier..."
                  className={`${inputClass} pl-9 ${isSearchingMap || mapSearch ? 'pr-16' : 'pr-9'}`}
                />
                {isSearchingMap && (
                  <ArrowPathIcon className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
                )}
                {mapSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      resetMapSearch();
                      mapSearchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Effacer la recherche"
                    title="Effacer la recherche"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                )}

                {showMapSuggestions && (
                  <div
                    id="map-search-results"
                    role="listbox"
                    aria-label="Résultats de recherche d'adresse"
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-[1001] max-h-72 overflow-y-auto"
                  >
                    {isSearchingMap && (
                      <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                        Recherche en cours…
                      </div>
                    )}

                    {!isSearchingMap && !mapSearchDone && (
                      <div className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        Saisissez le nom d&apos;un lieu, d&apos;une rue ou d&apos;un quartier.
                      </div>
                    )}

                    {!isSearchingMap && mapSearchDone && mapSuggestions.length === 0 && (
                      <div className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        Aucun résultat. Essayez un autre mot-clé ou cliquez directement sur la carte.
                      </div>
                    )}

                    {mapSuggestions.map((item, i) => {
                      const { primary, secondary } = splitDisplayName(item.display_name);
                      const typeLabel = resultTypeLabel(item);
                      const isActive = i === activeSuggestion;
                      return (
                        <button
                          key={`${item.lat}-${item.lon}-${i}`}
                          id={`map-search-option-${i}`}
                          ref={(el) => {
                            mapOptionRefs.current[i] = el;
                          }}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickMapSuggestion(item)}
                          className={`w-full text-left px-3 py-2 border-b border-gray-50 dark:border-slate-700 last:border-0 transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/30'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                <HighlightMatch text={primary} query={mapSearch} />
                              </span>
                              {secondary && (
                                <span className="block text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                  {secondary}
                                </span>
                              )}
                            </span>
                            {typeLabel && (
                              <span className="flex-shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                                {typeLabel}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}

                    {mapSuggestions.length > 0 && (
                      <div className="px-3 py-1.5 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-900/40">
                        ↑ ↓ pour naviguer · Entrée pour sélectionner · Échap pour fermer
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={submitMapSearch}
                disabled={isSearchingMap || mapSearch.trim().length < MIN_SEARCH_CHARS}
                className={`${btnPrimary} px-4 flex-shrink-0`}
                aria-busy={isSearchingMap}
              >
                {isSearchingMap ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="h-4 w-4" />
                )}
                Rechercher
              </button>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              {MIN_SEARCH_CHARS} caractères minimum. Le marqueur se place sur l&apos;emplacement choisi.
            </p>
          </div>

          {/* Carte */}
          <LocationPickerMap
            position={mapPosition}
            onPick={handleMapPick}
            dark={darkMode}
            zoom={15}
            flyToSignal={flyToSignal}
            geojson={quartierGeoJSON}
            labels={MAP_LABELS}
            heightClass="h-72 sm:h-96"
          />

          {resolvedPlace && resolvedPlace !== formData.lieu_exact && (
            <p className="mt-3 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2">
              <span className="font-semibold">Adresse détectée sur la carte : </span>
              {resolvedPlace}
            </p>
          )}

          <div className="space-y-4 mt-4">
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
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Remplie automatiquement d'après le point placé sur la carte si vous la laissez vide.
              </p>
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
            role="button"
            tabIndex={0}
            aria-label="Ajouter des pièces jointes : cliquez pour parcourir ou glissez-déposez vos fichiers"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
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
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                    aria-label={`Supprimer ${file.name}`}
                    title={`Supprimer ${file.name}`}
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
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/backoffice/doleances')}
            disabled={loading}
            className={btnSecondary}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className={btnPrimary}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Création en cours…
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
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
