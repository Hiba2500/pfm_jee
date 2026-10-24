package com.lias.lab.repository;

import com.lias.lab.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.*;
import java.util.List;
import java.util.Optional;

@Repository
public interface LabDocumentRepository extends JpaRepository<LabDocument, Long> {
    List<LabDocument> findByTitleAndEventId(String title, Long eventId);
    List<LabDocument> findByUploadedAtBetween(LocalDateTime from, LocalDateTime to);
}
