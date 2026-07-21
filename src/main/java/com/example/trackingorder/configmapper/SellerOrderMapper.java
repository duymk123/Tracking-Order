package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.SellerOrderRes;
import com.example.trackingorder.entity.Order;
import com.example.trackingorder.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SellerOrderMapper {
    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "buyerName", source = "user.username")
    @Mapping(target = "paymentMethod", source = "paymentType")
    @Mapping(target = "totalItems", expression = "java(calculateTotalItems(order))")
    SellerOrderRes toSellerOrderRes(Order order);

    default Integer calculateTotalItems(Order order) {
        return order.getOrderItems()
                .stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }

}
