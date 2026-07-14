package com.example.trackingorder.repository;

import com.example.trackingorder.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepo extends JpaRepository<PaymentMethod, String> {
}
