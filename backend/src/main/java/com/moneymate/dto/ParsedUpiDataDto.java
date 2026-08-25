package com.moneymate.dto;

public class ParsedUpiDataDto {
    private Double amount;
    private String merchant;
    private String suggestedCategory;
    private String transactionType; // EXPENSE or INCOME
    private String paymentMethod;
    private String upiRefId;
    private String accountHint;
    private String date; // YYYY-MM-DD
    private String time;
    private Double confidence;
    private String notes;

    public ParsedUpiDataDto() {
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public String getSuggestedCategory() {
        return suggestedCategory;
    }

    public void setSuggestedCategory(String suggestedCategory) {
        this.suggestedCategory = suggestedCategory;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getUpiRefId() {
        return upiRefId;
    }

    public void setUpiRefId(String upiRefId) {
        this.upiRefId = upiRefId;
    }

    public String getAccountHint() {
        return accountHint;
    }

    public void setAccountHint(String accountHint) {
        this.accountHint = accountHint;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
