package com.example.trackingorder.service.impl;

import com.example.trackingorder.dto.featureflag.CustomerFeatureSyncItem;
import com.example.trackingorder.dto.featureflag.FeatureFlagSyncItem;
import com.example.trackingorder.dto.featureflag.FeatureFlagSyncRequest;
import com.example.trackingorder.entity.FeatureFlagConfig;
import com.example.trackingorder.repository.FeatureFlagConfigRepo;
import com.example.trackingorder.service.FeatureFlagConfigService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureFlagConfigServiceImpl implements FeatureFlagConfigService {

    private final FeatureFlagConfigRepo featureFlagConfigRepo;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public int syncSnapshot(FeatureFlagSyncRequest request) {
        String version = request.getVersion();
        if (version == null || version.isBlank()) {
            version = Instant.now().toString();
        }

        List<FeatureFlagConfig> configs = new ArrayList<>();
        if (request.getFeatures() != null) {
            for (FeatureFlagSyncItem feature : request.getFeatures()) {
                if (feature.getFlagName() == null || feature.getFlagName().isBlank()) {
                    continue;
                }

                boolean globalEnabled = Boolean.TRUE.equals(feature.getEnabled());
                List<CustomerFeatureSyncItem> customers = feature.getCustomers();

                if (customers == null || customers.isEmpty()) {
                    // No customer-specific rules → single global row
                    configs.add(toConfig(feature, null, globalEnabled, version, request.getCustomerCode()));
                    continue;
                }

                // Global row
                configs.add(toConfig(feature, null, globalEnabled, version, request.getCustomerCode()));

                // Customer-specific rows (priority overrides based on IP)
                for (CustomerFeatureSyncItem customer : customers) {
                    boolean customerEnabled = Boolean.TRUE.equals(customer.getEnabled());
                    configs.add(toConfig(feature, customer, customerEnabled, version, request.getCustomerCode()));
                }
            }
        }

        featureFlagConfigRepo.deleteAllInBatch();
        featureFlagConfigRepo.saveAll(configs);
        log.info("Synced {} feature flag config rows with version {}", configs.size(), version);
        return configs.size();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEnabled(String flagName) {
        if (flagName == null || flagName.isBlank()) {
            return false;
        }
//        1. CHỌC XUỐNG DB: Lấy toàn bộ danh sách cấu hình của cờ này từ database tracking-order
        List<FeatureFlagConfig> configs = featureFlagConfigRepo.findByFlagNameIgnoreCase(flagName);

        if (configs.isEmpty()) {
            log.debug("Feature flag {} has no local config. Fallback false.", flagName);
            return false;
        }
        // 2. Lấy IP của người dùng đang gửi request
        String clientIp = resolveClientIp();
        log.info(" Check flag: '{}' | IP request: '{}' | Username: '{}'", flagName, clientIp, getCurrentUsername());

        // Tách IP-specific vs global rows
        List<FeatureFlagConfig> ipRules     = configs.stream().filter(c ->  hasText(c.getClientIp())).toList();
        List<FeatureFlagConfig> globalRules = configs.stream().filter(c -> !hasText(c.getClientIp())).toList();

        // 1. Ưu tiên IP-specific row nếu có IP match
        // Ý nghĩa: Đã vào danh sách Customer (IP whitelist) thì được ưu tiên áp dụng luôn,
        // KHÔNG cần phải thoả mãn thêm Strategy (username/role) của global nữa.
        if (hasText(clientIp)) {
            Optional<FeatureFlagConfig> ipMatch = ipRules.stream()
                    .filter(c -> normalizeClientIp(c.getClientIp()).equals(clientIp))
                    .findFirst();
            if (ipMatch.isPresent()) {

                FeatureFlagConfig customerConfig = ipMatch.get();

                // Vẫn check ON/OFF nhưng gọi evaluateConfig để check thêm Strategy riêng của cty
                boolean result = evaluateConfig(customerConfig);
                log.info("User co IP [{}] nam trong danh sách Customer. flag '{}' evaluate result: {}", clientIp, flagName, result);
                return result;
            }
        }

        // 2. Không match IP → dùng global row + evaluate strategy
        return globalRules.stream().anyMatch(this::evaluateConfig);
    }

    /**
     * Kiểm tra config: enabled=true VÀ strategy (nếu có) match với context hiện tại.
     */
    private boolean evaluateConfig(FeatureFlagConfig config) {
        if (!Boolean.TRUE.equals(config.getEnabled())) {
            return false;
        }
        return evaluateStrategy(config.getStrategyId(), fromJson(config.getStrategyParams()));
    }

    /**
     * Evaluate strategy dựa trên strategyId và params lưu trong snapshot.
     * Nếu không có strategy → chỉ cần enabled = true là đủ.
     */
    private boolean evaluateStrategy(String strategyId, Map<String, String> params) {
        if (!hasText(strategyId)) {
            return true; // Không có strategy → flag bật là xong
        }

        return switch (strategyId.toLowerCase(Locale.ROOT)) {

            case "username" -> {
                // Param: users = "duymk123,duy23"
                String users = params.getOrDefault("users", "");
                String currentUser = getCurrentUsername();
                if (!hasText(currentUser) || !hasText(users)) yield false;
                yield Arrays.stream(users.split(","))
                        .map(String::trim)
                        .anyMatch(u -> u.equalsIgnoreCase(currentUser));
            }

            case "user-role" -> {
                // Param: roles = "ROLE_BUYER,ROLE_ADMIN"
                String roles = params.getOrDefault("roles", "");
                if (!hasText(roles)) yield false;
                Collection<? extends GrantedAuthority> authorities = getCurrentAuthorities();
                yield Arrays.stream(roles.split(","))
                        .map(String::trim)
                        .anyMatch(role -> authorities.stream().anyMatch(a ->
                                a.getAuthority().equalsIgnoreCase(role) ||
                                a.getAuthority().equalsIgnoreCase("ROLE_" + role)));
            }

            case "remote-client-ip" -> {
                // Param: ips = "192.168.1.10,10.0.0.5"
                String ips = params.getOrDefault("ips", "");
                String clientIp = resolveClientIp();
                if (!hasText(ips) || !hasText(clientIp)) yield false;
                yield Arrays.stream(ips.split(","))
                        .map(this::normalizeClientIp)
                        .anyMatch(ip -> ip.equals(clientIp));
            }

            case "release-date" -> {
                // Param: date = "2026-08-10" hoặc "2026-08-10 00:00:00"
                String dateStr = params.getOrDefault("date", "");
                if (!hasText(dateStr)) yield false;
                try {
                    java.time.LocalDateTime releaseDate = dateStr.length() <= 10
                            ? java.time.LocalDate.parse(dateStr).atStartOfDay()
                            : java.time.LocalDateTime.parse(dateStr.replace(" ", "T"));
                    yield java.time.LocalDateTime.now().isAfter(releaseDate);
                } catch (Exception e) {
                    log.warn("Cannot parse release-date: {}", dateStr);
                    yield false;
                }
            }

            default -> {
                log.debug("Unknown strategyId '{}' — treating as enabled", strategyId);
                yield true;
            }
        };
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return auth.getName();
    }

    private Collection<? extends GrantedAuthority> getCurrentAuthorities() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return List.of();
        return auth.getAuthorities();
    }

    private Map<String, String> fromJson(String json) {
        if (!hasText(json)) return Map.of();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Cannot parse strategy_params JSON: {}", json);
            return Map.of();
        }
    }


    private FeatureFlagConfig toConfig(
            FeatureFlagSyncItem feature,
            CustomerFeatureSyncItem customer,
            boolean enabled,
            String version,
            String globalCustomerCode
    ) {
        FeatureFlagConfig config = new FeatureFlagConfig();
        config.setFlagName(feature.getFlagName().trim().toUpperCase(Locale.ROOT));
        config.setEnabled(enabled);
        config.setCustomerCode(customer == null ? globalCustomerCode : customer.getCustomerCode());
        config.setClientIp(customer == null ? null : normalizeClientIp(customer.getIpAddress()));

        if (customer == null) {
            config.setStrategyId(feature.getStrategyId());
            config.setStrategyParams(toJson(feature.getStrategyParams()));
        } else {
            config.setStrategyId(customer.getStrategyId());
            config.setStrategyParams(toJson(customer.getStrategyParams()));
        }
        config.setAppliedVersion(version);
        return config;
    }

    private String toJson(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(params);
        } catch (JsonProcessingException e) {
            log.warn("Cannot serialize feature strategy params. Store null instead.", e);
            return null;
        }
    }

    private String resolveClientIp() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes servletAttrs)) {
            return null;
        }

        HttpServletRequest request = servletAttrs.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (hasText(forwardedFor)) {
            return normalizeClientIp(forwardedFor.split(",")[0]);
        }
        return normalizeClientIp(request.getRemoteAddr());
    }

    private String normalizeClientIp(String ip) {
        if (!hasText(ip)) {
            return ip;
        }
        String normalizedIp = ip.trim();
        if ("0:0:0:0:0:0:0:1".equals(normalizedIp) || "::1".equals(normalizedIp)) {
            return "127.0.0.1";
        }
        return normalizedIp;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
