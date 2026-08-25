package com.moneymate.repository;

import com.moneymate.entity.BudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<BudgetEntity, String> {
    List<BudgetEntity> findByUserId(String userId);
    List<BudgetEntity> findByUserIdAndMonthAndYear(String userId, Integer month, Integer year);
    Optional<BudgetEntity> findByIdAndUserId(String id, String userId);
    void deleteByUserId(String userId);
}
