package com.moneymate.controller;

import com.moneymate.dto.ApiResponse;
import com.moneymate.dto.DepositRequest;
import com.moneymate.dto.SavingsGoalDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    public ResponseEntity<List<SavingsGoalDto>> getGoals(@AuthenticationPrincipal UserPrincipal principal) {
        List<SavingsGoalDto> list = savingsGoalService.getGoals(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<SavingsGoalDto> createGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SavingsGoalDto dto) {
        SavingsGoalDto saved = savingsGoalService.saveGoal(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalDto> updateGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody SavingsGoalDto dto) {
        dto.setId(id);
        SavingsGoalDto saved = savingsGoalService.saveGoal(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<SavingsGoalDto> updateDeposit(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody DepositRequest request) {
        SavingsGoalDto updated = savingsGoalService.updateDeposit(principal.getId(), id, request.getAmountChange() != null ? request.getAmountChange() : 0.0);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        savingsGoalService.deleteGoal(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.okMessage("Savings goal deleted successfully"));
    }
}
