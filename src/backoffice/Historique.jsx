import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  resolue:  { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  cloturee: { dot: 'bg-slate-400',   text: 'text-slate-600',   bg: 'bg-slate-100', ring: 'ring-slate-200' },
  traitee:  { dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',    ring: 'ring-blue-200' },
};

const STATUS_LABELS = {
  resolue: 'Résolue',
  cloturee: 'Clôturée',
  traitee: 'Traitée',
};

const FILTER_OPTIONS = [
  { key: 'week',  label: 'Cette semaine', icon: ClockIcon },
  { key: 'month', label: 'Ce mois',       icon: CalendarDaysIcon },
  { key: 'year',  label: 'Cette année',   icon: CalendarDaysIcon },
];

function StatusPill({ statut }) {
  const key = (statut || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const s = STATUS_STYLES[key] || STATUS_STYLES.resolue;
  const label = STATUS_LABELS[key] || statut;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-4 py-4 border-b border-slate-50">
      <div className="h-3 w-16 bg-slate-100 rounded" />
      <div className="h-3 w-24 bg-slate-100 rounded hidden sm:block" />
      <div className="h-3 flex-1 bg-slate-100 rounded" />
      <div className="h-5 w-20 bg-slate-100 rounded-full" />
    </div>
  );
}

function Historique() {
  const { user } = useAuth();
  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });

  const isAuthorized =
    user?.role === 'administrateur_systeme' ||
    user?.nom_role === 'administrateur_systeme' ||
    user?.role === 'agent_central' ||
    user?.nom_role === 'agent_central' ||
    user?.role === 'directeur' ||
    user?.nom_role === 'directeur'||
    user?.role === 'agent' ||
    user?.nom_role === 'agent';;

  const fetchDoleances = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { filter, page, limit: pagination.limit };
      if (search.trim()) params.search = search.trim();

      const response = await api.get('/doleances/historique', { params });
      if (response.data.success) {
        setDoleances(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
      setDoleances([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search, pagination.limit]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/doleances/categories');
      if (response.data.success) setCategories(response.data.data);
    } catch (error) {
      console.error('Erreur categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchDoleances(1);
  }, [filter, isAuthorized]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoleances(1);
  };

  const getCategoryName = (idCategorie) => {
    const cat = categories.find((c) => c.id_categorie === idCategorie);
    return cat?.nom_categorie || '—';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center ring-1 ring-slate-100">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Accès non autorisé</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Cette page est réservée aux administrateurs et agents centraux.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Historique des doléances
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez les doléances résolues et clôturées
          </p>
        </div>
        <button
          onClick={() => fetchDoleances(pagination.page)}
          className="inline-flex items-center px-3.5 py-2.5 bg-white text-[#1E3A8A] rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold ring-1 ring-slate-200 shadow-sm"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1.5" />
          Rafraîchir
        </button>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ring-1 shadow-sm ${
              filter === key
                ? 'bg-[#1E3A8A] text-white ring-[#1E3A8A] shadow-md'
                : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par référence, titre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-transparent rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:bg-white transition-all ring-1 ring-slate-200"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-[#0F172A] transition-colors shadow-sm"
        >
          Rechercher
        </button>
      </form>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-bold text-[#0F172A]">{pagination.total}</span> doléance{pagination.total > 1 ? 's' : ''} trouvée{pagination.total > 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        {loading && doleances.length === 0 ? (
          <div>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : doleances.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <InboxIcon className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold text-sm">Aucune doléance trouvée</p>
            <p className="text-slate-400 text-sm mt-1">
              Aucune doléance résolue pour cette période.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-xl">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 uppercase tracking-wide">Réf.</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Citoyen</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 uppercase tracking-wide">Titre</th>
                    <th className="px-4 py-3 text-center text-[13px] font-bold text-slate-400 uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 uppercase tracking-wide hidden xl:table-cell">Direction</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold text-slate-400 uppercase tracking-wide">Résolu le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {doleances.map((d) => (
                    <tr key={d.id_doleance} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#1E3A8A] text-sm">
                        {d.reference}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-sm hidden lg:table-cell">
                        {d.citoyen_nom || '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-sm hidden md:table-cell">
                        {getCategoryName(d.id_categorie)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 max-w-[200px] truncate text-sm">
                        {d.titre}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <StatusPill statut={d.nom_statut} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-sm hidden xl:table-cell">
                        {d.nom_direction || '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-sm">
                        <div className="flex items-center gap-1.5">
                          <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                          {formatDate(d.date_mise_a_jour)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-50">
              {doleances.map((d) => (
                <div key={d.id_doleance} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-bold text-[#1E3A8A] text-sm">{d.reference}</span>
                    <StatusPill statut={d.nom_statut} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{d.titre}</p>
                  <p className="text-sm text-slate-400">
                    {getCategoryName(d.id_categorie)}
                    {d.citoyen_nom ? ` · ${d.citoyen_nom}` : ''}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                    Résolu le {formatDate(d.date_mise_a_jour)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.page} sur {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchDoleances(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 bg-white text-slate-600 rounded-xl text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Précédent
            </button>
            <button
              onClick={() => fetchDoleances(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="inline-flex items-center gap-1 px-3 py-2 bg-white text-slate-600 rounded-xl text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Historique;
