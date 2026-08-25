package com.moneymate.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "subscriptions")
public class SubscriptionEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "category_id", length = 64)
    private String categoryId;

    @Column(name = "billing_cycle", nullable = false, length = 32)
    private String billingCycle; // MONTHLY, QUARTERLY, YEARLY, WEEKLY

    @Column(name = "next_billing_date", length = 32)
    private String nextBillingDate;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "ACTIVE"; // ACTIVE, PAUSED, CANCELLED

    @Column(name = "icon")
    private String icon;

    @Column(name = "reminder_days")
    private Integer reminderDays;

    public SubscriptionEntity() {
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

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public String getNextBillingDate() {
        return nextBillingDate;
    }

    public void setNextBillingDate(String nextBillingDate) {
        this.nextBillingDate = nextBillingDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Integer getReminderDays() {
        return reminderDays;
    }

    public void setReminderDays(Integer reminderDays) {
        this.reminderDays = reminderDays;
    }
}
