package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Shipper;
import com.example.trackingorder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipperRepo extends JpaRepository<Shipper, String> {
    Optional<Shipper> findByUser(User user);

    List<Shipper> findByCarrierId(String carrierId);
}
