package com.moneymate.repository;

import com.moneymate.entity.StreakCheckInEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StreakCheckInRepository extends JpaRepository<StreakCheckInEntity, String> {
    List<StreakCheckInEntity> findByUserIdOrderByCheckInDateAsc(String userId);
    Optional<StreakCheckInEntity> findByUserIdAndCheckInDate(String userId, String checkInDate);
    boolean existsByUserIdAndCheckInDate(String userId, String checkInDate);
    void deleteByUserId(String userId);
}
