package com.example.trackingorder.controller;

import com.example.trackingorder.client.FeatureFlagClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller cho phép Frontend query trạng thái feature flags.
 * Thay vì dùng Togglz, giờ delegate sang FeatureFlagClient.
 */
@RestController
@RequestMapping("/api/v1/features")
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureFlagClient featureFlagClient;

    @GetMapping("/buy-now")
    public ResponseEntity<Map<String, Boolean>> isBuyNowActive() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("active", featureFlagClient.isEnabled("BUY_NOW"));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/price-increase")
    public ResponseEntity<Map<String, Boolean>> isPriceIncreaseActive() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("active", featureFlagClient.isEnabled("PRICE_INCREASE"));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order")
    public ResponseEntity<Map<String, Boolean>> isOrderActive() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("active", featureFlagClient.isEnabled("ORDER_DETAIL"));
        return ResponseEntity.ok(response);
    }
}
