package com.example.trackingorder.controller;

import com.example.trackingorder.dto.response.ProductDetailRes;
import com.example.trackingorder.dto.response.ProductRes;
import com.example.trackingorder.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<List<ProductRes>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<ProductDetailRes>> getAllAdmin() {
        return ResponseEntity.ok(productService.getAllAdmin());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<ProductDetailRes> getById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getById(id));
    }

}
