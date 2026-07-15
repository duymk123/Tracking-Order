package com.example.trackingorder.dto.response;

import com.example.trackingorder.common.OrderStatusEnum;
import com.example.trackingorder.common.PaymentType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Builder
public class OrderDetailRes {
    private String orderId;
    private String trackingNumber;
    private OrderStatusEnum status;
    private PaymentType paymentType;
    private Date createdAt;

    // Address
    private String receiverName;
    private String phone;
    private String province;
    private String city;
    private String district;
    private String detailAddress;

    // Items
    private List<OrderItemDetailRes> items;

    // Payment
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal;
}
