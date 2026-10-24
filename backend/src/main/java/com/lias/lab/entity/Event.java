package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String type; // Séminaire, Soutenance, Conférence, Workshop

    private LocalDate date;
    private LocalDate dateStart;
    private LocalDate dateEnd;

    private String time;

    private String location;

    private String speaker;

    @Column(length = 2000)
    private String description;

    private String organizer;
    private String organizers;

    private Integer edition;   // archivage par édition (section 9)
    private String series;     // ex : ICAIS
    @Builder.Default
    private boolean archived = false;

    @Builder.Default
    private Integer participantsCount = 0;

    public LocalDate getDateStart() {
        return dateStart != null ? dateStart : date;
    }

    public LocalDate getDateEnd() {
        return dateEnd != null ? dateEnd : (dateStart != null ? dateStart : date);
    }

    public LocalDate getDate() {
        return date != null ? date : dateStart;
    }

    public String getOrganizers() {
        return organizers != null ? organizers : organizer;
    }

    public String getOrganizer() {
        return organizer != null ? organizer : organizers;
    }

    public Integer getParticipantsCount() {
        return participantsCount != null ? participantsCount : 0;
    }

    public boolean isArchived() {
        return archived;
    }
}
