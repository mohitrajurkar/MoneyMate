package com.moneymate.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "accounts")
public class AccountEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "account_type", nullable = false, length = 32)
    private String accountType; // BANK, CREDIT_CARD, UPI_WALLET, CASH, INVESTMENT

    @Column(name = "balance", nullable = false)
    private Double balance = 0.0;

    @Column(name = "credit_limit")
    private Double creditLimit;

    @Column(name = "masked_account_number")
    private String maskedAccountNumber;

    @Column(name = "icon")
    private String icon;

    @Column(name = "color")
    private String color;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "institution_name")
    private String institutionName;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "updated_at", nullable = false)
    private String updatedAt;

    public AccountEntity() {
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public Double getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(Double creditLimit) {
        this.creditLimit = creditLimit;
    }

    public String getMaskedAccountNumber() {
        return maskedAccountNumber;
    }

    public void setMaskedAccountNumber(String maskedAccountNumber) {
        this.maskedAccountNumber = maskedAccountNumber;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
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
