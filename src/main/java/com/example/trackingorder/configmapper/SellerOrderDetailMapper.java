package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.SellerOrderDetailRes;
import com.example.trackingorder.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {
        SellerOrderItemMapper.class,
        TrackingLogMapper.class
}
)
public interface SellerOrderDetailMapper {
    @Mapping(target = "orderId", source = "id")

    // Buyer
    @Mapping(target = "buyerUsername", source = "user.username")
    @Mapping(target = "buyerPhone", source = "user.phone")

    // Shipping Address
    @Mapping(target = "recipientName", source = "address.name")
    @Mapping(target = "recipientPhone", source = "address.phone")
    @Mapping(target = "province", source = "address.province")
    @Mapping(target = "city", source = "address.city")
    @Mapping(target = "district", source = "address.district")
    @Mapping(target = "detailAddress", source = "address.detailAddress")

    // Carrier
    @Mapping(target = "carrierName", source = "carrier.name")

    // Order Items
    @Mapping(target = "items", source = "orderItems")

    @Mapping(target = "trackingLogs", ignore = true)
    @Mapping(target = "createdAt", source = "createdAt")
    SellerOrderDetailRes toSellerOrderDetailRes(Order order);
}
