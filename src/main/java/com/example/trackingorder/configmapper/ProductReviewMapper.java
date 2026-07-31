package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.ProductReviewRes;
import com.example.trackingorder.entity.ProductReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductReviewMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.username")
    ProductReviewRes toProductReviewRes(ProductReview review);

    List<ProductReviewRes> toProductReviewResList(List<ProductReview> reviews);
}
