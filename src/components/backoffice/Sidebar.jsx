import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import socket from '../../config/socket';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ArrowPathIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCurrentUserOnline, setIsCurrentUserOnline] = useState(false);

  useEffect(() => {
    const uid = user?.id_utilisateur || user?.id;
    if (uid) {
      const checkOnline = () => {
        setIsCurrentUserOnline(socket.isUserOnline(uid));
      };
      checkOnline();
      socket.setOnlineUsersCallback(checkOnline);
      return () => socket.setOnlineUsersCallback(null);
    }
  }, [user?.id_utilisateur, user?.id]);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Navigation
  const navigation = [
    { name: 'Tableau de bord', href: '/backoffice/dashboard', icon: HomeIcon },
    { name: 'Doléances', href: '/backoffice/doleances', icon: DocumentTextIcon },
    { name: 'Directions', href: '/backoffice/directions', icon: BuildingOfficeIcon },
    { name: 'Utilisateurs', href: '/backoffice/users', icon: UserGroupIcon },
    { name: 'Rôles', href: '/backoffice/roles', icon: ShieldCheckIcon },
    { name: 'Statistiques', href: '/backoffice/statistiques', icon: ChartBarIcon },
    { name: 'Transfert', href: '/backoffice/transfert', icon: ArrowPathIcon },
    { name: 'Mots interdits', href: '/backoffice/mots-interdits', icon: NoSymbolIcon },
    { name: 'Messages', href: '/backoffice/messages', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0a1a47]/70 z-20 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Navigation principale"
        className={`no-print fixed top-0 left-0 z-30 h-full w-72 isolate overflow-hidden flex flex-col
          border-r-2 border-[#ffc72c]/60 shadow-[4px_0_24px_rgba(10,26,71,0.35)]
          bg-[radial-gradient(120%_55%_at_0%_0%,rgba(96,165,250,0.35)_0%,transparent_55%),radial-gradient(100%_45%_at_100%_100%,rgba(255,199,44,0.14)_0%,transparent_60%),linear-gradient(180deg,#1239a0_0%,#10307f_45%,#0a1a47_100%)]
          transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Texture de grille (plan) en filigrane */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 70%)',
            maskImage: 'linear-gradient(180deg, #000 0%, transparent 70%)',
          }}
        />

        {/* En-tête */}
        <div className="relative shrink-0 px-4 pt-5 pb-4 border-b border-white/20">
          {/* Filet jaune sous la marque */}
          <span className="absolute left-4 -bottom-px h-0.5 w-14 rounded-full bg-[#ffc72c]" />
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid place-items-center flex-shrink-0 h-14 w-14 rounded-2xl bg-white/10 border border-[#ffc72c] backdrop-blur-sm shadow-[0_6px_16px_rgba(5,12,40,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]">
                <BuildingOfficeIcon className="h-7 w-7 text-white" />
              </span>
              <div className="min-w-0 flex flex-col items-start gap-1">
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#a9c1ff] leading-tight">
                  Commune Urbaine d'Antananarivo
                </span>
                <h1 className="text-white font-bold text-xl leading-none tracking-[0.06em] font-serif uppercase">
                  Doléances
                </h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Fermer le menu"
              className="lg:hidden flex-shrink-0 grid place-items-center h-9 w-9 rounded-xl border border-[#ffc72c] text-white hover:bg-[#ffc72c] hover:text-[#13214f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Badge */}
          
          <small className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#ffc72c]/60 bg-[#ffc72c]/15 px-3 py-1 text-[0.66rem] font-bold uppercase tracking-wider text-[#ffc72c] whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffc72c] shadow-[0_0_6px_rgba(255,199,44,0.8)]" />
            Gestion des doléances
          </small>
        </div>

        {/* Informations utilisateur */}
        <div className="shrink-0 px-4 py-3">
          <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-[#ffc72c]/70 transition-colors rounded-2xl p-2.5">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-[#ffc72c] flex items-center justify-center shadow-[0_2px_8px_rgba(255,199,44,0.4)] ring-2 ring-white/60">
                <span className="text-[#13214f] text-sm font-extrabold uppercase">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </span>
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#10307f] ${
                  isCurrentUserOnline ? 'bg-emerald-400' : 'bg-gray-400'
                }`}
              ></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-semibold truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-[#c3d3ff] truncate capitalize">
                {user?.role?.replace(/_/g, ' ') || 'Utilisateur'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-3 pt-1 space-y-2 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
          <p className="px-1 pb-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#a9c1ff]">
            Navigation
          </p>
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex items-center gap-3 min-h-[2.9rem] py-1 pl-1.5 pr-3 rounded-2xl border text-sm transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10307f]
                  ${active
                    ? 'bg-[#ffc72c] border-[#ffc72c] text-[#13214f] font-bold shadow-[0_6px_16px_rgba(5,12,40,0.35)]'
                    : 'bg-white/[0.06] border-[#ffc72c]/50 text-[#e6edff] font-medium hover:bg-white/15 hover:border-[#ffc72c] hover:text-white hover:-translate-y-px'
                  }`}
              >
                {/* Tuile d'icône */}
                <span
                  className={`grid place-items-center flex-shrink-0 h-9 w-9 rounded-xl transition-all duration-150 group-active:scale-95 ${
                    active
                      ? 'bg-[#13214f] text-[#ffc72c]'
                      : 'bg-white/10 text-[#ffc72c] group-hover:bg-[#ffc72c] group-hover:text-[#13214f]'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="truncate">{item.name}</span>
                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#13214f] flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pied de page - Déconnexion */}
        <div className="shrink-0 px-4 pt-3 pb-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full min-h-[2.75rem] px-3 py-2 rounded-2xl border border-[#ffc72c] bg-white/5 text-white hover:bg-red-500/25 hover:border-red-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0 text-[#ffc72c] group-hover:text-red-200 transition-colors" />
            <span className="text-sm font-semibold">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;