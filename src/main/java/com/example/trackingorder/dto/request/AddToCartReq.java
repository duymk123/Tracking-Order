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
public class AddToCartReq {
    @NotBlank(message = "Variant is not empty")
    private String productVariantId;

    @NotNull(message = "quantity is greatter or equal 1")
    @Min(1)
    private Integer quantity;
}
