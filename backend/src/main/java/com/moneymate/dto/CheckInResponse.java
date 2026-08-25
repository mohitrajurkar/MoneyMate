package com.moneymate.dto;

public class CheckInResponse {
    private boolean success;
    private int streak;
    private String message;

    public CheckInResponse() {
    }

    public CheckInResponse(boolean success, int streak, String message) {
        this.success = success;
        this.streak = streak;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
