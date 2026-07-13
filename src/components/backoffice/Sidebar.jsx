import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
    { name: 'Transfert', href: '/backoffice/transfert', icon: ArrowPathIcon },
    { name: 'Directions', href: '/backoffice/directions', icon: BuildingOfficeIcon },
    { name: 'Utilisateurs', href: '/backoffice/users', icon: UserGroupIcon },
    { name: 'Rôles', href: '/backoffice/roles', icon: ShieldCheckIcon },
    { name: 'Statistiques', href: '/backoffice/statistiques', icon: ChartBarIcon },
  ];

return (
  <>
    {/* Overlay pour mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    {/* Sidebar */}
    <aside
      className={`fixed top-0 left-0 z-30 h-full w-72 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col bg-gradient-to-b from-[#0B1A33] to-[#1A365D] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    
    >
      {/* En-tête */}
      <div className="shrink-0 border-b border-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <BuildingOfficeIcon className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base leading-tight truncate">
                CUA
              </h1>
              <p className="text-white/50 text-xs truncate">
                Gestion des doléances
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="shrink-0 p-4 border-b border-white/5">
        <div className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl p-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-slate-800">
              <span className="text-white text-sm font-semibold">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white font-medium truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-white/50 truncate capitalize">
              {user?.role?.replace(/_/g, ' ') || 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${active
                  ? 'bg-[#3182CE]/20 text-white'
                  : 'text-white/70 hover:bg-[#3182CE]/20 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline'
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
              )}
              <item.icon
                className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-white/40 group-hover:text-white'
                }`}
              />
              <span className="text-sm font-medium truncate">{item.name}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse flex-shrink-0"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pied de page - Déconnexion */}
      <div className="shrink-0 p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0 text-red-400/50 group-hover:text-red-400 transition-colors" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  </>
);
}

export default Sidebar;