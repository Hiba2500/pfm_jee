package com.lias.lab.service;

import com.lias.lab.entity.*;
import com.lias.lab.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/** Section 11 : rapport d'activité annuel généré automatiquement (condition du budget annuel). */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final EventRepository eventRepository;
    private final PublicationRepository publicationRepository;
    private final ResearchTeamRepository teamRepository;
    private final AffiliationPeriodRepository affiliationRepository;
    private final UserRepository userRepository;
    private final MembershipApplicationRepository applicationRepository;
    private final ConventionRepository conventionRepository;
    private final MeetingMinutesRepository meetingRepository;
    private final LabDocumentRepository documentRepository;
    private final EquipmentItemRepository equipmentRepository;
    private final EquipmentRequestRepository requestRepository;
    private final MandateRepository mandateRepository;

    public Map<String, Object> build(int year, String generatedBy) {
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to = LocalDate.of(year, 12, 31);

        List<Event> events = eventRepository.findByDateBetweenOrderByDateAsc(from, to);
        List<Publication> publications = publicationRepository.findByYear(year);

        Map<Long, String> teamNames = teamRepository.findAll().stream()
                .collect(Collectors.toMap(ResearchTeam::getId, ResearchTeam::getAcronym));
        Map<String, Long> byTeam = publications.stream().collect(Collectors.groupingBy(
                p -> p.getTeamId() == null ? "Non affectée" : teamNames.getOrDefault(p.getTeamId(), "Non affectée"),
                TreeMap::new, Collectors.counting()));
        Map<String, Long> byType = publications.stream().collect(Collectors.groupingBy(
                p -> p.getType() == null ? "Autre" : p.getType(), TreeMap::new, Collectors.counting()));

        Map<Long, User> users = userRepository.findAll().stream().collect(Collectors.toMap(User::getId, u -> u));
        List<Map<String, Object>> arrivals = new ArrayList<>();
        List<Map<String, Object>> departures = new ArrayList<>();
        for (AffiliationPeriod p : affiliationRepository.findAll()) {
            User u = users.get(p.getUserId());
            if (u == null) continue;
            if (inRange(p.getStartDate(), from, to)) {
                arrivals.add(Map.of("name", u.fullName(), "status", String.valueOf(u.getStatus()), "date", p.getStartDate().toString()));
            }
            if (p.getEndDate() != null && inRange(p.getEndDate(), from, to)) {
                departures.add(Map.of("name", u.fullName(), "reason", p.getReason() == null ? "" : p.getReason(), "date", p.getEndDate().toString()));
            }
        }

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);
        List<MembershipApplication> applications = applicationRepository.findByAppliedAtBetween(start, end);
        List<Convention> conventions = conventionRepository.findAll().stream()
                .filter(c -> c.getStartDate() != null && !c.getStartDate().isAfter(to)
                        && (c.getEndDate() == null || !c.getEndDate().isBefore(from))).toList();
        List<MeetingMinutes> meetings = meetingRepository.findAll().stream().filter(m -> inRange(m.getDate(), from, to)).toList();
        List<LabDocument> documents = documentRepository.findByUploadedAtBetween(start, end);
        List<EquipmentItem> items = equipmentRepository.findAll();
        long arrivalsCount = items.stream().filter(i -> inRange(i.getArrivalDate(), from, to)).count();
        long assignedCount = items.stream().filter(i -> i.getAssignedDate() != null && inRange(i.getAssignedDate(), from, to)).count();
        List<EquipmentRequest> requests = requestRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().getYear() == year).toList();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("events", events.size());
        summary.put("publications", publications.size());
        summary.put("newMembers", arrivals.size());
        summary.put("departures", departures.size());
        summary.put("applications", applications.size());
        summary.put("conventions", conventions.size());
        summary.put("meetings", meetings.size());
        summary.put("documents", documents.size());
        summary.put("equipmentArrivals", arrivalsCount);

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("year", year);
        report.put("generatedAt", LocalDateTime.now().toString());
        report.put("generatedBy", generatedBy);
        report.put("laboratory", "Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca");
        report.put("summary", summary);
        report.put("events", events);
        report.put("publications", publications);
        report.put("publicationsByTeam", byTeam);
        report.put("publicationsByType", byType);
        report.put("newMembers", arrivals);
        report.put("departures", departures);
        report.put("applications", Map.of(
                "total", applications.size(),
                "accepted", applications.stream().filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED).count(),
                "rejected", applications.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count(),
                "pending", applications.stream().filter(a -> a.getStatus() == ApplicationStatus.PENDING).count()));
        report.put("conventions", conventions);
        report.put("meetings", meetings);
        report.put("documents", documents);
        report.put("equipment", Map.of(
                "arrivals", arrivalsCount,
                "assigned", assignedCount,
                "requests", requests.size(),
                "approvedRequests", requests.stream().filter(r -> r.getStatus() == ApplicationStatus.ACCEPTED).count()));
        report.put("mandates", mandateRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(to, from));
        return report;
    }

    @SuppressWarnings("unchecked")
    public String toMarkdown(Map<String, Object> r) {
        StringBuilder sb = new StringBuilder();
        sb.append("# Rapport d'activité annuel ").append(r.get("year")).append("\n\n");
        sb.append("**").append(r.get("laboratory")).append("**\n\n");
        sb.append("Généré par ").append(r.get("generatedBy")).append("\n\n## 1. Synthèse\n");
        ((Map<String, Object>) r.get("summary")).forEach((k, v) -> sb.append("- ").append(k).append(" : ").append(v).append("\n"));
        sb.append("\n## 2. Événements scientifiques\n");
        for (Event e : (List<Event>) r.get("events")) {
            sb.append("- ").append(e.getTitle()).append(" (").append(e.getType())
              .append(e.getEdition() != null ? ", " + e.getEdition() + "e édition" : "")
              .append(") — ").append(e.getDate()).append(", ").append(e.getLocation()).append("\n");
        }
        sb.append("\n## 3. Publications\n");
        for (Publication p : (List<Publication>) r.get("publications")) {
            sb.append("- ").append(p.getTitle()).append(" — ").append(String.join(", ", p.getAuthors())).append("\n");
        }
        sb.append("\nRépartition par équipe : ").append(r.get("publicationsByTeam")).append("\n");
        sb.append("\n## 4. Mouvements de membres\n");
        for (Map<String, Object> m : (List<Map<String, Object>>) r.get("newMembers")) sb.append("- Arrivée : ").append(m.get("name")).append(" le ").append(m.get("date")).append("\n");
        for (Map<String, Object> m : (List<Map<String, Object>>) r.get("departures")) sb.append("- Départ : ").append(m.get("name")).append(" le ").append(m.get("date")).append("\n");
        sb.append("\n## 5. Demandes d'adhésion\n- ").append(r.get("applications")).append("\n");
        sb.append("\n## 6. Conventions\n");
        for (Convention c : (List<Convention>) r.get("conventions")) sb.append("- ").append(c.getTitle()).append(" — ").append(c.getPartnerName()).append("\n");
        sb.append("\n## 7. Réunions et procès-verbaux\n");
        for (MeetingMinutes m : (List<MeetingMinutes>) r.get("meetings")) sb.append("- ").append(m.getTitle()).append(" (").append(m.getDate()).append(")\n");
        sb.append("\n## 8. Matériel\n- ").append(r.get("equipment")).append("\n");
        return sb.toString();
    }

    private boolean inRange(LocalDate d, LocalDate from, LocalDate to) {
        return d != null && !d.isBefore(from) && !d.isAfter(to);
    }
}
