package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "research_teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String acronym;

    private String leaderId;
    private String leaderName;

    @Column(length = 2000)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "team_research_axes", joinColumns = @JoinColumn(name = "team_id"))
    @Column(name = "axis")
    @Builder.Default
    private List<String> researchAxes = new ArrayList<>();

    private Integer memberCount;
}
