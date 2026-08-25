package com.moneymate.controller;

import com.moneymate.dto.ApiResponse;
import com.moneymate.dto.SubscriptionDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionDto>> getSubscriptions(@AuthenticationPrincipal UserPrincipal principal) {
        List<SubscriptionDto> list = subscriptionService.getSubscriptions(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<SubscriptionDto> createSubscription(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SubscriptionDto dto) {
        SubscriptionDto saved = subscriptionService.saveSubscription(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionDto> updateSubscription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody SubscriptionDto dto) {
        dto.setId(id);
        SubscriptionDto saved = subscriptionService.saveSubscription(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSubscription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        subscriptionService.deleteSubscription(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.okMessage("Subscription deleted successfully"));
    }
}
