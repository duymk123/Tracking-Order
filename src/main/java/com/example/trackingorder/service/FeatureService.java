package com.example.trackingorder.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface FeatureService {
    Map<String, Boolean> isBuyNowActive();
    Map<String, Boolean> isPriceIncreaseActive();
    Map<String, Boolean> isOrderActive();
    Map<String, String> debugContext(HttpServletRequest request);
}
