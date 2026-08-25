package com.moneymate.service;

import com.moneymate.dto.AccountDto;
import com.moneymate.entity.AccountEntity;
import com.moneymate.exception.ResourceNotFoundException;
import com.moneymate.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<AccountDto> getAccounts(String userId) {
        return accountRepository.findByUserIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AccountDto getAccountById(String userId, String id) {
        AccountEntity acc = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
        return mapToDto(acc);
    }

    @Transactional
    public AccountDto saveAccount(String userId, AccountDto dto) {
        List<AccountEntity> existingAccounts = accountRepository.findByUserIdOrderByCreatedAtAsc(userId);

        boolean shouldBeDefault = dto.getIsDefault() != null
                ? dto.getIsDefault()
                : existingAccounts.isEmpty();

        if (shouldBeDefault) {
            for (AccountEntity acc : existingAccounts) {
                if (Boolean.TRUE.equals(acc.getIsDefault())) {
                    acc.setIsDefault(false);
                    acc.setUpdatedAt(Instant.now().toString());
                    accountRepository.save(acc);
                }
            }
        }

        AccountEntity account;
        if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
            account = accountRepository.findByIdAndUserId(dto.getId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + dto.getId()));
        } else {
            account = new AccountEntity();
            account.setId("acc_" + userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4));
            account.setUserId(userId);
            account.setCreatedAt(Instant.now().toString());
        }

        account.setName(dto.getName() != null ? dto.getName().trim() : "Bank Account");
        account.setAccountType(dto.getAccountType() != null ? dto.getAccountType() : "BANK");
        account.setBalance(dto.getBalance() != null ? dto.getBalance() : 0.0);
        account.setCreditLimit(dto.getCreditLimit());
        account.setMaskedAccountNumber(dto.getMaskedAccountNumber() != null ? dto.getMaskedAccountNumber() : "");
        account.setIcon(dto.getIcon());
        account.setColor(dto.getColor());
        account.setIsDefault(shouldBeDefault);
        account.setInstitutionName(dto.getInstitutionName());
        account.setUpdatedAt(Instant.now().toString());

        AccountEntity saved = accountRepository.save(account);
        return mapToDto(saved);
    }

    @Transactional
    public List<AccountDto> setDefaultAccount(String userId, String accountId) {
        AccountEntity targetAccount = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        List<AccountEntity> accounts = accountRepository.findByUserIdOrderByCreatedAtAsc(userId);
        for (AccountEntity acc : accounts) {
            acc.setIsDefault(acc.getId().equals(targetAccount.getId()));
            acc.setUpdatedAt(Instant.now().toString());
            accountRepository.save(acc);
        }
        return accounts.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteAccount(String userId, String accountId) {
        AccountEntity acc = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        accountRepository.delete(acc);

        List<AccountEntity> remaining = accountRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (!remaining.isEmpty() && remaining.stream().noneMatch(a -> Boolean.TRUE.equals(a.getIsDefault()))) {
            remaining.get(0).setIsDefault(true);
            remaining.get(0).setUpdatedAt(Instant.now().toString());
            accountRepository.save(remaining.get(0));
        }
    }

    public AccountDto mapToDto(AccountEntity entity) {
        AccountDto dto = new AccountDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        dto.setAccountType(entity.getAccountType());
        dto.setBalance(entity.getBalance());
        dto.setCreditLimit(entity.getCreditLimit());
        dto.setMaskedAccountNumber(entity.getMaskedAccountNumber());
        dto.setIcon(entity.getIcon());
        dto.setColor(entity.getColor());
        dto.setIsDefault(entity.getIsDefault());
        dto.setInstitutionName(entity.getInstitutionName());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
