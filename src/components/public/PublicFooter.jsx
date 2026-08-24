import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserIcon, PhoneIcon } from '@heroicons/react/24/outline';

function PublicFooter() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const language = i18n.language || 'fr';

  const translations = {
    fr: {
      commune_name: 'Commune Urbaine',
      commune_subtitle: "d'Antananarivo",
      copyright: 'Plateforme de gestion des doléances',
      admin_access: 'Accès agents municipaux',
      green_number: 'Numéro vert',
      version: 'Version 2.0 | Plateforme optimisée pour mobile et desktop'
    },
    mg: {
      commune_name: 'Kaominina Urbanin\'',
      commune_subtitle: 'Antananarivo',
      copyright: 'Sehatra fitantanana ny fitarainana',
      admin_access: 'Fidiran\'ny mpiasan\'ny kaominina',
      green_number: 'Nomerao maitso',
      version: 'Dika 2.0 | Sehatra namboarina ho an\'ny finday sy solosaina'
    },
  };

  const tFooter = translations[language] || translations.fr;

  return (
    <footer className="bg-gradient-to-r from-sky-700 via-sky-800 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          
          {/* Logo et copyright - Suppression du logo CUA */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 md:space-x-3 mb-2">
              {/* Suppression du logo CUA rond */}
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-bold text-white">
                  {tFooter.commune_name}
                </span>
                <span className="text-xs md:text-sm text-sky-200 block -mt-0.5">
                  {tFooter.commune_subtitle}
                </span>
              </div>
            </div>
            <p className="text-sky-200 text-xs md:text-sm">
              © {currentYear} - {tFooter.copyright}
            </p>
          </div>

          {/* Numéro vert CUA - 147 */}
          <a
            href="tel:147"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200"
            title={tFooter.green_number}
          >
            <span className="flex items-center justify-center h-9 w-9 rounded-full bg-green-500 group-hover:bg-green-400 transition-colors duration-200 shadow-md flex-shrink-0">
              <PhoneIcon className="h-4.5 w-4.5 text-white" />
            </span>
            <span className="flex flex-col leading-tight text-center md:text-left">
              <span className="text-[11px] uppercase tracking-wider text-sky-200 font-medium">
                {tFooter.green_number}
              </span>
              <span className="text-lg md:text-xl font-bold text-white group-hover:text-green-300 transition-colors duration-200">
                147
              </span>
            </span>
          </a>

          {/* Espace admin - avec icône de tête de personne */}
          <div>
            <Link 
              to="/login" 
              className="inline-flex items-center px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-sky-900 text-xs md:text-sm font-semibold rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              {tFooter.admin_access}
            </Link>
          </div>
        </div>

        {/* Version et statut */}
        <div className="mt-6 text-center">
          <p className="text-sky-300/60 text-xs">
            {tFooter.version}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;