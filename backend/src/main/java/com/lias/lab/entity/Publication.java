package com.lias.lab.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "publications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "publication_authors", joinColumns = @JoinColumn(name = "publication_id"))
    @Column(name = "author_name")
    @Builder.Default
    private List<String> authors = new ArrayList<>();

    @Column(name = "publication_year")
    private Integer year;

    private String type; // Journal, Conference, Book Chapter, Thesis

    private String venue; // IEEE Transactions, Springer, etc.

    private String doi;

    @Column(length = 2000)
    private String description;

    private String pdfUrl;

    private Long ownerId;   // membre ou doctorant ayant ajouté la publication
    private Long teamId;    // classement par équipe (section 12)

    @JsonProperty("authors")
    public void setAuthorsFromJson(Object authorsObj) {
        if (authorsObj instanceof List<?> list) {
            this.authors = new ArrayList<>(list.stream().map(Object::toString).toList());
        } else if (authorsObj instanceof String str) {
            this.authors = new ArrayList<>(Arrays.stream(str.split("[,;]"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList());
        }
    }

    public Long getUserId() {
        return ownerId;
    }

    public void setUserId(Long userId) {
        this.ownerId = userId;
    }

    public String getLink() {
        return pdfUrl;
    }

    public void setLink(String link) {
        this.pdfUrl = link;
    }

    public String getJournalOrConference() {
        return venue;
    }

    public void setJournalOrConference(String journalOrConference) {
        this.venue = journalOrConference;
    }
}
