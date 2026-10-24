package com.lias.lab.service;

import com.lias.lab.entity.AuditLog;
import com.lias.lab.entity.User;
import com.lias.lab.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/** Journal d'audit : toute action importante est traçable (section 21). */
@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository repository;

    public void log(User actor, String action, String target, String details) {
        repository.save(AuditLog.builder()
                .at(LocalDateTime.now())
                .actor(actor == null ? "system" : actor.getEmail())
                .action(action)
                .target(target)
                .details(details)
                .build());
    }
}
