package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Cart;
import com.example.trackingorder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepo extends JpaRepository<Cart, String> {
    //Lấy ra giỏ hàng của User
    Optional<Cart> findByUser(User user);
}
