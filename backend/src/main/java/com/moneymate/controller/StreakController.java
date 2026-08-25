package com.moneymate.controller;

import com.moneymate.dto.CheckInResponse;
import com.moneymate.dto.DailyStreakInfoDto;
import com.moneymate.dto.WarrenBuffettQuoteDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.StreakService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/streaks")
public class StreakController {

    private final StreakService streakService;

    public StreakController(StreakService streakService) {
        this.streakService = streakService;
    }

    @GetMapping
    public ResponseEntity<DailyStreakInfoDto> getStreakInfo(@AuthenticationPrincipal UserPrincipal principal) {
        DailyStreakInfoDto info = streakService.calculateStreak(principal.getId());
        return ResponseEntity.ok(info);
    }

    @PostMapping("/check-in")
    public ResponseEntity<CheckInResponse> recordCheckIn(@AuthenticationPrincipal UserPrincipal principal) {
        CheckInResponse response = streakService.recordCheckIn(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recover")
    public ResponseEntity<CheckInResponse> recoverStreak(@AuthenticationPrincipal UserPrincipal principal) {
        CheckInResponse response = streakService.recoverStreak(principal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/quote")
    public ResponseEntity<WarrenBuffettQuoteDto> getQuote() {
        return ResponseEntity.ok(streakService.getActiveQuote());
    }

    @PostMapping("/quote/shuffle")
    public ResponseEntity<WarrenBuffettQuoteDto> shuffleQuote() {
        return ResponseEntity.ok(streakService.shuffleQuote());
    }
}
