package com.example.trackingorder.dto.response;

import com.example.trackingorder.common.OrderStatusEnum;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShippingOrderRes {
    private String orderId;
    private OrderStatusEnum status;
    private String message;
}
