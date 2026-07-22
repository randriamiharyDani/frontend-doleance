import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import {
  BuildingLibraryIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        setSuccess(true);
        // En dev, le backend renvoie le lien directement dans la réponse
        if (result.data?._dev_resetUrl) {
          setDevResetUrl(result.data._dev_resetUrl);
        }
      } else {
        setError(result.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cua-login min-h-screen flex bg-[#F8FAFC] dark:bg-slate-900">
      {/* ============ Partie gauche — identité institutionnelle ============ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0F172A]">
        <img
          src="/images/tana-renivohitra.jpeg"
          alt="Vue d'Antananarivo"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/95 via-[#1E3A8A]/80 to-[#0F172A]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
        <div className="absolute inset-0 cua-seal-pattern opacity-[0.08]" />
        <div className="cua-orb absolute -top-24 -left-16 w-80 h-80 rounded-full bg-[#D4AF37]/20 blur-3xl" />
        <div className="cua-orb-slow absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#1E3A8A]/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between px-14 py-16 text-white w-full">
          <div className="cua-anim-1">
            <div className="relative inline-block">
              <div className="cua-crest-ring absolute -inset-2 rounded-full border border-[#D4AF37]/40" />
              <img
                src="/images/logo-cua.png"
                alt="Blason de la Commune Urbaine d'Antananarivo"
                className="relative w-20 h-20 object-contain drop-shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
              />
            </div>
          </div>

          <div className="max-w-lg">
            <span className="cua-anim-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-5">
              <span className="h-px w-8 bg-[#D4AF37]" />
              République de Madagascar
            </span>
            <h1 className="cua-anim-2 cua-display text-5xl leading-[1.08] font-semibold text-white">
              Commune Urbaine
            </h1>
            <h2 className="cua-anim-3 cua-display text-5xl leading-[1.08] font-semibold text-[#D4AF37] mb-6">
              d'Antananarivo
            </h2>
            <p className="cua-anim-3 text-white/75 text-base leading-relaxed max-w-md">
              Récupérez l'accès à votre espace professionnel en quelques étapes simples.
            </p>
            <div className="cua-anim-4 mt-8 flex items-center gap-3 pt-6 border-t border-white/10">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-4.5 h-4.5 text-[#D4AF37]" />
              </div>
              <span className="text-sm text-white/85 font-medium">
                Espace sécurisé des agents municipaux
              </span>
            </div>
          </div>

          <p className="cua-anim-4 text-white/40 text-xs tracking-wide">
            © {new Date().getFullYear()} Commune Urbaine d'Antananarivo — Tous droits réservés
          </p>
        </div>
      </div>

      {/* ============ Partie droite — formulaire ============ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10" />
        <div className="cua-orb-slow absolute top-10 right-10 w-64 h-64 rounded-full bg-[#D4AF37]/[0.06] blur-3xl -z-10" />

        <div className="cua-anim-1 w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg">
                <img src="/images/logo-cua.png" alt="Logo CUA" className="w-11 h-11 object-contain" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center shadow ring-4 ring-white dark:ring-slate-800">
                <BuildingLibraryIcon className="w-3.5 h-3.5 text-[#0F172A]" />
              </div>
            </div>
          </div>

          {/* Carte */}
          <div className="cua-card bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 dark:border-slate-700 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F172A] via-[#D4AF37] to-[#0F172A]" />

            <div className="text-center mb-8">
              <div className="hidden lg:flex justify-center mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg shadow-[#0F172A]/20">
                    <img src="/images/logo-cua.png" alt="Logo CUA" className="w-11 h-11 object-contain" />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center shadow ring-4 ring-white dark:ring-slate-800">
                    <BuildingLibraryIcon className="w-3.5 h-3.5 text-[#0F172A]" />
                  </div>
                </div>
              </div>
              <h1 className="cua-display text-2xl font-semibold text-[#0F172A] dark:text-white">
                Mot de passe oublié
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Entrez votre e-mail pour recevoir un lien de réinitialisation
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 px-4 py-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 leading-snug">{error}</p>
              </div>
            )}

            {/* Message de succès */}
            {success ? (
              <div className="text-center">
                <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 px-4 py-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700 dark:text-green-400 leading-snug">
                    <p className="font-semibold mb-1">E-mail envoyé !</p>
                    <p>
                      Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un
                      lien de réinitialisation. Vérifiez votre boîte de réception et vos spams.
                    </p>
                  </div>
                </div>

                {/* Lien de développement — affiché quand SMTP n'est pas configuré */}
                {/* {devResetUrl && (
                  <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-left">
                    <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Mode développement — SMTP non configuré
                    </p>
                    <p className="text-xs text-amber-600 mb-2">
                      Copiez ce lien pour tester la réinitialisation :
                    </p>
                    <div className="flex items-stretch gap-2">
                      <input
                        readOnly
                        value={devResetUrl}
                        className="flex-1 text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-slate-700 outline-none select-all"
                        onClick={(e) => e.target.select()}
                      />
                      <a
                        href={devResetUrl}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#162D6B] transition-colors flex-shrink-0"
                      >
                        Ouvrir
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )} */}

                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                    setDevResetUrl(null);
                  }}
                  className="text-sm font-medium text-[#1E3A8A] hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5"
                >
                  Renvoyer un lien
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-6">
                  <label htmlFor="forgot-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Adresse e-mail
                  </label>
                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 transition-all duration-200">
                    <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="agent@antananarivo.mg"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70 bg-gradient-to-r from-[#1E3A8A] to-[#2E4FA3] hover:from-[#162D6B] hover:to-[#1E3A8A] transition-all duration-200 shadow-lg shadow-[#1E3A8A]/25 ${
                    loading ? "cua-shimmer" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le lien
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#1E3A8A] transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
            <ShieldCheckIcon className="w-4 h-4 text-[#D4AF37]" />
            <p className="text-xs">Plateforme sécurisée — Commune Urbaine d'Antananarivo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
