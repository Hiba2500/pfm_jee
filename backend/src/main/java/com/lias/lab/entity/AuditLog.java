package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Toute action importante est traçable (section 21). */
@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "logged_at", nullable = false)
    private LocalDateTime at;
    private String actor;
    @Column(nullable = false)
    private String action;
    private String target;
    @Column(length = 2000)
    private String details;

    public String getDate() {
        return at != null ? at.toString() : null;
    }

    public String getActorName() {
        return actor;
    }
}
