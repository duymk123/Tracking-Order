package com.example.trackingorder.repository;

import com.example.trackingorder.entity.User;
import com.example.trackingorder.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepo extends JpaRepository<UserAddress, String> {
    // dam bao user k the dat hang bang address cua ng khac
    Optional<UserAddress> findByIdAndUser(String id, User user);

    List<UserAddress> findByUser(User user);

    Optional<UserAddress> findByUserAndIsDefaultTrue(User user);
}
