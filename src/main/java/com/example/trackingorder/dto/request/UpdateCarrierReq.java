package com.example.trackingorder.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCarrierReq {
    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "Required")
    private String apiEndpoint;

    @NotBlank(message = "region is required")
    private String supportRegions;
}
