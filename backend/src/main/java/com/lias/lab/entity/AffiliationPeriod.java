package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Une période d'affiliation d'un membre : il peut quitter et revenir (section 4.3). */
@Entity
@Table(name = "affiliation_periods")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AffiliationPeriod {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    @Column(nullable = false)
    private LocalDate startDate;
    private LocalDate endDate;      // null = période en cours
    private String reason;
}
