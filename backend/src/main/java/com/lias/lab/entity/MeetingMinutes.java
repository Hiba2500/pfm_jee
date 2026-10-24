package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Réunion, ordre du jour et procès-verbal (section 17). */
@Entity
@Table(name = "meeting_minutes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeetingMinutes {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    private String meetingType;
    @Column(nullable = false)
    private LocalDate date;
    private String location;
    @ElementCollection(fetch = FetchType.EAGER)
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    @CollectionTable(name = "meeting_agenda", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "item", length = 1000)
    @Builder.Default
    private List<String> agenda = new ArrayList<>();
    @ElementCollection(fetch = FetchType.EAGER)
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    @CollectionTable(name = "meeting_decisions", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "decision", length = 1000)
    @Builder.Default
    private List<String> decisions = new ArrayList<>();
    private String secretaryName;
    private Long documentId;       // PV uploadé et archivé
    private String documentUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    @CollectionTable(name = "meeting_attendees", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "attendee")
    @Builder.Default
    private List<String> attendees = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    @CollectionTable(name = "meeting_absentees", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "absentee")
    @Builder.Default
    private List<String> absentees = new ArrayList<>();
}
