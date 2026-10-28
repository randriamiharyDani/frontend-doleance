import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStatsRefresh } from '../contexts/StatsContext';
import doleanceService from '../services/doleanceService';
import toast from 'react-hot-toast';
import { STATUTS_BLOQUES } from '../pages/backoffice/Doleances/DoleanceCard';
import DoleanceHeader from '../pages/backoffice/Doleances/DoleanceHeader';
import DoleanceFilters from '../pages/backoffice/Doleances/DoleanceFilters';
import DoleanceCard from '../pages/backoffice/Doleances/DoleanceCard';
import DoleanceDetailModal from '../pages/backoffice/Doleances/DoleanceDetailModal';
import DeleteConfirmModal from '../pages/backoffice/Doleances/DeleteConfirmModal';
import PrioriteModal from '../pages/backoffice/Doleances/PrioriteModal';
import ReponseModal from '../pages/backoffice/Doleances/ReponseModal';
import StatutModal from '../pages/backoffice/Doleances/StatutModal';
import MotsDetectesModal from '../pages/backoffice/Doleances/MotsDetectesModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { DocumentTextIcon, ArrowDownTrayIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

// ---------- Utilitaires de période ----------
const pad = (n) => String(n).padStart(2, '0');

// YYYY-MM-DD en heure locale (évite le décalage UTC)
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatFR = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

// Semaine ISO de la date → "YYYY-Www"
const toISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad(week)}`;
};

// "YYYY-Www" → lundi de cette semaine
const mondayOfISOWeek = (value) => {
  const [y, w] = value.split('-W').map(Number);
  const jan4 = new Date(y, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7; // lundi = 0
  const monday = new Date(y, 0, 4 - jan4Day + (w - 1) * 7);
  return monday;
};

const defaultValueFor = (mode) => {
  const now = new Date();
  if (mode === 'jour') return toISODate(now);
  if (mode === 'semaine') return toISOWeek(now);
  if (mode === 'mois') return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  return '';
};

// Retourne { start, end } (objets Date) ou null
const getRange = (mode, value) => {
  if (!mode || mode === 'tout' || !value) return null;
  if (mode === 'jour') {
    const [y, m, d] = value.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    return { start, end: start };
  }
  if (mode === 'semaine') {
    const start = mondayOfISOWeek(value);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    return { start, end };
  }
  if (mode === 'mois') {
    const [y, m] = value.split('-').map(Number);
    return { start: new Date(y, m - 1, 1), end: new Date(y, m, 0) };
  }
  return null;
};

const getRangeLabel = (mode, range) => {
  if (!range) return 'Toutes les périodes';
  if (mode === 'jour') return `Jour : ${formatFR(range.start)}`;
  if (mode === 'semaine') return `Semaine du ${formatFR(range.start)} au ${formatFR(range.end)}`;
  if (mode === 'mois') {
    const label = range.start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return `Mois : ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
  }
  return '';
};

// Date de création d'une doléance (adapter les noms de champs si besoin)
const getDoleanceDate = (d) => {
  const raw = d.date_creation || d.created_at || d.date_soumission || d.date_doleance;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const PERIOD_MODES = [
  { key: 'tout', label: 'Tout' },
  { key: 'jour', label: 'Jour' },
  { key: 'semaine', label: 'Semaine' },
  { key: 'mois', label: 'Mois' },
];

function Doleances() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifyStatsChange } = useStatsRefresh();
  const userRole = user?.role || user?.nom_role;
  const isSuperAdmin = userRole === 'administrateur_systeme';
  const isAgentCentral = userRole === 'agent_central';
  const isDirecteur = userRole === 'directeur';
  const isChefService = userRole === 'chef_service';
  const isAgent = userRole === 'agent';
  const isAdminOrAgentCentral = isSuperAdmin || isAgentCentral;
  const canTraiter = isDirecteur || isChefService || isAgent;

  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [priorites, setPriorites] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedPriorite, setSelectedPriorite] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filtre par période (jour / semaine / mois)
  const [periodMode, setPeriodMode] = useState('tout');
  const [periodValue, setPeriodValue] = useState('');
  const [exporting, setExporting] = useState(false);

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const [selectedDoleance, setSelectedDoleance] = useState(null);
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [loadingPieces, setLoadingPieces] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doleanceToDelete, setDoleanceToDelete] = useState(null);
  const [showPrioriteModal, setShowPrioriteModal] = useState(false);
  const [doleanceToUpdate, setDoleanceToUpdate] = useState(null);
  const [selectedPrioriteValue, setSelectedPrioriteValue] = useState('');
  const [showReponseModal, setShowReponseModal] = useState(false);
  const [selectedDoleanceForReponse, setSelectedDoleanceForReponse] = useState(null);
  const [reponseText, setReponseText] = useState('');
  const [showStatutModal, setShowStatutModal] = useState(false);
  const [selectedStatutValue, setSelectedStatutValue] = useState('');
  const [showMotsModal, setShowMotsModal] = useState(false);
  const [doleanceMots, setDoleanceMots] = useState(null);

  const isNouvelle = (statut) => ['En attente', 'Nouvelle', 'en_attente'].includes(statut);
  const isBloquee = (statut) => STATUTS_BLOQUES.includes(statut);

  const sortByAlphabetical = (data, key = 'nom_categorie') => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => (a[key] || '').localeCompare(b[key] || '', 'fr'));
  };

  const buildFullAddress = (d) => {
    const parts = [];
    if (d.citoyen_adresse) parts.push(d.citoyen_adresse);
    if (d.nom_quartier) parts.push(d.nom_quartier);
    if (d.nom_arrondissement) parts.push(d.nom_arrondissement);
    return parts.join(', ');
  };

  // Plage de dates calculée depuis le mode + la valeur choisie
  const range = useMemo(() => getRange(periodMode, periodValue), [periodMode, periodValue]);
  const dateDebut = range ? toISODate(range.start) : '';
  const dateFin = range ? toISODate(range.end) : '';

  const fetchDoleances = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (selectedCategorie) params.categorie = selectedCategorie;
      if (selectedStatut) params.statut = selectedStatut;
      if (selectedPriorite) params.priorite = selectedPriorite;
      if (searchTerm) params.search = searchTerm;
      if (dateDebut) params.date_debut = dateDebut;
      if (dateFin) params.date_fin = dateFin;

      const result = await doleanceService.getBackoffice(params);
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
      toast.error('Erreur chargement doléances');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, selectedCategorie, selectedStatut, selectedPriorite, searchTerm, dateDebut, dateFin]);

  const fetchFilters = useCallback(async () => {
    try {
      const [categoriesRes, statutsRes, prioritesRes] = await Promise.all([
        doleanceService.getCategories(),
        doleanceService.getStatuts(),
        doleanceService.getPriorites()
      ]);
      setCategories(sortByAlphabetical(categoriesRes?.data || [], 'nom_categorie'));
      setStatuts(statutsRes?.data || []);
      setPriorites(prioritesRes?.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchDoleances();
  }, [fetchDoleances]);

  const fetchPiecesJointes = async (doleanceId) => {
    setLoadingPieces(true);
    try {
      const result = await doleanceService.getPiecesJointes(doleanceId);
      setPiecesJointes(result?.data || []);
    } catch {
      setPiecesJointes([]);
    } finally {
      setLoadingPieces(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); setPagination(prev => ({ ...prev, page: 1 })); };
  const handleReset = () => {
    setSearchTerm(''); setSelectedCategorie(''); setSelectedStatut(''); setSelectedPriorite('');
    setPeriodMode('tout'); setPeriodValue('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // ---------- Période ----------
  const handlePeriodModeChange = (mode) => {
    setPeriodMode(mode);
    setPeriodValue(defaultValueFor(mode));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePeriodValueChange = (value) => {
    setPeriodValue(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // ---------- Export PDF ----------
  const handleExportPdf = async () => {
    setExporting(true);
    const toastId = toast.loading('Génération du PDF...');
    try {
      // Récupère toutes les doléances correspondant aux filtres (sans pagination)
      const params = { page: 1, limit: 1000 };
      if (selectedCategorie) params.categorie = selectedCategorie;
      if (selectedStatut) params.statut = selectedStatut;
      if (selectedPriorite) params.priorite = selectedPriorite;
      if (searchTerm) params.search = searchTerm;
      if (dateDebut) params.date_debut = dateDebut;
      if (dateFin) params.date_fin = dateFin;

      const result = await doleanceService.getBackoffice(params);
      let rows = result?.data?.data?.doleances || [];

      // Sécurité : filtre aussi côté client si l'API ignore les dates
      if (range) {
        const startMs = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate()).getTime();
        const endMs = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate(), 23, 59, 59, 999).getTime();
        rows = rows.filter((d) => {
          const date = getDoleanceDate(d);
          return !date || (date.getTime() >= startMs && date.getTime() <= endMs);
        });
      }

      if (rows.length === 0) {
        toast.error('Aucune doléance à exporter', { id: toastId });
        return;
      }

      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // En-tête
      doc.setFillColor(16, 48, 127);
      doc.rect(0, 0, pageWidth, 24, 'F');
      doc.setFillColor(255, 199, 44);
      doc.rect(0, 24, pageWidth, 1.2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text("Commune Urbaine d'Antananarivo", 14, 11);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Liste des doléances', 14, 18);

      doc.setTextColor(19, 33, 79);
      doc.setFontSize(10);
      doc.text(getRangeLabel(periodMode, range), 14, 33);
      doc.text(`${rows.length} doléance(s) - Exporté le ${formatFR(new Date())}`, 14, 39);

      const nomComplet = (d) =>
        [d.citoyen_prenom, d.citoyen_nom].filter(Boolean).join(' ') || d.nom_citoyen || '-';

      autoTable(doc, {
        startY: 44,
        head: [['N°', 'Date', 'Citoyen', 'Catégorie', 'Adresse', 'Direction', 'Priorité', 'Statut']],
        body: rows.map((d) => {
          const date = getDoleanceDate(d);
          return [
            d.numero_doleance || d.reference || d.id_doleance,
            date ? formatFR(date) : '-',
            nomComplet(d),
            d.nom_categorie || '-',
            buildFullAddress(d) || '-',
            d.nom_direction || '-',
            d.nom_priorite || '-',
            d.nom_statut || '-',
          ];
        }),
        styles: { fontSize: 8, cellPadding: 2, textColor: [19, 33, 79], overflow: 'linebreak' },
        headStyles: { fillColor: [16, 48, 127], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [244, 247, 255] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 22 },
          4: { cellWidth: 55 },
        },
        margin: { left: 14, right: 14, bottom: 14 },
        didDrawPage: () => {
          const page = doc.internal.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(120, 130, 160);
          doc.text(`Page ${page}`, pageWidth - 14, pageHeight - 6, { align: 'right' });
        },
      });

      const suffix = range
        ? periodMode === 'jour'
          ? dateDebut
          : `${dateDebut}_${dateFin}`
        : toISODate(new Date());
      doc.save(`doleances_${suffix}.pdf`);
      toast.success('PDF exporté', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'export PDF', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const openDetailsModal = async (doleance) => {
    navigate(`/backoffice/doleances/${doleance.id_doleance}`);
  };

  const openPrintPage = async (doleance) => {
    navigate(`/backoffice/doleances/${doleance.id_doleance}/imprimer`);
  };

  const confirmDelete = (doleance) => {
    if (!isAdminOrAgentCentral) { toast.error('Vous n\'avez pas les droits'); return; }
    setDoleanceToDelete(doleance);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const result = await doleanceService.delete(doleanceToDelete.id_doleance);
      if (result?.success) { toast.success('Doléance supprimée'); fetchDoleances(); notifyStatsChange(); }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur suppression');
    } finally {
      setShowDeleteConfirm(false); setDoleanceToDelete(null);
    }
  };

  const openPrioriteModal = (doleance) => {
    if (!isAdminOrAgentCentral) { toast.error('Accès refusé'); return; }
    setDoleanceToUpdate(doleance);
    setSelectedPrioriteValue(doleance.id_priorite?.toString() || '');
    setShowPrioriteModal(true);
  };

  const handleUpdatePriorite = async () => {
    try {
      const result = await doleanceService.updatePriorite(doleanceToUpdate.id_doleance, parseInt(selectedPrioriteValue));
      if (result?.success) { toast.success('Priorité modifiée'); fetchDoleances(); setShowPrioriteModal(false); notifyStatsChange(); }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur modification');
    }
  };

  const openReponseModal = (doleance) => {
    if (isBloquee(doleance.nom_statut)) { toast.error('Cette doléance est verrouillée'); return; }
    if (isNouvelle(doleance.nom_statut) && !isAdminOrAgentCentral) { toast.error('Seul l\'administrateur peut répondre aux nouvelles doléances'); return; }
    if (!isAdminOrAgentCentral && doleance.id_direction !== user?.id_direction && doleance.id_utilisateur_assignee !== user?.id_utilisateur) { toast.error('Vous ne pouvez pas répondre à cette doléance'); return; }
    setSelectedDoleanceForReponse(doleance);
    setReponseText('');
    setShowReponseModal(true);
  };

  const handleSendReponse = async () => {
    if (!reponseText.trim()) { toast.error('Veuillez écrire une réponse'); return; }
    try {
      const result = await doleanceService.addReponse(selectedDoleanceForReponse.id_doleance, reponseText);
      if (result?.success) { toast.success('Réponse envoyée'); setShowReponseModal(false); fetchDoleances(); }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur envoi');
    }
  };

  const openStatutModal = (doleance) => {
    if (isBloquee(doleance.nom_statut)) { toast.error('Cette doléance est verrouillée'); return; }
    if (!isAdminOrAgentCentral) { toast.error('Seul l\'administrateur peut changer le statut'); return; }
    setSelectedDoleanceForReponse(doleance);
    setSelectedStatutValue(doleance.id_statut?.toString() || '');
    setShowStatutModal(true);
  };

  const handleUpdateStatut = async () => {
    try {
      const result = await doleanceService.updateStatut(selectedDoleanceForReponse.id_doleance, parseInt(selectedStatutValue));
      if (result?.success) { toast.success('Statut modifié'); setShowStatutModal(false); fetchDoleances(); notifyStatsChange(); }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur modification');
    }
  };

  const openMotsModal = (doleance) => {
    setDoleanceMots(doleance);
    setShowMotsModal(true);
  };

  const canUserView = (doleance) => {
    if (isAdminOrAgentCentral) return true;
    if (!user?.id_direction && doleance.id_utilisateur_assignee === user?.id_utilisateur) return true;
    if (doleance.id_direction === user?.id_direction) return true;
    return false;
  };

  const canUserAct = (doleance) => {
    if (isBloquee(doleance.nom_statut)) return false;
    if (isAdminOrAgentCentral) return true;
    if (isNouvelle(doleance.nom_statut)) return false;
    if (doleance.id_direction === user?.id_direction && canTraiter) return true;
    if (!user?.id_direction && doleance.id_utilisateur_assignee === user?.id_utilisateur && canTraiter) return true;
    return false;
  };

  return (
    <div>

      <DoleanceHeader userRole={userRole} isAdminOrAgentCentral={isAdminOrAgentCentral} />

      {/* Période + export PDF */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#13214f] dark:text-white">
            <CalendarDaysIcon className="h-5 w-5 text-[#10307f] dark:text-[#ffc72c]" />
            Période
          </span>

          <div className="inline-flex rounded-xl bg-[#10307f]/5 p-1 dark:bg-white/10" role="group" aria-label="Type de période">
            {PERIOD_MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => handlePeriodModeChange(m.key)}
                aria-pressed={periodMode === m.key}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc72c] ${
                  periodMode === m.key
                    ? 'bg-[#10307f] text-white shadow'
                    : 'text-[#13214f] hover:bg-[#10307f]/10 dark:text-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {periodMode === 'jour' && (
            <input
              type="date"
              value={periodValue}
              onChange={(e) => handlePeriodValueChange(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#13214f] focus:outline-none focus:ring-2 focus:ring-[#10307f] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          )}
          {periodMode === 'semaine' && (
            <input
              type="week"
              value={periodValue}
              onChange={(e) => handlePeriodValueChange(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#13214f] focus:outline-none focus:ring-2 focus:ring-[#10307f] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          )}
          {periodMode === 'mois' && (
            <input
              type="month"
              value={periodValue}
              onChange={(e) => handlePeriodValueChange(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#13214f] focus:outline-none focus:ring-2 focus:ring-[#10307f] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          )}

          {range && (
            <span className="text-xs text-gray-500 dark:text-slate-400">{getRangeLabel(periodMode, range)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exporting || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ffc72c] bg-[#ffc72c] px-4 py-2 text-sm font-bold text-[#13214f] transition-all hover:-translate-y-px hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10307f] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          {exporting ? 'Export...' : 'Exporter PDF'}
        </button>
      </div>

      <DoleanceFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        onSubmit={handleSearch} onReset={handleReset}
        showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)}
        selectedCategorie={selectedCategorie} onCategorieChange={setSelectedCategorie}
        selectedStatut={selectedStatut} onStatutChange={setSelectedStatut}
        selectedPriorite={selectedPriorite} onPrioriteChange={setSelectedPriorite}
        categories={categories} statuts={statuts} priorites={priorites}
      />

      {loading ? (
        <LoadingSpinner text="Chargement des doléances..." />
      ) : doleances.length === 0 ? (
        <EmptyState icon={DocumentTextIcon} title="Aucune doléance" description="Aucune doléance ne correspond à vos critères." />
      ) : (
        <div className="space-y-4">
          {doleances.map((doleance) => (
            <DoleanceCard
              key={doleance.id_doleance}
              doleance={doleance}
              user={user}
              isAdminOrAgentCentral={isAdminOrAgentCentral}
              canTraiter={canTraiter}
              onView={openDetailsModal}
              // onDelete={confirmDelete}
              onPriorite={openPrioriteModal}
              onReponse={openReponseModal}
              onStatut={openStatutModal}
              onImprimer={openPrintPage}
              onVoirMots={openMotsModal}
              isNouvelle={isNouvelle(doleance.nom_statut)}
              isBloquee={isBloquee(doleance.nom_statut)}
              isDeSaDirection={doleance.id_direction === user?.id_direction || (!user?.id_direction && doleance.id_utilisateur_assignee === user?.id_utilisateur)}
              userCanAct={canUserAct(doleance)}
              userCanView={canUserView(doleance)}
              fullAddress={buildFullAddress(doleance)}
            />
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))} />

      <DoleanceDetailModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        doleance={selectedDoleance}
        piecesJointes={piecesJointes}
        loadingPieces={loadingPieces}
      />

      {/* <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDoleanceToDelete(null); }}
        onConfirm={handleDelete}
        doleance={doleanceToDelete}
      /> */}

      <PrioriteModal
        isOpen={showPrioriteModal}
        onClose={() => setShowPrioriteModal(false)}
        onConfirm={handleUpdatePriorite}
        priorites={priorites}
        selectedValue={selectedPrioriteValue}
        onValueChange={setSelectedPrioriteValue}
        doleance={doleanceToUpdate}
      />

      <ReponseModal
        isOpen={showReponseModal}
        onClose={() => setShowReponseModal(false)}
        onSend={handleSendReponse}
        reponseText={reponseText}
        onTextChange={setReponseText}
        doleance={selectedDoleanceForReponse}
        isNouvelle={isNouvelle(selectedDoleanceForReponse?.nom_statut)}
      />

      <StatutModal
        isOpen={showStatutModal}
        onClose={() => setShowStatutModal(false)}
        onConfirm={handleUpdateStatut}
        statuts={statuts}
        selectedValue={selectedStatutValue}
        onValueChange={setSelectedStatutValue}
        doleance={selectedDoleanceForReponse}
      />

      <MotsDetectesModal
        isOpen={showMotsModal}
        onClose={() => setShowMotsModal(false)}
        doleance={doleanceMots}
      />
    </div>
  );
}

export default Doleances;