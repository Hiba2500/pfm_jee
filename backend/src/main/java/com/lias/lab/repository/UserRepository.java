package com.lias.lab.repository;

import com.lias.lab.entity.MemberStatus;
import com.lias.lab.entity.Role;
import com.lias.lab.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByRole(Role role);
    List<User> findByTeamId(Long teamId);
    List<User> findByStatus(MemberStatus status);
}
