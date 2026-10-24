package com.lias.lab.controller;

import com.lias.lab.entity.Event;
import com.lias.lab.entity.MeetingMinutes;
import com.lias.lab.repository.EventRepository;
import com.lias.lab.repository.MeetingMinutesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * Section 20 : Calendrier navigable avec visualisation des événements et réunions.
 */
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final EventRepository eventRepository;
    private final MeetingMinutesRepository meetingRepository;

    @GetMapping
    public Map<String, Object> getCalendar(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        // Month can be 0-indexed (from JavaScript: 0 = Jan) or 1-indexed (1 = Jan).
        // If 0-11, map to 1-12.
        Integer targetMonth = null;
        if (month != null) {
            targetMonth = (month >= 0 && month <= 11) ? month + 1 : month;
        }

        List<Map<String, Object>> items = new ArrayList<>();

        // Add events
        for (Event e : eventRepository.findAll()) {
            if (e.isArchived()) continue;
            LocalDate eventDate = e.getDateStart() != null ? e.getDateStart() : e.getDate();
            if (eventDate == null) continue;

            if (eventDate.getYear() != targetYear) continue;
            if (targetMonth != null && eventDate.getMonthValue() != targetMonth) continue;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", "evt-" + e.getId());
            item.put("title", e.getTitle());
            item.put("category", "EVENT");
            item.put("subType", e.getType() != null ? e.getType() : "Événement");
            item.put("date", eventDate.toString());
            item.put("dateEnd", e.getDateEnd() != null ? e.getDateEnd().toString() : eventDate.toString());
            item.put("location", e.getLocation() != null ? e.getLocation() : "LIAS");
            item.put("details", e.getDescription() != null ? e.getDescription() : "");
            item.put("organizers", e.getOrganizers() != null ? e.getOrganizers() : (e.getOrganizer() != null ? e.getOrganizer() : "Comité"));
            item.put("participantsCount", e.getParticipantsCount() != null ? e.getParticipantsCount() : 0);
            items.add(item);
        }

        // Add meetings
        for (MeetingMinutes m : meetingRepository.findAll()) {
            LocalDate meetDate = m.getDate();
            if (meetDate == null) continue;

            if (meetDate.getYear() != targetYear) continue;
            if (targetMonth != null && meetDate.getMonthValue() != targetMonth) continue;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", "meet-" + m.getId());
            item.put("title", m.getTitle());
            item.put("category", "MEETING");
            item.put("subType", m.getMeetingType() != null ? m.getMeetingType() : "Réunion");
            item.put("date", meetDate.toString());
            item.put("dateEnd", meetDate.toString());
            item.put("location", m.getLocation() != null ? m.getLocation() : "Salle de réunion LIAS");
            item.put("details", m.getAgenda() != null && !m.getAgenda().isEmpty() ? String.join(" • ", m.getAgenda()) : "Réunion officielle");
            item.put("organizers", m.getSecretaryName() != null ? m.getSecretaryName() : "Direction");
            item.put("agenda", m.getAgenda());
            item.put("decisions", m.getDecisions());
            items.add(item);
        }

        // Sort items chronologically
        items.sort(Comparator.comparing(a -> String.valueOf(a.get("date"))));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("year", targetYear);
        result.put("month", targetMonth);
        result.put("total", items.size());
        result.put("items", items);
        return result;
    }
}
