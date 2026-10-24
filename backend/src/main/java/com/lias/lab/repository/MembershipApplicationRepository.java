package com.lias.lab.repository;

import com.lias.lab.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.*;
import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipApplicationRepository extends JpaRepository<MembershipApplication, Long> {
    List<MembershipApplication> findAllByOrderByAppliedAtDesc();
    List<MembershipApplication> findByAppliedAtBetween(LocalDateTime from, LocalDateTime to);
    boolean existsByEmailIgnoreCaseAndStatus(String email, ApplicationStatus status);
}
