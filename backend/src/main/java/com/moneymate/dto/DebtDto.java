package com.moneymate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public class DebtDto {
    private String id;
    private String userId;
    private String type; // LENT, BORROWED

    @NotBlank(message = "Person name is required")
    @Size(max = 100, message = "Person name cannot exceed 100 characters")
    private String personName;

    private String phone;

    @NotNull(message = "Debt amount is required")
    @Positive(message = "Debt amount must be strictly greater than 0")
    private Double amount;

    private Double paidAmount;
    private String status; // PENDING, PARTIAL, SETTLED
    private String createdDate;
    private String dueDate;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    private List<DebtPaymentDto> payments;
    private String createdAt;
    private String updatedAt;

    public DebtDto() {
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPersonName() {
        return personName;
    }

    public void setPersonName(String personName) {
        this.personName = personName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<DebtPaymentDto> getPayments() {
        return payments;
    }

    public void setPayments(List<DebtPaymentDto> payments) {
        this.payments = payments;
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
