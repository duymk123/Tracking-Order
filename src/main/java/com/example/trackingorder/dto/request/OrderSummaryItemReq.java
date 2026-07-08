package com.example.trackingorder.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderSummaryItemReq {
    @NotBlank(message = "required variantId")
    private String productVariantId;

    @NotNull(message = "quantity not null")
    @Min(value = 1,message = "quantity greater or equal 1")
    private Integer quantity;
}
