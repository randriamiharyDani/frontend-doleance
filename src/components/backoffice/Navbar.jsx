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
import NotificationBell from './NotificationBell';
import MessagesBell from './MessagesBell';

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

  // Bouton icône : bordure jaune, texte bleu nuit (clair) / bleu pâle (sombre)
  const btnIcone = `grid place-items-center h-10 w-10 flex-shrink-0 rounded-xl border border-[#ffc72c] transition-all duration-150 active:scale-95
    focus-visible:outline-none focus-visible:ring-2 ${
      darkMode
        ? 'text-[#cfdcff] hover:bg-white/10 hover:text-white focus-visible:ring-[#ffc72c]'
        : 'text-[#13214f] hover:bg-[#ffc72c]/20 focus-visible:ring-[#10307f]'
    }`;

  // Style de lien du menu déroulant
  const lienMenu = `flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
      darkMode
        ? 'text-[#cfdcff] hover:bg-white/10 focus-visible:ring-[#ffc72c]'
        : 'text-[#13214f] hover:bg-[#ffc72c]/15 focus-visible:ring-[#10307f]'
    }`;

  return (
    <nav
      className={`no-print sticky top-0 z-20 backdrop-blur-sm transition-shadow duration-300 ${
        darkMode ? 'bg-[#0a1a47]/95' : 'bg-white/95'
      } ${
        scrolled
          ? 'shadow-[inset_0_-3px_0_#ffc72c,0_6px_20px_rgba(10,26,71,0.22)]'
          : 'shadow-[inset_0_-3px_0_#ffc72c,0_2px_14px_rgba(10,26,71,0.12)]'
      }`}
    >
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 gap-3">
          {/* Bouton menu mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`lg:hidden ${btnIcone}`}
            aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Titre */}
          <div className="flex-1 min-w-0 flex items-center justify-center lg:justify-start gap-2.5">
            <span className="hidden sm:block h-6 w-1 rounded-full bg-[#ffc72c]" />
            <h1
              className={`font-serif text-sm sm:text-base md:text-lg font-bold tracking-wide truncate ${
                darkMode ? 'text-white' : 'text-[#13214f]'
              }`}
            >
              Gestion des doléances
            </h1>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton thème */}
            <button
              onClick={toggleDarkMode}
              className={btnIcone}
              aria-label={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-[#ffc72c]" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Messages */}
            <MessagesBell />

            {/* Notifications */}
            <NotificationBell />

            {/* Menu utilisateur */}
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                className={`flex items-center gap-2 min-h-[2.5rem] p-1 sm:pr-3 rounded-full border border-[#ffc72c] transition-colors
                  focus-visible:outline-none focus-visible:ring-2 ${
                    darkMode
                      ? 'bg-white/10 hover:bg-white/15 focus-visible:ring-[#ffc72c]'
                      : 'bg-[#10307f]/5 hover:bg-[#ffc72c]/20 focus-visible:ring-[#10307f]'
                  } ${showUserMenu ? (darkMode ? 'bg-white/20' : 'bg-[#ffc72c]/25') : ''}`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ffc72c] ring-2 ring-[#10307f]/20">
                  <span className="text-[#13214f] text-xs sm:text-sm font-extrabold uppercase">
                    {user?.prenom?.charAt(0) || 'U'}{user?.nom?.charAt(0) || '?'}
                  </span>
                </div>
                <span
                  className={`hidden md:inline text-sm font-semibold ${
                    darkMode ? 'text-white' : 'text-[#13214f]'
                  }`}
                >
                  {user?.prenom} {user?.nom}
                </span>
                <svg
                  className={`hidden md:block h-4 w-4 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  } ${darkMode ? 'text-[#cfdcff]' : 'text-[#10307f]'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div
                  role="menu"
                  className={`absolute right-0 mt-2 w-56 sm:w-60 rounded-xl border border-[#ffc72c]/60 shadow-[0_12px_32px_rgba(10,26,71,0.22)] overflow-hidden z-50 ${
                    darkMode ? 'bg-[#0f2a6b]' : 'bg-white'
                  }`}
                >
                  <div className="p-1.5">
                    <div
                      className={`relative px-3 py-2.5 mb-1 border-b ${
                        darkMode ? 'border-white/15' : 'border-[#10307f]/10'
                      }`}
                    >
                      <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#ffc72c]" />
                      <p
                        className={`pl-2 text-sm font-bold truncate ${
                          darkMode ? 'text-white' : 'text-[#13214f]'
                        }`}
                      >
                        {user?.prenom} {user?.nom}
                      </p>
                      <p
                        className={`pl-2 text-xs truncate capitalize ${
                          darkMode ? 'text-[#a9bdf0]' : 'text-[#13214f]/60'
                        }`}
                      >
                        {user?.role?.replace(/_/g, ' ') || 'Utilisateur'}
                      </p>
                    </div>
                    <Link
                      to="/backoffice/profile"
                      role="menuitem"
                      onClick={() => setShowUserMenu(false)}
                      className={lienMenu}
                    >
                      <UserIcon className={`h-4 w-4 ${darkMode ? 'text-[#ffc72c]' : 'text-[#10307f]'}`} />
                      Mon profil
                    </Link>
                    <Link
                      to="/backoffice/settings"
                      role="menuitem"
                      onClick={() => setShowUserMenu(false)}
                      className={lienMenu}
                    >
                      <Cog6ToothIcon className={`h-4 w-4 ${darkMode ? 'text-[#ffc72c]' : 'text-[#10307f]'}`} />
                      Paramètres
                    </Link>
                    <hr className={`my-1.5 ${darkMode ? 'border-white/15' : 'border-[#10307f]/10'}`} />
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400 ${
                          darkMode
                            ? 'text-red-300 hover:bg-red-500/15'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
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