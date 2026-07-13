import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import SettingsModal from './SettingsModal';
import NotificationsDropdown from './NotificationsDropdown';

function PublicLayout({ children }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      label: 'Déposer une doléance',
      path: '/deposer-doleance',
      icon: DocumentTextIcon,
    },
    {
      label: 'Suivi des doléances',
      path: '/suivi-doleance',
      icon: MagnifyingGlassIcon,
    },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      {/* ===== HEADER ===== */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? darkMode
            ? 'bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-slate-700/50'
            : 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-200/50'
          : darkMode
            ? 'bg-slate-900/60 backdrop-blur-md border-b border-slate-800/50'
            : 'bg-white/60 backdrop-blur-md border-b border-gray-100/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/deposer-doleance" className="flex items-center">
                <img
                  src="/images/logo_CUA.svg"
                  alt="Logo CUA"
                  className="h-16 w-16 object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
                />
                <div className="hidden sm:block">
                  <h1 className={`text-2xl font-bold leading-tight transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Signalement
                  </h1>
                  <p className={`text-[12px] font-medium -mt-0.5 ${
                    darkMode ? 'text-slate-400' : 'text-gray-400'
                  }`}>
                    Antananarivo, 101
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Navigation (desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? darkMode
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                          : 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : darkMode
                          ? 'text-slate-300 hover:text-white hover:bg-white/10'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  darkMode
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                aria-label="Changer le thème"
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <NotificationsDropdown />

              {/* Settings */}
              <button
                onClick={() => setSettingsOpen(true)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  darkMode
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                aria-label="Paramètres"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>

              {/* Login (desktop) */}
              <a
                href="/login"
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Connexion</span>
              </a>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
                  darkMode
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <Bars3Icon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t transition-colors duration-200 ${
            darkMode ? 'bg-slate-900/95 backdrop-blur-xl border-slate-700/50' : 'bg-white/95 backdrop-blur-xl border-gray-100'
          }`}>
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : darkMode
                          ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className={`border-t my-2 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`} />
              <a
                href="/login"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Connexion</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className={`pt-16 min-h-screen transition-colors duration-200 ${
        darkMode ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className={`border-t transition-colors duration-200 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo_CUA.svg" alt="CUA" className="h-8 w-8 object-contain rounded-lg" />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Commune Urbaine d'Antananarivo
                </p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  &copy; {new Date().getFullYear()} Tous droits réservés
                </p>
              </div>
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-600' : 'text-gray-300'}`}>
              Version 2.0
            </p>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        i18n={i18n}
        t={t}
      />
    </div>
  );
}

export default PublicLayout;
