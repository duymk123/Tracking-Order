package com.example.trackingorder.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderSummaryReq {
    @NotEmpty(message = "Items can not emtpty")
    private List<OrderSummaryItemReq> items;
}
