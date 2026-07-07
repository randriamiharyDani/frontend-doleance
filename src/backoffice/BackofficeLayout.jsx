import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/backoffice/Navbar';

function BackofficeLayout() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/backoffice/dashboard', icon: HomeIcon },
    { name: 'Doléances', href: '/backoffice/doleances', icon: DocumentTextIcon },
    { name: 'Transfert', href: '/backoffice/transfert', icon: ArrowPathIcon },
  ];

  const secondaryNavigation = [
    { 
      name: 'Administration', 
      icon: BuildingOfficeIcon,
      subItems: [
        { name: 'Directions', href: '/backoffice/directions', icon: BuildingOfficeIcon },
        { name: 'Utilisateurs', href: '/backoffice/users', icon: UserGroupIcon },
        { name: 'Rôles', href: '/backoffice/roles', icon: ShieldCheckIcon },
      ]
    },
    { name: 'Statistiques', href: '/backoffice/statistiques', icon: ChartBarIcon },
    { name: 'Paramètres', href: '/backoffice/settings', icon: Cog6ToothIcon },
  ];

  // Déterminer les permissions
  const userRole = user?.role || user?.nom_role;
  const isAdmin = userRole === 'administrateur_systeme' || userRole === 'administrateur' || userRole === 'agent_central';

  // Filtrer les éléments de navigation selon les permissions
  const filteredSecondaryNavigation = secondaryNavigation.filter(item => {
    // Si l'item est "Administration", vérifier les sous-items
    if (item.subItems) {
      const filteredSubItems = item.subItems.filter(subItem => {
        // Vérifier si l'utilisateur a accès à ce sous-item
        if (subItem.name === 'Utilisateurs' || subItem.name === 'Rôles') {
          return isAdmin;
        }
        return true;
      });
      // Retourner l'item seulement s'il a des sous-items visibles
      return filteredSubItems.length > 0;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 lg:w-72 shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          darkMode ? 'bg-slate-900' : 'bg-gradient-to-r from-sky-700 via-sky-600 to-blue-600'
        }`}
      >
        {/* Logo */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-700 bg-opacity-95 backdrop-blur-sm">
          <div className="flex-1">
            <h1 className="text-white font-bold text-base sm:text-lg tracking-tight">CUA - Gestion des doléances</h1>
          
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            aria-label="Fermer le menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Infos utilisateur */}
        <div className="sticky top-[73px] z-10 p-4 border-b border-gray-700 bg-opacity-95 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-blue-600">
              <span className="text-white text-sm font-medium">
                {user?.prenom?.charAt(0) || 'U'}{user?.nom?.charAt(0) || '?'}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {user?.prenom || 'Utilisateur'} {user?.nom || ''}
              </p>
              <p className="text-xs text-gray-400 capitalize truncate">
                {user?.role?.replace(/_/g, ' ') || 'Chargement...'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 pb-20">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive(item.href) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                  isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="my-4 border-t border-gray-700"></div>

          <div className="space-y-1">
            {filteredSecondaryNavigation.map((item) => (
              item.subItems ? (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      openMenus[item.name] ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                        openMenus[item.name] ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
                      openMenus[item.name] ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {openMenus[item.name] && (
                    <div className="ml-4 space-y-1 border-l-2 border-gray-700 pl-3">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive(subItem.href) 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <subItem.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span className="text-sm">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive(item.href) 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                    isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center border-t border-gray-700 bg-opacity-95 backdrop-blur-sm">
          <p className="text-xs text-gray-500">Version 2.0.0 | CUA</p>
          <p className="text-xs text-gray-600 mt-1 hidden sm:block">
            Plateforme optimisée
          </p>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:pl-64 lg:pl-72 min-h-screen flex flex-col">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-full overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default BackofficeLayout;