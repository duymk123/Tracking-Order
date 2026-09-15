package com.example.trackingorder.dto.featureflag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
// Đại diện 1 feature-flag trong snapshot
public class FeatureFlagSyncItem {
    private String flagName;
    private Boolean enabled;
    private String strategyLogic;

    // thay thế strategyId và paramId -> strategies
    private List<StrategyItemSync> strategies;

    private List<CustomerFeatureSyncItem> customers;
}