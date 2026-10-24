package com.lias.lab.repository;

import com.lias.lab.entity.Publication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByYear(Integer year);
    List<Publication> findByTypeIgnoreCase(String type);
    List<Publication> findByTeamId(Long teamId);
}
