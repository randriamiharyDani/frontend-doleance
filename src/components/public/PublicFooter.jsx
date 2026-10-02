import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserIcon, PhoneIcon } from '@heroicons/react/24/outline';

function PublicFooter() {
  const { i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const language = (i18n.language || 'fr').slice(0, 2);

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
      commune_name: "Kaominina Urbanin'",
      commune_subtitle: 'Antananarivo',
      copyright: 'Sehatra fitantanana ny fitarainana',
      admin_access: "Fidiran'ny mpiasan'ny kaominina",
      green_number: 'Nomerao maitso',
      version: "Dika 2.0 | Sehatra namboarina ho an'ny finday sy solosaina"
    },
  };

  const tFooter = translations[language] || translations.fr;

  return (
    <footer className="relative bg-gradient-to-r from-sky-700 via-sky-800 to-blue-800 text-white">
      {/* Filet d'accent en haut */}
      <div className="h-1 w-full bg-gradient-to-r from-green-500 via-yellow-400 to-green-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 md:gap-8">

          {/* Identité + copyright */}
          <div className="text-center md:text-left">
            <div className="flex flex-col leading-tight">
              <span className="text-lg md:text-xl font-bold text-white">
                {tFooter.commune_name}
              </span>
              <span className="text-sm md:text-base text-sky-200">
                {tFooter.commune_subtitle}
              </span>
            </div>
            <p className="mt-2 text-sky-200/90 text-xs md:text-sm">
              © {currentYear} - {tFooter.copyright}
            </p>
          </div>

          {/* Numéro vert */}
          <div className="flex justify-center">
            <a
              href="tel:147"
              aria-label={`${tFooter.green_number} 147`}
              title={tFooter.green_number}
              className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              <span className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500 group-hover:bg-green-400 transition-colors duration-200 shadow-md flex-shrink-0">
                <PhoneIcon className="h-5 w-5 text-white" />
              </span>
              <span className="flex flex-col leading-tight text-left">
                <span className="text-[11px] uppercase tracking-wider text-sky-200 font-medium">
                  {tFooter.green_number}
                </span>
                <span className="text-xl md:text-2xl font-bold text-white group-hover:text-green-300 transition-colors duration-200">
                  147
                </span>
              </span>
            </a>
          </div>

          {/* Accès agents */}
          <div className="flex justify-center md:justify-end">
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-sky-900 text-xs md:text-sm font-semibold rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              {tFooter.admin_access}
            </Link>
          </div>
        </div>

        {/* Version */}
        <div className="mt-8 pt-5 border-t border-white/10 text-center">
          <p className="text-sky-300/70 text-xs">
            {tFooter.version}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;