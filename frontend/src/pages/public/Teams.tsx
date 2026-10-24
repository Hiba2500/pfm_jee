import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useLanguage } from "../../context/LanguageContext";
import { Users, UserCheck, BookOpen, Layers, ArrowRight, ShieldCheck } from "lucide-react";

export default function Teams() {
  const { lang } = useLanguage();
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teams")
      .then(res => res.json())
      .then(setTeams)
      .catch(console.error);

    fetch("/api/members")
      .then(res => res.json())
      .then(setMembers)
      .catch(console.error);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            {lang === "fr" ? "Structure de Recherche" : "Research Structure"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {lang === "fr" ? "Équipes de Recherche du Laboratoire" : "Laboratory Research Teams"}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            {lang === "fr"
              ? "Présentation des pôles de recherche thématiques, de leurs responsables et de leurs membres actifs."
              : "Overview of research groups, team leaders, and active researchers."}
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teams.map((team) => {
            const teamMembers = members.filter(m => String(m.teamId) === String(team.id));
            const isSelected = String(selectedTeam) === String(team.id);

            return (
              <div
                key={team.id}
                id={team.id}
                className={`bg-white rounded-xl border p-6 flex flex-col justify-between transition-all ${
                  isSelected ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg" : "border-slate-200 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-black">
                      {team.acronym}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {teamMembers.length} {lang === "fr" ? "chercheurs" : "researchers"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                    {team.name}
                  </h3>

                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    {team.description}
                  </p>

                  {/* Leader info */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {lang === "fr" ? "Responsable d'équipe" : "Team Leader"}
                    </p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{team.leaderName}</span>
                    </p>
                  </div>

                  {/* Research Axes */}
                  <div className="mb-6 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {lang === "fr" ? "Axes de recherche" : "Research Axes"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {team.researchAxes?.map((axis: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                        >
                          {axis}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => setSelectedTeam(isSelected ? null : String(team.id))}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    {isSelected
                      ? (lang === "fr" ? "Fermer la liste" : "Close list")
                      : (lang === "fr" ? `Voir les membres (${teamMembers.length})` : `View members (${teamMembers.length})`)}
                  </button>
                  <Link
                    to={`/publications?teamId=${team.id}`}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    title={lang === "fr" ? "Publications de l'équipe" : "Team publications"}
                  >
                    <BookOpen className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Team Members Detail Expandable Panel */}
        {selectedTeam && (
          <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-md space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>
                  {lang === "fr" ? "Membres rattachés à" : "Members affiliated with"} {teams.find(t => String(t.id) === String(selectedTeam))?.name}
                </span>
              </h3>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕ {lang === "fr" ? "Fermer" : "Close"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.filter(m => String(m.teamId) === String(selectedTeam)).map(m => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {(m.firstName?.charAt(0) || "M")}{(m.lastName?.charAt(0) || "")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{m.firstName} {m.lastName}</p>
                    <p className="text-[10px] text-blue-600 font-semibold uppercase">{m.role}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{m.email}</p>
                    {m.researchInterests && (
                      <p className="text-[10px] text-slate-600 line-clamp-1 mt-1 italic">{m.researchInterests}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
