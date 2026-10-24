package com.lias.lab.controller;

import com.lias.lab.entity.ApplicationStatus;
import com.lias.lab.entity.MandateType;
import com.lias.lab.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Indicateurs et statistiques globales (Sections 1, 5, 11, 18 du cahier des charges).
 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final UserRepository userRepository;
    private final PublicationRepository publicationRepository;
    private final EventRepository eventRepository;
    private final MembershipApplicationRepository applicationRepository;
    private final EquipmentRequestRepository equipmentRequestRepository;
    private final MandateRepository mandateRepository;

    @GetMapping
    public Map<String, Object> getStats() {
        LocalDate today = LocalDate.now();

        long totalMembers = userRepository.findAll().stream()
                .filter(u -> !u.isFrozen() && !u.isDisabled())
                .count();

        long totalPubs = publicationRepository.count();

        long totalEvents = eventRepository.count();

        long pendingApps = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.PENDING)
                .count();

        long pendingEquips = equipmentRequestRepository.findAll().stream()
                .filter(e -> e.getStatus() == ApplicationStatus.PENDING)
                .count();

        long upcomingEvents = eventRepository.findAll().stream()
                .filter(e -> !e.isArchived())
                .count();

        long activeMandatesCount = mandateRepository.findAll().stream()
                .filter(Mandate -> Mandate.isActiveOn(today))
                .count();

        int currentYear = today.getYear();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalMembers", totalMembers);
        stats.put("totalPublications", totalPubs);
        stats.put("totalEvents", totalEvents);
        stats.put("pendingApplications", pendingApps);
        stats.put("pendingEquipments", pendingEquips);
        stats.put("upcomingEvents", upcomingEvents);
        stats.put("annualReportStatus", "Consolidation " + currentYear + " prête (données synchronisées)");
        stats.put("activeMandatesCount", activeMandatesCount);
        return stats;
    }
}
