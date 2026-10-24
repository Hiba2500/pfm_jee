package com.lias.lab.repository;

import com.lias.lab.entity.ResearchTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResearchTeamRepository extends JpaRepository<ResearchTeam, Long> {
    Optional<ResearchTeam> findByAcronymIgnoreCase(String acronym);
}
