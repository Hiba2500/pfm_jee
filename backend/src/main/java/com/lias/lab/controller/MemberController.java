package com.lias.lab.controller;

import com.lias.lab.dto.MemberDto;
import com.lias.lab.dto.RoleChangeRequest;
import com.lias.lab.entity.*;
import com.lias.lab.repository.*;
import com.lias.lab.service.MemberLifecycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

/** Profils (section 3), historiques (sections 4, 7, 21) et cycle de vie (section 8). */
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final UserRepository userRepository;
    private final AffiliationPeriodRepository affiliationRepository;
    private final RoleAssignmentRepository roleRepository;
    private final StatusChangeRepository statusRepository;
    private final ProfileChangeRepository profileRepository;
    private final MandateRepository mandateRepository;
    private final MemberLifecycleService lifecycle;

    @GetMapping("/me")
    public MemberDto me(@AuthenticationPrincipal User me) {
        return MemberDto.of(find(me.getId()), true);
    }

    /** Modification libre de son profil ; chaque changement est historisé automatiquement. */
    @PutMapping("/me")
    public MemberDto updateMe(@AuthenticationPrincipal User me, @RequestBody Map<String, String> changes) {
        MemberDto dto = MemberDto.of(lifecycle.updateProfile(find(me.getId()), changes), true);
        dto.setMessage("Profil mis à jour avec succès.");
        return dto;
    }

    /** Consultation du profil des autres membres (réservée aux utilisateurs connectés). */
    @GetMapping("/{id}/profile")
    public MemberDto profile(@AuthenticationPrincipal User viewer, @PathVariable Long id) {
        User target = find(id);
        return MemberDto.of(target, PublicController.isPrivileged(viewer, target));
    }

    @GetMapping("/{id}/history")
    public Map<String, Object> history(@AuthenticationPrincipal User viewer, @PathVariable Long id) {
        User target = find(id);
        if (!PublicController.isPrivileged(viewer, target)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Historique réservé au membre, au directeur ou à l'administrateur");
        }
        Map<String, Object> history = new LinkedHashMap<>();
        history.put("affiliations", affiliationRepository.findByUserIdOrderByStartDateAsc(id));
        history.put("roles", roleRepository.findByUserIdOrderByStartDateDescIdDesc(id));
        history.put("statuses", statusRepository.findByUserIdOrderByChangedAtDesc(id));
        history.put("profileChanges", profileRepository.findByUserIdOrderByChangedAtDesc(id));
        history.put("mandates", mandateRepository.findByUserIdOrderByStartDateDesc(id));
        return history;
    }

    /** Changement de rôle (le statut reste inchangé) : directeur en mandat uniquement. */
    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping("/{id}/role")
    public MemberDto changeRole(@AuthenticationPrincipal User actor, @PathVariable Long id, @Valid @RequestBody RoleChangeRequest req) {
        if (req.getRole() == Role.DIRECTOR || req.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le rôle de directeur s'attribue par un mandat");
        }
        User target = find(id);
        if (target.getRole() == Role.DIRECTOR || target.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le rôle du directeur se modifie via un mandat");
        }
        MemberDto dto = MemberDto.of(lifecycle.changeRole(target, req.getRole(),
                req.getReason() == null ? "Décision de la direction" : req.getReason(), actor), true);
        dto.setMessage("Rôle modifié avec succès.");
        return dto;
    }

    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    @PostMapping("/{id}/freeze")
    public MemberDto freeze(@AuthenticationPrincipal User actor, @PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        MemberDto dto = MemberDto.of(lifecycle.freeze(find(id), body == null ? null : body.get("reason"), actor), true);
        dto.setMessage("Compte gelé avec succès (retraite).");
        return dto;
    }

    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    @PostMapping("/{id}/deactivate")
    public MemberDto deactivate(@AuthenticationPrincipal User actor, @PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        MemberDto dto = MemberDto.of(lifecycle.deactivate(find(id), body == null ? null : body.get("reason"), actor), true);
        dto.setMessage("Compte désactivé avec succès.");
        return dto;
    }

    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    @PostMapping("/{id}/reactivate")
    public MemberDto reactivate(@AuthenticationPrincipal User actor, @PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        MemberStatus status = body != null && body.get("status") != null ? MemberStatus.valueOf(body.get("status")) : null;
        MemberDto dto = MemberDto.of(lifecycle.reactivate(find(id), status, actor), true);
        dto.setMessage("Compte réactivé avec succès.");
        return dto;
    }

    /** Section 8 : bascule de l'état actif/désactivé (utilisé par AdminDashboard). */
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    @PostMapping("/{id}/toggle-active")
    public MemberDto toggleActive(@AuthenticationPrincipal User actor, @PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        User target = find(id);
        if (target.isDisabled()) {
            MemberStatus status = body != null && body.get("status") != null ? MemberStatus.valueOf(body.get("status")) : null;
            MemberDto dto = MemberDto.of(lifecycle.reactivate(target, status, actor), true);
            dto.setMessage("Compte réactivé avec succès.");
            return dto;
        } else {
            MemberDto dto = MemberDto.of(lifecycle.deactivate(target, body == null ? null : body.get("reason"), actor), true);
            dto.setMessage("Compte désactivé avec succès.");
            return dto;
        }
    }

    private User find(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable"));
    }
}
