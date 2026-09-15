package com.example.trackingorder.service.impl;

import com.example.trackingorder.dto.featureflag.CustomerFeatureSyncItem;
import com.example.trackingorder.dto.featureflag.FeatureFlagSyncItem;
import com.example.trackingorder.dto.featureflag.FeatureFlagSyncRequest;
import com.example.trackingorder.dto.featureflag.StrategyItemSync;
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
import java.util.*;

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
                    configs.add(toConfig(feature, null, globalEnabled, version, request.getCustomerCode()));
                    continue;
                }

                configs.add(toConfig(feature, null, globalEnabled, version, request.getCustomerCode()));

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
        List<FeatureFlagConfig> configs = featureFlagConfigRepo.findByFlagNameIgnoreCase(flagName);

        if (configs.isEmpty()) {
            log.debug("Feature flag {} has no local config. Fallback false.", flagName);
            return false;
        }
        String clientIp = resolveClientIp();
        log.info("Check flag: '{}' | IP request: '{}' | Username: '{}'", flagName, clientIp, getCurrentUsername());

        List<FeatureFlagConfig> ipRules     = configs.stream().filter(c ->  hasText(c.getClientIp())).toList();
        List<FeatureFlagConfig> globalRules = configs.stream().filter(c -> !hasText(c.getClientIp())).toList();

        if (hasText(clientIp)) {
            Optional<FeatureFlagConfig> ipMatch = ipRules.stream()
                    .filter(c -> normalizeClientIp(c.getClientIp()).equals(clientIp))
                    .findFirst();
            if (ipMatch.isPresent()) {
                FeatureFlagConfig customerConfig = ipMatch.get();
                boolean result = evaluateConfig(customerConfig);
                log.info("User with IP [{}] matched Customer rule. flag '{}' evaluate result: {}", clientIp, flagName, result);
                return result;
            }
        }

        return globalRules.stream().anyMatch(this::evaluateConfig);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Boolean> evaluateAll() {
        List<String> allFlags = featureFlagConfigRepo.findDistinctFlagNames();
        Map<String, Boolean> result = new HashMap<>();
        for (String flagName : allFlags) {
            result.put(flagName, isEnabled(flagName));
        }
        return result;
    }


    // nhiều strategy
    private boolean evaluateConfig(FeatureFlagConfig config) {
        if (!Boolean.TRUE.equals(config.getEnabled())) {
            return false;
        }

        List<StrategyItemSync> strategies = parseStrategies(config.getStrategies());

        if (strategies.isEmpty()) {
            return true;
        }

        String logic = config.getStrategyLogic() != null ? config.getStrategyLogic() : "OR";
        if ("AND".equalsIgnoreCase(logic)) {
            return strategies.stream()
                    .allMatch(s -> evaluateStrategy(s.getStrategyId(), s.getParams() != null ? s.getParams() : Map.of()));
        } else {
            return strategies.stream()
                    .anyMatch(s -> evaluateStrategy(s.getStrategyId(), s.getParams() != null ? s.getParams() : Map.of()));
        }
    }


    private boolean evaluateStrategy(String strategyId, Map<String, String> params) {
        if (!hasText(strategyId)) {
            return true;
        }

        return switch (strategyId.toLowerCase(Locale.ROOT)) {

            case "username", "users_by_name" -> {
                String users = params.getOrDefault("users", params.getOrDefault("value", ""));
                String currentUser = getCurrentUsername();
                if (!hasText(currentUser) || !hasText(users)) yield false;
                yield Arrays.stream(users.split("[,\\s]+"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .anyMatch(u -> u.equalsIgnoreCase(currentUser));
            }

            case "user-role", "user_role", "role" -> {
                String roles = params.getOrDefault("roles", params.getOrDefault("role", params.getOrDefault("value", "")));
                if (!hasText(roles)) yield false;
                Collection<? extends GrantedAuthority> authorities = getCurrentAuthorities();
                yield Arrays.stream(roles.split("[,\\s]+"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .anyMatch(role -> authorities.stream().anyMatch(a ->
                                a.getAuthority().equalsIgnoreCase(role) ||
                                a.getAuthority().equalsIgnoreCase("ROLE_" + role)));
            }

            case "remote-client-ip", "ip_whitelist", "ip" -> {
                String ips = params.getOrDefault("ips", params.getOrDefault("value", ""));
                String clientIp = resolveClientIp();
                if (!hasText(ips) || !hasText(clientIp)) yield false;
                yield Arrays.stream(ips.split("[,\\s]+"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(this::normalizeClientIp)
                        .anyMatch(ip -> ip.equals(clientIp));
            }

            case "release-date", "release_date" -> {
                String dateStr = params.getOrDefault("date", params.getOrDefault("releaseDate", params.getOrDefault("value", "")));
                if (!hasText(dateStr)) yield false;
                try {
                    java.time.LocalDateTime releaseDate = dateStr.length() <= 10
                            ? java.time.LocalDate.parse(dateStr.trim()).atStartOfDay()
                            : java.time.LocalDateTime.parse(dateStr.trim().replace(" ", "T"));
                    yield java.time.LocalDateTime.now().isAfter(releaseDate);
                } catch (Exception e) {
                    log.warn("Cannot parse release-date: {}", dateStr);
                    yield false;
                }
            }

            case "gradual-rollout", "gradual_rollout", "gradual_rollout_user_id", "rollout" -> {
                String pctStr = params.getOrDefault("percentage", params.getOrDefault("value", "0"));
                try {
                    int percentage = Integer.parseInt(pctStr.trim().replace("%", ""));
                    if (percentage <= 0) yield false;
                    if (percentage >= 100) yield true;
                    String currentUser = getCurrentUsername();
                    String id = hasText(currentUser) ? currentUser : resolveClientIp();
                    if (!hasText(id)) yield false;
                    int hash = Math.abs(id.hashCode()) % 100;
                    yield hash < percentage;
                } catch (Exception e) {
                    yield false;
                }
            }

            default -> {
                log.warn("Unknown strategyId '{}' - treating as disabled (false)", strategyId);
                yield false;
            }
        };
    }

    private List<StrategyItemSync> parseStrategies(String json) {
        if (!hasText(json)) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<StrategyItemSync>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Cannot parse strategies JSON: {}", json);
            return List.of();
        }
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
            config.setStrategies(strategiesToJson(feature.getStrategies()));
            config.setStrategyLogic(feature.getStrategyLogic());
        } else {
            config.setStrategies(strategiesToJson(customer.getStrategies()));
            config.setStrategyLogic(customer.getStrategyLogic());
        }
        config.setAppliedVersion(version);
        return config;
    }

    private String strategiesToJson(List<StrategyItemSync> strategies) {
        if (strategies == null || strategies.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(strategies);
        } catch (JsonProcessingException e) {
            log.warn("Cannot serialize strategies to JSON", e);
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