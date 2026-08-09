package com.example.trackingorder.client;

import com.example.trackingorder.dto.FeatureContext;
import com.example.trackingorder.dto.FeatureEvaluationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * HTTP client gọi sang feature-flag-service để kiểm tra trạng thái feature flag.
 *
 * Endpoint gọi: POST http://localhost:8081/api/v1/flags/evaluate
 *
 * Fallback strategy: nếu feature-flag-service không phản hồi (down, timeout),
 *   mặc định trả về FALSE (tắt tính năng) để an toàn.
 */
@Component
@Slf4j
public class FeatureFlagClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final FeatureContextBuilder contextBuilder;

    public FeatureFlagClient(
            RestTemplate restTemplate,
            FeatureContextBuilder contextBuilder,
            @Value("${feature-flag.service.url:http://localhost:8081}") String baseUrl
    ) {
        this.restTemplate = restTemplate;
        this.contextBuilder = contextBuilder;
        this.baseUrl = baseUrl;
    }

    /**
     * Kiểm tra một feature flag có đang bật hay không.
     *
     * @param flagName tên flag, ví dụ "BUY_NOW", "PRICE_INCREASE"
     * @return true nếu flag đang bật, false nếu tắt hoặc service không available
     */
    public boolean isEnabled(String flagName) {
        String url = baseUrl + "/api/v1/flags/evaluate";

        try {
            FeatureContext context = contextBuilder.build();
            FeatureEvaluationRequest requestBody = FeatureEvaluationRequest.builder()
                    .feature(flagName)
                    .context(context)
                    .build();


            log.info("=== BAT DAU KIEM TRA WHITELIST ===");
            log.info("Headers lay duoc: {}", context.getHeaders());
            log.info("Query Params lay duoc: {}", context.getQueryParameters());
            log.info("===================================");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<FeatureEvaluationRequest> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    url, 
                    HttpMethod.POST, 
                    requestEntity, 
                    Map.class
            );

            Map<String, Object> response = responseEntity.getBody();

            if (response == null) {
                log.warn("feature-flag-service tra ve null cho flag: {}", flagName);
                return false;
            }

            Object enabledValue = response.get("enabled");
            if (enabledValue instanceof Boolean enabled) {
                log.info("=== KET QUA FEATURE FLAG ===");
                log.info("(Flag): {}", flagName);
                log.info(" (Context) da gui: Headers={}, Query={}", context.getHeaders(), context.getQueryParameters());
                log.info("Ket qua danh gia: ENABLE/DISABLE = {}", enabled);
                log.info("============================");
                return enabled;
            }

            log.warn("Không parse được 'enabled' từ response flag {}: {}", flagName, response);
            return false;

        } catch (RestClientException e) {
            log.error("Không thể kết nối feature-flag-service để kiểm tra flag '{}': {}. " +
                      "Fallback → false (tính năng tắt)", flagName, e.getMessage());
            return false;
        }
    }
}
