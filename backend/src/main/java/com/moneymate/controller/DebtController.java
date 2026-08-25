package com.moneymate.controller;

import com.moneymate.dto.ApiResponse;
import com.moneymate.dto.DebtDto;
import com.moneymate.dto.RepaymentRequest;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.DebtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debts")
public class DebtController {

    private final DebtService debtService;

    public DebtController(DebtService debtService) {
        this.debtService = debtService;
    }

    @GetMapping
    public ResponseEntity<List<DebtDto>> getDebts(@AuthenticationPrincipal UserPrincipal principal) {
        List<DebtDto> list = debtService.getDebts(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<DebtDto> saveDebt(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DebtDto dto) {
        DebtDto saved = debtService.saveDebt(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DebtDto> updateDebt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody DebtDto dto) {
        dto.setId(id);
        DebtDto saved = debtService.saveDebt(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/repay")
    public ResponseEntity<DebtDto> recordRepayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody RepaymentRequest request) {
        DebtDto updated = debtService.recordRepayment(
                principal.getId(),
                id,
                request.getAmount() != null ? request.getAmount() : 0.0,
                request.getAccountId(),
                request.getNotes()
        );
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/settle")
    public ResponseEntity<DebtDto> settleDebt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        DebtDto updated = debtService.settleDebt(principal.getId(), id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDebt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        debtService.deleteDebt(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.okMessage("Debt record deleted successfully"));
    }
}
