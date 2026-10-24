import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  MemberStatus,
  User,
  ResearchTeam,
  Publication,
  Event,
  MembershipApplication,
  Mandate,
  LabDocument,
  ProfileHistoryEntry,
  InternalMessage,
  LabNotification,
  EquipmentRequest,
  EquipmentItem,
  Convention,
  MeetingMinutes,
  AffiliationPeriod,
  RoleAssignment,
  AuditEntry,
  AnnualReport
} from "../src/types.js";

export const apiRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "lias-secret-key-super-secure";

// ==========================================
// IN-MEMORY DATABASE WITH INITIAL FRENCH DATA
// ==========================================

class LabDB {
  users: (User & { passwordHash: string })[] = [];
  teams: ResearchTeam[] = [];
  publications: Publication[] = [];
  events: Event[] = [];
  applications: MembershipApplication[] = [];
  mandates: Mandate[] = [];
  documents: LabDocument[] = [];
  profileHistory: ProfileHistoryEntry[] = [];
  messages: InternalMessage[] = [];
  notifications: LabNotification[] = [];
  equipmentRequests: EquipmentRequest[] = [];
  inventory: EquipmentItem[] = [];
  conventions: Convention[] = [];
  meetings: MeetingMinutes[] = [];
  roleHistory: RoleAssignment[] = [];
  audit: AuditEntry[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Research Teams
    this.teams = [
      {
        id: "team-1",
        name: "Smart Cities, IoT & Cybersécurité des Systèmes",
        acronym: "SCIC",
        leaderId: "3",
        leaderName: "Prof. Abdessamad Belangour",
        description: "Recherche sur la cybersécurité et la résilience des infrastructures IA, la gouvernance des villes intelligentes (Smart Cities & Smart Regions), les jumeaux numériques (Digital Twins) et l'IoT.",
        researchAxes: [
          "Cybersécurité & Résilience des infrastructures IA",
          "Villes et Régions Intelligentes (Smart Cities & Regions)",
          "Jumeaux Numériques (Digital Twins) & Simulation Urbaine",
          "IoT, Réseaux de Capteurs & Edge Computing"
        ],
        memberCount: 8
      },
      {
        id: "team-2",
        name: "Science des Données, Cloud & Systèmes Intelligents",
        acronym: "DISS",
        leaderId: "4",
        leaderName: "Prof. Nawal Sael",
        description: "Recherche sur les architectures Big Data, le Cloud computing, l'apprentissage automatique et les systèmes intelligents pour l'éducation, le transport et la finance.",
        researchAxes: [
          "Machine Learning & Deep Learning",
          "Architectures Cloud & Big Data Analytics",
          "Systèmes d'Information & Gouvernance des Données",
          "IA appliquée à la Finance, au Transport et à l'Éducation"
        ],
        memberCount: 7
      },
      {
        id: "team-3",
        name: "IA Cognitive, Santé & Modélisation Mathématique",
        acronym: "CHAM",
        leaderId: "6",
        leaderName: "Prof. Khadija Achtaich",
        description: "Recherche en IA cognitive pour la santé inclusive (santé maternelle et infantile), modélisation stochastique, Physics-Informed Neural Networks (PINN) et IA frugale pour l'Afrique.",
        researchAxes: [
          "Cognitive AI for Inclusive Health (Maternal & Child Care)",
          "IA Frugale & Souveraine pour l'Afrique",
          "Physics-Informed Neural Networks (PINN)",
          "Modélisation Épidémiologique & Dynamiques Stochastiques"
        ],
        memberCount: 6
      }
    ];

    // 2. Users (Director, Admin, Team Leaders, Permanent Members, PhD Students, Associated)
    const directorPass = bcrypt.hashSync("director123", 10);
    const adminPass = bcrypt.hashSync("admin123", 10);
    const memberPass = bcrypt.hashSync("member123", 10);

    this.users = [
      {
        id: "1",
        firstName: "Karim",
        lastName: "Alami",
        email: "admin@lias.com",
        passwordHash: adminPass,
        status: MemberStatus.PERMANENT,
        role: "ADMIN",
        institution: "Université Hassan II - FSBM",
        originLaboratory: "LIAS",
        biography: "Administrateur technique et système du laboratoire LIAS.",
        researchInterests: "Infrastructures distribuées, Sécurité des systèmes, Cloud académique",
        phone: "+212 522 704 001",
        office: "Bâtiment B - Bureau 101",
        createdAt: "2020-09-01T08:00:00Z"
      },
      {
        id: "2",
        firstName: "Faouzia",
        lastName: "Benabbou",
        email: "director@lias.com",
        passwordHash: directorPass,
        status: MemberStatus.PERMANENT,
        role: "DIRECTOR",
        teamId: "team-3",
        teamName: "IA Cognitive, Santé & Modélisation Mathématique (CHAM)",
        institution: "Université Hassan II de Casablanca - FSBM",
        originLaboratory: "LIAS",
        biography: "Directrice du Laboratoire Intelligence Artificielle et Systèmes (LIAS), Professeure d'Enseignement Supérieur, Co-Chair de la conférence internationale ICISCT'26. Leader de recherche en IA, IA Frugale et souveraineté technologique alignée sur « Digital Morocco 2030 ».",
        researchInterests: "Intelligence Artificielle, IA Frugale pour l'Afrique, Systèmes Intelligents, Stratégie Digital Morocco 2030, Gouvernance de la Recherche",
        phone: "+212 522 704 010",
        office: "Direction du Laboratoire LIAS - Bureau D-01",
        createdAt: "2012-01-15T08:00:00Z"
      },
      {
        id: "3",
        firstName: "Abdessamad",
        lastName: "Belangour",
        email: "a.belangour@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.PERMANENT,
        role: "TEAM_LEADER",
        teamId: "team-1",
        teamName: "Smart Cities, IoT & Cybersécurité des Systèmes (SCIC)",
        institution: "Université Hassan II de Casablanca - FSBM",
        originLaboratory: "LIAS",
        biography: "Professeur d'Enseignement Supérieur, Chef de l'équipe SCIC et Président de la conférence internationale ICAIS'25 (International Conference on Artificial Intelligence and Systems). Expert en IoT, systèmes cyber-physiques et cybersécurité des villes intelligentes.",
        researchInterests: "Smart Cities, Cybersécurité des infrastructures IA, IoT & Edge Computing, Résilience des architectures urbaines",
        phone: "+212 522 704 015",
        office: "Bâtiment A - Bureau 204",
        createdAt: "2014-03-01T08:00:00Z"
      },
      {
        id: "4",
        firstName: "Nawal",
        lastName: "Sael",
        email: "n.sael@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.PERMANENT,
        role: "TEAM_LEADER",
        teamId: "team-2",
        teamName: "Science des Données, Cloud & Systèmes Intelligents (DISS)",
        institution: "Université Hassan II de Casablanca - FSBM",
        originLaboratory: "LIAS",
        biography: "Professeure Habilitée, Responsable de l'équipe DISS et Chair de la conférence internationale ICISCT'26. Spécialiste de la science des données, de l'apprentissage automatique et des systèmes de santé intelligents.",
        researchInterests: "Machine Learning, Big Data Analytics, Cloud Computing, Systèmes d'Aide à la Décision Médicale",
        phone: "+212 522 704 020",
        office: "Bâtiment C - Bureau 112",
        createdAt: "2015-09-10T08:00:00Z"
      },
      {
        id: "5",
        firstName: "Sanaa",
        lastName: "El Filali",
        email: "s.elfilali@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.PERMANENT,
        role: "VICE_DIRECTOR",
        teamId: "team-1",
        teamName: "Smart Cities, IoT & Cybersécurité des Systèmes (SCIC)",
        institution: "Vice-Doyenne FSBM & Université Hassan II",
        originLaboratory: "LIAS",
        biography: "Vice-Doyenne de la Faculté des Sciences Ben M'Sik et Professeure-chercheure rattachée au Laboratoire LIAS. Modératrice de sessions plénières ICISCT et ICAIS sur la gouvernance de l'IA.",
        researchInterests: "Gouvernance de l'IA, Systèmes décisionnels, Villes Intelligentes, Valorisation de la recherche scientifique",
        phone: "+212 522 704 002",
        office: "Décanat FSBM / Bureau LIAS V-02",
        createdAt: "2013-05-01T08:00:00Z"
      },
      {
        id: "6",
        firstName: "Khadija",
        lastName: "Achtaich",
        email: "k.achtaich@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.PERMANENT,
        role: "TEAM_LEADER",
        teamId: "team-3",
        teamName: "IA Cognitive, Santé & Modélisation Mathématique (CHAM)",
        institution: "Université Hassan II de Casablanca - FSBM",
        originLaboratory: "LIAS",
        biography: "Professeure, PhD, Ingénieure. Conférencière plénière ICAIS'25 et participante clé de l'Autumn School Dakhla sur l'IA frugale. Pionnière de l'IA cognitive pour la santé inclusive.",
        researchInterests: "Cognitive AI for Inclusive Health, Maternal & Child Care, IA Frugale, Systèmes Intelligents pour contextes à faibles ressources",
        phone: "+212 522 704 025",
        office: "Bâtiment B - Bureau 215",
        createdAt: "2016-10-01T08:00:00Z"
      },
      {
        id: "7",
        firstName: "Fatima-zahra",
        lastName: "Alaoui",
        email: "fz.alaoui@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.PHD_STUDENT,
        role: "PHD_STUDENT",
        teamId: "team-3",
        teamName: "IA Cognitive, Santé & Modélisation Mathématique (CHAM)",
        institution: "FSBM - Université Hassan II",
        originLaboratory: "LIAS",
        biography: "Doctorante au LIAS, membre de la délégation ayant présenté ses travaux en session posters à l'Autumn School Dakhla sur l'IA frugale pour la santé.",
        researchInterests: "IA Frugale, Santé maternelle, Apprentissage automatique léger",
        phone: "+212 661 234 567",
        office: "Salle des Doctorants LIAS - Poste 01",
        createdAt: "2023-10-01T09:00:00Z"
      },
      {
        id: "8",
        firstName: "Ikram",
        lastName: "Qarbal",
        email: "i.qarbal@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.PHD_STUDENT,
        role: "PHD_STUDENT",
        teamId: "team-2",
        teamName: "Science des Données, Cloud & Systèmes Intelligents (DISS)",
        institution: "FSBM - Université Hassan II",
        originLaboratory: "LIAS",
        biography: "Doctorante au LIAS travaillant sur les modèles d'IA frugale appliquée aux systèmes éducatifs africains.",
        researchInterests: "IA pour l'Éducation, NLP, Modèles compacts, IA Durable",
        phone: "+212 662 345 678",
        office: "Salle des Doctorants LIAS - Poste 02",
        createdAt: "2023-11-01T09:00:00Z"
      },
      {
        id: "9",
        firstName: "Salma",
        lastName: "Sammah",
        email: "s.sammah@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.PHD_STUDENT,
        role: "PHD_STUDENT",
        teamId: "team-1",
        teamName: "Smart Cities, IoT & Cybersécurité des Systèmes (SCIC)",
        institution: "FSBM - Université Hassan II",
        originLaboratory: "LIAS",
        biography: "Doctorante au LIAS, spécialiste de l'IA et de l'IoT pour l'agriculture intelligente et la résilience environnementale.",
        researchInterests: "IoT Agricole, IA Frugale en Agriculture, Jumeaux Numériques",
        phone: "+212 663 456 789",
        office: "Salle des Doctorants LIAS - Poste 03",
        birthDate: "1999-04-12",
        hireDate: "2024-01-10",
        affiliationDate: "2024-01-10",
        isActive: true,
        isFrozen: false,
        createdAt: "2024-01-10T09:00:00Z"
      },
      {
        id: "10",
        firstName: "Tarek",
        lastName: "Gaber",
        email: "t.gaber@salford.ac.uk",
        passwordHash: memberPass,
        status: MemberStatus.ASSOCIATED,
        role: "ASSOCIATED",
        teamId: "team-1",
        teamName: "Smart Cities, IoT & Cybersécurité des Systèmes (SCIC)",
        institution: "University of Salford (UK) & Suez Canal University",
        originLaboratory: "Cybersecurity Research Group (Salford)",
        biography: "Professeur associé et chercheur international collaborant avec le LIAS sur la cybersécurité et la résilience des infrastructures IA des villes intelligentes (ICISCT'26). Top 2% mondial.",
        researchInterests: "Cybersecurity, AI Resilience, Smart Cities, IoT Security",
        phone: "+44 161 295 5000",
        office: "Salford Campus / LIAS Visiteur",
        birthDate: "1978-08-20",
        hireDate: "2022-09-01",
        affiliationDate: "2022-09-01",
        isActive: true,
        isFrozen: false,
        createdAt: "2022-09-01T08:00:00Z"
      },
      {
        id: "11",
        firstName: "Mostafa",
        lastName: "Bousbaa",
        email: "m.bousbaa@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.RETIRED,
        role: "MEMBER",
        teamId: "team-2",
        teamName: "Science des Données, Cloud & Systèmes Intelligents (DISS)",
        institution: "Faculté des Sciences Ben M'Sik (FSBM)",
        originLaboratory: "LIAS",
        biography: "Professeur émérite en fin de carrière ayant contribué activement à la création et à l'essor du LIAS. Compte gelé conformément aux règles du laboratoire, avec conservation intégrale de l'historique scientifique.",
        researchInterests: "Bases de données réparties, Systèmes d'information historiques",
        phone: "+212 522 704 000",
        office: "Éméritat FSBM",
        birthDate: "1958-03-15",
        hireDate: "1988-10-01",
        affiliationDate: "2012-01-15",
        affiliationHistory: [
          { id: "aff-1", startDate: "2012-01-15", endDate: "2024-08-31", reason: "Départ à la retraite après 12 ans de service actif au LIAS" }
        ],
        isFrozen: true, // Compte gelé (Section 8.1 du contrat)
        isActive: false,
        createdAt: "2012-01-15T08:00:00Z"
      },
      {
        id: "12",
        firstName: "Rachid",
        lastName: "El Haddad",
        email: "r.elhaddad@lias.com",
        passwordHash: memberPass,
        status: MemberStatus.FORMER,
        role: "MEMBER",
        teamId: "team-3",
        teamName: "IA Cognitive, Santé & Modélisation Mathématique (CHAM)",
        institution: "Anciennement FSBM (Actuellement Chaire IA à Paris)",
        originLaboratory: "LIAS",
        biography: "Ancien chercheur permanent du LIAS ayant rejoint une institution internationale. Compte désactivé avec historique conservé, réactivable par l'administrateur en cas de retour.",
        researchInterests: "Modélisation mathématique et systèmes stochastiques",
        phone: "+212 660 000 111",
        office: "Non assigné",
        birthDate: "1982-11-25",
        hireDate: "2016-09-01",
        affiliationDate: "2016-09-01",
        affiliationHistory: [
          { id: "aff-2", startDate: "2016-09-01", endDate: "2023-06-30", reason: "Mobilité internationale pour Chaire de recherche" }
        ],
        isFrozen: false,
        isActive: false, // Compte désactivé réactivable (Section 8.2 du contrat)
        createdAt: "2016-09-01T08:00:00Z"
      }
    ];

    // 3. Publications
    this.publications = [
      {
        id: "pub-1",
        title: "Cybersecurity and Resilience of AI Infrastructure in Smart Cities: Frameworks and Emerging Threats",
        authors: "T. Gaber, A. Belangour, F. Benabbou",
        year: 2026,
        type: "Conférence Internationale (ICISCT'26)",
        journalOrConference: "Proceedings of ICISCT'26, FSBM - Hassan II University",
        link: "https://doi.org/10.1109/ICISCT.2026.10492",
        doi: "10.1109/ICISCT.2026.10492",
        userId: "3",
        teamId: "team-1",
        createdAt: "2026-06-26T10:00:00Z"
      },
      {
        id: "pub-2",
        title: "Cognitive AI for Inclusive Health: Towards Intelligent Systems Supporting Maternal and Child Care in Low-Resource Contexts",
        authors: "K. Achtaich, F. Benabbou, A. Marzak",
        year: 2025,
        type: "Article de Journal / Keynote ICAIS'25",
        journalOrConference: "Springer International Journal of Artificial Intelligence & Systems",
        link: "https://doi.org/10.1007/s10462-025-0104",
        doi: "10.1007/s10462-025-0104",
        userId: "6",
        teamId: "team-3",
        createdAt: "2025-11-28T14:30:00Z"
      },
      {
        id: "pub-3",
        title: "The Intelligence Layer: Governing Smart Cities That Perform with Strategic AI Frameworks",
        authors: "J. Fairrer Samani, S. El Filali, N. Sael, F. Benabbou",
        year: 2026,
        type: "Conférence Internationale (ICISCT'26)",
        journalOrConference: "ICISCT 2026 Keynote Proceedings - Silicon Valley Collaboration",
        link: "https://doi.org/10.1109/ICISCT.2026.10498",
        doi: "10.1109/ICISCT.2026.10498",
        userId: "5",
        teamId: "team-1",
        createdAt: "2026-06-25T09:15:00Z"
      },
      {
        id: "pub-4",
        title: "From Smart City to Smart Region: Digital Twins as Instruments for Simulation, Governance, and Territorial Sovereignty",
        authors: "A. E. Bennani, Z. Ellaky, A. Belangour, F. Benabbou",
        year: 2026,
        type: "Article de Revue Internationale (Q1)",
        journalOrConference: "Elsevier Technological Forecasting and Social Change",
        link: "https://doi.org/10.1016/j.techfore.2026.12284",
        doi: "10.1016/j.techfore.2026.12284",
        userId: "3",
        teamId: "team-1",
        createdAt: "2026-06-26T11:00:00Z"
      },
      {
        id: "pub-5",
        title: "Artificial Intelligence for Stochastic Macroeconomic and Epidemic Dynamics: A PINN-Based Approach",
        authors: "I. Sekkak, K. Hattaf, N. Sael",
        year: 2026,
        type: "Conférence Internationale (ICISCT'26)",
        journalOrConference: "Physics-Informed Neural Networks Symposium, ICISCT'26",
        link: "https://doi.org/10.1109/ICISCT.2026.10512",
        doi: "10.1109/ICISCT.2026.10512",
        userId: "4",
        teamId: "team-3",
        createdAt: "2026-06-26T16:00:00Z"
      },
      {
        id: "pub-6",
        title: "Frugal AI for Sustainable Africa: Developing Sovereign Models for Education and Agriculture in Low-Resource Environments",
        authors: "F. Benabbou, K. Achtaich, F.-Z. Alaoui, I. Qarbal, S. Sammah",
        year: 2025,
        type: "Actes de l'Autumn School Dakhla",
        journalOrConference: "Autumn School Proceedings: Frugal AI for Africa",
        link: "https://doi.org/10.1007/978-3-031-70012-3",
        userId: "2",
        teamId: "team-3",
        createdAt: "2025-11-22T17:00:00Z"
      }
    ];

    // 4. Events (Real LinkedIn Events)
    this.events = [
      {
        id: "ev-1",
        title: "ICISCT'26 — International Conference on Information Systems and Communication Technologies",
        type: "Conférence Internationale",
        description: "Conférence d'envergure internationale accueillie à la Faculté des Sciences Ben M'Sik (Université Hassan II de Casablanca), centrée sur la convergence entre cybersécurité, intelligence artificielle et innovation urbaine (Smart Cities). Sessions plénières de renommée mondiale.",
        dateStart: "2026-06-25T08:30:00Z",
        dateEnd: "2026-06-27T18:00:00Z",
        location: "Faculté des Sciences Ben M'Sik, Université Hassan II de Casablanca",
        organizers: "Prof. Nawal Sael (Chair), Prof. Faouzia Benabbou (Directrice LIAS & Co-Chair), Pr. Abdeslam El Bouari (Doyen FSBM)",
        participantsCount: 250,
        isArchived: false
      },
      {
        id: "ev-2",
        title: "ICAIS'25 — International Conference on Artificial Intelligence and Systems (1ère Édition)",
        type: "Conférence Internationale",
        description: "Organisée par le LIAS sous la présidence du Pr. Abdessamad Belangour et en partenariat avec les laboratoires TIM et AMS : « Connecter la Théorie et la Pratique pour Catalyser L'innovation, la Durabilité et l'Engagement Face aux Défis de Société ».",
        dateStart: "2025-11-27T09:00:00Z",
        dateEnd: "2025-11-28T18:00:00Z",
        location: "Faculté des Sciences Ben M'Sik, Casablanca",
        organizers: "Pr. Abdessamad Belangour (Président), Prof. Faouzia Benabbou (Directrice LIAS), Pr. Sanaa El Filali",
        participantsCount: 190,
        isArchived: false
      },
      {
        id: "ev-3",
        title: "Autumn School : Frugal AI for Sustainable Africa-Powered Education (Dakhla)",
        type: "École Thématique",
        description: "Sous la présidence du Pr. Aawatif Hayar en collaboration avec l'UH2C, l'Université Hassan 1er et l'UM6P. Définition d'une feuille de route pour une IA frugale, accessible, durable et souveraine. Intervention du Prof. Faouzia Benabbou sur les modèles d'IA marocains et posters des doctorantes du LIAS.",
        dateStart: "2025-11-21T09:00:00Z",
        dateEnd: "2025-11-22T17:30:00Z",
        location: "Dakhla, Maroc",
        organizers: "Pr. Aawatif Hayar, Prof. Faouzia Benabbou, Pr. Khadija Achtaich",
        participantsCount: 110,
        isArchived: false
      },
      {
        id: "ev-4",
        title: "Plénière ICISCT'26 : Cybersecurity and Resilience of AI Infrastructure in Smart Cities",
        type: "Session Plénière",
        description: "Keynote délivrée par Prof. Tarek Gaber (University of Salford UK & Suez Canal University Egypt, Top 2% mondial des scientifiques). Modération : Pr. Abdessamad Belangour. Analyse des vulnérabilités des systèmes intelligents et de leur résilience.",
        dateStart: "2026-06-26T14:00:00Z",
        dateEnd: "2026-06-26T16:00:00Z",
        location: "Amphithéâtre 1, FSBM Casablanca",
        organizers: "Pr. Abdessamad Belangour",
        participantsCount: 170,
        isArchived: false
      },
      {
        id: "ev-5",
        title: "Plénière ICISCT'26 : The Intelligence Layer: Governing Smart Cities That Perform",
        type: "Session Plénière",
        description: "Keynote inaugurale par Dr. Jeannice Fairrer Samani, PhD, MBA (CEO Fairrer Samani Group Silicon Valley, U.S. Dept of State Delegate for Women in STEM). Modération : Pr. Sanaa El Filali.",
        dateStart: "2026-06-25T10:30:00Z",
        dateEnd: "2026-06-25T12:30:00Z",
        location: "Amphithéâtre 1, FSBM Casablanca",
        organizers: "Pr. Sanaa El Filali",
        participantsCount: 180,
        isArchived: false
      },
      {
        id: "ev-6",
        title: "Plénière ICISCT'26 : From Smart City to Smart Region: Digital Twins as Instruments for Simulation, Governance, and Territorial Sovereignty",
        type: "Session Plénière",
        description: "Keynote par Prof. Az Eddine Bennani (NEOMA Business School & Université Sorbonne, 50 ans d'expertise IA & blockchain). Modération : Pr. Zineb Ellaky. Exploration des jumeaux numériques comme instruments de simulation et de souveraineté territoriale.",
        dateStart: "2026-06-26T10:00:00Z",
        dateEnd: "2026-06-26T11:00:00Z",
        location: "Amphithéâtre 1, FSBM Casablanca",
        organizers: "Pr. Zineb Ellaky & Laboratoire LIAS",
        participantsCount: 160,
        isArchived: false
      },
      {
        id: "ev-7",
        title: "Plénière ICISCT'26 : Artificial Intelligence for Stochastic Macroeconomic and Epidemic Dynamics: A PINN-Based Approach",
        type: "Session Plénière",
        description: "Keynote par Dr. Idriss Sekkak, Ph.D (University of Alberta). Modération : Pr. Khalid Hattaf. Modélisation hybride combinant épidémiologie, macroéconomie et Physics-Informed Neural Networks.",
        dateStart: "2026-06-26T11:30:00Z",
        dateEnd: "2026-06-26T13:00:00Z",
        location: "Amphithéâtre 1, FSBM Casablanca",
        organizers: "Pr. Khalid Hattaf & Laboratoire LIAS",
        participantsCount: 145,
        isArchived: false
      },
      {
        id: "ev-8",
        title: "Sessions Plénières ICAIS'25 : IA pour la Santé et Systèmes Optimisés",
        type: "Conférence Internationale",
        description: "Keynotes délivrées par Pr. Khadija Achtaich (FSBM - Maroc, 'Cognitive AI for Inclusive Health: Maternal and Child Care', mod. Pr. Abdelaziz Marzak), Pr. Anderson Rocha (Univ. Campinas Brésil, 'AI for Health and Wellbeing', mod. Pr. Sanaa El Filali), Pr. Ana Isabel Pereira (CeDRI Portugal, 'Data, Optimization and Machine Learning'), et M. Radouane Mastouri (Precision Systems, mod. Pr. Nawal Sael).",
        dateStart: "2025-11-28T09:00:00Z",
        dateEnd: "2025-11-28T17:30:00Z",
        location: "Faculté des Sciences Ben M'Sik, Casablanca",
        organizers: "Pr. Abdessamad Belangour (Président), Pr. Nawal Sael, Pr. Sanaa El Filali",
        participantsCount: 210,
        isArchived: false
      }
    ];

    // 5. Membership Applications
    this.applications = [
      {
        id: "app-1",
        candidateName: "Youssef Berrada",
        email: "y.berrada@gmail.com",
        degree: "Master en Intelligence Artificielle & Science des Données",
        cvSummary: "Diplômé major de promotion avec mention Très Bien. Travaux de PFE sur l'application des Physics-Informed Neural Networks (PINN) et les architectures légères.",
        motivation: "Souhaite rejoindre le Laboratoire Intelligence Artificielle et Systèmes (LIAS) en doctorat sous la direction de Prof. Faouzia Benabbou dans l'équipe CHAM.",
        appliedDate: "2026-09-20T10:15:00Z",
        status: "PENDING",
        targetStatus: MemberStatus.PHD_STUDENT,
        targetTeamId: "team-3"
      },
      {
        id: "app-2",
        candidateName: "Dr. Salma Kabbaj",
        email: "s.kabbaj@univ-lorraine.fr",
        degree: "Doctorat en Informatique et Cybersécurité (2024)",
        cvSummary: "Post-doctorante avec 5 publications internationales Scopus dans le domaine de la résilience des architectures IA pour les villes intelligentes.",
        motivation: "Postule en tant que Membre Associée pour collaborer avec l'équipe SCIC (Pr. Abdessamad Belangour) sur la résilience des infrastructures critiques.",
        appliedDate: "2026-09-15T16:00:00Z",
        status: "PENDING",
        targetStatus: MemberStatus.ASSOCIATED,
        targetTeamId: "team-1"
      }
    ];

    // 6. Mandates (Governance)
    this.mandates = [
      {
        id: "man-1",
        personName: "Prof. Faouzia Benabbou",
        userId: "2",
        role: "Directrice du Laboratoire LIAS",
        startDate: "2023-01-01",
        endDate: "2027-12-31",
        active: true
      },
      {
        id: "man-2",
        personName: "Prof. Sanaa El Filali",
        userId: "5",
        role: "Vice-Doyenne FSBM & Liaison Recherche LIAS",
        startDate: "2023-09-01",
        endDate: "2027-08-31",
        active: true
      },
      {
        id: "man-3",
        personName: "Prof. Abdessamad Belangour",
        userId: "3",
        role: "Responsable d'Équipe SCIC & Président ICAIS",
        teamName: "SCIC",
        startDate: "2022-09-01",
        endDate: "2026-08-31",
        active: true
      },
      {
        id: "man-4",
        personName: "Prof. Nawal Sael",
        userId: "4",
        role: "Responsable d'Équipe DISS & Chair ICISCT'26",
        teamName: "DISS",
        startDate: "2022-09-01",
        endDate: "2026-08-31",
        active: true
      },
      {
        id: "man-5",
        personName: "Prof. Khadija Achtaich",
        userId: "6",
        role: "Responsable d'Équipe CHAM",
        teamName: "CHAM",
        startDate: "2023-01-01",
        endDate: "2026-12-31",
        active: true
      }
    ];

    // 7. Documents
    this.documents = [
      {
        id: "doc-1",
        title: "Rapport Annuel d'Activité Scientifique LIAS 2025",
        type: "Rapport d'activité",
        date: "2026-01-15T10:00:00Z",
        ownerName: "Prof. Faouzia Benabbou",
        ownerId: "2",
        fileSize: "4.8 MB",
        downloadUrl: "#"
      },
      {
        id: "doc-2",
        title: "Formulaire de Demande de Financement de Mission Internationale (CNRST)",
        type: "Demande de financement",
        date: "2026-02-01T09:30:00Z",
        ownerName: "Direction du Laboratoire LIAS",
        ownerId: "2",
        fileSize: "850 KB",
        downloadUrl: "#"
      },
      {
        id: "doc-3",
        title: "Programme Officiel et Actes de la Conférence ICISCT'26",
        type: "Programme",
        date: "2026-06-20T14:00:00Z",
        ownerName: "Prof. Nawal Sael",
        ownerId: "4",
        fileSize: "14.2 MB",
        downloadUrl: "#",
        eventRelated: "ICISCT'26"
      },
      {
        id: "doc-4",
        title: "Charte des Thèses et Règlement Intérieur du Laboratoire LIAS",
        type: "Document administratif",
        date: "2025-09-01T08:00:00Z",
        ownerName: "Secrétariat LIAS",
        ownerId: "1",
        fileSize: "1.2 MB",
        downloadUrl: "#"
      }
    ];

    // 8. Notifications
    this.notifications = [
      {
        id: "notif-1",
        userId: "2",
        title: "Nouvelle demande d'adhésion reçue",
        message: "Youssef Berrada a soumis une candidature doctorale pour l'équipe CHAM.",
        date: "2026-09-20T10:16:00Z",
        read: false,
        type: "ADHESION"
      },
      {
        id: "notif-2",
        userId: "2",
        title: "Demande d'adhésion chercheur associé",
        message: "Dr. Salma Kabbaj sollicite son rattachement à l'équipe SCIC.",
        date: "2026-09-15T16:05:00Z",
        read: false,
        type: "ADHESION"
      },
      {
        id: "notif-3",
        userId: "5",
        title: "Nouveau Séminaire Doctoral programmé",
        message: "Le séminaire 'Cybersécurité et Résilience des Infrastructures IA' aura lieu le 26 juin.",
        date: "2026-09-18T11:00:00Z",
        read: false,
        type: "EVENT"
      }
    ];

    // 9. Internal Messages
    this.messages = [
      {
        id: "msg-1",
        senderId: "2",
        senderName: "Prof. Faouzia Benabbou",
        recipient: "TOUS",
        recipientName: "Tous les membres du LIAS",
        subject: "Rappel : Organisation des Sessions Plénières ICISCT'26",
        content: "Chers collègues et doctorants, nous vous félicitons pour l'accueil des conférenciers pléniers de renommée internationale pour ICISCT'26. Merci de finaliser les actes et les présentations de vos équipes.",
        date: "2026-06-20T09:30:00Z"
      },
      {
        id: "msg-2",
        senderId: "3",
        senderName: "Prof. Abdessamad Belangour",
        recipient: "EQUIPE",
        recipientName: "Équipe SCIC",
        subject: "Bilan des sessions ICAIS'25 et préparation des publications Scopus",
        content: "Bonjour à tous, les actes d'ICAIS'25 sont en cours d'indexation. Merci de soumettre vos versions finales d'articles avant vendredi.",
        date: "2025-12-05T14:15:00Z"
      }
    ];

    // 10. Equipment Requests
    this.equipmentRequests = [
      {
        id: "eq-1",
        memberId: "7",
        memberName: "Fatima-zahra Alaoui (Doctorante)",
        title: "Serveur GPU RTX 4090 pour entraînement de modèles d'IA frugale",
        category: "Matériel Informatique Hautes Performances",
        estimatedCost: "32 000 MAD",
        justification: "Nécessaire pour le fine-tuning de modèles compacts de santé maternelle et infantile.",
        status: "APPROVED",
        date: "2026-09-18T10:00:00Z"
      },
      {
        id: "eq-2",
        memberId: "3",
        memberName: "Prof. Abdessamad Belangour",
        title: "Banc d'essai IoT et capteurs connectés pour Smart City",
        category: "Instrumentation Banc de Test IoT",
        estimatedCost: "45 000 MAD",
        justification: "Mesure de la résilience et des temps de réponse sur les infrastructures critiques urbaines.",
        status: "APPROVED",
        date: "2026-08-25T11:30:00Z"
      }
    ];

    // 11. Profile History sample
    this.profileHistory = [
      {
        id: "hist-1",
        userId: "2",
        date: "2024-01-05T09:00:00Z",
        fieldChanged: "role",
        oldValue: "Professeur / Responsable Équipe",
        newValue: "Directeur de Laboratoire"
      }
    ];

    // 12. Section 14: Gestion du matériel (Arrivages, dotations équitables, qui a reçu quoi / qui n'a pas reçu)
    this.inventory = [
      {
        id: "inv-1",
        designation: "Station de Calcul IA GPU Nvidia RTX 4090 24GB (Poste 1)",
        category: "Calcul Intensif / GPU",
        serialOrInventoryNumber: "UH2C-LIAS-2026-GPU-01",
        arrivalDate: "2026-01-15T09:00:00Z",
        supplierOrSource: "Marché Public Université Hassan II (Budget Équipement 2026)",
        status: "ATTRIBUE",
        assignedToMemberId: "7",
        assignedToMemberName: "Fatima-zahra Alaoui (Doctorante)",
        assignedDate: "2026-01-20T10:00:00Z",
        notes: "Attribuée pour l'entraînement des modèles d'IA frugale et santé maternelle"
      },
      {
        id: "inv-2",
        designation: "Station de Calcul IA GPU Nvidia RTX 4090 24GB (Poste 2)",
        category: "Calcul Intensif / GPU",
        serialOrInventoryNumber: "UH2C-LIAS-2026-GPU-02",
        arrivalDate: "2026-01-15T09:00:00Z",
        supplierOrSource: "Marché Public Université Hassan II (Budget Équipement 2026)",
        status: "ATTRIBUE",
        assignedToMemberId: "8",
        assignedToMemberName: "Ikram Qarbal (Doctorante)",
        assignedDate: "2026-01-20T10:00:00Z",
        notes: "Attribuée pour la modélisation NLP des systèmes éducatifs"
      },
      {
        id: "inv-3",
        designation: "Banc de Test IoT & Passerelles Edge LoRaWAN Multi-canaux",
        category: "Réseaux de Capteurs / IoT",
        serialOrInventoryNumber: "UH2C-LIAS-2025-IOT-09",
        arrivalDate: "2025-10-10T14:00:00Z",
        supplierOrSource: "Dotation Projet CNRST Smart City",
        status: "ATTRIBUE",
        assignedToMemberId: "3",
        assignedToMemberName: "Prof. Abdessamad Belangour",
        assignedDate: "2025-10-15T11:00:00Z",
        notes: "Plateforme d'expérimentation des architectures résilientes"
      },
      {
        id: "inv-4",
        designation: "Kit Capteurs Agro-Environnementaux & Microcontrôleurs Basse Consommation",
        category: "Réseaux de Capteurs / IoT",
        serialOrInventoryNumber: "UH2C-LIAS-2025-AGRO-03",
        arrivalDate: "2025-11-05T08:30:00Z",
        supplierOrSource: "Programme National Recherche & Développement",
        status: "ATTRIBUE",
        assignedToMemberId: "9",
        assignedToMemberName: "Salma Sammah (Doctorante)",
        assignedDate: "2025-11-12T09:30:00Z",
        notes: "Projet IoT agricole et résilience hydrique"
      },
      {
        id: "inv-5",
        designation: "Serveur Rackable Bi-Processeur Intel Xeon Gold + 128GB RAM",
        category: "Infrastructure Serveur",
        serialOrInventoryNumber: "UH2C-LIAS-2026-SRV-01",
        arrivalDate: "2026-02-01T10:00:00Z",
        supplierOrSource: "Dotation FSBM Casablanca",
        status: "DISPONIBLE",
        notes: "Disponible pour affectation équitable au prochain chercheur éligible"
      },
      {
        id: "inv-6",
        designation: "Oscilloscope Numérique 4 Canaux 200MHz avec Sondes Différentielles",
        category: "Instrumentation Banc de Test",
        serialOrInventoryNumber: "UH2C-LIAS-2026-OSC-01",
        arrivalDate: "2026-02-15T15:00:00Z",
        supplierOrSource: "Fournisseur Agréé Labo Instruments",
        status: "DISPONIBLE",
        notes: "En attente d'attribution pour banc de test cyber-sécurité matérielle"
      },
      {
        id: "inv-7",
        designation: "Ordinateur Portable Haute Performance Core i9 64GB",
        category: "Matériel Informatique Mobile",
        serialOrInventoryNumber: "UH2C-LIAS-2026-MOB-04",
        arrivalDate: "2026-03-01T11:00:00Z",
        supplierOrSource: "Budget Laboratoire LIAS 2026",
        status: "ATTRIBUE",
        assignedToMemberId: "4",
        assignedToMemberName: "Prof. Nawal Sael",
        assignedDate: "2026-03-05T09:00:00Z",
        notes: "Attribution validée par la direction pour l'analyse Big Data et pilotage ICISCT"
      }
    ];

    // 13. Section 16: Conventions & Collaborations
    this.conventions = [
      {
        id: "conv-1",
        title: "Partenariat Stratégique de Recherche CNRST — Pôle Excellence IA & Big Data",
        partnerName: "Centre National pour la Recherche Scientifique et Technique (CNRST)",
        partnerType: "ORGANISME_RECHERCHE",
        startDate: "2023-01-01",
        endDate: "2027-12-31",
        status: "ACTIVE",
        description: "Financement des projets de recherche prioritaires, bourses d'excellence pour doctorants du LIAS et participation aux réseaux thématiques nationaux.",
        activities: [
          "Bourses d'excellence doctorale pour 5 thèses LIAS",
          "Financement d'équipements de calcul GPU haute performance",
          "Participation aux séminaires nationaux Digital Morocco 2030"
        ],
        budgetOrResources: "1 200 000 MAD",
        contactPerson: "Dr. Responsable Pôle Recherche CNRST"
      },
      {
        id: "conv-2",
        title: "Accord de Coopération Internationale LIAS — University of Salford (Royaume-Uni)",
        partnerName: "University of Salford (UK) - Cybersecurity Research Group",
        partnerType: "INTERNATIONAL",
        startDate: "2024-03-01",
        endDate: "2028-02-28",
        status: "ACTIVE",
        description: "Coopération scientifique sur la résilience des infrastructures IA dans les Smart Cities, co-organisation des conférences ICISCT'26, co-tutelles et mobilités.",
        activities: [
          "Plénière d'ouverture ICISCT'26 délivrée par Prof. Tarek Gaber",
          "Co-publications de rang Q1 en résilience et cybersécurité urbaine",
          "Programme d'échange de doctorants et chercheurs invités"
        ],
        budgetOrResources: "Partenariat bilatéral & bourses de mobilité",
        contactPerson: "Prof. Tarek Gaber (University of Salford)"
      },
      {
        id: "conv-3",
        title: "Collaboration Technologique & Institutionnelle — Fairrer Samani Group (Silicon Valley, USA)",
        partnerName: "Fairrer Samani Group (Silicon Valley)",
        partnerType: "INTERNATIONAL",
        startDate: "2025-01-15",
        endDate: "2027-01-14",
        status: "ACTIVE",
        description: "Partenariat sur la gouvernance de l'IA pour les Smart Cities, le transfert technologique et la promotion du leadership des femmes en sciences (Women in STEM).",
        activities: [
          "Keynote plénière ICISCT'26 par Dr. Jeannice Fairrer Samani",
          "Mentorat pour jeunes chercheures et doctorantes du LIAS",
          "Ateliers conjoints sur la gouvernance éthique de l'IA"
        ],
        budgetOrResources: "Apport d'expertise & co-parrainage international",
        contactPerson: "Dr. Jeannice Fairrer Samani, PhD, MBA"
      },
      {
        id: "conv-4",
        title: "Convention de Recherche et Développement Industriel — Precision Systems",
        partnerName: "Precision Systems Maroc",
        partnerType: "INDUSTRIE",
        startDate: "2024-09-01",
        endDate: "2026-08-31",
        status: "ACTIVE",
        description: "Développement conjoint de solutions d'IA appliquées à la santé, traitement intelligent des données biomédicales et valorisation des brevets.",
        activities: [
          "Keynote conjointe ICAIS'25 sur l'IA au service de la santé",
          "Encadrement de projets de fin d'études et stages doctoraux",
          "Banc d'essai de validation clinique des algorithmes de santé"
        ],
        budgetOrResources: "350 000 MAD / an",
        contactPerson: "M. Radouane Mastouri (Directeur Technique)"
      },
      {
        id: "conv-5",
        title: "Accord-Cadre de Recherche Académique — CeDRI & Institut Polytechnique de Bragança (Portugal)",
        partnerName: "CeDRI - Research Centre in Digitalization and Intelligent Robotics",
        partnerType: "UNIVERSITE",
        startDate: "2023-06-01",
        endDate: "2026-05-31",
        status: "ACTIVE",
        description: "Recherche conjointe en science des données, optimisation mathématique et machine learning pour les systèmes autonomes.",
        activities: [
          "Keynote ICAIS'25 par Pr. Ana Isabel Pereira",
          "Co-rédaction d'articles scientifiques Scopus",
          "Projets conjoints Erasmus+ Mobilité Internationale"
        ],
        budgetOrResources: "Fonds Erasmus+ & dotations de laboratoire",
        contactPerson: "Pr. Ana Isabel Pereira"
      }
    ];

    // 14. Section 17: Procès-verbaux (PV de réunions)
    this.meetings = [
      {
        id: "pv-1",
        title: "Conseil de Laboratoire Ordinaire — Bilan Annuel 2025 et Planification ICISCT'26",
        meetingType: "Conseil de laboratoire",
        date: "2026-01-18T10:00:00Z",
        location: "Salle des Conseils, Faculté des Sciences Ben M'Sik",
        agenda: [
          "Adoption du procès-verbal de la session précédente",
          "Bilan scientifique et financier du laboratoire LIAS pour l'exercice 2025",
          "Organisation de la conférence internationale ICISCT'26 (Comités, plénières, budget)",
          "Arbitrage et affectation des arrivages de matériel GPU et IoT",
          "Validation des demandes d'adhésion des doctorants et chercheurs associés"
        ],
        decisions: [
          "Approbation à l'unanimité du rapport annuel d'activité 2025 pour transmission au Doyen",
          "Validation de la grille de distribution équitable des stations de calcul GPU",
          "Acceptation de la candidature de Youssef Berrada en doctorat (Équipe CHAM)",
          "Validation du rattachement de Prof. Tarek Gaber en qualité de Membre Associé"
        ],
        attendees: [
          "Prof. Faouzia Benabbou (Directrice)",
          "Prof. Sanaa El Filali (Vice-Doyenne FSBM)",
          "Prof. Abdessamad Belangour (Chef d'équipe SCIC)",
          "Prof. Nawal Sael (Chef d'équipe DISS)",
          "Prof. Khadija Achtaich (Chef d'équipe CHAM)",
          "Karim Alami (Administrateur)"
        ],
        absentees: ["Dr. Représentant Doctorant (Excusé pour soutenance)"],
        documentUrl: "#pv-conseil-2026-01-18",
        secretaryName: "Prof. Sanaa El Filali"
      },
      {
        id: "pv-2",
        title: "Commission Scientifique — Répartition Équitable des Équipements & Arbitrage des Thèses",
        meetingType: "Commission scientifique",
        date: "2026-04-10T14:30:00Z",
        location: "Salle de Réunion LIAS, Bâtiment Recherche",
        agenda: [
          "Examen des besoins en matériel exprimés par les équipes de recherche",
          "Évaluation des critères d'équité : priorité aux doctorants sans dotation matérielle",
          "Suivi des thèses en cours et organisation des comités de suivi de thèse (CST)",
          "Préparation des actes de colloque pour publication dans les séries indexées"
        ],
        decisions: [
          "Attribution prioritaire de la station GPU Poste 1 à Fatima-Zahra Alaoui et Poste 2 à Ikram Qarbal",
          "Mise à disposition partagée des serveurs rackables Dell pour l'ensemble des 3 équipes",
          "Validation des dates de soutenance de thèse prévues pour l'automne 2026"
        ],
        attendees: [
          "Prof. Faouzia Benabbou",
          "Prof. Abdessamad Belangour",
          "Prof. Nawal Sael",
          "Prof. Khadija Achtaich"
        ],
        documentUrl: "#pv-commission-2026-04-10",
        secretaryName: "Prof. Nawal Sael"
      },
      {
        id: "pv-3",
        title: "Assemblée Générale du Laboratoire LIAS — Rentrée Universitaire & Conventions",
        meetingType: "Assemblée générale",
        date: "2025-09-22T09:30:00Z",
        location: "Grand Amphithéâtre FSBM",
        agenda: [
          "Mot d'accueil de la Directrice et présentation des orientations stratégiques Digital Morocco 2030",
          "Présentation des nouvelles conventions internationales (Salford UK, Silicon Valley)",
          "Intégration des nouveaux doctorants et remise de la Charte des Thèses",
          "Calendrier des séminaires doctoraux bimensuels"
        ],
        decisions: [
          "Adoption du calendrier des séminaires scientifiques 2025-2026",
          "Validation des axes de recherche prioritaires : IA Cognitive, Santé Inclusive, Frugal AI",
          "Mise en place de la plateforme collaborative de gestion du laboratoire"
        ],
        attendees: [
          "Prof. Faouzia Benabbou",
          "Prof. Sanaa El Filali",
          "Prof. Abdessamad Belangour",
          "Prof. Nawal Sael",
          "Prof. Khadija Achtaich",
          "Ensemble des enseignants-chercheurs et doctorants du LIAS"
        ],
        documentUrl: "#pv-ag-2025-09-22",
        secretaryName: "Karim Alami"
      }
    ];
  }
}

const db = new LabDB();

// Historique initial des rôles : chaque membre démarre avec son rôle actuel (section 7)
db.users.forEach(u => {
  // Chaque membre démarre avec au moins une période d'affiliation et une entrée de statut historisées
  const startDay = (u.affiliationDate || u.createdAt || new Date().toISOString()).slice(0, 10);
  if (!u.affiliationHistory || u.affiliationHistory.length === 0) {
    u.affiliationHistory = [{ id: `aff-${u.id}-0`, startDate: startDay, reason: "Adhésion initiale" }];
  }
  if (!u.statusHistory || u.statusHistory.length === 0) {
    u.statusHistory = [{ id: `st-${u.id}-0`, status: u.status, date: `${startDay}T00:00:00.000Z`, reason: "Statut initial" }];
  }
  db.roleHistory.push({
    id: `role-${u.id}-0`,
    userId: u.id,
    role: u.role,
    startDate: (u.affiliationDate || u.createdAt || new Date().toISOString()).slice(0, 10),
    reason: "Rôle initial"
  });
});

const today = () => new Date().toISOString().slice(0, 10);

/** Journalisation de toute action importante (section 21 : tout est traçable). */
function logAudit(actor: { id: string; firstName?: string; lastName?: string } | undefined, action: string, target?: string, details?: string) {
  db.audit.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
    actorId: actor?.id || "system",
    actorName: actor ? `${actor.firstName || ""} ${actor.lastName || ""}`.trim() : "Système",
    action,
    target,
    details
  });
}

/** Changement de rôle : on clôture la période précédente, on ouvre la nouvelle, on ne supprime rien. */
function assignRole(user: any, newRole: any, reason: string) {
  if (user.role === newRole) return;
  const open = db.roleHistory.find(r => r.userId === user.id && !r.endDate);
  if (open) open.endDate = today();
  db.roleHistory.unshift({ id: `role-${user.id}-${Date.now()}`, userId: user.id, role: newRole, startDate: today(), reason });
  user.role = newRole;
}

/** Changement de statut : historisé (section 21 : séparation statut / rôle). */
function changeStatus(user: any, newStatus: MemberStatus, reason: string) {
  user.statusHistory = user.statusHistory || [];
  user.statusHistory.unshift({ id: `st-${Date.now()}`, status: newStatus, date: new Date().toISOString(), reason });
  user.status = newStatus;
}

function closeAffiliation(user: any, reason: string) {
  user.affiliationHistory = user.affiliationHistory || [];
  const open = user.affiliationHistory.find((p: AffiliationPeriod) => !p.endDate);
  if (open) { open.endDate = today(); open.reason = reason; }
}

function openAffiliation(user: any, reason: string) {
  user.affiliationHistory = user.affiliationHistory || [];
  if (user.affiliationHistory.some((p: AffiliationPeriod) => !p.endDate)) return;
  user.affiliationHistory.push({ id: `aff-${user.id}-${Date.now()}`, startDate: today(), reason });
  user.affiliationDate = user.affiliationDate || today();
}

// ==========================================
// MIDDLEWARES
// ==========================================

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Authentification requise" });

  jwt.verify(token, JWT_SECRET, (err: any, payload: any) => {
    if (err) return res.status(403).json({ error: "Session expirée ou invalide" });
    // Le rôle et l'état du compte sont relus en base : un gel / une désactivation / un changement de rôle
    // prend effet immédiatement, sans attendre l'expiration du jeton.
    const account = db.users.find(u => u.id === payload.id);
    if (!account) return res.status(401).json({ error: "Compte introuvable" });
    const blocked = accountBlockedMessage(account);
    if (blocked) return res.status(403).json({ error: blocked });
    req.user = { ...payload, role: account.role, status: account.status };
    next();
  });
}

/** Section 8 : retraité = compte gelé, ancien membre = compte désactivé. */
function accountBlockedMessage(u: any): string | null {
  if (u.isFrozen || u.status === MemberStatus.RETIRED) {
    return "Compte gelé (retraité) : aucun accès actif. L'historique est conservé.";
  }
  if (u.isActive === false || u.status === MemberStatus.FORMER) {
    return "Compte désactivé (ancien membre). Contactez l'administration pour une réactivation.";
  }
  return null;
}

function optionalUser(req: any) {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    return db.users.find(u => u.id === payload.id) || null;
  } catch { return null; }
}

/** Retire les données confidentielles (date de naissance, section 4.2) sauf pour soi-même, le directeur ou l'admin. */
function sanitizeMember(u: any, viewer: any) {
  const { passwordHash, ...safe } = u;
  const privileged = viewer && (viewer.id === u.id || viewer.role === "DIRECTOR" || viewer.role === "ADMIN");
  if (!privileged) delete safe.birthDate;
  return safe;
}

function requireDirectorOrAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "DIRECTOR" && req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Privilèges Directeur ou Administrateur requis" });
  }
  next();
}

/** Section 5.2 : décisions métier réservées au directeur dont le mandat est actif (l'admin est purement technique). */
function requireDirector(req: any, res: any, next: any) {
  if (req.user?.role !== "DIRECTOR") {
    return res.status(403).json({ error: "Action réservée au Directeur du laboratoire en mandat" });
  }
  const now = today();
  const hasMandate = db.mandates.some(m =>
    m.userId === req.user.id && /^direct/i.test(m.role) && m.active && m.startDate <= now && m.endDate >= now
  );
  if (!hasMandate) {
    return res.status(403).json({ error: "Aucun mandat de direction actif pour cet utilisateur" });
  }
  next();
}

/** Section 2.2 C : les doctorants n'ont aucun accès aux modules internes. */
function requireInternalAccess(req: any, res: any, next: any) {
  if (req.user?.role === "PHD_STUDENT" || req.user?.status === MemberStatus.PHD_STUDENT) {
    return res.status(403).json({ error: "Les doctorants n'ont pas accès aux modules internes du laboratoire" });
  }
  next();
}

/** Section 2.2 B : les membres associés consultent uniquement (pas de dépôt ni d'écriture interne). */
function requireFullMember(req: any, res: any, next: any) {
  if (req.user?.role === "ASSOCIATED" || req.user?.status === MemberStatus.ASSOCIATED) {
    return res.status(403).json({ error: "Les membres associés disposent d'un accès en consultation uniquement" });
  }
  requireInternalAccess(req, res, next);
}

// ==========================================
// PUBLIC & VISITOR ROUTES
// ==========================================

// Laboratory General Info
apiRouter.get("/lab-info", (req, res) => {
  res.json({
    name: "Laboratoire d'Intelligence Artificielle et Systèmes",
    acronym: "LIAS",
    creationYear: 2012,
    affiliation: "Université Hassan II de Casablanca - Faculté des Sciences Ben M'Sik (FSBM)",
    director: "Prof. Faouzia Benabbou",
    viceDirector: "Prof. Sanaa El Filali",
    totalMembers: db.users.length,
    totalPublications: db.publications.length,
    totalEvents: db.events.length,
    description: "Le LIAS mène des recherches fondamentales et appliquées en IA, science des données, cloud, IoT, big data et modélisation mathématique pour répondre aux enjeux des villes intelligentes (santé, éducation, transport, agriculture, finance, cybersécurité). Aligné sur « Digital Morocco 2030 », le laboratoire vise l’excellence scientifique et l’impact socio‑économique par l’innovation et les partenariats publics‑privés.",
    domains: [
      "Intelligence Artificielle & Villes Intelligentes (Smart Cities & Smart Regions)",
      "Cybersécurité & Résilience des Infrastructures IA",
      "Science des Données, Cloud & Big Data Analytics",
      "IA Cognitive pour la Santé Inclusive (Maternal & Child Care)",
      "IA Frugale & Souveraine pour l'Afrique (Éducation, Agriculture)",
      "Jumeaux Numériques (Digital Twins) & Modélisation Mathématique (PINN)"
    ],
    history: "Le Laboratoire d'Intelligence Artificielle et Systèmes (LIAS) de la Faculté des Sciences Ben M'Sik (Université Hassan II de Casablanca) s'est imposé comme un pôle scientifique structurant de l'IA au Maroc et en Afrique. Porté par une vision d'excellence et d'impact sociétal, il organise des conférences internationales majeures telles que ICISCT'26 et ICAIS'25, et s'investit dans la formation de doctorants de pointe et le développement d'une IA souveraine et frugale.",
    objectives: [
      "Mener des recherches de pointe fondamentales et appliquées en IA et systèmes intelligents",
      "Accompagner la transition numérique nationale dans le cadre de la stratégie « Digital Morocco 2030 »",
      "Renforcer la cybersécurité et la résilience des infrastructures critiques des villes intelligentes",
      "Développer des solutions d'IA frugales et souveraines adaptées aux réalités socio-économiques africaines",
      "Organiser des manifestations scientifiques internationales de haut niveau (ICISCT'26, ICAIS'25, Autumn School Dakhla)",
      "Catalyser l'innovation par des partenariats publics-privés et des projets à fort impact sociétal"
    ]
  });
});

// Teams
apiRouter.get("/teams", (req, res) => {
  res.json(db.teams);
});

apiRouter.get("/teams/:id", (req, res) => {
  const team = db.teams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: "Équipe introuvable" });
  const members = db.users.filter(u => u.teamId === team.id).map(({ passwordHash, ...u }) => u);
  res.json({ ...team, members });
});

// Members (Public Directory with search & filters)
apiRouter.get("/members", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase();
  const status = req.query.status as string;
  const team = req.query.team as string;

  const viewer = optionalUser(req);
  let filtered = db.users.map(u => sanitizeMember(u, viewer));

  if (query) {
    filtered = filtered.filter((u: any) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) ||
      (u.researchInterests && u.researchInterests.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  }

  if (status) {
    filtered = filtered.filter((u: any) => u.status === status);
  }

  if (team) {
    filtered = filtered.filter((u: any) => u.teamId === team);
  }

  res.json(filtered);
});

// Publications (Public with search by title, author, year, type)
apiRouter.get("/publications", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase();
  const year = req.query.year ? parseInt(req.query.year as string) : undefined;
  const type = req.query.type as string;

  let filtered = [...db.publications];

  if (query) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.authors.toLowerCase().includes(query) ||
      (p.journalOrConference && p.journalOrConference.toLowerCase().includes(query))
    );
  }

  if (year) {
    filtered = filtered.filter(p => p.year === year);
  }

  if (type) {
    filtered = filtered.filter(p => p.type.toLowerCase().includes(type.toLowerCase()));
  }

  // Sort descending by year
  filtered.sort((a, b) => b.year - a.year);
  res.json(filtered);
});

// Events (Public Calendar)
apiRouter.get("/events", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase();
  const showArchived = req.query.archived === "true";

  let filtered = db.events.filter(e => showArchived ? true : !e.isArchived);

  if (query) {
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(query) ||
      e.location.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query)
    );
  }

  filtered.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
  res.json(filtered);
});

// Submit membership application (Visitor)
apiRouter.post("/applications", (req, res) => {
  const { candidateName, email, degree, cvSummary, motivation, targetStatus, targetTeamId } = req.body;

  if (!candidateName || !email || !motivation) {
    return res.status(400).json({ error: "Veuillez renseigner tous les champs obligatoires (nom, email, motivation)." });
  }

  const application: MembershipApplication = {
    id: `app-${Date.now()}`,
    candidateName,
    email,
    degree: degree || "Non spécifié",
    cvSummary: cvSummary || "CV fourni lors de la candidature",
    motivation,
    appliedDate: new Date().toISOString(),
    status: "PENDING",
    targetStatus: targetStatus || MemberStatus.PHD_STUDENT,
    targetTeamId
  };

  db.applications.unshift(application);

  // Notify Director
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: "2",
    title: "Nouvelle candidature d'adhésion",
    message: `${candidateName} (${email}) a soumis une demande d'adhésion pour le statut ${targetStatus || 'Doctorant'}.`,
    date: new Date().toISOString(),
    read: false,
    type: "ADHESION"
  });

  res.status(201).json({ message: "Votre candidature a été transmise avec succès au Directeur du laboratoire.", application });
});

// ==========================================
// AUTHENTICATION & PROFILE
// ==========================================

apiRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Veuillez renseigner votre email et mot de passe." });
  }

  let searchEmail = String(email).toLowerCase().trim();
  // Support legacy test emails seamlessly
  if (searchEmail === "n.chraibi@lias.com") searchEmail = "s.elfilali@lias.com";
  if (searchEmail === "a.tazi@lias.com") searchEmail = "fz.alaoui@lias.com";
  if (searchEmail === "m.benjelloun@lias.com") searchEmail = "director@lias.com";

  const user = db.users.find(u => u.email.toLowerCase() === searchEmail);

  if (!user) return res.status(401).json({ error: "Identifiants invalides (email ou mot de passe incorrect)" });

  const validPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!validPassword) return res.status(401).json({ error: "Identifiants invalides (email ou mot de passe incorrect)" });

  const blocked = accountBlockedMessage(user);
  if (blocked) return res.status(403).json({ error: blocked });

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

  logAudit(user, "LOGIN", user.email);
  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

apiRouter.post("/auth/register", (req, res) => {
  // Section 6 : aucun compte ne se crée sans validation du directeur. L'inscription directe est donc
  // convertie en demande d'adhésion (statut PENDING) au lieu de créer un compte actif.
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Cette adresse email est déjà enregistrée." });
  }
  if (db.applications.find(a => a.email.toLowerCase() === email.toLowerCase() && a.status === "PENDING")) {
    return res.status(400).json({ error: "Une demande d'adhésion est déjà en cours pour cette adresse email." });
  }
  db.applications.unshift({
    id: `app-${Date.now()}`,
    candidateName: `${firstName} ${lastName}`,
    email,
    degree: "Non spécifié",
    cvSummary: "Demande créée via le formulaire d'inscription",
    motivation: "Demande d'adhésion via inscription en ligne",
    appliedDate: new Date().toISOString(),
    status: "PENDING",
    targetStatus: MemberStatus.PHD_STUDENT
  });
  db.notifications.unshift({
    id: `notif-${Date.now()}`, userId: "2", title: "Nouvelle demande d'adhésion",
    message: `${firstName} ${lastName} (${email}) demande à rejoindre le laboratoire.`,
    date: new Date().toISOString(), read: false, type: "ADHESION"
  });
  return res.status(202).json({ message: "Votre demande d'adhésion a été transmise au Directeur. Un compte vous sera créé après validation." });
});

apiRouter.get("/members/me", authenticateToken, (req: any, res: any) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// Update Profile with mandatory History logging
apiRouter.put("/members/me", authenticateToken, (req: any, res: any) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  const fields = ["firstName", "lastName", "institution", "originLaboratory", "biography", "researchInterests", "phone", "office"];
  const now = new Date().toISOString();

  fields.forEach(field => {
    if (req.body[field] !== undefined && req.body[field] !== (user as any)[field]) {
      db.profileHistory.unshift({
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        date: now,
        fieldChanged: field,
        oldValue: String((user as any)[field] || ""),
        newValue: String(req.body[field])
      });
      (user as any)[field] = req.body[field];
    }
  });

  const { passwordHash, ...safe } = user;
  res.json({ message: "Profil mis à jour et historisé avec succès.", user: safe });
});

apiRouter.get("/profile/history", authenticateToken, (req: any, res: any) => {
  const userHistory = db.profileHistory.filter(h => h.userId === req.user.id);
  res.json(userHistory);
});

// ==========================================
// MEMBER & RESEARCHER ACTIONS
// ==========================================

// Add Publication
apiRouter.post("/publications", authenticateToken, (req: any, res: any) => {
  const { title, authors, year, type, journalOrConference, link, doi } = req.body;
  if (!title || !authors || !year) {
    return res.status(400).json({ error: "Titre, auteurs et année sont obligatoires." });
  }

  const pub: Publication = {
    id: `pub-${Date.now()}`,
    title,
    authors,
    year: Number(year),
    type: type || "Article de Journal",
    journalOrConference,
    link,
    doi,
    userId: req.user.id,
    createdAt: new Date().toISOString()
  };

  db.publications.unshift(pub);
  res.status(201).json(pub);
});

// Edit own publication
apiRouter.put("/publications/:id", authenticateToken, (req: any, res: any) => {
  const pub = db.publications.find(p => p.id === req.params.id);
  if (!pub) return res.status(404).json({ error: "Publication non trouvée" });

  // Only author or Director/Admin can edit
  if (pub.userId !== req.user.id && req.user.role !== "DIRECTOR" && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres publications" });
  }

  Object.assign(pub, req.body);
  res.json({ message: "Publication mise à jour", publication: pub });
});

// Delete own publication
apiRouter.delete("/publications/:id", authenticateToken, (req: any, res: any) => {
  const index = db.publications.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Publication introuvable" });

  const pub = db.publications[index];
  if (pub.userId !== req.user.id && req.user.role !== "DIRECTOR" && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Action non autorisée sur cette publication" });
  }

  db.publications.splice(index, 1);
  res.json({ message: "Publication supprimée" });
});

// Event Participation
apiRouter.post("/events/:id/participate", authenticateToken, (req: any, res: any) => {
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Événement non trouvé" });

  event.participantsCount = (event.participantsCount || 0) + 1;
  res.json({ message: "Votre inscription à l'événement a été validée.", event });
});

// ==========================================
// DOCUMENT MANAGEMENT
// ==========================================

apiRouter.get("/documents", authenticateToken, requireInternalAccess, (req: any, res: any) => {
  const type = req.query.type as string;
  const search = (req.query.search as string || "").toLowerCase();

  let docs = [...db.documents];
  const eventFilter = (req.query.event as string || "").toLowerCase();
  const yearFilter = req.query.year ? parseInt(req.query.year as string) : undefined;

  if (type) {
    docs = docs.filter(d => d.type === type);
  }
  if (eventFilter) {
    docs = docs.filter(d => (d.eventRelated || "").toLowerCase().includes(eventFilter) || d.eventId === req.query.event);
  }
  if (yearFilter) {
    docs = docs.filter(d => new Date(d.date).getFullYear() === yearFilter);
  }
  docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (search) {
    docs = docs.filter(d =>
      d.title.toLowerCase().includes(search) ||
      d.ownerName.toLowerCase().includes(search)
    );
  }

  res.json(docs);
});

apiRouter.post("/documents", authenticateToken, requireFullMember, (req: any, res: any) => {
  const { title, type, fileSize, eventRelated, eventId } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: "Titre et type de document sont obligatoires" });
  }

  const user = db.users.find(u => u.id === req.user.id);

  const doc: LabDocument = {
    id: `doc-${Date.now()}`,
    title,
    type,
    date: new Date().toISOString(),
    ownerName: user ? `${user.firstName} ${user.lastName}` : "Membre LIAS",
    ownerId: req.user.id,
    fileSize: fileSize || "1.5 MB",
    downloadUrl: "#",
    eventRelated,
    eventId,
    // Historisation : un dépôt du même titre pour le même événement crée une nouvelle version
    version: db.documents.filter(d => d.title === title && d.eventRelated === eventRelated).length + 1
  };

  db.documents.unshift(doc);
  logAudit(user, "DOCUMENT_UPLOADED", doc.title, `${doc.type} v${doc.version}`);

  // Notify team members
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: "ALL",
    title: "Nouveau document déposé",
    message: `${doc.ownerName} a ajouté le document '${doc.title}' (${doc.type}).`,
    date: new Date().toISOString(),
    read: false,
    type: "DOCUMENT"
  });

  res.status(201).json(doc);
});

// ==========================================
// COMMUNICATION & INTERNAL MESSAGING
// ==========================================

apiRouter.get("/messages", authenticateToken, requireInternalAccess, (req: any, res: any) => {
  res.json(db.messages);
});

apiRouter.post("/messages", authenticateToken, requireFullMember, (req: any, res: any) => {
  const { recipient, recipientName, subject, content } = req.body;
  if (!subject || !content) {
    return res.status(400).json({ error: "Sujet et contenu du message requis" });
  }

  const sender = db.users.find(u => u.id === req.user.id);
  const msg: InternalMessage = {
    id: `msg-${Date.now()}`,
    senderId: req.user.id,
    senderName: sender ? `${sender.firstName} ${sender.lastName}` : "Membre",
    recipient: recipient || "TOUS",
    recipientName: recipientName || "Tous les membres",
    subject,
    content,
    date: new Date().toISOString()
  };

  db.messages.unshift(msg);
  res.status(201).json(msg);
});

// Notifications
apiRouter.get("/notifications", authenticateToken, (req: any, res: any) => {
  const userNotifs = db.notifications.filter(n => n.userId === req.user.id || n.userId === "ALL");
  res.json(userNotifs);
});

apiRouter.post("/notifications/:id/read", authenticateToken, (req: any, res: any) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// ==========================================
// DIRECTOR GOVERNANCE & APPLICATIONS
// ==========================================

// Applications List
apiRouter.get("/applications", authenticateToken, requireDirector, (req, res) => {
  res.json(db.applications);
});

// Decision on Application (ACCEPT / REJECT)
apiRouter.post("/applications/:id/decision", authenticateToken, requireDirector, (req: any, res: any) => {
  const { decision, assignedRole, assignedTeamId } = req.body;
  const application = db.applications.find(a => a.id === req.params.id);

  if (!application) return res.status(404).json({ error: "Demande introuvable" });
  if (decision !== "ACCEPTED" && decision !== "REJECTED") {
    return res.status(400).json({ error: "Décision invalide (ACCEPTED ou REJECTED attendu)" });
  }
  if (application.status !== "PENDING") {
    return res.status(409).json({ error: "Cette demande a déjà été traitée" });
  }

  const director = db.users.find(u => u.id === req.user.id);
  application.status = decision;
  application.reviewedAt = new Date().toISOString();

  if (decision === "ACCEPTED") {
    if (db.users.find(u => u.email.toLowerCase() === application.email.toLowerCase())) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
    }
    const names = application.candidateName.split(" ");
    const firstName = names[0] || "Nouveau";
    const lastName = names.slice(1).join(" ") || "Membre";
    const initialPass = "lias2026";
    const team = db.teams.find(t => t.id === assignedTeamId);
    const role = assignedRole || (application.targetStatus === MemberStatus.PHD_STUDENT ? "PHD_STUDENT" : application.targetStatus === MemberStatus.ASSOCIATED ? "ASSOCIATED" : "MEMBER");

    const newUser: User & { passwordHash: string } = {
      id: String(Date.now()),
      firstName,
      lastName,
      email: application.email,
      passwordHash: bcrypt.hashSync(initialPass, 10),
      status: application.targetStatus,
      role,
      teamId: assignedTeamId,
      teamName: team ? team.name : undefined,
      biography: application.motivation,
      affiliationDate: today(),
      affiliationHistory: [{ id: `aff-${Date.now()}`, startDate: today(), reason: "Adhésion validée par la direction" }],
      statusHistory: [{ id: `st-${Date.now()}`, status: application.targetStatus, date: new Date().toISOString(), reason: "Adhésion" }],
      isActive: true,
      isFrozen: false,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.roleHistory.unshift({ id: `role-${newUser.id}-0`, userId: newUser.id, role, startDate: today(), reason: "Adhésion" });

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      title: "Adhésion acceptée au Laboratoire LIAS",
      message: `Félicitations ! Votre demande d'adhésion au laboratoire a été acceptée par la Direction. Mot de passe initial : ${initialPass} (à changer à la première connexion).`,
      date: new Date().toISOString(),
      read: false,
      type: "ADHESION"
    });
  } else {
    // Refusée → notification (le candidat n'a pas de compte : notification adressée à son email)
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: `email:${application.email}`,
      title: "Demande d'adhésion refusée",
      message: `Votre demande d'adhésion au laboratoire LIAS n'a pas été retenue.`,
      date: new Date().toISOString(),
      read: false,
      type: "ADHESION"
    });
  }

  logAudit(director, `APPLICATION_${decision}`, application.candidateName, application.email);

  res.json({
    message: decision === "ACCEPTED" ? "Candidature acceptée et compte membre généré avec succès." : "Candidature refusée. Décision enregistrée et candidat notifié.",
    application
  });
});

// Governance: Mandates Management
apiRouter.get("/mandates", (req, res) => {
  res.json(db.mandates);
});

apiRouter.post("/mandates", authenticateToken, requireDirector, (req: any, res: any) => {
  const { personName, userId, role, teamName, startDate, endDate } = req.body;
  if (!personName || !role || !startDate || !endDate) {
    return res.status(400).json({ error: "Tous les champs de mandat sont obligatoires" });
  }
  if (endDate < startDate) {
    return res.status(400).json({ error: "La date de fin doit être postérieure à la date de début" });
  }

  const target = userId ? db.users.find(u => u.id === userId) : undefined;
  const isDirectorMandate = /^direct/i.test(role);
  const isViceMandate = /^vice-?direct/i.test(role);
  const isTeamLeadMandate = /(chef|responsable)\s+d['’]équipe/i.test(role);

  // Un seul directeur actif à la fois : l'ancien mandat est clôturé, jamais supprimé.
  if (isDirectorMandate) {
    db.mandates.filter(m => m.active && /^direct/i.test(m.role)).forEach(m => {
      m.active = false;
      if (m.endDate > today()) m.endDate = today();
      const previous = db.users.find(u => u.id === m.userId);
      if (previous && target && previous.id !== target.id) assignRole(previous, "MEMBER", "Fin de mandat de direction");
    });
  }

  const mandate: Mandate = {
    id: `man-${Date.now()}`,
    personName,
    userId: userId || `user-${Date.now()}`,
    role,
    teamName,
    startDate,
    endDate,
    active: endDate >= today() && startDate <= today()
  };
  db.mandates.unshift(mandate);

  // Le rôle du membre suit le mandat (le statut, lui, ne change pas : séparation statut / rôle).
  if (target && mandate.active) {
    if (isDirectorMandate) assignRole(target, "DIRECTOR", `Mandat : ${role}`);
    else if (isViceMandate) assignRole(target, "VICE_DIRECTOR", `Mandat : ${role}`);
    else if (isTeamLeadMandate) assignRole(target, "TEAM_LEADER", `Mandat : ${role}`);
  }

  logAudit(db.users.find(u => u.id === req.user.id), "MANDATE_CREATED", personName, `${role} ${startDate} → ${endDate}`);
  res.status(201).json(mandate);
});

// Event Management (Create, Archive)
apiRouter.post("/events", authenticateToken, requireDirector, (req: any, res: any) => {
  const { title, description, type, dateStart, dateEnd, location, organizers, edition, series } = req.body;
  if (!title || !dateStart || !location) {
    return res.status(400).json({ error: "Titre, date et lieu sont obligatoires" });
  }
  if (dateEnd && dateEnd < dateStart) {
    return res.status(400).json({ error: "La date de fin doit être postérieure à la date de début" });
  }

  const event: Event = {
    id: `ev-${Date.now()}`,
    title,
    description: description || "",
    type: type || "Conférence",
    dateStart,
    dateEnd: dateEnd || dateStart,
    location,
    organizers: organizers || "Direction LIAS",
    participantsCount: 0,
    isArchived: false,
    edition: edition ? Number(edition) : undefined,
    series: series || undefined
  };

  db.events.unshift(event);
  logAudit(db.users.find(u => u.id === req.user.id), "EVENT_CREATED", event.title, event.type);

  // Notify lab
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: "ALL",
    title: "Nouvel événement scientifique au laboratoire",
    message: `${event.title} (${event.type}) a été programmé le ${new Date(dateStart).toLocaleDateString("fr-FR")}.`,
    date: new Date().toISOString(),
    read: false,
    type: "EVENT"
  });

  res.status(201).json(event);
});

apiRouter.post("/events/:id/archive", authenticateToken, requireDirector, (req, res) => {
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Événement introuvable" });

  event.isArchived = true;
  logAudit(db.users.find(u => u.id === (req as any).user.id), "EVENT_ARCHIVED", event.title);
  res.json({ message: "Événement archivé", event });
});

// Equipment Requests (Director view & Member submit)
apiRouter.get("/equipment-requests", authenticateToken, (req: any, res: any) => {
  if (req.user.role === "DIRECTOR" || req.user.role === "ADMIN") {
    return res.json(db.equipmentRequests);
  }
  const memberRequests = db.equipmentRequests.filter(r => r.memberId === req.user.id);
  res.json(memberRequests);
});

apiRouter.post("/equipment-requests", authenticateToken, requireFullMember, (req: any, res: any) => {
  const { title, category, estimatedCost, justification } = req.body;
  const user = db.users.find(u => u.id === req.user.id);

  const reqItem: EquipmentRequest = {
    id: `eq-${Date.now()}`,
    memberId: req.user.id,
    memberName: user ? `${user.firstName} ${user.lastName}` : "Membre",
    title,
    category,
    estimatedCost,
    justification,
    status: "PENDING",
    date: new Date().toISOString()
  };

  db.equipmentRequests.unshift(reqItem);
  res.status(201).json(reqItem);
});

apiRouter.post("/equipment-requests/:id/decision", authenticateToken, requireDirector, (req: any, res: any) => {
  const { decision } = req.body;
  const item = db.equipmentRequests.find(r => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Demande introuvable" });
  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return res.status(400).json({ error: "Décision invalide (APPROVED ou REJECTED attendu)" });
  }

  item.status = decision;
  db.notifications.unshift({
    id: `notif-${Date.now()}`, userId: item.memberId,
    title: decision === "APPROVED" ? "Demande de matériel validée" : "Demande de matériel refusée",
    message: `Votre demande « ${item.title} » a été ${decision === "APPROVED" ? "validée" : "refusée"} par la direction.`,
    date: new Date().toISOString(), read: false, type: "MESSAGE"
  });
  logAudit(db.users.find(u => u.id === req.user.id), `EQUIPMENT_${decision}`, item.title, item.memberName);
  res.json({ message: "Statut de la demande de matériel mis à jour", item });
});

// Dashboard Director Stats
apiRouter.get("/stats", authenticateToken, (req: any, res: any) => {
  const pendingApps = db.applications.filter(a => a.status === "PENDING").length;
  const pendingEquip = db.equipmentRequests.filter(e => e.status === "PENDING").length;
  const upcomingEvents = db.events.filter(e => !e.isArchived).length;

  res.json({
    totalMembers: db.users.length,
    totalPublications: db.publications.length,
    totalEvents: db.events.length,
    pendingApplications: pendingApps,
    pendingEquipments: pendingEquip,
    upcomingEvents,
    annualReportStatus: "Ébauche 2026 en cours de consolidation (78% complet)",
    activeMandatesCount: db.mandates.filter(m => m.active).length
  });
});

// ==========================================
// SECTION 14: GESTION DU MATÉRIEL & DISTRIBUTION ÉQUITABLE
// ==========================================
apiRouter.get("/inventory", (req, res) => {
  // Members who have received equipment
  const assignedMemberIds = new Set(
    db.inventory
      .filter(item => item.assignedToMemberId)
      .map(item => item.assignedToMemberId)
  );

  const activeMembers = db.users.filter(u => u.status === MemberStatus.PERMANENT || u.status === MemberStatus.PHD_STUDENT);

  const whoReceived = activeMembers.filter(m => assignedMemberIds.has(m.id)).map(m => {
    const items = db.inventory.filter(item => item.assignedToMemberId === m.id);
    return {
      memberId: m.id,
      name: `${m.firstName} ${m.lastName}`,
      role: m.role,
      status: m.status,
      teamName: m.teamName,
      items
    };
  });

  const whoDidNotReceive = activeMembers.filter(m => !assignedMemberIds.has(m.id)).map(m => ({
    memberId: m.id,
    name: `${m.firstName} ${m.lastName}`,
    role: m.role,
    status: m.status,
    teamName: m.teamName,
    eligibleForNextArrival: true
  }));

  res.json({
    inventory: db.inventory,
    arrivalsCount: db.inventory.length,
    allocatedCount: db.inventory.filter(i => i.status === "ATTRIBUE").length,
    availableCount: db.inventory.filter(i => i.status === "DISPONIBLE").length,
    whoReceived,
    whoDidNotReceive,
    equityRate: activeMembers.length > 0 ? Math.round((whoReceived.length / activeMembers.length) * 100) : 0
  });
});

apiRouter.post("/inventory", authenticateToken, requireDirector, (req: any, res: any) => {
  const { designation, category, serialOrInventoryNumber, supplierOrSource, notes } = req.body;
  if (!designation) return res.status(400).json({ error: "La désignation du matériel est obligatoire" });

  const newItem: EquipmentItem = {
    id: `inv-${Date.now()}`,
    designation,
    category: category || "Matériel Général",
    serialOrInventoryNumber: serialOrInventoryNumber || `UH2C-LIAS-${Date.now().toString().slice(-4)}`,
    arrivalDate: new Date().toISOString(),
    supplierOrSource: supplierOrSource || "Marché Public Université",
    status: "DISPONIBLE",
    notes
  };

  db.inventory.unshift(newItem);
  res.status(201).json(newItem);
});

apiRouter.post("/inventory/:id/assign", authenticateToken, requireDirector, (req: any, res: any) => {
  const { memberId } = req.body;
  const item = db.inventory.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Équipement introuvable" });

  const member = db.users.find(u => u.id === memberId);
  if (!member) return res.status(404).json({ error: "Membre introuvable" });

  item.status = "ATTRIBUE";
  item.assignedToMemberId = member.id;
  item.assignedToMemberName = `${member.firstName} ${member.lastName}`;
  item.assignedDate = new Date().toISOString();

  // Notify member
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: member.id,
    title: "Attribution de matériel de recherche",
    message: `L'équipement « ${item.designation} » vous a été affecté par la direction du laboratoire.`,
    date: new Date().toISOString(),
    read: false,
    type: "DOCUMENT"
  });

  res.json({ message: "Équipement attribué avec succès", item });
});

// ==========================================
// SECTION 16: CONVENTIONS & COLLABORATIONS
// ==========================================
apiRouter.get("/conventions", (req, res) => {
  const type = req.query.type as string;
  const status = req.query.status as string;

  let filtered = [...db.conventions];
  if (type && type !== "ALL") filtered = filtered.filter(c => c.partnerType === type);
  if (status && status !== "ALL") filtered = filtered.filter(c => c.status === status);

  res.json(filtered);
});

apiRouter.post("/conventions", authenticateToken, requireDirector, (req: any, res: any) => {
  const { title, partnerName, partnerType, startDate, endDate, description, activities, budgetOrResources, contactPerson } = req.body;
  if (!title || !partnerName || !startDate || !endDate) {
    return res.status(400).json({ error: "Titre, partenaire et dates sont obligatoires" });
  }

  const conv: Convention = {
    id: `conv-${Date.now()}`,
    title,
    partnerName,
    partnerType: partnerType || "UNIVERSITE",
    startDate,
    endDate,
    status: new Date(endDate) >= new Date() ? "ACTIVE" : "CLOTUREE",
    description: description || "",
    activities: activities || ["Coopération scientifique", "Échanges de chercheurs"],
    budgetOrResources,
    contactPerson
  };

  db.conventions.unshift(conv);
  res.status(201).json(conv);
});

// ==========================================
// SECTION 17: PROCÈS-VERBAUX (PV DE RÉUNIONS)
// ==========================================
apiRouter.get("/meetings", (req, res) => {
  res.json(db.meetings);
});

apiRouter.post("/meetings", authenticateToken, requireDirector, (req: any, res: any) => {
  const { title, meetingType, date, location, agenda, decisions, attendees, absentees } = req.body;
  if (!title || !date || !meetingType) {
    return res.status(400).json({ error: "Titre, type et date de réunion obligatoires" });
  }

  const meeting: MeetingMinutes = {
    id: `pv-${Date.now()}`,
    title,
    meetingType,
    date,
    location: location || "Salle de Réunion LIAS - FSBM",
    agenda: Array.isArray(agenda) ? agenda : [agenda].filter(Boolean),
    decisions: Array.isArray(decisions) ? decisions : [decisions].filter(Boolean),
    attendees: Array.isArray(attendees) ? attendees : ["Direction et Membres"],
    absentees: Array.isArray(absentees) ? absentees : [],
    documentUrl: `#pv-${Date.now()}`,
    secretaryName: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Secrétariat de séance"
  };

  db.meetings.unshift(meeting);

  // Also archive as a LabDocument
  db.documents.unshift({
    id: `doc-${Date.now()}`,
    title: `PV : ${meeting.title}`,
    type: "Document administratif",
    date: meeting.date,
    ownerName: meeting.secretaryName,
    ownerId: req.user.id,
    fileSize: "1.8 MB",
    downloadUrl: meeting.documentUrl
  });

  res.status(201).json(meeting);
});

// ==========================================
// SECTION 18: RECHERCHE GLOBALE TRANSVERSE
// ==========================================
apiRouter.get("/search/global", (req, res) => {
  const q = ((req.query.q as string) || "").toLowerCase().trim();
  if (!q) {
    return res.json({ members: [], publications: [], events: [], documents: [], conventions: [], meetings: [] });
  }

  const members = db.users
    .filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || (u.researchInterests && u.researchInterests.toLowerCase().includes(q)))
    .map(u => sanitizeMember(u, optionalUser(req)));

  const publications = db.publications.filter(p =>
    p.title.toLowerCase().includes(q) || p.authors.toLowerCase().includes(q) || (p.journalOrConference && p.journalOrConference.toLowerCase().includes(q))
  );

  const events = db.events.filter(e =>
    e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.organizers.toLowerCase().includes(q)
  );

  const documents = db.documents.filter(d =>
    d.title.toLowerCase().includes(q) || d.type.toLowerCase().includes(q)
  );

  const conventions = db.conventions.filter(c =>
    c.title.toLowerCase().includes(q) || c.partnerName.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );

  const meetings = db.meetings.filter(m =>
    m.title.toLowerCase().includes(q) || m.agenda.some(a => a.toLowerCase().includes(q)) || m.decisions.some(d => d.toLowerCase().includes(q))
  );

  res.json({
    query: q,
    totalResults: members.length + publications.length + events.length + documents.length + conventions.length + meetings.length,
    members,
    publications,
    events,
    documents,
    conventions,
    meetings
  });
});

// ==========================================
// SECTION 20: CALENDRIER INTÉRACTIF (NAVIGATION TEMPORELLE)
// ==========================================
apiRouter.get("/calendar", (req, res) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = req.query.month ? parseInt(req.query.month as string) : undefined;

  const eventItems = db.events.map(e => ({
    id: e.id,
    title: e.title,
    category: "EVENT",
    subType: e.type,
    date: e.dateStart,
    dateEnd: e.dateEnd,
    location: e.location,
    details: e.description,
    organizers: e.organizers
  }));

  const meetingItems = db.meetings.map(m => ({
    id: m.id,
    title: m.title,
    category: "MEETING",
    subType: m.meetingType,
    date: m.date,
    location: m.location,
    details: m.agenda.join(" • "),
    organizers: m.secretaryName
  }));

  let combined = [...eventItems, ...meetingItems];

  if (month !== undefined) {
    combined = combined.filter(item => {
      const d = new Date(item.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  } else {
    combined = combined.filter(item => {
      const d = new Date(item.date);
      return d.getFullYear() === year;
    });
  }

  combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  res.json({
    year,
    month,
    total: combined.length,
    items: combined
  });
});

// ==========================================
// SECTION 8: DÉPART ET RETRAITE (GEL ET RÉACTIVATION)
// ==========================================
apiRouter.post("/members/:id/freeze", authenticateToken, requireDirectorOrAdmin, (req: any, res: any) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Membre introuvable" });
  if (user.role === "DIRECTOR" || user.role === "ADMIN") {
    return res.status(409).json({ error: "Impossible de geler un compte de direction ou d'administration" });
  }

  closeAffiliation(user, req.body?.reason || "Départ à la retraite");
  changeStatus(user, MemberStatus.RETIRED, req.body?.reason || "Départ à la retraite");
  user.isFrozen = true;
  user.isActive = false;

  logAudit(db.users.find(u => u.id === req.user.id), "MEMBER_FROZEN", `${user.firstName} ${user.lastName}`, "Retraite");
  const { passwordHash, ...safe } = user;
  res.json({ message: "Compte gelé avec conservation intégrale de l'historique (Départ à la retraite)", user: safe });
});

apiRouter.post("/members/:id/toggle-active", authenticateToken, requireDirectorOrAdmin, (req: any, res: any) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Membre introuvable" });
  if (user.isFrozen) {
    return res.status(409).json({ error: "Compte gelé (retraité) : il ne peut être ni désactivé ni réactivé" });
  }
  if (user.role === "DIRECTOR" || user.role === "ADMIN") {
    return res.status(409).json({ error: "Impossible de désactiver un compte de direction ou d'administration" });
  }

  const reactivate = user.isActive === false;
  if (reactivate) {
    // Un ancien membre peut revenir : nouvelle période d'affiliation, anciennes périodes conservées.
    user.isActive = true;
    changeStatus(user, (req.body?.status as MemberStatus) || MemberStatus.PERMANENT, "Réactivation");
    openAffiliation(user, "Retour au laboratoire");
  } else {
    closeAffiliation(user, req.body?.reason || "Départ du laboratoire");
    user.isActive = false;
    changeStatus(user, MemberStatus.FORMER, req.body?.reason || "Départ du laboratoire");
  }

  logAudit(db.users.find(u => u.id === req.user.id), reactivate ? "MEMBER_REACTIVATED" : "MEMBER_DEACTIVATED", `${user.firstName} ${user.lastName}`);
  const { passwordHash, ...safe } = user;
  res.json({ message: user.isActive ? "Compte réactivé" : "Compte désactivé (Ancien membre)", user: safe });
});

// ==========================================
// SECTIONS 3, 7, 21 : HISTORIQUES (affiliations, rôles, statuts, profil) ET RÔLES
// ==========================================
apiRouter.get("/members/:id/history", authenticateToken, (req: any, res: any) => {
  const id = req.params.id === "me" ? req.user.id : req.params.id;
  if (id !== req.user.id && req.user.role !== "DIRECTOR" && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Accès à l'historique réservé au membre, au directeur ou à l'administrateur" });
  }
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "Membre introuvable" });
  res.json({
    userId: id,
    affiliations: user.affiliationHistory || [],
    roles: db.roleHistory.filter(r => r.userId === id),
    statuses: user.statusHistory || [],
    profileChanges: db.profileHistory.filter(h => h.userId === id),
    mandates: db.mandates.filter(m => m.userId === id)
  });
});

// Changement de rôle (le statut reste inchangé). Directeur uniquement ; rien n'est supprimé.
apiRouter.post("/members/:id/role", authenticateToken, requireDirector, (req: any, res: any) => {
  const { role, reason } = req.body;
  const allowed = ["VICE_DIRECTOR", "TEAM_LEADER", "MEMBER", "PHD_STUDENT", "ASSOCIATED"];
  if (!allowed.includes(role)) {
    return res.status(400).json({ error: `Rôle invalide. Valeurs possibles : ${allowed.join(", ")}` });
  }
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Membre introuvable" });
  if (user.role === "DIRECTOR" || user.role === "ADMIN") {
    return res.status(409).json({ error: "Le rôle du directeur se modifie via un mandat" });
  }
  const before = user.role;
  assignRole(user, role, reason || "Changement de rôle décidé par la direction");
  logAudit(db.users.find(u => u.id === req.user.id), "ROLE_CHANGED", `${user.firstName} ${user.lastName}`, `${before} → ${role}`);
  const { passwordHash, ...safe } = user;
  res.json({ message: "Rôle mis à jour (historique conservé)", user: safe });
});

// ==========================================
// SECTION 21 : JOURNAL D'AUDIT
// ==========================================
apiRouter.get("/audit", authenticateToken, requireDirectorOrAdmin, (req: any, res: any) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  res.json(db.audit.slice(0, limit));
});

// ==========================================
// SECTION 11 : RAPPORT D'ACTIVITÉ ANNUEL (génération automatique)
// ==========================================
function buildAnnualReport(year: number, generatedBy: string): AnnualReport {
  const inYear = (d?: string) => !!d && new Date(d).getFullYear() === year;
  const events = db.events.filter(e => inYear(e.dateStart));
  const publications = db.publications.filter(p => p.year === year);

  const publicationsByTeam: Record<string, number> = {};
  const publicationsByType: Record<string, number> = {};
  publications.forEach(p => {
    const teamName = db.teams.find(t => t.id === p.teamId)?.acronym || "Non affectée";
    publicationsByTeam[teamName] = (publicationsByTeam[teamName] || 0) + 1;
    publicationsByType[p.type] = (publicationsByType[p.type] || 0) + 1;
  });

  const newMembers: AnnualReport["newMembers"] = [];
  const departures: AnnualReport["departures"] = [];
  db.users.forEach(u => {
    (u.affiliationHistory || []).forEach(p => {
      if (inYear(p.startDate)) newMembers.push({ name: `${u.firstName} ${u.lastName}`, status: u.status, date: p.startDate });
      if (inYear(p.endDate)) departures.push({ name: `${u.firstName} ${u.lastName}`, reason: p.reason || "", date: p.endDate! });
    });
  });

  const applications = db.applications.filter(a => inYear(a.appliedDate));
  const conventions = db.conventions.filter(c => inYear(c.startDate) || (c.startDate <= `${year}-12-31` && c.endDate >= `${year}-01-01`));
  const meetings = db.meetings.filter(m => inYear(m.date));
  const documents = db.documents.filter(d => inYear(d.date));
  const requests = db.equipmentRequests.filter(r => inYear(r.date));
  const arrivals = db.inventory.filter(i => inYear(i.arrivalDate));
  const assigned = db.inventory.filter(i => inYear(i.assignedDate));
  const mandates = db.mandates.filter(m => m.startDate <= `${year}-12-31` && m.endDate >= `${year}-01-01`);

  return {
    year,
    generatedAt: new Date().toISOString(),
    generatedBy,
    laboratory: "Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca",
    summary: {
      events: events.length,
      publications: publications.length,
      newMembers: newMembers.length,
      departures: departures.length,
      applications: applications.length,
      conventions: conventions.length,
      meetings: meetings.length,
      documents: documents.length,
      equipmentArrivals: arrivals.length
    },
    events,
    publications,
    publicationsByTeam,
    publicationsByType,
    newMembers,
    departures,
    applications: {
      total: applications.length,
      accepted: applications.filter(a => a.status === "ACCEPTED").length,
      rejected: applications.filter(a => a.status === "REJECTED").length,
      pending: applications.filter(a => a.status === "PENDING").length
    },
    conventions,
    meetings,
    documents,
    equipment: {
      arrivals: arrivals.length,
      assigned: assigned.length,
      requests: requests.length,
      approvedRequests: requests.filter(r => r.status === "APPROVED").length
    },
    mandates
  };
}

function reportToMarkdown(r: AnnualReport): string {
  const L: string[] = [];
  L.push(`# Rapport d'activité annuel ${r.year}`, `**${r.laboratory}**`, `Généré le ${new Date(r.generatedAt).toLocaleDateString("fr-FR")} par ${r.generatedBy}`, "");
  L.push("## 1. Synthèse");
  Object.entries(r.summary).forEach(([k, v]) => L.push(`- ${k} : ${v}`));
  L.push("", "## 2. Gouvernance");
  r.mandates.forEach(m => L.push(`- ${m.role} — ${m.personName} (${m.startDate} → ${m.endDate})`));
  L.push("", "## 3. Événements scientifiques");
  r.events.forEach(e => L.push(`- ${e.title} (${e.type}${e.edition ? `, ${e.edition}e édition` : ""}) — ${e.dateStart.slice(0, 10)}, ${e.location}`));
  L.push("", "## 4. Publications");
  r.publications.forEach(p => L.push(`- ${p.title} — ${p.authors} (${p.type}${p.journalOrConference ? `, ${p.journalOrConference}` : ""})`));
  L.push("", "Répartition par équipe : " + (Object.entries(r.publicationsByTeam).map(([k, v]) => `${k}: ${v}`).join(", ") || "—"));
  L.push("", "## 5. Mouvements de membres");
  r.newMembers.forEach(m => L.push(`- Arrivée : ${m.name} (${m.status}) le ${m.date}`));
  r.departures.forEach(m => L.push(`- Départ : ${m.name} le ${m.date}${m.reason ? ` — ${m.reason}` : ""}`));
  L.push("", `## 6. Demandes d'adhésion\n- Total ${r.applications.total} · acceptées ${r.applications.accepted} · refusées ${r.applications.rejected} · en attente ${r.applications.pending}`);
  L.push("", "## 7. Conventions et collaborations");
  r.conventions.forEach(c => L.push(`- ${c.title} — ${c.partnerName} (${c.status})`));
  L.push("", "## 8. Réunions et procès-verbaux");
  r.meetings.forEach(m => L.push(`- ${m.title} (${m.date.slice(0, 10)}) : ${m.decisions.length} décision(s)`));
  L.push("", "## 9. Matériel", `- Arrivages : ${r.equipment.arrivals} · attributions : ${r.equipment.assigned} · demandes : ${r.equipment.requests} (validées : ${r.equipment.approvedRequests})`);
  return L.join("\n");
}

apiRouter.get("/reports/annual/:year", authenticateToken, requireDirector, (req: any, res: any) => {
  const year = parseInt(req.params.year);
  if (!year || year < 2000 || year > 2100) return res.status(400).json({ error: "Année invalide" });
  const director = db.users.find(u => u.id === req.user.id);
  const report = buildAnnualReport(year, director ? `${director.firstName} ${director.lastName}` : "Direction");
  logAudit(director, "ANNUAL_REPORT_GENERATED", String(year));
  if (req.query.format === "markdown") {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="rapport-annuel-LIAS-${year}.md"`);
    return res.send(reportToMarkdown(report));
  }
  res.json(report);
});
