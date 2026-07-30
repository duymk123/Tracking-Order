package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.*;
import com.example.trackingorder.dto.response.*;
import org.springframework.data.domain.Page;

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

    // Field admin manage Order
    ConfirmOrderRes confirmOrder(String orderId);

    PickingOrderRes pickingOrder(String orderId);

    ShippingOrderRes shippingOrder(String orderId);

    DeliveredOrderRes deliveredOrder(String orderId);

    FailedOrderRes failedOrder(String orderId);

    ReturningOrderRes returningOrder(String orderId);

    ReattemptOrderRes reattemptOrder(String orderId);

    // seller xem list order
    Page<SellerOrderRes> getSellerOrders(Integer pageSize, Integer pageNumber);

    SellerOrderDetailRes getSellerOrderDetail(String orderId);

    //seller assign order
    AssignDeliveryRes assignDelivery(String orderId, AssignDeliveryReq req);

    Page<SellerOrderRes> getShipperOrders(Integer pageSize, Integer pageNumber);

    SellerOrderDetailRes getShipperOrderDetail(String orderId);
}
