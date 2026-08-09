package com.example.trackingorder.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Đăng ký RestTemplate bean để inject vào FeatureFlagClient.
 * Spring Boot không tự tạo RestTemplate bean từ phiên 2.x trở đi.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
