package com.example.trackingorder.repository;

import com.example.trackingorder.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductVariantRepo extends JpaRepository<ProductVariant, String> {
    Optional<ProductVariant> findById(String id);
}
