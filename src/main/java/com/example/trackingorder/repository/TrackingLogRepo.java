package com.example.trackingorder.repository;

import com.example.trackingorder.entity.TrackingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrackingLogRepo extends JpaRepository<TrackingLog, String> {
    @Query("""
            SELECT tl
            FROM TrackingLog tl
            JOIN FETCH tl.updateBy u
            WHERE tl.order.id = :orderId 
            ORDER BY tl.timestamp ASC
            """)
    List<TrackingLog> findByOrderId(@Param("orderId") String orderId);
}
