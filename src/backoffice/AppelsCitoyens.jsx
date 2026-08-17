import React, { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';
import {
  PhoneIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneXMarkIcon,
  ClockIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  InboxIcon,
  ChartBarIcon,
  EyeIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const STATUS_CONFIG = {
  ringing:  { dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50',  ring: 'ring-orange-200',  label: 'En attente' },
  accepted: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', label: 'Accepté' },
  rejected: { dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',     ring: 'ring-red-200',     label: 'Refusé' },
  ended:    { dot: 'bg-slate-400',  text: 'text-slate-600',  bg: 'bg-slate-100',  ring: 'ring-slate-200',  label: 'Terminé' },
  missed:   { dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50',   ring: 'ring-amber-200',  label: 'Manqué' },
};

const STATUS_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'accepted', label: 'Accepté' },
  { key: 'missed', label: 'Manqué' },
  { key: 'rejected', label: 'Refusé' },
  { key: 'ended', label: 'Terminé' },
  { key: 'ringing', label: 'En attente' },
];

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280', '#F97316'];

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '—';
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusPill({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.ended;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
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

function AppelsCitoyens() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [callTypeFilter, setCallTypeFilter] = useState('');

  const [selectedCall, setSelectedCall] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchCalls = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (statusFilter) params.status = statusFilter;
      if (callTypeFilter) params.call_type = callTypeFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (search.trim()) params.search = search.trim();

      const res = await chatService.getAdminCalls(params);
      if (res.data.success) {
        setCalls(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Erreur chargement appels:', err);
      toast.error('Erreur lors du chargement des appels');
      setCalls([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, callTypeFilter, dateFrom, dateTo, search, pagination.limit]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await chatService.getAdminCallStats(params);
      if (res.data.success) setStats(res.data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchCalls(1); }, [fetchCalls]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCalls(1);
  };

  const handleCallDetail = async (callId) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await chatService.getAdminCallDetail(callId);
      if (res.data.success) setSelectedCall(res.data.call);
    } catch (err) {
      toast.error('Erreur lors du chargement des détails');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const resetFilters = () => {
    setStatusFilter('');
    setCallTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setSearch('');
  };

  const pieData = stats?.totals ? [
    { name: 'Accepté', value: Number(stats.totals.accepted) || 0 },
    { name: 'Manqué', value: Number(stats.totals.missed) || 0 },
    { name: 'Refusé', value: Number(stats.totals.rejected) || 0 },
    { name: 'Terminé', value: Number(stats.totals.ended) || 0 },
    { name: 'En attente', value: Number(stats.totals.ringing) || 0 },
  ].filter(d => d.value > 0) : [];

  const hourData = stats?.byHour?.map(h => ({
    hour: `${String(h.hour).padStart(2, '0')}h`,
    total: h.total,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Appels citoyens
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historique et gestion des appels reçus des citoyens
          </p>
        </div>
        <button onClick={() => { fetchCalls(pagination.page); fetchStats(); }} className="btn-secondary btn-md">
          <ArrowPathIcon className="h-4 w-4" />
          Rafraîchir
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={PhoneIcon} label="Total appels" value={stats?.totals?.total ?? '—'} color="bg-blue-600" />
        <StatCard icon={CheckCircleIcon} label="Acceptés" value={stats?.totals?.accepted ?? '—'} color="bg-emerald-600" />
        <StatCard icon={NoSymbolIcon} label="Manqués" value={stats?.totals?.missed ?? '—'} color="bg-amber-500" />
        <StatCard icon={XCircleIcon} label="Refusés" value={stats?.totals?.rejected ?? '—'} color="bg-red-600" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Graphique tendance par jour */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4" />
            Appels par jour
          </h3>
          {stats?.byDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => {
                  const d = new Date(v);
                  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="accepted" name="Acceptés" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="missed" name="Manqués" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="Refusés" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Graphique répartition par statut */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4" />
            Répartition par statut
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Graphique appels par heure */}
      {hourData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Volume d'appels par heure
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="total" name="Appels" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Statut */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            {/* Date From */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input text-xs py-1.5 w-full sm:w-auto"
              placeholder="Date début"
            />
            {/* Date To */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input text-xs py-1.5 w-full sm:w-auto"
              placeholder="Date fin"
            />
            {/* Type */}
            <select
              value={callTypeFilter}
              onChange={(e) => setCallTypeFilter(e.target.value)}
              className="input text-xs py-1.5 w-full sm:w-auto"
            >
              <option value="">Tous les types</option>
              <option value="audio">Audio</option>
              <option value="video">Vidéo</option>
            </select>
            {/* Reset */}
            <button onClick={resetFilters} className="btn-secondary btn-sm text-xs">
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Recherche */}
        <form onSubmit={handleSearch} className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary btn-md">Rechercher</button>
        </form>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> appel{pagination.total > 1 ? 's' : ''} trouvée{pagination.total > 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 overflow-hidden">
        {loading && calls.length === 0 ? (
          <div>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : calls.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-gray-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <InboxIcon className="w-7 h-7 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold text-sm">Aucun appel trouvé</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Aucun appel ne correspond aux filtres sélectionnés.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Citoyen / Appelant</th>
                    <th className="hidden md:table-cell">Agent / Destinataire</th>
                    <th>Date</th>
                    <th className="hidden lg:table-cell">Heure</th>
                    <th className="hidden lg:table-cell">Durée</th>
                    <th className="text-center">Statut</th>
                    <th className="text-center">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="font-mono font-semibold text-blue-700 dark:text-blue-400 text-sm">
                        #{c.id}
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          c.call_type === 'video'
                            ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                            : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                        }`}>
                          {c.call_type === 'video' ? 'Vidéo' : 'Audio'}
                        </span>
                      </td>
                      <td className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                        {c.is_citizen_call ? (
                          <span className="inline-flex items-center gap-1">
                            <UserCircleIcon className="h-4 w-4 text-gray-400" />
                            Citoyen
                          </span>
                        ) : (
                          c.caller_name || '—'
                        )}
                      </td>
                      <td className="text-gray-500 dark:text-gray-400 text-sm hidden md:table-cell">
                        {c.callee_name || '—'}
                      </td>
                      <td className="text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(c.started_at)}
                      </td>
                      <td className="text-gray-500 dark:text-gray-400 text-sm hidden lg:table-cell">
                        {formatTime(c.started_at)}
                      </td>
                      <td className="text-gray-500 dark:text-gray-400 text-sm font-mono hidden lg:table-cell">
                        {formatDuration(c.duration_seconds)}
                      </td>
                      <td className="text-center">
                        <StatusPill status={c.status} />
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleCallDetail(c.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
              {calls.map((c) => (
                <div key={c.id} className="p-4 space-y-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => handleCallDetail(c.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-semibold text-blue-700 dark:text-blue-400 text-sm">#{c.id}</span>
                    <StatusPill status={c.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {c.is_citizen_call ? (
                      <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-200 font-medium">
                        <UserCircleIcon className="h-4 w-4 text-gray-400" />
                        Citoyen
                      </span>
                    ) : (
                      <span className="text-gray-700 dark:text-gray-200 font-medium">{c.caller_name}</span>
                    )}
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-500 dark:text-gray-400">{c.callee_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    <span>{formatDate(c.started_at)} {formatTime(c.started_at)}</span>
                    <span>{formatDuration(c.duration_seconds)}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      c.call_type === 'video' ? 'bg-purple-50 text-purple-700' : 'bg-sky-50 text-sky-700'
                    }`}>
                      {c.call_type === 'video' ? 'Vidéo' : 'Audio'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchCalls} />

      {/* Modal Détails */}
      <Modal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedCall(null); }}
        title="Détails de l'appel"
        subtitle={selectedCall ? `Appel #${selectedCall.id}` : ''}
        size="max-w-lg"
      >
        {detailLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded" />
                <div className="h-4 flex-1 bg-slate-100 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : selectedCall ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <StatusPill status={selectedCall.status} />
            </div>

            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Appelant</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedCall.is_citizen_call ? 'Citoyen (anonyme)' : `${selectedCall.caller_name}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Destinataire</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCall.callee_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                  selectedCall.call_type === 'video'
                    ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                    : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                }`}>
                  {selectedCall.call_type === 'video' ? 'Vidéo' : 'Audio'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  Date
                </span>
                <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedCall.started_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Heure de début
                </span>
                <span className="text-sm text-gray-900 dark:text-white">{formatTime(selectedCall.started_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Heure de fin
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {selectedCall.ended_at ? formatTime(selectedCall.ended_at) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Durée</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  {formatDuration(selectedCall.duration_seconds)}
                </span>
              </div>
            </div>

            {selectedCall.is_citizen_call === 1 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300 text-center">
                Cet appel a été passé par un citoyen via la page publique "Appeler un agent"
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default AppelsCitoyens;
