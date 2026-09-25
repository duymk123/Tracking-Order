package com.example.trackingorder.controller;

import com.example.featureflag.dto.FeatureFlagSyncRequest;
import com.example.featureflag.service.FeatureFlagConfigService;
import com.example.trackingorder.common.RoleEnum;
import com.example.trackingorder.repository.UserRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/feature-flags")
@RequiredArgsConstructor
@Slf4j
public class InternalFeatureFlagController {

    private final UserRepo userRepo;
    private final FeatureFlagConfigService featureFlagConfigService;
    private final ObjectMapper objectMapper;

    @Value("${feature-flag.sync-token:change-me}")
    private String syncToken;

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

    //  Đồng bộ snapshot cờ tự động qua HTTP Multipart File Stream
    @PostMapping(value = "/sync-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> syncFile(
            @RequestHeader(value = "X-Internal-Token", required = false) String token,
            @RequestParam("file") MultipartFile file
    ) {
        if (syncToken == null || !syncToken.equals(token)) {
            log.warn("Unauthorized file sync attempt with token: {}", token);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid internal token"));
        }
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "File snapshot rỗng"));
        }

        try {
            // Đọc file theo luồng InputStream (tránh load nguyên chuỗi JSON khổng lồ vào Heap RAM)
            FeatureFlagSyncRequest request = objectMapper.readValue(file.getInputStream(), FeatureFlagSyncRequest.class);
            int syncedRows = featureFlagConfigService.syncSnapshot(request);
            log.info("Successfully synced snapshot file '{}' ({} bytes) version: {}",
                    file.getOriginalFilename(), file.getSize(), request.getVersion());

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Feature flag snapshot synced from file stream",
                    "fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown",
                    "fileSizeBytes", file.getSize(),
                    "version", request.getVersion() != null ? request.getVersion() : "unknown",
                    "syncedRows", syncedRows
            ));
        } catch (Exception e) {
            log.error("Failed to parse and sync feature flag file: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "status", "FAILED",
                            "message", "Không thể phân tích và đồng bộ file: " + e.getMessage()
                    ));
        }
    }
}