import { useState, FormEvent, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { MemberStatus, ResearchTeam } from "../../types";
import { Award, Send, CheckCircle, FileText, User, Mail, GraduationCap } from "lucide-react";

export default function Apply() {
  const { lang, t } = useLanguage();
  const [candidateName, setCandidateName] = useState("");
  const [email, setEmail] = useState("");
  const [degree, setDegree] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [motivation, setMotivation] = useState("");
  const [targetStatus, setTargetStatus] = useState<MemberStatus>(MemberStatus.PHD_STUDENT);
  const [targetTeamId, setTargetTeamId] = useState<string>("1");
  const [teams, setTeams] = useState<ResearchTeam[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teams")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTeams(data);
          setTargetTeamId(String(data[0].id));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          email,
          degree,
          cvSummary,
          motivation,
          targetStatus,
          targetTeamId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la soumission");

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            {lang === "fr" ? "Recrutement & Affiliation" : "Recruitment & Affiliation"}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {lang === "fr" ? "Demande d'Adhésion au Laboratoire LIAS" : "Apply for LIAS Lab Membership"}
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            {lang === "fr"
              ? "Formulaire officiel pour candidater en doctorat (PhD) ou en tant que chercheur associé au laboratoire."
              : "Official application form for PhD student enrollment or associated researcher affiliation."}
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-xl border border-blue-200 p-8 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {lang === "fr" ? "Candidature enregistrée avec succès !" : "Application Successfully Submitted!"}
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {lang === "fr"
                ? "Votre dossier a été transmis à la Direction du laboratoire LIAS. Le Directeur examinera votre motivation et votre CV lors de la prochaine commission de gouvernance. Vous recevrez une notification par email."
                : "Your file has been forwarded to the LIAS Laboratory Direction. The Director will review your application and you will be notified."}
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCandidateName("");
                  setEmail("");
                  setMotivation("");
                  setCvSummary("");
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                {lang === "fr" ? "Soumettre une autre demande" : "Submit another application"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 font-semibold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                    {lang === "fr" ? "Nom et Prénom du Candidat *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Youssef Berrada"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                    {lang === "fr" ? "Adresse Email *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="candidat@domaine.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                    {lang === "fr" ? "Statut sollicité *" : "Target Status *"}
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as MemberStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    <option value={MemberStatus.PHD_STUDENT}>{lang === "fr" ? "Doctorant (PhD Student)" : "PhD Student"}</option>
                    <option value={MemberStatus.ASSOCIATED}>{lang === "fr" ? "Membre Associé (Chercheur externe)" : "Associated Member"}</option>
                    <option value={MemberStatus.PERMANENT}>{lang === "fr" ? "Membre Permanent (Mutation / Recrutement)" : "Permanent Member"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                    {lang === "fr" ? "Équipe de rattachement visée *" : "Target Research Team *"}
                  </label>
                  <select
                    value={targetTeamId}
                    onChange={(e) => setTargetTeamId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    {teams.length > 0 ? (
                      teams.map(t => (
                        <option key={t.id} value={String(t.id)}>
                          {t.acronym ? `${t.acronym} - ` : ""}{t.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">SCIC - Smart Cities, IoT & Cybersécurité des Systèmes</option>
                        <option value="2">DISS - Science des Données, Cloud & Systèmes Intelligents</option>
                        <option value="3">CHAM - IA Cognitive, Santé & Modélisation Mathématique</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                  {lang === "fr" ? "Dernier diplôme obtenu / Établissement *" : "Highest Degree / Institution *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Master Big Data & Data Science - Faculté des Sciences Ben M'Sik"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                  {lang === "fr" ? "Résumé du parcours & CV (Expériences, publications, projets) *" : "CV Summary & Background *"}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={lang === "fr" ? "Décrivez brièvement vos compétences, stages et réalisations clés..." : "Briefly describe your background, internships, skills..."}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={cvSummary}
                  onChange={(e) => setCvSummary(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                  {lang === "fr" ? "Lettre de Motivation & Projet de Recherche *" : "Statement of Motivation & Research Proposal *"}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={lang === "fr" ? "Expliquez pourquoi vous souhaitez intégrer le LIAS et votre sujet d'intérêt..." : "Explain why you wish to join LIAS and your proposed topic..."}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Transmission en cours..." : (lang === "fr" ? "Transmettre ma Candidature au Directeur" : "Submit Application to Director")}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
