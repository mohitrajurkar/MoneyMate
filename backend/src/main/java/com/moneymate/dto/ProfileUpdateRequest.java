package com.moneymate.dto;

import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    private String avatar;

    @Size(max = 16, message = "Currency symbol cannot exceed 16 characters")
    private String currency;

    public ProfileUpdateRequest() {
    }

    public ProfileUpdateRequest(String name, String avatar, String currency) {
        this.name = name;
        this.avatar = avatar;
        this.currency = currency;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
