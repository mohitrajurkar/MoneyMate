package com.moneymate.controller;

import com.moneymate.dto.ApiResponse;
import com.moneymate.dto.TransactionDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getTransactions(@AuthenticationPrincipal UserPrincipal principal) {
        List<TransactionDto> list = transactionService.getTransactions(principal.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDto> getTransactionById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        TransactionDto txn = transactionService.getTransactionById(principal.getId(), id);
        return ResponseEntity.ok(txn);
    }

    @PostMapping
    public ResponseEntity<TransactionDto> addTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TransactionDto dto) {
        TransactionDto saved = transactionService.addTransaction(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> updateTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody TransactionDto dto) {
        TransactionDto updated = transactionService.updateTransaction(principal.getId(), id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        transactionService.deleteTransaction(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.okMessage("Transaction deleted successfully"));
    }
}
