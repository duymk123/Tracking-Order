package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.ShipperRes;
import com.example.trackingorder.entity.Shipper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ShipperMapper {
    @Mapping(target = "carrierId", source = "carrier.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "status", expression = "java(shipper.getStatus() != null ? shipper.getStatus().name() : null)")
    ShipperRes toShipperRes(Shipper shipper);

    List<ShipperRes> toShipperResList(List<Shipper> shippers);
}
