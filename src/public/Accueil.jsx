import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  MapPinIcon
} from '@heroicons/react/24/outline';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicSidebar from '../components/public/PublicSidebar';
import PublicFooter from '../components/public/PublicFooter';

function Accueil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    doleancesTraitees: 0,
    citoyensServis: 0,
    tauxSatisfaction: 0,
    tempsMoyenReponse: 0
  });

  // Simuler le chargement des statistiques
  useEffect(() => {
    // À remplacer par un vrai appel API
    setTimeout(() => {
      setStats({
        doleancesTraitees: 15234,
        citoyensServis: 12580,
        tauxSatisfaction: 94,
        tempsMoyenReponse: 48
      });
    }, 1000);
  }, []);

  // Témoignages des citoyens
  const temoignages = [
    {
      id: 1,
      nom: "Rakoto Jean",
      ville: "Antananarivo",
      message: "Service rapide et efficace. Ma doléance a été traitée en moins d'une semaine !",
      note: 5,
      image: "👨"
    },
    {
      id: 2,
      nom: "Rasoarimanana Marie",
      ville: "Antananarivo",
      message: "Très satisfaite du suivi. J'ai pu voir l'évolution en temps réel.",
      note: 5,
      image: "👩"
    },
    {
      id: 3,
      nom: "Andrianary David",
      ville: "Antananarivo",
      message: "Plateforme simple d'utilisation. Je recommande vivement.",
      note: 4,
      image: "👨"
    }
  ];

  // Actualités récentes
  const actualites = [
    {
      id: 1,
      titre: "Nouveau système de suivi des doléances",
      date: "15 Mars 2024",
      description: "La CUA lance une plateforme innovante pour mieux répondre aux préoccupations des citoyens.",
      icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />
    },
    {
      id: 2,
      titre: "Réduction du délai de traitement",
      date: "10 Mars 2024",
      description: "Le délai moyen de traitement passe de 72h à 48h grâce à la digitalisation.",
      icon: <ClockIcon className="h-6 w-6 text-green-600" />
    },
    {
      id: 3,
      titre: "Formation des agents",
      date: "5 Mars 2024",
      description: "Plus de 200 agents formés pour mieux traiter les doléances des citoyens.",
      icon: <UserGroupIcon className="h-6 w-6 text-purple-600" />
    }
  ];

  // Chiffres clés
  const chiffresCles = [
    { label: "Doléances traitées", valeur: stats.doleancesTraitees, suffixe: "+", icon: <DocumentTextIcon className="h-8 w-8" />, color: "blue" },
    { label: "Citoyens servis", valeur: stats.citoyensServis, suffixe: "+", icon: <UserGroupIcon className="h-8 w-8" />, color: "green" },
    { label: "Taux de satisfaction", valeur: stats.tauxSatisfaction, suffixe: "%", icon: <StarIcon className="h-8 w-8" />, color: "yellow" },
    { label: "Temps moyen réponse", valeur: stats.tempsMoyenReponse, suffixe: "h", icon: <ClockIcon className="h-8 w-8" />, color: "purple" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <PublicNavbar />
      <PublicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <main className="flex-1">
        {/* Hero section avec animation */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
                Exprimez vos préoccupations
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Déposez une doléance en quelques clics et suivez son traitement en temps réel
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/deposer-doleance"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Déposer une doléance
                </Link>
                <Link
                  to="/suivi-doleance"
                  className="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Suivre ma doléance
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Chiffres clés */}
        <div className="bg-white py-12 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">La CUA en chiffres</h2>
              <p className="text-gray-600 mt-2">Notre engagement pour les citoyens</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {chiffresCles.map((item, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 text-${item.color}-600`}>
                    {item.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {item.valeur.toLocaleString()}{item.suffixe}
                  </div>
                  <div className="text-gray-600 mt-2">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Nos services</h2>
              <p className="text-gray-600 mt-2">Des solutions adaptées à vos besoins</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Dépôt facile</h3>
                <p className="text-gray-600">Déposez votre doléance en quelques minutes sans création de compte</p>
                <div className="mt-4">
                  <span className="inline-flex items-center text-blue-600 text-sm">
                    En savoir plus →
                  </span>
                </div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Suivi en temps réel</h3>
                <p className="text-gray-600">Suivez l'évolution de votre doléance avec votre numéro unique</p>
                <div className="mt-4">
                  <span className="inline-flex items-center text-green-600 text-sm">
                    En savoir plus →
                  </span>
                </div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Traitement rapide</h3>
                <p className="text-gray-600">Vos doléances sont traitées par les services compétents</p>
                <div className="mt-4">
                  <span className="inline-flex items-center text-purple-600 text-sm">
                    En savoir plus →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actualités récentes */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Actualités</h2>
              <p className="text-gray-600 mt-2">Restez informés des dernières innovations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {actualites.map((actualite) => (
                <div key={actualite.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {actualite.icon}
                      <span className="text-sm text-gray-500">{actualite.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{actualite.titre}</h3>
                    <p className="text-gray-600 text-sm">{actualite.description}</p>
                    <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                      Lire la suite →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Témoignages */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Ce qu'ils disent de nous</h2>
              <p className="text-gray-600 mt-2">Découvrez les avis des citoyens</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {temoignages.map((temoignage) => (
                <div key={temoignage.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                      {temoignage.image}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{temoignage.nom}</h4>
                      <p className="text-sm text-gray-500">{temoignage.ville}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`h-4 w-4 ${i < temoignage.note ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{temoignage.message}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Rapide */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Questions fréquentes</h2>
            <p className="text-blue-100 mb-8">Besoin d'aide ? Consultez notre FAQ</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Comment déposer une doléance ?</h4>
                <p className="text-blue-100 text-sm">Cliquez sur "Déposer une doléance" et remplissez le formulaire en ligne.</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Comment suivre ma doléance ?</h4>
                <p className="text-blue-100 text-sm">Utilisez votre numéro unique reçu par email ou SMS.</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Quel est le délai de traitement ?</h4>
                <p className="text-blue-100 text-sm">Le délai moyen est de 48 heures pour un premier retour.</p>
              </div>
            </div>
            <Link to="/faq" className="inline-block mt-8 text-white border border-white px-6 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
              Voir toutes les FAQs
            </Link>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Besoin d'assistance ?</h2>
                <p className="text-gray-600 mb-6">
                  Notre équipe est à votre disposition pour vous accompagner dans vos démarches.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-gray-700">+261 34 05 123 45</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-gray-700">support@cua.mg</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-gray-700">Commune Urbaine d'Antananarivo, Analakely</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Restez connectés</h2>
                <p className="text-gray-600 mb-6">
                  Suivez-nous sur les réseaux sociaux pour ne rien manquer.
                </p>
                <div className="flex gap-4">
                  <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                  </button>
                  <button className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.479-11.634c0-.21-.005-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
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