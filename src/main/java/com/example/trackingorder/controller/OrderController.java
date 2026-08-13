package com.example.trackingorder.controller;

import com.example.trackingorder.dto.request.AssignDeliveryReq;
import com.example.trackingorder.dto.request.BuyNowReq;
import com.example.trackingorder.dto.request.OrderSummaryReq;
import com.example.trackingorder.dto.request.PlaceOrderReq;
import com.example.trackingorder.dto.response.*;
import com.example.trackingorder.service.OrderService;
import com.example.trackingorder.service.TrackingLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Validated

public class OrderController {
    private final OrderService orderService;
    private final TrackingLogService trackingLogService;

    @PostMapping("/summary")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<OrderSummaryRes> getOrderSummary(@Valid @RequestBody OrderSummaryReq req) {
        OrderSummaryRes orderSummary = orderService.getOrderSummary(req);
        return ResponseEntity.ok(orderSummary);
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<PlaceOrderRes> placeOrder(@Valid @RequestBody PlaceOrderReq req) {
        PlaceOrderRes placeOrder = orderService.placeOrder(req);
        return ResponseEntity.ok(placeOrder);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<MyOrderRes>> getMyOrders() {
        List<MyOrderRes> myOrders = orderService.getMyOrders();
        return ResponseEntity.ok(myOrders);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<OrderDetailRes> getOrderDetail(@PathVariable String orderId) {
        OrderDetailRes orderDetailRes = orderService.getOrderDetail(orderId);
        return ResponseEntity.ok(orderDetailRes);
    }

    @PostMapping("/buy-now")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<BuyNowRes> buyNow(@Valid @RequestBody BuyNowReq req) {
        return ResponseEntity.ok(orderService.buyNow(req));
    }

    @GetMapping("/{orderId}/tracking")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<TrackingHistoryRes>> getTrackingHistory(@PathVariable String orderId) {
        List<TrackingHistoryRes> trackingHistoryRes = trackingLogService.getTrackingHistory(orderId);
        return ResponseEntity.ok(trackingHistoryRes);

    }

    @PatchMapping("/{orderId}/comfirm")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ConfirmOrderRes> confirmOrder(@PathVariable String orderId) {
        ConfirmOrderRes confirmOrderRes = orderService.confirmOrder(orderId);
        return ResponseEntity.ok(confirmOrderRes);
    }

    @PatchMapping("/{orderId}/picking")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<PickingOrderRes> pickOrder(@PathVariable String orderId) {
        PickingOrderRes pickingOrderRes = orderService.pickingOrder(orderId);
        return ResponseEntity.ok(pickingOrderRes);
    }

    @PatchMapping("/{orderId}/shipping")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ShippingOrderRes> shippingOrder(@PathVariable String orderId) {
        ShippingOrderRes shippingOrderRes = orderService.shippingOrder(orderId);
        return ResponseEntity.ok(shippingOrderRes);
    }

    @PatchMapping("/{orderId}/deliver")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<DeliveredOrderRes> deliveredOrder(@PathVariable String orderId) {
        DeliveredOrderRes deliveredOrderRes = orderService.deliveredOrder(orderId);
        return ResponseEntity.ok(deliveredOrderRes);
    }

    @PatchMapping("/{orderId}/fail")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<FailedOrderRes> failedOrder(@PathVariable String orderId) {
        FailedOrderRes failedOrderRes = orderService.failedOrder(orderId);
        return ResponseEntity.ok(failedOrderRes);
    }

    @PatchMapping("/{orderId}/return")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ReturningOrderRes> returningOrder(@PathVariable String orderId) {
        ReturningOrderRes returningOrderRes = orderService.returningOrder(orderId);
        return ResponseEntity.ok(returningOrderRes);
    }

    @PatchMapping("/{orderId}/reattempt")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ReattemptOrderRes> reattemptOrder(@PathVariable String orderId) {
        ReattemptOrderRes reattemptOrderRes = orderService.reattemptOrder(orderId);
        return ResponseEntity.ok(reattemptOrderRes);
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Page<SellerOrderRes>> getSellerOrders(
            @RequestParam(defaultValue = "5") Integer pageSize,
            @RequestParam(defaultValue = "1") Integer pageNumber) {
        return ResponseEntity.ok(orderService.getSellerOrders(pageSize, pageNumber));

    }

    @GetMapping("/seller/{orderId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerOrderDetailRes> getSellerOrderDetail(@PathVariable String orderId) {
        SellerOrderDetailRes sellerOrderDetailRes = orderService.getSellerOrderDetail(orderId);
        return ResponseEntity.ok(sellerOrderDetailRes);
    }


    @PatchMapping("/{orderId}/assign")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<AssignDeliveryRes> assignDelivery(
            @PathVariable String orderId,
            @RequestBody @Valid AssignDeliveryReq req) {
        return ResponseEntity.ok(orderService.assignDelivery(orderId, req));
    }

    @GetMapping("/shipper")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<Page<SellerOrderRes>> getShipperOrders(
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "1") Integer pageNumber) {

        return ResponseEntity.ok(orderService.getShipperOrders(pageSize, pageNumber));
    }

    @GetMapping("/shipper/{orderId}")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<SellerOrderDetailRes> getShipperOrderDetail(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getShipperOrderDetail(orderId));
    }


}
