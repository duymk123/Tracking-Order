package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Carrier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarrierRepo extends JpaRepository<Carrier, String> {

    Optional<Carrier> findByName(String name);

    // seller biết carrier nào đang Active
    List<Carrier> findByIsActiveTrue();

    String id(String id);
}
