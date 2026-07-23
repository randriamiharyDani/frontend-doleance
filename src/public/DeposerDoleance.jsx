import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Popup,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import EmailService from "../services/emailService";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Palette institutionnelle CUA : navy #0F172A, bleu #1E3A8A, or #D4AF37
// Chaque catégorie garde une couleur distincte (code couleur fonctionnel),
// harmonisée en tons plus sourds pour rester cohérente avec l'identité de la commune.

// Mapping des icônes DB vers des SVG paths
const iconMap = {
  road: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  lightbulb:
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  tree: "M12 21v-6m0 0l-3-3m3 3l3-3M3 7l3.5 3.5M21 7l-3.5 3.5M12 3v3",
  bus: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  security:
    "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  building:
    "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  people:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  fire: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
  accident:
    "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  medical:
    "M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z",
  flood: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  disaster:
    "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  animal:
    "M7.5 21L3 16.5m0 0L7.5 11M3 16.5h13.5m0 0l-4.5-5.25m4.5 5.25l-4.5 5.25",
  hazard:
    "M12 12v5m0 0a1.5 1.5 0 000 3m0-3a1.5 1.5 0 010 3m0-3l6.253-6.253M12 17l-6.253-6.253M9.75 21h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  other:
    "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

// Mapping des couleurs DB vers des gradients Tailwind
const gradientMap = {
  "#2196F3": "from-blue-500 to-blue-600",
  "#FFC107": "from-amber-400 to-[#D4AF37]",
  "#4CAF50": "from-green-500 to-emerald-600",
  "#8BC34A": "from-lime-500 to-green-600",
  "#9C27B0": "from-purple-500 to-violet-600",
  "#F44336": "from-red-500 to-rose-600",
  "#795548": "from-amber-700 to-orange-800",
  "#E91E63": "from-pink-500 to-rose-500",
  "#EF4444": "from-red-500 to-rose-600",
  "#F97316": "from-orange-500 to-red-600",
  "#06B6D4": "from-cyan-500 to-teal-600",
  "#8B5CF6": "from-violet-500 to-purple-600",
  "#84CC16": "from-lime-500 to-green-600",
  "#EC4899": "from-pink-400 to-pink-600",
  "#6B7280": "from-gray-500 to-slate-600",
};

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
      className={`cua-card-tap flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-center cursor-pointer transition-all duration-200 border ${
        selected
          ? "border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 scale-[1.02] bg-[#D4AF37]/[0.06]"
          : "border-transparent hover:border-slate-200 hover:shadow-md"
      } bg-white shadow-sm hover:-translate-y-1`}
    >
      <div
        className={`w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-base sm:text-xl bg-gradient-to-br ${cat.gradient} shadow-md`}
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
        </svg>
      </div>
      <div>
        <p className="text-xs sm:text-sm font-bold text-slate-800">
          {cat.label}
        </p>
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">
          {cat.desc}
        </p>
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
  const [savedReference, setSavedReference] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [sendingReference, setSendingReference] = useState(false);
  const [referenceSent, setReferenceSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [module, setModule] = useState(null);
  const [mapPosition, setMapPosition] = useState([-18.8792, 47.5079]);
  const [searchAddress, setSearchAddress] = useState("");
  const [locationName, setLocationName] = useState("");
  const [assignedDoleances, setAssignedDoleances] = useState([]);
  const [quartierGeoJSON, setQuartierGeoJSON] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [savedDirection, setSavedDirection] = useState(null);

  const arrondissementCoords = {
    "Antananarivo Renivohitra": [-18.91, 47.525],
    "Antananarivo Atsimondrano": [-18.94, 47.47],
    "Antananarivo Avaradrano": [-18.86, 47.56],
    "Antananarivo Atsimo": [-18.97, 47.51],
    "Antananarivo Andrefana": [-18.9, 47.44],
    "Antananarivo Avaratra": [-18.84, 47.49],
  };

  const [formData, setFormData] = useState({
    nom_citoyen: "",
    prenom_citoyen: "",
    email: "",
    telephone: "",
    adresse_citoyen: "",
    lot: "",
    fokontany: "",
    arrondissement: "",
    titre: "",
    description: "",
    id_categorie: "",
    id_quartier: "",
    lieu_exact: "",
    suggestions: "",
  });

  useEffect(() => {
    if (module) {
      fetchData();
      setSelectedCategory(null);
      setFormData((prev) => ({ ...prev, id_categorie: "" }));
    } else {
      setCategoriesData([]);
      setSelectedCategory(null);
      setFormData((prev) => ({ ...prev, id_categorie: "" }));
    }
  }, [t, module]);

  useEffect(() => {
    if (!module) return;
    const interval = setInterval(() => {
      api.get(`/categories?module=${module}`)
        .then((res) => {
          const cats = res.data?.data || res.data || [];
          setCategoriesData((prev) => {
            const prevJson = JSON.stringify(prev);
            const nextJson = JSON.stringify(cats);
            return prevJson === nextJson ? prev : cats;
          });
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [module]);

  useEffect(() => {
    const urls = files.map((file) => {
      if (file.type.startsWith("image/")) return URL.createObjectURL(file);
      return null;
    });

    setFilePreviews(urls);
    return () =>
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
  }, [files]);

  // Mapper les catégories DB au format attendu par CategoryCard
  const mappedCategories = [...categoriesData]
    .sort((a, b) => {
      if (a.nom_categorie?.includes("Autre")) return 1;
      if (b.nom_categorie?.includes("Autre")) return -1;
      return 0;
    })
    .map((cat) => ({
      id: cat.id_categorie,
      label: cat.nom_categorie,
      desc: cat.description,
      icon: iconMap[cat.icone] || iconMap["road"],
      gradient: gradientMap[cat.couleur] || "from-slate-500 to-slate-700",
      nom_direction: cat.nom_direction || null,
    }));

  const autreCategorie = mappedCategories.find((c) =>
    c.label?.includes("Autre"),
  );
  const otherCategories = mappedCategories.filter(
    (c) => !c.label?.includes("Autre"),
  );

  const fetchData = async () => {
    try {
      const [categoriesRes, quartiersRes, assignedRes, geojsonRes] =
        await Promise.all([
          api.get(`/categories?module=${module}`),
          api.get("/doleances/quartiers"),
          api
            .get("/doleances/public/assigned-locations")
            .catch(() => ({ data: { data: [] } })),
          api.get("/doleances/quartiers/geojson").catch(() => ({
            data: { type: "FeatureCollection", features: [] },
          })),
        ]);
      const catsData = categoriesRes.data?.data || categoriesRes.data || [];
      setCategoriesData(catsData);
      setQuartiers(quartiersRes.data?.data || quartiersRes.data || []);
      setAssignedDoleances(assignedRes.data?.data || assignedRes.data || []);
      setQuartierGeoJSON(
        geojsonRes.data || { type: "FeatureCollection", features: [] },
      );

      const defaultCat = catsData.find((c) =>
        c.nom_categorie?.includes("Autre"),
      );
      if (defaultCat) {
        setSelectedCategory(defaultCat.id_categorie);
        setFormData((prev) => ({
          ...prev,
          id_categorie: String(defaultCat.id_categorie),
        }));
      }

      setArrondissements([
        t("districts.district1"),
        t("districts.district2"),
        t("districts.district3"),
        t("districts.district4"),
        t("districts.district5"),
        t("districts.district6"),
      ]);
    } catch (error) {
      console.error("Erreur chargement donnees:", error);
      toast.error(t("errors.generic"));
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
    const cat = mappedCategories.find((c) => c.id === id);
    const isAutre = cat?.label?.includes("Autre");
    setFormData((prev) => ({
      ...prev,
      id_categorie: String(id),
      titre: isAutre ? "" : cat ? cat.label : prev.titre,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "arrondissement" && arrondissementCoords[value]) {
      setMapPosition(arrondissementCoords[value]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024;
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} ${t("messages.fileTooBig")}`);
      } else if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} - Seules les images sont acceptées`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) errors.forEach((err) => toast.error(err));
    if (validFiles.length + files.length > 5) {
      toast.error(t("messages.maxFilesReached"));
      return;
    }
    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const maxSize = 50 * 1024 * 1024;
      const validFiles = [];
      const errors = [];

      droppedFiles.forEach((file) => {
        if (file.size > maxSize) {
          errors.push(`${file.name} ${t("messages.fileTooBig")}`);
        } else if (!file.type.startsWith("image/")) {
          errors.push(`${file.name} - Seules les images sont acceptées`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) errors.forEach((err) => toast.error(err));
      if (validFiles.length + files.length > 5) {
        toast.error(t("messages.maxFilesReached"));
        return;
      }
      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files, t],
  );

  const uploadFiles = async (doleanceId) => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    const formDataFiles = new FormData();
    files.forEach((file) => formDataFiles.append("files", file));
    formDataFiles.append("doleance_id", doleanceId);
    try {
      const uploadResponse = await api.post(
        "/doleances/public/upload",
        formDataFiles,
        {
          headers: { "Content-Type": undefined },
          onUploadProgress: (progressEvent) => {
            setUploadProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total),
            );
          },
        },
      );
      if (!uploadResponse.data?.success) {
        throw new Error(uploadResponse.data?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      const msg =
        error.response?.data?.message || error.message || t("errors.generic");
      toast.error(msg);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const sendReferenceAuto = async (
    reference,
    contact,
    contactType,
    nom,
    prenom,
    titre,
  ) => {
    if (!contact || !reference) return;
    setSendingReference(true);
    setSendError(null);
    setEmailSent(false);
    setSmsSent(false);
    try {
      const result = await EmailService.sendReference(
        contact,
        reference,
        nom || "Citoyen",
        prenom || "",
        titre || "Doleance",
      );
      if (result.success) {
        if (contactType === "email") setEmailSent(true);
        else setSmsSent(true);
        setReferenceSent(true);
        toast.success(`Reference ${reference} envoyee a ${contact}`, {
          duration: 6000,
        });
      } else {
        setSendError(result.message);
        toast.error(result.message || t("errors.generic"), { duration: 6000 });
      }
    } catch (error) {
      console.error("Erreur envoi reference:", error);
      setSendError(error.message || "Erreur inconnue");
      toast.error(t("errors.generic"), { duration: 6000 });
    } finally {
      setSendingReference(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email && !formData.telephone) {
      toast.error("Email ou telephone requis");
      return;
    }
    if (
      !formData.nom_citoyen ||
      !formData.prenom_citoyen ||
      !formData.titre ||
      !formData.description
    ) {
      toast.error(t("messages.pleaseFillRequired"));
      return;
    }
    if (!formData.id_categorie) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }
    if (formData.telephone) {
      const digitsOnly = formData.telephone.replace(/[^0-9]/g, "");
      if (digitsOnly.length < 8 || digitsOnly.length > 10) {
        toast.error(t("messages.phoneLengthError"));
        return;
      }
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        module,
        contact: formData.email || formData.telephone,
        adresse_citoyen: formData.adresse_citoyen || null,
        telephone_citoyen: formData.telephone || null,
        email_citoyen: formData.email || null,
        latitude: mapPosition[0],
        longitude: mapPosition[1],
        lieu_exact:
          locationName ||
          formData.lieu_exact ||
          `${mapPosition[0].toFixed(4)}, ${mapPosition[1].toFixed(4)}`,
        description: `${formData.description}\n\nLocalisation: ${locationName || `${mapPosition[0].toFixed(4)}, ${mapPosition[1].toFixed(4)}`}\nSuggestions: ${formData.suggestions || "Aucune suggestion"}`,
      };

      const response = await api.post("/doleances", dataToSend);
      const reference =
        response.data.data?.reference || response.data.reference;
      const doleanceId =
        response.data.data?.id_doleance || response.data.id_doleance;
      const nomDirection = response.data.data?.nom_direction || null;
      setSavedDirection(nomDirection);

      let uploadOk = true;
      if (files.length > 0 && doleanceId) {
        try {
          await uploadFiles(doleanceId);
        } catch {
          uploadOk = false;
        }
      }

      setSavedReference(reference);
      const contactInfo = formData.email || formData.telephone;
      const contactType = formData.email ? "email" : "phone";
      if (contactInfo && reference) {
        await sendReferenceAuto(
          reference,
          contactInfo,
          contactType,
          formData.nom_citoyen,
          formData.prenom_citoyen,
          formData.titre,
        );
      }

      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold">Signalement envoye avec succes !</p>
          <p className="text-sm">
            Reference:{" "}
            <span className="font-mono font-bold text-[#1E3A8A]">
              {reference}
            </span>
          </p>
          {nomDirection && (
            <p className="text-sm text-emerald-600 font-medium">
              Transmis à: {nomDirection}
            </p>
          )}
        </div>,
        { duration: 8000 },
      );

      setShowReferenceModal(true);
      setTimeout(() => {
        setShowReferenceModal(false);
        setSavedDirection(null);
        navigate(`/suivi-doleance/${reference}`);
      }, 5000);

      setFormData({
        nom_citoyen: "",
        prenom_citoyen: "",
        email: "",
        telephone: "",
        adresse_citoyen: "",
        lot: "",
        fokontany: "",
        arrondissement: "",
        titre: "",
        description: "",
        id_categorie: mappedCategories[0]?.id
          ? String(mappedCategories[0].id)
          : "",
        id_quartier: "",
        lieu_exact: "",
        suggestions: "",
      });
      setFiles([]);
      setFilePreviews([]);
      setReferenceSent(false);
      setEmailSent(false);
      setSmsSent(false);
      setSendError(null);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.response?.data?.message || t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Remplit le formulaire à partir d'un résultat Nominatim
  const fillFromNominatim = (data) => {
    const addr = data.address || {};
    const quartierNom = addr.suburb || addr.neighbourhood || addr.quarter || "";

    // Essaie de matcher le quartier trouvé avec la liste existante
    const matchedQuartier = quartiers.find(
      (q) => q.nom_quartier.toLowerCase() === quartierNom.toLowerCase(),
    );

    setFormData((prev) => ({
      ...prev,
      arrondissement:
        addr.city_district || addr.district || prev.arrondissement,
      id_quartier: matchedQuartier
        ? matchedQuartier.id_quartier
        : prev.id_quartier,
      fokontany: prev.fokontany, // pas dispo via OSM, reste manuel
      lieu_exact: data.display_name || prev.lieu_exact,
    }));

    setSearchAddress(data.display_name || "");
  };

  // Bouton "Me localiser"
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error(
        "La géolocalisation n'est pas supportée par votre navigateur",
      );
      return;
    }
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapPosition([latitude, longitude]);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          );
          const data = await res.json();
          fillFromNominatim(data);
          toast.success("Position trouvée !");
        } catch (err) {
          console.error("Erreur reverse geocoding:", err);
          toast.error(
            "Position obtenue, mais erreur lors de la récupération de l'adresse",
          );
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error(
            "Autorisation de localisation refusée. Veuillez activer les permissions de localisation dans votre navigateur.",
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          toast.error(
            "Position non disponible. Vérifiez que le GPS est activé.",
          );
        } else if (err.code === err.TIMEOUT) {
          toast.error("La demande de localisation a expiré. Réessayez.");
        } else {
          toast.error("Erreur lors de la géolocalisation. Réessayez.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
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
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(value)}`,
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Erreur recherche:", err);
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
    <div className="cua-doleance shadow-2xl p-5 rounded-2xl">
      <style>{`
        .cua-doleance { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cua-doleance .cua-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }

        .cua-doleance .cua-section {
          background: #ffffff;
          border: 1px solid #F1F5F9;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .cua-doleance .cua-section:hover {
          box-shadow: 0 4px 16px -4px rgba(15, 23, 42, 0.08);
        }
        .cua-doleance .cua-field {
          border-color: #D1D5DB;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .cua-doleance .cua-field:focus {
          border-color: #135ecf;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15);
          background-color: #ffffff;
        }
        .cua-doleance .cua-field-wrap:focus-within {
          border-color: #135ecf !important;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15);
        }
        .cua-doleance .cua-btn-primary {
          background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2E4FA3 100%);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .cua-doleance .cua-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .cua-doleance .cua-btn-submit {
          background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #2E4FA3 100%);
          box-shadow: 0 10px 30px -8px rgba(15, 23, 42, 0.45);
        }
        .cua-doleance .cua-btn-submit:hover:not(:disabled) {
          box-shadow: 0 14px 36px -8px rgba(15, 23, 42, 0.55);
        }
        .cua-doleance .cua-card-tap { will-change: transform; }
        .cua-doleance .cua-dropzone.drag {
          border-color: #D4AF37;
          background-color: rgba(212, 175, 55, 0.06);
        }
        .cua-doleance .cua-gold-dot {
          background: radial-gradient(circle, #D4AF37 0%, transparent 70%);
        }

        @keyframes cuaFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cua-doleance .cua-anim { animation: cuaFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }

        @media (prefers-reduced-motion: reduce) {
          .cua-doleance .cua-anim { animation: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className=" sm:mb-4 cua-anim flex flex-col">
        <div className="text-center">
          <span
            className={`inline-flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold mb-3 ${
              darkMode ? "text-[#D4AF37]" : "text-[#9A7200]"
            }`}
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Commune Urbaine d'Antananarivo
          </span>
        </div>
        <h1 className="cua-display text-2xl sm:text-2xl font-semibold text-[#0F172A] flex items-center gap-2 sm:gap-3">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center text-white shadow-md shadow-[#0F172A]/20 flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          Signaler un problème
        </h1>
        <p className=" text-slate-500 mt-1.5 ml-[10px] sm:ml-[10px] ">
          Vous avez constaté un problème ? Signalez-le à la Commune Urbaine
          d'Antananarivo pour un traitement rapide.
        </p>
        <p className="inline-flex items-center rounded-xl border border-yellow-400 bg-yellow-100 mt-5 px-4 py-2 text-[13px] font-medium text-yellow-800 w-fit">
          📋 Veuillez remplir le formulaire ci-dessous.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Type d'entité */}
        <div className="mb-1">
          <h2 className="block text-[16px] font-bold text-[#0F172A]">
            Type de situation
            <span className="ml-1 text-sm font-normal text-red-500">*</span>
            <span className="ml-1 text-sm font-medium text-gray-500">
              (à choisir)
            </span>
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModule("CUA")}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                module === "CUA"
                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="block text-base">🏛️</span>
              <span>Commune Urbaine (CUA)</span>
            </button>
            <button
              type="button"
              onClick={() => setModule("Sapeurs-Pompiers")}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                module === "Sapeurs-Pompiers"
                  ? "border-red-600 bg-red-50 text-red-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="block text-base">🚒</span>
              <span>Sapeurs-Pompiers</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        {module && mappedCategories.length > 0 && (
          <>
            <p className="italic text-blue-600 text-xs my-3">
              *__________Si vous trouvez une catégorie correspondante, cochez-la
              s'il vous plaît.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {otherCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  selected={selectedCategory === cat.id}
                  onClick={handleSelectCategory}
                />
              ))}

              {autreCategorie && (
                <CategoryCard
                  cat={autreCategorie}
                  selected={selectedCategory === autreCategorie.id}
                  onClick={handleSelectCategory}
                />
              )}
            </div>

            {selectedCategory &&
              (() => {
                const selectedCat = mappedCategories.find(
                  (c) => c.id === selectedCategory,
                );
                if (!selectedCat?.nom_direction) return null;
                return (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-3  my-5 ">
                    <svg
                      className="w-4 h-4 text-[#1E3A8A] shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm text-[#1E3A8A] font-semibold">
                      Direction concernée : {selectedCat.nom_direction}
                    </span>
                  </div>
                );
              })()}

            <p className="italic text-blue-600 text-xs my-3">
              *__________Si vous ne trouvez pas de catégorie correspondante,
              veuillez décrire votre problème ci-dessous.
            </p>
          </>
        )}

        {module && mappedCategories.length === 0 && (
          <p className="text-slate-400 text-sm text-center mb-2 py-4">
            Aucune catégorie disponible
          </p>
        )}

        {/* Titre */}
        {module && (
          <div className="cua-section rounded-2xl p-5 mt-4 mb-6 cua-anim">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-[#1E3A8A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 9h16.5m-16.5 6.75h16.5"
                />
              </svg>
              <h2 className="text-[16px]  font-bold text-[#0F172A]">
                Titre du problème
                <span className="ml-1 text-sm font-normal text-red-500">*</span>
              </h2>
            </div>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex : Nid-de-poule dangereux Rue de la Liberté"
              className="cua-field w-full border  rounded-xl px-5 py-4 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              required
            />
          </div>
        )}

        {/* Description */}
        <div className="cua-section rounded-2xl p-5 mb-6 cua-anim">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-[#1E3A8A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            <h2 className="text-[16px]  font-bold text-[#0F172A]">
              Description du problème
            </h2>
          </div>
          <p className="text-sm text-slate-400 mb-4 ml-7">
            Décrivez le problème en quelques phrases pour aider les équipes à
            intervenir
          </p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Décrivez le problème que vous avez constaté..."
            className="cua-field w-full border  rounded-xl px-5 py-4 text-sm text-slate-800 outline-none resize-y placeholder:text-slate-400"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-slate-400">
              <svg
                className="w-3.5 h-3.5 inline mr-1 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Données confidentielles
            </p>
            <span className="text-xs text-slate-400">
              {charsCount} / 1000 caractères
            </span>
          </div>
        </div>

        {/* Localisation & Adresse (fusionné) */}
        <div className="cua-section rounded-2xl p-5 mb-6 cua-anim">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-[#1E3A8A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="text-[16px]  font-bold text-[#0F172A]">
              Localisation & adresse
              <span className="ml-1 text-sm font-normal text-red-500">*</span>
            </h2>
          </div>

          {/* Barre de recherche + Me localiser */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 relative">
            <form
              onSubmit={handleSearchAddress}
              className="cua-field-wrap flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 border border-transparent transition-all relative order-2 sm:order-1"
            >
              <svg
                className="w-4 h-4 text-slate-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchAddress}
                onChange={handleSearchInputChange}
                onFocus={() =>
                  searchAddress.length >= 3 && setShowSuggestions(true)
                }
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Rechercher une adresse, un quartier..."
                className="flex-1 bg-transparent py-2.5 sm:py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 min-w-0"
              />
              {isSearching && (
                <div className="w-4 h-4 border border-slate-300 border-t-[#1E3A8A] rounded-full animate-spin flex-shrink-0" />
              )}
              <button
                type="submit"
                className="text-xs font-semibold text-[#1E3A8A] hover:text-[#0F172A] py-1 px-2 rounded-lg hover:bg-[#1E3A8A]/5 transition-all flex-shrink-0"
              >
                Chercher
              </button>

              {/* Dropdown de suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border  z-[1001] max-h-60 overflow-y-auto">
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-[#D4AF37]/10 transition-colors border-b border-slate-50 last:border-0"
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
              className="cua-btn-primary flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-60 order-1 sm:order-2"
            >
              {isLocating ? (
                <div className="w-4 h-4 border border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
              <span className="hidden sm:inline">Me localiser</span>
              <span className="sm:hidden">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
            </button>
          </div>

          {/* Carte */}
          <div className="h-64 sm:h-96 rounded-xl overflow-hidden border border-slate-200 relative z-0 mb-4">
            <MapContainer
              center={mapPosition}
              zoom={14}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {quartierGeoJSON &&
                quartierGeoJSON.features &&
                quartierGeoJSON.features.length > 0 && (
                  <GeoJSON
                    key={JSON.stringify(quartierGeoJSON)}
                    data={quartierGeoJSON}
                    style={(feature) => ({
                      fillColor: "#D4AF37",
                      weight: 2,
                      opacity: 1,
                      color: "#B8860B",
                      dashArray: "3",
                      fillOpacity: 0.15,
                    })}
                    onEachFeature={(feature, layer) => {
                      if (feature.properties) {
                        layer.bindPopup(
                          `<div style="text-align:center"><b>${feature.properties.nom_quartier}</b><br/><span style="color:#666">${feature.properties.nom_arrondissement || ""}</span></div>`,
                        );
                        layer.on("mouseover", function () {
                          this.setStyle({ fillOpacity: 0.4, weight: 3 });
                        });
                        layer.on("mouseout", function () {
                          this.setStyle({ fillOpacity: 0.15, weight: 2 });
                        });
                      }
                    }}
                  />
                )}
              <MapView center={mapPosition} />
              <DraggableMarker
                position={mapPosition}
                setPosition={setMapPosition}
                onPositionChange={(latlng) => {
                  setFormData((prev) => ({
                    ...prev,
                    lieu_exact:
                      prev.lieu_exact ||
                      `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
                  }));
                }}
              />
              {assignedDoleances
                .filter((d) => d.latitude && d.longitude)
                .map((d) => (
                  <Marker
                    key={d.id_doleance}
                    position={[parseFloat(d.latitude), parseFloat(d.longitude)]}
                    icon={L.divIcon({
                      className: "assigned-marker",
                      html: '<div style="background:#D4AF37;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
                      iconSize: [12, 12],
                      iconAnchor: [6, 6],
                    })}
                  >
                    <Popup>
                      <div className="text-xs">
                        <p className="font-bold">{d.titre}</p>
                        <p className="text-slate-500">{d.nom_categorie}</p>
                        <p className="text-slate-400">Ref: {d.reference}</p>
                        <p className="text-emerald-600 font-semibold mt-1">
                          Assignée
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
            <div className="absolute bottom-3 left-3 z-[1000] bg-[#0F172A]/75 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
              <svg
                className="w-3 h-3 inline mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Cliquez ou déplacez le marqueur pour ajuster
            </div>
          </div>

          {/* Champs adresse - modifiables manuellement même après auto-remplissage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Lieu exact{" "}
                <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                name="lieu_exact"
                value={formData.lieu_exact}
                onChange={handleChange}
                placeholder="Entrez ou modifiez le lieu exact"
                className="cua-field w-full border  rounded-xl px-4 py-3 text-sm outline-none bg-slate-50"
              />
              {assignedDoleances.length > 0 && (
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  Les points dorés sur la carte montrent les signalements déjà
                  assignés
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="cua-section rounded-2xl p-5 mb-6 cua-anim">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-[#1E3A8A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            <h2 className="text-[16px]  font-bold text-[#0F172A]">Opinion</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4 ml-7">
            Proposez des idées pour résoudre le problème (optionnel)
          </p>
          <textarea
            name="suggestions"
            value={formData.suggestions}
            onChange={handleChange}
            rows={3}
            placeholder="Ex : Il faudrait installer un ralentisseur et refaire le revêtement de la route..."
            className="cua-field w-full border  rounded-xl px-5 py-4 text-sm text-slate-800 outline-none resize-y placeholder:text-slate-400"
          />
        </div>

        {/* Photos */}

        <div className="cua-section rounded-2xl p-5 mb-6 cua-anim">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-[#1E3A8A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-[16px]  font-bold text-[#0F172A]">
              Ajouter des photos
            </h2>
          </div>
          <p className="text-sm text-slate-400 mb-4 ml-7">
            Montrez le problème avec des photos prises sur place (optionnel mais
            recommandé)
          </p>

          <div className="flex gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 -mx-5 px-5">
            {[
              {
                label: "Nid-de-poule",
                icon: "M13.5 4L5.25 12.25l4.5 4.5L18 8.5",
                color: "from-rose-400 to-orange-400",
              },
              {
                label: "Déchet sauvage",
                icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
                color: "from-emerald-400 to-teal-500",
              },
              {
                label: "Lampadaire",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                color: "from-amber-400 to-[#D4AF37]",
              },
              {
                label: "Espace vert",
                icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
                color: "from-green-500 to-emerald-700",
              },
            ].map((ex, i) => (
              <div
                key={i}
                className="w-24 sm:w-28 h-16 sm:h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden"
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${ex.color} flex items-center justify-center`}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={ex.icon}
                    />
                  </svg>
                </div>
                <span className="absolute bottom-0 left-0 right-0 bg-[#0F172A]/60 text-white text-[9px] font-medium text-center py-0.5 sm:py-1">
                  {ex.label}
                </span>
              </div>
            ))}
          </div>

          <div
            className={`cua-dropzone border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? "drag"
                : "border-slate-300 hover:border-[#D4AF37] hover:bg-slate-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg
              className="w-10 h-10 mx-auto text-[#1E3A8A] mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-bold text-slate-700 mb-1">
              Glissez-déposez vos photos ici
            </p>
            <p className="text-xs text-slate-400">
              ou cliquez pour parcourir (JPG, PNG, WebP, GIF — max 50 Mo)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                {files.length} photo(s) sélectionnée(s) — aperçu avant envoi
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl overflow-hidden border  hover:border-[#D4AF37] transition-all duration-200 bg-slate-50 aspect-square"
                  >
                    {filePreviews[i] ? (
                      <img
                        src={filePreviews[i]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-slate-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-[10px] font-medium text-slate-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#D4AF37] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {uploadProgress}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Upload en cours...</p>
            </div>
          )}
        </div>

        {/* User Info Section */}
        <div className="cua-section rounded-2xl p-5 mb-6 cua-anim">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-[#1E3A8A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <h2 className="text-[16px]  font-bold text-[#0F172A]">
              Vos informations
              <span className="ml-1 text-sm font-normal text-red-500">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Nom <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                name="nom_citoyen"
                value={formData.nom_citoyen}
                onChange={handleChange}
                className="cua-field w-full border  rounded-xl px-4 py-3 text-sm outline-none bg-slate-50"
                placeholder="Votre nom"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Prénom <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                name="prenom_citoyen"
                value={formData.prenom_citoyen}
                onChange={handleChange}
                className="cua-field w-full border  rounded-xl px-4 py-3 text-sm outline-none bg-slate-50"
                placeholder="Votre prénom"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Email
                <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="cua-field w-full border  rounded-xl px-4 py-3 text-sm outline-none bg-slate-50"
                placeholder="exemple@email.com"
                
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="cua-field w-full border  rounded-xl px-4 py-3 text-sm outline-none bg-slate-50"
                placeholder="034 12 345 67"
              />
            </div>
            <p className="col-span-1 sm:col-span-2 text-xs text-slate-400 -mt-1 sm:-mt-2">
              Email ou téléphone requis pour recevoir le suivi
            </p>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Votre adresse
              </label>
              <input
                type="text"
                name="adresse_citoyen"
                value={formData.adresse_citoyen}
                onChange={handleChange}
                className="cua-field w-full border  rounded-xl px-4 py-3 text-sm outline-none bg-slate-50"
                placeholder="Votre adresse personnelle (optionnelle)"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-2 pb-8 cua-anim">
          <p className="text-xs sm:text-sm text-slate-400 order-2 sm:order-1">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="hidden sm:inline">
              Vos informations restent confidentielles
            </span>
            <span className="sm:hidden">Informations confidentielles</span>
          </p>
          <button
            type="submit"
            disabled={loading || uploading}
            className="cua-btn-submit flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-[16px]  font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full sm:w-auto order-1 sm:order-2 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            {loading || uploading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {uploading ? "Upload..." : "Envoi..."}
              </span>
            ) : (
              <>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                Envoyer mon signalement
              </>
            )}
          </button>
        </div>
      </form>

      {/* Reference Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6 border  relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F172A] via-[#D4AF37] to-[#0F172A]" />
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h3 className="cua-display text-xl font-semibold text-[#0F172A] mb-2">
                Signalement envoyé !
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Votre référence de suivi :
              </p>
              <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 border ">
                <span className="text-2xl font-mono font-bold text-[#1E3A8A] tracking-wider">
                  {savedReference}
                </span>
              </div>
              {savedDirection && (
                <p className="text-sm text-emerald-600 font-semibold mb-4">
                  Transmis à : {savedDirection}
                </p>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(savedReference);
                    toast.success("Référence copiée !");
                  }}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Copier
                </button>
                <button
                  onClick={() => {
                    setShowReferenceModal(false);
                    navigate(`/suivi-doleance/${savedReference}`);
                  }}
                  className="cua-btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
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
