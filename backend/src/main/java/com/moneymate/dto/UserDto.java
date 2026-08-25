package com.moneymate.dto;

public class UserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String avatar;
    private String currency;
    private String createdAt;
    private String updatedAt;

    public UserDto() {
    }

    public UserDto(String id, String name, String email, String role, String avatar, String currency, String createdAt, String updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.avatar = avatar;
        this.currency = currency;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
