package com.example.trackingorder.service.impl;

import com.example.trackingorder.dto.featureflag.FeatureFlagSyncRequest;
import com.example.trackingorder.service.FeatureFlagConfigService;
import com.example.trackingorder.service.InternalFeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class InternalFeatureFlagServiceImpl implements InternalFeatureFlagService {

    private final FeatureFlagConfigService featureFlagConfigService;

    @Value("${feature-flag.sync-token:change-me}")
    private String syncToken;

    @Override
    public ResponseEntity<Map<String, Object>> sync(String token, FeatureFlagSyncRequest request) {
        if (syncToken == null || !syncToken.equals(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid internal token"));
        }

        int syncedRows = featureFlagConfigService.syncSnapshot(request);
        return ResponseEntity.ok(Map.of(
                "message", "Feature flag snapshot synced",
                "syncedRows", syncedRows
        ));
    }
}
