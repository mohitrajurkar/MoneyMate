package com.moneymate.service;

import com.moneymate.dto.BudgetDto;
import com.moneymate.entity.BudgetEntity;
import com.moneymate.exception.BadRequestException;
import com.moneymate.exception.ResourceNotFoundException;
import com.moneymate.repository.BudgetRepository;
import com.moneymate.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionService transactionService;

    public BudgetService(
            BudgetRepository budgetRepository,
            CategoryRepository categoryRepository,
            TransactionService transactionService) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionService = transactionService;
    }

    public List<BudgetDto> getBudgets(String userId) {
        transactionService.recalculateBudgets(userId);
        return budgetRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetDto saveBudget(String userId, BudgetDto dto) {
        LocalDate now = LocalDate.now();
        int month = dto.getMonth() != null ? dto.getMonth() : now.getMonthValue();
        int year = dto.getYear() != null ? dto.getYear() : now.getYear();

        if (dto.getCategoryId() != null && !dto.getCategoryId().trim().isEmpty()) {
            boolean categoryExists = categoryRepository.findByIdAndUserId(dto.getCategoryId(), userId).isPresent();
            if (!categoryExists) {
                throw new BadRequestException("Category not found or does not belong to this user.");
            }
        }

        BudgetEntity budget;
        if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
            budget = budgetRepository.findByIdAndUserId(dto.getId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + dto.getId()));
        } else {
            budget = new BudgetEntity();
            budget.setId("bud_" + userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4));
            budget.setUserId(userId);
            budget.setSpent(0.0);
            budget.setCreatedAt(Instant.now().toString());
        }

        budget.setCategoryId(dto.getCategoryId());
        budget.setAmount(dto.getAmount() != null ? dto.getAmount() : 0.0);
        budget.setMonth(month);
        budget.setYear(year);

        BudgetEntity saved = budgetRepository.save(budget);
        transactionService.recalculateBudgets(userId);

        return mapToDto(budgetRepository.findById(saved.getId()).orElse(saved));
    }

    @Transactional
    public void deleteBudget(String userId, String id) {
        BudgetEntity budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        budgetRepository.delete(budget);
    }

    public BudgetDto mapToDto(BudgetEntity entity) {
        BudgetDto dto = new BudgetDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setCategoryId(entity.getCategoryId());
        dto.setAmount(entity.getAmount());
        dto.setSpent(entity.getSpent());
        dto.setMonth(entity.getMonth());
        dto.setYear(entity.getYear());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
