package com.lias.lab.controller;

import com.lias.lab.entity.Publication;
import com.lias.lab.entity.User;
import com.lias.lab.repository.PublicationRepository;
import com.lias.lab.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Section 12 : ajout par les membres ET les doctorants (seul module ouvert aux doctorants avec la consultation). */
@RestController
@RequestMapping("/api/publications")
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationRepository repository;
    private final AuditService audit;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Publication add(@AuthenticationPrincipal User me, @RequestBody Publication body) {
        if (body.getTitle() == null || body.getTitle().isBlank() || body.getYear() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre et année sont obligatoires");
        }
        body.setId(null);
        body.setOwnerId(me.getId());
        if (body.getTeamId() == null) body.setTeamId(me.getTeamId());
        if (body.getAuthors() == null || body.getAuthors().isEmpty()) body.setAuthors(java.util.List.of(me.fullName()));
        Publication saved = repository.save(body);
        audit.log(me, "PUBLICATION_ADDED", saved.getTitle(), String.valueOf(saved.getYear()));
        return saved;
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal User me, @PathVariable Long id) {
        Publication p = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publication introuvable"));
        boolean owner = me.getId().equals(p.getOwnerId());
        boolean admin = me.getRole() == com.lias.lab.entity.Role.DIRECTOR || me.getRole() == com.lias.lab.entity.Role.ADMIN;
        if (!owner && !admin) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez supprimer que vos publications");
        repository.delete(p);
        audit.log(me, "PUBLICATION_DELETED", p.getTitle(), null);
    }
}
