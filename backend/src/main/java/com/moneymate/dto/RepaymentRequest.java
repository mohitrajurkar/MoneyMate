package com.moneymate.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class RepaymentRequest {

    @NotNull(message = "Repayment amount is required")
    @Positive(message = "Repayment amount must be strictly greater than 0")
    private Double amount;

    private String accountId;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public RepaymentRequest() {
    }

    public RepaymentRequest(Double amount, String accountId, String notes) {
        this.amount = amount;
        this.accountId = accountId;
        this.notes = notes;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
