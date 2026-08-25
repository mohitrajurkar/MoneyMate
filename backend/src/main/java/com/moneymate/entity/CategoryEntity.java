package com.moneymate.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class CategoryEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "type", nullable = false, length = 32)
    private String type; // INCOME, EXPENSE, BOTH

    @Column(name = "icon")
    private String icon;

    @Column(name = "color")
    private String color;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    public CategoryEntity() {
    }

    public CategoryEntity(String id, String userId, String name, String type, String icon, String color, Boolean isDefault) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.type = type;
        this.icon = icon;
        this.color = color;
        this.isDefault = isDefault != null ? isDefault : false;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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
}
