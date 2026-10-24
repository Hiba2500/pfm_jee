package com.lias.lab.controller;

import com.lias.lab.entity.AuditLog;
import com.lias.lab.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Journal d'audit (section 21). Accès limité à l'admin et au directeur par SecurityConfig. */
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditLogRepository repository;

    @GetMapping
    public List<AuditLog> latest() {
        return repository.findTop200ByOrderByAtDesc();
    }
}
