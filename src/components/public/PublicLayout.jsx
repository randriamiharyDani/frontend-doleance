
// navbar frontend

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
  ShieldCheckIcon,
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
    <div className={`cua-layout min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-slate-900' : 'bg-[#F8FAFC]'
    }`}>
      <style>{`
        .cua-layout { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cua-layout .cua-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .cua-layout .cua-nav-active {
          background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 65%, #2E4FA3 100%);
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.4);
        }
        .cua-layout .cua-icon-btn:hover {
          color: #D4AF37;
        }
        .cua-layout .cua-login-link:hover {
          color: #D4AF37;
        }
        .cua-layout .cua-top-line {
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? darkMode
            ? 'bg-slate-900/85 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-slate-700/50'
            : 'bg-white/85 backdrop-blur-xl shadow-lg shadow-[#0F172A]/5 border-b border-slate-200/60'
          : darkMode
            ? 'bg-slate-900/60 backdrop-blur-md border-b border-slate-800/50'
            : 'bg-white/60 backdrop-blur-md border-b border-slate-100/60'
      }`}>
        {/* Liseré doré discret en tête de page */}
        <div className="cua-top-line h-[2px] w-full opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/deposer-doleance" className="flex items-center group">
                <img
                  src="/images/logo_CUA.svg"
                  alt="Logo CUA"
                  className="h-16 w-16 object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
                />
                <div className="hidden sm:block">
                  <h1 className={`cua-display text-3xl font-semibold leading-tight transition-colors ${
                    darkMode ? 'text-white' : 'text-[#0F172A]'
                  }`}>
                    Signalement
                  </h1>
                  <p className={`text-[13px] font-medium -mt-0.5 tracking-wide ${
                    darkMode ? 'text-[#D4AF37]/80' : 'text-[#9A7200]'
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
                        ? 'cua-nav-active text-white'
                        : darkMode
                          ? 'text-slate-300 hover:text-white hover:bg-white/10'
                          : 'text-slate-500 hover:text-[#0F172A] hover:bg-slate-100'
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
                className={`cua-icon-btn p-2 rounded-xl transition-all duration-200 ${
                  darkMode
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
                aria-label="Changer le thème"
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <div className="hidden sm:block">
                <NotificationsDropdown />
              </div>

              {/* Settings */}
              <button
                onClick={() => setSettingsOpen(true)}
                className={`cua-icon-btn p-2 rounded-xl transition-all duration-200 ${
                  darkMode
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
                aria-label="Paramètres"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>

              {/* Hamburger mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
                  mobileMenuOpen
                    ? 'cua-nav-active text-white'
                    : darkMode
                      ? 'text-slate-300 hover:bg-white/10'
                      : 'text-slate-400 hover:bg-slate-100'
                }`}
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown navbar eee */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t transition-colors duration-200 ${
            darkMode ? 'bg-slate-900/95 backdrop-blur-xl border-slate-700/50' : 'bg-white/95 backdrop-blur-xl border-slate-100'
          }`}>
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'cua-nav-active text-white'
                        : darkMode
                          ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className={`border-t my-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`} />

              {/* Login link (mobile) */}
              {/* <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? 'text-[#D4AF37] hover:bg-white/10'
                    : 'text-[#1E3A8A] hover:bg-slate-50'
                }`}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Espace Agent</span>
              </Link> */}
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className={`pt-16 min-h-screen transition-colors duration-200 ${
        darkMode ? 'bg-slate-900' : 'bg-[#F8FAFC]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className={`border-t transition-colors duration-200 relative ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="cua-top-line h-[2px] w-full opacity-50 absolute top-0 left-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo_CUA.svg" alt="CUA" className="h-8 w-8 object-contain rounded-lg" />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  Commune Urbaine d'Antananarivo
                </p>
                <p className={`text-xs flex items-center gap-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <ShieldCheckIcon className="w-3 h-3 text-[#D4AF37]" />
                  &copy; {new Date().getFullYear()} Tous droits réservés
                </p>
              </div>
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>
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
