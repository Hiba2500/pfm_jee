package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Historique des statuts (permanent -> retraité, etc.). */
@Entity
@Table(name = "status_changes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatusChange {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status;
    @Column(nullable = false)
    private LocalDateTime changedAt;
    private String reason;
}
