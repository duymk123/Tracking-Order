package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.OrderSummaryReq;
import com.example.trackingorder.dto.request.PlaceOrderReq;
import com.example.trackingorder.dto.response.MyOrderRes;
import com.example.trackingorder.dto.response.OrderDetailRes;
import com.example.trackingorder.dto.response.OrderSummaryRes;
import com.example.trackingorder.dto.response.PlaceOrderRes;

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
}
