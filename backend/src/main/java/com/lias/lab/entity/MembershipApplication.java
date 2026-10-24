package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Demande d'adhésion en ligne (section 6). */
@Entity
@Table(name = "membership_applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MembershipApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String candidateName;
    @Column(nullable = false)
    private String email;
    private String degree;
    @Column(length = 4000)
    private String cvSummary;
    @Column(length = 4000)
    private String motivation;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MemberStatus targetStatus = MemberStatus.PHD_STUDENT;
    private Long targetTeamId;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;
    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();
    private LocalDateTime reviewedAt;
    private String reviewedBy;

    public String getAppliedDate() {
        return appliedAt != null ? appliedAt.toString() : null;
    }
}
