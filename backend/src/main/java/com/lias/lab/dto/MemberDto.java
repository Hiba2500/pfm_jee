package com.lias.lab.dto;

import com.lias.lab.entity.User;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Vue d'un membre. Jamais de mot de passe ; la date de naissance n'est jamais exposée publiquement (section 4.2). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MemberDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String photoUrl;
    private String role;
    private String status;
    private String title;
    private Long teamId;
    private String teamName;
    private String institution;
    private String originLaboratory;
    private String biography;
    private String researchInterests;
    private String specialty;
    private String phone;
    private String officeNumber;
    private LocalDate hireDate;
    private LocalDate affiliationDate;
    private LocalDate birthDate; // renseignée uniquement pour soi-même, le directeur ou l'administrateur
    private Boolean isFrozen;
    private Boolean isActive;
    private String office;
    private String photo;
    private String message;

    public static MemberDto of(User u, boolean includeConfidential) {
        return MemberDto.builder()
                .id(u.getId()).firstName(u.getFirstName()).lastName(u.getLastName()).email(u.getEmail())
                .photoUrl(u.getPhotoUrl()).photo(u.getPhotoUrl())
                .role(u.getRole().name()).status(u.getStatus().name())
                .title(u.getTitle()).teamId(u.getTeamId()).teamName(u.getTeamName())
                .institution(u.getInstitution()).originLaboratory(u.getOriginLaboratory())
                .biography(u.getBiography()).researchInterests(u.getResearchInterests())
                .specialty(u.getSpecialty()).phone(includeConfidential ? u.getPhone() : null)
                .officeNumber(u.getOfficeNumber()).office(u.getOfficeNumber())
                .hireDate(includeConfidential ? u.getHireDate() : null)
                .affiliationDate(u.getAffiliationDate())
                .birthDate(includeConfidential ? u.getBirthDate() : null)
                .isFrozen(u.isFrozen())
                .isActive(!u.isDisabled())
                .build();
    }
}
