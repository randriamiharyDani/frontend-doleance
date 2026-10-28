import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useStatsRefresh } from "../contexts/StatsContext";
import LocationPickerMap from "../components/common/LocationPickerMap";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon,
  FlagIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentDuplicateIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PrinterIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

// ---- Réglages d'impression ----
// Les 2 premières images restent sur la page principale ;
// les images suivantes (3e, 4e, ...) vont sur une page d'annexe
const MAX_INLINE_IMAGES = 2;
// Si la description dépasse ce nombre de caractères, il n'y a plus assez de
// place sur la page principale : toutes les images passent en annexe
const MAX_TEXT_FOR_INLINE_IMAGES = 1500;
// Nombre de photos par page d'annexe (grille 2 x 2)
const IMAGES_PER_ANNEX_PAGE = 4;

// CSS d'impression (autonome : ne dépend d'aucun autre fichier CSS)
const PRINT_CSS = `
@page {
  size: A4;
  margin: 12mm;
}

#print-root {
  display: none;
}

@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* On masque tout le reste de l'application : pas de page vide */
  body > *:not(#print-root) {
    display: none !important;
  }

  #print-root {
    display: block !important;
    color: #111;
    font-family: Arial, Helvetica, sans-serif;
  }

  /* Une page = un bloc de hauteur fixe, volontairement plus petit que la zone
     imprimable (A4 = 273mm utiles, Letter = 255mm utiles) pour ne jamais déborder */
  .pr-page {
    box-sizing: border-box;
    height: 245mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  /* Saut de page UNIQUEMENT avant les pages d'annexe (jamais après la dernière) */
  .pr-page + .pr-page {
    break-before: page;
    page-break-before: always;
  }

  .pr-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 8px;
    flex: 0 0 auto;
  }
  .pr-header img { width: 40px; height: 40px; }
  .pr-header h1 { margin: 0; font-size: 14px; font-weight: bold; }
  .pr-header h2 { margin: 0; font-size: 12px; font-weight: normal; }
  .pr-header .pr-header-text { text-align: center; }

  .pr-title {
    flex: 0 0 auto;
    margin: 12px 0 10px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }

  .pr-table {
    flex: 0 0 auto;
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .pr-table td {
    border: 1px solid #d1d5db;
    padding: 5px 8px;
    vertical-align: top;
  }
  .pr-table td.pr-label {
    width: 30%;
    background: #f3f4f6;
    font-weight: bold;
  }

  .pr-desc {
    flex: 0 0 auto;
    margin-top: 10px;
  }
  .pr-desc-label {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .pr-desc-value {
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.4;
    text-align: justify;
  }

  /* Zone images : prend tout l'espace restant sur la page */
  .pr-images {
    flex: 1 1 auto;
    min-height: 0;
    max-height: 150mm;
    margin-top: 10px;
    display: grid;
    gap: 8px;
  }

  .pr-img-cell {
    position: relative;
    min-height: 0;
    border: 1px solid #d1d5db;
    padding: 2px;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .pr-img-cell img {
    position: absolute;
    top: 2px; left: 2px; right: 2px; bottom: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    object-fit: contain;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .pr-note {
    flex: 0 0 auto;
    margin-top: 6px;
    text-align: center;
    font-size: 10px;
    font-style: italic;
    color: #6b7280;
  }

  .pr-annex-title {
    flex: 0 0 auto;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 6px;
  }
  .pr-annex-grid {
    flex: 1 1 auto;
    min-height: 0;
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .pr-figure {
    margin: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .pr-figure .pr-img-cell { flex: 1 1 auto; }
  .pr-figure figcaption {
    flex: 0 0 auto;
    font-size: 10px;
    text-align: center;
    color: #6b7280;
    margin-top: 2px;
  }

  .pr-footer {
    flex: 0 0 auto;
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid #d1d5db;
    text-align: center;
    font-size: 11px;
    font-weight: bold;
  }
  .pr-footer .pr-date {
    margin-top: 2px;
    text-align: right;
    font-size: 10px;
    font-weight: normal;
    color: #6b7280;
  }
}
`;

function DoleanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyStatsChange } = useStatsRefresh();
  const [doleance, setDoleance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reponse, setReponse] = useState("");
  const [sending, setSending] = useState(false);
  const [showReponseForm, setShowReponseForm] = useState(false);
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [loadingPieces, setLoadingPieces] = useState(false);
  const [showPiecesModal, setShowPiecesModal] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnMotif, setReturnMotif] = useState("");
  const fileInputRef = React.useRef(null);

  const userRole = user?.role || user?.nom_role;
  const isAdminOrOperator = [
    "administrateur_systeme",
    "administrateur",
    "agent_central",
  ].includes(userRole);
  const isDirectionAgent = ["agent", "chef_service", "directeur"].includes(
    userRole,
  );

  useEffect(() => {
    fetchDoleance();
    fetchPiecesJointes();
    fetchReferenceData();
  }, [id]);

  const fetchReferenceData = async () => {
    try {
      const [catRes, qRes] = await Promise.all([
        api.get("/doleances/categories"),
        api.get("/doleances/quartiers"),
      ]);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (qRes.data.success) setQuartiers(qRes.data.data);
    } catch (error) {
      console.warn("Erreur chargement données de référence");
    }
  };

  const openEditModal = () => {
    setEditForm({
      titre: doleance.titre || "",
      description: doleance.description || "",
      id_categorie: doleance.id_categorie || "",
      id_quartier: doleance.id_quartier || "",
      lieu_exact: doleance.lieu_exact || "",
      suggestions: doleance.suggestions || "",
      citoyen_nom: doleance.citoyen_nom || "",
      citoyen_prenom: doleance.citoyen_prenom || "",
      citoyen_email: doleance.citoyen_email || "",
      citoyen_telephone: doleance.citoyen_telephone || "",
      citoyen_adresse: doleance.citoyen_adresse || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const payload = {
        titre: editForm.titre,
        description: editForm.description,
        id_categorie: editForm.id_categorie || null,
        id_quartier: editForm.id_quartier || null,
        lieu_exact: editForm.lieu_exact,
        suggestions: editForm.suggestions,
        citoyen: {
          nom: editForm.citoyen_nom,
          prenom: editForm.citoyen_prenom,
          email: editForm.citoyen_email,
          telephone: editForm.citoyen_telephone,
          adresse: editForm.citoyen_adresse,
        },
      };
      const response = await api.put(`/doleances/${id}`, payload);
      if (response.data.success) {
        toast.success("Doléance mise à jour avec succès");
        setShowEditModal(false);
        fetchDoleance();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchDoleance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doleances/${id}`);
      if (response.data.success) {
        setDoleance(response.data.data);
      } else {
        toast.error("Doléance non trouvée");
        navigate("/backoffice/doleances");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement");
      navigate("/backoffice/doleances");
    } finally {
      setLoading(false);
    }
  };

  const fetchPiecesJointes = async () => {
    setLoadingPieces(true);
    try {
      const response = await api.get(`/doleances/${id}/pieces-jointes`);
      if (response.data && response.data.success) {
        setPiecesJointes(response.data.data || []);
      } else {
        setPiecesJointes([]);
      }
    } catch (error) {
      console.warn("Aucune pièce jointe pour cette doléance");
      setPiecesJointes([]);
    } finally {
      setLoadingPieces(false);
    }
  };

  const handleUpdateStatut = async (newStatut) => {
    try {
      const response = await api.put(`/doleances/${id}/statut`, {
        id_statut: newStatut,
      });
      if (response.data.success) {
        toast.success("Statut mis à jour avec succès");
        fetchDoleance();
        notifyStatsChange();
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleAddReponse = async (e) => {
    e.preventDefault();
    if (!reponse.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    setSending(true);
    try {
      const response = await api.post(`/doleances/${id}/reponses`, {
        message: reponse,
      });
      if (response.data.success) {
        toast.success("Réponse ajoutée avec succès");
        setReponse("");
        setShowReponseForm(false);
        fetchDoleance();
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleRetourner = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await api.post(`/doleances/${id}/retourner`, {
        motif: returnMotif,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowReturnModal(false);
        setReturnMotif("");
        notifyStatsChange();
        navigate("/backoffice/doleances");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du retour");
    } finally {
      setSending(false);
    }
  };

  const handleUploadFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "application/pdf",
    ];
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`${file.name} dépasse 10 Mo`);
        return;
      }
      if (!allowed.includes(file.type)) {
        toast.error(`${file.name} n'est pas un format accepté`);
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("doleance_id", id);
      for (const file of files) {
        formData.append("files", file);
      }
      const response = await api.post("/doleances/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        toast.success(`${files.length} fichier(s) ajouté(s)`);
        fetchPiecesJointes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file) => {
    const extension = file.nom_fichier?.split(".").pop()?.toLowerCase();
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension)
    ) {
      return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    }
    if (["mp4", "mov", "avi", "mkv", "webm", "wmv"].includes(extension)) {
      return <VideoCameraIcon className="h-6 w-6 text-purple-500" />;
    }
    if (
      ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)
    ) {
      return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
    }
    return (
      <DocumentDuplicateIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
    );
  };

  const getFileTypeLabel = (file) => {
    const extension = file.nom_fichier?.split(".").pop()?.toLowerCase();
    const types = {
      jpg: "Image JPEG",
      jpeg: "Image JPEG",
      png: "Image PNG",
      gif: "Image GIF",
      webp: "Image WebP",
      bmp: "Image BMP",
      svg: "Image SVG",
      mp4: "Vidéo MP4",
      mov: "Vidéo MOV",
      avi: "Vidéo AVI",
      mkv: "Vidéo MKV",
      webm: "Vidéo WebM",
      wmv: "Vidéo WMV",
    };
    return types[extension] || "Fichier inconnu";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusBadge = (statut, couleur) => {
    return (
      <span
        className="px-3 py-1 rounded-full text-sm font-medium text-white"
        style={{ backgroundColor: couleur || "#6B7280" }}
      >
        {statut}
      </span>
    );
  };

  const getPriorityBadge = (priorite, niveau) => {
    const colors = {
      1: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      3: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      4: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${colors[niveau] || "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-100"}`}
      >
        {priorite}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doleance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Doléance non trouvée</p>
        <button
          onClick={() => navigate("/backoffice/doleances")}
          className="mt-4 btn-primary"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const displayPieces =
    piecesJointes.length > 0 ? piecesJointes : doleance?.pieces_jointes || [];

  const printImages = displayPieces.filter(
    (f) => f.url && /\.(jpe?g|png|gif|webp|bmp)$/i.test(f.nom_fichier || ""),
  );

  // --- Logique d'impression ---
  const textLength = (doleance.description || "").length;

  // Page 1 : les 2 premières images (si le texte laisse assez de place)
  // Page(s) suivante(s) : toutes les autres images
  const textAllowsInline = textLength <= MAX_TEXT_FOR_INLINE_IMAGES;
  const inlineImages = textAllowsInline
    ? printImages.slice(0, MAX_INLINE_IMAGES)
    : [];
  const annexImages = printImages.slice(inlineImages.length);

  // Pages d'annexe : groupes de 4 photos maximum
  const annexPages = [];
  for (let i = 0; i < annexImages.length; i += IMAGES_PER_ANNEX_PAGE) {
    annexPages.push(annexImages.slice(i, i + IMAGES_PER_ANNEX_PAGE));
  }

  // Taille du texte adaptée à sa longueur
  const descFontSize =
    textLength > 1000 ? "10px" : textLength > 600 ? "11px" : "12px";

  const printDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* CSS d'impression embarqué */}
      <style>{PRINT_CSS}</style>

      {/* Bouton retour */}
      <button
        onClick={() => navigate("/backoffice/doleances")}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 print:hidden"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Retour à la liste
      </button>

      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Informations de la doléance */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête de la doléance */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-slate-700 px-2 py-1 rounded">
                    {doleance.reference}
                  </span>
                  {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {doleance.titre}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#1E3A8A] text-white rounded-lg hover:bg-[#0F172A] transition-colors print:hidden"
                >
                  <PrinterIcon className="h-4 w-4" />
                  Imprimer PDS et Maire
                </button>
                {isAdminOrOperator && (
                  <button
                    onClick={openEditModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors print:hidden"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Modifier
                  </button>
                )}
                {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}
              </div>
            </div>

            <div className="border-t dark:border-slate-700 pt-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {doleance.description}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t dark:border-slate-700">
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <TagIcon className="h-4 w-4 mr-2" />
                {doleance.nom_categorie || "Non catégorisé"}
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                {doleance.nom_direction || "Non assignée"}
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDateTime(doleance.date_creation)}
              </div>
              {doleance.nom_quartier && (
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <FlagIcon className="h-4 w-4 mr-2" />
                  {doleance.nom_quartier}
                </div>
              )}
            </div>

            {doleance.assignee_nom && (
              <div className="mt-3 pt-3 border-t dark:border-slate-700 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <UserCircleIcon className="h-4 w-4 mr-2" />
                Assigné à : {doleance.assignee_nom}
              </div>
            )}

            {doleance.motif_transfert && (
              <div className="mt-3 pt-3 border-t dark:border-slate-700">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                    Motif du transfert :
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    {doleance.motif_transfert}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section Pièces jointes */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PaperClipIcon className="h-5 w-5" />
                Pièces jointes
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {displayPieces.length} fichier(s)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/quicktime,.pdf"
                  onChange={handleUploadFiles}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Ajout...
                    </>
                  ) : (
                    <>
                      <PaperClipIcon className="h-4 w-4" />
                      Ajouter
                    </>
                  )}
                </button>
              </div>
            </div>

            {loadingPieces ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : displayPieces.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <DocumentDuplicateIcon className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>Aucune pièce jointe pour cette doléance</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayPieces.map((file, index) => {
                  const ext = file.nom_fichier?.split(".").pop()?.toLowerCase();
                  const isImage = [
                    "jpg",
                    "jpeg",
                    "png",
                    "gif",
                    "webp",
                    "bmp",
                  ].includes(ext);
                  const isVideo = [
                    "mp4",
                    "mov",
                    "avi",
                    "mkv",
                    "webm",
                    "wmv",
                  ].includes(ext);
                  const isPdf = ext === "pdf";
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {isImage && file.url ? (
                        <div
                          className="aspect-square cursor-pointer relative group"
                          onClick={() => {
                            setSelectedPiece(file);
                            setShowPiecesModal(true);
                          }}
                        >
                          <img
                            src={file.url}
                            alt={file.nom_fichier}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <PhotoIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                        </div>
                      ) : isVideo && file.url ? (
                        <div
                          className="aspect-square cursor-pointer relative group"
                          onClick={() => {
                            setSelectedPiece(file);
                            setShowPiecesModal(true);
                          }}
                        >
                          <video
                            src={file.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg
                                className="w-6 h-6 text-purple-600 ml-0.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : isPdf && file.url ? (
                        <div
                          className="aspect-square cursor-pointer flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 group"
                          onClick={() => {
                            setSelectedPiece(file);
                            setShowPiecesModal(true);
                          }}
                        >
                          <DocumentTextIcon className="h-12 w-12 text-red-400 dark:text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase">
                            PDF
                          </span>
                        </div>
                      ) : (
                        <div
                          className="aspect-square flex items-center justify-center bg-gray-50 dark:bg-slate-900 cursor-pointer"
                          onClick={() => {
                            setSelectedPiece(file);
                            setShowPiecesModal(true);
                          }}
                        >
                          {getFileIcon(file)}
                        </div>
                      )}
                      <div className="p-2 text-center">
                        <p
                          className="text-xs text-gray-600 dark:text-gray-300 truncate"
                          title={file.nom_fichier}
                        >
                          {file.nom_fichier}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatFileSize(file.taille)}
                        </p>
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ArrowDownTrayIcon className="h-3 w-3" />
                            Télécharger
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section des réponses */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Historique des échanges
              </h3>
              <button
                onClick={() => setShowReponseForm(!showReponseForm)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <PencilIcon className="h-4 w-4" />
                {showReponseForm ? "Annuler" : "Ajouter une réponse"}
              </button>
            </div>

            {doleance.reponses && doleance.reponses.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {doleance.reponses.map((rep, index) => (
                  <div
                    key={index}
                    className={`border-l-4 pl-4 ${
                      rep.type_auteur === "citoyen"
                        ? "border-emerald-500"
                        : "border-blue-500"
                    }`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <span className="font-medium">
                          {rep.auteur ||
                            (rep.type_auteur === "citoyen"
                              ? "Citoyen"
                              : "Agent")}
                          <span
                            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                              rep.type_auteur === "citoyen"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {rep.type_auteur === "citoyen"
                              ? "Citoyen"
                              : "Agent"}
                          </span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDateTime(rep.date_reponse)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200">
                      {rep.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Aucune réponse pour le moment
              </p>
            )}

            {showReponseForm && (
              <form
                onSubmit={handleAddReponse}
                className="mt-4 pt-4 border-t dark:border-slate-700"
              >
                <textarea
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  placeholder="Écrire une réponse..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {sending ? "Envoi..." : "Envoyer la réponse"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Historique des statuts */}
          {doleance.historique_statuts &&
            doleance.historique_statuts.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Historique du traitement
                </h3>
                <div className="space-y-3">
                  {doleance.historique_statuts.map((hist, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {index === doleance.historique_statuts.length - 1 ? (
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                        ) : (
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {hist.ancien_statut_nom || "Création"}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 mx-2">
                            →
                          </span>
                          <span className="font-medium">
                            {hist.nouveau_statut_nom}
                          </span>
                          {hist.auteur && (
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              par {hist.auteur}
                            </span>
                          )}
                        </p>
                        {hist.commentaire && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {hist.commentaire}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDateTime(hist.date_changement)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Sidebar droite - Informations citoyen et actions */}
        <div className="space-y-6">
          {/* Informations citoyen */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5" />
              Informations citoyen
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nom complet
                </p>
                <p className="font-medium">
                  {doleance.citoyen_prenom} {doleance.citoyen_nom}
                </p>
              </div>
              {doleance.citoyen_email && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-sm">{doleance.citoyen_email}</p>
                </div>
              )}
              {doleance.citoyen_telephone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Téléphone
                  </p>
                  <p className="text-sm">{doleance.citoyen_telephone}</p>
                </div>
              )}
              {doleance.citoyen_adresse && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Adresse
                  </p>
                  <p className="text-sm">{doleance.citoyen_adresse}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              {(isAdminOrOperator || isDirectionAgent) && (
                <>
                  <select
                    onChange={(e) => handleUpdateStatut(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Changer le statut
                    </option>
                    <option value="2">En attente</option>
                    <option value="3">Assignée</option>
                    <option value="4">En traitement</option>
                    <option value="5">Résolue</option>
                    <option value="6">Clôturée</option>
                  </select>

                  <button
                    onClick={() => setShowReponseForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Répondre au citoyen
                  </button>
                </>
              )}
              {isDirectionAgent && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" />
                  Retourner la doléance
                </button>
              )}
            </div>
          </div>

          {/* Informations de localisation */}
          {(doleance.latitude || doleance.longitude) && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Localisation</h3>
              {doleance.latitude && doleance.longitude ? (
                <div className="space-y-4">
                  <LocationPickerMap
                    position={[
                      Number(doleance.latitude),
                      Number(doleance.longitude),
                    ]}
                    readOnly
                    zoom={16}
                    heightClass="h-64 sm:h-80"
                    showHint={false}
                    labels={{
                      coordinates: "Coordonnées GPS",
                      copy: "Copier",
                      copied: "Coordonnées copiées !",
                      copyError: "Copie impossible",
                      noPosition: "Aucune position",
                      recenter: "Recentrer",
                      locateMe: "Me localiser",
                      showQuartiers: "Afficher les quartiers",
                      hideQuartiers: "Masquer les quartiers",
                    }}
                  />
                  {doleance.lieu_exact && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Lieu exact
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-100">
                        {doleance.lieu_exact}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Aucune localisation fournie
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'aperçu des pièces jointes */}
      {showPiecesModal && selectedPiece && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedPiece)}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {selectedPiece.nom_fichier}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getFileTypeLabel(selectedPiece)} •{" "}
                    {formatFileSize(selectedPiece.taille)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPiecesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Aperçu du fichier */}
              {selectedPiece.url && (
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 text-center">
                  {selectedPiece.nom_fichier?.match(
                    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i,
                  ) ? (
                    <img
                      src={selectedPiece.url}
                      alt={selectedPiece.nom_fichier}
                      className="max-w-full max-h-[70vh] mx-auto object-contain"
                    />
                  ) : selectedPiece.nom_fichier?.match(
                      /\.(mp4|mov|avi|mkv|webm)$/i,
                    ) ? (
                    <video
                      src={selectedPiece.url}
                      controls
                      className="max-w-full max-h-[70vh] mx-auto"
                    />
                  ) : selectedPiece.nom_fichier?.match(/\.pdf$/i) ? (
                    <iframe
                      src={selectedPiece.url}
                      title={selectedPiece.nom_fichier}
                      className="w-full h-[70vh] border-0 rounded-lg"
                    />
                  ) : (
                    <div className="py-12">
                      <DocumentDuplicateIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Aperçu non disponible pour ce type de fichier
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Informations du fichier */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Nom du fichier
                  </p>
                  <p className="font-medium">{selectedPiece.nom_fichier}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-medium">
                    {getFileTypeLabel(selectedPiece)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Taille</p>
                  <p className="font-medium">
                    {formatFileSize(selectedPiece.taille)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Téléchargement
                  </p>
                  <a
                    href={selectedPiece.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Télécharger
                  </a>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-slate-900 border-t dark:border-slate-700 p-4 flex justify-end">
              <button
                onClick={() => setShowPiecesModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Modifier la doléance
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
              {/* Section Doléance */}
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Doléance
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={editForm.titre}
                      onChange={(e) =>
                        setEditForm({ ...editForm, titre: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Catégorie
                      </label>
                      <select
                        value={editForm.id_categorie}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            id_categorie: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- Sélectionner --</option>
                        {categories.map((c) => (
                          <option key={c.id_categorie} value={c.id_categorie}>
                            {c.nom_categorie}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Quartier
                      </label>
                      <select
                        value={editForm.id_quartier}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            id_quartier: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- Sélectionner --</option>
                        {quartiers.map((q) => (
                          <option key={q.id_quartier} value={q.id_quartier}>
                            {q.nom_quartier}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Lieu exact
                    </label>
                    <input
                      type="text"
                      value={editForm.lieu_exact}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lieu_exact: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Suggestions
                    </label>
                    <textarea
                      value={editForm.suggestions}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          suggestions: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section Citoyen */}
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Citoyen
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={editForm.citoyen_nom}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            citoyen_nom: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={editForm.citoyen_prenom}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            citoyen_prenom: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.citoyen_email}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          citoyen_email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        value={editForm.citoyen_telephone}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            citoyen_telephone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={editForm.citoyen_adresse}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            citoyen_adresse: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-2 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingEdit ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <PencilIcon className="h-4 w-4" />
                  )}
                  {savingEdit ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal retourner la doléance */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Retourner la doléance
              </h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Réf.{" "}
                <span className="font-mono font-bold text-blue-600">
                  {doleance.reference}
                </span>
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1">
                {doleance.titre}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Cette doléance sera retournée à l'Opérateur de suivi pour
              réassignation.
            </p>
            <form onSubmit={handleRetourner}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Motif du retour
                </label>
                <textarea
                  value={returnMotif}
                  onChange={(e) => setReturnMotif(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-900"
                  placeholder="Précisez la raison du retour..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Retour...
                    </>
                  ) : (
                    <>
                      <ArrowUturnLeftIcon className="h-4 w-4" />
                      Retourner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Layout d'impression (rendu dans <body> via un portail) ===== */}
      {createPortal(
        <div id="print-root">
          {/* Page 1 : informations + description (+ 1 ou 2 images) */}
          <div className="pr-page">
            <div className="pr-header">
              <img
                src={`${import.meta.env.BASE_URL}images/logo_CUA.svg`}
                alt="Logo CUA"
              />
              <div className="pr-header-text">
                <h1>COMMUNE URBAINE D'ANTANANARIVO</h1>
                <h2>DELEGATION SPECIALE</h2>
              </div>
            </div>

            <div className="pr-title">{doleance.titre}</div>

            <table className="pr-table">
              <tbody>
                <tr>
                  <td className="pr-label">Référence</td>
                  <td>{doleance.reference}</td>
                </tr>
                <tr>
                  <td className="pr-label">Titre du problème</td>
                  <td>{doleance.titre}</td>
                </tr>
                <tr>
                  <td className="pr-label">Nom du plaignant</td>
                  <td>
                    {doleance.citoyen_prenom} {doleance.citoyen_nom}
                  </td>
                </tr>
                <tr>
                  <td className="pr-label">Adresse</td>
                  <td>
                    {doleance.citoyen_adresse || doleance.lieu_exact || "—"}
                  </td>
                </tr>
                <tr>
                  <td className="pr-label">Date de dépôt</td>
                  <td>{formatDateTime(doleance.date_creation)}</td>
                </tr>
              </tbody>
            </table>

            <div className="pr-desc">
              <div className="pr-desc-label">Description du problème</div>
              <div className="pr-desc-value" style={{ fontSize: descFontSize }}>
                {doleance.description || "—"}
              </div>
            </div>

            {inlineImages.length > 0 && (
              <div
                className="pr-images"
                style={{
                  gridTemplateColumns: `repeat(${inlineImages.length}, minmax(0, 1fr))`,
                  gridTemplateRows: "minmax(0, 1fr)",
                }}
              >
                {inlineImages.map((img, index) => (
                  <div
                    className="pr-img-cell"
                    key={img.id_piece_jointe || img.id || index}
                  >
                    <img src={img.url} alt={img.nom_fichier} />
                  </div>
                ))}
              </div>
            )}

            {annexImages.length > 0 && (
              <div className="pr-note">
                {inlineImages.length > 0
                  ? `Suite des photos (${annexImages.length}) en page suivante`
                  : `Photos jointes (${annexImages.length}) en page suivante`}
              </div>
            )}

            <div className="pr-footer">
              <p style={{ margin: 0 }}>FITARAINANA</p>
              <div className="pr-date">Imprimé le {printDate}</div>
            </div>
          </div>

          {/* Pages d'annexe : photos (4 par page) */}
          {annexPages.map((pageImages, pageIndex) => (
            <div className="pr-page" key={`annex-${pageIndex}`}>
              <div className="pr-annex-title">
                Photos jointes – {doleance.reference}
                {annexPages.length > 1
                  ? ` (page ${pageIndex + 1}/${annexPages.length})`
                  : ""}
              </div>

              <div
                className="pr-annex-grid"
                style={{
                  // 1 ou 2 photos : empilées en grand ; 3 ou 4 : grille 2 x 2
                  gridTemplateColumns:
                    pageImages.length <= 2
                      ? "minmax(0, 1fr)"
                      : "repeat(2, minmax(0, 1fr))",
                  gridTemplateRows: `repeat(${
                    pageImages.length <= 2
                      ? pageImages.length
                      : Math.ceil(pageImages.length / 2)
                  }, minmax(0, 1fr))`,
                }}
              >
                {pageImages.map((img, index) => (
                  <figure
                    className="pr-figure"
                    key={img.id_piece_jointe || img.id || index}
                  >
                    <div className="pr-img-cell">
                      <img src={img.url} alt={img.nom_fichier} />
                    </div>
                    <figcaption>
                      Photo{" "}
                      {inlineImages.length +
                        pageIndex * IMAGES_PER_ANNEX_PAGE +
                        index +
                        1}
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div className="pr-footer">
                <p style={{ margin: 0 }}>FITARAINANA</p>
                <div className="pr-date">Imprimé le {printDate}</div>
              </div>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

export default DoleanceDetail;
