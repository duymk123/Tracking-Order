package com.example.trackingorder.dto.response;

import com.example.trackingorder.common.OrderStatusEnum;
import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PickingOrderRes {
    private String orderId;
    private OrderStatusEnum status;
    private String message;
}
