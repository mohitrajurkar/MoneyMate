package com.moneymate.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_notifications")
public class NotificationEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "type", nullable = false, length = 32)
    private String type = "INFO"; // WARNING, INFO, SUCCESS, ALERT

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public NotificationEntity() {
    }

    public NotificationEntity(String id, String userId, String title, String message, String type, Boolean isRead) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type != null ? type : "INFO";
        this.isRead = isRead != null ? isRead : false;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean getRead() {
        return isRead;
    }

    public void setRead(Boolean read) {
        isRead = read;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
