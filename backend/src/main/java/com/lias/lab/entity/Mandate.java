package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Période de gouvernance (directeur, vice-directeur, chef d'équipe). Historique conservé (section 5.3). */
@Entity
@Table(name = "mandates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Mandate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    private String personName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MandateType type;
    private Long teamId;            // pour les chefs d'équipe
    private String teamName;
    @Column(nullable = false)
    private LocalDate startDate;
    @Column(nullable = false)
    private LocalDate endDate;

    public boolean isActiveOn(LocalDate day) {
        return !startDate.isAfter(day) && !endDate.isBefore(day);
    }

    public boolean isActive() {
        return isActiveOn(LocalDate.now());
    }

    public void setActive(boolean active) {
        // Derived from dates
    }

    public String getRole() {
        if (type == null) return "Membre";
        switch (type) {
            case DIRECTOR: return "Directeur";
            case VICE_DIRECTOR: return "Vice-Directeur";
            case TEAM_LEADER: return "Responsable d'Équipe";
            default: return type.name();
        }
    }

    public void setRole(String role) {
        // Can be used during deserialization if needed
    }
}
