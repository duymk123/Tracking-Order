package com.example.trackingorder.dto.response;

import com.example.trackingorder.common.OrderStatusEnum;
import com.example.trackingorder.common.PaymentMethodType;
import com.example.trackingorder.common.PaymentType;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SellerOrderRes {
    private String orderId;
    private String trackingNumber;
    private String buyerName;
    private OrderStatusEnum status;
    private PaymentType paymentMethod;
    private BigDecimal grandTotal;
    private Integer totalItems;
    private LocalDateTime createdAt;

}
