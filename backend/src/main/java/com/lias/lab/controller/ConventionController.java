package com.lias.lab.controller;

import com.lias.lab.entity.Convention;
import com.lias.lab.entity.User;
import com.lias.lab.repository.ConventionRepository;
import com.lias.lab.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Conventions et collaborations (section 16) : partenaires, conventions, documents archivés, activités. */
@RestController
@RequestMapping("/api/conventions")
@RequiredArgsConstructor
public class ConventionController {

    private final ConventionRepository repository;
    private final AuditService audit;

    @GetMapping
    public List<Convention> list() {
        return repository.findAllByOrderByStartDateDesc();
    }

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Convention create(@AuthenticationPrincipal User director, @RequestBody Convention body) {
        if (body.getTitle() == null || body.getPartnerName() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre et partenaire obligatoires");
        }
        body.setId(null);
        audit.log(director, "CONVENTION_CREATED", body.getTitle(), body.getPartnerName());
        return repository.save(body);
    }

    /** Suivi des activités associées à une convention. */
    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping("/{id}/activities")
    public Convention addActivity(@AuthenticationPrincipal User director, @PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Convention c = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Convention introuvable"));
        c.getActivities().add(body.getOrDefault("activity", ""));
        audit.log(director, "CONVENTION_ACTIVITY_ADDED", c.getTitle(), body.get("activity"));
        return repository.save(c);
    }

    /** Rattache un document archivé (upload via /api/documents) à la convention. */
    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping("/{id}/document/{documentId}")
    public Convention attachDocument(@AuthenticationPrincipal User director, @PathVariable Long id, @PathVariable Long documentId) {
        Convention c = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Convention introuvable"));
        c.setDocumentId(documentId);
        audit.log(director, "CONVENTION_DOCUMENT_ATTACHED", c.getTitle(), String.valueOf(documentId));
        return repository.save(c);
    }
}
