package com.lias.lab.controller;

import com.lias.lab.entity.*;
import com.lias.lab.repository.*;
import com.lias.lab.service.AuditService;
import com.lias.lab.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/** Gestion du matériel (section 14) et des besoins en matériel (section 15). */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LogisticsController {

    private final EquipmentItemRepository itemRepository;
    private final EquipmentRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final AuditService audit;
    private final NotificationService notifications;

    @GetMapping({"/equipment", "/inventory/items"})
    public List<EquipmentItem> items() {
        return itemRepository.findAllByOrderByArrivalDateDesc();
    }

    /** Section 14 : inventaire complet avec répartition et équité (utilisé par DirectorDashboard). */
    @GetMapping({"/inventory", "/equipment/distribution"})
    public Map<String, Object> getInventory() {
        List<EquipmentItem> allItems = itemRepository.findAllByOrderByArrivalDateDesc();
        Set<Long> assignedMemberIds = allItems.stream()
                .filter(i -> i.getAssignedToUserId() != null)
                .map(EquipmentItem::getAssignedToUserId)
                .collect(Collectors.toSet());

        List<User> activeMembers = userRepository.findAll().stream()
                .filter(u -> !u.isFrozen() && !u.isDisabled() && u.getRole() != Role.ADMIN)
                .toList();

        List<Map<String, Object>> whoReceived = activeMembers.stream()
                .filter(m -> assignedMemberIds.contains(m.getId()))
                .map(m -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("memberId", String.valueOf(m.getId()));
                    map.put("name", m.fullName());
                    map.put("role", m.getRole().name());
                    map.put("status", m.getStatus().name());
                    map.put("teamName", m.getTeamName());
                    map.put("items", allItems.stream().filter(i -> m.getId().equals(i.getAssignedToUserId())).toList());
                    return map;
                }).toList();

        List<Map<String, Object>> whoDidNotReceive = activeMembers.stream()
                .filter(m -> !assignedMemberIds.contains(m.getId()))
                .map(m -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("memberId", String.valueOf(m.getId()));
                    map.put("name", m.fullName());
                    map.put("role", m.getRole().name());
                    map.put("status", m.getStatus().name());
                    map.put("teamName", m.getTeamName());
                    map.put("eligibleForNextArrival", true);
                    return map;
                }).toList();

        long allocatedCount = allItems.stream().filter(i -> i.getAssignedToUserId() != null).count();
        long availableCount = allItems.stream().filter(i -> i.getAssignedToUserId() == null).count();
        int equityRate = activeMembers.isEmpty() ? 0 : (int) Math.round(((double) whoReceived.size() / activeMembers.size()) * 100);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("inventory", allItems);
        response.put("arrivalsCount", allItems.size());
        response.put("allocatedCount", allocatedCount);
        response.put("availableCount", availableCount);
        response.put("whoReceived", whoReceived);
        response.put("whoDidNotReceive", whoDidNotReceive);
        response.put("equityRate", equityRate);
        return response;
    }

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping({"/equipment", "/inventory"})
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentItem registerArrival(@AuthenticationPrincipal User director, @RequestBody Map<String, Object> body) {
        String designation = (String) body.get("designation");
        if (designation == null || designation.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Désignation obligatoire");
        }
        String category = (String) body.getOrDefault("category", "Général");
        String source = (String) body.getOrDefault("supplierOrSource", body.get("source"));
        String inventoryNumber = (String) body.getOrDefault("serialOrInventoryNumber", body.get("inventoryNumber"));
        if (inventoryNumber == null || inventoryNumber.isBlank()) {
            inventoryNumber = "LIAS-EQ-" + System.currentTimeMillis() % 100000;
        }

        LocalDate arrivalDate = LocalDate.now();
        if (body.get("arrivalDate") != null) {
            try {
                String dStr = String.valueOf(body.get("arrivalDate"));
                if (dStr.length() >= 10) dStr = dStr.substring(0, 10);
                arrivalDate = LocalDate.parse(dStr);
            } catch (Exception ignored) {}
        }

        EquipmentItem item = EquipmentItem.builder()
                .designation(designation)
                .category(category)
                .inventoryNumber(inventoryNumber)
                .source(source != null ? source : "Dotation Laboratoire")
                .arrivalDate(arrivalDate)
                .notes((String) body.get("notes"))
                .build();

        audit.log(director, "EQUIPMENT_ARRIVAL", item.getDesignation(), null);
        return itemRepository.save(item);
    }

    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping({"/equipment/{id}/assign/{userId}", "/inventory/{id}/assign"})
    public EquipmentItem assign(@AuthenticationPrincipal User director,
                                @PathVariable Long id,
                                @PathVariable(required = false) Long userId,
                                @RequestBody(required = false) Map<String, Object> body) {
        EquipmentItem item = itemRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Matériel introuvable"));
        if (item.getAssignedToUserId() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce matériel est déjà attribué");
        }

        Long targetUserId = userId;
        if (targetUserId == null && body != null && body.containsKey("memberId")) {
            try {
                targetUserId = Long.valueOf(String.valueOf(body.get("memberId")));
            } catch (NumberFormatException ignored) {}
        }
        if (targetUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Identifiant du membre obligatoire pour l'attribution");
        }

        User member = userRepository.findById(targetUserId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable"));
        if (member.isFrozen() || member.isDisabled()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce membre n'a pas de compte actif");
        }
        item.setAssignedToUserId(member.getId());
        item.setAssignedToName(member.fullName());
        item.setAssignedDate(LocalDate.now());
        if (body != null && body.containsKey("notes")) {
            item.setNotes((String) body.get("notes"));
        }
        notifications.notifyUser(member.getId(), "REQUEST", "Matériel attribué", item.getDesignation());
        audit.log(director, "EQUIPMENT_ASSIGNED", item.getDesignation(), member.getEmail());
        return itemRepository.save(item);
    }

    /** Qui a reçu quoi / qui n'a pas reçu : base d'une distribution équitable. */
    @GetMapping("/equipment/distribution")
    public Map<String, Object> distribution() {
        List<EquipmentItem> items = itemRepository.findAll();
        Map<Long, List<String>> received = items.stream().filter(i -> i.getAssignedToUserId() != null)
                .collect(Collectors.groupingBy(EquipmentItem::getAssignedToUserId,
                        Collectors.mapping(EquipmentItem::getDesignation, Collectors.toList())));
        List<Map<String, Object>> have = new ArrayList<>();
        List<String> haveNot = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            if (u.isFrozen() || u.isDisabled() || u.getRole() == Role.ADMIN) continue;
            if (received.containsKey(u.getId())) {
                have.add(Map.of("member", u.fullName(), "items", received.get(u.getId())));
            } else {
                haveNot.add(u.fullName());
            }
        }
        return Map.of("received", have, "notReceived", haveNot,
                "available", items.stream().filter(i -> i.getAssignedToUserId() == null).toList());
    }

    @GetMapping("/equipment-requests")
    public List<EquipmentRequest> requests(@AuthenticationPrincipal User me) {
        return me.getRole() == Role.DIRECTOR || me.getRole() == Role.ADMIN
                ? requestRepository.findAllByOrderByCreatedAtDesc()
                : requestRepository.findByMemberIdOrderByCreatedAtDesc(me.getId());
    }

    @PostMapping("/equipment-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentRequest submit(@AuthenticationPrincipal User me, @RequestBody EquipmentRequest body) {
        if (body.getTitle() == null || body.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre obligatoire");
        }
        body.setId(null);
        body.setMemberId(me.getId());
        body.setMemberName(me.fullName());
        body.setStatus(ApplicationStatus.PENDING);
        body.setCreatedAt(LocalDateTime.now());
        body.setDecidedAt(null);
        return requestRepository.save(body);
    }

    /** Validation par la direction : ACCEPTED (validée) ou REJECTED (refusée). */
    @PreAuthorize("@governance.isDirectorInMandate(authentication)")
    @PostMapping("/equipment-requests/{id}/decision")
    public EquipmentRequest decide(@AuthenticationPrincipal User director, @PathVariable Long id, @RequestBody Map<String, String> body) {
        ApplicationStatus decision;
        String decStr = String.valueOf(body.get("decision"));
        if ("APPROVED".equalsIgnoreCase(decStr)) {
            decision = ApplicationStatus.ACCEPTED;
        } else {
            try {
                decision = ApplicationStatus.valueOf(decStr);
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Décision attendue : ACCEPTED ou REJECTED");
            }
        }
        if (decision == ApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Décision attendue : ACCEPTED ou REJECTED");
        }
        EquipmentRequest request = requestRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));
        request.setStatus(decision);
        request.setDecidedAt(LocalDateTime.now());
        notifications.notifyUser(request.getMemberId(), "REQUEST",
                decision == ApplicationStatus.ACCEPTED ? "Demande de matériel validée" : "Demande de matériel refusée", request.getTitle());
        audit.log(director, "EQUIPMENT_REQUEST_" + decision, request.getTitle(), request.getMemberName());
        return requestRepository.save(request);
    }
}
