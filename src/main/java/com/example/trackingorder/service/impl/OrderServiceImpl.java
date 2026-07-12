package com.example.trackingorder.service.impl;

import com.example.trackingorder.dto.request.OrderSummaryItemReq;
import com.example.trackingorder.dto.request.OrderSummaryReq;
import com.example.trackingorder.dto.response.OrderSummaryRes;
import com.example.trackingorder.entity.Inventory;
import com.example.trackingorder.entity.ProductVariant;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.ProductVariantRepo;
import com.example.trackingorder.service.CouponService;
import com.example.trackingorder.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    private final ProductVariantRepo productVariantRepo;
    private final CouponService couponService;

    @Override
    public OrderSummaryRes getOrderSummary(OrderSummaryReq req) {
        BigDecimal subtotal = BigDecimal.ZERO;


        // arraylist chua toan bo variantId de query
        List<String> variantIds = new ArrayList<>();

        //luu quantity theo variant
        Map<String, Integer> quantityMap = new HashMap<>();


        for (OrderSummaryItemReq item : req.getItems()) {
            //them id vao list
            variantIds.add(item.getProductVariantId());

            //save quantity theo id
            quantityMap.put(item.getProductVariantId(), item.getQuantity());
        }

        //query 1 lan duy nhat
        List<ProductVariant> productVariants =
                productVariantRepo.findAllByIds(variantIds);

        //tinh subtotal
        for (ProductVariant productVariant : productVariants) {
            //lay quantity cua variant htai
            Integer quantity = quantityMap.get(productVariant.getId());

            //Check inventory
            Inventory inventory = productVariant.getInventory();
            if (inventory == null) {
                throw new NotFoundException(HttpStatus.NOT_FOUND, "Inventory Not Found");
            }

            if (quantity > inventory.getQuantityInStock()) {
                throw new BadRequestException(HttpStatus.BAD_REQUEST, "Quantity In Stock Exceeded");
            }


            //price = base_price + modifier
            BigDecimal price = productVariant.getProduct()
                    .getBasePrice()
                    .add(productVariant.getPriceModifier());

            // totalprice = price * quantity
            BigDecimal itemSubtotal = price.multiply(
                    BigDecimal.valueOf(quantity));

            //cong don subtotal
            subtotal = subtotal.add(itemSubtotal);

        }

        //Coupon
        BigDecimal discountAmount = couponService.caculateCoupon(req.getCouponCode(), subtotal);
        log.info("Discount Amount: {}, Coupon: {}", discountAmount, req.getCouponCode());

        //Ship
        BigDecimal shipppingFee = BigDecimal.valueOf(30000);

        //grandTotal = subtotal - discountAmount + shippingFee
        BigDecimal grandTotal = subtotal
                .subtract(discountAmount)
                .add(shipppingFee);
        log.info("GrandTotal items: {}", grandTotal);


        return OrderSummaryRes.builder()
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(shipppingFee)
                .grandTotal(grandTotal)
                .build();
    }

}

