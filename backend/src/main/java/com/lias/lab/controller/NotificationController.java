package com.lias.lab.controller;

import com.lias.lab.entity.Notification;
import com.lias.lab.entity.User;
import com.lias.lab.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Notifications (section 19) : événements, validation de demandes, ajouts de documents. */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repository;

    @GetMapping
    public List<Notification> mine(@AuthenticationPrincipal User me) {
        return repository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(me.getId());
    }

    @PostMapping("/{id}/read")
    public Notification markRead(@AuthenticationPrincipal User me, @PathVariable Long id) {
        Notification n = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable"));
        if (n.getUserId() != null && !n.getUserId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Notification d'un autre utilisateur");
        }
        n.setRead(true);
        return repository.save(n);
    }
}
