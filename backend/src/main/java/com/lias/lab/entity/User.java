package com.lias.lab.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    /** Rôle de responsabilité (directeur, chef d'équipe...). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** Statut d'appartenance (permanent, associé, doctorant, retraité, ancien). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status;

    private String title;
    private Long teamId;
    private String teamName;
    private String phone;
    private String specialty;
    private String officeNumber;
    private String photoUrl;
    private String institution;        // établissement d'origine
    private String originLaboratory;   // laboratoire d'origine

    @Column(length = 3000)
    private String biography;

    @Column(length = 2000)
    private String researchInterests;

    private LocalDate birthDate;        // confidentielle (section 4.2)
    private LocalDate hireDate;
    private LocalDate affiliationDate;  // clé métier : date d'affiliation au laboratoire

    private String hIndex;
    private Integer citationsCount;
    private String researchGateUrl;
    private String googleScholarUrl;
    private String orcid;

    /** Retraité : compte gelé, aucun accès actif (section 8.1). */
    public boolean isFrozen() {
        return status == MemberStatus.RETIRED;
    }

    /** Ancien membre : compte désactivé (section 8.2). */
    public boolean isDisabled() {
        return status == MemberStatus.FORMER;
    }

    public String fullName() {
        return firstName + " " + lastName;
    }
}
