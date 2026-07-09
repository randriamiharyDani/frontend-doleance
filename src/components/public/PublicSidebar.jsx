import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DocumentTextIcon, MagnifyingGlassIcon, ListBulletIcon, XMarkIcon
} from '@heroicons/react/24/outline';

function PublicSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navigation = [
    { name: 'Déposer une doléance', href: '/deposer-doleance', icon: DocumentTextIcon },
    { name: 'Suivre ma doléance', href: '/suivi-doleance', icon: MagnifyingGlassIcon },
    { name: 'Toutes les doléances', href: '/toutes-doleances', icon: ListBulletIcon },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">CUA</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Commune Urbaine</h1>
              <p className="text-gray-400 text-xs">d'Antananarivo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="py-4">
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</p>
          </div>
          {navigation.map((item) => (
            <Link
              key={item.name} to={item.href} onClick={onClose}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                location.pathname.startsWith(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

      </aside>
    </>
  );
}

export default PublicSidebar;
