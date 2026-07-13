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
          darkMode ? 'bg-slate-900' : 'bg-gradient-to-b from-[#0B1A33] to-[#1A365D]'
        }`}
      >
        {/* Logo */}
       {/* Logo */}
<div className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b border-white/10 bg-opacity-95 backdrop-blur-sm">
  {/* Logo */}
  <div className="flex-shrink-0 ">
    <img 
      src="/images/logo_CUA.svg"  
      alt="Logo CUA" 
      className="h-20 w-20 object-contain rounded-2xl"
    />
  </div>
  
  {/* Texte */}
  <div className="flex-1 min-w-0">
    <h1 className="text-white font-bold text-4xl sm:text-lg tracking-tight leading-tight">
      CUA
    </h1>
      <p className="text-white/60 text-xl sm:text-sm font-medium">
      <span className="block">Commune Urbaine</span>
      <span className="block">d'Antananarivo</span>
    </p>
  </div>
  
  {/* Bouton fermeture (mobile) */}
  <button 
    onClick={() => setSidebarOpen(false)} 
    className="lg:hidden text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#3182CE]/20 flex-shrink-0"
    aria-label="Fermer le menu"
  >
    <XMarkIcon className="h-5 w-5" />
  </button>
</div>

   

        {/* Navigation */}
        <nav className="p-3 pb-20">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive(item.href) 
                    ? 'bg-[#3182CE]/20 text-white' 
                    : 'text-white/70 hover:bg-[#3182CE]/20 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline'
                }`}
              >
                {isActive(item.href) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
                )}
                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                  isActive(item.href) ? 'text-white' : 'text-white/40 group-hover:text-white'
                }`} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="my-4 border-t border-white/10"></div>

          <div className="space-y-1">
            {filteredSecondaryNavigation.map((item) => (
              item.subItems ? (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      openMenus[item.name] ? 'text-white' : 'text-white/70 hover:bg-[#3182CE]/20 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                        openMenus[item.name] ? 'text-white' : 'text-white/40 group-hover:text-white'
                      }`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
                      openMenus[item.name] ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {openMenus[item.name] && (
                    <div className="ml-4 space-y-1 border-l-2 border-white/10 pl-3">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          className={`relative flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive(subItem.href) 
                              ? 'bg-[#3182CE]/20 text-white' 
                              : 'text-white/60 hover:bg-[#3182CE]/20 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline'
                          }`}
                        >
                          {isActive(subItem.href) && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-white rounded-r-full" />
                          )}
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
                  className={`relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive(item.href) 
                      ? 'bg-[#3182CE]/20 text-white' 
                      : 'text-white/70 hover:bg-[#3182CE]/20 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline'
                  }`}
                >
                  {isActive(item.href) && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
                  )}
                  <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                    isActive(item.href) ? 'text-white' : 'text-white/40 group-hover:text-white'
                  }`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            ))}
          </div>
        </nav>

        {/* Footer */}
             {/* Infos utilisateur */}
     <div className="absolute bottom-0 left-0 right-0 z-10 p-4 border-t border-white/10 bg-opacity-95 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-white/10">
              <span className="text-white text-sm font-medium">
                {user?.prenom?.charAt(0) || 'U'}
                {user?.nom?.charAt(0) || '?'}
              </span>
            </div>

            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {user?.prenom || 'Utilisateur'} {user?.nom || ''}
              </p>

              <p className="text-xs text-white/50 capitalize truncate">
                {user?.role?.replace(/_/g, ' ') || 'Chargement...'}
              </p>
            </div>
          </div>
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