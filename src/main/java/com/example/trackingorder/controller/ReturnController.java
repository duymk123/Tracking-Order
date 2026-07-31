package com.example.trackingorder.controller;

import com.example.trackingorder.dto.request.CreateReturnReq;
import com.example.trackingorder.dto.response.ReturnRes;
import com.example.trackingorder.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    @GetMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<ReturnRes>> getAllReturns() {
        return ResponseEntity.ok(returnService.getAllReturns());
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ReturnRes> createReturn(
            @RequestBody CreateReturnReq req) {
        return ResponseEntity.ok(returnService.createReturn(req));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<ReturnRes>> getReturnsByUser(
            @PathVariable String userId) {
        return ResponseEntity.ok(returnService.getReturnsByUser(userId));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<List<ReturnRes>> getReturnsByOrder(
            @PathVariable String orderId) {
        return ResponseEntity.ok(returnService.getReturnsByOrder(orderId));
    }

    @PutMapping("/{returnId}/status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ReturnRes> updateReturnStatus(
            @PathVariable String returnId,
            @RequestParam String status) {
        return ResponseEntity.ok(returnService.updateReturnStatus(returnId, status));
    }
}
