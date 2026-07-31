package com.example.trackingorder.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserAddressReq {
    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @NotBlank
    private String province;

    @NotBlank
    private String city;

    @NotBlank
    private String district;

    @NotBlank
    private String detailAddress;

    private Boolean isDefault;
}
