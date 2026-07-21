package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.MyOrderRes;
import com.example.trackingorder.dto.response.OrderDetailRes;
import com.example.trackingorder.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring",
        uses = OrderItemMapper.class) // uses: de biet map orderItem -> DetailRes
public interface OrderMapper {

    // My order
    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "totalItems", expression = "java(calculateTotalItems(order))")
    MyOrderRes toMyOrderRes(Order order);

    List<MyOrderRes> toMyOrderResList(List<Order> orders);

    //Order Detail
    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "receiverName", source = "address.name")
    @Mapping(target = "phone", source = "address.phone")
    @Mapping(target = "province", source = "address.province")
    @Mapping(target = "city", source = "address.city")
    @Mapping(target = "district", source = "address.district")
    @Mapping(target = "detailAddress", source = "address.detailAddress")
    @Mapping(target = "items", source = "orderItems")
    OrderDetailRes toOrderDetailRes(Order order);


    default Integer calculateTotalItems(Order order) {
        return order.getOrderItems()
                .stream()
                .mapToInt(item -> item.getQuantity())
                .sum();
    }
}
