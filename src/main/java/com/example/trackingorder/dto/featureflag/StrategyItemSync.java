package com.example.trackingorder.dto.featureflag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StrategyItemSync {
    private String strategyId;
    private Map<String, String> params;
}