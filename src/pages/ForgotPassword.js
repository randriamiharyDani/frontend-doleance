import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import emailjs from '@emailjs/browser';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Récupération des variables d'environnement (préfixées VITE_)
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Vérification unique au montage du composant
  useEffect(() => {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.error('❌ Variables EmailJS manquantes dans .env');
      console.log('SERVICE_ID :', SERVICE_ID);
      console.log('TEMPLATE_ID :', TEMPLATE_ID);
      console.log('PUBLIC_KEY :', PUBLIC_KEY);
    } else {
      console.log('✅ Variables EmailJS correctement chargées');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification avant d'envoyer
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setMessage({
        type: 'error',
        text: 'Configuration EmailJS incomplète. Contactez l\'administrateur.',
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const templateParams = {
        to_email: email,
        reset_link: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`,
      };

      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );

      console.log('✅ Email envoyé !', response.status, response.text);
      setMessage({
        type: 'success',
        text: 'Un email de réinitialisation a été envoyé à votre adresse.',
      });
      setEmail('');
    } catch (error) {
      console.error('❌ Erreur EmailJS :', error);
      setMessage({
        type: 'error',
        text: error.text || 'Une erreur est survenue. Vérifiez votre adresse email ou réessayez plus tard.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        
        {/* En-tête */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <img 
                  src="/images/logo-cua.png" 
                  alt="Logo CUA" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span className="text-white text-2xl font-bold">CUA</span>';
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <BuildingOfficeIcon className="h-4 w-4 text-blue-900" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Réinitialisation</h1>
          <p className="text-gray-500 text-sm mt-1">Entrez votre email professionnel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email professionnel
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="agent@antananarivo.mg"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </span>
            ) : (
              'Envoyer le lien de réinitialisation'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
            <ArrowLeftIcon className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Plateforme sécurisée - Accès réservé aux agents municipaux</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Version 2.0 • Commune Urbaine d'Antananarivo
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;