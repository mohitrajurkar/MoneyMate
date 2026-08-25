package com.moneymate.dto;

public class ScreenshotParseResponse {
    private boolean success;
    private String source;
    private ParsedUpiDataDto data;
    private String error;

    public ScreenshotParseResponse() {
    }

    public ScreenshotParseResponse(boolean success, String source, ParsedUpiDataDto data) {
        this.success = success;
        this.source = source;
        this.data = data;
    }

    public ScreenshotParseResponse(boolean success, String error) {
        this.success = success;
        this.error = error;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public ParsedUpiDataDto getData() {
        return data;
    }

    public void setData(ParsedUpiDataDto data) {
        this.data = data;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
