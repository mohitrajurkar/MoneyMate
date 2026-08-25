package com.moneymate.controller;

import com.moneymate.dto.ApiResponse;
import com.moneymate.dto.CategoryDto;
import com.moneymate.security.UserPrincipal;
import com.moneymate.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(@AuthenticationPrincipal UserPrincipal principal) {
        List<CategoryDto> list = categoryService.getCategories(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> saveCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CategoryDto dto) {
        CategoryDto saved = categoryService.saveCategory(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody CategoryDto dto) {
        dto.setId(id);
        CategoryDto saved = categoryService.saveCategory(principal.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        categoryService.deleteCategory(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.okMessage("Category deleted successfully"));
    }
}
