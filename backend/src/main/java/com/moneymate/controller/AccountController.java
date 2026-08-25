package com.moneymate.controller;

import com.moneymate.dto.AccountDto;
import com.moneymate.dto.ApiResponse;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<List<AccountDto>> getAccounts(@AuthenticationPrincipal UserPrincipal principal) {
        List<AccountDto> list = accountService.getAccounts(principal.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDto> getAccountById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        AccountDto account = accountService.getAccountById(principal.getId(), id);
        return ResponseEntity.ok(account);
    }

    @PostMapping
    public ResponseEntity<AccountDto> saveAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AccountDto dto) {
        AccountDto saved = accountService.saveAccount(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountDto> updateAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody AccountDto dto) {
        dto.setId(id);
        AccountDto saved = accountService.saveAccount(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/default")
    public ResponseEntity<List<AccountDto>> setDefaultAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        List<AccountDto> list = accountService.setDefaultAccount(principal.getId(), id);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        accountService.deleteAccount(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.okMessage("Account deleted successfully"));
    }
}
