package com.example.trackingorder.controller;

import com.example.trackingorder.dto.request.AddToCartReq;
import com.example.trackingorder.dto.request.UpdateCartReq;
import com.example.trackingorder.dto.response.CartRes;
import com.example.trackingorder.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
@Validated
public class CartController {
    private final CartService cartService;

    @GetMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<CartRes> getCurrentCart(){
        CartRes cartRes = cartService.getCurrentCart();
        return ResponseEntity.ok(cartRes);
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<CartRes> addToCart(@Valid @RequestBody AddToCartReq req){
        CartRes cartRes = cartService.addToCart(req);
        return ResponseEntity.ok(cartRes);
    }

    @PatchMapping("/items")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<CartRes> updateCartItem(@Valid @RequestBody UpdateCartReq req){
        CartRes cartRes = cartService.updateCartItem(req);
        return ResponseEntity.ok(cartRes);
    }

}
