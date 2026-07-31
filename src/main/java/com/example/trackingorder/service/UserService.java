package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.CreateUserAddressReq;
import com.example.trackingorder.dto.response.UserAddressRes;
import com.example.trackingorder.dto.request.RegisterReq;
import com.example.trackingorder.dto.response.UserProfileRes;

import java.util.List;

public interface UserService {
    UserProfileRes getCurrentUserProfile();
    List<UserAddressRes> getMyAddresses();
    UserAddressRes addAddress(CreateUserAddressReq req);
    void deleteAddress(String addressId);
    UserAddressRes setDefaultAddress(String addressId);
    UserProfileRes register(RegisterReq req);
}
