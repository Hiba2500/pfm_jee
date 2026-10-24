import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { logout } from "../../lib/api";
import { User } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import LiasLogo from "../common/LiasLogo";
import GlobalSearchModal from "../common/GlobalSearchModal";
import {
  Globe,
  Bell,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Search
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user: User | null = null;
  try {
    user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  // Ctrl+K / Cmd+K listener for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadNotifications = () => {
    if (token) {
      fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(notifs => {
          if (Array.isArray(notifs)) {
            setNotificationsList(notifs.slice(0, 10));
            const unread = notifs.filter((n: any) => !n.read).length;
            setUnreadNotifs(unread);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token, location.pathname]);

  const markNotifAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/teams", label: t("nav.teams") },
    { to: "/members", label: t("nav.members") },
    { to: "/publications", label: t("nav.publications") },
    { to: "/events", label: t("nav.events") },
    { to: "/calendar", label: t("nav.calendar") },
  ];

  const getDashboardLink = () => {
    if (!user) return "/login";
    return "/dashboard";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "DIRECTOR": return lang === "fr" ? "Directeur" : "Director";
      case "VICE_DIRECTOR": return lang === "fr" ? "Vice-Directeur" : "Vice-Director";
      case "TEAM_LEADER": return lang === "fr" ? "Chef d'Équipe" : "Team Leader";
      case "PHD_STUDENT": return lang === "fr" ? "Doctorant" : "PhD Student";
      case "ASSOCIATED": return lang === "fr" ? "Membre Associé" : "Associated";
      case "ADMIN": return lang === "fr" ? "Administrateur" : "Admin";
      default: return lang === "fr" ? "Membre Permanent" : "Permanent Member";
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="flex items-center">
                  <LiasLogo className="h-9 w-auto" variant="icon" theme="dark" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black tracking-tight flex items-center gap-1.5 text-white">
                    LIAS
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-800 rounded font-semibold tracking-wider uppercase hidden sm:inline-block">
                      FSBM • UH2C
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium tracking-tight truncate max-w-[280px] hidden md:block">
                    Laboratoire d'Intelligence Artificielle et Systèmes
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1 pl-4 border-l border-slate-800">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                        isActive
                          ? "bg-slate-800 text-white font-bold"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Global Search trigger (Section 18) */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors shadow-xs"
                title="Recherche globale LIAS (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline text-[11px]">{lang === "fr" ? "Recherche..." : "Search..."}</span>
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-900 border border-slate-700 rounded text-slate-400">
                  Ctrl+K
                </kbd>
              </button>

              {/* Language toggle FR / EN */}
              <button
                onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                title={lang === "fr" ? "Changer de langue" : "Switch language"}
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold uppercase text-[11px]">{lang}</span>
              </button>

              {token && user ? (
                <div className="flex items-center gap-3">
                  {/* Notifications Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setNotifsOpen(prev => !prev)}
                      className="relative p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotifs > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                          {unreadNotifs}
                        </span>
                      )}
                    </button>

                    {notifsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-2 text-slate-900 animate-in fade-in">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
                            Notifications ({unreadNotifs} non lues)
                          </span>
                          <button
                            onClick={() => setNotifsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {notificationsList.length === 0 ? (
                            <p className="px-4 py-6 text-center text-xs text-slate-400">
                              Aucune notification récente.
                            </p>
                          ) : (
                            notificationsList.map(n => (
                              <div
                                key={n.id}
                                className={`p-3 text-xs flex items-start gap-2.5 transition-colors ${
                                  n.read ? "bg-white opacity-70" : "bg-blue-50/50 font-medium"
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-slate-300" : "bg-blue-500"}`}></span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-900 leading-tight">{n.title}</p>
                                  <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                    {new Date(n.date || n.createdAt).toLocaleString("fr-FR")}
                                  </span>
                                </div>
                                {!n.read && (
                                  <button
                                    onClick={() => markNotifAsRead(n.id)}
                                    className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
                                    title="Marquer comme lu"
                                  >
                                    Lu
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50">
                          <Link
                            to={getDashboardLink()}
                            onClick={() => setNotifsOpen(false)}
                            className="text-[11px] font-bold text-blue-600 hover:underline"
                          >
                            Voir toutes les alertes au Tableau de Bord →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dashboard button */}
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{t("nav.dashboard")}</span>
                  </Link>

                  {/* User info */}
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-right">
                    <div className="hidden xl:block">
                      <p className="text-xs font-semibold text-white leading-tight">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                        {getRoleBadge(user.role)}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                      {(user.firstName?.charAt(0) || "U")}{(user.lastName?.charAt(0) || "")}
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                    title={t("nav.logout")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/apply"
                    className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded border border-slate-700 transition-colors"
                  >
                    {t("nav.apply")}
                  </Link>
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    {t("nav.login")}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-slate-400 hover:text-white"
                title="Rechercher"
              >
                <Search className="w-5 h-5 text-blue-400" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-3">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              {token && user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t("nav.dashboard")}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-center py-2 text-rose-400 hover:bg-rose-950/40 rounded text-xs font-bold uppercase"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-center py-2 border border-slate-700 text-slate-200 rounded text-xs font-bold"
                  >
                    {t("nav.apply")}
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-center py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase"
                  >
                    {t("nav.login")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
