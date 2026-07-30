package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepo extends JpaRepository<Product, String> {
    @Query("""
    SELECT p
    FROM Product p
    JOIN FETCH p.productCategory
    """)
    List<Product> findAllProduct();

    @Query("""
    SELECT p
    FROM Product p
    JOIN FETCH p.productCategory
    WHERE p.id = :id
    """)
    Optional<Product> findProductDetail(String id);
}
