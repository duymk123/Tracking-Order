package com.example.trackingorder.service;

import com.example.trackingorder.dto.response.*;

public interface CarrierOrderService {

    ShippingOrderRes shippingOrder(String orderId);

    DeliveredOrderRes deliveredOrder(String orderId);

    FailedOrderRes failedOrder(String orderId);

    ReturningOrderRes returningOrder(String orderId);

    ReattemptOrderRes reattemptOrder(String orderId);
}
