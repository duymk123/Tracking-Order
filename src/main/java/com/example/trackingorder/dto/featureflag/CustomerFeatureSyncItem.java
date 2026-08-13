package com.example.trackingorder.dto.featureflag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerFeatureSyncItem {
    private String customerCode;
    private String ipAddress;
    private Boolean enabled;
    private String strategyId;
    private Map<String, String> strategyParams;
}
