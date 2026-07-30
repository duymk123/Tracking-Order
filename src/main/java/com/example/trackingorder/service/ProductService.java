package com.example.trackingorder.service;

import com.example.trackingorder.dto.response.ProductDetailRes;
import com.example.trackingorder.dto.response.ProductRes;

import java.util.List;

public interface ProductService {
    List<ProductRes> getAll();

    ProductDetailRes getById(String id);
}
