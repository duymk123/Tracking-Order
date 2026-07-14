package com.example.trackingorder.service.impl;

import com.example.trackingorder.entity.Coupon;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.CouponRepo;
import com.example.trackingorder.service.CouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;


@Service
@RequiredArgsConstructor
@Slf4j
public class CouponServiceImpl implements CouponService {
    private final CouponRepo couponRepo;

    @Override
    public BigDecimal calculateCoupon(String couponCode, BigDecimal subtotal) {
        //k apply coupon/ k co coupon
        if (couponCode == null || couponCode.isBlank()) {
            return BigDecimal.ZERO;
        }

        Coupon coupon = couponRepo.findByCode(couponCode)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Coupon code not found"));

        // check expire
        if (coupon.getExpiredAt().before(new Date())) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Coupon expired");
        }

        //check usage
        if (coupon.getUsedCount() >= coupon.getMaxUsage()) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Coupon used exceeds max usage");
        }

        // check minimum order
        if (subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Minimum order value not reached");
        }

        // calculate
        switch (coupon.getDiscountType()) {
            case FIXED:
                return coupon.getDiscountValue();

            case PERCENT:
                return subtotal.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));

            default:
                return BigDecimal.ZERO;
        }
    }

    @Override
    public void increaseUsedCount(String couponCode) {
        if (couponCode == null || couponCode.isBlank()) {
            return;
        }

        Coupon coupon = couponRepo.findByCode(couponCode)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Coupon code not found"));

        coupon.setUsedCount(coupon.getUsedCount() + 1);

        couponRepo.save(coupon);

        log.info("Coupon {} used {}", couponCode, coupon.getUsedCount());
    }
}
