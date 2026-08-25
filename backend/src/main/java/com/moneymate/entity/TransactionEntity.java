package com.moneymate.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "transactions")
public class TransactionEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "account_id", nullable = false, length = 64)
    private String accountId;

    @Column(name = "to_account_id", length = 64)
    private String toAccountId;

    @Column(name = "category_id", length = 64)
    private String categoryId;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "transaction_type", nullable = false, length = 32)
    private String transactionType; // INCOME, EXPENSE, TRANSFER

    @Column(name = "merchant")
    private String merchant;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transaction_date", nullable = false, length = 32)
    private String transactionDate; // YYYY-MM-DD

    @Column(name = "transaction_time", length = 32)
    private String transactionTime; // HH:mm:ss

    @Column(name = "upi_ref_id")
    private String upiRefId;

    @Column(name = "source", length = 64)
    private String source;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // JSON or comma-separated

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "updated_at", nullable = false)
    private String updatedAt;

    public TransactionEntity() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now().toString();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now().toString();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now().toString();
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

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getToAccountId() {
        return toAccountId;
    }

    public void setToAccountId(String toAccountId) {
        this.toAccountId = toAccountId;
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

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(String transactionTime) {
        this.transactionTime = transactionTime;
    }

    public String getUpiRefId() {
        return upiRefId;
    }

    public void setUpiRefId(String upiRefId) {
        this.upiRefId = upiRefId;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
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
