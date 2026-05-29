import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  BellIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation avec le lien Directions
  const navigation = [
    { name: 'Tableau de bord', href: '/backoffice/dashboard', icon: HomeIcon },
    { name: 'Doléances', href: '/backoffice/doleances', icon: DocumentTextIcon },
    { name: 'Directions', href: '/backoffice/directions', icon: BuildingOfficeIcon },
    { name: 'Utilisateurs', href: '/backoffice/users', icon: UserGroupIcon },
    { name: 'Rôles', href: '/backoffice/roles', icon: ShieldCheckIcon },
    { name: 'Statistiques', href: '/backoffice/statistiques', icon: ChartBarIcon },
    { name: 'Notifications', href: '/backoffice/notifications', icon: BellIcon },
    { name: 'Mon profil', href: '/backoffice/profile', icon: UserCircleIcon },
  ];

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h1 className="text-white font-bold text-lg">Back-Office</h1>
            <p className="text-gray-400 text-xs">CUA - Gestion des doléances</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-white font-medium">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive(item.href) 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors">
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            <span className="text-sm">Déconnexion</span>
          </button>
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">Version 1.0.0 | CUA</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;