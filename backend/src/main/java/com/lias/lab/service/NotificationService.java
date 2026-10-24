package com.lias.lab.service;

import com.lias.lab.entity.Notification;
import com.lias.lab.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repository;

    /** userId null = notification adressée à tout le laboratoire. */
    public void notifyUser(Long userId, String type, String title, String message) {
        repository.save(Notification.builder().userId(userId).type(type).title(title).message(message).build());
    }

    public void notifyEmail(String email, String type, String title, String message) {
        repository.save(Notification.builder().recipientEmail(email).type(type).title(title).message(message).build());
    }
}
