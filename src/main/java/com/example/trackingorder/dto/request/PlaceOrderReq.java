package com.example.trackingorder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlaceOrderReq {
    @NotEmpty(message = "required order summary")
    private List<OrderSummaryItemReq> items;

    @NotBlank
    private String addressId;

    private String couponCode;

    @NotBlank
    private String paymentMethodId;
}
