package com.example.trackingorder.repository;

import com.example.trackingorder.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepo extends JpaRepository<ProductReview, String> {
    List<ProductReview> findByProductId(String productId);
    List<ProductReview> findByUserId(String userId);
}
