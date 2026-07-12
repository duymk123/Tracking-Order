package com.example.trackingorder.service.impl;

import com.example.trackingorder.entity.Coupon;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.CouponRepo;
import com.example.trackingorder.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
    private final CouponRepo couponRepo;

    @Override
    public BigDecimal caculateCoupon(String couponCode, BigDecimal subtotal) {
        //k apply coupon/ k co coupon
        if (couponCode == null || couponCode.isBlank()) {
            return BigDecimal.ZERO;
        }

        Coupon coupon = couponRepo.findByCode(couponCode)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Coupon code not found"));

        // check expire
        if (coupon.getExpired_at().before(new Date())) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Coupon expired");
        }

        //check usage
        if (coupon.getUsed_count() >= coupon.getMax_usage()) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Coupon used exceeds max usage");
        }

        // check minimum order
        if (subtotal.compareTo(coupon.getMin_order_values()) < 0) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Minimum order value not reached");
        }

        // calculate
        switch(coupon.getDiscount_type()){
            case FIXED:
                return coupon.getDiscount_value();

            case PERCENT:
                return subtotal.multiply(coupon.getDiscount_value())
                        .divide(BigDecimal.valueOf(100));

            default:
                return BigDecimal.ZERO;
        }
    }
}
