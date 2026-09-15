package com.example.trackingorder.controller;

import com.example.trackingorder.dto.request.LoginReq;
import com.example.trackingorder.dto.request.RefreshTokenReq;
import com.example.trackingorder.dto.response.AuthRes;
import com.example.trackingorder.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Đăng nhập người dùng bằng JWT.
     * Trả về Access Token, Refresh Token, User Profile và Feature Flags Snapshot.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthRes> login(@RequestBody @Valid LoginReq req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /**
     * Làm mới token khi Access Token hết hạn (ví dụ sau 5 phút).
     * Trả về Access Token mới và cập nhật lại Feature Flags Snapshot.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthRes> refresh(@RequestBody @Valid RefreshTokenReq req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    /**
     * Lấy thông tin user hiện tại và Feature Flags tương ứng.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthRes> getMe() {
        return ResponseEntity.ok(authService.getMe());
    }
}
