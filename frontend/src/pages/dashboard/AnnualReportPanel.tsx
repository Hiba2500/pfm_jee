import { useState } from "react";
import { fetchApi } from "../../lib/api";
import { FileText, Download, Loader2 } from "lucide-react";
import { AnnualReport } from "../../types";

// Section 11 : rapport d'activité annuel, généré automatiquement à partir des événements,
// publications, mouvements de membres, conventions, PV et matériel. Réservé au directeur en mandat.
export default function AnnualReportPanel() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      setReport(await fetchApi(`/reports/annual/${year}`));
    } catch (e: any) {
      setError(e.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    const res = await fetch(`/api/reports/annual/${year}?format=markdown`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) return setError("Téléchargement impossible");
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-annuel-LIAS-${year}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const labels: Record<string, string> = {
    events: "Événements",
    publications: "Publications",
    newMembers: "Nouveaux membres",
    departures: "Départs",
    applications: "Demandes d'adhésion",
    conventions: "Conventions",
    meetings: "Réunions / PV",
    documents: "Documents déposés",
    equipmentArrivals: "Arrivages matériel",
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono">Module Directeur</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Rapport d'activité annuel</h1>
          <p className="text-xs text-slate-500 mt-1">
            Condition pour l'obtention du budget annuel. Généré automatiquement à partir des données du laboratoire.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
          >
            {Array.from({ length: 8 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Générer
          </button>
          {report && (
            <button onClick={download} className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold">
              <Download className="w-4 h-4" /> Markdown
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>}

      {report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(report.summary).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{labels[key] || key}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Événements {report.year}</h2>
              <ul className="space-y-2 text-xs text-slate-700">
                {report.events.length === 0 && <li className="text-slate-400">Aucun événement cette année.</li>}
                {report.events.map((e) => (
                  <li key={e.id}>
                    <span className="font-semibold">{e.title}</span>
                    <span className="text-slate-500"> — {e.type}{e.edition ? `, ${e.edition}e édition` : ""}, {e.dateStart.slice(0, 10)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Publications par équipe</h2>
              <ul className="space-y-1 text-xs text-slate-700">
                {Object.keys(report.publicationsByTeam).length === 0 && <li className="text-slate-400">Aucune publication cette année.</li>}
                {Object.entries(report.publicationsByTeam).map(([team, n]) => (
                  <li key={team} className="flex justify-between"><span>{team}</span><span className="font-bold">{n}</span></li>
                ))}
              </ul>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mt-5 mb-3">Mouvements de membres</h2>
              <ul className="space-y-1 text-xs text-slate-700">
                {report.newMembers.map((m, i) => <li key={`n${i}`}>Arrivée : {m.name} ({m.status}) — {m.date}</li>)}
                {report.departures.map((m, i) => <li key={`d${i}`}>Départ : {m.name} — {m.date}{m.reason ? ` (${m.reason})` : ""}</li>)}
                {report.newMembers.length + report.departures.length === 0 && <li className="text-slate-400">Aucun mouvement.</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
