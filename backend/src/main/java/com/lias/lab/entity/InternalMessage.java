package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Communication interne : discussions générales, par équipe ou liées à un événement (section 13). */
@Entity
@Table(name = "internal_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternalMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long senderId;
    private String senderName;
    private Long teamId;       // null = discussion générale
    private Long eventId;      // null = hors événement
    private String subject;
    private String recipient;
    private String recipientName;
    @Column(length = 4000)
    private String content;
    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();

    public String getDate() {
        return sentAt != null ? sentAt.toString() : null;
    }
}
