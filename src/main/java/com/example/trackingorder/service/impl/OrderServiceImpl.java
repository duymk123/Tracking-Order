package com.example.trackingorder.service.impl;

import com.example.trackingorder.dto.request.OrderSummaryItemReq;
import com.example.trackingorder.dto.request.OrderSummaryReq;
import com.example.trackingorder.dto.response.OrderSummaryRes;
import com.example.trackingorder.entity.Inventory;
import com.example.trackingorder.entity.ProductVariant;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.ProductVariantRepo;
import com.example.trackingorder.service.OrderService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    private final ProductVariantRepo productVariantRepo;

    @Override
    public OrderSummaryRes getOrderSummary(OrderSummaryReq req) {
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderSummaryItemReq item : req.getItems()) {
            ProductVariant productVariant = productVariantRepo.findById(item.getProductVariantId())
                    .orElseThrow(() ->
                            new NotFoundException(HttpStatus.NOT_FOUND, "Product Variant Not Found"));

            //check inventory
            Inventory inventory = productVariant.getInventory();
            if (inventory == null) {
                throw new NotFoundException(HttpStatus.NOT_FOUND, "Inventory Not Found");
            }

            if (item.getQuantity() > inventory.getQuantityInStock()) {
                throw new BadRequestException(HttpStatus.BAD_REQUEST, "Quantity In Stock Exceeded");
            }

            //variant price = base + modifier

            BigDecimal unitPrice = productVariant.getProduct()
                    .getBasePrice()
                    .add(productVariant.getPriceModifier());

            // totalprice = variantprice * quantity
            BigDecimal totalPrice = unitPrice.multiply(
                    BigDecimal.valueOf(item.getQuantity()));

            subtotal = subtotal.add(totalPrice);

        }

        // GrandTotal = subtotal - coupon + shipping fee

        return OrderSummaryRes.builder()
                .subtotal(subtotal)
                .discountAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .grandTotal(subtotal)
                .build();

    }
}
