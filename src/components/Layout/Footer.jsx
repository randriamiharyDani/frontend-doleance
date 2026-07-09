import React from 'react';
import { Link } from 'react-router-dom';

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Colonne 1 - Logo et description */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CUA</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Commune Urbaine</h3>
                <p className="text-gray-400 text-xs">d'Antananarivo</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plateforme officielle de gestion des doléances citoyennes de la Commune Urbaine d'Antananarivo. 
              Votre voix compte pour une meilleure administration municipale.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-xl">📘</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-xl">🐦</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-xl">📷</a>
            </div>
          </div>

          {/* Colonne 2 - Liens rapides */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><Link to="/deposer-doleance" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Déposer une doléance</Link></li>
              <li><Link to="/toutes-doleances" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Consulter les doléances</Link></li>
              <li><Link to="/suivi-doleance" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Suivre ma doléance</Link></li>
            </ul>
          </div>

          {/* Colonne 3 - Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <span>📍</span>
                <span>Hôtel de Ville, Antaninarenina<br />BP 702, Antananarivo 101</span>
              </li>
              <li className="flex items-center space-x-3">
                <span>📞</span>
                <span>+261 20 22 200 00</span>
              </li>
              <li className="flex items-center space-x-3">
                <span>✉️</span>
                <span>contact@antananarivo.mg</span>
              </li>
            </ul>
          </div>

          {/* Colonne 4 - Horaires */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Horaires</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>🕐 Lundi - Vendredi : 8h00 - 17h00</li>
              <li className="ml-6 text-xs text-gray-500">(Service continu)</li>
              <li>🕐 Samedi : 9h00 - 12h00</li>
              <li className="text-red-400">🕐 Dimanche : Fermé</li>
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-800">
              <Link 
                to="/login" 
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🔐 Accès agents municipaux
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-xs">
            © {currentYear} Commune Urbaine d'Antananarivo. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
            <Link to="/mentions-legales" className="text-gray-500 hover:text-gray-400">Mentions légales</Link>
            <span className="text-gray-600">|</span>
            <Link to="/confidentialite" className="text-gray-500 hover:text-gray-400">Confidentialité</Link>
            <span className="text-gray-600">|</span>
            <Link to="/cgus" className="text-gray-500 hover:text-gray-400">CGU</Link>
          </div>
          <p className="text-gray-600 text-xs mt-4">
            Plateforme de gestion des doléances citoyennes - Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;