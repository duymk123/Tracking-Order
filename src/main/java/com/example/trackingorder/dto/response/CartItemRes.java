package com.example.trackingorder.dto.response;

import com.example.trackingorder.common.StockStatusEnum;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItemRes {
    private String productVariantId;
    private String productName;
    private String sku;
    private BigDecimal unitPrice; // lấy từ CartItem.priceSnapshot
    private Integer quantity;
    private String stockStatus; // inventory
    private Integer quantityInStock;
}
