package com.moneymate.dto;

import jakarta.validation.constraints.NotNull;

public class DepositRequest {

    @NotNull(message = "amountChange is required")
    private Double amountChange;

    public DepositRequest() {
    }

    public DepositRequest(Double amountChange) {
        this.amountChange = amountChange;
    }

    public Double getAmountChange() {
        return amountChange;
    }

    public void setAmountChange(Double amountChange) {
        this.amountChange = amountChange;
    }
}
