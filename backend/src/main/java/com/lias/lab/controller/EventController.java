package com.lias.lab.controller;

import com.lias.lab.entity.Event;
import com.lias.lab.entity.User;
import com.lias.lab.repository.EventRepository;
import com.lias.lab.service.AuditService;
import com.lias.lab.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Événements scientifiques (section 9) : création, organisation, archivage par édition. */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository repository;
    private final AuditService audit;
    private final NotificationService notifications;

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Event create(@AuthenticationPrincipal User director, @RequestBody Event body) {
        if (body.getDate() == null && body.getDateStart() != null) {
            body.setDate(body.getDateStart());
        }
        if (body.getTitle() == null || body.getDate() == null || body.getLocation() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre, date et lieu sont obligatoires");
        }
        if (body.getDateStart() == null) body.setDateStart(body.getDate());
        if (body.getDateEnd() == null) body.setDateEnd(body.getDateStart());
        if (body.getOrganizer() == null && body.getOrganizers() != null) body.setOrganizer(body.getOrganizers());
        if (body.getOrganizers() == null && body.getOrganizer() != null) body.setOrganizers(body.getOrganizer());
        body.setId(null);
        body.setArchived(false);
        Event saved = repository.save(body);
        notifications.notifyUser(null, "EVENT", "Nouvel événement", saved.getTitle() + " — " + saved.getDate());
        audit.log(director, "EVENT_CREATED", saved.getTitle(), saved.getType());
        return saved;
    }

    @PostMapping("/{id}/participate")
    public java.util.Map<String, Object> participate(@AuthenticationPrincipal User user, @PathVariable Long id) {
        Event event = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));
        int currentCount = event.getParticipantsCount() != null ? event.getParticipantsCount() : 0;
        event.setParticipantsCount(currentCount + 1);
        Event saved = repository.save(event);
        if (user != null) {
            audit.log(user, "EVENT_PARTICIPATION", saved.getTitle(), user.getEmail());
        }
        return java.util.Map.of(
                "message", "Votre inscription à l'événement a été validée avec succès.",
                "event", saved
        );
    }

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping("/{id}/archive")
    public Event archive(@AuthenticationPrincipal User director, @PathVariable Long id) {
        Event event = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));
        event.setArchived(true);
        audit.log(director, "EVENT_ARCHIVED", event.getTitle(), null);
        return repository.save(event);
    }
}
