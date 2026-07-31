package com.example.trackingorder.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDetailRes {
    private String productId;

    private String productName;

    private BigDecimal basePrice;

    private String description;

    private Long weightGram;

    private String categoryName;

    private Integer quantityInStock;

    private List<ProductVariantRes> variants;
}
