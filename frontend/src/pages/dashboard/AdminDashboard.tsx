import { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";
import {
  Users,
  FileText,
  Calendar,
  ShieldCheck,
  Server,
  Database,
  CheckCircle2,
  Wrench,
  RefreshCw,
  Key,
  AlertTriangle,
  Plus,
  Search,
  Settings as SettingsIcon,
  Save,
  Lock,
  Cpu,
  HardDrive
} from "lucide-react";

interface AdminDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function AdminDashboard({ activeTab = "dashboard", setActiveTab }: AdminDashboardProps) {
  const { lang } = useLanguage();
  const [internalTab, setInternalTab] = useState<"accounts" | "settings" | "maintenance" | "audit">("accounts");

  // Synchronize with external activeTab if provided
  useEffect(() => {
    if (activeTab === "settings") setInternalTab("settings");
    else if (activeTab === "maintenance") setInternalTab("maintenance");
    else if (activeTab === "audit") setInternalTab("audit");
    else if (activeTab === "accounts" || activeTab === "dashboard") setInternalTab("accounts");
  }, [activeTab]);

  const [stats, setStats] = useState({ totalMembers: 0, totalPublications: 0, totalEvents: 0, pendingApplications: 0 });
  const [members, setMembers] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Settings state (Section 5.1 & 4.1)
  const [settings, setSettings] = useState<Record<string, string>>({
    labName: "Laboratoire d'Ingénierie, Systèmes et Applications (LIAS)",
    acronym: "LIAS",
    faculty: "Faculté des Sciences Ben M'Sik",
    university: "Université Hassan II de Casablanca",
    creationDate: "2014-09-01",
    accreditationNumber: "CED-FSBM-LIAS-2014",
    contactEmail: "contact@lias.ma",
    phone: "+212 522 70 46 71",
    address: "Avenue Cdt Driss El Harti, B.P 7955 Sidi Othmane, Casablanca",
    maxUploadSizeMb: "50",
    allowedExtensions: "pdf, doc, docx, zip, png, jpg"
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Maintenance state (Section 5.1)
  const [health, setHealth] = useState<any>(null);
  const [integrityReport, setIntegrityReport] = useState<any>(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // New user modal
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "MEMBER",
    status: "PERMANENT",
    title: "Chercheur",
    teamId: "1",
    password: "member123"
  });

  const load = () => {
    fetchApi("/stats").then(setStats).catch(console.error);
    fetchApi("/members").then(setMembers).catch(console.error);
    fetchApi("/audit?limit=25").then(setAudit).catch(console.error);
    fetchApi("/admin/settings").then(setSettings).catch(console.error);
    fetchApi("/admin/maintenance/health").then(setHealth).catch(console.error);
  };

  useEffect(load, []);

  // Section 8 : retraité = compte gelé ; ancien membre = compte désactivé (réactivable)
  const accountAction = async (id: string, action: "freeze" | "toggle-active") => {
    setMessage(null);
    try {
      const res = await fetchApi(`/members/${id}/${action}`, { method: "POST", body: JSON.stringify({}) });
      setMessage({ text: res.message || "Action exécutée avec succès.", type: "success" });
      load();
    } catch (e: any) {
      setMessage({ text: e.message || "Erreur lors de l'opération.", type: "error" });
    }
  };

  const handleResetPassword = async (id: string, userName: string) => {
    if (!window.confirm(`Confirmer la réinitialisation du mot de passe pour ${userName} ?`)) return;
    setMessage(null);
    try {
      const res = await fetchApi(`/admin/users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ password: "member123" })
      });
      setMessage({
        text: `Mot de passe réinitialisé pour ${userName}. Nouveau mot de passe temporaire : "member123"`,
        type: "success"
      });
      load();
    } catch (e: any) {
      setMessage({ text: e.message || "Erreur lors de la réinitialisation.", type: "error" });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      setMessage({ text: res.message || "Paramètres enregistrés avec succès.", type: "success" });
    } catch (e: any) {
      setMessage({ text: e.message || "Erreur lors de la sauvegarde des paramètres.", type: "error" });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleFlushCache = async () => {
    setMaintenanceLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi("/admin/maintenance/flush-cache", { method: "POST" });
      setMessage({ text: res.message || "Cache vidé avec succès.", type: "success" });
      fetchApi("/admin/maintenance/health").then(setHealth).catch(console.error);
    } catch (e: any) {
      setMessage({ text: e.message || "Erreur lors du flush de cache.", type: "error" });
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleIntegrityCheck = async () => {
    setMaintenanceLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi("/admin/maintenance/integrity-check", { method: "POST" });
      setIntegrityReport(res);
      setMessage({
        text: res.status === "OPTIMAL"
          ? "Contrôle d'intégrité achevé : Aucune anomalie détectée (100% Intègre)."
          : "Contrôle d'intégrité achevé avec des avertissements.",
        type: res.status === "OPTIMAL" ? "success" : "error"
      });
    } catch (e: any) {
      setMessage({ text: e.message || "Erreur lors du contrôle d'intégrité.", type: "error" });
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await fetchApi("/admin/users", {
        method: "POST",
        body: JSON.stringify(newUser)
      });
      setMessage({ text: `Compte créé avec succès pour ${newUser.firstName} ${newUser.lastName}.`, type: "success" });
      setShowCreateUser(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "MEMBER",
        status: "PERMANENT",
        title: "Chercheur",
        teamId: "1",
        password: "member123"
      });
      load();
    } catch (e: any) {
      setMessage({ text: e.message || "Erreur lors de la création du compte.", type: "error" });
    }
  };

  const filteredMembers = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.email} ${m.role} ${m.status}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono">
            Super-Administrateur Système
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {lang === "fr" ? "Administration Système & Supervision LIAS" : "System Administration"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion technique des comptes utilisateurs, paramétrage institutionnel et maintenance de la plateforme.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-mono font-bold text-slate-700">Système LIAS Opérationnel</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Comptes Utilisateurs</p>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalMembers}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Comptes actifs & répertoriés</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Publications Stockées</p>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalPublications}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Indexation active</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Événements Inscrits</p>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalEvents}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Agenda synchrone</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Sécurité & Cloisonnement</p>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2 font-mono">RBAC + Traçabilité</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Haute Sécurité & Intégrité</span>
        </div>
      </div>

      {/* Global alert banner */}
      {message && (
        <div
          className={`text-xs font-bold p-4 rounded-xl border flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Pills for Admin Sections */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => {
            setInternalTab("accounts");
            if (setActiveTab) setActiveTab("accounts");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            internalTab === "accounts"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Comptes Utilisateurs & Sécurité</span>
        </button>

        <button
          onClick={() => {
            setInternalTab("settings");
            if (setActiveTab) setActiveTab("settings");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            internalTab === "settings"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Paramétrage LIAS</span>
        </button>

        <button
          onClick={() => {
            setInternalTab("maintenance");
            if (setActiveTab) setActiveTab("maintenance");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            internalTab === "maintenance"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Maintenance & Diagnostic Système</span>
        </button>

        <button
          onClick={() => {
            setInternalTab("audit");
            if (setActiveTab) setActiveTab("audit");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            internalTab === "audit"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Journal d'Audit Global</span>
        </button>
      </div>

      {/* SECTION 1: ACCOUNTS */}
      {internalTab === "accounts" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Gestion Technique des Comptes Utilisateurs</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Contrôle des accès, gèle pour retraité (8.1), désactivation/réactivation (8.2) et réinitialisation de mot de passe.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, rôle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => setShowCreateUser(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Compte</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">Membre / Utilisateur</th>
                  <th className="px-6 py-3">Email & Identifiant</th>
                  <th className="px-6 py-3">Rôle Système</th>
                  <th className="px-6 py-3">Statut Membre</th>
                  <th className="px-6 py-3">Équipe</th>
                  <th className="px-6 py-3 text-right">Actions Techniques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-slate-900">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-600">{m.email}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold font-mono">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.status === "RETIRED"
                            ? "bg-amber-100 text-amber-800"
                            : m.status === "FORMER"
                            ? "bg-slate-100 text-slate-600"
                            : m.status === "PHD_STUDENT"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 font-medium">
                      {m.teamName || "Administration"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {m.role === "ADMIN" ? (
                        <span className="text-[10px] text-slate-400 font-bold">Protégé (Admin)</span>
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleResetPassword(m.id, `${m.firstName} ${m.lastName}`)}
                            title="Réinitialiser le mot de passe (member123)"
                            className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          >
                            <Key className="w-3 h-3 text-amber-600" />
                            <span>Reset MDP</span>
                          </button>

                          {m.isFrozen ? (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                              Gelé (Retraité)
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => accountAction(m.id, "toggle-active")}
                                className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                                  m.isActive === false
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {m.isActive === false ? "Réactiver" : "Désactiver"}
                              </button>
                              {m.isActive !== false && (
                                <button
                                  onClick={() => accountAction(m.id, "freeze")}
                                  className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded transition-colors"
                                >
                                  Geler
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono">
                  Création de Compte
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Ajouter un nouveau membre</h3>
              </div>
              <button onClick={() => setShowCreateUser(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Email Institutionnel</label>
                <input
                  type="email"
                  required
                  placeholder="nom@lias.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Rôle de Responsabilité</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="MEMBER">MEMBER (Membre régulier)</option>
                    <option value="TEAM_LEADER">TEAM_LEADER (Chef d'équipe)</option>
                    <option value="VICE_DIRECTOR">VICE_DIRECTOR (Vice-Directeur)</option>
                    <option value="DIRECTOR">DIRECTOR (Directeur)</option>
                    <option value="ADMIN">ADMIN (Super-Administrateur)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Statut d'Appartenance (Section 2.2)</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="PERMANENT">PERMANENT (Membre permanent)</option>
                    <option value="PHD_STUDENT">PHD_STUDENT (Doctorant)</option>
                    <option value="ASSOCIATED">ASSOCIATED (Membre associé)</option>
                    <option value="RETIRED">RETIRED (Retraité - compte gelé)</option>
                    <option value="FORMER">FORMER (Ancien membre - désactivé)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Équipe de Recherche</label>
                  <select
                    value={newUser.teamId}
                    onChange={(e) => setNewUser({ ...newUser, teamId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="1">SCIC (Smart Cities, IoT & Cybersécurité)</option>
                    <option value="2">DISS (Science des Données & Cloud)</option>
                    <option value="3">CHAM (IA Cognitive & Modélisation)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Titre Académique</label>
                  <input
                    type="text"
                    value={newUser.title}
                    onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                    placeholder="Professeur / Doctorant"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Mot de passe initial</label>
                <input
                  type="text"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded text-xs font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: SETTINGS (Section 5.1 & Section 4.1) */}
      {internalTab === "settings" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-blue-600" />
                <span>Paramétrage Institutionnel du Laboratoire LIAS</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configuration des métadonnées de tutelle, accréditation ministérielle et politiques techniques.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded">
              Synchronisé avec /api/lab-info
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Nom Officiel du Laboratoire
                </label>
                <input
                  type="text"
                  required
                  value={settings.labName || ""}
                  onChange={(e) => setSettings({ ...settings, labName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Acronyme / Sigle
                </label>
                <input
                  type="text"
                  required
                  value={settings.acronym || ""}
                  onChange={(e) => setSettings({ ...settings, acronym: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Faculté de Rattachement
                </label>
                <input
                  type="text"
                  required
                  value={settings.faculty || ""}
                  onChange={(e) => setSettings({ ...settings, faculty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Université de Tutelle
                </label>
                <input
                  type="text"
                  required
                  value={settings.university || ""}
                  onChange={(e) => setSettings({ ...settings, university: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Date de Création du Laboratoire
                </label>
                <input
                  type="date"
                  required
                  value={settings.creationDate || "2014-09-01"}
                  onChange={(e) => setSettings({ ...settings, creationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Numéro d'Accréditation Ministérielle
                </label>
                <input
                  type="text"
                  value={settings.accreditationNumber || ""}
                  onChange={(e) => setSettings({ ...settings, accreditationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Email de Contact Officiel
                </label>
                <input
                  type="email"
                  value={settings.contactEmail || ""}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Téléphone du Secrétariat
                </label>
                <input
                  type="text"
                  value={settings.phone || ""}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                Adresse Postale du Laboratoire
              </label>
              <input
                type="text"
                value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Taille Maximale par Document (Mo)
                </label>
                <input
                  type="number"
                  value={settings.maxUploadSizeMb || "50"}
                  onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                  Extensions de Fichiers Autorisées
                </label>
                <input
                  type="text"
                  value={settings.allowedExtensions || ""}
                  onChange={(e) => setSettings({ ...settings, allowedExtensions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={settingsLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{settingsLoading ? "Sauvegarde en cours..." : "Enregistrer le Paramétrage"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 3: MAINTENANCE (Section 5.1) */}
      {internalTab === "maintenance" && (
        <div className="space-y-6">
          {/* Health status grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Base de Données</span>
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">{health?.databaseStatus || "H2 JPA / Hibernate"}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connecté & Réactif</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Environnement Java / JVM</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">Java {health?.javaVersion || "21 LTS"}</p>
              <p className="text-[10px] text-slate-500 font-mono">OS: {health?.osName || "Windows"}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Mémoire Heap Allouée</span>
                <HardDrive className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {health?.heapUsedMb || 0} Mo / {health?.heapMaxMb || 2048} Mo
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((health?.heapUsedMb || 60) / (health?.heapMaxMb || 2048)) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Maintenance Action Controls */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Opérations de Maintenance & Diagnostic</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Déclenchement du nettoyage des caches et vérification de la mémoire institutionnelle.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleFlushCache}
                disabled={maintenanceLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 border border-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${maintenanceLoading ? "animate-spin" : ""}`} />
                <span>Vider les Caches Mémoire & GC</span>
              </button>

              <button
                onClick={handleIntegrityCheck}
                disabled={maintenanceLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Exécuter le Contrôle d'Intégrité LIAS</span>
              </button>
            </div>

            {/* Integrity Report View */}
            {integrityReport && (
              <div className="mt-4 p-4 rounded-xl border bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {integrityReport.status === "OPTIMAL" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <span>Rapport d'Intégrité : {integrityReport.status}</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Vérifié le {new Date(integrityReport.verifiedAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="text-slate-600">
                  {integrityReport.checksPassed} points de contrôle validés (Continuité des mandats, isolation des rôles, conservation immuable des membres).
                </p>
                {integrityReport.warnings && integrityReport.warnings.length > 0 && (
                  <ul className="list-disc list-inside text-amber-700 font-semibold space-y-1 pt-1">
                    {integrityReport.warnings.map((w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: AUDIT LOG (Section 21) */}
      {internalTab === "audit" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Journal d'Audit Système & Traçabilité</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enregistrement immuable de toutes les actions administratives, décisions et modifications de statut.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">{audit.length} événements récents</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">Horodatage</th>
                  <th className="px-6 py-3">Action Réalisée</th>
                  <th className="px-6 py-3">Auteur / Acteur</th>
                  <th className="px-6 py-3">Cible / Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audit.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-slate-400">
                      Aucune action enregistrée dans le journal d'audit.
                    </td>
                  </tr>
                ) : (
                  audit.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono text-slate-500 text-[10px]">
                        {new Date(a.date).toLocaleString("fr-FR")}
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                          {a.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-900">{a.actorName}</td>
                      <td className="px-6 py-3 text-slate-600 font-mono text-[11px]">{a.target || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
