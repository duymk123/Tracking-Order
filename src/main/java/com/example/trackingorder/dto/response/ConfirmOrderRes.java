package com.example.trackingorder.dto.response;

import com.example.trackingorder.common.OrderStatusEnum;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConfirmOrderRes {
    private String orderId;
    private OrderStatusEnum status;
    private String message;
}
