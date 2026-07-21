package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.request.CreateCarrierReq;
import com.example.trackingorder.dto.response.CarrierRes;
import com.example.trackingorder.entity.Carrier;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CarrierMapper {
    CarrierRes toCarrierRes(Carrier carrier);

    List<CarrierRes> toCarrierResList(List<Carrier> carriers);

    Carrier toCarrier(CreateCarrierReq req);
}
