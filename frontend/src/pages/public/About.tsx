import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useLanguage } from "../../context/LanguageContext";
import LiasLogo from "../../components/common/LiasLogo";
import {
  Building2,
  History,
  Target,
  Users,
  BookOpen,
  Compass,
  Award,
  Globe2,
  Cpu,
  Brain,
  Download,
  Calendar,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function About() {
  const { lang } = useLanguage();
  const [labInfo, setLabInfo] = useState<any>(null);

  useEffect(() => {
    fetch("/api/lab-info")
      .then(res => res.json())
      .then(setLabInfo)
      .catch(console.error);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Université Hassan II de Casablanca • Faculté des Sciences Ben M'Sik</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {lang === "fr" ? "Laboratoire d'Intelligence Artificielle et Systèmes (LIAS)" : "Artificial Intelligence and Systems Laboratory (LIAS)"}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            {lang === "fr"
              ? "Pôle de recherche académique d'excellence en intelligence artificielle, science des données et systèmes cyber-physiques au service des villes intelligentes et de l'Afrique."
              : "Center of academic excellence in artificial intelligence, data science, and cyber-physical systems for smart cities and African development."}
          </p>
        </div>

        {/* LOGO & BRAND IDENTITY SHOWCASE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                {lang === "fr" ? "Identité Visuelle Officielle" : "Official Visual Identity"}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {lang === "fr" ? "Le Logo Officiel du LIAS et sa Symbolique" : "LIAS Official Logo & Symbology"}
              </h2>
            </div>
            <a
              href="/lias-logo.svg"
              download="LIAS-Logo.svg"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === "fr" ? "Télécharger le logo (SVG)" : "Download Logo (SVG)"}</span>
            </a>
          </div>

          {/* Logo Stage */}
          <div className="p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner">
            <div className="p-4 bg-white/95 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full mx-auto">
              <LiasLogo className="w-full h-auto max-h-28 mx-auto" variant="full" theme="light" />
            </div>
            <p className="text-xs text-slate-400 mt-4 max-w-xl">
              Emblème vectoriel déposé du <strong>Laboratoire d'Intelligence Artificielle et Systèmes (LIAS)</strong> — Faculté des Sciences Ben M'Sik, Université Hassan II de Casablanca.
            </p>
          </div>

          {/* Semiotic Explanation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === "fr" ? "Hémisphère Gauche : L'Intelligence Artificielle" : "Left Hemisphere: Artificial Intelligence"}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Représente le <strong>cerveau cognitif</strong>, les sciences de l'apprentissage automatique, les réseaux neuronaux, l'IA cognitive pour la santé inclusive (santé maternelle et infantile), et la modélisation mathématique fondamentale.
              </p>
            </div>

            <div className="p-5 bg-sky-50/60 rounded-xl border border-sky-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === "fr" ? "Hémisphère Droit : Les Systèmes & le Numérique" : "Right Hemisphere: Systems & Digital Hardware"}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Illustre le <strong>circuit imprimé électronique avec microprocesseur</strong>, symbolisant les systèmes cyber-physiques, l'Internet des Objets (IoT), les architectures Cloud, le Big Data, la cybersécurité et les jumeaux numériques des villes intelligentes.
              </p>
            </div>
          </div>
        </div>

        {/* Presentation Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === "fr" ? "Mission & Vision Stratégique" : "Mission & Strategic Vision"}
              </h2>
              <p className="text-xs text-slate-500">
                Aligné sur la stratégie nationale « Digital Morocco 2030 »
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-800 text-sm leading-relaxed font-medium">
            « Le LIAS mène des recherches fondamentales et appliquées en IA, science des données, cloud, IoT, big data et modélisation mathématique pour répondre aux enjeux des villes intelligentes (santé, éducation, transport, agriculture, finance, cybersécurité). Aligné sur « Digital Morocco 2030 », le laboratoire vise l’excellence scientifique et l’impact socio‑économique par l’innovation et les partenariats publics‑privés. »
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {lang === "fr" ? "Directrice du Laboratoire" : "Laboratory Director"}
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">{labInfo?.director || "Prof. Faouzia Benabbou"}</p>
              <p className="text-[11px] text-blue-600 font-medium">Professeure d'Enseignement Supérieur (PES) • Co-Chair ICISCT'26</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {lang === "fr" ? "Vice-Doyenne FSBM & Liaison" : "Vice-Dean FSBM"}
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">{labInfo?.viceDirector || "Prof. Sanaa El Filali"}</p>
              <p className="text-[11px] text-blue-600 font-medium">Professeure-Chercheure rattachée au LIAS</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {lang === "fr" ? "Établissement de Rattachement" : "Faculty Affiliation"}
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">Faculté des Sciences Ben M'Sik</p>
              <p className="text-[11px] text-slate-500">Doyen : Pr. Abdeslam EL BOUARI</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {lang === "fr" ? "Création du Laboratoire (Sec. 4.1)" : "Foundation Date"}
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1 font-mono">{labInfo?.creationDate || "2014-09-01"}</p>
              <p className="text-[11px] text-blue-600 font-medium">Accréditation Université Hassan II</p>
            </div>
          </div>
        </div>

        {/* Academic Governance & Leaders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === "fr" ? "Gouvernance & Équipes de Recherche" : "Governance & Research Teams"}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "fr" ? "Structure opérationnelle et responsables scientifiques" : "Operational structure and scientific chairs"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                  Équipe SCIC
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                  Smart Cities, IoT & Cybersécurité des Systèmes
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Responsable : <strong>Prof. Abdessamad Belangour</strong> (Président de la conférence ICAIS'25).
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">8 Chercheurs & Doctorants</span>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                  Équipe DISS
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                  Science des Données, Cloud & Systèmes Intelligents
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Responsable : <strong>Prof. Nawal Sael</strong> (Chair de la conférence ICISCT'26).
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">7 Chercheurs & Doctorants</span>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                  Équipe CHAM
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                  IA Cognitive, Santé & Modélisation Mathématique
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Responsable : <strong>Prof. Khadija Achtaich</strong> (Pionnière de l'IA cognitive pour la santé maternelle).
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">6 Chercheurs & Doctorants</span>
            </div>
          </div>
        </div>

        {/* International Conferences & Plenaries Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {lang === "fr" ? "Grandes Conférences Internationales Organisées par le LIAS" : "Major International Conferences by LIAS"}
                </h2>
                <p className="text-xs text-slate-500">
                  ICISCT'26, ICAIS'25 et l'Autumn School sur l'IA Frugale pour l'Afrique
                </p>
              </div>
            </div>
            <Link to="/events" className="text-xs font-bold text-blue-700 hover:underline">
              {lang === "fr" ? "Voir calendrier" : "View calendar"}
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase">
                  ICISCT'26 — Plénières d'Excellence
                </span>
                <span className="text-xs font-semibold text-slate-500">25–27 Juin 2026 • FSBM Casablanca</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                International Conference on Information Systems and Communication Technologies
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Sous le patronage du Doyen <strong>Pr. Abdeslam EL BOUARI</strong>, avec <strong>Prof. Nawal Sael</strong> (Chair) et <strong>Prof. Faouzia Benabbou</strong> (Co-Chair).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong className="text-blue-700">Prof. Tarek Gaber (Salford UK, Top 2% mondial)</strong> : « Cybersecurity and Resilience of AI Infrastructure in Smart Cities » (Modération : Pr. Abdessamad Belangour).
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong className="text-blue-700">Dr. Jeannice Fairrer Samani (Silicon Valley, USA)</strong> : « The Intelligence Layer: Governing Smart Cities That Perform » (Modération : Pr. Sanaa El Filali).
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong className="text-blue-700">Prof. Az Eddine Bennani (Sorbonne & NEOMA)</strong> : « Digital Twins as Instruments for Governance & Territorial Sovereignty » (Modération : Pr. Zineb Ellaky).
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong className="text-blue-700">Dr. Idriss Sekkak (Univ. Alberta)</strong> : « AI for Macroeconomic & Epidemic Dynamics: A PINN-Based Approach » (Modération : Pr. Khalid Hattaf).
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold uppercase">
                  ICAIS'25 — 1ère Édition
                </span>
                <span className="text-xs font-semibold text-slate-500">27–28 Novembre 2025 • FSBM Casablanca</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                International Conference on Artificial Intelligence & Systems
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Présidée par le <strong>Pr. Abdessamad Belangour</strong> en synergie avec les laboratoires TIM et AMS : <em>« Connecter la Théorie et la Pratique pour Catalyser l'Innovation et la Durabilité »</em>. Keynotes délivrées par Pr. Khadija Achtaich (FSBM), Pr. Anderson Rocha (Univ. Campinas, Brésil), Pr. Ana Isabel Pereira (CeDRI, Portugal), et M. Radouane Mastouri (Precision Systems).
              </p>
            </div>
          </div>
        </div>

        {/* History Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === "fr" ? "Historique & Trajectoire Scientifique" : "Scientific Trajectory & History"}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "fr" ? "De la création à l'alignement Digital Morocco 2030" : "From inception to Digital Morocco 2030"}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {labInfo?.history ||
              "Créé en 2012 au sein de la Faculté des Sciences Ben M'Sik (Université Hassan II de Casablanca), le LIAS est devenu un laboratoire de référence nationale et continentale en Intelligence Artificielle, systèmes intelligents et valorisation socio-économique."}
          </p>

          <div className="border-l-2 border-blue-500 pl-4 space-y-3 mt-4">
            <div>
              <span className="text-xs font-bold text-blue-700 font-mono">2012</span>
              <p className="text-xs text-slate-700 font-medium">Création officielle du laboratoire par le Conseil de l'Université Hassan II de Casablanca.</p>
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 font-mono">2021</span>
              <p className="text-xs text-slate-700 font-medium">Restructuration en 3 équipes de recherche majeures (SCIC, DISS, CHAM) et accréditation institutionnelle.</p>
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 font-mono">2025</span>
              <p className="text-xs text-slate-700 font-medium">Lancement réussi d'ICAIS'25 et déploiement de l'Autumn School sur l'IA frugale pour l'Afrique à Dakhla.</p>
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 font-mono">2026</span>
              <p className="text-xs text-slate-700 font-medium">Organisation de la conférence internationale ICISCT'26 avec des plénières d'experts mondiaux et modernisation de la plateforme de gestion intégrée.</p>
            </div>
          </div>
        </div>

        {/* Research Themes & Objectives */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === "fr" ? "Objectifs Scientifiques & Priorités Sociétales" : "Scientific Goals & Priorities"}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "fr" ? "Contributions alignées sur le développement socio-économique" : "Contributions aligned with socio-economic development"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>{lang === "fr" ? "Objectifs Stratégiques" : "Strategic Objectives"}</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {labInfo?.objectives?.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span><span>Production scientifique internationale de haut impact.</span></li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span><span>Encadrement doctoral d'excellence et valorisation des brevets.</span></li>
                  </>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>{lang === "fr" ? "Domaines d'Impact Prioritaires" : "Priority Impact Areas"}</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {labInfo?.domains?.map((dom: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{dom}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span><span>Villes Intelligentes & Cybersécurité</span></li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span><span>IA Cognitive pour la Santé & IA Frugale</span></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
