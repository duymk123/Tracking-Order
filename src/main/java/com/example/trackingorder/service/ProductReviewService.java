package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.CreateProductReviewReq;
import com.example.trackingorder.dto.response.ProductReviewRes;

import java.util.List;

public interface ProductReviewService {
    ProductReviewRes createReview(String userId, CreateProductReviewReq req);

    List<ProductReviewRes> getReviewsByProduct(String productId);

    List<ProductReviewRes> getReviewsByUser(String userId);
}
