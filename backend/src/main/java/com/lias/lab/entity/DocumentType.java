package com.lias.lab.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Section 10 : types de documents archivés. */
public enum DocumentType {
    FUNDING_REQUEST("Demande de financement"),
    DEMANDE_FINANCEMENT("Demande de financement"),
    PROGRAM("Programme"),
    PROGRAMME("Programme"),
    CERTIFICATE("Certificat"),
    ATTESTATION("Attestation"),
    REPORT("Rapport d'activité"),
    RAPPORT("Rapport d'activité"),
    ADMINISTRATIVE("Document administratif"),
    ADMINISTRATIF("Document administratif"),
    PV("Procès-verbal"),
    CONVENTION("Convention");

    private final String label;

    DocumentType(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static DocumentType fromValue(String value) {
        if (value == null || value.isBlank()) return ADMINISTRATIVE;
        String normalized = value.trim().toLowerCase();
        if (normalized.contains("financ")) return FUNDING_REQUEST;
        if (normalized.contains("prog")) return PROGRAM;
        if (normalized.contains("certif") || normalized.contains("attest")) return CERTIFICATE;
        if (normalized.contains("rapp") || normalized.contains("report")) return REPORT;
        if (normalized.contains("pv") || normalized.contains("procès") || normalized.contains("proces")) return PV;
        if (normalized.contains("conven")) return CONVENTION;
        return ADMINISTRATIVE;
    }
}
