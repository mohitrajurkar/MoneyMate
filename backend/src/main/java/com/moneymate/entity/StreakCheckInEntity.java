package com.moneymate.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "streak_checkins", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "check_in_date"})
})
public class StreakCheckInEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "check_in_date", nullable = false, length = 32)
    private String checkInDate; // YYYY-MM-DD

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public StreakCheckInEntity() {
    }

    public StreakCheckInEntity(String id, String userId, String checkInDate) {
        this.id = id;
        this.userId = userId;
        this.checkInDate = checkInDate;
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(String checkInDate) {
        this.checkInDate = checkInDate;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
