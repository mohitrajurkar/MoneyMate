package com.moneymate.service;

import com.moneymate.dto.DebtDto;
import com.moneymate.dto.DebtPaymentDto;
import com.moneymate.entity.AccountEntity;
import com.moneymate.entity.DebtEntity;
import com.moneymate.entity.DebtPaymentEntity;
import com.moneymate.exception.ResourceNotFoundException;
import com.moneymate.repository.AccountRepository;
import com.moneymate.repository.DebtRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DebtService {

    private final DebtRepository debtRepository;
    private final AccountRepository accountRepository;

    public DebtService(DebtRepository debtRepository, AccountRepository accountRepository) {
        this.debtRepository = debtRepository;
        this.accountRepository = accountRepository;
    }

    public List<DebtDto> getDebts(String userId) {
        return debtRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DebtDto saveDebt(String userId, DebtDto dto) {
        DebtEntity debt;
        double totalAmount = dto.getAmount() != null ? dto.getAmount() : 0.0;
        double paidAmount = dto.getPaidAmount() != null ? dto.getPaidAmount() : 0.0;
        String status = paidAmount >= totalAmount ? "SETTLED" : paidAmount > 0 ? "PARTIAL" : "PENDING";

        if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
            debt = debtRepository.findByIdAndUserId(dto.getId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Debt record not found with id: " + dto.getId()));
        } else {
            debt = new DebtEntity();
            debt.setId("debt_" + userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4));
            debt.setUserId(userId);
            debt.setCreatedDate(dto.getCreatedDate() != null ? dto.getCreatedDate() : LocalDate.now().toString());
            debt.setCreatedAt(Instant.now().toString());
        }

        debt.setType(dto.getType() != null ? dto.getType() : "LENT");
        debt.setPersonName(dto.getPersonName() != null ? dto.getPersonName().trim() : "Person");
        debt.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : "");
        debt.setAmount(totalAmount);
        debt.setPaidAmount(paidAmount);
        debt.setStatus(status);
        debt.setDueDate(dto.getDueDate());
        debt.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : "");
        debt.setUpdatedAt(Instant.now().toString());

        DebtEntity saved = debtRepository.save(debt);
        return mapToDto(saved);
    }

    @Transactional
    public DebtDto recordRepayment(String userId, String debtId, double amount, String accountId, String notes) {
        DebtEntity debt = debtRepository.findByIdAndUserId(debtId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Debt record not found with id: " + debtId));

        double paymentAmount = Math.max(0.0, amount);
        double newPaid = (debt.getPaidAmount() != null ? debt.getPaidAmount() : 0.0) + paymentAmount;
        String newStatus = newPaid >= debt.getAmount() ? "SETTLED" : "PARTIAL";

        DebtPaymentEntity payment = new DebtPaymentEntity(
                "pay_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4),
                debt,
                paymentAmount,
                LocalDate.now().toString(),
                notes != null ? notes : "Partial repayment"
        );

        debt.setPaidAmount(newPaid);
        debt.setStatus(newStatus);
        debt.addPayment(payment);
        debt.setUpdatedAt(Instant.now().toString());

        // Linked bank account balance adjustment if accountId passed
        if (accountId != null && !accountId.trim().isEmpty() && paymentAmount > 0) {
            accountRepository.findByIdAndUserId(accountId, userId).ifPresent(account -> {
                double currentBalance = account.getBalance() != null ? account.getBalance() : 0.0;
                if ("LENT".equalsIgnoreCase(debt.getType())) {
                    // Recovered money -> cash balance increases
                    account.setBalance(currentBalance + paymentAmount);
                } else {
                    // Paid back money -> cash balance decreases
                    account.setBalance(currentBalance - paymentAmount);
                }
                account.setUpdatedAt(Instant.now().toString());
                accountRepository.save(account);
            });
        }

        DebtEntity saved = debtRepository.save(debt);
        return mapToDto(saved);
    }

    @Transactional
    public DebtDto settleDebt(String userId, String debtId) {
        DebtEntity debt = debtRepository.findByIdAndUserId(debtId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Debt record not found with id: " + debtId));

        double remaining = Math.max(0.0, debt.getAmount() - (debt.getPaidAmount() != null ? debt.getPaidAmount() : 0.0));
        if (remaining > 0) {
            DebtPaymentEntity payment = new DebtPaymentEntity(
                    "pay_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4),
                    debt,
                    remaining,
                    LocalDate.now().toString(),
                    "Full settlement"
            );
            debt.addPayment(payment);
        }

        debt.setPaidAmount(debt.getAmount());
        debt.setStatus("SETTLED");
        debt.setUpdatedAt(Instant.now().toString());

        DebtEntity saved = debtRepository.save(debt);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteDebt(String userId, String id) {
        DebtEntity debt = debtRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Debt record not found with id: " + id));
        debtRepository.delete(debt);
    }

    public DebtDto mapToDto(DebtEntity entity) {
        DebtDto dto = new DebtDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setType(entity.getType());
        dto.setPersonName(entity.getPersonName());
        dto.setPhone(entity.getPhone());
        dto.setAmount(entity.getAmount());
        dto.setPaidAmount(entity.getPaidAmount());
        dto.setStatus(entity.getStatus());
        dto.setCreatedDate(entity.getCreatedDate());
        dto.setDueDate(entity.getDueDate());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        List<DebtPaymentDto> paymentDtos = new ArrayList<>();
        if (entity.getPayments() != null) {
            for (DebtPaymentEntity p : entity.getPayments()) {
                paymentDtos.add(new DebtPaymentDto(
                        p.getId(),
                        p.getAmount(),
                        p.getDate(),
                        p.getNotes(),
                        p.getCreatedAt()
                ));
            }
        }
        dto.setPayments(paymentDtos);

        return dto;
    }
}
