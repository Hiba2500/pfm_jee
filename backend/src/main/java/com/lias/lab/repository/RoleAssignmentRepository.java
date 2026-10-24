package com.lias.lab.repository;

import com.lias.lab.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.*;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleAssignmentRepository extends JpaRepository<RoleAssignment, Long> {
    List<RoleAssignment> findByUserIdOrderByStartDateDescIdDesc(Long userId);
    Optional<RoleAssignment> findFirstByUserIdAndEndDateIsNull(Long userId);
}
