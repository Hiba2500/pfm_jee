import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "fr" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    "nav.home": "Accueil",
    "nav.about": "À Propos",
    "nav.teams": "Équipes de Recherche",
    "nav.members": "Membres",
    "nav.publications": "Publications",
    "nav.events": "Événements",
    "nav.calendar": "Calendrier",
    "nav.apply": "Adhésion",
    "nav.dashboard": "Tableau de Bord",
    "nav.login": "Connexion",
    "nav.logout": "Déconnexion",
    "lab.title": "Laboratoire d'Intelligence Artificielle et Systèmes",
    "lab.tagline": "Recherche en IA, Villes Intelligentes, Cybersécurité & Science des Données — Digital Morocco 2030",
    "lab.affiliation": "Université Hassan II de Casablanca - Faculté des Sciences Ben M'Sik (FSBM)",
    "btn.exploreResearch": "Explorer les Publications",
    "btn.ourTeam": "Découvrir nos Équipes",
    "btn.applyNow": "Déposer une Candidature",
    "btn.save": "Enregistrer",
    "btn.cancel": "Annuler",
    "btn.delete": "Supprimer",
    "btn.edit": "Modifier",
    "btn.search": "Rechercher",
    "btn.participate": "Participer",
    "btn.download": "Télécharger",
    "btn.upload": "Déposer un Document",
    "role.director": "Directeur",
    "role.viceDirector": "Vice-Directeur",
    "role.teamLeader": "Chef d'Équipe",
    "role.member": "Membre Permanent",
    "role.phdStudent": "Doctorant",
    "role.associated": "Membre Associé",
    "role.admin": "Administrateur"
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.teams": "Research Teams",
    "nav.members": "Members",
    "nav.publications": "Publications",
    "nav.events": "Events",
    "nav.calendar": "Calendar",
    "nav.apply": "Join Lab",
    "nav.dashboard": "Dashboard",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "lab.title": "Artificial Intelligence and Systems Laboratory",
    "lab.tagline": "Research in AI, Smart Cities, Cybersecurity & Data Science — Digital Morocco 2030",
    "lab.affiliation": "Hassan II University of Casablanca - Faculty of Sciences Ben M'Sik (FSBM)",
    "btn.exploreResearch": "Explore Research",
    "btn.ourTeam": "Our Teams",
    "btn.applyNow": "Apply for Membership",
    "btn.save": "Save",
    "btn.cancel": "Cancel",
    "btn.delete": "Delete",
    "btn.edit": "Edit",
    "btn.search": "Search",
    "btn.participate": "Participate",
    "btn.download": "Download",
    "btn.upload": "Upload Document",
    "role.director": "Director",
    "role.viceDirector": "Vice-Director",
    "role.teamLeader": "Team Leader",
    "role.member": "Permanent Member",
    "role.phdStudent": "PhD Student",
    "role.associated": "Associated Member",
    "role.admin": "Administrator"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("preferred_lang") as Language) || "fr";
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("preferred_lang", newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
