package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Return;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRepo extends JpaRepository<Return, String> {
    List<Return> findByUserId(String userId);
    List<Return> findByOrderId(String orderId);
}
