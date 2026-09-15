package com.example.trackingorder.controller;

import com.example.trackingorder.service.FeatureService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/features")
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureService featureService;

    @GetMapping("/evaluate-all")
    public ResponseEntity<Map<String, Object>> evaluateAll() {
        return ResponseEntity.ok(Map.of("items", featureService.evaluateAll()));
    }

    @GetMapping("/debug")
    public ResponseEntity<Map<String, String>> debugContext(HttpServletRequest request) {
        return ResponseEntity.ok(featureService.debugContext(request));
    }
}
