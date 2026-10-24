package com.lias.lab.repository;

import com.lias.lab.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.*;
import java.util.List;
import java.util.Optional;

@Repository
public interface MandateRepository extends JpaRepository<Mandate, Long> {
    List<Mandate> findAllByOrderByStartDateDesc();
    List<Mandate> findByUserIdOrderByStartDateDesc(Long userId);
    List<Mandate> findByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(MandateType type, LocalDate start, LocalDate end);
    boolean existsByUserIdAndTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Long userId, MandateType type, LocalDate start, LocalDate end);
    List<Mandate> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate endOfYear, LocalDate startOfYear);
}
