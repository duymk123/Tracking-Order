package com.example.trackingorder.service;

import com.example.trackingorder.dto.featureflag.FeatureFlagSyncRequest;

import java.util.Map;

public interface FeatureFlagConfigService {
    int syncSnapshot(FeatureFlagSyncRequest request);

    boolean isEnabled(String flagName);

    // evaluate cho tất cả flag để trả về json
    Map<String, Boolean> evaluateAll();
}
