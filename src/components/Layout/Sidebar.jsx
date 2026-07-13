import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['citoyen', 'agent', 'directeur', 'administrateur', 'maire']
    },
    {
      name: 'Doléances',
      href: '/doleances',
      icon: DocumentTextIcon,
      roles: ['citoyen', 'agent', 'directeur', 'administrateur', 'maire']
    },
  ];

  // Menu Administration (visible uniquement pour admin)
  if (user?.role === 'administrateur') {
    navigation.push({
      name: 'Utilisateurs',
      href: '/users',
      icon: UserGroupIcon,
      roles: ['administrateur']
    });
  }

  // Menu Statistiques (visible pour directeur, admin, maire)
  if (['directeur', 'administrateur', 'maire'].includes(user?.role)) {
    navigation.push({
      name: 'Statistiques',
      href: '/statistiques',
      icon: ChartBarIcon,
      roles: ['directeur', 'administrateur', 'maire']
    });
  }

  const bottomNavigation = [
    {
      name: 'Mon profil',
      href: '/profile',
      icon: UserCircleIcon,
      roles: ['citoyen', 'agent', 'directeur', 'administrateur', 'maire']
    },
    {
      name: 'Aide',
      href: '/aide',
      icon: QuestionMarkCircleIcon,
      roles: ['citoyen', 'agent', 'directeur', 'administrateur', 'maire']
    },
  ];

  // Filtrer la navigation selon le rôle
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const filteredBottomNav = bottomNavigation.filter(item => 
    item.roles.includes(user?.role)
  );

  // Menu avec sous-menus (exemple)
  const menuWithSubmenu = [
    {
      name: 'Gestion',
      icon: Cog6ToothIcon,
      roles: ['administrateur'],
      subItems: [
        { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
        { name: 'Audit', href: '/audit', icon: DocumentTextIcon },
      ]
    }
  ];

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full bg-gradient-to-b from-[#0B1A33] to-[#1A365D] shadow-xl transition-transform duration-300 ease-in-out
        w-72
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Gestion Doléances</h1>
              <p className="text-white/50 text-xs">Mairie de la ville</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive(item.href) 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'text-white/70 hover:bg-[#D4AF37] hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                {isActive(item.href) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
                )}
                <item.icon className={`h-5 w-5 mr-3 ${isActive(item.href) ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}

            {/* Menus avec sous-menus */}
            {menuWithSubmenu.map((menu) => {
              if (!menu.roles.includes(user?.role)) return null;
              const isMenuOpen = openMenus[menu.name];
              return (
                <div key={menu.name}>
                  <button
                    onClick={() => toggleMenu(menu.name)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-[#D4AF37] hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <menu.icon className="h-5 w-5 mr-3 text-white/40 group-hover:text-white" />
                      <span className="text-sm font-medium">{menu.name}</span>
                    </div>
                    {isMenuOpen ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </button>
                  {isMenuOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {menu.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`
                            relative flex items-center px-3 py-2 rounded-lg transition-all duration-200
                            ${isActive(subItem.href) 
                              ? 'bg-[#D4AF37] text-white' 
                              : 'text-white/60 hover:bg-[#D4AF37] hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline'
                            }
                          `}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActive(subItem.href) && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-white rounded-r-full" />
                          )}
                          <subItem.icon className="h-4 w-4 mr-3" />
                          <span className="text-xs">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer sidebar avec infos utilisateur */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-white/50 capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-1">
            {filteredBottomNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 rounded-lg text-white/70 hover:bg-[#D4AF37] hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:underline transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3 text-white/40" />
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              <span className="text-sm">Déconnexion</span>
            </button>
          </div>

          {/* Version */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              Version 1.0.0<br />
              © 2024 Mairie
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;