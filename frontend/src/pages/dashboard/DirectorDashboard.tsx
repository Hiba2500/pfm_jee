import { useState, useEffect, FormEvent } from "react";
import { fetchApi } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";
import {
  Users,
  Shield,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Archive,
  Award,
  AlertCircle,
  Send,
  Building,
  DollarSign,
  ArrowLeft,
  Handshake,
  FileCheck2,
  ChevronRight,
  ClipboardList,
  FileText
} from "lucide-react";

interface DirectorDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function DirectorDashboard({ activeTab = "dashboard", setActiveTab }: DirectorDashboardProps) {
  const { lang } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [mandates, setMandates] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [conventions, setConventions] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // New Equipment Arrival State
  const [arrivalDesignation, setArrivalDesignation] = useState("");
  const [arrivalCategory, setArrivalCategory] = useState("Calcul Intensif / GPU");
  const [arrivalSource, setArrivalSource] = useState("");
  const [selectedAssignMember, setSelectedAssignMember] = useState<Record<string, string>>({});

  // New Convention State
  const [convTitle, setConvTitle] = useState("");
  const [convPartner, setConvPartner] = useState("");
  const [convType, setConvType] = useState("UNIVERSITE");
  const [convStart, setConvStart] = useState("");
  const [convEnd, setConvEnd] = useState("");
  const [convBudget, setConvBudget] = useState("");

  // New Meeting PV State
  const [meetTitle, setMeetTitle] = useState("");
  const [meetType, setMeetType] = useState("Conseil de laboratoire");
  const [meetDate, setMeetDate] = useState("");
  const [meetAgenda, setMeetAgenda] = useState("");
  const [meetDecisions, setMeetDecisions] = useState("");

  // New Event Form State
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("Conférence");
  const [eventDesc, setEventDesc] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventOrganizers, setEventOrganizers] = useState("");
  const [eventEdition, setEventEdition] = useState("");
  const [eventSpeaker, setEventSpeaker] = useState("");

  // New Mandate Form State
  const [mandatePerson, setMandatePerson] = useState("");
  const [mandateRole, setMandateRole] = useState("Directeur");
  const [mandateTeam, setMandateTeam] = useState("");
  const [mandateStart, setMandateStart] = useState("");
  const [mandateEnd, setMandateEnd] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setLoading(true);
    Promise.all([
      fetchApi("/stats").catch(() => null),
      fetchApi("/applications").catch(() => []),
      fetchApi("/mandates").catch(() => []),
      fetchApi("/events?archived=true").catch(() => []),
      fetchApi("/equipment-requests").catch(() => []),
      fetchApi("/notifications").catch(() => []),
      fetchApi("/inventory").catch(() => null),
      fetchApi("/conventions").catch(() => []),
      fetchApi("/meetings").catch(() => [])
    ]).then(([s, apps, mans, evs, equips, notifs, inv, convs, meets]) => {
      setStats(s);
      setApplications(apps);
      setMandates(mans);
      setEvents(evs);
      setEquipmentRequests(equips);
      setNotifications(notifs);
      setInventoryData(inv);
      setConventions(convs);
      setMeetings(meets);
    }).finally(() => setLoading(false));
  };

  // Handle Application Decision (ACCEPT / REJECT)
  const handleApplicationDecision = async (appId: string, decision: "ACCEPTED" | "REJECTED", targetStatus?: string) => {
    try {
      setMessage("");
      setError("");
      const res = await fetchApi(`/applications/${appId}/decision`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          assignedRole: "MEMBER",
          assignedTeamId: "team-1"
        })
      });
      setMessage(res.message);
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Create Mandate
  const handleCreateMandate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/mandates", {
        method: "POST",
        body: JSON.stringify({
          personName: mandatePerson,
          role: mandateRole,
          teamName: mandateTeam || undefined,
          startDate: mandateStart,
          endDate: mandateEnd
        })
      });
      setMessage("Mandat créé et historisé avec succès.");
      setMandatePerson("");
      setMandateStart("");
      setMandateEnd("");
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Create Event
  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/events", {
        method: "POST",
        body: JSON.stringify({
          title: eventTitle,
          type: eventType,
          description: eventDesc,
          dateStart: eventStart,
          dateEnd: eventEnd || eventStart,
          location: eventLocation,
          organizers: eventOrganizers,
          edition: eventEdition ? parseInt(eventEdition) || 1 : null,
          speaker: eventSpeaker || null
        })
      });
      setMessage("Événement scientifique créé et programmé au calendrier.");
      setEventTitle("");
      setEventDesc("");
      setEventLocation("");
      setEventOrganizers("");
      setEventEdition("");
      setEventSpeaker("");
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Archive Event
  const handleArchiveEvent = async (eventId: string) => {
    try {
      await fetchApi(`/events/${eventId}/archive`, { method: "POST" });
      setMessage("Événement archivé avec succès.");
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Equipment Decision
  const handleEquipmentDecision = async (eqId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      await fetchApi(`/equipment-requests/${eqId}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision })
      });
      setMessage("Décision relative à la demande de matériel enregistrée.");
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Section 14: New Arrival of Equipment
  const handleCreateArrival = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/inventory", {
        method: "POST",
        body: JSON.stringify({
          designation: arrivalDesignation,
          category: arrivalCategory,
          supplierOrSource: arrivalSource
        })
      });
      setMessage("Nouvel arrivage de matériel enregistré avec succès.");
      setArrivalDesignation("");
      setArrivalSource("");
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Section 14: Assign Equipment to Member (Equitable Distribution)
  const handleAssignEquipment = async (itemId: string, memberId: string) => {
    if (!memberId) return;
    try {
      setMessage("");
      setError("");
      await fetchApi(`/inventory/${itemId}/assign`, {
        method: "POST",
        body: JSON.stringify({ memberId })
      });
      setMessage("Équipement attribué au chercheur. Suivi d'équité mis à jour.");
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Section 16: Create Convention
  const handleCreateConvention = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/conventions", {
        method: "POST",
        body: JSON.stringify({
          title: convTitle,
          partnerName: convPartner,
          partnerType: convType,
          startDate: convStart,
          endDate: convEnd,
          budgetOrResources: convBudget
        })
      });
      setMessage("Nouvelle convention enregistrée et archivée.");
      setConvTitle("");
      setConvPartner("");
      setConvBudget("");
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Section 17: Create Meeting Minutes (PV)
  const handleCreateMeeting = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/meetings", {
        method: "POST",
        body: JSON.stringify({
          title: meetTitle,
          meetingType: meetType,
          date: meetDate,
          agenda: meetAgenda ? meetAgenda.split("\n").filter(Boolean) : ["Session ordinaire de gouvernance"],
          decisions: meetDecisions ? meetDecisions.split("\n").filter(Boolean) : ["Décisions actées en séance"]
        })
      });
      setMessage("Procès-verbal de réunion (PV) créé et archivé.");
      setMeetTitle("");
      setMeetDate("");
      setMeetAgenda("");
      setMeetDecisions("");
      loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Director Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono">
            Espace Direction • Rôle Actif : Directeur de Laboratoire
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {lang === "fr" ? "Tableau de Bord de Gouvernance - Prof. Faouzia Benabbou" : "Director Governance Dashboard - Prof. Faouzia Benabbou"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validation des adhésions, historique des mandats, planification des colloques et arbitrage des équipements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold font-mono">
            Mandat Actif 2024 - 2027
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Director Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Candidatures en attente</span>
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats?.pendingApplications || 0}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">À valider par le Directeur</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Événements à venir</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats?.upcomingEvents || 0}</p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">Colloques & Séminaires</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Demandes de matériel</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats?.pendingEquipments || 0}</p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">En attente d'approbation</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Rapport Annuel 2026</span>
            <FileCheck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">78%</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Consolidation en cours</p>
        </div>
      </div>

      {/* Overview Hub Page (ONLY when activeTab === "dashboard") */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Hub de Gouvernance du Laboratoire LIAS
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque module dispose de sa propre page dédiée. Cliquez sur un module pour y accéder.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              7 Modules de Direction
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div
              onClick={() => setActiveTab && setActiveTab("applications")}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                    {applications.filter(a => a.status === "PENDING").length} en attente
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Demandes d'Adhésion au Laboratoire
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Validation régalienne des candidatures, création de comptes membres et affectation aux équipes de recherche.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Ouvrir la page du module</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => setActiveTab && setActiveTab("governance")}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                    {mandates.filter(m => m.active).length} mandats actifs
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Gouvernance & Mandats Électoraux
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Gestion des périodes électorales, direction, vice-direction, chefs d'équipe et mutations sans perte de données.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Gérer les mandats</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => setActiveTab && setActiveTab("events")}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                    {events.length} événements
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Événements Scientifiques & Colloques
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Création de conférences, workshops, archivage par édition et affectation de comités d'organisation.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Planifier les événements</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => setActiveTab && setActiveTab("equipment")}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold">
                    {equipmentRequests.filter(r => r.status === "PENDING").length} requêtes
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Matériel & Inventaire Équitable
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Enregistrement des arrivages, dotations et arbitrage de distribution équitable : Qui a reçu / Qui n'a pas reçu.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Gérer l'inventaire</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5 */}
            <div
              onClick={() => setActiveTab && setActiveTab("conventions")}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded text-[10px] font-bold">
                    {conventions.length} partenariats
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Conventions Partenaires & Accords
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Gestion des partenariats universitaires, industriels et internationaux avec suivi des activités conjointes.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Voir les conventions</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6 */}
            <div
              onClick={() => setActiveTab && setActiveTab("meetings")}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">
                    {meetings.length} PV archivés
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Procès-Verbaux de Réunions (PV)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Création des sessions de gouvernance, structuration de l'ordre du jour et archivage des décisions prises.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Consulter les PV</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 7 */}
            <div
              onClick={() => setActiveTab && setActiveTab("report")}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group md:col-span-2 lg:col-span-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Rapport d'Activité Annuel Obligatoire
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Génération annuelle automatique basée sur les événements, les publications et les activités. Condition indispensable pour l'attribution du budget annuel de recherche.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  <span>Générer le Rapport Annuel</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 1: Membership Requests Management (PAGE DÉDIÉE) */}
      {activeTab === "applications" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab && setActiveTab("dashboard")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Vue d'ensemble du Directeur</span>
          </button>
        </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Gestion des Demandes d'Adhésion au Laboratoire</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seul le Directeur actif a l'habilitation de valider et d'intégrer de nouveaux doctorants ou chercheurs associés.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-bold text-xs">
            {applications.filter(a => a.status === "PENDING").length} en attente
          </span>
        </div>

        <div className="p-6">
          {applications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Aucune candidature enregistrée.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`p-5 rounded-xl border transition-all ${
                    app.status === "PENDING"
                      ? "border-amber-200 bg-amber-50/20"
                      : app.status === "ACCEPTED"
                      ? "border-blue-200 bg-blue-50/10"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{app.candidateName}</h3>
                        <span className="text-xs font-mono text-slate-500">({app.email})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                          app.status === "ACCEPTED" ? "bg-blue-100 text-blue-800" :
                          "bg-rose-100 text-rose-800"
                        }`}>
                          {app.status === "PENDING" ? "En attente de décision" : app.status === "ACCEPTED" ? "Accepté • Compte créé" : "Refusé"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        Diplôme : {app.degree} • Statut sollicité : <strong className="text-blue-700">{app.targetStatus}</strong>
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Candidaté le : {new Date(app.appliedDate).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Résumé du CV & Compétences</span>
                      <p className="text-slate-700 leading-relaxed">{app.cvSummary}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Lettre de Motivation & Thèse</span>
                      <p className="text-slate-700 leading-relaxed italic">{app.motivation}</p>
                    </div>
                  </div>

                  {app.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApplicationDecision(app.id, "REJECTED")}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-rose-200"
                      >
                        Refuser la candidature
                      </button>
                      <button
                        onClick={() => handleApplicationDecision(app.id, "ACCEPTED", app.targetStatus)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accepter & Créer le compte membre</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      </div>
      )}

      {/* Module 2: Governance & Mandates Management (PAGE DÉDIÉE) */}
      {activeTab === "governance" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab && setActiveTab("dashboard")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Vue d'ensemble du Directeur</span>
          </button>
        </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Gouvernance & Gestion des Mandats Électoraux</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historique complet des mandats (Directeur, Vice-Directeur, Responsable d'Équipe) et conservation des traces.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Create Mandate Form */}
          <form onSubmit={handleCreateMandate} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Attribuer un nouveau Mandat officiel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Nom du Titulaire</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prof. Sanaa El Filali"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={mandatePerson}
                  onChange={(e) => setMandatePerson(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Rôle du Mandat</label>
                <select
                  value={mandateRole}
                  onChange={(e) => setMandateRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Directeur">Directeur de Laboratoire</option>
                  <option value="Vice-Directeur">Vice-Directeur</option>
                  <option value="Responsable d'Équipe">Responsable d'Équipe</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Date de début</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={mandateStart}
                  onChange={(e) => setMandateStart(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Date d'échéance</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={mandateEnd}
                  onChange={(e) => setMandateEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow"
              >
                Enregistrer le mandat dans l'historique
              </button>
            </div>
          </form>

          {/* Mandates History Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Titulaire</th>
                  <th className="px-4 py-3">Rôle officiel</th>
                  <th className="px-4 py-3">Période du Mandat</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mandates.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{m.personName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">
                        {m.role} {m.teamName ? `(${m.teamName})` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {m.startDate} → {m.endDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.active ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {m.active ? "En cours" : "Mandat échu (Historique)"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </div>
      )}

      {/* Module 3: Scientific Events Creation & Management (PAGE DÉDIÉE) */}
      {activeTab === "events" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab && setActiveTab("dashboard")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Vue d'ensemble du Directeur</span>
          </button>
        </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Programmation & Archivage des Événements Scientifiques</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Planification des conférences, séminaires doctoraux, assignation des organisateurs et archivage.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Create Event Form */}
          <form onSubmit={handleCreateEvent} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Programmer un nouvel Événement au Calendrier
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Titre de l'événement</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Colloque International sur les Systèmes Intelligents"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Type d'événement</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Conférence">Conférence Internationale</option>
                  <option value="Séminaire">Séminaire Doctoral</option>
                  <option value="Atelier / Workshop">Atelier / Workshop Pratique</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Description & Programme</label>
              <textarea
                required
                rows={2}
                placeholder="Objectifs, conférenciers invités, public ciblé..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Date & Heure de début</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={eventStart}
                  onChange={(e) => setEventStart(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Date & Heure de fin</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={eventEnd}
                  onChange={(e) => setEventEnd(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Lieu & Amphithéâtre</label>
                <input
                  type="text"
                  required
                  placeholder="Amphi 1 / Salle des Séminaires"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Organisateurs assignés</label>
                <input
                  type="text"
                  placeholder="Prof. Faouzia Benabbou, Prof. Nawal Sael, Pr. Abdessamad Belangour"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={eventOrganizers}
                  onChange={(e) => setEventOrganizers(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Édition (Numéro)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 6"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={eventEdition}
                    onChange={(e) => setEventEdition(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Intervenant invité</label>
                  <input
                    type="text"
                    placeholder="Ex: Pr. John Doe"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={eventSpeaker}
                    onChange={(e) => setEventSpeaker(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow"
              >
                Créer et Publier l'événement
              </button>
            </div>
          </form>

          {/* List of Events with Archive action */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Événements enregistrés au système</h4>
            {events.map((ev) => (
              <div key={ev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold uppercase">
                      {ev.type}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(ev.dateStart).toLocaleDateString("fr-FR")}
                    </span>
                    {ev.isArchived && (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase">
                        Archivé
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{ev.title}</h4>
                  <p className="text-[11px] text-slate-500">{ev.location} • Org: {ev.organizers}</p>
                </div>

                {!ev.isArchived && (
                  <button
                    onClick={() => handleArchiveEvent(ev.id)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archiver</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
      )}

      {/* Module 4 & 7: Equipment Requests & Section 14 Arrivages / Inventaire (PAGE DÉDIÉE) */}
      {activeTab === "equipment" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab && setActiveTab("dashboard")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Vue d'ensemble du Directeur</span>
          </button>
        </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Gestion des Demandes de Matériel & Équipements de Recherche</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Arbitrage des demandes de matériel expérimental, clusters de calcul et bancs d'essais.
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {equipmentRequests.map((eq) => (
              <div key={eq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{eq.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold">
                      {eq.estimatedCost}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      eq.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                      eq.status === "APPROVED" ? "bg-blue-100 text-blue-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>
                      {eq.status === "PENDING" ? "En attente" : eq.status === "APPROVED" ? "Approuvé" : "Refusé"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Demandé par : <strong>{eq.memberName}</strong> ({eq.category})</p>
                  <p className="text-xs text-slate-500 mt-1 italic">Justification : {eq.justification}</p>
                </div>

                {eq.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEquipmentDecision(eq.id, "REJECTED")}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-bold uppercase"
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={() => handleEquipmentDecision(eq.id, "APPROVED")}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold uppercase"
                    >
                      Approuver
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Section 14 — Gestion du Matériel & Arrivages (Distribution Équitable) */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Gestion du Matériel & Arrivages — Distribution Équitable
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi des arrivages, dotations effectives (« Qui a reçu quoi ») et chercheurs prioritaires (« Qui n'a pas reçu »).
            </p>
          </div>

          {inventoryData && (
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold">
                Taux d'Équité : {inventoryData.equityRate}%
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold">
                {inventoryData.availableCount} Disponibles
              </span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Form to record new arrival */}
          <form onSubmit={handleCreateArrival} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Enregistrer un Nouvel Arrivage de Matériel au Laboratoire
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Désignation du Matériel</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Station GPU Nvidia RTX 4090 ou Kit Capteurs LoRa"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={arrivalDesignation}
                  onChange={(e) => setArrivalDesignation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Catégorie</label>
                <select
                  value={arrivalCategory}
                  onChange={(e) => setArrivalCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  <option value="Calcul Intensif / GPU">Calcul Intensif / GPU</option>
                  <option value="Réseaux de Capteurs / IoT">Réseaux de Capteurs / IoT</option>
                  <option value="Infrastructure Serveur">Infrastructure Serveur</option>
                  <option value="Instrumentation Banc de Test">Instrumentation Banc de Test</option>
                  <option value="Matériel Informatique Mobile">Matériel Informatique Mobile</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Source / Marché d'Origine</label>
                <input
                  type="text"
                  placeholder="Ex: Marché Public UH2C ou Dotation CNRST"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={arrivalSource}
                  onChange={(e) => setArrivalSource(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase transition-colors"
              >
                Enregistrer l'Arrivage
              </button>
            </div>
          </form>

          {/* Equity Dashboard: Qui a reçu quoi vs Qui n'a pas reçu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Qui a reçu quoi */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Membres Dotés (« Qui a Reçu Quoi »)
                </span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {inventoryData?.whoReceived?.length || 0} Chercheurs dotés
                </span>
              </div>

              <div className="space-y-2">
                {inventoryData?.whoReceived?.map((m: any) => (
                  <div key={m.memberId} className="p-3 bg-white rounded-lg border border-blue-100 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900">{m.name}</strong>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        {m.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Équipe : {m.teamName || "LIAS"}</div>
                    <div className="mt-1 pt-1 border-t border-slate-100 space-y-1">
                      {m.items?.map((it: any) => (
                        <div key={it.id} className="text-[11px] text-slate-700 flex justify-between">
                          <span className="truncate pr-2 font-medium">• {it.designation}</span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">{it.serialOrInventoryNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Qui n'a pas reçu */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Chercheurs Prioritaires (« Qui n'a Pas Reçu »)
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {inventoryData?.whoDidNotReceive?.length || 0} En attente
                </span>
              </div>

              <div className="space-y-2">
                {inventoryData?.whoDidNotReceive?.map((m: any) => (
                  <div key={m.memberId} className="p-3 bg-white rounded-lg border border-amber-100 text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 block">{m.name}</strong>
                      <span className="text-[10px] text-slate-500">{m.role} • {m.teamName || "LIAS"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Éligible prochain arrivage
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Available inventory list & assignment */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Inventaire des Équipements du Laboratoire & Affectation
            </h4>
            <div className="space-y-2">
              {inventoryData?.inventory?.map((item: any) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900">{item.designation}</strong>
                      <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {item.serialOrInventoryNumber}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                        item.status === "ATTRIBUE" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Source : {item.supplierOrSource} • Arrivée le {new Date(item.arrivalDate).toLocaleDateString("fr-FR")}
                      {item.assignedToMemberName && ` • Attribué à : ${item.assignedToMemberName}`}
                    </p>
                  </div>

                  {item.status === "DISPONIBLE" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                        value={selectedAssignMember[item.id] || ""}
                        onChange={(e) => setSelectedAssignMember({ ...selectedAssignMember, [item.id]: e.target.value })}
                      >
                        <option value="">Sélectionner chercheur prioritaire...</option>
                        {inventoryData?.whoDidNotReceive?.map((m: any) => (
                          <option key={m.memberId} value={m.memberId}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignEquipment(item.id, selectedAssignMember[item.id])}
                        disabled={!selectedAssignMember[item.id]}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-bold uppercase"
                      >
                        Attribuer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>
      )}

      {/* Module 8: Conventions & Collaborations (PAGE DÉDIÉE) */}
      {activeTab === "conventions" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab && setActiveTab("dashboard")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Vue d'ensemble du Directeur</span>
          </button>
        </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Conventions & Collaborations Partenaires
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestion des conventions académiques et industrielles, archivage des accords et suivi des activités associées.
            </p>
          </div>

          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold">
            {conventions.length} Conventions Actives & Archivées
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* New Convention Form */}
          <form onSubmit={handleCreateConvention} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Créer une Nouvelle Convention de Recherche
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Titre de la Convention</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Partenariat IA & Smart City"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={convTitle}
                  onChange={(e) => setConvTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Partenaire</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: University of Salford ou CNRST"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={convPartner}
                  onChange={(e) => setConvPartner(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Type de Partenaire</label>
                <select
                  value={convType}
                  onChange={(e) => setConvType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="UNIVERSITE">Université / Académique</option>
                  <option value="INDUSTRIE">Industrie / Entreprise</option>
                  <option value="ORGANISME_RECHERCHE">Organisme de Recherche (CNRST)</option>
                  <option value="INTERNATIONAL">International</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Date Début</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={convStart}
                  onChange={(e) => setConvStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Date Fin</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={convEnd}
                  onChange={(e) => setConvEnd(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Budget / Ressources Associées</label>
                <input
                  type="text"
                  placeholder="Ex: 500 000 MAD ou Bourses de mobilité"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={convBudget}
                  onChange={(e) => setConvBudget(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase transition-colors"
              >
                Enregistrer Convention
              </button>
            </div>
          </form>

          {/* Conventions List */}
          <div className="space-y-3">
            {conventions.map(conv => (
              <div key={conv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <strong className="text-sm font-bold text-slate-900">{conv.title}</strong>
                    <p className="text-xs text-blue-700 font-semibold">{conv.partnerName} ({conv.partnerType})</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold uppercase text-[10px]">
                      {conv.status}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-mono text-[10px]">
                      {conv.startDate} → {conv.endDate}
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">{conv.description}</p>

                {conv.activities && conv.activities.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Activités associées :</span>
                    <div className="flex flex-wrap gap-1">
                      {conv.activities.map((act: string, idx: number) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] text-slate-700">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add activity inline form (Section 16: Suivi des activités associées) */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const input = form.elements.namedItem("activity") as HTMLInputElement;
                    if (!input || !input.value.trim()) return;
                    try {
                      await fetchApi(`/conventions/${conv.id}/activities`, {
                        method: "POST",
                        body: JSON.stringify({ activity: input.value.trim() })
                      });
                      input.value = "";
                      loadAllData();
                    } catch (err: any) {
                      setError(err.message);
                    }
                  }}
                  className="flex gap-2 pt-2 border-t border-slate-100"
                >
                  <input
                    type="text"
                    name="activity"
                    placeholder="Ajouter une activité associée (ex: Échange de doctorants, Séminaire conjoint)..."
                    className="flex-1 px-2.5 py-1 text-[11px] border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold uppercase transition-colors shrink-0"
                  >
                    + Ajouter Activité
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
      )}

      {/* Module 9: Procès-Verbaux (PV de Réunions) (PAGE DÉDIÉE) */}
      {activeTab === "meetings" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab && setActiveTab("dashboard")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Vue d'ensemble du Directeur</span>
          </button>
        </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Procès-Verbaux (PV) des Réunions de Gouvernance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Création des réunions officielles, ordre du jour, décisions actées, upload des PV et archivage automatique.
            </p>
          </div>

          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-bold">
            {meetings.length} Réunions & PV Archivés
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* New Meeting Form */}
          <form onSubmit={handleCreateMeeting} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Créer une Réunion & Acter le Procès-Verbal (PV)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Titre de la Session</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conseil de Laboratoire Ordinaire - Bilan ICISCT"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Type de Réunion</label>
                <select
                  value={meetType}
                  onChange={(e) => setMeetType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Conseil de laboratoire">Conseil de laboratoire</option>
                  <option value="Commission scientifique">Commission scientifique</option>
                  <option value="Assemblée générale">Assemblée générale</option>
                  <option value="Réunion d'équipe">Réunion d'équipe</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Date & Heure de Séance</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={meetDate}
                  onChange={(e) => setMeetDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Ordre du Jour (un point par ligne)</label>
                <textarea
                  rows={2}
                  placeholder="Point 1 : Bilan scientifique&#10;Point 2 : Distribution matériel"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={meetAgenda}
                  onChange={(e) => setMeetAgenda(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Décisions Actées (une par ligne)</label>
                <textarea
                  rows={2}
                  placeholder="Décision 1 : Validation rapport annuel&#10;Décision 2 : Attribution matériel"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={meetDecisions}
                  onChange={(e) => setMeetDecisions(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold uppercase transition-colors"
              >
                Acter & Archiver le PV
              </button>
            </div>
          </form>

          {/* Meetings and Minutes List */}
          <div className="space-y-3">
            {meetings.map(meet => (
              <div key={meet.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold uppercase rounded">
                      {meet.meetingType}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{meet.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {new Date(meet.date).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Ordre du Jour :</span>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {meet.agenda?.map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Décisions Actées au PV :</span>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {meet.decisions?.map((dec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{dec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Secrétaire de séance : <strong className="text-slate-700">{meet.secretaryName}</strong></span>
                  <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                    Télécharger l'extrait officiel du PV (PDF)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
      )}
    </div>
  );
}
