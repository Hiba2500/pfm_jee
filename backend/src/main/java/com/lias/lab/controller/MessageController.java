package com.lias.lab.controller;

import com.lias.lab.entity.InternalMessage;
import com.lias.lab.entity.User;
import com.lias.lab.repository.InternalMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/** Communication interne (section 13) : discussions générales, par équipe, liées à un événement. */
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final InternalMessageRepository repository;

    @GetMapping
    public List<InternalMessage> list(@RequestParam(required = false) Long teamId, @RequestParam(required = false) Long eventId) {
        return repository.findAllByOrderBySentAtDesc().stream()
                .filter(m -> teamId == null || teamId.equals(m.getTeamId()))
                .filter(m -> eventId == null || eventId.equals(m.getEventId()))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InternalMessage post(@AuthenticationPrincipal User me, @RequestBody InternalMessage body) {
        if (body.getContent() == null || body.getContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message vide");
        }
        body.setId(null);
        body.setSenderId(me.getId());
        body.setSenderName(me.fullName());
        body.setSentAt(LocalDateTime.now());
        if (body.getRecipient() == null) body.setRecipient("TOUS");
        if (body.getRecipientName() == null) {
            body.setRecipientName(body.getRecipient().equals("EQUIPE") ? "Mon Équipe" : "Tous les membres");
        }
        return repository.save(body);
    }
}
