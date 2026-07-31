package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.UserAddressRes;
import com.example.trackingorder.entity.UserAddress;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserAddressMapper {
    UserAddressRes toUserAddressRes(UserAddress address);
    List<UserAddressRes> toUserAddressResList(List<UserAddress> addresses);
}
