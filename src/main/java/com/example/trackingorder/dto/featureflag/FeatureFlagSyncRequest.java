package com.example.trackingorder.dto.featureflag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlagSyncRequest {
    private String version;
    private List<FeatureFlagSyncItem> features;
}
