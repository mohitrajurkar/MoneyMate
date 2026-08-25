package com.moneymate.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneymate.dto.TransactionDto;
import com.moneymate.entity.AccountEntity;
import com.moneymate.entity.BudgetEntity;
import com.moneymate.entity.TransactionEntity;
import com.moneymate.exception.BadRequestException;
import com.moneymate.exception.ResourceNotFoundException;
import com.moneymate.repository.AccountRepository;
import com.moneymate.repository.BudgetRepository;
import com.moneymate.repository.CategoryRepository;
import com.moneymate.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final ObjectMapper objectMapper;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            BudgetRepository budgetRepository,
            ObjectMapper objectMapper) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.budgetRepository = budgetRepository;
        this.objectMapper = objectMapper;
    }

    public List<TransactionDto> getTransactions(String userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDescTransactionTimeDescCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TransactionDto getTransactionById(String userId, String id) {
        TransactionEntity txn = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return mapToDto(txn);
    }

    @Transactional
    public TransactionDto addTransaction(String userId, TransactionDto dto) {
        AccountEntity sourceAccount = accountRepository.findByIdAndUserId(dto.getAccountId(), userId)
                .orElseThrow(() -> new BadRequestException("Associated source account not found or does not belong to this user."));

        AccountEntity destAccount = null;
        if ("TRANSFER".equalsIgnoreCase(dto.getTransactionType()) && dto.getToAccountId() != null) {
            destAccount = accountRepository.findByIdAndUserId(dto.getToAccountId(), userId)
                    .orElseThrow(() -> new BadRequestException("Associated destination account not found or does not belong to this user."));
        }

        if (dto.getCategoryId() != null && !dto.getCategoryId().trim().isEmpty()) {
            boolean catExists = categoryRepository.findByIdAndUserId(dto.getCategoryId(), userId).isPresent();
            if (!catExists) {
                // If not found in user custom categories, verify if category exists or set to null
                dto.setCategoryId(null);
            }
        }

        double amount = Math.abs(dto.getAmount() != null ? dto.getAmount() : 0.0);
        if (amount <= 0) {
            throw new BadRequestException("Transaction amount must be greater than 0.");
        }

        // 1. Create transaction entity
        TransactionEntity entity = new TransactionEntity();
        entity.setId("txn_" + userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4));
        entity.setUserId(userId);
        entity.setAccountId(sourceAccount.getId());
        entity.setToAccountId(destAccount != null ? destAccount.getId() : null);
        entity.setCategoryId(dto.getCategoryId());
        entity.setAmount(amount);
        entity.setTransactionType(dto.getTransactionType() != null ? dto.getTransactionType() : "EXPENSE");
        entity.setMerchant(dto.getMerchant() != null ? dto.getMerchant().trim() : "");
        entity.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : "");
        entity.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod().trim() : "UPI");
        entity.setTransactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDate.now().toString());
        entity.setTransactionTime(dto.getTransactionTime() != null ? dto.getTransactionTime() : "12:00:00");
        entity.setUpiRefId(dto.getUpiRefId());
        entity.setSource(dto.getSource() != null ? dto.getSource() : "MANUAL");
        entity.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : null);
        entity.setTags(serializeTags(dto.getTags()));
        entity.setCreatedAt(Instant.now().toString());
        entity.setUpdatedAt(Instant.now().toString());

        // 2. Update source account balance
        applyAccountBalance(sourceAccount, amount, entity.getTransactionType(), false);
        accountRepository.save(sourceAccount);

        // If transfer, update destination account balance
        if (destAccount != null) {
            applyAccountBalance(destAccount, amount, "INCOME", false);
            accountRepository.save(destAccount);
        }

        TransactionEntity saved = transactionRepository.save(entity);

        // 3. Recalculate budgets
        recalculateBudgets(userId);

        return mapToDto(saved);
    }

    @Transactional
    public TransactionDto updateTransaction(String userId, String id, TransactionDto dto) {
        TransactionEntity oldTxn = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // 1. Reverse old transaction impact
        accountRepository.findByIdAndUserId(oldTxn.getAccountId(), userId).ifPresent(oldSource -> {
            applyAccountBalance(oldSource, oldTxn.getAmount(), oldTxn.getTransactionType(), true);
            accountRepository.save(oldSource);
        });

        if ("TRANSFER".equalsIgnoreCase(oldTxn.getTransactionType()) && oldTxn.getToAccountId() != null) {
            accountRepository.findByIdAndUserId(oldTxn.getToAccountId(), userId).ifPresent(oldDest -> {
                applyAccountBalance(oldDest, oldTxn.getAmount(), "INCOME", true);
                accountRepository.save(oldDest);
            });
        }

        // 2. Validate new accounts
        String newAccountId = dto.getAccountId() != null ? dto.getAccountId() : oldTxn.getAccountId();
        AccountEntity newSource = accountRepository.findByIdAndUserId(newAccountId, userId)
                .orElseThrow(() -> new BadRequestException("Associated source account not found or does not belong to this user."));

        AccountEntity newDest = null;
        if ("TRANSFER".equalsIgnoreCase(dto.getTransactionType() != null ? dto.getTransactionType() : oldTxn.getTransactionType())) {
            String toAccId = dto.getToAccountId() != null ? dto.getToAccountId() : oldTxn.getToAccountId();
            if (toAccId != null) {
                newDest = accountRepository.findByIdAndUserId(toAccId, userId)
                        .orElseThrow(() -> new BadRequestException("Associated destination account not found or does not belong to this user."));
            }
        }

        double newAmount = Math.abs(dto.getAmount() != null ? dto.getAmount() : oldTxn.getAmount());
        if (newAmount <= 0) {
            throw new BadRequestException("Transaction amount must be greater than 0.");
        }

        // 3. Update entity
        oldTxn.setAccountId(newSource.getId());
        oldTxn.setToAccountId(newDest != null ? newDest.getId() : null);
        if (dto.getCategoryId() != null) oldTxn.setCategoryId(dto.getCategoryId());
        oldTxn.setAmount(newAmount);
        if (dto.getTransactionType() != null) oldTxn.setTransactionType(dto.getTransactionType());
        if (dto.getMerchant() != null) oldTxn.setMerchant(dto.getMerchant().trim());
        if (dto.getDescription() != null) oldTxn.setDescription(dto.getDescription().trim());
        if (dto.getPaymentMethod() != null) oldTxn.setPaymentMethod(dto.getPaymentMethod().trim());
        if (dto.getTransactionDate() != null) oldTxn.setTransactionDate(dto.getTransactionDate());
        if (dto.getTransactionTime() != null) oldTxn.setTransactionTime(dto.getTransactionTime());
        if (dto.getUpiRefId() != null) oldTxn.setUpiRefId(dto.getUpiRefId());
        if (dto.getSource() != null) oldTxn.setSource(dto.getSource());
        if (dto.getNotes() != null) oldTxn.setNotes(dto.getNotes().trim());
        if (dto.getTags() != null) oldTxn.setTags(serializeTags(dto.getTags()));
        oldTxn.setUpdatedAt(Instant.now().toString());

        // 4. Apply new balance impact
        applyAccountBalance(newSource, newAmount, oldTxn.getTransactionType(), false);
        accountRepository.save(newSource);

        if (newDest != null) {
            applyAccountBalance(newDest, newAmount, "INCOME", false);
            accountRepository.save(newDest);
        }

        TransactionEntity saved = transactionRepository.save(oldTxn);
        recalculateBudgets(userId);

        return mapToDto(saved);
    }

    @Transactional
    public void deleteTransaction(String userId, String id) {
        TransactionEntity txn = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Reverse impact
        accountRepository.findByIdAndUserId(txn.getAccountId(), userId).ifPresent(source -> {
            applyAccountBalance(source, txn.getAmount(), txn.getTransactionType(), true);
            accountRepository.save(source);
        });

        if ("TRANSFER".equalsIgnoreCase(txn.getTransactionType()) && txn.getToAccountId() != null) {
            accountRepository.findByIdAndUserId(txn.getToAccountId(), userId).ifPresent(dest -> {
                applyAccountBalance(dest, txn.getAmount(), "INCOME", true);
                accountRepository.save(dest);
            });
        }

        transactionRepository.delete(txn);
        recalculateBudgets(userId);
    }

    /**
     * Recalculates spent amounts for all monthly budgets based on transactions
     */
    @Transactional
    public void recalculateBudgets(String userId) {
        List<BudgetEntity> budgets = budgetRepository.findByUserId(userId);
        List<TransactionEntity> transactions = transactionRepository.findByUserIdOrderByTransactionDateDescTransactionTimeDescCreatedAtDesc(userId);

        LocalDate now = LocalDate.now();
        int curMonth = now.getMonthValue();
        int curYear = now.getYear();

        for (BudgetEntity budget : budgets) {
            if (budget.getMonth() == curMonth && budget.getYear() == curYear) {
                double spent = 0.0;
                for (TransactionEntity t : transactions) {
                    if ("EXPENSE".equalsIgnoreCase(t.getTransactionType()) &&
                            budget.getCategoryId() != null &&
                            budget.getCategoryId().equals(t.getCategoryId())) {
                        try {
                            LocalDate tDate = LocalDate.parse(t.getTransactionDate());
                            if (tDate.getMonthValue() == curMonth && tDate.getYear() == curYear) {
                                spent += t.getAmount();
                            }
                        } catch (Exception ignored) {
                        }
                    }
                }
                budget.setSpent(Math.round(spent * 100.0) / 100.0);
                budgetRepository.save(budget);
            }
        }
    }

    private void applyAccountBalance(AccountEntity account, double amount, String type, boolean isReversal) {
        double direction = isReversal ? -1.0 : 1.0;
        double currentBalance = account.getBalance() != null ? account.getBalance() : 0.0;

        if ("CREDIT_CARD".equalsIgnoreCase(account.getAccountType())) {
            if ("EXPENSE".equalsIgnoreCase(type) || "TRANSFER".equalsIgnoreCase(type)) {
                currentBalance += amount * direction; // debt increases
            } else if ("INCOME".equalsIgnoreCase(type)) {
                currentBalance -= amount * direction; // debt decreases
            }
        } else {
            if ("INCOME".equalsIgnoreCase(type)) {
                currentBalance += amount * direction;
            } else if ("EXPENSE".equalsIgnoreCase(type) || "TRANSFER".equalsIgnoreCase(type)) {
                currentBalance -= amount * direction;
            }
        }

        account.setBalance(Math.round(currentBalance * 100.0) / 100.0);
        account.setUpdatedAt(Instant.now().toString());
    }

    private String serializeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(tags);
        } catch (Exception e) {
            return String.join(",", tags);
        }
    }

    private List<String> deserializeTags(String tagsJson) {
        if (tagsJson == null || tagsJson.trim().isEmpty()) return new ArrayList<>();
        try {
            return objectMapper.readValue(tagsJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Arrays.stream(tagsJson.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
    }

    public TransactionDto mapToDto(TransactionEntity entity) {
        TransactionDto dto = new TransactionDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setAccountId(entity.getAccountId());
        dto.setToAccountId(entity.getToAccountId());
        dto.setCategoryId(entity.getCategoryId());
        dto.setAmount(entity.getAmount());
        dto.setTransactionType(entity.getTransactionType());
        dto.setMerchant(entity.getMerchant());
        dto.setDescription(entity.getDescription());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setTransactionDate(entity.getTransactionDate());
        dto.setTransactionTime(entity.getTransactionTime());
        dto.setUpiRefId(entity.getUpiRefId());
        dto.setSource(entity.getSource());
        dto.setNotes(entity.getNotes());
        dto.setTags(deserializeTags(entity.getTags()));
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
