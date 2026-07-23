import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
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
} from "@heroicons/react/24/outline";
import Navbar from "../components/backoffice/Navbar";

function BackofficeLayout() {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [isCurrentUserOnline, setIsCurrentUserOnline] = useState(false);

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

  // Vérifier si l'utilisateur actuel est en ligne
  useEffect(() => {
    if (user?.id) {
      const checkOnline = () => {
        setIsCurrentUserOnline(socket.isUserOnline(user.id));
      };
      checkOnline();
      socket.setOnlineUsersCallback(checkOnline);
      return () => socket.setOnlineUsersCallback(null);
    }
  }, [user?.id]);

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
  const userRole = user?.role || user?.nom_role;
  const isAdmin =
    userRole === "administrateur_systeme" ||
    userRole === "administrateur" ||
    userRole === "agent_central";
  const isSuperAdmin = userRole === "administrateur_systeme";

  const adminOnlyRoutes = [
    "/backoffice/users",
    "/backoffice/roles",
    "/backoffice/directions",
    "/backoffice/direction/",
    "/backoffice/transfert",
    "/backoffice/ajouter-doleance",
    "/backoffice/categories",
  ];

  const superAdminOnlyRoutes = [
    "/backoffice/corbeille",
  ];

  if (!isAdmin && adminOnlyRoutes.some(route => location.pathname.startsWith(route))) {
    return <Navigate to="/backoffice/dashboard" replace />;
  }

  if (!isSuperAdmin && superAdminOnlyRoutes.some(route => location.pathname.startsWith(route))) {
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
    ...(isAdmin ? [
      { name: "Transfert", href: "/backoffice/transfert", icon: ArrowPathIcon },
    ] : []),
  ];

  const secondaryNavigation = [
    ...(isAdmin ? [{
      name: "Administration",
      icon: BuildingOfficeIcon,
      subItems: [
        {
          name: "Directions",
          href: "/backoffice/directions",
          icon: BuildingOfficeIcon,
        },
        {
          name: "Utilisateurs",
          href: "/backoffice/users",
          icon: UserGroupIcon,
        },
        { name: "Rôles", href: "/backoffice/roles", icon: ShieldCheckIcon },
        { name: "Catégories", href: "/backoffice/categories", icon: TagIcon },
      ],
    }] : []),
    {
      name: "Statistiques",
      href: "/backoffice/statistiques",
      icon: ChartBarIcon,
    },
  ];

  // Auto-ouvrir les sous-menus dont un enfant est actif
  useEffect(() => {
    secondaryNavigation.forEach((item) => {
      if (item.subItems && isSubMenuActive(item.subItems)) {
        setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  // Filtrer les éléments de navigation selon les permissions
  const filteredSecondaryNavigation = secondaryNavigation.filter((item) => {
    if (item.subItems) {
      const filteredSubItems = item.subItems.filter((subItem) => {
        if (subItem.name === "Utilisateurs" || subItem.name === "Rôles") {
          return isAdmin;
        }
        return true;
      });
      return filteredSubItems.length > 0;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 lg:w-72 shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          darkMode
            ? "bg-slate-900"
            : "bg-gradient-to-b from-[#0B1A33] to-[#1A365D]"
        }`}
      >
        {/* Logo */}
        {/* Logo */}
        <div className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b border-white/10 bg-opacity-95 backdrop-blur-sm">
          {/* Logo */}
          <div className="flex-shrink-0 ">
            <img
              src="/images/logo_CUA.svg"
              alt="Logo CUA"
              className="h-20 w-20 object-contain rounded-2xl"
            />
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-4xl sm:text-lg tracking-tight leading-tight">
              CUA
            </h1>
            <p className="text-white/60 text-xl sm:text-sm font-medium">
              <span className="block">Commune Urbaine</span>
              <span className="block">d'Antananarivo</span>
            </p>
          </div>

          {/* Bouton fermeture (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#D4AF37] flex-shrink-0"
            aria-label="Fermer le menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
   <nav className="p-3 pb-20">
  <div className="space-y-1">
    {navigation.map((item) => (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => isMobile && setSidebarOpen(false)}
        className={`relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive(item.href)
            ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20"
            : "text-white/70 hover:bg-[#D4AF37]/20 hover:text-white hover:shadow-lg hover:shadow-[#D4AF37]/25"
        }`}
      >
        {isActive(item.href) && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
        )}

        <item.icon
          className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
            isActive(item.href)
              ? "text-white"
              : "text-white/40 group-hover:text-white"
          }`}
        />

        <span className="text-sm font-medium">
          {item.name}
        </span>
      </Link>
    ))}
    </div>

  {/* Bouton Ajouter doléance - Admin only */}
  {isAdmin && (
    <Link
      to="/backoffice/ajouter-doleance"
      onClick={() => isMobile && setSidebarOpen(false)}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 mt-3 ${
        location.pathname === "/backoffice/ajouter-doleance"
          ? "bg-white text-blue-600 shadow-white/20 scale-[1.02] dark:bg-slate-800 dark:text-blue-400"
          : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-[1.02]"
      }`}
    >
      <PlusCircleIcon className="h-5 w-5" />
      Doléance téléphonique
    </Link>
  )}

  {/* Séparation */}
  <div className="my-4 border-t border-white/10"></div>


  <div className="space-y-1">
    {filteredSecondaryNavigation.map((item) =>
      item.subItems ? (
        <div key={item.name} className="space-y-1">

          <button
            onClick={() => toggleMenu(item.name)}
            className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              openMenus[item.name] || isSubMenuActive(item.subItems)
                ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20"
                : "text-white/70 hover:bg-[#D4AF37]/20 hover:text-white hover:shadow-lg hover:shadow-[#D4AF37]/25"
            }`}
          >

            {(openMenus[item.name] ||
              isSubMenuActive(item.subItems)) && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
            )}


            <div className="flex items-center">

              <item.icon
                className={`h-5 w-5 mr-3 flex-shrink-0 ${
                  openMenus[item.name] ||
                  isSubMenuActive(item.subItems)
                    ? "text-white"
                    : "text-white/40 group-hover:text-white"
                }`}
              />

              <span className="text-sm font-medium">
                {item.name}
              </span>

            </div>


            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-200 ${
                openMenus[item.name]
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>



          {openMenus[item.name] && (
            <div className="ml-4 space-y-1 border-l-2 border-white/10 pl-3">

              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`relative flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(subItem.href)
                      ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20"
                      : "text-white/60 hover:bg-[#D4AF37]/20 hover:text-white hover:shadow-md hover:shadow-[#D4AF37]/20"
                  }`}
                >

                  {isActive(subItem.href) && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-white rounded-r-full" />
                  )}


                  <subItem.icon
                    className="h-4 w-4 mr-3 flex-shrink-0"
                  />

                  <span className="text-sm">
                    {subItem.name}
                  </span>

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
          className={`relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            isActive(item.href)
              ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20"
              : "text-white/70 hover:bg-[#D4AF37]/20 hover:text-white hover:shadow-lg hover:shadow-[#D4AF37]/25"
          }`}
        >

          {isActive(item.href) && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
          )}


          <item.icon
            className={`h-5 w-5 mr-3 flex-shrink-0 ${
              isActive(item.href)
                ? "text-white"
                : "text-white/40 group-hover:text-white"
            }`}
          />


          <span className="text-sm font-medium">
            {item.name}
          </span>

        </Link>

      )
    )}
  </div>

  {/* Historique */}
  <div className="mt-4">
    <Link
      to="/backoffice/historique"
      onClick={() => isMobile && setSidebarOpen(false)}
      className={`relative w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
        isActive("/backoffice/historique")
          ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20"
          : "text-white/70 hover:bg-[#D4AF37]/20 hover:text-white hover:shadow-lg hover:shadow-[#D4AF37]/25"
      }`}
    >
      {isActive("/backoffice/historique") && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
      )}
      <ClockIcon
        className={`h-5 w-5 mr-3 flex-shrink-0 ${
          isActive("/backoffice/historique")
            ? "text-white"
            : "text-white/40 group-hover:text-white"
        }`}
      />
      <span className="text-sm font-medium">
        Historique
      </span>
    </Link>
  </div>



  {/* Paramètres */}
  <div className="mt-4">

    <Link
      to="/backoffice/settings"
      onClick={() => isMobile && setSidebarOpen(false)}
      className={`relative w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
        isActive("/backoffice/settings")
          ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20"
          : "text-white/70 hover:bg-[#D4AF37]/20 hover:text-white hover:shadow-lg hover:shadow-[#D4AF37]/25"
      }`}
    >

      {isActive("/backoffice/settings") && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
      )}


      <Cog6ToothIcon
        className={`h-5 w-5 mr-3 flex-shrink-0 ${
          isActive("/backoffice/settings")
            ? "text-white"
            : "text-white/40 group-hover:text-white"
        }`}
      />


      <span className="text-sm font-medium">
        Paramètres
      </span>

    </Link>

  </div>



</nav>

        {/* Footer */}
        {/* Infos utilisateur */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 border-t border-white/10 bg-opacity-95 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-white/10">
              <span className="text-white text-sm font-medium">
                {user?.prenom?.charAt(0) || "U"}
                {user?.nom?.charAt(0) || "?"}
              </span>
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1A33] ${isCurrentUserOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`} />
            </div>

            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {user?.prenom || "Utilisateur"} {user?.nom || ""}
              </p>

              <p className="text-xs text-white/50 capitalize truncate">
                {user?.role?.replace(/_/g, " ") || "Chargement..."}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isCurrentUserOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500 dark:bg-gray-400'}`} />
                <span className={`text-[10px] ${isCurrentUserOnline ? 'text-green-400' : 'text-white/40'}`}>
                  {isCurrentUserOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:pl-72 min-h-screen flex flex-col">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-full overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Corbeille Button - Super Admin only */}
      {isSuperAdmin && (
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
      )}
    </div>
  );
}

export default BackofficeLayout;
