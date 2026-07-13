import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  EyeIcon,
  EyeSlashIcon,
  BuildingLibraryIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

/**
 * Page de connexion — Espace Agent Municipal
 * Commune Urbaine d'Antananarivo
 *
 * Palette :
 *   --cua-navy      #0F172A  (fond institutionnel)
 *   --cua-blue       #1E3A8A  (bleu de marque)
 *   --cua-blue-light #2E4FA3  (dégradé bouton)
 *   --cua-gold       #D4AF37  (accent doré du blason)
 *   --cua-gold-soft  #E9CE7C  (halo doré)
 *   --cua-surface    #F8FAFC  (surfaces claires)
 *   --cua-slate      #64748B  (texte secondaire)
 *
 * Police : "Fraunces" (display, institutionnel/gravitas) + "Inter" (texte/UI).
 * Ajouter dans public/index.html, dans <head> :
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
 */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        navigate("/backoffice/dashboard");
      } else {
        setError("Identifiants incorrects. Veuillez vérifier votre email et votre mot de passe.");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cua-login min-h-screen flex bg-[#F8FAFC]">
  
      {/* ============ Partie gauche — identité institutionnelle ============ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0F172A]">
        <img
          src="/images/tana-renivohitra.jpeg"
          alt="Vue d'Antananarivo"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />

        {/* Overlay dégradé bleu/doré */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/95 via-[#1E3A8A]/80 to-[#0F172A]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />

        {/* Motif de points dorés (évoque un filigrane officiel) */}
        <div className="absolute inset-0 cua-seal-pattern opacity-[0.08]" />

        {/* Halos lumineux animés */}
        <div className="cua-orb absolute -top-24 -left-16 w-80 h-80 rounded-full bg-[#D4AF37]/20 blur-3xl" />
        <div className="cua-orb-slow absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#1E3A8A]/40 blur-3xl" />

        {/* Ligne dorée verticale de bordure */}
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between px-14 py-16 text-white w-full">
          {/* Logo + blason */}
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

          {/* Texte central */}
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
              Plateforme numérique de gestion des services municipaux et des
              doléances citoyennes.
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

          {/* Footer gauche */}
          <p className="cua-anim-4 text-white/40 text-xs tracking-wide">
            © {new Date().getFullYear()} Commune Urbaine d'Antananarivo — Tous droits réservés
          </p>
        </div>
      </div>

      {/* ============ Partie droite — formulaire de connexion ============ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative">
        {/* Fond subtil sur mobile / desktop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9] -z-10" />
        <div className="cua-orb-slow absolute top-10 right-10 w-64 h-64 rounded-full bg-[#D4AF37]/[0.06] blur-3xl -z-10" />

        <div className="cua-anim-1 w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg">
                <img
                  src="/images/logo-cua.png"
                  alt="Logo CUA"
                  className="w-11 h-11 object-contain"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center shadow ring-4 ring-white">
                <BuildingLibraryIcon className="w-3.5 h-3.5 text-[#0F172A]" />
              </div>
            </div>
          </div>

          {/* Carte de connexion */}
          <div className="cua-card bg-white/90 rounded-2xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
            {/* Liseré doré supérieur */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F172A] via-[#D4AF37] to-[#0F172A]" />

            {/* Header carte */}
            <div className="text-center mb-8">
              <div className="hidden lg:flex justify-center mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg shadow-[#0F172A]/20">
                    <img
                      src="/images/logo-cua.png"
                      alt="Logo CUA"
                      className="w-11 h-11 object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center shadow ring-4 ring-white">
                    <BuildingLibraryIcon className="w-3.5 h-3.5 text-[#0F172A]" />
                  </div>
                </div>
              </div>

              <h1 className="cua-display text-2xl font-semibold text-[#0F172A]">
                Connexion Agent Municipal
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Accédez à votre espace professionnel
              </p>

              <span className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#9A7200] text-xs font-semibold">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                Espace Agent Municipal
              </span>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="cua-error mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="cua-email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email professionnel
                </label>

                <div className="cua-input relative rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="cua-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="agent@antananarivo.mg"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="mb-2">
                <label
                  htmlFor="cua-password"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Mot de passe
                </label>

                <div className="cua-input relative rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="cua-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Votre mot de passe"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A8A] transition-colors"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  className="text-xs font-medium text-[#1E3A8A] hover:text-[#D4AF37] transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`cua-btn w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70 ${
                  loading ? "cua-shimmer" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/deposer-doleance"
                className="text-sm text-slate-500 hover:text-[#1E3A8A] transition-colors inline-flex items-center gap-1.5"
              >
                <span aria-hidden>←</span> Retour à l'espace citoyen
              </Link>
            </div>
          </div>

          {/* Footer sécurité */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheckIcon className="w-4 h-4 text-[#D4AF37]" />
            <p className="text-xs">
              Plateforme sécurisée — Commune Urbaine d'Antananarivo
            </p>
          </div>
          <p className="text-center text-[11px] text-slate-300 mt-1">
            Version 2.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
