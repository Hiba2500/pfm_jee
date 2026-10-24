package com.lias.lab.controller;

import com.lias.lab.entity.*;
import com.lias.lab.repository.LabDocumentRepository;
import com.lias.lab.service.AuditService;
import com.lias.lab.service.FileStorageService;
import com.lias.lab.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

/** Archivage documentaire par événement et par date : upload, téléchargement, recherche, versions (section 10). */
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final LabDocumentRepository repository;
    private final FileStorageService storage;
    private final AuditService audit;
    private final NotificationService notifications;

    @GetMapping
    public List<LabDocument> search(@RequestParam(required = false) String q,
                                    @RequestParam(required = false) DocumentType type,
                                    @RequestParam(required = false) Long eventId,
                                    @RequestParam(required = false) Integer year) {
        return repository.findAll().stream()
                .filter(d -> q == null || d.getTitle().toLowerCase().contains(q.toLowerCase())
                        || (d.getOwnerName() != null && d.getOwnerName().toLowerCase().contains(q.toLowerCase())))
                .filter(d -> type == null || d.getType() == type)
                .filter(d -> eventId == null || eventId.equals(d.getEventId()))
                .filter(d -> year == null || d.getUploadedAt().getYear() == year)
                .sorted(Comparator.comparing(LabDocument::getUploadedAt).reversed())
                .toList();
    }

    /** Dépôt via formulaire JSON (métadonnées) : compatible avec le tableau de bord React. */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public LabDocument uploadJson(@AuthenticationPrincipal User me, @RequestBody LabDocument body) {
        if (body.getTitle() == null || body.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre obligatoire");
        }
        if (body.getType() == null) body.setType(DocumentType.ADMINISTRATIVE);
        int version = repository.findByTitleAndEventId(body.getTitle(), body.getEventId()).size() + 1;
        body.setId(null);
        body.setVersion(version);
        body.setOwnerId(me.getId());
        body.setOwnerName(me.fullName());
        body.setUploadedAt(java.time.LocalDateTime.now());
        if (body.getFileName() == null) body.setFileName(body.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") + ".pdf");
        if (body.getContentType() == null) body.setContentType("application/pdf");
        LabDocument doc = repository.save(body);
        notifications.notifyUser(null, "DOCUMENT", "Nouveau document déposé", me.fullName() + " a ajouté « " + body.getTitle() + " » (v" + version + ")");
        audit.log(me, "DOCUMENT_UPLOADED", body.getTitle(), body.getType() + " v" + version);
        return doc;
    }

    /** Un nouveau dépôt du même titre pour le même événement crée une nouvelle version (historisation). */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public LabDocument upload(@AuthenticationPrincipal User me,
                              @RequestParam String title,
                              @RequestParam DocumentType type,
                              @RequestParam(required = false) Long eventId,
                              @RequestParam MultipartFile file) {
        int version = repository.findByTitleAndEventId(title, eventId).size() + 1;
        LabDocument doc = repository.save(LabDocument.builder()
                .title(title).type(type).eventId(eventId)
                .ownerId(me.getId()).ownerName(me.fullName())
                .version(version)
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .size(file.getSize())
                .storedPath(storage.store(file))
                .build());
        notifications.notifyUser(null, "DOCUMENT", "Nouveau document déposé", me.fullName() + " a ajouté « " + title + " » (v" + version + ")");
        audit.log(me, "DOCUMENT_UPLOADED", title, type + " v" + version);
        return doc;
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        LabDocument doc = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document introuvable"));
        MediaType mediaType = doc.getContentType() != null ? MediaType.parseMediaType(doc.getContentType()) : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(storage.load(doc.getStoredPath()));
    }

    @GetMapping("/{id}/versions")
    public List<LabDocument> versions(@PathVariable Long id) {
        LabDocument doc = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document introuvable"));
        return repository.findByTitleAndEventId(doc.getTitle(), doc.getEventId());
    }
}
