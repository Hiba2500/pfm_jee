import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "../../context/LanguageContext";
import LiasLogo from "../../components/common/LiasLogo";
import {
  BookOpen,
  Users,
  Calendar,
  ArrowRight,
  Search,
  Award,
  Layers,
  Sparkles,
  Server,
  ChevronRight,
  ExternalLink,
  Cpu,
  Brain,
  Shield,
  HeartPulse,
  Leaf,
  Globe2,
  Building
} from "lucide-react";

export default function Home() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [labInfo, setLabInfo] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [recentPubs, setRecentPubs] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"publications" | "members" | "events">("publications");

  useEffect(() => {
    fetch("/api/lab-info")
      .then(res => res.json())
      .then(setLabInfo)
      .catch(console.error);

    fetch("/api/teams")
      .then(res => res.json())
      .then(setTeams)
      .catch(console.error);

    fetch("/api/publications")
      .then(res => res.json())
      .then(data => setRecentPubs(data.slice(0, 3)))
      .catch(console.error);

    fetch("/api/events")
      .then(res => res.json())
      .then(data => setUpcomingEvents(data.slice(0, 4)))
      .catch(console.error);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/${searchType}?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Academic badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-950/90 border border-blue-700/80 rounded-full text-blue-300 text-xs font-semibold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === "fr" ? "Université Hassan II • Faculté des Sciences Ben M'Sik (FSBM) • Casablanca" : "Hassan II University • Faculty of Sciences Ben M'Sik • Casablanca"}</span>
            </div>

            {/* Official Logo Banner */}
            <div className="p-4 bg-white/95 rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full mx-auto my-2">
              <LiasLogo className="w-full h-auto max-h-24 mx-auto" variant="full" theme="light" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-4xl leading-tight">
              {lang === "fr" ? (
                <>
                  Laboratoire d'<span className="text-blue-400">Intelligence Artificielle</span> et <span className="text-blue-400">Systèmes</span> (LIAS)
                </>
              ) : (
                <>
                  Laboratory of <span className="text-blue-400">Artificial Intelligence</span> & <span className="text-blue-400">Systems</span> (LIAS)
                </>
              )}
            </h1>

            {/* LinkedIn Mission Statement Banner */}
            <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-700/80 p-5 rounded-xl text-left shadow-lg">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" />
                  Mission Scientifique & Impact Socio-Économique
                </span>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold uppercase">
                  Digital Morocco 2030
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Le LIAS mène des recherches fondamentales et appliquées en IA, science des données, cloud, IoT, big data et modélisation mathématique pour répondre aux enjeux des <strong>villes intelligentes</strong> (santé, éducation, transport, agriculture, finance, cybersécurité). Aligné sur <strong>« Digital Morocco 2030 »</strong>, le laboratoire vise l’excellence scientifique et l’impact socio‑économique par l’innovation et les partenariats publics‑privés.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Directrice : <strong className="text-white">Prof. Faouzia Benabbou</strong></span>
                <span>Affiliation : <strong className="text-slate-300">FSBM, Casablanca</strong></span>
              </div>
            </div>

            {/* Quick Unified Search Bar for Visitors */}
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-2xl mt-2">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center bg-slate-900/80 rounded-lg px-3 py-1.5 border border-slate-700/60 flex-1">
                  <Search className="w-4 h-4 text-blue-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder={
                      lang === "fr"
                        ? searchType === "publications"
                          ? "Rechercher une publication, un auteur, un thème..."
                          : searchType === "members"
                          ? "Rechercher un chercheur, doctorant, spécialité..."
                          : "Rechercher une conférence (ICISCT, ICAIS), un séminaire..."
                        : "Search publications, members, or events..."
                    }
                    className="w-full bg-transparent text-white placeholder-slate-400 text-xs focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    className="bg-slate-900 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                  >
                    <option value="publications">{lang === "fr" ? "Publications" : "Publications"}</option>
                    <option value="members">{lang === "fr" ? "Membres" : "Members"}</option>
                    <option value="events">{lang === "fr" ? "Événements" : "Events"}</option>
                  </select>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow flex items-center gap-1.5"
                  >
                    <span>{t("btn.search")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/publications"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                {t("btn.exploreResearch")}
              </Link>
              <Link
                to="/teams"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-700 transition-colors inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {t("btn.ourTeam")}
              </Link>
              <Link
                to="/apply"
                className="bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-700 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                {t("btn.applyNow")}
              </Link>
            </div>
          </div>

          {/* Key Metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80 text-center">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <p className="text-3xl font-black text-blue-400">2012</p>
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mt-1">
                {lang === "fr" ? "Année de Fondation" : "Foundation Year"}
              </p>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <p className="text-3xl font-black text-white">3</p>
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mt-1">
                {lang === "fr" ? "Équipes de Recherche" : "Research Teams"}
              </p>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <p className="text-3xl font-black text-white">{labInfo?.totalMembers || 9}+</p>
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mt-1">
                {lang === "fr" ? "Professeurs & Doctorants" : "Faculty & PhDs"}
              </p>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <p className="text-3xl font-black text-blue-400">100+</p>
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mt-1">
                {lang === "fr" ? "Publications & Brevets" : "Publications & Patents"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Domains & Objectives Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {lang === "fr" ? "Axes Prioritaires & Domaines d'Impact" : "Core Domains & Societal Impact"}
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {lang === "fr" ? "Recherche au Service des Villes Intelligentes & de la Société" : "Research for Smart Cities & Society"}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {lang === "fr"
                ? "Le LIAS oriente ses travaux scientifiques pour répondre aux défis majeurs de la société et de l'économie marocaine et africaine : santé, éducation, transport, agriculture, finance et cybersécurité."
                : "LIAS focuses its scientific work on addressing key challenges in smart cities: health, education, transport, agriculture, finance and cybersecurity."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Villes & Régions Intelligentes (Smart Cities)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jumeaux numériques (Digital Twins) pour la simulation urbaine, gouvernance territoriale, transport connecté et infrastructures durables.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Cybersécurité & Résilience des Infrastructures IA</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Protection des systèmes cyber-physiques critiques, détection proactive des menaces et continuité des services urbains connectés.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center mb-4">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">IA Cognitive pour la Santé Inclusive</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Systèmes intelligents d'aide au diagnostic pour la santé maternelle et infantile dans les contextes à faibles ressources.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">IA Frugale & Souveraine pour l'Afrique</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modèles légers, peu énergivores et accessibles pour transformer l'éducation, l'agriculture résiliente et les services publics.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Data Science, Cloud & Big Data</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Traitement analytique de flux massifs, deep learning, modèles prédictifs pour les services financiers et l'industrie.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Modélisation Mathématique & PINN</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Physics-Informed Neural Networks pour la simulation stochastique, la dynamique épidémiologique et les équations complexes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Teams Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">
                {lang === "fr" ? "Structure du Laboratoire" : "Laboratory Structure"}
              </h2>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {lang === "fr" ? "Nos 3 Équipes de Recherche Spécialisées" : "Our 3 Specialized Research Teams"}
              </h3>
            </div>
            <Link
              to="/teams"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>{lang === "fr" ? "Consulter toutes les équipes" : "View all teams"}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-black">
                      {team.acronym}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {team.memberCount} {lang === "fr" ? "membres" : "members"}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">{team.name}</h4>
                  <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">{team.description}</p>

                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      {lang === "fr" ? "Responsable d'équipe" : "Team Leader"}
                    </p>
                    <p className="text-xs font-bold text-slate-800">{team.leaderName}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {team.researchAxes?.slice(0, 2).map((axis: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium truncate max-w-[200px]">
                        {axis}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/teams#${team.id}`}
                    className="w-full block text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
                  >
                    {lang === "fr" ? "Détails & Membres" : "Details & Members"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Publications & Upcoming Events Two-Column */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Recent Publications */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>{lang === "fr" ? "Dernières Publications" : "Recent Publications"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === "fr" ? "Articles ICISCT'26, ICAIS'25 et revues internationales Q1" : "ICISCT'26, ICAIS'25 and Q1 journal articles"}
                </p>
              </div>
              <Link to="/publications" className="text-xs font-bold text-blue-700 hover:underline">
                {lang === "fr" ? "Voir tout" : "View all"}
              </Link>
            </div>

            <div className="space-y-4">
              {recentPubs.map((pub) => (
                <div key={pub.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">
                      {pub.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono font-bold">{pub.year}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
                    {pub.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-2 truncate">
                    <span className="font-semibold text-slate-600">{pub.authors}</span>
                    {pub.journalOrConference && ` — ${pub.journalOrConference}`}
                  </p>
                  {pub.link && (
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>DOI / Open Access</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Scientific Events & Keynotes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>{lang === "fr" ? "Conférences & Plénières LIAS" : "Conferences & Keynotes"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === "fr" ? "ICISCT'26, ICAIS'25 et Autumn Schools en IA" : "ICISCT'26, ICAIS'25 and AI Autumn Schools"}
                </p>
              </div>
              <Link to="/events" className="text-xs font-bold text-blue-700 hover:underline">
                {lang === "fr" ? "Calendrier complet" : "Full calendar"}
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((ev) => (
                <div key={ev.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition-all flex gap-4 items-start">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-lg text-center min-w-[50px] border border-blue-100 shrink-0">
                    <p className="text-[9px] font-black uppercase tracking-wider">
                      {new Date(ev.dateStart).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { month: "short" })}
                    </p>
                    <p className="text-base font-black leading-tight">
                      {new Date(ev.dateStart).getDate()}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase">
                      {ev.type}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug mt-1 mb-1 truncate">
                      {ev.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mb-2">{ev.location}</p>
                    <Link
                      to="/events"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>{lang === "fr" ? "Consulter & Participer" : "View & Participate"}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
