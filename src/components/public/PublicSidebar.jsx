import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  NewspaperIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function PublicSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const mainNavigation = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Déposer une doléance', href: '/deposer-doleance', icon: DocumentTextIcon },
    { name: 'Suivre ma doléance', href: '/suivi-doleance', icon: MagnifyingGlassIcon },
  ];

  const informationNavigation = [
    { name: 'À propos de la mairie', href: '/a-propos', icon: BuildingOfficeIcon },
    { name: 'Services municipaux', href: '/services', icon: UserGroupIcon },
    { name: 'Actualités', href: '/actualites', icon: NewspaperIcon },
    { name: 'Événements', href: '/evenements', icon: CalendarIcon },
  ];

  const supportNavigation = [
    { name: 'FAQ', href: '/faq', icon: ChatBubbleLeftRightIcon },
    { name: 'Contact', href: '/contact', icon: PhoneIcon },
    { name: 'Mentions légales', href: '/mentions-legales', icon: ShieldCheckIcon },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Mairie</h1>
              <p className="text-gray-400 text-xs">Gestion des doléances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation principale */}
        <div className="py-4">
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Menu principal
            </p>
          </div>
          {mainNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`
                flex items-center px-4 py-3 mx-2 rounded-lg transition-colors
                ${isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Informations */}
        <div className="py-4 border-t border-gray-700">
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Informations
            </p>
          </div>
          {informationNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className="flex items-center px-4 py-3 mx-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Support */}
        <div className="py-4 border-t border-gray-700">
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Support
            </p>
          </div>
          {supportNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className="flex items-center px-4 py-3 mx-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Footer sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © 2024 Mairie de la ville
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Version 1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default PublicSidebar;