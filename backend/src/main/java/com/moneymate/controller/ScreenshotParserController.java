package com.moneymate.controller;

import com.moneymate.dto.ScreenshotParseRequest;
import com.moneymate.dto.ScreenshotParseResponse;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.GeminiVisionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parse-screenshot")
public class ScreenshotParserController {

    private final GeminiVisionService geminiVisionService;

    public ScreenshotParserController(GeminiVisionService geminiVisionService) {
        this.geminiVisionService = geminiVisionService;
    }

    @PostMapping
    public ResponseEntity<ScreenshotParseResponse> parseScreenshot(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ScreenshotParseRequest request) {
        ScreenshotParseResponse response = geminiVisionService.parseScreenshot(request.getImageBase64(), request.getMimeType());
        return ResponseEntity.ok(response);
    }
}
