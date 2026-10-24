package com.lias.lab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Matériel reçu par le laboratoire et sa distribution (section 14). */
@Entity
@Table(name = "equipment_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String designation;
    private String category;
    private String inventoryNumber;
    private String source;
    @Column(nullable = false)
    private LocalDate arrivalDate;
    private Long assignedToUserId;
    private String assignedToName;
    private LocalDate assignedDate;
    private String notes;

    public String getStatus() {
        return assignedToUserId != null ? "ATTRIBUE" : "DISPONIBLE";
    }

    public void setStatus(String status) {
        // Ignored or handled via assignment
    }

    public String getSerialOrInventoryNumber() {
        return inventoryNumber;
    }

    public void setSerialOrInventoryNumber(String num) {
        this.inventoryNumber = num;
    }

    public String getSupplierOrSource() {
        return source;
    }

    public void setSupplierOrSource(String src) {
        this.source = src;
    }

    public String getAssignedToMemberId() {
        return assignedToUserId != null ? String.valueOf(assignedToUserId) : null;
    }

    public void setAssignedToMemberId(String id) {
        try {
            if (id != null && !id.isBlank()) this.assignedToUserId = Long.valueOf(id.trim());
        } catch (NumberFormatException ignored) {}
    }

    public String getAssignedToMemberName() {
        return assignedToName;
    }

    public void setAssignedToMemberName(String name) {
        this.assignedToName = name;
    }
}
