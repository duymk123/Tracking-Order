package com.example.trackingorder.dto.featureflag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
// đại diện cho override của 1 customer trong flag
public class CustomerFeatureSyncItem {
    private String customerCode;
    private String ipAddress;
    private Boolean enabled;
    private String strategyLogic;

    // thay thế strategyId và paramId -> strategies
    private List<StrategyItemSync> strategies;
}