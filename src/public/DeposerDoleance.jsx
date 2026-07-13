import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import EmailService from '../services/emailService';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const categories = [
  { id: 1, label: 'Trou dans la route', icon: 'M13.5 4L5.25 12.25l4.5 4.5L18 8.5', desc: 'Nids-de-poule, fissures, affaissements', gradient: 'from-red-500 to-orange-500' },
  { id: 2, label: 'Déchets', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', desc: 'Dépôts sauvages, encombrants', gradient: 'from-emerald-500 to-teal-600' },
  { id: 3, label: 'Éclairage public', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', desc: 'Lampadaires défectueux, pannes', gradient: 'from-yellow-400 to-orange-500' },
  { id: 4, label: 'Espaces verts', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5', desc: 'Parcs, jardins, arbres', gradient: 'from-green-500 to-green-700' },
  { id: 5, label: 'Circulation', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', desc: 'Embouteillages, feux défectueux', gradient: 'from-purple-500 to-indigo-600' },
  { id: 6, label: 'Autres', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', desc: 'Tout autre problème', gradient: 'from-gray-400 to-gray-600' },
];

function DraggableMarker({ position, setPosition, onPositionChange }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onPositionChange) onPositionChange(e.latlng);
    },
  });

  return (
    <Marker
      draggable={true}
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            setPosition(marker.getLatLng());
            if (onPositionChange) onPositionChange(marker.getLatLng());
          }
        },
      }}
    />
  );
}

function MapView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function CategoryCard({ cat, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(cat.id)}
      className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-center cursor-pointer transition-all duration-200 border-2 ${
        selected
          ? 'border-[#0077FF] shadow-lg scale-[1.02]'
          : 'border-transparent hover:border-gray-200 hover:shadow-md'
      } bg-white shadow-sm hover:-translate-y-1`}
    >
      <div className={`w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-base sm:text-xl bg-gradient-to-br ${cat.gradient} shadow-md`}>
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
        </svg>
      </div>
      <div>
        <p className="text-xs sm:text-sm font-bold text-gray-800">{cat.label}</p>
        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 hidden sm:block">{cat.desc}</p>
      </div>
    </button>
  );
}

function DeposerDoleance() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [arrondissements, setArrondissements] = useState([]);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [savedReference, setSavedReference] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [sendingReference, setSendingReference] = useState(false);
  const [referenceSent, setReferenceSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [mapPosition, setMapPosition] = useState([-18.8792, 47.5079]);
  const [searchAddress, setSearchAddress] = useState('');
  const [locationName, setLocationName] = useState('');
  const [assignedDoleances, setAssignedDoleances] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const arrondissementCoords = {
    'Antananarivo Renivohitra': [-18.9100, 47.5250],
    'Antananarivo Atsimondrano': [-18.9400, 47.4700],
    'Antananarivo Avaradrano': [-18.8600, 47.5600],
    'Antananarivo Atsimo': [-18.9700, 47.5100],
    'Antananarivo Andrefana': [-18.9000, 47.4400],
    'Antananarivo Avaratra': [-18.8400, 47.4900],
  };

  const [formData, setFormData] = useState({
    nom_citoyen: '',
    prenom_citoyen: '',
    email: '',
    telephone: '',
    adresse_citoyen: '',
    lot: '',
    fokontany: '',
    arrondissement: '',
    titre: '',
    description: '',
    id_categorie: '1',
    id_quartier: '',
    lieu_exact: '',
    suggestions: ''
  });

  useEffect(() => {
    fetchData();
  }, [t]);

  const fetchData = async () => {
    try {
      const [categoriesRes, quartiersRes, assignedRes] = await Promise.all([
        api.get('/doleances/categories'),
        api.get('/doleances/quartiers'),
        api.get('/doleances/public/assigned-locations').catch(() => ({ data: { data: [] } }))
      ]);
      setCategoriesData(categoriesRes.data?.data || categoriesRes.data || []);
      setQuartiers(quartiersRes.data?.data || quartiersRes.data || []);
      setAssignedDoleances(assignedRes.data?.data || assignedRes.data || []);
      setArrondissements([
        t('districts.district1'), t('districts.district2'), t('districts.district3'),
        t('districts.district4'), t('districts.district5'), t('districts.district6')
      ]);
    } catch (error) {
      console.error('Erreur chargement donnees:', error);
      toast.error(t('errors.generic'));
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
    setFormData(prev => ({ ...prev, id_categorie: String(id) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'arrondissement' && arrondissementCoords[value]) {
      setMapPosition(arrondissementCoords[value]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024;
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} ${t('messages.fileTooBig')}`);
      } else if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        errors.push(`${file.name} ${t('messages.invalidFileType')}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) errors.forEach(err => toast.error(err));
    if (validFiles.length + files.length > 5) {
      toast.error(t('messages.maxFilesReached'));
      return;
    }
    setFiles(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const maxSize = 50 * 1024 * 1024;
    const validFiles = [];
    const errors = [];

    droppedFiles.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} ${t('messages.fileTooBig')}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) errors.forEach(err => toast.error(err));
    if (validFiles.length + files.length > 5) {
      toast.error(t('messages.maxFilesReached'));
      return;
    }
    setFiles(prev => [...prev, ...validFiles]);
  }, [files, t]);

  const uploadFiles = async (doleanceId) => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    const formDataFiles = new FormData();
    files.forEach(file => formDataFiles.append('files', file));
    formDataFiles.append('doleance_id', doleanceId);
    try {
      await api.post('/doleances/upload', formDataFiles, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(t('errors.generic'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const sendReferenceAuto = async (reference, contact, contactType, nom, prenom, titre) => {
    if (!contact || !reference) return;
    setSendingReference(true);
    setSendError(null);
    setEmailSent(false);
    setSmsSent(false);
    try {
      const result = await EmailService.sendReference(contact, reference, nom || 'Citoyen', prenom || '', titre || 'Doleance');
      if (result.success) {
        if (contactType === 'email') setEmailSent(true);
        else setSmsSent(true);
        setReferenceSent(true);
        toast.success(`Reference ${reference} envoyee a ${contact}`, { duration: 6000 });
      } else {
        setSendError(result.message);
        toast.error(result.message || t('errors.generic'), { duration: 6000 });
      }
    } catch (error) {
      console.error('Erreur envoi reference:', error);
      setSendError(error.message || 'Erreur inconnue');
      toast.error(t('errors.generic'), { duration: 6000 });
    } finally {
      setSendingReference(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email && !formData.telephone) { toast.error('Email ou telephone requis'); return; }
    if (!formData.nom_citoyen || !formData.prenom_citoyen || !formData.titre || !formData.description) {
      toast.error(t('messages.pleaseFillRequired')); return;
    }
    if (formData.telephone) {
      const digitsOnly = formData.telephone.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 10) { toast.error(t('messages.phoneLengthError')); return; }
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        contact: formData.email || formData.telephone,
        adresse_citoyen: formData.adresse_citoyen || null,
        telephone_citoyen: formData.telephone || null,
        email_citoyen: formData.email || null,
        latitude: mapPosition[0],
        longitude: mapPosition[1],
        lieu_exact: locationName || formData.lieu_exact || `${mapPosition[0].toFixed(4)}, ${mapPosition[1].toFixed(4)}`,
        description: `${formData.description}\n\nLocalisation: ${locationName || `${mapPosition[0].toFixed(4)}, ${mapPosition[1].toFixed(4)}`}\nSuggestions: ${formData.suggestions || 'Aucune suggestion'}`
      };

      const response = await api.post('/doleances', dataToSend);
      const reference = response.data.data?.reference || response.data.reference;
      const doleanceId = response.data.data?.id_doleance || response.data.id_doleance;

      if (files.length > 0 && doleanceId) await uploadFiles(doleanceId);

      setSavedReference(reference);
      const contactInfo = formData.email || formData.telephone;
      const contactType = formData.email ? 'email' : 'phone';
      if (contactInfo && reference) {
        await sendReferenceAuto(reference, contactInfo, contactType, formData.nom_citoyen, formData.prenom_citoyen, formData.titre);
      }

      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold">Signalement envoye avec succes !</p>
          <p className="text-sm">Reference: <span className="font-mono font-bold text-blue-600">{reference}</span></p>
        </div>,
        { duration: 8000 }
      );

      setShowReferenceModal(true);
      setTimeout(() => {
        if (showReferenceModal) {
          setShowReferenceModal(false);
          navigate(`/suivi-doleance/${reference}`);
        }
      }, 5000);

      setFormData({
        nom_citoyen: '', prenom_citoyen: '', email: '', telephone: '', adresse_citoyen: '', lot: '',
        fokontany: '', arrondissement: '', titre: '', description: '', id_categorie: '1',
        id_quartier: '', lieu_exact: '', suggestions: ''
      });
      setFiles([]);
      setReferenceSent(false); setEmailSent(false); setSmsSent(false); setSendError(null);

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };


  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Remplit le formulaire à partir d'un résultat Nominatim
const fillFromNominatim = (data) => {
  const addr = data.address || {};
  const quartierNom = addr.suburb || addr.neighbourhood || addr.quarter || '';

  // Essaie de matcher le quartier trouvé avec la liste existante
  const matchedQuartier = quartiers.find(
    q => q.nom_quartier.toLowerCase() === quartierNom.toLowerCase()
  );

  setFormData(prev => ({
    ...prev,
    arrondissement: addr.city_district || addr.district || prev.arrondissement,
    id_quartier: matchedQuartier ? matchedQuartier.id_quartier : prev.id_quartier,
    fokontany: prev.fokontany, // pas dispo via OSM, reste manuel
    lieu_exact: data.display_name || prev.lieu_exact,
  }));

  setSearchAddress(data.display_name || '');
};

// Bouton "Me localiser"
const handleLocateMe = () => {
  if (!navigator.geolocation) return;
  setIsLocating(true);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      setMapPosition([latitude, longitude]);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
        );
        const data = await res.json();
        fillFromNominatim(data);
      } catch (err) {
        console.error('Erreur reverse geocoding:', err);
      } finally {
        setIsLocating(false);
      }
    },
    (err) => {
      console.error('Erreur géolocalisation:', err);
      setIsLocating(false);
    }
  );
};

// Recherche avec suggestions (debounce 400ms)
const handleSearchInputChange = (e) => {
  const value = e.target.value;
  setSearchAddress(value);

  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

  if (value.trim().length < 3) {
    setSuggestions([]);
    setShowSuggestions(false);
    return;
  }

  searchTimeoutRef.current = setTimeout(async () => {
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Erreur recherche:', err);
    } finally {
      setIsSearching(false);
    }
  }, 400);
};

// Clic sur une suggestion
const handleSelectSuggestion = (item) => {
  setMapPosition([parseFloat(item.lat), parseFloat(item.lon)]);
  fillFromNominatim(item);
  setSuggestions([]);
  setShowSuggestions(false);
};

// Recherche via Entrée / bouton "Chercher" (prend la 1ère suggestion dispo)
const handleSearchAddress = async (e) => {
  e.preventDefault();
  if (suggestions.length > 0) {
    handleSelectSuggestion(suggestions[0]);
  }
};

  const charsCount = formData.description.length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2 sm:gap-3">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0077FF] to-[#0066DD] flex items-center justify-center text-white shadow-md flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Signaler un probleme
        </h1>
        <p className="sm:text-base text-gray-500 mt-1 ml-[44px] sm:ml-[52px]">Aidez a ameliorer votre quartier — signalez rapidement tout incident ou dysfonctionnement.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Categories */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#0077FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Categorie du probleme</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {categories.map(cat => (
              <CategoryCard key={cat.id} cat={cat} selected={selectedCategory === cat.id} onClick={handleSelectCategory} />
            ))}
          </div>
        </div>

        {/* Titre */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#0077FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Titre du probleme</h2>
          </div>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            placeholder="Ex: Nid-de-poule dangereux Rue de la Liberte"
            className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 text-sm font-medium text-gray-800 outline-none transition-all focus:border-[#0077FF] focus:shadow-md placeholder:text-gray-400"
            required
          />
        </div>

        {/* Map */}
{/* Localisation & Adresse (fusionné) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#0077FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-800">Localisation & Adresse</h2>
        </div>

        {/* Barre de recherche + Me localiser */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 relative">
          <form onSubmit={handleSearchAddress} className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 border-2 border-transparent focus-within:border-[#0077FF] focus-within:bg-white transition-all relative order-2 sm:order-1">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchAddress}
              onChange={handleSearchInputChange}
              onFocus={() => searchAddress.length >= 3 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Rechercher une adresse, un quartier..."
              className="flex-1 bg-transparent py-2.5 sm:py-3 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400 min-w-0"
            />
            {isSearching && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#0077FF] rounded-full animate-spin flex-shrink-0" />
            )}
            <button type="submit" className="text-xs font-semibold text-[#0077FF] hover:text-[#0066DD] py-1 px-2 rounded-lg hover:bg-blue-50 transition-all flex-shrink-0">
              Chercher
            </button>

            {/* Dropdown de suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-[1001] max-h-60 overflow-y-auto">
                {suggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
          </form>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-md disabled:opacity-60 order-1 sm:order-2"
            style={{ background: 'linear-gradient(135deg, #0077FF, #0066DD)' }}
          >
            {isLocating ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <span className="hidden sm:inline">Me localiser</span>
            <span className="sm:hidden">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Carte */}
        <div className="h-64 sm:h-96 rounded-xl overflow-hidden border border-gray-200 relative z-0 mb-4">
          <MapContainer center={mapPosition} zoom={14} className="h-full w-full" scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapView center={mapPosition} />
            <DraggableMarker
              position={mapPosition}
              setPosition={setMapPosition}
              onPositionChange={(latlng) => {
                setFormData(prev => ({
                  ...prev,
                  lieu_exact: prev.lieu_exact || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`
                }));
              }}
            />
            {assignedDoleances.filter(d => d.latitude && d.longitude).map(d => (
              <Marker
                key={d.id_doleance}
                position={[parseFloat(d.latitude), parseFloat(d.longitude)]}
                icon={L.divIcon({
                  className: 'assigned-marker',
                  html: '<div style="background:#FF4444;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                })}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{d.titre}</p>
                    <p className="text-gray-500">{d.nom_categorie}</p>
                    <p className="text-gray-400">Ref: {d.reference}</p>
                    <p className="text-green-600 font-semibold mt-1">Assignee</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="absolute bottom-3 left-3 z-[1000] bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
            <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cliquez ou déplacez le marqueur pour ajuster
          </div>
        </div>

        {/* Champs adresse - modifiables manuellement même après auto-remplissage */}
        <div className="grid grid-cols-2 gap-4">
          {/* <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Arrondissement</label>
            <select
              name="arrondissement"
              value={formData.arrondissement}
              onChange={handleChange}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
            >
              <option value="">Sélectionner un arrondissement</option>
              {arrondissements.map((arr, i) => (
                <option key={i} value={arr}>{arr}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Quartier</label>
            <select
              name="id_quartier"
              value={formData.id_quartier}
              onChange={handleChange}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
            >
              <option value="">Sélectionner un quartier</option>
              {quartiers.map(q => (
                <option key={q.id_quartier} value={q.id_quartier}>{q.nom_quartier}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Fokontany</label>
            <input
              type="text"
              name="fokontany"
              value={formData.fokontany}
              onChange={handleChange}
              placeholder="Nom du fokontany"
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Lot / Numéro</label>
            <input
              type="text"
              name="lot"
              value={formData.lot}
              onChange={handleChange}
              placeholder="Ex: LOT IVD 123"
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
            />
          </div> */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Lieu exact <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              type="text"
              name="lieu_exact"
              value={formData.lieu_exact}
              onChange={handleChange}
              placeholder="Entrez ou modifiez le lieu exact"
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
            />
            {assignedDoleances.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Les points rouges sur la carte montrent les signalements déjà assignés
              </p>
            )}
          </div>
        </div>
      </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-[#0077FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Suggestions</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4 ml-7">Proposez des idees pour resoudre le probleme (optionnel)</p>
          <textarea
            name="suggestions"
            value={formData.suggestions}
            onChange={handleChange}
            rows={3}
            placeholder="Ex: Il faudrait installer un ralentisseur et refaire le revetement de la route..."
            className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 text-sm text-gray-800 outline-none resize-y transition-all focus:border-[#0077FF] focus:shadow-md placeholder:text-gray-400"
          />
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-[#0077FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Ajouter des photos</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4 ml-7">Montrez le probleme avec des photos prises sur place (optionnel mais recommande)</p>

          <div className="flex gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 -mx-5 px-5">
            {[
              { label: 'Nid-de-poule', icon: 'M13.5 4L5.25 12.25l4.5 4.5L18 8.5', color: 'from-red-400 to-orange-400' },
              { label: 'Dechet sauvage', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'from-emerald-400 to-teal-500' },
              { label: 'Lampadaire', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'from-yellow-400 to-orange-400' },
              { label: 'Espace vert', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5', color: 'from-green-400 to-green-600' },
            ].map((ex, i) => (
              <div key={i} className="w-24 sm:w-28 h-16 sm:h-20 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${ex.color} flex items-center justify-center`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={ex.icon} />
                  </svg>
                </div>
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-medium text-center py-0.5 sm:py-1">{ex.label}</span>
              </div>
            ))}
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-[#0077FF] bg-blue-50' : 'border-gray-300 hover:border-[#0077FF] hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-10 h-10 mx-auto text-[#0077FF] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-bold text-gray-700 mb-1">Glissez-deposez vos photos ici</p>
            <p className="text-xs text-gray-400">ou cliquez pour parcourir (JPG, PNG, max 10 Mo)</p>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">{files.length} fichier(s) selectionne(s)</p>
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 p-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0077FF] to-[#00C853] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="text-xs font-medium text-gray-500">{uploadProgress}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Upload en cours...</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-[#0077FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Description du probleme</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4 ml-7">Decrivez le probleme en quelques phrases pour aider les equipes a intervenir</p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Decrivez le probleme que vous avez constate... Ex: Un nid-de-poule d'environ 30 cm de profondeur sur la chaussee, situe au croisement de la Rue de Rivoli et du Boulevard de Sebastopol. Le trou est dangereux pour les cyclistes et les motards, surtout de nuit."
            className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 text-sm text-gray-800 outline-none resize-y transition-all focus:border-[#0077FF] focus:shadow-md placeholder:text-gray-400"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 inline mr-1 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Donnees confidentielles
            </p>
            <span className="text-xs text-gray-400">{charsCount} / 1000 caracteres</span>
          </div>
        </div>

        {/* User Info Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#0077FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Vos informations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom <span className="text-red-400">*</span></label>
              <input type="text" name="nom_citoyen" value={formData.nom_citoyen} onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
                placeholder="Votre nom" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Prenom <span className="text-red-400">*</span></label>
              <input type="text" name="prenom_citoyen" value={formData.prenom_citoyen} onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
                placeholder="Votre prenom" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
                placeholder="exemple@email.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Telephone <span className="text-red-400">*</span></label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
                placeholder="034 12 345 67" />
            </div>
            <p className="col-span-1 sm:col-span-2 text-xs text-gray-400 -mt-1 sm:-mt-2">Email ou telephone requis pour recevoir le suivi</p>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Votre adresse</label>
              <input type="text" name="adresse_citoyen" value={formData.adresse_citoyen} onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#0077FF] bg-gray-50 focus:bg-white"
                placeholder="Votre adresse personnelle (optionnelle)" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-2 pb-8">
          <p className="text-xs sm:text-sm text-gray-400 order-2 sm:order-1">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="hidden sm:inline">Vos informations restent confidentielles</span>
            <span className="sm:hidden">Informations confidentielles</span>
          </p>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg w-full sm:w-auto order-1 sm:order-2"
            style={{
              background: 'linear-gradient(135deg, #00C853, #00A844)',
              boxShadow: '0 8px 30px rgba(0,200,83,0.35)',
            }}
            onMouseEnter={(e) => { if (!loading && !uploading) { e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,200,83,0.45)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,200,83,0.35)'; }}
          >
            {loading || uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {uploading ? 'Upload...' : 'Envoi...'}
              </span>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Envoyer mon signalement
              </>
            )}
          </button>
        </div>
      </form>

      {/* Reference Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#00C853] to-[#009432] flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Signalement envoye !</h3>
              <p className="text-sm text-gray-500 mb-4">Votre reference de suivi :</p>
              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 border border-gray-100">
                <span className="text-2xl font-mono font-bold text-[#0077FF] tracking-wider">{savedReference}</span>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { navigator.clipboard.writeText(savedReference); toast.success('Reference copiee !'); }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                >
                  Copier
                </button>
                <button
                  onClick={() => { setShowReferenceModal(false); navigate(`/suivi-doleance/${savedReference}`); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #0077FF, #0066DD)' }}
                >
                  Suivre mon signalement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeposerDoleance;
