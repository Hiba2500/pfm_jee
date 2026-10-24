export enum MemberStatus {
  PERMANENT = "PERMANENT",
  ASSOCIATED = "ASSOCIATED",
  PHD_STUDENT = "PHD_STUDENT",
  RETIRED = "RETIRED",
  FORMER = "FORMER"
}

export type Role = "DIRECTOR" | "VICE_DIRECTOR" | "TEAM_LEADER" | "MEMBER" | "PHD_STUDENT" | "ASSOCIATED" | "ADMIN";

export interface AffiliationPeriod {
  id: string;
  startDate: string;
  endDate?: string;
  reason?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  photoUrl?: string;
  title?: string;
  specialty?: string;
  status: MemberStatus;
  role: Role;
  teamId?: string;
  teamName?: string;
  institution?: string;
  originLaboratory?: string;
  biography?: string;
  researchInterests?: string;
  phone?: string;
  office?: string;
  officeNumber?: string;
  orcid?: string;
  googleScholarUrl?: string;
  researchGateUrl?: string;
  birthDate?: string; // Confidentielle (Exigée par le contrat Section 4.2)
  hireDate?: string; // Date d'embauche
  affiliationDate?: string; // Date d'affiliation au laboratoire (clé métier)
  affiliationHistory?: AffiliationPeriod[]; // Historique départs/retours
  statusHistory?: { id: string; status: MemberStatus; date: string; reason?: string }[];
  isFrozen?: boolean; // Pour retraités (compte gelé, aucun accès actif)
  isActive?: boolean; // Pour anciens membres (désactivé, réactivable)
  createdAt: string;
}

export interface ResearchTeam {
  id: string;
  name: string;
  acronym: string;
  leaderId: string;
  leaderName: string;
  description: string;
  researchAxes: string[];
  memberCount: number;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: string;
  journalOrConference?: string;
  link?: string;
  doi?: string;
  userId: string;
  teamId?: string;
  createdAt?: string;
}

export type EventType = "Conférence" | "Séminaire" | "Atelier / Workshop" | "Conférence Internationale" | "Session Plénière" | "École Thématique" | string;

export interface Event {
  id: string;
  title: string;
  type: EventType;
  description: string;
  dateStart: string;
  dateEnd: string;
  location: string;
  organizers: string;
  participantsCount?: number;
  isArchived?: boolean;
  edition?: number; // Archivage par édition (ex: 2e édition d'une conférence)
  series?: string; // Nom de la série d'événements (ex: ICAIS)
}

export interface MembershipApplication {
  id: string;
  candidateName: string;
  email: string;
  degree: string;
  cvSummary: string;
  motivation: string;
  appliedDate: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  reviewedAt?: string;
  targetStatus: MemberStatus;
  targetTeamId?: string;
}

export interface Mandate {
  id: string;
  personName: string;
  userId: string;
  role: "Directeur" | "Vice-Directeur" | "Responsable d'Équipe" | string;
  teamName?: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface LabDocument {
  id: string;
  title: string;
  type: "Demande de financement" | "Programme" | "Certificat" | "Rapport d'activité" | "Document administratif";
  date: string;
  ownerName: string;
  ownerId: string;
  fileSize: string;
  downloadUrl?: string;
  eventRelated?: string;
  eventId?: string;
  version?: number; // Historisation des versions
}

export interface ProfileHistoryEntry {
  id: string;
  userId: string;
  date: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
}

export interface InternalMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipient: "TOUS" | "EQUIPE" | string;
  recipientName: string;
  subject: string;
  content: string;
  date: string;
}

export interface LabNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "ADHESION" | "EVENT" | "DOCUMENT" | "MESSAGE" | "MANDATE";
}

export interface EquipmentRequest {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  category: string;
  estimatedCost: string;
  justification: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  date: string;
}

// Section 14: Gestion du matériel (Arrivages, distribution équitable, qui a reçu quoi / qui n'a pas reçu)
export interface EquipmentItem {
  id: string;
  designation: string;
  category: string;
  serialOrInventoryNumber: string;
  arrivalDate: string;
  supplierOrSource: string;
  status: "DISPONIBLE" | "ATTRIBUE" | "EN_MAINTENANCE" | "REFORME";
  assignedToMemberId?: string;
  assignedToMemberName?: string;
  assignedDate?: string;
  notes?: string;
}

// Section 16: Conventions & Collaborations
export interface Convention {
  id: string;
  title: string;
  partnerName: string;
  partnerType: "UNIVERSITE" | "INDUSTRIE" | "ORGANISME_RECHERCHE" | "INTERNATIONAL";
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EN_COURS_SIGNATURE" | "CLOTUREE";
  description: string;
  activities: string[];
  associatedDocUrl?: string;
  budgetOrResources?: string;
  contactPerson?: string;
}

// Section 17: Procès-verbaux (PV de réunions)
export interface MeetingMinutes {
  id: string;
  title: string;
  meetingType: "Conseil de laboratoire" | "Commission scientifique" | "Assemblée générale" | "Réunion d'équipe";
  date: string;
  location: string;
  agenda: string[]; // Ordre du jour
  decisions: string[]; // Décisions actées
  attendees: string[]; // Présents
  absentees?: string[]; // Absents excusés
  documentUrl?: string;
  secretaryName: string;
}

// Section 7 & 21: Historique complet des rôles (un changement de rôle ne supprime jamais de données)
export interface RoleAssignment {
  id: string;
  userId: string;
  role: Role;
  startDate: string;
  endDate?: string;
  reason?: string;
}

// Section 21: Toute action importante est traçable
export interface AuditEntry {
  id: string;
  date: string;
  actorId: string;
  actorName: string;
  action: string;
  target?: string;
  details?: string;
}

// Section 11: Rapport d'activité annuel généré automatiquement
export interface AnnualReport {
  year: number;
  generatedAt: string;
  generatedBy: string;
  laboratory: string;
  summary: Record<string, number>;
  events: Event[];
  publications: Publication[];
  publicationsByTeam: Record<string, number>;
  publicationsByType: Record<string, number>;
  newMembers: { name: string; status: string; date: string }[];
  departures: { name: string; reason: string; date: string }[];
  applications: { total: number; accepted: number; rejected: number; pending: number };
  conventions: Convention[];
  meetings: MeetingMinutes[];
  documents: LabDocument[];
  equipment: { arrivals: number; assigned: number; requests: number; approvedRequests: number };
  mandates: Mandate[];
}
