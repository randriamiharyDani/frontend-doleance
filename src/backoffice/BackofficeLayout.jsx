import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import i18n from "../i18n";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import socket from "../config/socket";
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  ClockIcon,
  TrashIcon,
  TagIcon,
  PhoneIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../components/backoffice/Navbar";

function BackofficeLayout() {
  const { user, loading, hasPermission } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [isCurrentUserOnline, setIsCurrentUserOnline] = useState(false);

  // L'espace admin est affiché uniquement en français (pas de malagasy).
  // La préférence de langue du site public n'est pas écrasée : la détection
  // ne met pas le cache en mémoire pendant le back-office, puis la langue
  // d'origine est restaurée à la sortie.
  // IMPORTANT : utiliser l'instance singleton importée ci-dessus et NON
  // `useTranslation().i18n` (wrapper dont l'identité change à chaque
  // changement de langue => effet/cleanup en boucle infinie).
  useEffect(() => {
    const previousLanguage = i18n.language;
    if (previousLanguage && previousLanguage.startsWith("fr")) return;

    const detector = i18n.services && i18n.services.languageDetector;
    const cacheUserLanguage = detector && detector.cacheUserLanguage && detector.cacheUserLanguage.bind(detector);
    if (detector && cacheUserLanguage) {
      detector.cacheUserLanguage = () => {};
    }
    i18n.changeLanguage("fr");

    return () => {
      if (detector && cacheUserLanguage) detector.cacheUserLanguage = cacheUserLanguage;
      if (previousLanguage) i18n.changeLanguage(previousLanguage);
    };
  }, [i18n]);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const userId = user?.id_utilisateur || user?.id;

  useEffect(() => {
    if (userId) {
      const checkOnline = () => {
        setIsCurrentUserOnline(socket.isUserOnline(userId));
      };
      checkOnline();
      socket.setOnlineUsersCallback(checkOnline);
      return () => socket.setOnlineUsersCallback(null);
    }
  }, [userId]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Auth guard : redirection si non connecté
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Route restriction pour les Directions
  const userRole = user?.role || user?.nom_role || user?.role_nom;
  const isSuperAdmin = userRole === "administrateur_systeme";

  // Gating par permissions : chaque route est accessible si hasPermission(module, action)
  // (hasPermission inclut le bypass des rôles admin → le role-based reste fonctionnel)
  const routePermissionMap = [
    { prefix: "/backoffice/users", module: "users", action: "view" },
    { prefix: "/backoffice/roles", module: "users", action: "manage_roles" },
    { prefix: "/backoffice/directions", module: "directions", action: "view_team" },
    { prefix: "/backoffice/direction/", module: "directions", action: "view_team" },
    { prefix: "/backoffice/transfert", module: "doleances", action: "transfer" },
    { prefix: "/backoffice/ajouter-doleance", module: "doleances", action: "create" },
    { prefix: "/backoffice/categories", module: "doleances", action: "update" },
  ];

  const deniedRoute = routePermissionMap.find(
    (r) => location.pathname.startsWith(r.prefix) && !hasPermission(r.module, r.action)
  );
  if (deniedRoute) {
    return <Navigate to="/backoffice/dashboard" replace />;
  }

  if (!isSuperAdmin && location.pathname.startsWith("/backoffice/corbeille")) {
    return <Navigate to="/backoffice/dashboard" replace />;
  }

  // const isActive = (path) => {
  //   return (
  //     location.pathname === path || location.pathname.startsWith(path + "/")
  //   );
  // };

  const isActive = (path) => {
  return location.pathname === path || location.pathname.startsWith(path + "/");
};

  const isSubMenuActive = (subItems) => {
    return subItems.some((sub) => isActive(sub.href));
  };

// const isSubMenuActive = (subItems) => {
//   return subItems.some((item) =>
//     location.pathname === item.href ||
//     location.pathname.startsWith(item.href + "/")
//   );
// };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const navigation = [
    { name: "Tableau de bord", href: "/backoffice/dashboard", icon: HomeIcon },
    {
      name: "Doléances",
      href: "/backoffice/doleances",
      icon: DocumentTextIcon,
    },
    ...(hasPermission('doleances', 'transfer') ? [
      { name: "Transfert", href: "/backoffice/transfert", icon: ArrowPathIcon },
    ] : []),
  ];

  const adminSubItems = [
    {
      name: "Directions",
      href: "/backoffice/directions",
      icon: BuildingOfficeIcon,
      module: "directions",
      action: "view_team",
    },
    {
      name: "Utilisateurs",
      href: "/backoffice/users",
      icon: UserGroupIcon,
      module: "users",
      action: "view",
    },
    { name: "Rôles", href: "/backoffice/roles", icon: ShieldCheckIcon, module: "users", action: "manage_roles" },
    { name: "Catégories", href: "/backoffice/categories", icon: TagIcon, module: "doleances", action: "update" },
  ].filter((sub) => hasPermission(sub.module, sub.action));

  const isAdminRole = ['administrateur_systeme', 'administrateur', 'agent_central'].includes(userRole);

  const secondaryNavigation = [
    ...(adminSubItems.length > 0 ? [{
      name: "Administration",
      icon: BuildingOfficeIcon,
      subItems: adminSubItems,
    }] : []),
    {
      name: "Statistiques",
      href: "/backoffice/statistiques",
      icon: ChartBarIcon,
    },
    ...(isAdminRole ? [{
      name: "Mots interdits",
      href: "/backoffice/mots-interdits",
      icon: NoSymbolIcon,
    }] : []),
  ];

  // Auto-ouvrir les sous-menus dont un enfant est actif
  useEffect(() => {
    secondaryNavigation.forEach((item) => {
      if (item.subItems && isSubMenuActive(item.subItems)) {
        setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  // La navigation est déjà filtrée par permissions (voir adminSubItems/secondaryNavigation)
  const filteredSecondaryNavigation = secondaryNavigation;

  // ---- Styles sidebar (comme le DU : bleu nuit, sans bordure, jaune sur l'actif) ----
  const itemBase =
    "group relative flex items-center gap-3 min-h-[2.75rem] py-1 pl-1.5 pr-3 rounded-[14px] text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc72c]";

  const itemClass = (active) =>
    `${itemBase} ${
      active
        ? "bg-white/15 text-white font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),0_6px_16px_rgba(5,12,40,0.3)]"
        : "text-[#cfdcff] font-medium hover:bg-white/10 hover:text-white"
    }`;

  // Barre jaune à gauche (visible seulement sur l'actif)
  const barClass = (active) =>
    `absolute -left-1 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-[#ffc72c] transition-all duration-200 ${
      active ? "h-6" : "h-0"
    }`;

  const tileClass = (active) =>
    `grid place-items-center flex-shrink-0 h-9 w-9 rounded-[10px] transition-all duration-150 group-active:scale-95 ${
      active
        ? "bg-[#ffc72c] text-[#13214f] shadow-[0_2px_8px_rgba(255,199,44,0.35)]"
        : "bg-white/[0.08] text-[#cfdcff] group-hover:bg-white/[0.16] group-hover:text-white"
    }`;

  const subItemClass = (active) =>
    `group relative flex items-center gap-2.5 min-h-[2.4rem] py-1 pl-1.5 pr-3 rounded-xl text-[0.82rem] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc72c] ${
      active
        ? "bg-white/15 text-white font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]"
        : "text-[#cfdcff] font-medium hover:bg-white/10 hover:text-white"
    }`;

  const subTileClass = (active) =>
    `grid place-items-center flex-shrink-0 h-7 w-7 rounded-lg transition-colors duration-150 ${
      active
        ? "bg-[#ffc72c] text-[#13214f]"
        : "bg-white/[0.08] text-[#cfdcff] group-hover:bg-white/[0.16] group-hover:text-white"
    }`;

  const labelClass =
    "truncate transition-transform duration-150 group-hover:translate-x-0.5";

  const sectionLabel =
    "px-1 pb-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#8fb0ff]";

  // Bouton « Doléance téléphonique » : style à part (fond + bordure jaune)
  const isAjoutActive = location.pathname === "/backoffice/ajouter-doleance";

  const ajoutClass = `group flex items-center justify-center gap-2 min-h-[3rem] px-4 py-2.5 mt-4 rounded-[14px] border-2 border-[#ffc72c] text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10307f] ${
    isAjoutActive
      ? "bg-[#ffc72c] text-[#13214f] shadow-[0_6px_16px_rgba(5,12,40,0.35)]"
      : "bg-[#ffc72c]/15 text-white shadow-[0_4px_12px_rgba(5,12,40,0.25)] hover:bg-[#ffc72c] hover:text-[#13214f] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(255,199,44,0.3)] active:scale-[0.98]"
  }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0a1a47]/60 z-20 transition-opacity duration-300 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Navigation principale"
        className={`no-print fixed top-0 left-0 z-30 h-full w-72 lg:w-60 xl:w-64 2xl:w-72 isolate overflow-hidden flex flex-col
          border-r border-white/10 shadow-[4px_0_24px_rgba(10,26,71,0.28)]
          transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          darkMode
            ? "bg-[radial-gradient(120%_60%_at_0%_0%,rgba(96,165,250,0.2)_0%,transparent_55%),radial-gradient(100%_45%_at_100%_100%,rgba(255,199,44,0.08)_0%,transparent_60%),linear-gradient(180deg,#0f2a6b_0%,#0a1a47_55%,#070f2c_100%)]"
            : "bg-[radial-gradient(120%_60%_at_0%_0%,rgba(96,165,250,0.3)_0%,transparent_55%),radial-gradient(100%_45%_at_100%_100%,rgba(255,199,44,0.12)_0%,transparent_60%),linear-gradient(180deg,#10307f_0%,#0f2a6b_55%,#0a1a47_100%)]"
        }`}
      >
        {/* Texture de grille (plan) en filigrane */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 70%)",
            maskImage: "linear-gradient(180deg, #000 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex-shrink-0 flex items-center gap-3 px-4 pt-5 pb-4 border-b border-white/[0.14]">
          {/* Filet jaune sous la marque */}
          <span className="absolute left-4 -bottom-px h-0.5 w-11 rounded-full bg-[#ffc72c]" />

          <span className="grid place-items-center flex-shrink-0 h-[70px] w-[60px] p-1.5 rounded-[14px] bg-white/10 border border-white/[0.22] backdrop-blur-sm shadow-[0_6px_16px_rgba(5,12,40,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]">
            <img
              src={`${import.meta.env.BASE_URL}images/logo_CUA.svg`}
              alt="Logo CUA"
              className="h-full w-full object-contain drop-shadow"
            />
          </span>

          {/* Texte */}
          <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8fb0ff] leading-tight">
              Commune Urbaine d'Antananarivo
            </span>
            <h1 className="text-white font-bold text-xl leading-none tracking-[0.06em] font-serif uppercase">
              Doléances
            </h1>
          </div>

          {/* Bouton fermeture (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex-shrink-0 grid place-items-center h-9 w-9 rounded-xl text-[#cfdcff] hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc72c]"
            aria-label="Fermer le menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
    <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pt-3 pb-6 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.22)_transparent]">
  <p className={sectionLabel}>Menu</p>
  <div className="space-y-1">
    {navigation.map((item) => (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => isMobile && setSidebarOpen(false)}
        aria-current={isActive(item.href) ? "page" : undefined}
        className={itemClass(isActive(item.href))}
      >
        <span className={barClass(isActive(item.href))} />

        <span className={tileClass(isActive(item.href))}>
          <item.icon className="h-5 w-5" />
        </span>

        <span className={labelClass}>{item.name}</span>
      </Link>
    ))}
    </div>

  {/* Bouton Ajouter doléance - permission create */}
  {hasPermission('doleances', 'create') && (
    <Link
      to="/backoffice/ajouter-doleance"
      onClick={() => isMobile && setSidebarOpen(false)}
      aria-current={isAjoutActive ? "page" : undefined}
      className={ajoutClass}
    >
      <PlusCircleIcon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">Doléance téléphonique</span>
    </Link>
  )}

  {/* Séparation */}
  <div className="my-4 border-t border-white/[0.14]"></div>

  <p className={sectionLabel}>Gestion</p>
  <div className="space-y-1">
    {filteredSecondaryNavigation.map((item) =>
      item.subItems ? (
        <div key={item.name} className="space-y-1">

          <button
            onClick={() => toggleMenu(item.name)}
            aria-expanded={!!openMenus[item.name]}
            className={`${itemClass(isSubMenuActive(item.subItems))} w-full justify-between text-left ${
              openMenus[item.name] && !isSubMenuActive(item.subItems)
                ? "!bg-white/10 !text-white"
                : ""
            }`}
          >
            <span className={barClass(isSubMenuActive(item.subItems))} />

            <span className="flex items-center gap-3 min-w-0">
              <span className={tileClass(isSubMenuActive(item.subItems))}>
                <item.icon className="h-5 w-5" />
              </span>
              <span className="truncate">{item.name}</span>
            </span>

            <ChevronDownIcon
              className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                openMenus[item.name] ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenus[item.name] && (
            <div className="ml-5 space-y-1 border-l-2 border-white/15 pl-3">

              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  aria-current={isActive(subItem.href) ? "page" : undefined}
                  className={subItemClass(isActive(subItem.href))}
                >
                  <span className={subTileClass(isActive(subItem.href))}>
                    <subItem.icon className="h-4 w-4" />
                  </span>

                  <span className="truncate">{subItem.name}</span>
                </Link>
              ))}

            </div>
          )}

        </div>

      ) : (

        <Link
          key={item.name}
          to={item.href}
          onClick={() => isMobile && setSidebarOpen(false)}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={itemClass(isActive(item.href))}
        >
          <span className={barClass(isActive(item.href))} />

          <span className={tileClass(isActive(item.href))}>
            <item.icon className="h-5 w-5" />
          </span>

          <span className={labelClass}>{item.name}</span>
        </Link>

      )
    )}
  </div>

  {/* Historique */}
  <div className="mt-1">
    <Link
      to="/backoffice/historique"
      onClick={() => isMobile && setSidebarOpen(false)}
      aria-current={isActive("/backoffice/historique") ? "page" : undefined}
      className={itemClass(isActive("/backoffice/historique"))}
    >
      <span className={barClass(isActive("/backoffice/historique"))} />
      <span className={tileClass(isActive("/backoffice/historique"))}>
        <ClockIcon className="h-5 w-5" />
      </span>
      <span className={labelClass}>Historiques</span>
    </Link>
  </div>



  {/* Appels citoyens — admin / agent_central uniquement */}
 {/*   
  {['administrateur_systeme', 'administrateur', 'agent_central'].includes(userRole) && (
  <div className="mt-4">
    <Link
      to="/backoffice/appels-citoyens"
      onClick={() => isMobile && setSidebarOpen(false)}
      className={`relative w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
        isActive("/backoffice/appels-citoyens")
          ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20"
          : "text-white/70 hover:bg-[#D4AF37]/20 hover:text-white hover:shadow-lg hover:shadow-[#D4AF37]/25"
      }`}
    >
      {isActive("/backoffice/appels-citoyens") && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
      )}
      <PhoneIcon
        className={`h-5 w-5 mr-3 flex-shrink-0 ${
          isActive("/backoffice/appels-citoyens")
            ? "text-white"
            : "text-white/40 group-hover:text-white"
        }`}
      />
      <span className="text-sm font-medium">
        Historique des appels
      </span>
    </Link>
  </div>
  )} */}

  {/* Paramètres */}
  <div className="mt-1">
    <Link
      to="/backoffice/settings"
      onClick={() => isMobile && setSidebarOpen(false)}
      aria-current={isActive("/backoffice/settings") ? "page" : undefined}
      className={itemClass(isActive("/backoffice/settings"))}
    >
      <span className={barClass(isActive("/backoffice/settings"))} />
      <span className={tileClass(isActive("/backoffice/settings"))}>
        <Cog6ToothIcon className="h-5 w-5" />
      </span>
      <span className={labelClass}>Paramètres</span>
    </Link>
  </div>

    </nav>

        {/* Footer */}
        {/* Infos utilisateur */}
        <div className="flex-shrink-0 z-10 px-4 py-3 border-t border-white/[0.14]">
          <div className="flex items-center gap-3 bg-white/[0.08] rounded-[14px] p-2.5">
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#ffc72c] shadow-[0_2px_8px_rgba(255,199,44,0.35)] ring-2 ring-white/50">
              <span className="text-[#13214f] text-sm font-extrabold uppercase">
                {user?.prenom?.charAt(0) || "U"}
                {user?.nom?.charAt(0) || "?"}
              </span>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0f2a6b] ${isCurrentUserOnline ? 'bg-emerald-400' : 'bg-gray-400'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-semibold truncate">
                {user?.prenom || "Utilisateur"} {user?.nom || ""}
              </p>

              <p className="text-xs text-[#a9bdf0] capitalize truncate">
                {user?.role?.replace(/_/g, " ") || "Chargement..."}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isCurrentUserOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`text-[10px] font-medium ${isCurrentUserOnline ? 'text-emerald-300' : 'text-[#a9bdf0]'}`}>
                  {isCurrentUserOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:pl-60 xl:pl-64 2xl:pl-72 h-screen flex flex-col overflow-hidden min-w-0">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-hidden flex flex-col w-full max-w-full min-w-0">
          <div className="flex-1 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Corbeille Button - Super Admin only */}
      {/* {isSuperAdmin && (
        <button
          onClick={() => navigate("/backoffice/corbeille")}
          title="Corbeille"
          className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group backdrop-blur-md ${
            isActive("/backoffice/corbeille")
              ? "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/40 ring-2 ring-[#D4AF37]/30"
              : "bg-white/80 text-slate-400 hover:bg-[#D4AF37] hover:text-white shadow-lg shadow-slate-900/10 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-[#D4AF37] dark:shadow-black/30"
          }`}
        >
          <TrashIcon className="w-[18px] h-[18px] stroke-[2]" />
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl translate-x-1 group-hover:translate-x-0">
            Corbeille
          </span>
        </button>
      )} */}
    </div>
  );
}

export default BackofficeLayout;