package com.moneymate.repository;

import com.moneymate.entity.SavingsGoalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoalEntity, String> {
    List<SavingsGoalEntity> findByUserIdOrderByCreatedAtAsc(String userId);
    Optional<SavingsGoalEntity> findByIdAndUserId(String id, String userId);
    void deleteByUserId(String userId);
}
