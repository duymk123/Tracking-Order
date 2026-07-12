package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CouponRepo extends JpaRepository<Coupon, String> {
    Optional<Coupon> findByCode(String code);
}
