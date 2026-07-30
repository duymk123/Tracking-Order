package com.example.trackingorder.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyNowReq {
    @NotBlank(message = "productVariant is required")
    private String productVariantId;

    @NotNull(message = "quantity not null")
    @Min(1)
    private Integer quantity;
}
