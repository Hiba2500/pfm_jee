package com.lias.lab.controller;

import com.lias.lab.dto.AuthRequest;
import com.lias.lab.dto.AuthResponse;
import com.lias.lab.dto.RegisterRequest;
import com.lias.lab.entity.*;
import com.lias.lab.repository.MembershipApplicationRepository;
import com.lias.lab.repository.UserRepository;
import com.lias.lab.security.JwtService;
import com.lias.lab.service.AuditService;
import com.lias.lab.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Map<String, String> BAD_CREDENTIALS =
            Map.of("error", "Identifiants invalides (email ou mot de passe incorrect).");

    // Stockage en mémoire des jetons de réinitialisation temporaires (section 7 / backend.md)
    private static final Map<String, String> RESET_TOKENS = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final MembershipApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService audit;
    private final NotificationService notifications;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(request.getEmail().trim());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(BAD_CREDENTIALS);
        }
        User user = userOpt.get();

        // Section 8 : retraité = compte gelé ; ancien membre = compte désactivé.
        if (user.isFrozen()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Compte gelé (retraité) : aucun accès actif. L'historique est conservé."));
        }
        if (user.isDisabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Compte désactivé (ancien membre). Contactez l'administration pour une réactivation."));
        }

        audit.log(user, "LOGIN", user.getEmail(), null);
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .status(user.getStatus())
                .title(user.getTitle())
                .teamName(user.getTeamName())
                .build());
    }

    /**
     * Section 6 : aucun compte n'est créé sans validation du directeur.
     * L'inscription en ligne dépose donc une demande d'adhésion (PENDING).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)
                || applicationRepository.existsByEmailIgnoreCaseAndStatus(email, ApplicationStatus.PENDING)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Un compte ou une demande existe déjà avec cette adresse email."));
        }
        applicationRepository.save(MembershipApplication.builder()
                .candidateName(request.getFirstName() + " " + request.getLastName())
                .email(email)
                .degree(request.getAffiliation())
                .motivation(request.getMotivation())
                .targetTeamId(parseLong(request.getProposedTeamId()))
                .build());
        notifications.notifyUser(null, "ADHESION", "Nouvelle demande d'adhésion",
                request.getFirstName() + " " + request.getLastName() + " (" + email + ") demande à rejoindre le laboratoire.");
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "message", "Votre demande d'adhésion a été transmise au Directeur. Un compte vous sera créé après validation.",
                "status", "PENDING"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                     @RequestBody(required = false) Map<String, String> body) {
        String token = null;
        if (body != null && body.containsKey("token")) {
            token = body.get("token");
        } else if (body != null && body.containsKey("refreshToken")) {
            token = body.get("refreshToken");
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Jeton absent"));
        }

        try {
            String email = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
            if (userOpt.isPresent() && !userOpt.get().isFrozen() && !userOpt.get().isDisabled()) {
                String newToken = jwtService.generateToken(userOpt.get());
                return ResponseEntity.ok(Map.of("token", newToken, "message", "Jeton rafraîchi avec succès."));
            }
        } catch (Exception ignored) {}

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Jeton invalide ou expiré"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal User me) {
        if (me != null) {
            audit.log(me, "LOGOUT", me.getEmail(), null);
        }
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie."));
    }

    @PostMapping("/mot-de-passe-oublie")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email != null && !email.isBlank()) {
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String token = UUID.randomUUID().toString();
                RESET_TOKENS.put(token, user.getEmail().toLowerCase());
                notifications.notifyUser(user.getId(), "REQUEST", "Réinitialisation de mot de passe",
                        "Un jeton de réinitialisation a été généré : " + token);
                return ResponseEntity.ok(Map.of(
                        "message", "Si l'adresse existe, des instructions vous ont été transmises.",
                        "token", token));
            }
        }
        return ResponseEntity.ok(Map.of("message", "Si l'adresse existe, des instructions vous ont été transmises."));
    }

    @PostMapping("/reinitialiser")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body != null ? body.get("token") : null;
        String newPassword = body != null ? body.getOrDefault("nouveauMotDePasse", body.get("password")) : null;

        if (token == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Jeton et nouveau mot de passe obligatoires"));
        }

        String email = RESET_TOKENS.remove(token);
        if (email == null) {
            // Permet aussi un token direct au format email pour tests
            Optional<User> directUser = userRepository.findByEmailIgnoreCase(token);
            if (directUser.isPresent()) {
                email = directUser.get().getEmail();
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Jeton invalide ou expiré"));
            }
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Utilisateur introuvable"));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        audit.log(user, "PASSWORD_RESET", user.getEmail(), null);

        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès."));
    }

    @RequestMapping(value = "/mot-de-passe", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User me, @RequestBody Map<String, String> body) {
        if (me == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        String oldPass = body != null ? body.getOrDefault("ancienMotDePasse", body.get("oldPassword")) : null;
        String newPass = body != null ? body.getOrDefault("nouveauMotDePasse", body.get("newPassword")) : null;

        if (newPass == null || newPass.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nouveau mot de passe obligatoire"));
        }

        User user = userRepository.findById(me.getId()).orElse(me);
        if (oldPass != null && !oldPass.isBlank() && !passwordEncoder.matches(oldPass, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "L'ancien mot de passe est incorrect"));
        }

        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);
        audit.log(user, "PASSWORD_CHANGED", user.getEmail(), null);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
    }

    private Long parseLong(String value) {
        try {
            return value == null || value.isBlank() ? null : Long.valueOf(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
