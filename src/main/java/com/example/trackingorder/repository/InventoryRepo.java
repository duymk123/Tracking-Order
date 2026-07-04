package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Inventory;
import com.example.trackingorder.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepo extends JpaRepository<Inventory, String> {
    // Tìm số lượng tồn kho theo variant
    Optional<Inventory> findByProductVariant(ProductVariant productVariant);
}
