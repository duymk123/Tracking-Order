package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.SellerOrderItemRes;
import com.example.trackingorder.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface SellerOrderItemMapper {
    @Mapping(target = "productVariantId", source = "productVariant.id")
    @Mapping(target = "productName", source = "productVariant.product.name")
    @Mapping(target = "variantName", source = "productVariant.name")
    @Mapping(target = "sku", source = "productVariant.sku")
    @Mapping(target = "totalPrice",
            expression = "java(calculateTotalPrice(orderItem))")
    SellerOrderItemRes toSellerOrderItemRes(OrderItem orderItem);

    List<SellerOrderItemRes> toSellerOrderItemResList(List<OrderItem> orderItems);

    default BigDecimal calculateTotalPrice(OrderItem orderItem) {
        return orderItem.getUnitPrice()
                .multiply(BigDecimal.valueOf(orderItem.getQuantity()));
    }
}
