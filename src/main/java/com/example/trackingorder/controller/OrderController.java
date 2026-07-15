package com.example.trackingorder.controller;

import com.example.trackingorder.dto.request.OrderSummaryReq;
import com.example.trackingorder.dto.request.PlaceOrderReq;
import com.example.trackingorder.dto.response.MyOrderRes;
import com.example.trackingorder.dto.response.OrderDetailRes;
import com.example.trackingorder.dto.response.OrderSummaryRes;
import com.example.trackingorder.dto.response.PlaceOrderRes;
import com.example.trackingorder.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<OrderDetailRes> getOrderDetail(@PathVariable("orderId") String orderId) {
        OrderDetailRes orderDetailRes = orderService.getOderDetail(orderId);
        return ResponseEntity.ok(orderDetailRes);
    }

}
