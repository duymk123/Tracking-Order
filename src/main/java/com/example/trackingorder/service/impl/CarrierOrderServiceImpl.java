package com.example.trackingorder.service.impl;

import com.example.trackingorder.dto.response.*;
import com.example.trackingorder.service.CarrierOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CarrierOrderServiceImpl implements CarrierOrderService {
    @Override
    public ShippingOrderRes shippingOrder(String orderId) {
        return null;
    }

    @Override
    public DeliveredOrderRes deliveredOrder(String orderId) {
        return null;
    }

    @Override
    public FailedOrderRes failedOrder(String orderId) {
        return null;
    }

    @Override
    public ReturningOrderRes returningOrder(String orderId) {
        return null;
    }

    @Override
    public ReattemptOrderRes reattemptOrder(String orderId) {
        return null;
    }
}
