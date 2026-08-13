package com.example.trackingorder.controller;

import com.example.trackingorder.service.FeatureService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller cho phép Frontend query trạng thái feature flags.
 * Thay vì dùng Togglz, giờ delegate sang FeatureFlagClient.
 */
@RestController
@RequestMapping("/api/v1/features")
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureService featureService;

    @GetMapping("/buy-now")
    public ResponseEntity<Map<String, Boolean>> isBuyNowActive() {
        return ResponseEntity.ok(featureService.isBuyNowActive());
    }

    @GetMapping("/price-increase")
    public ResponseEntity<Map<String, Boolean>> isPriceIncreaseActive() {
        return ResponseEntity.ok(featureService.isPriceIncreaseActive());
    }

    @GetMapping("/order")
    public ResponseEntity<Map<String, Boolean>> isOrderActive() {
        return ResponseEntity.ok(featureService.isOrderActive());
    }

    @GetMapping("/debug")
    public ResponseEntity<Map<String, String>> debugContext(HttpServletRequest request) {
        return ResponseEntity.ok(featureService.debugContext(request));
    }
}
