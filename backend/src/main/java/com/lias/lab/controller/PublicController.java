package com.lias.lab.controller;

import com.lias.lab.dto.MemberDto;
import com.lias.lab.entity.*;
import com.lias.lab.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/** Consultation publique (section 2.1) : laboratoire, équipes, activités, publications. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicController {

    private final ResearchTeamRepository teamRepository;
    private final PublicationRepository publicationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final MandateRepository mandateRepository;

    @GetMapping("/lab-info")
    public ResponseEntity<?> getLabInfo() {
        LocalDate today = LocalDate.now();
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("name", "Laboratoire d'Ingénierie, Systèmes et Applications (LIAS)");
        info.put("institution", "Faculté des Sciences Ben M'Sik, Casablanca");
        info.put("creationDate", "2014-09-01"); // Section 4.1 : Date de création du laboratoire
        info.put("university", "Université Hassan II de Casablanca");
        mandateRepository.findByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(MandateType.DIRECTOR, today, today)
                .stream().findFirst().ifPresent(m -> info.put("director", m.getPersonName()));
        mandateRepository.findByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(MandateType.VICE_DIRECTOR, today, today)
                .stream().findFirst().ifPresent(m -> info.put("viceDirector", m.getPersonName()));
        info.put("totalMembers", userRepository.findAll().stream().filter(u -> !u.isFrozen() && !u.isDisabled()).count());
        info.put("totalPublications", publicationRepository.count());
        info.put("totalTeams", teamRepository.count());
        return ResponseEntity.ok(info);
    }

    @GetMapping("/teams")
    public List<ResearchTeam> getTeams() {
        return teamRepository.findAll();
    }

    /** Section 12 : classement par auteur, année, équipe, type. */
    @GetMapping("/publications")
    public List<Publication> getPublications(@RequestParam(required = false) String author,
                                             @RequestParam(required = false) Integer year,
                                             @RequestParam(required = false) Long teamId,
                                             @RequestParam(required = false) String type,
                                             @RequestParam(required = false) String q) {
        return publicationRepository.findAll().stream()
                .filter(p -> year == null || year.equals(p.getYear()))
                .filter(p -> teamId == null || teamId.equals(p.getTeamId()))
                .filter(p -> type == null || type.equalsIgnoreCase("ALL") || (p.getType() != null && p.getType().equalsIgnoreCase(type)))
                .filter(p -> author == null || p.getAuthors().stream().anyMatch(a -> a.toLowerCase().contains(author.toLowerCase())))
                .filter(p -> q == null || p.getTitle().toLowerCase().contains(q.toLowerCase()))
                .sorted(Comparator.comparing(Publication::getYear, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    /** Section 20 : calendrier avec navigation temporelle (?year=2026&month=10). */
    @GetMapping("/events")
    public List<Event> getEvents(@RequestParam(required = false) Integer year,
                                 @RequestParam(required = false) Integer month,
                                 @RequestParam(defaultValue = "false") boolean archived) {
        List<Event> events;
        if (year != null && month != null) {
            YearMonth ym = YearMonth.of(year, month);
            events = eventRepository.findByDateBetweenOrderByDateAsc(ym.atDay(1), ym.atEndOfMonth());
        } else if (year != null) {
            events = eventRepository.findByDateBetweenOrderByDateAsc(LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
        } else {
            events = eventRepository.findAll().stream()
                    .sorted(Comparator.comparing(Event::getDate, Comparator.nullsLast(Comparator.naturalOrder()))).toList();
        }
        return archived ? events : events.stream().filter(e -> !e.isArchived()).toList();
    }

    /** Annuaire public : jamais de mot de passe, date de naissance seulement pour soi / direction / admin. */
    @GetMapping("/members")
    public List<MemberDto> getMembers(Authentication auth,
                                      @RequestParam(required = false) String q,
                                      @RequestParam(required = false) MemberStatus status,
                                      @RequestParam(required = false) Long teamId) {
        User viewer = (auth != null && auth.getPrincipal() instanceof User) ? (User) auth.getPrincipal() : null;
        return userRepository.findAll().stream()
                .filter(m -> status == null || m.getStatus() == status)
                .filter(m -> teamId == null || teamId.equals(m.getTeamId()))
                .filter(m -> q == null || q.isBlank() || matchesMember(m, q))
                .map(m -> MemberDto.of(m, isPrivileged(viewer, m)))
                .collect(Collectors.toList());
    }

    private boolean matchesMember(User m, String q) {
        if (q == null || q.isBlank()) return true;
        String query = q.toLowerCase();
        return (m.getFirstName() != null && m.getFirstName().toLowerCase().contains(query))
                || (m.getLastName() != null && m.getLastName().toLowerCase().contains(query))
                || (m.getEmail() != null && m.getEmail().toLowerCase().contains(query))
                || (m.getTitle() != null && m.getTitle().toLowerCase().contains(query))
                || (m.getTeamName() != null && m.getTeamName().toLowerCase().contains(query))
                || (m.getResearchInterests() != null && m.getResearchInterests().toLowerCase().contains(query))
                || (m.getBiography() != null && m.getBiography().toLowerCase().contains(query))
                || (m.getInstitution() != null && m.getInstitution().toLowerCase().contains(query));
    }

    static boolean isPrivileged(User viewer, User target) {
        return viewer != null && (viewer.getId().equals(target.getId())
                || viewer.getRole() == Role.ADMIN || viewer.getRole() == Role.DIRECTOR);
    }
}
