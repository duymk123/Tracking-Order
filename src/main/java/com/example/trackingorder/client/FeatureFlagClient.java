package com.example.trackingorder.client;

import com.example.trackingorder.service.FeatureFlagConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Local feature flag facade.
 * Feature config is synced from feature-flag-service into tracking-order,
 * then runtime checks read the local snapshot instead of calling another service.
 */
@Component
@Slf4j
public class FeatureFlagClient {

    private final FeatureFlagConfigService featureFlagConfigService;

    public FeatureFlagClient(FeatureFlagConfigService featureFlagConfigService) {
        this.featureFlagConfigService = featureFlagConfigService;
    }

    /**
     * Check whether a feature flag is active for the current request context.
     *
     * @param flagName flag name, for example "BUY_NOW", "PRICE_INCREASE"
     * @return true if the local synced snapshot allows the current request IP
     */
    public boolean isEnabled(String flagName) {
        try {
            boolean enabled = featureFlagConfigService.isEnabled(flagName);
            log.debug("Local feature flag {} evaluated as {}", flagName, enabled);
            return enabled;
        } catch (RuntimeException e) {
            log.error("Cannot evaluate local feature flag {}. Fallback false.", flagName, e);
            return false;
        }
    }
}
