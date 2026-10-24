package com.lias.lab.repository;

import com.lias.lab.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByTypeIgnoreCase(String type);
    List<Event> findByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);
    List<Event> findBySeriesOrderByEditionDesc(String series);
}
