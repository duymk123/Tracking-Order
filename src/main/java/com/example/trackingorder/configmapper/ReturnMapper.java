package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.ReturnRes;
import com.example.trackingorder.entity.Return;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReturnMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "userId", source = "user.id")
    ReturnRes toReturnRes(Return returnEntity);

    List<ReturnRes> toReturnResList(List<Return> returnEntities);
}
