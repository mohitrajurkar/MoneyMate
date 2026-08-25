package com.moneymate.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class BudgetDto {
    private String id;
    private String userId;
    private String categoryId;

    @NotNull(message = "Budget amount is required")
    @Positive(message = "Budget amount must be strictly greater than 0")
    private Double amount;

    private Double spent;
    private Integer month;
    private Integer year;
    private String createdAt;

    public BudgetDto() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getSpent() {
        return spent;
    }

    public void setSpent(Double spent) {
        this.spent = spent;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
