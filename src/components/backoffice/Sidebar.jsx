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
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden backdrop-blur-sm transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-72 shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto overflow-x-hidden`}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        {/* En-tête */}
        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl tracking-tight flex items-center gap-2">
                <span className="bg-blue-600/20 p-2 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
                </span>
              CUA - Gestion des doléances
              </h1>
            
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="p-4 bg-slate-800/20">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white text-base font-medium">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-base text-white font-medium truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-sm text-slate-400 truncate capitalize">
                {user?.role?.replace(/_/g, ' ') || 'Utilisateur'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Sans séparateurs */}
        <nav className="p-3 pb-32">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-3 py-3 rounded-lg mb-1 transition-all duration-200 group
                  ${active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }
                `}
              >
                <item.icon className={`
                  h-5 w-5 mr-3 transition-colors
                  ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                `} />
                <span className="text-base font-medium">{item.name}</span>
                {active && (
                  <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pied de page - Déconnexion */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/10 transition-all duration-200 group"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-red-400 transition-colors" />
            <span className="text-base font-medium group-hover:text-red-400 transition-colors">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;