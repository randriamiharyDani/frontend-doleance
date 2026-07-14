import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import {
  BuildingLibraryIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = vérification en cours

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabels = ["Très faible", "Faible", "Moyen", "Bon", "Fort", "Très fort"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500", "bg-green-600"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Veuillez saisir un nouveau mot de passe.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword(token, newPassword);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 5000);
      } else {
        setError(result.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Token manquant
  if (tokenValid === false) {
    return (
      <div className="cua-login min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-md">
          <div className="cua-card bg-white/90 rounded-2xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 p-8 sm:p-10 text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F172A] via-[#D4AF37] to-[#0F172A] rounded-t-2xl" />
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="cua-display text-xl font-semibold text-[#0F172A] mb-2">Lien invalide</h2>
            <p className="text-slate-500 text-sm mb-6">
              Ce lien de réinitialisation est invalide ou manquant. Veuillez demander un nouveau lien.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2E4FA3] text-white text-sm font-semibold hover:from-[#162D6B] hover:to-[#1E3A8A] transition-all"
            >
              Demander un nouveau lien
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="cua-login min-h-screen flex bg-[#F8FAFC]">
      {/* ============ Partie gauche ============ */}
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
                alt="Blason CUA"
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
              Créez un nouveau mot de passe sécurisé pour accéder à votre espace professionnel.
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9] -z-10" />
        <div className="cua-orb-slow absolute top-10 right-10 w-64 h-64 rounded-full bg-[#D4AF37]/[0.06] blur-3xl -z-10" />

        <div className="cua-anim-1 w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg">
                <img src="/images/logo-cua.png" alt="Logo CUA" className="w-11 h-11 object-contain" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center shadow ring-4 ring-white">
                <BuildingLibraryIcon className="w-3.5 h-3.5 text-[#0F172A]" />
              </div>
            </div>
          </div>

          {/* Carte */}
          <div className="cua-card bg-white/90 rounded-2xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F172A] via-[#D4AF37] to-[#0F172A]" />

            <div className="text-center mb-8">
              <div className="hidden lg:flex justify-center mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg shadow-[#0F172A]/20">
                    <img src="/images/logo-cua.png" alt="Logo CUA" className="w-11 h-11 object-contain" />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center shadow ring-4 ring-white">
                    <BuildingLibraryIcon className="w-3.5 h-3.5 text-[#0F172A]" />
                  </div>
                </div>
              </div>
              <h1 className="cua-display text-2xl font-semibold text-[#0F172A]">
                Nouveau mot de passe
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Choisissez un mot de passe sécurisé
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-snug">{error}</p>
              </div>
            )}

            {/* Succès */}
            {success ? (
              <div className="text-center">
                <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700 leading-snug">
                    <p className="font-semibold mb-1">Mot de passe réinitialisé !</p>
                    <p>
                      Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la
                      page de connexion dans quelques secondes.
                    </p>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2E4FA3] text-white text-sm font-semibold hover:from-[#162D6B] hover:to-[#1E3A8A] transition-all"
                >
                  Se connecter maintenant
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Nouveau mot de passe */}
                <div className="mb-4">
                  <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Minimum 6 caractères"
                      className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A8A] transition-colors"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Indicateur de force */}
                  {newPassword.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < strength ? strengthColors[strength - 1] : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Force : <span className="font-medium">{strengthLabels[strength]}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmer le mot de passe */}
                <div className="mb-6">
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Retapez le mot de passe"
                      className={`w-full pl-11 pr-11 py-3.5 rounded-xl bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-red-300"
                          : confirmPassword && confirmPassword === newPassword
                          ? "border-green-300"
                          : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A8A] transition-colors"
                    >
                      {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs text-green-600 mt-1">Les mots de passe correspondent</p>
                  )}
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
                      Réinitialisation en cours...
                    </>
                  ) : (
                    <>
                      Réinitialiser le mot de passe
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-slate-500 hover:text-[#1E3A8A] transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheckIcon className="w-4 h-4 text-[#D4AF37]" />
            <p className="text-xs">Plateforme sécurisée — Commune Urbaine d'Antananarivo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
