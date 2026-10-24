package com.lias.lab.controller;

import com.lias.lab.dto.MandateRequest;
import com.lias.lab.entity.*;
import com.lias.lab.repository.MandateRepository;
import com.lias.lab.service.GovernanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/** Mandats de gouvernance (section 5.3) : historique complet conservé. */
@RestController
@RequestMapping("/api/mandates")
@RequiredArgsConstructor
public class MandateController {

    private final MandateRepository repository;
    private final GovernanceService governance;
    private final com.lias.lab.repository.UserRepository userRepository;
    private final com.lias.lab.repository.ResearchTeamRepository teamRepository;

    @GetMapping
    public List<Mandate> list() {
        return repository.findAllByOrderByStartDateDesc();
    }

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mandate create(@AuthenticationPrincipal User actor, @Valid @RequestBody MandateRequest req) {
        Long userId = req.getUserId();
        if (userId == null && req.getPersonName() != null && !req.getPersonName().isBlank()) {
            String name = req.getPersonName().trim().toLowerCase();
            userId = userRepository.findAll().stream()
                    .filter(u -> u.fullName().toLowerCase().contains(name) || name.contains(u.getLastName().toLowerCase()))
                    .map(User::getId)
                    .findFirst()
                    .orElse(actor.getId());
        }
        if (userId == null) userId = actor.getId();

        MandateType type = req.getType();
        if (type == null && req.getRole() != null) {
            String r = req.getRole().toLowerCase();
            if (r.contains("vice")) type = MandateType.VICE_DIRECTOR;
            else if (r.contains("direct")) type = MandateType.DIRECTOR;
            else if (r.contains("chef") || r.contains("responsable") || r.contains("team")) type = MandateType.TEAM_LEADER;
            else type = MandateType.DIRECTOR;
        }
        if (type == null) type = MandateType.DIRECTOR;

        Long teamId = req.getTeamId();
        if (teamId == null && req.getTeamName() != null && !req.getTeamName().isBlank()) {
            String tn = req.getTeamName().trim().toLowerCase();
            teamId = teamRepository.findAll().stream()
                    .filter(t -> t.getName().toLowerCase().contains(tn) || t.getAcronym().toLowerCase().contains(tn))
                    .map(ResearchTeam::getId)
                    .findFirst()
                    .orElse(null);
        }

        LocalDate start = req.getStartDate() != null ? req.getStartDate() : LocalDate.now();
        LocalDate end = req.getEndDate() != null ? req.getEndDate() : start.plusYears(3);

        return governance.createMandate(userId, type, teamId, start, end, actor);
    }
}
