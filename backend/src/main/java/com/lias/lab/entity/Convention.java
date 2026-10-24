package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Conventions et collaborations avec des partenaires (section 16). */
@Entity
@Table(name = "conventions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Convention {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String partnerName;
    private String partnerType;     // UNIVERSITE, INDUSTRIE, ORGANISME_RECHERCHE, INTERNATIONAL
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;          // EN_COURS_SIGNATURE, ACTIVE, CLOTUREE
    @Column(length = 2000)
    private String description;
    private String budgetOrResources;
    private String contactPerson;
    private String associatedDocUrl;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "convention_activities", joinColumns = @JoinColumn(name = "convention_id"))
    @Column(name = "activity", length = 500)
    @Builder.Default
    private java.util.List<String> activities = new java.util.ArrayList<>();
    private Long documentId;        // document archivé associé
}
