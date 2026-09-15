package com.example.trackingorder.service.impl;

import com.example.trackingorder.common.UserStatusEnum;
import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import com.example.trackingorder.config.jwt.JwtTokenProvider;
import com.example.trackingorder.dto.request.LoginReq;
import com.example.trackingorder.dto.request.RefreshTokenReq;
import com.example.trackingorder.dto.response.AuthRes;
import com.example.trackingorder.dto.response.UserProfileRes;
import com.example.trackingorder.entity.User;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.UserRepo;
import com.example.trackingorder.service.AuthService;
import com.example.trackingorder.service.FeatureFlagConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepo userRepo;
    private final FeatureFlagConfigService featureFlagConfigService;
    private final AuthenticationFacade authenticationFacade;

    @Override
    @Transactional(readOnly = true)
    public AuthRes login(LoginReq req) {
        log.info("User login attempt: username='{}'", req.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException ex) {
            log.warn("Invalid credentials for username: {}", req.getUsername());
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }

        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng: " + req.getUsername()));

        if (user.getStatus() != null && user.getStatus() == UserStatusEnum.INACTIVE) {
            throw new IllegalStateException("Tài khoản đã bị khóa hoặc chưa kích hoạt.");
        }

        String role = user.getRole() != null ? user.getRole().name() : "BUYER";
        String accessToken = tokenProvider.generateAccessToken(user.getUsername(), role, user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());

        UserProfileRes profileRes = UserProfileRes.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .role(role)
                .build();

        // Evaluate snapshot of all feature flags for this user session
        Map<String, Boolean> features = featureFlagConfigService.evaluateAll();
        log.info("User '{}' logged in successfully with role '{}'. Evaluated {} feature flags.",
                user.getUsername(), role, features.size());

        return AuthRes.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationInSeconds())
                .user(profileRes)
                .features(features)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthRes refresh(RefreshTokenReq req) {
        String refreshToken = req.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadCredentialsException("Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng cho refresh token."));

        if (user.getStatus() != null && user.getStatus() == UserStatusEnum.INACTIVE) {
            throw new IllegalStateException("Tài khoản đã bị khóa.");
        }

        String role = user.getRole() != null ? user.getRole().name() : "BUYER";
        String newAccessToken = tokenProvider.generateAccessToken(user.getUsername(), role, user.getId());

        UserProfileRes profileRes = UserProfileRes.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .role(role)
                .build();

        // Re-evaluate features snapshot on refresh
        Map<String, Boolean> features = featureFlagConfigService.evaluateAll();
        log.info("Token refreshed for user '{}'. Features re-synced: {}", username, features);

        return AuthRes.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Keep same refresh token or rotate
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationInSeconds())
                .user(profileRes)
                .features(features)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthRes getMe() {
        User user = authenticationFacade.getCurrentUser();
        String role = user.getRole() != null ? user.getRole().name() : "BUYER";

        UserProfileRes profileRes = UserProfileRes.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .role(role)
                .build();

        Map<String, Boolean> features = featureFlagConfigService.evaluateAll();

        return AuthRes.builder()
                .user(profileRes)
                .features(features)
                .build();
    }
}
