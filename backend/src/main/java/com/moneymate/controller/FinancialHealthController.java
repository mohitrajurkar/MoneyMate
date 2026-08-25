package com.moneymate.controller;

import com.moneymate.dto.FinancialHealthScoreDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.FinancialHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
public class FinancialHealthController {

    private final FinancialHealthService financialHealthService;

    public FinancialHealthController(FinancialHealthService financialHealthService) {
        this.financialHealthService = financialHealthService;
    }

    @GetMapping("/health")
    public ResponseEntity<FinancialHealthScoreDto> getFinancialHealth(@AuthenticationPrincipal UserPrincipal principal) {
        FinancialHealthScoreDto score = financialHealthService.calculateFinancialHealth(principal.getId());
        return ResponseEntity.ok(score);
    }
}
