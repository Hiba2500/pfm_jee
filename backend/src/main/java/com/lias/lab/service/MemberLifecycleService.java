package com.lias.lab.service;

import com.lias.lab.entity.*;
import com.lias.lab.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Cycle de vie d'un membre : adhésion, changement de rôle, départ, retraite, retour.
 * Règle générale : on clôture et on ajoute des périodes, on ne supprime jamais rien.
 */
@Service
@RequiredArgsConstructor
public class MemberLifecycleService {

    public static final String INITIAL_PASSWORD = "lias2026";

    private final UserRepository userRepository;
    private final AffiliationPeriodRepository affiliationRepository;
    private final RoleAssignmentRepository roleRepository;
    private final StatusChangeRepository statusRepository;
    private final ProfileChangeRepository profileRepository;
    private final ResearchTeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService audit;
    private final NotificationService notifications;

    /** Ouvre l'historique d'un membre (première affiliation, rôle et statut courants). */
    @Transactional
    public void openHistory(User user, String reason) {
        LocalDate start = user.getAffiliationDate() != null ? user.getAffiliationDate() : LocalDate.now();
        user.setAffiliationDate(start);
        userRepository.save(user);
        affiliationRepository.save(AffiliationPeriod.builder().userId(user.getId()).startDate(start).reason(reason).build());
        roleRepository.save(RoleAssignment.builder().userId(user.getId()).role(user.getRole()).startDate(start).reason(reason).build());
        statusRepository.save(StatusChange.builder().userId(user.getId()).status(user.getStatus()).changedAt(LocalDateTime.now()).reason(reason).build());
    }

    /** Section 6 : acceptation d'une demande -> création du compte membre. */
    @Transactional
    public User createFromApplication(MembershipApplication app, Role role, Long teamId, User actor) {
        if (userRepository.existsByEmailIgnoreCase(app.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        String[] names = app.getCandidateName().trim().split("\\s+", 2);
        ResearchTeam team = teamId != null ? teamRepository.findById(teamId).orElse(null) : null;
        User user = userRepository.save(User.builder()
                .email(app.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(INITIAL_PASSWORD))
                .firstName(names[0])
                .lastName(names.length > 1 ? names[1] : "Membre")
                .role(role == null ? Role.MEMBER : role)
                .status(app.getTargetStatus())
                .teamId(team != null ? team.getId() : null)
                .teamName(team != null ? team.getName() : null)
                .biography(app.getMotivation())
                .affiliationDate(LocalDate.now())
                .build());
        openHistory(user, "Adhésion validée par la direction");
        audit.log(actor, "MEMBER_CREATED", user.getEmail(), "Statut " + user.getStatus());
        return user;
    }

    /** Section 7 : changement de rôle (le statut reste inchangé). */
    @Transactional
    public User changeRole(User user, Role newRole, String reason, User actor) {
        if (user.getRole() == newRole) return user;
        roleRepository.findFirstByUserIdAndEndDateIsNull(user.getId()).ifPresent(open -> {
            open.setEndDate(LocalDate.now());
            roleRepository.save(open);
        });
        roleRepository.save(RoleAssignment.builder().userId(user.getId()).role(newRole).startDate(LocalDate.now()).reason(reason).build());
        Role before = user.getRole();
        user.setRole(newRole);
        userRepository.save(user);
        audit.log(actor, "ROLE_CHANGED", user.getEmail(), before + " -> " + newRole);
        return user;
    }

    private void changeStatus(User user, MemberStatus newStatus, String reason) {
        user.setStatus(newStatus);
        userRepository.save(user);
        statusRepository.save(StatusChange.builder().userId(user.getId()).status(newStatus).changedAt(LocalDateTime.now()).reason(reason).build());
    }

    private void closeAffiliation(User user, String reason) {
        affiliationRepository.findFirstByUserIdAndEndDateIsNull(user.getId()).ifPresent(p -> {
            p.setEndDate(LocalDate.now());
            p.setReason(reason);
            affiliationRepository.save(p);
        });
    }

    /** Section 8.1 : retraite -> compte gelé, historique conservé. */
    @Transactional
    public User freeze(User user, String reason, User actor) {
        guardNotGovernance(user);
        closeAffiliation(user, reason == null ? "Départ à la retraite" : reason);
        changeStatus(user, MemberStatus.RETIRED, reason == null ? "Départ à la retraite" : reason);
        audit.log(actor, "MEMBER_FROZEN", user.getEmail(), reason);
        return user;
    }

    /** Section 8.2 : départ -> compte désactivé, historique conservé. */
    @Transactional
    public User deactivate(User user, String reason, User actor) {
        guardNotGovernance(user);
        if (user.isFrozen()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Compte gelé (retraité) : il ne peut pas être désactivé");
        }
        closeAffiliation(user, reason == null ? "Départ du laboratoire" : reason);
        changeStatus(user, MemberStatus.FORMER, reason == null ? "Départ du laboratoire" : reason);
        audit.log(actor, "MEMBER_DEACTIVATED", user.getEmail(), reason);
        return user;
    }

    /** Un ancien membre peut revenir : nouvelle période d'affiliation, les anciennes sont conservées. */
    @Transactional
    public User reactivate(User user, MemberStatus newStatus, User actor) {
        if (!user.isDisabled()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Seul un ancien membre (compte désactivé) peut être réactivé");
        }
        MemberStatus status = (newStatus == null || newStatus == MemberStatus.RETIRED || newStatus == MemberStatus.FORMER)
                ? MemberStatus.PERMANENT : newStatus;
        changeStatus(user, status, "Retour au laboratoire");
        affiliationRepository.save(AffiliationPeriod.builder().userId(user.getId()).startDate(LocalDate.now()).reason("Retour au laboratoire").build());
        audit.log(actor, "MEMBER_REACTIVATED", user.getEmail(), "Statut " + status);
        notifications.notifyUser(user.getId(), "ADHESION", "Compte réactivé", "Votre compte LIAS a été réactivé.");
        return user;
    }

    private void guardNotGovernance(User user) {
        if (user.getRole() == Role.DIRECTOR || user.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossible pour un compte de direction ou d'administration");
        }
    }

    /** Section 3 : modification libre du profil, chaque changement est historisé automatiquement. */
    @Transactional
    public User updateProfile(User user, Map<String, String> changes) {
        Map<String, String> normalized = new java.util.HashMap<>(changes);
        if (normalized.containsKey("office") && !normalized.containsKey("officeNumber")) {
            normalized.put("officeNumber", normalized.get("office"));
        }
        if (normalized.containsKey("photo") && !normalized.containsKey("photoUrl")) {
            normalized.put("photoUrl", normalized.get("photo"));
        }
        if (normalized.containsKey("bio") && !normalized.containsKey("biography")) {
            normalized.put("biography", normalized.get("bio"));
        }
        String[] editable = {"firstName", "lastName", "phone", "officeNumber", "photoUrl", "institution",
                "originLaboratory", "biography", "researchInterests", "specialty", "title",
                "researchGateUrl", "googleScholarUrl", "orcid"};
        for (String field : editable) {
            if (!normalized.containsKey(field)) continue;
            String newValue = normalized.get(field);
            String oldValue = read(user, field);
            if ((oldValue == null ? "" : oldValue).equals(newValue == null ? "" : newValue)) continue;
            profileRepository.save(ProfileChange.builder().userId(user.getId()).field(field)
                    .oldValue(oldValue).newValue(newValue).changedAt(LocalDateTime.now()).build());
            write(user, field, newValue);
        }
        return userRepository.save(user);
    }

    private String read(User u, String f) {
        switch (f) {
            case "firstName": return u.getFirstName();
            case "lastName": return u.getLastName();
            case "phone": return u.getPhone();
            case "officeNumber": return u.getOfficeNumber();
            case "photoUrl": return u.getPhotoUrl();
            case "institution": return u.getInstitution();
            case "originLaboratory": return u.getOriginLaboratory();
            case "biography": return u.getBiography();
            case "researchInterests": return u.getResearchInterests();
            case "specialty": return u.getSpecialty();
            case "title": return u.getTitle();
            case "researchGateUrl": return u.getResearchGateUrl();
            case "googleScholarUrl": return u.getGoogleScholarUrl();
            case "orcid": return u.getOrcid();
            default: return null;
        }
    }

    private void write(User u, String f, String v) {
        switch (f) {
            case "firstName": u.setFirstName(v); break;
            case "lastName": u.setLastName(v); break;
            case "phone": u.setPhone(v); break;
            case "officeNumber": u.setOfficeNumber(v); break;
            case "photoUrl": u.setPhotoUrl(v); break;
            case "institution": u.setInstitution(v); break;
            case "originLaboratory": u.setOriginLaboratory(v); break;
            case "biography": u.setBiography(v); break;
            case "researchInterests": u.setResearchInterests(v); break;
            case "specialty": u.setSpecialty(v); break;
            case "title": u.setTitle(v); break;
            case "researchGateUrl": u.setResearchGateUrl(v); break;
            case "googleScholarUrl": u.setGoogleScholarUrl(v); break;
            case "orcid": u.setOrcid(v); break;
            default: break;
        }
    }
}
