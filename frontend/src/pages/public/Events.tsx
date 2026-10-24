import { useEffect, useState, FormEvent } from "react";
import { useSearchParams, Link } from "react-router";
import { Event } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { Calendar, MapPin, Users, Search, CheckCircle, Clock, Tag, AlertCircle, X } from "lucide-react";

export default function Events() {
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [participatedMap, setParticipatedMap] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<{ type: "info" | "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [typeFilter]);

  const fetchEvents = () => {
    setLoading(true);
    let url = "/api/events";
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (typeFilter !== "ALL") {
          setEvents(data.filter((e: any) => e.type === typeFilter));
        } else {
          setEvents(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleParticipate = async (eventId: string) => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/participate`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        setParticipatedMap(prev => ({ ...prev, [eventId]: true }));
        setNotice({
          type: "success",
          message: lang === "fr"
            ? "Inscription à l'événement confirmée avec succès !"
            : "Registration confirmed successfully!"
        });
        fetchEvents();
      } else {
        const errData = await res.json().catch(() => ({}));
        setNotice({
          type: "error",
          message: errData.error || (lang === "fr" ? "Erreur lors de l'inscription." : "Failed to register.")
        });
      }
    } catch (err: any) {
      setNotice({
        type: "error",
        message: err.message || (lang === "fr" ? "Erreur réseau." : "Network error.")
      });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {lang === "fr" ? "Animation Scientifique" : "Scientific Life"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {lang === "fr" ? "Conférences, Séminaires & Workshops" : "Conferences, Seminars & Workshops"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "fr"
                ? "Calendrier officiel des rencontres académiques, séminaires doctoraux et journées d'études."
                : "Official calendar of academic conferences, doctoral seminars and study days."}
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            {events.length} {lang === "fr" ? "événements programmés" : "scheduled events"}
          </div>
        </div>

        {/* Action Notice */}
        {notice && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in ${
              notice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : notice.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : notice.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{notice.message}</span>
              {notice.type === "info" && (
                <Link to="/login" className="ml-2 font-bold underline hover:text-blue-900">
                  {lang === "fr" ? "Se connecter →" : "Log in →"}
                </Link>
              )}
            </div>
            <button
              onClick={() => setNotice(null)}
              className="p-1 hover:bg-black/5 rounded text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Rechercher par titre, lieu ou mot-clé..." : "Search by title, location or keyword..."}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">{lang === "fr" ? "Tous les formats" : "All Formats"}</option>
                <option value="Conférence">{lang === "fr" ? "Conférence" : "Conference"}</option>
                <option value="Séminaire">{lang === "fr" ? "Séminaire" : "Seminar"}</option>
                <option value="Atelier / Workshop">{lang === "fr" ? "Atelier / Workshop" : "Workshop"}</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                {lang === "fr" ? "Filtrer" : "Filter"}
              </button>
            </div>
          </form>
        </div>

        {/* Events Timeline */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            {lang === "fr" ? "Chargement des événements..." : "Loading events..."}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">
              {lang === "fr" ? "Aucun événement prévu pour cette sélection." : "No events scheduled for this selection."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((ev) => {
              const startDate = new Date(ev.dateStart);
              const endDate = new Date(ev.dateEnd);
              const isParticipating = participatedMap[ev.id];

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start justify-between"
                >
                  <div className="flex gap-4 items-start">
                    {/* Date Block */}
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-center min-w-[70px] border border-blue-200 shrink-0">
                      <p className="text-[10px] font-black uppercase tracking-wider">
                        {startDate.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { month: "short" })}
                      </p>
                      <p className="text-2xl font-black leading-tight">
                        {startDate.getDate()}
                      </p>
                      <p className="text-[10px] font-mono text-blue-600">
                        {startDate.getFullYear()}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold uppercase">
                          {ev.type}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {ev.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {ev.description}
                      </p>

                      <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>{ev.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{lang === "fr" ? "Organisé par :" : "Organized by:"} {ev.organizers}</span>
                        </div>
                        {ev.participantsCount !== undefined && (
                          <div className="text-blue-700 font-semibold">
                            {ev.participantsCount} {lang === "fr" ? "participants inscrits" : "registered participants"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 md:pt-0 shrink-0 w-full md:w-auto">
                    {isParticipating ? (
                      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-blue-200 justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span>{lang === "fr" ? "Inscription validée" : "Registered"}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleParticipate(ev.id)}
                        className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                      >
                        {t("btn.participate")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
