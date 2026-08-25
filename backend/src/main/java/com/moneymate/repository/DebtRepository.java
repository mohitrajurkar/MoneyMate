package com.moneymate.repository;

import com.moneymate.entity.DebtEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DebtRepository extends JpaRepository<DebtEntity, String> {
    List<DebtEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<DebtEntity> findByIdAndUserId(String id, String userId);
    void deleteByUserId(String userId);
}
