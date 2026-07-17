import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Bars3Icon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <nav className={`no-print sticky top-0 z-20 transition-all duration-300 ${
      scrolled ? 'shadow-lg' : 'shadow-md'
    } ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="px-3 sm:px-4 md:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Bouton menu mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`lg:hidden p-1 rounded-lg transition-colors ${
              darkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Titre */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <h1 className={`text-xs sm:text-sm md:text-base font-semibold truncate ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
          Gestion des doléances
            </h1>
            
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton thème */}
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-yellow-400 hover:bg-slate-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? (
                <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            
            {/* Menu utilisateur */}
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 sm:gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm bg-blue-600">
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {user?.prenom?.charAt(0) || 'U'}{user?.nom?.charAt(0) || '?'}
                  </span>
                </div>
                <span className={`hidden md:inline text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {user?.prenom} {user?.nom}
                </span>
                <svg className={`hidden md:block h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 sm:w-56 rounded-lg shadow-xl border overflow-hidden z-50 ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
                }`}>
                  <div className={`py-1 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {user?.prenom} {user?.nom}
                      </p>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.role?.replace(/_/g, ' ') || 'Utilisateur'}
                      </p>
                    </div>
                    <Link
                      to="/backoffice/profile"
                      onClick={() => setShowUserMenu(false)}
                      className={`flex items-center px-4 py-2 text-sm transition-colors ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-slate-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <UserIcon className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      Mon profil
                    </Link>
                    <Link
                      to="/backoffice/settings"
                      onClick={() => setShowUserMenu(false)}
                      className={`flex items-center px-4 py-2 text-sm transition-colors ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-slate-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Cog6ToothIcon className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      Paramètres
                    </Link>
                    <hr className={`my-1 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`} />
                    <button
                      onClick={handleLogout}
                      className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                        darkMode 
                          ? 'text-red-400 hover:bg-slate-700' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;