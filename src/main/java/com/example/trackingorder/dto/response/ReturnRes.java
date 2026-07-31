package com.example.trackingorder.dto.response;

import com.example.trackingorder.common.OriginType;
import com.example.trackingorder.common.ReasonEnum;
import com.example.trackingorder.common.StatusReturnEnum;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReturnRes {
    private String id;
    private String orderId;
    private String userId;
    private ReasonEnum reason;
    private OriginType originType;
    private StatusReturnEnum status;
    private BigDecimal refundAmount;
    private String notes;
    private LocalDateTime createdAt;
}
