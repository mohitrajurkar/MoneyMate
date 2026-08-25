package com.moneymate.controller;

import com.moneymate.dto.ApiResponse;
import com.moneymate.dto.NotificationDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationDto> list = notificationService.getNotifications(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        notificationService.markAsRead(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.okMessage("Notification marked as read"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> clearAll(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.clearAll(principal.getId());
        return ResponseEntity.ok(ApiResponse.okMessage("All notifications cleared"));
    }
}
