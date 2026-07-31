package com.example.trackingorder.service.impl;

import com.example.trackingorder.configmapper.ProductReviewMapper;
import com.example.trackingorder.dto.request.CreateProductReviewReq;
import com.example.trackingorder.dto.response.ProductReviewRes;
import com.example.trackingorder.entity.Product;
import com.example.trackingorder.entity.ProductReview;
import com.example.trackingorder.entity.User;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.ProductRepo;
import com.example.trackingorder.repository.ProductReviewRepo;
import com.example.trackingorder.repository.UserRepo;
import com.example.trackingorder.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewRepo productReviewRepo;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;
    private final ProductReviewMapper mapper;

    @Override
    public ProductReviewRes createReview(String userId, CreateProductReviewReq req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "User not found"));
        Product product = productRepo.findById(req.getProductId())
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Product not found"));

        ProductReview review = new ProductReview();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(req.getRating());
        review.setComment(req.getComment());

        review = productReviewRepo.save(review);
        return mapper.toProductReviewRes(review);
    }

    @Override
    public List<ProductReviewRes> getReviewsByProduct(String productId) {
        return productReviewRepo.findByProductId(productId)
                .stream()
                .map(mapper::toProductReviewRes)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductReviewRes> getReviewsByUser(String userId) {
        return productReviewRepo.findByUserId(userId)
                .stream()
                .map(mapper::toProductReviewRes)
                .collect(Collectors.toList());
    }
}
