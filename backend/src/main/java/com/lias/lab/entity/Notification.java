package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Notifications : événements, validation de demandes, ajout de documents (section 19). */
@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;            // null = notification générale
    private String recipientEmail;  // pour les candidats sans compte
    @Column(nullable = false)
    private String title;
    @Column(length = 2000)
    private String message;
    private String type;            // EVENT, ADHESION, DOCUMENT, MANDATE, REQUEST
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default
    private boolean read = false;

    public String getDate() {
        return createdAt != null ? createdAt.toString() : null;
    }
}
