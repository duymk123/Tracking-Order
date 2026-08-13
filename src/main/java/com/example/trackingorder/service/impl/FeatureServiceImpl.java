package com.example.trackingorder.service.impl;

import com.example.trackingorder.client.FeatureFlagClient;
import com.example.trackingorder.service.FeatureService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeatureServiceImpl implements FeatureService {

    private final FeatureFlagClient featureFlagClient;

    @Override
    public Map<String, Boolean> isBuyNowActive() {
        return Map.of("active", featureFlagClient.isEnabled("BUY_NOW"));
    }

    @Override
    public Map<String, Boolean> isPriceIncreaseActive() {
        return Map.of("active", featureFlagClient.isEnabled("PRICE_INCREASE"));
    }

    @Override
    public Map<String, Boolean> isOrderActive() {
        return Map.of("active", featureFlagClient.isEnabled("ORDER_DETAIL"));
    }

    @Override
    public Map<String, String> debugContext(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : "anonymous";
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }

        Map<String, String> debugInfo = new HashMap<>();
        debugInfo.put("username", username);
        debugInfo.put("clientIp", ip);
        return debugInfo;
    }
}
