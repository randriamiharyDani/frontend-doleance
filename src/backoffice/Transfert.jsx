// backoffice/Transfert.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStatsRefresh } from '../contexts/StatsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  InboxIcon,
  CheckBadgeIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

// ---- Design tokens (kept local so the file stays drop-in) ----------------
// Navy  #0F172A / #1E3A8A  ·  Gold accent #D4AF37  ·  Slate neutrals

const STATUS_STYLES = {
  en_attente:  { dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50',  ring: 'ring-amber-200'  },
  en_cours:    { dot: 'bg-[#1E3A8A]',  text: 'text-[#1E3A8A]',  bg: 'bg-blue-50',   ring: 'ring-blue-200'   },
  transferee:  { dot: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-200' },
  traitee:     { dot: 'bg-emerald-500',text: 'text-emerald-700',bg: 'bg-emerald-50',ring: 'ring-emerald-200'},
  resolue:     { dot: 'bg-emerald-500',text: 'text-emerald-700',bg: 'bg-emerald-50',ring: 'ring-emerald-200'},
  cloturee:    { dot: 'bg-slate-400',  text: 'text-slate-600',  bg: 'bg-slate-100', ring: 'ring-slate-200'  },
  rejetee:     { dot: 'bg-rose-500',   text: 'text-rose-700',   bg: 'bg-rose-50',   ring: 'ring-rose-200'   },
  urgente:     { dot: 'bg-red-600',    text: 'text-red-700',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
};

const STATUS_LABELS = {
  en_attente: 'En attente',
  en_cours: 'En cours',
  transferee: 'Transférée',
  traitee: 'Traitée',
  resolue: 'Résolue',
  cloturee: 'Clôturée',
  rejetee: 'Rejetée',
  urgente: 'Urgente',
};

function normalizeStatut(nomStatut) {
  if (!nomStatut) return 'en_cours';
  const n = nomStatut.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
  if (n === 'transferee' || n === 'transfert') return 'transferee';
  if (n === 'enattente') return 'en_attente';
  if (n === 'ennouvelle' || n === 'nouvelle') return 'en_attente';
  if (n === 'en traitement' || n === 'entraitement') return 'en_cours';
  if (n === 'assigne' || n === 'assignee') return 'en_cours';
  if (n === 'traitee' || n === 'traite') return 'traitee';
  if (n === 'resolue' || n === 'resolu') return 'resolue';
  if (n === 'cloturee' || n === 'cloture') return 'cloturee';
  if (n === 'rejetee' || n === 'rejete') return 'rejetee';
  if (n === 'urgente' || n === 'urgent') return 'urgente';
  return n;
}

function getDisplayStatut(doleance) {
  const s = normalizeStatut(doleance.nom_statut);
  const isUrgent =
    (doleance.nom_priorite || '').toLowerCase().includes('urgent') ||
    Number(doleance.id_priorite) === 4;
  if (isUrgent && !['transferee', 'traitee', 'resolue', 'cloturee', 'rejetee'].includes(s)) {
    return 'urgente';
  }
  return s;
}

function StatusPill({ statut }) {
  const key = normalizeStatut(statut);
  const s = STATUS_STYLES[key] || STATUS_STYLES.cloturee;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 whitespace-nowrap ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {STATUS_LABELS[key] || statut}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, accent, sub }) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 p-4 sm:p-5 min-w-0">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 ${accent.bgSolid}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white mt-1 tabular-nums">{value}</p>
          {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent.bg}`}>
          <Icon className={`w-5 h-5 ${accent.text}`} />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-4 py-4 border-b border-slate-50 dark:border-slate-700">
      <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded" />
      <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded hidden sm:block" />
      <div className="h-3 flex-1 bg-slate-100 dark:bg-slate-700 rounded" />
      <div className="h-5 w-20 bg-slate-100 dark:bg-slate-700 rounded-full" />
    </div>
  );
}

function Transfert() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyStatsChange } = useStatsRefresh();

  const [doleances, setDoleances] = useState([]);
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoleance, setSelectedDoleance] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [filters, setFilters] = useState({ categorie: '', search: '', statut: '' });
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [transferData, setTransferData] = useState({
    id_direction: '',
    commentaire: '',
  });
  const [statsTotals, setStatsTotals] = useState({
    total: 0,
    enAttente: 0,
    enCours: 0,
    transferts: 0,
    resolues: 0,
  });

  const isAuthorized =
    user?.role === 'agent_central' ||
    user?.nom_role === 'agent_central' ||
    user?.role === 'administrateur_systeme' ||
    user?.nom_role === 'administrateur_systeme';

  useEffect(() => {
    if (isAuthorized) {
      fetchDirections();
      fetchCategories();
      fetchStatuts();
      fetchStats();
      fetchDoleances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/60 max-w-md w-full mx-4 p-8 text-center ring-1 ring-slate-100 dark:ring-slate-700">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Accès non autorisé</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
            Cette page est réservée à l'agent central et à l'administrateur système.
          </p>
          <button
            onClick={() => navigate('/backoffice/dashboard')}
            className="inline-flex items-center px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-semibold hover:bg-[#0F172A] transition-colors text-sm shadow-sm"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/doleances/stats/overview');
      if (response.data.success) {
        setStatsTotals({
          total: response.data.data.total || 0,
          enAttente: response.data.data.en_attente || 0,
          enCours: response.data.data.en_cours || 0,
          transferts: response.data.data.transferts || 0,
          resolues: response.data.data.resolues || 0,
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      calculateStatsFromData();
    }
  };

  const calculateStatsFromData = () => {
    const total = doleances.length;
    const enAttente = doleances.filter((d) => normalizeStatut(d.nom_statut) === 'en_attente').length;
    const enCours = doleances.filter((d) => normalizeStatut(d.nom_statut) === 'en_cours').length;
    const resolues = doleances.filter((d) => {
      const s = normalizeStatut(d.nom_statut);
      return s === 'traitee' || s === 'resolue' || s === 'cloturee';
    }).length;
    const transferts = doleances.filter((d) => normalizeStatut(d.nom_statut) === 'transferee').length;
    setStatsTotals({ total, enAttente, enCours, resolues, transferts });
  };

  const fetchDoleances = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 1000,
        ...filters,
      };
      if (!params.categorie) delete params.categorie;
      if (!params.search) delete params.search;
      if (!params.statut) delete params.statut;

      const response = await api.get('/doleances', { params });

      if (response.data.success) {
        let doleancesData = [];

        if (response.data.data && response.data.data.doleances) {
          doleancesData = response.data.data.doleances;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          doleancesData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          doleancesData = response.data.data;
        } else {
          doleancesData = response.data.data || [];
        }

        setDoleances(doleancesData);
      }
    } catch (error) {
      console.error('Erreur fetchDoleances:', error);
      toast.error('Erreur lors du chargement des doléances');
      setDoleances([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDirections = async () => {
    try {
      const response = await api.get('/directions');
      if (response.data.success) {
        setDirections(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement directions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/doleances/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const fetchStatuts = async () => {
    try {
      const response = await api.get('/doleances/statuts');
      if (response.data.success) {
        setStatuts(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement statuts:', error);
    }
  };

  const handleTransfert = async (e) => {
    e.preventDefault();
    if (!selectedDoleance) return;

    if (!transferData.id_direction) {
      toast.error('Veuillez sélectionner une direction de destination');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/doleances/${selectedDoleance.id_doleance}/transfert-central`, {
        id_direction: transferData.id_direction,
        commentaire: transferData.commentaire,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowTransferModal(false);
        setSelectedDoleance(null);
        setTransferData({ id_direction: '', commentaire: '' });
        fetchStats();
        fetchDoleances();
        notifyStatsChange();
      } else {
        toast.error(response.data.message || 'Erreur lors du transfert');
      }
    } catch (error) {
      console.error('Erreur transfert:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du transfert');
    } finally {
      setLoading(false);
    }
  };

  const openTransferModal = (doleance) => {
    setSelectedDoleance(doleance);
    setTransferData({ id_direction: '', commentaire: '' });
    setShowTransferModal(true);
  };

  const handleMettreEnCours = async (doleance) => {
    setLoading(true);
    try {
      const response = await api.put(`/doleances/${doleance.id_doleance}/statut`, {
        id_statut: 4,
        commentaire: 'Mise en cours de traitement depuis le transfert',
      });
      if (response.data.success) {
        toast.success('La doléance est maintenant en cours de traitement');
        fetchStats();
        fetchDoleances();
        notifyStatsChange();
      } else {
        toast.error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur mise en cours:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (idCategorie) => {
    const cat = categories.find((c) => c.id_categorie === idCategorie);
    return cat?.nom_categorie || 'Non catégorisée';
  };

  const canTransfer = (statut) => {
    const s = normalizeStatut(statut);
    return s !== 'transferee' && s !== 'traitee' && s !== 'resolue' && s !== 'cloturee' && s !== 'urgente' && s !== 'rejetee';
  };

  const refreshData = () => {
    fetchStats();
    fetchDoleances();
    fetchDirections();
    fetchCategories();
    fetchStatuts();
    toast.success('Données rafraîchies');
  };

  const hasActiveFilters = filters.categorie || filters.search || filters.statut;

  const doleancesNontransferts = doleances.filter((d) => canTransfer(d.nom_statut));
  const doleancestransferts = doleances.filter((d) => !canTransfer(d.nom_statut));

  const doleancesTransfertEnCours = doleancestransferts.filter((d) => {
    const s = normalizeStatut(d.nom_statut);
    return d.id_direction && s !== 'resolue' && s !== 'traitee' && s !== 'cloturee' && s !== 'rejetee';
  });

  const doleancesTransfertResolues = doleancestransferts.filter((d) => {
    const s = normalizeStatut(d.nom_statut);
    return s === 'resolue' || s === 'traitee' || s === 'cloturee';
  });

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Transfert de doléances
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Acheminer chaque doléance vers la bonne direction</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={refreshData}
            className="inline-flex items-center flex-shrink-0 px-3.5 py-2.5 bg-white dark:bg-slate-800 text-[#1E3A8A] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Rafraîchir
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center flex-shrink-0 px-3.5 py-2.5 rounded-xl transition-colors text-sm font-semibold ring-1 shadow-sm ${
              showFilters || hasActiveFilters
                ? 'bg-[#1E3A8A] text-white ring-[#1E3A8A]'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-1.5" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            )}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total"
          value={statsTotals.total}
          icon={InboxIcon}
          accent={{ bg: 'bg-slate-100 dark:bg-slate-700', bgSolid: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-300' }}
        />
        <StatCard
          label="Résolues"
          value={statsTotals.resolues}
          icon={CheckBadgeIcon}
          accent={{ bg: 'bg-emerald-50 dark:bg-emerald-900/30', bgSolid: 'bg-emerald-400', text: 'text-emerald-600' }}
        />
        <StatCard
          label="En attente"
          value={statsTotals.enAttente}
          icon={ClockIcon}
          accent={{ bg: 'bg-amber-50 dark:bg-amber-900/30', bgSolid: 'bg-amber-400', text: 'text-amber-600' }}
        />
        <StatCard
          label="Transférées"
          value={statsTotals.transferts}
          icon={PaperAirplaneIcon}
          accent={{ bg: 'bg-violet-50 dark:bg-violet-900/30', bgSolid: 'bg-violet-500', text: 'text-violet-600' }}
        />
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="min-w-0">
              <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1.5">Catégorie</label>
              <select
                value={filters.categorie}
                onChange={(e) => setFilters((prev) => ({ ...prev, categorie: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:bg-white dark:focus:bg-slate-800 transition-all"
              >
                <option value="">Toutes catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>
                    {cat.nom_categorie}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1.5">Statut</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters((prev) => ({ ...prev, statut: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:bg-white dark:focus:bg-slate-800 transition-all"
              >
                <option value="">Tous statuts</option>
                {statuts.map((stat) => (
                  <option key={stat.id_statut} value={stat.id_statut}>
                    {stat.nom_statut}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1.5">Rechercher</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Référence, titre..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ categorie: '', search: '', statut: '' })}
                disabled={!hasActiveFilters}
                className="w-full px-4 py-2.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste - table sur desktop, cartes sur mobile */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 overflow-hidden">
        {loading && doleances.length === 0 ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : doleances.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <InboxIcon className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">Aucune doléance trouvée</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              {hasActiveFilters ? 'Essayez d\u2019ajuster vos filtres.' : 'Rien à transférer pour le moment.'}
            </p>
          </div>
        ) : (
          <>
            {/* --- Vue tableau (sm+) --- */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">Réf.</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden lg:table-cell">Citoyen</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide w-full">Titre</th>
                    <th className="px-4 py-3 text-center text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">Statut</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden 2xl:table-cell">Direction</th>
                    <th className="px-4 py-3 text-right text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {doleancesNontransferts.map((doleance) => (
                    <tr key={doleance.id_doleance} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#1E3A8A] dark:text-blue-400 text-sm">
                        {doleance.reference}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 text-sm hidden lg:table-cell">
                        {doleance.citoyen_nom || '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 text-sm hidden md:table-cell">
                        {getCategoryName(doleance.id_categorie)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200 max-w-[140px] md:max-w-[220px] lg:max-w-xs xl:max-w-sm truncate text-sm">
                        {doleance.titre}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <StatusPill statut={getDisplayStatut(doleance)} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 text-sm hidden 2xl:table-cell">
                        {doleance.nom_direction || '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        {doleance.id_direction ? (
                          <button
                            onClick={() => handleMettreEnCours(doleance)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold shadow-sm whitespace-nowrap"
                          >
                            <PlayIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            Mettre en cours
                          </button>
                        ) : (
                          <button
                            onClick={() => openTransferModal(doleance)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#0F172A] transition-colors text-sm font-semibold shadow-sm whitespace-nowrap"
                          >
                            <PaperAirplaneIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            Transférer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {doleancesTransfertEnCours.length > 0 && (
                    <>
                      <tr>
                        <td colSpan="7" className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 text-center text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                          Déjà transférées – En cours
                        </td>
                      </tr>
                      {doleancesTransfertEnCours.map((doleance) => (
                        <tr key={doleance.id_doleance} className="bg-slate-50/30 dark:bg-slate-900/30 hover:bg-slate-50/60 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap font-mono font-semibold text-slate-400 dark:text-slate-500 text-sm">
                            {doleance.reference}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 dark:text-slate-500 text-sm hidden lg:table-cell">
                            {doleance.citoyen_nom || '—'}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 dark:text-slate-500 text-sm hidden md:table-cell">
                            {getCategoryName(doleance.id_categorie)}
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500 max-w-[140px] md:max-w-[220px] lg:max-w-xs xl:max-w-sm truncate text-sm">
                            {doleance.titre}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-center">
                            <StatusPill statut={getDisplayStatut(doleance)} />
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 dark:text-slate-500 text-sm hidden 2xl:table-cell">
                            {doleance.nom_direction || '—'}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-semibold whitespace-nowrap">
                              <ClockIcon className="h-3 w-3 flex-shrink-0" />
                              En cours
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {doleancesTransfertResolues.length > 0 && (
                    <>
                      <tr>
                        <td colSpan="7" className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 text-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                          Déjà transférées – Résolues / Traitées
                        </td>
                      </tr>
                      {doleancesTransfertResolues.map((doleance) => (
                        <tr key={doleance.id_doleance} className="bg-slate-50/30 dark:bg-slate-900/30 hover:bg-slate-50/60 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap font-mono font-semibold text-slate-400 dark:text-slate-500 text-sm">
                            {doleance.reference}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 dark:text-slate-500 text-sm hidden lg:table-cell">
                            {doleance.citoyen_nom || '—'}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 dark:text-slate-500 text-sm hidden md:table-cell">
                            {getCategoryName(doleance.id_categorie)}
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500 max-w-[140px] md:max-w-[220px] lg:max-w-xs xl:max-w-sm truncate text-sm">
                            {doleance.titre}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-center">
                            <StatusPill statut={getDisplayStatut(doleance)} />
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 dark:text-slate-500 text-sm hidden 2xl:table-cell">
                            {doleance.nom_direction || '—'}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-semibold whitespace-nowrap">
                              <CheckCircleIcon className="h-3 w-3 flex-shrink-0" />
                              {normalizeStatut(doleance.nom_statut) === 'cloturee' ? 'Clôturée' : normalizeStatut(doleance.nom_statut) === 'traitee' ? 'Traitée' : 'Résolue'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- Vue cartes (mobile) --- */}
            <div className="sm:hidden divide-y divide-slate-50 dark:divide-slate-700">
              {doleancesNontransferts.map((doleance) => (
                <div key={doleance.id_doleance} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-[#1E3A8A] dark:text-blue-400 text-sm">{doleance.reference}</span>
                    <StatusPill statut={getDisplayStatut(doleance)} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{doleance.titre}</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">
                    {getCategoryName(doleance.id_categorie)}
                    {doleance.citoyen_nom ? ` · ${doleance.citoyen_nom}` : ''}
                  </p>
                  {doleance.id_direction ? (
                    <button
                      onClick={() => handleMettreEnCours(doleance)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-semibold shadow-sm"
                    >
                      <PlayIcon className="h-3.5 w-3.5" />
                      Mettre en cours
                    </button>
                  ) : (
                    <button
                      onClick={() => openTransferModal(doleance)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#0F172A] transition-colors text-sm font-semibold shadow-sm"
                    >
                      <PaperAirplaneIcon className="h-3.5 w-3.5" />
                      Transférer
                    </button>
                  )}
                </div>
              ))}

              {doleancesTransfertEnCours.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 text-center text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    Déjà transférées – En cours
                  </div>
                  {doleancesTransfertEnCours.map((doleance) => (
                    <div key={doleance.id_doleance} className="p-4 bg-slate-50/30 dark:bg-slate-900/30">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono font-semibold text-slate-400 dark:text-slate-500 text-sm">{doleance.reference}</span>
                        <StatusPill statut={getDisplayStatut(doleance)} />
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{doleance.titre}</p>
                      {doleance.motif_transfert && (
                        <p className="text-xs italic text-amber-600 dark:text-amber-400 mt-1.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                          Motif : {doleance.motif_transfert}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}

              {doleancesTransfertResolues.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 text-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Déjà transférées – Résolues / Traitées
                  </div>
                  {doleancesTransfertResolues.map((doleance) => (
                    <div key={doleance.id_doleance} className="p-4 bg-slate-50/30 dark:bg-slate-900/30">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono font-semibold text-slate-400 dark:text-slate-500 text-sm">{doleance.reference}</span>
                        <StatusPill statut={getDisplayStatut(doleance)} />
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{doleance.titre}</p>
                      {doleance.motif_transfert && (
                        <p className="text-xs italic text-amber-600 dark:text-amber-400 mt-1.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                          Motif : {doleance.motif_transfert}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de transfert */}
      {showTransferModal && selectedDoleance && (
        <div
          className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            className="relative bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 animate-[slideUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <BuildingOfficeIcon className="w-5 h-5 text-[#1E3A8A]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-white">Transférer la doléance</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Choisissez la direction destinataire</p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg p-1.5 transition-colors flex-shrink-0"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm space-y-1">
              <p>
                <span className="font-semibold text-slate-500 dark:text-slate-400">Réf.</span>{' '}
                <span className="font-mono text-[#1E3A8A] font-semibold">{selectedDoleance.reference}</span>
              </p>
              <p className="text-slate-700 dark:text-slate-200 break-words">{selectedDoleance.titre}</p>
            </div>

            <form onSubmit={handleTransfert}>
              <div className="mb-3">
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Direction destinataire <span className="text-rose-500">*</span>
                </label>
                <select
                  value={transferData.id_direction}
                  onChange={(e) => setTransferData({ ...transferData, id_direction: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#1E3A8A]/30 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
                  required
                >
                  <option value="">Sélectionner une direction</option>
                  {directions.map((dir) => (
                    <option key={dir.id_direction} value={dir.id_direction}>
                      {dir.nom_direction}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Motif du transfert <span className="text-slate-400 dark:text-slate-500 font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={transferData.commentaire}
                  onChange={(e) => setTransferData({ ...transferData, commentaire: e.target.value })}
                  rows="2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#1E3A8A]/30 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm resize-none"
                  placeholder="Précisez la raison du transfert..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-sm transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#0F172A] disabled:opacity-50 font-semibold text-sm shadow-sm transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                  )}
                  {loading ? 'Transfert...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Transfert;