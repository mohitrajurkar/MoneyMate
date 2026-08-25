package com.moneymate.service;

import com.moneymate.dto.SubscriptionDto;
import com.moneymate.entity.SubscriptionEntity;
import com.moneymate.exception.ResourceNotFoundException;
import com.moneymate.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public List<SubscriptionDto> getSubscriptions(String userId) {
        return subscriptionRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionDto saveSubscription(String userId, SubscriptionDto dto) {
        SubscriptionEntity sub;
        if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
            sub = subscriptionRepository.findByIdAndUserId(dto.getId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + dto.getId()));
        } else {
            sub = new SubscriptionEntity();
            sub.setId("sub_" + userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4));
            sub.setUserId(userId);
        }

        sub.setName(dto.getName() != null ? dto.getName().trim() : "Subscription");
        sub.setAmount(dto.getAmount() != null ? dto.getAmount() : 0.0);
        sub.setCategoryId(dto.getCategoryId());
        sub.setBillingCycle(dto.getBillingCycle() != null ? dto.getBillingCycle() : "MONTHLY");
        sub.setNextBillingDate(dto.getNextBillingDate());
        sub.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        sub.setIcon(dto.getIcon());
        sub.setReminderDays(dto.getReminderDays() != null ? dto.getReminderDays() : 3);

        SubscriptionEntity saved = subscriptionRepository.save(sub);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteSubscription(String userId, String id) {
        SubscriptionEntity sub = subscriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        subscriptionRepository.delete(sub);
    }

    public SubscriptionDto mapToDto(SubscriptionEntity entity) {
        SubscriptionDto dto = new SubscriptionDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        dto.setAmount(entity.getAmount());
        dto.setCategoryId(entity.getCategoryId());
        dto.setBillingCycle(entity.getBillingCycle());
        dto.setNextBillingDate(entity.getNextBillingDate());
        dto.setStatus(entity.getStatus());
        dto.setIcon(entity.getIcon());
        dto.setReminderDays(entity.getReminderDays());
        return dto;
    }
}
