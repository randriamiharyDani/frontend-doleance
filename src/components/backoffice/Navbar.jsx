import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-800">Tableau de bord</h2>
            <p className="text-sm text-gray-500">Bienvenue, {user?.prenom} {user?.nom}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Lien Directions */}
          <Link 
            to="/backoffice/directions" 
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <BuildingOfficeIcon className="h-5 w-5" />
            <span className="text-sm">Directions</span>
          </Link>

          <Link to="/backoffice/notifications" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <BellIcon className="h-5 w-5" />
          </Link>

          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
              <ChevronDownIcon className="hidden md:block h-4 w-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-3 border-b bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/backoffice/directions" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden" onClick={() => setShowUserMenu(false)}>
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                      Directions
                    </Link>
                    <Link to="/backoffice/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                      <UserCircleIcon className="h-5 w-5 text-gray-500" />
                      Mon profil
                    </Link>
                  </div>
                  <div className="border-t py-2">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;