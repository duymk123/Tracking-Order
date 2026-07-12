package com.example.trackingorder.service;

import java.math.BigDecimal;

public interface CouponService {
    BigDecimal caculateCoupon(String couponCode,
                              BigDecimal subtotal); // can dung doi voi PERCENT
}
