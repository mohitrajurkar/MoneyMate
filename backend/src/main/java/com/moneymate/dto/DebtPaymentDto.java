package com.moneymate.dto;

public class DebtPaymentDto {
    private String id;
    private Double amount;
    private String date;
    private String notes;
    private String createdAt;

    public DebtPaymentDto() {
    }

    public DebtPaymentDto(String id, Double amount, String date, String notes) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.notes = notes;
    }

    public DebtPaymentDto(String id, Double amount, String date, String notes, String createdAt) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
