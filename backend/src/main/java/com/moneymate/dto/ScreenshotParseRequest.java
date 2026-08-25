package com.moneymate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ScreenshotParseRequest {

    @NotBlank(message = "imageBase64 is required")
    @Size(max = 15_000_000, message = "Image payload exceeds maximum allowable size (10MB)")
    private String imageBase64;

    private String mimeType;

    public ScreenshotParseRequest() {
    }

    public ScreenshotParseRequest(String imageBase64, String mimeType) {
        this.imageBase64 = imageBase64;
        this.mimeType = mimeType;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
}
