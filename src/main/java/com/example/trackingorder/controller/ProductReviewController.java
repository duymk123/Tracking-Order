package com.example.trackingorder.controller;

import com.example.trackingorder.dto.request.CreateProductReviewReq;
import com.example.trackingorder.dto.response.ProductReviewRes;
import com.example.trackingorder.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    @PostMapping("/{userId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ProductReviewRes> createReview(
            @PathVariable String userId,
            @RequestBody CreateProductReviewReq req) {
        return ResponseEntity.ok(productReviewService.createReview(userId, req));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductReviewRes>> getReviewsByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(productReviewService.getReviewsByProduct(productId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<ProductReviewRes>> getReviewsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(productReviewService.getReviewsByUser(userId));
    }
}
