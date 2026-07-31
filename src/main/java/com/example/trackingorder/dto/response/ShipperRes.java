package com.example.trackingorder.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShipperRes {
    private String id;
    private String carrierId;
    private String username;
    private String phone;
    private String status;
}
