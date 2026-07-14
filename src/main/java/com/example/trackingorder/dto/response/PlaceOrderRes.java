package com.example.trackingorder.dto.response;

import com.example.trackingorder.common.OrderStatusEnum;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlaceOrderRes {
    private String orderId;
    private String trackingNumber;
    private OrderStatusEnum status;
    private BigDecimal grandTotal;
    private String message;

}
