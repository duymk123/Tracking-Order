package com.example.trackingorder;

import com.example.trackingorder.dto.request.RegisterReq;
import com.example.trackingorder.dto.response.UserProfileRes;
import com.example.trackingorder.entity.Cart;
import com.example.trackingorder.entity.User;
import com.example.trackingorder.repository.CartRepo;
import com.example.trackingorder.repository.UserRepo;
import com.example.trackingorder.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

@SpringBootTest
class CartDebugTests {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CartRepo cartRepo;

    @Test
    void debugCartCreationViaService() {
        RegisterReq req = new RegisterReq();
        req.setUsername("servicetest_" + System.currentTimeMillis());
        req.setPassword("password");
        req.setPhone(String.valueOf(System.currentTimeMillis()));
        req.setRole("BUYER");

        UserProfileRes res = userService.register(req);
        System.out.println("Registered User: " + res.getUsername() + ", Role: " + res.getRole());

        User user = userRepo.findByUsername(res.getUsername()).get();
        Optional<Cart> cart = cartRepo.findByUser(user);
        System.out.println("HAS CART: " + cart.isPresent());
    }
}
