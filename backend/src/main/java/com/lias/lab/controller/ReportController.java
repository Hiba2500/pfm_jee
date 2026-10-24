package com.lias.lab.controller;

import com.lias.lab.entity.User;
import com.lias.lab.service.AuditService;
import com.lias.lab.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

/** Section 11 : pilotage du rapport annuel par le directeur en mandat. */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final AuditService audit;

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @GetMapping("/annual/{year}")
    public ResponseEntity<?> annual(@AuthenticationPrincipal User director, @PathVariable int year,
                                    @RequestParam(defaultValue = "json") String format) {
        if (year < 2000 || year > 2100) {
            return ResponseEntity.badRequest().body(Map.of("error", "Année invalide"));
        }
        Map<String, Object> report = reportService.build(year, director.fullName());
        audit.log(director, "ANNUAL_REPORT_GENERATED", String.valueOf(year), null);
        if ("markdown".equalsIgnoreCase(format)) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"rapport-annuel-LIAS-" + year + ".md\"")
                    .contentType(new MediaType("text", "markdown", StandardCharsets.UTF_8))
                    .body(reportService.toMarkdown(report));
        }
        return ResponseEntity.ok(report);
    }
}
