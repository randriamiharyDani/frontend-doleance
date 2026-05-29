import React from 'react';
import { Link } from 'react-router-dom';

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo et copyright */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CUA</span>
              </div>
              <span className="text-lg font-bold">Commune Urbaine d'Antananarivo</span>
            </div>
            <p className="text-gray-500 text-xs">
              © {currentYear} - Plateforme de gestion des doléances
            </p>
          </div>

          {/* Espace admin */}
          <div>
            <Link 
              to="/login" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔐 Accès agents municipaux
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;