package com.example.trackingorder.service;

import com.example.trackingorder.dto.featureflag.FeatureFlagSyncRequest;

public interface FeatureFlagConfigService {
    int syncSnapshot(FeatureFlagSyncRequest request);

    boolean isEnabled(String flagName);
}
