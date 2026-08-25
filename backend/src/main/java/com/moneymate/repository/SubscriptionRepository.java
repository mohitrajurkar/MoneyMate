package com.moneymate.repository;

import com.moneymate.entity.SubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, String> {
    List<SubscriptionEntity> findByUserId(String userId);
    Optional<SubscriptionEntity> findByIdAndUserId(String id, String userId);
    void deleteByUserId(String userId);
}
