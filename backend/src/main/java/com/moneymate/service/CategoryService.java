package com.moneymate.service;

import com.moneymate.dto.CategoryDto;
import com.moneymate.entity.CategoryEntity;
import com.moneymate.exception.ResourceNotFoundException;
import com.moneymate.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> getCategories(String userId) {
        return categoryRepository.findByUserIdOrderByNameAsc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto saveCategory(String userId, CategoryDto dto) {
        CategoryEntity category;
        if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
            category = categoryRepository.findByIdAndUserId(dto.getId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getId()));
        } else {
            category = new CategoryEntity();
            category.setId("cat_" + userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 4));
            category.setUserId(userId);
        }

        category.setName(dto.getName() != null ? dto.getName().trim() : "Custom Category");
        category.setType(dto.getType() != null ? dto.getType() : "EXPENSE");
        category.setIcon(dto.getIcon());
        category.setColor(dto.getColor());
        category.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);

        CategoryEntity saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteCategory(String userId, String categoryId) {
        CategoryEntity cat = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        categoryRepository.delete(cat);
    }

    public CategoryDto mapToDto(CategoryEntity entity) {
        return new CategoryDto(
                entity.getId(),
                entity.getUserId(),
                entity.getName(),
                entity.getType(),
                entity.getIcon(),
                entity.getColor(),
                entity.getIsDefault()
        );
    }
}
