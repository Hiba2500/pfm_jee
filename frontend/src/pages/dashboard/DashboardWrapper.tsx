import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import DirectorDashboard from "./DirectorDashboard";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";
import AnnualReportPanel from "./AnnualReportPanel";
import { User } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import {
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  Shield,
  Layers,
  ClipboardList,
  DollarSign,
  Handshake,
  FileCheck2,
  Settings,
  Users,
  Wrench,
  Database,
  LogOut,
  ChevronRight
} from "lucide-react";
import { logout } from "../../lib/api";

export default function DashboardWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();

  const getInitialTab = () => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      const sub = segments[1];
      if (sub !== "director" && sub !== "admin") return sub;
    }
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user: User | null = null;
  try {
    user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
    }
  }, [token, user, navigate]);

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      const sub = segments[1];
      if (sub !== "director" && sub !== "admin") {
        setActiveTab(sub);
      }
    }
  }, [location.pathname]);

  if (!user) return null;

  const isDirector = user.role === "DIRECTOR";
  const isAdmin = user.role === "ADMIN";
  const isPhd = user.role === "PHD_STUDENT" || user.status === "PHD_STUDENT";
  const isAssociate = user.role === "ASSOCIATED" || user.status === "ASSOCIATED";

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800 flex flex-col justify-between p-4">
        <div className="space-y-6">
          {/* User profile card */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow shrink-0">
              {(user.firstName?.charAt(0) || "U")}{(user.lastName?.charAt(0) || "")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-mono px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded font-bold uppercase tracking-wider">
                  {user.role}
                </span>
                {user.status && user.status !== "PERMANENT" && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-semibold">
                    {user.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              {lang === "fr" ? "Espace de Travail" : "Workspace"}
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>
                {isDirector
                  ? "Tableau de Bord Directeur"
                  : isAdmin
                  ? "Administration Système"
                  : isPhd
                  ? "Mon Espace Doctorant"
                  : "Mon Espace Chercheur"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{lang === "fr" ? "Profil & Historique" : "Profile & History"}</span>
            </button>

            {!isAdmin && (
              <button
                onClick={() => setActiveTab("publications")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === "publications"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{lang === "fr" ? "Mes Publications" : "My Publications"}</span>
              </button>
            )}

            {/* Modules for active researchers (excl. PhD / Associate per Section 2.2C) */}
            {!isPhd && !isAssociate && !isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab("equipment")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "equipment"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{lang === "fr" ? "Besoins en Matériel" : "Equipment Needs"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("documents")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "documents"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{lang === "fr" ? "Documents & Rapports" : "Documents & Reports"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("messages")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "messages"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{lang === "fr" ? "Messagerie Interne" : "Internal Messages"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("conventions")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "conventions"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Handshake className="w-4 h-4" />
                  <span>{lang === "fr" ? "Conventions du Labo" : "Lab Conventions"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("meetings")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "meetings"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{lang === "fr" ? "Procès-Verbaux (PV)" : "Meeting Minutes"}</span>
                </button>
              </>
            )}

            {/* Modules for Director (PDF §5.2, §6, §11, §14, §16, §17) */}
            {isDirector && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-3 pt-4 mb-2">
                  {lang === "fr" ? "Module Directeur" : "Director Management"}
                </div>

                <button
                  onClick={() => setActiveTab("applications")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "applications"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Demandes d'Adhésion" : "Membership Requests"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("governance")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "governance"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Mandats & Gouvernance" : "Mandates & Governance"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("events")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "events"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Événements Scientifiques" : "Scientific Events"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("equipment")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "equipment"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Matériel & Inventaire" : "Equipment & Inventory"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("conventions")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "conventions"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Handshake className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Conventions Partenaires" : "Conventions"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("meetings")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "meetings"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Procès-Verbaux (PV)" : "Meeting Minutes"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("report")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "report"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Rapport Annuel" : "Annual Report"}</span>
                </button>

                <div className="pt-2 pb-1 border-t border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {lang === "fr" ? "Espace Personnel" : "Personal Space"}
                </div>

                <button
                  onClick={() => setActiveTab("documents")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "documents"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>{lang === "fr" ? "Documents & Rapports" : "Documents & Reports"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("messages")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "messages"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>{lang === "fr" ? "Messagerie Interne" : "Internal Messages"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("publications")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "publications"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{lang === "fr" ? "Mes Publications" : "My Publications"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "profile"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>{lang === "fr" ? "Mon Profil & Sécurité" : "My Profile & Security"}</span>
                </button>
              </>
            )}

            {/* Modules for Administrator (PDF §5.1) */}
            {isAdmin && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-3 pt-4 mb-2">
                  {lang === "fr" ? "Administration Système" : "System Administration"}
                </div>

                <button
                  onClick={() => setActiveTab("accounts")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "accounts" || activeTab === "dashboard"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Comptes Utilisateurs" : "User Accounts"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "settings"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Paramétrage LIAS" : "System Settings"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("maintenance")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "maintenance"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Wrench className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Maintenance & Diagnostic" : "Maintenance"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "audit"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>{lang === "fr" ? "Journal d'Audit" : "Audit Log"}</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Bottom logout */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === "fr" ? "Déconnexion" : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {isDirector && activeTab === "report" ? (
          <AnnualReportPanel />
        ) : isDirector && (activeTab === "profile" || activeTab === "publications" || activeTab === "documents" || activeTab === "messages") ? (
          <MemberDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : isDirector ? (
          <DirectorDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : isAdmin && activeTab === "profile" ? (
          <MemberDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : isAdmin ? (
          <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          <MemberDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </main>
    </div>
  );
}
