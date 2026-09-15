package com.example.trackingorder.controller;

import com.example.trackingorder.common.RoleEnum;
import com.example.trackingorder.dto.featureflag.FeatureFlagSyncRequest;
import com.example.trackingorder.repository.UserRepo;
import com.example.trackingorder.service.InternalFeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/feature-flags")
@RequiredArgsConstructor
public class InternalFeatureFlagController {

    private final UserRepo userRepo;
    private final InternalFeatureFlagService internalFeatureFlagService;

    // lấy user từ db cho checkbox list
    @GetMapping("/users")
    public ResponseEntity<List<String>> getUsers(@RequestHeader(value = "X-Internal-Token", required = false) String token) {
        return ResponseEntity.ok(userRepo.findAll().stream().map(u -> u.getUsername()).toList());
    }

    // lấy role
    @GetMapping("/roles")
    public ResponseEntity<List<String>> getRoles(@RequestHeader(value = "X-Internal-Token", required = false) String token) {
        List<String> roles = Arrays.stream(RoleEnum.values())
                .map(RoleEnum::name)
                .toList();
        return ResponseEntity.ok(roles);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> sync(
            @RequestHeader(value = "X-Internal-Token", required = false) String token,
            @RequestBody FeatureFlagSyncRequest request
    ) {
        return internalFeatureFlagService.sync(token, request);
    }
}