import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bars3Icon, 
  XMarkIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  ListBulletIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import SettingsModal from './SettingsModal';

function PublicNavbar() {
  const { t, i18n } = useTranslation();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: t('nav.submit'), href: '/deposer-doleance', icon: DocumentTextIcon },
    // { name: t('nav.all'), href: '/toutes-doleances', icon: ListBulletIcon },
    { name: t('nav.track'), href: '/suivi-doleance', icon: MagnifyingGlassIcon },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-md'
      } ${
        darkMode 
          ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-r from-sky-700 via-sky-600 to-blue-600'
      }`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative flex-shrink-0">
                  <img 
                    src="/images/logo-cua.png"
                    alt="Logo CUA - Commune Urbaine d'Antananarivo" 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain drop-shadow-md"
                    onError={() => setImgError(true)}
                  />
                  {imgError && (
                    <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-blue-800 dark:text-slate-900 font-bold text-xs sm:text-sm">CUA</span>
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-white drop-shadow-sm whitespace-nowrap">
                    Commune Urbaine
                  </span>
                  <span className="text-xs sm:text-sm text-sky-200 dark:text-slate-400 block -mt-0.5">
                    d'Antananarivo
                  </span>
                </div>
                <span className="text-base sm:text-lg font-bold text-white sm:hidden">CUA</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-yellow-400 text-blue-900 dark:text-slate-900 shadow-md'
                      : 'text-white hover:bg-white/20 dark:hover:bg-slate-700 hover:text-yellow-200'
                  }`}
                >
                  <item.icon className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                  {item.name}
                </Link>
              ))}
              
              <div className="w-px h-6 bg-white/30 mx-1"></div>
              
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium text-white hover:bg-white/20 dark:hover:bg-slate-700 hover:text-yellow-200 transition-all duration-200 whitespace-nowrap"
              >
                <Cog6ToothIcon className="h-4 w-4 lg:h-5 lg:w-5  lg:mr-2" />
                {/* {t('nav.settings')} */}
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 rounded-lg text-white hover:bg-white/20 dark:hover:bg-slate-700 transition-all duration-200"
                aria-label={darkMode ? t('settings.darkMode') : t('settings.darkMode')}
              >
                {darkMode ? (
                  <SunIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                ) : (
                  <MoonIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleDarkMode}
                className="inline-flex items-center justify-center p-1.5 rounded-md text-white hover:text-yellow-200 hover:bg-white/20 dark:hover:bg-slate-700 transition-colors"
                aria-label={darkMode ? t('settings.darkMode') : t('settings.darkMode')}
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-white hover:text-yellow-200 hover:bg-white/20 dark:hover:bg-slate-700 focus:outline-none transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden border-t shadow-lg ${
            darkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-sky-700 border-sky-600'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-56px)] overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-yellow-400 text-blue-900 dark:text-slate-900'
                      : 'text-white hover:bg-white/20 dark:hover:bg-slate-700 hover:text-yellow-200'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-white/20 my-2"></div>
              
              <button
                onClick={() => { setSettingsOpen(true); setMobileMenuOpen(false); }}
                className="flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium text-white hover:bg-white/20 dark:hover:bg-slate-700 hover:text-yellow-200 transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-3" />
                {t('nav.settings')}
              </button>
            </div>
          </div>
        )}
      </nav>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        i18n={i18n}
        t={t}
      />
    </>
  );
}

export default PublicNavbar;
