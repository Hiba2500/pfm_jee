package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Besoin en matériel soumis par un membre et validé par la direction (section 15). */
@Entity
@Table(name = "equipment_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long memberId;
    private String memberName;
    @Column(nullable = false)
    private String title;
    private String category;
    private String estimatedCost;
    @Column(length = 2000)
    private String justification;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime decidedAt;

    public String getDate() {
        return createdAt != null ? createdAt.toString() : null;
    }
}
