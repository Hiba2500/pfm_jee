import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Tag,
  Users,
  CheckCircle2,
  Filter,
  Sparkles,
  FileText
} from "lucide-react";

export default function CalendarPage() {
  const { lang, t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [participatedIds, setParticipatedIds] = useState<Record<string, boolean>>({});
  const [participateMessage, setParticipateMessage] = useState<string>("");

  const handleParticipateInEvent = async (item: any) => {
    const rawId = item.id.replace("evt-", "");
    try {
      await fetch(`/api/events/${rawId}/participate`, { method: "POST" });
      setParticipatedIds(prev => ({ ...prev, [item.id]: true }));
      setParticipateMessage(lang === "fr" ? "Participation enregistrée avec succès !" : "Registration successful!");
      setSelectedItem((prev: any) => prev ? { ...prev, participantsCount: (prev.participantsCount || 0) + 1 } : prev);
      setItems(prev => prev.map(it => it.id === item.id ? { ...it, participantsCount: (it.participantsCount || 0) + 1 } : it));
      setTimeout(() => setParticipateMessage(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const fetchCalendarData = () => {
    setLoading(true);
    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const filteredItems = categoryFilter === "ALL"
    ? items
    : items.filter(it => it.category === categoryFilter || it.subType === categoryFilter);

  const monthNamesFr = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = lang === "fr" ? monthNamesFr[month] : monthNamesEn[month];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Navigation Temporelle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {lang === "fr" ? "Calendrier Scientifique & Gouvernance LIAS" : "Scientific & Governance Calendar"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "fr"
                ? "Planning synchronisé des conférences, séminaires doctoraux, réunions de gouvernance (PV) et ateliers."
                : "Synchronized schedule of conferences, doctoral seminars, governance meetings, and workshops."}
            </p>
          </div>

          {/* Temporal Navigation Controls */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 text-center min-w-[140px]">
              <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                {currentMonthName} {year}
              </span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                {filteredItems.length} {lang === "fr" ? "événements prévus" : "scheduled"}
              </span>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tight">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>{lang === "fr" ? "Filtrer l'agenda :" : "Filter schedule:"}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: lang === "fr" ? "Tout afficher" : "All" },
              { id: "EVENT", label: lang === "fr" ? "Conférences & Séminaires" : "Conferences & Seminars" },
              { id: "MEETING", label: lang === "fr" ? "Réunions & PV Officiels" : "Governance Meetings" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  categoryFilter === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Timeline Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-xs">
            {lang === "fr" ? "Chargement du calendrier temporel..." : "Loading calendar..."}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">
              {lang === "fr"
                ? `Aucun événement programmé pour ${currentMonthName} ${year}`
                : `No events scheduled for ${currentMonthName} ${year}`}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "fr" ? "Naviguez vers d'autres mois pour consulter les dates d'ICISCT'26, d'ICAIS'25 et des réunions." : "Navigate to other months to see ICISCT'26, ICAIS'25 and meeting schedules."}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(2026, 5, 1))} // June 2026 for ICISCT'26
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                {lang === "fr" ? "Aller à Juin 2026 (ICISCT'26)" : "Jump to June 2026 (ICISCT'26)"}
              </button>
              <button
                onClick={() => setCurrentDate(new Date(2025, 10, 1))} // Nov 2025 for ICAIS'25
                className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors"
              >
                {lang === "fr" ? "Aller à Nov 2025 (ICAIS'25)" : "Jump to Nov 2025 (ICAIS'25)"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => {
              const itemDate = new Date(item.date);
              const isMeeting = item.category === "MEETING";

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row gap-5 items-start justify-between"
                >
                  <div className="flex gap-4 items-start flex-1 min-w-0">
                    {/* Date Tag */}
                    <div className={`p-3 rounded-xl text-center min-w-[70px] border shrink-0 ${
                      isMeeting
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}>
                      <p className="text-[10px] font-black uppercase tracking-wider">
                        {itemDate.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { month: "short" })}
                      </p>
                      <p className="text-2xl font-black leading-tight">
                        {itemDate.getDate()}
                      </p>
                      <p className="text-[10px] font-mono opacity-80">
                        {itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Information */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isMeeting
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {item.subType}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{item.location}</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.details}
                      </p>

                      <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Organisateur / Responsable : <strong className="text-slate-700">{item.organizers}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                    >
                      {lang === "fr" ? "Détails & Ordre du jour" : "View Details"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for Details / Agenda */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                    {selectedItem.category === "MEETING" ? "Réunion Officielle / PV" : "Événement Scientifique"}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedItem.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Heure</span>
                    <p className="font-semibold text-slate-900">
                      {new Date(selectedItem.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lieu</span>
                    <p className="font-semibold text-slate-900">{selectedItem.location}</p>
                  </div>
                </div>

                {selectedItem.category === "EVENT" && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-600 font-medium">Affluence & Inscriptions :</span>
                    <span className="font-bold text-blue-700 font-mono">
                      {selectedItem.participantsCount || 0} participants enregistrés
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {selectedItem.category === "MEETING" ? "Description & Contexte" : "Description & Enjeux"}
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed">
                    {selectedItem.details}
                  </div>
                </div>

                {selectedItem.category === "MEETING" && selectedItem.agenda && Array.isArray(selectedItem.agenda) && selectedItem.agenda.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Ordre du jour détaillé (PV)
                    </span>
                    <ul className="list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700 font-medium">
                      {selectedItem.agenda.map((ag: string, idx: number) => (
                        <li key={idx}>{ag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-blue-900">
                  <span className="font-bold">Responsable / Secrétariat :</span> {selectedItem.organizers}
                </div>

                {participateMessage && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{participateMessage}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                {selectedItem.category === "EVENT" ? (
                  participatedIds[selectedItem.id] ? (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === "fr" ? "Participation confirmée !" : "Registered!"}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleParticipateInEvent(selectedItem)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === "fr" ? "Participer à cet événement" : "Register for Event"}</span>
                    </button>
                  )
                ) : (
                  <div></div>
                )}

                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
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
