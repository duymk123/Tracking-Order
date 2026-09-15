package com.example.trackingorder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthRes {

    private String accessToken;

    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private long expiresIn; // in seconds (e.g. 300)

    private UserProfileRes user;

    private Map<String, Boolean> features; // Snapshot of all feature flags evaluated for this user session
}
