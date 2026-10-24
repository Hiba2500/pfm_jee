import { useState, useEffect, FormEvent } from "react";
import { fetchApi } from "../../lib/api";
import { User, Publication, LabDocument, InternalMessage, LabNotification, ProfileHistoryEntry } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import {
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Send,
  History,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Search,
  Lock,
  DollarSign,
  PackageCheck,
  Handshake,
  FileCheck2,
  Key
} from "lucide-react";

interface MemberDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function MemberDashboard({ activeTab = "dashboard", setActiveTab }: MemberDashboardProps) {
  const { lang, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [documents, setDocuments] = useState<LabDocument[]>([]);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [notifications, setNotifications] = useState<LabNotification[]>([]);
  const [profileHistory, setProfileHistory] = useState<ProfileHistoryEntry[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<any[]>([]);
  const [assignedItems, setAssignedItems] = useState<any[]>([]);
  const [conventions, setConventions] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Profile Edit Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [institution, setInstitution] = useState("");
  const [originLaboratory, setOriginLaboratory] = useState("");
  const [biography, setBiography] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [phone, setPhone] = useState("");
  const [office, setOffice] = useState("");
  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [orcid, setOrcid] = useState("");
  const [googleScholarUrl, setGoogleScholarUrl] = useState("");
  const [researchGateUrl, setResearchGateUrl] = useState("");

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  // New Publication Form State
  const [pubTitle, setPubTitle] = useState("");
  const [pubAuthors, setPubAuthors] = useState("");
  const [pubYear, setPubYear] = useState(new Date().getFullYear());
  const [pubType, setPubType] = useState("Article de Journal");
  const [pubLink, setPubLink] = useState("");
  const [pubDoi, setPubDoi] = useState("");

  // Equipment Request State (Section 15)
  const [eqTitle, setEqTitle] = useState("");
  const [eqCategory, setEqCategory] = useState("Informatique");
  const [eqCost, setEqCost] = useState("");
  const [eqJustification, setEqJustification] = useState("");

  // Document Upload State (Section 10)
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState<any>("Demandes de financement");
  const [docEventId, setDocEventId] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);

  // Internal Message State (Section 13)
  const [msgRecipient, setMsgRecipient] = useState("TOUS");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgContent, setMsgContent] = useState("");

  // Document Search
  const [docSearch, setDocSearch] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    setLoading(true);
    Promise.all([
      fetchApi("/members/me").catch(() => null),
      fetchApi("/publications").catch(() => []),
      fetchApi("/documents").catch(() => []),
      fetchApi("/messages").catch(() => []),
      fetchApi("/notifications").catch(() => []),
      fetchApi("/profile/history").catch(() => []),
      fetchApi("/equipment-requests").catch(() => []),
      fetchApi("/equipment").catch(() => []),
      fetchApi("/conventions").catch(() => []),
      fetchApi("/meetings").catch(() => []),
      fetchApi("/events").catch(() => [])
    ]).then(([u, pubs, docs, msgs, notifs, hist, reqs, equips, convs, meets, evts]) => {
      if (u) {
        setCurrentUser(u);
        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setInstitution(u.institution || "");
        setOriginLaboratory(u.originLaboratory || "");
        setBiography(u.biography || "");
        setResearchInterests(u.researchInterests || "");
        setPhone(u.phone || "");
        setOffice(u.office || u.officeNumber || "");
        setTitle(u.title || "");
        setSpecialty(u.specialty || "");
        setPhotoUrl(u.photoUrl || u.photo || "");
        setOrcid(u.orcid || "");
        setGoogleScholarUrl(u.googleScholarUrl || "");
        setResearchGateUrl(u.researchGateUrl || "");

        if (Array.isArray(equips)) {
          setAssignedItems(equips.filter((item: any) => item.assignedToUserId === u.id));
        }
      }
      setPublications(pubs || []);
      setDocuments(docs || []);
      setMessages(msgs || []);
      setNotifications(notifs || []);
      setProfileHistory(hist || []);
      setEquipmentRequests(reqs || []);
      setConventions(convs || []);
      setMeetings(meets || []);
      setEvents(evts || []);
    }).finally(() => setLoading(false));
  };

  // Update Profile & Save History
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      const res = await fetchApi("/members/me", {
        method: "PUT",
        body: JSON.stringify({
          firstName,
          lastName,
          title,
          specialty,
          photoUrl,
          institution,
          originLaboratory,
          biography,
          researchInterests,
          phone,
          office,
          orcid,
          googleScholarUrl,
          researchGateUrl
        })
      });
      setMessage(res.message || "Profil mis à jour avec succès.");
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      loadUserData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Change Password
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwdMessage("");
    setPwdError("");
    if (newPassword !== confirmPassword) {
      setPwdError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }
    try {
      const res = await fetchApi("/auth/mot-de-passe", {
        method: "POST",
        body: JSON.stringify({
          ancienMotDePasse: oldPassword,
          nouveauMotDePasse: newPassword
        })
      });
      setPwdMessage(res.message || "Mot de passe modifié avec succès.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdError(err.message);
    }
  };

  // Add Publication
  const handleAddPublication = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/publications", {
        method: "POST",
        body: JSON.stringify({
          title: pubTitle,
          authors: pubAuthors,
          year: pubYear,
          type: pubType,
          link: pubLink,
          doi: pubDoi
        })
      });
      setMessage("Publication enregistrée avec succès dans le répertoire du laboratoire.");
      setPubTitle("");
      setPubAuthors("");
      setPubLink("");
      setPubDoi("");
      loadUserData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete Publication
  const handleDeletePublication = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette publication ?")) return;
    try {
      await fetchApi(`/publications/${id}`, { method: "DELETE" });
      setMessage("Publication supprimée.");
      loadUserData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Equipment Request (Section 15)
  const handleCreateEquipmentRequest = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/equipment-requests", {
        method: "POST",
        body: JSON.stringify({
          title: eqTitle,
          category: eqCategory,
          estimatedCost: eqCost || "Sur devis",
          justification: eqJustification
        })
      });
      setMessage("Demande de besoin en matériel soumise à la direction avec succès.");
      setEqTitle("");
      setEqCost("");
      setEqJustification("");
      loadUserData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Upload Document (Section 10)
  const handleUploadDocument = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/documents", {
        method: "POST",
        body: JSON.stringify({
          title: docTitle,
          type: docType,
          eventId: docEventId ? Number(docEventId) : null,
          fileSize: "2.4 MB"
        })
      });
      setMessage("Document archivé dans le gestionnaire électronique du laboratoire.");
      setDocTitle("");
      setDocEventId("");
      loadUserData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Send Message (Section 13)
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      await fetchApi("/messages", {
        method: "POST",
        body: JSON.stringify({
          recipient: msgRecipient,
          recipientName:
            msgRecipient === "TOUS"
              ? "Tous les membres du laboratoire"
              : msgRecipient === "EQUIPE"
              ? "Membres de mon équipe de recherche"
              : "Discussions colloques & séminaires",
          subject: msgSubject,
          content: msgContent
        })
      });
      setMessage("Message interne transmis avec succès.");
      setMsgSubject("");
      setMsgContent("");
      loadUserData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isPhd = currentUser?.role === "PHD_STUDENT" || currentUser?.status === "PHD_STUDENT";
  const isAssociate = currentUser?.role === "ASSOCIATED" || currentUser?.status === "ASSOCIATED";
  const myPubs = publications.filter(
    (p) => p.userId === currentUser?.id || (p as any).ownerId === currentUser?.id
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 font-black text-lg flex items-center justify-center shrink-0 border border-blue-200 shadow-xs">
            {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono">
                {isPhd ? "Espace Doctorant" : isAssociate ? "Espace Membre Associé" : "Espace Chercheur"} • {currentUser?.role}
              </span>
              {currentUser?.status && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-bold uppercase font-mono">
                  {currentUser?.status}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {currentUser?.firstName} {currentUser?.lastName}
            </h1>
            <p className="text-xs text-slate-500">
              {currentUser?.institution || "Université Hassan II de Casablanca"} • {currentUser?.teamName || "Laboratoire LIAS"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Travaux Publiés</span>
            <span className="text-base font-black text-blue-600">{myPubs.length} publications</span>
          </div>
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

      {/* Notifications Module */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Notifications & Alertes du Laboratoire ({notifications.length})</span>
          </h2>
        </div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Aucune notification pour le moment.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-slate-300" : "bg-blue-500 animate-pulse"}`}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-600">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {new Date(n.date).toLocaleString("fr-FR")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Module 1: Profile Management with Mandatory Modification History */}
      {(activeTab === "profile" || activeTab === "dashboard") && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Gestion du Profil Scientifique & Historique des Modifications</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque modification apportée à votre biographie, affiliation ou coordonnées est historisée de manière traçable.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Nom de famille</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Titre académique</label>
                  <input
                    type="text"
                    placeholder="Ex: Professeur, PES, Doctorant"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Discipline / Spécialité</label>
                  <input
                    type="text"
                    placeholder="Ex: Informatique, IA, Big Data"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Photo de Profil (URL)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Établissement / Faculté</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Laboratoire d'Origine</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={originLaboratory}
                    onChange={(e) => setOriginLaboratory(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Biographie Académique</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Centres d'intérêt & Thématiques de recherche</label>
                <input
                  type="text"
                  placeholder="Ex: Big Data, Deep Learning, Séries Temporelles, IoT"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={researchInterests}
                  onChange={(e) => setResearchInterests(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Téléphone (Confidentiel)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Bureau & Salle</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                  />
                </div>
              </div>

              {/* Bibliometric Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Identifiant ORCID</label>
                  <input
                    type="text"
                    placeholder="0000-0002-1825-0097"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                    value={orcid}
                    onChange={(e) => setOrcid(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Google Scholar (URL)</label>
                  <input
                    type="url"
                    placeholder="https://scholar.google.com/..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={googleScholarUrl}
                    onChange={(e) => setGoogleScholarUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">ResearchGate (URL)</label>
                  <input
                    type="url"
                    placeholder="https://www.researchgate.net/profile/..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={researchGateUrl}
                    onChange={(e) => setResearchGateUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow"
                >
                  Enregistrer les modifications & historiser
                </button>
              </div>
            </form>

            {/* Password Change Sub-module */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5 mb-3">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Sécurité du Compte — Changer mon Mot de Passe</span>
              </h3>

              {pwdMessage && (
                <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold">
                  {pwdMessage}
                </div>
              )}
              {pwdError && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs font-semibold">
                  {pwdError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Confirmer mot de passe</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase transition-colors"
                  >
                    Mettre à jour mon mot de passe
                  </button>
                </div>
              </form>
            </div>

            {/* Profile Modification History Table */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" />
                <span>Journal d'Historique des Modifications du Profil (Traçabilité)</span>
              </h3>

              {profileHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucune modification précédente enregistrée dans l'historique.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2">Date & Heure</th>
                        <th className="px-4 py-2">Champ Modifié</th>
                        <th className="px-4 py-2">Ancienne Valeur</th>
                        <th className="px-4 py-2">Nouvelle Valeur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profileHistory.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono text-[10px] text-slate-500">
                            {new Date(h.date).toLocaleString("fr-FR")}
                          </td>
                          <td className="px-4 py-2 font-bold text-slate-700">{h.fieldChanged}</td>
                          <td className="px-4 py-2 text-slate-400 truncate max-w-[150px]">{h.oldValue || "—"}</td>
                          <td className="px-4 py-2 text-blue-700 font-medium truncate max-w-[150px]">{h.newValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Module 2: Publications Management (Add, Edit, Delete own - Section 12) */}
      {(activeTab === "publications" || activeTab === "dashboard") && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Mes Publications Scientifiques</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ajout de travaux scientifiques par les membres et doctorants, intégrés automatiquement au rapport annuel.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200">
              {myPubs.length} indexées
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Add Publication Form */}
            <form onSubmit={handleAddPublication} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Enregistrer une nouvelle publication
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Titre de l'article ou ouvrage</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Deep Learning for Early Anomaly Detection"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Type de Publication</label>
                  <select
                    value={pubType}
                    onChange={(e) => setPubType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Journal">Article de Journal</option>
                    <option value="Conference">Conférence Internationale</option>
                    <option value="Book Chapter">Chapitre de Livre</option>
                    <option value="Thesis">Thèse de Doctorat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Auteurs (séparés par virgules)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sanaa El Filali, Abdessamad Belangour"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={pubAuthors}
                    onChange={(e) => setPubAuthors(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Année</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={pubYear}
                    onChange={(e) => setPubYear(parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">DOI ou Lien Externe</label>
                  <input
                    type="text"
                    placeholder="10.1109/..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={pubDoi}
                    onChange={(e) => setPubDoi(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter la Publication</span>
                </button>
              </div>
            </form>

            {/* List of My Publications */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Mes travaux enregistrés</h3>
              {myPubs.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 italic">Vous n'avez pas encore déposé de publication.</p>
              ) : (
                <div className="space-y-2">
                  {myPubs.map((pub) => (
                    <div
                      key={pub.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{pub.title}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold uppercase">
                            {pub.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {Array.isArray(pub.authors) ? pub.authors.join(", ") : pub.authors} • <strong className="font-mono">{pub.year}</strong>
                          {pub.journalOrConference && ` • ${pub.journalOrConference}`}
                        </p>
                        {pub.doi && <span className="text-[10px] font-mono text-slate-400">DOI: {pub.doi}</span>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDeletePublication(pub.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Module 3: Equipment Needs & Assigned Inventory (Section 14 & 15) */}
      {(activeTab === "equipment" || activeTab === "dashboard") && !isPhd && !isAssociate && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>Gestion des Besoins en Matériel & Équipements Attribués</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exprimez vos besoins d'équipements scientifiques et consultez le matériel du laboratoire qui vous est affecté.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200">
              {assignedItems.length} équipement(s) reçu(s)
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* New Equipment Need Request Form */}
            <form onSubmit={handleCreateEquipmentRequest} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Exprimer un besoin en matériel de recherche
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Désignation du matériel souhaité</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Station de travail GPU Nvidia RTX 4090 pour calcul IA"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={eqTitle}
                    onChange={(e) => setEqTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Catégorie</label>
                  <select
                    value={eqCategory}
                    onChange={(e) => setEqCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Informatique">Informatique & Calcul</option>
                    <option value="Banc d'essai">Banc d'essai & IoT</option>
                    <option value="Laboratoire">Matériel de Laboratoire</option>
                    <option value="Mobilier">Mobilier & Bureau</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Justification scientifique de la demande</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Décrivez le projet de recherche et l'expérimentation nécessitant ce matériel..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={eqJustification}
                  onChange={(e) => setEqJustification(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Soumettre ma Demande</span>
                </button>
              </div>
            </form>

            {/* List of my Equipment Requests */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Historique de mes demandes de matériel</h3>
              {equipmentRequests.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucune demande de matériel déposée pour le moment.</p>
              ) : (
                <div className="space-y-2">
                  {equipmentRequests.map((req) => (
                    <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{req.title}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">{req.category}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" :
                            req.status === "REJECTED" ? "bg-rose-100 text-rose-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {req.status === "ACCEPTED" ? "Approuvé par Direction" : req.status === "REJECTED" ? "Refusé" : "En cours d'examen"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 italic">{req.justification}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.date ? new Date(req.date).toLocaleDateString("fr-FR") : "Récent"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List of Equipment Assigned to Me (Section 14) */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Matériel du Laboratoire Affecté à mon Profil (Distribution Équitable)</span>
              </h3>

              {assignedItems.length === 0 ? (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  Aucun matériel n'est actuellement affecté à votre nom. Vous êtes éligible en priorité pour les prochains arrivages de matériel de laboratoire.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Désignation</th>
                        <th className="px-4 py-2.5">N° Inventaire</th>
                        <th className="px-4 py-2.5">Catégorie</th>
                        <th className="px-4 py-2.5">Date d'Attribution</th>
                        <th className="px-4 py-2.5">Provenance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{item.designation}</td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-blue-700">{item.inventoryNumber || item.serialOrInventoryNumber}</td>
                          <td className="px-4 py-2.5 text-slate-600">{item.category}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{item.assignedDate}</td>
                          <td className="px-4 py-2.5 text-slate-500">{item.source || item.supplierOrSource}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Module 4: Electronic Document Management (Section 10) */}
      {(activeTab === "documents" || activeTab === "dashboard") && !isPhd && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Gestion Électronique des Documents du Laboratoire</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Demandes de financement, programmes, attestations, rapports d'activité et actes administratifs.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Upload Document Form */}
            <form onSubmit={handleUploadDocument} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Déposer un Document officiel
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Nom / Intitulé du document</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Demande de mission CNRS 2026"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Type de Document</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Demandes de financement">Demandes de financement</option>
                    <option value="Programmes">Programmes</option>
                    <option value="Attestations">Attestations</option>
                    <option value="Rapports">Rapports d'activité</option>
                    <option value="Documents administratifs">Documents administratifs</option>
                    <option value="Procès-verbal">Procès-verbal</option>
                    <option value="Convention">Convention</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Événement Lié</label>
                  <select
                    value={docEventId}
                    onChange={(e) => setDocEventId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Général / Non lié à un événement</option>
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.edition || evt.type || "Événement"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Uploader le Document</span>
                </button>
              </div>
            </form>

            {/* Documents List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Documents consultables</h3>
                <input
                  type="text"
                  placeholder="Filtrer par nom ou déposant..."
                  className="px-3 py-1 border border-slate-300 rounded text-xs w-64"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Document</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Événement Associé (Sec. 10)</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Déposant</th>
                      <th className="px-4 py-3 text-right">Télécharger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents
                      .filter(d => !docSearch || d.title.toLowerCase().includes(docSearch.toLowerCase()) || (d.ownerName && d.ownerName.toLowerCase().includes(docSearch.toLowerCase())))
                      .map((doc) => {
                        const associatedEvent = doc.eventId ? events.find(e => String(e.id) === String(doc.eventId)) : null;
                        return (
                          <tr key={doc.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              <span>{doc.title}</span>
                              {doc.version && doc.version > 1 && (
                                <span className="ml-1.5 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-mono">
                                  v{doc.version}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                                {doc.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {associatedEvent ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                  <span>{associatedEvent.title}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-[10px]">Général / Non lié</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">
                              {new Date(doc.date).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{doc.ownerName}</td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={doc.id ? `/api/documents/${doc.id}/download` : "#"}
                                onClick={(e) => {
                                  if (!doc.id) {
                                    e.preventDefault();
                                    setMessage(`Téléchargement initié : "${doc.title}" (${doc.fileSize})`);
                                    setTimeout(() => setMessage(""), 5000);
                                  }
                                }}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-bold inline-flex items-center gap-1 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{doc.fileSize || "PDF"}</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Module 5: Internal Communication & Discussions (Section 13) */}
      {(activeTab === "messages" || activeTab === "dashboard") && !isPhd && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Messagerie Interne & Discussions d'Équipes</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Discussions entre membres, échanges au sein des équipes et débats liés aux colloques et séminaires.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* New Message Form */}
            <form onSubmit={handleSendMessage} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Envoyer un message interne
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Destinataires</label>
                  <select
                    value={msgRecipient}
                    onChange={(e) => setMsgRecipient(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="TOUS">Tous les membres du laboratoire</option>
                    <option value="EQUIPE">Membres de mon équipe de recherche</option>
                    <option value="COLLOQUES">Discussions liées aux événements & colloques</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Sujet du message</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Disponibilité des nœuds GPU pour tests de modèles"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Contenu du message</label>
                <textarea
                  required
                  rows={2}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
              </div>
            </form>

            {/* Messages feed */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Fil de discussion interne</h3>
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucun message pour le moment.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{m.senderName} → {m.recipientName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(m.date).toLocaleString("fr-FR")}</span>
                    </div>
                    <h4 className="text-xs font-bold text-blue-800">{m.subject}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{m.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Module 6: Conventions & Partner Collaborations (Section 16) */}
      {(activeTab === "conventions" || activeTab === "dashboard") && !isPhd && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Handshake className="w-4 h-4 text-blue-600" />
                <span>Conventions & Partenariats de Recherche du Laboratoire</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultation des conventions actives, accords-cadres et opportunités de collaborations scientifiques.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200">
              {conventions.length} convention(s)
            </span>
          </div>

          <div className="p-6">
            {conventions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucune convention enregistrée pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conventions.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{c.title}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold uppercase font-mono">
                        {c.partnerType}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 font-semibold">Partenaire : {c.partnerName}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Du {c.startDate} au {c.endDate || "Indéterminé"}</span>
                      {c.budgetOrResources && <span className="text-emerald-700 font-bold">{c.budgetOrResources}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Module 7: Meeting Minutes & PVs (Section 17) */}
      {(activeTab === "meetings" || activeTab === "dashboard") && !isPhd && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>Procès-Verbaux de Réunions & Décisions de Gouvernance</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultation des conseils de laboratoire, ordres du jour et décisions actées en séance.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200">
              {meetings.length} PV(s) archivé(s)
            </span>
          </div>

          <div className="p-6">
            {meetings.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun procès-verbal disponible.</p>
            ) : (
              <div className="space-y-4">
                {meetings.map((m) => (
                  <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{m.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{m.date}</span>
                    </div>
                    {m.agenda && (
                      <div className="text-xs text-slate-600">
                        <strong className="text-slate-700">Ordre du jour : </strong>
                        {Array.isArray(m.agenda) ? m.agenda.join(" • ") : m.agenda}
                      </div>
                    )}
                    {m.decisions && (
                      <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                        <strong className="text-blue-700">Décisions actées : </strong>
                        {Array.isArray(m.decisions) ? m.decisions.join(" • ") : m.decisions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
