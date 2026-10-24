package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Historisation automatique des modifications de profil (section 3). */
@Entity
@Table(name = "profile_changes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileChange {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    @Column(nullable = false)
    private String field;
    @Column(length = 3000)
    private String oldValue;
    @Column(length = 3000)
    private String newValue;
    @Column(nullable = false)
    private LocalDateTime changedAt;

    public String getDate() {
        return changedAt != null ? changedAt.toString() : null;
    }

    public String getFieldChanged() {
        return field;
    }
}
