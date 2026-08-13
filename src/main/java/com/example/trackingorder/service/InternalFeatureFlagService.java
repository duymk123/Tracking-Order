package com.example.trackingorder.service;

import com.example.trackingorder.dto.featureflag.FeatureFlagSyncRequest;
import org.springframework.http.ResponseEntity;
import java.util.Map;

public interface InternalFeatureFlagService {
    ResponseEntity<Map<String, Object>> sync(String token, FeatureFlagSyncRequest request);
}
