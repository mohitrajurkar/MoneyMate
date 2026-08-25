package com.moneymate.service;

import com.moneymate.dto.SavingsGoalDto;
import com.moneymate.entity.SavingsGoalEntity;
import com.moneymate.exception.ResourceNotFoundException;
import com.moneymate.repository.SavingsGoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
    }

    public List<SavingsGoalDto> getGoals(String userId) {
        return savingsGoalRepository.findByUserIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SavingsGoalDto saveGoal(String userId, SavingsGoalDto dto) {
        SavingsGoalEntity goal;
        if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
            goal = savingsGoalRepository.findByIdAndUserId(dto.getId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + dto.getId()));
        } else {
            goal = new SavingsGoalEntity();
            goal.setId("goal_" + userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4));
            goal.setUserId(userId);
            goal.setCurrentAmount(0.0);
            goal.setCreatedAt(Instant.now().toString());
        }

        goal.setName(dto.getName() != null ? dto.getName().trim() : "Savings Goal");
        goal.setTargetAmount(dto.getTargetAmount() != null ? dto.getTargetAmount() : 0.0);
        if (dto.getCurrentAmount() != null) {
            goal.setCurrentAmount(dto.getCurrentAmount());
        }
        goal.setTargetDate(dto.getTargetDate());
        goal.setIcon(dto.getIcon());
        goal.setColor(dto.getColor());
        goal.setUpdatedAt(Instant.now().toString());

        SavingsGoalEntity saved = savingsGoalRepository.save(goal);
        return mapToDto(saved);
    }

    @Transactional
    public SavingsGoalDto updateDeposit(String userId, String goalId, double amountChange) {
        SavingsGoalEntity goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + goalId));

        double current = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : 0.0;
        goal.setCurrentAmount(Math.max(0.0, current + amountChange));
        goal.setUpdatedAt(Instant.now().toString());

        SavingsGoalEntity saved = savingsGoalRepository.save(goal);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteGoal(String userId, String id) {
        SavingsGoalEntity goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + id));
        savingsGoalRepository.delete(goal);
    }

    public SavingsGoalDto mapToDto(SavingsGoalEntity entity) {
        SavingsGoalDto dto = new SavingsGoalDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        dto.setTargetAmount(entity.getTargetAmount());
        dto.setCurrentAmount(entity.getCurrentAmount());
        dto.setTargetDate(entity.getTargetDate());
        dto.setIcon(entity.getIcon());
        dto.setColor(entity.getColor());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
