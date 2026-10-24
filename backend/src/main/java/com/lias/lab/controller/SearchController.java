package com.lias.lab.controller;

import com.lias.lab.dto.MemberDto;
import com.lias.lab.entity.*;
import com.lias.lab.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/** Recherche globale (section 18). Documents et PV ne sont renvoyés qu'aux utilisateurs ayant accès aux modules internes. */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserRepository userRepository;
    private final PublicationRepository publicationRepository;
    private final EventRepository eventRepository;
    private final LabDocumentRepository documentRepository;
    private final MeetingMinutesRepository meetingRepository;
    private final ResearchTeamRepository teamRepository;

    @GetMapping
    public Map<String, Object> search(@RequestParam String q, Authentication auth) {
        String needle = q.trim().toLowerCase();
        Map<String, Object> result = new LinkedHashMap<>();
        if (needle.isEmpty()) return result;

        result.put("members", userRepository.findAll().stream()
                .filter(u -> u.fullName().toLowerCase().contains(needle)
                        || (u.getResearchInterests() != null && u.getResearchInterests().toLowerCase().contains(needle))
                        || (u.getTitle() != null && u.getTitle().toLowerCase().contains(needle))
                        || (u.getTeamName() != null && u.getTeamName().toLowerCase().contains(needle))
                        || (u.getBiography() != null && u.getBiography().toLowerCase().contains(needle)))
                .map(u -> MemberDto.of(u, false)).toList());

        result.put("publications", publicationRepository.findAll().stream()
                .filter(p -> p.getTitle().toLowerCase().contains(needle)
                        || (p.getVenue() != null && p.getVenue().toLowerCase().contains(needle))
                        || (p.getType() != null && p.getType().toLowerCase().contains(needle))
                        || p.getAuthors().stream().anyMatch(a -> a.toLowerCase().contains(needle))).toList());

        result.put("events", eventRepository.findAll().stream()
                .filter(e -> e.getTitle().toLowerCase().contains(needle)
                        || (e.getType() != null && e.getType().toLowerCase().contains(needle))
                        || (e.getOrganizer() != null && e.getOrganizer().toLowerCase().contains(needle))
                        || (e.getLocation() != null && e.getLocation().toLowerCase().contains(needle))).toList());

        result.put("teams", teamRepository.findAll().stream()
                .filter(t -> t.getName().toLowerCase().contains(needle)
                        || t.getAcronym().toLowerCase().contains(needle)
                        || (t.getDescription() != null && t.getDescription().toLowerCase().contains(needle))
                        || (t.getResearchAxes() != null && t.getResearchAxes().stream().anyMatch(a -> a.toLowerCase().contains(needle)))).toList());

        boolean internal = auth != null && auth.getAuthorities().stream().anyMatch(a ->
                List.of("ROLE_ADMIN", "ROLE_DIRECTOR", "ROLE_VICE_DIRECTOR", "ROLE_TEAM_LEADER", "ROLE_MEMBER", "ROLE_ASSOCIATED")
                        .contains(a.getAuthority()));
        if (internal) {
            result.put("documents", documentRepository.findAll().stream()
                    .filter(d -> d.getTitle().toLowerCase().contains(needle)
                            || (d.getType() != null && d.getType().name().toLowerCase().contains(needle))).toList());
            result.put("meetings", meetingRepository.findAll().stream()
                    .filter(m -> m.getTitle().toLowerCase().contains(needle)
                            || m.getAgenda().stream().anyMatch(a -> a.toLowerCase().contains(needle))
                            || m.getDecisions().stream().anyMatch(d -> d.toLowerCase().contains(needle))).toList());
        }
        return result;
    }
}
