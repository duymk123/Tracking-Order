package com.example.trackingorder.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@Builder
public class AssignDeliveryRes {
    private String orderId;

    private String carrierName;

    private String shipperName;

    private String trackingNumber;

    private Date estimatedDeliveryDate;

    private String message;
}
