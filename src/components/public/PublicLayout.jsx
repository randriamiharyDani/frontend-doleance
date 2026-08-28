// navbar frontend

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import siteSettingsService from "../../services/siteSettingsService";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

// Valeurs par défaut (utilisées si l'API n'est pas joignable)
const DEFAULT_EMERGENCY_CONTACTS = [
  { label: 'CUA', phone: '034 72 139 93', tel: 'tel:0347213993' },
  { label: 'Sapeurs Pompiers', phone: '034 12 232 35', tel: 'tel:0341223235' },
  { label: 'Police Municipale', phone: '034 58 694 10', tel: 'tel:0345869410' },
  { label: 'BMH', phone: '032 22 655 25', tel: 'tel:0322265525' },
];

const DEFAULT_SOCIAL_HREFS = {
  whatsapp: "#",
  facebook: "#",
  instagram: "#",
};

function PublicLayout({ children }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState(DEFAULT_EMERGENCY_CONTACTS);
  const [socialHrefs, setSocialHrefs] = useState(DEFAULT_SOCIAL_HREFS);

  // Hauteur réelle de la barre d'urgence (mesurée) : le header et le contenu
  // s'adaptent automatiquement, quelle que soit la façon dont les contacts
  // se réorganisent selon la largeur de l'écran (1 ligne, 2x2, etc.)
  const topBarRef = useRef(null);
  const [topBarHeight, setTopBarHeight] = useState(32);
  useEffect(() => {
    const el = topBarRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => setTopBarHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [emergencyContacts]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Contacts d'urgence + réseaux sociaux depuis la base (mise à jour via l'espace Admin)
  // En cas d'échec API : les valeurs par défaut ci-dessus restent affichées
  useEffect(() => {
    let mounted = true;
    siteSettingsService.getSettings()
      .then((res) => {
        if (!mounted) return;
        const data = res?.data || {};
        const contacts = Array.isArray(data.contacts) ? data.contacts : [];
        if (contacts.length > 0) {
          setEmergencyContacts(
            contacts
              .filter((c) => (c.telephone || '').trim())
              .map((c) => {
                const digits = c.telephone.replace(/[^0-9+]/g, '');
                return { label: c.libelle, phone: c.telephone, tel: `tel:${digits}` };
              })
          );
        }
        const wa = (data.socials?.whatsapp || '').trim();
        const fb = (data.socials?.facebook || '').trim();
        const ig = (data.socials?.instagram || '').trim();
        const waDigits = wa.replace(/[^0-9]/g, '');
        setSocialHrefs({
          whatsapp: waDigits ? `https://wa.me/${waDigits}` : DEFAULT_SOCIAL_HREFS.whatsapp,
          facebook: fb || DEFAULT_SOCIAL_HREFS.facebook,
          instagram: ig || DEFAULT_SOCIAL_HREFS.instagram,
        });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const navItems = [
    {
      label: t("nav.submit"),
      path: "/deposer-doleance",
      icon: DocumentTextIcon,
    },
    {
      label: t("nav.track"),
      path: "/suivi-doleance",
      icon: MagnifyingGlassIcon,
    },
    // ===== MASQUÉ : Appel Citoyen → Agent (fonctionnalité conservée, affichage retiré du navbar public) =====
    // Pour réafficher, décommenter le bloc ci-dessous.
    // {
    //   label: t("nav.callAgent"),
    //   path: "/appeler-agent",
    //   icon: PhoneIcon,
    // },
  ];

  const SOCIALS = [
    {
      name: "WhatsApp",
      href: socialHrefs.whatsapp,
      bg: "bg-[#25D366]",
      hoverBg: "hover:bg-[#1DA851]",
      path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413",
    },
    {
      name: "Facebook",
      href: socialHrefs.facebook,
      bg: "bg-[#1877F2]",
      hoverBg: "hover:bg-[#0C5DC7]",
      path: "M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
      name: "Instagram",
      href: socialHrefs.instagram,
      bg: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5]",
      hoverBg: "",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    },
  ];

  // Petits drapeaux SVG (nets sur tous les OS, contrairement aux emojis 🇲🇬🇫🇷)
  const FlagMG = () => (
    <svg viewBox="0 0 3 2" className="w-4 h-3 rounded-[2px] shadow-sm">
      <rect width="1" height="2" fill="#fff" />
      <rect x="1" width="2" height="1" fill="#fc3d32" />
      <rect x="1" y="1" width="2" height="1" fill="#007e3a" />
    </svg>
  );

  const FlagFR = () => (
    <svg viewBox="0 0 3 2" className="w-4 h-3 rounded-[2px] shadow-sm">
      <rect width="1" height="2" fill="#0055A4" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#EF4135" />
    </svg>
  );

  const LANGUAGES = [
    { code: "mg", label: "MG", Flag: FlagMG },
    { code: "fr", label: "FR", Flag: FlagFR },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`cua-layout min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-slate-900" : "bg-[#EEF2F6]"
      }`}
    >
      <style>{`
        .cua-layout { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cua-layout .cua-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .cua-layout .cua-nav-active {
          background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 65%, #2E4FA3 100%);
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.4);
        }
        .cua-layout .cua-icon-btn:hover {
          color: #D4AF37;
        }
        .cua-layout .cua-login-link:hover {
          color: #D4AF37;
        }
        .cua-layout .cua-top-line {
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
        }
      `}</style>

      {/* ===== TOP BAR — Urgences ===== */}
      <div
        ref={topBarRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        } ${
          darkMode
            ? 'bg-[#0C1222]/90 backdrop-blur-md border-b border-white/5'
            : 'bg-[#0B1A33]/95 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          {/* Rangée unique : 4 pills côte à côte sur grand écran,
              réorganisation automatique en 2x2 sur petit écran */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4 xl:gap-x-6 gap-y-1 py-1">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.tel}
                className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full pl-1 pr-2 sm:pr-3 py-0.5 bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/[0.12] hover:ring-red-400/30 transition-all duration-200 whitespace-nowrap"
              >
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 flex-shrink-0">
                  <span className="absolute w-4 h-4 rounded-full bg-red-500/20 animate-ping" />
                  <PhoneIcon className="h-3 w-3 text-red-400 relative z-10" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/40 group-hover:text-white/60 transition-colors">
                  {contact.label}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-white/85 group-hover:text-red-300 transition-colors">
                  {contact.phone}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header
        style={{ top: scrolled ? 0 : topBarHeight }}
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? darkMode
              ? "bg-slate-900/85 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-slate-700/50"
              : "bg-white/85 backdrop-blur-xl shadow-lg shadow-[#0F172A]/5 border-b border-slate-200/60"
            : darkMode
              ? "bg-slate-900/60 backdrop-blur-md border-b border-slate-800/50"
              : "bg-white/60 backdrop-blur-md border-b border-slate-100/60"
        }`}
      >
        {/* Liseré doré discret en tête de page */}
        <div className="cua-top-line h-[2px] w-full opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/deposer-doleance" className="flex items-center group">
                <img
                  src={`${import.meta.env.BASE_URL}images/logo_CUA.svg`}
                  alt="Logo CUA"
                  className="h-16 w-16 object-contain cua-crest-ring space rounded-full border border-[#D4AF37]/40 transition-transform duration-200 group-hover:scale-105"
                />
                <div className="hidden sm:block">
                  <h1
                    className={`cua-display text-3xl font-semibold leading-tight transition-colors ${
                      darkMode ? "text-white" : "text-[#0F172A]"
                    }`}
                  >
                     {t("hero.title")}
                  </h1>
                  <p
                    className={`text-[13px] font-medium -mt-0.5 tracking-wide ${
                      darkMode ? "text-[#D4AF37]/80" : "text-[#9A7200]"
                    }`}
                  >
                    Antananarivo, 101
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Navigation (desktop) */}

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "cua-nav-active text-white"
                        : darkMode
                          ? "text-slate-300 hover:text-white hover:bg-white/10"
                          : "text-slate-500 hover:text-[#0F172A] hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={`cua-icon-btn p-2 rounded-xl transition-all duration-200 ${
                  darkMode
                    ? "text-slate-300 hover:bg-white/10"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
                aria-label="Changer le thème"
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* Language selector */}
              <div
                className={`hidden sm:flex items-center gap-0.5 rounded-xl p-0.5 border ${
                  darkMode
                    ? "border-slate-600 bg-slate-800/50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {LANGUAGES.map(({ code, label, Flag }) => {
                  const active = i18n.language === code;
                  return (
                    <button
                      key={code}
                      onClick={() => i18n.changeLanguage(code)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        active
                          ? "bg-[#D4AF37] text-white shadow-sm"
                          : darkMode
                            ? "text-slate-400 hover:text-white hover:bg-white/10"
                            : "text-slate-500 hover:text-[#0F172A] hover:bg-white"
                      }`}
                      aria-label={`Langue ${label}`}
                      aria-pressed={active}
                    >
                      <Flag />
                     
                    </button>
                  );
                })}
              </div>

              {/* Hamburger mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
                  mobileMenuOpen
                    ? "cua-nav-active text-white"
                    : darkMode
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-slate-400 hover:bg-slate-100"
                }`}
                aria-label={
                  mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"
                }
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <Bars3Icon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown navbar eee */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden border-t transition-colors duration-200 ${
              darkMode
                ? "bg-slate-900/95 backdrop-blur-xl border-slate-700/50"
                : "bg-white/95 backdrop-blur-xl border-slate-100"
            }`}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "cua-nav-active text-white"
                        : darkMode
                          ? "text-slate-300 hover:bg-white/10 hover:text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div
                className={`border-t my-2 ${darkMode ? "border-slate-700" : "border-slate-100"}`}
              />

              {/* Urgences (mobile) */}
              <div className="px-4 pt-2 pb-1">
                <p className={`text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? "text-red-400/70" : "text-red-400/80"}`}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Urgences
                </p>
              </div>
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.tel}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    darkMode
                      ? "text-slate-300 hover:bg-white/10 hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                  }`}
                >
                  <PhoneIcon className="h-5 w-5 text-red-400" />
                  <span className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{contact.label}</span>
                  <span>{contact.phone}</span>
                </a>
              ))}

              <div
                className={`border-t my-2 ${darkMode ? "border-slate-700" : "border-slate-100"}`}
              />

              {/* Language selector (mobile) */}
              <div className={`flex items-center gap-2 px-4 py-2`}>
                <span
                  className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  {t("language.language")} :
                </span>
                <div
                  className={`flex items-center rounded-lg overflow-hidden border ${
                    darkMode ? "border-slate-600" : "border-slate-200"
                  }`}
                >
                  {[
                    { code: "mg", label: "MG", flag: "🇲🇬" },
                    { code: "fr", label: "FR", flag: "🇫🇷" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                        i18n.language === lang.code
                          ? "bg-[#D4AF37] text-white"
                          : darkMode
                            ? "text-slate-400 hover:text-white hover:bg-white/10"
                            : "text-slate-500 hover:text-[#0F172A] hover:bg-slate-100"
                      }`}
                      aria-label={`Langue ${lang.label}`}
                    >
                      <span className="mr-0.5">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Login link (mobile) */}
              {/* <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? 'text-[#D4AF37] hover:bg-white/10'
                    : 'text-[#1E3A8A] hover:bg-slate-50'
                }`}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Espace Agent</span>
              </Link> */}
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main
        style={{ paddingTop: topBarHeight + 76 }}
        className={`min-h-screen transition-colors duration-200 ${
          darkMode ? "bg-slate-900" : "bg-[#F8FAFC]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer
        className={`border-t transition-colors duration-200 relative ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-100"
        }`}
      >
        <div className="cua-top-line h-[2px] w-full opacity-50 absolute top-0 left-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo + Infos */}
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}images/logo_CUA.svg`}
                alt="CUA"
                className="h-10 w-10 object-contain rounded-lg"
              />

              <div>
                <p
                  className={`text-sm font-semibold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Commune Urbaine d'Antananarivo
                </p>

                <p
                  className={`text-xs flex items-center gap-1 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-[#D4AF37]" />©{" "}
                  {new Date().getFullYear()} {t("footer.rights")}
                </p>
              </div>
            </div>

            {/* Numéro vert CUA - 147 */}
            <a
              href="tel:147"
              title={t("footer.greenNumber")}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                darkMode
                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                  : "bg-slate-50 border-slate-200 hover:bg-green-50 hover:border-green-300"
              }`}
            >
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-green-500 group-hover:bg-green-400 transition-colors duration-200 shadow-md flex-shrink-0">
                <PhoneIcon className="h-4 w-4 text-white" />
              </span>
              <span className="flex flex-col leading-tight text-center md:text-left">
                <span
                  className={`text-[11px] uppercase tracking-wider font-medium ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {t("footer.greenNumber")}
                </span>
                <span className="text-lg md:text-xl font-bold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 text-[#0F172A] dark:text-slate-100">
                  147
                </span>
              </span>
            </a>

            {/* Réseaux sociaux */}
            <div className={`flex items-center gap-3 `}>
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  aria-label={social.name}
                  className={`group relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-transparent hover:ring-[#D4AF37]/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${social.bg} ${social.hoverBg}`}
                >
                  <svg
                    className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
            {/* Version */}
            <div
              className={`text-sm font-medium ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Version <span className="font-bold text-[#D4AF37]">2.0</span>
              <div className="mt-2">
                <a
                  href="https://activicode.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  <img
                    className="h-2.5 w-20.1 "
                    src="/doleance/images/logo.png"
                    alt=""
                    srcset=""
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
