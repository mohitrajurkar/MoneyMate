package com.moneymate.repository;

import com.moneymate.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, String> {
    List<TransactionEntity> findByUserIdOrderByTransactionDateDescTransactionTimeDescCreatedAtDesc(String userId);
    Optional<TransactionEntity> findByIdAndUserId(String id, String userId);
    List<TransactionEntity> findByUserIdAndTransactionDateStartingWith(String userId, String yearMonth);
    void deleteByUserId(String userId);
}
