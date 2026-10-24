package com.lias.lab.controller;

import com.lias.lab.entity.MeetingMinutes;
import com.lias.lab.entity.User;
import com.lias.lab.repository.MeetingMinutesRepository;
import com.lias.lab.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Procès-verbaux (section 17) : réunions, ordre du jour, PV uploadé puis archivé. */
@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingMinutesRepository repository;
    private final AuditService audit;

    @GetMapping
    public List<MeetingMinutes> list() {
        return repository.findAllByOrderByDateDesc();
    }

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeetingMinutes create(@AuthenticationPrincipal User director, @RequestBody MeetingMinutes body) {
        if (body.getTitle() == null || body.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre et date obligatoires");
        }
        body.setId(null);
        audit.log(director, "MEETING_CREATED", body.getTitle(), String.valueOf(body.getDate()));
        return repository.save(body);
    }

    /** Rattache le PV (document uploadé via /api/documents) à la réunion. */
    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping("/{id}/minutes/{documentId}")
    public MeetingMinutes attachMinutes(@AuthenticationPrincipal User director, @PathVariable Long id, @PathVariable Long documentId) {
        MeetingMinutes m = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réunion introuvable"));
        m.setDocumentId(documentId);
        audit.log(director, "MEETING_MINUTES_ATTACHED", m.getTitle(), String.valueOf(documentId));
        return repository.save(m);
    }
}
