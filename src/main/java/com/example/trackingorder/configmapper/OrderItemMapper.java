package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.OrderItemDetailRes;
import com.example.trackingorder.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    @Mapping(source = "productVariant.id", target = "productVariantId")
    @Mapping(source = "productVariant.product.name", target = "productName")
    @Mapping(source = "productVariant.sku", target = "sku")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "unitPrice", target = "unitPrice")
    @Mapping(target = "totalPrice", expression = "java(calculateTotalPrice(orderItem))")
    OrderItemDetailRes toOrderItemDetailRes(OrderItem orderItem);

    List<OrderItemDetailRes> toOrderItemDetailResList(List<OrderItem> orderItems);

    default BigDecimal calculateTotalPrice(OrderItem orderItem) {
        return orderItem.getUnitPrice()
                .multiply(BigDecimal.valueOf(orderItem.getQuantity()));
    }
}
