package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Historique complet des rôles : un changement de rôle ne supprime jamais de données (section 7). */
@Entity
@Table(name = "role_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoleAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    @Column(nullable = false)
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}
