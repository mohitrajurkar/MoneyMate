package com.moneymate.service;

import com.moneymate.dto.NotificationDto;
import com.moneymate.entity.NotificationEntity;
import com.moneymate.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationDto> getNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String userId, String id) {
        notificationRepository.findByIdAndUserId(id, userId).ifPresent(notif -> {
            notif.setRead(true);
            notificationRepository.save(notif);
        });
    }

    @Transactional
    public void clearAll(String userId) {
        notificationRepository.deleteByUserId(userId);
    }

    public NotificationDto mapToDto(NotificationEntity entity) {
        return new NotificationDto(
                entity.getId(),
                entity.getUserId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.getRead(),
                entity.getCreatedAt()
        );
    }
}
