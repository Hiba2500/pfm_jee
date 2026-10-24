package com.lias.lab.service;

import com.lias.lab.entity.*;
import com.lias.lab.repository.MandateRepository;
import com.lias.lab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

/** Mandats de gouvernance (section 5) : le rôle d'un membre suit son mandat actif. */
@Service("governance")
@RequiredArgsConstructor
public class GovernanceService {

    private final MandateRepository mandateRepository;
    private final UserRepository userRepository;
    private final MemberLifecycleService lifecycle;
    private final AuditService audit;

    /** Utilisé dans @PreAuthorize : "seul le directeur en mandat valide" (sections 5.2 et 6). */
    public boolean isDirectorInMandate(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) return false;
        User user = (User) authentication.getPrincipal();
        LocalDate today = LocalDate.now();
        return mandateRepository.existsByUserIdAndTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                user.getId(), MandateType.DIRECTOR, today, today);
    }

    @Transactional
    public Mandate createMandate(Long userId, MandateType type, Long teamId, LocalDate start, LocalDate end, User actor) {
        if (end.isBefore(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit être postérieure à la date de début");
        }
        User person = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable"));
        if (person.isFrozen() || person.isDisabled()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce membre n'a pas de compte actif");
        }
        LocalDate today = LocalDate.now();

        // Un seul directeur actif à la fois : l'ancien mandat est clôturé, jamais supprimé.
        if (type == MandateType.DIRECTOR && !start.isAfter(today)) {
            for (Mandate m : mandateRepository.findByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(MandateType.DIRECTOR, today, today)) {
                if (m.getEndDate().isAfter(today)) {
                    m.setEndDate(today);
                    mandateRepository.save(m);
                }
                userRepository.findById(m.getUserId()).ifPresent(previous -> {
                    if (!previous.getId().equals(person.getId()) && previous.getRole() == Role.DIRECTOR) {
                        lifecycle.changeRole(previous, Role.MEMBER, "Fin de mandat de direction", actor);
                    }
                });
            }
        }

        Mandate mandate = mandateRepository.save(Mandate.builder()
                .userId(person.getId()).personName(person.fullName()).type(type)
                .teamId(teamId).startDate(start).endDate(end).build());

        if (mandate.isActiveOn(today)) {
            Role newRole = type == MandateType.DIRECTOR ? Role.DIRECTOR
                    : type == MandateType.VICE_DIRECTOR ? Role.VICE_DIRECTOR : Role.TEAM_LEADER;
            if (person.getRole() != Role.ADMIN) {
                lifecycle.changeRole(person, newRole, "Mandat : " + type, actor);
            }
        }
        audit.log(actor, "MANDATE_CREATED", person.getEmail(), type + " " + start + " -> " + end);
        return mandate;
    }
}
