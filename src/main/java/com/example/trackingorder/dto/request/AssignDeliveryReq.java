package com.example.trackingorder.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignDeliveryReq {
    @NotBlank(message = "carrier not null")
    private String carrierId;

    @NotBlank(message = "shipper not null")
    private String shipperId;
}
