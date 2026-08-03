package com.example.trackingorder.controller;

import com.example.trackingorder.common.FeatureFlags;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.togglz.core.manager.FeatureManager;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/features")
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureManager featureManager;

    @GetMapping("/buy-now")
    public ResponseEntity<Map<String, Boolean>> isBuyNowActive() {
        Map<String, Boolean> response = new HashMap<>();
        // Gọi hàm kiểm tra cờ của Togglz
        response.put("active", featureManager.isActive(FeatureFlags.BUY_NOW));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/price-increase")
    public ResponseEntity<Map<String, Boolean>> isPriceIncreaseActive() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("active", featureManager.isActive(FeatureFlags.PRICE_INCREASE));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order")
    public ResponseEntity<Map<String, Boolean>> isOrderActive() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("active", featureManager.isActive(FeatureFlags.ORDER_DETAIL));
        return ResponseEntity.ok(response);
    }
}
