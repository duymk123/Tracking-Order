package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.OrderSummaryReq;
import com.example.trackingorder.dto.response.OrderSummaryRes;

public interface OrderService {
    OrderSummaryRes getOrderSummary(OrderSummaryReq req);
}
