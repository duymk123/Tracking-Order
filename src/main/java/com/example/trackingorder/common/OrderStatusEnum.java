package com.example.trackingorder.common;

public enum OrderStatusEnum {
    PENDING,
//    Buyer vừa đặt hàng.
//    Chưa có ai xử lý.
//    Tracking

    CONFIRMED,
//    Seller xác nhận.

    PICKING,
//    Đây là bước nhân viên kho lấy hàng khỏi kệ và đóng gói.

    SHIPPING,
//    Đơn đã giao cho đơn vị vận chuyển.

    DELIVERED,
    FAILED,
    RETURNING,
    REATTEMPT
}
