package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Coupon;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CouponRepo extends JpaRepository<Coupon, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Coupon> findByCode(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT c
    FROM Coupon c
    WHERE c.id = :couponId
""")
    Optional<Coupon> findByIdForUpdate(@Param("couponId") String couponId);
}
