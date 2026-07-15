package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Order;
import com.example.trackingorder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepo extends JpaRepository<Order, String> {
    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.orderItems oi
            WHERE o.user = :user
            ORDER BY o.createdAt DESC
            """)
    List<Order> findAllByUser(@Param("user") User user);

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            JOIN FETCH o.address
            LEFT JOIN FETCH o.orderItems oi
            LEFT JOIN FETCH oi.productVariant pv
            LEFT JOIN FETCH pv.product
            WHERE o.id = :orderId
            AND o.user = :user
            """)
    Optional<Order> findOrderDetail(
            @Param("orderId") String orderId,
            @Param("user") User user);

    Optional<Order> findByIdAndUser(String orderId, User user);
}
