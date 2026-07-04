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
public class UpdateCartReq {
    @NotBlank(message = "variant is not empty")
    private String productVariant;

    @NotNull(message = "Min greater or equal 1")
    @Min(1)
    private Integer quantity;
}
