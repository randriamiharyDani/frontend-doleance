import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  ClockIcon,
  Bars3Icon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  EnvelopeIcon as EnvelopeSolid
} from '@heroicons/react/24/outline';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicSidebar from '../components/public/PublicSidebar';
import PublicFooter from '../components/public/PublicFooter';

function Accueil() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [heroImageError, setHeroImageError] = useState(false);
  const [stats, setStats] = useState({
    doleancesTraitees: 0,
    citoyensServis: 0,
    tauxSatisfaction: 0,
    tempsMoyenReponse: 0
  });

  // Simuler le chargement des statistiques
  useEffect(() => {
    setTimeout(() => {
      setStats({
        doleancesTraitees: 15234,
        citoyensServis: 12580,
        tauxSatisfaction: 94,
        tempsMoyenReponse: 48
      });
    }, 1000);
  }, []);

  // Étapes à suivre pour le dépôt de doléance
  const etapes = [
    {
      id: 1,
      icon: <DocumentTextIcon className="h-8 w-8" />,
      title: t('steps.step1.title'),
      description: t('steps.step1.description'),
      color: 'blue'
    },
    {
      id: 2,
      icon: <EnvelopeSolid className="h-8 w-8" />,
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
      color: 'green'
    },
    {
      id: 3,
      icon: <MagnifyingGlassIcon className="h-8 w-8" />,
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
      color: 'yellow'
    },
    {
      id: 4,
      icon: <CheckCircleIcon className="h-8 w-8" />,
      title: t('steps.step4.title'),
      description: t('steps.step4.description'),
      color: 'purple'
    }
  ];

  // Actualités récentes
  const actualites = [
    {
      id: 1,
      titre: t('news.news1.title'),
      date: "15 Mars 2024",
      description: t('news.news1.description'),
      icon: <ChartBarIcon className="h-6 w-6 text-yellow-500" />
    },
    {
      id: 2,
      titre: t('news.news2.title'),
      date: "10 Mars 2024",
      description: t('news.news2.description'),
      icon: <ClockIcon className="h-6 w-6 text-yellow-500" />
    },
    {
      id: 3,
      titre: t('news.news3.title'),
      date: "5 Mars 2024",
      description: t('news.news3.description'),
      icon: <UserGroupIcon className="h-6 w-6 text-yellow-500" />
    }
  ];

  // Chiffres clés
  const chiffresCles = [
    { label: t('statistics.complaintsHandled'), valeur: stats.doleancesTraitees, suffixe: "+", icon: <DocumentTextIcon className="h-8 w-8" /> },
    { label: t('statistics.citizensServed'), valeur: stats.citoyensServis, suffixe: "+", icon: <UserGroupIcon className="h-8 w-8" /> },
    { label: t('statistics.satisfactionRate'), valeur: stats.tauxSatisfaction, suffixe: "%", icon: <StarIcon className="h-8 w-8" /> },
    { label: t('statistics.avgResponseTime'), valeur: stats.tempsMoyenReponse, suffixe: "h", icon: <ClockIcon className="h-8 w-8" /> }
  ];

  // Fonction pour obtenir la couleur de l'étape
  const getStepColor = (color) => {
    const colors = {
      blue: {
        bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-100',
        icon: darkMode ? 'text-blue-400' : 'text-blue-600',
        border: 'border-blue-400',
        step: 'bg-blue-500'
      },
      green: {
        bg: darkMode ? 'bg-green-900/30' : 'bg-green-100',
        icon: darkMode ? 'text-green-400' : 'text-green-600',
        border: 'border-green-400',
        step: 'bg-green-500'
      },
      yellow: {
        bg: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100',
        icon: darkMode ? 'text-yellow-400' : 'text-yellow-600',
        border: 'border-yellow-400',
        step: 'bg-yellow-500'
      },
      purple: {
        bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-100',
        icon: darkMode ? 'text-purple-400' : 'text-purple-600',
        border: 'border-purple-400',
        step: 'bg-purple-500'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-blue-100'
    }`}>
      <PublicNavbar />
      <PublicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <main className="flex-1">
        {/* Hero section avec image de l'Hôtel de Ville */}
        <div className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
          {/* Image de fond avec overlay plus léger */}
          <div className="absolute inset-0 z-0">
            {!heroImageError ? (
              <>
                <img 
                  src="/images/cua.jfif"
                  alt="Hôtel de Ville d'Antananarivo - Analakely"
                  className="w-full h-full object-cover object-center"
                  onError={() => setHeroImageError(true)}
                />
                {/* Overlay semi-transparent pour améliorer la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/50 to-black/60"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
              </div>
            )}
          </div>
          
          {/* Contenu superposé avec meilleure lisibilité */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center">
              {/* Logo CUA */}
              <div className="flex justify-center mb-6 animate-fade-in-up">
                {!logoError ? (
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                    <img 
                      src="/images/logo-cua.png"
                      alt="Logo CUA - Commune Urbaine d'Antananarivo" 
                      className="w-28 h-28 object-contain"
                      onError={() => setLogoError(true)}
                    />
                  </div>
                ) : (
                  <div className="bg-yellow-500 rounded-lg px-6 py-3 shadow-xl">
                    <span className="text-2xl font-bold text-blue-900">CUA</span>
                  </div>
                )}
              </div>
              
              {/* Titre avec ombre pour meilleure lisibilité */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg animate-fade-in-up">
                {t('hero.title')}
              </h1>
              
              {/* Sous-titre avec fond semi-transparent */}
              <div className="inline-block bg-black/30 backdrop-blur-sm rounded-lg px-6 py-2 mb-8">
                <p className="text-xl text-yellow-200 max-w-2xl mx-auto">
                  {t('hero.subtitle')}
                </p>
              </div>
              
              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
                <Link
                  to="/deposer-doleance"
                  className="inline-flex items-center px-6 py-3 bg-yellow-500 text-blue-900 font-semibold rounded-lg hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  {t('hero.btnSubmit')}
                </Link>
                <Link
                  to="/suivi-doleance"
                  className="inline-flex items-center px-6 py-3 bg-white/95 backdrop-blur-sm text-blue-700 font-semibold rounded-lg hover:bg-white transition-all transform hover:scale-105 shadow-lg"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  {t('hero.btnTrack')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Étapes à suivre */}
        <div className={`py-16 transition-colors duration-300 ${
          darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-white'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                {t('steps.title')}
              </h2>
              <p className={darkMode ? 'text-gray-300 mt-2' : 'text-blue-600 mt-2'}>
                {t('steps.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {etapes.map((etape, index) => {
                const colors = getStepColor(etape.color);
                return (
                  <div key={etape.id} className={`relative p-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 ${colors.border} ${colors.bg}`}>
                    {/* Numéro de l'étape */}
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${colors.step}`}>
                      {etape.id}
                    </div>
                    
                    {/* Icône */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colors.bg}`}>
                      <div className={colors.icon}>
                        {etape.icon}
                      </div>
                    </div>
                    
                    {/* Titre et description */}
                    <h3 className={`text-lg font-semibold text-center mb-2 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                      {etape.title}
                    </h3>
                    <p className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {etape.description}
                    </p>
                    
                    {/* Ligne de connexion entre les étapes (sauf la dernière) */}
                    {index < etapes.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-yellow-400"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Bouton pour commencer */}
            <div className="text-center mt-8">
              <Link
                to="/deposer-doleance"
                className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg ${
                  darkMode 
                    ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white' 
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                {t('steps.startNow')}
              </Link>
            </div>
          </div>
        </div>

        {/* Chiffres clés */}
        <div className={`py-12 shadow-sm transition-colors duration-300 ${
          darkMode ? 'bg-gray-800' : 'bg-gradient-to-b from-white to-blue-50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                {t('statistics.title')}
              </h2>
              <p className={darkMode ? 'text-gray-300 mt-2' : 'text-blue-600 mt-2'}>
                {t('statistics.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {chiffresCles.map((item, index) => (
                <div key={index} className={`text-center p-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-b-4 border-yellow-400 ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    darkMode ? 'bg-gray-600' : 'bg-blue-100'
                  }`}>
                    <div className={darkMode ? 'text-yellow-400' : 'text-blue-600'}>
                      {item.icon}
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                    {item.valeur.toLocaleString()}{item.suffixe}
                  </div>
                  <div className={darkMode ? 'text-gray-300 mt-2' : 'text-gray-600 mt-2'}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className={`py-16 transition-colors duration-300 ${
          darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-white'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                {t('services.title')}
              </h2>
              <p className={darkMode ? 'text-gray-300 mt-2' : 'text-blue-600 mt-2'}>
                {t('services.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <DocumentTextIcon className="h-8 w-8" />, title: t('services.service1.title'), desc: t('services.service1.description') },
                { icon: <ClockIcon className="h-8 w-8" />, title: t('services.service2.title'), desc: t('services.service2.description') },
                { icon: <CheckCircleIcon className="h-8 w-8" />, title: t('services.service3.title'), desc: t('services.service3.description') }
              ].map((service, index) => (
                <div key={index} className={`text-center p-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-yellow-400 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    darkMode ? 'bg-gray-700' : 'bg-blue-100'
                  }`}>
                    <div className={darkMode ? 'text-yellow-400' : 'text-blue-600'}>
                      {service.icon}
                    </div>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                    {service.title}
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actualités récentes */}
        <div className={`py-16 transition-colors duration-300 ${
          darkMode ? 'bg-gray-800' : 'bg-gradient-to-b from-white to-blue-50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                {t('news.title')}
              </h2>
              <p className={darkMode ? 'text-gray-300 mt-2' : 'text-blue-600 mt-2'}>
                {t('news.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {actualites.map((actualite) => (
                <div key={actualite.id} className={`rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-yellow-200'
                }`}>
                  <div className="p-6">
                    <div className={`flex items-center gap-3 mb-3`}>
                      <div className={`p-2 rounded-full transition-colors ${
                        darkMode ? 'bg-gray-600' : 'bg-yellow-50'
                      }`}>
                        {actualite.icon}
                      </div>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {actualite.date}
                      </span>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                      {actualite.titre}
                    </h3>
                    <p className={darkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>
                      {actualite.description}
                    </p>
                    <button className="mt-4 text-yellow-600 text-sm font-medium hover:text-yellow-700 inline-flex items-center gap-1">
                      {t('news.readMore')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className={`py-16 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-900' 
            : 'bg-gradient-to-r from-blue-600 to-blue-800'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className={darkMode ? 'text-gray-200' : 'text-white'}>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>
                  {t('contact.needHelp')}
                </h2>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-blue-200'}`}>
                  {t('contact.description')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="h-5 w-5 text-blue-900" />
                    </div>
                    <span className={darkMode ? 'text-gray-300' : 'text-blue-100'}>
                      {t('contact.phone')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="h-5 w-5 text-blue-900" />
                    </div>
                    <span className={darkMode ? 'text-gray-300' : 'text-blue-100'}>
                      {t('contact.email')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="h-5 w-5 text-blue-900" />
                    </div>
                    <span className={darkMode ? 'text-gray-300' : 'text-blue-100'}>
                      {t('contact.address')}
                    </span>
                  </div>
                </div>
              </div>
              <div className={darkMode ? 'text-gray-200' : 'text-white'}>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>
                  {t('contact.stayConnected')}
                </h2>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-blue-200'}`}>
                  {t('contact.socialDescription')}
                </p>
                <div className="flex gap-4">
                  <button className={`p-3 rounded-full transition-all hover:scale-110 ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                  }`}>
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </button>
                  <button className={`p-3 rounded-full transition-all hover:scale-110 ${
                    darkMode 
                      ? 'bg-yellow-500 hover:bg-yellow-400' 
                      : 'bg-yellow-500 hover:bg-yellow-400'
                  }`}>
                    <svg className="h-6 w-6 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.479-11.634c0-.21-.005-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className={`p-3 rounded-full transition-all hover:scale-110 ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                  }`}>
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-3.594-1.555c-3.179 0-5.515 2.966-4.797 6.045A13.978 13.978 0 011.671 3.149a4.93 4.93 0 001.523 6.574 4.903 4.903 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.928 4.928 0 004.6 3.419A9.9 9.9 0 010 19.54a13.94 13.94 0 007.548 2.212c9.057 0 14.01-7.504 13.704-14.227A9.817 9.817 0 0024 4.557z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default Accueil;