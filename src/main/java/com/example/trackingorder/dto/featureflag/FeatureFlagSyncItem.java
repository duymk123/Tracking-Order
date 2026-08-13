package com.example.trackingorder.dto.featureflag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlagSyncItem {
    private String flagName;
    private Boolean enabled;
    private String strategyId;
    private Map<String, String> strategyParams;
    private List<CustomerFeatureSyncItem> customers;
}
