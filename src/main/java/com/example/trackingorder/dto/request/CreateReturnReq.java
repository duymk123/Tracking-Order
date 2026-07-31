package com.example.trackingorder.dto.request;

import com.example.trackingorder.common.OriginType;
import com.example.trackingorder.common.ReasonEnum;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateReturnReq {
    private String orderId;
    private ReasonEnum reason;
    private OriginType originType;
    private String notes;
}
