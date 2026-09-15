package com.example.trackingorder.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface FeatureService {
    Map<String, Boolean> evaluateAll();
    Map<String, String> debugContext(HttpServletRequest request);
}
