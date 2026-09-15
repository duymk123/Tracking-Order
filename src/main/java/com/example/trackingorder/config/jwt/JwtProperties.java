package com.example.trackingorder.config.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {
    // 1. Đọc cấu hình từ yaml
    private String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private long accessTokenExpiration = 300000; // 5 minutes in ms
    private long refreshTokenExpiration = 604800000; // 7 days in ms
}
