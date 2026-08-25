package com.moneymate.controller;

import com.moneymate.dto.ApiResponse;
import com.moneymate.dto.ProfileUpdateRequest;
import com.moneymate.dto.UserDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        UserDto updated = authService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/reset-data")
    public ResponseEntity<ApiResponse<String>> resetUserData(@AuthenticationPrincipal UserPrincipal principal) {
        authService.resetUserDataToZero(principal.getId());
        return ResponseEntity.ok(ApiResponse.okMessage("User financial data reset to zero successfully."));
    }
}
