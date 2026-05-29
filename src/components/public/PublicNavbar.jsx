import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  HomeIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Déposer une doléance', href: '/deposer-doleance', icon: DocumentTextIcon },
    { name: 'Toutes les doléances', href: '/toutes-doleances', icon: ListBulletIcon },
    { name: 'Suivre ma doléance', href: '/suivi-doleance', icon: MagnifyingGlassIcon },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              {!imgError ? (
                <img 
                  src="/images/logo-cua.png"
                  alt="Logo CUA" 
                  className="w-10 h-10 object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CUA</span>
                </div>
              )}
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-gray-800">Commune Urbaine</span>
                <span className="text-sm text-gray-500 block -mt-1">d'Antananarivo</span>
              </div>
              <span className="text-lg font-bold text-gray-800 sm:hidden">CUA</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="h-5 w-5 mr-1" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center px-3 py-2 rounded-md text-base font-medium
                  ${isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default PublicNavbar;