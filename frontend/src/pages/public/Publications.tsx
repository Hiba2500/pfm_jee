import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "react-router";
import { Publication, ResearchTeam } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { BookOpen, Search, ExternalLink, Copy, Check, Filter, Download, Printer, FileText } from "lucide-react";

export default function Publications() {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [teams, setTeams] = useState<ResearchTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [authorFilter, setAuthorFilter] = useState<string>(searchParams.get("author") || "");
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "ALL");
  const [yearFilter, setYearFilter] = useState<string>(searchParams.get("year") || "ALL");
  const [teamFilter, setTeamFilter] = useState<string>(searchParams.get("teamId") || searchParams.get("team") || "ALL");
  const [sortBy, setSortBy] = useState<"YEAR_DESC" | "YEAR_ASC" | "TITLE" | "AUTHOR">("YEAR_DESC");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedApaId, setCopiedApaId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.has("q")) setQuery(searchParams.get("q") || "");
    if (searchParams.has("author")) setAuthorFilter(searchParams.get("author") || "");
    if (searchParams.has("year")) setYearFilter(searchParams.get("year") || "ALL");
    if (searchParams.has("type")) setTypeFilter(searchParams.get("type") || "ALL");
    if (searchParams.has("teamId") || searchParams.has("team")) {
      setTeamFilter(searchParams.get("teamId") || searchParams.get("team") || "ALL");
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/teams")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTeams(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [typeFilter, yearFilter, teamFilter]);

  const fetchPublications = () => {
    setLoading(true);
    let url = "/api/publications";
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (authorFilter) params.append("author", authorFilter);
    if (typeFilter !== "ALL") params.append("type", typeFilter);
    if (yearFilter !== "ALL") params.append("year", yearFilter);
    if (teamFilter !== "ALL") params.append("teamId", teamFilter);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPublications(data);
        } else {
          setPublications([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchPublications();
  };

  const handleCopyBibtex = (pub: Publication) => {
    const bibtex = `@article{lias_${pub.id},
  title={${pub.title}},
  author={${pub.authors}},
  year={${pub.year}},
  journal={${pub.journalOrConference || "Laboratoire LIAS - FSBM"}}
}`;
    navigator.clipboard.writeText(bibtex);
    setCopiedId(pub.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyApa = (pub: Publication) => {
    const apa = `${pub.authors} (${pub.year}). ${pub.title}. ${pub.journalOrConference || "LIAS Lab"}.`;
    navigator.clipboard.writeText(apa);
    setCopiedApaId(pub.id);
    setTimeout(() => setCopiedApaId(null), 2000);
  };

  const exportBibtexFile = () => {
    if (publications.length === 0) return;
    const content = publications.map(pub => `@article{lias_${pub.id},
  title={${pub.title}},
  author={${pub.authors}},
  year={${pub.year}},
  journal={${pub.journalOrConference || "Laboratoire LIAS"}}
}`).join("\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `publications-lias-${new Date().getFullYear()}.bib`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsvFile = () => {
    if (publications.length === 0) return;
    const header = "ID;Titre;Auteurs;Année;Type;Revue/Conférence;Lien\n";
    const rows = publications.map(p => 
      `"${p.id}";"${p.title.replace(/"/g, '""')}";"${(p.authors || "").replace(/"/g, '""')}";"${p.year}";"${p.type || ""}";"${(p.journalOrConference || "").replace(/"/g, '""')}";"${p.link || ""}"`
    ).join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `publications-lias-${new Date().getFullYear()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sorting
  const sortedPublications = [...publications].sort((a, b) => {
    if (sortBy === "YEAR_DESC") return (b.year || 0) - (a.year || 0);
    if (sortBy === "YEAR_ASC") return (a.year || 0) - (b.year || 0);
    if (sortBy === "TITLE") return a.title.localeCompare(b.title);
    if (sortBy === "AUTHOR") return (a.authors || "").localeCompare(b.authors || "");
    return 0;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {lang === "fr" ? "Production Scientifique" : "Scientific Output"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {lang === "fr" ? "Publications & Travaux de Recherche" : "Publications & Research Papers"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "fr"
                ? "Articles de revues internationales, conférences indexées Scopus/IEEE et chapitres d'ouvrages."
                : "International journal papers, major conference proceedings and book chapters."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              {publications.length} {lang === "fr" ? "publications trouvées" : "publications found"}
            </div>

            {/* Export actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={exportBibtexFile}
                disabled={publications.length === 0}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="Exporter la sélection au format BibTeX (.bib)"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>BibTeX</span>
              </button>

              <button
                onClick={exportCsvFile}
                disabled={publications.length === 0}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="Exporter la sélection au format CSV / Excel"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel/CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="Imprimer / Exporter en PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Title */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Titre, mots-clés..." : "Title, keywords..."}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Author filter */}
            <div>
              <input
                type="text"
                placeholder={lang === "fr" ? "Filtrer par Auteur (nom)..." : "Filter by Author..."}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
              />
            </div>

            {/* Team filter */}
            <div>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none truncate"
              >
                <option value="ALL">{lang === "fr" ? "Toutes les équipes" : "All Teams"}</option>
                {teams.map(t => (
                  <option key={t.id} value={String(t.id)}>
                    {t.acronym ? `[${t.acronym}] ` : ""}{t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{lang === "fr" ? "Rechercher" : "Search"}</span>
              </button>
            </div>
          </form>

          {/* Secondary Row: Type, Year, Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtres :</span>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">{lang === "fr" ? "Tous les types" : "All Types"}</option>
                <option value="Journal">{lang === "fr" ? "Article de Journal" : "Journal Article"}</option>
                <option value="Conférence">{lang === "fr" ? "Conférence" : "Conference"}</option>
                <option value="Chapitre">{lang === "fr" ? "Chapitre d'ouvrage" : "Book Chapter"}</option>
                <option value="Thèse">{lang === "fr" ? "Thèse" : "Thesis"}</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">{lang === "fr" ? "Toutes les années" : "All Years"}</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {lang === "fr" ? "Classement par :" : "Sort by:"}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="YEAR_DESC">{lang === "fr" ? "Année (Plus récent)" : "Year (Newest)"}</option>
                <option value="YEAR_ASC">{lang === "fr" ? "Année (Plus ancien)" : "Year (Oldest)"}</option>
                <option value="TITLE">{lang === "fr" ? "Titre (A-Z)" : "Title (A-Z)"}</option>
                <option value="AUTHOR">{lang === "fr" ? "Auteur (A-Z)" : "Author (A-Z)"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Publication Cards List */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            {lang === "fr" ? "Chargement des publications scientifiques..." : "Loading publications..."}
          </div>
        ) : sortedPublications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">
              {lang === "fr" ? "Aucune publication ne correspond à vos critères." : "No publications match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPublications.map((pub) => (
              <div
                key={pub.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col sm:flex-row justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold uppercase">
                      {pub.type || "Publication"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {pub.year}
                    </span>
                    {pub.teamId && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {teams.find(t => String(t.id) === String(pub.teamId))?.acronym ? `Équipe: ${teams.find(t => String(t.id) === String(pub.teamId))?.acronym}` : ""}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {pub.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium">
                    <span className="text-slate-400 font-normal">Auteurs : </span>
                    {pub.authors}
                  </p>

                  {pub.journalOrConference && (
                    <p className="text-xs text-slate-500 italic">
                      <span className="text-slate-400 not-italic font-normal">Revue / Conférence : </span>
                      {pub.journalOrConference}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  {pub.link && (
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-bold tracking-wider inline-flex items-center gap-1.5 transition-colors border border-blue-200"
                    >
                      <span>DOI / Accès</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <div className="flex items-center gap-1.5">
                    {/* APA Citation Copy */}
                    <button
                      onClick={() => handleCopyApa(pub)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      title="Copier la citation au format APA"
                    >
                      {copiedApaId === pub.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 text-[11px] font-bold">APA OK</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[11px]">APA</span>
                        </>
                      )}
                    </button>

                    {/* BibTeX Citation Copy */}
                    <button
                      onClick={() => handleCopyBibtex(pub)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      title="Copier la citation au format BibTeX"
                    >
                      {copiedId === pub.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-blue-700 text-[11px] font-bold">BibTeX OK</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[11px]">BibTeX</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}