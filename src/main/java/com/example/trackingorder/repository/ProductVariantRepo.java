package com.example.trackingorder.repository;

import com.example.trackingorder.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepo extends JpaRepository<ProductVariant, String> {

    @Query("""
    SELECT DISTINCT pv
    FROM ProductVariant pv
    JOIN FETCH pv.product p
    LEFT JOIN FETCH pv.inventory i
    WHERE pv.id IN :ids
    """)
    List<ProductVariant> findAllByIds(@Param("ids") List<String> ids);

    Optional<ProductVariant> findById(String id);
}
