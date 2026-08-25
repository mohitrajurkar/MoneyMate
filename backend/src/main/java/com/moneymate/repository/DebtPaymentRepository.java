package com.moneymate.repository;

import com.moneymate.entity.DebtPaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebtPaymentRepository extends JpaRepository<DebtPaymentEntity, String> {
    List<DebtPaymentEntity> findByDebtIdOrderByCreatedAtAsc(String debtId);
}
