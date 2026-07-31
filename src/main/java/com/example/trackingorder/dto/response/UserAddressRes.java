package com.example.trackingorder.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserAddressRes {
    private String id;
    private String name;
    private String phone;
    private String province;
    private String city;
    private String district;
    private String detailAddress;
    private Boolean isDefault;
}
