package com.lias.lab.repository;

import com.lias.lab.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.*;
import java.util.List;
import java.util.Optional;

@Repository
public interface AffiliationPeriodRepository extends JpaRepository<AffiliationPeriod, Long> {
    List<AffiliationPeriod> findByUserIdOrderByStartDateAsc(Long userId);
    Optional<AffiliationPeriod> findFirstByUserIdAndEndDateIsNull(Long userId);
}
