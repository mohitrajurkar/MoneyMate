package com.moneymate.controller;

import com.moneymate.dto.ApiResponse;
import com.moneymate.dto.BudgetDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getBudgets(@AuthenticationPrincipal UserPrincipal principal) {
        List<BudgetDto> list = budgetService.getBudgets(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<BudgetDto> saveBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BudgetDto dto) {
        BudgetDto saved = budgetService.saveBudget(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDto> updateBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody BudgetDto dto) {
        dto.setId(id);
        BudgetDto saved = budgetService.saveBudget(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        budgetService.deleteBudget(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.okMessage("Budget deleted successfully"));
    }
}
