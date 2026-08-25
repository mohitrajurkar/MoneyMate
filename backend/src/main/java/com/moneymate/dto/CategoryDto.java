package com.moneymate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryDto {
    private String id;
    private String userId;

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name cannot exceed 100 characters")
    private String name;

    private String type;
    private String icon;
    private String color;
    private Boolean isDefault;

    public CategoryDto() {
    }

    public CategoryDto(String id, String userId, String name, String type, String icon, String color, Boolean isDefault) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.type = type;
        this.icon = icon;
        this.color = color;
        this.isDefault = isDefault;
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
