package com.example.trackingorder.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BuyNowRes {
    private String productVariantId;

    private Integer quantity;

    private String message;

}
