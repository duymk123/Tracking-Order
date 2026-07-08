package com.example.trackingorder.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlaceOrderRes {
    private String orderId;
    private String status;
    private String grandTotal;
}
