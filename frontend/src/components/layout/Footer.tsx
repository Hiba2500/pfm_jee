import { Link } from "react-router";
import { useLanguage } from "../../context/LanguageContext";
import LiasLogo from "../common/LiasLogo";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Lab identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LiasLogo className="h-10 w-auto" variant="icon" theme="dark" />
              <div>
                <span className="font-black text-white text-base tracking-tight">LIAS</span>
                <span className="text-[10px] text-blue-400 block font-semibold uppercase tracking-widest">
                  Intelligence Artificielle & Systèmes
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Le LIAS mène des recherches fondamentales et appliquées en IA, science des données, cloud, IoT, big data et modélisation pour répondre aux enjeux des villes intelligentes (santé, éducation, transport, agriculture, finance, cybersécurité). Aligné sur « Digital Morocco 2030 ».
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse"></span>
              <span>{lang === "fr" ? "Directrice : Prof. Faouzia Benabbou" : "Director: Prof. Faouzia Benabbou"}</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-4 text-blue-400">
              {lang === "fr" ? "Navigation" : "Navigation"}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">{t("nav.about")}</Link></li>
              <li><Link to="/teams" className="hover:text-white transition-colors">{t("nav.teams")}</Link></li>
              <li><Link to="/members" className="hover:text-white transition-colors">{t("nav.members")}</Link></li>
              <li><Link to="/publications" className="hover:text-white transition-colors">{t("nav.publications")}</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">{t("nav.events")}</Link></li>
            </ul>
          </div>

          {/* Academic Governance & Major Conferences */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-4 text-blue-400">
              {lang === "fr" ? "Conférences & Adhésion" : "Conferences & Join"}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/events" className="hover:text-white transition-colors font-medium text-blue-300">ICISCT'26 (Smart Cities & AI)</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors font-medium text-blue-300">ICAIS'25 (AI & Systems)</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Autumn School Dakhla (IA Frugale)</Link></li>
              <li><Link to="/apply" className="hover:text-white transition-colors">{lang === "fr" ? "Candidature Doctorat / Membre" : "Apply for PhD / Member"}</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">{lang === "fr" ? "Espace Enseignant / Chercheur" : "Researcher Login"}</Link></li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-4 text-blue-400">
              {lang === "fr" ? "Affiliation & Contact" : "Affiliation & Contact"}
            </h4>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Faculté des Sciences Ben M'Sik, Université Hassan II de Casablanca, BP 7955 Sidi Othman, Casablanca, Maroc</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contact@lias-lab.ma</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+212 522 704 001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Laboratoire d'Intelligence Artificielle et Systèmes (LIAS) • FSBM • UH2C • Aligné sur Digital Morocco 2030.</p>
          <div className="flex gap-4 mt-2 sm:mt-0 font-medium">
            <span>Faculté des Sciences Ben M'Sik</span>
            <span>Université Hassan II</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
