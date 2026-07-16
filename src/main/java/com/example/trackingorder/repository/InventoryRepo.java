package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Inventory;
import com.example.trackingorder.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepo extends JpaRepository<Inventory, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT i
        FROM Inventory i
        JOIN FETCH i.productVariant pv
        JOIN FETCH pv.product
        WHERE pv.id IN :variantIds
        """)
    List<Inventory> findByVariantIdsForUpdate(@Paramgit("variantIds") List<String> variantIds);

    // Tìm số lượng tồn kho theo variant
    Optional<Inventory> findByProductVariant(ProductVariant productVariant);
}
