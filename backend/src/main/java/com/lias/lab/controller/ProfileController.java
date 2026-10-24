package com.lias.lab.controller;

import com.lias.lab.entity.ProfileChange;
import com.lias.lab.entity.User;
import com.lias.lab.repository.ProfileChangeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Section 3 : Historisation automatique des modifications de profil.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileChangeRepository profileChangeRepository;

    @GetMapping("/history")
    public List<ProfileChange> getMyProfileHistory(@AuthenticationPrincipal User me) {
        if (me == null) return List.of();
        return profileChangeRepository.findByUserIdOrderByChangedAtDesc(me.getId());
    }
}
