package com.example.trackingorder.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SellerOrderItemRes {
    private String productVariantId;

    private String productName;

    private String variantName;

    private String sku;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;
}
