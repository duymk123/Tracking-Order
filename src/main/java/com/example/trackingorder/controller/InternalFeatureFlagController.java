package com.example.trackingorder.controller;

import com.example.trackingorder.dto.featureflag.FeatureFlagSyncRequest;
import com.example.trackingorder.service.InternalFeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/feature-flags")
@RequiredArgsConstructor
public class InternalFeatureFlagController {

    private final InternalFeatureFlagService internalFeatureFlagService;

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> sync(
            @RequestHeader(value = "X-Internal-Token", required = false) String token,
            @RequestBody FeatureFlagSyncRequest request
    ) {
        return internalFeatureFlagService.sync(token, request);
    }
}
