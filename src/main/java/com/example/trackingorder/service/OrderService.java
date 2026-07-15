package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.OrderSummaryReq;
import com.example.trackingorder.dto.request.PlaceOrderReq;
import com.example.trackingorder.dto.response.*;

import java.util.List;

public interface OrderService {
    //OrderSummary
    OrderSummaryRes getOrderSummary(OrderSummaryReq req);

    //PlaceOrder
    PlaceOrderRes placeOrder(PlaceOrderReq req);

    // get My order
    List<MyOrderRes> getMyOrders();

    // xem chi tiet don hang
    OrderDetailRes getOderDetail(String orderId);

    // admin confirm đơn hàng
    ConfirmOrderRes confirmOrder(String orderId);
}
