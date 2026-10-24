package com.lias.lab.controller;

import com.lias.lab.dto.ApplicationRequest;
import com.lias.lab.dto.DecisionRequest;
import com.lias.lab.entity.*;
import com.lias.lab.repository.*;
import com.lias.lab.service.AuditService;
import com.lias.lab.service.MemberLifecycleService;
import com.lias.lab.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** Demandes d'adhésion (section 6) : dépôt public, décision réservée au directeur en mandat. */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final MembershipApplicationRepository repository;
    private final UserRepository userRepository;
    private final MemberLifecycleService lifecycle;
    private final AuditService audit;
    private final NotificationService notifications;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> submit(@Valid @RequestBody ApplicationRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email) || repository.existsByEmailIgnoreCaseAndStatus(email, ApplicationStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte ou une demande existe déjà pour cet email");
        }
        MembershipApplication app = repository.save(MembershipApplication.builder()
                .candidateName(req.getCandidateName()).email(email).degree(req.getDegree())
                .cvSummary(req.getCvSummary()).motivation(req.getMotivation())
                .targetStatus(req.getTargetStatus() == null ? MemberStatus.PHD_STUDENT : req.getTargetStatus())
                .targetTeamId(req.getTargetTeamId()).build());
        notifications.notifyUser(null, "ADHESION", "Nouvelle demande d'adhésion", app.getCandidateName() + " (" + email + ")");
        return Map.of("message", "Votre candidature a été transmise au Directeur du laboratoire.", "id", app.getId());
    }

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @GetMapping
    public List<MembershipApplication> list() {
        return repository.findAllByOrderByAppliedAtDesc();
    }

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @Transactional
    @PostMapping("/{id}/decision")
    public Map<String, Object> decide(@AuthenticationPrincipal User director, @PathVariable Long id, @Valid @RequestBody DecisionRequest req) {
        MembershipApplication app = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));
        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette demande a déjà été traitée");
        }
        if (req.getDecision() == ApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Décision attendue : ACCEPTED ou REJECTED");
        }
        app.setStatus(req.getDecision());
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewedBy(director.getEmail());
        repository.save(app);

        if (req.getDecision() == ApplicationStatus.ACCEPTED) {
            // Acceptée -> création du compte ; le mot de passe initial est à changer à la première connexion.
            User created = lifecycle.createFromApplication(app, req.getAssignedRole(), req.getAssignedTeamId(), director);
            notifications.notifyUser(created.getId(), "ADHESION", "Adhésion acceptée",
                    "Votre adhésion au laboratoire LIAS a été acceptée. Mot de passe initial : " + MemberLifecycleService.INITIAL_PASSWORD);
        } else {
            // Refusée -> notification au candidat (qui n'a pas de compte : adressée à son email).
            notifications.notifyEmail(app.getEmail(), "ADHESION", "Demande d'adhésion refusée",
                    "Votre demande d'adhésion au laboratoire LIAS n'a pas été retenue.");
        }
        audit.log(director, "APPLICATION_" + req.getDecision(), app.getEmail(), app.getCandidateName());
        return Map.of("message", req.getDecision() == ApplicationStatus.ACCEPTED ? "Candidature acceptée, compte créé" : "Candidature refusée, candidat notifié",
                "application", app);
    }
}
