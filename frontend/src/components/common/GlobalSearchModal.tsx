import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Search, X, Users, BookOpen, Calendar, FileText, ClipboardList, Loader2, ExternalLink } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({
    members: [],
    publications: [],
    events: [],
    documents: [],
    meetings: []
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ members: [], publications: [], events: [], documents: [], meetings: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ members: [], publications: [], events: [], documents: [], meetings: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { headers })
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) => {
          setResults({
            members: data.members || [],
            publications: data.publications || [],
            events: data.events || [],
            documents: data.documents || [],
            meetings: data.meetings || []
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.members.length +
    results.publications.length +
    results.events.length +
    results.documents.length +
    results.meetings.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50 gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === "fr"
                ? "Recherche globale : chercheurs, publications, colloques, documents..."
                : "Global search: researchers, publications, events, documents..."
            }
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-mono font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!query.trim() && (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">
                {lang === "fr"
                  ? "Saisissez un mot-clé pour lancer la recherche institutionnelle (Section 18)."
                  : "Enter a keyword to query the laboratory database."}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Exemples : "IoT", "Belangour", "ICAIS", "Cybersécurité", "Benabbou", "Santé"
              </p>
            </div>
          )}

          {query.trim() && !loading && totalResults === 0 && (
            <div className="text-center py-10 text-slate-500">
              <p className="text-sm font-semibold">
                {lang === "fr" ? "Aucun résultat trouvé pour" : "No results found for"} "{query}"
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {lang === "fr" ? "Essayez avec d'autres termes de recherche." : "Try different search terms."}
              </p>
            </div>
          )}

          {/* Members Results */}
          {results.members.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 pb-1 border-b border-slate-100">
                <Users className="w-3.5 h-3.5" />
                <span>{lang === "fr" ? "Membres & Chercheurs" : "Researchers"} ({results.members.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.members.map((m: any) => (
                  <Link
                    key={m.id}
                    to="/members"
                    onClick={onClose}
                    className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                      {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{m.title || m.status}</p>
                      {m.teamName && (
                        <span className="inline-block mt-1 text-[9px] font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-blue-700">
                          {m.teamName}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Publications Results */}
          {results.publications.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 pb-1 border-b border-slate-100">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Publications ({results.publications.length})</span>
              </div>
              <div className="space-y-2">
                {results.publications.map((p: any) => (
                  <Link
                    key={p.id}
                    to="/publications"
                    onClick={onClose}
                    className="block p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-xl transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 leading-snug">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {Array.isArray(p.authors) ? p.authors.join(", ") : p.authors} • <strong className="font-mono">{p.year}</strong> • {p.venue || p.type}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {results.events.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 pb-1 border-b border-slate-100">
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === "fr" ? "Événements & Colloques" : "Scientific Events"} ({results.events.length})</span>
              </div>
              <div className="space-y-2">
                {results.events.map((e: any) => (
                  <Link
                    key={e.id}
                    to="/events"
                    onClick={onClose}
                    className="block p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded uppercase font-mono">
                        {e.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {e.date || e.dateStart}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 mt-1">
                      {e.title}
                    </p>
                    {e.location && (
                      <p className="text-[10px] text-slate-500 mt-0.5">Lieu : {e.location}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Documents Results (Internal) */}
          {results.documents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 pb-1 border-b border-slate-100">
                <FileText className="w-3.5 h-3.5" />
                <span>Documents & Rapports ({results.documents.length})</span>
              </div>
              <div className="space-y-2">
                {results.documents.map((d: any) => (
                  <Link
                    key={d.id}
                    to="/dashboard"
                    onClick={onClose}
                    className="block p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                        {d.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">
                        {d.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Déposé le {new Date(d.date || d.uploadedAt).toLocaleDateString("fr-FR")}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Meetings / PV Results (Internal) */}
          {results.meetings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 pb-1 border-b border-slate-100">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{lang === "fr" ? "Procès-Verbaux de Réunions (PV)" : "Meeting Minutes"} ({results.meetings.length})</span>
              </div>
              <div className="space-y-2">
                {results.meetings.map((m: any) => (
                  <Link
                    key={m.id}
                    to="/dashboard"
                    onClick={onClose}
                    className="block p-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-rose-800">
                        {m.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {m.date}
                      </span>
                    </div>
                    {m.agenda && (
                      <p className="text-[10px] text-slate-600 mt-1 truncate">
                        Ordre du jour : {Array.isArray(m.agenda) ? m.agenda.join(" • ") : m.agenda}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
