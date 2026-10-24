package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Archivage documentaire par événement et par date, avec versions (section 10). */
@Entity
@Table(name = "lab_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LabDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType type;
    private Long eventId;
    private Long ownerId;
    private String ownerName;
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
    @Builder.Default
    private int version = 1;
    private String fileName;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String storedPath;
    private String contentType;
    private long size;
    private String eventRelated;
    private String customFileSize;

    public String getDate() {
        return uploadedAt != null ? uploadedAt.toString() : null;
    }

    public void setDate(String d) {
        // Can be used during deserialization
    }

    public String getFileSize() {
        if (customFileSize != null && !customFileSize.isBlank()) return customFileSize;
        if (size > 0) {
            double mb = size / (1024.0 * 1024.0);
            if (mb >= 1.0) return String.format("%.1f MB", mb);
            return (size / 1024) + " KB";
        }
        return "1.5 MB";
    }

    public void setFileSize(String s) {
        this.customFileSize = s;
    }

    public String getDownloadUrl() {
        return "/api/documents/" + id + "/download";
    }
}
