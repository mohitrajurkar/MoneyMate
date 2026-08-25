package com.moneymate.repository;

import com.moneymate.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, String> {
    List<CategoryEntity> findByUserIdOrderByNameAsc(String userId);
    Optional<CategoryEntity> findByIdAndUserId(String id, String userId);
    void deleteByUserId(String userId);
}
