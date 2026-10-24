import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "react-router";
import { User, MemberStatus } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { Search, Users, Mail, MapPin, Building, Briefcase, Filter, X } from "lucide-react";

export default function Members() {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

  const fetchMembers = () => {
    setLoading(true);
    let url = "/api/members";
    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (params.toString()) url += `?${params.toString()}`;

    const token = localStorage.getItem("token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(url, { headers })
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const getStatusLabel = (status: MemberStatus | string) => {
    switch (status) {
      case MemberStatus.PERMANENT: return lang === "fr" ? "Membre Permanent" : "Permanent Member";
      case MemberStatus.PHD_STUDENT: return lang === "fr" ? "Doctorant" : "PhD Student";
      case MemberStatus.ASSOCIATED: return lang === "fr" ? "Membre Associé" : "Associated Member";
      case MemberStatus.RETIRED: return lang === "fr" ? "Retraité (Compte gelé)" : "Retired (Frozen)";
      case MemberStatus.FORMER: return lang === "fr" ? "Ancien Membre" : "Former Member";
      default: return status;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {lang === "fr" ? "Annuaire Scientifique" : "Scientific Directory"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {lang === "fr" ? "Membres du Laboratoire LIAS" : "LIAS Laboratory Members"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "fr"
                ? "Enseignants-chercheurs, professeurs, doctorants et membres associés."
                : "Faculty researchers, professors, PhD candidates and associate members."}
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            {members.length} {lang === "fr" ? "chercheurs répertoriés" : "researchers listed"}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Rechercher par nom, email, centre d'intérêt..." : "Search by name, email, interest..."}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              {lang === "fr" ? "Filtrer" : "Filter"}
            </button>
          </form>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {[
              { id: "ALL", label: lang === "fr" ? "Tous" : "All" },
              { id: MemberStatus.PERMANENT, label: lang === "fr" ? "Permanents" : "Permanent" },
              { id: MemberStatus.PHD_STUDENT, label: lang === "fr" ? "Doctorants" : "PhD Students" },
              { id: MemberStatus.ASSOCIATED, label: lang === "fr" ? "Associés" : "Associated" },
              { id: MemberStatus.RETIRED, label: lang === "fr" ? "Retraités (Gelés)" : "Retired (Frozen)" },
              { id: MemberStatus.FORMER, label: lang === "fr" ? "Anciens Membres" : "Former Members" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors ${
                  statusFilter === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Member Cards Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            {lang === "fr" ? "Chargement des profils scientifiques..." : "Loading scientific profiles..."}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">{lang === "fr" ? "Aucun membre ne correspond à votre recherche." : "No members match your search."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200">
                      {(member.firstName?.charAt(0) || "M")}{(member.lastName?.charAt(0) || "")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">
                        {member.firstName} {member.lastName}
                      </h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded">
                        {getStatusLabel(member.status)}
                      </span>
                    </div>
                  </div>

                  {member.teamName && (
                    <div className="mb-3 p-2 bg-slate-50 rounded text-xs text-slate-700 font-medium">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === "fr" ? "Équipe" : "Team"}</span>
                      {member.teamName}
                    </div>
                  )}

                  {member.researchInterests && (
                    <div className="mb-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        {lang === "fr" ? "Centres d'intérêt" : "Research Interests"}
                      </span>
                      <p className="text-xs text-slate-600 line-clamp-2 italic">
                        {member.researchInterests}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    {member.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.institution && (
                      <div className="flex items-center gap-2 truncate">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.institution}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    {lang === "fr" ? "Voir le profil complet" : "View full profile"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Member Full Detail Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 rounded hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 font-black text-base flex items-center justify-center shrink-0 border border-blue-300">
                  {(selectedMember.firstName?.charAt(0) || "M")}{(selectedMember.lastName?.charAt(0) || "")}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <p className="text-xs text-blue-700 font-bold uppercase mt-0.5">
                    {getStatusLabel(selectedMember.status)} • {selectedMember.role}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedMember.email}</p>
                </div>
              </div>

              {selectedMember.biography && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {lang === "fr" ? "Biographie académique" : "Academic Biography"}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedMember.biography}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === "fr" ? "Équipe de Recherche" : "Research Team"}</span>
                  <span className="font-semibold text-slate-900">{selectedMember.teamName || "LIAS"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === "fr" ? "Bureau" : "Office"}</span>
                  <span className="font-semibold text-slate-900">{selectedMember.office || "Bâtiment LIAS"}</span>
                </div>
              </div>

              {/* Origine Institutionnelle & Laboratoire (Section 3 du Contrat) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {lang === "fr" ? "Établissement d'Origine" : "Original Institution"}
                  </span>
                  <span className="font-medium text-slate-800">{selectedMember.institution || "FSBM - Casablanca"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {lang === "fr" ? "Laboratoire d'Origine" : "Origin Laboratory"}
                  </span>
                  <span className="font-medium text-slate-800">{selectedMember.originLaboratory || "LIAS"}</span>
                </div>
              </div>

              {/* Données Temporelles du Système (Section 4 du Contrat) */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-2">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  Données Temporelles & Historique d'Affiliation (Clé Métier)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-500 block">Date d'affiliation LIAS :</span>
                    <strong className="text-blue-900">{selectedMember.affiliationDate || selectedMember.createdAt?.slice(0, 10) || "2020-09-01"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date d'embauche :</span>
                    <strong className="text-slate-900">{selectedMember.hireDate || "2020-09-01"}</strong>
                  </div>
                  {selectedMember.birthDate && (
                    <div className="col-span-2 flex items-center justify-between border-t border-blue-100 pt-1 text-[10px]">
                      <span className="text-slate-500">Date de naissance :</span>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-mono rounded font-semibold">
                        Confidentielle ({selectedMember.birthDate})
                      </span>
                    </div>
                  )}
                </div>

                {selectedMember.affiliationHistory && selectedMember.affiliationHistory.length > 0 && (
                  <div className="border-t border-blue-100 pt-2">
                    <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Périodes d'appartenance historisées :
                    </span>
                    <div className="space-y-1">
                      {selectedMember.affiliationHistory.map((h: any) => (
                        <div key={h.id} className="text-[11px] bg-white p-2 rounded border border-blue-100 flex justify-between items-center">
                          <span>Du <strong>{h.startDate}</strong> au <strong>{h.endDate || "En cours"}</strong></span>
                          {h.reason && <span className="text-slate-500 italic text-[10px]">{h.reason}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* État du Compte (Section 8: Départ & Retraite) */}
                <div className="border-t border-blue-100 pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">État du compte utilisateur :</span>
                  {selectedMember.isFrozen ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">
                      Compte Gelé (Retraité - Historique conservé)
                    </span>
                  ) : selectedMember.isActive === false ? (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[10px]">
                      Compte Désactivé (Ancien membre)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                      Compte Actif
                    </span>
                  )}
                </div>
              </div>

              {selectedMember.researchInterests && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {lang === "fr" ? "Thématiques & Mots-clés" : "Keywords & Topics"}
                  </h4>
                  <p className="text-xs text-slate-800 font-medium">
                    {selectedMember.researchInterests}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  {lang === "fr" ? "Fermer" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
