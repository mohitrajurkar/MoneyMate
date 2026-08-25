package com.moneymate.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "debt_payments")
public class DebtPaymentEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debt_id", nullable = false)
    @JsonIgnore
    private DebtEntity debt;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "date", nullable = false, length = 32)
    private String date; // YYYY-MM-DD

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public DebtPaymentEntity() {
    }

    public DebtPaymentEntity(String id, DebtEntity debt, Double amount, String date, String notes) {
        this.id = id;
        this.debt = debt;
        this.amount = amount;
        this.date = date;
        this.notes = notes;
        this.createdAt = Instant.now().toString();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now().toString();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public DebtEntity getDebt() {
        return debt;
    }

    public void setDebt(DebtEntity debt) {
        this.debt = debt;
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
