package com.example.trackingorder.controller;

import com.example.trackingorder.dto.request.CreateUserAddressReq;
import com.example.trackingorder.dto.request.RegisterReq;
import com.example.trackingorder.dto.response.UserAddressRes;
import com.example.trackingorder.dto.response.UserProfileRes;
import com.example.trackingorder.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserProfileRes> register(@RequestBody @Valid RegisterReq req) {
        return ResponseEntity.ok(userService.register(req));
    }

    /**
     * Lấy thông tin người dùng hiện tại (current user).
     * Mọi role đều có thể gọi API này để biết mình là ai.
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER', 'SHIPPER')")
    public ResponseEntity<UserProfileRes> getMyProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    /**
     * Lấy danh sách địa chỉ của người mua.
     */
    @GetMapping("/me/addresses")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<UserAddressRes>> getMyAddresses() {
        return ResponseEntity.ok(userService.getMyAddresses());
    }

    /**
     * Thêm địa chỉ mới cho người mua.
     */
    @PostMapping("/me/addresses")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<UserAddressRes> addAddress(@RequestBody @Valid CreateUserAddressReq req) {
        return ResponseEntity.ok(userService.addAddress(req));
    }

    /**
     * Xóa địa chỉ của người mua.
     */
    @DeleteMapping("/me/addresses/{addressId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Void> deleteAddress(@PathVariable String addressId) {
        userService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Set một địa chỉ làm mặc định.
     */
    @PatchMapping("/me/addresses/{addressId}/default")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<UserAddressRes> setDefaultAddress(@PathVariable String addressId) {
        return ResponseEntity.ok(userService.setDefaultAddress(addressId));
    }
}
