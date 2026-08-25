package com.moneymate.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "debts")
public class DebtEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "type", nullable = false, length = 32)
    private String type; // LENT, BORROWED

    @Column(name = "person_name", nullable = false)
    private String personName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "paid_amount", nullable = false)
    private Double paidAmount = 0.0;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "PENDING"; // PENDING, PARTIAL, SETTLED

    @Column(name = "due_date")
    private String dueDate;

    @Column(name = "created_date")
    private String createdDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "debt", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DebtPaymentEntity> payments = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "updated_at", nullable = false)
    private String updatedAt;

    public DebtEntity() {
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

    public void addPayment(DebtPaymentEntity payment) {
        payments.add(payment);
        payment.setDebt(this);
    }

    public void removePayment(DebtPaymentEntity payment) {
        payments.remove(payment);
        payment.setDebt(null);
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

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<DebtPaymentEntity> getPayments() {
        return payments;
    }

    public void setPayments(List<DebtPaymentEntity> payments) {
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
